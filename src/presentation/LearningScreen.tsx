import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, CardType, Deck } from '../domain/models';
import { Button } from './components';
import { theme as T } from './theme';

const label: Record<CardType, string> = {
  basic: 'Basic',
  reversed: 'Reversed',
  cloze: 'Cloze',
  multipleChoice: 'Multiple choice',
  trueFalse: 'True / False',
  typedAnswer: 'Typed answer',
  image: 'Image',
  imageOcclusion: 'Image occlusion',
};

function clozeText(text: string) {
  return text.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, '$1');
}

function LearningCard({ card }: { card: Card }) {
  const prompt = card.type === 'reversed' ? card.back : card.front;
  const meaning = card.type === 'reversed' ? card.front : card.back;
  return (
    <ScrollView contentContainerStyle={s.lesson} showsVerticalScrollIndicator={false}>
      <Text style={s.type}>{label[card.type].toUpperCase()}</Text>
      {(card.type === 'image' || card.type === 'imageOcclusion') && card.imageUri ? (
        <Image source={{ uri: card.imageUri }} resizeMode="contain" style={s.image} />
      ) : null}
      <Text style={s.prompt}>{card.type === 'cloze' ? clozeText(prompt) : prompt}</Text>
      <View style={s.divider} />
      <Text style={s.section}>MEANING</Text>
      <Text style={s.meaning}>{meaning}</Text>
      {card.examples.length > 0 ? (
        <>
          <Text style={s.section}>EXAMPLES</Text>
          {card.examples.map((example, index) => (
            <View key={`${example}-${index}`} style={s.exampleRow}>
              <Text style={s.exampleIndex}>{index + 1}</Text>
              <Text style={s.example}>{example}</Text>
            </View>
          ))}
        </>
      ) : null}
      {card.tags.length > 0 ? <Text style={s.tags}>{card.tags.map((tag) => `#${tag}`).join('  ')}</Text> : null}
    </ScrollView>
  );
}

type Props = { deck: Deck; onPractice: () => void };

export function LearningScreen({ deck, onPractice }: Props) {
  const cards = useMemo(() => deck.cards.filter((card) => !card.suspended), [deck]);
  const [index, setIndex] = useState(0);
  const current = cards[index];

  if (!current) {
    return (
      <View style={s.empty}>
        <Text style={s.kicker}>STUDY</Text>
        <Text style={s.title}>{deck.name}</Text>
        <Text style={s.emptyText}>There are no active lessons in this deck yet.</Text>
        <Button label="Go to practice" secondary onPress={onPractice} />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View>
          <Text style={[s.deck, { color: deck.accent }]}>{deck.name.toUpperCase()}</Text>
          <Text style={s.heading}>Study lessons</Text>
        </View>
        <Pressable onPress={onPractice} accessibilityRole="button">
          <Text style={s.practice}>Practice</Text>
        </Pressable>
      </View>
      <View style={s.meta}>
        <Text style={s.metaText}>Lesson {index + 1} of {cards.length}</Text>
        <Text style={s.metaText}>Read at your pace</Text>
      </View>
      <View style={s.cardArea}>
        <LearningCard card={current} />
      </View>
      <View style={s.controls}>
        <Pressable disabled={index === 0} onPress={() => setIndex((value) => Math.max(0, value - 1))} style={[s.control, index === 0 && s.disabled]}>
          <Text style={s.controlText}>Previous</Text>
        </Pressable>
        <Pressable disabled={index === cards.length - 1} onPress={() => setIndex((value) => Math.min(cards.length - 1, value + 1))} style={[s.control, s.next, index === cards.length - 1 && s.disabledNext]}>
          <Text style={[s.controlText, s.nextText]}>Next lesson</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  deck: { fontSize: 8, fontWeight: '900', letterSpacing: 1.4 },
  heading: { fontSize: 25, fontWeight: '900', color: T.colors.ink, marginTop: 3 },
  practice: { fontSize: 12, fontWeight: '900', color: T.colors.accent, padding: 8 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, marginBottom: 10 },
  metaText: { fontSize: 10, fontWeight: '700', color: T.colors.muted },
  cardArea: { flex: 1, borderWidth: 1, borderColor: T.colors.line, backgroundColor: T.colors.surface },
  lesson: { padding: 20, paddingBottom: 28 },
  type: { fontSize: 8, fontWeight: '900', letterSpacing: 1.3, color: T.colors.faint, marginBottom: 20 },
  prompt: { fontSize: 25, lineHeight: 33, fontWeight: '900', color: T.colors.ink },
  divider: { height: 1, backgroundColor: T.colors.line, marginVertical: 24 },
  section: { fontSize: 8, fontWeight: '900', letterSpacing: 1.4, color: T.colors.faint, marginBottom: 8, marginTop: 4 },
  meaning: { fontSize: 16, lineHeight: 25, color: T.colors.ink },
  exampleRow: { flexDirection: 'row', marginTop: 10 },
  exampleIndex: { width: 22, fontSize: 11, fontWeight: '900', color: T.colors.accent },
  example: { flex: 1, fontSize: 13, lineHeight: 20, color: T.colors.muted },
  tags: { fontSize: 10, fontWeight: '800', color: T.colors.accent, marginTop: 20 },
  image: { width: '100%', height: 190, marginBottom: 20 },
  controls: { flexDirection: 'row', gap: 10, marginTop: 12 },
  control: { flex: 1, minHeight: 46, borderWidth: 1, borderColor: T.colors.line, alignItems: 'center', justifyContent: 'center' },
  next: { backgroundColor: T.colors.accent, borderColor: T.colors.accent },
  disabled: { opacity: 0.35 },
  disabledNext: { opacity: 0.45 },
  controlText: { fontSize: 11, fontWeight: '900', color: T.colors.ink },
  nextText: { color: '#FFF' },
  empty: { flex: 1, padding: 20, justifyContent: 'center' },
  kicker: { fontSize: 9, fontWeight: '900', letterSpacing: 1.6, color: T.colors.accent },
  title: { fontSize: 30, fontWeight: '900', color: T.colors.ink, marginTop: 5 },
  emptyText: { fontSize: 13, lineHeight: 20, color: T.colors.muted, marginVertical: 10 },
});
