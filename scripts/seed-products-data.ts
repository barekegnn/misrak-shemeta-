/**
 * Product seed data - 80 products across 8 shops (10 products each)
 */

import { Timestamp } from 'firebase-admin/firestore';

export const generateProducts = () => {
  const products = [];
  let productId = 1;

  // Shop 1: Harar Tech Hub (Electronics)
  const electronicsProducts = [
    { name: 'Wireless Headphones', description: 'Premium Bluetooth headphones with noise cancellation', price: 1500, stock: 15 },
    { name: 'USB-C Cable 2m', description: 'Fast charging USB-C cable, durable braided design', price: 150, stock: 50 },
    { name: 'Power Bank 20000mAh', description: 'High capacity power bank with dual USB ports', price: 800, stock: 20 },
    { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with long battery life', price: 450, stock: 25 },
    { name: 'Phone Stand', description: 'Adjustable aluminum phone stand for desk', price: 200, stock: 30 },
    { name: 'Laptop Cooling Pad', description: 'USB powered cooling pad with dual fans', price: 600, stock: 12 },
    { name: 'Webcam HD 1080p', description: 'High definition webcam for online classes', price: 1200, stock: 8 },
    { name: 'USB Hub 4-Port', description: '4-port USB 3.0 hub for laptops', price: 350, stock: 18 },
    { name: 'Screen Protector', description: 'Tempered glass screen protector for smartphones', price: 100, stock: 40 },
    { name: 'Bluetooth Speaker', description: 'Portable Bluetooth speaker with bass boost', price: 900, stock: 10 },
  ];

  electronicsProducts.forEach((p) => {
    products.push({
      id: `product_${productId++}`,
      shopId: 'shop_harar_electronics',
      name: p.name,
      description: p.description,
      price: p.price,
      category: 'Electronics',
      images: [`https://via.placeholder.com/400x400?text=${encodeURIComponent(p.name)}`],
      stock: p.stock,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  });

  // Shop 2: Harar Academic Books (Books)
  const booksProducts = [
    { name: 'Engineering Mathematics', description: 'Complete guide for engineering students', price: 450, stock: 20 },
    { name: 'Physics Textbook', description: 'University level physics with examples', price: 500, stock: 15 },
    { name: 'Chemistry Lab Manual', description: 'Practical chemistry experiments guide', price: 350, stock: 18 },
    { name: 'Programming in Python', description: 'Learn Python from basics to advanced', price: 400, stock: 25 },
    { name: 'Data Structures & Algorithms', description: 'Essential CS concepts with examples', price: 550, stock: 12 },
    { name: 'English Grammar Guide', description: 'Comprehensive English grammar reference', price: 300, stock: 30 },
    { name: 'Economics Principles', description: 'Microeconomics and macroeconomics basics', price: 420, stock: 16 },
    { name: 'Biology Textbook', description: 'General biology for life sciences', price: 480, stock: 14 },
    { name: 'History of Ethiopia', description: 'Ethiopian history from ancient to modern', price: 380, stock: 22 },
    { name: 'Amharic Literature', description: 'Collection of Amharic literary works', price: 320, stock: 18 },
  ];

  booksProducts.forEach((p) => {
    products.push({
      id: `product_${productId++}`,
      shopId: 'shop_harar_books',
      name: p.name,
      description: p.description,
      price: p.price,
      category: 'Books',
      images: [`https://via.placeholder.com/400x400?text=${encodeURIComponent(p.name)}`],
      stock: p.stock,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  });

  // Shop 3: Harar Fashion Boutique (Clothing)
  const fashionProducts = [
    { name: 'Cotton T-Shirt', description: 'Comfortable cotton t-shirt, various colors', price: 250, stock: 40 },
    { name: 'Denim Jeans', description: 'Classic fit denim jeans, durable fabric', price: 800, stock: 25 },
    { name: 'Hoodie Sweatshirt', description: 'Warm hoodie perfect for campus', price: 650, stock: 30 },
    { name: 'Casual Shirt', description: 'Smart casual shirt for everyday wear', price: 450, stock: 35 },
    { name: 'Sports Jacket', description: 'Lightweight sports jacket, water resistant', price: 900, stock: 15 },
    { name: 'Polo Shirt', description: 'Classic polo shirt, breathable fabric', price: 350, stock: 28 },
    { name: 'Cargo Pants', description: 'Practical cargo pants with multiple pockets', price: 700, stock: 20 },
    { name: 'Sweater', description: 'Cozy knit sweater for cold weather', price: 550, stock: 22 },
    { name: 'Track Pants', description: 'Comfortable track pants for sports', price: 400, stock: 32 },
    { name: 'Baseball Cap', description: 'Adjustable baseball cap, various designs', price: 180, stock: 45 },
  ];

  fashionProducts.forEach((p) => {
    products.push({
      id: `product_${productId++}`,
      shopId: 'shop_harar_fashion',
      name: p.name,
      description: p.description,
      price: p.price,
      category: 'Clothing',
      images: [`https://via.placeholder.com/400x400?text=${encodeURIComponent(p.name)}`],
      stock: p.stock,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  });

  // Shop 4: Harar Beauty Corner (Cosmetics)
  const cosmeticsProducts = [
    { name: 'Face Moisturizer', description: 'Hydrating face moisturizer for all skin types', price: 350, stock: 25 },
    { name: 'Sunscreen SPF 50', description: 'Broad spectrum sun protection', price: 400, stock: 20 },
    { name: 'Lip Balm Set', description: 'Set of 3 nourishing lip balms', price: 150, stock: 40 },
    { name: 'Shampoo & Conditioner', description: 'Hair care combo pack', price: 450, stock: 30 },
    { name: 'Body Lotion', description: 'Moisturizing body lotion, 400ml', price: 300, stock: 28 },
    { name: 'Face Wash', description: 'Gentle face wash for daily use', price: 250, stock: 35 },
    { name: 'Deodorant Spray', description: 'Long-lasting deodorant spray', price: 200, stock: 45 },
    { name: 'Hair Oil', description: 'Natural hair oil for shine and strength', price: 280, stock: 22 },
    { name: 'Hand Cream', description: 'Intensive hand cream, 100ml', price: 180, stock: 38 },
    { name: 'Perfume 50ml', description: 'Fresh fragrance for daily wear', price: 600, stock: 15 },
  ];

  cosmeticsProducts.forEach((p) => {
    products.push({
      id: `product_${productId++}`,
      shopId: 'shop_harar_cosmetics',
      name: p.name,
      description: p.description,
      price: p.price,
      category: 'Cosmetics',
      images: [`https://via.placeholder.com/400x400?text=${encodeURIComponent(p.name)}`],
      stock: p.stock,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  });

  // Shop 5: Dire Dawa Shoe Palace (Footwear)
  const shoesProducts = [
    { name: 'Running Shoes', description: 'Lightweight running shoes with cushioning', price: 1200, stock: 18 },
    { name: 'Casual Sneakers', description: 'Comfortable sneakers for everyday wear', price: 900, stock: 25 },
    { name: 'Sandals', description: 'Comfortable sandals for warm weather', price: 400, stock: 30 },
    { name: 'Formal Shoes', description: 'Classic formal shoes for special occasions', price: 1500, stock: 12 },
    { name: 'Canvas Shoes', description: 'Breathable canvas shoes, various colors', price: 600, stock: 28 },
    { name: 'Slippers', description: 'Comfortable indoor/outdoor slippers', price: 250, stock: 40 },
    { name: 'Basketball Shoes', description: 'High-top basketball shoes with ankle support', price: 1400, stock: 15 },
    { name: 'Hiking Boots', description: 'Durable hiking boots for outdoor activities', price: 1800, stock: 10 },
    { name: 'Flip Flops', description: 'Casual flip flops for beach or pool', price: 180, stock: 50 },
    { name: 'Loafers', description: 'Slip-on loafers for casual style', price: 800, stock: 20 },
  ];

  shoesProducts.forEach((p) => {
    products.push({
      id: `product_${productId++}`,
      shopId: 'shop_diredawa_shoes',
      name: p.name,
      description: p.description,
      price: p.price,
      category: 'Footwear',
      images: [`https://via.placeholder.com/400x400?text=${encodeURIComponent(p.name)}`],
      stock: p.stock,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  });

  // Shop 6: Dire Dawa Office Supplies (Stationery)
  const stationeryProducts = [
    { name: 'Notebook Set (5pc)', description: 'High-quality notebooks for students', price: 200, stock: 60 },
    { name: 'Pen Set (10pc)', description: 'Ballpoint pens, blue and black', price: 80, stock: 80 },
    { name: 'Scientific Calculator', description: 'Advanced calculator for engineering', price: 350, stock: 25 },
    { name: 'Highlighter Set', description: 'Set of 6 fluorescent highlighters', price: 120, stock: 45 },
    { name: 'Sticky Notes Pack', description: 'Colorful sticky notes for organization', price: 90, stock: 55 },
    { name: 'Pencil Case', description: 'Large capacity pencil case with compartments', price: 150, stock: 35 },
    { name: 'Ruler & Compass Set', description: 'Geometry set for technical drawing', price: 180, stock: 30 },
    { name: 'Stapler & Staples', description: 'Heavy duty stapler with 1000 staples', price: 220, stock: 28 },
    { name: 'File Folders (10pc)', description: 'Plastic file folders for documents', price: 160, stock: 40 },
    { name: 'Whiteboard Markers', description: 'Set of 4 dry-erase markers', price: 140, stock: 38 },
  ];

  stationeryProducts.forEach((p) => {
    products.push({
      id: `product_${productId++}`,
      shopId: 'shop_diredawa_stationery',
      name: p.name,
      description: p.description,
      price: p.price,
      category: 'Stationery',
      images: [`https://via.placeholder.com/400x400?text=${encodeURIComponent(p.name)}`],
      stock: p.stock,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  });

  // Shop 7: Dire Dawa Sports Arena (Sports Equipment)
  const sportsProducts = [
    { name: 'Football/Soccer Ball', description: 'Official size 5 football', price: 450, stock: 20 },
    { name: 'Basketball', description: 'Indoor/outdoor basketball', price: 500, stock: 15 },
    { name: 'Volleyball', description: 'Professional volleyball', price: 400, stock: 18 },
    { name: 'Tennis Racket', description: 'Lightweight tennis racket with cover', price: 800, stock: 12 },
    { name: 'Badminton Set', description: 'Complete badminton set with shuttlecocks', price: 600, stock: 14 },
    { name: 'Jump Rope', description: 'Adjustable jump rope for fitness', price: 120, stock: 35 },
    { name: 'Yoga Mat', description: 'Non-slip yoga mat with carrying strap', price: 350, stock: 22 },
    { name: 'Dumbbells 5kg Pair', description: 'Rubber coated dumbbells', price: 700, stock: 16 },
    { name: 'Resistance Bands Set', description: 'Set of 5 resistance bands', price: 280, stock: 25 },
    { name: 'Water Bottle 1L', description: 'BPA-free sports water bottle', price: 150, stock: 40 },
  ];

  sportsProducts.forEach((p) => {
    products.push({
      id: `product_${productId++}`,
      shopId: 'shop_diredawa_sports',
      name: p.name,
      description: p.description,
      price: p.price,
      category: 'Sports',
      images: [`https://via.placeholder.com/400x400?text=${encodeURIComponent(p.name)}`],
      stock: p.stock,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  });

  // Shop 8: Dire Dawa Campus Mart (Grocery/Snacks)
  const groceryProducts = [
    { name: 'Instant Noodles (5pc)', description: 'Quick meal instant noodles', price: 80, stock: 100 },
    { name: 'Energy Drink', description: 'Energy drink for late night study', price: 50, stock: 80 },
    { name: 'Chocolate Bar', description: 'Milk chocolate bar, 100g', price: 35, stock: 120 },
    { name: 'Potato Chips', description: 'Crispy potato chips, large pack', price: 45, stock: 90 },
    { name: 'Biscuits Pack', description: 'Assorted biscuits, family pack', price: 60, stock: 75 },
    { name: 'Bottled Water 1.5L', description: 'Pure drinking water', price: 20, stock: 150 },
    { name: 'Coffee 3-in-1 (10pc)', description: 'Instant coffee sachets', price: 120, stock: 60 },
    { name: 'Juice Box (6pc)', description: 'Mixed fruit juice boxes', price: 90, stock: 70 },
    { name: 'Peanuts Pack', description: 'Roasted peanuts, 200g', price: 55, stock: 85 },
    { name: 'Chewing Gum Pack', description: 'Sugar-free chewing gum', price: 25, stock: 110 },
  ];

  groceryProducts.forEach((p) => {
    products.push({
      id: `product_${productId++}`,
      shopId: 'shop_diredawa_grocery',
      name: p.name,
      description: p.description,
      price: p.price,
      category: 'Grocery',
      images: [`https://via.placeholder.com/400x400?text=${encodeURIComponent(p.name)}`],
      stock: p.stock,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  });

  return products;
};
