/**
 * Seed Data Script for Firebase Emulator
 * 
 * Creates test data for local development and testing.
 * Run with: npx ts-node scripts/seed-data.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin (for emulator)
const app = initializeApp({
  projectId: 'demo-misrak-shemeta',
});

const db = getFirestore(app);

// Use emulator
if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log('✅ Using Firestore Emulator:', process.env.FIRESTORE_EMULATOR_HOST);
} else {
  console.log('⚠️  FIRESTORE_EMULATOR_HOST not set. Set it to 127.0.0.1:8080');
  process.exit(1);
}

async function seedData() {
  console.log('🌱 Starting seed data creation...\n');

  try {
    // 1. Create test users
    console.log('Creating users...');
    
    const users = [
      {
        id: 'user_buyer_1',
        telegramId: '123456789',
        role: 'STUDENT',
        homeLocation: 'Haramaya_Main',
        languagePreference: 'en',
        phoneNumber: '+251912345678',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'user_buyer_2',
        telegramId: '987654321',
        role: 'STUDENT',
        homeLocation: 'Harar_Campus',
        languagePreference: 'am',
        phoneNumber: '+251923456789',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'user_merchant_1',
        telegramId: '111222333',
        role: 'MERCHANT',
        homeLocation: 'Harar_City',
        languagePreference: 'en',
        phoneNumber: '+251934567890',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'user_merchant_2',
        telegramId: '444555666',
        role: 'MERCHANT',
        homeLocation: 'Dire_Dawa_City',
        languagePreference: 'om',
        phoneNumber: '+251945678901',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'user_runner_1',
        telegramId: '777888999',
        role: 'RUNNER',
        homeLocation: 'Harar_City',
        languagePreference: 'en',
        phoneNumber: '+251956789012',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    for (const user of users) {
      await db.collection('users').doc(user.id).set(user);
    }
    console.log(`✅ Created ${users.length} users\n`);

    // 2. Create test shops
    console.log('Creating shops...');
    
    const shops = [
      {
        id: 'shop_harar_1',
        name: 'Harar Electronics',
        ownerId: 'user_merchant_1',
        city: 'Harar',
        contactPhone: '+251934567890',
        balance: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'shop_diredawa_1',
        name: 'Dire Dawa Books & Stationery',
        ownerId: 'user_merchant_2',
        city: 'Dire_Dawa',
        contactPhone: '+251945678901',
        balance: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    for (const shop of shops) {
      await db.collection('shops').doc(shop.id).set(shop);
    }
    console.log(`✅ Created ${shops.length} shops\n`);

    // 3. Create test products
    console.log('Creating products...');
    
    const products = [
      // Harar Electronics products
      {
        id: 'product_1',
        shopId: 'shop_harar_1',
        name: 'Wireless Headphones',
        description: 'High-quality Bluetooth headphones with noise cancellation',
        price: 1500,
        category: 'Electronics',
        images: ['https://via.placeholder.com/400x400?text=Headphones'],
        stock: 10,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'product_2',
        shopId: 'shop_harar_1',
        name: 'USB-C Cable',
        description: 'Fast charging USB-C cable, 2 meters',
        price: 150,
        category: 'Electronics',
        images: ['https://via.placeholder.com/400x400?text=USB-C+Cable'],
        stock: 50,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'product_3',
        shopId: 'shop_harar_1',
        name: 'Power Bank 20000mAh',
        description: 'High capacity power bank with dual USB ports',
        price: 800,
        category: 'Electronics',
        images: ['https://via.placeholder.com/400x400?text=Power+Bank'],
        stock: 15,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      // Dire Dawa Books products
      {
        id: 'product_4',
        shopId: 'shop_diredawa_1',
        name: 'Engineering Mathematics Textbook',
        description: 'Complete guide for engineering students',
        price: 450,
        category: 'Books',
        images: ['https://via.placeholder.com/400x400?text=Math+Book'],
        stock: 20,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'product_5',
        shopId: 'shop_diredawa_1',
        name: 'Notebook Set (5 pieces)',
        description: 'High-quality notebooks for students',
        price: 200,
        category: 'Stationery',
        images: ['https://via.placeholder.com/400x400?text=Notebooks'],
        stock: 100,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'product_6',
        shopId: 'shop_diredawa_1',
        name: 'Scientific Calculator',
        description: 'Advanced scientific calculator for engineering',
        price: 350,
        category: 'Electronics',
        images: ['https://via.placeholder.com/400x400?text=Calculator'],
        stock: 30,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    for (const product of products) {
      await db.collection('products').doc(product.id).set(product);
    }
    console.log(`✅ Created ${products.length} products\n`);

    // 4. Create a sample cart
    console.log('Creating sample cart...');
    
    await db.collection('carts').doc('user_buyer_1').set({
      id: 'user_buyer_1',
      items: [
        { productId: 'product_1', quantity: 1 },
        { productId: 'product_4', quantity: 2 },
      ],
      updatedAt: Timestamp.now(),
    });
    console.log('✅ Created sample cart\n');

    // 5. Create a sample order
    console.log('Creating sample order...');
    
    await db.collection('orders').doc('order_1').set({
      id: 'order_1',
      userId: 'user_buyer_1',
      items: [
        {
          productId: 'product_1',
          shopId: 'shop_harar_1',
          productName: 'Wireless Headphones',
          quantity: 1,
          priceAtPurchase: 1500,
          shopCity: 'Harar',
        },
      ],
      totalAmount: 1500,
      deliveryFee: 100,
      status: 'PENDING',
      userHomeLocation: 'Haramaya_Main',
      otpCode: '123456',
      otpAttempts: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      statusHistory: [
        {
          from: null,
          to: 'PENDING',
          timestamp: Timestamp.now(),
          actor: 'user_buyer_1',
        },
      ],
    });
    console.log('✅ Created sample order\n');

    console.log('🎉 Seed data creation completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${users.length} users`);
    console.log(`   - ${shops.length} shops`);
    console.log(`   - ${products.length} products`);
    console.log(`   - 1 cart`);
    console.log(`   - 1 order`);
    console.log('\n✨ You can now test the application with this data!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seed function
seedData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
