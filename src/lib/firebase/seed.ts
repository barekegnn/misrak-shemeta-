/**
 * Firebase Database Seeding
 * 
 * This module seeds the Firebase database with sample shops and products
 * on application startup. It checks if data already exists before seeding
 * to avoid duplicates.
 * 
 * Requirements: 1, 3, 4, 5
 */

import { adminDb } from './admin';

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
  // Harar Shops
  {
    name: 'Harar Electronics Hub',
    city: 'Harar',
    description: 'Premium electronics and gadgets store in Harar city center',
    contactPhone: '+251911234567',
  },
  {
    name: 'Harar Fashion Store',
    city: 'Harar',
    description: 'Latest fashion and clothing collection for all seasons',
    contactPhone: '+251912345678',
  },
  {
    name: 'Harar Books & Stationery',
    city: 'Harar',
    description: 'Books, notebooks, and school supplies for students',
    contactPhone: '+251913456789',
  },
  {
    name: 'Harar Cafe & Snacks',
    city: 'Harar',
    description: 'Fresh coffee, snacks, and light meals',
    contactPhone: '+251914567890',
  },
  {
    name: 'Harar Sports Gear',
    city: 'Harar',
    description: 'Sports equipment and athletic wear',
    contactPhone: '+251915678901',
  },
  // Dire Dawa Shops
  {
    name: 'Dire Dawa Tech Store',
    city: 'Dire Dawa',
    description: 'Computer accessories and tech gadgets in Dire Dawa',
    contactPhone: '+251916789012',
  },
  {
    name: 'Dire Dawa Supermarket',
    city: 'Dire Dawa',
    description: 'Groceries, snacks, and daily essentials',
    contactPhone: '+251917890123',
  },
  {
    name: 'Dire Dawa Pharmacy Plus',
    city: 'Dire Dawa',
    description: 'Medicines, vitamins, and health products',
    contactPhone: '+251918901234',
  },
  {
    name: 'Dire Dawa Home Decor',
    city: 'Dire Dawa',
    description: 'Home decoration and furniture items',
    contactPhone: '+251919012345',
  },
  {
    name: 'Dire Dawa Beauty Shop',
    city: 'Dire Dawa',
    description: 'Beauty products, cosmetics, and skincare',
    contactPhone: '+251920123456',
  },
];

// Sample products
const SAMPLE_PRODUCTS: SampleProduct[] = [
  // Harar Electronics Hub products
  {
    shopName: 'Harar Electronics Hub',
    name: 'USB-C Fast Charger 65W',
    description: '65W USB-C fast charger compatible with all devices, supports multiple devices simultaneously',
    price: 450,
    category: 'Electronics',
    stock: 25,
  },
  {
    shopName: 'Harar Electronics Hub',
    name: 'Wireless Earbuds Pro',
    description: 'Bluetooth 5.0 wireless earbuds with active noise cancellation and 30-hour battery',
    price: 1200,
    category: 'Electronics',
    stock: 15,
  },
  {
    shopName: 'Harar Electronics Hub',
    name: 'Phone Screen Protector',
    description: 'Tempered glass screen protector for smartphones, 9H hardness',
    price: 150,
    category: 'Accessories',
    stock: 50,
  },
  {
    shopName: 'Harar Electronics Hub',
    name: 'Phone Case Leather',
    description: 'Premium leather phone case with card slots',
    price: 280,
    category: 'Accessories',
    stock: 35,
  },
  {
    shopName: 'Harar Electronics Hub',
    name: 'USB Hub 4-Port',
    description: '4-port USB 3.0 hub for multiple device connections',
    price: 350,
    category: 'Accessories',
    stock: 30,
  },
  // Harar Fashion Store products
  {
    shopName: 'Harar Fashion Store',
    name: 'Cotton T-Shirt Premium',
    description: 'Premium quality 100% cotton t-shirt, comfortable and durable',
    price: 350,
    category: 'Clothing',
    stock: 40,
  },
  {
    shopName: 'Harar Fashion Store',
    name: 'Denim Jeans Classic',
    description: 'Classic blue denim jeans with comfortable fit and fade-resistant',
    price: 850,
    category: 'Clothing',
    stock: 20,
  },
  {
    shopName: 'Harar Fashion Store',
    name: 'Casual Sneakers',
    description: 'Comfortable casual sneakers for everyday wear, breathable material',
    price: 1500,
    category: 'Footwear',
    stock: 18,
  },
  {
    shopName: 'Harar Fashion Store',
    name: 'Formal Shirt White',
    description: 'Elegant white formal shirt for business and casual occasions',
    price: 650,
    category: 'Clothing',
    stock: 25,
  },
  {
    shopName: 'Harar Fashion Store',
    name: 'Winter Jacket',
    description: 'Warm winter jacket with water-resistant coating',
    price: 2200,
    category: 'Clothing',
    stock: 12,
  },
  // Harar Books & Stationery products
  {
    shopName: 'Harar Books & Stationery',
    name: 'Notebook Set Premium',
    description: 'Set of 3 premium quality notebooks with 200 pages each',
    price: 200,
    category: 'Stationery',
    stock: 60,
  },
  {
    shopName: 'Harar Books & Stationery',
    name: 'Ballpoint Pen Pack',
    description: 'Pack of 10 smooth writing ballpoint pens, blue ink',
    price: 100,
    category: 'Stationery',
    stock: 100,
  },
  {
    shopName: 'Harar Books & Stationery',
    name: 'English Dictionary',
    description: 'Comprehensive English to Amharic dictionary with 50,000 words',
    price: 450,
    category: 'Books',
    stock: 12,
  },
  {
    shopName: 'Harar Books & Stationery',
    name: 'Mathematics Textbook',
    description: 'Advanced mathematics textbook for university students',
    price: 380,
    category: 'Books',
    stock: 15,
  },
  {
    shopName: 'Harar Books & Stationery',
    name: 'Highlighter Set',
    description: 'Set of 6 fluorescent highlighters in different colors',
    price: 120,
    category: 'Stationery',
    stock: 45,
  },
  // Harar Cafe & Snacks products
  {
    shopName: 'Harar Cafe & Snacks',
    name: 'Ethiopian Coffee Beans',
    description: 'Premium Ethiopian coffee beans from Harar region, 250g',
    price: 380,
    category: 'Beverages',
    stock: 40,
  },
  {
    shopName: 'Harar Cafe & Snacks',
    name: 'Instant Coffee Mix',
    description: 'Quick instant coffee mix, 3-in-1 with milk and sugar',
    price: 150,
    category: 'Beverages',
    stock: 60,
  },
  {
    shopName: 'Harar Cafe & Snacks',
    name: 'Honey Cookies Pack',
    description: 'Delicious honey cookies, pack of 12 pieces',
    price: 200,
    category: 'Food',
    stock: 50,
  },
  {
    shopName: 'Harar Cafe & Snacks',
    name: 'Peanut Butter Jar',
    description: 'Natural peanut butter, 500g jar',
    price: 280,
    category: 'Food',
    stock: 30,
  },
  {
    shopName: 'Harar Cafe & Snacks',
    name: 'Herbal Tea Set',
    description: 'Set of 5 different herbal teas for relaxation',
    price: 220,
    category: 'Beverages',
    stock: 25,
  },
  // Harar Sports Gear products
  {
    shopName: 'Harar Sports Gear',
    name: 'Running Shoes Pro',
    description: 'Professional running shoes with cushioning technology',
    price: 1800,
    category: 'Footwear',
    stock: 20,
  },
  {
    shopName: 'Harar Sports Gear',
    name: 'Sports Water Bottle',
    description: 'Durable sports water bottle, 750ml capacity',
    price: 250,
    category: 'Sports',
    stock: 40,
  },
  {
    shopName: 'Harar Sports Gear',
    name: 'Yoga Mat',
    description: 'Non-slip yoga mat with carrying strap',
    price: 450,
    category: 'Sports',
    stock: 18,
  },
  {
    shopName: 'Harar Sports Gear',
    name: 'Dumbbells Set',
    description: 'Set of 2 dumbbells, 5kg each',
    price: 650,
    category: 'Sports',
    stock: 15,
  },
  {
    shopName: 'Harar Sports Gear',
    name: 'Sports Backpack',
    description: 'Waterproof sports backpack with multiple compartments',
    price: 580,
    category: 'Sports',
    stock: 22,
  },
  // Dire Dawa Tech Store products
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
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with blue switches',
    price: 1200,
    category: 'Accessories',
    stock: 18,
  },
  {
    shopName: 'Dire Dawa Tech Store',
    name: 'USB-C Cable 2m',
    description: 'High-speed USB-C cable, 2 meters length',
    price: 180,
    category: 'Accessories',
    stock: 50,
  },
  {
    shopName: 'Dire Dawa Tech Store',
    name: 'HDMI Cable 4K',
    description: '4K HDMI cable for high-definition video',
    price: 220,
    category: 'Accessories',
    stock: 40,
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
    name: 'Rice 5kg Bag',
    description: 'Premium quality rice, 5kg bag',
    price: 450,
    category: 'Food',
    stock: 35,
  },
  {
    shopName: 'Dire Dawa Supermarket',
    name: 'Cooking Oil 1L',
    description: 'Pure vegetable cooking oil, 1 liter bottle',
    price: 280,
    category: 'Food',
    stock: 45,
  },
  {
    shopName: 'Dire Dawa Supermarket',
    name: 'Sugar 1kg',
    description: 'Refined sugar, 1kg package',
    price: 120,
    category: 'Food',
    stock: 60,
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
    name: 'Face Mask Pack',
    description: 'Pack of 50 disposable face masks',
    price: 180,
    category: 'Hygiene',
    stock: 60,
  },
  {
    shopName: 'Dire Dawa Pharmacy Plus',
    name: 'Multivitamin Tablets',
    description: 'Daily multivitamin tablets - bottle of 30',
    price: 320,
    category: 'Vitamins',
    stock: 35,
  },
  // Dire Dawa Home Decor products
  {
    shopName: 'Dire Dawa Home Decor',
    name: 'Wall Clock Modern',
    description: 'Modern wall clock with silent mechanism',
    price: 380,
    category: 'Home',
    stock: 25,
  },
  {
    shopName: 'Dire Dawa Home Decor',
    name: 'LED Desk Lamp',
    description: 'Adjustable LED desk lamp with USB charging',
    price: 520,
    category: 'Home',
    stock: 30,
  },
  {
    shopName: 'Dire Dawa Home Decor',
    name: 'Throw Pillow Set',
    description: 'Set of 2 decorative throw pillows',
    price: 450,
    category: 'Home',
    stock: 20,
  },
  {
    shopName: 'Dire Dawa Home Decor',
    name: 'Picture Frame Set',
    description: 'Set of 3 wooden picture frames',
    price: 280,
    category: 'Home',
    stock: 35,
  },
  {
    shopName: 'Dire Dawa Home Decor',
    name: 'Curtain Rod',
    description: 'Stainless steel curtain rod with brackets',
    price: 650,
    category: 'Home',
    stock: 15,
  },
  // Dire Dawa Beauty Shop products
  {
    shopName: 'Dire Dawa Beauty Shop',
    name: 'Face Moisturizer',
    description: 'Hydrating face moisturizer for all skin types',
    price: 380,
    category: 'Beauty',
    stock: 40,
  },
  {
    shopName: 'Dire Dawa Beauty Shop',
    name: 'Shampoo Bottle 500ml',
    description: 'Professional shampoo for healthy hair',
    price: 280,
    category: 'Beauty',
    stock: 50,
  },
  {
    shopName: 'Dire Dawa Beauty Shop',
    name: 'Lipstick Set',
    description: 'Set of 5 lipsticks in different shades',
    price: 450,
    category: 'Beauty',
    stock: 25,
  },
  {
    shopName: 'Dire Dawa Beauty Shop',
    name: 'Face Cleanser',
    description: 'Gentle face cleanser for daily use',
    price: 220,
    category: 'Beauty',
    stock: 45,
  },
  {
    shopName: 'Dire Dawa Beauty Shop',
    name: 'Body Lotion 250ml',
    description: 'Moisturizing body lotion with natural ingredients',
    price: 320,
    category: 'Beauty',
    stock: 35,
  },
];

let seedingPromise: Promise<void> | null = null;
let hasSeeded = false;

/**
 * Seeds the database with sample shops and products
 * Only runs once per application instance
 */
export async function seedDatabase() {
  // If already seeding, wait for it to complete
  if (seedingPromise) {
    return seedingPromise;
  }

  // If already seeded, return immediately
  if (hasSeeded) {
    return Promise.resolve();
  }

  // Create the seeding promise
  seedingPromise = (async () => {
    try {
      // Check if shops already exist
      const shopsSnapshot = await adminDb.collection('shops').limit(1).get();
      
      if (!shopsSnapshot.empty) {
        console.log('✓ Database already seeded, skipping...');
        hasSeeded = true;
        return;
      }

      console.log('🌱 Seeding database with sample shops and products...');

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
        console.log(`  ✓ Created shop: ${shop.name}`);
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
          shopCity: shop.city,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          stock: product.stock,
          images: [
            `https://via.placeholder.com/400x300?text=${encodeURIComponent(product.name)}`,
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        productCount++;
      }

      console.log(`✅ Database seeding completed!`);
      console.log(`   - Shops: ${SAMPLE_SHOPS.length}`);
      console.log(`   - Products: ${productCount}`);
      console.log(`   - Harar shops: ${SAMPLE_SHOPS.filter((s) => s.city === 'Harar').length}`);
      console.log(`   - Dire Dawa shops: ${SAMPLE_SHOPS.filter((s) => s.city === 'Dire Dawa').length}`);

      hasSeeded = true;
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      // Don't throw, just log the error
    }
  })();

  return seedingPromise;
}
