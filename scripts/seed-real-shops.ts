/**
 * Seed Real Shops with Product Images
 * 
 * This script:
 * 1. Clears all existing shops and products
 * 2. Reads product images from seed-images folder
 * 3. Uploads images to Firebase Storage
 * 4. Creates shops and products in Firestore
 * 
 * Run with: npx tsx scripts/seed-real-shops.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env.production.local' });

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin from environment variable
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_KEY not found in environment!');
  console.log('Please ensure .env.local or .env.production.local contains the key.');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountKey);
} catch (parseError) {
  // Try fixing escaped newlines
  try {
    const fixedKey = serviceAccountKey.replace(/\\n/g, '\n');
    serviceAccount = JSON.parse(fixedKey);
  } catch (secondError) {
    console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY');
    process.exit(1);
  }
}

const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`,
});

const db = getFirestore(app);
const storage = getStorage(app).bucket();

// Shop configurations - 3 from Harar, 3 from Dire Dawa
const SHOPS = [
  // HARAR SHOPS (3)
  {
    folder: 'electronics shop',
    name: 'Harar Electronics Shop',
    description: 'Premium electronics and gadgets for students',
    city: 'HARAR' as const,
    category: 'Electronics',
    tier: 'premium' as const,
    products: [
      { name: 'Wireless Headphones', description: 'Premium Bluetooth headphones with noise cancellation', price: 1500, stock: 15 },
      { name: 'USB-C Cable 2m', description: 'Fast charging USB-C cable, durable braided design', price: 150, stock: 50 },
      { name: 'Power Bank 20000mAh', description: 'High capacity power bank with dual USB ports', price: 800, stock: 20 },
      { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with long battery life', price: 450, stock: 25 },
      { name: 'Phone Stand', description: 'Adjustable aluminum phone stand for desk', price: 200, stock: 30 },
      { name: 'Laptop Cooling Pad', description: 'USB powered cooling pad with dual fans', price: 600, stock: 12 },
      { name: 'Webcam HD 1080p', description: 'High definition webcam for online classes', price: 1200, stock: 8 },
      { name: 'USB Hub 4-Port', description: '4-port USB 3.0 hub for laptops', price: 350, stock: 18 },
      { name: 'Bluetooth Speaker', description: 'Portable Bluetooth speaker with bass boost', price: 900, stock: 10 },
    ],
  },
  {
    folder: 'cosmotics shop',
    name: 'Harar Cosmetics Shop',
    description: 'Luxury cosmetics and beauty products for students',
    city: 'HARAR' as const,
    category: 'Cosmetics',
    tier: 'luxury' as const,
    products: [
      { name: 'Face Moisturizer', description: 'Hydrating face moisturizer for all skin types', price: 350, stock: 25 },
      { name: 'Sunscreen SPF 50', description: 'Broad spectrum sun protection', price: 400, stock: 20 },
      { name: 'Lip Balm Set', description: 'Set of 3 nourishing lip balms', price: 150, stock: 40 },
      { name: 'Shampoo & Conditioner', description: 'Hair care combo pack', price: 450, stock: 30 },
      { name: 'Body Lotion', description: 'Moisturizing body lotion, 400ml', price: 300, stock: 28 },
      { name: 'Face Wash', description: 'Gentle face wash for daily use', price: 250, stock: 35 },
      { name: 'Deodorant Spray', description: 'Long-lasting deodorant spray', price: 200, stock: 45 },
      { name: 'Hair Oil', description: 'Natural hair oil for shine and strength', price: 280, stock: 22 },
      { name: 'Hand Cream', description: 'Intensive hand cream, 100ml', price: 180, stock: 38 },
      { name: 'Perfume', description: 'Fresh floral fragrance', price: 600, stock: 15 },
      { name: 'Makeup Remover', description: 'Gentle makeup remover wipes', price: 220, stock: 32 },
      { name: 'Face Mask Pack', description: 'Hydrating sheet masks, 5 pack', price: 320, stock: 24 },
      { name: 'Nail Polish Set', description: 'Set of 6 vibrant nail polish colors', price: 280, stock: 20 },
      { name: 'Body Spray', description: 'Refreshing body spray', price: 250, stock: 30 },
      { name: 'Hair Gel', description: 'Strong hold hair styling gel', price: 180, stock: 26 },
      { name: 'Facial Serum', description: 'Anti-aging facial serum', price: 550, stock: 12 },
    ],
  },
  {
    folder: 'eye glass for students shop',
    name: 'Harar Eye Glass For Students Shop',
    description: 'Stylish eyeglasses and sunglasses for students',
    city: 'HARAR' as const,
    category: 'Accessories',
    tier: 'standard' as const,
    products: [
      { name: 'Classic Reading Glasses', description: 'Comfortable reading glasses with anti-glare coating', price: 450, stock: 20 },
      { name: 'Blue Light Blocking Glasses', description: 'Protect your eyes from screen strain', price: 550, stock: 18 },
      { name: 'Aviator Sunglasses', description: 'Classic aviator style with UV protection', price: 600, stock: 15 },
      { name: 'Round Frame Glasses', description: 'Trendy round frame for fashion-forward students', price: 500, stock: 22 },
      { name: 'Sport Sunglasses', description: 'Wraparound sports sunglasses for outdoor activities', price: 650, stock: 12 },
      { name: 'Cat Eye Glasses', description: 'Stylish cat eye frame for women', price: 520, stock: 16 },
      { name: 'Wayfarer Sunglasses', description: 'Iconic wayfarer style sunglasses', price: 580, stock: 14 },
      { name: 'Rectangle Frame Glasses', description: 'Professional rectangle frame for students', price: 480, stock: 20 },
      { name: 'Polarized Sunglasses', description: 'Polarized lenses for glare reduction', price: 700, stock: 10 },
      { name: 'Oversized Sunglasses', description: 'Fashion oversized sunglasses', price: 620, stock: 13 },
    ],
  },
  // DIRE DAWA SHOPS (3)
  {
    folder: "men's shoes shop",
    name: "Dire Dawa Men's Shoes Shop",
    description: "Quality men's footwear for every occasion",
    city: 'DIRE_DAWA' as const,
    category: 'Footwear',
    tier: 'premium' as const,
    products: [
      { name: 'Casual Sneakers', description: 'Comfortable sneakers for everyday wear', price: 900, stock: 25 },
      { name: 'Running Shoes', description: 'Lightweight running shoes with cushioning', price: 1200, stock: 18 },
      { name: 'Formal Leather Shoes', description: 'Classic formal shoes for special occasions', price: 1500, stock: 12 },
      { name: 'Canvas Shoes', description: 'Breathable canvas shoes, various colors', price: 600, stock: 28 },
      { name: 'Sandals', description: 'Comfortable sandals for warm weather', price: 400, stock: 30 },
      { name: 'Loafers', description: 'Slip-on loafers for casual elegance', price: 1100, stock: 15 },
      { name: 'Basketball Shoes', description: 'High-top basketball shoes with ankle support', price: 1400, stock: 14 },
      { name: 'Hiking Boots', description: 'Durable hiking boots for outdoor activities', price: 1800, stock: 10 },
      { name: 'Slip-On Sneakers', description: 'Easy slip-on sneakers for convenience', price: 750, stock: 22 },
      { name: 'Oxford Shoes', description: 'Classic oxford style dress shoes', price: 1300, stock: 13 },
      { name: 'Desert Boots', description: 'Suede desert boots for casual style', price: 1000, stock: 16 },
      { name: 'Boat Shoes', description: 'Comfortable boat shoes for summer', price: 850, stock: 20 },
      { name: 'Chelsea Boots', description: 'Stylish Chelsea boots with elastic sides', price: 1250, stock: 11 },
      { name: 'Training Shoes', description: 'Cross-training shoes for gym workouts', price: 1100, stock: 17 },
      { name: 'Flip Flops', description: 'Casual flip flops for beach or pool', price: 180, stock: 50 },
    ],
  },
  {
    folder: "women's shoes shop",
    name: "Dire Dawa Women's Shoes Shop",
    description: "Elegant women's footwear collection",
    city: 'DIRE_DAWA' as const,
    category: 'Footwear',
    tier: 'luxury' as const,
    products: [
      { name: 'Ballet Flats', description: 'Comfortable ballet flats for everyday wear', price: 650, stock: 25 },
      { name: 'High Heel Pumps', description: 'Classic high heel pumps for formal events', price: 1200, stock: 15 },
      { name: 'Ankle Boots', description: 'Stylish ankle boots with side zip', price: 1100, stock: 18 },
      { name: 'Wedge Sandals', description: 'Comfortable wedge sandals for summer', price: 800, stock: 22 },
      { name: 'Sneakers', description: 'Trendy sneakers for casual outfits', price: 900, stock: 20 },
      { name: 'Flat Sandals', description: 'Simple flat sandals for warm weather', price: 450, stock: 30 },
      { name: 'Knee-High Boots', description: 'Elegant knee-high boots for winter', price: 1500, stock: 12 },
      { name: 'Slip-On Loafers', description: 'Comfortable slip-on loafers', price: 750, stock: 24 },
      { name: 'Platform Heels', description: 'Platform heels for added height', price: 1300, stock: 14 },
      { name: 'Espadrilles', description: 'Casual espadrilles with rope sole', price: 600, stock: 26 },
      { name: 'Mary Jane Shoes', description: 'Classic Mary Jane style shoes', price: 700, stock: 20 },
      { name: 'Mules', description: 'Backless mules for easy wear', price: 650, stock: 22 },
      { name: 'Gladiator Sandals', description: 'Strappy gladiator sandals', price: 550, stock: 18 },
    ],
  },
  {
    folder: 'jersy shop',
    name: 'Dire Dawa Jersey Shop',
    description: 'Sports jerseys and athletic wear for champions',
    city: 'DIRE_DAWA' as const,
    category: 'Clothing',
    tier: 'standard' as const,
    products: [
      { name: 'Football Jersey - Home', description: 'Official style home football jersey', price: 450, stock: 30 },
      { name: 'Football Jersey - Away', description: 'Official style away football jersey', price: 450, stock: 28 },
      { name: 'Basketball Jersey', description: 'Breathable basketball jersey', price: 400, stock: 25 },
      { name: 'Training Jersey', description: 'Lightweight training jersey for practice', price: 350, stock: 35 },
      { name: 'Goalkeeper Jersey', description: 'Padded goalkeeper jersey with long sleeves', price: 500, stock: 15 },
      { name: 'Running Vest', description: 'Moisture-wicking running vest', price: 300, stock: 32 },
      { name: 'Cycling Jersey', description: 'Aerodynamic cycling jersey with pockets', price: 550, stock: 18 },
      { name: 'Volleyball Jersey', description: 'Comfortable volleyball team jersey', price: 380, stock: 24 },
      { name: 'Track Suit Set', description: 'Complete track suit with jacket and pants', price: 800, stock: 20 },
      { name: 'Sports T-Shirt', description: 'Quick-dry sports t-shirt', price: 250, stock: 40 },
    ],
  },
];

// Helper function to get file extension
function getFileExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return ext.substring(1); // Remove the dot
}

// Helper function to get MIME type
function getMimeType(filename: string): string {
  const ext = getFileExtension(filename);
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
  };
  return mimeTypes[ext] || 'image/jpeg';
}

async function clearCollection(collectionName: string) {
  console.log(`🗑️  Clearing ${collectionName}...`);
  const snapshot = await db.collection(collectionName).get();
  
  if (snapshot.size === 0) {
    console.log(`   No documents to clear in ${collectionName}`);
    return 0;
  }

  const batchSize = 500;
  let deletedCount = 0;
  
  for (let i = 0; i < snapshot.docs.length; i += batchSize) {
    const batch = db.batch();
    const docs = snapshot.docs.slice(i, i + batchSize);
    
    docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    deletedCount += docs.length;
  }
  
  console.log(`   ✅ Cleared ${deletedCount} documents from ${collectionName}`);
  return deletedCount;
}

async function uploadImage(
  shopId: string,
  productId: string,
  imagePath: string,
  imageIndex: number
): Promise<string> {
  const imageBuffer = fs.readFileSync(imagePath);
  const ext = getFileExtension(imagePath);
  const mimeType = getMimeType(imagePath);
  
  const storagePath = `products/${shopId}/${productId}/image_${imageIndex}.${ext}`;
  const file = storage.file(storagePath);
  
  await file.save(imageBuffer, {
    metadata: {
      contentType: mimeType,
    },
    public: true,
  });
  
  // Make file publicly accessible
  await file.makePublic();
  
  // Return correct public URL
  const publicUrl = `https://storage.googleapis.com/${storage.name}/${encodeURIComponent(storagePath).replace(/%2F/g, '/')}`;
  return publicUrl;
}

async function seedShops() {
  console.log('🌱 Starting to seed shops and products...\n');

  const seedImagesDir = path.join(__dirname, '../seed-images');
  
  if (!fs.existsSync(seedImagesDir)) {
    console.error('❌ seed-images folder not found!');
    process.exit(1);
  }

  for (const shopConfig of SHOPS) {
    const shopId = `shop_${shopConfig.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
    const shopFolderPath = path.join(seedImagesDir, shopConfig.folder);
    
    console.log(`\n📦 Processing: ${shopConfig.name} (${shopConfig.city})`);
    
    // Check if folder exists
    if (!fs.existsSync(shopFolderPath)) {
      console.log(`   ⚠️  Folder not found: ${shopConfig.folder}, skipping...`);
      continue;
    }

    // Get all image files from the folder
    const imageFiles = fs.readdirSync(shopFolderPath)
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .map(file => path.join(shopFolderPath, file));

    if (imageFiles.length === 0) {
      console.log(`   ⚠️  No images found in ${shopConfig.folder}, skipping...`);
      continue;
    }

    console.log(`   Found ${imageFiles.length} images`);

    // Create shop document with tier information
    const shopData = {
      name: shopConfig.name,
      description: shopConfig.description,
      ownerId: `merchant_${shopId}`,
      city: shopConfig.city,
      tier: shopConfig.tier,
      location: {
        latitude: shopConfig.city === 'HARAR' ? 9.3 : 9.6,
        longitude: shopConfig.city === 'HARAR' ? 42.1 : 41.9,
      },
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await db.collection('shops').doc(shopId).set(shopData);
    console.log(`   ✅ Created ${shopConfig.tier} shop: ${shopConfig.name}`);

    // Create products with images
    const productsToCreate = Math.min(shopConfig.products.length, imageFiles.length);
    
    for (let i = 0; i < productsToCreate; i++) {
      const productConfig = shopConfig.products[i];
      const productId = `product_${shopId}_${i + 1}`;
      
      console.log(`   📸 Uploading image for: ${productConfig.name}`);
      
      // Upload image to Firebase Storage
      const imageUrl = await uploadImage(shopId, productId, imageFiles[i], 0);
      
      // Create product document
      const productData = {
        shopId: shopId,
        shopCity: shopConfig.city,
        name: productConfig.name,
        description: productConfig.description,
        price: productConfig.price,
        category: shopConfig.category,
        images: [imageUrl],
        stock: productConfig.stock,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await db.collection('products').doc(productId).set(productData);
      console.log(`   ✅ Created product: ${productConfig.name}`);
    }
  }

  console.log('\n✨ Seeding completed successfully!\n');
}

async function main() {
  try {
    // Step 1: Clear existing data
    console.log('🗑️  Step 1: Clearing existing data...\n');
    await clearCollection('products');
    await clearCollection('shops');
    
    // Step 2: Seed new data
    console.log('\n🌱 Step 2: Seeding new shops and products...\n');
    await seedShops();
    
    console.log('🎉 All done! Your marketplace is ready with real product images.\n');
    console.log('📊 Summary:');
    console.log('   - 3 Harar shops (Electronics, Cosmetics, Eye Glass)');
    console.log('   - 3 Dire Dawa shops (Men\'s Shoes, Women\'s Shoes, Jersey)');
    console.log('   - Each shop has luxury/premium/standard tier styling\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
