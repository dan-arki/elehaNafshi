import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useGlobalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { triggerLightHaptic } from '../../utils/haptics';

export default function PrayerDetailScreen() {
  const params = useGlobalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    redirectToPrayer();
  }, [params, user]);

  const redirectToPrayer = async () => {
    if (!params.id || !user) {
      setError('Paramètres manquants');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [PrayerDetailScreen] Redirecting with params:', params);
      
      // Extract navigation parameters from URL params
      const category = params.category as string;
      const originalId = params.originalId as string;
      const chapterId = params.chapterId as string;
      const title = params.title as string;
      
      if (!category || !originalId) {
        setError('Paramètres de navigation manquants');
        setLoading(false);
        return;
      }


      // Redirection basée sur la catégorie
      switch (category) {
        case 'kever':
          router.replace(`/kever/${originalId}`);
          break;
          
        case 'custom':
          router.replace(`/custom-prayer/${originalId}`);
          break;
          
        default:
          // Pour les prières du Siddour (chaharit, minha, arvit, etc.)
          if (chapterId) {
            router.replace(`/chapter/${chapterId}?subcategoryId=${originalId}`);
          } else {
            setError('Impossible de localiser cette prière dans le Siddour');
            setLoading(false);
          }
          break;
      }
    } catch (error: any) {
      console.error('Error redirecting to prayer:', error);
      setError('Erreur lors du chargement de la prière');
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    triggerLightHaptic();
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{flex: 1}}>
          <View style={styles.centerContent}>
            <Text style={styles.loadingText}>Chargement de la prière...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{flex: 1}}>
          <View style={styles.centerContent}>
            <Text style={styles.errorTitle}>Erreur</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.backButton} onPress={handleGoBack}>
              Retour aux favoris
            </Text>
          </View>
        </View>
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