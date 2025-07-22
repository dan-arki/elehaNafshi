import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, Linking, Image } from 'react-native';
import { X, Navigation, MapPin } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

interface MapSelectionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  locationName?: string;
}

interface MapApp {
  name: string;
  logo: any;
  url: string;
  fallbackUrl?: string;
}

export default function MapSelectionBottomSheet({ 
  visible, 
  onClose, 
  latitude, 
  longitude, 
  locationName = 'Destination' 
}: MapSelectionBottomSheetProps) {

  const mapApps: MapApp[] = [
    {
      name: 'Waze',
      logo: require('../assets/images/wazeLogo.jpg'),
      url: `waze://?ll=${latitude},${longitude}&navigate=yes`,
      fallbackUrl: `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`
    },
    {
      name: 'Apple Maps',
      logo: require('../assets/images/applePlans.png'),
      url: `maps://?q=${latitude},${longitude}`,
      fallbackUrl: `https://maps.apple.com/?q=${latitude},${longitude}`
    },
    {
      name: 'Google Maps',
      logo: require('../assets/images/maps.jpg'),
      url: `comgooglemaps://?q=${latitude},${longitude}`,
      fallbackUrl: `https://maps.google.com/?q=${latitude},${longitude}`
    }
  ];

  const handleMapSelection = async (mapApp: MapApp) => {
    try {
      // First, try to open the native app
      const canOpen = await Linking.canOpenURL(mapApp.url);
      
      if (canOpen) {
        await Linking.openURL(mapApp.url);
      } else if (mapApp.fallbackUrl) {
        // If native app is not available, try the web fallback
        const canOpenFallback = await Linking.canOpenURL(mapApp.fallbackUrl);
        if (canOpenFallback) {
          await Linking.openURL(mapApp.fallbackUrl);
        } else {
          throw new Error('Cannot open map application');
        }
      } else {
        throw new Error('Map application not available');
      }
      
      onClose();
    } catch (error) {
      console.error('Error opening map application:', error);
      Alert.alert(
        'Erreur',
        `Impossible d'ouvrir ${mapApp.name}. Vérifiez que l'application est installée sur votre appareil.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} />
        <View style={styles.bottomSheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Choisir une application de navigation</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Location Info */}
          <View style={styles.locationInfo}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.locationName}>{locationName}</Text>
          </View>
          
          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>Sélectionnez votre application préférée :</Text>
            
            <View style={styles.mapAppsList}>
              {mapApps.map((mapApp, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.mapAppItem}
                  onPress={() => handleMapSelection(mapApp)}
                  activeOpacity={0.7}
                >
                  <View style={styles.mapAppIcon}>
                    <Image 
                      source={mapApp.logo}
                      style={styles.logoImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.mapAppName}>{mapApp.name}</Text>
                  <View style={styles.mapAppArrow}>
                    <Navigation size={16} color={Colors.text.muted} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 Si une application n'est pas installée, elle s'ouvrira dans votre navigateur web.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  divider: {
    height: 2,
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  content: {
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  mapAppsList: {
    marginBottom: 24,
  },
  mapAppItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mapAppIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mapAppName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    flex: 1,
  },
  mapAppArrow: {
    opacity: 0.5,
  },
  logoImage: {
    width: 28,
    height: 28,
  },
  infoBox: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: Colors.primary,
    lineHeight: 20,
  },
});