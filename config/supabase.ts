import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || 'https://vjbtiehfvowxfddistkc.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqYnRpZWhmdm93eGZkZGlzdGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2ODQzOTQsImV4cCI6MjA3NTI2MDM5NH0.iPcVK3HGY1LnTxE4-AWUDuvogp220MLmwBiAjYF9apY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});
