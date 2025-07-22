import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image } from 'react-native';
import { X, Gift, Leaf } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

interface SymbolsInfoBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function SymbolsInfoBottomSheet({ visible, onClose }: SymbolsInfoBottomSheetProps) {
  const symbols = [
    {
      name: 'Obligatoire',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/eleha-nafchi-vvurlg.firebasestorage.app/o/TEFILA-OBLIGATOIRE.png?alt=media&token=252bd7d2-6e92-4669-b0bf-2bd20d9831bb',
      useImage: true,
    },
    {
      name: 'Chabbat',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/eleha-nafchi-vvurlg.firebasestorage.app/o/CHABBAT.png?alt=media&token=0dc041fd-b0b2-4f82-967e-6565ac79e85a',
      useImage: true,
    },
    {
      name: 'Facultatif',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/eleha-nafchi-vvurlg.firebasestorage.app/o/CADEAU.png?alt=media&token=af112b17-5917-4084-99ae-e400206a94d4',
      useImage: true,
    },
    {
      name: 'Souccot',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/eleha-nafchi-vvurlg.firebasestorage.app/o/SOUCCOT.png?alt=media&token=75ac87b6-69be-49ee-871b-19718e96eb90',
      useImage: true,
    },
    {
      name: 'Optionnel',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/eleha-nafchi-vvurlg.firebasestorage.app/o/TEFILA-OBLIGATOIRE.png?alt=media&token=252bd7d2-6e92-4669-b0bf-2bd20d9831bb',
      useImage: true,
    },
    {
      name: 'H\'anoucca',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/eleha-nafchi-vvurlg.firebasestorage.app/o/HANOUCCA.png?alt=media&token=1c731bde-aeed-4617-8606-36f557c73155',
      useImage: true,
    },
    {
      name: 'Roch Hodech',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/eleha-nafchi-vvurlg.firebasestorage.app/o/rochHodech.png?alt=media&token=e25c8827-9d22-444e-a72b-608232c90a6d',
      useImage: true,
    },
    {
      name: 'Pourim',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/eleha-nafchi-vvurlg.firebasestorage.app/o/POURIM.png?alt=media&token=43ced1a2-2217-4635-a26a-28514e6d875a',
      useImage: true,
    },
    {
      name: 'Yom tov',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/eleha-nafchi-vvurlg.firebasestorage.app/o/YOM-TOV.png?alt=media&token=d833aa99-fa1a-44bc-982a-e509aef81606',
      useImage: true,
    },
    {
      name: 'Pessah',
      imageUrl: 'https://firebasestorage.googleapis.com/v0/b/eleha-nafchi-vvurlg.firebasestorage.app/o/PICTO-PESSAH.png?alt=media&token=df5583f6-bdc5-4456-96f2-db0e5aef5ed8',
      useImage: true,
    },
  ];

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
            <Text style={styles.title}>Signification des symboles</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.symbolsGrid}>
              {symbols.map((symbol, index) => (
                <View key={index} style={styles.symbolItem}>
                  <View style={styles.symbolIconContainer}>
                    {symbol.useImage ? (
                      <Image
                        source={{ uri: symbol.imageUrl }}
                        style={styles.symbolImage}
                        resizeMode="contain"
                      />
                    ) : (
                      symbol.icon && <symbol.icon size={32} color={Colors.primary} />
                    )}
                  </View>
                  <Text style={styles.symbolName}>{symbol.name}</Text>
                </View>
              ))}
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
    marginBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
  },
  symbolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  symbolItem: {
    width: '45%',
    alignItems: 'center',
    marginBottom: 24,
  },
  symbolIconContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  symbolImage: {
    width: 50,
    height: 50,
  },
  symbolName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    textAlign: 'center',
  },
});