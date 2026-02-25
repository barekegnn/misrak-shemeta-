'use server';

import { adminDb } from '@/lib/firebase/admin';
import { verifyTelegramUser } from '@/lib/auth/telegram';
import { calculateDeliveryFee } from '@/lib/logistics/pricing';
import { generateOTP } from '@/lib/orders/otp';
import { 
  notifyOrderDispatched, 
  notifyOrderArrived, 
  notifyOrderCancelled,
  notifyOrderCompleted 
} from '@/lib/notifications/service';
import type { 
  Order, 
  OrderItem, 
  OrderStatus, 
  ActionResponse,
  City,
  Location
} from '@/types';

/**
 * Create a new order from cart items
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */
export async function createOrder(
  telegramId: string,
  cartItems: Array<{ productId: string; quantity: number }>
): Promise<ActionResponse<Order>> {
  try {
    // 1. Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    // 2. Validate cart is not empty
    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: 'EMPTY_CART' };
    }

    // 3. Fetch product details and check stock
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;
    let deliveryFee = 0;

    for (const cartItem of cartItems) {
      const productDoc = await adminDb
        .collection('products')
        .doc(cartItem.productId)
        .get();

      if (!productDoc.exists) {
        return { 
          success: false, 
          error: `PRODUCT_NOT_FOUND: ${cartItem.productId}` 
        };
      }

      const product = productDoc.data();
      
      // Check stock availability
      if (product!.stock < cartItem.quantity) {
        return { 
          success: false, 
          error: `INSUFFICIENT_STOCK: ${product!.name}` 
        };
      }

      // Fetch shop details for city
      const shopDoc = await adminDb
        .collection('shops')
        .doc(product!.shopId)
        .get();

      if (!shopDoc.exists) {
        return { success: false, error: 'SHOP_NOT_FOUND' };
      }

      const shop = shopDoc.data();
      const shopCity = shop!.city as City;

      // Calculate delivery fee for this item's shop
      const route = calculateDeliveryFee(shopCity, user.homeLocation as Location);
      deliveryFee = Math.max(deliveryFee, route.fee); // Use highest delivery fee

      // Create order item
      orderItems.push({
        productId: cartItem.productId,
        shopId: product!.shopId,
        productName: product!.name,
        quantity: cartItem.quantity,
        priceAtPurchase: product!.price,
        shopCity: shopCity
      });

      totalAmount += product!.price * cartItem.quantity;
    }

    // 4. Generate OTP
    const otpCode = generateOTP();

    // 5. Create order document
    const orderData = {
      userId: user.id,
      items: orderItems,
      totalAmount,
      deliveryFee,
      status: 'PENDING' as OrderStatus,
      userHomeLocation: user.homeLocation,
      otpCode,
      otpAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      statusHistory: [
        {
          from: null,
          to: 'PENDING' as OrderStatus,
          timestamp: new Date(),
          actor: user.id
        }
      ]
    };

    const orderRef = await adminDb.collection('orders').add(orderData);

    // 6. Decrement product stock
    const batch = adminDb.batch();
    for (const item of orderItems) {
      const productRef = adminDb.collection('products').doc(item.productId);
      batch.update(productRef, {
        stock: adminDb.FieldValue.increment(-item.quantity)
      });
    }
    await batch.commit();

    // 7. Clear cart
    await adminDb.collection('carts').doc(user.id).delete();

    // 8. Return created order
    const order: Order = {
      id: orderRef.id,
      ...orderData
    };

    return { success: true, data: order };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'INTERNAL_ERROR' };
  }
}

/**
 * Get order by ID
 * Verifies user has access to the order
 */
export async function getOrderById(
  telegramId: string,
  orderId: string
): Promise<ActionResponse<Order>> {
  try {
    // Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    const orderDoc = await adminDb.collection('orders').doc(orderId).get();

    if (!orderDoc.exists) {
      return { success: false, error: 'ORDER_NOT_FOUND' };
    }

    const orderData = orderDoc.data();

    // Check if user has access (buyer or shop owner of items)
    const isBuyer = orderData!.userId === user.id;
    
    // Check if user is shop owner of any items
    let isShopOwner = false;
    if (user.role === 'MERCHANT') {
      const shopDoc = await adminDb
        .collection('shops')
        .where('ownerId', '==', user.id)
        .limit(1)
        .get();

      if (!shopDoc.empty) {
        const shopId = shopDoc.docs[0].id;
        isShopOwner = orderData!.items.some(
          (item: OrderItem) => item.shopId === shopId
        );
      }
    }

    if (!isBuyer && !isShopOwner) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    const order: Order = {
      id: orderDoc.id,
      ...orderData
    } as Order;

    return { success: true, data: order };
  } catch (error) {
    console.error('Error getting order:', error);
    return { success: false, error: 'INTERNAL_ERROR' };
  }
}

/**
 * Get all orders for a user (buyer view)
 * Requirements: 14.1, 14.2
 */
export async function getUserOrders(
  telegramId: string
): Promise<ActionResponse<Order[]>> {
  try {
    // Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    const ordersSnapshot = await adminDb
      .collection('orders')
      .where('userId', '==', user.id)
      .orderBy('createdAt', 'desc')
      .get();

    const orders: Order[] = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];

    return { success: true, data: orders };
  } catch (error) {
    console.error('Error getting user orders:', error);
    return { success: false, error: 'INTERNAL_ERROR' };
  }
}

/**
 * Get all orders for a shop owner
 * Requirements: 9.1, 9.6
 */
export async function getShopOrders(
  telegramId: string,
  statusFilter?: OrderStatus
): Promise<ActionResponse<Order[]>> {
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

    // Get all orders containing items from this shop
    let query = adminDb
      .collection('orders')
      .where('items', 'array-contains', { shopId });

    if (statusFilter) {
      query = query.where('status', '==', statusFilter);
    }

    const ordersSnapshot = await query.orderBy('createdAt', 'desc').get();

    // Filter orders to only include items from this shop
    const orders: Order[] = ordersSnapshot.docs
      .map(doc => {
        const orderData = doc.data();
        const shopItems = orderData.items.filter(
          (item: OrderItem) => item.shopId === shopId
        );

        if (shopItems.length === 0) return null;

        return {
          id: doc.id,
          ...orderData,
          items: shopItems
        } as Order;
      })
      .filter(order => order !== null) as Order[];

    return { success: true, data: orders };
  } catch (error) {
    console.error('Error getting shop orders:', error);
    return { success: false, error: 'INTERNAL_ERROR' };
  }
}

/**
 * Update order status with state machine validation
 * Requirements: 23.1, 23.2, 23.3, 23.4, 23.5
 */
export async function updateOrderStatus(
  telegramId: string,
  orderId: string,
  newStatus: OrderStatus,
  actorRole?: 'BUYER' | 'SHOP_OWNER' | 'RUNNER'
): Promise<ActionResponse<Order>> {
  try {
    // Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    // Use Firestore Transaction for atomic update
    const result = await adminDb.runTransaction(async (transaction) => {
      const orderRef = adminDb.collection('orders').doc(orderId);
      const orderDoc = await transaction.get(orderRef);

      if (!orderDoc.exists) {
        throw new Error('ORDER_NOT_FOUND');
      }

      const orderData = orderDoc.data();
      const currentStatus = orderData!.status as OrderStatus;

      // Import state machine validation
      const { isValidTransition } = await import('@/lib/orders/stateMachine');

      // Validate transition
      if (!isValidTransition(currentStatus, newStatus)) {
        throw new Error(`INVALID_TRANSITION: ${currentStatus} -> ${newStatus}`);
      }

      // Verify authorization based on role
      if (actorRole === 'SHOP_OWNER') {
        // Shop owner can only mark as DISPATCHED
        if (newStatus !== 'DISPATCHED') {
          throw new Error('UNAUTHORIZED_ACTION');
        }

        // Verify shop ownership
        const shopSnapshot = await adminDb
          .collection('shops')
          .where('ownerId', '==', user.id)
          .limit(1)
          .get();

        if (shopSnapshot.empty) {
          throw new Error('SHOP_NOT_FOUND');
        }

        const shopId = shopSnapshot.docs[0].id;
        const hasShopItems = orderData!.items.some(
          (item: OrderItem) => item.shopId === shopId
        );

        if (!hasShopItems) {
          throw new Error('UNAUTHORIZED');
        }
      } else if (actorRole === 'RUNNER') {
        // Runner can only mark as ARRIVED
        if (newStatus !== 'ARRIVED') {
          throw new Error('UNAUTHORIZED_ACTION');
        }
      }

      // Update order status
      const statusChange = {
        from: currentStatus,
        to: newStatus,
        timestamp: new Date(),
        actor: user.id
      };

      transaction.update(orderRef, {
        status: newStatus,
        updatedAt: new Date(),
        statusHistory: adminDb.FieldValue.arrayUnion(statusChange)
      });

      return {
        id: orderId,
        ...orderData,
        status: newStatus,
        updatedAt: new Date(),
        statusHistory: [...orderData!.statusHistory, statusChange]
      } as Order;
    });

    // Send notifications based on status change (Requirements 9.3, 9.5)
    if (result) {
      // Get buyer's language preference
      const buyerDoc = await adminDb.collection('users').doc(result.userId).get();
      const buyerLanguage = buyerDoc.data()?.languagePreference || 'en';

      if (newStatus === 'DISPATCHED') {
        // Requirement 9.3: Notify buyer when order is dispatched
        await notifyOrderDispatched(result.userId, orderId, buyerLanguage);
      } else if (newStatus === 'ARRIVED') {
        // Requirement 9.5: Notify buyer when order arrives with OTP
        await notifyOrderArrived(result.userId, orderId, result.otpCode, buyerLanguage);
      } else if (newStatus === 'COMPLETED') {
        // Notify buyer when order is completed
        await notifyOrderCompleted(result.userId, orderId, buyerLanguage);
      }
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message || 'INTERNAL_ERROR' };
  }
}

/**
 * Validate OTP and complete order
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6
 */
export async function validateOTP(
  telegramId: string,
  orderId: string,
  submittedOTP: string
): Promise<ActionResponse<Order>> {
  try {
    // Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    // Validate OTP format
    const { isValidOTPFormat } = await import('@/lib/orders/otp');
    if (!isValidOTPFormat(submittedOTP)) {
      return { success: false, error: 'INVALID_OTP_FORMAT' };
    }

    // Use Firestore Transaction for atomic update
    const result = await adminDb.runTransaction(async (transaction) => {
      const orderRef = adminDb.collection('orders').doc(orderId);
      const orderDoc = await transaction.get(orderRef);

      if (!orderDoc.exists) {
        throw new Error('ORDER_NOT_FOUND');
      }

      const orderData = orderDoc.data();

      // Check if order is in ARRIVED status
      if (orderData!.status !== 'ARRIVED') {
        throw new Error('ORDER_NOT_ARRIVED');
      }

      // Check if order is locked (3 failed attempts)
      if (orderData!.otpAttempts >= 3) {
        throw new Error('ORDER_LOCKED');
      }

      // Validate OTP
      if (submittedOTP !== orderData!.otpCode) {
        // Increment attempt counter
        transaction.update(orderRef, {
          otpAttempts: adminDb.FieldValue.increment(1),
          updatedAt: new Date()
        });

        throw new Error('INVALID_OTP');
      }

      // OTP is correct - complete order and release funds
      const statusChange = {
        from: 'ARRIVED' as OrderStatus,
        to: 'COMPLETED' as OrderStatus,
        timestamp: new Date(),
        actor: user.id
      };

      transaction.update(orderRef, {
        status: 'COMPLETED',
        updatedAt: new Date(),
        statusHistory: adminDb.FieldValue.arrayUnion(statusChange)
      });

      // Release funds to shop balance(s)
      for (const item of orderData!.items as OrderItem[]) {
        const shopRef = adminDb.collection('shops').doc(item.shopId);
        const shopDoc = await transaction.get(shopRef);

        if (shopDoc.exists) {
          const currentBalance = shopDoc.data()!.balance || 0;
          const itemTotal = item.priceAtPurchase * item.quantity;

          // Update shop balance
          transaction.update(shopRef, {
            balance: adminDb.FieldValue.increment(itemTotal),
            updatedAt: new Date()
          });

          // Create transaction record
          const transactionRef = adminDb.collection('shopTransactions').doc();
          transaction.set(transactionRef, {
            shopId: item.shopId,
            orderId: orderId,
            amount: itemTotal,
            type: 'CREDIT',
            balanceBefore: currentBalance,
            balanceAfter: currentBalance + itemTotal,
            timestamp: new Date()
          });
        }
      }

      return {
        id: orderId,
        ...orderData,
        status: 'COMPLETED',
        updatedAt: new Date(),
        statusHistory: [...orderData!.statusHistory, statusChange]
      } as Order;
    });

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error validating OTP:', error);
    return { success: false, error: error.message || 'INTERNAL_ERROR' };
  }
}

/**
 * Cancel an order
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5
 */
export async function cancelOrder(
  telegramId: string,
  orderId: string,
  reason: string
): Promise<ActionResponse<Order>> {
  try {
    // Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    // Use Firestore Transaction for atomic update
    const result = await adminDb.runTransaction(async (transaction) => {
      const orderRef = adminDb.collection('orders').doc(orderId);
      const orderDoc = await transaction.get(orderRef);

      if (!orderDoc.exists) {
        throw new Error('ORDER_NOT_FOUND');
      }

      const orderData = orderDoc.data();

      // Verify user is the buyer
      if (orderData!.userId !== user.id) {
        throw new Error('UNAUTHORIZED');
      }

      // Check if order can be cancelled
      const { canCancelOrder, requiresRefund } = await import('@/lib/orders/stateMachine');
      const currentStatus = orderData!.status as OrderStatus;

      if (!canCancelOrder(currentStatus)) {
        throw new Error('CANNOT_CANCEL');
      }

      // Update order status to CANCELLED
      const statusChange = {
        from: currentStatus,
        to: 'CANCELLED' as OrderStatus,
        timestamp: new Date(),
        actor: user.id
      };

      transaction.update(orderRef, {
        status: 'CANCELLED',
        cancellationReason: reason,
        updatedAt: new Date(),
        statusHistory: adminDb.FieldValue.arrayUnion(statusChange)
      });

      // Restore product stock
      for (const item of orderData!.items as OrderItem[]) {
        const productRef = adminDb.collection('products').doc(item.productId);
        transaction.update(productRef, {
          stock: adminDb.FieldValue.increment(item.quantity)
        });
      }

      // Note: Refund processing (if requiresRefund) should be handled separately
      // via Chapa API - this is marked for external processing

      return {
        id: orderId,
        ...orderData,
        status: 'CANCELLED',
        cancellationReason: reason,
        updatedAt: new Date(),
        statusHistory: [...orderData!.statusHistory, statusChange],
        requiresRefund: requiresRefund(currentStatus)
      } as Order & { requiresRefund: boolean };
    });

    // Requirement 18.4: Send notification to shop owner(s) when order is cancelled
    if (result) {
      // Get unique shop IDs from order items
      const shopIds = [...new Set(result.items.map(item => item.shopId))];

      // Notify each shop owner
      for (const shopId of shopIds) {
        const shopDoc = await adminDb.collection('shops').doc(shopId).get();
        if (shopDoc.exists) {
          const shopData = shopDoc.data();
          const ownerDoc = await adminDb.collection('users').doc(shopData!.ownerId).get();
          
          if (ownerDoc.exists) {
            const ownerLanguage = ownerDoc.data()?.languagePreference || 'en';
            await notifyOrderCancelled(
              shopData!.ownerId,
              orderId,
              reason,
              ownerLanguage
            );
          }
        }
      }
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return { success: false, error: error.message || 'INTERNAL_ERROR' };
  }
}
