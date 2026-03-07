# Dashboard Access Guide for Misrak Shemeta Marketplace

**Date**: 2025-01-03  
**System Owner**: Telegram ID 779028866  
**Environment**: Local Development + Production

---

## 🎯 Overview

The Misrak Shemeta marketplace has **4 different user roles**, each with their own dashboard:

1. **STUDENT** (Customer) - Browse and buy products
2. **MERCHANT** (Shop Owner) - Manage shop, products, and orders
3. **RUNNER** (Delivery Person) - Manage deliveries
4. **ADMIN** (Platform Administrator) - Manage entire platform

---

## 🔐 How Role-Based Access Works

### User Role Assignment

User roles are stored in the Firebase `users` collection:

```typescript
interface User {
  id: string;
  telegramId: string;
  role: 'STUDENT' | 'MERCHANT' | 'RUNNER' | 'ADMIN';
  homeLocation: Location;
  languagePreference: Language;
  // ... other fields
}
```

### Current System Owner Configuration

Your Telegram ID (`779028866`) is configured as an **ADMIN** in:
- Environment variable: `ADMIN_TELEGRAM_IDS="779028866"`
- This gives you access to the admin dashboard

---

## 📱 Dashboard URLs

### 1. Admin Dashboard
**URL**: `/admin`  
**Full URL (Local)**: `http://localhost:3000/admin`  
**Full URL (Production)**: `https://misrak-shemeta.vercel.app/admin`

**Access Requirements**:
- Your Telegram ID must be in `ADMIN_TELEGRAM_IDS` environment variable
- In development mode: Automatically granted if `ADMIN_TELEGRAM_IDS` is set
- In production: Requires Telegram authentication

**Features**:
- Platform-wide statistics
- User management (suspend/activate users)
- Shop management (approve/suspend shops)
- Product management (remove products)
- Order management (view all orders, issue refunds)
- Financial overview (revenue, escrow balance)
- System monitoring (error logs, webhook history)

**Sub-pages**:
- `/admin` - Main dashboard with statistics
- `/admin/users` - User management
- `/admin/shops` - Shop management
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/financial` - Financial overview
- `/admin/monitoring` - System monitoring

---

### 2. Merchant Dashboard
**URL**: `/merchant`  
**Full URL (Local)**: `http://localhost:3000/merchant`  
**Full URL (Production)**: `https://misrak-shemeta.vercel.app/merchant`

**Access Requirements**:
- User role must be `MERCHANT`
- Must have a shop registered in the system

**Features**:
- Shop statistics (total products, orders, revenue)
- Product management (add/edit/delete products)
- Order management (view orders, update status)
- Balance dashboard (earnings, withdrawals)
- Shop settings

**Sub-pages**:
- `/merchant` - Main dashboard
- `/merchant/products` - Product management
- `/merchant/orders` - Order management
- `/merchant/settings` - Shop settings

---

### 3. Runner Dashboard
**URL**: `/runner/orders`  
**Full URL (Local)**: `http://localhost:3000/runner/orders`  
**Full URL (Production)**: `https://misrak-shemeta.vercel.app/runner/orders`

**Access Requirements**:
- User role must be `RUNNER`

**Features**:
- Active deliveries list
- Delivery status updates
- OTP verification
- Delivery history
- Earnings tracking

**Sub-pages**:
- `/runner/orders` - Active deliveries
- `/runner/orders/[orderId]` - Delivery details

---

### 4. Customer Dashboard (Student)
**URL**: `/` (Home page)  
**Full URL (Local)**: `http://localhost:3000/`  
**Full URL (Production)**: `https://misrak-shemeta.vercel.app/`

**Access Requirements**:
- User role is `STUDENT` (default for new users)

**Features**:
- Browse products
- Search and filter
- Shopping cart
- Checkout and payment
- Order tracking
- Profile management

**Sub-pages**:
- `/` - Home/Browse products
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/orders` - Order history
- `/orders/[orderId]` - Order details
- `/profile` - User profile

---

## 🧪 How to Test Each Dashboard

### Testing Admin Dashboard (You Already Have Access!)

Since your Telegram ID (779028866) is already configured as admin, you can access the admin dashboard directly:

**Local Development**:
```bash
# Open in browser
http://localhost:3000/admin
```

**Production**:
```bash
# Open in browser
https://misrak-shemeta.vercel.app/admin
```

The middleware will automatically grant you access in development mode.

---

### Testing Merchant Dashboard

To test the merchant dashboard, you need to:

#### Option 1: Update Your User Role in Database

1. **Access Firebase Console**:
   - Go to: https://console.firebase.google.com/
   - Select project: `misrak-shemeta-marketpla-fdbcf`
   - Navigate to Firestore Database

2. **Find Your User Document**:
   - Collection: `users`
   - Find document where `telegramId == "779028866"`
   - Your user ID is: `y3RnPvOisQLzhGXDEE9K`

3. **Update Role Field**:
   - Change `role` from `ADMIN` to `MERCHANT`
   - Save changes

4. **Create a Shop** (if you don't have one):
   - Visit: `http://localhost:3000/merchant/register`
   - Fill in shop details
   - Submit registration

5. **Access Merchant Dashboard**:
   - Visit: `http://localhost:3000/merchant`

#### Option 2: Create a Test Merchant User

Run this script to create a test merchant user:

```typescript
// scripts/create-test-merchant.ts
import { adminDb } from '@/lib/firebase/admin';

async function createTestMerchant() {
  const testMerchantId = '999999999'; // Test Telegram ID
  
  // Create user
  await adminDb.collection('users').add({
    telegramId: testMerchantId,
    role: 'MERCHANT',
    homeLocation: 'Harar_City',
    languagePreference: 'en',
    suspended: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  console.log('Test merchant created with Telegram ID:', testMerchantId);
}

createTestMerchant();
```

---

### Testing Runner Dashboard

To test the runner dashboard:

#### Option 1: Update Your User Role

1. **Access Firebase Console**
2. **Find Your User Document** (ID: `y3RnPvOisQLzhGXDEE9K`)
3. **Update Role Field**: Change to `RUNNER`
4. **Access Runner Dashboard**: `http://localhost:3000/runner/orders`

#### Option 2: Create a Test Runner User

Similar to merchant, create a test user with role `RUNNER`.

---

## 🔄 Switching Between Roles

Since you're the system owner, you can easily switch between roles for testing:

### Method 1: Update Firebase Directly

1. Go to Firebase Console
2. Find your user document
3. Change the `role` field
4. Refresh the dashboard

### Method 2: Create Multiple Test Users

Create separate test users for each role:
- Admin: `779028866` (you)
- Merchant: `888888888` (test)
- Runner: `777777777` (test)
- Student: `666666666` (test)

---

## 🛠️ Quick Setup Script

Let me create a script to help you set up test users for all roles:

```bash
# Run this to create test users for all roles
npm run setup-test-users
```

This will create:
- 1 test merchant with a shop
- 1 test runner
- 1 test student
- All with different Telegram IDs

---

## 📊 Dashboard Features Summary

### Admin Dashboard Features
✅ View platform statistics (users, shops, orders, revenue)  
✅ Manage users (suspend/activate)  
✅ Manage shops (approve/suspend)  
✅ Manage products (remove inappropriate items)  
✅ Manage orders (view all, issue refunds)  
✅ Financial overview (revenue, escrow, withdrawals)  
✅ System monitoring (errors, webhooks, API logs)

### Merchant Dashboard Features
✅ View shop statistics  
✅ Add/edit/delete products  
✅ Manage product inventory  
✅ View and process orders  
✅ Track earnings and balance  
✅ Request withdrawals  
✅ Update shop settings

### Runner Dashboard Features
✅ View assigned deliveries  
✅ Update delivery status  
✅ Verify OTP on delivery  
✅ View delivery history  
✅ Track earnings

### Customer Dashboard Features
✅ Browse products by category  
✅ Search and filter products  
✅ Add items to cart  
✅ Checkout and pay via Chapa  
✅ Track order status  
✅ Verify delivery with OTP  
✅ View order history

---

## 🚨 Important Notes

### Development Mode
- In development, admin access is automatically granted if `ADMIN_TELEGRAM_IDS` is set
- No Telegram authentication required locally
- You can manually set cookies or headers to simulate different users

### Production Mode
- Requires proper Telegram Mini App authentication
- User role is fetched from Firebase based on Telegram ID
- Middleware protects admin routes
- Unauthorized access redirects to `/unauthorized` page

### Role Hierarchy
```
ADMIN (highest privileges)
  ↓
MERCHANT (shop management)
  ↓
RUNNER (delivery management)
  ↓
STUDENT (customer, default role)
```

---

## 🔧 Troubleshooting

### "Unauthorized" Error on Admin Dashboard

**Problem**: Getting redirected to `/unauthorized`  
**Solution**:
1. Check `ADMIN_TELEGRAM_IDS` in `.env.local`
2. Verify your Telegram ID is included: `"779028866"`
3. Restart the dev server: `npm run dev`

### "No Shop Found" on Merchant Dashboard

**Problem**: Merchant dashboard shows "Register Shop" message  
**Solution**:
1. Your user role is `MERCHANT` but you don't have a shop
2. Visit `/merchant/register` to create a shop
3. Or check Firebase to see if shop exists for your user ID

### Can't Access Runner Dashboard

**Problem**: Getting redirected or seeing wrong content  
**Solution**:
1. Check your user role in Firebase
2. Must be exactly `RUNNER` (case-sensitive)
3. Update role if needed

---

## 📞 Next Steps

1. **Access Admin Dashboard**: You can do this right now!
   - Local: `http://localhost:3000/admin`
   - Production: `https://misrak-shemeta.vercel.app/admin`

2. **Test Merchant Dashboard**: 
   - Create a test merchant user
   - Or temporarily change your role to `MERCHANT`

3. **Test Runner Dashboard**:
   - Create a test runner user
   - Or temporarily change your role to `RUNNER`

4. **Create Test Data**:
   - Use the seed scripts to populate test data
   - Create sample products, orders, etc.

Would you like me to create a script to help you set up test users for all roles?
