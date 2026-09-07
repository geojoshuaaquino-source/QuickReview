import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppSettings } from '../domain/models';
import { Header } from './components';
import { theme as T } from './theme';

type Props={settings:AppSettings;onChange:(next:AppSettings)=>Promise<void>};
const sizes=[5,10,20,30];

export function SettingsScreen({settings,onChange}:Props){
 const set=(patch:Partial<AppSettings>)=>onChange({...settings,...patch});
 return <ScrollView contentContainerStyle={s.scroll}><Header title="Settings" subtitle="Tune how QuickReview behaves."/>
  <Text style={s.label}>STUDY</Text>
  <View style={s.card}><View style={s.row}><View style={s.copy}><Text style={s.title}>Spaced repetition</Text><Text style={s.hint}>{settings.schedulingEnabled?'Reviews are scheduled automatically.':'Cards stay available until you turn scheduling on.'}</Text></View><Pressable accessibilityRole="switch" accessibilityState={{checked:settings.schedulingEnabled}} onPress={()=>set({schedulingEnabled:!settings.schedulingEnabled})} style={[s.switch,settings.schedulingEnabled&&s.switchOn]}><View style={[s.knob,settings.schedulingEnabled&&s.knobOn]}/></Pressable></View>
   <View style={s.divider}/><Text style={s.subLabel}>DEFAULT SESSION SIZE</Text><View style={s.sizeRow}>{sizes.map(n=><Pressable key={n} onPress={()=>set({defaultSessionSize:n})} style={[s.size,settings.defaultSessionSize===n&&s.sizeActive]}><Text style={[s.sizeText,settings.defaultSessionSize===n&&s.sizeTextActive]}>{n}</Text></Pressable>)}</View>
  </View>
  <Text style={s.label}>OTHER</Text>
  <View style={s.card}><View style={s.row}><View style={s.copy}><Text style={s.title}>Study gestures</Text><Text style={s.hint}>Touch gestures remain enabled.</Text></View><Text style={s.value}>ON</Text></View><View style={s.divider}/><View style={s.row}><View style={s.copy}><Text style={s.title}>Theme</Text><Text style={s.hint}>System appearance is used for now.</Text></View><Text style={s.value}>SYSTEM</Text></View></View>
  <View style={s.local}><Text style={s.localTitle}>LOCAL STORAGE</Text><Text style={s.localText}>Your decks, reviews, and preferences stay on this device.</Text></View>
 </ScrollView>;
}

const s=StyleSheet.create({scroll:{padding:20,paddingBottom:40},label:{fontSize:9,fontWeight:'900',letterSpacing:1.5,color:T.colors.faint,marginBottom:8,marginTop:4},card:{backgroundColor:T.colors.surface,borderWidth:1,borderColor:T.colors.line,borderRadius:20,padding:17,marginBottom:22},row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',minHeight:48},copy:{flex:1,paddingRight:15},title:{fontSize:14,fontWeight:'800',color:T.colors.ink},hint:{fontSize:11,color:T.colors.muted,marginTop:4,lineHeight:16},divider:{height:1,backgroundColor:T.colors.line,marginVertical:15},switch:{width:48,height:28,borderRadius:15,backgroundColor:'#D8D5D1',padding:3,justifyContent:'center'},switchOn:{backgroundColor:T.colors.accent},knob:{width:22,height:22,borderRadius:11,backgroundColor:'#FFF'},knobOn:{alignSelf:'flex-end'},subLabel:{fontSize:9,fontWeight:'900',letterSpacing:1.2,color:T.colors.faint,marginBottom:9},sizeRow:{flexDirection:'row',gap:8},size:{flex:1,height:42,borderRadius:12,borderWidth:1,borderColor:T.colors.line,alignItems:'center',justifyContent:'center'},sizeActive:{backgroundColor:T.colors.ink,borderColor:T.colors.ink},sizeText:{fontSize:12,fontWeight:'800',color:T.colors.ink},sizeTextActive:{color:'#FFF'},value:{fontSize:9,fontWeight:'900',letterSpacing:1,color:T.colors.accent},local:{borderRadius:18,backgroundColor:T.colors.accentSoft,padding:16},localTitle:{fontSize:9,fontWeight:'900',letterSpacing:1.3,color:T.colors.accent},localText:{fontSize:11,color:T.colors.ink,marginTop:5,lineHeight:17}});
