/**
 * Test endpoint to check Firebase orders collection
 * Usage: GET /api/test/firebase-orders?orderId=ORDER_ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');

    console.log('[Firebase Test] Checking Firebase connection...');
    console.log('[Firebase Test] Order ID:', orderId);

    // Test 1: Check if Firebase is initialized
    console.log('[Firebase Test] Firebase admin initialized:', !!adminDb);

    // Test 2: Try to list recent orders
    console.log('[Firebase Test] Fetching recent orders...');
    const ordersSnapshot = await adminDb
      .collection('orders')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    const recentOrders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      status: doc.data().status,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || 'unknown',
    }));

    console.log('[Firebase Test] Recent orders:', recentOrders);

    // Test 3: If orderId provided, try to fetch it
    let specificOrder = null;
    if (orderId) {
      console.log('[Firebase Test] Fetching specific order:', orderId);
      const orderDoc = await adminDb.collection('orders').doc(orderId).get();
      
      if (orderDoc.exists) {
        const data = orderDoc.data();
        specificOrder = {
          id: orderDoc.id,
          exists: true,
          status: data?.status,
          userId: data?.userId,
          totalAmount: data?.totalAmount,
          deliveryFee: data?.deliveryFee,
        };
      } else {
        specificOrder = {
          id: orderId,
          exists: false,
        };
      }
      console.log('[Firebase Test] Specific order result:', specificOrder);
    }

    return NextResponse.json({
      success: true,
      firebaseInitialized: true,
      recentOrdersCount: recentOrders.length,
      recentOrders,
      specificOrder,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Firebase Test] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
