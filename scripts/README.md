# Database Management Scripts

This directory contains scripts for managing the Firebase database.

## Available Scripts

### 1. Reseed Database

Cleans up all existing shops and products, then seeds fresh data.

```bash
npx tsx scripts/reseed-database.ts
```

### 2. Seed Database (Initial)

Seeds the database with sample data (only if empty).

```bash
npx tsx scripts/seed-firebase.ts
```

### 3. Setup Telegram Webhook

Registers the Telegram bot webhook with the Telegram API.

```bash
npx tsx scripts/setup-telegram-webhook.ts
```

## API Endpoints

### Debug Products

Check what products are in the database:

```bash
curl https://misrak-shemeta.vercel.app/api/debug/products
```

### Reseed Database

Clean up and reseed the database:

```bash
curl -X POST https://misrak-shemeta.vercel.app/api/admin/reseed \
  -H "Authorization: Bearer YOUR_SEED_TOKEN" \
  -H "Content-Type: application/json"
```

### Cleanup Database

Delete all shops and products:

```bash
curl -X POST https://misrak-shemeta.vercel.app/api/admin/cleanup \
  -H "Authorization: Bearer YOUR_SEED_TOKEN" \
  -H "Content-Type: application/json"
```

### Seed Database

Seed the database (only if empty):

```bash
curl -X POST https://misrak-shemeta.vercel.app/api/admin/seed \
  -H "Authorization: Bearer YOUR_SEED_TOKEN" \
  -H "Content-Type: application/json"
```

## Environment Variables

Make sure these are set in your `.env.local` or Vercel environment:

- `SEED_API_TOKEN`: Token for protecting admin endpoints (default: `dev-seed-token`)
- `NEXT_PUBLIC_VERCEL_URL`: Your Vercel deployment URL

## Sample Data

The reseed script creates:
- **6 shops**: 3 in Harar, 3 in Dire Dawa
- **18 products**: 3 products per shop
- All products have unique images generated via ui-avatars.com
- All products have the `shopCity` field for deliverability filtering

## Troubleshooting

### Products not showing up

1. Check the debug endpoint to see what's in the database
2. Verify that all products have the `shopCity` field
3. Check the browser console for any errors
4. Reseed the database to ensure clean data

### Images not loading

1. Check if the image URLs are correct in the database
2. Verify that ui-avatars.com is accessible
3. Check the browser console for CORS or network errors
