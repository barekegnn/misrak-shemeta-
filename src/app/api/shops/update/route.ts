import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyTelegramUser } from '@/lib/auth/telegram';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegramId, shopId, updates } = body;

    if (!telegramId || !shopId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is a merchant
    if (user.role !== 'MERCHANT') {
      return NextResponse.json(
        { success: false, error: 'Only merchants can update shops' },
        { status: 403 }
      );
    }

    // Get shop and verify ownership
    const shopDoc = await adminDb.collection('shops').doc(shopId).get();
    if (!shopDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }

    const shopData = shopDoc.data();
    if (shopData?.ownerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only update your own shop' },
        { status: 403 }
      );
    }

    // Validate updates
    if (updates.name && updates.name.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Shop name is too long' },
        { status: 400 }
      );
    }

    if (updates.specificLocation && updates.specificLocation.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Specific location is too long' },
        { status: 400 }
      );
    }

    if (updates.contactPhone) {
      const phoneRegex = /^(\+251|0)?[79]\d{8}$/;
      if (!phoneRegex.test(updates.contactPhone.replace(/\s/g, ''))) {
        return NextResponse.json(
          { success: false, error: 'Invalid phone format' },
          { status: 400 }
        );
      }
    }

    // Update shop
    await adminDb.collection('shops').doc(shopId).update({
      ...updates,
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating shop:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}