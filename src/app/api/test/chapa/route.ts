/**
 * Test endpoint to verify Chapa API connectivity and configuration
 * This endpoint helps diagnose payment integration issues
 * 
 * Usage: GET /api/test/chapa
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables
    const chapaSecretKey = process.env.CHAPA_SECRET_KEY;
    const chapaMode = process.env.CHAPA_MODE || 'sandbox';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    const config = {
      hasChapaSecretKey: !!chapaSecretKey,
      chapaSecretKeyPrefix: chapaSecretKey?.substring(0, 15) + '...',
      chapaMode,
      appUrl,
      appUrlValid: appUrl && !appUrl.includes('your-production-domain'),
    };

    console.log('[Chapa Test] Configuration:', config);

    // Test Chapa API connectivity with a minimal request
    if (!chapaSecretKey) {
      return NextResponse.json({
        success: false,
        error: 'CHAPA_SECRET_KEY not configured',
        config,
      }, { status: 500 });
    }

    const baseUrl = chapaMode === 'sandbox'
      ? 'https://api.chapa.co/v1'
      : 'https://api.chapa.co/v1';

    // Create a test payment request (won't be processed, just validates API access)
    const testPaymentRequest = {
      amount: '100', // Chapa expects string for amount
      currency: 'ETB',
      email: 'barekegna@gmail.com', // Use merchant's actual email
      first_name: 'Barek',
      last_name: 'Egna',
      tx_ref: `test_${Date.now()}`,
      callback_url: `${appUrl}/api/webhooks/chapa`,
      return_url: `${appUrl}/test`,
      customization: {
        title: 'Test Payment',
        description: 'API connectivity test',
      },
    };

    console.log('[Chapa Test] Sending test request to:', `${baseUrl}/transaction/initialize`);

    const response = await fetch(`${baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${chapaSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPaymentRequest),
    });

    const responseText = await response.text();
    console.log('[Chapa Test] Response status:', response.status);
    console.log('[Chapa Test] Response body:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Chapa API request failed',
        config,
        response: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        },
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Chapa API is accessible and responding',
      config,
      response: {
        status: response.status,
        data: responseData,
      },
    });

  } catch (error) {
    console.error('[Chapa Test] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
