import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const colors = {
  background: '#F7F7F5',
  surface: '#FFFFFF',
  text: '#171717',
  secondary: '#737373',
  border: '#E7E5E4',
  accent: '#171717',
  accentText: '#FFFFFF',
};

type Tab = 'Home' | 'Decks' | 'Study' | 'Library' | 'Settings';

const tabs: Tab[] = ['Home', 'Decks', 'Study', 'Library', 'Settings'];

function HomeScreen({ onStudy }: { onStudy: () => void }) {
  return (
    <View style={styles.content}>
      <Text style={styles.eyebrow}>QUICKREVIEW</Text>
      <Text style={styles.title}>Ready when you are.</Text>
      <Text style={styles.subtitle}>Keep your review focused and your cards organized.</Text>

      <TouchableOpacity style={styles.primaryButton} onPress={onStudy} activeOpacity={0.8}>
        <Text style={styles.primaryButtonText}>Start studying</Text>
        <Text style={styles.primaryButtonArrow}>→</Text>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your decks</Text>
        <Text style={styles.sectionAction}>See all</Text>
      </View>

      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>No decks yet</Text>
        <Text style={styles.emptyText}>Create a deck or import study material to get started.</Text>
      </View>
    </View>
  );
}

function PlaceholderScreen({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.content}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{description}</Text>
    </View>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('Home');

  const renderScreen = () => {
    switch (tab) {
      case 'Home':
        return <HomeScreen onStudy={() => setTab('Study')} />;
      case 'Decks':
        return <PlaceholderScreen title="Decks" description="Organize your cards into decks, subdecks, and tags." />;
      case 'Study':
        return <PlaceholderScreen title="Study" description="A focused review experience will live here." />;
      case 'Library':
        return <PlaceholderScreen title="Library" description="Import documents and structured text." />;
      case 'Settings':
        return <PlaceholderScreen title="Settings" description="Customize QuickReview without cluttering the study flow." />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.app}>{renderScreen()}</View>
      <View style={styles.tabBar}>
        {tabs.map((item) => {
          const selected = item === tab;
          return (
            <TouchableOpacity
              key={item}
              style={styles.tab}
              onPress={() => setTab(item)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
            >
              <View style={[styles.tabDot, selected && styles.tabDotSelected]} />
              <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  app: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 28 },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 1.8, color: colors.secondary, marginBottom: 12 },
  title: { fontSize: 32, lineHeight: 38, fontWeight: '700', color: colors.text, letterSpacing: -0.7 },
  subtitle: { marginTop: 8, fontSize: 16, lineHeight: 23, color: colors.secondary, maxWidth: 360 },
  primaryButton: {
    marginTop: 28,
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryButtonText: { color: colors.accentText, fontSize: 16, fontWeight: '700' },
  primaryButtonArrow: { color: colors.accentText, fontSize: 24 },
  sectionHeader: { marginTop: 34, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  sectionAction: { fontSize: 14, fontWeight: '600', color: colors.secondary },
  emptyCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  emptyText: { marginTop: 6, fontSize: 14, lineHeight: 20, color: colors.secondary },
  tabBar: { height: 74, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'stretch' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 5 },
  tabDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'transparent' },
  tabDotSelected: { backgroundColor: colors.text },
  tabText: { fontSize: 11, color: colors.secondary, fontWeight: '500' },
  tabTextSelected: { color: colors.text, fontWeight: '700' },
});
