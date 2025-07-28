import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, I18nManager, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, List, Settings, Heart, Gift, CircleAlert as AlertCircle, ChevronDown, ChevronUp, Send, Check } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { getSiddourSubcategoryById, getSiddourBlocks, addToFavorites, removeFromFavorites, checkIfFavorite } from '../../services/firestore';
import { Prayer, SiddourSubcategory, SiddourBlockData } from '../../types';
import SettingsBottomSheet from '../../components/SettingsBottomSheet';
import SymbolsInfoBottomSheet from '../../components/SymbolsInfoBottomSheet';
import MapSelectionBottomSheet from '../../components/MapSelectionBottomSheet';
import { DisplaySettings } from '../../types';
import { useDisplaySettings } from '../../contexts/DisplaySettingsContext';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic, triggerErrorHaptic } from '../../utils/haptics';

import { getCategoryDisplayName } from '../../utils/categoryUtils';

export default function KeverScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { hebrewFont, fontSizeAdjustment, setFontSizeAdjustment } = useDisplaySettings();
  const scrollRef = useRef<ScrollView>(null);
  
  const [subcategory, setSubcategory] = useState<SiddourSubcategory | null>(null);
  const [currentPrayerBlocks, setCurrentPrayerBlocks] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [displayMode, setDisplayMode] = useState<'hebrew' | 'hebrewTrad' | 'hebrewPhonetic' | 'phonetic' | 'french'>('hebrew');
  const [expandedBlockSections, setExpandedBlockSections] = useState<{[blockId: string]: {kavana: boolean, comments: boolean}}>({});
  const [showSettings, setShowSettings] = useState(false);
  const [showSymbolsInfo, setShowSymbolsInfo] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showMapSelection, setShowMapSelection] = useState(false);
  
  useEffect(() => {
    loadKeverData();
  }, [id]);

  useEffect(() => {
    checkFavoriteStatus();
  }, [user, subcategory]);

  const loadKeverData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const subcategoryData = await getSiddourSubcategoryById(id as string);
      
      setSubcategory(subcategoryData);
      
      // Charger les blocs de cette sous-catégorie
      if (subcategoryData) {
        await loadBlocksForSubcategory(subcategoryData.id);
      }
    } catch (error) {
      console.error('Error loading kever data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBlocksForSubcategory = async (subcategoryId: string) => {
    try {
      const blocksData = await getSiddourBlocks(subcategoryId);
      
      // Mapper les blocs en objets Prayer
      const mappedPrayers: Prayer[] = blocksData.map((block: SiddourBlockData) => ({
        id: block.id,
        title: block.information || `Bloc ${block.order}`,
        subtitle: block.text_fr || '',
        category: 'siddour',
        content: {
          hebrew: block.content_hebrew,
          french: block.content_fr,
          phonetic: block.content_phonetic,
        },
        isFavorite: false,
        isCustom: false,
        createdAt: new Date(),
        order: block.order,
        // Inclure seulement les champs définis pour éviter les erreurs Firestore
        ...(block.sub_category_id && { sub_category_id: block.sub_category_id }),
        ...(block.information && { information: block.information }),
        ...(block.kavana && { kavana: block.kavana }),
        ...(block.icon && { icon: block.icon }),
        ...(block.icon_large && { icon_large: block.icon_large }),
        ...(block.icon_large_fr && { icon_large_fr: block.icon_large_fr }),
        ...(block.text_fr && { text_fr: block.text_fr }),
        ...(block.image && { image: block.image }),
        ...(block.image_comment && { image_comment: block.image_comment }),
        ...(typeof block.is_alternative === 'boolean' && { is_alternative: block.is_alternative }),
      }));
      
      setCurrentPrayerBlocks(mappedPrayers);
    } catch (error) {
      console.error('Error loading blocks:', error);
      setCurrentPrayerBlocks([]);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!user || !subcategory) return;
    
    try {
      const isFav = await checkIfFavorite(user.uid, subcategory.id);
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Erreur lors de la vérification des favoris:', error);
    }
  };

  const toggleBlockSection = (blockId: string, section: 'kavana' | 'comments') => {
    triggerLightHaptic();
    setExpandedBlockSections(prev => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        [section]: !prev[blockId]?.[section]
      }
    }));
  };

  const toggleFavorite = async () => {
    if (!user || !subcategory) return;
    
    triggerMediumHaptic();
    
    // Create a Prayer object representing the subcategory
    const subcategoryAsPrayer: Prayer = {
      id: subcategory.id,
      title: subcategory.title,
      subtitle: 'Kever', // Use "Kever" as subtitle
      category: 'kever',
      content: {
        hebrew: '',
        french: '',
        phonetic: ''
      },
      isFavorite: false,
      isCustom: false,
      createdAt: new Date(),
      originalId: subcategory.id,
      order: subcategory.order
    };
    
    try {
      if (isFavorite) {
        await removeFromFavorites(user.uid, subcategory.id);
        setIsFavorite(false);
        triggerSuccessHaptic();
        // Show success feedback
        setTimeout(() => {
          // You could add a toast notification here if available
        }, 100);
      } else {
        await addToFavorites(user.uid, subcategoryAsPrayer);
        setIsFavorite(true);
        triggerSuccessHaptic();
        // Show success feedback
        setTimeout(() => {
          // You could add a toast notification here if available
        }, 100);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
      triggerErrorHaptic();
      // Show user-friendly error message
      console.warn('Impossible de mettre à jour les favoris');
    }
  };

  const openInMaps = () => {
    triggerLightHaptic();
    setShowMapSelection(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  if (!subcategory) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Kever non trouvé</Text>
      </SafeAreaView>
    );
  }

  const displayModeButtons = [
    { key: 'hebrew', label: 'עברית' },
    { key: 'hebrewTrad', label: 'עברית + Trad' },
    { key: 'phonetic', label: 'Phonétique' },
    { key: 'hebrewPhonetic', label: 'עברית + Phonétique' },
    { key: 'french', label: 'Traduction' },
  ];

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
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{subcategory.title}</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => {
            triggerLightHaptic();
            setShowSettings(true);
          }} style={styles.headerIcon}>
            <Settings size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFavorite} style={styles.headerIcon}>
            <Heart 
              size={24} 
              color={isFavorite ? Colors.error : Colors.text.primary}
              fill={isFavorite ? Colors.error : 'transparent'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={openInMaps} style={[styles.headerIcon, styles.sendIcon]}>
            <Send size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sticky Navigation Section */}
      <View style={styles.stickySection}>
        {/* Display Mode Buttons */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.displayModeContainer}
          contentContainerStyle={styles.displayModeContent}
        >
          {displayModeButtons.map((button) => (
            <TouchableOpacity
              key={button.key}
              style={[
                styles.displayModeButton,
                displayMode === button.key && styles.displayModeButtonActive
              ]}
              onPress={() => {
                triggerLightHaptic();
                setDisplayMode(button.key as any);
              }}
            >
              <Text style={[
                styles.displayModeText,
                displayMode === button.key && styles.displayModeTextActive
              ]}>
                {button.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Scrollable Content */}
      <View style={{flex: 1}}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Prayer Content - Display all blocks */}
          {currentPrayerBlocks.map((block, index) => {
            const hasIcon = block.icon && block.icon.trim().length > 0;
            const hasIconLarge = block.icon_large && block.icon_large.trim().length > 0;
            const hasIconLargeFr = block.icon_large_fr && block.icon_large_fr.trim().length > 0;
            
            return (
            <View key={block.id} style={styles.blockContainer}>
              {/* Full-width image at the top of each block */}
              {block.image && block.image.trim().length > 0 && (
                <View style={styles.fullWidthImageContainer}>
                  <Image
                    source={{ uri: block.image }}
                    style={styles.fullWidthImage}
                    resizeMode="contain"
                  />
                </View>
              )}

              {/* Kavana Section for this block */}
              {block.kavana && block.kavana.trim().length > 0 && (
                <>
                  <TouchableOpacity 
                    style={styles.commentsHeader}
                    onPress={() => toggleBlockSection(block.id, 'kavana')}
                  >
                    <Text style={styles.commentsTitle}>Kavana</Text>
                    {expandedBlockSections[block.id]?.kavana ? (
                      <ChevronUp size={20} color={Colors.primary} />
                    ) : (
                      <ChevronDown size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>

                  {expandedBlockSections[block.id]?.kavana && (
                    <View style={styles.commentsContent}>
                      <Text style={[styles.commentsText, { fontSize: 14 + fontSizeAdjustment }]}>
                        {block.kavana}
                      </Text>
                    </View>
                  )}
                </>
              )}

              {/* Comments Section for this block */}
              {block.information && block.information.trim().length > 0 && (
                <>
                  <TouchableOpacity 
                    style={styles.commentsHeader}
                    onPress={() => toggleBlockSection(block.id, 'comments')}
                  >
                    <Text style={styles.commentsTitle}>Commentaires</Text>
                    {expandedBlockSections[block.id]?.comments ? (
                      <ChevronUp size={20} color={Colors.primary} />
                    ) : (
                      <ChevronDown size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>

                  {expandedBlockSections[block.id]?.comments && (
                    <View style={styles.commentsContent}>
                      {/* Image comment - displayed first if available */}
                      {block.image_comment && block.image_comment.trim().length > 0 && (
                        <View style={styles.commentImageContainer}>
                          <Image
                            source={{ uri: block.image_comment }}
                            style={styles.commentImage}
                            resizeMode="contain"
                          />
                        </View>
                      )}
                      
                      {/* Information text */}
                      <Text style={[styles.commentsText, { fontSize: 14 + fontSizeAdjustment }]}>
                        {block.information}
                      </Text>
                    </View>
                  )}
                </>
              )}

              {/* Block Content */}
              <View style={styles.prayerContent}>
                {/* Icons above Hebrew text for specific prayers */}
                {(hasIcon || hasIconLarge) && (displayMode === 'hebrew' || displayMode === 'hebrewTrad' || displayMode === 'hebrewPhonetic') && (
                  <View style={styles.iconsContainer}>
                    {hasIcon && (
                      <Image 
                        source={{ uri: block.icon }} 
                        style={styles.blockImage}
                        resizeMode="contain"
                      />
                    )}
                    {hasIconLarge && (
                      <Image 
                        source={{ uri: block.icon_large }} 
                        style={styles.blockImageLarge}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                )}

                {/* French text above Hebrew text */}
                {block.text_fr && block.text_fr.trim().length > 0 && (displayMode === 'hebrew' || displayMode === 'hebrewTrad' || displayMode === 'hebrewPhonetic') && (
                  <Text style={[styles.textFrStyle, { fontSize: 14 + fontSizeAdjustment }]}>
                    {block.text_fr}
                  </Text>
                )}

                {/* Hebrew text */}
                {block.content.hebrew && block.content.hebrew.trim().length > 0 && (displayMode === 'hebrew' || displayMode === 'hebrewTrad' || displayMode === 'hebrewPhonetic') && (
                  <View style={block.is_alternative ? styles.alternativeContainer : null}>
                    <Text style={[styles.hebrewText, { fontSize: 18 + fontSizeAdjustment, fontFamily: hebrewFont }]}>
                      {block.content.hebrew}
                    </Text>
                  </View>
                )}

                {/* French translation */}
                {block.content.french && block.content.french.trim().length > 0 && (displayMode === 'french' || displayMode === 'hebrewTrad') && (
                  <View style={styles.frenchTextContainer}>
                    <Image 
                      source={require('../../assets/images/translate.png')}
                      style={styles.translateIcon}
                      resizeMode="contain"
                    />
                    <Text style={[styles.frenchText, { fontSize: 16 + fontSizeAdjustment }]}>
                      {block.content.french}
                    </Text>
                  </View>
                )}

                {/* Phonetic text */}
                {block.content.phonetic && block.content.phonetic.trim().length > 0 && (displayMode === 'hebrewPhonetic' || displayMode === 'phonetic') && (
                  <>
                    {/* Icons above Phonetic text - aligned left for phonetic mode, or for hebrewPhonetic mode */}
                    {(hasIcon || hasIconLargeFr || hasIconLarge) && (displayMode === 'phonetic' || displayMode === 'hebrewPhonetic') && (
                      <View style={styles.iconsContainerLeft}>
                        {hasIcon && (
                          <Image 
                            source={{ uri: block.icon }} 
                            style={styles.blockImage}
                            resizeMode="contain"
                          />
                        )}
                        {hasIconLargeFr ? (
                          <Image 
                            source={{ uri: block.icon_large_fr }} 
                            style={styles.blockImageLarge}
                            resizeMode="contain"
                          />
                        ) : hasIconLarge && (
                          <Image 
                            source={{ uri: block.icon_large }} 
                            style={styles.blockImageLarge}
                            resizeMode="contain"
                          />
                        )}
                      </View>
                    )}
                    <View style={[
                      block.is_alternative ? styles.alternativeContainer : null,
                      block.is_alternative && displayMode === 'hebrewPhonetic' && styles.phoneticAlternativeSpacing
                    ]}>
                      <Text style={[
                        styles.phoneticText, 
                        { 
                          fontSize: 16 + fontSizeAdjustment,
                          color: (block.text_fr && block.text_fr.trim().length > 0 && (!block.content.hebrew || block.content.hebrew.trim().length === 0)) ? Colors.primary : Colors.text.secondary
                        }
                      ]}>
                        {block.content.phonetic}
                      </Text>
                    </View>
                  </>
                )}
              </View>
              
              {/* Separator between blocks */}
              {index < currentPrayerBlocks.length - 1 && (
                <View style={styles.blockSeparator} />
              )}
            </View>
            );
          })}

          {/* Bottom spacing for navigation */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>

      <SettingsBottomSheet
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <SymbolsInfoBottomSheet
        visible={showSymbolsInfo}
        onClose={() => setShowSymbolsInfo(false)}
      />

      {subcategory && (
        <MapSelectionBottomSheet
          visible={showMapSelection}
          onClose={() => setShowMapSelection(false)}
          latitude={32.9717} // Default coordinates - you'll need to get actual coordinates from subcategory data
          longitude={35.4439}
          locationName={subcategory.title}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.primary,
    textAlign: 'center',
    marginTop: 50,
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
  headerCenter: {
    flex: 1,
    alignItems: 'flex-start',
    marginLeft: 16,
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 16,
  },
  sendIcon: {
    marginLeft: 12,
  },
  stickySection: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contentWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  displayModeContainer: {
    marginVertical: 16,
  },
  displayModeContent: {
    paddingHorizontal: 20,
  },
  displayModeButton: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  displayModeButtonActive: {
    backgroundColor: Colors.primary,
  },
  displayModeText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  displayModeTextActive: {
    color: Colors.white,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  commentsTitle: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  commentsContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  commentsText: {
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  commentImageContainer: {
    marginBottom: 12,
  },
  commentImage: {
    width: '100%',
    height: 200,
  },
  prayerContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  iconsContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  iconsContainerLeft: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  blockImage: {
    width: 40,
    height: 40,
  },
  blockImageLarge: {
    width: 130,
    height: 48,
  },
  textFrStyle: {
    textAlign: 'right',
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 16,
    lineHeight: 20,
  },
  hebrewText: {
    lineHeight: 32,
    color: Colors.text.primary,
    textAlign: 'right',
    writingDirection: 'rtl',
    textAlignVertical: 'top',
    includeFontPadding: false,
    marginBottom: 16,
    fontFamily: 'FrankRuhlLibre-Regular',
  },
  alternativeContainer: {
    backgroundColor: '#F3E8FF', // Fond violet clair
    borderWidth: 2,
    borderColor: Colors.primary, // Bordure violette
    borderRadius: 12,
    padding: 8,
    paddingBottom: 8,
    width: '100%', // Prend toute la largeur disponible
    alignItems: 'flex-end', // Aligne le contenu à droite
    minHeight: 'auto', // Hauteur minimale automatique
  },
  phoneticAlternativeSpacing: {
   marginTop: 16, // Espace entre les conteneurs alternatifs hébreu et phonétique
    alignItems: 'flex-start', // Aligne le contenu phonétique à gauche
  },
  frenchText: {
    alignSelf: 'flex-end', // Aligne le conteneur à droite
    maxWidth: '100%', // Évite le débordement
    lineHeight: 24,
    color: Colors.text.secondary,
    textAlign: 'left',
    flex: 1,
  },
  phoneticText: {
    lineHeight: 24,
    color: Colors.text.secondary,
    textAlign: 'left',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  frenchTextContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  translateIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    marginTop: 2,
  },
  fullWidthImageContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 20,
  },
  fullWidthImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    minHeight: 150,
  },
  blockContainer: {
    marginBottom: 15,
  },
  blockSeparator: {
    height: 1,
    backgroundColor: Colors.background,
    marginHorizontal: 20,
    marginTop: 20,
  },
  bottomSpacing: {
    height: 50,
  },
});