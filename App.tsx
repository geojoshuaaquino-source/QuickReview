import React, { useMemo, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, Pressable, View } from 'react-native';
import { Deck, Card } from './src/domain/models';
import { LocalRepository } from './src/data/QuickReviewRepository';
import { useQuickReview } from './src/application/QuickReviewStore';
import { Decks } from './src/presentation/screens';
import { HomeScreen } from './src/presentation/HomeScreen';
import { StudyScreen } from './src/presentation/StudyScreen';
import { LibraryScreen } from './src/presentation/LibraryScreen';
import { SettingsScreen } from './src/presentation/SettingsScreen';
import { theme as T } from './src/presentation/theme';

type Tab='Home'|'Decks'|'Study'|'Library'|'Settings';
const repo=new LocalRepository();

export default function App(){
 const [tab,setTab]=useState<Tab>('Home');
 const [selectedId,setSelectedId]=useState('biology');
 const {decks,reviews,settings,loaded,createCard,updateCard,grade,makeSession,refresh,deleteCard,toggleSuspend,saveSettings}=useQuickReview(repo);
 const selected=useMemo(()=>decks.find(d=>d.id===selectedId)||decks[0],[decks,selectedId]);
 const nav={go:setTab,select:setSelectedId};
 const addCard=async(card:Card)=>{await createCard(card.deckId,card.front,card.back,card.type,card.tags)};
 const legacySetDecks:React.Dispatch<React.SetStateAction<Deck[]>>=updater=>{const next=typeof updater==='function'?updater(decks):updater;Promise.all(next.map(deck=>repo.saveDeck(deck))).then(refresh).catch(()=>undefined)};
 if(!loaded)return <SafeAreaView style={s.safe}><View style={s.loading}><Text style={s.loadingMark}>Q</Text><Text style={s.loadingText}>QuickReview</Text></View></SafeAreaView>;
 let screen:React.ReactNode;
 if(tab==='Home')screen=<HomeScreen decks={decks} reviews={reviews} schedulingEnabled={settings.schedulingEnabled} onStudy={id=>{setSelectedId(id);setTab('Study')}} onDecks={()=>setTab('Decks')} onLibrary={()=>setTab('Library')}/>;
 else if(tab==='Decks')screen=<Decks decks={decks} setDecks={legacySetDecks} nav={nav}/>;
 else if(tab==='Study'&&selected)screen=<StudyScreen deck={selected} defaultSessionSize={settings.defaultSessionSize} onAdd={addCard} onStartSession={makeSession} onGrade={grade}/>;
 else if(tab==='Library')screen=<LibraryScreen decks={decks} onToggleSuspend={toggleSuspend} onDelete={deleteCard} onUpdate={updateCard}/>;
 else screen=<SettingsScreen settings={settings} onChange={saveSettings}/>;
 return <SafeAreaView style={s.safe}><StatusBar barStyle="dark-content" backgroundColor={T.colors.bg}/><View style={s.app}>{screen}</View><View style={s.nav}>{(['Home','Decks','Study','Library','Settings'] as Tab[]).map(x=>{const active=x===tab;return <Pressable key={x} onPress={()=>setTab(x)} accessibilityRole="tab" accessibilityState={{selected:active}} style={s.navItem}><View style={[s.navIcon,active&&s.navIconActive]}><Text style={[s.navGlyph,active&&s.navActive]}>{({Home:'⌂',Decks:'▤',Study:'◆',Library:'□',Settings:'⚙'} as Record<Tab,string>)[x]}</Text></View><Text style={[s.navLabel,active&&s.navActive]}>{x}</Text></Pressable>})}</View></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:T.colors.bg},app:{flex:1},loading:{flex:1,alignItems:'center',justifyContent:'center'},loadingMark:{fontSize:42,fontWeight:'800',color:T.colors.accent},loadingText:{fontSize:12,color:T.colors.muted,marginTop:8},nav:{height:76,borderTopWidth:1,borderTopColor:T.colors.line,backgroundColor:'#FFF',flexDirection:'row',paddingTop:7},navItem:{flex:1,alignItems:'center'},navIcon:{width:42,height:30,borderRadius:12,alignItems:'center',justifyContent:'center'},navIconActive:{backgroundColor:T.colors.accentSoft},navGlyph:{fontSize:17,color:T.colors.muted},navLabel:{fontSize:9,fontWeight:'700',color:T.colors.muted,marginTop:3},navActive:{color:T.colors.accent,fontWeight:'800'}});