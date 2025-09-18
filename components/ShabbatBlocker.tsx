import React from 'react';
import { View, Text, StyleSheet, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { useShabbat } from '../contexts/ShabbatContext';

export default function ShabbatBlocker() {
  const { isShabbat, shabbatEndTime } = useShabbat();

  // Only render if it's actually Shabbat
  if (!isShabbat) {
    return null;
  }

  const formatShabbatEndTime = (endTime: Date | null): string => {
    if (!endTime) return '';
    
    return endTime.toLocaleString('fr-FR', {
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ImageBackground
      source={require('../assets/images/cielBG.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.8)', 'rgba(139, 92, 246, 0.9)']}
        style={styles.gradientOverlay}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            {/* App Icon */}
            <View style={styles.iconContainer}>
              <Image
                source={require('../assets/images/App Icon Vector.png')}
                style={styles.appIcon}
                resizeMode="contain"
              />
            </View>

            {/* Main Message */}
            <View style={styles.messageContainer}>
              <Text style={styles.title}>🕯️ Shabbat Shalom 🕯️</Text>
              
              <Text style={styles.subtitle}>
                L'application est temporairement bloquée pour respecter le Shabbat
              </Text>

              <Text style={styles.description}>
                Nous respectons ce temps sacré de repos et de spiritualité.
              </Text>
              
              {shabbatEndTime && (
                <View style={styles.timeContainer}>
                  <Text style={styles.timeLabel}>
                    L'application se débloquera automatiquement :
                  </Text>
                  <Text style={styles.timeText}>
                    {formatShabbatEndTime(shabbatEndTime)}
                  </Text>
                </View>
              )}

              <Text style={styles.blessing}>
                Profitez de ce moment privilégié avec votre famille et vos proches
              </Text>
            </View>

            {/* Decorative Elements */}
            <View style={styles.decorativeContainer}>
              <Text style={styles.decorativeText}>✨ Shabbat Kodesh ✨</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  gradientOverlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 40,
  },
  appIcon: {
    width: 120,
    height: 120,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    opacity: 0.9,
  },
  timeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 20,
    color: Colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  errorSubtext: {
    fontSize: 14,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.8,
  },
  blessing: {
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    opacity: 0.9,
  },
  decorativeContainer: {
    marginTop: 20,
  },
  decorativeText: {
    fontSize: 18,
    color: Colors.white,
    textAlign: 'center',
    fontWeight: '600',
  },
});