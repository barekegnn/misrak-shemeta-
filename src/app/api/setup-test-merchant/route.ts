import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    console.log('Setting up test merchant user...');

    const telegramId = '888888888';
    
    // Check if user already exists
    const existingUserQuery = await adminDb
      .collection('users')
      .where('telegramId', '==', telegramId)
      .limit(1)
      .get();

    let userId: string;

    if (!existingUserQuery.empty) {
      // Update existing user
      const existingDoc = existingUserQuery.docs[0];
      userId = existingDoc.id;
      
      await adminDb.collection('users').doc(userId).update({
        role: 'MERCHANT',
        homeLocation: 'Harar_City',
        languagePreference: 'en',
        phoneNumber: '+251923456789',
        suspended: false,
        updatedAt: new Date()
      });
      
      console.log(`Updated existing user: ${userId}`);
    } else {
      // Create new user
      const userRef = await adminDb.collection('users').add({
        telegramId: telegramId,
        role: 'MERCHANT',
        homeLocation: 'Harar_City',
        languagePreference: 'en',
        phoneNumber: '+251923456789',
        suspended: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      userId = userRef.id;
      console.log(`Created new user: ${userId}`);
    }

    // Check if merchant already has a shop
    const existingShopQuery = await adminDb
      .collection('shops')
      .where('ownerId', '==', userId)
      .limit(1)
      .get();

    let shopId: string;

    if (!existingShopQuery.empty) {
      shopId = existingShopQuery.docs[0].id;
      console.log(`Merchant already has shop: ${shopId}`);
    } else {
      const shopRef = await adminDb.collection('shops').add({
        name: 'Test Merchant Shop',
        description: 'A test shop for development',
        ownerId: userId,
        ownerName: 'Test Merchant',
        city: 'HARAR',
        tier: 'premium',
        contactPhone: '+251923456789',
        balance: 0,
        suspended: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      shopId = shopRef.id;
      console.log(`Created new shop: ${shopId}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        userId,
        shopId,
        telegramId
      }
    });

  } catch (error) {
    console.error('Error setting up test merchant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to setup test merchant' },
      { status: 500 }
    );
  }
}