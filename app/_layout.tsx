import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  FrankRuhlLibre_400Regular,
  FrankRuhlLibre_500Medium,
  FrankRuhlLibre_700Bold,
} from '@expo-google-fonts/frank-ruhl-libre';
import {
  Lato_400Regular,
} from '@expo-google-fonts/lato';
import {
  Rubik_400Regular,
} from '@expo-google-fonts/rubik';
import {
  Alef_400Regular,
} from '@expo-google-fonts/alef';
import {
  Assistant_400Regular,
} from '@expo-google-fonts/assistant';
import {
  NotoSansHebrew_400Regular,
} from '@expo-google-fonts/noto-sans-hebrew';
import * as SplashScreen from 'expo-splash-screen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { DisplaySettingsProvider } from '../contexts/DisplaySettingsContext';
import ErrorBoundary from '../components/ErrorBoundary';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  console.log('[_layout.tsx] Début du rendu');
  useFrameworkReady();
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
    'FrankRuhlLibre-Regular': FrankRuhlLibre_400Regular,
    'FrankRuhlLibre-Medium': FrankRuhlLibre_500Medium,
    'FrankRuhlLibre-Bold': FrankRuhlLibre_700Bold,
    'Lato-Regular': Lato_400Regular,
    'Alef-Regular': Alef_400Regular,
    'Assistant-Regular': Assistant_400Regular,
    'NotoSansHebrew-Regular': NotoSansHebrew_400Regular,
  });

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (loading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(tabs)';
    
    if (!user && inAuthGroup) {
      // User is not signed in and trying to access protected routes
      router.replace('/login');
    } else if (user && (segments[0] === 'login' || segments[0] === 'register')) {
      // User is signed in and trying to access auth pages
      router.replace('/(tabs)');
    }
  }, [user, segments, loading, fontsLoaded]);

  // Return null to keep splash screen visible while fonts load
  if (!fontsLoaded && !fontError || loading) {
    return null;
  }

  return (
    <>
      <ErrorBoundary>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="login" 
            options={{ 
              gestureEnabled: false,
              animation: 'none'
            }} 
          />
          <Stack.Screen name="register" />
          <Stack.Screen name="account-settings" />
          <Stack.Screen name="chapter/[id]" />
          <Stack.Screen name="prayer/[id]" />
          <Stack.Screen name="custom-prayer/[id]" />
          <Stack.Screen name="favorites" />
          <Stack.Screen name="my-prayers" />
          <Stack.Screen name="create-prayer" />
          <Stack.Screen name="kevarim" />
          <Stack.Screen name="kever/[id]" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ErrorBoundary>
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  return (
    <AuthProvider>
      <DisplaySettingsProvider>
        <RootLayoutNav />
      </DisplaySettingsProvider>
    </AuthProvider>
  );
}