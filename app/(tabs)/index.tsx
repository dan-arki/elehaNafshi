import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Keyboard, Linking, Alert, ImageBackground, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Heart, Search, Calendar, MapPin, Send } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import { getAllSiddourSubcategoriesForSearch, getBanners, getSiddourSubcategoriesWithPosition } from '../../services/firestore';
import { Banner } from '../../types';
import { triggerLightHaptic, triggerMediumHaptic } from '../../utils/haptics';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';
import * as Location from 'expo-location';
import { calculateDistance, formatDistance, generateMapUrl } from '../../utils/locationUtils';
import MapSelectionBottomSheet from '../../components/MapSelectionBottomSheet';

interface KeverLocation {
  id: string;
  name: string;
  position: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
}

export default function HomeScreen() {
  console.log('[index.tsx] Début du rendu de l\'écran d\'accueil');
  const { user } = useAuth();
  const [hebrewDate, setHebrewDate] = useState<string>("Chargement...");
  const userName = user?.displayName || user?.email?.split('@')[0] || "Shalom 👋";
  const userGreeting = user?.displayName ? `Bonjour ${user.displayName}` : "Shalom 👋";
  
  const [searchQuery, setSearchQuery] = useState('');
  const [allSubcategories, setAllSubcategories] = useState<{id: string; title: string; chapterId: string; parentChapterName: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isTappingSuggestion = useRef(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [closestKever, setClosestKever] = useState<KeverLocation | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [showMapSelection, setShowMapSelection] = useState(false);
  const [selectedKeverForMap, setSelectedKeverForMap] = useState<KeverLocation | null>(null);

  useEffect(() => {
    console.log('[index.tsx] Chargement des sous-catégories et de la date hébraïque');
    loadSubcategoriesForSearch();
    loadHebrewDate();
    loadBanners();
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        getUserLocation();
      } else {
        loadKevarimWithoutLocation();
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission de localisation:', error);
      loadKevarimWithoutLocation();
    }
  };

  const getUserLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      loadKevarimWithLocation(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Erreur lors de la récupération de la position:', error);
      loadKevarimWithoutLocation();
    }
  };

  const loadKevarimWithLocation = async (userLat: number, userLon: number) => {
    try {
      setLoadingLocation(true);
      const kevarimData = await getSiddourSubcategoriesWithPosition();
      
      // Calculate distance for each kever
      const kevarimWithDistance = kevarimData.map(kever => ({
        ...kever,
        distance: calculateDistance(userLat, userLon, kever.position.latitude, kever.position.longitude)
      }));
      
      // Sort by distance (closest first)
      kevarimWithDistance.sort((a, b) => a.distance! - b.distance!);
      
      // Set the closest kever
      if (kevarimWithDistance.length > 0) {
        setClosestKever(kevarimWithDistance[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des kevarim:', error);
      setClosestKever(null);
    } finally {
      setLoadingLocation(false);
    }
  };

  const loadKevarimWithoutLocation = async () => {
    try {
      setLoadingLocation(true);
      const kevarimData = await getSiddourSubcategoriesWithPosition();
      
      // Without location, take the first kever as "closest"
      if (kevarimData.length > 0) {
        setClosestKever(kevarimData[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des kevarim:', error);
      setClosestKever(null);
    } finally {
      setLoadingLocation(false);
    }
  };

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

  const loadBanners = async () => {
    try {
      setLoadingBanners(true);
      const bannersData = await getBanners();
    } catch (error) {
      console.error('Erreur lors du chargement des bannières:', error);
      setBanners([]);
    } finally {
      setLoadingBanners(false);
    }
  };

  const filteredSubcategories = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    return allSubcategories
      .filter(subcategory => 
        subcategory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subcategory.parentChapterName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 10); // Augmenter à 10 suggestions pour démontrer le scroll
  }, [searchQuery, allSubcategories]);

  const handleSelectSuggestion = (subcategory: {id: string; title: string; chapterId: string; parentChapterName: string}) => {
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
      router.push(`/chapter/${subcategory.chapterId}?subcategoryId=${subcategory.id}`);
    }, 50);
  };

  const handleSuggestionPressIn = () => {
    isTappingSuggestion.current = true;
  };

  const handleSuggestionPressOut = () => {
    // Reset after a short delay to allow onPress to complete
    setTimeout(() => {
      isTappingSuggestion.current = false;
    }, 100);
  };

  const handleSearchInputBlur = () => {
    // Only hide suggestions if we're not currently tapping a suggestion
    if (!isTappingSuggestion.current) {
      setTimeout(() => {
        setShowSuggestions(false);
      }, 200);
    }
  };

  const handleSearchInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleSearchQueryChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleBannerPress = async (banner: Banner) => {
    triggerMediumHaptic();
    try {
      const canOpen = await Linking.canOpenURL(banner.link);
      if (canOpen) {
        await Linking.openURL(banner.link);
      } else {
        Alert.alert('Erreur', 'Impossible d\'ouvrir ce lien');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du lien:', error);
      Alert.alert('Erreur', 'Impossible d\'ouvrir ce lien');
    }
  };

  const handleOpenMaps = (kever: KeverLocation) => {
    triggerLightHaptic();
    setSelectedKeverForMap(kever);
    setShowMapSelection(true);
  };

  const navigateToKevarim = () => {
    triggerMediumHaptic();
    router.push('/(tabs)/index/kevarim');
  };

  const navigateToFavorites = () => {
    triggerMediumHaptic();
    router.push('/(tabs)/index/favorites');
  };

  const navigateToSiddour = () => {
    triggerMediumHaptic();
    router.push('/(tabs)/siddour');
  };

  return (
    <ImageBackground
      source={require('../../assets/images/bannerNuages.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.8)', Colors.white]}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.gradientOverlay}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <AnimatedScreenWrapper animationType="fade" duration={500} delay={0}>
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
                
                {/* Hebrew Date in Header */}
                <View style={styles.hebrewDateContainer}>
                  <View style={styles.hebrewDateIcon}> 
                    <Calendar size={16} color={Colors.white} />
                  </View>
                  <View style={styles.hebrewDateTextContainer}>
                    <Text style={styles.hebrewDateLabel}>Date hébraïque</Text>
                    <Text style={styles.hebrewDateText}>{hebrewDate}</Text>
                  </View>
                </View>

              </View>

            {/* Enhanced Search Bar */}
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

            {/* Enhanced Search Suggestions */}
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
            </AnimatedScreenWrapper>

            {/* Bannières Section */}
            {!loadingBanners && banners.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Actualités</Text>

                {/* Bannières Carousel */}
                <ScrollView 
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.bannersContainer}
                  contentContainerStyle={styles.bannersContent}
                >
                  {banners.map((banner, index) => (
                    <AnimatedScreenWrapper key={banner.id} animationType="slideUp" duration={400} delay={index * 50 + 100}>
                      <TouchableOpacity
                        style={[styles.bannerCard, index === banners.length - 1 && styles.lastBannerCard]}
                        onPress={() => handleBannerPress(banner)}
                      >
                        <Image
                          source={{ uri: banner.image }}
                          style={styles.bannerImage}
                          resizeMode="cover"
                        />
                        <View style={styles.bannerOverlay}>
                          <Text style={styles.bannerTitle} numberOfLines={2}>
                            {banner.title}
                          </Text>
                          {banner.description && (
                            <Text style={styles.bannerDescription} numberOfLines={2}>
                              {banner.description}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    </AnimatedScreenWrapper>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Fallback - Section Kevarim si pas de bannières */}
            {(loadingBanners || banners.length === 0) && (
              <AnimatedScreenWrapper animationType="slideUp" duration={400} delay={100}>
                <>
                  <TouchableOpacity style={styles.kevarimSection} onPress={navigateToKevarim}>
                    <Text style={styles.kevarimTitle}>Les kivrei tsadikim</Text>
                    <ChevronRight size={20} color={Colors.text.primary} />
                  </TouchableOpacity>
                  
                  {loadingLocation ? (
                    <View style={styles.kevarimCard}>
                      <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Chargement du kever le plus proche...</Text>
                      </View>
                    </View>
                  ) : closestKever ? (
                    <View style={styles.closestKeverCard}>
                      <Image
                        source={{ uri: generateMapUrl(closestKever.position.latitude, closestKever.position.longitude) }}
                        style={styles.closestKeverImage}
                        resizeMode="cover"
                      />
                      <View style={styles.closestKeverOverlay}>
                        <View style={styles.closestKeverInfo}>
                          <View style={styles.closestKeverHeader}>
                            <MapPin size={16} color={Colors.white} />
                            <Text style={styles.closestKeverTitle}>{closestKever.name}</Text>
                          </View>
                          {closestKever.distance && userLocation && (
                            <Text style={styles.closestKeverDistance}>
                              {formatDistance(closestKever.distance)}
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity 
                          style={styles.getDirectionsButton}
                          onPress={() => handleOpenMaps(closestKever)}
                        >
                          <Send size={16} color={Colors.primary} />
                          <Text style={styles.getDirectionsButtonText}>S'y rendre</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.kevarimCard}>
                      <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Aucun kever disponible</Text>
                      </View>
                    </View>
                  )}
                </>
              </AnimatedScreenWrapper>
            )}

            {/* Mes Essentiels */}
            <AnimatedScreenWrapper animationType="slideUp" duration={400} delay={200}>
              <Text style={styles.sectionTitle}>Mes essentiels</Text>
              <View style={styles.essentialsContainer}>
                <TouchableOpacity style={styles.essentialCard} onPress={navigateToSiddour}>
                  <Image
                    source={require('../../assets/images/siddourIllu.jpg')}
                    style={styles.essentialImage}
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.essentialCard} onPress={() => router.push('/(tabs)/profile/my-prayers')}>
                  <Image
                    source={require('../../assets/images/myPriere.jpg')}
                    style={styles.essentialImage}
                  />
                </TouchableOpacity>
              </View>
            </AnimatedScreenWrapper>

            {/* Autres Section */}
            <AnimatedScreenWrapper animationType="slideUp" duration={400} delay={300}>
              <TouchableOpacity style={styles.favoriteSection} onPress={navigateToFavorites}>
                <Heart size={20} color={Colors.primary} />
                <View style={styles.favoriteContent}>
                  <Text style={styles.favoriteTitle}>Mes prières favorites</Text>
                  <Text style={styles.favoriteSubtitle}>Consulter</Text>
                </View>
                <ChevronRight size={20} color={Colors.text.muted} />
              </TouchableOpacity>
            </AnimatedScreenWrapper>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {selectedKeverForMap && (
        <MapSelectionBottomSheet
          visible={showMapSelection}
          onClose={() => {
            setShowMapSelection(false);
            setSelectedKeverForMap(null);
          }}
          latitude={selectedKeverForMap.position.latitude}
          longitude={selectedKeverForMap.position.longitude}
          locationName={selectedKeverForMap.name}
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  gradientOverlay: {
    flex: 1,
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
    flex: 1,
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
  hebrewDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  hebrewDateIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  hebrewDateIconText: {
    fontSize: 16,
  },
  hebrewDateTextContainer: {
    alignItems: 'flex-end',
  },
  hebrewDateLabel: {
    fontSize: 10,
    color: Colors.text.muted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hebrewDateText: {
    fontSize: 12,
    color: Colors.text.primary,
    fontWeight: '600',
    marginTop: 1,
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
  closestKeverCard: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  closestKeverImage: {
    width: '100%',
    height: '100%',
  },
  closestKeverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  closestKeverInfo: {
    flex: 1,
    marginRight: 12,
  },
  closestKeverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  closestKeverTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 6,
    flex: 1,
  },
  closestKeverDistance: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  getDirectionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  getDirectionsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  bannersContainer: {
    marginBottom: 32,
  },
  bannersContent: {
    paddingHorizontal: 20,
  },
  bannerCard: {
    width: 280,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  lastBannerCard: {
    marginRight: 20,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
    lineHeight: 20,
  },
  bannerDescription: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    lineHeight: 18,
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
    height: 220,
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