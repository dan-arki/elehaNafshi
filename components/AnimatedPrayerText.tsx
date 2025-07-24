import React, { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface AnimatedPrayerTextProps {
  children: string;
  style?: TextStyle;
  animationType?: 'fadeIn' | 'slideUp' | 'typewriter' | 'reverent';
  delay?: number;
  duration?: number;
  onAnimationComplete?: () => void;
}

export default function AnimatedPrayerText({
  children,
  style,
  animationType = 'reverent',
  delay = 0,
  duration = 800,
  onAnimationComplete,
}: AnimatedPrayerTextProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.98);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypewriterActive, setIsTypewriterActive] = useState(false);

  useEffect(() => {
    if (animationType === 'typewriter') {
      startTypewriterEffect();
    } else {
      setDisplayedText(children);
      startAnimation();
    }
  }, [children, animationType, delay, duration]);

  const startTypewriterEffect = () => {
    setIsTypewriterActive(true);
    setDisplayedText('');
    
    const words = children.split(' ');
    let currentWordIndex = 0;
    
    const typeNextWord = () => {
      if (currentWordIndex < words.length) {
        setDisplayedText(prev => 
          prev + (currentWordIndex > 0 ? ' ' : '') + words[currentWordIndex]
        );
        currentWordIndex++;
        setTimeout(typeNextWord, 150); // 150ms between words for reverent pace
      } else {
        setIsTypewriterActive(false);
        onAnimationComplete?.();
      }
    };

    setTimeout(typeNextWord, delay);
  };

  const startAnimation = () => {
    const animationDelay = delay;
    
    setTimeout(() => {
      if (animationType === 'reverent') {
        // Reverent animation: gentle fade with subtle scale
        opacity.value = withTiming(1, {
          duration: duration,
          easing: Easing.out(Easing.cubic),
        });
        
        translateY.value = withTiming(0, {
          duration: duration,
          easing: Easing.out(Easing.cubic),
        });
        
        scale.value = withSequence(
          withTiming(1.02, {
            duration: duration * 0.6,
            easing: Easing.out(Easing.cubic),
          }),
          withTiming(1, {
            duration: duration * 0.4,
            easing: Easing.inOut(Easing.cubic),
          }, () => {
            runOnJS(onAnimationComplete || (() => {}))();
          })
        );
      } else if (animationType === 'fadeIn') {
        opacity.value = withTiming(1, {
          duration: duration,
          easing: Easing.out(Easing.cubic),
        }, () => {
          runOnJS(onAnimationComplete || (() => {}))();
        });
      } else if (animationType === 'slideUp') {
        opacity.value = withTiming(1, {
          duration: duration,
          easing: Easing.out(Easing.cubic),
        });
        
        translateY.value = withTiming(0, {
          duration: duration,
          easing: Easing.out(Easing.cubic),
        }, () => {
          runOnJS(onAnimationComplete || (() => {}))();
        });
      }
    }, animationDelay);
  };

  const animatedStyle = useAnimatedStyle(() => {
    if (animationType === 'typewriter') {
      return {};
    }
    
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  if (animationType === 'typewriter') {
    return (
      <Text style={style}>
        {displayedText}
        {isTypewriterActive && (
          <Text style={{ opacity: 0.5 }}>|</Text>
        )}
      </Text>
    );
  }

  return (
    <Animated.Text style={[style, animatedStyle]}>
      {displayedText}
    </Animated.Text>
  );
}