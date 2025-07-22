import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Heart, BookOpen, MapPin, MessageCircle, Share2 } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import AnimatedScreenWrapper from '../../components/AnimatedScreenWrapper';

export default function ProfileScreen() {
  const { user } = useAuth();
  
  const userName = user?.displayName || user?.email?.split('@')[0] || "Utilisateur";
  const userEmail = user?.email || "";

  const handleWhatsAppContact = () => {
    const whatsappUrl = 'https://wa.me/972537080475';
    Linking.openURL(whatsappUrl);
  };

  const handleDonation = () => {
    const donationUrl = 'https://linktr.ee/elehanafchi';
    Linking.openURL(donationUrl);
  };

  const handleShareApp = () => {
    const shareUrl = 'https://linktr.ee/elehanafchi';
    Linking.openURL(shareUrl);
  };

  const handleIlnovationClick = () => {
    const ilnovationUrl = 'https://ilnovation.com/';
    Linking.openURL(ilnovationUrl);
  };

  const navigateToFavorites = () => {
    router.push('/favorites');
  };

  const navigateToKevarim = () => {
    router.push('/kevarim');
  };

  const navigateToCreatePrayer = () => {
    router.push('/create-prayer');
  };

  const navigateToAccountSettings = () => {
    router.push('/account-settings');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <AnimatedScreenWrapper animationType="fade" duration={600} style={styles.flex}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Profil</Text>
              <TouchableOpacity onPress={navigateToAccountSettings}>
                <Settings size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Profile Info */}
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
                </View>
              </View>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userEmail}>{userEmail}</Text>
            </View>

            {/* WhatsApp CTA */}
            <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsAppContact}>
              <MessageCircle size={20} color={Colors.white} />
              <Text style={styles.whatsappButtonText}>Posez nous vos questions</Text>
            </TouchableOpacity>

            {/* Donation CTA */}
            <TouchableOpacity style={styles.donationButton} onPress={handleDonation}>
              <Heart size={20} color={Colors.white} />
              <Text style={styles.donationButtonText}>Faire un don</Text>
            </TouchableOpacity>

            {/* App Description */}
            <View style={styles.appDescriptionContainer}>
              <View style={styles.appDescriptionContent}>
                <View style={styles.appDescriptionText}>
                  <Text style={styles.appTitle}>La prière au creux de vos mains</Text>
                  <Text style={styles.appSubtitle}>
                    L'application qui accompagne chaque femme dans sa prière.
                  </Text>
                </View>
                <View style={styles.appImageContainer}>
                  <View style={styles.womanIcon}>
                <Image
                  source={require('../../assets/images/App Icon Vector.png')}
                  style={styles.appIconImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
            </View>

            {/* Share App CTA */}
            <TouchableOpacity style={styles.shareButton} onPress={handleShareApp}>
              <Share2 size={20} color={Colors.primary} />
              <Text style={styles.shareButtonText}>Partager notre application</Text>
            </TouchableOpacity>

            {/* Footer with Ilnovation */}
            <TouchableOpacity style={styles.footerContainer} onPress={handleIlnovationClick}>
              <Text style={styles.footerText}>Créé avec </Text>
              <Heart size={16} color={Colors.primary} fill={Colors.primary} />
              <Text style={styles.footerText}> par </Text>
              <Image
                source={require('../../assets/images/logoIlnovation.png')}
                style={styles.ilnovationLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140, // Space for tab bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  accountItem: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  accountText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366', // WhatsApp green
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  whatsappButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 8,
  },
  donationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B', // Coral/salmon color for donation
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  donationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 8,
  },
  appDescriptionContainer: {
    backgroundColor: '#F3E8FF', // Light purple background
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  appDescriptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appDescriptionText: {
    flex: 1,
    marginRight: 16,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 14,
    color: Colors.primary,
    lineHeight: 20,
  },
  appImageContainer: {
    alignItems: 'center',
  },
  womanIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIconImage: {
    width: 80,
    height: 80,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF', // Light purple
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  ilnovationLogo: {
    width: 80,
    height: 20,
    marginLeft: 4,
  },
});