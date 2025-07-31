import React, { createContext, useContext, useState } from 'react';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DisplayModeKey = 'hebrew' | 'hebrewTrad' | 'phonetic' | 'hebrewPhonetic' | 'french';

export interface DisplayModeOption {
  key: DisplayModeKey;
  label: string;
}

export const DEFAULT_DISPLAY_MODES: DisplayModeOption[] = [
  { key: 'hebrew', label: 'עברית' },
  { key: 'hebrewTrad', label: 'עברית + Trad' },
  { key: 'phonetic', label: 'Phonétique' },
  { key: 'hebrewPhonetic', label: 'עברית + Phonétique' },
  { key: 'french', label: 'Traduction' },
];

interface DisplaySettingsContextType {
  hebrewFont: string;
  setHebrewFont: (font: string) => void;
  fontSizeAdjustment: number;
  setFontSizeAdjustment: (adjustment: number) => void;
  displayModeOrder: DisplayModeOption[];
  setDisplayModeOrder: (order: DisplayModeOption[]) => void;
  resetDisplayModeOrder: () => void;
  loaded: boolean;
}

const DisplaySettingsContext = createContext<DisplaySettingsContextType | undefined>(undefined);

export function useDisplaySettings() {
  const context = useContext(DisplaySettingsContext);
  if (context === undefined) {
    throw new Error('useDisplaySettings must be used within a DisplaySettingsProvider');
  }
  return context;
}

export function DisplaySettingsProvider({ children }: { children: React.ReactNode }) {
  const [hebrewFont, setHebrewFont] = useState<string>('FrankRuhlLibre-Regular');
  const [fontSizeAdjustment, setFontSizeAdjustment] = useState<number>(0);
  const [displayModeOrder, setDisplayModeOrder] = useState<DisplayModeOption[]>(DEFAULT_DISPLAY_MODES);
  const [loaded, setLoaded] = useState<boolean>(false);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Save settings to AsyncStorage when they change
  useEffect(() => {
    if (loaded) {
      saveSettings();
    }
  }, [hebrewFont, fontSizeAdjustment, displayModeOrder, loaded]);

  const loadSettings = async () => {
    try {
      const [savedHebrewFont, savedFontSizeAdjustment, savedDisplayModeOrder] = await Promise.all([
        AsyncStorage.getItem('hebrewFont'),
        AsyncStorage.getItem('fontSizeAdjustment'),
        AsyncStorage.getItem('displayModeOrder')
      ]);

      if (savedHebrewFont) {
        setHebrewFont(savedHebrewFont);
      }

      if (savedFontSizeAdjustment) {
        const adjustment = parseInt(savedFontSizeAdjustment, 10);
        if (!isNaN(adjustment)) {
          setFontSizeAdjustment(adjustment);
        }
      }

      if (savedDisplayModeOrder) {
        try {
          const parsedOrder = JSON.parse(savedDisplayModeOrder);
          if (Array.isArray(parsedOrder) && parsedOrder.length === DEFAULT_DISPLAY_MODES.length) {
            setDisplayModeOrder(parsedOrder);
          }
        } catch (error) {
          console.error('Error parsing saved display mode order:', error);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres d\'affichage:', error);
    } finally {
      setLoaded(true);
    }
  };

  const saveSettings = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem('hebrewFont', hebrewFont),
        AsyncStorage.setItem('fontSizeAdjustment', fontSizeAdjustment.toString()),
        AsyncStorage.setItem('displayModeOrder', JSON.stringify(displayModeOrder))
      ]);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres d\'affichage:', error);
    }
  };

  const resetDisplayModeOrder = () => {
    setDisplayModeOrder([...DEFAULT_DISPLAY_MODES]);
  };

  const value = {
    hebrewFont,
    setHebrewFont,
    fontSizeAdjustment,
    setFontSizeAdjustment,
    displayModeOrder,
    setDisplayModeOrder,
    resetDisplayModeOrder,
    loaded,
  };

  return (
    <DisplaySettingsContext.Provider value={value}>
      {children}
    </DisplaySettingsContext.Provider>
  );
}