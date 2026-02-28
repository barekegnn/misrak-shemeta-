/**
 * Admin Shop Management Server Actions
 * 
 * Provides server actions for managing shops including suspension,
 * activation, balance adjustments, and shop listing with search/filter.
 * 
 * Requirements: 29.1, 29.2, 29.3, 29.4
 */

'use server';

import { adminDb } from '@/lib/firebase/admin';
import { requireAdminAccess } from '@/lib/auth/admin';
import { logAdminAction } from '@/lib/admin/audit';
import type { Shop, ActionResponse, ShopFilters } from '@/types';

/**
 * Suspends a shop
 * 
 * Sets the shop's suspended flag to true and records the suspension reason.
 * Suspended shops cannot perform any operations on the platform.
 * 
 * @param adminTelegramId - Telegram ID of admin performing the action
 * @param shopId - ID of shop to suspend
 * @param reason - Reason for suspension
 * @returns ActionResponse<void>
 * 
 * Requirements: 29.1, 29.2
 */
export async function suspendShop(
  adminTelegramId: string,
  shopId: string,
  reason: string
): Promise<ActionResponse<void>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Update shop record
    await adminDb.collection('shops').doc(shopId).update({
      suspended: true,
      suspendedAt: new Date(),
      suspendedReason: reason,
      updatedAt: new Date(),
    });
    
    // Log admin action
    await logAdminAction({
      adminTelegramId,
      action: 'SUSPEND_SHOP',
      targetType: 'SHOP',
      targetId: shopId,
      details: { reason },
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error suspending shop:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to suspend shop' };
  }
}

/**
 * Activates a suspended shop
 * 
 * Removes the suspended flag and clears suspension details.
 * 
 * @param adminTelegramId - Telegram ID of admin performing the action
 * @param shopId - ID of shop to activate
 * @returns ActionResponse<void>
 * 
 * Requirements: 29.1, 29.2
 */
export async function activateShop(
  adminTelegramId: string,
  shopId: string
): Promise<ActionResponse<void>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Update shop record
    await adminDb.collection('shops').doc(shopId).update({
      suspended: false,
      suspendedAt: null,
      suspendedReason: null,
      updatedAt: new Date(),
    });
    
    // Log admin action
    await logAdminAction({
      adminTelegramId,
      action: 'ACTIVATE_SHOP',
      targetType: 'SHOP',
      targetId: shopId,
      details: {},
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error activating shop:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to activate shop' };
  }
}

/**
 * Adjusts a shop's balance
 * 
 * Manually adjusts the shop balance with a reason for audit purposes.
 * Can be used for corrections, refunds, or manual adjustments.
 * 
 * @param adminTelegramId - Telegram ID of admin performing the action
 * @param shopId - ID of shop to adjust
 * @param amount - Amount to adjust (positive or negative)
 * @param reason - Reason for adjustment
 * @returns ActionResponse<void>
 * 
 * Requirements: 29.1, 29.2
 */
export async function adjustShopBalance(
  adminTelegramId: string,
  shopId: string,
  amount: number,
  reason: string
): Promise<ActionResponse<void>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Get current shop data
    const shopDoc = await adminDb.collection('shops').doc(shopId).get();
    
    if (!shopDoc.exists) {
      return { success: false, error: 'Shop not found' };
    }
    
    const currentBalance = shopDoc.data()?.balance || 0;
    const newBalance = currentBalance + amount;
    
    // Update shop balance
    await adminDb.collection('shops').doc(shopId).update({
      balance: newBalance,
      updatedAt: new Date(),
    });
    
    // Create transaction record
    await adminDb.collection('shopTransactions').add({
      shopId,
      type: 'ADMIN_ADJUSTMENT',
      amount,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      reason,
      adminTelegramId,
      createdAt: new Date(),
    });
    
    // Log admin action
    await logAdminAction({
      adminTelegramId,
      action: 'ADJUST_SHOP_BALANCE',
      targetType: 'SHOP',
      targetId: shopId,
      details: { amount, reason, oldBalance: currentBalance, newBalance },
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error adjusting shop balance:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to adjust shop balance' };
  }
}

/**
 * Gets list of all shops with pagination and filtering
 * 
 * Retrieves shops from Firestore with optional filters for location, status,
 * and search by shop name or ID. Also fetches shop owner information.
 * 
 * @param adminTelegramId - Telegram ID of admin requesting the list
 * @param filters - Optional filters for the shop list
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of shops per page
 * @returns ActionResponse<{ shops: Shop[], total: number, page: number, pageSize: number }>
 * 
 * Requirements: 29.1, 29.3, 29.4
 */
export async function getShopList(
  adminTelegramId: string,
  filters?: ShopFilters,
  page: number = 1,
  pageSize: number = 50
): Promise<ActionResponse<{
  shops: (Shop & { ownerTelegramId?: string })[];
  total: number;
  page: number;
  pageSize: number;
}>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Build query
    let query: FirebaseFirestore.Query = adminDb.collection('shops');
    
    // Apply filters
    if (filters?.location) {
      query = query.where('city', '==', filters.location);
    }
    
    if (filters?.suspended !== undefined) {
      query = query.where('suspended', '==', filters.suspended);
    }
    
    if (filters?.shopName) {
      // Note: Firestore doesn't support case-insensitive search natively
      // For production, consider using Algolia or similar for better search
      query = query.where('name', '>=', filters.shopName)
                   .where('name', '<=', filters.shopName + '\uf8ff');
    }
    
    // Get total count
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;
    
    // Apply pagination and sorting
    const offset = (page - 1) * pageSize;
    query = query.orderBy('createdAt', 'desc').limit(pageSize).offset(offset);
    
    // Execute query
    const snapshot = await query.get();
    
    // Map to Shop objects and fetch owner info
    const shopsWithOwners = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // Fetch owner information if ownerId exists
        let ownerTelegramId: string | undefined;
        if (data.ownerId) {
          try {
            const ownerDoc = await adminDb.collection('users').doc(data.ownerId).get();
            if (ownerDoc.exists) {
              ownerTelegramId = ownerDoc.data()?.telegramId;
            }
          } catch (error) {
            console.error('Error fetching owner info:', error);
          }
        }
        
        return {
          id: doc.id,
          name: data.name,
          ownerId: data.ownerId,
          city: data.city || data.location, // Handle both field names
          contactPhone: data.contactPhone,
          balance: data.balance || 0,
          suspended: data.suspended || false,
          suspendedAt: data.suspendedAt?.toDate(),
          suspendedReason: data.suspendedReason,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          ownerTelegramId,
        } as Shop & { ownerTelegramId?: string };
      })
    );
    
    return {
      success: true,
      data: {
        shops: shopsWithOwners,
        total,
        page,
        pageSize,
      },
    };
  } catch (error: any) {
    console.error('Error getting shop list:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to get shop list' };
  }
}

/**
 * Gets a single shop by ID
 * 
 * @param adminTelegramId - Telegram ID of admin requesting the shop
 * @param shopId - ID of shop to retrieve
 * @returns ActionResponse<Shop>
 * 
 * Requirements: 29.1
 */
export async function getShopById(
  adminTelegramId: string,
  shopId: string
): Promise<ActionResponse<Shop>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Get shop document
    const shopDoc = await adminDb.collection('shops').doc(shopId).get();
    
    if (!shopDoc.exists) {
      return { success: false, error: 'Shop not found' };
    }
    
    const data = shopDoc.data()!;
    const shop: Shop = {
      id: shopDoc.id,
      name: data.name,
      location: data.location,
      contactPhone: data.contactPhone,
      balance: data.balance || 0,
      suspended: data.suspended || false,
      suspendedAt: data.suspendedAt?.toDate(),
      suspendedReason: data.suspendedReason,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
    
    return { success: true, data: shop };
  } catch (error: any) {
    console.error('Error getting shop:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to get shop' };
  }
}
