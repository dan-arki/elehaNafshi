import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Settings, Play, Pause, ChevronRight, Home as HomeIcon, BookOpen, User } from 'lucide-react-native';
import { Colors } from '../../../../constants/Colors';
import { useAuth } from '../../../../contexts/AuthContext';
import { useDisplaySettings } from '../../../../contexts/DisplaySettingsContext';
import { getChapterById, toggleFavorite } from '../../../../services/firestore';
import { PrayerChapter, PrayerBlock } from '../../../../types';
import { router, useLocalSearchParams } from 'expo-router';
import SettingsBottomSheet from '../../../../components/SettingsBottomSheet';
import PrayerInfoBottomSheet from '../../../../components/PrayerInfoBottomSheet';
import SymbolsInfoBottomSheet from '../../../../components/SymbolsInfoBottomSheet';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic, triggerErrorHaptic } from '../../../../utils/haptics';
import { Audio } from 'expo-av';

export default function ChapterScreen() {
  const { id, subcategoryId } = useLocalSearchParams();
  const { user } = useAuth();
  const { fontSize, showHebrew, showFrench, showPhonetic } = useDisplaySettings();
  
  const [chapter, setChapter] = useState<PrayerChapter | null>(null);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [selectedSubcategoryIndex, setSelectedSubcategoryIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPrayerInfo, setShowPrayerInfo] = useState(false);
  const [showSymbolsInfo, setShowSymbolsInfo] = useState(false);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [currentPlayingBlockId, setCurrentPlayingBlockId] = useState<string | null>(null);
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
    loadChapter();
  }, [id]);

  useEffect(() => {
    if (subcategoryId && subcategories.length > 0) {
      const index = subcategories.findIndex(sub => sub.id === subcategoryId);
      if (index !== -1) {
        setSelectedSubcategoryIndex(index);
      }
    }
  }, [subcategoryId, subcategories]);

  const loadChapter = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const chapterData = await getChapterById(id as string);
      
      if (chapterData) {
        setChapter(chapterData);
        
        // Extract subcategories from prayers
        const subcategoriesMap = new Map();
        chapterData.prayers.forEach(prayer => {
          if (prayer.subcategory && !subcategoriesMap.has(prayer.subcategory)) {
            subcategoriesMap.set(prayer.subcategory, {
              id: prayer.subcategory,
              name: prayer.subcategoryName || prayer.subcategory,
              prayers: []
            });
          }
        });
        
        // Group prayers by subcategory
        chapterData.prayers.forEach(prayer => {
          if (prayer.subcategory) {
            const subcategory = subcategoriesMap.get(prayer.subcategory);
            if (subcategory) {
              subcategory.prayers.push(prayer);
            }
          }
        });
        
        const subcategoriesArray = Array.from(subcategoriesMap.values());
        setSubcategories(subcategoriesArray);
        
        // If no subcategoryId provided, default to first subcategory
        if (!subcategoryId && subcategoriesArray.length > 0) {
          setSelectedSubcategoryIndex(0);
        }
      } else {
        setError('Chapitre non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du chapitre:', error);
      setError('Erreur lors du chargement du chapitre');
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

  const handlePreviousSubcategory = async () => {
    if (selectedSubcategoryIndex > 0) {
      triggerLightHaptic();
      await stopCurrentAudio();
      setSelectedSubcategoryIndex(selectedSubcategoryIndex - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleNextSubcategory = async () => {
    if (selectedSubcategoryIndex < subcategories.length - 1) {
      triggerLightHaptic();
      await stopCurrentAudio();
      setSelectedSubcategoryIndex(selectedSubcategoryIndex + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleToggleFavorite = async (prayerId: string) => {
    if (!user) {
      triggerErrorHaptic();
      Alert.alert('Connexion requise', 'Vous devez être connecté pour ajouter des favoris');
      return;
    }

    try {
      triggerMediumHaptic();
      await toggleFavorite(user.uid, prayerId);
      
      // Update local state
      setChapter(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          prayers: prev.prayers.map(prayer => 
            prayer.id === prayerId 
              ? { ...prayer, isFavorite: !prayer.isFavorite }
              : prayer
          )
        };
      });

      // Update subcategories state as well
      setSubcategories(prev => 
        prev.map(subcategory => ({
          ...subcategory,
          prayers: subcategory.prayers.map((prayer: any) => 
            prayer.id === prayerId 
              ? { ...prayer, isFavorite: !prayer.isFavorite }
              : prayer
          )
        }))
      );

      triggerSuccessHaptic();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du favori:', error);
      triggerErrorHaptic();
      Alert.alert('Erreur', 'Impossible de mettre à jour le favori');
    }
  };

  const playAudio = async (audioUrl: string, blockId: string) => {
    try {
      // Stop current audio if playing
      if (currentSound) {
        await currentSound.unloadAsync();
        setCurrentSound(null);
        setCurrentPlayingBlockId(null);
        setIsPlaying(false);
      }

      // Load and play new audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      
      setCurrentSound(sound);
      setCurrentPlayingBlockId(blockId);
      setIsPlaying(true);

      // Set up playback status update
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPlaybackPosition(status.positionMillis || 0);
          setPlaybackDuration(status.durationMillis || 0);
          
          if (status.didJustFinish) {
            setCurrentPlayingBlockId(null);
            setIsPlaying(false);
            setPlaybackPosition(0);
            setPlaybackDuration(0);
          }
        }
      });

    } catch (error) {
      console.error('Error playing audio:', error);
      triggerErrorHaptic();
      Alert.alert('Erreur', 'Impossible de lire cet audio');
    }
  };

  const stopCurrentAudio = async () => {
    try {
      if (currentSound) {
        await currentSound.unloadAsync();
        setCurrentSound(null);
        setCurrentPlayingBlockId(null);
        setIsPlaying(false);
        setPlaybackPosition(0);
        setPlaybackDuration(0);
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const togglePlayPause = async () => {
    if (!currentSound) return;

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

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderPrayerBlock = (block: PrayerBlock, blockIndex: number, prayerId: string) => {
    const isCurrentlyPlaying = currentPlayingBlockId === `${prayerId}-${blockIndex}`;
    
    return (
      <View key={blockIndex} style={styles.prayerBlock}>
        {/* Audio Controls */}
        {block.audioUrl && (
          <View style={styles.audioControls}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => {
                triggerLightHaptic();
                if (isCurrentlyPlaying) {
                  stopCurrentAudio();
                } else {
                  playAudio(block.audioUrl!, `${prayerId}-${blockIndex}`);
                }
              }}
            >
              {isCurrentlyPlaying ? (
                <Pause size={16} color={Colors.white} />
              ) : (
                <Play size={16} color={Colors.white} />
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Hebrew Text */}
        {showHebrew && block.hebrew && (
          <View style={styles.alternativeContainer}>
            <Text style={[styles.hebrewText, { fontSize: fontSize + 4 }]}>
              {block.hebrew}
            </Text>
          </View>
        )}

        {/* French Text */}
        {showFrench && block.french && (
          <Text style={[styles.textFrStyle, { fontSize: fontSize }]}>
            {block.french}
          </Text>
        )}

        {/* Phonetic Text */}
        {showPhonetic && block.phonetic && (
          <Text style={[styles.phoneticText, { fontSize: fontSize - 2 }]}>
            {block.phonetic}
          </Text>
        )}
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

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadChapter}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!chapter || subcategories.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Aucune prière trouvée</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentSubcategory = subcategories[selectedSubcategoryIndex];

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
          {currentSubcategory?.name || chapter.title}
        </Text>
        <TouchableOpacity onPress={() => {
          triggerLightHaptic();
          setShowSettings(true);
        }}>
          <Settings size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={{flex: 1}}>
        {/* Content */}
        <View style={styles.content}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {currentSubcategory?.prayers.map((prayer: any) => (
              <View key={prayer.id} style={styles.prayerContainer}>
                <View style={styles.prayerHeader}>
                  <Text style={styles.prayerTitle}>{prayer.title}</Text>
                  <View style={styles.prayerActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        triggerLightHaptic();
                        setShowPrayerInfo(true);
                      }}
                    >
                      <Text style={styles.actionButtonText}>ℹ️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleToggleFavorite(prayer.id)}
                    >
                      <Text style={styles.actionButtonText}>
                        {prayer.isFavorite ? '❤️' : '🤍'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {prayer.blocks?.map((block: PrayerBlock, blockIndex: number) => 
                  renderPrayerBlock(block, blockIndex, prayer.id)
                )}
              </View>
            ))}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        </View>

        {/* Subcategory Navigation */}
        {subcategories.length > 1 && (
          <View style={styles.subcategoryNavigation}>
            <TouchableOpacity 
              style={[
                styles.navButton,
                selectedSubcategoryIndex === 0 && styles.navButtonDisabled
              ]}
              onPress={handlePreviousSubcategory}
              disabled={selectedSubcategoryIndex === 0}
            >
              <ChevronLeft 
                size={20} 
                color={selectedSubcategoryIndex === 0 ? Colors.text.muted : Colors.text.primary} 
              />
              <Text style={[
                styles.navButtonText,
                selectedSubcategoryIndex === 0 && styles.navButtonTextDisabled
              ]}>
                Précédent
              </Text>
            </TouchableOpacity>
            
            <View style={styles.navIndicator}>
              <Text style={styles.navIndicatorText}>
                {selectedSubcategoryIndex + 1} / {subcategories.length}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.navButton,
                selectedSubcategoryIndex === subcategories.length - 1 && styles.navButtonDisabled
              ]}
              onPress={handleNextSubcategory}
              disabled={selectedSubcategoryIndex === subcategories.length - 1}
            >
              <Text style={[
                styles.navButtonText,
                selectedSubcategoryIndex === subcategories.length - 1 && styles.navButtonTextDisabled
              ]}>
                Suivant
              </Text>
              <ChevronRight 
                size={20} 
                color={selectedSubcategoryIndex === subcategories.length - 1 ? Colors.text.muted : Colors.text.primary} 
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Mini Audio Player */}
      {currentPlayingBlockId && (
        <View style={styles.miniPlayer}>
          <TouchableOpacity style={styles.miniPlayButton} onPress={togglePlayPause}>
            {isPlaying ? (
              <Pause size={20} color={Colors.white} />
            ) : (
              <Play size={20} color={Colors.white} />
            )}
          </TouchableOpacity>
          <View style={styles.miniPlayerInfo}>
            <Text style={styles.miniPlayerText}>Audio en cours</Text>
            <Text style={styles.miniPlayerTime}>
              {formatTime(playbackPosition)} / {formatTime(playbackDuration)}
            </Text>
          </View>
          <TouchableOpacity style={styles.miniStopButton} onPress={stopCurrentAudio}>
            <Text style={styles.miniStopText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Sheets */}
      <SettingsBottomSheet
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <PrayerInfoBottomSheet
        visible={showPrayerInfo}
        onClose={() => setShowPrayerInfo(false)}
      />

      <SymbolsInfoBottomSheet
        visible={showSymbolsInfo}
        onClose={() => setShowSymbolsInfo(false)}
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
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  prayerContainer: {
    marginBottom: 32,
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  prayerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    flex: 1,
  },
  prayerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  actionButtonText: {
    fontSize: 16,
  },
  prayerBlock: {
    marginBottom: 20,
  },
  audioControls: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  playButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alternativeContainer: {
    backgroundColor: '#F3E8FF',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  hebrewText: {
    fontWeight: '600',
    color: Colors.primary,
    writingDirection: 'rtl',
  },
  textFrStyle: {
    color: Colors.text.primary,
    marginBottom: 8,
  },
  phoneticText: {
    color: Colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  bottomSpacing: {
    height: 40,
  },
  subcategoryNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 60,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginHorizontal: 4,
  },
  navButtonTextDisabled: {
    color: Colors.text.muted,
  },
  navIndicator: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  navIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  miniPlayer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  miniPlayButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
  },
  miniPlayerInfo: {
    flex: 1,
  },
  miniPlayerText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  miniPlayerTime: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  miniStopButton: {
    padding: 8,
  },
  miniStopText: {
    fontSize: 16,
    color: Colors.text.muted,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
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