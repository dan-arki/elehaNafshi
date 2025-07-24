import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, I18nManager, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, ChevronRight, List, Settings, Heart, Gift, CircleAlert as AlertCircle, ChevronDown, ChevronUp, BookOpen, User } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { getChapterById, getSiddourSubcategories, getSiddourBlocks, addToFavorites, removeFromFavorites, checkIfFavorite } from '../../services/firestore';
import { PrayerChapter, Prayer, SiddourSubcategory, SiddourBlockData } from '../../types';
import SettingsBottomSheet from '../../components/SettingsBottomSheet';
import SymbolsInfoBottomSheet from '../../components/SymbolsInfoBottomSheet';
import { DisplaySettings } from '../../types';
import { useDisplaySettings } from '../../contexts/DisplaySettingsContext';
import { HomeIcon } from '../(tabs)/_layout';
import { getFilterCategoryFromChapterTitle } from '../../utils/categoryUtils';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic, triggerErrorHaptic } from '../../utils/haptics';

export default function ChapterScreen() {
  const { id, subcategoryId } = useLocalSearchParams();
  const { user } = useAuth();
  const { hebrewFont, fontSizeAdjustment, setFontSizeAdjustment } = useDisplaySettings();
  const scrollRef = useRef<ScrollView>(null);
  const subcategoryScrollRef = useRef<ScrollView>(null);
  const subcategoryRefs = useRef<(TouchableOpacity | null)[]>([]);
  
  const [chapter, setChapter] = useState<PrayerChapter | null>(null);
  const [subcategories, setSubcategories] = useState<SiddourSubcategory[]>([]);
  const [currentPrayerBlocks, setCurrentPrayerBlocks] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [displayMode, setDisplayMode] = useState<'hebrew' | 'hebrewTrad' | 'hebrewPhonetic' | 'phonetic' | 'french'>('hebrew');
  const [selectedSubcategoryIndex, setSelectedSubcategoryIndex] = useState(0);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState(0);
  const [expandedBlockSections, setExpandedBlockSections] = useState<{[blockId: string]: {kavana: boolean, comments: boolean}}>({});
  const [showSettings, setShowSettings] = useState(false);
  const [showSymbolsInfo, setShowSymbolsInfo] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // ScrollView dimensions for precise scrolling calculations
  const [scrollViewWidth, setScrollViewWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  
  useEffect(() => {
    loadChapterData();
  }, [id]);

  useEffect(() => {
    checkFavoriteStatus();
  }, [user, subcategories, selectedSubcategoryIndex]);

  // Auto-scroll to selected subcategory when index changes or dimensions are available
  useEffect(() => {
    if (subcategories.length > 0 && scrollViewWidth > 0 && contentWidth > 0) {
      scrollToSelectedSubcategory();
    }
  }, [selectedSubcategoryIndex, scrollViewWidth, contentWidth, subcategories.length]);

  // Initialize subcategory refs array when subcategories change
  useEffect(() => {
    subcategoryRefs.current = subcategoryRefs.current.slice(0, subcategories.length);
  }, [subcategories.length]);
  const loadChapterData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const chapterData = await getChapterById(id as string);
      
      const subcategoriesData = await getSiddourSubcategories(id as string);
      
      setChapter(chapterData);
      setSubcategories(subcategoriesData);
      
      // Charger les blocs de la première sous-catégorie si elle existe
      if (subcategoriesData.length > 0) {
        
        // Si un subcategoryId est fourni, trouver son index
        let initialIndex = 0;
        if (subcategoryId) {
          const foundIndex = subcategoriesData.findIndex(sub => sub.id === subcategoryId);
          if (foundIndex !== -1) {
            initialIndex = foundIndex;
          }
        }
        
        setSelectedSubcategoryIndex(initialIndex);
        await loadBlocksForSubcategory(subcategoriesData[initialIndex].id);
      }
    } catch (error) {
      console.error('Error loading chapter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSelectedSubcategory = () => {
    if (!subcategoryScrollRef.current || subcategories.length === 0 || scrollViewWidth === 0) {
      return;
    }
    
    const selectedRef = subcategoryRefs.current[selectedSubcategoryIndex];
    if (!selectedRef) {
      return;
    }
    
    // Measure the selected tab's position and dimensions
    selectedRef.measureLayout(
      subcategoryScrollRef.current.getInnerViewNode(),
      (x, y, width, height) => {
        // Calculate the center position of the selected tab
        const tabCenter = x + (width / 2);
        
        // Calculate the scroll position to center the tab in the viewport
        const targetScrollX = tabCenter - (scrollViewWidth / 2);
        
        // Clamp the scroll position to valid bounds
        // Don't scroll past the beginning (0) or beyond the scrollable content
        const maxScrollX = Math.max(0, contentWidth - scrollViewWidth);
        const clampedScrollX = Math.max(0, Math.min(targetScrollX, maxScrollX));
        
        // Perform the scroll animation
        subcategoryScrollRef.current?.scrollTo({
          x: clampedScrollX,
          animated: true
        });
      },
      (error) => {
        console.error('Error measuring tab:', error);
      }
    );
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
      setSelectedBlockIndex(0);
      
      // Scroll vers le haut après le chargement du contenu avec un délai
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
    } catch (error) {
      console.error('Error loading blocks:', error);
      setCurrentPrayerBlocks([]);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!user || subcategories.length === 0 || selectedSubcategoryIndex < 0) return;
    
    try {
      // Check if the current subcategory is favorite
      const currentSubcategory = subcategories[selectedSubcategoryIndex];
      if (!currentSubcategory) return;
      
      const isFav = await checkIfFavorite(user.uid, currentSubcategory.id);
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Erreur lors de la vérification des favoris:', error);
    }
  };

  const toggleBlockSection = (blockId: string, section: 'kavana' | 'comments') => {
    setExpandedBlockSections(prev => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        [section]: !prev[blockId]?.[section]
      }
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  if (!chapter) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Chapitre non trouvé</Text>
      </SafeAreaView>
    );
  }


  const handleSubcategorySelect = async (index: number) => {
    triggerLightHaptic();
    setSelectedSubcategoryIndex(index);
    if (subcategories[index]) {
      await loadBlocksForSubcategory(subcategories[index].id);
    }
  };

  const handleBlockSelect = (index: number) => {
    // Scroll to the selected block instead of just changing index
    // You can implement scrolling to specific block here if needed
    // setSelectedBlockIndex(index);
  };

  const toggleFavorite = async () => {
    if (!user || subcategories.length === 0 || selectedSubcategoryIndex < 0) return;
    
    triggerMediumHaptic();
    
    const currentSubcategory = subcategories[selectedSubcategoryIndex];
    if (!currentSubcategory || !chapter) return;
    
    // Create a Prayer object representing the subcategory
    const subcategoryAsPrayer: Prayer = {
      id: currentSubcategory.id,
      title: currentSubcategory.title,
      subtitle: chapter.title, // Use chapter title as subtitle
      category: getFilterCategoryFromChapterTitle(chapter.title),
      content: {
        hebrew: '',
        french: '',
        phonetic: ''
      },
      isFavorite: false,
      isCustom: false,
      createdAt: new Date(),
      originalId: currentSubcategory.id,
      chapterId: chapter.id,
      order: currentSubcategory.order
    };
    
    try {
      if (isFavorite) {
        await removeFromFavorites(user.uid, currentSubcategory.id);
        setIsFavorite(false);
        triggerSuccessHaptic();
      } else {
        await addToFavorites(user.uid, subcategoryAsPrayer);
        setIsFavorite(true);
        triggerSuccessHaptic();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
      triggerErrorHaptic();
      // Show user-friendly error message
      if (error.code === 'permission-denied') {
        console.warn('Permissions Firestore non configurées pour les favoris');
      }
    }
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

  const handlePreviousSubcategory = async () => {
    if (selectedSubcategoryIndex > 0) {
      triggerLightHaptic();
      await handleSubcategorySelect(selectedSubcategoryIndex - 1);
    }
  };

  const handleNextSubcategory = async () => {
    if (selectedSubcategoryIndex < subcategories.length - 1) {
      triggerLightHaptic();
      await handleSubcategorySelect(selectedSubcategoryIndex + 1);
    }
  };

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
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{chapter.title}</Text>
          <Text style={styles.headerSubtitle}>
            {subcategories[selectedSubcategoryIndex]?.title || 'Chargement...'}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.headerIcon}>
            <Settings size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSymbolsInfo(true)} style={styles.headerIcon}>
            <List size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFavorite} style={styles.headerIcon}>
            <Heart 
              size={24} 
              color={isFavorite ? Colors.error : Colors.text.primary}
              fill={isFavorite ? Colors.error : 'transparent'}
            />
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
              onPress={() => setDisplayMode(button.key as any)}
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

        {/* Prayer Navigation */}
        {subcategories.length > 0 && (
          <ScrollView 
            ref={subcategoryScrollRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.prayerNavContainer}
            contentContainerStyle={styles.prayerNavContent}
            onLayout={(event) => {
              const { width } = event.nativeEvent.layout;
              setScrollViewWidth(width);
              console.log('📐 [DEBUG] ScrollView layout - width:', width);
            }}
            onContentSizeChange={(contentWidth, contentHeight) => {
              setContentWidth(contentWidth);
              console.log('📐 [DEBUG] ScrollView content size - width:', contentWidth);
            }}
          >
            {subcategories.map((subcategory, index) => (
              <TouchableOpacity
                key={subcategory.id}
                ref={(ref) => {
                  subcategoryRefs.current[index] = ref;
                }}
                style={[
                  styles.prayerNavButton,
                  selectedSubcategoryIndex === index && styles.prayerNavButtonActive
                ]}
                onPress={() => handleSubcategorySelect(index)}
              >
                <Text style={[
                  styles.prayerNavText,
                  selectedSubcategoryIndex === index && styles.prayerNavTextActive
                ]}>
                  {subcategory.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
      {/* Scrollable Content */}
      <View style={styles.mainContentWrapper}>
        <ScrollView 
          ref={scrollRef}
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Prayer Content - Display all blocks */}
          {currentPrayerBlocks.map((block, index) => {
            // Determine which icon to use: icon_large takes priority over icon
            const iconToUse = (block.icon_large && block.icon_large.trim().length > 0) 
              ? block.icon_large 
              : (block.icon && block.icon.trim().length > 0) 
                ? block.icon 
                : null;
            
            // Determine which icon to use for phonetic text: icon_large_fr takes priority
            const iconPhoneticToUse = (block.icon_large_fr && block.icon_large_fr.trim().length > 0) 
              ? block.icon_large_fr 
              : iconToUse;
            
            // Check if block has any content to avoid empty blocks
            const hasHebrewContent = block.content.hebrew && block.content.hebrew.trim().length > 0;
            const hasFrenchContent = block.content.french && block.content.french.trim().length > 0;
            const hasPhoneticContent = block.content.phonetic && block.content.phonetic.trim().length > 0;
            const hasKavana = block.kavana && block.kavana.trim().length > 0;
            const hasInformation = block.information && block.information.trim().length > 0;
            const hasImage = block.image && block.image.trim().length > 0;
            const hasImageComment = block.image_comment && block.image_comment.trim().length > 0;
            const hasTextFr = block.text_fr && block.text_fr.trim().length > 0;
            
            // Skip completely empty blocks
            if (!hasHebrewContent && !hasFrenchContent && !hasPhoneticContent && !hasKavana && !hasInformation && !hasImage && !hasTextFr) {
              return null;
            }
            
            console.log('DEBUG Block ID:', block.id);
            console.log('DEBUG Hebrew content:', block.content.hebrew);
            console.log('DEBUG French content:', block.content.french);
            console.log('DEBUG Phonetic content:', block.content.phonetic);
            console.log('DEBUG Kavana:', block.kavana);
            console.log('DEBUG Information:', block.information);
            console.log('DEBUG Text FR:', block.text_fr);
            console.log('DEBUG Icon:', block.icon);
            console.log('DEBUG Image:', block.image);
            
            return (
            <View key={block.id} style={[styles.blockContainer, index === 0 && styles.firstBlockContainer]}>
              {/* Full-width image at the top of each block */}
              {hasImage && (
                <View style={styles.fullWidthImageContainer}>
                  <Image
                    source={{ uri: block.image }}
                    style={styles.fullWidthImage}
                    resizeMode="contain"
                  />
                </View>
              )}

              {/* Kavana Section for this block */}
              {hasKavana && (
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
              {hasInformation && (
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
                      {hasImageComment && (
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

              {/* Block Content - Only render if there's actual content to display */}
              {(hasHebrewContent || hasFrenchContent || hasPhoneticContent || hasTextFr || iconToUse) && (
                <View style={styles.prayerContent}>
                  {/* Icons above Hebrew text for specific prayers */}
                  {iconToUse && (displayMode === 'hebrew' || displayMode === 'hebrewTrad' || displayMode === 'hebrewPhonetic') && (
                    <View style={styles.iconsContainer}>
                      <Image 
                        source={{ uri: iconToUse }} 
                        style={block.icon_large && block.icon_large.trim().length > 0 ? styles.blockImageLarge : styles.blockImage}
                        resizeMode="contain"
                      />
                    </View>
                  )}

                  {/* French text above Hebrew text */}
                  {hasTextFr && (displayMode === 'hebrew' || displayMode === 'hebrewTrad' || displayMode === 'hebrewPhonetic') && (
                    <Text style={[styles.textFrStyle, { fontSize: 14 + fontSizeAdjustment }]}>
                      {block.text_fr}
                    </Text>
                  )}

                  {/* Hebrew text */}
                  {hasHebrewContent && (displayMode === 'hebrew' || displayMode === 'hebrewTrad' || displayMode === 'hebrewPhonetic') && (
                    <View style={[
                      block.is_alternative ? styles.alternativeContainer : null,
                      block.is_alternative && styles.phoneticAlternativeSpacing
                    ]}>
                      <Text style={[styles.hebrewText, { fontSize: 18 + fontSizeAdjustment, fontFamily: hebrewFont }]}>
                        {block.content.hebrew}
                      </Text>
                    </View>
                  )}

                  {/* French translation */}
                  {hasFrenchContent && (displayMode === 'french' || displayMode === 'hebrewTrad') && (
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
                  {hasPhoneticContent && (displayMode === 'hebrewPhonetic' || displayMode === 'phonetic') && (
                    <>
                      {/* Icons above Phonetic text - aligned left for phonetic mode, or for hebrewPhonetic mode */}
                      {iconPhoneticToUse && (displayMode === 'phonetic' || displayMode === 'hebrewPhonetic') && (
                        <View style={styles.iconsContainerLeft}>
                          <Image 
                            source={{ uri: iconPhoneticToUse }} 
                            style={(block.icon_large_fr && block.icon_large_fr.trim().length > 0) || (block.icon_large && block.icon_large.trim().length > 0) ? styles.blockImageLarge : styles.blockImage}
                            resizeMode="contain"
                          />
                        </View>
                      )}
                      <View style={block.is_alternative ? styles.alternativeContainer : null}>
                        <Text style={[styles.phoneticText, { fontSize: 16 + fontSizeAdjustment }]}>
                          {block.content.phonetic}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              )}
              
              {/* Separator between blocks */}
              {index < currentPrayerBlocks.length - 1 && (
                <View style={styles.blockSeparator} />
              )}
            </View>
            );
          }).filter(Boolean)}

        </ScrollView>

        {/* Subcategory Navigation */}
        {subcategories.length > 1 && (
          <View style={styles.subcategoryNavigation}>
            <TouchableOpacity 
              style={[
                styles.navButton,
                selectedSubcategoryIndex === 0 && styles.navButtonDisabled
              ]}
              onPress={handlePreviousSubcategory}
              disabled={selectedSubcategoryIndex === 0}
            >
              <ChevronLeft 
                size={20} 
                color={selectedSubcategoryIndex === 0 ? Colors.text.muted : Colors.text.primary} 
              />
              <Text style={[
                styles.navButtonText,
                selectedSubcategoryIndex === 0 && styles.navButtonTextDisabled
              ]}>
                Précédent
              </Text>
            </TouchableOpacity>
            
            <View style={styles.navIndicator}>
              <Text style={styles.navIndicatorText}>
                {selectedSubcategoryIndex + 1} / {subcategories.length}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.navButton,
                selectedSubcategoryIndex === subcategories.length - 1 && styles.navButtonDisabled
              ]}
              onPress={handleNextSubcategory}
              disabled={selectedSubcategoryIndex === subcategories.length - 1}
            >
              <Text style={[
                styles.navButtonText,
                selectedSubcategoryIndex === subcategories.length - 1 && styles.navButtonTextDisabled
              ]}>
                Suivant
              </Text>
              <ChevronRight 
                size={20} 
                color={selectedSubcategoryIndex === subcategories.length - 1 ? Colors.text.muted : Colors.text.primary} 
              />
            </TouchableOpacity>
          </View>
        )}

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
      </View>

      <SettingsBottomSheet
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <SymbolsInfoBottomSheet
        visible={showSymbolsInfo}
        onClose={() => setShowSymbolsInfo(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
  headerSubtitle: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 16,
  },
  stickySection: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  contentWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 140,
  },
  mainContentWrapper: {
    flex: 1,
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
  prayerNavContainer: {
    marginBottom: 16,
  },
  prayerNavContent: {
    paddingHorizontal: 20,
  },
  prayerNavButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 16,
  },
  prayerNavButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  prayerNavText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  prayerNavTextActive: {
    color: Colors.primary,
    fontWeight: '600',
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
  informationText: {
    color: Colors.primary,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
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
    marginBottom: 8,
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
  frenchText: {
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
    aspectRatio: 16 / 9, // Ratio par défaut, l'image s'adaptera à sa taille naturelle
    minHeight: 150, // Hauteur minimale pour éviter des images trop petites
  },
  blockContainer: {
    marginBottom: 8,
  },
  firstBlockContainer: {
    marginTop: 0,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  blockSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
  blockSeparator: {
    height: 1,
    backgroundColor: Colors.background,
    marginHorizontal: 20,
  },
  subcategoryNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    height: 60,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 25,
    minWidth: 100,
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    opacity: 0.7,
  },
  navButtonText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
    marginHorizontal: 4,
  },
  navButtonTextDisabled: {
    color: Colors.text.muted,
  },
  navIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  navIndicatorText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
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
    marginTop: 12, // Espace entre les conteneurs alternatifs hébreu et phonétique
    alignItems: 'flex-start', // Aligne le contenu phonétique à gauche
  },
  commentImageContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  commentImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    minHeight: 120,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 50,
  },
});