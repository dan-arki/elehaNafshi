import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

interface PrayerInstructionsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function PrayerInstructionsBottomSheet({ visible, onClose }: PrayerInstructionsBottomSheetProps) {
  const instructions = [
    {
      number: '1.',
      title: 'Chéva\'h :',
      content: 'Commencez par louer Hachem pour Sa grandeur, Sa bonté et tout ce qu\'il nous donne ! Reconnaissez Sa puissance et Sa bienveillance.'
    },
    {
      number: '2.',
      title: 'Toda la Hachem:',
      content: 'Remerciez Hachem pour toutes les bénédictions dans votre vie, grandes et petites. Exprimez votre gratitude pour chaque chose, même celles qui semblent insignifiantes.'
    },
    {
      number: '3.',
      title: 'Bakacha clalit :',
      content: 'Faites une demande pour le bien-être de l\'ensemble du peuple d\'Israël, pour sa paix, sa sécurité et son unité.'
    },
    {
      number: '4.',
      title: 'Bakacha personnelle:',
      content: 'Demandez à Hachem la santé, la protection et la sécurité pour vous et vos proches.'
    },
    {
      number: '5.',
      title: 'Sliha :',
      content: 'Demandez pardon pour vos erreurs et vos manquements en vous engageant à vous améliorer. Reconnaissez humblement vos fautes.'
    },
    {
      number: '6.',
      title: 'Téchouva:',
      content: 'Priez pour faire Techouva, le retour vers Hachem et la purification de l\'âme. Demandez l\'aide pour renforcer dans le chemin de la torah'
    },
    {
      number: '7.',
      title: 'Bakacha dans tous les domaines :',
      content: 'Faites toutes vos demandes dans les domaines qui vous tiennent à cœur (projets, réussites, relations, etc.), en les confiant à Hachem.'
    },
    {
      number: '8.',
      title: 'Toda (remerciement final):',
      content: 'Terminez par des remerciements sincères pour tout ce qui a été reçu jusqu\'à présent et pour ce qui sera exaucé.'
    },
    {
      number: '9.',
      title: 'Déclaration d\'amour profonde:',
      content: 'Exprimez à Hachem votre amour et votre confiance. Affirmez que vous savez qu\'il exaucera vos prières uniquement si cela est véritablement pour votre bien. Tout ce qu\'il fait est parfait!'
    }
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
            <Text style={styles.title}>Mode d'emploi</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>pour créer sa propre prière :</Text>
            
            <View style={styles.instructionsList}>
              {instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <Text style={styles.instructionNumber}>{instruction.number}</Text>
                  <View style={styles.instructionContent}>
                    <Text style={styles.instructionTitle}>{instruction.title}</Text>
                    <Text style={styles.instructionText}>{instruction.content}</Text>
                  </View>
                </View>
              ))}
            </View>
            
            <Text style={styles.footer}>pour la gloire d'Hachem</Text>
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
    maxHeight: '85%',
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
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionsList: {
    marginBottom: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginRight: 8,
    minWidth: 20,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 16,
    marginBottom: 20,
  },
});