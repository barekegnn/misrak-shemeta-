import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

/**
 * Test Firebase connection
 * GET /api/test/firebase
 */
export async function GET() {
  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  try {
    log('========== FIREBASE CONNECTION TEST ==========');
    
    // Test 1: Environment variables
    log('\n[Test 1] Environment Variables:');
    log(`- FIREBASE_SERVICE_ACCOUNT_KEY exists: ${!!process.env.FIREBASE_SERVICE_ACCOUNT_KEY}`);
    log(`- NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
    log(`- CHAPA_SECRET_KEY exists: ${!!process.env.CHAPA_SECRET_KEY}`);
    log(`- CHAPA_MODE: ${process.env.CHAPA_MODE}`);

    // Test 2: Firestore read
    log('\n[Test 2] Testing Firestore read...');
    const usersSnapshot = await adminDb.collection('users').limit(1).get();
    log(`✓ Users collection accessible. Found ${usersSnapshot.size} user(s)`);

    // Test 3: Orders collection
    log('\n[Test 3] Testing orders collection...');
    const ordersSnapshot = await adminDb.collection('orders').limit(5).get();
    log(`✓ Orders collection accessible. Found ${ordersSnapshot.size} order(s)`);
    
    if (!ordersSnapshot.empty) {
      ordersSnapshot.docs.forEach((doc, idx) => {
        const data = doc.data();
        log(`  Order ${idx + 1}: ${doc.id} - Status: ${data.status}, Total: ${data.totalAmount} ETB`);
      });
    }

    // Test 4: Specific order
    log('\n[Test 4] Testing specific order lookup...');
    const orderId = '12mFgkTPoOYILVhquRzy';
    const orderDoc = await adminDb.collection('orders').doc(orderId).get();
    
    if (orderDoc.exists) {
      const data = orderDoc.data();
      log(`✓ Order ${orderId} found`);
      log(`  Status: ${data!.status}`);
      log(`  User ID: ${data!.userId}`);
      log(`  Total: ${data!.totalAmount} ETB`);
      log(`  Delivery Fee: ${data!.deliveryFee} ETB`);
    } else {
      log(`✗ Order ${orderId} NOT FOUND`);
    }

    log('\n========== TEST PASSED ==========');

    return NextResponse.json({
      success: true,
      message: 'Firebase connection test passed',
      logs
    });

  } catch (error) {
    log('\n========== TEST FAILED ==========');
    log(`Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    if (error instanceof Error && error.stack) {
      log(`Stack: ${error.stack}`);
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      logs
    }, { status: 500 });
  }
}
