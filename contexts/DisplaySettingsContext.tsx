import React, { createContext, useContext, useState } from 'react';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DisplaySettingsContextType {
  hebrewFont: string;
  setHebrewFont: (font: string) => void;
  fontSizeAdjustment: number;
  setFontSizeAdjustment: (adjustment: number) => void;
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
  }, [hebrewFont, fontSizeAdjustment, loaded]);

  const loadSettings = async () => {
    try {
      const [savedHebrewFont, savedFontSizeAdjustment] = await Promise.all([
        AsyncStorage.getItem('hebrewFont'),
        AsyncStorage.getItem('fontSizeAdjustment')
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
        AsyncStorage.setItem('fontSizeAdjustment', fontSizeAdjustment.toString())
      ]);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres d\'affichage:', error);
    }
  };

  const value = {
    hebrewFont,
    setHebrewFont,
    fontSizeAdjustment,
    setFontSizeAdjustment,
    loaded,
  };

  return (
    <DisplaySettingsContext.Provider value={value}>
      {children}
    </DisplaySettingsContext.Provider>
  );
}