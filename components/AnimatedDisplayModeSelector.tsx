import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { triggerLightHaptic } from '../utils/haptics';

interface DisplayModeOption {
  key: string;
  label: string;
}

interface AnimatedDisplayModeSelectorProps {
  options: DisplayModeOption[];
  selectedMode: string;
  onModeChange: (mode: string) => void;
  delay?: number;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedDisplayModeSelector({
  options,
  selectedMode,
  onModeChange,
  delay = 0,
}: AnimatedDisplayModeSelectorProps) {
  const containerOpacity = useSharedValue(0);
  const containerTranslateY = useSharedValue(-20);

  useEffect(() => {
    setTimeout(() => {
      containerOpacity.value = withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      });
      
      containerTranslateY.value = withSpring(0, {
        damping: 20,
        stiffness: 100,
      });
    }, delay);
  }, [delay]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: containerOpacity.value,
      transform: [{ translateY: containerTranslateY.value }],
    };
  });

  const AnimatedButton = ({ option, index }: { option: DisplayModeOption; index: number }) => {
    const buttonOpacity = useSharedValue(0);
    const buttonScale = useSharedValue(0.9);
    const pressScale = useSharedValue(1);
    const isSelected = selectedMode === option.key;

    useEffect(() => {
      const buttonDelay = delay + 100 + (index * 50);
      setTimeout(() => {
        buttonOpacity.value = withTiming(1, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
        
        buttonScale.value = withSpring(1, {
          damping: 15,
          stiffness: 150,
        });
      }, buttonDelay);
    }, [delay, index]);

    const handlePress = () => {
      runOnJS(triggerLightHaptic)();
      runOnJS(onModeChange)(option.key);
    };

    const handlePressIn = () => {
      pressScale.value = withSpring(0.95, {
        damping: 20,
        stiffness: 300,
      });
    };

    const handlePressOut = () => {
      pressScale.value = withSpring(1, {
        damping: 20,
        stiffness: 300,
      });
    };

    const buttonAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: buttonOpacity.value,
        transform: [
          { scale: buttonScale.value * pressScale.value },
        ],
      };
    });

    return (
      <AnimatedTouchableOpacity
        style={[
          styles.displayModeButton,
          isSelected && styles.displayModeButtonActive,
          buttonAnimatedStyle,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.displayModeText,
          isSelected && styles.displayModeTextActive,
        ]}>
          {option.label}
        </Text>
      </AnimatedTouchableOpacity>
    );
  };

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((option, index) => (
          <AnimatedButton key={option.key} option={option} index={index} />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  displayModeButton: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  displayModeButtonActive: {
    backgroundColor: Colors.primary,
    elevation: 4,
    shadowOpacity: 0.2,
  },
  displayModeText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  displayModeTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
});