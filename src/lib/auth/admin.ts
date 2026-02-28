/**
 * Admin Authentication and Authorization Utilities
 * 
 * Provides functions for verifying admin access based on ADMIN_TELEGRAM_IDS
 * environment variable. All admin operations must use these utilities.
 * 
 * Requirements: 27.1, 27.2
 */

import { adminDb } from '@/lib/firebase/admin';
import type { User } from '@/types';

/**
 * Verifies if a telegramId has admin access
 * 
 * Checks if the telegramId is in the ADMIN_TELEGRAM_IDS environment variable
 * (comma-separated list of admin Telegram IDs)
 * 
 * @param telegramId - The Telegram ID to verify
 * @returns Promise<boolean> - True if user is admin, false otherwise
 * 
 * @example
 * const isAdmin = await verifyAdminAccess('123456789');
 * if (!isAdmin) {
 *   throw new Error('UNAUTHORIZED: Admin access required');
 * }
 */
export async function verifyAdminAccess(telegramId: string): Promise<boolean> {
  try {
    // Get admin IDs from environment variable
    const adminIdsString = process.env.ADMIN_TELEGRAM_IDS;
    
    if (!adminIdsString) {
      console.warn('ADMIN_TELEGRAM_IDS environment variable not set');
      return false;
    }
    
    // Parse comma-separated list and trim whitespace
    const adminIds = adminIdsString
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);
    
    // Check if telegramId is in the admin list
    return adminIds.includes(telegramId);
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return false;
  }
}

/**
 * Checks if a user is an admin (convenience function)
 * 
 * Alias for verifyAdminAccess for better readability in some contexts
 * 
 * @param telegramId - The Telegram ID to check
 * @returns Promise<boolean> - True if user is admin, false otherwise
 */
export async function isAdmin(telegramId: string): Promise<boolean> {
  return verifyAdminAccess(telegramId);
}

/**
 * Gets the User record for an admin by telegramId
 * 
 * Verifies admin access and retrieves the full User record from Firestore
 * 
 * @param telegramId - The Telegram ID of the admin
 * @returns Promise<User | null> - User record if admin, null otherwise
 * 
 * @example
 * const adminUser = await getAdminUser('123456789');
 * if (!adminUser) {
 *   throw new Error('UNAUTHORIZED: Admin access required');
 * }
 */
export async function getAdminUser(telegramId: string): Promise<User | null> {
  try {
    // First verify admin access
    const hasAccess = await verifyAdminAccess(telegramId);
    if (!hasAccess) {
      return null;
    }
    
    // Get user record from Firestore
    const usersSnapshot = await adminDb
      .collection('users')
      .where('telegramId', '==', telegramId)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      return null;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    
    return {
      id: userDoc.id,
      telegramId: userData.telegramId,
      role: userData.role,
      homeLocation: userData.homeLocation,
      languagePreference: userData.languagePreference,
      phoneNumber: userData.phoneNumber,
      suspended: userData.suspended || false,
      suspendedAt: userData.suspendedAt?.toDate(),
      suspendedReason: userData.suspendedReason,
      createdAt: userData.createdAt.toDate(),
      updatedAt: userData.updatedAt.toDate(),
    } as User;
  } catch (error) {
    console.error('Error getting admin user:', error);
    return null;
  }
}

/**
 * Verifies admin access and throws error if not authorized
 * 
 * Convenience function for Server Actions that require admin access.
 * Throws an error if the user is not an admin.
 * 
 * @param telegramId - The Telegram ID to verify
 * @throws Error if user is not an admin
 * 
 * @example
 * await requireAdminAccess(telegramId);
 * // If we reach here, user is admin
 */
export async function requireAdminAccess(telegramId: string): Promise<void> {
  const hasAccess = await verifyAdminAccess(telegramId);
  
  if (!hasAccess) {
    throw new Error('UNAUTHORIZED: Admin access required');
  }
}

/**
 * Gets list of all admin Telegram IDs from environment
 * 
 * Useful for displaying admin list or checking multiple admins
 * 
 * @returns string[] - Array of admin Telegram IDs
 */
export function getAdminTelegramIds(): string[] {
  const adminIdsString = process.env.ADMIN_TELEGRAM_IDS;
  
  if (!adminIdsString) {
    return [];
  }
  
  return adminIdsString
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0);
}
