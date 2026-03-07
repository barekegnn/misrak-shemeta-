/**
 * Check My Role via API
 * 
 * Uses the running dev server to check your role
 * 
 * Usage: npx tsx scripts/check-my-role-api.ts
 */

const MY_TELEGRAM_ID = '779028866';

async function checkMyRole() {
  console.log(`========== CHECKING ROLE FOR TELEGRAM ID: ${MY_TELEGRAM_ID} ==========\n`);

  try {
    // Check if server is running
    console.log('Connecting to local server...\n');
    
    const response = await fetch('http://localhost:3000/api/test/firebase');
    
    if (!response.ok) {
      console.error('❌ Server is not responding');
      console.log('\nMake sure the dev server is running:');
      console.log('  npm run dev\n');
      process.exit(1);
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Firebase test failed');
      console.log('Error:', data.error);
      process.exit(1);
    }

    console.log('✅ Connected to server\n');
    console.log('Firebase Status:');
    console.log('─────────────────────────────────────────');
    data.logs.forEach((log: string) => console.log(log));
    console.log('─────────────────────────────────────────\n');

    // Now check specific user
    console.log(`Checking your user (Telegram ID: ${MY_TELEGRAM_ID})...\n`);
    
    // The test endpoint shows if your user exists
    const userFound = data.logs.some((log: string) => 
      log.includes('User') && log.includes('found')
    );

    if (!userFound) {
      console.log('⚠️  USER STATUS UNKNOWN\n');
      console.log('The Firebase test endpoint does not show detailed user info.');
      console.log('To check your role, you can:');
      console.log('1. Open Firebase Console: https://console.firebase.google.com/');
      console.log('2. Navigate to Firestore Database');
      console.log('3. Look for users collection');
      console.log('4. Find document with telegramId = "779028866"\n');
      console.log('Or run this to set your role to ADMIN:');
      console.log('  npx tsx scripts/switch-my-role.ts ADMIN\n');
    } else {
      console.log('✅ User data found in Firebase\n');
      console.log('To see detailed role information:');
      console.log('1. Open Firebase Console');
      console.log('2. Check the users collection');
      console.log('3. Look for your telegramId: 779028866\n');
    }

    // Check environment variable
    console.log('Environment Configuration:');
    console.log('─────────────────────────────────────────');
    const adminIdLog = data.logs.find((log: string) => log.includes('ADMIN_TELEGRAM_IDS'));
    if (adminIdLog) {
      console.log(adminIdLog);
    }
    console.log('─────────────────────────────────────────\n');

    console.log('📝 Summary:');
    console.log('─────────────────────────────────────────');
    console.log('✓ Firebase connection: Working');
    console.log('✓ Database access: Working');
    console.log(`✓ Users in database: ${data.logs.find((l: string) => l.includes('Found'))?.match(/\d+/)?.[0] || 'Unknown'}`);
    console.log('─────────────────────────────────────────\n');

    console.log('🎯 Next Steps:');
    console.log('1. To ensure you have ADMIN role, run:');
    console.log('     npx tsx scripts/switch-my-role.ts ADMIN');
    console.log('2. Then open your Telegram bot');
    console.log('3. Send /start and click "Open Marketplace"');
    console.log('4. You should see the admin dashboard!\n');

  } catch (error) {
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      console.error('❌ Cannot connect to local server\n');
      console.log('The dev server is not running.');
      console.log('Start it with: npm run dev\n');
      console.log('Then run this script again.\n');
    } else {
      console.error('Error:', error);
    }
    process.exit(1);
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
