import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, CreditCard as Edit3, Trash2, ExternalLink } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { getCustomPrayers, deleteCustomPrayer } from '../services/firestore';
import { Prayer } from '../types';
import { router } from 'expo-router';
import PrayerInstructionsBottomSheet from '../components/PrayerInstructionsBottomSheet';
import DeleteConfirmationBottomSheet from '../components/DeleteConfirmationBottomSheet';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic, triggerErrorHaptic } from '../utils/haptics';

export default function MyPrayersScreen() {
  const { user } = useAuth();
  const [customPrayers, setCustomPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [prayerToDelete, setPrayerToDelete] = useState<{id: string, title: string} | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    loadCustomPrayers();
  }, [user]);

  const loadCustomPrayers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const prayers = await getCustomPrayers(user.uid);
      setCustomPrayers(prayers);
    } catch (error) {
      console.error('Erreur lors du chargement des prières:', error);
      // En cas d'erreur, afficher un message informatif
      setCustomPrayers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrayer = () => {
    triggerMediumHaptic();
    router.push('/create-prayer');
  };

  const handleEditPrayer = (prayerId: string) => {
    triggerLightHaptic();
    router.push(`/create-prayer?edit=${prayerId}`);
  };

  const handleDeletePrayer = (prayerId: string, prayerTitle: string) => {
    triggerMediumHaptic();
    setPrayerToDelete({ id: prayerId, title: prayerTitle });
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!user || !prayerToDelete) return;
    
    try {
      setDeleteLoading(true);
      await deleteCustomPrayer(user.uid, prayerToDelete.id);
      setCustomPrayers(prev => prev.filter(prayer => prayer.id !== prayerToDelete.id));
      setShowDeleteConfirmation(false);
      setPrayerToDelete(null);
      triggerSuccessHaptic();
      Alert.alert('Succès', 'Prière supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      triggerErrorHaptic();
      Alert.alert('Erreur', 'Impossible de supprimer la prière');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setPrayerToDelete(null);
  };

  const handleViewPrayer = (prayerId: string) => {
    triggerMediumHaptic();
    router.push(`/custom-prayer/${prayerId}`);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes prières</Text>
          <TouchableOpacity onPress={() => setShowInstructions(true)} style={styles.modeEmploiButton}>
            <Text style={styles.modeEmploiText}>Mode d'emploi</Text>
            <ExternalLink size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={{flex: 1}}>
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Book Image */}
            <View style={styles.bookContainer}>
              <View style={styles.bookCard}>
                <Image
                  source={require('../assets/images/myPriere.jpg')}
                  style={styles.bookImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Sommaire */}
            <Text style={styles.sectionTitle}>Sommaire</Text>

            {/* Create New Prayer Button */}
            <TouchableOpacity style={styles.createButton} onPress={handleCreatePrayer}>
              <Plus size={20} color={Colors.primary} />
              <Text style={styles.createButtonText}>Créer une nouvelle prière</Text>
            </TouchableOpacity>

            {/* Custom Prayers List */}
            {loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Chargement...</Text>
              </View>
            ) : customPrayers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Aucune prière personnalisée</Text>
                <Text style={styles.emptySubtitle}>
                  Créez votre première prière personnalisée en appuyant sur le bouton ci-dessus
                </Text>
              </View>
            ) : (
              <View style={styles.prayersList}>
                {customPrayers.map((prayer) => (
                  <View key={prayer.id} style={styles.prayerItem}>
                    <TouchableOpacity 
                      style={styles.prayerContent}
                      onPress={() => handleViewPrayer(prayer.id)}
                    >
                      <View style={styles.prayerHeader}>
                        <Text style={styles.prayerTitle}>{prayer.title}</Text>
                      </View>
                      {prayer.subtitle && (
                        <Text style={styles.prayerSubtitle}>{prayer.subtitle}</Text>
                      )}
                    </TouchableOpacity>
                    
                    <View style={styles.prayerActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleEditPrayer(prayer.id)}
                      >
                        <Edit3 size={18} color={Colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleDeletePrayer(prayer.id, prayer.title)}
                      >
                        <Trash2 size={18} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>

        <PrayerInstructionsBottomSheet
          visible={showInstructions}
          onClose={() => setShowInstructions(false)}
        />

        <DeleteConfirmationBottomSheet
          visible={showDeleteConfirmation}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          prayerTitle={prayerToDelete?.title || ''}
          loading={deleteLoading}
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
  modeEmploiButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeEmploiText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  bookContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  bookCard: {
    width: 200,
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bookImage: {
    width: '100%',
    height: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  prayersList: {
    paddingBottom: 32,
  },
  prayerItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  prayerContent: {
    flex: 1,
    padding: 16,
  },
  prayerHeader: {
    alignItems: 'flex-start',
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  prayerDate: {
    fontSize: 12,
    color: Colors.text.muted,
  },
  prayerSubtitle: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 8,
  },
  prayerPreview: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  prayerActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
  },
  actionButton: {
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});