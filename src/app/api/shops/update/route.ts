/**
 * API Route for updating shop information
 * This should be converted to a Server Action in production
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyTelegramUser } from '@/lib/auth/telegram';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, shopId, updates } = body;

    // Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Verify shop ownership
    const shopDoc = await adminDb.collection('shops').doc(shopId).get();
    
    if (!shopDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'SHOP_NOT_FOUND' },
        { status: 404 }
      );
    }

    const shopData = shopDoc.data();
    if (shopData?.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED' },
        { status: 403 }
      );
    }

    // Update shop
    await adminDb.collection('shops').doc(shopId).update({
      ...updates,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating shop:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
