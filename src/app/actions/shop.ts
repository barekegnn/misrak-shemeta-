'use server';

import { adminDb } from '@/lib/firebase/admin';
import { verifyTelegramUser } from '@/lib/auth/telegram';
import type { Shop, ShopTransaction, ActionResponse } from '@/types';

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

    // Get all orders containing items from this shop
    const ordersSnapshot = await adminDb
      .collection('orders')
      .where('items', 'array-contains', { shopId })
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
    const shop: Shop = {
      id: shopDoc.id,
      ...shopDoc.data()
    } as Shop;

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
