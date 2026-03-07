/**
 * Setup Test Users Script
 * 
 * Creates test users for all roles (ADMIN, MERCHANT, RUNNER, STUDENT)
 * to help with dashboard testing and development.
 * 
 * Usage: npx tsx scripts/setup-test-users.ts
 */

import { adminDb } from '../src/lib/firebase/admin';

interface TestUser {
  telegramId: string;
  role: 'ADMIN' | 'MERCHANT' | 'RUNNER' | 'STUDENT';
  homeLocation: string;
  languagePreference: 'en' | 'am' | 'om';
  phoneNumber?: string;
}

interface TestShop {
  name: string;
  description: string;
  ownerId: string;
  city: 'Harar' | 'Dire Dawa';
  contactPhone: string;
  balance: number;
}

async function setupTestUsers() {
  console.log('========== SETTING UP TEST USERS ==========\n');

  try {
    // Test users configuration
    const testUsers: TestUser[] = [
      {
        telegramId: '779028866',
        role: 'ADMIN',
        homeLocation: 'Haramaya_Main',
        languagePreference: 'en',
        phoneNumber: '+251912345678'
      },
      {
        telegramId: '888888888',
        role: 'MERCHANT',
        homeLocation: 'Harar_City',
        languagePreference: 'en',
        phoneNumber: '+251923456789'
      },
      {
        telegramId: '777777777',
        role: 'RUNNER',
        homeLocation: 'Haramaya_Main',
        languagePreference: 'en',
        phoneNumber: '+251934567890'
      },
      {
        telegramId: '666666666',
        role: 'STUDENT',
        homeLocation: 'Haramaya_Main',
        languagePreference: 'en',
        phoneNumber: '+251945678901'
      }
    ];

    // Create or update users
    console.log('Step 1: Creating/Updating test users...\n');
    
    const createdUsers: { [key: string]: string } = {};
    
    for (const testUser of testUsers) {
      // Check if user already exists
      const existingUserQuery = await adminDb
        .collection('users')
        .where('telegramId', '==', testUser.telegramId)
        .limit(1)
        .get();

      let userId: string;

      if (!existingUserQuery.empty) {
        // Update existing user
        const existingDoc = existingUserQuery.docs[0];
        userId = existingDoc.id;
        
        await adminDb.collection('users').doc(userId).update({
          role: testUser.role,
          homeLocation: testUser.homeLocation,
          languagePreference: testUser.languagePreference,
          phoneNumber: testUser.phoneNumber,
          suspended: false,
          updatedAt: new Date()
        });
        
        console.log(`✓ Updated existing user: ${testUser.role} (Telegram ID: ${testUser.telegramId})`);
        console.log(`  User ID: ${userId}`);
      } else {
        // Create new user
        const userRef = await adminDb.collection('users').add({
          telegramId: testUser.telegramId,
          role: testUser.role,
          homeLocation: testUser.homeLocation,
          languagePreference: testUser.languagePreference,
          phoneNumber: testUser.phoneNumber,
          suspended: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        userId = userRef.id;
        console.log(`✓ Created new user: ${testUser.role} (Telegram ID: ${testUser.telegramId})`);
        console.log(`  User ID: ${userId}`);
      }

      createdUsers[testUser.role] = userId;
      console.log('');
    }

    // Create test shop for merchant
    console.log('Step 2: Creating test shop for merchant...\n');
    
    const merchantUserId = createdUsers['MERCHANT'];
    
    // Check if merchant already has a shop
    const existingShopQuery = await adminDb
      .collection('shops')
      .where('ownerId', '==', merchantUserId)
      .limit(1)
      .get();

    if (!existingShopQuery.empty) {
      console.log('✓ Merchant already has a shop');
      console.log(`  Shop ID: ${existingShopQuery.docs[0].id}`);
      console.log(`  Shop Name: ${existingShopQuery.docs[0].data().name}`);
    } else {
      const testShop: TestShop = {
        name: 'Test Shop - Harar',
        description: 'A test shop for development and testing purposes',
        ownerId: merchantUserId,
        city: 'Harar',
        contactPhone: '+251923456789',
        balance: 0
      };

      const shopRef = await adminDb.collection('shops').add({
        ...testShop,
        suspended: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('✓ Created test shop for merchant');
      console.log(`  Shop ID: ${shopRef.id}`);
      console.log(`  Shop Name: ${testShop.name}`);
    }

    console.log('\n========== TEST USERS SETUP COMPLETE ==========\n');
    console.log('You can now test all dashboards:\n');
    console.log('1. Admin Dashboard:');
    console.log('   - Telegram ID: 779028866 (YOU)');
    console.log('   - URL: http://localhost:3000/admin\n');
    
    console.log('2. Merchant Dashboard:');
    console.log('   - Telegram ID: 888888888');
    console.log('   - URL: http://localhost:3000/merchant');
    console.log('   - Note: You need to simulate this user in Telegram context\n');
    
    console.log('3. Runner Dashboard:');
    console.log('   - Telegram ID: 777777777');
    console.log('   - URL: http://localhost:3000/runner/orders');
    console.log('   - Note: You need to simulate this user in Telegram context\n');
    
    console.log('4. Customer Dashboard:');
    console.log('   - Telegram ID: 666666666');
    console.log('   - URL: http://localhost:3000/');
    console.log('   - Note: You need to simulate this user in Telegram context\n');

    console.log('To test different roles, you can:');
    console.log('1. Update your user role in Firebase Console');
    console.log('2. Use browser dev tools to set cookies/headers');
    console.log('3. Use the Telegram Mini App with different test accounts\n');

  } catch (error) {
    console.error('Error setting up test users:', error);
    throw error;
  }
}

// Run the setup
setupTestUsers()
  .then(() => {
    console.log('Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
