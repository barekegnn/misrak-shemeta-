/**
 * Test Admin Access Script
 * 
 * This script verifies that admin access is properly configured
 * and helps troubleshoot any issues.
 * 
 * Run with: npx tsx scripts/test-admin-access.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('\n🔍 Testing Admin Access Configuration\n');
console.log('=' .repeat(50));

// Test 1: Check if ADMIN_TELEGRAM_IDS is set
console.log('\n1. Checking ADMIN_TELEGRAM_IDS environment variable...');
const adminIdsString = process.env.ADMIN_TELEGRAM_IDS;

if (!adminIdsString) {
  console.log('❌ ADMIN_TELEGRAM_IDS is NOT set');
  console.log('   Please add it to your .env.local file:');
  console.log('   ADMIN_TELEGRAM_IDS=123456789');
  process.exit(1);
} else {
  console.log('✅ ADMIN_TELEGRAM_IDS is set');
  
  // Parse admin IDs
  const adminIds = adminIdsString
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0);
  
  console.log(`   Found ${adminIds.length} admin ID(s):`);
  adminIds.forEach((id, index) => {
    console.log(`   ${index + 1}. ${id}`);
  });
}

// Test 2: Check Firebase configuration
console.log('\n2. Checking Firebase configuration...');
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const firebaseServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!firebaseProjectId) {
  console.log('❌ NEXT_PUBLIC_FIREBASE_PROJECT_ID is NOT set');
} else {
  console.log(`✅ Firebase Project ID: ${firebaseProjectId}`);
}

if (!firebaseServiceAccount) {
  console.log('❌ FIREBASE_SERVICE_ACCOUNT_KEY is NOT set');
} else {
  console.log('✅ Firebase Service Account Key is set');
}

// Test 3: Check if emulator is configured
console.log('\n3. Checking Firebase Emulator configuration...');
const firestoreEmulator = process.env.FIRESTORE_EMULATOR_HOST;
const authEmulator = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const storageEmulator = process.env.FIREBASE_STORAGE_EMULATOR_HOST;

if (firestoreEmulator) {
  console.log(`✅ Firestore Emulator: ${firestoreEmulator}`);
} else {
  console.log('⚠️  Firestore Emulator not configured (using production)');
}

if (authEmulator) {
  console.log(`✅ Auth Emulator: ${authEmulator}`);
} else {
  console.log('⚠️  Auth Emulator not configured (using production)');
}

if (storageEmulator) {
  console.log(`✅ Storage Emulator: ${storageEmulator}`);
} else {
  console.log('⚠️  Storage Emulator not configured (using production)');
}

// Test 4: Check Node environment
console.log('\n4. Checking Node environment...');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set (defaults to development)'}`);

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n✨ Configuration Summary:\n');

if (adminIdsString && firebaseProjectId && firebaseServiceAccount) {
  console.log('✅ All required configuration is present!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Make sure your dev server is running: npm run dev');
  console.log('   2. If using emulator, start it: npm run emulator');
  console.log('   3. Navigate to: http://localhost:3000/admin');
  console.log('\n   The admin dashboard should now be accessible!');
} else {
  console.log('❌ Some configuration is missing. Please check the errors above.');
}

console.log('\n' + '='.repeat(50) + '\n');
