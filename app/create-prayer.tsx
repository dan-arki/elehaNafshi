import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Save, X, Info } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { createCustomPrayer, updateCustomPrayer } from '../services/firestore';
import { router, useLocalSearchParams } from 'expo-router';
import AnimatedScreenWrapper from '../components/AnimatedScreenWrapper';
import PrayerInstructionsBottomSheet from '../components/PrayerInstructionsBottomSheet';

export default function CreatePrayerScreen() {
  const { edit } = useLocalSearchParams();
  const { user } = useAuth();
  const isEditing = !!edit;
  
  const [prayerName, setPrayerName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [gratitudeText, setGratitudeText] = useState('');
  const [refouahNames, setRefouahNames] = useState('');
  const [personalImprovement, setPersonalImprovement] = useState('');
  const [dreamsDesires, setDreamsDesires] = useState('');
  const [personalPrayer, setPersonalPrayer] = useState('');

  const [showInstructions, setShowInstructions] = useState(false);

  const musicOptions = [
    'Musique 1',
    'Musique 2', 
    'Musique 3',
    'Musique 4',
    'Musique 5'
  ];

  useEffect(() => {
    if (isEditing) {
      // Ici vous chargeriez les données de la prière à éditer
      setPrayerName('Ma prière du matin');
      setDescription('Prière personnelle');
      setSelectedMusic('Musique 1');
      setGratitudeText('Merci HACHEM pour chaque moment de vie...');
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour créer une prière');
      return;
    }
    
    if (!prayerName.trim()) {
      Alert.alert('Erreur', 'Le nom de votre prière est obligatoire');
      return;
    }

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
        musicSelection: selectedMusic,
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

      Alert.alert(
        'Succès',
        isEditing ? 'Prière modifiée avec succès' : 'Prière créée avec succès',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible de sauvegarder la prière';
      Alert.alert('Erreur', errorMessage);
    }
  };

  const handleCancel = () => {
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

        <AnimatedScreenWrapper animationType="slideUp" duration={500} style={styles.flex}>
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
                {musicOptions.map((music, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.musicButton,
                      selectedMusic === music && styles.musicButtonSelected
                    ]}
                    onPress={() => setSelectedMusic(music)}
                  >
                    <Text style={[
                      styles.musicButtonText,
                      selectedMusic === music && styles.musicButtonTextSelected
                    ]}>
                      {music}
                    </Text>
                  </TouchableOpacity>
                ))}
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
        </AnimatedScreenWrapper>

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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 8,
  },
  musicButtonSelected: {
    backgroundColor: Colors.primary,
  },
  musicButtonText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
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