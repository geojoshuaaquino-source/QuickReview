import React, { useMemo, useState } from 'react';
import { StatusBar, StyleSheet, Text, Pressable, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Deck, Card } from './src/domain/models';
import { LocalRepository } from './src/data/QuickReviewRepository';
import { useQuickReview } from './src/application/QuickReviewStore';
import { Decks } from './src/presentation/screens';
import { HomeScreen } from './src/presentation/HomeScreen';
import { StudyScreen } from './src/presentation/StudyScreen';
import { LearningScreen } from './src/presentation/LearningScreen';
import { LibraryScreen } from './src/presentation/LibraryScreen';
import { SettingsScreen } from './src/presentation/SettingsScreen';
import { theme as T } from './src/presentation/theme';

type Tab='Home'|'Decks'|'Study'|'Library'|'Settings';
const repo = new LocalRepository();

export default function App(){return <SafeAreaProvider><AppContent/></SafeAreaProvider>}

function AppContent(){
 const insets=useSafeAreaInsets();
 const [tab,setTab]=useState<Tab>('Home');
 const [selectedId,setSelectedId]=useState('biology');
 const [studyMode,setStudyMode]=useState<'learn'|'practice'>('learn');
 const {decks,reviews,settings,loaded,createCard,updateCard,grade,makeSession,refresh,deleteCard,toggleSuspend,saveSettings,importCards,createDeckAndImport}=useQuickReview(repo);
 const selected=useMemo(()=>decks.find(d=>d.id===selectedId)||decks[0],[decks,selectedId]);
 const nav={go:setTab,select:setSelectedId};
 const addCard=async(card:Card)=>{await createCard(card.deckId,card.front,card.back,card.type,card.tags,{options:card.options,correctOption:card.correctOption,imageUri:card.imageUri,examples:card.examples})};
 const legacySetDecks:React.Dispatch<React.SetStateAction<Deck[]>>=updater=>{const next=typeof updater==='function'?updater(decks):updater;Promise.all(next.map(deck=>repo.saveDeck(deck))).then(refresh).catch(()=>undefined)};
 if(!loaded)return <View style={s.safe}><View style={[s.loading,{paddingTop:insets.top,paddingBottom:insets.bottom,paddingLeft:insets.left,paddingRight:insets.right}]}><Text style={s.loadingMark}>Q</Text><Text style={s.loadingText}>QuickReview</Text></View></View>;
 let screen:React.ReactNode;
 if(tab==='Home')screen=<HomeScreen decks={decks} reviews={reviews} schedulingEnabled={settings.schedulingEnabled} onStudy={id=>{setSelectedId(id);setTab('Study');setStudyMode('learn')}} onDecks={()=>setTab('Decks')} onLibrary={()=>setTab('Library')}/>;
 else if(tab==='Decks')screen=<Decks decks={decks} setDecks={legacySetDecks} nav={nav}/>;
 else if(tab==='Study'&&selected)screen=studyMode==='learn'?<LearningScreen deck={selected} onPractice={()=>setStudyMode('practice')}/>:<StudyScreen deck={selected} defaultSessionSize={settings.defaultSessionSize} onAdd={addCard} onStartSession={makeSession} onGrade={grade}/>;
 else if(tab==='Library')screen=<LibraryScreen decks={decks} onToggleSuspend={toggleSuspend} onDelete={deleteCard} onUpdate={updateCard} onImportCards={importCards} onCreateDeckAndImport={createDeckAndImport}/>;
 else screen=<SettingsScreen settings={settings} onChange={saveSettings}/>;
 return <View style={s.safe}><StatusBar barStyle="dark-content" backgroundColor={T.colors.bg}/><View style={[s.app,{paddingTop:insets.top,paddingLeft:insets.left,paddingRight:insets.right}]}>{screen}</View><View style={[s.nav,{paddingBottom:Math.max(8,insets.bottom),paddingLeft:insets.left+10,paddingRight:insets.right+10}]}>{(['Home','Decks','Study','Library','Settings'] as Tab[]).map((x,i)=>{const active=x===tab;return <Pressable key={x} onPress={()=>{setTab(x);if(x==='Study')setStudyMode('learn')}} accessibilityRole="tab" accessibilityState={{selected:active}} style={({pressed})=>[s.navItem,pressed&&s.pressed]}><Text style={[s.navIndex,active&&s.navActive]}>{String(i+1).padStart(2,'0')}</Text><Text style={[s.navLabel,active&&s.navActive]}>{x}</Text><View style={[s.navRule,active&&s.navRuleActive]}/></Pressable>})}</View></View>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:T.colors.bg},app:{flex:1},loading:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:T.colors.bg},loadingMark:{fontSize:42,fontWeight:'900',color:T.colors.accent},loadingText:{fontSize:12,fontWeight:'800',color:T.colors.muted,marginTop:8},nav:{minHeight:68,borderTopWidth:1,borderTopColor:T.colors.line,backgroundColor:T.colors.surface,flexDirection:'row',paddingTop:10},navItem:{flex:1,alignItems:'center',justifyContent:'flex-start',paddingHorizontal:2},navIndex:{fontSize:8,fontWeight:'900',letterSpacing:1,color:T.colors.faint,marginBottom:4},navLabel:{fontSize:9,fontWeight:'800',color:T.colors.muted},navActive:{color:T.colors.accent},navRule:{height:2,width:22,backgroundColor:'transparent',marginTop:7},navRuleActive:{backgroundColor:T.colors.accent},pressed:{opacity:.58}});