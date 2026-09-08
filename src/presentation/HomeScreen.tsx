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
   <View style={s.masthead}><View><Text style={s.brand}>QUICKREVIEW</Text><Text style={s.greeting}>Good morning.</Text><Text style={s.subtitle}>Keep the useful stuff. Forget the noise.</Text></View><View style={s.avatar}><Text style={s.avatarText}>Q</Text></View></View>

   <View style={s.focus}>
     <View style={s.focusLabelRow}><Text style={s.focusEyebrow}>{schedulingEnabled?'NEXT UP':'READY TO STUDY'}</Text><Text style={s.focusContext}>{activeCards} active</Text></View>
     <Text style={s.focusNumber}>{dueCards}</Text>
     <Text style={s.focusCaption}>{schedulingEnabled?'cards due for review':'active cards available'}</Text>
     <View style={s.focusRule}/>
     <Pressable disabled={!firstStudyDeck||!dueCards} onPress={()=>firstStudyDeck&&onStudy(firstStudyDeck.id)} style={({pressed})=>[s.focusAction,(!firstStudyDeck||!dueCards)&&s.disabled,pressed&&s.pressed]}><Text style={s.focusActionText}>{dueCards?'Start a session':'Nothing due'}</Text><Text style={s.focusActionArrow}>↗</Text></Pressable>
     <Text style={s.focusNote}>{schedulingEnabled?'Spaced repetition is on.':'Study freely, whenever you want.'}</Text>
   </View>

   <View style={s.sectionHead}><Text style={s.sectionTitle}>Today</Text><Text style={s.sectionMeta}>{todayReviews.length} reviews</Text></View>
   <View style={s.metrics}>
     <Metric value={`${successRate}%`} label="ACCURACY"/>
     <Metric value={avgSeconds?`${avgSeconds}s`:'—'} label="AVG TIME"/>
     <Metric value={String(activeCards)} label="ACTIVE"/>
   </View>

   <View style={s.pattern}>
     <View style={s.patternHead}><Text style={s.patternTitle}>Review pattern</Text><Text style={s.patternMeta}>{reviews.length?`${successRate}% good or easy`:'No history yet'}</Text></View>
     <View style={s.patternRow}>{(['again','hard','good','easy'] as const).map((x,i)=><View key={x} style={[s.patternItem,i>0&&s.patternItemBorder]}><Text style={s.patternValue}>{ratingCounts[x]}</Text><Text style={s.patternLabel}>{x.toUpperCase()}</Text></View>)}</View>
   </View>

   <View style={s.sectionHead}><Text style={s.sectionTitle}>Your decks</Text><Pressable onPress={onDecks} hitSlop={8}><Text style={s.link}>View all ↗</Text></Pressable></View>
   {decks.slice(0,4).map(d=><DeckRow key={d.id} deck={d} onPress={()=>onStudy(d.id)}/>)}
   {!decks.length&&<View style={s.empty}><Text style={s.emptyKicker}>START SMALL</Text><Text style={s.emptyTitle}>Create your first deck.</Text><Text style={s.emptyText}>One useful topic is enough to begin.</Text><Pressable onPress={onDecks}><Text style={s.link}>Create a deck ↗</Text></Pressable></View>}

   <View style={s.toolsHead}><Text style={s.sectionTitle}>Tools</Text><Text style={s.sectionMeta}>02</Text></View>
   <Pressable style={({pressed})=>[s.tool,s.toolFirst,pressed&&s.pressed]} onPress={onDecks}><Text style={s.toolIndex}>01</Text><View style={s.toolCopy}><Text style={s.toolTitle}>New deck</Text><Text style={s.toolHint}>Build a focused set</Text></View><Text style={s.toolArrow}>↗</Text></Pressable>
   <Pressable style={({pressed})=>[s.tool,pressed&&s.pressed]} onPress={onLibrary}><Text style={s.toolIndex}>02</Text><View style={s.toolCopy}><Text style={s.toolTitle}>Import</Text><Text style={s.toolHint}>Bring in your material</Text></View><Text style={s.toolArrow}>↗</Text></Pressable>
 </ScrollView>;
}

function Metric({value,label}:{value:string;label:string}){return <View style={s.metric}><Text style={s.metricValue}>{value}</Text><Text style={s.metricLabel}>{label}</Text></View>}

const s=StyleSheet.create({
 scroll:{paddingHorizontal:20,paddingTop:18,paddingBottom:48},
 masthead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:34},
 brand:{fontSize:9,fontWeight:'900',letterSpacing:2.4,color:T.colors.accent},greeting:{fontSize:31,lineHeight:35,fontWeight:'900',letterSpacing:-1.5,color:T.colors.ink,marginTop:5},subtitle:{fontSize:12,lineHeight:18,color:T.colors.muted,marginTop:7},
 avatar:{width:36,height:36,borderRadius:18,borderWidth:1,borderColor:T.colors.line,backgroundColor:T.colors.surface,alignItems:'center',justifyContent:'center'},avatarText:{fontSize:12,fontWeight:'900',color:T.colors.ink},
 focus:{minHeight:290,borderRadius:18,backgroundColor:T.colors.dark,padding:21,marginBottom:38},focusLabelRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'baseline'},focusEyebrow:{fontSize:9,fontWeight:'900',letterSpacing:1.8,color:'#AAA69D'},focusContext:{fontSize:9,color:'#77746C'},focusNumber:{fontSize:82,lineHeight:84,fontWeight:'900',letterSpacing:-5,color:T.colors.white,marginTop:10},focusCaption:{fontSize:14,color:'#AAA69D',marginTop:0},focusRule:{height:1,backgroundColor:'#3B3B36',marginTop:27,marginBottom:15},focusAction:{height:52,borderRadius:9,backgroundColor:T.colors.accent,paddingHorizontal:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},focusActionText:{fontSize:13,fontWeight:'900',color:T.colors.white},focusActionArrow:{fontSize:19,color:T.colors.white},focusNote:{fontSize:9,color:'#858178',textAlign:'center',marginTop:11},disabled:{opacity:.38},pressed:{opacity:.68},
 sectionHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'baseline',marginBottom:10},sectionTitle:{fontSize:18,fontWeight:'900',letterSpacing:-.5,color:T.colors.ink},sectionMeta:{fontSize:9,color:T.colors.muted},link:{fontSize:11,fontWeight:'900',color:T.colors.accent},
 metrics:{flexDirection:'row',borderTopWidth:1,borderBottomWidth:1,borderColor:T.colors.line,marginBottom:25},metric:{flex:1,paddingVertical:15},metricValue:{fontSize:21,fontWeight:'900',color:T.colors.ink},metricLabel:{fontSize:8,fontWeight:'900',letterSpacing:1,color:T.colors.faint,marginTop:4},
 pattern:{paddingBottom:23,marginBottom:30,borderBottomWidth:1,borderColor:T.colors.line},patternHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'baseline',marginBottom:14},patternTitle:{fontSize:11,fontWeight:'900',color:T.colors.ink},patternMeta:{fontSize:9,color:T.colors.faint},patternRow:{flexDirection:'row'},patternItem:{flex:1},patternItemBorder:{borderLeftWidth:1,borderLeftColor:T.colors.line,paddingLeft:10},patternValue:{fontSize:17,fontWeight:'900',color:T.colors.ink},patternLabel:{fontSize:8,fontWeight:'800',color:T.colors.faint,marginTop:3},
 empty:{borderWidth:1,borderColor:T.colors.line,padding:18,marginBottom:25,backgroundColor:T.colors.surface},emptyKicker:{fontSize:8,fontWeight:'900',letterSpacing:1.5,color:T.colors.accent},emptyTitle:{fontSize:17,fontWeight:'900',color:T.colors.ink,marginTop:7},emptyText:{fontSize:11,color:T.colors.muted,marginVertical:6},
 toolsHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'baseline',marginTop:3,marginBottom:10},tool:{minHeight:66,borderBottomWidth:1,borderBottomColor:T.colors.line,flexDirection:'row',alignItems:'center'},toolFirst:{borderTopWidth:1,borderTopColor:T.colors.line},toolIndex:{fontSize:8,fontWeight:'900',letterSpacing:1,color:T.colors.faint,width:34},toolCopy:{flex:1},toolTitle:{fontSize:14,fontWeight:'900',color:T.colors.ink},toolHint:{fontSize:10,color:T.colors.muted,marginTop:3},toolArrow:{fontSize:17,color:T.colors.faint}
});
