import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, Plus, Minus, RotateCcw } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useDisplaySettings } from '../contexts/DisplaySettingsContext';

interface SettingsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  fontSizeAdjustment: number;
  onFontSizeChange: (adjustment: number) => void;
}

export default function SettingsBottomSheet({ 
  visible, 
  onClose, 
  fontSizeAdjustment, 
  onFontSizeChange 
}: SettingsBottomSheetProps) {
  const { hebrewFont, setHebrewFont } = useDisplaySettings();
  const minAdjustment = -4;
  const maxAdjustment = 6;

  const increaseFontSize = () => {
    if (fontSizeAdjustment < maxAdjustment) {
      onFontSizeChange(fontSizeAdjustment + 2);
    }
  };

  const decreaseFontSize = () => {
    if (fontSizeAdjustment > minAdjustment) {
      onFontSizeChange(fontSizeAdjustment - 2);
    }
  };

  const resetFontSize = () => {
    onFontSizeChange(0);
  };

  const resetHebrewFont = () => {
    setHebrewFont('FrankRuhlLibre-Regular');
  };

  const hebrewFontOptions = [
    { key: 'FrankRuhlLibre-Regular', label: 'Frank Ruhl Libre' },
    { key: 'Lato-Regular', label: 'Lato' },
    { key: 'Rubik-Regular', label: 'Rubik' },
    { key: 'Alef-Regular', label: 'Alef' },
    { key: 'Assistant-Regular', label: 'Assistant' },
    { key: 'NotoSansHebrew-Regular', label: 'Noto Sans Hebrew' },
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
            <Text style={styles.title}>Paramètres</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Font Size Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Taille de la police</Text>
              <View style={styles.fontSizeControls}>
                <TouchableOpacity 
                  style={[
                    styles.fontButton, 
                    fontSizeAdjustment <= minAdjustment && styles.fontButtonDisabled
                  ]}
                  onPress={decreaseFontSize}
                  disabled={fontSizeAdjustment <= minAdjustment}
                >
                  <Minus size={20} color={fontSizeAdjustment <= minAdjustment ? Colors.text.muted : Colors.primary} />
                </TouchableOpacity>
                
                <View style={styles.fontSizeDisplay}>
                  <Text style={styles.fontSizeText}>
                    {fontSizeAdjustment > 0 ? `+${fontSizeAdjustment}px` : 
                     fontSizeAdjustment < 0 ? `${fontSizeAdjustment}px` : 'Normal'}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.fontButton, 
                    fontSizeAdjustment >= maxAdjustment && styles.fontButtonDisabled
                  ]}
                  onPress={increaseFontSize}
                  disabled={fontSizeAdjustment >= maxAdjustment}
                >
                  <Plus size={20} color={fontSizeAdjustment >= maxAdjustment ? Colors.text.muted : Colors.primary} />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={styles.resetButton} onPress={resetFontSize}>
                <RotateCcw size={16} color={Colors.primary} />
                <Text style={styles.resetButtonText}>Réinitialiser</Text>
              </TouchableOpacity>
            </View>

            {/* Pronunciation Guide */}
            {/* Hebrew Font Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Police hébraïque</Text>
              <View style={styles.fontOptionsContainer}>
                {hebrewFontOptions.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.fontOption,
                      hebrewFont === option.key && styles.fontOptionActive
                    ]}
                    onPress={() => setHebrewFont(option.key)}
                  >
                    <Text style={[
                      styles.fontOptionText,
                      hebrewFont === option.key && styles.fontOptionTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity style={styles.resetButton} onPress={resetHebrewFont}>
                <RotateCcw size={16} color={Colors.primary} />
                <Text style={styles.resetButtonText}>Réinitialiser la police</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.pronunciationTitle}>Prononciation phonétique</Text>
              
              <View style={styles.pronunciationContent}>
                <Text style={styles.pronunciationItem}>- H = h soufflé = ה</Text>
                <Text style={styles.pronunciationItem}>- H'= h prononcer en guttural Heu = כ/ך/ח</Text>
                <Text style={styles.pronunciationItem}>- Une Voyelle suivie de ' se prononce en guttural = ע</Text>
              </View>
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
    maxHeight: '80%',
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  fontButton: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 8,
  },
  fontButtonDisabled: {
    opacity: 0.5,
  },
  fontSizeDisplay: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  fontSizeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  pronunciationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  pronunciationContent: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
  },
  pronunciationItem: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: 8,
  },
  fontOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  fontOption: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.background,
  },
  fontOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  fontOptionText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  fontOptionTextActive: {
    color: Colors.white,
  },
});