import React,{useEffect,useMemo,useState} from 'react';
import {SafeAreaView,StatusBar,StyleSheet,Text,Pressable,View} from 'react-native';
import {Deck,Card} from './src/domain/models';
import {MemoryRepository} from './src/data/QuickReviewRepository';
import {QuickReviewService} from './src/application/QuickReviewService';
import {Home,Decks,Study,Library,Settings} from './src/presentation/screens';
import {theme as T} from './src/presentation/theme';

type Tab='Home'|'Decks'|'Study'|'Library'|'Settings';
const repo=new MemoryRepository();
const service=new QuickReviewService(repo);

export default function App(){
 const [tab,setTab]=useState<Tab>('Home'); const [decks,setDecks]=useState<Deck[]>([]); const [selectedId,setSelectedId]=useState('biology');
 const refresh=async()=>setDecks(await service.listDecks());
 useEffect(()=>{refresh()},[]);
 const selected=useMemo(()=>decks.find(d=>d.id===selectedId)||decks[0],[decks,selectedId]);
 const nav={go:setTab,select:setSelectedId};
 const addCard=async(card:Card)=>{await repo.saveCard(card);await refresh()};
 const screen=tab==='Home'?<Home decks={decks} nav={nav}/>:tab==='Decks'?<Decks decks={decks} setDecks={async updater=>{const next=typeof updater==='function'?updater(decks):updater;for(const d of next)await repo.saveDeck(d);await refresh()} as React.Dispatch<React.SetStateAction<Deck[]>>} nav={nav}/>:tab==='Study'&&selected?<Study deck={selected} onAdd={addCard}/>:tab==='Library'?<Library/>:<Settings/>;
 return <SafeAreaView style={s.safe}><StatusBar barStyle="dark-content" backgroundColor={T.colors.bg}/><View style={s.app}>{screen}</View><View style={s.nav}>{(['Home','Decks','Study','Library','Settings'] as Tab[]).map(x=>{const active=x===tab;return <Pressable key={x} onPress={()=>setTab(x)} accessibilityRole="tab" accessibilityState={{selected:active}} style={s.navItem}><View style={[s.navIcon,active&&s.navIconActive]}><Text style={[s.navGlyph,active&&s.navActive]}>{({Home:'⌂',Decks:'▤',Study:'◆',Library:'□',Settings:'⚙'} as Record<Tab,string>)[x]}</Text></View><Text style={[s.navLabel,active&&s.navActive]}>{x}</Text></Pressable>})}</View></SafeAreaView>
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:T.colors.bg},app:{flex:1},nav:{height:76,borderTopWidth:1,borderTopColor:T.colors.line,backgroundColor:'#FFF',flexDirection:'row',paddingTop:7},navItem:{flex:1,alignItems:'center'},navIcon:{width:42,height:30,borderRadius:12,alignItems:'center',justifyContent:'center'},navIconActive:{backgroundColor:T.colors.accentSoft},navGlyph:{fontSize:17,color:T.colors.muted},navLabel:{fontSize:9,fontWeight:'700',color:T.colors.muted,marginTop:3},navActive:{color:T.colors.accent,fontWeight:'800'}});
