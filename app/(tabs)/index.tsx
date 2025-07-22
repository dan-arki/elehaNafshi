import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Heart, Search } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import { getAllSiddourSubcategoriesForSearch } from '../../services/firestore';

export default function HomeScreen() {
  console.log('[index.tsx] Début du rendu de l\'écran d\'accueil');
  const { user } = useAuth();
  const [hebrewDate, setHebrewDate] = useState<string>("Chargement...");
  const userName = user?.displayName || user?.email?.split('@')[0] || "Shalom 👋";
  const userGreeting = user?.displayName ? `Bonjour ${user.displayName}` : "Bienvenue";
  
  const [searchQuery, setSearchQuery] = useState('');
  const [allSubcategories, setAllSubcategories] = useState<{id: string; title: string; chapterId: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isTappingSuggestion = useRef(false);

  useEffect(() => {
    console.log('[index.tsx] Chargement des sous-catégories et de la date hébraïque');
    loadSubcategoriesForSearch();
    loadHebrewDate();
  }, []);

  const loadHebrewDate = async () => {
    try {
      // Utiliser l'API Hebcal pour récupérer la date hébraïque
      const today = new Date();
      const response = await fetch(`https://www.hebcal.com/converter?cfg=json&gy=${today.getFullYear()}&gm=${today.getMonth() + 1}&gd=${today.getDate()}&g2h=1`);
      const data = await response.json();
      
      if (data && data.hd && data.hm && data.hy) {
        // Formater la date en français
        const hebrewMonths = [
          'Tichri', 'Heshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar',
          'Nissan', 'Iyar', 'Sivan', 'Tamuz', 'Av', 'Elul'
        ];
        
        const monthName = hebrewMonths[data.hm - 1] || data.hm;
        setHebrewDate(`${String(data.hd)} ${String(monthName)} ${String(data.hy)}`);
      } else {
        setHebrewDate("21 Tamuz 5785"); // Fallback
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la date hébraïque:', error);
      setHebrewDate("21 Tamuz 5785"); // Fallback en cas d'erreur
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

  const filteredSubcategories = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    return allSubcategories
      .filter(subcategory => 
        subcategory.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5); // Limiter à 5 suggestions
  }, [searchQuery, allSubcategories]);

  const handleSelectSuggestion = (subcategory: {id: string; title: string; chapterId: string}) => {
    console.log('🔍 [DEBUG] handleSelectSuggestion: Starting navigation to:', subcategory);
    
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


  const navigateToKevarim = () => {
    router.push('/kevarim');
  };

  const navigateToFavorites = () => {
    router.push('/favorites');
  };

  const navigateToSiddour = () => {
    router.push('/(tabs)/siddour');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.profileContainer}>
                <Image
                  source={{ uri: 'https://cdn.vectorstock.com/i/preview-1x/52/71/default-placeholder-profile-icon-vector-14065271.jpg' }}
                  style={styles.profileImage}
                />
                <View>
                  <Text style={styles.greeting}>{userName}</Text>
                  <Text style={styles.username}>{String(userGreeting)}</Text>
                </View>
              </View>
              
              {/* Search Bar */}
              <View style={styles.searchBarContainer}>
                <Search size={16} color={Colors.text.muted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Chercher une prière"
                  placeholderTextColor={Colors.text.muted}
                  value={searchQuery}
                  onChangeText={handleSearchQueryChange}
                  onFocus={handleSearchInputFocus}
                  onBlur={handleSearchInputBlur}
                />
              </View>
            </View>

            {/* Search Suggestions */}
            {showSuggestions && filteredSubcategories.length > 0 && (
              <View style={styles.suggestionsContainer}>
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
                    <Text style={styles.suggestionText}>{subcategory.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Hebrew Date */}
            <Text style={styles.hebrewDate}>{hebrewDate}</Text>

            {/* Kevarim Section */}
            <TouchableOpacity style={styles.kevarimSection} onPress={navigateToKevarim}>
              <Text style={styles.kevarimTitle}>Les kivrei tsadikim</Text>
              <ChevronRight size={20} color={Colors.text.primary} />
            </TouchableOpacity>

            {/* Kevarim Image Card */}
            <View style={styles.kevarimCard}>
              <Image
                source={{ uri: 'https://images.pexels.com/photos/8919544/pexels-photo-8919544.jpeg?auto=compress&cs=tinysrgb&w=800' }}
                style={styles.kevarimImage}
              />
              <View style={styles.kevarimOverlay}>
                <Text style={styles.kevarimCardTitle}>Test 2</Text>
              </View>
            </View>

            {/* Mes Essentiels */}
            <Text style={styles.sectionTitle}>Mes essentiels</Text>
            <View style={styles.essentialsContainer}>
              <TouchableOpacity style={styles.essentialCard} onPress={navigateToSiddour}>
                <Image
                  source={require('../../assets/images/siddourIllu.jpg')}
                  style={styles.essentialImage}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.essentialCard} onPress={() => router.push('/my-prayers')}>
                <Image
                  source={require('../../assets/images/myPriere.jpg')}
                  style={styles.essentialImage}
                />
              </TouchableOpacity>
            </View>

            {/* Autres Section */}
            <Text style={styles.sectionTitle}>Autres</Text>
            <TouchableOpacity style={styles.favoriteSection} onPress={navigateToFavorites}>
              <Heart size={20} color={Colors.primary} />
              <View style={styles.favoriteContent}>
                <Text style={styles.favoriteTitle}>Mes prières favorites</Text>
                <Text style={styles.favoriteSubtitle}>Consulter</Text>
              </View>
              <ChevronRight size={20} color={Colors.text.muted} />
            </TouchableOpacity>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Extra space for tab bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  username: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minWidth: 140,
    maxWidth: 180,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    paddingVertical: 4,
    marginLeft: 8,
  },
  suggestionsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 8,
  },
  hebrewDate: {
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 24,
  },
  kevarimSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  kevarimTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  kevarimCard: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
  },
  kevarimImage: {
    width: '100%',
    height: '100%',
  },
  kevarimOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
  },
  kevarimCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  essentialsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  essentialCard: {
    flex: 1,
    height: 196.15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  essentialImage: {
    width: '100%',
    height: '100%',
  },
  essentialOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 12,
  },
  essentialTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
  },
  essentialSubtitle: {
    fontSize: 10,
    color: Colors.white,
    opacity: 0.9,
  },
  favoriteSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  favoriteContent: {
    flex: 1,
    marginLeft: 12,
  },
  favoriteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  favoriteSubtitle: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 2,
  },
});