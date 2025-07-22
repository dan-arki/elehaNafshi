import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Info, ChevronRight } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { getChapters } from '../../services/firestore';
import { PrayerChapter } from '../../types';
import PrayerInfoBottomSheet from '../../components/PrayerInfoBottomSheet';
import { router } from 'expo-router';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';

export default function SiddourScreen() {
  const [showPrayerInfo, setShowPrayerInfo] = useState(false);
  const [chapters, setChapters] = useState<PrayerChapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChapters();
  }, []);

  const loadChapters = async () => {
    try {
      setLoading(true);
      const chaptersData = await getChapters();
      setChapters(chaptersData);
    } catch (error) {
      console.error('Erreur lors du chargement des chapitres:', error);
      // En cas d'erreur, afficher un message à l'utilisateur mais ne pas bloquer l'interface
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateToChapter = (chapterId: string) => {
    router.push(`/chapter/${chapterId}`);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Siddour Eleh'a Nafchi</Text>
          <TouchableOpacity onPress={() => setShowPrayerInfo(true)}>
            <Info size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <AnimatedScreenWrapper animationType="scale" duration={700} style={styles.flex}>
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Siddour Book Image */}
            <View style={styles.bookContainer}>
              <View style={styles.bookCard}>
                <Image
                  source={require('../../assets/images/siddourIllu.png')}
                  style={styles.bookImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Sommaire */}
            <Text style={styles.sectionTitle}>Sommaire</Text>

            {/* Chapter List */}
            <View style={styles.chapterList}>
              {loading ? (
                <Text style={styles.loadingText}>Chargement...</Text>
              ) : (
                chapters.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      Aucune catégorie disponible
                    </Text>
                    <Text style={styles.emptyStateSubtext}>
                      Les catégories du Siddour seront bientôt disponibles.
                    </Text>
                  </View>
                ) :
                chapters.map((chapter) => (
                <TouchableOpacity
                  key={chapter.id}
                  style={styles.chapterItem}
                  onPress={() => navigateToChapter(chapter.id)}
                >
                  <View style={styles.chapterContent}>
                    <Text style={styles.chapterTitle}>{chapter.title}</Text>
                    <Text style={styles.chapterSubtitle}>{chapter.subtitle}</Text>
                  </View>
                  <ChevronRight size={20} color={Colors.text.muted} />
                </TouchableOpacity>
                ))
              )}
            </View>
          </ScrollView>
        </AnimatedScreenWrapper>
        
        <PrayerInfoBottomSheet 
          visible={showPrayerInfo}
          onClose={() => setShowPrayerInfo(false)}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  safeArea: {
    flex: 1,
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 120, // Espace pour la navigation du bas
  },
  bookContainer: {
    alignItems: 'center',
    marginBottom: 32,
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
  bookGradient: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookImage: {
    width: '100%',
    height: '100%',
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  bookSubtitle: {
    fontSize: 12,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 24,
  },
  chapterList: {
    paddingBottom: 20,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  chapterContent: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  chapterSubtitle: {
    fontSize: 14,
    color: Colors.primary,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});