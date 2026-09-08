import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

type ScalePressProps=Omit<PressableProps,'children'|'style'>&{children?:React.ReactNode;style?:StyleProp<ViewStyle>};

export function FadeIn({children,delay=0,style}:{children:React.ReactNode;delay?:number;style?:StyleProp<ViewStyle>}){
 const opacity=useRef(new Animated.Value(0)).current;const translate=useRef(new Animated.Value(10)).current;
 useEffect(()=>{Animated.parallel([
  Animated.timing(opacity,{toValue:1,duration:220,delay,easing:Easing.out(Easing.cubic),useNativeDriver:true}),
  Animated.timing(translate,{toValue:0,duration:280,delay,easing:Easing.out(Easing.cubic),useNativeDriver:true}),
 ]).start()},[delay,opacity,translate]);
 return <Animated.View style={[style,{opacity,transform:[{translateY:translate}]}]}>{children}</Animated.View>
}

export function LiftIn({children,delay=0,style}:{children:React.ReactNode;delay?:number;style?:StyleProp<ViewStyle>}){
 const opacity=useRef(new Animated.Value(0)).current;const scale=useRef(new Animated.Value(.985)).current;
 useEffect(()=>{Animated.parallel([
  Animated.timing(opacity,{toValue:1,duration:180,delay,useNativeDriver:true}),
  Animated.spring(scale,{toValue:1,delay,speed:20,bounciness:4,useNativeDriver:true}),
 ]).start()},[delay,opacity,scale]);
 return <Animated.View style={[style,{opacity,transform:[{scale}]}]}>{children}</Animated.View>
}

export function ScalePress({children,style,...props}:ScalePressProps){
 const scale=useRef(new Animated.Value(1)).current;
 const animate=(toValue:number)=>Animated.spring(scale,{toValue,useNativeDriver:true,speed:28,bounciness:4}).start();
 return <Pressable {...props} onPressIn={e=>{animate(.975);props.onPressIn?.(e)}} onPressOut={e=>{animate(1);props.onPressOut?.(e)}}><Animated.View style={[style,{transform:[{scale}]}]}>{children}</Animated.View></Pressable>
}
