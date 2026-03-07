/**
 * Check My Role Script
 * 
 * Quickly check your current role in Firebase
 * 
 * Usage: npx tsx scripts/check-my-role.ts
 */

// Load environment variables
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { adminDb } from '../src/lib/firebase/admin';

const MY_TELEGRAM_ID = '779028866';

async function checkMyRole() {
  console.log(`========== CHECKING ROLE FOR TELEGRAM ID: ${MY_TELEGRAM_ID} ==========\n`);

  try {
    // Find user by Telegram ID
    console.log('Searching for your user in Firebase...\n');
    const userQuery = await adminDb
      .collection('users')
      .where('telegramId', '==', MY_TELEGRAM_ID)
      .limit(1)
      .get();

    if (userQuery.empty) {
      console.log('❌ USER NOT FOUND\n');
      console.log('You do not have a user account in Firebase yet.\n');
      console.log('What this means:');
      console.log('- You need to create a user account');
      console.log('- When you first open the Telegram Mini App, it should create one automatically');
      console.log('- Or you can run: npx tsx scripts/switch-my-role.ts ADMIN\n');
      console.log('Recommendation: Run this command to create your admin account:');
      console.log('  npx tsx scripts/switch-my-role.ts ADMIN\n');
      return;
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    console.log('✅ USER FOUND\n');
    console.log('Your User Details:');
    console.log('─────────────────────────────────────────');
    console.log(`User ID:              ${userId}`);
    console.log(`Telegram ID:          ${userData.telegramId}`);
    console.log(`Role:                 ${userData.role}`);
    console.log(`Home Location:        ${userData.homeLocation}`);
    console.log(`Language:             ${userData.languagePreference}`);
    console.log(`Phone:                ${userData.phoneNumber || 'Not set'}`);
    console.log(`Suspended:            ${userData.suspended ? 'Yes' : 'No'}`);
    console.log(`Created:              ${userData.createdAt?.toDate?.() || 'Unknown'}`);
    console.log('─────────────────────────────────────────\n');

    // Check role and provide guidance
    switch (userData.role) {
      case 'ADMIN':
        console.log('🎉 YOU ARE AN ADMIN!\n');
        console.log('You have full access to:');
        console.log('✓ Admin Dashboard');
        console.log('✓ User Management');
        console.log('✓ Shop Management');
        console.log('✓ Product Management');
        console.log('✓ Order Management');
        console.log('✓ Financial Overview');
        console.log('✓ System Monitoring\n');
        console.log('To access the admin dashboard:');
        console.log('1. Open your Telegram bot');
        console.log('2. Send /start');
        console.log('3. Click "Open Marketplace"');
        console.log('4. You will see the admin dashboard!\n');
        break;

      case 'MERCHANT':
        console.log('🏪 YOU ARE A MERCHANT\n');
        console.log('You have access to:');
        console.log('✓ Merchant Dashboard');
        console.log('✓ Product Management');
        console.log('✓ Order Processing');
        console.log('✓ Balance & Earnings\n');
        
        // Check if merchant has a shop
        console.log('Checking for your shop...');
        const shopQuery = await adminDb
          .collection('shops')
          .where('ownerId', '==', userId)
          .limit(1)
          .get();

        if (shopQuery.empty) {
          console.log('⚠️  You do not have a shop yet');
          console.log('To create a shop:');
          console.log('1. Open the Telegram Mini App');
          console.log('2. You will see a "Register Shop" page');
          console.log('3. Fill in your shop details');
          console.log('4. Submit to create your shop\n');
        } else {
          const shop = shopQuery.docs[0].data();
          console.log('✓ Shop found:');
          console.log(`  Name: ${shop.name}`);
          console.log(`  City: ${shop.city}`);
          console.log(`  Balance: ${shop.balance} ETB\n`);
        }

        console.log('To switch to ADMIN role, run:');
        console.log('  npx tsx scripts/switch-my-role.ts ADMIN\n');
        break;

      case 'RUNNER':
        console.log('🚚 YOU ARE A RUNNER\n');
        console.log('You have access to:');
        console.log('✓ Runner Dashboard');
        console.log('✓ Active Deliveries');
        console.log('✓ Delivery History');
        console.log('✓ OTP Verification\n');
        console.log('To switch to ADMIN role, run:');
        console.log('  npx tsx scripts/switch-my-role.ts ADMIN\n');
        break;

      case 'STUDENT':
        console.log('🎓 YOU ARE A STUDENT (CUSTOMER)\n');
        console.log('You have access to:');
        console.log('✓ Browse Products');
        console.log('✓ Shopping Cart');
        console.log('✓ Checkout & Payment');
        console.log('✓ Order Tracking\n');
        console.log('To switch to ADMIN role, run:');
        console.log('  npx tsx scripts/switch-my-role.ts ADMIN\n');
        break;

      default:
        console.log(`⚠️  UNKNOWN ROLE: ${userData.role}\n`);
        console.log('To set your role to ADMIN, run:');
        console.log('  npx tsx scripts/switch-my-role.ts ADMIN\n');
    }

    // Check ADMIN_TELEGRAM_IDS environment variable
    console.log('Checking environment configuration...');
    const adminIds = process.env.ADMIN_TELEGRAM_IDS;
    if (adminIds && adminIds.includes(MY_TELEGRAM_ID)) {
      console.log('✓ Your Telegram ID is in ADMIN_TELEGRAM_IDS');
      console.log('  This means middleware will grant you admin access\n');
    } else {
      console.log('⚠️  Your Telegram ID is NOT in ADMIN_TELEGRAM_IDS');
      console.log('  Current value:', adminIds || 'Not set');
      console.log('  You may not be able to access admin routes');
      console.log('  Check your .env.local file\n');
    }

  } catch (error) {
    console.error('Error checking role:', error);
    throw error;
  }
}

// Run the check
checkMyRole()
  .then(() => {
    console.log('Role check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Role check failed:', error);
    process.exit(1);
  });
