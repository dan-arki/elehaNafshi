/**
 * Utility functions for category mapping
 */

// Mapping between chapter titles and category IDs used for filtering
const CHAPTER_TO_CATEGORY_MAP: { [key: string]: string } = {
  'Chaharit': 'chaharit',
  'Minha': 'minha',
  'Arvit': 'arvit',
  'Kriat Chéma a\'l amita': 'kriat-chema',
  'Brah\'ot': 'brachot',
  'Tfilot supplémentaires': 'tfilot-supplementaires',
  'Ségoulot': 'segoulot',
  // Add more mappings as needed
};

/**
 * Convert chapter title to category ID for filtering
 * @param chapterTitle - The title of the chapter
 * @returns The category ID for filtering, or 'autres' if not found
 */
export const getFilterCategoryFromChapterTitle = (chapterTitle: string): string => {
  return CHAPTER_TO_CATEGORY_MAP[chapterTitle] || 'autres';
};

/**
 * Get display name for category
 * @param category - The category ID
 * @returns The display name for the category
 */
export const getCategoryDisplayName = (category: string): string => {
  switch (category) {
    case 'chaharit':
      return 'Chaharit';
    case 'minha':
      return 'Minha';
    case 'arvit':
      return 'Arvit';
    case 'kriat-chema':
      return 'Kriat Chéma\'a l\'amita';
    case 'brachot':
      return 'Brachot';
    case 'tfilot-supplementaires':
      return 'Tfilot supplémentaires';
    case 'segoulot':
      return 'Ségoulot';
    case 'kever':
      return 'Kever';
    case 'siddour_subcategory':
      return 'Siddour';
    case 'autres':
    default:
      return 'Autres';
  }
};

/**
 * Get the effective category for a prayer, handling legacy entries
 * @param prayer - The prayer object
 * @returns The most accurate category ID for filtering
 */
export const getEffectivePrayerCategory = (prayer: any): string => {
  // If the prayer already has a specific category (not generic), use it
  if (prayer.category && prayer.category !== 'siddour_subcategory' && prayer.category !== 'siddour') {
    return prayer.category;
  }
  
  // For generic categories, try to derive from subtitle (chapter name)
  if (prayer.subtitle) {
    const derivedCategory = getFilterCategoryFromChapterTitle(prayer.subtitle);
    if (derivedCategory !== 'autres') {
      return derivedCategory;
    }
  }
  
  // Handle special cases
  if (prayer.category === 'kever') {
    return 'kever';
  }
  
  // Default fallback
  return prayer.category || 'autres';
};