import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Pause, Play, BookOpen, User } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { getCustomPrayerById } from '../../services/firestore';
import { Prayer } from '../../types';
import { HomeIcon } from '../(tabs)/_layout';
import { triggerLightHaptic, triggerMediumHaptic } from '../../utils/haptics';

export default function CustomPrayerDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [prayer, setPrayer] = useState<Prayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadPrayer();
  }, [id]);

  const loadPrayer = async () => {
    if (!id || !user) return;
    
    try {
      setLoading(true);
      const prayerData = await getCustomPrayerById(user.uid, id as string);
      setPrayer(prayerData);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    triggerLightHaptic();
    setIsPlaying(!isPlaying);
    // Ici vous pourrez ajouter la logique pour jouer/arrêter la musique
  };

  const navigateToHome = () => {
    triggerMediumHaptic();
    router.push('/(tabs)');
  };

  const navigateToSiddour = () => {
    triggerMediumHaptic();
    router.push('/(tabs)/siddour');
  };

  const navigateToProfile = () => {
    triggerMediumHaptic();
    router.push('/(tabs)/profile');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  if (!prayer) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Prière non trouvée</Text>
      </SafeAreaView>
    );
  }

  const renderSection = (title: string, content: string, isIntro?: boolean) => {
    if (!content?.trim()) return null;

    return (
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, isIntro && styles.introTitle]}>
          {title}
        </Text>
        <Text style={[styles.sectionContent, isIntro && styles.introContent]}>
          {content}
        </Text>
      </View>
    );
  };

  const renderListContent = (content: string) => {
    if (!content?.trim()) return null;

    const items = content.split('\n').filter(item => item.trim());
    return (
      <View style={styles.listContainer}>
        {items.map((item, index) => (
          <Text key={index} style={styles.listItem}>
            {item.trim()}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          triggerLightHaptic();
          router.back();
        }}>
          <ChevronLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{prayer.title}</Text>
        
        <TouchableOpacity onPress={togglePlayPause}>
          {isPlaying ? (
            <Pause size={24} color={Colors.text.primary} />
          ) : (
            <Play size={24} color={Colors.text.primary} />
          )}
        </TouchableOpacity>
      </View>

      <View style={{flex: 1}}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introSection}>
            <Text style={styles.mainIntro}>Hashem, mon Roi, abballé, mon Tout,</Text>
          </View>
          {prayer.sections?.gratitude && renderSection(
            "Hashem, je veux te remercier pour :",
            "",
            false
          )}
          <Text style={styles.subSectionTitle}>Remercier pour tout</Text>
          {prayer.sections?.gratitude && (
            <Text style={styles.gratitudeContent}>
              {prayer.sections.gratitude}
            </Text>
          )}
          {prayer.sections?.refouah && renderSection(
            "Parmi eux, ceux que nous aimons et qui sont précieux pour nous :",
            "",
            false
          )}
          {prayer.sections?.refouah && renderListContent(prayer.sections.refouah)}
          {prayer.sections?.improvement && renderSection(
            "Hashem, je Te demande pardon pour mes manquements et erreurs:",
            "",
            false
          )}
          {prayer.sections?.improvement && (
            <Text style={styles.improvementContent}>
              {prayer.sections.improvement}
            </Text>
          )}
          {prayer.sections?.dreams && renderSection(
            "Hashem, je viens à Toi avec tous mes désirs et mes rêves, sachant que Tu m'exauceras uniquement si Tu agrées qu'ils sont le meilleur pour moi :",
            "",
            false
          )}
          {prayer.sections?.dreams && (
            <Text style={styles.dreamsContent}>
              {prayer.sections.dreams}
            </Text>
          )}
          {prayer.sections?.personal && renderSection(
            "Hashem, voici ma prière personnelle pour T'exprimer ma gratitude :",
            "",
            false
          )}
          {prayer.sections?.personal && (
            <Text style={styles.personalContent}>
              {prayer.sections.personal}
            </Text>
          )}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem} onPress={navigateToHome}>
          <HomeIcon size={24} color={Colors.text.muted} />
          <Text style={styles.navText}>Accueil</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]} onPress={navigateToSiddour}>
          <View style={styles.activeNavBackground}>
            <BookOpen size={24} color={Colors.white} fill={Colors.white} />
          </View>
          <Text style={[styles.navText, styles.activeNavText]}>Siddour</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={navigateToProfile}>
          <User size={24} color={Colors.text.muted} />
          <Text style={styles.navText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0FF', // Fond légèrement violet comme dans l'image
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  introSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  mainIntro: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 28,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    fontWeight: '500',
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionContent: {
    fontSize: 16,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 24,
  },
  introContent: {
    fontSize: 18,
    fontWeight: '500',
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  gratitudeContent: {
    fontSize: 16,
    color: Colors.primary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontStyle: 'italic',
  },
  listContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  listItem: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 26,
  },
  improvementContent: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  dreamsContent: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  personalContent: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  bottomSpacing: {
    height: 40,
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavBackground: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  navText: {
    fontSize: 11,
    color: Colors.text.muted,
    marginTop: 2,
    fontWeight: '500',
  },
  activeNavText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 50,
  },
});