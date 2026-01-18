import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAqEnl-7J76qu5eOMvQtvbhNlqEaMDfa2k",
  authDomain: "eleha-nafchi-vvurlg.firebaseapp.com",
  projectId: "eleha-nafchi-vvurlg",
  storageBucket: "eleha-nafchi-vvurlg.firebasestorage.app",
  messagingSenderId: "73969167414",
  appId: "1:73969167414:web:9ad4ded7cf5f408a187c97"
};

// Initialize Firebase
let app: FirebaseApp;
try {
  // Check if Firebase app is already initialized
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
} catch (error) {
  console.error('Error initializing Firebase app:', error);
  // Fallback: try to get existing app or create new one
  try {
    app = getApp();
  } catch {
    app = initializeApp(firebaseConfig);
  }
}

// Initialize Firebase Authentication with platform-specific persistence
let auth: Auth;

try {
  if (Platform.OS === 'web') {
    // For web platform, use getAuth with browser persistence
    auth = getAuth(app);
  } else {
    // For native platforms (iOS/Android), use initializeAuth with AsyncStorage
    try {
      // @ts-ignore - React Native Firebase Auth persistence
      auth = initializeAuth(app, {
        persistence: {
          type: 'LOCAL',
        },
      });
    } catch (error) {
      console.warn('initializeAuth failed, falling back to getAuth:', error);
      // Fallback for Android if initializeAuth fails
      auth = getAuth(app);
    }
  }
} catch (error) {
  console.error('Error initializing Firebase Auth:', error);
  // Final fallback
  auth = getAuth(app);
}

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export { auth };
export default app;