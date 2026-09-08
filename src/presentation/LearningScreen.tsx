import React,{useMemo,useState} from 'react';
import {Image,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {CardType,Deck} from '../domain/models';
import {Button} from './components';
import {theme as T} from './theme';
import {FadeIn} from './motion';

const labels:Record<CardType,string>={basic:'Basic',reversed:'Reversed',cloze:'Cloze',multipleChoice:'Multiple choice',trueFalse:'True / False',typedAnswer:'Typed answer',image:'Image',imageOcclusion:'Image occlusion'};
const clozeText=(text:string)=>text.replace(/\{\{\s*([^{}]+?)\s*\}\}/g,'$1');

type Props={deck:Deck;onPractice:()=>void;onHome?:()=>void};

export function LearningScreen({deck,onPractice,onHome}:Props){
 const cards=useMemo(()=>deck.cards.filter(c=>!c.suspended),[deck]);
 const [index,setIndex]=useState(0);
 const [revealed,setRevealed]=useState(false);
 const current=cards[index];
 const accent=deck.accent||T.colors.accent;

 if(!current)return <View style={s.empty}><View style={s.emptyTop}><Pressable accessibilityRole="button" onPress={onHome} hitSlop={10} style={s.backButton}><Text style={s.backArrow}>←</Text><Text style={s.backText}>Home</Text></Pressable></View><Text style={s.kicker}>LEARN</Text><Text style={s.title}>{deck.name}</Text><Text style={s.emptyText}>Add cards to this deck to build a lesson.</Text><Button label="Go to practice" secondary onPress={onPractice}/></View>;

 const prompt=current.type==='reversed'?current.back:current.front;
 const answer=current.type==='reversed'?current.front:current.back;
 const percent=Math.round(((index+1)/cards.length)*100);
 const isLast=index===cards.length-1;
 const next=()=>{setIndex(v=>Math.min(cards.length-1,v+1));setRevealed(false)};
 const previous=()=>{setIndex(v=>Math.max(0,v-1));setRevealed(false)};
 const reveal=()=>setRevealed(true);

 return <View style={s.root}>
  <View style={s.header}>
   <View style={s.headerLeft}>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to home" onPress={onHome} hitSlop={10} style={s.homeButton}><Text style={s.homeArrow}>←</Text><Text style={s.homeText}>Home</Text></Pressable>
    <Text style={[s.deck,{color:accent}]}>{deck.name.toUpperCase()}</Text>
    <Text style={s.heading}>Learn the material</Text>
   </View>
   <Pressable accessibilityRole="button" onPress={onPractice} style={s.practiceLink} hitSlop={6}><Text style={s.practiceText}>Practice</Text><Text style={[s.practiceArrow,{color:accent}]}>→</Text></Pressable>
  </View>

  <View style={s.progressBlock}>
   <View style={s.progressMeta}><Text style={s.progressLabel}>LESSON {String(index+1).padStart(2,'0')} / {String(cards.length).padStart(2,'0')}</Text><Text style={s.progressPercent}>{percent}%</Text></View>
   <View style={s.track}><View style={[s.fill,{width:`${percent}%`,backgroundColor:accent}]}/></View>
  </View>

  <FadeIn key={`${current.id}-${revealed?'answer':'prompt'}`}>
   <View style={s.material}>
    <View style={[s.materialRail,{backgroundColor:accent}]} />
    <View style={s.materialInner}>
     <View style={s.materialTop}>
      <View><Text style={s.type}>{revealed?'EXPLANATION':labels[current.type].toUpperCase()}</Text><Text style={s.phase}>{revealed?'UNDERSTAND':'RECALL'}</Text></View>
      <Text style={s.lessonNumber}>{String(index+1).padStart(2,'0')}</Text>
     </View>

     {(current.type==='image'||current.type==='imageOcclusion')&&current.imageUri?<Image source={{uri:current.imageUri}} resizeMode="contain" style={s.image}/>:null}

     <Text style={s.prompt}>{current.type==='cloze'?clozeText(prompt):prompt}</Text>

     {!revealed?<>
       <View style={s.recallBlock}>
        <Text style={s.recallLabel}>BEFORE YOU REVEAL</Text>
        <Text style={s.instruction}>Say the answer in your own words. Retrieval first makes the explanation stick.</Text>
       </View>
       <Pressable accessibilityRole="button" onPress={reveal} style={[s.revealButton,{backgroundColor:accent}]}>
        <View><Text style={s.revealTitle}>Reveal explanation</Text><Text style={s.revealMeta}>Show the answer</Text></View>
        <Text style={s.revealArrow}>→</Text>
       </Pressable>
     </>:<View style={[s.answerBlock,{borderTopColor:accent}]}> 
       <View style={s.answerHeader}><Text style={[s.answerLabel,{color:accent}]}>WHAT IT MEANS</Text><Text style={s.answerCheck}>REVEALED</Text></View>
       <Text style={s.answer}>{answer}</Text>
       {current.examples.length>0&&<View style={s.examples}><Text style={s.examplesLabel}>EXAMPLES</Text>{current.examples.map((x,i)=><View key={`${x}-${i}`} style={s.example}><Text style={[s.exampleIndex,{color:accent}]}>{String(i+1).padStart(2,'0')}</Text><Text style={s.exampleText}>{x}</Text></View>)}</View>}
     </View>}
    </View>
   </View>
  </FadeIn>

  <View style={s.controls}>
   <Pressable accessibilityRole="button" disabled={index===0} onPress={previous} style={[s.previous,index===0&&s.controlDisabled]}><Text style={s.previousArrow}>←</Text><Text style={s.previousText}>Previous</Text></Pressable>
   <Text style={s.controlStatus}>{revealed?'ANSWER SHOWN':'RECALL FIRST'}</Text>
   <Pressable accessibilityRole="button" disabled={isLast} onPress={next} style={[s.next,isLast&&s.nextDisabled,{backgroundColor:isLast?T.colors.surface2:T.colors.ink,borderColor:isLast?T.colors.line:T.colors.ink}]}><Text style={[s.nextText,isLast&&s.nextDisabledText]}>{isLast?'Last lesson':'Next lesson'}</Text><Text style={[s.nextArrow,isLast&&s.nextDisabledText]}>→</Text></Pressable>
  </View>
 </View>;
}

const s=StyleSheet.create({
 root:{flex:1,paddingHorizontal:20,paddingTop:16,paddingBottom:14},
 header:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18},
 headerLeft:{flex:1,paddingRight:12},
 homeButton:{flexDirection:'row',alignItems:'center',minHeight:34,alignSelf:'flex-start',marginBottom:10},
 homeArrow:{fontSize:15,color:T.colors.muted,marginRight:6},
 homeText:{fontSize:10,fontWeight:'900',color:T.colors.muted},
 deck:{fontSize:9,fontWeight:'900',letterSpacing:1.5},
 heading:{fontSize:27,lineHeight:31,fontWeight:'900',letterSpacing:-1.2,color:T.colors.ink,marginTop:4},
 practiceLink:{flexDirection:'row',alignItems:'center',paddingTop:3,minHeight:42},
 practiceText:{fontSize:11,fontWeight:'900',color:T.colors.ink},
 practiceArrow:{fontSize:16,fontWeight:'900',marginLeft:5},
 progressBlock:{marginBottom:14},
 progressMeta:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
 progressLabel:{fontSize:9,fontWeight:'900',letterSpacing:1.25,color:T.colors.muted},
 progressPercent:{fontSize:12,fontWeight:'900',color:T.colors.ink},
 track:{height:5,backgroundColor:T.colors.surface2,marginTop:8,overflow:'hidden'},
 fill:{height:5},
 material:{backgroundColor:T.colors.surface,borderWidth:1,borderColor:T.colors.line,borderRadius:T.radius.lg,overflow:'hidden',flexShrink:1},
 materialRail:{position:'absolute',left:0,top:0,bottom:0,width:5},
 materialInner:{padding:19,paddingLeft:23},
 materialTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:22},
 type:{fontSize:8,fontWeight:'900',letterSpacing:1.5,color:T.colors.faint},
 phase:{fontSize:10,fontWeight:'900',letterSpacing:1.2,color:T.colors.ink,marginTop:5},
 lessonNumber:{fontSize:40,lineHeight:40,fontWeight:'900',letterSpacing:-2.5,color:T.colors.surface2},
 image:{width:'100%',height:150,marginBottom:18,borderRadius:T.radius.sm},
 prompt:{fontSize:25,lineHeight:32,fontWeight:'900',letterSpacing:-.5,color:T.colors.ink},
 recallBlock:{marginTop:23,borderTopWidth:1,borderTopColor:T.colors.line,paddingTop:15,marginBottom:14},
 recallLabel:{fontSize:8,fontWeight:'900',letterSpacing:1.25,color:T.colors.faint},
 instruction:{fontSize:12,lineHeight:18,color:T.colors.muted,marginTop:6,maxWidth:360},
 revealButton:{minHeight:62,borderRadius:T.radius.md,paddingHorizontal:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
 revealTitle:{fontSize:13,fontWeight:'900',color:T.colors.accentInk},
 revealMeta:{fontSize:9,color:T.colors.accentInk,opacity:.72,marginTop:2},
 revealArrow:{fontSize:21,fontWeight:'900',color:T.colors.accentInk},
 answerBlock:{marginTop:22,borderTopWidth:2,paddingTop:15},
 answerHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
 answerLabel:{fontSize:8,fontWeight:'900',letterSpacing:1.3},
 answerCheck:{fontSize:8,fontWeight:'900',letterSpacing:1.1,color:T.colors.faint},
 answer:{fontSize:16,lineHeight:25,color:T.colors.ink,marginTop:9},
 examples:{marginTop:18,borderTopWidth:1,borderTopColor:T.colors.line,paddingTop:13},
 examplesLabel:{fontSize:8,fontWeight:'900',letterSpacing:1.3,color:T.colors.faint,marginBottom:3},
 example:{flexDirection:'row',marginTop:9},
 exampleIndex:{width:29,fontSize:9,fontWeight:'900'},
 exampleText:{flex:1,fontSize:12,lineHeight:19,color:T.colors.muted},
 controls:{flexDirection:'row',alignItems:'center',marginTop:10,minHeight:48},
 previous:{flexDirection:'row',alignItems:'center',minHeight:48,minWidth:110},
 previousArrow:{fontSize:18,color:T.colors.ink,marginRight:7},
 previousText:{fontSize:11,fontWeight:'900',color:T.colors.ink},
 controlDisabled:{opacity:.25},
 controlStatus:{flex:1,textAlign:'center',fontSize:8,fontWeight:'900',letterSpacing:1.2,color:T.colors.faint},
 next:{minHeight:48,paddingHorizontal:15,borderWidth:1,borderRadius:T.radius.md,flexDirection:'row',alignItems:'center',justifyContent:'center'},
 nextText:{fontSize:11,fontWeight:'900',color:T.colors.white},
 nextArrow:{fontSize:17,fontWeight:'900',color:T.colors.white,marginLeft:8},
 nextDisabled:{opacity:.5},
 nextDisabledText:{color:T.colors.muted},
 empty:{flex:1,padding:24,justifyContent:'center'},
 emptyTop:{marginBottom:10},
 backButton:{flexDirection:'row',alignItems:'center',minHeight:40},
 backArrow:{fontSize:18,color:T.colors.muted,marginRight:7},
 backText:{fontSize:11,fontWeight:'900',color:T.colors.muted},
 kicker:{fontSize:9,fontWeight:'900',letterSpacing:1.6,color:T.colors.accentInk},
 title:{fontSize:30,fontWeight:'900',color:T.colors.ink,marginTop:6},
 emptyText:{fontSize:12,lineHeight:19,color:T.colors.muted,marginVertical:12}
});
