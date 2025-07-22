import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

interface AnimatedScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  animationType?: 'fade' | 'slideUp' | 'slideDown' | 'scale';
  duration?: number;
  delay?: number;
}

export default function AnimatedScreenWrapper({
  children,
  style,
  animationType = 'slideUp',
  duration = 600,
  delay = 0,
}: AnimatedScreenWrapperProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(animationType === 'slideDown' ? -30 : 30);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      });

      if (animationType === 'slideUp' || animationType === 'slideDown') {
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 100,
        });
      }

      if (animationType === 'scale') {
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 150,
        });
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [opacity, translateY, scale, animationType, duration, delay]);

  const animatedStyle = useAnimatedStyle(() => {
    const baseStyle = {
      opacity: opacity.value,
    };

    if (animationType === 'slideUp' || animationType === 'slideDown') {
      return {
        ...baseStyle,
        transform: [{ translateY: translateY.value }],
      };
    }

    if (animationType === 'scale') {
      return {
        ...baseStyle,
        transform: [{ scale: scale.value }],
      };
    }

    return baseStyle;
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}