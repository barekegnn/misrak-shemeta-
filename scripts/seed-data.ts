/**
 * Seed Data Script for Firebase Emulator
 * 
 * Creates test data for local development and testing.
 * Run with: npx ts-node scripts/seed-data.ts
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { generateProducts } from './seed-products-data';

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

    // 2. Create test shops (8 diverse categories)
    console.log('Creating shops...');
    
    const shops = [
      {
        id: 'shop_harar_electronics',
        name: 'Harar Tech Hub',
        ownerId: 'user_merchant_1',
        city: 'Harar',
        description: 'Latest electronics and gadgets for students',
        contactPhone: '+251911234567',
        balance: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'shop_harar_books',
        name: 'Harar Academic Books',
        ownerId: 'user_merchant_1',
        city: 'Harar',
        description: 'Textbooks and educational materials',
        contactPhone: '+251911234568',
        balance: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'shop_harar_fashion',
        name: 'Harar Fashion Boutique',
        ownerId: 'user_merchant_1',
        city: 'Harar',
        description: 'Trendy clothing and accessories',
        contactPhone: '+251911234569',
        balance: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'shop_harar_cosmetics',
        name: 'Harar Beauty Corner',
        ownerId: 'user_merchant_1',
        city: 'Harar',
        description: 'Cosmetics and personal care products',
        contactPhone: '+251911234570',
        balance: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'shop_diredawa_shoes',
        name: 'Dire Dawa Shoe Palace',
        ownerId: 'user_merchant_2',
        city: 'Dire_Dawa',
        description: 'Quality footwear for all occasions',
        contactPhone: '+251922345678',
        balance: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'shop_diredawa_stationery',
        name: 'Dire Dawa Office Supplies',
        ownerId: 'user_merchant_2',
        city: 'Dire_Dawa',
        description: 'Complete stationery and office supplies',
        contactPhone: '+251922345679',
        balance: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'shop_diredawa_sports',
        name: 'Dire Dawa Sports Arena',
        ownerId: 'user_merchant_2',
        city: 'Dire_Dawa',
        description: 'Sports equipment and athletic wear',
        contactPhone: '+251922345680',
        balance: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        id: 'shop_diredawa_grocery',
        name: 'Dire Dawa Campus Mart',
        ownerId: 'user_merchant_2',
        city: 'Dire_Dawa',
        description: 'Snacks, drinks, and daily essentials',
        contactPhone: '+251922345681',
        balance: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    for (const shop of shops) {
      await db.collection('shops').doc(shop.id).set(shop);
    }
    console.log(`✅ Created ${shops.length} shops\n`);

    // 3. Create test products (72 products across 8 shops - 9 per shop)
    console.log('Creating products...');
    
    const products = generateProducts();

    for (const product of products) {
      await db.collection('products').doc(product.id).set(product);
    }
    console.log(`✅ Created ${products.length} products (9 per shop)\n`);

    // 4. Create a sample cart
    console.log('Creating sample cart...');
    
    await db.collection('carts').doc('user_buyer_1').set({
      id: 'user_buyer_1',
      items: [
        { productId: 'product_1', quantity: 1 },
        { productId: 'product_11', quantity: 2 },
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
          shopId: 'shop_harar_electronics',
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
    console.log('\n📍 Shop Categories:');
    console.log('   - Harar: Electronics, Books, Fashion, Cosmetics');
    console.log('   - Dire Dawa: Shoes, Stationery, Sports, Grocery');
    console.log('\n🛍️  Each shop has 9 unique products for comprehensive testing');

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
