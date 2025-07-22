import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

interface PrayerInfoBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function PrayerInfoBottomSheet({ visible, onClose }: PrayerInfoBottomSheetProps) {
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
            <Text style={styles.title}>Liste des prières obligatoires</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>La femme a l'obligation de prier :</Text>
            
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Moda ani page 24 à la Brah'a de la Torah page 52</Text>
              <Text style={styles.bulletPoint}>• Chéma' page 112 : les 3 premiers paragraphes ;</Text>
              <Text style={styles.bulletPoint}>• Et une A'mida par jour page 132.</Text>
            </View>
            
            <Text style={styles.paragraph}>
              Vous avez la possibilité, et c'est préférable, de réciter la A'mida le{'\n'}
              matin (chah'arit). Si vous n'avez pas eu le temps de le faire, vous{'\n'}
              pouvez encore la réciter à Minh'a ou à A'rvit.
            </Text>
            
            <Text style={styles.paragraph}>
              Dans des cas vraiment exceptionnels, comme lors d'un voyage, d'un{'\n'}
              accouchement ou de toute autre situation qui vous empêche de réciter{'\n'}
              la A'mida complète, j'ai ajouté en page 436 une version abrégée. Cela{'\n'}
              vous permettra de ne pas passer une journée sans réciter cette prière{'\n'}
              essentielle.
            </Text>
            
            <Text style={styles.paragraph}>
              Cependant, il est important de noter que cette A'mida abrégée doit{'\n'}
              rester une solution de dépannage exceptionnel et ne doit en aucun{'\n'}
              cas devenir une habitude.
            </Text>
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
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  bulletPoints: {
    marginBottom: 20,
  },
  bulletPoint: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
    marginBottom: 20,
  },
});