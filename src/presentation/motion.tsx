import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

type ScalePressProps = Omit<PressableProps, 'children' | 'style'> & {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function FadeIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(8)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, delay, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 260, delay, useNativeDriver: true }),
    ]).start();
  }, [delay, opacity, translate]);
  return <Animated.View style={[style, { opacity, transform: [{ translateY: translate }] }]}>{children}</Animated.View>;
}

export function ScalePress({ children, style, ...props }: ScalePressProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (toValue: number) => Animated.spring(scale, { toValue, useNativeDriver: true, speed: 24, bounciness: 5 }).start();
  return <Pressable {...props} onPressIn={e => { animate(.97); props.onPressIn?.(e); }} onPressOut={e => { animate(1); props.onPressOut?.(e); }}>
    <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
  </Pressable>;
}
