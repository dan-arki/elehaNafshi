import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { X, Trash2, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { triggerLightHaptic, triggerMediumHaptic } from '../utils/haptics';

interface DeleteConfirmationBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  prayerTitle: string;
  loading?: boolean;
}

export default function DeleteConfirmationBottomSheet({ 
  visible, 
  onClose, 
  onConfirm, 
  prayerTitle,
  loading = false
}: DeleteConfirmationBottomSheetProps) {

  const handleCancel = () => {
    triggerLightHaptic();
    onClose();
  };

  const handleConfirm = () => {
    triggerMediumHaptic();
    onConfirm();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={handleCancel} />
        <View style={styles.bottomSheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <AlertTriangle size={24} color={Colors.error} />
              <Text style={styles.title}>Supprimer la prière</Text>
            </View>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Content */}
          <View style={styles.content}>
            <View style={styles.prayerPreview}>
              <Text style={styles.prayerTitle} numberOfLines={2}>
                "{prayerTitle}"
              </Text>
            </View>
            
            <Text style={styles.confirmationText}>
              Êtes-vous sûr de vouloir supprimer définitivement cette prière ? 
              Cette action est irréversible.
            </Text>
            
            <Text style={styles.warningText}>
              ⚠️ Toutes les données de cette prière seront perdues
            </Text>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.deleteButton, loading && styles.deleteButtonDisabled]} 
              onPress={handleConfirm}
              disabled={loading}
            >
              <Trash2 size={18} color={Colors.white} />
              <Text style={styles.deleteButtonText}>
                {loading ? 'Suppression...' : 'Supprimer'}
              </Text>
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
    paddingBottom: 20,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.error,
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  prayerPreview: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.text.muted,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: Colors.error,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 8,
  },
});