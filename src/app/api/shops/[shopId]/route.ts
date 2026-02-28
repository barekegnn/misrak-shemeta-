import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

/**
 * GET /api/shops/[shopId]
 * Public endpoint to fetch shop details
 * Used for delivery fee calculation in checkout
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const { shopId } = params;

    if (!shopId) {
      return NextResponse.json(
        { error: 'Shop ID is required' },
        { status: 400 }
      );
    }

    // Fetch shop from Firestore
    const shopDoc = await adminDb.collection('shops').doc(shopId).get();

    if (!shopDoc.exists) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      );
    }

    const shopData = shopDoc.data();

    // Return shop details
    return NextResponse.json({
      id: shopDoc.id,
      name: shopData!.name,
      city: shopData!.city,
      contactPhone: shopData!.contactPhone,
    });
  } catch (error) {
    console.error('[API] Error fetching shop:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
