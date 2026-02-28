/**
 * Clear Firestore Emulator and Re-seed Data
 * 
 * This script clears all data from the Firestore emulator and then re-seeds it.
 * Run with: npx tsx scripts/clear-and-seed.ts
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (for emulator)
const app = initializeApp({
  projectId: 'demo-misrak-shemeta',
});

const db = getFirestore(app);

// Use emulator
if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log('✅ Using Firestore Emulator:', process.env.FIRESTORE_EMULATOR_HOST);
} else {
  console.log('⚠️  FIRESTORE_EMULATOR_HOST not set. Set it to 127.0.0.1:8080');
  process.exit(1);
}

async function clearCollection(collectionName: string) {
  const snapshot = await db.collection(collectionName).get();
  const batchSize = 500;
  
  if (snapshot.size === 0) {
    return 0;
  }

  let deletedCount = 0;
  const batches = [];
  
  for (let i = 0; i < snapshot.docs.length; i += batchSize) {
    const batch = db.batch();
    const docs = snapshot.docs.slice(i, i + batchSize);
    
    docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    batches.push(batch.commit());
    deletedCount += docs.length;
  }
  
  await Promise.all(batches);
  return deletedCount;
}

async function clearAllData() {
  console.log('🗑️  Clearing all Firestore data...\n');

  try {
    const collections = ['users', 'shops', 'products', 'carts', 'orders', 'shopTransactions'];
    
    for (const collection of collections) {
      const count = await clearCollection(collection);
      console.log(`✅ Cleared ${count} documents from ${collection}`);
    }
    
    console.log('\n✨ All data cleared successfully!\n');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
}

// Run the clear function
clearAllData()
  .then(() => {
    console.log('🌱 Now run: npx tsx scripts/seed-data.ts');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
