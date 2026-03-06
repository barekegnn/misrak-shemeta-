/**
 * Test endpoint to diagnose payment flow issues
 * This endpoint simulates the payment flow with detailed logging
 * 
 * Usage: GET /api/test/payment-flow?telegramId=YOUR_TELEGRAM_ID&orderId=ORDER_ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { initiateChapaPayment } from '@/app/actions/payment';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const telegramId = searchParams.get('telegramId');
    const orderId = searchParams.get('orderId');

    console.log('[Payment Test] Starting payment flow test');
    console.log('[Payment Test] TelegramId:', telegramId);
    console.log('[Payment Test] OrderId:', orderId);

    if (!telegramId || !orderId) {
      return NextResponse.json({
        success: false,
        error: 'Missing telegramId or orderId parameters',
        usage: 'GET /api/test/payment-flow?telegramId=YOUR_ID&orderId=ORDER_ID',
      }, { status: 400 });
    }

    // Call the payment initiation function
    console.log('[Payment Test] Calling initiateChapaPayment...');
    const result = await initiateChapaPayment(telegramId, orderId);
    
    console.log('[Payment Test] Result received:', JSON.stringify(result, null, 2));

    return NextResponse.json({
      success: true,
      testResult: result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Payment Test] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
