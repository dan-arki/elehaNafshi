import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';

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
  const [loadingShabbatData, setLoadingShabbatData] = useState(true);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    initializeShabbatCheck();
    
    // Set up interval to check every 5 minutes if Shabbat has ended
    const interval = setInterval(() => {
      if (isShabbat && shabbatEndTime) {
        const now = new Date();
        if (now >= shabbatEndTime) {
          setIsShabbat(false);
          setShabbatEndTime(null);
          // Refresh Shabbat data for next week
          initializeShabbatCheck();
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    // Listen for app state changes to refresh when app comes to foreground
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        initializeShabbatCheck();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      clearInterval(interval);
      subscription?.remove();
    };
  }, []);

  const initializeShabbatCheck = async () => {
    try {
      setLoadingShabbatData(true);
      setLocationError(null);

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationPermissionGranted(false);
        setLocationError('Permission de localisation refusée');
        setLoadingShabbatData(false);
        return;
      }

      setLocationPermissionGranted(true);

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      
      // Fetch Shabbat times from Hebcal API
      await fetchShabbatTimes(latitude, longitude);

    } catch (error) {
      console.error('Error initializing Shabbat check:', error);
      setLocationError('Erreur lors de la récupération de la localisation');
      setLoadingShabbatData(false);
    }
  };

  const fetchShabbatTimes = async (latitude: number, longitude: number) => {
    try {
      // Use proxy for web development to avoid CORS issues
      const apiUrl = __DEV__ && typeof window !== 'undefined' 
        ? `/api/hebcal?cfg=json&geo=pos&latitude=${latitude}&longitude=${longitude}&m=50`
        : `https://www.hebcal.com/shabbat?cfg=json&geo=pos&latitude=${latitude}&longitude=${longitude}&m=50`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorBody = await response.text(); // Lire le corps de la réponse pour le débogage
        console.error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
        throw new Error(`Failed to fetch Shabbat times: HTTP status ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorBody = await response.text();
        console.error(`Expected JSON, but received ${contentType}. Body: ${errorBody}`);
        throw new Error(`Failed to fetch Shabbat times: Expected JSON, but received ${contentType}`);
      }

      if (!response.ok) {
        throw new Error('Failed to fetch Shabbat times');
      }

      const data = await response.json();
      
      // Find candle lighting and havdalah times
      const now = new Date();
      let candleLighting: Date | null = null;
      let havdalah: Date | null = null;

      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          const itemDate = new Date(item.date);
          
          if (item.category === 'candles') {
            // Check if this is for this week (within 7 days from now)
            const daysDiff = Math.abs((itemDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff <= 7) {
              candleLighting = itemDate;
            }
          } else if (item.category === 'havdalah') {
            // Check if this is for this week (within 7 days from now)
            const daysDiff = Math.abs((itemDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff <= 7) {
              havdalah = itemDate;
            }
          }
        }
      }

      // Determine if it's currently Shabbat
      if (candleLighting && havdalah) {
        const isCurrentlyShabbat = now >= candleLighting && now < havdalah;
        setIsShabbat(isCurrentlyShabbat);
        setShabbatEndTime(isCurrentlyShabbat ? havdalah : null);
      } else {
        setIsShabbat(false);
        setShabbatEndTime(null);
      }

    } catch (error) {
      console.error('Error fetching Shabbat times:', error);
      setLocationError('Erreur lors de la récupération des horaires de Shabbat');
    } finally {
      setLoadingShabbatData(false);
    }
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