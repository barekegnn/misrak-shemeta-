'use server';

import { adminDb, FieldValue } from '@/lib/firebase/admin';
import { verifyTelegramUser, getUserById } from '@/lib/auth/telegram';
import { User, Location, Language, ActionResponse } from '@/types';

/**
 * Updates the user's home location.
 * This is typically called when a user first registers or wants to change their location.
 * 
 * Requirements: 2.3, 2.4
 */
export async function updateHomeLocation(
  telegramId: string,
  homeLocation: Location
): Promise<ActionResponse<User>> {
  try {
    // Verify user
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return {
        success: false,
        error: 'User not found or unauthorized',
      };
    }

    // Update home location
    await adminDb.collection('users').doc(user.id).update({
      homeLocation,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Get updated user
    const updatedUser = await getUserById(user.id);
    if (!updatedUser) {
      return {
        success: false,
        error: 'Failed to retrieve updated user',
      };
    }

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error('Error updating home location:', error);
    return {
      success: false,
      error: 'Failed to update home location',
    };
  }
}

/**
 * Updates the user's language preference.
 * This is called when a user changes their language in the UI.
 * 
 * Requirements: 26.3
 */
export async function updateLanguagePreference(
  telegramId: string,
  languagePreference: Language
): Promise<ActionResponse<User>> {
  try {
    // Verify user
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return {
        success: false,
        error: 'User not found or unauthorized',
      };
    }

    // Update language preference
    await adminDb.collection('users').doc(user.id).update({
      languagePreference,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Get updated user
    const updatedUser = await getUserById(user.id);
    if (!updatedUser) {
      return {
        success: false,
        error: 'Failed to retrieve updated user',
      };
    }

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error('Error updating language preference:', error);
    return {
      success: false,
      error: 'Failed to update language preference',
    };
  }
}

/**
 * Updates the user's phone number.
 * Optional field for contact purposes.
 */
export async function updatePhoneNumber(
  telegramId: string,
  phoneNumber: string
): Promise<ActionResponse<User>> {
  try {
    // Verify user
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return {
        success: false,
        error: 'User not found or unauthorized',
      };
    }

    // Update phone number
    await adminDb.collection('users').doc(user.id).update({
      phoneNumber,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Get updated user
    const updatedUser = await getUserById(user.id);
    if (!updatedUser) {
      return {
        success: false,
        error: 'Failed to retrieve updated user',
      };
    }

    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    console.error('Error updating phone number:', error);
    return {
      success: false,
      error: 'Failed to update phone number',
    };
  }
}

/**
 * Gets the current user's profile.
 * Used for displaying user information in the UI.
 */
export async function getCurrentUser(
  telegramId: string
): Promise<ActionResponse<User>> {
  try {
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return {
      success: false,
      error: 'Failed to get user',
    };
  }
}
