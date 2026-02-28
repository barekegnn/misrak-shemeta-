'use server';

import { adminDb } from '@/lib/firebase/admin';
import { verifyTelegramUser } from '@/lib/auth/telegram';
import { initiateChapaPayment as chapaInitiatePayment } from '@/lib/payment/chapa';
import type { ActionResponse, ChapaPaymentRequest } from '@/types';

/**
 * Initiate payment for an order via Chapa
 * Requirements: 8.1, 8.2, 8.6
 */
export async function initiateChapaPayment(
  telegramId: string,
  orderId: string
): Promise<ActionResponse<{ checkoutUrl: string }>> {
  try {
    // 1. Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    // 2. Get order details
    const orderDoc = await adminDb.collection('orders').doc(orderId).get();
    
    if (!orderDoc.exists) {
      return { success: false, error: 'ORDER_NOT_FOUND' };
    }

    const orderData = orderDoc.data();

    // 3. Verify order belongs to user
    if (orderData!.userId !== user.id) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    // 4. Verify order is in PENDING status
    if (orderData!.status !== 'PENDING') {
      return { success: false, error: 'ORDER_NOT_PENDING' };
    }

    // 5. Calculate total amount (products + delivery fee)
    const totalAmount = orderData!.totalAmount + orderData!.deliveryFee;

    // 6. Prepare Chapa payment request
    const paymentRequest: ChapaPaymentRequest = {
      amount: totalAmount,
      currency: 'ETB',
      email: `user_${user.telegramId}@misrakshemeta.com`, // Generate email from telegramId
      first_name: user.telegramId.toString(),
      last_name: 'User',
      tx_ref: orderId, // Use orderId as transaction reference
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/chapa`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}`,
      customization: {
        title: 'Misrak Shemeta Marketplace',
        description: `Order #${orderId.substring(0, 8)}`,
      },
    };

    console.log('[Payment] Initiating Chapa payment for order:', orderId);

    // 7. Initiate payment with Chapa
    const chapaResponse = await chapaInitiatePayment(paymentRequest);

    if (chapaResponse.status !== 'success' || !chapaResponse.data?.checkout_url) {
      console.error('[Payment] Chapa payment initiation failed:', chapaResponse);
      return { success: false, error: 'PAYMENT_INITIATION_FAILED' };
    }

    console.log('[Payment] Chapa payment initiated successfully');

    // 8. Return checkout URL
    return {
      success: true,
      data: {
        checkoutUrl: chapaResponse.data.checkout_url,
      },
    };
  } catch (error) {
    console.error('[Payment] Error initiating payment:', error);
    return { success: false, error: 'INTERNAL_ERROR' };
  }
}
