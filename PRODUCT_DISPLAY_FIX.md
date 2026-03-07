# Product Display Issue - Root Cause Analysis and Fix

## Problem Statement

Only 12 out of 18 seeded products are displayed, and products are showing without images.

## Root Cause Analysis

### Issue 1: Missing `shopCity` Field

**Hypothesis**: Some products in the database don't have the `shopCity` field, which is required for deliverability filtering.

**Evidence**:
- The `isDeliverable()` function requires `shopCity` to determine if a product can be delivered to a user's location
- Products without `shopCity` will be filtered out (12 visible = 18 total - 6 missing field)
- This suggests 2 shops' products (2 shops × 3 products = 6) are missing the `shopCity` field

**Why this happened**:
- Database might have been seeded multiple times
- Earlier seed operations might not have included the `shopCity` field
- The field was added later as a denormalization optimization

### Issue 2: Image URLs

**Hypothesis**: Images are using placeholder URLs that might not be loading correctly.

**Evidence**:
- Current seed uses `ui-avatars.com` API to generate unique avatar images
- These should work, but might have loading issues or CORS problems

## Solution Implemented

### 1. Added Safety Check in Catalog Filter

**File**: `src/app/actions/catalog.ts`

Added a check to filter out products without `shopCity` and log a warning:

```typescript
if (filters.userLocation) {
  products = products.filter((product) => {
    // Skip products without shopCity (data integrity issue)
    if (!product.shopCity) {
      console.warn(`Product ${product.id} (${product.name}) missing shopCity field`);
      return false;
    }
    return isDeliverable(product.shopCity, filters.userLocation!);
  });
}
```

### 2. Created Database Management Endpoints

#### a. Debug Endpoint
**File**: `src/app/api/debug/products/route.ts`
**URL**: `GET /api/debug/products`

Returns all products with their `shopCity` field status to help diagnose the issue.

#### b. Cleanup Endpoint
**File**: `src/app/api/admin/cleanup/route.ts`
**URL**: `POST /api/admin/cleanup`

Deletes all shops and products from the database.

#### c. Reseed Endpoint
**File**: `src/app/api/admin/reseed/route.ts`
**URL**: `POST /api/admin/reseed`

Cleans up the database and reseeds with fresh data, ensuring all products have:
- Correct `shopCity` field
- Unique image URLs
- Proper shop associations

### 3. Created Management Scripts

**File**: `scripts/reseed-database.ts`

Script to easily reseed the database from the command line.

**File**: `scripts/README.md`

Documentation for all database management operations.

## How to Fix the Issue

### Option 1: Use the Reseed Endpoint (Recommended)

```bash
curl -X POST https://misrak-shemeta.vercel.app/api/admin/reseed \
  -H "Authorization: Bearer YOUR_SEED_TOKEN" \
  -H "Content-Type: application/json"
```

Or use the script:

```bash
npx tsx scripts/reseed-database.ts
```

### Option 2: Debug First, Then Reseed

1. Check what's in the database:
```bash
curl https://misrak-shemeta.vercel.app/api/debug/products
```

2. If products are missing `shopCity`, reseed:
```bash
curl -X POST https://misrak-shemeta.vercel.app/api/admin/reseed \
  -H "Authorization: Bearer YOUR_SEED_TOKEN"
```

## Expected Result After Fix

- **18 products** displayed (6 shops × 3 products)
- **All products** have unique images from ui-avatars.com
- **All products** are deliverable to all locations in the Eastern Triangle
- **Breakdown**:
  - 9 products from Harar (3 shops × 3 products)
  - 9 products from Dire Dawa (3 shops × 3 products)

## Verification Steps

1. Open the app: https://misrak-shemeta.vercel.app
2. Navigate to the Products page
3. Verify that 18 products are displayed
4. Verify that all products have images
5. Check the browser console for any warnings about missing `shopCity`

## Prevention

To prevent this issue in the future:

1. Always use the reseed endpoint instead of manual database operations
2. Ensure all seed operations include the `shopCity` field
3. Use the debug endpoint to verify data integrity after seeding
4. Add database schema validation in the future

## Technical Details

### Deliverability Matrix

According to requirements, all products from Harar and Dire Dawa should be deliverable to all locations in the Eastern Triangle:

| Shop City | User Location | Deliverable |
|-----------|---------------|-------------|
| Harar | Harar_Campus | ✅ Yes |
| Harar | Haramaya_Main | ✅ Yes |
| Harar | DDU | ✅ Yes |
| Dire Dawa | DDU | ✅ Yes |
| Dire Dawa | Haramaya_Main | ✅ Yes |
| Dire Dawa | Harar_Campus | ✅ Yes |

### Database Schema

**Product Document**:
```typescript
{
  id: string;
  shopId: string;
  shopCity: City; // REQUIRED: 'Harar' | 'Dire Dawa'
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

The `shopCity` field is denormalized for performance to avoid N+1 queries when filtering products by deliverability.
