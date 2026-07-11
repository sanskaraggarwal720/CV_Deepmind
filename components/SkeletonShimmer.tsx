import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonShimmerProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
}

export default function SkeletonShimmer({ width = '100%', height = 200, borderRadius = 16 }: SkeletonShimmerProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] });

  return (
    <Animated.View
      style={[styles.base, { width: width as any, height, borderRadius, opacity }]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#252530',
  },
});
