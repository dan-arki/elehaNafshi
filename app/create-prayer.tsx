import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Save, X, Info, Play, Pause } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { createCustomPrayer, updateCustomPrayer } from '../services/firestore';
import { router, useLocalSearchParams } from 'expo-router';
import PrayerInstructionsBottomSheet from '../components/PrayerInstructionsBottomSheet';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic, triggerErrorHaptic } from '../utils/haptics';
import { Audio } from 'expo-av';

export default function CreatePrayerScreen() {
  const { edit } = useLocalSearchParams();
  const { user } = useAuth();
  const isEditing = !!edit;
  
  const [prayerName, setPrayerName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMusicUrl, setSelectedMusicUrl] = useState<string | null>(null);
  const [gratitudeText, setGratitudeText] = useState('');
  const [refouahNames, setRefouahNames] = useState('');
  const [personalImprovement, setPersonalImprovement] = useState('');
  const [dreamsDesires, setDreamsDesires] = useState('');
  const [personalPrayer, setPersonalPrayer] = useState('');
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [playingMusicUrl, setPlayingMusicUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showInstructions, setShowInstructions] = useState(false);

  const musicOptions = [
    {
      name: 'Musique 1',
      url: 'https://firebasestorage.googleapis.com/v0/b/eleha-nafchi-vvurlg.firebasestorage.app/o/audio.mp3?alt=media&token=44d213bc-13cd-4f3f-af9c-3e6636fccefa'
    },
    {
      name: 'Musique 2',
      url: 'https://firebasestorage.googleapis.com/v0/b/eleha-nafchi-vvurlg.firebasestorage.app/o/audioEleha2.mp3?alt=media&token=1c910bc0-88d1-4a85-8b98-f8046a3d4217'
    },
    {
      name: 'Musique 3',
      url: 'https://firebasestorage.googleapis.com/v0/b/eleha-nafchi-vvurlg.firebasestorage.app/o/audioEleha3.mp3?alt=media&token=607c6315-04b8-45b5-8b60-a4b541dc674f'
    },
    {
      name: 'Musique 4',
      url: 'https://firebasestorage.googleapis.com/v0/b/eleha-nafchi-vvurlg.firebasestorage.app/o/audioEleha4.mp3?alt=media&token=e14f3fc3-e92f-4723-8d61-76e64244ab46'
    },
    {
      name: 'Musique 5',
      url: 'https://firebasestorage.googleapis.com/v0/b/eleha-nafchi-vvurlg.firebasestorage.app/o/audioEleha5.mp3?alt=media&token=70deb202-ef94-428b-9680-d10b69c794cf'
    }
  ];

  const loadPrayerForEdit = async () => {
    // Implementation for loading prayer data when editing
  };

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
    if (isEditing) {
      loadPrayerForEdit();
    }
  }, [isEditing]);

  const handleMusicSelection = async (musicUrl: string) => {
    triggerLightHaptic();
    
    try {
      // Stop current music if playing
      if (currentSound) {
        await currentSound.unloadAsync();
        setCurrentSound(null);
        setIsPlayingMusic(false);
        setPlayingMusicUrl(null);
      }

      // If clicking the same music that was playing, just stop it
      if (playingMusicUrl === musicUrl && isPlayingMusic) {
        setSelectedMusicUrl(musicUrl);
        return;
      }

      // Load and play new music
      const { sound } = await Audio.Sound.createAsync(
        { uri: musicUrl },
        { shouldPlay: true, isLooping: true, volume: 0.5 }
      );
      
      setCurrentSound(sound);
      setIsPlayingMusic(true);
      setPlayingMusicUrl(musicUrl);
      setSelectedMusicUrl(musicUrl);

      // Set up playback status update
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying && !status.didJustFinish) {
          setIsPlayingMusic(false);
        }
      });

    } catch (error) {
      console.error('Error playing music:', error);
      triggerErrorHaptic();
      Alert.alert('Erreur', 'Impossible de lire cette musique');
    }
  };

  const stopCurrentMusic = async () => {
    if (currentSound) {
      await currentSound.unloadAsync();
      setCurrentSound(null);
      setIsPlayingMusic(false);
      setPlayingMusicUrl(null);
    }
  };

  const handleSave = async () => {
    if (!user) {
      triggerErrorHaptic();
      Alert.alert('Erreur', 'Vous devez être connecté pour créer une prière');
      return;
    }
    
    if (!prayerName.trim()) {
      triggerErrorHaptic();
      Alert.alert('Erreur', 'Le nom de votre prière est obligatoire');
      return;
    }

    triggerMediumHaptic();
    
    // Stop music before saving
    await stopCurrentMusic();

    try {
      const prayerData = {
        title: prayerName,
        subtitle: description,
        category: 'custom',
        content: {
          hebrew: '',
          french: `${gratitudeText}\n\n${refouahNames}\n\n${personalImprovement}\n\n${dreamsDesires}\n\n${personalPrayer}`,
          phonetic: ''
        },
        isFavorite: false,
        isCustom: true,
        createdAt: new Date(),
        musicUrl: selectedMusicUrl,
        sections: {
          gratitude: gratitudeText,
          refouah: refouahNames,
          improvement: personalImprovement,
          dreams: dreamsDesires,
          personal: personalPrayer
        }
      };

      if (isEditing && edit) {
        await updateCustomPrayer(user.uid, edit as string, prayerData);
      } else {
        await createCustomPrayer(user.uid, prayerData);
      }

      triggerSuccessHaptic();
      // Navigate immediately after success
      router.push('/my-prayers');
      
      // Show success message after navigation
      setTimeout(() => {
        Alert.alert(
          'Succès',
          isEditing ? 'Prière modifiée avec succès' : 'Prière créée avec succès'
        );
      }, 100);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      triggerErrorHaptic();
      const errorMessage = error instanceof Error ? error.message : 'Impossible de sauvegarder la prière';
      Alert.alert('Erreur', errorMessage);
    }
  };

  const handleCancel = () => {
    triggerLightHaptic();
    stopCurrentMusic(); // Stop music when canceling
    if (prayerName || description || gratitudeText || refouahNames || personalImprovement || dreamsDesires || personalPrayer) {
      Alert.alert(
        'Annuler',
        'Êtes-vous sûr de vouloir annuler ? Toutes les modifications seront perdues.',
        [
          {
            text: 'Continuer l\'édition',
            style: 'cancel',
          },
          {
            text: 'Annuler',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <ChevronLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ma prière</Text>
          <TouchableOpacity onPress={() => setShowInstructions(true)}>
            <Text style={styles.modeEmploi}>Mode d'emploi</Text>
          </TouchableOpacity>
        </View>

        <View style={{flex: 1}}>
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.mainTitle}>Créer votre propre prière</Text>
              <Text style={styles.subtitle}>Une prière unique qui vous ressemble.</Text>
            </View>

            {/* Prayer Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom de votre prière</Text>
              <TextInput
                style={styles.input}
                placeholder="Écrivez un nom personnalisé"
                placeholderTextColor={Colors.text.muted}
                value={prayerName}
                onChangeText={setPrayerName}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descriptif</Text>
              <TextInput
                style={styles.input}
                placeholder="Facultatif"
                placeholderTextColor={Colors.text.muted}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Background Music */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Votre musique de fond</Text>
              <View style={styles.musicGrid}>
                {musicOptions.map((music, index) => {
                  const isSelected = selectedMusicUrl === music.url;
                  const isCurrentlyPlaying = playingMusicUrl === music.url && isPlayingMusic;
                  
                  return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.musicButton,
                      isSelected && styles.musicButtonSelected
                    ]}
                    onPress={() => handleMusicSelection(music.url)}
                  >
                    <View style={styles.musicButtonContent}>
                      {isCurrentlyPlaying ? (
                        <Pause size={16} color={isSelected ? Colors.white : Colors.primary} />
                      ) : (
                        <Play size={16} color={isSelected ? Colors.white : Colors.primary} />
                      )}
                    <Text style={[
                      styles.musicButtonText,
                      isSelected && styles.musicButtonTextSelected
                    ]}>
                        {music.name}
                    </Text>
                    </View>
                  </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Gratitude Section */}
            <View style={styles.inputGroup}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Hashem je veux te remercier pour</Text>
                <Info size={16} color={Colors.primary} />
              </View>
              <View style={styles.exampleBox}>
                <Info size={16} color={Colors.primary} />
                <Text style={styles.exampleText}>
                  Exemple : Merci HACHEM pour chaque moment de vie, pour le souffle que Tu nous offres, pour la beauté de Ta création : le jours qui se lève, les fleurs ... Merci pour le cadeau de ma famille (pour mon marie et mes enfants,). Merci pour ta Torah, Merci pour le Chabbat et toutes Tes Mitsvot. Merci pour la santé, la parnassa, tout ce que j'ai et tout ce que je n'ai pas ainsi que tout ce que j'ai et que je n'ai pas mentionnée.
                </Text>
              </View>
              <TextInput
                style={styles.textArea}
                placeholder="Écrivez ici vos remerciements"
                placeholderTextColor={Colors.text.muted}
                value={gratitudeText}
                onChangeText={setGratitudeText}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Refouah Section */}
            <View style={styles.inputGroup}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Noms pour la réfouah chéléma</Text>
                <Info size={16} color={Colors.primary} />
              </View>
              <View style={styles.exampleBox}>
                <Info size={16} color={Colors.primary} />
                <Text style={styles.exampleText}>
                  Exemple : Hashem , je t'en prie, gardes en bonne santé tout Ton peuple, aux quatres coins du monde, et protèges en particulier nos hayalim.
                </Text>
              </View>
              <TextInput
                style={styles.textArea}
                placeholder="Écrivez ici les noms ..."
                placeholderTextColor={Colors.text.muted}
                value={refouahNames}
                onChangeText={setRefouahNames}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Personal Improvement Section */}
            <View style={styles.inputGroup}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Ce que vous souhaitez améliorer en vous</Text>
                <Info size={16} color={Colors.primary} />
              </View>
              <View style={styles.exampleBox}>
                <Info size={16} color={Colors.primary} />
                <Text style={styles.exampleText}>
                  Exemple : Papa chéri, aides-moi à grandir, à avancer et à devenir celle que Tu attends de moi.
                </Text>
              </View>
              <TextInput
                style={styles.textArea}
                placeholder="Écrivez ici vos regrets et ce que vous souhaiteriez améliorer en vous ..."
                placeholderTextColor={Colors.text.muted}
                value={personalImprovement}
                onChangeText={setPersonalImprovement}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Dreams and Desires Section */}
            <View style={styles.inputGroup}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Énoncer vos rêves et désires</Text>
                <Info size={16} color={Colors.primary} />
              </View>
              <View style={styles.exampleBox}>
                <Info size={16} color={Colors.primary} />
                <Text style={styles.exampleText}>
                  Exemple : Donne-moi la force et la sagesse nécessaires pour chaque étape.
                </Text>
              </View>
              <TextInput
                style={styles.textArea}
                placeholder="Écrivez ici vos rêves et désires ..."
                placeholderTextColor={Colors.text.muted}
                value={dreamsDesires}
                onChangeText={setDreamsDesires}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Personal Prayer Section */}
            <View style={styles.inputGroup}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Ma prière personnelle</Text>
                <Info size={16} color={Colors.primary} />
              </View>
              <View style={styles.exampleBox}>
                <Info size={16} color={Colors.primary} />
                <Text style={styles.exampleText}>
                  Exemple : Merci Hashem, je T'aime d'un amour infini, Tu es mon Tout, et il n'y a rien d'autre que toi : אין עוד מלבדו
                </Text>
              </View>
              <TextInput
                style={styles.textArea}
                placeholder="Écrivez ici vos rêves et désires ..."
                placeholderTextColor={Colors.text.muted}
                value={personalPrayer}
                onChangeText={setPersonalPrayer}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Save size={20} color={Colors.white} />
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Modifier la prière' : 'Créer la prière'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <PrayerInstructionsBottomSheet
          visible={showInstructions}
          onClose={() => setShowInstructions(false)}
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  flex: {
    flex: 1,
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
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  modeEmploi: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleSection: {
    paddingVertical: 20,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.background,
  },
  textArea: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.background,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  musicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  musicButton: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 8,
    minWidth: '45%',
  },
  musicButtonSelected: {
    backgroundColor: Colors.primary,
  },
  musicButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicButtonText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  musicButtonTextSelected: {
    color: Colors.white,
  },
  exampleBox: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  exampleText: {
    fontSize: 14,
    color: Colors.primary,
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 8,
  },
});