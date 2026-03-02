#!/usr/bin/env node

/**
 * Firebase Configuration Verification Script
 * 
 * This script verifies your Firebase configuration is correct
 * and helps identify any issues before deployment.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Firebase Configuration Verification\n');
console.log('=' .repeat(50));

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

console.log('\n📁 Environment Files:');
console.log(`  .env.local: ${envExists ? '✅ Found' : '❌ Not found'}`);

if (!envExists) {
  console.log('\n❌ ERROR: .env.local file not found!');
  console.log('   Create it by copying .env.local.example');
  process.exit(1);
}

// Read .env.local
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// Check for emulator configuration
const isEmulatorMode = !!(
  envVars.FIRESTORE_EMULATOR_HOST ||
  envVars.FIREBASE_AUTH_EMULATOR_HOST ||
  envVars.FIREBASE_STORAGE_EMULATOR_HOST
);

console.log('\n🔧 Configuration Mode:');
console.log(`  Mode: ${isEmulatorMode ? '🧪 Emulator (Development)' : '🚀 Production'}`);

// Required environment variables
const requiredVars = {
  client: [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ],
  admin: [
    'FIREBASE_SERVICE_ACCOUNT_KEY',
  ],
  emulator: [
    'FIRESTORE_EMULATOR_HOST',
    'FIREBASE_AUTH_EMULATOR_HOST',
    'FIREBASE_STORAGE_EMULATOR_HOST',
  ],
  payment: [
    'CHAPA_SECRET_KEY',
    'CHAPA_WEBHOOK_SECRET',
    'NEXT_PUBLIC_CHAPA_MODE',
  ],
  app: [
    'NEXT_PUBLIC_APP_URL',
  ],
};

console.log('\n📋 Required Variables:');

// Check client variables
console.log('\n  Firebase Client (Public):');
requiredVars.client.forEach(varName => {
  const exists = !!envVars[varName];
  const isDemoValue = envVars[varName]?.includes('demo') || envVars[varName]?.includes('your_');
  console.log(`    ${varName}: ${exists ? (isDemoValue ? '⚠️  Demo value' : '✅ Set') : '❌ Missing'}`);
});

// Check admin variables
console.log('\n  Firebase Admin (Server-side):');
requiredVars.admin.forEach(varName => {
  const exists = !!envVars[varName];
  const value = envVars[varName];
  let status = '❌ Missing';
  
  if (exists) {
    try {
      const parsed = JSON.parse(value.replace(/^'|'$/g, ''));
      const isDemoValue = parsed.project_id?.includes('demo');
      status = isDemoValue ? '⚠️  Demo value' : '✅ Set';
    } catch (e) {
      status = '❌ Invalid JSON';
    }
  }
  
  console.log(`    ${varName}: ${status}`);
});

// Check emulator variables
if (isEmulatorMode) {
  console.log('\n  Firebase Emulator:');
  requiredVars.emulator.forEach(varName => {
    const exists = !!envVars[varName];
    console.log(`    ${varName}: ${exists ? '✅ Set' : '❌ Missing'}`);
  });
}

// Check payment variables
console.log('\n  Chapa Payment:');
requiredVars.payment.forEach(varName => {
  const exists = !!envVars[varName];
  const isDemoValue = envVars[varName]?.includes('demo') || envVars[varName]?.includes('your_');
  const isSandbox = varName === 'NEXT_PUBLIC_CHAPA_MODE' && envVars[varName] === 'sandbox';
  console.log(`    ${varName}: ${exists ? (isDemoValue || isSandbox ? '⚠️  Test/Demo value' : '✅ Set') : '❌ Missing'}`);
});

// Check app variables
console.log('\n  Application:');
requiredVars.app.forEach(varName => {
  const exists = !!envVars[varName];
  const isLocalhost = envVars[varName]?.includes('localhost');
  console.log(`    ${varName}: ${exists ? (isLocalhost ? '⚠️  Localhost' : '✅ Set') : '❌ Missing'}`);
});

// Check Firebase config files
console.log('\n📄 Firebase Configuration Files:');
const firebaseFiles = [
  'firebase.json',
  '.firebaserc',
  'firestore.rules',
  'firestore.indexes.json',
];

firebaseFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);
  console.log(`  ${file}: ${exists ? '✅ Found' : '❌ Not found'}`);
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Summary:');

if (isEmulatorMode) {
  console.log('\n✅ Emulator Mode Configuration:');
  console.log('   - Using Firebase Emulator for local development');
  console.log('   - Demo credentials are acceptable');
  console.log('   - Start emulators: firebase emulators:start');
  console.log('\n⚠️  Before Production Deployment:');
  console.log('   1. Create a real Firebase project');
  console.log('   2. Update environment variables with production values');
  console.log('   3. Remove emulator host variables');
  console.log('   4. Deploy security rules and indexes');
  console.log('\n📖 See FIREBASE_SETUP_GUIDE.md for detailed instructions');
} else {
  console.log('\n🚀 Production Mode Configuration:');
  
  const hasDemoValues = Object.entries(envVars).some(([key, value]) => 
    value?.includes('demo') || value?.includes('your_')
  );
  
  if (hasDemoValues) {
    console.log('\n❌ WARNING: Demo/placeholder values detected!');
    console.log('   Replace all demo values with real production credentials');
    console.log('   before deploying to production.');
  } else {
    console.log('\n✅ Configuration looks good for production!');
    console.log('   Make sure to:');
    console.log('   1. Test thoroughly before deployment');
    console.log('   2. Deploy Firestore rules and indexes');
    console.log('   3. Set up monitoring and alerts');
  }
}

console.log('\n' + '='.repeat(50));
console.log('\n✨ Verification complete!\n');
