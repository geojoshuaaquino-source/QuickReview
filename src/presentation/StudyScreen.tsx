import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card, CardType, Deck, Rating, StudySession, makeId, now } from '../domain/models';
import { Button } from './components';
import { theme as T } from './theme';
import { FadeIn, ScalePress } from './motion';

type Props = {
  deck: Deck;
  defaultSessionSize: number;
  onAdd: (card: Card) => Promise<void>;
  onStartSession: (deck: Deck, size: number, mode: 'sequential' | 'random') => Promise<StudySession>;
  onGrade: (session: StudySession, cardId: string, rating: Rating, elapsedMs: number) => Promise<void>;
};

const TYPES: { id: CardType; label: string }[] = [
  { id: 'basic', label: 'Basic' },
  { id: 'reversed', label: 'Reversed' },
  { id: 'cloze', label: 'Cloze' },
  { id: 'multipleChoice', label: 'Multiple choice' },
  { id: 'trueFalse', label: 'True / False' },
  { id: 'typedAnswer', label: 'Typed answer' },
];

function typeLabel(type: CardType) {
  return TYPES.find((item) => item.id === type)?.label ?? 'Basic';
}

function normalizeAnswer(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function clozeParts(text: string) {
  const parts: { text: string; hidden: boolean }[] = [];
  const regex = /\{\{\s*([^{}]+?)\s*\}\}/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text))) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), hidden: false });
    parts.push({ text: match[1], hidden: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), hidden: false });
  return parts.length ? parts : [{ text, hidden: false }];
}

export function StudyScreen({ deck, defaultSessionSize, onAdd, onStartSession, onGrade }: Props) {
  const available = useMemo(() => deck.cards.filter((card) => !card.suspended), [deck]);
  const initialSize = Math.min(defaultSessionSize, Math.max(1, available.length));
  const [size, setSize] = useState(initialSize);
  const [mode, setMode] = useState<'sequential' | 'random'>('sequential');
  const [session, setSession] = useState<StudySession | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [complete, setComplete] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [booleanAnswer, setBooleanAnswer] = useState<boolean | null>(null);

  useEffect(() => {
    setSize((current) => Math.min(current, Math.max(1, available.length)));
  }, [available.length]);

  const begin = async () => {
    const next = await onStartSession(deck, size, mode);
    setSession(next);
    setCompletedCount(0);
    setComplete(next.cardIds.length === 0);
    resetAnswerState();
    setStartedAt(Date.now());
  };

  const resetAnswerState = () => {
    setRevealed(false);
    setSelectedOption(null);
    setTypedAnswer('');
    setBooleanAnswer(null);
  };

  const grade = async (rating: Rating) => {
    if (!session) return;
    const card = deck.cards.find((item) => item.id === session.cardIds[session.currentIndex]);
    if (!card) return;
    await onGrade(session, card.id, rating, Math.max(0, Date.now() - startedAt));
    const reviewed = completedCount + 1;
    const next = { ...session, currentIndex: session.currentIndex + 1 };
    setCompletedCount(reviewed);
    if (next.currentIndex >= next.cardIds.length) {
      setSession(null);
      setComplete(true);
    } else {
      setSession(next);
      resetAnswerState();
      setStartedAt(Date.now());
    }
  };

  if (complete) {
    return (
      <View style={s.center}>
        <FadeIn>
          <View style={s.completeIcon}><Text style={s.completeGlyph}>✓</Text></View>
          <Text style={s.completeTitle}>Session complete</Text>
          <Text style={s.completeText}>{deck.name} · {completedCount || size} cards reviewed</Text>
          <Button label="Study again" onPress={() => { setComplete(false); begin(); }} />
          <Pressable style={s.addAfter} onPress={() => setAddOpen(true)}>
            <Text style={s.addAfterText}>＋ Add another card</Text>
          </Pressable>
        </FadeIn>
        <AddCardModal visible={addOpen} deck={deck} onClose={() => setAddOpen(false)} onSave={onAdd} />
      </View>
    );
  }

  if (!session) {
    return (
      <ScrollView contentContainerStyle={s.setup} showsVerticalScrollIndicator={false}>
        <FadeIn>
          <Text style={s.kicker}>STUDY</Text>
          <Text style={s.title}>{deck.name}</Text>
          <Text style={s.subtitle}>{available.length} active cards ready</Text>
          <View style={s.panel}>
            <Text style={s.panelKicker}>SESSION SIZE</Text>
            <View style={s.choiceRow}>
              {[5, 10, 20, 30].map((n) => {
                const value = Math.min(n, available.length);
                const active = size === value;
                return <ScalePress key={n} disabled={!value} onPress={() => value && setSize(value)} style={[s.choice, active && s.choiceActive]}><Text style={[s.choiceText, active && s.choiceTextActive]}>{value || '—'}</Text></ScalePress>;
              })}
            </View>
            <Text style={s.panelKicker}>ORDER</Text>
            <View style={s.choiceRow}>{(['sequential', 'random'] as const).map((item) => <ScalePress key={item} onPress={() => setMode(item)} style={[s.mode, mode === item && s.modeActive]}><Text style={[s.modeText, mode === item && s.modeTextActive]}>{item === 'sequential' ? 'In order' : 'Shuffle'}</Text></ScalePress>)}</View>
            <Button label={available.length ? 'Start session' : 'Add your first card'} onPress={available.length ? begin : () => setAddOpen(true)} />
          </View>
        </FadeIn>
        <AddCardModal visible={addOpen} deck={deck} onClose={() => setAddOpen(false)} onSave={onAdd} />
      </ScrollView>
    );
  }

  const card = deck.cards.find((item) => item.id === session.cardIds[session.currentIndex]);
  if (!card) return null;

  const reversed = card.type === 'reversed';
  const prompt = reversed ? card.back : card.front;
  const answer = reversed ? card.front : card.back;
  const cloze = card.type === 'cloze' ? clozeParts(card.front) : [];
  const trueAnswer = normalizeAnswer(card.back) === 'true' || normalizeAnswer(card.back) === 't';
  const typedCorrect = normalizeAnswer(typedAnswer) === normalizeAnswer(answer);

  const revealTyped = () => setRevealed(true);
  const chooseBoolean = (value: boolean) => { setBooleanAnswer(value); setRevealed(true); };

  return (
    <View style={s.study}>
      <View style={s.header}>
        <View><Text style={[s.deckName, { color: deck.accent }]}>{deck.name.toUpperCase()}</Text><Text style={s.count}>{session.currentIndex + 1} / {session.cardIds.length}</Text></View>
        <Text style={s.modeLabel}>{mode === 'random' ? 'SHUFFLED' : 'IN ORDER'}</Text>
      </View>
      <View style={s.progressMeta}><Text style={s.progressText}>Card {session.currentIndex + 1} of {session.cardIds.length}</Text><Text style={s.progressText}>{Math.round(((session.currentIndex + 1) / session.cardIds.length) * 100)}%</Text></View>

      <View style={[s.card, revealed && s.cardRevealed]}>
        <Text style={s.cardKicker}>{revealed ? 'ANSWER' : typeLabel(card.type).toUpperCase()}</Text>
        <View style={s.cardBody}>
          {card.type === 'cloze' ? (
            <Text style={s.question}>{cloze.map((part, index) => <Text key={index} style={part.hidden && !revealed ? s.clozeBlank : undefined}>{part.hidden && !revealed ? '_____ ' : part.text}</Text>)}</Text>
          ) : <Text style={s.question}>{prompt}</Text>}

          {card.type === 'multipleChoice' && !revealed && (
            <View style={s.options}>{(card.options || []).map((option, index) => <Pressable key={`${option}-${index}`} onPress={() => { setSelectedOption(index); setRevealed(true); }} style={[s.option, selectedOption === index && s.optionSelected]}><Text style={s.optionText}>{String.fromCharCode(65 + index)}. {option}</Text></Pressable>)}</View>
          )}

          {card.type === 'trueFalse' && !revealed && (
            <View style={s.booleanRow}><Pressable style={s.booleanButton} onPress={() => chooseBoolean(true)}><Text style={s.booleanText}>True</Text></Pressable><Pressable style={s.booleanButton} onPress={() => chooseBoolean(false)}><Text style={s.booleanText}>False</Text></Pressable></View>
          )}

          {card.type === 'typedAnswer' && !revealed && (
            <View style={s.typedWrap}><TextInput value={typedAnswer} onChangeText={setTypedAnswer} placeholder="Type your answer" placeholderTextColor={T.colors.faint} style={s.typedInput} autoCapitalize="none" returnKeyType="done" onSubmitEditing={revealTyped} /><Pressable style={s.checkButton} onPress={revealTyped} disabled={!typedAnswer.trim()}><Text style={s.checkText}>Check answer</Text></Pressable></View>
          )}

          {revealed && card.type === 'multipleChoice' && <Text style={s.answer}>{selectedOption === card.correctOption ? 'Correct' : `Correct answer: ${card.options?.[card.correctOption ?? -1] ?? answer}`}</Text>}
          {revealed && card.type === 'trueFalse' && <Text style={s.answer}>{booleanAnswer === trueAnswer ? 'Correct' : `Correct answer: ${trueAnswer ? 'True' : 'False'}`}</Text>}
          {revealed && card.type === 'typedAnswer' && <Text style={s.answer}>{typedCorrect ? 'Correct' : `Correct answer: ${answer}`}</Text>}
          {revealed && !['multipleChoice', 'trueFalse', 'typedAnswer'].includes(card.type) && <Text style={s.answer}>{answer}</Text>}
          {!revealed && card.type !== 'multipleChoice' && card.type !== 'trueFalse' && card.type !== 'typedAnswer' && <Text style={s.tap}>Tap to reveal</Text>}
        </View>
        <Text style={s.cardFooter}>{typeLabel(card.type).toUpperCase()}</Text>
      </View>

      {!revealed && !['multipleChoice', 'trueFalse', 'typedAnswer'].includes(card.type) && <Pressable style={s.reveal} onPress={() => setRevealed(true)}><Text style={s.revealText}>Show answer</Text></Pressable>}
      {revealed && <FadeIn style={s.ratings}><Text style={s.ratingHint}>How well did you know it?</Text><View style={s.ratingRow}>{(['again', 'hard', 'good', 'easy'] as Rating[]).map((rating) => <ScalePress key={rating} onPress={() => grade(rating)} style={[s.rating, rating === 'good' && s.good]}><Text style={[s.ratingText, rating === 'good' && s.goodText]}>{rating[0].toUpperCase() + rating.slice(1)}</Text></ScalePress>)}</View></FadeIn>}
      <Text style={s.footer}>{session.schedulingEnabled ? 'Spaced repetition is on' : 'Scheduling is off'}</Text>
    </View>
  );
}

function AddCardModal({ visible, deck, onClose, onSave }: { visible: boolean; deck: Deck; onClose: () => void; onSave: (card: Card) => Promise<void> }) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tags, setTags] = useState('');
  const [type, setType] = useState<CardType>('basic');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correct, setCorrect] = useState(0);
  const reset = () => { setFront(''); setBack(''); setTags(''); setType('basic'); setOptions(['', '', '', '']); setCorrect(0); };
  const save = async () => {
    if (!front.trim() || !back.trim()) return;
    const filled = options.map((item) => item.trim()).filter(Boolean);
    if (type === 'multipleChoice' && filled.length < 2) return;
    const timestamp = now();
    await onSave({ id: makeId('card'), deckId: deck.id, type, front: front.trim(), back: back.trim(), examples: [], tags: tags.split(',').map((item) => item.trim()).filter(Boolean), createdAt: timestamp, updatedAt: timestamp, suspended: false, ...(type === 'multipleChoice' ? { options: filled, correctOption: Math.min(correct, filled.length - 1) } : {}) });
    reset();
    onClose();
  };
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={s.modalBackdrop}><View style={s.sheet}><ScrollView showsVerticalScrollIndicator={false}><View style={s.handle}/><View style={s.sheetHead}><Text style={s.sheetTitle}>New card</Text><Pressable onPress={onClose}><Text style={s.close}>×</Text></Pressable></View><Text style={s.fieldLabel}>CARD TYPE</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeRow}>{TYPES.map((item) => <Pressable key={item.id} onPress={() => setType(item.id)} style={[s.typeChip, type === item.id && s.typeChipActive]}><Text style={[s.typeChipText, type === item.id && s.typeChipTextActive]}>{item.label}</Text></Pressable>)}</ScrollView><Text style={s.fieldLabel}>FRONT</Text><TextInput value={front} onChangeText={setFront} placeholder={type === 'cloze' ? 'Use {{answer}} for the hidden text' : 'Question, term or prompt'} placeholderTextColor={T.colors.faint} multiline style={s.input}/><Text style={s.fieldLabel}>BACK / ANSWER</Text><TextInput value={back} onChangeText={setBack} placeholder={type === 'trueFalse' ? 'Enter true or false' : 'Answer or explanation'} placeholderTextColor={T.colors.faint} multiline style={s.input}/>{type === 'multipleChoice' && <><Text style={s.fieldLabel}>OPTIONS · TAP THE CORRECT ONE</Text>{options.map((value, index) => <Pressable key={index} onPress={() => setCorrect(index)} style={s.optionEditor}><View style={[s.radio, correct === index && s.radioActive]}/><TextInput value={value} onChangeText={(next) => setOptions((current) => current.map((item, i) => i === index ? next : item))} placeholder={`Option ${String.fromCharCode(65 + index)}`} placeholderTextColor={T.colors.faint} style={s.optionInput}/></Pressable>)}</>}<Text style={s.fieldLabel}>TAGS</Text><TextInput value={tags} onChangeText={setTags} placeholder="Optional · biology, exam-1" placeholderTextColor={T.colors.faint} style={s.input}/><Button label="Save card" onPress={save}/><Pressable onPress={onClose} style={s.cancel}><Text style={s.cancelText}>Cancel</Text></Pressable></ScrollView></View></View></Modal>;
}

const s = StyleSheet.create({
  setup: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 50 }, kicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.8, color: T.colors.accent }, title: { fontSize: 32, fontWeight: '900', letterSpacing: -1.1, color: T.colors.ink, marginTop: 6 }, subtitle: { fontSize: 13, color: T.colors.muted, marginTop: 5, marginBottom: 22 }, panel: { backgroundColor: T.colors.surface, borderWidth: 1, borderColor: T.colors.line, borderRadius: 18, padding: 20 }, panelKicker: { fontSize: 9, fontWeight: '900', letterSpacing: 1.4, color: T.colors.faint, marginBottom: 9 }, choiceRow: { flexDirection: 'row', gap: 8, marginBottom: 23 }, choice: { flex: 1, height: 48, borderWidth: 1, borderColor: T.colors.line, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, choiceActive: { backgroundColor: T.colors.accent, borderColor: T.colors.accent }, choiceText: { fontWeight: '800', color: T.colors.ink }, choiceTextActive: { color: '#FFF' }, mode: { flex: 1, height: 46, borderWidth: 1, borderColor: T.colors.line, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, modeActive: { backgroundColor: T.colors.ink, borderColor: T.colors.ink }, modeText: { fontSize: 12, fontWeight: '800', color: T.colors.ink }, modeTextActive: { color: '#FFF' }, study: { flex: 1, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, deckName: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 }, count: { fontSize: 14, fontWeight: '900', color: T.colors.ink, marginTop: 2 }, modeLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 1, color: T.colors.faint }, progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 }, progressText: { fontSize: 10, fontWeight: '700', color: T.colors.muted }, card: { flex: 1, minHeight: 390, maxHeight: 540, borderRadius: 20, borderWidth: 1, borderColor: T.colors.line, backgroundColor: T.colors.surface, padding: 22 }, cardRevealed: { backgroundColor: T.colors.accentSoft, borderColor: T.colors.accentSoft }, cardKicker: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5, color: T.colors.faint }, cardBody: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 }, question: { fontSize: 27, lineHeight: 35, fontWeight: '700', textAlign: 'center', color: T.colors.ink }, clozeBlank: { textDecorationLine: 'underline', fontWeight: '900' }, answer: { fontSize: 20, lineHeight: 29, fontWeight: '600', textAlign: 'center', color: T.colors.ink, marginTop: 18 }, tap: { fontSize: 11, color: T.colors.faint, marginTop: 20 }, options: { width: '100%', marginTop: 20, gap: 8 }, option: { borderWidth: 1, borderColor: T.colors.line, borderRadius: 10, padding: 12, backgroundColor: T.colors.bg }, optionSelected: { borderColor: T.colors.accent, backgroundColor: T.colors.accentSoft }, optionText: { fontSize: 13, fontWeight: '700', color: T.colors.ink }, booleanRow: { width: '100%', flexDirection: 'row', gap: 10, marginTop: 24 }, booleanButton: { flex: 1, height: 52, borderWidth: 1, borderColor: T.colors.line, borderRadius: 10, backgroundColor: T.colors.bg, alignItems: 'center', justifyContent: 'center' }, booleanText: { fontSize: 14, fontWeight: '900', color: T.colors.ink }, typedWrap: { width: '100%', marginTop: 22 }, typedInput: { minHeight: 50, borderWidth: 1, borderColor: T.colors.line, borderRadius: 10, backgroundColor: T.colors.bg, padding: 13, color: T.colors.ink }, checkButton: { height: 48, borderRadius: 10, backgroundColor: T.colors.ink, alignItems: 'center', justifyContent: 'center', marginTop: 9 }, checkText: { color: '#FFF', fontWeight: '900' }, cardFooter: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: T.colors.faint }, reveal: { height: 52, borderRadius: 11, backgroundColor: T.colors.ink, alignItems: 'center', justifyContent: 'center', marginTop: 13 }, revealText: { color: '#FFF', fontWeight: '900' }, ratings: { marginTop: 13 }, ratingHint: { textAlign: 'center', fontSize: 11, fontWeight: '700', color: T.colors.muted, marginBottom: 9 }, ratingRow: { flexDirection: 'row', gap: 7 }, rating: { flex: 1, height: 55, borderWidth: 1, borderColor: T.colors.line, borderRadius: 10, backgroundColor: T.colors.surface, alignItems: 'center', justifyContent: 'center' }, good: { backgroundColor: T.colors.accent, borderColor: T.colors.accent }, ratingText: { fontSize: 11, fontWeight: '900', color: T.colors.ink }, goodText: { color: '#FFF' }, footer: { textAlign: 'center', fontSize: 10, color: T.colors.faint, marginTop: 12 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }, completeIcon: { width: 64, height: 64, borderRadius: 18, backgroundColor: T.colors.accentSoft, alignItems: 'center', justifyContent: 'center' }, completeGlyph: { fontSize: 28, fontWeight: '900', color: T.colors.accent }, completeTitle: { fontSize: 25, fontWeight: '900', color: T.colors.ink, marginTop: 16 }, completeText: { fontSize: 12, color: T.colors.muted, marginTop: 5, marginBottom: 22 }, addAfter: { marginTop: 14, padding: 10 }, addAfterText: { fontSize: 12, fontWeight: '800', color: T.colors.accent }, modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(10,15,25,0.45)' }, sheet: { maxHeight: '92%', backgroundColor: T.colors.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 30 }, handle: { width: 36, height: 4, borderRadius: 4, backgroundColor: '#C9C9C9', alignSelf: 'center', marginBottom: 14 }, sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sheetTitle: { fontSize: 22, fontWeight: '900', color: T.colors.ink, marginBottom: 12 }, close: { fontSize: 28, color: T.colors.muted }, fieldLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.3, color: T.colors.faint, marginTop: 10, marginBottom: 6 }, typeRow: { gap: 7, paddingBottom: 3 }, typeChip: { borderWidth: 1, borderColor: T.colors.line, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 9, backgroundColor: T.colors.surface }, typeChipActive: { backgroundColor: T.colors.ink, borderColor: T.colors.ink }, typeChipText: { fontSize: 10, fontWeight: '800', color: T.colors.ink }, typeChipTextActive: { color: '#FFF' }, input: { minHeight: 48, borderWidth: 1, borderColor: T.colors.line, borderRadius: 10, backgroundColor: T.colors.surface, padding: 13, color: T.colors.ink, marginBottom: 7 }, optionEditor: { flexDirection: 'row', alignItems: 'center', gap: 8 }, radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: T.colors.line }, radioActive: { borderWidth: 5, borderColor: T.colors.accent }, optionInput: { flex: 1, minHeight: 42, borderWidth: 1, borderColor: T.colors.line, borderRadius: 9, backgroundColor: T.colors.surface, paddingHorizontal: 10, color: T.colors.ink }, cancel: { padding: 14, alignItems: 'center' }, cancelText: { color: T.colors.muted, fontWeight: '800' },
});
