/**
 * List all shops for a user
 * Run with: npx tsx scripts/list-user-shops.ts [telegramId]
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import('../src/lib/firebase/admin').then(async ({ adminDb }) => {
  const telegramId = process.argv[2] || '888888888';
  
  console.log(`🔍 Listing shops for user: ${telegramId}\n`);

  try {
    // Find user
    const userSnapshot = await adminDb
      .collection('users')
      .where('telegramId', '==', telegramId)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      console.log('❌ User not found');
      process.exit(1);
    }

    const userId = userSnapshot.docs[0].id;
    const userData = userSnapshot.docs[0].data();
    
    console.log('👤 User Info:');
    console.log(`   - ID: ${userId}`);
    console.log(`   - Telegram ID: ${userData.telegramId}`);
    console.log(`   - Role: ${userData.role}`);
    console.log(`   - Home Location: ${userData.homeLocation}\n`);

    // Find shops
    const shopsSnapshot = await adminDb
      .collection('shops')
      .where('ownerId', '==', userId)
      .get();

    if (shopsSnapshot.empty) {
      console.log('ℹ️  User has no shops\n');
      process.exit(0);
    }

    console.log(`🏪 Shops (${shopsSnapshot.docs.length}):\n`);

    for (const doc of shopsSnapshot.docs) {
      const shop = doc.data();
      console.log(`   📍 ${shop.name}`);
      console.log(`      - ID: ${doc.id}`);
      console.log(`      - City: ${shop.city}`);
      console.log(`      - Balance: ${shop.balance} ETB`);
      console.log(`      - Status: ${shop.suspended ? 'Suspended' : 'Active'}`);
      
      // Count products
      const productsSnapshot = await adminDb
        .collection('products')
        .where('shopId', '==', doc.id)
        .get();
      
      console.log(`      - Products: ${productsSnapshot.docs.length}`);
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
