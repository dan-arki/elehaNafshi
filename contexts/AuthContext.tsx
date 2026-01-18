import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, deleteUser, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { deleteAllCustomPrayers, deleteAllFavoritePrayers } from '../services/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteUserAccount: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthContext] Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('[AuthContext] Auth state changed:', user ? 'User logged in' : 'User logged out');
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('[AuthContext] Signing in user...');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    console.log('[AuthContext] Signing up user...');
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    console.log('[AuthContext] Logging out user...');
    await signOut(auth);
  };

  const deleteUserAccount = async () => {
    console.log('[AuthContext] Deleting user account...');
    if (!user) {
      throw new Error('Aucun utilisateur connecté');
    }

    try {
      // First, delete all user data from Firestore
      await deleteAllCustomPrayers(user.uid);
      await deleteAllFavoritePrayers(user.uid);
      
      // Then delete the user account from Firebase Auth
      await deleteUser(user);
      
      console.log('[AuthContext] User account and data deleted successfully');
    } catch (error: any) {
      console.error('[AuthContext] Error deleting user account:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        throw new Error('Pour des raisons de sécurité, vous devez vous reconnecter avant de supprimer votre compte. Veuillez vous déconnecter et vous reconnecter, puis réessayer.');
      }
      
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    console.log('[AuthContext] Sending password reset email...');
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    deleteUserAccount,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}