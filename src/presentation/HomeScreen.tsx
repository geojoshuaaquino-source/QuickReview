import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Deck, ReviewRecord } from '../domain/models';
import { DeckRow } from './components';
import { theme as T } from './theme';

type Props = { decks: Deck[]; reviews: ReviewRecord[]; schedulingEnabled: boolean; onStudy: (deckId: string) => void; onDecks: () => void; onLibrary: () => void };

export function HomeScreen({ decks, reviews, schedulingEnabled, onStudy, onDecks, onLibrary }: Props) {
  const activeCards = decks.reduce((n, d) => n + d.cards.filter(c => !c.suspended).length, 0);
  const now = Date.now();
  const dueCards = schedulingEnabled ? decks.reduce((n, d) => n + d.cards.filter(c => !c.suspended && (!c.dueAt || new Date(c.dueAt).getTime() <= now)).length, 0) : activeCards;
  const today = new Date().toISOString().slice(0, 10);
  const todayReviews = reviews.filter(r => r.createdAt.slice(0, 10) === today);
  const goodOrEasy = reviews.filter(r => r.rating === 'good' || r.rating === 'easy').length;
  const successRate = reviews.length ? Math.round((goodOrEasy / reviews.length) * 100) : 0;
  const avgSeconds = reviews.length ? Math.round(reviews.reduce((n, r) => n + r.elapsedMs, 0) / reviews.length / 1000) : 0;
  const ratingCounts = useMemo(() => ({
    again: reviews.filter(r => r.rating === 'again').length,
    hard: reviews.filter(r => r.rating === 'hard').length,
    good: reviews.filter(r => r.rating === 'good').length,
    easy: reviews.filter(r => r.rating === 'easy').length,
  }), [reviews]);

  return <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
    <View style={s.top}><View><Text style={s.brand}>QUICKREVIEW</Text><Text style={s.greeting}>Good to see you.</Text></View><View style={s.avatar}><Text style={s.avatarText}>Q</Text></View></View>
    <View style={s.hero}>
      <Text style={s.eyebrow}>{schedulingEnabled ? 'DUE FOR REVIEW' : 'READY WHEN YOU ARE'}</Text><Text style={s.heroNumber}>{dueCards}</Text><Text style={s.heroLabel}>{schedulingEnabled ? 'cards due to study' : 'cards ready to study'}</Text>
      <Pressable disabled={!decks.length || !dueCards} onPress={() => onStudy(decks[0].id)} style={[s.heroButton, (!decks.length || !dueCards) && s.heroButtonDisabled]}><Text style={s.heroButtonText}>{dueCards ? 'Start studying' : 'Nothing due'}</Text><Text style={s.heroArrow}>→</Text></Pressable>
      <Text style={s.heroHint}>{schedulingEnabled ? `${activeCards} active cards · spaced repetition on` : 'No schedule required · study at your pace'}</Text>
    </View>

    <View style={s.section}><Text style={s.sectionTitle}>Your progress</Text><Text style={s.sectionMeta}>{reviews.length ? `${successRate}% good or easy` : 'No reviews yet'}</Text></View>
    <View style={s.stats}><Stat value={String(todayReviews.length)} label="Today" /><Stat value={`${successRate}%`} label="Good / Easy" /><Stat value={avgSeconds ? `${avgSeconds}s` : '—'} label="Avg. time" /></View>
    <View style={s.breakdown}><Text style={s.breakdownTitle}>Review breakdown</Text><View style={s.breakdownRow}>{(['again','hard','good','easy'] as const).map(r => <View key={r} style={s.breakdownItem}><Text style={s.breakdownValue}>{ratingCounts[r]}</Text><Text style={s.breakdownLabel}>{r[0].toUpperCase() + r.slice(1)}</Text></View>)}</View></View>

    <View style={s.section}><Text style={s.sectionTitle}>Your decks</Text><Pressable onPress={onDecks}><Text style={s.link}>See all</Text></Pressable></View>
    {decks.slice(0, 4).map(d => <DeckRow key={d.id} deck={d} onPress={() => onStudy(d.id)} />)}
    {!decks.length && <View style={s.empty}><Text style={s.emptyTitle}>Create your first deck</Text><Text style={s.emptyText}>Start with a small set of cards and build from there.</Text><Pressable onPress={onDecks}><Text style={s.link}>Go to decks →</Text></Pressable></View>}

    <Text style={[s.sectionTitle, s.standaloneTitle]}>Make something</Text><View style={s.actions}><Pressable style={s.action} onPress={onDecks}><Text style={s.actionIcon}>＋</Text><Text style={s.actionTitle}>New deck</Text><Text style={s.actionHint}>Start with your own cards</Text></Pressable><Pressable style={s.action} onPress={onLibrary}><Text style={[s.actionIcon,{backgroundColor:T.colors.greenSoft}]}>↑</Text><Text style={s.actionTitle}>Import</Text><Text style={s.actionHint}>Bring in notes or a file</Text></Pressable></View>
  </ScrollView>;
}
function Stat({ value, label }: { value: string; label: string }) { return <View style={s.stat}><Text style={s.statValue}>{value}</Text><Text style={s.statLabel}>{label}</Text></View>; }
const s=StyleSheet.create({scroll:{padding:20,paddingBottom:40},top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:24},brand:{fontSize:10,fontWeight:'800',letterSpacing:2.2,color:T.colors.accent},greeting:{fontSize:27,fontWeight:'800',letterSpacing:-.8,color:T.colors.ink,marginTop:5},avatar:{width:42,height:42,borderRadius:14,backgroundColor:T.colors.ink,alignItems:'center',justifyContent:'center'},avatarText:{color:'#FFF',fontWeight:'800'},hero:{backgroundColor:T.colors.dark,borderRadius:30,padding:23,minHeight:284,marginBottom:25,overflow:'hidden'},eyebrow:{color:'#BDB8C8',fontSize:10,fontWeight:'800',letterSpacing:1.5},heroNumber:{color:'#FFF',fontSize:68,lineHeight:74,fontWeight:'800',letterSpacing:-3,marginTop:8},heroLabel:{color:'#BDB8C8',fontSize:15,marginBottom:20},heroButton:{height:53,borderRadius:17,backgroundColor:T.colors.accent,paddingHorizontal:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},heroButtonDisabled:{opacity:.45},heroButtonText:{color:'#FFF',fontWeight:'800'},heroArrow:{color:'#FFF',fontSize:22},heroHint:{color:'#8E899A',fontSize:10,textAlign:'center',marginTop:12},section:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12},sectionTitle:{fontSize:18,fontWeight:'800',color:T.colors.ink},standaloneTitle:{marginBottom:12},sectionMeta:{fontSize:11,color:T.colors.muted},link:{fontSize:13,fontWeight:'800',color:T.colors.accent},stats:{flexDirection:'row',gap:9,marginBottom:10},stat:{flex:1,borderRadius:18,borderWidth:1,borderColor:T.colors.line,backgroundColor:T.colors.surface,padding:15},statValue:{fontSize:21,fontWeight:'900',color:T.colors.ink},statLabel:{fontSize:9,fontWeight:'700',color:T.colors.muted,marginTop:4},breakdown:{borderRadius:19,borderWidth:1,borderColor:T.colors.line,backgroundColor:T.colors.surface,padding:15,marginBottom:25},breakdownTitle:{fontSize:12,fontWeight:'800',color:T.colors.ink,marginBottom:12},breakdownRow:{flexDirection:'row',gap:7},breakdownItem:{flex:1,alignItems:'center'},breakdownValue:{fontSize:15,fontWeight:'900',color:T.colors.ink},breakdownLabel:{fontSize:8,color:T.colors.muted,marginTop:3},actions:{flexDirection:'row',gap:10},action:{flex:1,minHeight:135,borderRadius:19,borderWidth:1,borderColor:T.colors.line,backgroundColor:T.colors.surface,padding:16},actionIcon:{width:36,height:36,borderRadius:12,backgroundColor:T.colors.accentSoft,fontSize:21,textAlign:'center',textAlignVertical:'center',marginBottom:13},actionTitle:{fontWeight:'800',fontSize:14,color:T.colors.ink},actionHint:{fontSize:11,color:T.colors.muted,marginTop:3},empty:{borderRadius:20,borderWidth:1,borderColor:T.colors.line,padding:22,marginBottom:25},emptyTitle:{fontSize:15,fontWeight:'900',color:T.colors.ink},emptyText:{fontSize:11,color:T.colors.muted,marginVertical:6}});