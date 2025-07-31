import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { X, RotateCcw, Move } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useDisplaySettings, DisplayModeOption } from '../contexts/DisplaySettingsContext';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic } from '../utils/haptics';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface DisplayModeReorderBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function DisplayModeReorderBottomSheet({ 
  visible, 
  onClose 
}: DisplayModeReorderBottomSheetProps) {
  const { displayModeOrder, setDisplayModeOrder, resetDisplayModeOrder } = useDisplaySettings();
  const [localOrder, setLocalOrder] = useState<DisplayModeOption[]>(displayModeOrder);

  const handleSave = () => {
    triggerSuccessHaptic();
    setDisplayModeOrder(localOrder);
    onClose();
  };

  const handleReset = () => {
    triggerMediumHaptic();
    Alert.alert(
      'Réinitialiser l\'ordre',
      'Voulez-vous vraiment réinitialiser l\'ordre des modes d\'affichage ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: () => {
            resetDisplayModeOrder();
            setLocalOrder([...displayModeOrder]);
            triggerSuccessHaptic();
          },
        },
      ]
    );
  };

  const handleClose = () => {
    triggerLightHaptic();
    // Reset local order to saved order when closing without saving
    setLocalOrder(displayModeOrder);
    onClose();
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<DisplayModeOption>) => {
    return (
      <TouchableOpacity
        style={[
          styles.tagItem,
          isActive && styles.tagItemActive
        ]}
        onLongPress={() => {
          triggerMediumHaptic();
          drag();
        }}
        delayLongPress={500}
      >
        <View style={styles.tagContent}>
          <Text style={[
            styles.tagText,
            isActive && styles.tagTextActive
          ]}>
            {item.label}
          </Text>
          <Move size={16} color={isActive ? Colors.white : Colors.text.muted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={handleClose} />
        <View style={styles.bottomSheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Personnaliser l'ordre des modes</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              Appuyez longuement et faites glisser pour réorganiser les modes d'affichage
            </Text>
          </View>
          
          {/* Content */}
          <View style={styles.content}>
            <GestureHandlerRootView style={styles.gestureContainer}>
              <DraggableFlatList
                data={localOrder}
                onDragEnd={({ data }) => {
                  triggerLightHaptic();
                  setLocalOrder(data);
                }}
                keyExtractor={(item) => item.key}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
              />
            </GestureHandlerRootView>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <RotateCcw size={16} color={Colors.primary} />
              <Text style={styles.resetButtonText}>Réinitialiser</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 16,
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  content: {
    paddingHorizontal: 20,
    flex: 1,
    minHeight: 300,
  },
  gestureContainer: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  tagItem: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.background,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tagItemActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    elevation: 8,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    transform: [{ scale: 1.02 }],
  },
  tagContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  tagText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  tagTextActive: {
    color: Colors.white,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  resetButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});