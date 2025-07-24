import React, { useEffect } from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { triggerLightHaptic } from '../utils/haptics';

interface AnimatedNavigationButtonProps {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  delay?: number;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedNavigationButton({
  onPress,
  disabled = false,
  children,
  style,
  textStyle,
  delay = 0,
}: AnimatedNavigationButtonProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
    }, delay);
  }, [delay]);

  const handlePressIn = () => {
    if (!disabled) {
      runOnJS(triggerLightHaptic)();
      pressScale.value = withSpring(0.95, {
        damping: 20,
        stiffness: 300,
      });
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      pressScale.value = withSpring(1, {
        damping: 20,
        stiffness: 300,
      });
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value * pressScale.value },
      ],
    };
  });

  return (
    <AnimatedTouchableOpacity
      style={[style, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {children}
    </AnimatedTouchableOpacity>
  );
}