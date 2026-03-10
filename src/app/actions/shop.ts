'use server';

import { adminDb } from '@/lib/firebase/admin';
import { verifyTelegramUser } from '@/lib/auth/telegram';
import type { Shop, ShopTransaction, ActionResponse, City } from '@/types';

/**
 * UTILITY FUNCTIONS FOR SHOP REGISTRATION
 * High-Priority Fixes for Manual Registration
 */

/**
 * Fix 1: Sanitize phone number by removing spaces, dashes, and parentheses
 */
function sanitizePhone(phone: string): string {
  return phone
    .replace(/\s/g, '')      // Remove spaces
    .replace(/[-()]/g, '')   // Remove dashes and parentheses
    .trim();
}

/**
 * Fix 1: Validate phone format (Ethiopian format)
 */
function validatePhoneFormat(phone: string): { valid: boolean; message: string } {
  const clean = sanitizePhone(phone);
  
  if (!clean) {
    return { valid: false, message: 'Phone number is required' };
  }
  
  // Ethiopian phone format: +251XXXXXXXXX or 09XXXXXXXX
  const phoneRegex = /^(\+251|0)?[79]\d{8}$/;
  
  if (!phoneRegex.test(clean)) {
    return {
      valid: false,
      message: 'Invalid phone format. Use: +251912345678 or 0912345678'
    };
  }
  
  return { valid: true, message: '' };
}

/**
 * Fix 2: Ensure user exists in Firestore
 */
async function ensureUserExists(telegramId: string) {
  try {
    const userRef = adminDb.collection('users').doc(telegramId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('[ensureUserExists] Creating user document for:', telegramId);
      
      await userRef.set({
        telegramId,
        role: 'BUYER',
        homeLocation: null,
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log('[ensureUserExists] User document created successfully');
    }
    
    return userDoc.exists ? userDoc.data() : await userRef.get().then(d => d.data());
  } catch (error) {
    console.error('[ensureUserExists] Error:', error);
    throw error;
  }
}

/**
 * Fix 3: Comprehensive error message mapping
 */
function getErrorMessage(errorCode: string): string {
  const messages: Record<string, string> = {
    'UNAUTHORIZED': 'You are not authenticated. Please log in first.',
    'SHOP_NAME_REQUIRED': 'Shop name is required. Please enter a shop name.',
    'SHOP_NAME_TOO_LONG': 'Shop name is too long. Maximum 100 characters allowed.',
    'INVALID_CITY': 'Please select a valid city (Harar or Dire Dawa).',
    'SPECIFIC_LOCATION_REQUIRED': 'Specific address is required. Please enter your shop location.',
    'SPECIFIC_LOCATION_TOO_LONG': 'Address is too long. Maximum 200 characters allowed.',
    'CONTACT_PHONE_REQUIRED': 'Contact phone is required. Please enter a phone number.',
    'INVALID_PHONE_FORMAT': 'Invalid phone format. Use: +251912345678 or 0912345678',
    'SHOP_ALREADY_EXISTS': 'You already have a registered shop. You can only have one shop.',
    'SHOP_NAME_ALREADY_TAKEN': 'This shop name is already taken. Please choose a different name.',
    'INTERNAL_ERROR': 'An unexpected error occurred. Please try again later.',
  };
  
  return messages[errorCode] || 'An error occurred. Please try again.';
}

/**
 * Get shop balance for authenticated shop owner
 * Requirements: 22.1, 22.3
 */
export async function getShopBalance(
  telegramId: string
): Promise<ActionResponse<{ balance: number; shopId: string }>> {
  try {
    // Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    // Get shop for this owner
    const shopSnapshot = await adminDb
      .collection('shops')
      .where('ownerId', '==', user.id)
      .limit(1)
      .get();

    if (shopSnapshot.empty) {
      return { success: false, error: 'SHOP_NOT_FOUND' };
    }

    const shopDoc = shopSnapshot.docs[0];
    const shopData = shopDoc.data();

    return {
      success: true,
      data: {
        balance: shopData.balance || 0,
        shopId: shopDoc.id
      }
    };
  } catch (error) {
    console.error('Error getting shop balance:', error);
    return { success: false, error: 'INTERNAL_ERROR' };
  }
}

/**
 * Get shop transactions history
 * Requirements: 22.4
 */
export async function getShopTransactions(
  telegramId: string,
  limit: number = 50
): Promise<ActionResponse<ShopTransaction[]>> {
  try {
    // Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    // Get shop for this owner
    const shopSnapshot = await adminDb
      .collection('shops')
      .where('ownerId', '==', user.id)
      .limit(1)
      .get();

    if (shopSnapshot.empty) {
      return { success: false, error: 'SHOP_NOT_FOUND' };
    }

    const shopId = shopSnapshot.docs[0].id;

    // Get transactions for this shop
    const transactionsSnapshot = await adminDb
      .collection('shopTransactions')
      .where('shopId', '==', shopId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const transactions: ShopTransaction[] = transactionsSnapshot.docs.map(
      (doc) => ({
        id: doc.id,
        ...doc.data()
      })
    ) as ShopTransaction[];

    return { success: true, data: transactions };
  } catch (error) {
    console.error('Error getting shop transactions:', error);
    return { success: false, error: 'INTERNAL_ERROR' };
  }
}

/**
 * Get shop statistics (balance, pending, completed)
 * Requirements: 22.3
 */
export async function getShopStatistics(
  telegramId: string
): Promise<
  ActionResponse<{
    currentBalance: number;
    pendingOrdersValue: number;
    completedOrdersValue: number;
    shopId: string;
  }>
> {
  try {
    // Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    // Get shop for this owner
    const shopSnapshot = await adminDb
      .collection('shops')
      .where('ownerId', '==', user.id)
      .limit(1)
      .get();

    if (shopSnapshot.empty) {
      return { success: false, error: 'SHOP_NOT_FOUND' };
    }

    const shopDoc = shopSnapshot.docs[0];
    const shopData = shopDoc.data();
    const shopId = shopDoc.id;

    // Get all orders containing items from this shop using denormalized shopIds array
    const ordersSnapshot = await adminDb
      .collection('orders')
      .where('shopIds', 'array-contains', shopId)
      .get();

    let pendingOrdersValue = 0;
    let completedOrdersValue = 0;

    ordersSnapshot.docs.forEach((doc) => {
      const orderData = doc.data();
      const shopItems = orderData.items.filter(
        (item: any) => item.shopId === shopId
      );

      const shopTotal = shopItems.reduce(
        (sum: number, item: any) => sum + item.priceAtPurchase * item.quantity,
        0
      );

      // Pending: PAID_ESCROW, DISPATCHED, ARRIVED
      if (
        orderData.status === 'PAID_ESCROW' ||
        orderData.status === 'DISPATCHED' ||
        orderData.status === 'ARRIVED'
      ) {
        pendingOrdersValue += shopTotal;
      }

      // Completed
      if (orderData.status === 'COMPLETED') {
        completedOrdersValue += shopTotal;
      }
    });

    return {
      success: true,
      data: {
        currentBalance: shopData.balance || 0,
        pendingOrdersValue,
        completedOrdersValue,
        shopId
      }
    };
  } catch (error) {
    console.error('Error getting shop statistics:', error);
    return { success: false, error: 'INTERNAL_ERROR' };
  }
}

/**
 * Get shop details for authenticated shop owner
 */
export async function getShopDetails(
  telegramId: string
): Promise<ActionResponse<Shop>> {
  try {
    // Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    // Get shop for this owner
    const shopSnapshot = await adminDb
      .collection('shops')
      .where('ownerId', '==', user.id)
      .limit(1)
      .get();

    if (shopSnapshot.empty) {
      return { success: false, error: 'SHOP_NOT_FOUND' };
    }

    const shopDoc = shopSnapshot.docs[0];
    const data = shopDoc.data();
    
    const shop: Shop = {
      id: shopDoc.id,
      name: data.name,
      ownerId: data.ownerId,
      city: data.city,
      specificLocation: data.specificLocation,
      landmark: data.landmark,
      contactPhone: data.contactPhone,
      balance: data.balance || 0,
      suspended: data.suspended || false,
      suspendedAt: data.suspendedAt?.toDate(),
      suspendedReason: data.suspendedReason,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };

    return { success: true, data: shop };
  } catch (error) {
    console.error('Error getting shop details:', error);
    return { success: false, error: 'INTERNAL_ERROR' };
  }
}

/**
 * Internal function to update shop balance (used by order completion)
 * This is called from the validateOTP function in orders.ts
 * Requirements: 22.1, 22.2
 * 
 * Note: This function is already implemented in the validateOTP Server Action
 * in src/app/actions/orders.ts using Firestore Transactions.
 * The balance update happens atomically when an order is completed.
 */

/**
 * Register a new shop
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
export async function registerShop(
  telegramId: string,
  shopData: {
    name: string;
    city: City;
    specificLocation: string;
    landmark?: string;
    contactPhone: string;
  }
): Promise<ActionResponse<Shop>> {
  try {
    console.log('[registerShop] Starting shop registration for telegramId:', telegramId);
    console.log('[registerShop] Shop data:', JSON.stringify(shopData, null, 2));
    
    // FIX 2: Ensure user exists in Firestore before verification
    try {
      await ensureUserExists(telegramId);
    } catch (error) {
      console.error('[registerShop] Error ensuring user exists:', error);
      return { success: false, error: 'INTERNAL_ERROR' };
    }
    
    // Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      console.error('[registerShop] User verification failed for telegramId:', telegramId);
      return { success: false, error: 'UNAUTHORIZED' };
    }
    console.log('[registerShop] User verified:', user.id, 'Role:', user.role);

    // Validate input
    if (!shopData.name || shopData.name.trim().length === 0) {
      return { success: false, error: 'SHOP_NAME_REQUIRED' };
    }

    if (shopData.name.length > 100) {
      return { success: false, error: 'SHOP_NAME_TOO_LONG' };
    }

    if (!shopData.city || (shopData.city !== 'HARAR' && shopData.city !== 'DIRE_DAWA')) {
      return { success: false, error: 'INVALID_CITY' };
    }

    if (!shopData.specificLocation || shopData.specificLocation.trim().length === 0) {
      return { success: false, error: 'SPECIFIC_LOCATION_REQUIRED' };
    }

    if (shopData.specificLocation.length > 200) {
      return { success: false, error: 'SPECIFIC_LOCATION_TOO_LONG' };
    }

    if (!shopData.contactPhone || shopData.contactPhone.trim().length === 0) {
      return { success: false, error: 'CONTACT_PHONE_REQUIRED' };
    }

    // FIX 1: Validate phone number format with sanitization
    const phoneValidation = validatePhoneFormat(shopData.contactPhone);
    if (!phoneValidation.valid) {
      console.error('[registerShop] Phone validation failed:', phoneValidation.message);
      return { success: false, error: 'INVALID_PHONE_FORMAT' };
    }

    // Check if user already has a shop
    console.log('[registerShop] Checking if user already has a shop...');
    const existingShopSnapshot = await adminDb
      .collection('shops')
      .where('ownerId', '==', user.id)
      .limit(1)
      .get();

    if (!existingShopSnapshot.empty) {
      console.error('[registerShop] User already has a shop');
      return { success: false, error: 'SHOP_ALREADY_EXISTS' };
    }
    console.log('[registerShop] User does not have an existing shop');

    // Update user role to MERCHANT
    console.log('[registerShop] Updating user role to MERCHANT...');
    await adminDb.collection('users').doc(user.id).update({
      role: 'MERCHANT',
      updatedAt: new Date()
    });
    console.log('[registerShop] User role updated successfully');

    // FIX 4: Use unique shop ID generation (Medium Priority)
    // Generate unique ID with timestamp to prevent collisions
    const sanitizedName = shopData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
    const shopId = `shop_${sanitizedName}_${Date.now()}`;
    console.log('[registerShop] Generated unique shop ID:', shopId);
    
    const shopRef = adminDb.collection('shops').doc(shopId);
    
    // Check if shop with this ID already exists (should not happen with unique ID)
    console.log('[registerShop] Checking if shop ID already exists...');
    const existingShopDoc = await shopRef.get();
    if (existingShopDoc.exists) {
      console.error('[registerShop] Shop with this ID already exists');
      return { success: false, error: 'SHOP_NAME_ALREADY_TAKEN' };
    }
    console.log('[registerShop] Shop ID is available');
    
    // Sanitize phone before storing
    const cleanPhone = sanitizePhone(shopData.contactPhone);
    
    console.log('[registerShop] Creating shop document...');
    await shopRef.set({
      name: shopData.name.trim(),
      ownerId: user.id,
      city: shopData.city,
      specificLocation: shopData.specificLocation.trim(),
      landmark: shopData.landmark?.trim() || null,
      contactPhone: cleanPhone,
      balance: 0,
      suspended: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('[registerShop] Shop document created successfully');

    const shop: Shop = {
      id: shopRef.id,
      name: shopData.name.trim(),
      ownerId: user.id,
      city: shopData.city,
      specificLocation: shopData.specificLocation.trim(),
      landmark: shopData.landmark?.trim() || undefined,
      contactPhone: cleanPhone,
      balance: 0,
      suspended: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('[registerShop] Shop registration completed successfully:', shop.id);
    return { success: true, data: shop };
  } catch (error) {
    console.error('[registerShop] ERROR during shop registration:', error);
    console.error('[registerShop] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[registerShop] Error message:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'INTERNAL_ERROR' };
  }
}

/**
 * Check if user has a shop
 */
export async function hasShop(
  telegramId: string
): Promise<ActionResponse<{ hasShop: boolean; shopId?: string }>> {
  try {
    // Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    // Check if user has a shop
    const shopSnapshot = await adminDb
      .collection('shops')
      .where('ownerId', '==', user.id)
      .limit(1)
      .get();

    if (shopSnapshot.empty) {
      return {
        success: true,
        data: { hasShop: false }
      };
    }

    return {
      success: true,
      data: {
        hasShop: true,
        shopId: shopSnapshot.docs[0].id
      }
    };
  } catch (error) {
    console.error('Error checking shop:', error);
    return { success: false, error: 'INTERNAL_ERROR' };
  }
}

/**
 * Get all shops (for buyers to browse)
 * Public function - no authentication required
 */
export async function getShops(): Promise<ActionResponse<Shop[]>> {
  try {
    console.log('[getShops] Fetching all shops');
    const shopsSnapshot = await adminDb
      .collection('shops')
      .orderBy('name')
      .get();

    console.log('[getShops] Found', shopsSnapshot.docs.length, 'shops');

    const shops: Shop[] = shopsSnapshot.docs.map((doc) => {
      const data = doc.data();
      console.log('[getShops] Shop:', doc.id, data.name);
      return {
        id: doc.id,
        name: data.name,
        ownerId: data.ownerId,
        city: data.city,
        contactPhone: data.contactPhone,
        balance: data.balance || 0,
        suspended: data.suspended || false,
        suspendedAt: data.suspendedAt?.toDate(),
        suspendedReason: data.suspendedReason,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }) as Shop[];

    return { success: true, data: shops };
  } catch (error) {
    console.error('[getShops] Error getting shops:', error);
    return { success: false, error: 'INTERNAL_ERROR' };
  }
}

/**
 * Get shop by ID (for buyers to view shop details)
 * Public function - no authentication required
 */
export async function getShopById(shopId: string): Promise<ActionResponse<Shop>> {
  try {
    const shopDoc = await adminDb.collection('shops').doc(shopId).get();

    if (!shopDoc.exists) {
      return { success: false, error: 'SHOP_NOT_FOUND' };
    }

    const data = shopDoc.data()!;
    const shop: Shop = {
      id: shopDoc.id,
      name: data.name,
      ownerId: data.ownerId,
      city: data.city,
      contactPhone: data.contactPhone,
      balance: data.balance || 0,
      suspended: data.suspended || false,
      suspendedAt: data.suspendedAt?.toDate(),
      suspendedReason: data.suspendedReason,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };

    return { success: true, data: shop };
  } catch (error) {
    console.error('Error getting shop by ID:', error);
    return { success: false, error: 'INTERNAL_ERROR' };
  }
}

/**
 * Update shop information
 * Requirements: 3.2, 10.2, 10.3
 * 
 * Allows shop owners to update their shop details.
 * Verifies ownership before allowing updates.
 */
export async function updateShop(
  telegramId: string,
  updates: {
    name?: string;
    city?: City;
    specificLocation?: string;
    landmark?: string;
    contactPhone?: string;
    description?: string;
  }
): Promise<ActionResponse<Shop>> {
  try {
    console.log('[updateShop] Starting shop update for telegramId:', telegramId);
    console.log('[updateShop] Updates:', JSON.stringify(updates, null, 2));

    // 1. Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      console.error('[updateShop] User verification failed');
      return { success: false, error: 'UNAUTHORIZED' };
    }
    console.log('[updateShop] User verified:', user.id);

    // 2. Get shop for this owner
    const shopSnapshot = await adminDb
      .collection('shops')
      .where('ownerId', '==', user.id)
      .limit(1)
      .get();

    if (shopSnapshot.empty) {
      console.error('[updateShop] No shop found for owner:', user.id);
      return { success: false, error: 'SHOP_NOT_FOUND' };
    }

    const shopDoc = shopSnapshot.docs[0];
    const shopId = shopDoc.id;
    console.log('[updateShop] Shop found:', shopId);

    // 3. Validate updates
    if (updates.name !== undefined) {
      if (!updates.name || updates.name.trim().length === 0) {
        return { success: false, error: 'SHOP_NAME_REQUIRED' };
      }
      if (updates.name.length > 100) {
        return { success: false, error: 'SHOP_NAME_TOO_LONG' };
      }
    }

    if (updates.city !== undefined) {
      if (updates.city !== 'HARAR' && updates.city !== 'DIRE_DAWA') {
        return { success: false, error: 'INVALID_CITY' };
      }
    }

    if (updates.specificLocation !== undefined) {
      if (!updates.specificLocation || updates.specificLocation.trim().length === 0) {
        return { success: false, error: 'SPECIFIC_LOCATION_REQUIRED' };
      }
      if (updates.specificLocation.length > 200) {
        return { success: false, error: 'SPECIFIC_LOCATION_TOO_LONG' };
      }
    }

    if (updates.contactPhone !== undefined) {
      if (!updates.contactPhone || updates.contactPhone.trim().length === 0) {
        return { success: false, error: 'CONTACT_PHONE_REQUIRED' };
      }
      // Validate phone number format (Ethiopian format)
      const phoneRegex = /^(\+251|0)?[79]\d{8}$/;
      if (!phoneRegex.test(updates.contactPhone.replace(/\s/g, ''))) {
        return { success: false, error: 'INVALID_PHONE_FORMAT' };
      }
    }

    if (updates.landmark !== undefined && updates.landmark.length > 100) {
      return { success: false, error: 'LANDMARK_TOO_LONG' };
    }

    if (updates.description !== undefined && updates.description.length > 500) {
      return { success: false, error: 'DESCRIPTION_TOO_LONG' };
    }

    // 4. Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    if (updates.name !== undefined) {
      updateData.name = updates.name.trim();
    }
    if (updates.city !== undefined) {
      updateData.city = updates.city;
    }
    if (updates.specificLocation !== undefined) {
      updateData.specificLocation = updates.specificLocation.trim();
    }
    if (updates.landmark !== undefined) {
      updateData.landmark = updates.landmark.trim() || null;
    }
    if (updates.contactPhone !== undefined) {
      updateData.contactPhone = updates.contactPhone.trim();
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description.trim();
    }

    console.log('[updateShop] Updating shop with data:', updateData);

    // 5. Update shop document
    await adminDb.collection('shops').doc(shopId).update(updateData);

    // 6. Get updated shop
    const updatedDoc = await adminDb.collection('shops').doc(shopId).get();
    const data = updatedDoc.data()!;

    const shop: Shop = {
      id: shopId,
      name: data.name,
      ownerId: data.ownerId,
      city: data.city,
      specificLocation: data.specificLocation,
      landmark: data.landmark,
      contactPhone: data.contactPhone,
      description: data.description,
      balance: data.balance || 0,
      suspended: data.suspended || false,
      suspendedAt: data.suspendedAt?.toDate(),
      suspendedReason: data.suspendedReason,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };

    console.log('[updateShop] Shop updated successfully:', shopId);
    return { success: true, data: shop };
  } catch (error) {
    console.error('[updateShop] ERROR during shop update:', error);
    console.error('[updateShop] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[updateShop] Error message:', error instanceof Error ? error.message : String(error));
    return { success: false, error: 'INTERNAL_ERROR' };
  }
}
