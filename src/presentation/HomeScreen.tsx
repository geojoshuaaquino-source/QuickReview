import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Deck, ReviewRecord } from '../domain/models';
import { DeckRow } from './components';
import { theme as T } from './theme';

type Props={decks:Deck[];reviews:ReviewRecord[];schedulingEnabled:boolean;onStudy:(deckId:string)=>void;onDecks:()=>void;onLibrary:()=>void};

export function HomeScreen({decks,reviews,schedulingEnabled,onStudy,onDecks,onLibrary}:Props){
 const activeCards=decks.reduce((n,d)=>n+d.cards.filter(c=>!c.suspended).length,0);
 const now=Date.now();
 const dueCards=schedulingEnabled?decks.reduce((n,d)=>n+d.cards.filter(c=>!c.suspended&&(!c.dueAt||new Date(c.dueAt).getTime()<=now)).length,0):activeCards;
 const today=new Date().toISOString().slice(0,10);
 const todayReviews=reviews.filter(r=>r.createdAt.slice(0,10)===today);
 const goodOrEasy=reviews.filter(r=>r.rating==='good'||r.rating==='easy').length;
 const successRate=reviews.length?Math.round(goodOrEasy/reviews.length*100):0;
 const avgSeconds=reviews.length?Math.round(reviews.reduce((n,r)=>n+r.elapsedMs,0)/reviews.length/1000):0;
 const ratingCounts=useMemo(()=>({again:reviews.filter(r=>r.rating==='again').length,hard:reviews.filter(r=>r.rating==='hard').length,good:reviews.filter(r=>r.rating==='good').length,easy:reviews.filter(r=>r.rating==='easy').length}),[reviews]);
 const firstStudyDeck=decks.find(d=>d.cards.some(c=>!c.suspended&&(!schedulingEnabled||!c.dueAt||new Date(c.dueAt).getTime()<=now)))||decks[0];
 return <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
  <View style={s.top}><View><Text style={s.brand}>QUICKREVIEW</Text><Text style={s.greeting}>Good morning.</Text><Text style={s.subtitle}>A quieter way to keep what you learn.</Text></View><View style={s.avatar}><Text style={s.avatarText}>Q</Text></View></View>
  <View style={s.hero}><View style={s.heroTop}><View><Text style={s.eyebrow}>{schedulingEnabled?'DUE FOR REVIEW':'READY TO STUDY'}</Text><Text style={s.heroNumber}>{dueCards}</Text><Text style={s.heroLabel}>{schedulingEnabled?'cards due today':'active cards'}</Text></View><View style={s.live}><View style={s.liveDot}/><Text style={s.liveText}>LOCAL</Text></View></View><Pressable disabled={!firstStudyDeck||!dueCards} onPress={()=>firstStudyDeck&&onStudy(firstStudyDeck.id)} style={({pressed})=>[s.heroButton,(!firstStudyDeck||!dueCards)&&s.disabled,pressed&&s.pressed]}><Text style={s.heroButtonText}>{dueCards?'Start studying':'All caught up'}</Text><Text style={s.heroArrow}>→</Text></Pressable><Text style={s.heroHint}>{schedulingEnabled?`${activeCards} active cards · spaced repetition on`:'Study without a schedule, whenever you want'}</Text></View>
  <View style={s.section}><Text style={s.sectionTitle}>Progress</Text><Text style={s.sectionMeta}>{reviews.length?`${successRate}% good or easy`:'No reviews yet'}</Text></View>
  <View style={s.stats}><Stat value={String(todayReviews.length)} label="TODAY"/><Stat value={`${successRate}%`} label="ACCURACY"/><Stat value={avgSeconds?`${avgSeconds}s`:'—'} label="AVG. TIME"/></View>
  <View style={s.breakdown}><Text style={s.breakdownTitle}>Review breakdown</Text><View style={s.breakdownRow}>{(['again','hard','good','easy'] as const).map(r=><View key={r} style={s.breakdownItem}><Text style={s.breakdownValue}>{ratingCounts[r]}</Text><Text style={s.breakdownLabel}>{r.toUpperCase()}</Text></View>)}</View></View>
  <View style={s.section}><Text style={s.sectionTitle}>Your decks</Text><Pressable onPress={onDecks} hitSlop={8}><Text style={s.link}>See all</Text></Pressable></View>
  {decks.slice(0,4).map(d=><DeckRow key={d.id} deck={d} onPress={()=>onStudy(d.id)}/>)}
  {!decks.length&&<View style={s.empty}><Text style={s.emptyTitle}>Create your first deck</Text><Text style={s.emptyText}>Start with a small set of cards and build from there.</Text><Pressable onPress={onDecks}><Text style={s.link}>Go to decks →</Text></Pressable></View>}
  <Text style={[s.sectionTitle,s.standaloneTitle]}>Quick actions</Text><View style={s.actions}><Pressable style={({pressed})=>[s.action,pressed&&s.pressed]} onPress={onDecks}><Text style={s.actionIcon}>＋</Text><Text style={s.actionTitle}>New deck</Text><Text style={s.actionHint}>Build a study set</Text></Pressable><Pressable style={({pressed})=>[s.action,pressed&&s.pressed]} onPress={onLibrary}><Text style={[s.actionIcon,{backgroundColor:T.colors.greenSoft}]}>↑</Text><Text style={s.actionTitle}>Import</Text><Text style={s.actionHint}>Bring in your material</Text></Pressable></View>
 </ScrollView>;
}
function Stat({value,label}:{value:string;label:string}){return <View style={s.stat}><Text style={s.statValue}>{value}</Text><Text style={s.statLabel}>{label}</Text></View>}
const s=StyleSheet.create({
 scroll:{paddingHorizontal:20,paddingTop:20,paddingBottom:44},
 top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:24},
 brand:{fontSize:10,fontWeight:'900',letterSpacing:2.4,color:T.colors.accent},
 greeting:{fontSize:30,fontWeight:'900',letterSpacing:-1.2,color:T.colors.ink,marginTop:6},
 subtitle:{fontSize:12,color:T.colors.muted,marginTop:5},
 avatar:{width:42,height:42,borderRadius:14,backgroundColor:T.colors.ink,alignItems:'center',justifyContent:'center'},
 avatarText:{color:'#FFF',fontSize:15,fontWeight:'900'},
 hero:{backgroundColor:T.colors.dark,borderRadius:28,padding:22,minHeight:286,marginBottom:30,overflow:'hidden'},
 heroTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'},
 eyebrow:{color:'#B9B3A9',fontSize:9,fontWeight:'900',letterSpacing:1.7},
 heroNumber:{color:'#FFF',fontSize:72,lineHeight:76,fontWeight:'900',letterSpacing:-4,marginTop:8},
 heroLabel:{color:'#B9B3A9',fontSize:14},
 live:{flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:'#4A4A44',borderRadius:12,paddingHorizontal:9,paddingVertical:6},
 liveDot:{width:5,height:5,borderRadius:3,backgroundColor:'#6BC39A',marginRight:6},
 liveText:{fontSize:7,fontWeight:'900',letterSpacing:1,color:'#A8D9C0'},
 heroButton:{height:54,borderRadius:16,backgroundColor:T.colors.accent,paddingHorizontal:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:20},
 heroButtonText:{color:'#FFF',fontWeight:'900',fontSize:13},heroArrow:{color:'#FFF',fontSize:22},
 heroHint:{color:'#8E8A82',fontSize:9,textAlign:'center',marginTop:12},disabled:{opacity:.38},
 pressed:{opacity:.7,transform:[{scale:.985}]},
 section:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:11},
 sectionTitle:{fontSize:18,fontWeight:'900',color:T.colors.ink},standaloneTitle:{marginTop:28,marginBottom:11},sectionMeta:{fontSize:10,color:T.colors.muted},link:{fontSize:12,fontWeight:'900',color:T.colors.accent},
 stats:{flexDirection:'row',gap:8,marginBottom:11},
 stat:{flex:1,borderWidth:1,borderColor:T.colors.line,borderRadius:16,backgroundColor:T.colors.surface,paddingVertical:15,paddingHorizontal:13},
 statValue:{fontSize:21,fontWeight:'900',color:T.colors.ink},statLabel:{fontSize:8,fontWeight:'900',letterSpacing:.8,color:T.colors.faint,marginTop:5},
 breakdown:{borderTopWidth:1,borderBottomWidth:1,borderColor:T.colors.line,paddingVertical:16,marginBottom:28},
 breakdownTitle:{fontSize:11,fontWeight:'900',color:T.colors.ink,marginBottom:12},breakdownRow:{flexDirection:'row'},breakdownItem:{flex:1,alignItems:'center'},breakdownValue:{fontSize:16,fontWeight:'900',color:T.colors.ink},breakdownLabel:{fontSize:8,color:T.colors.faint,marginTop:4,fontWeight:'800'},
 actions:{flexDirection:'row',gap:10},action:{flex:1,minHeight:124,borderWidth:1,borderColor:T.colors.line,borderRadius:18,backgroundColor:T.colors.surface,padding:16},actionIcon:{width:36,height:36,borderRadius:11,backgroundColor:T.colors.accentSoft,fontSize:20,textAlign:'center',textAlignVertical:'center',marginBottom:12,color:T.colors.accent},actionTitle:{fontWeight:'900',fontSize:14,color:T.colors.ink},actionHint:{fontSize:10,color:T.colors.muted,marginTop:4},
 empty:{borderWidth:1,borderColor:T.colors.line,borderRadius:18,padding:20,marginBottom:25},emptyTitle:{fontSize:15,fontWeight:'900',color:T.colors.ink},emptyText:{fontSize:11,color:T.colors.muted,marginVertical:7}
});
