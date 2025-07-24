export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}

export interface Prayer {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  content: {
    hebrew: string;
    french: string;
    phonetic: string;
  };
  isFavorite: boolean;
  isCustom: boolean;
  createdAt: Date;
  originalId?: string; // For favorites
  chapterId?: string; // For chapter prayers
  order?: number; // For ordering
  musicUrl?: string; // For custom prayers - stores the actual URL
  sub_category_id?: string; // For siddour blocks subcategory
  information?: string; // For siddour blocks
  kavana?: string; // For siddour blocks
  icon?: string; // For siddour blocks
  icon_large?: string; // For siddour blocks (alternative to icon)
  icon_large_fr?: string; // For siddour blocks (for phonetic text)
  text_fr?: string; // For siddour blocks
  image?: string; // For siddour blocks
  image_comment?: string; // For siddour blocks comments section
  sections?: { // For custom prayers
    gratitude?: string;
    refouah?: string;
    improvement?: string;
    dreams?: string;
    personal?: string;
  };
  is_alternative?: boolean; // For siddour blocks
}

export interface PrayerChapter {
  id: string;
  title: string;
  subtitle: string;
  prayers: Prayer[];
  order: number;
  banner?: string;
}

export interface SiddourSubcategory {
  id: string;
  title: string;
  category_id: string;
  order: number;
}

export interface SiddourBlockData {
  id: string;
  content_hebrew: string;
  content_fr: string;
  content_phonetic: string;
  sub_category_id: string;
  order: number;
  information?: string;
  kavana?: string;
  icon?: string;
  icon_large?: string;
  icon_large_fr?: string;
  text_fr?: string;
  image?: string;
  image_comment?: string;
}

export interface Kever {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  description: string;
  image?: string;
  distance?: number;
}

export interface DisplaySettings {
  showHebrew: boolean;
  showFrench: boolean;
  showPhonetic: boolean;
}

export interface Banner {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  order?: number;
  isActive?: boolean;
  createdAt?: Date;
}