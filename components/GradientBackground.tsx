import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function GradientBackground({ children, style }: GradientBackgroundProps) {
  return (
    <LinearGradient
      colors={[Colors.gradient.start, Colors.gradient.end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});