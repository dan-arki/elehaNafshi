import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface AnimatedPrayerBlockProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  index?: number;
  animationType?: 'gentle' | 'reverent' | 'cascade';
}

export default function AnimatedPrayerBlock({
  children,
  style,
  delay = 0,
  index = 0,
  animationType = 'reverent',
}: AnimatedPrayerBlockProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    const animationDelay = delay + (index * 100); // Stagger animations
    
    setTimeout(() => {
      if (animationType === 'reverent') {
        // Reverent entrance with gentle spring
        opacity.value = withTiming(1, {
          duration: 600,
          easing: Easing.out(Easing.cubic),
        });
        
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 100,
        });
        
        scale.value = withSequence(
          withTiming(1.02, {
            duration: 400,
            easing: Easing.out(Easing.cubic),
          }),
          withTiming(1, {
            duration: 200,
            easing: Easing.inOut(Easing.cubic),
          })
        );
      } else if (animationType === 'gentle') {
        // Gentle fade-in
        opacity.value = withTiming(1, {
          duration: 500,
          easing: Easing.out(Easing.cubic),
        });
        
        translateY.value = withTiming(0, {
          duration: 500,
          easing: Easing.out(Easing.cubic),
        });
      } else if (animationType === 'cascade') {
        // Cascade effect for multiple blocks
        opacity.value = withTiming(1, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        });
        
        translateY.value = withSpring(0, {
          damping: 15,
          stiffness: 120,
        });
      }
    }, animationDelay);
  }, [delay, index, animationType]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}