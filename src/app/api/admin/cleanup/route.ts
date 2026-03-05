/**
 * API Endpoint: POST /api/admin/cleanup
 * 
 * Cleans up all shops and products from the database.
 * This endpoint is for development/testing purposes only.
 */

import { adminDb } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check for authorization header (simple protection)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.SEED_API_TOKEN || 'dev-seed-token';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🧹 Starting database cleanup...');

    // Delete all products
    const productsSnapshot = await adminDb.collection('products').get();
    const productDeletePromises = productsSnapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(productDeletePromises);
    console.log(`✓ Deleted ${productsSnapshot.size} products`);

    // Delete all shops
    const shopsSnapshot = await adminDb.collection('shops').get();
    const shopDeletePromises = shopsSnapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(shopDeletePromises);
    console.log(`✓ Deleted ${shopsSnapshot.size} shops`);

    console.log('🎉 Database cleanup completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Database cleaned up successfully',
      summary: {
        productsDeleted: productsSnapshot.size,
        shopsDeleted: shopsSnapshot.size,
      },
    });
  } catch (error) {
    console.error('❌ Error cleaning up database:', error);
    return NextResponse.json(
      { error: 'Failed to clean up database', details: String(error) },
      { status: 500 }
    );
  }
}
