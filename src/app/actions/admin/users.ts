/**
 * Admin User Management Server Actions
 * 
 * Provides server actions for managing users including suspension,
 * activation, role changes, and user listing with search/filter.
 * 
 * Requirements: 28.1, 28.2, 28.3, 28.4
 */

'use server';

import { adminDb } from '@/lib/firebase/admin';
import { requireAdminAccess } from '@/lib/auth/admin';
import { logAdminAction } from '@/lib/admin/audit';
import type { User, ActionResponse, UserFilters } from '@/types';

/**
 * Suspends a user account
 * 
 * Sets the user's suspended flag to true and records the suspension reason.
 * Suspended users cannot perform any operations on the platform.
 * 
 * @param adminTelegramId - Telegram ID of admin performing the action
 * @param userId - ID of user to suspend
 * @param reason - Reason for suspension
 * @returns ActionResponse<void>
 * 
 * Requirements: 28.1, 28.2
 */
export async function suspendUser(
  adminTelegramId: string,
  userId: string,
  reason: string
): Promise<ActionResponse<void>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Update user record
    await adminDb.collection('users').doc(userId).update({
      suspended: true,
      suspendedAt: new Date(),
      suspendedReason: reason,
      updatedAt: new Date(),
    });
    
    // Log admin action
    await logAdminAction({
      adminTelegramId,
      action: 'SUSPEND_USER',
      targetType: 'USER',
      targetId: userId,
      details: { reason },
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error suspending user:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to suspend user' };
  }
}

/**
 * Activates a suspended user account
 * 
 * Removes the suspended flag and clears suspension details.
 * 
 * @param adminTelegramId - Telegram ID of admin performing the action
 * @param userId - ID of user to activate
 * @returns ActionResponse<void>
 * 
 * Requirements: 28.1, 28.2
 */
export async function activateUser(
  adminTelegramId: string,
  userId: string
): Promise<ActionResponse<void>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Update user record
    await adminDb.collection('users').doc(userId).update({
      suspended: false,
      suspendedAt: null,
      suspendedReason: null,
      updatedAt: new Date(),
    });
    
    // Log admin action
    await logAdminAction({
      adminTelegramId,
      action: 'ACTIVATE_USER',
      targetType: 'USER',
      targetId: userId,
      details: {},
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error activating user:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to activate user' };
  }
}

/**
 * Changes a user's role
 * 
 * Updates the user's role (e.g., USER, SHOP_OWNER, RUNNER).
 * 
 * @param adminTelegramId - Telegram ID of admin performing the action
 * @param userId - ID of user to update
 * @param newRole - New role to assign
 * @returns ActionResponse<void>
 * 
 * Requirements: 28.1, 28.2
 */
export async function changeUserRole(
  adminTelegramId: string,
  userId: string,
  newRole: 'STUDENT' | 'MERCHANT' | 'RUNNER' | 'ADMIN'
): Promise<ActionResponse<void>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Get current user data
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const oldRole = userDoc.data()?.role;
    
    // Update user record
    await adminDb.collection('users').doc(userId).update({
      role: newRole,
      updatedAt: new Date(),
    });
    
    // Log admin action
    await logAdminAction({
      adminTelegramId,
      action: 'CHANGE_USER_ROLE',
      targetType: 'USER',
      targetId: userId,
      details: { oldRole, newRole },
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error changing user role:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to change user role' };
  }
}

/**
 * Gets list of all users with pagination and filtering
 * 
 * Retrieves users from Firestore with optional filters for role, status,
 * home location, and search by telegram ID.
 * 
 * @param adminTelegramId - Telegram ID of admin requesting the list
 * @param filters - Optional filters for the user list
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of users per page
 * @returns ActionResponse<{ users: User[], total: number, page: number, pageSize: number }>
 * 
 * Requirements: 28.1, 28.3, 28.4
 */
export async function getUserList(
  adminTelegramId: string,
  filters?: UserFilters,
  page: number = 1,
  pageSize: number = 50
): Promise<ActionResponse<{
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Build query
    let query: FirebaseFirestore.Query = adminDb.collection('users');
    
    // Apply filters
    if (filters?.role) {
      query = query.where('role', '==', filters.role);
    }
    
    if (filters?.suspended !== undefined) {
      query = query.where('suspended', '==', filters.suspended);
    }
    
    if (filters?.homeLocation) {
      query = query.where('homeLocation', '==', filters.homeLocation);
    }
    
    if (filters?.telegramId) {
      query = query.where('telegramId', '==', filters.telegramId);
    }
    
    // Get total count
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;
    
    // Apply pagination
    const offset = (page - 1) * pageSize;
    query = query.orderBy('createdAt', 'desc').limit(pageSize).offset(offset);
    
    // Execute query
    const snapshot = await query.get();
    
    // Map to User objects
    const users: User[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        telegramId: data.telegramId,
        role: data.role,
        homeLocation: data.homeLocation,
        languagePreference: data.languagePreference,
        phoneNumber: data.phoneNumber,
        suspended: data.suspended || false,
        suspendedAt: data.suspendedAt?.toDate(),
        suspendedReason: data.suspendedReason,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as User;
    });
    
    return {
      success: true,
      data: {
        users,
        total,
        page,
        pageSize,
      },
    };
  } catch (error: any) {
    console.error('Error getting user list:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to get user list' };
  }
}

/**
 * Gets a single user by ID
 * 
 * @param adminTelegramId - Telegram ID of admin requesting the user
 * @param userId - ID of user to retrieve
 * @returns ActionResponse<User>
 * 
 * Requirements: 28.1
 */
export async function getUserById(
  adminTelegramId: string,
  userId: string
): Promise<ActionResponse<User>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Get user document
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return { success: false, error: 'User not found' };
    }
    
    const data = userDoc.data()!;
    const user: User = {
      id: userDoc.id,
      telegramId: data.telegramId,
      role: data.role,
      homeLocation: data.homeLocation,
      languagePreference: data.languagePreference,
      phoneNumber: data.phoneNumber,
      suspended: data.suspended || false,
      suspendedAt: data.suspendedAt?.toDate(),
      suspendedReason: data.suspendedReason,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
    
    return { success: true, data: user };
  } catch (error: any) {
    console.error('Error getting user:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to get user' };
  }
}
