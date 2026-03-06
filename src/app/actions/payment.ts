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
  console.log('[Payment] ========== PAYMENT INITIATION START ==========');
  console.log('[Payment] TelegramId:', telegramId);
  console.log('[Payment] OrderId:', orderId);
  
  try {
    // 1. Verify telegramId
    console.log('[Payment] Step 1: Verifying telegram user...');
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      console.error('[Payment] User verification failed');
      return { success: false, error: 'UNAUTHORIZED' };
    }
    console.log('[Payment] User verified:', user.id);

    // 2. Get order details
    console.log('[Payment] Step 2: Fetching order details...');
    const orderDoc = await adminDb.collection('orders').doc(orderId).get();
    
    if (!orderDoc.exists) {
      console.error('[Payment] Order not found:', orderId);
      return { success: false, error: 'ORDER_NOT_FOUND' };
    }

    const orderData = orderDoc.data();
    console.log('[Payment] Order found. Status:', orderData!.status, 'UserId:', orderData!.userId);

    // 3. Verify order belongs to user
    if (orderData!.userId !== user.id) {
      console.error('[Payment] Order does not belong to user. Order userId:', orderData!.userId, 'User id:', user.id);
      return { success: false, error: 'UNAUTHORIZED' };
    }

    // 4. Verify order is in PENDING status
    if (orderData!.status !== 'PENDING') {
      console.error('[Payment] Order is not in PENDING status:', orderData!.status);
      return { success: false, error: 'ORDER_NOT_PENDING' };
    }

    // 5. Calculate total amount (products + delivery fee)
    const totalAmount = orderData!.totalAmount + orderData!.deliveryFee;
    console.log('[Payment] Step 3: Total amount calculated:', totalAmount, 'ETB');

    // 6. Prepare Chapa payment request
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    console.log('[Payment] Step 4: App URL:', appUrl);
    
    if (!appUrl || appUrl.includes('your-production-domain')) {
      console.error('[Payment] NEXT_PUBLIC_APP_URL is not configured correctly:', appUrl);
      return { success: false, error: 'APP_URL_NOT_CONFIGURED' };
    }

    // Use a valid email format that Chapa will accept
    const userEmail = `customer${user.telegramId}@misrakshemeta.com`;
    console.log('[Payment] Step 5: Generated email:', userEmail);

    const paymentRequest: ChapaPaymentRequest = {
      amount: totalAmount.toString(),
      currency: 'ETB',
      email: userEmail,
      first_name: user.telegramId.toString(),
      last_name: 'User',
      tx_ref: orderId,
      callback_url: `${appUrl}/api/webhooks/chapa`,
      return_url: `${appUrl}/orders/${orderId}`,
      customization: {
        title: 'Misrak Shemeta Marketplace',
        description: `Order #${orderId.substring(0, 8)}`,
      },
    };

    console.log('[Payment] Step 6: Payment request prepared:', {
      amount: paymentRequest.amount,
      email: paymentRequest.email,
      tx_ref: paymentRequest.tx_ref,
      callback_url: paymentRequest.callback_url,
      return_url: paymentRequest.return_url,
    });

    // 7. Initiate payment with Chapa
    console.log('[Payment] Step 7: Calling Chapa API...');
    const chapaResponse = await chapaInitiatePayment(paymentRequest);
    console.log('[Payment] Chapa API response received:', {
      status: chapaResponse.status,
      message: chapaResponse.message,
      hasCheckoutUrl: !!chapaResponse.data?.checkout_url,
    });

    if (chapaResponse.status !== 'success' || !chapaResponse.data?.checkout_url) {
      console.error('[Payment] Chapa payment initiation failed. Full response:', JSON.stringify(chapaResponse));
      return { success: false, error: 'PAYMENT_INITIATION_FAILED' };
    }

    console.log('[Payment] Step 8: Payment initiated successfully!');
    console.log('[Payment] Checkout URL:', chapaResponse.data.checkout_url);
    console.log('[Payment] ========== PAYMENT INITIATION SUCCESS ==========');

    // 8. Return checkout URL
    return {
      success: true,
      data: {
        checkoutUrl: chapaResponse.data.checkout_url,
      },
    };
  } catch (error) {
    console.error('[Payment] ========== PAYMENT INITIATION FAILED ==========');
    console.error('[Payment] Caught exception:', error);
    
    if (error instanceof Error) {
      console.error('[Payment] Error name:', error.name);
      console.error('[Payment] Error message:', error.message);
      console.error('[Payment] Error stack:', error.stack);
    }
    
    return { success: false, error: 'INTERNAL_ERROR' };
  }
}
