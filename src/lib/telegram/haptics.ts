/**
 * Telegram Haptic Feedback Utilities
 * 
 * Provides haptic feedback for key user interactions in the Telegram Mini App.
 * 
 * Requirement 21.5: Provide haptic feedback for key interactions
 * (add to cart, place order, payment confirmation) when supported by the device
 */

import { useTelegramAuth } from '@/components/TelegramAuthProvider';

/**
 * Hook for triggering haptic feedback
 */
export function useHapticFeedback() {
  const { triggerHaptic } = useTelegramAuth();

  return {
    /**
     * Light haptic feedback for subtle interactions
     * Use for: add to cart, increment/decrement, minor actions
     */
    light: () => triggerHaptic('light'),

    /**
     * Medium haptic feedback for standard interactions
     * Use for: button clicks, form submissions, navigation
     */
    medium: () => triggerHaptic('medium'),

    /**
     * Heavy haptic feedback for important interactions
     * Use for: order placement, payment confirmation, critical actions
     */
    heavy: () => triggerHaptic('heavy'),
  };
}

/**
 * Haptic feedback patterns for common interactions
 */
export const HapticPatterns = {
  // Shopping actions
  ADD_TO_CART: 'light' as const,
  REMOVE_FROM_CART: 'light' as const,
  UPDATE_QUANTITY: 'light' as const,

  // Order actions
  PLACE_ORDER: 'heavy' as const,
  CANCEL_ORDER: 'medium' as const,
  CONFIRM_DELIVERY: 'heavy' as const,

  // Payment actions
  INITIATE_PAYMENT: 'medium' as const,
  PAYMENT_SUCCESS: 'heavy' as const,
  PAYMENT_FAILED: 'heavy' as const,

  // Navigation
  NAVIGATE: 'light' as const,
  OPEN_MODAL: 'light' as const,
  CLOSE_MODAL: 'light' as const,

  // Form actions
  SUBMIT_FORM: 'medium' as const,
  FORM_ERROR: 'medium' as const,
  FORM_SUCCESS: 'heavy' as const,
};
