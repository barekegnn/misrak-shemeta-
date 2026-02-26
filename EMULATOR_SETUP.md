# Firebase Emulator Setup Guide

This guide explains how to set up and use the Firebase Emulator for local development and testing of the Misrak Shemeta marketplace.

## Prerequisites

- Node.js 18+ installed
- Firebase CLI installed globally: `npm install -g firebase-tools`
- Java JDK 11+ (required for Firestore Emulator)

## Installation

1. **Install Firebase CLI** (if not already installed):
```bash
npm install -g firebase-tools
```

2. **Login to Firebase** (optional, but recommended):
```bash
firebase login
```

3. **Initialize Firebase in the project** (already done):
The project already has `firebase.json` configured with emulator settings.

## Starting the Emulator

### Option 1: Start all emulators
```bash
firebase emulators:start
```

This will start:
- **Firestore Emulator** on `http://127.0.0.1:8080`
- **Auth Emulator** on `http://127.0.0.1:9099`
- **Storage Emulator** on `http://127.0.0.1:9199`
- **Emulator UI** on `http://127.0.0.1:4000`

### Option 2: Start specific emulators
```bash
firebase emulators:start --only firestore,auth,storage
```

### Option 3: Start with import/export
```bash
# Export data
firebase emulators:start --export-on-exit=./emulator-data

# Import data on start
firebase emulators:start --import=./emulator-data
```

## Configuring Your Application

### Environment Variables

Create a `.env.local` file with emulator configuration:

```env
# Firebase Emulator Configuration
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199

# Use demo project for emulator
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-misrak-shemeta

# Other Firebase config (use dummy values for emulator)
NEXT_PUBLIC_FIREBASE_API_KEY=demo-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-misrak-shemeta.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=demo-misrak-shemeta.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Chapa (use sandbox mode)
CHAPA_SECRET_KEY=your_chapa_sandbox_key
CHAPA_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_CHAPA_MODE=sandbox

# OpenAI (optional for AI assistant)
OPENAI_API_KEY=your_openai_key
```

### Update Firebase Config

The Firebase client config (`src/lib/firebase/config.ts`) and admin config (`src/lib/firebase/admin.ts`) will automatically detect and use the emulator when the environment variables are set.

## Seeding Test Data

### Automatic Seed Script

Run the seed script to populate the emulator with test data:

```bash
# Set emulator host
export FIRESTORE_EMULATOR_HOST=127.0.0.1:8080

# Run seed script
npx ts-node scripts/seed-data.ts
```

This creates:
- 5 test users (buyers, merchants, runner)
- 2 test shops (Harar and Dire Dawa)
- 6 test products
- 1 sample cart
- 1 sample order

### Manual Data Creation

You can also create data manually through:
1. **Emulator UI**: http://127.0.0.1:4000
2. **Your application**: Run the app and create data through the UI

## Test Users

The seed script creates these test users:

### Buyers
- **Telegram ID**: `123456789`
  - Role: STUDENT
  - Location: Haramaya_Main
  - Language: English

- **Telegram ID**: `987654321`
  - Role: STUDENT
  - Location: Harar_Campus
  - Language: Amharic

### Merchants
- **Telegram ID**: `111222333`
  - Role: MERCHANT
  - Shop: Harar Electronics
  - Language: English

- **Telegram ID**: `444555666`
  - Role: MERCHANT
  - Shop: Dire Dawa Books & Stationery
  - Language: Afaan Oromo

### Runner
- **Telegram ID**: `777888999`
  - Role: RUNNER
  - Location: Harar
  - Language: English

## Running the Application

1. **Start the Firebase Emulator**:
```bash
firebase emulators:start
```

2. **In a new terminal, start the Next.js dev server**:
```bash
npm run dev
```

3. **Access the application**:
- App: http://localhost:3000
- Emulator UI: http://127.0.0.1:4000

## Testing Workflows

### Buyer Flow
1. Use Telegram ID `123456789` (development mode)
2. Browse products
3. Add items to cart
4. Checkout and create order
5. Make payment (Chapa sandbox)
6. View order status

### Shop Owner Flow
1. Use Telegram ID `111222333`
2. View shop dashboard
3. Manage products (create, edit, delete)
4. View orders
5. Mark orders as DISPATCHED

### Runner Flow
1. Use Telegram ID `777888999`
2. View active deliveries
3. Mark orders as ARRIVED
4. Submit OTP for completion

## Emulator UI Features

Access the Emulator UI at http://127.0.0.1:4000 to:

- **View Firestore data**: Browse collections and documents
- **View Auth users**: See authenticated users
- **View Storage files**: Browse uploaded files
- **View logs**: See emulator logs and requests
- **Export data**: Save emulator state for later use

## Troubleshooting

### Emulator won't start
- Check if ports are already in use (8080, 9099, 9199, 4000)
- Ensure Java JDK 11+ is installed
- Try: `firebase emulators:start --debug`

### Application not connecting to emulator
- Verify environment variables are set correctly
- Check that `FIRESTORE_EMULATOR_HOST` is set before starting the app
- Restart the Next.js dev server after setting env vars

### Data not persisting
- Use `--export-on-exit` flag to save data
- Use `--import` flag to load saved data

### Port conflicts
- Change ports in `firebase.json` if needed
- Update environment variables accordingly

## Clearing Data

To clear all emulator data:
```bash
# Stop the emulator (Ctrl+C)
# Delete the emulator data directory
rm -rf .firebase/

# Restart the emulator
firebase emulators:start
```

## Production vs Emulator

### Emulator (Development)
- Uses local Firebase services
- No costs
- Fast iteration
- Isolated from production data
- Requires manual data seeding

### Production
- Uses real Firebase services
- Costs apply
- Real user data
- Requires proper security rules
- Automatic data persistence

## Next Steps

After testing with the emulator:
1. Test all user flows thoroughly
2. Verify security rules work correctly
3. Test edge cases and error scenarios
4. Deploy to staging environment
5. Configure production Firebase project
6. Deploy to production

## Resources

- [Firebase Emulator Suite Documentation](https://firebase.google.com/docs/emulator-suite)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage Security Rules](https://firebase.google.com/docs/storage/security)
