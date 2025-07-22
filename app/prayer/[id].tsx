import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { getFavoritePrayerByDocId } from '../../services/firestore';
import { Prayer } from '../../types';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';

export default function PrayerDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAndRedirectPrayer();
  }, [id, user]);

  const loadAndRedirectPrayer = async () => {
    if (!id || !user) {
      setError('Paramètres manquants');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [PrayerDetailScreen] Loading favorite prayer with ID:', id);
      const favoritePrayer = await getFavoritePrayerByDocId(id as string);
      
      if (!favoritePrayer) {
        setError('Prière favorite non trouvée');
        setLoading(false);
        return;
      }

      // Vérifier que la prière appartient à l'utilisateur
      if (favoritePrayer.userId && favoritePrayer.userId !== user.uid) {
        setError('Accès non autorisé à cette prière');
        setLoading(false);
        return;
      }

      console.log('✅ [PrayerDetailScreen] Favorite prayer loaded:', {
        title: favoritePrayer.title,
        category: favoritePrayer.category,
        originalId: favoritePrayer.originalId,
        chapterId: favoritePrayer.chapterId
      });

      // Redirection basée sur la catégorie
      switch (favoritePrayer.category) {
        case 'kever':
          console.log('🔄 [PrayerDetailScreen] Redirecting to kever:', favoritePrayer.originalId || favoritePrayer.id);
          router.replace(`/kever/${favoritePrayer.originalId || favoritePrayer.id}`);
          break;
          
        case 'custom':
          console.log('🔄 [PrayerDetailScreen] Redirecting to custom prayer:', favoritePrayer.originalId || favoritePrayer.id);
          router.replace(`/custom-prayer/${favoritePrayer.originalId || favoritePrayer.id}`);
          break;
          
        default:
          // Pour les prières du Siddour (chaharit, minha, arvit, etc.)
          if (favoritePrayer.chapterId) {
            console.log('🔄 [PrayerDetailScreen] Redirecting to chapter:', {
              chapterId: favoritePrayer.chapterId,
              subcategoryId: favoritePrayer.originalId || favoritePrayer.id
            });
            router.replace(`/chapter/${favoritePrayer.chapterId}?subcategoryId=${favoritePrayer.originalId || favoritePrayer.id}`);
          } else {
            console.error('❌ [PrayerDetailScreen] Missing chapterId for Siddour prayer');
            setError('Impossible de localiser cette prière dans le Siddour');
            setLoading(false);
          }
          break;
      }
    } catch (error: any) {
      console.error('❌ [PrayerDetailScreen] Error loading favorite prayer:', error);
      setError('Erreur lors du chargement de la prière');
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AnimatedScreenWrapper animationType="fade" duration={300}>
          <View style={styles.centerContent}>
            <Text style={styles.loadingText}>Chargement de la prière...</Text>
          </View>
        </AnimatedScreenWrapper>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <AnimatedScreenWrapper animationType="fade" duration={300}>
          <View style={styles.centerContent}>
            <Text style={styles.errorTitle}>Erreur</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.backButton} onPress={handleGoBack}>
              Retour aux favoris
            </Text>
          </View>
        </AnimatedScreenWrapper>
      </SafeAreaView>
    );
  }

  // Ce cas ne devrait normalement pas se produire car on redirige
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.loadingText}>Redirection en cours...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  backButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});