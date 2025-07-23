import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, browserLocalPersistence } from 'firebase/auth';
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
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with platform-specific persistence
let auth;

if (Platform.OS === 'web') {
  // For web platform, use getAuth with browser persistence
  auth = getAuth(app);
} else {
  // For native platforms (iOS/Android), use initializeAuth with AsyncStorage
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export { auth };
export default app;