import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

export default function Logo({ size = 'medium' }: LogoProps) {
  const logoSize = size === 'small' ? 40 : size === 'large' ? 80 : 60;
  const textSize = size === 'small' ? 14 : size === 'large' ? 20 : 16;

  return (
    <View style={styles.container}>
      <View style={[styles.logoContainer, { width: logoSize, height: logoSize }]}>
        <Text style={[styles.hebrewText, { fontSize: textSize }]}>עלה נפשי</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  hebrewText: {
    color: Colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});