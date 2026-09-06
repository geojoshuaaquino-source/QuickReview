import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const C = {
  bg: '#F6F5F2',
  surface: '#FFFFFF',
  ink: '#17151D',
  muted: '#77737E',
  faint: '#A6A2AA',
  line: '#E8E5E9',
  accent: '#6957E8',
  accentDark: '#5140C8',
  accentSoft: '#EEEBFF',
  mint: '#DDF5EA',
  mintInk: '#23724F',
  peach: '#FFE8D9',
  peachInk: '#A85227',
};

type Tab = 'Home' | 'Decks' | 'Study' | 'Library' | 'Settings';

type Deck = {
  name: string;
  subject: string;
  cards: number;
  due: number;
  progress: number;
  accent: string;
};

const DECKS: Deck[] = [
  { name: 'Biology', subject: 'Cell biology · Chapter 1–4', cards: 86, due: 12, progress: 0.72, accent: '#6C5CE7' },
  { name: 'Platform Technology', subject: 'IT fundamentals', cards: 54, due: 7, progress: 0.48, accent: '#2D8C67' },
  { name: 'Japanese Vocabulary', subject: 'N5 · Core words', cards: 120, due: 18, progress: 0.31, accent: '#D96B4B' },
];

function Icon({ symbol }: { symbol: string }) {
  return <Text style={styles.icon}>{symbol}</Text>;
}

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.pageTitle}>{title}</Text>
      {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function PrimaryButton({ label, onPress, compact = false }: { label: string; onPress?: () => void; compact?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primary, compact && styles.primaryCompact, pressed && styles.pressed]}>
      <Text style={styles.primaryText}>{label}</Text>
      <Text style={styles.primaryArrow}>›</Text>
    </Pressable>
  );
}

function DeckRow({ deck, onPress }: { deck: Deck; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.deckRow, pressed && styles.pressed]}>
      <View style={[styles.deckMark, { backgroundColor: deck.accent }]} />
      <View style={styles.deckInfo}>
        <View style={styles.rowBetween}>
          <Text style={styles.deckName}>{deck.name}</Text>
          {deck.due > 0 ? <Text style={styles.duePill}>{deck.due} due</Text> : <Text style={styles.donePill}>Caught up</Text>}
        </View>
        <Text style={styles.deckSubject}>{deck.subject}</Text>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${deck.progress * 100}%`, backgroundColor: deck.accent }]} /></View>
        <Text style={styles.deckMeta}>{deck.cards} cards · {Math.round(deck.progress * 100)}% mastered</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function HomeScreen({ go }: { go: (tab: Tab) => void }) {
  const due = DECKS.reduce((sum, d) => sum + d.due, 0);
  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.topline}>
        <View>
          <Text style={styles.brand}>QUICKREVIEW</Text>
          <Text style={styles.greeting}>Good to see you.</Text>
        </View>
        <View style={styles.avatar}><Text style={styles.avatarText}>Q</Text></View>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroOrb}><Text style={styles.heroOrbText}>↗</Text></View>
        <Text style={styles.heroEyebrow}>TODAY'S REVIEW</Text>
        <Text style={styles.heroNumber}>{due}</Text>
        <Text style={styles.heroLabel}>cards waiting for you</Text>
        <PrimaryButton label="Start review" onPress={() => go('Study')} />
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Your decks</Text>
        <Pressable onPress={() => go('Decks')}><Text style={styles.link}>See all</Text></Pressable>
      </View>
      {DECKS.slice(0, 3).map(deck => <DeckRow key={deck.name} deck={deck} onPress={() => go('Study')} />)}

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
      </View>
      <View style={styles.actionGrid}>
        <Pressable style={styles.actionCard} onPress={() => go('Decks')}><View style={[styles.actionIcon, { backgroundColor: C.accentSoft }]}><Icon symbol="＋" /></View><Text style={styles.actionTitle}>New deck</Text><Text style={styles.actionHint}>Build from scratch</Text></Pressable>
        <Pressable style={styles.actionCard} onPress={() => go('Library')}><View style={[styles.actionIcon, { backgroundColor: C.mint }]}><Icon symbol="↑" /></View><Text style={styles.actionTitle}>Import</Text><Text style={styles.actionHint}>PDF, DOCX, text & more</Text></Pressable>
      </View>
    </ScrollView>
  );
}

function DecksScreen({ go }: { go: (tab: Tab) => void }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => DECKS.filter(d => d.name.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Header title="Decks" subtitle="Everything you're learning, in one place." />
      <View style={styles.searchBox}><Text style={styles.searchIcon}>⌕</Text><TextInput value={query} onChangeText={setQuery} placeholder="Search decks" placeholderTextColor={C.faint} style={styles.searchInput} /></View>
      <View style={styles.filterRow}><Text style={styles.filterActive}>All</Text><Text style={styles.filter}>Due</Text><Text style={styles.filter}>Recent</Text></View>
      {filtered.map(deck => <DeckRow key={deck.name} deck={deck} onPress={() => go('Study')} />)}
      <Pressable style={styles.outlineButton}><Text style={styles.outlineText}>＋  Create a deck</Text></Pressable>
    </ScrollView>
  );
}

function StudyScreen() {
  const [revealed, setRevealed] = useState(false);
  const [index, setIndex] = useState(12);
  return (
    <View style={styles.studyScreen}>
      <View style={styles.studyTop}>
        <View><Text style={styles.studyDeck}>BIOLOGY</Text><Text style={styles.studyCount}>{index} / 30</Text></View>
        <Pressable style={styles.iconButton}><Text style={styles.more}>•••</Text></Pressable>
      </View>
      <View style={styles.sessionTrack}><View style={[styles.sessionFill, { width: `${(index / 30) * 100}%` }]} /></View>

      <Pressable onPress={() => setRevealed(v => !v)} style={({ pressed }) => [styles.flashcard, revealed && styles.flashcardBack, pressed && styles.cardPressed]}>
        <View style={styles.cardTopRow}><Text style={styles.cardType}>{revealed ? 'ANSWER' : 'QUESTION'}</Text><Text style={styles.cardDots}>•••</Text></View>
        {!revealed ? <>
          <Text style={styles.question}>What is the primary function of mitochondria?</Text>
          <Text style={styles.tapHint}>Tap to reveal</Text>
        </> : <>
          <Text style={styles.answer}>They produce ATP, the cell's main usable energy source, through cellular respiration.</Text>
          <View style={styles.divider} />
          <Text style={styles.explanationLabel}>REMEMBER</Text>
          <Text style={styles.explanation}>Mitochondria are often called the “powerhouse” of the cell.</Text>
        </>}
        <Text style={styles.cardTag}>CELL BIOLOGY</Text>
      </Pressable>

      {!revealed ? <Pressable onPress={() => setRevealed(true)} style={styles.reveal}><Text style={styles.revealText}>Show answer</Text><Text style={styles.revealKey}>Space</Text></Pressable> : <View style={styles.ratingArea}>
        <Text style={styles.ratingPrompt}>How well did you know it?</Text>
        <View style={styles.ratingRow}>
          <Rating label="Again" time="1m" tone="peach" onPress={() => { setIndex(v => Math.min(30, v + 1)); setRevealed(false); }} />
          <Rating label="Hard" time="6m" onPress={() => { setIndex(v => Math.min(30, v + 1)); setRevealed(false); }} />
          <Rating label="Good" time="10m" tone="accent" onPress={() => { setIndex(v => Math.min(30, v + 1)); setRevealed(false); }} />
          <Rating label="Easy" time="4d" tone="mint" onPress={() => { setIndex(v => Math.min(30, v + 1)); setRevealed(false); }} />
        </View>
      </View>}
      <Text style={styles.studyFooter}>Tap the card to flip · swipe gestures coming next</Text>
    </View>
  );
}

function Rating({ label, time, tone, onPress }: { label: string; time: string; tone?: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.rating, tone === 'accent' && styles.ratingAccent, tone === 'peach' && styles.ratingPeach, tone === 'mint' && styles.ratingMint, pressed && styles.pressed]}><Text style={styles.ratingLabel}>{label}</Text><Text style={styles.ratingTime}>{time}</Text></Pressable>;
}

function LibraryScreen() {
  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Header title="Library" subtitle="Turn your existing material into study content." />
      <View style={styles.importHero}>
        <View style={styles.importIcon}><Text style={styles.importIconText}>↑</Text></View>
        <Text style={styles.importTitle}>Import a document</Text>
        <Text style={styles.importText}>PDF, DOCX, PPTX, EPUB, TXT, CSV or an image. QuickReview extracts the structure before you turn it into cards.</Text>
        <Pressable style={styles.primary} onPress={() => {}}><Text style={styles.primaryText}>Choose a file</Text><Text style={styles.primaryArrow}>›</Text></Pressable>
      </View>
      <Text style={styles.sectionTitle}>Create another way</Text>
      <View style={styles.libraryOption}><View style={styles.optionIcon}><Text>≡</Text></View><View style={styles.optionCopy}><Text style={styles.optionTitle}>Paste structured text</Text><Text style={styles.optionHint}>Term / Definition / Question / Answer</Text></View><Text style={styles.chevron}>›</Text></View>
      <View style={styles.libraryOption}><View style={styles.optionIcon}><Text>✎</Text></View><View style={styles.optionCopy}><Text style={styles.optionTitle}>Write cards manually</Text><Text style={styles.optionHint}>Choose a card type as you build</Text></View><Text style={styles.chevron}>›</Text></View>
      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Recent imports</Text>
      <View style={styles.emptyState}><Text style={styles.emptyIcon}>□</Text><Text style={styles.emptyTitle}>Nothing imported yet</Text><Text style={styles.emptyText}>Your source files stay available for checking extracted text.</Text></View>
    </ScrollView>
  );
}

function SettingsScreen() {
  return <ScrollView contentContainerStyle={styles.scroll}><Header title="Settings" subtitle="Make QuickReview work your way." /><Text style={styles.settingsLabel}>STUDY</Text><SettingRow icon="◷" title="Spaced repetition" value="Off" /><SettingRow icon="▣" title="Default session" value="30 cards" /><SettingRow icon="⌁" title="Study gestures" value="On" /><Text style={styles.settingsLabel}>APPEARANCE</Text><SettingRow icon="◐" title="Theme" value="System" /><SettingRow icon="Aa" title="Text size" value="Default" /><Text style={styles.settingsLabel}>DATA</Text><SettingRow icon="⇄" title="Import & export" value="" /><SettingRow icon="▤" title="Storage" value="Local" /></ScrollView>;
}

function SettingRow({ icon, title, value }: { icon: string; title: string; value: string }) {
  return <Pressable style={styles.settingRow}><View style={styles.settingIcon}><Text>{icon}</Text></View><Text style={styles.settingTitle}>{title}</Text>{value ? <Text style={styles.settingValue}>{value}</Text> : null}<Text style={styles.chevron}>›</Text></Pressable>;
}

export default function App() {
  const [tab, setTab] = useState<Tab>('Home');
  const screens = { Home: <HomeScreen go={setTab} />, Decks: <DecksScreen go={setTab} />, Study: <StudyScreen />, Library: <LibraryScreen />, Settings: <SettingsScreen /> };
  return <SafeAreaView style={styles.safe}><StatusBar barStyle="dark-content" backgroundColor={C.bg} /><View style={styles.app}>{screens[tab]}</View><View style={styles.nav}>{(['Home', 'Decks', 'Study', 'Library', 'Settings'] as Tab[]).map(item => { const active = tab === item; const glyph = { Home: '⌂', Decks: '▤', Study: '▶', Library: '□', Settings: '⚙' }[item]; return <Pressable key={item} onPress={() => setTab(item)} style={styles.navItem}><Text style={[styles.navGlyph, active && styles.navActive]}>{glyph}</Text><Text style={[styles.navLabel, active && styles.navActive]}>{item}</Text></Pressable>; })}</View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  app: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 34 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  cardPressed: { transform: [{ scale: 0.995 }] },
  topline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  brand: { color: C.accent, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  greeting: { color: C.ink, fontSize: 25, fontWeight: '800', letterSpacing: -0.6, marginTop: 5 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  hero: { backgroundColor: C.ink, borderRadius: 28, padding: 22, minHeight: 238, overflow: 'hidden', marginBottom: 30 },
  heroOrb: { position: 'absolute', right: -22, top: -32, width: 142, height: 142, borderRadius: 71, backgroundColor: '#342F4A', alignItems: 'center', justifyContent: 'center' },
  heroOrbText: { color: '#BDB4FF', fontSize: 52, fontWeight: '300', marginTop: 18 },
  heroEyebrow: { color: '#BDB7C8', fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  heroNumber: { color: '#FFF', fontSize: 58, lineHeight: 64, fontWeight: '800', letterSpacing: -2.5, marginTop: 5 },
  heroLabel: { color: '#BDB7C8', fontSize: 15, marginBottom: 18 },
  primary: { height: 52, borderRadius: 16, backgroundColor: C.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 },
  primaryCompact: { height: 46 },
  primaryText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  primaryArrow: { color: '#FFF', fontSize: 26, fontWeight: '300' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: C.ink, fontSize: 18, fontWeight: '800', letterSpacing: -0.3, marginBottom: 12 },
  link: { color: C.accent, fontSize: 13, fontWeight: '800' },
  deckRow: { backgroundColor: C.surface, borderRadius: 18, borderWidth: 1, borderColor: C.line, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  deckMark: { width: 5, alignSelf: 'stretch', borderRadius: 4, marginRight: 13 },
  deckInfo: { flex: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deckName: { color: C.ink, fontSize: 16, fontWeight: '800' },
  deckSubject: { color: C.muted, fontSize: 12, marginTop: 3 },
  duePill: { color: C.accentDark, backgroundColor: C.accentSoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontWeight: '800' },
  donePill: { color: C.mintInk, backgroundColor: C.mint, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontWeight: '800' },
  progressTrack: { height: 5, backgroundColor: '#F0EEF1', borderRadius: 3, marginTop: 11, overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: 3 },
  deckMeta: { color: C.faint, fontSize: 10, marginTop: 5 },
  chevron: { color: C.faint, fontSize: 24, fontWeight: '300', marginLeft: 9 },
  actionGrid: { flexDirection: 'row', gap: 10 },
  actionCard: { flex: 1, backgroundColor: C.surface, borderRadius: 18, borderWidth: 1, borderColor: C.line, padding: 15 },
  actionIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  icon: { color: C.ink, fontSize: 19, fontWeight: '700' },
  actionTitle: { color: C.ink, fontSize: 14, fontWeight: '800' },
  actionHint: { color: C.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  header: { marginBottom: 22 },
  pageTitle: { color: C.ink, fontSize: 31, lineHeight: 37, fontWeight: '850', letterSpacing: -1 },
  pageSubtitle: { color: C.muted, fontSize: 14, lineHeight: 20, marginTop: 5 },
  searchBox: { height: 50, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, marginBottom: 12 },
  searchIcon: { color: C.muted, fontSize: 23, marginRight: 8 },
  searchInput: { flex: 1, color: C.ink, fontSize: 14 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  filterActive: { backgroundColor: C.ink, color: '#FFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, fontSize: 12, fontWeight: '800' },
  filter: { color: C.muted, backgroundColor: '#ECE9EE', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, fontSize: 12, fontWeight: '700' },
  outlineButton: { height: 50, borderRadius: 15, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', marginTop: 5 },
  outlineText: { color: C.ink, fontSize: 14, fontWeight: '800' },
  studyScreen: { flex: 1, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 18 },
  studyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  studyDeck: { color: C.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  studyCount: { color: C.ink, fontSize: 14, fontWeight: '800', marginTop: 3 },
  iconButton: { width: 42, height: 42, borderRadius: 13, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  more: { color: C.muted, fontSize: 14, letterSpacing: 2 },
  sessionTrack: { height: 5, backgroundColor: '#E6E3E8', borderRadius: 4, overflow: 'hidden', marginBottom: 20 },
  sessionFill: { height: 5, backgroundColor: C.accent, borderRadius: 4 },
  flashcard: { flex: 1, maxHeight: 475, minHeight: 350, backgroundColor: C.surface, borderRadius: 28, borderWidth: 1, borderColor: C.line, padding: 22, justifyContent: 'center', shadowColor: '#1A1622', shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  flashcardBack: { backgroundColor: C.accentSoft, borderColor: '#DDD8FF' },
  cardTopRow: { position: 'absolute', top: 22, left: 22, right: 22, flexDirection: 'row', justifyContent: 'space-between' },
  cardType: { color: C.faint, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  cardDots: { color: C.faint, fontSize: 11, letterSpacing: 2 },
  question: { color: C.ink, fontSize: 27, lineHeight: 35, fontWeight: '800', letterSpacing: -0.7 },
  tapHint: { color: C.faint, fontSize: 13, marginTop: 22 },
  answer: { color: C.ink, fontSize: 21, lineHeight: 29, fontWeight: '750', letterSpacing: -0.3 },
  divider: { height: 1, backgroundColor: '#DCD7EE', marginVertical: 22 },
  explanationLabel: { color: C.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  explanation: { color: C.muted, fontSize: 14, lineHeight: 21, marginTop: 6 },
  cardTag: { position: 'absolute', bottom: 22, left: 22, color: C.faint, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  reveal: { height: 54, borderRadius: 16, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', marginTop: 15, flexDirection: 'row', gap: 10 },
  revealText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  revealKey: { color: '#8E8995', fontSize: 11, backgroundColor: '#2A2730', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  ratingArea: { marginTop: 15 },
  ratingPrompt: { textAlign: 'center', color: C.muted, fontSize: 12, marginBottom: 9 },
  ratingRow: { flexDirection: 'row', gap: 7 },
  rating: { flex: 1, height: 58, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  ratingAccent: { backgroundColor: C.accent, borderColor: C.accent },
  ratingPeach: { backgroundColor: C.peach, borderColor: '#F5D1BD' },
  ratingMint: { backgroundColor: C.mint, borderColor: '#C7E8D7' },
  ratingLabel: { color: C.ink, fontSize: 12, fontWeight: '800' },
  ratingTime: { color: C.muted, fontSize: 10, marginTop: 2 },
  studyFooter: { textAlign: 'center', color: C.faint, fontSize: 10, marginTop: 12 },
  importHero: { backgroundColor: C.surface, borderRadius: 24, borderWidth: 1, borderColor: C.line, padding: 20, marginBottom: 28 },
  importIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  importIconText: { color: C.accent, fontSize: 26 },
  importTitle: { color: C.ink, fontSize: 21, fontWeight: '850' },
  importText: { color: C.muted, fontSize: 13, lineHeight: 20, marginTop: 7, marginBottom: 18 },
  libraryOption: { backgroundColor: C.surface, borderRadius: 17, borderWidth: 1, borderColor: C.line, padding: 13, flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  optionIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#F0EEF2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  optionCopy: { flex: 1 },
  optionTitle: { color: C.ink, fontSize: 14, fontWeight: '800' },
  optionHint: { color: C.muted, fontSize: 11, marginTop: 3 },
  emptyState: { alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 20, padding: 28 },
  emptyIcon: { color: C.faint, fontSize: 25, marginBottom: 8 },
  emptyTitle: { color: C.ink, fontSize: 15, fontWeight: '800' },
  emptyText: { color: C.muted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 4 },
  settingsLabel: { color: C.faint, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, marginTop: 12, marginBottom: 8 },
  settingRow: { minHeight: 58, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.line, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  settingIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F0EEF2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  settingTitle: { flex: 1, color: C.ink, fontSize: 14, fontWeight: '700' },
  settingValue: { color: C.muted, fontSize: 12, marginRight: 7 },
  nav: { height: 76, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.line, flexDirection: 'row', paddingHorizontal: 5, paddingBottom: 5 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  navGlyph: { color: C.faint, fontSize: 19, lineHeight: 22 },
  navLabel: { color: C.faint, fontSize: 9, fontWeight: '700' },
  navActive: { color: C.accent, fontWeight: '900' },
});
