'use server';

import { adminDb } from '@/lib/firebase/admin';
import { verifyTelegramUser } from '@/lib/auth/telegram';
import { ActionResponse } from '@/types';
import { initiateChapaPayment } from '@/lib/payment/chapa';

/**
 * Initiates a payment for an order using Chapa.
 * 
 * SECURITY: Verifies telegramId and order ownership before processing.
 * CRITICAL: This handles real money transactions. All validations must pass.
 * 
 * Flow:
 * 1. Verify user authentication
 * 2. Verify order exists and belongs to user
 * 3. Verify order is in PENDING status
 * 4. Create Chapa payment request
 * 5. Return checkout URL for redirect
 * 
 * Requirements: 8.1, 8.2, 8.6
 */
export async function initiateChapaPaymentForOrder(
  telegramId: string,
  orderId: string
): Promise<ActionResponse<{ checkoutUrl: string }>> {
  try {
    // 1. Verify user
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return {
        success: false,
        error: 'User not found or unauthorized',
      };
    }

    // 2. Get order and verify ownership
    const orderDoc = await adminDb.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return {
        success: false,
        error: 'Order not found',
      };
    }

    const order = orderDoc.data()!;

    // Verify order belongs to this user
    if (order.userId !== user.id) {
      return {
        success: false,
        error: 'You cannot pay for orders that do not belong to you',
      };
    }

    // 3. Verify order status is PENDING
    if (order.status !== 'PENDING') {
      return {
        success: false,
        error: `Cannot initiate payment for order with status ${order.status}`,
      };
    }

    // 4. Calculate total amount (order total + delivery fee)
    const totalAmount = order.totalAmount + order.deliveryFee;

    // 5. Get user details for payment
    const userDoc = await adminDb.collection('users').doc(user.id).get();
    const userData = userDoc.data()!;

    // 6. Create Chapa payment request
    const paymentRequest = {
      amount: totalAmount,
      currency: 'ETB' as const,
      email: `user_${user.telegramId}@misrakshemeta.app`, // Generate email from telegramId
      first_name: userData.phoneNumber || 'User',
      last_name: user.telegramId,
      tx_ref: orderId, // Use orderId as transaction reference
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/chapa`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}`,
      customization: {
        title: 'Misrak Shemeta - Order Payment',
        description: `Payment for order ${orderId}`,
      },
    };

    // 7. Initiate payment with Chapa
    const chapaResponse = await initiateChapaPayment(paymentRequest);

    if (chapaResponse.status !== 'success') {
      return {
        success: false,
        error: chapaResponse.message || 'Failed to initiate payment',
      };
    }

    // 8. Store Chapa transaction reference with order
    await adminDb.collection('orders').doc(orderId).update({
      chapaTransactionRef: chapaResponse.data.checkout_url,
      updatedAt: adminDb.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      data: {
        checkoutUrl: chapaResponse.data.checkout_url,
      },
    };
  } catch (error) {
    console.error('Error initiating Chapa payment:', error);
    return {
      success: false,
      error: 'Failed to initiate payment. Please try again.',
    };
  }
}

/**
 * Gets the payment status for an order.
 * 
 * This can be used to check if payment has been completed
 * without relying solely on webhooks.
 * 
 * SECURITY: Verifies telegramId and order ownership.
 * 
 * Requirements: 8.6
 */
export async function getOrderPaymentStatus(
  telegramId: string,
  orderId: string
): Promise<ActionResponse<{ status: string; paid: boolean }>> {
  try {
    // 1. Verify user
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return {
        success: false,
        error: 'User not found or unauthorized',
      };
    }

    // 2. Get order and verify ownership
    const orderDoc = await adminDb.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return {
        success: false,
        error: 'Order not found',
      };
    }

    const order = orderDoc.data()!;

    // Verify order belongs to this user
    if (order.userId !== user.id) {
      return {
        success: false,
        error: 'You cannot view payment status for orders that do not belong to you',
      };
    }

    // 3. Return payment status
    const paid = ['PAID_ESCROW', 'DISPATCHED', 'ARRIVED', 'COMPLETED'].includes(order.status);

    return {
      success: true,
      data: {
        status: order.status,
        paid,
      },
    };
  } catch (error) {
    console.error('Error getting order payment status:', error);
    return {
      success: false,
      error: 'Failed to get payment status',
    };
  }
}
