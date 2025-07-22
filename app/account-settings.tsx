import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, LogOut, Trash2 } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import AnimatedScreenWrapper from '../components/AnimatedScreenWrapper';

export default function AccountSettingsScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
              Alert.alert('Erreur', 'Impossible de se déconnecter');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible et toutes vos données seront perdues.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            // Ici vous pourrez ajouter la logique de suppression du compte
            Alert.alert('Information', 'La suppression de compte sera bientôt disponible.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paramètres du compte</Text>
          <View style={styles.headerSpacer} />
        </View>

        <AnimatedScreenWrapper animationType="slideUp" duration={500} style={styles.flex}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Account Actions */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Actions du compte</Text>
              
              {/* Logout Button */}
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <LogOut size={20} color={Colors.error} />
                <Text style={[styles.menuText, styles.logoutText]}>Se déconnecter</Text>
              </TouchableOpacity>

              {/* Delete Account Button */}
              <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
                <Trash2 size={20} color={Colors.error} />
                <Text style={[styles.menuText, styles.deleteText]}>Supprimer le compte</Text>
              </TouchableOpacity>
            </View>

            {/* Warning Section */}
            <View style={styles.warningContainer}>
              <Text style={styles.warningTitle}>⚠️ Attention</Text>
              <Text style={styles.warningText}>
                La suppression de votre compte entraînera la perte définitive de toutes vos données, 
                y compris vos prières personnalisées et vos favoris.
              </Text>
            </View>
          </ScrollView>
        </AnimatedScreenWrapper>
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginLeft: 12,
  },
  logoutText: {
    color: Colors.error,
  },
  deleteText: {
    color: Colors.error,
  },
  warningContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.warning,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});