import React,{useEffect,useRef,useState} from 'react';
import {AccessibilityInfo,Animated,Easing,Pressable,PressableProps,StyleProp,ViewStyle} from 'react-native';

type MotionProps={children:React.ReactNode;delay?:number;style?:StyleProp<ViewStyle>};
type ScalePressProps=Omit<PressableProps,'children'|'style'>&{children?:React.ReactNode;style?:StyleProp<ViewStyle>};

export function useReducedMotion(){
 const [reduced,setReduced]=useState(false);
 useEffect(()=>{let mounted=true;AccessibilityInfo.isReduceMotionEnabled().then(v=>{if(mounted)setReduced(v)});const sub=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduced);return()=>{mounted=false;sub.remove()}},[]);
 return reduced;
}

export function FadeIn({children,delay=0,style}:MotionProps){
 const reduced=useReducedMotion();
 const opacity=useRef(new Animated.Value(reduced?1:0)).current;const translate=useRef(new Animated.Value(reduced?0:10)).current;
 useEffect(()=>{if(reduced){opacity.setValue(1);translate.setValue(0);return}Animated.parallel([
  Animated.timing(opacity,{toValue:1,duration:180,delay,easing:Easing.out(Easing.cubic),useNativeDriver:true}),
  Animated.timing(translate,{toValue:0,duration:240,delay,easing:Easing.out(Easing.cubic),useNativeDriver:true}),
 ]).start()},[delay,opacity,translate,reduced]);
 return <Animated.View style={[style,{opacity,transform:[{translateY:translate}]}]}>{children}</Animated.View>
}

export function LiftIn({children,delay=0,style}:MotionProps){
 const reduced=useReducedMotion();
 const opacity=useRef(new Animated.Value(reduced?1:0)).current;const scale=useRef(new Animated.Value(reduced?1:.985)).current;
 useEffect(()=>{if(reduced){opacity.setValue(1);scale.setValue(1);return}Animated.parallel([
  Animated.timing(opacity,{toValue:1,duration:160,delay,useNativeDriver:true}),
  Animated.spring(scale,{toValue:1,delay,speed:22,bounciness:3,useNativeDriver:true}),
 ]).start()},[delay,opacity,scale,reduced]);
 return <Animated.View style={[style,{opacity,transform:[{scale}]}]}>{children}</Animated.View>
}

export function ScalePress({children,style,...props}:ScalePressProps){
 const reduced=useReducedMotion();
 const scale=useRef(new Animated.Value(1)).current;
 const animate=(toValue:number)=>{if(reduced)return;Animated.spring(scale,{toValue,useNativeDriver:true,speed:30,bounciness:2}).start()};
 return <Pressable {...props} onPressIn={e=>{animate(.975);props.onPressIn?.(e)}} onPressOut={e=>{animate(1);props.onPressOut?.(e)}}><Animated.View style={[style,{transform:[{scale}]}]}>{children}</Animated.View></Pressable>
}

export function Reveal({visible,children,style}:{visible:boolean;children:React.ReactNode;style?:StyleProp<ViewStyle>}){
 const reduced=useReducedMotion();const opacity=useRef(new Animated.Value(visible||reduced?1:0)).current;const y=useRef(new Animated.Value(visible||reduced?0:8)).current;
 useEffect(()=>{if(reduced){opacity.setValue(visible?1:0);y.setValue(0);return}Animated.parallel([
  Animated.timing(opacity,{toValue:visible?1:0,duration:170,easing:Easing.out(Easing.cubic),useNativeDriver:true}),
  Animated.timing(y,{toValue:visible?0:8,duration:210,easing:Easing.out(Easing.cubic),useNativeDriver:true}),
 ]).start()},[reduced,visible,opacity,y]);
 return <Animated.View style={[style,{opacity,transform:[{translateY:y}]}]}>{children}</Animated.View>
}
