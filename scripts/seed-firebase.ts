/**
 * Firebase Seed Script
 * 
 * This script populates the Firebase database with sample shops and products
 * for testing and development purposes.
 * 
 * Usage: npx ts-node scripts/seed-firebase.ts
 * 
 * Requirements: 1, 3, 4, 5
 */

import * as admin from 'firebase-admin';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

interface SampleShop {
  name: string;
  city: 'Harar' | 'Dire Dawa';
  description: string;
  contactPhone: string;
}

interface SampleProduct {
  shopName: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

// Sample shops from Harar and Dire Dawa
const SAMPLE_SHOPS: SampleShop[] = [
  {
    name: 'Harar Electronics Hub',
    city: 'Harar',
    description: 'Premium electronics and gadgets store in Harar',
    contactPhone: '+251911234567',
  },
  {
    name: 'Harar Fashion Store',
    city: 'Harar',
    description: 'Latest fashion and clothing collection',
    contactPhone: '+251912345678',
  },
  {
    name: 'Harar Books & Stationery',
    city: 'Harar',
    description: 'Books, notebooks, and school supplies',
    contactPhone: '+251913456789',
  },
  {
    name: 'Dire Dawa Tech Store',
    city: 'Dire Dawa',
    description: 'Computer accessories and tech gadgets',
    contactPhone: '+251914567890',
  },
  {
    name: 'Dire Dawa Supermarket',
    city: 'Dire Dawa',
    description: 'Groceries, snacks, and daily essentials',
    contactPhone: '+251915678901',
  },
  {
    name: 'Dire Dawa Pharmacy Plus',
    city: 'Dire Dawa',
    description: 'Medicines, vitamins, and health products',
    contactPhone: '+251916789012',
  },
];

// Sample products
const SAMPLE_PRODUCTS: SampleProduct[] = [
  // Harar Electronics Hub products
  {
    shopName: 'Harar Electronics Hub',
    name: 'USB-C Fast Charger',
    description: '65W USB-C fast charger compatible with all devices',
    price: 450,
    category: 'Electronics',
    stock: 25,
  },
  {
    shopName: 'Harar Electronics Hub',
    name: 'Wireless Earbuds',
    description: 'Bluetooth 5.0 wireless earbuds with noise cancellation',
    price: 1200,
    category: 'Electronics',
    stock: 15,
  },
  {
    shopName: 'Harar Electronics Hub',
    name: 'Phone Screen Protector',
    description: 'Tempered glass screen protector for smartphones',
    price: 150,
    category: 'Accessories',
    stock: 50,
  },
  // Harar Fashion Store products
  {
    shopName: 'Harar Fashion Store',
    name: 'Cotton T-Shirt',
    description: 'Premium quality 100% cotton t-shirt',
    price: 350,
    category: 'Clothing',
    stock: 40,
  },
  {
    shopName: 'Harar Fashion Store',
    name: 'Denim Jeans',
    description: 'Classic blue denim jeans with comfortable fit',
    price: 850,
    category: 'Clothing',
    stock: 20,
  },
  {
    shopName: 'Harar Fashion Store',
    name: 'Casual Sneakers',
    description: 'Comfortable casual sneakers for everyday wear',
    price: 1500,
    category: 'Footwear',
    stock: 18,
  },
  // Harar Books & Stationery products
  {
    shopName: 'Harar Books & Stationery',
    name: 'Notebook Set',
    description: 'Set of 3 premium quality notebooks',
    price: 200,
    category: 'Stationery',
    stock: 60,
  },
  {
    shopName: 'Harar Books & Stationery',
    name: 'Ballpoint Pen Pack',
    description: 'Pack of 10 smooth writing ballpoint pens',
    price: 100,
    category: 'Stationery',
    stock: 100,
  },
  {
    shopName: 'Harar Books & Stationery',
    name: 'English Dictionary',
    description: 'Comprehensive English to Amharic dictionary',
    price: 450,
    category: 'Books',
    stock: 12,
  },
  // Dire Dawa Tech Store products
  {
    shopName: 'Dire Dawa Tech Store',
    name: 'USB Hub 4-Port',
    description: '4-port USB 3.0 hub for multiple device connections',
    price: 350,
    category: 'Accessories',
    stock: 30,
  },
  {
    shopName: 'Dire Dawa Tech Store',
    name: 'Laptop Stand',
    description: 'Adjustable aluminum laptop stand for better ergonomics',
    price: 600,
    category: 'Accessories',
    stock: 22,
  },
  {
    shopName: 'Dire Dawa Tech Store',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with 2.4GHz connection',
    price: 400,
    category: 'Accessories',
    stock: 35,
  },
  // Dire Dawa Supermarket products
  {
    shopName: 'Dire Dawa Supermarket',
    name: 'Instant Noodles Pack',
    description: 'Pack of 5 instant noodles - quick and easy meal',
    price: 80,
    category: 'Food',
    stock: 200,
  },
  {
    shopName: 'Dire Dawa Supermarket',
    name: 'Bottled Water 1.5L',
    description: 'Pure drinking water 1.5 liter bottle',
    price: 25,
    category: 'Beverages',
    stock: 150,
  },
  {
    shopName: 'Dire Dawa Supermarket',
    name: 'Coffee Powder',
    description: 'Premium Ethiopian coffee powder 250g',
    price: 350,
    category: 'Beverages',
    stock: 40,
  },
  // Dire Dawa Pharmacy Plus products
  {
    shopName: 'Dire Dawa Pharmacy Plus',
    name: 'Vitamin C Tablets',
    description: 'Vitamin C 500mg tablets - bottle of 60',
    price: 250,
    category: 'Vitamins',
    stock: 45,
  },
  {
    shopName: 'Dire Dawa Pharmacy Plus',
    name: 'First Aid Kit',
    description: 'Complete first aid kit with essential medical supplies',
    price: 450,
    category: 'Medical',
    stock: 20,
  },
  {
    shopName: 'Dire Dawa Pharmacy Plus',
    name: 'Hand Sanitizer 500ml',
    description: 'Antibacterial hand sanitizer 500ml bottle',
    price: 120,
    category: 'Hygiene',
    stock: 80,
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting Firebase database seeding...\n');

    // Create shops
    console.log('📦 Creating shops...');
    const shopMap = new Map<string, string>(); // shopName -> shopId

    for (const shop of SAMPLE_SHOPS) {
      const shopRef = await db.collection('shops').add({
        name: shop.name,
        city: shop.city,
        description: shop.description,
        contactPhone: shop.contactPhone,
        ownerId: `owner_${shop.name.replace(/\s+/g, '_').toLowerCase()}`,
        balance: 0,
        suspended: false,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      });

      shopMap.set(shop.name, shopRef.id);
      console.log(`  ✓ Created shop: ${shop.name} (${shop.city})`);
    }

    console.log(`\n✅ Created ${SAMPLE_SHOPS.length} shops\n`);

    // Create products
    console.log('📦 Creating products...');
    let productCount = 0;

    for (const product of SAMPLE_PRODUCTS) {
      const shopId = shopMap.get(product.shopName);
      if (!shopId) {
        console.warn(`  ⚠️  Shop not found for product: ${product.name}`);
        continue;
      }

      // Get shop city from SAMPLE_SHOPS
      const shop = SAMPLE_SHOPS.find((s) => s.name === product.shopName);
      if (!shop) {
        console.warn(`  ⚠️  Shop details not found for: ${product.shopName}`);
        continue;
      }

      await db.collection('products').add({
        shopId,
        shopCity: shop.city,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        images: [
          `https://via.placeholder.com/400x300?text=${encodeURIComponent(product.name)}`,
        ],
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      });

      productCount++;
      console.log(`  ✓ Created product: ${product.name} (${product.category})`);
    }

    console.log(`\n✅ Created ${productCount} products\n`);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Shops: ${SAMPLE_SHOPS.length}`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Harar shops: ${SAMPLE_SHOPS.filter((s) => s.city === 'Harar').length}`);
    console.log(`   - Dire Dawa shops: ${SAMPLE_SHOPS.filter((s) => s.city === 'Dire Dawa').length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
