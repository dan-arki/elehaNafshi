import React, { createContext, useContext, useState } from 'react';

interface DisplaySettingsContextType {
  hebrewFont: string;
  setHebrewFont: (font: string) => void;
  fontSizeAdjustment: number;
  setFontSizeAdjustment: (adjustment: number) => void;
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

  const value = {
    hebrewFont,
    setHebrewFont,
    fontSizeAdjustment,
    setFontSizeAdjustment,
  };

  return (
    <DisplaySettingsContext.Provider value={value}>
      {children}
    </DisplaySettingsContext.Provider>
  );
}