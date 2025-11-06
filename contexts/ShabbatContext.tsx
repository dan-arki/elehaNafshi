import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface ShabbatContextType {
  isShabbat: boolean;
  shabbatEndTime: Date | null;
  loadingShabbatData: boolean;
  locationPermissionGranted: boolean;
  locationError: string | null;
}

const ShabbatContext = createContext<ShabbatContextType | undefined>(undefined);

export function useShabbat() {
  const context = useContext(ShabbatContext);
  if (context === undefined) {
    throw new Error('useShabbat must be used within a ShabbatProvider');
  }
  return context;
}

interface ShabbatProvider {
  children: React.ReactNode;
}

export function ShabbatProvider({ children }: ShabbatProvider) {
  const [isShabbat, setIsShabbat] = useState(false);
  const [shabbatEndTime, setShabbatEndTime] = useState<Date | null>(null);
  const [loadingShabbatData, setLoadingShabbatData] = useState(false);
  const [locationPermissionGranted] = useState(true);
  const [locationError] = useState<string | null>(null);

  useEffect(() => {
    checkShabbatStatus();
    
    // Check every minute if Shabbat status has changed
    const interval = setInterval(() => {
      checkShabbatStatus();
    }, 60 * 1000); // Check every minute

    // Listen for app state changes to refresh when app comes to foreground
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkShabbatStatus();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      clearInterval(interval);
      subscription?.remove();
    };
  }, []);

  const checkShabbatStatus = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
    const currentHour = now.getHours();
    
    let isCurrentlyShabbat = false;
    let endTime: Date | null = null;

    // Friday from 21:00 onwards
    if (currentDay === 5 && currentHour >= 21) {
      isCurrentlyShabbat = true;
      // Calculate Saturday 17:00 as end time
      endTime = new Date(now);
      endTime.setDate(endTime.getDate() + 1); // Next day (Saturday)
      endTime.setHours(17, 0, 0, 0); // 17:00
    }
    // Saturday until 17:00
    else if (currentDay === 6 && currentHour < 17) {
      isCurrentlyShabbat = true;
      // End time is today at 17:00
      endTime = new Date(now);
      endTime.setHours(17, 0, 0, 0); // 17:00
    }

    setIsShabbat(isCurrentlyShabbat);
    setShabbatEndTime(endTime);
  };

  const value = {
    isShabbat,
    shabbatEndTime,
    loadingShabbatData,
    locationPermissionGranted,
    locationError,
  };

  return (
    <ShabbatContext.Provider value={value}>
      {children}
    </ShabbatContext.Provider>
  );
}