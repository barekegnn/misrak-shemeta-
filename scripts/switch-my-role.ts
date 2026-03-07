/**
 * Switch My Role Script
 * 
 * Quickly switch your user role (Telegram ID: 779028866) between
 * ADMIN, MERCHANT, RUNNER, and STUDENT for testing purposes.
 * 
 * Usage: npx tsx scripts/switch-my-role.ts <role>
 * Example: npx tsx scripts/switch-my-role.ts MERCHANT
 */

// Load environment variables
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { adminDb } from '../src/lib/firebase/admin';

const MY_TELEGRAM_ID = '779028866';
const VALID_ROLES = ['ADMIN', 'MERCHANT', 'RUNNER', 'STUDENT'] as const;
type Role = typeof VALID_ROLES[number];

async function switchMyRole(newRole: Role) {
  console.log(`========== SWITCHING ROLE FOR TELEGRAM ID: ${MY_TELEGRAM_ID} ==========\n`);

  try {
    // Find user by Telegram ID
    console.log('Step 1: Finding your user document...');
    const userQuery = await adminDb
      .collection('users')
      .where('telegramId', '==', MY_TELEGRAM_ID)
      .limit(1)
      .get();

    if (userQuery.empty) {
      console.error('❌ User not found with Telegram ID:', MY_TELEGRAM_ID);
      console.log('\nCreating new user...');
      
      const userRef = await adminDb.collection('users').add({
        telegramId: MY_TELEGRAM_ID,
        role: newRole,
        homeLocation: 'Haramaya_Main',
        languagePreference: 'en',
        phoneNumber: '+251912345678',
        suspended: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('✓ User created with role:', newRole);
      console.log('  User ID:', userRef.id);
      return;
    }

    const userDoc = userQuery.docs[0];
    const userId = userDoc.id;
    const currentRole = userDoc.data().role;

    console.log('✓ User found');
    console.log('  User ID:', userId);
    console.log('  Current Role:', currentRole);
    console.log('  New Role:', newRole);

    // Update role
    console.log('\nStep 2: Updating role...');
    await adminDb.collection('users').doc(userId).update({
      role: newRole,
      updatedAt: new Date()
    });

    console.log('✓ Role updated successfully!\n');

    // If switching to MERCHANT, check if shop exists
    if (newRole === 'MERCHANT') {
      console.log('Step 3: Checking for merchant shop...');
      const shopQuery = await adminDb
        .collection('shops')
        .where('ownerId', '==', userId)
        .limit(1)
        .get();

      if (shopQuery.empty) {
        console.log('⚠️  No shop found for this merchant');
        console.log('\nTo create a shop:');
        console.log('1. Visit: http://localhost:3000/merchant/register');
        console.log('2. Fill in shop details');
        console.log('3. Submit registration\n');
      } else {
        const shop = shopQuery.docs[0].data();
        console.log('✓ Shop found');
        console.log('  Shop ID:', shopQuery.docs[0].id);
        console.log('  Shop Name:', shop.name);
        console.log('  Shop City:', shop.city);
      }
    }

    console.log('\n========== ROLE SWITCH COMPLETE ==========\n');
    console.log('You can now access the dashboard for your new role:\n');

    switch (newRole) {
      case 'ADMIN':
        console.log('Admin Dashboard:');
        console.log('  Local: http://localhost:3000/admin');
        console.log('  Production: https://misrak-shemeta.vercel.app/admin');
        break;
      case 'MERCHANT':
        console.log('Merchant Dashboard:');
        console.log('  Local: http://localhost:3000/merchant');
        console.log('  Production: https://misrak-shemeta.vercel.app/merchant');
        break;
      case 'RUNNER':
        console.log('Runner Dashboard:');
        console.log('  Local: http://localhost:3000/runner/orders');
        console.log('  Production: https://misrak-shemeta.vercel.app/runner/orders');
        break;
      case 'STUDENT':
        console.log('Customer Dashboard:');
        console.log('  Local: http://localhost:3000/');
        console.log('  Production: https://misrak-shemeta.vercel.app/');
        break;
    }

    console.log('\n⚠️  Note: You may need to refresh your browser or clear cookies\n');

  } catch (error) {
    console.error('Error switching role:', error);
    throw error;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const requestedRole = args[0]?.toUpperCase();

if (!requestedRole) {
  console.error('❌ Error: Role argument is required\n');
  console.log('Usage: npx tsx scripts/switch-my-role.ts <role>\n');
  console.log('Valid roles:');
  VALID_ROLES.forEach(role => console.log(`  - ${role}`));
  console.log('\nExample: npx tsx scripts/switch-my-role.ts MERCHANT\n');
  process.exit(1);
}

if (!VALID_ROLES.includes(requestedRole as Role)) {
  console.error(`❌ Error: Invalid role "${requestedRole}"\n`);
  console.log('Valid roles:');
  VALID_ROLES.forEach(role => console.log(`  - ${role}`));
  console.log('\nExample: npx tsx scripts/switch-my-role.ts MERCHANT\n');
  process.exit(1);
}

// Run the role switch
switchMyRole(requestedRole as Role)
  .then(() => {
    console.log('Role switch completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Role switch failed:', error);
    process.exit(1);
  });
