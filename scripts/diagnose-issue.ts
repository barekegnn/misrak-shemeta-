/**
 * Diagnostic script to check the current state of the system
 * Run with: npx tsx scripts/diagnose-issue.ts
 */

// Load environment variables FIRST before any imports
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

// Now import Firebase admin (after env vars are loaded)
import('../src/lib/firebase/admin').then(async ({ adminDb, adminStorage }) => {
  await diagnose(adminDb, adminStorage);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

async function diagnose(adminDb: any, adminStorage: any) {
  console.log('🔍 Running diagnostic checks...\n');

  try {
    // Check 1: Firebase connection
    console.log('1️⃣ Checking Firebase connection...');
    const testDoc = await adminDb.collection('_test').doc('connection').get();
    console.log('   ✅ Firestore connection: OK\n');

    // Check 2: Storage bucket
    console.log('2️⃣ Checking Firebase Storage...');
    const bucket = adminStorage.bucket();
    console.log(`   📦 Bucket name: ${bucket.name}`);
    const [files] = await bucket.getFiles({ maxResults: 1 });
    console.log('   ✅ Storage connection: OK\n');

    // Check 3: Test user (888888888)
    console.log('3️⃣ Checking test user (888888888)...');
    const userSnapshot = await adminDb
      .collection('users')
      .where('telegramId', '==', '888888888')
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      console.log('   ❌ Test user NOT FOUND');
      console.log('   💡 Run: npx tsx scripts/setup-test-users.ts\n');
    } else {
      const userData = userSnapshot.docs[0].data();
      console.log('   ✅ Test user found:');
      console.log(`      - ID: ${userSnapshot.docs[0].id}`);
      console.log(`      - Role: ${userData.role}`);
      console.log(`      - Home Location: ${userData.homeLocation}\n`);

      // Check 4: Does user have a shop?
      console.log('4️⃣ Checking if test user has a shop...');
      const shopSnapshot = await adminDb
        .collection('shops')
        .where('ownerId', '==', userSnapshot.docs[0].id)
        .limit(1)
        .get();

      if (shopSnapshot.empty) {
        console.log('   ℹ️  Test user does NOT have a shop');
        console.log('   💡 This is expected for testing shop registration\n');
      } else {
        const shopData = shopSnapshot.docs[0].data();
        console.log('   ✅ Test user has a shop:');
        console.log(`      - Shop ID: ${shopSnapshot.docs[0].id}`);
        console.log(`      - Shop Name: ${shopData.name}`);
        console.log(`      - City: ${shopData.city}`);
        console.log(`      - Balance: ${shopData.balance} ETB\n`);

        // Check 5: Does shop have products?
        console.log('5️⃣ Checking shop products...');
        const productsSnapshot = await adminDb
          .collection('products')
          .where('shopId', '==', shopSnapshot.docs[0].id)
          .get();

        console.log(`   📦 Shop has ${productsSnapshot.docs.length} products\n`);
      }
    }

    // Check 6: Environment variables
    console.log('6️⃣ Checking environment variables...');
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'FIREBASE_SERVICE_ACCOUNT_KEY',
    ];

    let allEnvVarsPresent = true;
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`   ✅ ${envVar}: Set`);
      } else {
        console.log(`   ❌ ${envVar}: NOT SET`);
        allEnvVarsPresent = false;
      }
    }

    if (!allEnvVarsPresent) {
      console.log('\n   ⚠️  Some environment variables are missing!');
      console.log('   💡 Check your .env.local file\n');
    } else {
      console.log('   ✅ All required environment variables are set\n');
    }

    // Check 7: Storage bucket format
    console.log('7️⃣ Checking storage bucket format...');
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (storageBucket) {
      console.log(`   📦 Storage bucket: ${storageBucket}`);
      if (storageBucket.includes('.firebasestorage.app')) {
        console.log('   ℹ️  Using new Firebase Storage format (.firebasestorage.app)');
      } else if (storageBucket.includes('.appspot.com')) {
        console.log('   ℹ️  Using legacy Firebase Storage format (.appspot.com)');
      }
      console.log('   ✅ Storage bucket format: OK\n');
    }

    console.log('✅ Diagnostic complete!\n');
    console.log('📋 Summary:');
    console.log('   - Firebase connection: Working');
    console.log('   - Storage connection: Working');
    console.log('   - Test user: ' + (userSnapshot.empty ? 'NOT FOUND' : 'Found'));
    console.log('   - Environment variables: ' + (allEnvVarsPresent ? 'OK' : 'MISSING'));
    console.log('\n💡 Next steps:');
    console.log('   1. Open http://localhost:3000/merchant/register in your browser');
    console.log('   2. Open browser console (F12)');
    console.log('   3. Try to register a shop');
    console.log('   4. Copy ALL console logs and share them');
    console.log('\n📖 See TESTING_GUIDE.md for detailed instructions\n');

  } catch (error) {
    console.error('\n❌ Diagnostic failed with error:');
    console.error(error);
    console.error('\n💡 This error indicates a configuration issue.');
    console.error('   Check your .env.local file and Firebase setup.\n');
  }
}
