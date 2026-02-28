# Seed Data Summary

**Date**: February 28, 2026  
**Total Shops**: 8 (4 from Harar, 4 from Dire Dawa)  
**Total Products**: 72 (9 unique products per shop)

---

## Harar Shops (4 shops)

### 1. Harar Tech Hub (Electronics)
**Location**: Harar  
**Owner**: user_merchant_1  
**Contact**: +251911234567  
**Products** (9):
1. Wireless Headphones - 1500 ETB
2. USB-C Cable 2m - 150 ETB
3. Power Bank 20000mAh - 800 ETB
4. Wireless Mouse - 450 ETB
5. Phone Stand - 200 ETB
6. Laptop Cooling Pad - 600 ETB
7. Webcam HD 1080p - 1200 ETB
8. USB Hub 4-Port - 350 ETB
9. Bluetooth Speaker - 900 ETB

### 2. Harar Academic Books (Books)
**Location**: Harar  
**Owner**: user_merchant_1  
**Contact**: +251911234568  
**Products** (9):
1. Engineering Mathematics - 450 ETB
2. Physics Textbook - 500 ETB
3. Chemistry Lab Manual - 350 ETB
4. Programming in Python - 400 ETB
5. Data Structures & Algorithms - 550 ETB
6. English Grammar Guide - 300 ETB
7. Economics Principles - 420 ETB
8. Biology Textbook - 480 ETB
9. History of Ethiopia - 380 ETB

### 3. Harar Fashion Boutique (Clothing)
**Location**: Harar  
**Owner**: user_merchant_1  
**Contact**: +251911234569  
**Products** (9):
1. Cotton T-Shirt - 250 ETB
2. Denim Jeans - 800 ETB
3. Hoodie Sweatshirt - 650 ETB
4. Casual Shirt - 450 ETB
5. Sports Jacket - 900 ETB
6. Polo Shirt - 350 ETB
7. Cargo Pants - 700 ETB
8. Sweater - 550 ETB
9. Track Pants - 400 ETB

### 4. Harar Beauty Corner (Cosmetics)
**Location**: Harar  
**Owner**: user_merchant_1  
**Contact**: +251911234570  
**Products** (9):
1. Face Moisturizer - 350 ETB
2. Sunscreen SPF 50 - 400 ETB
3. Lip Balm Set - 150 ETB
4. Shampoo & Conditioner - 450 ETB
5. Body Lotion - 300 ETB
6. Face Wash - 250 ETB
7. Deodorant Spray - 200 ETB
8. Hair Oil - 280 ETB
9. Hand Cream - 180 ETB

---

## Dire Dawa Shops (4 shops)

### 5. Dire Dawa Shoe Palace (Footwear)
**Location**: Dire Dawa  
**Owner**: user_merchant_2  
**Contact**: +251922345678  
**Products** (9):
1. Running Shoes - 1200 ETB
2. Casual Sneakers - 900 ETB
3. Sandals - 400 ETB
4. Formal Shoes - 1500 ETB
5. Canvas Shoes - 600 ETB
6. Slippers - 250 ETB
7. Basketball Shoes - 1400 ETB
8. Hiking Boots - 1800 ETB
9. Flip Flops - 180 ETB

### 6. Dire Dawa Office Supplies (Stationery)
**Location**: Dire Dawa  
**Owner**: user_merchant_2  
**Contact**: +251922345679  
**Products** (9):
1. Notebook Set (5pc) - 200 ETB
2. Pen Set (10pc) - 80 ETB
3. Scientific Calculator - 350 ETB
4. Highlighter Set - 120 ETB
5. Sticky Notes Pack - 90 ETB
6. Pencil Case - 150 ETB
7. Ruler & Compass Set - 180 ETB
8. Stapler & Staples - 220 ETB
9. File Folders (10pc) - 160 ETB

### 7. Dire Dawa Sports Arena (Sports Equipment)
**Location**: Dire Dawa  
**Owner**: user_merchant_2  
**Contact**: +251922345680  
**Products** (9):
1. Football/Soccer Ball - 450 ETB
2. Basketball - 500 ETB
3. Volleyball - 400 ETB
4. Tennis Racket - 800 ETB
5. Badminton Set - 600 ETB
6. Jump Rope - 120 ETB
7. Yoga Mat - 350 ETB
8. Dumbbells 5kg Pair - 700 ETB
9. Resistance Bands Set - 280 ETB

### 8. Dire Dawa Campus Mart (Grocery/Snacks)
**Location**: Dire Dawa  
**Owner**: user_merchant_2  
**Contact**: +251922345681  
**Products** (9):
1. Instant Noodles (5pc) - 80 ETB
2. Energy Drink - 50 ETB
3. Chocolate Bar - 35 ETB
4. Potato Chips - 45 ETB
5. Biscuits Pack - 60 ETB
6. Bottled Water 1.5L - 20 ETB
7. Coffee 3-in-1 (10pc) - 120 ETB
8. Juice Box (6pc) - 90 ETB
9. Peanuts Pack - 55 ETB

---

## Test Users

1. **Buyer 1** (telegramId: 123456789)
   - Role: STUDENT
   - Home Location: Haramaya_Main
   - Language: English

2. **Buyer 2** (telegramId: 987654321)
   - Role: STUDENT
   - Home Location: Harar_Campus
   - Language: Amharic

3. **Merchant 1** (telegramId: 111222333)
   - Role: MERCHANT
   - Owns: Harar shops (4 shops)
   - Language: English

4. **Merchant 2** (telegramId: 444555666)
   - Role: MERCHANT
   - Owns: Dire Dawa shops (4 shops)
   - Language: Afaan Oromo

5. **Runner 1** (telegramId: 777888999)
   - Role: RUNNER
   - Location: Harar
   - Language: English

---

## Price Ranges by Category

- **Electronics**: 150 - 1500 ETB
- **Books**: 300 - 550 ETB
- **Clothing**: 250 - 900 ETB
- **Cosmetics**: 150 - 450 ETB
- **Footwear**: 180 - 1800 ETB
- **Stationery**: 80 - 350 ETB
- **Sports**: 120 - 800 ETB
- **Grocery**: 20 - 120 ETB

---

## Testing Scenarios

### Delivery Fee Testing
- **Harar → Harar Campus**: 40 ETB (intra-city)
- **Harar → Haramaya Main**: 100 ETB (city-to-campus)
- **Harar → DDU**: 180 ETB (inter-city)
- **Dire Dawa → DDU**: 40 ETB (intra-city)
- **Dire Dawa → Haramaya Main**: 100 ETB (city-to-campus)
- **Dire Dawa → Harar Campus**: 180 ETB (inter-city)

### Multi-Shop Orders
Test orders with products from multiple shops to verify:
- Separate delivery fees per shop
- Correct order item grouping
- Shop owner order filtering

### Stock Management
Products have varying stock levels (8-150 units) to test:
- Low stock warnings
- Out of stock scenarios
- Stock deduction on order creation
- Stock restoration on order cancellation

---

## Firebase Emulator Access

- **Firestore UI**: http://localhost:4000/firestore
- **Auth UI**: http://localhost:4000/auth
- **Storage UI**: http://localhost:4000/storage

---

**Note**: All data is seeded in the Firebase Emulator and will be cleared when the emulator is stopped. Run the seed script again to repopulate data.
