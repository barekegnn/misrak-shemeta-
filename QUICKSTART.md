# Quick Start Guide - 5 Minutes to Running

This is the fastest way to get Misrak Shemeta running locally for testing.

## 1. Install Dependencies (1 minute)

```bash
npm install
```

## 2. Minimal Firebase Setup (2 minutes)

### Create Firebase Project:
1. Go to https://console.firebase.google.com/
2. Click "Add project" → Name it → Disable Analytics → Create

### Enable Services (click through these quickly):
- **Firestore:** Build → Firestore Database → Create → Test mode → Enable
- **Authentication:** Build → Authentication → Get started → Enable Anonymous
- **Storage:** Build → Storage → Get started → Test mode → Done

### Get Credentials:
1. **Client Config:** Project Settings (gear icon) → Add web app → Copy config
2. **Admin Key:** Project Settings → Service Accounts → Generate new private key

## 3. Create .env.local (1 minute)

```bash
cp .env.local.example .env.local
```

Edit `.env.local` - paste your Firebase credentials:

```env
# From Firebase web app config
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# From service account JSON (paste entire JSON as single line)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

# Optional (skip for now)
CHAPA_SECRET_KEY=test-key
CHAPA_WEBHOOK_SECRET=test-secret
CHAPA_MODE=sandbox
```

**Tip:** For `FIREBASE_SERVICE_ACCOUNT_KEY`, open the downloaded JSON file, copy everything, and paste it as a single-line string between the quotes.

## 4. Run the App (30 seconds)

```bash
npm run dev
```

Open http://localhost:3000

## 5. Create Test Data (30 seconds)

Go to Firebase Console → Firestore Database → Start collection:

**Collection: `users`** → Document ID: `test-user-1`
```json
{
  "telegramId": "123456789",
  "role": "MERCHANT",
  "homeLocation": "Haramaya_Main",
  "languagePreference": "en",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Collection: `shops`** → Document ID: `test-shop-1`
```json
{
  "name": "Test Shop",
  "ownerId": "test-user-1",
  "city": "Harar",
  "contactPhone": "+251911234567",
  "balance": 0,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Collection: `products`** → Auto ID
```json
{
  "shopId": "test-shop-1",
  "name": "Test Product",
  "description": "A test product",
  "price": 100,
  "category": "Electronics",
  "images": ["https://via.placeholder.com/400"],
  "stock": 10,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## What to Test

### ✅ Working Features:

1. **Browse Products** - See the test product in catalog
2. **Add to Cart** - Click "Add to Cart"
3. **View Cart** - See cart with delivery fee
4. **Create Order** - Checkout (payment will be simulated)
5. **Track Order** - View order status
6. **Shop Dashboard** - View balance and orders

### 🎯 Test Flow:

```
Browse Products → Add to Cart → Checkout → 
Create Order → View Order → Track Status
```

## Common Issues

**"Firebase not initialized"**
- Check `.env.local` has all Firebase variables
- Restart dev server: `Ctrl+C` then `npm run dev`

**"Permission denied"**
- Firestore rules: Set to test mode (allow all for development)

**"Module not found"**
- Run `npm install` again

## Next Steps

See `SETUP.md` for:
- Detailed Firebase configuration
- Telegram Mini App setup
- Production deployment
- Advanced testing scenarios

## Need Help?

1. Check terminal for errors
2. Check browser console (F12)
3. Check Firebase Console for data
4. Review `SETUP.md` for detailed troubleshooting

That's it! You should now have a running marketplace. 🎉
