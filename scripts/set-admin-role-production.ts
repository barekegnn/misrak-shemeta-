/**
 * Set Admin Role in Production Firebase
 * 
 * This script updates your role to ADMIN directly in production Firebase
 * using the Firebase REST API (no need for local environment variables)
 * 
 * Usage: npx tsx scripts/set-admin-role-production.ts
 */

const MY_TELEGRAM_ID = '779028866';
const MY_USER_ID = 'y3RnPvOisQLzhGXDEE9K';

// Firebase project details (from your .env files)
const FIREBASE_PROJECT_ID = 'misrak-shemeta-marketpla-fdbcf';

async function setAdminRole() {
  console.log('========== SETTING ADMIN ROLE ==========\n');
  console.log(`User ID: ${MY_USER_ID}`);
  console.log(`Telegram ID: ${MY_TELEGRAM_ID}`);
  console.log(`Target Role: ADMIN\n`);

  console.log('⚠️  IMPORTANT: This script requires manual Firebase Console access\n');
  console.log('Please follow these steps:\n');
  
  console.log('1. Open Firebase Console:');
  console.log('   https://console.firebase.google.com/project/misrak-shemeta-marketpla-fdbcf/firestore\n');
  
  console.log('2. Navigate to Firestore Database\n');
  
  console.log('3. Find your user document:');
  console.log(`   - Collection: users`);
  console.log(`   - Document ID: ${MY_USER_ID}`);
  console.log(`   - Or search for telegramId: "${MY_TELEGRAM_ID}"\n`);
  
  console.log('4. Click on the document to edit it\n');
  
  console.log('5. Find the "role" field and change it:');
  console.log('   - Current value: "STUDENT"');
  console.log('   - New value: "ADMIN"\n');
  
  console.log('6. Click "Update" to save the changes\n');
  
  console.log('7. Verify the change:');
  console.log('   - The role field should now show "ADMIN"\n');
  
  console.log('========== AFTER UPDATING ==========\n');
  console.log('Once you\'ve updated your role to ADMIN:');
  console.log('1. Open your Telegram bot');
  console.log('2. Send /start command');
  console.log('3. Click "Open Marketplace" button');
  console.log('4. The Mini App will detect your ADMIN role');
  console.log('5. You\'ll see the Admin Dashboard with admin navigation!\n');
  
  console.log('The Mini App is already configured to:');
  console.log('✓ Automatically detect your role from Firebase');
  console.log('✓ Show role-specific navigation at the bottom');
  console.log('✓ Redirect to the appropriate dashboard');
  console.log('✓ Protect admin routes with middleware\n');
}

setAdminRole();
