import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  DocumentReference
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../config/firebase';
import { auth } from '../config/firebase';
import { Prayer, PrayerChapter, SiddourSubcategory, SiddourBlockData, Banner } from '../types';

// Custom Prayers CRUD
export const getCustomPrayers = async (userId: string): Promise<Prayer[]> => {
  try {
    console.log('🔍 [firestore] getCustomPrayers: Starting for userId:', userId);
    const customPrayersRef = collection(db, 'my_prieres');
    const q = query(customPrayersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const prayers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Prayer[];
    
    // Trier côté client pour éviter l'index composite
    const sortedPrayers = prayers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    console.log('✅ [firestore] getCustomPrayers: Success, found', sortedPrayers.length, 'prayers');
    return sortedPrayers;
  } catch (error: any) {
    console.error('❌ [firestore] getCustomPrayers: Error:', error);
    // Si erreur de permissions ou d'index, retourner un tableau vide
    if (error.code === 'permission-denied' || error.code === 'failed-precondition') {
      console.warn('Permissions Firestore non configurées pour les prières personnalisées');
      return [];
    }
    if (error.code === 'unavailable') {
      console.warn('Firestore temporairement indisponible, retour de données vides');
      return [];
    }
    throw error;
  }
};

export const createCustomPrayer = async (userId: string, prayer: Omit<Prayer, 'id'>): Promise<string> => {
  try {
    console.log('🔍 [firestore] createCustomPrayer: Starting for userId:', userId);
    const customPrayersRef = collection(db, 'my_prieres');
    const docRef = await addDoc(customPrayersRef, {
      ...prayer,
      userId: userId,
      createdAt: Timestamp.now(),
    });
    console.log('✅ [firestore] createCustomPrayer: Success, created prayer with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('❌ [firestore] createCustomPrayer: Error:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Les permissions Firestore ne sont pas configurées. Veuillez configurer les règles de sécurité dans la console Firebase.');
    }
    if (error.code === 'unavailable') {
      throw new Error('Service temporairement indisponible. Veuillez réessayer plus tard.');
    }
    throw error;
  }
};

export const updateCustomPrayer = async (userId: string, prayerId: string, prayer: Partial<Prayer>): Promise<void> => {
  try {
    console.log('🔍 [firestore] updateCustomPrayer: Starting for prayerId:', prayerId);
    const prayerRef = doc(db, 'my_prieres', prayerId);
    await updateDoc(prayerRef, prayer);
    console.log('✅ [firestore] updateCustomPrayer: Success');
  } catch (error: any) {
    console.error('❌ [firestore] updateCustomPrayer: Error:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Les permissions Firestore ne sont pas configurées. Veuillez configurer les règles de sécurité dans la console Firebase.');
    }
    if (error.code === 'unavailable') {
      throw new Error('Service temporairement indisponible. Veuillez réessayer plus tard.');
    }
    throw error;
  }
};

export const deleteCustomPrayer = async (userId: string, prayerId: string): Promise<void> => {
  try {
    console.log('🔍 [firestore] deleteCustomPrayer: Starting for prayerId:', prayerId);
    const prayerRef = doc(db, 'my_prieres', prayerId);
    await deleteDoc(prayerRef);
    console.log('✅ [firestore] deleteCustomPrayer: Success');
  } catch (error: any) {
    console.error('❌ [firestore] deleteCustomPrayer: Error:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Les permissions Firestore ne sont pas configurées. Veuillez configurer les règles de sécurité dans la console Firebase.');
    }
    if (error.code === 'unavailable') {
      throw new Error('Service temporairement indisponible. Veuillez réessayer plus tard.');
    }
    throw error;
  }
};

// Favorites CRUD
export const getFavoritePrayers = async (userId: string): Promise<Prayer[]> => {
  try {
    console.log('🔍 [firestore] getFavoritePrayers: Starting for userId:', userId);
    const favoritesRef = collection(db, 'fav_siddour_sub_categories');
    const q = query(favoritesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const favorites = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      isFavorite: true,
      createdAt: doc.data().addedAt?.toDate() || new Date(),
    })) as Prayer[];
    console.log('✅ [firestore] getFavoritePrayers: Success, found', favorites.length, 'favorites');
    return favorites;
  } catch (error: any) {
    console.error('❌ [firestore] getFavoritePrayers: Error:', error);
    if (error.code === 'permission-denied') {
      console.warn('Permissions Firestore non configurées pour les favoris');
      return [];
    }
    if (error.code === 'unavailable') {
      console.warn('Firestore temporairement indisponible, retour de données vides');
      return [];
    }
    throw error;
  }
};

export const addToFavorites = async (userId: string, prayer: Prayer): Promise<void> => {
  try {
    console.log('🔍 [firestore] addToFavorites: Starting for prayer:', prayer.title);
    const favoritesRef = collection(db, 'fav_siddour_sub_categories');
    await addDoc(favoritesRef, {
      ...prayer,
      userId: userId,
      addedAt: Timestamp.now(),
    });
    console.log('✅ [firestore] addToFavorites: Success');
  } catch (error: any) {
    console.error('❌ [firestore] addToFavorites: Error:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Les permissions Firestore ne sont pas configurées pour les favoris. Veuillez configurer les règles de sécurité dans la console Firebase.');
    }
    if (error.code === 'unavailable') {
      throw new Error('Service temporairement indisponible. Veuillez réessayer plus tard.');
    }
    throw error;
  }
};

export const removeFromFavorites = async (userId: string, prayerId: string): Promise<void> => {
  try {
    console.log('🔍 [firestore] removeFromFavorites: Starting for prayerId:', prayerId);
    const favoritesRef = collection(db, 'fav_siddour_sub_categories');
    const q = query(favoritesRef, where('userId', '==', userId), where('originalId', '==', prayerId));
    const querySnapshot = await getDocs(q);
    
    querySnapshot.docs.forEach(async (docSnapshot) => {
      await deleteDoc(docSnapshot.ref);
    });
    console.log('✅ [firestore] removeFromFavorites: Success, removed', querySnapshot.docs.length, 'documents');
  } catch (error: any) {
    console.error('❌ [firestore] removeFromFavorites: Error:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Les permissions Firestore ne sont pas configurées pour les favoris. Veuillez configurer les règles de sécurité dans la console Firebase.');
    }
    if (error.code === 'unavailable') {
      throw new Error('Service temporairement indisponible. Veuillez réessayer plus tard.');
    }
    throw error;
  }
};

export const checkIfFavorite = async (userId: string, prayerId: string): Promise<boolean> => {
  try {
    console.log('🔍 [firestore] checkIfFavorite: Starting for prayerId:', prayerId);
    const favoritesRef = collection(db, 'fav_siddour_sub_categories');
    const q = query(favoritesRef, where('userId', '==', userId), where('originalId', '==', prayerId));
    const querySnapshot = await getDocs(q);
  
    const isFavorite = !querySnapshot.empty;
    console.log('✅ [firestore] checkIfFavorite: Success, isFavorite:', isFavorite);
    return isFavorite;
  } catch (error: any) {
    console.error('❌ [firestore] checkIfFavorite: Error:', error);
    if (error.code === 'permission-denied') {
      console.warn('Permissions Firestore non configurées pour les favoris');
      return false;
    }
    if (error.code === 'unavailable') {
      console.warn('Firestore temporairement indisponible, retour false');
      return false;
    }
    throw error;
  }
};

// Get favorite prayer by document ID
export const getFavoritePrayerByDocId = async (docId: string): Promise<Prayer | null> => {
  try {
    console.log('🔍 [firestore] getFavoritePrayerByDocId: Starting for docId:', docId);
    
    // Vérifier que l'utilisateur est authentifié avant de faire la requête
    const user = auth.currentUser;
    
    if (!user) {
      console.warn('⚠️ [firestore] getFavoritePrayerByDocId: User not authenticated');
      return null;
    }
    
    const favoriteRef = doc(db, 'fav_siddour_sub_categories', docId);
    const docSnapshot = await getDoc(favoriteRef);
    
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      
      // Vérifier que la prière appartient à l'utilisateur connecté
      if (data.userId && data.userId !== user.uid) {
        console.warn('⚠️ [firestore] getFavoritePrayerByDocId: Prayer belongs to different user');
        return null;
      }
      
      const favoritePrayer = {
        id: docSnapshot.id,
        ...data,
        isFavorite: true,
        createdAt: data.addedAt?.toDate() || new Date(),
      } as Prayer;
      console.log('✅ [firestore] getFavoritePrayerByDocId: Success, found prayer:', favoritePrayer.title);
      return favoritePrayer;
    }
    
    console.warn('⚠️ [firestore] getFavoritePrayerByDocId: Prayer not found for docId:', docId);
    return null;
  } catch (error: any) {
    console.error('❌ [firestore] getFavoritePrayerByDocId: Error:', error);
    if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions') || error.code === 'unauthenticated') {
      console.warn('Permissions Firestore non configurées pour getFavoritePrayerByDocId');
      console.warn('Vérifiez vos règles de sécurité Firestore pour la collection fav_siddour_sub_categories');
      // Return null silently to prevent app crash
      return null;
    }
    if (error.code === 'unavailable') {
      console.warn('Firestore temporairement indisponible, retour null');
      return null;
    }
    // For any other errors, return null silently to prevent app crash
    console.warn(`⚠️ [firestore] getFavoritePrayerByDocId: Returning null due to error for docId ${docId}`);
    return null;
  }
};

// Chapters and Prayers (read-only for now)
export const getChapters = async (): Promise<PrayerChapter[]> => {
  try {
    console.log('🔍 [DEBUG] getChapters: Starting to fetch chapters...');
    const chaptersRef = collection(db, 'siddour_categories');
    const q = query(chaptersRef, orderBy('order'));
    const querySnapshot = await getDocs(q);
    
    const chapters = querySnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().name,
      subtitle: doc.data().description,
      order: doc.data().order,
      banner: doc.data().banner,
      prayers: [], // Sera rempli par getPrayersByChapter si nécessaire
    })) as PrayerChapter[];
    
    console.log('✅ [DEBUG] getChapters: Successfully fetched chapters:', chapters);
    console.log('📊 [DEBUG] getChapters: Number of chapters found:', chapters.length);
    return chapters;
  } catch (error: any) {
    console.error('❌ [DEBUG] getChapters: Error fetching chapters:', error);
    console.error('❌ [DEBUG] getChapters: Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    // Si erreur de permissions, retourner des données par défaut
    if (error.code === 'permission-denied') {
      console.warn('Permissions Firestore non configurées, utilisation de données par défaut');
      return [
        {
          id: '1',
          title: 'Prières du matin',
          subtitle: 'Chaharit',
          order: 1,
          prayers: []
        },
        {
          id: '2',
          title: 'Prières de l\'après-midi',
          subtitle: 'Minha',
          order: 2,
          prayers: []
        },
        {
          id: '3',
          title: 'Prières du soir',
          subtitle: 'Arvit',
          order: 3,
          prayers: []
        }
      ];
    }
    if (error.code === 'unavailable') {
      console.warn('Firestore temporairement indisponible, utilisation de données par défaut');
      return [];
    }
    throw error;
  }
};

export const getChapterById = async (chapterId: string): Promise<PrayerChapter | null> => {
  try {
    console.log('🔍 [DEBUG] getChapterById: Fetching chapter with ID:', chapterId);
    const chapterRef = doc(db, 'siddour_categories', chapterId);
    const docSnapshot = await getDoc(chapterRef);
    
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      const chapter = {
        id: docSnapshot.id,
        title: data.name,
        subtitle: data.description,
        order: data.order,
        prayers: [], // Sera rempli par getPrayersByChapter si nécessaire
      } as PrayerChapter;
      
      console.log('✅ [DEBUG] getChapterById: Successfully fetched chapter:', chapter);
      return chapter;
    }
    
    console.warn('⚠️ [DEBUG] getChapterById: Chapter not found for ID:', chapterId);
    return null;
  } catch (error: any) {
    console.error('❌ [DEBUG] getChapterById: Error fetching chapter:', error);
    console.error('❌ [DEBUG] getChapterById: Error details:', {
      code: error.code,
      message: error.message,
      chapterId: chapterId
    });
    // Si erreur de permissions, retourner des données par défaut
    if (error.code === 'permission-denied') {
      console.warn('Permissions Firestore non configurées, utilisation de données par défaut');
      const defaultChapters = [
        {
          id: '1',
          title: 'Prières du matin',
          subtitle: 'Chaharit',
          order: 1,
          prayers: []
        },
        {
          id: '2',
          title: 'Prières de l\'après-midi',
          subtitle: 'Minha',
          order: 2,
          prayers: []
        },
        {
          id: '3',
          title: 'Prières du soir',
          subtitle: 'Arvit',
          order: 3,
          prayers: []
        }
      ];
      return defaultChapters.find(chapter => chapter.id === chapterId) || null;
    }
    if (error.code === 'unavailable') {
      console.warn('Firestore temporairement indisponible, retour null');
      return null;
    }
    throw error;
  }
};

export const getPrayersByChapter = async (chapterId: string): Promise<Prayer[]> => {
  try {
    console.log('🔍 [firestore] getPrayersByChapter: Starting for chapterId:', chapterId);
    const prayersRef = collection(db, 'prayers');
    const q = query(prayersRef, where('chapterId', '==', chapterId), orderBy('order'));
    const querySnapshot = await getDocs(q);
    
    const prayers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Prayer[];
    console.log('✅ [firestore] getPrayersByChapter: Success, found', prayers.length, 'prayers');
    return prayers;
  } catch (error: any) {
    console.error('❌ [firestore] getPrayersByChapter: Error:', error);
    // Si erreur de permissions, retourner des données par défaut
    if (error.code === 'permission-denied') {
      console.warn('Permissions Firestore non configurées, utilisation de données par défaut');
      return [
        {
          id: '1',
          title: 'Modé Ani',
          subtitle: 'Remerciement au réveil',
          category: 'chaharit',
          order: 1,
          chapterId: chapterId,
          content: {
            hebrew: 'מודה אני לפניך מלך חי וקיים, שהחזרת בי נשמתי בחמלה',
            french: 'Je te remercie, Roi vivant et éternel, d\'avoir fait revenir en moi mon âme avec miséricorde',
            phonetic: 'Modé ani léfanékha mélekh haï vékayam, chéhézarta bi nichmati béhémla'
          },
          createdAt: new Date()
        }
      ];
    }
    if (error.code === 'unavailable') {
      console.warn('Firestore temporairement indisponible, retour de données vides');
      return [];
    }
    throw error;
  }
};

export const getPrayerById = async (prayerId: string): Promise<Prayer | null> => {
  try {
    console.log('🔍 [firestore] getPrayerById: Starting for prayerId:', prayerId);
    const prayerRef = doc(db, 'prayers', prayerId);
    const docSnapshot = await getDoc(prayerRef);
    
    if (docSnapshot.exists()) {
      const prayer = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as Prayer;
      console.log('✅ [firestore] getPrayerById: Success, found prayer:', prayer.title);
      return prayer;
    }
    
    console.warn('⚠️ [firestore] getPrayerById: Prayer not found for ID:', prayerId);
    return null;
  } catch (error: any) {
    console.error('❌ [firestore] getPrayerById: Error:', error);
    if (error.code === 'permission-denied') {
      console.warn('Permissions Firestore non configurées pour getPrayerById');
      return null;
    }
    if (error.code === 'unavailable') {
      console.warn('Firestore temporairement indisponible, retour null');
      return null;
    }
    throw error;
  }
};

// Siddour Subcategories
export const getSiddourSubcategories = async (chapterId: string): Promise<SiddourSubcategory[]> => {
  try {
    console.log('🔍 [DEBUG] getSiddourSubcategories: Fetching subcategories for chapter ID:', chapterId);
    
    // Create a DocumentReference for the category
    const categoryRef = doc(db, 'siddour_categories', chapterId);
    console.log('🔍 [DEBUG] getSiddourSubcategories: Using category reference:', categoryRef.path);
    
    const subcategoriesRef = collection(db, 'siddour_sub_categories');
    const q = query(subcategoriesRef, where('category_id', '==', categoryRef), orderBy('order'));
    console.log('🔍 [DEBUG] getSiddourSubcategories: Query created, executing...');
    const querySnapshot = await getDocs(q);
    
    const subcategories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().name || '',
      category_id: doc.data().category_id,
      order: doc.data().order || 0,
    })) as SiddourSubcategory[];
    
    console.log('✅ [DEBUG] getSiddourSubcategories: Successfully fetched subcategories:', subcategories);
    console.log('📊 [DEBUG] getSiddourSubcategories: Number of subcategories found:', subcategories.length);
    
    // Log each subcategory for detailed inspection
    subcategories.forEach((subcat, index) => {
      console.log(`📋 [DEBUG] getSiddourSubcategories: Subcategory ${index + 1}:`, {
        id: subcat.id,
        title: subcat.title,
        category_id: subcat.category_id,
        order: subcat.order
      });
    });
    
    return subcategories;
  } catch (error: any) {
    console.error('❌ [DEBUG] getSiddourSubcategories: Error fetching subcategories:', error);
    console.error('❌ [DEBUG] getSiddourSubcategories: Error details:', {
      code: error.code,
      message: error.message,
      chapterId: chapterId
    });
    if (error.code === 'permission-denied') {
      console.warn('Permissions Firestore non configurées pour les sous-catégories');
      return [];
    }
    if (error.code === 'unavailable') {
      console.warn('Firestore temporairement indisponible, retour de données vides');
      return [];
    }
    throw error;
  }
};

// Siddour Blocks
export const getSiddourBlocks = async (subcategoryId: string): Promise<SiddourBlockData[]> => {
  try {
    console.log('🔍 [DEBUG] getSiddourBlocks: Fetching blocks for subcategory ID:', subcategoryId);
    
    // Create a DocumentReference for the subcategory
    const subcategoryRef = doc(db, 'siddour_sub_categories', subcategoryId);
    console.log('🔍 [DEBUG] getSiddourBlocks: Using subcategory reference:', subcategoryRef.path);
    
    const blocksRef = collection(db, 'siddour_blocks');
    const q = query(blocksRef, where('sub_category_id', '==', subcategoryRef), orderBy('order'));
    console.log('🔍 [DEBUG] getSiddourBlocks: Query created, executing...');
    const querySnapshot = await getDocs(q);
    
    const blocks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      content_hebrew: doc.data().content_hebrew || '',
      content_fr: doc.data().content_fr || '',
      content_phonetic: doc.data().content_phonetic || '',
      sub_category_id: (doc.data().sub_category_id as DocumentReference)?.id || '',
      order: doc.data().order || 0,
      information: doc.data().information,
      kavana: doc.data().kavana,
      icon: doc.data().icon,
      icon_large: doc.data().icon_large,
      icon_large_fr: doc.data().icon_large_fr,
      text_fr: doc.data().text_fr,
      image: doc.data().image,
      image_comment: doc.data().image_comment,
      is_alternative: doc.data().is_alternative || false,
    })) as SiddourBlockData[];
    
    console.log('✅ [DEBUG] getSiddourBlocks: Successfully fetched blocks:', blocks);
    console.log('📊 [DEBUG] getSiddourBlocks: Number of blocks found:', blocks.length);
    
    // Log each block for detailed inspection
    blocks.forEach((block, index) => {
      console.log(`📄 [DEBUG] getSiddourBlocks: Block ${index + 1}:`, {
        id: block.id,
        information: block.information,
        text_fr: block.text_fr,
        sub_category_id: block.sub_category_id,
        is_alternative: block.is_alternative,
        order: block.order,
        content_hebrew_length: block.content_hebrew.length,
        content_fr_length: block.content_fr.length,
        content_phonetic_length: block.content_phonetic.length
      });
    });
    
    return blocks;
  } catch (error: any) {
    console.error('❌ [DEBUG] getSiddourBlocks: Error fetching blocks:', error);
    console.error('❌ [DEBUG] getSiddourBlocks: Error details:', {
      code: error.code,
      message: error.message,
      subcategoryId: subcategoryId
    });
    if (error.code === 'permission-denied') {
      console.warn('Permissions Firestore non configurées pour les blocs');
      return [];
    }
    if (error.code === 'unavailable') {
      console.warn('Firestore temporairement indisponible, retour de données vides');
      return [];
    }
    throw error;
  }
};

export const getCustomPrayerById = async (userId: string, prayerId: string): Promise<Prayer | null> => {
  try {
    console.log('🔍 [firestore] getCustomPrayerById: Starting for prayerId:', prayerId);
    const prayerRef = doc(db, 'my_prieres', prayerId);
    const docSnapshot = await getDoc(prayerRef);
    
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      // Vérifier que la prière appartient bien à l'utilisateur
      if (data.userId === userId) {
        const prayer = {
          id: docSnapshot.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Prayer;
        console.log('✅ [firestore] getCustomPrayerById: Success, found prayer:', prayer.title);
        return prayer;
      }
      console.warn('⚠️ [firestore] getCustomPrayerById: Prayer belongs to different user');
    }
    
    console.warn('⚠️ [firestore] getCustomPrayerById: Prayer not found for ID:', prayerId);
    return null;
  } catch (error: any) {
    console.error('❌ [firestore] getCustomPrayerById: Error:', error);
    if (error.code === 'permission-denied') {
      console.warn('Permissions Firestore non configurées pour la prière personnalisée');
      return null;
    }
    if (error.code === 'unavailable') {
      console.warn('Firestore temporairement indisponible, retour null');
      return null;
    }
    throw error;
  }
};

// Search functionality
export const getAllSiddourSubcategoriesForSearch = async (): Promise<{id: string; title: string; chapterId: string; parentChapterName: string}[]> => {
  try {
    console.log('🔍 [DEBUG] getAllSiddourSubcategoriesForSearch: Fetching all subcategories for search...');
    
    // First, load all chapters to get their names
    const chaptersRef = collection(db, 'siddour_categories');
    const chaptersQuery = query(chaptersRef, orderBy('order'));
    const chaptersSnapshot = await getDocs(chaptersQuery);
    
    // Create a map of chapter ID to chapter name for quick lookup
    const chapterNamesMap = new Map<string, string>();
    chaptersSnapshot.docs.forEach(doc => {
      chapterNamesMap.set(doc.id, doc.data().name || '');
    });
    
    console.log('📚 [DEBUG] getAllSiddourSubcategoriesForSearch: Loaded chapter names:', chapterNamesMap);
    
    // Now load subcategories
    const subcategoriesRef = collection(db, 'siddour_sub_categories');
    const q = query(subcategoriesRef, orderBy('order'));
    const querySnapshot = await getDocs(q);
    
    const subcategories = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const categoryRef = data.category_id as DocumentReference;
      
      return {
        id: doc.id,
        title: data.name || '',
        chapterId: categoryRef?.id || '',
        parentChapterName: chapterNamesMap.get(categoryRef?.id || '') || 'Autre',
      };
    });
    
    console.log('✅ [DEBUG] getAllSiddourSubcategoriesForSearch: Successfully fetched subcategories:', subcategories);
    console.log('📊 [DEBUG] getAllSiddourSubcategoriesForSearch: Number of subcategories found:', subcategories.length);
    
    return subcategories;
  } catch (error: any) {
    console.error('❌ [DEBUG] getAllSiddourSubcategoriesForSearch: Error fetching subcategories:', error);
    console.error('❌ [DEBUG] getAllSiddourSubcategoriesForSearch: Error details:', {
      code: error.code,
      message: error.message
    });
    if (error.code === 'permission-denied') {
      console.warn('Permissions Firestore non configurées pour la recherche');
      return [];
    }
    if (error.code === 'unavailable') {
      console.warn('Firestore temporairement indisponible, retour de données vides');
      return [];
    }
    throw error;
  }
};

// Get single subcategory by ID
export const getSiddourSubcategoryById = async (subcategoryId: string): Promise<SiddourSubcategory | null> => {
  try {
    console.log('🔍 [DEBUG] getSiddourSubcategoryById: Fetching subcategory with ID:', subcategoryId);
    const subcategoryRef = doc(db, 'siddour_sub_categories', subcategoryId);
    const docSnapshot = await getDoc(subcategoryRef);
    
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      const subcategory = {
        id: docSnapshot.id,
        title: data.name || '',
        category_id: data.category_id,
        order: data.order || 0,
        position: data.position, // Include position data for kevarim
      } as SiddourSubcategory & { position?: { latitude: number; longitude: number } };
      
      console.log('✅ [DEBUG] getSiddourSubcategoryById: Successfully fetched subcategory:', subcategory);
      return subcategory;
    }
    
    console.warn('⚠️ [DEBUG] getSiddourSubcategoryById: Subcategory not found for ID:', subcategoryId);
    return null;
  } catch (error: any) {
    console.error('❌ [DEBUG] getSiddourSubcategoryById: Error fetching subcategory:', error);
    console.error('❌ [DEBUG] getSiddourSubcategoryById: Error details:', {
      code: error.code,
      message: error.message,
      subcategoryId: subcategoryId
    });
    if (error.code === 'permission-denied') {
      console.warn('Permissions Firestore non configurées pour la sous-catégorie');
      return null;
    }
    if (error.code === 'unavailable') {
      console.warn('Firestore temporairement indisponible, retour null');
      return null;
    }
    throw error;
  }
};

// Kevarim with position
export const getSiddourSubcategoriesWithPosition = async (): Promise<{id: string; name: string; position: {latitude: number; longitude: number}}[]> => {
  try {
    console.log('🔍 [DEBUG] getSiddourSubcategoriesWithPosition: Fetching subcategories with position...');
    
    const subcategoriesRef = collection(db, 'siddour_sub_categories');
    const querySnapshot = await getDocs(subcategoriesRef);
    
    const subcategoriesWithPosition = querySnapshot.docs
      .map(doc => {
        const data = doc.data();
        console.log('🔍 [DEBUG] Document data:', { id: doc.id, name: data.name, position: data.position });
        return {
          id: doc.id,
          name: data.name || '',
          position: data.position,
        };
      })
      .filter(subcat => 
        subcat.position && 
        typeof subcat.position.latitude === 'number' && 
        typeof subcat.position.longitude === 'number' &&
        !isNaN(subcat.position.latitude) &&
        !isNaN(subcat.position.longitude)
      );
    
    console.log('✅ [DEBUG] getSiddourSubcategoriesWithPosition: Successfully fetched subcategories with position:', subcategoriesWithPosition);
    console.log('📊 [DEBUG] getSiddourSubcategoriesWithPosition: Number of subcategories with position found:', subcategoriesWithPosition.length);
    
    return subcategoriesWithPosition;
  } catch (error: any) {
    console.error('❌ [DEBUG] getSiddourSubcategoriesWithPosition: Error fetching subcategories with position:', error);
    console.error('❌ [DEBUG] getSiddourSubcategoriesWithPosition: Error details:', {
      code: error.code,
      message: error.message
    });
    if (error.code === 'permission-denied') {
      console.warn('Permissions Firestore non configurées pour les kevarim');
      return [];
    }
    if (error.code === 'unavailable') {
      console.warn('Firestore temporairement indisponible, retour de données vides');
      return [];
    }
    throw error;
  }
};

// Banners
export const getBanners = async (): Promise<Banner[]> => {
  try {
    console.log('🔍 [DEBUG] getBanners: Fetching banners...');
    const bannersRef = collection(db, 'banners');
    const q = query(bannersRef, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    
    // NOUVEAUX LOGS DÉTAILLÉS
    console.log('📄 [DEBUG] getBanners: querySnapshot.empty:', querySnapshot.empty);
    console.log('📄 [DEBUG] getBanners: querySnapshot.size:', querySnapshot.size);
    console.log('📄 [DEBUG] getBanners: querySnapshot.docs (raw):', querySnapshot.docs);
    
    const banners = querySnapshot.docs
      .map(doc => {
        const data = doc.data();
        console.log('📄 [DEBUG] getBanners: Processing document ID:', doc.id);
        console.log('📄 [DEBUG] getBanners: Processing document data:', data);
        
        return {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          image: data.image || '',
          link: data.link || '',
          order: data.order || 0,
          isActive: data.isActive !== false, // Default to true if not specified
          createdAt: data.createdAt?.toDate() || new Date(),
        console.log('📄 [DEBUG] getBanners: Mapped banner:', {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          image: data.image || '',
          link: data.link || '',
          order: data.order || 0,
          isActive: data.isActive !== false,
        });
      })
      .filter(banner => {
        const passesFilter = banner.isActive && banner.image && banner.link;
        console.log(`📄 [DEBUG] getBanners: Banner ${banner.id} - title: "${banner.title}", isActive: ${banner.isActive}, image: "${banner.image}", link: "${banner.link}", passesFilter: ${passesFilter}`);
        return passesFilter;
      });
    
    console.log('✅ [DEBUG] getBanners: Successfully fetched banners (after filter):', banners);
    console.log('📊 [DEBUG] getBanners: Number of banners found (after filter):', banners.length);
    
    return banners;
  } catch (error: any) {
    console.error('❌ [DEBUG] getBanners: Error fetching banners:', error);
    console.error('❌ [DEBUG] getBanners: Error details:', {
      code: error.code,
      message: error.message
    });
    if (error.code === 'permission-denied') {
      console.warn('Permissions Firestore non configurées pour les bannières');
      return [];
    }
    if (error.code === 'unavailable') {
      console.warn('Firestore temporairement indisponible, retour de données vides');
      return [];
    }
    throw error;
  }
};