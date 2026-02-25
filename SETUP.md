# Misrak Shemeta Marketplace - Local Setup Guide

This guide will help you run the Misrak Shemeta marketplace locally to test the implemented features.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase account (free tier is sufficient)
- Chapa account (for payment testing - optional for initial testing)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Firebase Setup

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it "misrak-shemeta-dev" (or your preferred name)
4. Disable Google Analytics (optional for development)
5. Click "Create project"

### 2.2 Enable Firebase Services

**Enable Firestore:**
1. In Firebase Console, go to "Build" → "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (preferably closest to Ethiopia)
5. Click "Enable"

**Enable Authentication:**
1. Go to "Build" → "Authentication"
2. Click "Get started"
3. Enable "Anonymous" provider (for Telegram auth simulation)

**Enable Storage:**
1. Go to "Build" → "Storage"
2. Click "Get started"
3. Choose "Start in test mode"
4. Click "Done"

### 2.3 Get Firebase Configuration

**Client Configuration:**
1. In Firebase Console, click the gear icon → "Project settings"
2. Scroll down to "Your apps"
3. Click the web icon (</>) to add a web app
4. Register app with nickname "Misrak Shemeta Web"
5. Copy the `firebaseConfig` object values

**Admin SDK Configuration:**
1. In "Project settings", go to "Service accounts" tab
2. Click "Generate new private key"
3. Download the JSON file
4. You'll use this content for `FIREBASE_SERVICE_ACCOUNT_KEY`

## Step 3: Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Firebase credentials:

```env
# Firebase Client (from Firebase Console → Project Settings → General)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin (paste the entire service account JSON as a single-line string)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-...@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'

# Chapa Payment Gateway (optional for initial testing)
CHAPA_SECRET_KEY=CHASECK_TEST-your-test-key
CHAPA_WEBHOOK_SECRET=your-webhook-secret
CHAPA_MODE=sandbox

# OpenAI (optional - only needed for AI Assistant feature)
OPENAI_API_KEY=sk-...

# Telegram (optional - for production Telegram Mini App)
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
```

**Important Notes:**
- For `FIREBASE_SERVICE_ACCOUNT_KEY`, paste the entire JSON content as a single-line string
- Replace newlines in the private key with `\n`
- Keep the single quotes around the JSON string
- For initial testing, you can skip Chapa and OpenAI keys

## Step 4: Seed Test Data (Optional)

Create some test data in Firestore manually:

### Create a Test User:
1. Go to Firestore Database in Firebase Console
2. Create collection: `users`
3. Add document with ID: `test-user-1`
```json
{
  "telegramId": "123456789",
  "role": "STUDENT",
  "homeLocation": "Haramaya_Main",
  "languagePreference": "en",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Create a Test Shop:
1. Create collection: `shops`
2. Add document with ID: `test-shop-1`
```json
{
  "name": "Test Shop Harar",
  "ownerId": "test-user-1",
  "city": "Harar",
  "contactPhone": "+251911234567",
  "balance": 0,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Create a Test Product:
1. Create collection: `products`
2. Add document with auto-generated ID
```json
{
  "shopId": "test-shop-1",
  "name": "Ethiopian Coffee",
  "description": "Premium Harar coffee beans",
  "price": 250,
  "category": "Food & Beverages",
  "images": ["https://via.placeholder.com/400"],
  "stock": 50,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Step 5: Run the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

## Step 6: Testing the Application

Since this is a Telegram Mini App, you have two options:

### Option A: Browser Testing (Recommended for Development)

1. Open `http://localhost:3000` in your browser
2. The app will work but without Telegram context
3. You'll need to simulate the Telegram user ID

**To test with a mock user:**
- The `TelegramAuthProvider` component has development mode
- It will use a mock user when not in Telegram environment
- Check `src/components/TelegramAuthProvider.tsx` for the mock user setup

### Option B: Telegram Mini App Testing (Production-like)

1. Create a Telegram Bot:
   - Message [@BotFather](https://t.me/botfather) on Telegram
   - Send `/newbot` and follow instructions
   - Copy the bot token to `.env.local` as `TELEGRAM_BOT_TOKEN`

2. Set up Mini App:
   - Message BotFather: `/newapp`
   - Select your bot
   - Provide app details
   - Set Web App URL to your ngrok/tunneling URL (see below)

3. Expose local server:
   ```bash
   # Install ngrok or similar
   ngrok http 3000
   ```
   - Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
   - Update your Telegram Mini App URL in BotFather

## What You Can Test

### ✅ Implemented Features (Tasks 1-12)

1. **User Authentication & Profile**
   - Home location selection (Haramaya_Main, Harar_Campus, DDU)
   - Language switching (English, Amharic, Afaan Oromo)

2. **Product Management (Shop Owner)**
   - Create products with images
   - Edit product details
   - Delete products
   - View product list (tenant-isolated)

3. **Product Discovery (Buyer)**
   - Browse product catalog
   - Search products
   - Filter by location and price
   - View product details with delivery fee

4. **Shopping Cart**
   - Add products to cart
   - Update quantities
   - Remove items
   - View cart total

5. **Order Lifecycle**
   - Create order from cart
   - Payment initiation (Chapa)
   - Order status tracking
   - OTP-based delivery verification
   - Order cancellation

6. **Shop Owner Dashboard**
   - View current balance
   - See pending orders (in escrow)
   - Track completed orders
   - View transaction history

7. **Delivery Management**
   - Shop owner: Mark orders as dispatched
   - Runner: Mark as arrived, submit OTP
   - Buyer: View OTP, track status

### 🚧 Not Yet Implemented (Tasks 13-19)

- AI Sales Assistant (OpenAI RAG)
- Shop Registration Flow
- Telegram SDK Integration (haptic feedback, viewport)
- Notifications System
- Property-based tests

## Troubleshooting

### Issue: "Firebase Admin SDK initialization failed"
- Check that `FIREBASE_SERVICE_ACCOUNT_KEY` is properly formatted
- Ensure the JSON is on a single line with escaped newlines
- Verify the service account has proper permissions

### Issue: "Module not found" errors
- Run `npm install` again
- Delete `node_modules` and `.next` folders, then reinstall:
  ```bash
  rm -rf node_modules .next
  npm install
  ```

### Issue: Firestore permission denied
- In Firebase Console, go to Firestore → Rules
- For development, use test mode rules:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if true;
      }
    }
  }
  ```
  **⚠️ Warning:** These rules allow anyone to read/write. Only use for development!

### Issue: Images not uploading
- Check Firebase Storage rules (should be in test mode)
- Verify `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is correct

## Development Tips

1. **Use Browser DevTools:**
   - Open Chrome DevTools (F12)
   - Use "Toggle device toolbar" (Ctrl+Shift+M) to simulate mobile
   - Test with different screen sizes

2. **Check Server Actions:**
   - Server Actions run on the server
   - Check terminal output for errors
   - Use `console.log` in Server Actions to debug

3. **Monitor Firestore:**
   - Keep Firebase Console open
   - Watch Firestore Database tab to see data changes in real-time

4. **Test Different User Roles:**
   - Create multiple test users with different roles (STUDENT, MERCHANT, RUNNER)
   - Test tenant isolation by creating multiple shops

## Next Steps

Once you've verified the basic functionality:

1. Test the complete order flow:
   - Buyer: Browse → Add to cart → Checkout → Track order
   - Shop owner: View order → Mark as dispatched
   - Runner: Mark as arrived → Submit OTP
   - Buyer: Provide OTP → Order completed

2. Verify multi-tenancy:
   - Create multiple shops
   - Ensure shop owners only see their own products/orders

3. Test Eastern Triangle Pricing:
   - Create products in different cities (Harar, Dire Dawa)
   - Check delivery fees for different routes

4. Test i18n:
   - Switch between languages
   - Verify translations display correctly

## Support

If you encounter issues:
1. Check the terminal for error messages
2. Check browser console for client-side errors
3. Verify Firebase Console for data/rules issues
4. Review the implementation in the codebase

Happy testing! 🚀
