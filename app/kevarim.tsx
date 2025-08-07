import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Navigation, Send, Heart } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { getSiddourSubcategoriesWithPosition, addToFavorites, removeFromFavorites, getFavoritePrayers } from '../services/firestore';
import { Prayer } from '../types';
import MapSelectionBottomSheet from '../components/MapSelectionBottomSheet';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic, triggerErrorHaptic } from '../utils/haptics';

interface KeverLocation {
  id: string;
  name: string;
  position: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
}

export default function KevarimScreen() {
  const { user } = useAuth();
  const [kevarim, setKevarim] = useState<KeverLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [closestKever, setClosestKever] = useState<KeverLocation | null>(null);
  const [favoriteKeverIds, setFavoriteKeverIds] = useState<Set<string>>(new Set());

  const [showMapSelection, setShowMapSelection] = useState(false);
  const [selectedKeverForMap, setSelectedKeverForMap] = useState<KeverLocation | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    loadFavoriteKevarim();
  }, [user]);

  useEffect(() => {
    if (locationPermission) {
      getUserLocation();
    } else {
      loadKevarimWithoutLocation();
    }
  }, [locationPermission]);

  const loadFavoriteKevarim = async () => {
    if (!user) return;
    
    try {
      const favoritePrayers = await getFavoritePrayers(user.uid);
      const favoriteKeverPrayers = favoritePrayers.filter(prayer => prayer.category === 'kever');
      const favoriteIds = new Set(favoriteKeverPrayers.map(prayer => prayer.originalId || prayer.id));
      setFavoriteKeverIds(favoriteIds);
    } catch (error) {
      console.error('Erreur lors du chargement des kevarim favoris:', error);
    }
  };

  const handleToggleFavorite = async (kever: KeverLocation) => {
    if (!user) {
      triggerErrorHaptic();
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour ajouter des favoris',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Créer un compte', onPress: () => router.push('/register') },
          { text: 'Se connecter', onPress: () => router.push('/login') }
        ]
      );
      return;
    }

    triggerMediumHaptic();
    const isFavorite = favoriteKeverIds.has(kever.id);
    
    try {
      if (isFavorite) {
        await removeFromFavorites(user.uid, kever.id);
        setFavoriteKeverIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(kever.id);
          return newSet;
        });
        triggerSuccessHaptic();
        Alert.alert('Succès', 'Kever retiré des favoris');
      } else {
        // Create a Prayer object from the kever data
        const keverAsPrayer: Prayer = {
          id: kever.id,
          title: kever.name,
          subtitle: 'Kever',
          category: 'kever',
          content: {
            hebrew: '',
            french: '',
            phonetic: ''
          },
          isFavorite: false,
          isCustom: false,
          createdAt: new Date(),
          originalId: kever.id,
        };
        
        await addToFavorites(user.uid, keverAsPrayer);
        setFavoriteKeverIds(prev => new Set(prev).add(kever.id));
        triggerSuccessHaptic();
        Alert.alert('Succès', 'Kever ajouté aux favoris');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
      triggerErrorHaptic();
      Alert.alert('Erreur', 'Impossible de mettre à jour les favoris');
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    } catch (error) {
      console.error('Erreur lors de la demande de permission de localisation:', error);
      setLocationPermission(false);
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
      Alert.alert(
        'Erreur de localisation',
        'Impossible de récupérer votre position. La liste sera affichée sans tri par distance.',
        [{ text: 'OK', onPress: loadKevarimWithoutLocation }]
      );
    }
  };

  const loadKevarimWithLocation = async (userLat: number, userLon: number) => {
    try {
      setLoading(true);
      const kevarimData = await getSiddourSubcategoriesWithPosition();
      
      // Calculer la distance pour chaque kever
      const kevarimWithDistance = kevarimData.map(kever => ({
        ...kever,
        distance: calculateDistance(userLat, userLon, kever.position.latitude, kever.position.longitude)
      }));
      
      // Trier par distance (du plus proche au plus loin)
      kevarimWithDistance.sort((a, b) => a.distance! - b.distance!);
      
      setKevarim(kevarimWithDistance);
      
      // Définir le kever le plus proche
      if (kevarimWithDistance.length > 0) {
        setClosestKever(kevarimWithDistance[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des kevarim:', error);
      setKevarim([]);
    } finally {
      setLoading(false);
    }
  };

  const loadKevarimWithoutLocation = async () => {
    try {
      setLoading(true);
      const kevarimData = await getSiddourSubcategoriesWithPosition();
      setKevarim(kevarimData);
      
      // Sans localisation, prendre le premier comme "le plus proche"
      if (kevarimData.length > 0) {
        setClosestKever(kevarimData[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des kevarim:', error);
      setKevarim([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour calculer la distance entre deux points (formule de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Arrondir à 1 décimale
  };

  const formatDistance = (distance?: number): string => {
    if (!distance) return '';
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance}km`;
  };

  const handleOpenMaps = (kever: KeverLocation) => {
    triggerLightHaptic();
    setSelectedKeverForMap(kever);
    setShowMapSelection(true);
  };

  const navigateToKever = (keverId: string) => {
    triggerMediumHaptic();
    router.push(`/kever/${keverId}`);
  };

  const generateMapUrl = (kever: KeverLocation) => {
    // Utilisation de l'API Mapbox Static Images
    // Documentation: https://docs.mapbox.com/api/maps/static-images/
    const accessToken = 'pk.eyJ1IjoiZGFjaG91dnZ2IiwiYSI6ImNtNnRrZW1scDAzZ2gyaXNjb2F3eW45NzIifQ.C3R6xXHdTXtYBMEIS4ICBA';
    const style = 'mapbox/streets-v11'; // Style de carte par défaut
    const zoom = 15;
    const width = 400;
    const height = 200;
    const retina = '@2x'; // Pour une meilleure qualité sur les écrans haute résolution
    
    // Format: https://api.mapbox.com/styles/v1/{username}/{style_id}/static/{overlay}/{lon},{lat},{zoom},{bearing},{pitch}/{width}x{height}{@2x}?access_token={access_token}
    return `https://api.mapbox.com/styles/v1/${style}/static/pin-s-marker+ff0000(${kever.position.longitude},${kever.position.latitude})/${kever.position.longitude},${kever.position.latitude},${zoom}/${width}x${height}${retina}?access_token=${accessToken}`;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            triggerLightHaptic();
            router.back();
          }}>
            <ChevronLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Les kivrei tsadikim</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={{flex: 1}}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Location Status */}
            {!locationPermission && (
              <View style={styles.locationWarning}>
                <MapPin size={20} color={Colors.warning} />
                <Text style={styles.locationWarningText}>
                  Autorisez la localisation pour voir les distances
                </Text>
              </View>
            )}

            {/* Closest Kever Map */}
            {closestKever && (
              <View style={styles.mapSection}>
                <View style={styles.mapHeader}>
                  <MapPin size={20} color={Colors.primary} />
                  <Text style={styles.mapTitle}>{closestKever.name}</Text>
                  {closestKever.distance && (
                    <Text style={styles.mapDistance}>
                      {formatDistance(closestKever.distance)}
                    </Text>
                  )}
                </View>
                
                {/* Placeholder for map - you can replace with actual map component */}
                <View style={styles.mapContainer}>
                  <Image
                    source={{ uri: generateMapUrl(closestKever) }}
                    style={styles.mapImage}
                    resizeMode="cover"
                    onError={() => {
                      // En cas d'erreur (clé API manquante), afficher le placeholder
                      console.warn('Erreur de chargement de la carte. Vérifiez votre clé API Google Maps.');
                    }}
                  />
                  {/* Overlay avec le nom du kever */}
                  <View style={styles.mapOverlay}>
                    <MapPin size={24} color={Colors.white} />
                    <Text style={styles.mapOverlayText}>
                      {closestKever.name}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Sommaire */}
            <Text style={styles.sectionTitle}>Sommaire</Text>

            {/* Kevarim List */}
            {loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Chargement...</Text>
              </View>
            ) : kevarim.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MapPin size={48} color={Colors.text.muted} />
                <Text style={styles.emptyTitle}>Aucun kever trouvé</Text>
                <Text style={styles.emptySubtitle}>
                  Les kevarim avec localisation seront bientôt disponibles
                </Text>
              </View>
            ) : (
              <View style={styles.kevarimList}>
                {kevarim.map((kever) => (
                  <TouchableOpacity
                    key={kever.id}
                    style={styles.keverItem}
                    onPress={() => navigateToKever(kever.id)}
                  >
                    <View style={styles.keverContent}>
                      <View style={styles.keverHeader}>
                        <MapPin size={20} color={Colors.primary} />
                        <View style={styles.keverInfo}>
                          <Text style={styles.keverTitle}>{kever.name}</Text>
                          {kever.distance && (
                            <Text style={styles.keverDistance}>
                              {formatDistance(kever.distance)}
                            </Text>
                          )}
                        </View>
                      </View>
                      <Text style={styles.keverSubtitle}>Consulter</Text>
                    </View>
                    <View style={styles.keverActions}>
                      <TouchableOpacity 
                        style={styles.favoriteButton}
                        onPress={() => handleToggleFavorite(kever)}
                      >
                        <Heart 
                          size={20} 
                          color={favoriteKeverIds.has(kever.id) ? Colors.error : Colors.text.muted}
                          fill={favoriteKeverIds.has(kever.id) ? Colors.error : 'transparent'}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleOpenMaps(kever)}>
                        <Send size={20} color={Colors.text.muted} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>

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
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  locationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  locationWarningText: {
    fontSize: 14,
    color: Colors.warning,
    marginLeft: 8,
    flex: 1,
  },
  mapSection: {
    marginVertical: 16,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
    flex: 1,
  },
  mapDistance: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.background,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapOverlayText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 24,
    marginTop: 16,
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
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  kevarimList: {
    paddingBottom: 32,
  },
  keverItem: {
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
  keverContent: {
    flex: 1,
  },
  keverHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  keverInfo: {
    flex: 1,
    marginLeft: 12,
  },
  keverTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  keverDistance: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  keverSubtitle: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 32,
  },
  keverActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  favoriteButton: {
    padding: 4,
  },
});