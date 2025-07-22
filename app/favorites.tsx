import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, Heart, ChevronRight } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { getFavoritePrayers } from '../services/firestore';
import { Prayer } from '../types';
import { router } from 'expo-router';

import { getCategoryDisplayName, getEffectivePrayerCategory } from '../utils/categoryUtils';

export default function FavoritesScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favoritePrayers, setFavoritePrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavoritePrayers();
  }, [user]);

  const loadFavoritePrayers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const prayers = await getFavoritePrayers(user.uid);
      setFavoritePrayers(prayers);
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    } finally {
      setLoading(false);
    }
  };


  // Catégories disponibles
  const categories = [
    { id: 'all', label: 'Toutes' },
    { id: 'chaharit', label: 'Chaharit' },
    { id: 'minha', label: 'Minha' },
    { id: 'arvit', label: 'Arvit' },
    { id: 'kriat-chema', label: 'Kriat Chéma' },
    { id: 'brachot', label: 'Brachot' },
    { id: 'tfilot-supplementaires', label: 'Tfilot supplémentaires' },
    { id: 'segoulot', label: 'Ségoulot' },
    { id: 'kever', label: 'Kever' },
    { id: 'autres', label: 'Autres' },
  ];

  // Filtrer les prières par recherche et catégorie
  const filteredPrayers = useMemo(() => {
    let filtered = favoritePrayers;

    // Filtrer par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(prayer => getEffectivePrayerCategory(prayer) === selectedCategory);
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prayer =>
        prayer.title.toLowerCase().includes(query) ||
        prayer.subtitle.toLowerCase().includes(query) ||
        prayer.content.french.toLowerCase().includes(query) ||
        prayer.content.hebrew.includes(query)
      );
    }

    return filtered;
  }, [favoritePrayers, selectedCategory, searchQuery]);

  const navigateToPrayer = (prayer: Prayer) => {
    router.push({
      pathname: `/prayer/${prayer.id}`,
      params: {
        category: prayer.category || 'autres',
        originalId: prayer.originalId || prayer.id,
        chapterId: prayer.chapterId || '',
        title: prayer.title || ''
      }
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes prières favorites</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={Colors.text.muted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une prière..."
              placeholderTextColor={Colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Prayers List */}
        <View style={{flex: 1}}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.emptyContainer}>
                <Heart size={48} color={Colors.text.muted} />
                <Text style={styles.emptyTitle}>Chargement...</Text>
              </View>
            ) : filteredPrayers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Heart size={48} color={Colors.text.muted} />
                <Text style={styles.emptyTitle}>Aucune prière favorite</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Aucune prière ne correspond à vos critères'
                    : 'Ajoutez des prières à vos favoris pour les retrouver ici'
                  }
                </Text>
              </View>
            ) : (
              <View style={styles.prayersList}>
                {filteredPrayers.map((prayer) => (
                  <TouchableOpacity
                    key={prayer.id}
                    style={styles.prayerItem}
                    onPress={() => navigateToPrayer(prayer)}
                  >
                    <View style={styles.prayerContent}>
                      <View style={styles.prayerHeader}>
                        <Heart size={20} color={Colors.primary} fill={Colors.primary} />
                        <View style={styles.prayerInfo}>
                          <Text style={styles.prayerTitle}>{prayer.title}</Text>
                        </View>
                      </View>
                      {prayer.subtitle && (
                        <Text style={styles.prayerSubtitle}>{prayer.subtitle}</Text>
                      )}
                    </View>
                    <ChevronRight size={20} color={Colors.text.muted} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    paddingVertical: 12,
  },
  categoryContainer: {
    paddingBottom: 16,
    flexGrow: 0,
  },
  categoryContent: {
    paddingHorizontal: 20,
  },
  flex: {
    flex: 1,
  },
  categoryButton: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: 13,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  prayersList: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  prayerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  prayerContent: {
    flex: 1,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  prayerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  prayerCategory: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  prayerSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 32,
    lineHeight: 18,
  },
});