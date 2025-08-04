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
    return sortedPrayers;
  } catch (error: any) {
    console.error('Error getting custom prayers:', error);
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
    const customPrayersRef = collection(db, 'my_prieres');
    const docRef = await addDoc(customPrayersRef, {
      ...prayer,
      userId: userId,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating custom prayer:', error);
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
    const prayerRef = doc(db, 'my_prieres', prayerId);
    await updateDoc(prayerRef, prayer);
  } catch (error: any) {
    console.error('Error updating custom prayer:', error);
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
    const prayerRef = doc(db, 'my_prieres', prayerId);
    await deleteDoc(prayerRef);
  } catch (error: any) {
    console.error('Error deleting custom prayer:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Les permissions Firestore ne sont pas configurées. Veuillez configurer les règles de sécurité dans la console Firebase.');
    }
    if (error.code === 'unavailable') {
      throw new Error('Service temporairement indisponible. Veuillez réessayer plus tard.');
    }
    throw error;
  }
};

// Delete all user data
export const deleteAllCustomPrayers = async (userId: string): Promise<void> => {
  try {
    const customPrayersRef = collection(db, 'my_prieres');
    const q = query(customPrayersRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error: any) {
    console.error('Error deleting all custom prayers:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Les permissions Firestore ne sont pas configurées pour la suppression des prières.');
    }
    if (error.code === 'unavailable') {
      throw new Error('Service temporairement indisponible. Veuillez réessayer plus tard.');
    }
    throw error;
  }
};

export const deleteAllFavoritePrayers = async (userId: string): Promise<void> => {
  try {
    const favoritesRef = collection(db, 'fav_siddour_sub_categories');
    const q = query(favoritesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error: any) {
    console.error('Error deleting all favorite prayers:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Les permissions Firestore ne sont pas configurées pour la suppression des favoris.');
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
    const favoritesRef = collection(db, 'fav_siddour_sub_categories');
    const q = query(favoritesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const favorites = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      isFavorite: true,
      createdAt: doc.data().addedAt?.toDate() || new Date(),
    })) as Prayer[];
    return favorites;
  } catch (error: any) {
    console.error('Error getting favorite prayers:', error);
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
    const favoritesRef = collection(db, 'fav_siddour_sub_categories');
    await addDoc(favoritesRef, {
      ...prayer,
      userId: userId,
      addedAt: Timestamp.now(),
    });
  } catch (error: any) {
    console.error('Error adding to favorites:', error);
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
    const favoritesRef = collection(db, 'fav_siddour_sub_categories');
    const q = query(favoritesRef, where('userId', '==', userId), where('originalId', '==', prayerId));
    const querySnapshot = await getDocs(q);
    
    querySnapshot.docs.forEach(async (docSnapshot) => {
      await deleteDoc(docSnapshot.ref);
    });
  } catch (error: any) {
    console.error('Error removing from favorites:', error);
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
    const favoritesRef = collection(db, 'fav_siddour_sub_categories');
    const q = query(favoritesRef, where('userId', '==', userId), where('originalId', '==', prayerId));
    const querySnapshot = await getDocs(q);
  
    const isFavorite = !querySnapshot.empty;
    return isFavorite;
  } catch (error: any) {
    console.error('Error checking if favorite:', error);
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
    // Vérifier que l'utilisateur est authentifié avant de faire la requête
    const user = auth.currentUser;
    
    if (!user) {
      return null;
    }
    
    const favoriteRef = doc(db, 'fav_siddour_sub_categories', docId);
    const docSnapshot = await getDoc(favoriteRef);
    
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      
      // Vérifier que la prière appartient à l'utilisateur connecté
      if (data.userId && data.userId !== user.uid) {
        return null;
      }
      
      const favoritePrayer = {
        id: docSnapshot.id,
        ...data,
        isFavorite: true,
        createdAt: data.addedAt?.toDate() || new Date(),
      } as Prayer;
      return favoritePrayer;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error getting favorite prayer by doc ID:', error);
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
    return null;
  }
};

// Chapters and Prayers (read-only for now)
export const getChapters = async (): Promise<PrayerChapter[]> => {
  try {
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
    
    return chapters;
  } catch (error: any) {
    console.error('Error fetching chapters:', error);
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
      
      return chapter;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error fetching chapter:', error);
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
    const prayersRef = collection(db, 'prayers');
    const q = query(prayersRef, where('chapterId', '==', chapterId), orderBy('order'));
    const querySnapshot = await getDocs(q);
    
    const prayers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Prayer[];
    return prayers;
  } catch (error: any) {
    console.error('Error getting prayers by chapter:', error);
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
    const prayerRef = doc(db, 'prayers', prayerId);
    const docSnapshot = await getDoc(prayerRef);
    
    if (docSnapshot.exists()) {
      const prayer = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as Prayer;
      return prayer;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error getting prayer by ID:', error);
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
    // Create a DocumentReference for the category
    const categoryRef = doc(db, 'siddour_categories', chapterId);
    
    const subcategoriesRef = collection(db, 'siddour_sub_categories');
    const q = query(subcategoriesRef, where('category_id', '==', categoryRef), orderBy('order'));
    const querySnapshot = await getDocs(q);
    
    const subcategories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().name || '',
      category_id: doc.data().category_id,
      order: doc.data().order || 0,
    })) as SiddourSubcategory[];
    
    return subcategories;
  } catch (error: any) {
    console.error('Error fetching subcategories:', error);
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
    // Create a DocumentReference for the subcategory
    const subcategoryRef = doc(db, 'siddour_sub_categories', subcategoryId);
    
    const blocksRef = collection(db, 'siddour_blocks');
    const q = query(blocksRef, where('sub_category_id', '==', subcategoryRef), orderBy('order'));
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
      audio: doc.data().audio,
    })) as SiddourBlockData[];
    
    return blocks;
  } catch (error: any) {
    console.error('Error fetching blocks:', error);
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
        return prayer;
      }
    }
    
    return null;
  } catch (error: any) {
    console.error('Error getting custom prayer by ID:', error);
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
    // First, load all chapters to get their names
    const chaptersRef = collection(db, 'siddour_categories');
    const chaptersQuery = query(chaptersRef, orderBy('order'));
    const chaptersSnapshot = await getDocs(chaptersQuery);
    
    // Create a map of chapter ID to chapter name for quick lookup
    const chapterNamesMap = new Map<string, string>();
    chaptersSnapshot.docs.forEach(doc => {
      chapterNamesMap.set(doc.id, doc.data().name || '');
    });
    
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
    
    return subcategories;
  } catch (error: any) {
    console.error('Error fetching subcategories for search:', error);
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
      
      return subcategory;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error fetching subcategory by ID:', error);
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
    const subcategoriesRef = collection(db, 'siddour_sub_categories');
    const querySnapshot = await getDocs(subcategoriesRef);
    
    const subcategoriesWithPosition = querySnapshot.docs
      .map(doc => {
        const data = doc.data();
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
    
    return subcategoriesWithPosition;
  } catch (error: any) {
    console.error('Error fetching subcategories with position:', error);
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
        };
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