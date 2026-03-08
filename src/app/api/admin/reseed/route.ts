/**
 * API Endpoint: POST /api/admin/reseed
 * 
 * Cleans up the database and re-seeds with fresh data.
 * This endpoint is for development/testing purposes only.
 */

import { adminDb } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';

interface SampleShop {
  name: string;
  city: 'HARAR' | 'DIRE_DAWA';
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
    city: 'HARAR',
    description: 'Premium electronics and gadgets store in Harar',
    contactPhone: '+251911234567',
  },
  {
    name: 'Harar Fashion Store',
    city: 'HARAR',
    description: 'Latest fashion and clothing collection',
    contactPhone: '+251912345678',
  },
  {
    name: 'Harar Books & Stationery',
    city: 'HARAR',
    description: 'Books, notebooks, and school supplies',
    contactPhone: '+251913456789',
  },
  {
    name: 'Dire Dawa Tech Store',
    city: 'DIRE_DAWA',
    description: 'Computer accessories and tech gadgets',
    contactPhone: '+251914567890',
  },
  {
    name: 'Dire Dawa Supermarket',
    city: 'DIRE_DAWA',
    description: 'Groceries, snacks, and daily essentials',
    contactPhone: '+251915678901',
  },
  {
    name: 'Dire Dawa Pharmacy Plus',
    city: 'DIRE_DAWA',
    description: 'Medicines, vitamins, and health products',
    contactPhone: '+251916789012',
  },
];

// Sample products - 9 unique products per shop (54 total)
const SAMPLE_PRODUCTS: SampleProduct[] = [
  // Harar Electronics Hub products (9 products)
  {
    shopName: 'Harar Electronics Hub',
    name: 'USB-C Fast Charger 65W',
    description: '65W USB-C fast charger compatible with all devices',
    price: 450,
    category: 'Electronics',
    stock: 25,
  },
  {
    shopName: 'Harar Electronics Hub',
    name: 'Wireless Earbuds Pro',
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
  {
    shopName: 'Harar Electronics Hub',
    name: 'Power Bank 20000mAh',
    description: 'High capacity power bank with dual USB ports',
    price: 850,
    category: 'Electronics',
    stock: 20,
  },
  {
    shopName: 'Harar Electronics Hub',
    name: 'HDMI Cable 2m',
    description: 'High-speed HDMI cable for HD video and audio',
    price: 200,
    category: 'Accessories',
    stock: 40,
  },
  {
    shopName: 'Harar Electronics Hub',
    name: 'Bluetooth Speaker',
    description: 'Portable wireless speaker with deep bass',
    price: 950,
    category: 'Electronics',
    stock: 18,
  },
  {
    shopName: 'Harar Electronics Hub',
    name: 'Phone Case Premium',
    description: 'Shockproof protective case for smartphones',
    price: 250,
    category: 'Accessories',
    stock: 60,
  },
  {
    shopName: 'Harar Electronics Hub',
    name: 'USB Flash Drive 64GB',
    description: 'High-speed USB 3.0 flash drive 64GB capacity',
    price: 350,
    category: 'Electronics',
    stock: 35,
  },
  {
    shopName: 'Harar Electronics Hub',
    name: 'LED Desk Lamp',
    description: 'Adjustable LED desk lamp with USB charging port',
    price: 650,
    category: 'Electronics',
    stock: 22,
  },

  // Harar Fashion Store products (9 products)
  {
    shopName: 'Harar Fashion Store',
    name: 'Cotton T-Shirt Classic',
    description: 'Premium quality 100% cotton t-shirt',
    price: 350,
    category: 'Clothing',
    stock: 40,
  },
  {
    shopName: 'Harar Fashion Store',
    name: 'Denim Jeans Blue',
    description: 'Classic blue denim jeans with comfortable fit',
    price: 850,
    category: 'Clothing',
    stock: 20,
  },
  {
    shopName: 'Harar Fashion Store',
    name: 'Casual Sneakers White',
    description: 'Comfortable casual sneakers for everyday wear',
    price: 1500,
    category: 'Footwear',
    stock: 18,
  },
  {
    shopName: 'Harar Fashion Store',
    name: 'Leather Belt Brown',
    description: 'Genuine leather belt with metal buckle',
    price: 450,
    category: 'Accessories',
    stock: 30,
  },
  {
    shopName: 'Harar Fashion Store',
    name: 'Polo Shirt Striped',
    description: 'Stylish striped polo shirt for casual wear',
    price: 550,
    category: 'Clothing',
    stock: 25,
  },
  {
    shopName: 'Harar Fashion Store',
    name: 'Sports Jacket',
    description: 'Lightweight sports jacket with zipper pockets',
    price: 1200,
    category: 'Clothing',
    stock: 15,
  },
  {
    shopName: 'Harar Fashion Store',
    name: 'Canvas Backpack',
    description: 'Durable canvas backpack with multiple compartments',
    price: 750,
    category: 'Accessories',
    stock: 22,
  },
  {
    shopName: 'Harar Fashion Store',
    name: 'Baseball Cap',
    description: 'Adjustable baseball cap with embroidered logo',
    price: 250,
    category: 'Accessories',
    stock: 45,
  },
  {
    shopName: 'Harar Fashion Store',
    name: 'Running Shoes',
    description: 'Lightweight running shoes with cushioned sole',
    price: 1800,
    category: 'Footwear',
    stock: 12,
  },

  // Harar Books & Stationery products (9 products)
  {
    shopName: 'Harar Books & Stationery',
    name: 'Notebook Set A4',
    description: 'Set of 3 premium quality A4 notebooks',
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
  {
    shopName: 'Harar Books & Stationery',
    name: 'Scientific Calculator',
    description: 'Advanced scientific calculator for students',
    price: 550,
    category: 'Stationery',
    stock: 20,
  },
  {
    shopName: 'Harar Books & Stationery',
    name: 'Highlighter Set',
    description: 'Set of 6 fluorescent highlighter markers',
    price: 120,
    category: 'Stationery',
    stock: 80,
  },
  {
    shopName: 'Harar Books & Stationery',
    name: 'Geometry Set',
    description: 'Complete geometry set with compass and protractor',
    price: 180,
    category: 'Stationery',
    stock: 35,
  },
  {
    shopName: 'Harar Books & Stationery',
    name: 'Sticky Notes Pack',
    description: 'Pack of colorful sticky notes for reminders',
    price: 90,
    category: 'Stationery',
    stock: 70,
  },
  {
    shopName: 'Harar Books & Stationery',
    name: 'Art Sketchbook',
    description: 'Professional sketchbook for drawing and painting',
    price: 280,
    category: 'Stationery',
    stock: 25,
  },
  {
    shopName: 'Harar Books & Stationery',
    name: 'Study Guide Physics',
    description: 'Comprehensive physics study guide for grade 12',
    price: 380,
    category: 'Books',
    stock: 18,
  },

  // Dire Dawa Tech Store products (9 products)
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
    name: 'Laptop Stand Aluminum',
    description: 'Adjustable aluminum laptop stand for better ergonomics',
    price: 600,
    category: 'Accessories',
    stock: 22,
  },
  {
    shopName: 'Dire Dawa Tech Store',
    name: 'Wireless Mouse Ergonomic',
    description: 'Ergonomic wireless mouse with 2.4GHz connection',
    price: 400,
    category: 'Accessories',
    stock: 35,
  },
  {
    shopName: 'Dire Dawa Tech Store',
    name: 'Mechanical Keyboard RGB',
    description: 'RGB backlit mechanical keyboard for gaming',
    price: 1500,
    category: 'Accessories',
    stock: 15,
  },
  {
    shopName: 'Dire Dawa Tech Store',
    name: 'Webcam HD 1080p',
    description: 'Full HD webcam with built-in microphone',
    price: 850,
    category: 'Electronics',
    stock: 18,
  },
  {
    shopName: 'Dire Dawa Tech Store',
    name: 'External Hard Drive 1TB',
    description: 'Portable external hard drive 1TB storage',
    price: 1800,
    category: 'Electronics',
    stock: 12,
  },
  {
    shopName: 'Dire Dawa Tech Store',
    name: 'Gaming Headset',
    description: 'Professional gaming headset with surround sound',
    price: 1200,
    category: 'Accessories',
    stock: 20,
  },
  {
    shopName: 'Dire Dawa Tech Store',
    name: 'Laptop Cooling Pad',
    description: 'Cooling pad with dual fans for laptops',
    price: 450,
    category: 'Accessories',
    stock: 28,
  },
  {
    shopName: 'Dire Dawa Tech Store',
    name: 'Cable Organizer Set',
    description: 'Set of cable clips and organizers for desk',
    price: 180,
    category: 'Accessories',
    stock: 50,
  },

  // Dire Dawa Supermarket products (9 products)
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
    name: 'Coffee Powder Ethiopian',
    description: 'Premium Ethiopian coffee powder 250g',
    price: 350,
    category: 'Beverages',
    stock: 40,
  },
  {
    shopName: 'Dire Dawa Supermarket',
    name: 'Rice Basmati 1kg',
    description: 'Premium basmati rice 1 kilogram pack',
    price: 180,
    category: 'Food',
    stock: 80,
  },
  {
    shopName: 'Dire Dawa Supermarket',
    name: 'Cooking Oil 1L',
    description: 'Pure vegetable cooking oil 1 liter bottle',
    price: 220,
    category: 'Food',
    stock: 60,
  },
  {
    shopName: 'Dire Dawa Supermarket',
    name: 'Sugar 1kg',
    description: 'White refined sugar 1 kilogram pack',
    price: 90,
    category: 'Food',
    stock: 100,
  },
  {
    shopName: 'Dire Dawa Supermarket',
    name: 'Pasta Spaghetti 500g',
    description: 'Italian style spaghetti pasta 500 grams',
    price: 120,
    category: 'Food',
    stock: 70,
  },
  {
    shopName: 'Dire Dawa Supermarket',
    name: 'Tomato Sauce 400g',
    description: 'Rich tomato sauce for cooking 400g can',
    price: 85,
    category: 'Food',
    stock: 90,
  },
  {
    shopName: 'Dire Dawa Supermarket',
    name: 'Biscuits Assorted Pack',
    description: 'Assorted biscuits variety pack 300g',
    price: 110,
    category: 'Snacks',
    stock: 120,
  },

  // Dire Dawa Pharmacy Plus products (9 products)
  {
    shopName: 'Dire Dawa Pharmacy Plus',
    name: 'Vitamin C Tablets 500mg',
    description: 'Vitamin C 500mg tablets - bottle of 60',
    price: 250,
    category: 'Vitamins',
    stock: 45,
  },
  {
    shopName: 'Dire Dawa Pharmacy Plus',
    name: 'First Aid Kit Complete',
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
  {
    shopName: 'Dire Dawa Pharmacy Plus',
    name: 'Multivitamin Tablets',
    description: 'Daily multivitamin supplement - 30 tablets',
    price: 320,
    category: 'Vitamins',
    stock: 35,
  },
  {
    shopName: 'Dire Dawa Pharmacy Plus',
    name: 'Pain Relief Gel',
    description: 'Topical pain relief gel for muscle aches',
    price: 180,
    category: 'Medical',
    stock: 50,
  },
  {
    shopName: 'Dire Dawa Pharmacy Plus',
    name: 'Digital Thermometer',
    description: 'Fast and accurate digital thermometer',
    price: 280,
    category: 'Medical',
    stock: 25,
  },
  {
    shopName: 'Dire Dawa Pharmacy Plus',
    name: 'Face Masks Box',
    description: 'Disposable face masks - box of 50',
    price: 350,
    category: 'Hygiene',
    stock: 60,
  },
  {
    shopName: 'Dire Dawa Pharmacy Plus',
    name: 'Antiseptic Solution 250ml',
    description: 'Antiseptic solution for wound cleaning',
    price: 150,
    category: 'Medical',
    stock: 40,
  },
  {
    shopName: 'Dire Dawa Pharmacy Plus',
    name: 'Blood Pressure Monitor',
    description: 'Automatic digital blood pressure monitor',
    price: 1200,
    category: 'Medical',
    stock: 15,
  },
];

export async function POST(request: NextRequest) {
  try {
    // Check for authorization header (simple protection)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.SEED_API_TOKEN || 'dev-seed-token';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Starting database reseed...');

    // Step 1: Clean up existing data
    console.log('🧹 Cleaning up existing data...');
    
    const productsSnapshot = await adminDb.collection('products').get();
    const productDeletePromises = productsSnapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(productDeletePromises);
    console.log(`  ✓ Deleted ${productsSnapshot.size} products`);

    const shopsSnapshot = await adminDb.collection('shops').get();
    const shopDeletePromises = shopsSnapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(shopDeletePromises);
    console.log(`  ✓ Deleted ${shopsSnapshot.size} shops`);

    // Step 2: Seed fresh data
    console.log('🌱 Seeding fresh data...');

    // Create shops
    const shopMap = new Map<string, string>(); // shopName -> shopId

    for (const shop of SAMPLE_SHOPS) {
      const shopRef = await adminDb.collection('shops').add({
        name: shop.name,
        city: shop.city,
        description: shop.description,
        contactPhone: shop.contactPhone,
        ownerId: `owner_${shop.name.replace(/\s+/g, '_').toLowerCase()}`,
        balance: 0,
        suspended: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      shopMap.set(shop.name, shopRef.id);
      console.log(`  ✓ Created shop: ${shop.name} (${shop.city})`);
    }

    // Create products
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

      await adminDb.collection('products').add({
        shopId,
        shopCity: shop.city, // CRITICAL: Denormalized city field
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        images: [
          `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=400&background=random&color=fff&bold=true`,
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      productCount++;
      console.log(`  ✓ Created product: ${product.name} (${shop.city})`);
    }

    console.log('🎉 Database reseed completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Database reseeded successfully',
      summary: {
        oldShops: shopsSnapshot.size,
        oldProducts: productsSnapshot.size,
        newShops: SAMPLE_SHOPS.length,
        newProducts: productCount,
        harar_shops: SAMPLE_SHOPS.filter((s) => s.city === 'HARAR').length,
        dire_dawa_shops: SAMPLE_SHOPS.filter((s) => s.city === 'DIRE_DAWA').length,
      },
    });
  } catch (error) {
    console.error('❌ Error reseeding database:', error);
    return NextResponse.json(
      { error: 'Failed to reseed database', details: String(error) },
      { status: 500 }
    );
  }
}
