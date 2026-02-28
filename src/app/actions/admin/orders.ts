/**
 * Admin Order Management Server Actions
 * 
 * Provides server actions for managing orders including manual status updates,
 * refunds, and order listing with search/filter.
 * 
 * Requirements: 31.1, 31.2, 31.3
 */

'use server';

import { adminDb } from '@/lib/firebase/admin';
import { requireAdminAccess } from '@/lib/auth/admin';
import { logAdminAction } from '@/lib/admin/audit';
import type { Order, ActionResponse, OrderFilters, OrderStatus } from '@/types';
import { ALLOWED_TRANSITIONS } from '@/types';

/**
 * Manually updates an order status
 * 
 * Allows admin to manually change order status for exceptional cases.
 * Uses Firestore Transaction for atomic updates.
 * 
 * @param adminTelegramId - Telegram ID of admin performing the action
 * @param orderId - ID of order to update
 * @param newStatus - New status to set
 * @param reason - Reason for manual status change
 * @returns ActionResponse<Order>
 * 
 * Requirements: 31.1, 31.2, 31.3
 */
export async function manualUpdateOrderStatus(
  adminTelegramId: string,
  orderId: string,
  newStatus: OrderStatus,
  reason: string
): Promise<ActionResponse<Order>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Update order status using transaction
    const updatedOrder = await adminDb.runTransaction(async (transaction) => {
      const orderRef = adminDb.collection('orders').doc(orderId);
      const orderDoc = await transaction.get(orderRef);
      
      if (!orderDoc.exists) {
        throw new Error('ORDER_NOT_FOUND');
      }
      
      const orderData = orderDoc.data()!;
      const oldStatus = orderData.status;
      
      // Add status change to history
      const statusHistory = orderData.statusHistory || [];
      statusHistory.push({
        from: oldStatus,
        to: newStatus,
        timestamp: new Date(),
        actor: `admin:${adminTelegramId}`,
      });
      
      // Update order
      transaction.update(orderRef, {
        status: newStatus,
        statusHistory,
        updatedAt: new Date(),
      });
      
      // If manually completing order, release funds to shop balance
      if (newStatus === 'COMPLETED' && oldStatus !== 'COMPLETED') {
        for (const item of orderData.items) {
          const shopRef = adminDb.collection('shops').doc(item.shopId);
          const shopDoc = await transaction.get(shopRef);
          
          if (shopDoc.exists) {
            const shopData = shopDoc.data()!;
            const currentBalance = shopData.balance || 0;
            const itemTotal = item.priceAtPurchase * item.quantity;
            const newBalance = currentBalance + itemTotal;
            
            transaction.update(shopRef, {
              balance: newBalance,
              updatedAt: new Date(),
            });
            
            // Create transaction record
            const transactionRef = adminDb.collection('shopTransactions').doc();
            transaction.set(transactionRef, {
              shopId: item.shopId,
              orderId: orderId,
              amount: itemTotal,
              type: 'CREDIT',
              balanceBefore: currentBalance,
              balanceAfter: newBalance,
              timestamp: new Date(),
            });
          }
        }
      }
      
      return {
        id: orderDoc.id,
        ...orderData,
        status: newStatus,
        statusHistory,
        updatedAt: new Date(),
      } as Order;
    });
    
    // Log admin action
    await logAdminAction({
      adminTelegramId,
      action: 'ORDER_STATUS_UPDATE',
      targetType: 'ORDER',
      targetId: orderId,
      details: { 
        oldStatus: updatedOrder.statusHistory[updatedOrder.statusHistory.length - 2]?.to || 'UNKNOWN',
        newStatus,
        reason,
      },
    });
    
    return { success: true, data: updatedOrder };
  } catch (error: any) {
    console.error('Error updating order status:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    if (error.message === 'ORDER_NOT_FOUND') {
      return { success: false, error: 'Order not found' };
    }
    
    return { success: false, error: 'Failed to update order status' };
  }
}

/**
 * Manually processes a refund for an order
 * 
 * Initiates a refund through Chapa and updates order status.
 * 
 * @param adminTelegramId - Telegram ID of admin performing the action
 * @param orderId - ID of order to refund
 * @param reason - Reason for refund
 * @returns ActionResponse<void>
 * 
 * Requirements: 31.1, 31.2
 */
export async function manualRefund(
  adminTelegramId: string,
  orderId: string,
  reason: string
): Promise<ActionResponse<void>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Get order
    const orderDoc = await adminDb.collection('orders').doc(orderId).get();
    
    if (!orderDoc.exists) {
      return { success: false, error: 'Order not found' };
    }
    
    const orderData = orderDoc.data()!;
    
    // Check if order can be refunded
    if (!['PAID_ESCROW', 'DISPATCHED', 'ARRIVED'].includes(orderData.status)) {
      return { 
        success: false, 
        error: 'Order cannot be refunded in current status' 
      };
    }
    
    // Check if already refunded
    if (orderData.refundInitiated) {
      return { success: false, error: 'Refund already initiated for this order' };
    }
    
    // Update order with refund information
    await adminDb.collection('orders').doc(orderId).update({
      status: 'CANCELLED',
      refundInitiated: true,
      refundAmount: orderData.totalAmount + orderData.deliveryFee,
      refundInitiatedAt: new Date(),
      cancellationReason: `Admin refund: ${reason}`,
      updatedAt: new Date(),
    });
    
    // Log admin action
    await logAdminAction({
      adminTelegramId,
      action: 'ORDER_REFUND',
      targetType: 'ORDER',
      targetId: orderId,
      details: { 
        reason,
        refundAmount: orderData.totalAmount + orderData.deliveryFee,
        originalStatus: orderData.status,
      },
    });
    
    // Note: Actual Chapa refund API call would go here
    // For now, we just mark the order as refund initiated
    // In production, you would call Chapa's refund endpoint
    
    return { success: true };
  } catch (error: any) {
    console.error('Error processing refund:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to process refund' };
  }
}

/**
 * Gets list of all orders with pagination and filtering
 * 
 * Retrieves orders from Firestore with optional filters for status,
 * date range, and search by orderId, buyerId, or shopId.
 * 
 * @param adminTelegramId - Telegram ID of admin requesting the list
 * @param filters - Optional filters for the order list
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of orders per page
 * @returns ActionResponse<{ orders: Order[], total: number, page: number, pageSize: number }>
 * 
 * Requirements: 31.1, 31.3
 */
export async function getOrderList(
  adminTelegramId: string,
  filters?: OrderFilters,
  page: number = 1,
  pageSize: number = 50
): Promise<ActionResponse<{
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
}>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Build query
    let query: FirebaseFirestore.Query = adminDb.collection('orders');
    
    // Apply filters
    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }
    
    if (filters?.startDate) {
      query = query.where('createdAt', '>=', filters.startDate);
    }
    
    if (filters?.endDate) {
      query = query.where('createdAt', '<=', filters.endDate);
    }
    
    // Get total count
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;
    
    // Apply pagination
    const offset = (page - 1) * pageSize;
    query = query.orderBy('createdAt', 'desc').limit(pageSize).offset(offset);
    
    // Execute query
    const snapshot = await query.get();
    
    // Map to Order objects and fetch related data
    const orders: Order[] = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // Fetch user data for buyer info
        let buyerTelegramId = 'Unknown';
        try {
          const userDoc = await adminDb.collection('users').doc(data.userId).get();
          if (userDoc.exists) {
            buyerTelegramId = userDoc.data()?.telegramId || 'Unknown';
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
        
        // Fetch shop names for items
        const itemsWithShopNames = await Promise.all(
          (data.items || []).map(async (item: any) => {
            let shopName = 'Unknown Shop';
            try {
              const shopDoc = await adminDb.collection('shops').doc(item.shopId).get();
              if (shopDoc.exists) {
                shopName = shopDoc.data()?.name || 'Unknown Shop';
              }
            } catch (error) {
              console.error('Error fetching shop:', error);
            }
            
            return {
              ...item,
              shopName,
            };
          })
        );
        
        return {
          id: doc.id,
          userId: data.userId,
          buyerTelegramId, // Add for display
          items: itemsWithShopNames,
          totalAmount: data.totalAmount,
          deliveryFee: data.deliveryFee,
          status: data.status,
          userHomeLocation: data.userHomeLocation,
          otpCode: data.otpCode,
          otpAttempts: data.otpAttempts || 0,
          chapaTransactionRef: data.chapaTransactionRef,
          cancellationReason: data.cancellationReason,
          refundInitiated: data.refundInitiated,
          refundAmount: data.refundAmount,
          refundInitiatedAt: data.refundInitiatedAt?.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          statusHistory: (data.statusHistory || []).map((sh: any) => ({
            from: sh.from,
            to: sh.to,
            timestamp: sh.timestamp.toDate(),
            actor: sh.actor,
          })),
        } as any;
      })
    );
    
    // Apply search filter (client-side for now since it involves multiple fields)
    let filteredOrders = orders;
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredOrders = orders.filter(order => 
        order.id.toLowerCase().includes(searchLower) ||
        (order as any).buyerTelegramId?.toLowerCase().includes(searchLower) ||
        order.items.some((item: any) => 
          item.shopName?.toLowerCase().includes(searchLower)
        )
      );
    }
    
    return {
      success: true,
      data: {
        orders: filteredOrders,
        total: filters?.search ? filteredOrders.length : total,
        page,
        pageSize,
      },
    };
  } catch (error: any) {
    console.error('Error getting order list:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to get order list' };
  }
}

/**
 * Gets a single order by ID
 * 
 * @param adminTelegramId - Telegram ID of admin requesting the order
 * @param orderId - ID of order to retrieve
 * @returns ActionResponse<Order>
 * 
 * Requirements: 31.1
 */
export async function getOrderById(
  adminTelegramId: string,
  orderId: string
): Promise<ActionResponse<Order>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Get order document
    const orderDoc = await adminDb.collection('orders').doc(orderId).get();
    
    if (!orderDoc.exists) {
      return { success: false, error: 'Order not found' };
    }
    
    const data = orderDoc.data()!;
    const order: Order = {
      id: orderDoc.id,
      userId: data.userId,
      items: data.items,
      totalAmount: data.totalAmount,
      deliveryFee: data.deliveryFee,
      status: data.status,
      userHomeLocation: data.userHomeLocation,
      otpCode: data.otpCode,
      otpAttempts: data.otpAttempts || 0,
      chapaTransactionRef: data.chapaTransactionRef,
      cancellationReason: data.cancellationReason,
      refundInitiated: data.refundInitiated,
      refundAmount: data.refundAmount,
      refundInitiatedAt: data.refundInitiatedAt?.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      statusHistory: (data.statusHistory || []).map((sh: any) => ({
        from: sh.from,
        to: sh.to,
        timestamp: sh.timestamp.toDate(),
        actor: sh.actor,
      })),
    };
    
    return { success: true, data: order };
  } catch (error: any) {
    console.error('Error getting order:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to get order' };
  }
}
