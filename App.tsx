import React,{useMemo,useState} from 'react';
import {SafeAreaView,StatusBar,StyleSheet,Text,Pressable,View} from 'react-native';
import {Card} from './src/domain/models';
import {LocalRepository} from './src/data/QuickReviewRepository';
import {useQuickReview} from './src/application/QuickReviewStore';
import {Home,Decks,Study,Library,Settings} from './src/presentation/screens';
import {theme as T} from './src/presentation/theme';

type Tab='Home'|'Decks'|'Study'|'Library'|'Settings';
const repo=new LocalRepository();

export default function App(){
 const [tab,setTab]=useState<Tab>('Home');
 const [selectedId,setSelectedId]=useState('biology');
 const {decks,loaded,createDeck,createCard,grade,makeSession}=useQuickReview(repo);
 const selected=useMemo(()=>decks.find(d=>d.id===selectedId)||decks[0],[decks,selectedId]);
 const nav={go:setTab,select:setSelectedId};
 const addCard=async(card:Card)=>{await createCard(card.deckId,card.front,card.back,card.type,card.tags);};
 if(!loaded)return <SafeAreaView style={s.safe}><View style={s.loading}><Text style={s.loadingMark}>Q</Text><Text style={s.loadingText}>QuickReview</Text></View></SafeAreaView>;
 const screen=tab==='Home'?<Home decks={decks} nav={nav}/>:tab==='Decks'?<Decks decks={decks} onCreate={createDeck} nav={nav}/>:tab==='Study'&&selected?<Study deck={selected} onAdd={addCard} onStartSession={makeSession} onGrade={grade}/>:tab==='Library'?<Library/>:<Settings/>;
 return <SafeAreaView style={s.safe}><StatusBar barStyle="dark-content" backgroundColor={T.colors.bg}/><View style={s.app}>{screen}</View><View style={s.nav}>{(['Home','Decks','Study','Library','Settings'] as Tab[]).map(x=>{const active=x===tab;return <Pressable key={x} onPress={()=>setTab(x)} accessibilityRole="tab" accessibilityState={{selected:active}} style={s.navItem}><View style={[s.navIcon,active&&s.navIconActive]}><Text style={[s.navGlyph,active&&s.navActive]}>{({Home:'⌂',Decks:'▤',Study:'◆',Library:'□',Settings:'⚙'} as Record<Tab,string>)[x]}</Text></View><Text style={[s.navLabel,active&&s.navActive]}>{x}</Text></Pressable>})}</View></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:T.colors.bg},app:{flex:1},loading:{flex:1,alignItems:'center',justifyContent:'center'},loadingMark:{fontSize:42,fontWeight:'800',color:T.colors.accent},loadingText:{fontSize:12,color:T.colors.muted,marginTop:8},nav:{height:76,borderTopWidth:1,borderTopColor:T.colors.line,backgroundColor:'#FFF',flexDirection:'row',paddingTop:7},navItem:{flex:1,alignItems:'center'},navIcon:{width:42,height:30,borderRadius:12,alignItems:'center',justifyContent:'center'},navIconActive:{backgroundColor:T.colors.accentSoft},navGlyph:{fontSize:17,color:T.colors.muted},navLabel:{fontSize:9,fontWeight:'700',color:T.colors.muted,marginTop:3},navActive:{color:T.colors.accent,fontWeight:'800'}});
