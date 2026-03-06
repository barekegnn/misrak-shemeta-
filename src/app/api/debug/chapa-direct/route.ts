import { NextRequest, NextResponse } from 'next/server';

/**
 * Debug endpoint to test Chapa API directly
 * Usage: GET /api/debug/chapa-direct
 */
export async function GET(request: NextRequest) {
  try {
    const chapaSecretKey = process.env.CHAPA_SECRET_KEY;
    const chapaMode = process.env.CHAPA_MODE;
    
    console.log('[Chapa Direct Test] Environment check:');
    console.log('[Chapa Direct Test] CHAPA_SECRET_KEY exists:', !!chapaSecretKey);
    console.log('[Chapa Direct Test] CHAPA_SECRET_KEY prefix:', chapaSecretKey?.substring(0, 20));
    console.log('[Chapa Direct Test] CHAPA_MODE:', chapaMode);

    if (!chapaSecretKey) {
      return NextResponse.json({
        success: false,
        error: 'CHAPA_SECRET_KEY not configured'
      }, { status: 500 });
    }

    // Test Chapa API with a minimal request
    const testPaymentRequest = {
      amount: '100',
      currency: 'ETB',
      email: 'barekegna@gmail.com', // Use real email format
      first_name: 'Test',
      last_name: 'User',
      tx_ref: `test_${Date.now()}`,
      callback_url: 'https://misrak-shemeta.vercel.app/api/webhooks/chapa',
      return_url: 'https://misrak-shemeta.vercel.app/',
      customization: {
        title: 'Test Payment',
        description: 'Testing Chapa API',
      },
    };

    console.log('[Chapa Direct Test] Making API call...');
    console.log('[Chapa Direct Test] Request:', JSON.stringify(testPaymentRequest, null, 2));

    const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${chapaSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPaymentRequest),
    });

    console.log('[Chapa Direct Test] Response status:', response.status);
    
    const responseText = await response.text();
    console.log('[Chapa Direct Test] Response body:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      chapaMode,
      hasSecretKey: !!chapaSecretKey,
      secretKeyPrefix: chapaSecretKey?.substring(0, 20),
      response: responseData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Chapa Direct Test] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
