import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Deck } from '../domain/models';
import { theme as T } from './theme';

const s=StyleSheet.create({
  header:{marginBottom:26},
  title:{fontSize:30,fontWeight:'900',letterSpacing:-1.2,color:T.colors.ink},
  subtitle:{fontSize:13,color:T.colors.muted,marginTop:7,lineHeight:19},
  button:{minHeight:52,borderRadius:15,backgroundColor:T.colors.accent,paddingHorizontal:17,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  secondary:{backgroundColor:T.colors.surface,borderWidth:1,borderColor:T.colors.line},
  buttonText:{fontSize:13,fontWeight:'900',color:'#FFF'},
  secondaryText:{color:T.colors.ink},
  arrow:{fontSize:21,color:'#FFF'},
  pressed:{opacity:.68,transform:[{scale:.985}]},
  deck:{backgroundColor:T.colors.surface,borderWidth:1,borderColor:T.colors.line,borderRadius:18,paddingVertical:16,paddingHorizontal:15,marginBottom:10,flexDirection:'row',alignItems:'center'},
  mark:{width:4,height:48,borderRadius:3,marginRight:14},
  deckBody:{flex:1},
  row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  deckName:{fontSize:15,fontWeight:'900',color:T.colors.ink,flexShrink:1},
  due:{fontSize:9,fontWeight:'900',color:T.colors.accent,marginLeft:8},
  deckSub:{fontSize:11,color:T.colors.muted,marginTop:4},
  metaRow:{flexDirection:'row',alignItems:'center',marginTop:9},
  meta:{fontSize:9,color:T.colors.faint},
  dot:{width:3,height:3,borderRadius:2,backgroundColor:T.colors.faint,marginHorizontal:7},
  chevron:{fontSize:24,color:T.colors.faint,marginLeft:10},
  label:{fontSize:9,fontWeight:'900',letterSpacing:1.2,color:T.colors.muted,marginTop:16,marginBottom:8},
  field:{minHeight:52,borderWidth:1,borderColor:T.colors.line,borderRadius:13,backgroundColor:T.colors.surface,paddingHorizontal:14,color:T.colors.ink,fontSize:14},
  area:{minHeight:110,paddingTop:14,textAlignVertical:'top'}
});

export function Button({label,onPress,secondary=false}:{label:string;onPress?:()=>void;secondary?:boolean}){return <Pressable accessibilityRole="button" onPress={onPress} style={({pressed})=>[s.button,secondary&&s.secondary,pressed&&s.pressed]}><Text style={[s.buttonText,secondary&&s.secondaryText]}>{label}</Text>{!secondary&&<Text style={s.arrow}>→</Text>}</Pressable>}
export function Header({title,subtitle}:{title:string;subtitle?:string}){return <View style={s.header}><Text style={s.title}>{title}</Text>{subtitle&&<Text style={s.subtitle}>{subtitle}</Text>}</View>}
export function DeckRow({deck,onPress}:{deck:Deck;onPress:()=>void}){const active=deck.cards.filter(c=>!c.suspended).length;return <Pressable accessibilityRole="button" onPress={onPress} style={({pressed})=>[s.deck,pressed&&s.pressed]}><View style={[s.mark,{backgroundColor:deck.accent}]}/><View style={s.deckBody}><View style={s.row}><Text style={s.deckName} numberOfLines={1}>{deck.name}</Text><Text style={s.due}>{active} active</Text></View><Text style={s.deckSub}>{deck.subject}</Text><View style={s.metaRow}><Text style={s.meta}>{deck.cards.length} total</Text><Text style={s.dot}/><Text style={s.meta}>{deck.cards.length-active} suspended</Text></View></View><Text style={s.chevron}>›</Text></Pressable>}
export function Field({label,value,onChangeText,placeholder,multiline=false}:{label:string;value:string;onChangeText:(v:string)=>void;placeholder:string;multiline?:boolean}){return <View><Text style={s.label}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={T.colors.faint} multiline={multiline} style={[s.field,multiline&&s.area]}/></View>}
export const styles=s;
