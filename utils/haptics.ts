import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Check if Android API level is 23 or higher for haptic support
const isAndroidAPI23OrHigher = Platform.OS === 'android' && Platform.Version >= 23;

/**
 * Utility functions for haptic feedback
 * These functions provide consistent haptic feedback across the app
 */

/**
 * Light haptic feedback for frequent, low-importance interactions
 * Use for: toggles, small interactive icons, input focus/blur, short list selections
 */
export const triggerLightHaptic = () => {
  if (Platform.OS !== 'web' && (Platform.OS !== 'android' || isAndroidAPI23OrHigher)) {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }
};

/**
 * Medium haptic feedback for main actions and navigation
 * Use for: primary buttons, screen navigation, form submission, important list selections
 */
export const triggerMediumHaptic = () => {
  if (Platform.OS !== 'web' && (Platform.OS !== 'android' || isAndroidAPI23OrHigher)) {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }
};

/**
 * Heavy haptic feedback for critical or destructive actions
 * Use for: delete actions, critical confirmations, major state changes
 * Use sparingly to avoid overwhelming the user
 */
export const triggerHeavyHaptic = () => {
  if (Platform.OS !== 'web' && (Platform.OS !== 'android' || isAndroidAPI23OrHigher)) {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }
};

/**
 * Success haptic feedback for positive confirmations
 * Use for: successful form submissions, completed actions, positive feedback
 */
export const triggerSuccessHaptic = () => {
  if (Platform.OS !== 'web' && (Platform.OS !== 'android' || isAndroidAPI23OrHigher)) {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }
};

/**
 * Warning haptic feedback for cautionary actions
 * Use for: validation errors, warnings, attention-grabbing alerts
 */
export const triggerWarningHaptic = () => {
  if (Platform.OS !== 'web' && (Platform.OS !== 'android' || isAndroidAPI23OrHigher)) {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }
};

/**
 * Error haptic feedback for error states
 * Use for: form validation errors, failed actions, error messages
 */
export const triggerErrorHaptic = () => {
  if (Platform.OS !== 'web' && (Platform.OS !== 'android' || isAndroidAPI23OrHigher)) {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }
};

/**
 * Selection haptic feedback for item selection
 * Use for: selecting items in lists, changing tabs, picker selections
 */
export const triggerSelectionHaptic = () => {
  if (Platform.OS !== 'web' && (Platform.OS !== 'android' || isAndroidAPI23OrHigher)) {
    try {
      Haptics.selectionAsync();
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }
};