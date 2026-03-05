/**
 * Script to reseed the Firebase database
 * 
 * Usage: npx tsx scripts/reseed-database.ts
 */

const VERCEL_URL = process.env.NEXT_PUBLIC_VERCEL_URL || 'https://misrak-shemeta.vercel.app';
const SEED_TOKEN = process.env.SEED_API_TOKEN || 'dev-seed-token';

async function reseedDatabase() {
  console.log('🔄 Reseeding database...');
  console.log(`📍 Target: ${VERCEL_URL}`);

  try {
    const response = await fetch(`${VERCEL_URL}/api/admin/reseed`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SEED_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Success!');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Failed:', data);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

reseedDatabase();
