import React, { useEffect, useRef } from 'react';
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
import { SiddourSubcategory } from '../types';
import { triggerLightHaptic } from '../utils/haptics';

interface AnimatedSubcategoryNavigationProps {
  subcategories: SiddourSubcategory[];
  selectedIndex: number;
  onSubcategorySelect: (index: number) => void;
  scrollViewWidth: number;
  contentWidth: number;
  delay?: number;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedSubcategoryNavigation({
  subcategories,
  selectedIndex,
  onSubcategorySelect,
  scrollViewWidth,
  contentWidth,
  delay = 0,
}: AnimatedSubcategoryNavigationProps) {
  const subcategoryScrollRef = useRef<ScrollView>(null);
  const subcategoryRefs = useRef<(TouchableOpacity | null)[]>([]);
  const containerOpacity = useSharedValue(0);
  const containerTranslateY = useSharedValue(-15);

  useEffect(() => {
    setTimeout(() => {
      containerOpacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });
      
      containerTranslateY.value = withSpring(0, {
        damping: 20,
        stiffness: 120,
      });
    }, delay);
  }, [delay]);

  useEffect(() => {
    subcategoryRefs.current = subcategoryRefs.current.slice(0, subcategories.length);
  }, [subcategories.length]);

  useEffect(() => {
    if (subcategories.length > 0 && scrollViewWidth > 0 && contentWidth > 0) {
      scrollToSelectedSubcategory();
    }
  }, [selectedIndex, scrollViewWidth, contentWidth, subcategories.length]);

  const scrollToSelectedSubcategory = () => {
    if (!subcategoryScrollRef.current || subcategories.length === 0 || scrollViewWidth === 0) {
      return;
    }
    
    const selectedRef = subcategoryRefs.current[selectedIndex];
    if (!selectedRef) {
      return;
    }
    
    selectedRef.measureLayout(
      subcategoryScrollRef.current.getInnerViewNode(),
      (x, y, width, height) => {
        const tabCenter = x + (width / 2);
        const targetScrollX = tabCenter - (scrollViewWidth / 2);
        const maxScrollX = Math.max(0, contentWidth - scrollViewWidth);
        const clampedScrollX = Math.max(0, Math.min(targetScrollX, maxScrollX));
        
        subcategoryScrollRef.current?.scrollTo({
          x: clampedScrollX,
          animated: true
        });
      },
      (error) => {
        console.error('Error measuring tab:', error);
      }
    );
  };

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: containerOpacity.value,
      transform: [{ translateY: containerTranslateY.value }],
    };
  });

  const AnimatedSubcategoryButton = ({ subcategory, index }: { subcategory: SiddourSubcategory; index: number }) => {
    const buttonOpacity = useSharedValue(0);
    const buttonScale = useSharedValue(0.9);
    const pressScale = useSharedValue(1);
    const isSelected = selectedIndex === index;

    useEffect(() => {
      const buttonDelay = delay + 150 + (index * 30);
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
      runOnJS(onSubcategorySelect)(index);
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
        ref={(ref) => {
          subcategoryRefs.current[index] = ref;
        }}
        style={[
          styles.prayerNavButton,
          isSelected && styles.prayerNavButtonActive,
          buttonAnimatedStyle,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Text style={[
          styles.prayerNavText,
          isSelected && styles.prayerNavTextActive,
        ]}>
          {subcategory.title}
        </Text>
      </AnimatedTouchableOpacity>
    );
  };

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <ScrollView 
        ref={subcategoryScrollRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.prayerNavContent}
        onLayout={(event) => {
          // Handle layout if needed
        }}
        onContentSizeChange={(contentWidth, contentHeight) => {
          // Handle content size change if needed
        }}
      >
        {subcategories.map((subcategory, index) => (
          <AnimatedSubcategoryButton 
            key={subcategory.id} 
            subcategory={subcategory} 
            index={index} 
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  prayerNavContent: {
    paddingHorizontal: 20,
  },
  prayerNavButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  prayerNavButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    elevation: 4,
    shadowOpacity: 0.15,
  },
  prayerNavText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  prayerNavTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});