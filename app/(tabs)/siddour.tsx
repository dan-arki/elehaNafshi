import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Keyboard, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { ChevronLeft, Info, ChevronRight, Search } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { getChapters, getAllSiddourSubcategoriesForSearch } from '../../services/firestore';
import { PrayerChapter } from '../../types';
import PrayerInfoBottomSheet from '../../components/PrayerInfoBottomSheet';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import { router } from 'expo-router';
import { triggerLightHaptic, triggerMediumHaptic } from '../../utils/haptics';

export default function SiddourScreen() {
  const [showPrayerInfo, setShowPrayerInfo] = useState(false);
  const [chapters, setChapters] = useState<PrayerChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [allSubcategories, setAllSubcategories] = useState<{id: string; title: string; chapterId: string; parentChapterName: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isTappingSuggestion = React.useRef(false);

  useEffect(() => {
    loadChapters();
    loadSubcategoriesForSearch();
  }, []);

  const loadChapters = async () => {
    try {
      setLoading(true);
      const chaptersData = await getChapters();
      setChapters(chaptersData);
    } catch (error) {
      // En cas d'erreur, afficher un message à l'utilisateur mais ne pas bloquer l'interface
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategoriesForSearch = async () => {
    try {
      const subcategories = await getAllSiddourSubcategoriesForSearch();
      setAllSubcategories(subcategories);
    } catch (error) {
      console.error('Erreur lors du chargement des sous-catégories pour la recherche:', error);
    }
  };

  const filteredSubcategories = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    return allSubcategories
      .filter(subcategory => 
        subcategory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subcategory.parentChapterName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 10); // Augmenter à 10 suggestions pour tester le scroll
  }, [searchQuery, allSubcategories]);

  const handleSelectSuggestion = (subcategory: {id: string; title: string; chapterId: string; parentChapterName: string}) => {
    console.log('🔍 [DEBUG] handleSelectSuggestion: Starting navigation to:', subcategory);
    
    // Haptic feedback for selection
    triggerLightHaptic();
    
    // Hide keyboard immediately
    Keyboard.dismiss();
    
    // Hide suggestions immediately
    setShowSuggestions(false);
    setSearchQuery('');
    
    // Reset the tapping state
    isTappingSuggestion.current = false;
    
    // Navigate with a small delay to ensure state updates are processed
    setTimeout(() => {
      console.log('🔍 [DEBUG] handleSelectSuggestion: Executing navigation');
      router.push(`/chapter/${subcategory.chapterId}?subcategoryId=${subcategory.id}`);
    }, 50);
  };

  const handleSuggestionPressIn = () => {
    console.log('🔍 [DEBUG] handleSuggestionPressIn: Setting isTappingSuggestion to true');
    isTappingSuggestion.current = true;
  };

  const handleSuggestionPressOut = () => {
    console.log('🔍 [DEBUG] handleSuggestionPressOut: Resetting isTappingSuggestion after delay');
    // Reset after a short delay to allow onPress to complete
    setTimeout(() => {
      isTappingSuggestion.current = false;
    }, 100);
  };

  const handleSearchInputBlur = () => {
    console.log('🔍 [DEBUG] handleSearchInputBlur: onBlur triggered, isTappingSuggestion:', isTappingSuggestion.current);
    
    // Only hide suggestions if we're not currently tapping a suggestion
    if (!isTappingSuggestion.current) {
      setTimeout(() => {
        console.log('🔍 [DEBUG] handleSearchInputBlur: Hiding suggestions after delay');
        setShowSuggestions(false);
      }, 200);
    }
  };

  const handleSearchInputFocus = () => {
    console.log('🔍 [DEBUG] handleSearchInputFocus: onFocus triggered');
    setShowSuggestions(true);
  };

  const handleSearchQueryChange = (text: string) => {
    console.log('🔍 [DEBUG] handleSearchQueryChange: Search query changed to:', text);
    setSearchQuery(text);
  };

  const navigateToChapter = (chapterId: string) => {
    triggerMediumHaptic();
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

        <View style={{flex: 1}}>
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <AnimatedScreenWrapper animationType="fade" duration={500} delay={0}>
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <Search size={20} color={Colors.text.muted} style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher une prière..."
                    placeholderTextColor={Colors.text.muted}
                    value={searchQuery}
                    onChangeText={handleSearchQueryChange}
                    onFocus={handleSearchInputFocus}
                    onBlur={handleSearchInputBlur}
                  />
                </View>
              </View>
            </AnimatedScreenWrapper>

            {/* Search Suggestions */}
            {showSuggestions && filteredSubcategories.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <ScrollView 
                  style={styles.suggestionsScrollView}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled={true}
                >
                  {filteredSubcategories.map((subcategory) => (
                    <TouchableOpacity
                      key={subcategory.id}
                      style={styles.suggestionItem}
                      onPressIn={handleSuggestionPressIn}
                      onPressOut={handleSuggestionPressOut}
                      onPress={() => handleSelectSuggestion(subcategory)}
                      activeOpacity={0.7}
                    >
                      <Search size={16} color={Colors.text.muted} />
                      <View style={styles.suggestionTextContainer}>
                        <Text style={styles.suggestionText}>{subcategory.title}</Text>
                        <Text style={styles.suggestionParentText}>dans {subcategory.parentChapterName}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <AnimatedScreenWrapper animationType="scale" duration={600} delay={100}>
              {/* Siddour Book Image */}
              <View style={styles.bookContainer}>
                <View style={styles.bookCard}>
                  <Image
                    source={require('../../assets/images/siddourIllu.jpg')}
                    style={styles.bookImage}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </AnimatedScreenWrapper>

            <AnimatedScreenWrapper animationType="slideUp" duration={400} delay={200}>
              {/* Sommaire */}
              <Text style={styles.sectionTitle}>Sommaire</Text>
            </AnimatedScreenWrapper>

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
                <AnimatedScreenWrapper 
                  key={chapter.id} 
                  animationType="slideUp" 
                  duration={400} 
                  delay={300 + (chapters.indexOf(chapter) * 100)}
                >
                  <TouchableOpacity
                    style={styles.chapterItem}
                    onPress={() => navigateToChapter(chapter.id)}
                  >
                    <View style={styles.chapterContent}>
                      <Text style={styles.chapterTitle}>{chapter.title}</Text>
                      <Text style={styles.chapterSubtitle}>{chapter.subtitle}</Text>
                    </View>
                    <ChevronRight size={20} color={Colors.text.primary} />
                  </TouchableOpacity>
                </AnimatedScreenWrapper>
                ))
              )}
            </View>
          </ScrollView>
        </View>
        
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
  searchContainer: {
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    paddingVertical: 12,
  },
  suggestionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Semi-transparent white for blur effect
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, // Slightly stronger shadow for better separation
    shadowRadius: 8, // Larger shadow radius for softer appearance
    maxHeight: 200,
    overflow: 'hidden',
    // Blur effect simulation with enhanced styling
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)', // Subtle purple border matching primary color
  },
  suggestionsScrollView: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5, // Thinner border for subtle separation
    borderBottomColor: 'rgba(139, 92, 246, 0.15)', // Light purple separator
    minHeight: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background for each item
    // Add subtle hover effect simulation
    borderRadius: 0, // Keep rectangular for list items
  },
  suggestionTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionParentText: {
    fontSize: 12,
    color: Colors.primary,
    fontStyle: 'italic',
    opacity: 0.8,
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
    padding: 16,
    height: 80,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.08)',
  },
  chapterContent: {
    flex: 1,
    paddingRight: 12,
  },
  chapterTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text.primary, // Noir pour la lisibilité
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  chapterSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary, // Violet comme demandé
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.9,
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