'use server';

import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { User, Language } from '@/types';

/**
 * Verifies a Telegram user and returns their User profile from Firestore.
 * Creates a new user profile if this is their first time.
 * 
 * @param telegramId - The Telegram user ID
 * @param languageCode - Optional language code from Telegram (e.g., 'en', 'am')
 * @returns User profile or null if verification fails
 */
export async function verifyTelegramUser(
  telegramId: string,
  languageCode?: string
): Promise<User | null> {
  try {
    // Query Firestore for user with this telegramId
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef
      .where('telegramId', '==', telegramId)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      // User exists, return their profile
      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        telegramId: data.telegramId,
        role: data.role,
        homeLocation: data.homeLocation,
        languagePreference: data.languagePreference,
        phoneNumber: data.phoneNumber,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    }

    // User doesn't exist, create new profile
    const newUser: Omit<User, 'id'> = {
      telegramId,
      role: 'STUDENT', // Default role
      homeLocation: 'Haramaya_Main', // Default location (will be updated on first login)
      languagePreference: mapTelegramLanguage(languageCode),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await usersRef.add({
      ...newUser,
      createdAt: adminDb.FieldValue.serverTimestamp(),
      updatedAt: adminDb.FieldValue.serverTimestamp(),
    });

    return {
      id: docRef.id,
      ...newUser,
    };
  } catch (error) {
    console.error('Error verifying Telegram user:', error);
    return null;
  }
}

/**
 * Maps Telegram language code to our supported languages.
 * Defaults to English if language not supported.
 */
function mapTelegramLanguage(languageCode?: string): Language {
  if (!languageCode) return 'en';
  
  // Map Telegram language codes to our language codes
  const langMap: Record<string, Language> = {
    'en': 'en',
    'am': 'am', // Amharic
    'om': 'om', // Afaan Oromo
    'or': 'om', // Alternative code for Oromo
  };

  return langMap[languageCode.toLowerCase()] || 'en';
}

/**
 * Gets a user by their ID.
 * Used for authorization checks in Server Actions.
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const doc = await adminDb.collection('users').doc(userId).get();
    
    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;
    return {
      id: doc.id,
      telegramId: data.telegramId,
      role: data.role,
      homeLocation: data.homeLocation,
      languagePreference: data.languagePreference,
      phoneNumber: data.phoneNumber,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

/**
 * Checks if a user is a shop owner.
 * Used for authorization in shop-related Server Actions.
 */
export async function isShopOwner(userId: string): Promise<boolean> {
  try {
    const user = await getUserById(userId);
    return user?.role === 'MERCHANT';
  } catch (error) {
    console.error('Error checking shop owner status:', error);
    return false;
  }
}

/**
 * Gets the shop ID for a shop owner.
 * Returns null if user is not a shop owner or shop not found.
 */
export async function getShopIdForOwner(ownerId: string): Promise<string | null> {
  try {
    const shopsRef = adminDb.collection('shops');
    const snapshot = await shopsRef
      .where('ownerId', '==', ownerId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].id;
  } catch (error) {
    console.error('Error getting shop for owner:', error);
    return null;
  }
}
