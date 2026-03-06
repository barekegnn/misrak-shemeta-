import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyTelegramUser } from '@/lib/auth/telegram';
import { initiateChapaPayment as chapaInitiatePayment } from '@/lib/payment/chapa';
import type { ChapaPaymentRequest } from '@/types';

/**
 * Debug endpoint to test payment initiation with detailed logging
 * Usage: GET /api/debug/payment?telegramId=779028866&orderId=12mFgkTPoOYILVhquRzy
 */
export async function GET(request: NextRequest) {
  const logs: string[] = [];
  const log = (message: string) => {
    console.log(message);
    logs.push(message);
  };

  try {
    const searchParams = request.nextUrl.searchParams;
    const telegramId = searchParams.get('telegramId');
    const orderId = searchParams.get('orderId');

    if (!telegramId || !orderId) {
      return NextResponse.json({
        error: 'Missing telegramId or orderId query parameters',
        usage: '/api/debug/payment?telegramId=779028866&orderId=YOUR_ORDER_ID'
      }, { status: 400 });
    }

    log('[Debug] ========== PAYMENT DEBUG START ==========');
    log(`[Debug] TelegramId: ${telegramId}`);
    log(`[Debug] OrderId: ${orderId}`);

    // Step 1: Verify user
    log('[Debug] Step 1: Verifying telegram user...');
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      log('[Debug] ERROR: User verification failed');
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED', logs }, { status: 401 });
    }
    log(`[Debug] User verified: ${user.id}`);

    // Step 2: Get order
    log('[Debug] Step 2: Fetching order...');
    const orderDoc = await adminDb.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      log('[Debug] ERROR: Order not found');
      return NextResponse.json({ success: false, error: 'ORDER_NOT_FOUND', logs }, { status: 404 });
    }
    const orderData = orderDoc.data();
    log(`[Debug] Order found. Status: ${orderData!.status}`);

    // Step 3: Verify ownership
    if (orderData!.userId !== user.id) {
      log('[Debug] ERROR: Order does not belong to user');
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED', logs }, { status: 401 });
    }

    // Step 4: Check status
    if (orderData!.status !== 'PENDING') {
      log(`[Debug] ERROR: Order is not PENDING (current: ${orderData!.status})`);
      return NextResponse.json({ success: false, error: 'ORDER_NOT_PENDING', logs }, { status: 400 });
    }

    // Step 5: Calculate amount
    const totalAmount = orderData!.totalAmount + orderData!.deliveryFee;
    log(`[Debug] Total amount: ${totalAmount} ETB`);

    // Step 6: Check environment variables
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const chapaKey = process.env.CHAPA_SECRET_KEY;
    const chapaMode = process.env.CHAPA_MODE;
    
    log(`[Debug] App URL: ${appUrl}`);
    log(`[Debug] Chapa Key exists: ${!!chapaKey}`);
    log(`[Debug] Chapa Key prefix: ${chapaKey?.substring(0, 20)}...`);
    log(`[Debug] Chapa Mode: ${chapaMode}`);

    if (!appUrl) {
      log('[Debug] ERROR: NEXT_PUBLIC_APP_URL not configured');
      return NextResponse.json({ success: false, error: 'APP_URL_NOT_CONFIGURED', logs }, { status: 500 });
    }

    if (!chapaKey) {
      log('[Debug] ERROR: CHAPA_SECRET_KEY not configured');
      return NextResponse.json({ success: false, error: 'CHAPA_KEY_NOT_CONFIGURED', logs }, { status: 500 });
    }

    // Step 7: Prepare payment request
    const userEmail = 'barekegna@gmail.com';
    log(`[Debug] Using email: ${userEmail}`);

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
        title: 'Misrak Shemeta', // Max 16 characters
        description: `Order ${orderId.substring(0, 8)}`, // No special chars except letters, numbers, hyphens, underscores, spaces, dots
      },
    };

    log('[Debug] Payment request prepared:');
    log(JSON.stringify(paymentRequest, null, 2));

    // Step 8: Call Chapa API
    log('[Debug] Step 8: Calling Chapa API...');
    const chapaResponse = await chapaInitiatePayment(paymentRequest);
    
    log('[Debug] Chapa response received:');
    log(JSON.stringify(chapaResponse, null, 2));

    if (chapaResponse.status !== 'success' || !chapaResponse.data?.checkout_url) {
      log('[Debug] ERROR: Chapa payment initiation failed');
      return NextResponse.json({
        success: false,
        error: 'PAYMENT_INITIATION_FAILED',
        chapaResponse,
        logs
      }, { status: 500 });
    }

    log('[Debug] ========== PAYMENT DEBUG SUCCESS ==========');

    return NextResponse.json({
      success: true,
      checkoutUrl: chapaResponse.data.checkout_url,
      logs,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    log('[Debug] ========== PAYMENT DEBUG FAILED ==========');
    log(`[Debug] Exception: ${error instanceof Error ? error.message : 'Unknown'}`);
    if (error instanceof Error && error.stack) {
      log(`[Debug] Stack: ${error.stack}`);
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      logs
    }, { status: 500 });
  }
}
