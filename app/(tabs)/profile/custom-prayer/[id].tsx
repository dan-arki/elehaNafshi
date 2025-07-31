import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Settings, Play, Pause, Home as HomeIcon, BookOpen, User } from 'lucide-react-native';
import { Colors } from '../../../../constants/Colors';
import { useAuth } from '../../../../contexts/AuthContext';
import { useDisplaySettings } from '../../../../contexts/DisplaySettingsContext';
import { getCustomPrayerById } from '../../../../services/firestore';
import { Prayer } from '../../../../types';
import { router, useLocalSearchParams } from 'expo-router';
import SettingsBottomSheet from '../../../../components/SettingsBottomSheet';
import { triggerLightHaptic, triggerMediumHaptic, triggerErrorHaptic } from '../../../../utils/haptics';
import { Audio } from 'expo-av';

export default function CustomPrayerScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { fontSize, showHebrew, showFrench, showPhonetic } = useDisplaySettings();
  
  const [prayer, setPrayer] = useState<Prayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Configure audio mode for playback
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // Cleanup function
    return () => {
      if (currentSound) {
        currentSound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    loadPrayer();
  }, [id]);

  const loadPrayer = async () => {
    if (!id || !user) return;
    
    try {
      setLoading(true);
      setError(null);
      const prayerData = await getCustomPrayerById(user.uid, id as string);
      
      if (prayerData) {
        setPrayer(prayerData);
      } else {
        setError('Prière non trouvée');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la prière:', error);
      setError('Erreur lors du chargement de la prière');
    } finally {
      setLoading(false);
    }
  };

  const navigateToHome = () => {
    triggerMediumHaptic();
    router.push('/(tabs)/index');
  };

  const navigateToSiddour = () => {
    triggerMediumHaptic();
    router.push('/(tabs)/siddour');
  };

  const navigateToProfile = () => {
    triggerMediumHaptic();
    router.push('/profile');
  };

  const playBackgroundMusic = async () => {
    if (!prayer?.musicUrl) return;

    try {
      // Stop current audio if playing
      if (currentSound) {
        await currentSound.unloadAsync();
        setCurrentSound(null);
        setIsPlaying(false);
      }

      // Load and play new audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: prayer.musicUrl },
        { shouldPlay: true, isLooping: true, volume: 0.3 }
      );
      
      setCurrentSound(sound);
      setIsPlaying(true);

      // Set up playback status update
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPlaybackPosition(status.positionMillis || 0);
          setPlaybackDuration(status.durationMillis || 0);
          
          if (!status.isPlaying && !status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      });

    } catch (error) {
      console.error('Error playing background music:', error);
      triggerErrorHaptic();
      Alert.alert('Erreur', 'Impossible de lire la musique de fond');
    }
  };

  const stopBackgroundMusic = async () => {
    try {
      if (currentSound) {
        await currentSound.unloadAsync();
        setCurrentSound(null);
        setIsPlaying(false);
        setPlaybackPosition(0);
        setPlaybackDuration(0);
      }
    } catch (error) {
      console.error('Error stopping background music:', error);
    }
  };

  const togglePlayPause = async () => {
    if (!currentSound) {
      await playBackgroundMusic();
      return;
    }

    try {
      if (isPlaying) {
        await currentSound.pauseAsync();
        setIsPlaying(false);
      } else {
        await currentSound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const renderSection = (title: string, content: string) => {
    if (!content.trim()) return null;

    return (
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { fontSize: fontSize + 2 }]}>{title}</Text>
        <Text style={[styles.sectionContent, { fontSize: fontSize }]}>{content}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !prayer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Prière non trouvée'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPrayer}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          triggerLightHaptic();
          router.back();
        }}>
          <ChevronLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {prayer.title}
        </Text>
        <TouchableOpacity onPress={() => {
          triggerLightHaptic();
          setShowSettings(true);
        }}>
          <Settings size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Background Music Controls */}
      {prayer.musicUrl && (
        <View style={styles.musicControls}>
          <TouchableOpacity
            style={styles.musicButton}
            onPress={() => {
              triggerLightHaptic();
              togglePlayPause();
            }}
          >
            {isPlaying ? (
              <Pause size={20} color={Colors.white} />
            ) : (
              <Play size={20} color={Colors.white} />
            )}
            <Text style={styles.musicButtonText}>
              {isPlaying ? 'Pause musique' : 'Jouer musique'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{flex: 1}}>
        {/* Content */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Prayer Subtitle */}
          {prayer.subtitle && (
            <Text style={[styles.subtitle, { fontSize: fontSize }]}>{prayer.subtitle}</Text>
          )}

          {/* Prayer Sections */}
          {prayer.sections && (
            <>
              {renderSection("Hashem, je veux te remercier pour :", prayer.sections.gratitude)}
              {renderSection("Noms pour la réfouah chéléma :", prayer.sections.refouah)}
              {renderSection("Ce que je souhaite améliorer en moi :", prayer.sections.improvement)}
              {renderSection("Mes rêves et désirs :", prayer.sections.dreams)}
              {renderSection("Ma prière personnelle :", prayer.sections.personal)}
            </>
          )}

          {/* Fallback to main content if no sections */}
          {!prayer.sections && prayer.content?.french && (
            <View style={styles.sectionContainer}>
              <Text style={[styles.mainContent, { fontSize: fontSize }]}>
                {prayer.content.french}
              </Text>
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>

      {/* Bottom Sheets */}
      <SettingsBottomSheet
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  musicControls: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  musicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 12,
  },
  musicButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  subtitle: {
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  sectionContent: {
    color: Colors.text.primary,
    lineHeight: 24,
    textAlign: 'left',
  },
  mainContent: {
    color: Colors.text.primary,
    lineHeight: 24,
    textAlign: 'left',
  },
  bottomSpacing: {
    height: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});