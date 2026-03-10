/**
 * Delete the test shop for user 888888888
 * Run with: npx tsx scripts/delete-test-shop.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import('../src/lib/firebase/admin').then(async ({ adminDb }) => {
  console.log('🗑️  Deleting test shop...\n');

  try {
    const telegramId = '888888888';

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
    console.log(`✅ Found user: ${userId}`);

    // Find shop
    const shopSnapshot = await adminDb
      .collection('shops')
      .where('ownerId', '==', userId)
      .limit(1)
      .get();

    if (shopSnapshot.empty) {
      console.log('ℹ️  User does not have a shop');
      process.exit(0);
    }

    const shopId = shopSnapshot.docs[0].id;
    const shopData = shopSnapshot.docs[0].data();
    console.log(`✅ Found shop: ${shopId} (${shopData.name})`);

    // Delete all products for this shop
    console.log('\n📦 Deleting shop products...');
    const productsSnapshot = await adminDb
      .collection('products')
      .where('shopId', '==', shopId)
      .get();

    if (productsSnapshot.empty) {
      console.log('   ℹ️  No products to delete');
    } else {
      const batch = adminDb.batch();
      productsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`   ✅ Deleted ${productsSnapshot.docs.length} products`);
    }

    // Delete shop
    console.log('\n🏪 Deleting shop...');
    await adminDb.collection('shops').doc(shopId).delete();
    console.log('   ✅ Shop deleted');

    // Update user role back to STUDENT
    console.log('\n👤 Updating user role...');
    await adminDb.collection('users').doc(userId).update({
      role: 'STUDENT',
      updatedAt: new Date()
    });
    console.log('   ✅ User role updated to STUDENT');

    console.log('\n✅ Test shop deleted successfully!');
    console.log('\n💡 You can now test shop registration at:');
    console.log('   http://localhost:3000/merchant/register\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
