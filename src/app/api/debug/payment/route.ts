import { NextRequest, NextResponse } from 'next/server';
import { initiateChapaPayment } from '@/app/actions/payment';

/**
 * Debug endpoint to test payment initiation
 * Usage: GET /api/debug/payment?telegramId=779028866&orderId=12mFgkTPoOYILVhquRzy
 */
export async function GET(request: NextRequest) {
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

    console.log('[Debug Payment] Testing payment initiation...');
    console.log('[Debug Payment] TelegramId:', telegramId);
    console.log('[Debug Payment] OrderId:', orderId);

    const result = await initiateChapaPayment(telegramId, orderId);

    console.log('[Debug Payment] Result:', JSON.stringify(result, null, 2));

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Debug Payment] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
