# Firebase Setup & Configuration Guide

## Current Status

✅ **Local Development**: Configured with Firebase Emulator (demo credentials)
⏳ **Production**: Not yet configured (needs real Firebase project)

## Overview

Your application currently uses:
- **Firebase Emulator** for local development (Firestore, Auth, Storage)
- **Demo credentials** in `.env.local`
- **Emulator UI** at http://localhost:4000

## Setup Options

### Option 1: Continue with Emulator (Current Setup)
**Best for**: Local development and testing
**Status**: ✅ Already configured

Your current setup:
- Firestore Emulator: `127.0.0.1:8080`
- Auth Emulator: `127.0.0.1:9099`
- Storage Emulator: `127.0.0.1:9199`
- Emulator UI: `127.0.0.1:4000`

**To start emulators**:
```bash
firebase emulators:start
```

### Option 2: Set Up Production Firebase Project
**Best for**: Production deployment
**Status**: ⏳ Needs configuration

## Production Firebase Setup Steps

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `misrak-shemeta-marketplace` (or your preferred name)
4. Enable Google Analytics (optional but recommended)
5. Click "Create project"

### Step 2: Enable Required Services

#### 2.1 Enable Firestore Database
1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **Production mode** (we'll set rules later)
4. Select location: Choose closest to Ethiopia
   - Recommended: `europe-west1` (Belgium) or `asia-south1` (Mumbai)
5. Click "Enable"

#### 2.2 Enable Authentication
1. Go to **Build > Authentication**
2. Click "Get started"
3. Enable **Anonymous** sign-in method (for Telegram users)
4. Click "Save"

#### 2.3 Enable Storage
1. Go to **Build > Storage**
2. Click "Get started"
3. Choose **Production mode**
4. Select same location as Firestore
5. Click "Done"

### Step 3: Get Firebase Configuration

#### 3.1 Get Client Configuration (Public)
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register app name: `Misrak Shemeta Marketplace`
5. Copy the `firebaseConfig` object

Example:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "misrak-shemeta.firebaseapp.com",
  projectId: "misrak-shemeta",
  storageBucket: "misrak-shemeta.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

#### 3.2 Get Service Account Key (Private - Server-side)
1. In Firebase Console, go to **Project Settings > Service Accounts**
2. Click "Generate new private key"
3. Click "Generate key" - a JSON file will download
4. **IMPORTANT**: Keep this file secure! Never commit to Git!

### Step 4: Configure Environment Variables

#### 4.1 Create Production Environment File

Create `.env.production.local` (this file should NOT be committed to Git):

```bash
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side) - Paste entire service account JSON as single line
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your_project_id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'

# DO NOT include emulator variables in production
# FIRESTORE_EMULATOR_HOST=  # Remove or comment out
# FIREBASE_AUTH_EMULATOR_HOST=  # Remove or comment out
# FIREBASE_STORAGE_EMULATOR_HOST=  # Remove or comment out

# Chapa Payment Gateway (Production)
CHAPA_SECRET_KEY=your_production_chapa_key
CHAPA_WEBHOOK_SECRET=your_production_webhook_secret
NEXT_PUBLIC_CHAPA_MODE=live

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Application URL (Production)
NEXT_PUBLIC_APP_URL=https://your-production-domain.com

# Admin Access (Real Telegram IDs)
ADMIN_TELEGRAM_IDS=your_telegram_id,another_admin_id
```

#### 4.2 Update `.firebaserc` for Production

```json
{
  "projects": {
    "default": "your-production-project-id",
    "development": "demo-misrak-shemeta",
    "production": "your-production-project-id"
  }
}
```

### Step 5: Set Up Firestore Security Rules

Update `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isMerchant() {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'merchant';
    }
    
    function isRunner() {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'runner';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Shops collection
    match /shops/{shopId} {
      allow read: if true; // Public read
      allow create: if isAuthenticated();
      allow update: if isAdmin() || 
                      (isMerchant() && resource.data.ownerId == request.auth.uid);
      allow delete: if isAdmin();
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if true; // Public read
      allow create: if isMerchant();
      allow update: if isAdmin() || 
                      (isMerchant() && resource.data.shopId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.shops);
      allow delete: if isAdmin() || 
                      (isMerchant() && resource.data.shopId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.shops);
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if isAuthenticated() && 
                    (isAdmin() || 
                     resource.data.customerId == request.auth.uid ||
                     resource.data.runnerId == request.auth.uid ||
                     resource.data.shopId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.shops);
      allow create: if isAuthenticated();
      allow update: if isAdmin() || 
                      resource.data.customerId == request.auth.uid ||
                      resource.data.runnerId == request.auth.uid ||
                      resource.data.shopId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.shops;
      allow delete: if isAdmin();
    }
    
    // Payments collection
    match /payments/{paymentId} {
      allow read: if isAuthenticated() && 
                    (isAdmin() || resource.data.userId == request.auth.uid);
      allow create: if isAuthenticated();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Admin-only collections
    match /systemLogs/{logId} {
      allow read, write: if isAdmin();
    }
    
    match /webhookHistory/{webhookId} {
      allow read, write: if isAdmin();
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

### Step 6: Set Up Storage Security Rules

Update `storage.rules`:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isMerchant() {
      return isAuthenticated() && 
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'merchant';
    }
    
    function isValidImageSize() {
      return request.resource.size < 5 * 1024 * 1024; // 5MB
    }
    
    function isValidImageType() {
      return request.resource.contentType.matches('image/.*');
    }
    
    // Product images
    match /products/{shopId}/{imageId} {
      allow read: if true; // Public read
      allow write: if isAuthenticated() && 
                     (isAdmin() || isMerchant()) &&
                     isValidImageSize() &&
                     isValidImageType();
      allow delete: if isAdmin() || isMerchant();
    }
    
    // Shop images
    match /shops/{shopId}/{imageId} {
      allow read: if true; // Public read
      allow write: if isAuthenticated() && 
                     (isAdmin() || isMerchant()) &&
                     isValidImageSize() &&
                     isValidImageType();
      allow delete: if isAdmin() || isMerchant();
    }
    
    // User profile images
    match /users/{userId}/{imageId} {
      allow read: if true; // Public read
      allow write: if isAuthenticated() && 
                     (request.auth.uid == userId || isAdmin()) &&
                     isValidImageSize() &&
                     isValidImageType();
      allow delete: if isAuthenticated() && 
                      (request.auth.uid == userId || isAdmin());
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only storage
```

### Step 7: Create Firestore Indexes

Update `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "shopId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "price", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "customerId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "shopId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "runnerId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

## Environment Switching

### Development (Emulator)
```bash
# Use .env.local with emulator settings
npm run dev
```

### Production
```bash
# Use .env.production.local with real Firebase
npm run build
npm start
```

## Verification Checklist

### Local Development (Emulator)
- [ ] Firebase emulators start successfully
- [ ] Can create users in Auth emulator
- [ ] Can write/read from Firestore emulator
- [ ] Can upload images to Storage emulator
- [ ] Emulator UI accessible at http://localhost:4000

### Production Setup
- [ ] Firebase project created
- [ ] Firestore enabled and configured
- [ ] Authentication enabled (Anonymous)
- [ ] Storage enabled and configured
- [ ] Service account key downloaded
- [ ] Environment variables configured in `.env.production.local`
- [ ] Security rules deployed
- [ ] Indexes deployed
- [ ] Can authenticate users
- [ ] Can write/read from Firestore
- [ ] Can upload images to Storage

## Security Best Practices

### ✅ DO
- Keep service account keys secure
- Use environment variables for sensitive data
- Add `.env.production.local` to `.gitignore`
- Use Firebase Security Rules
- Enable Firebase App Check (recommended)
- Monitor Firebase usage and costs
- Set up billing alerts

### ❌ DON'T
- Commit service account keys to Git
- Share API keys publicly
- Use demo/test credentials in production
- Disable security rules
- Ignore Firebase security warnings

## Cost Optimization

### Free Tier Limits (Spark Plan)
- **Firestore**: 1 GB storage, 50K reads/day, 20K writes/day
- **Storage**: 5 GB storage, 1 GB/day downloads
- **Authentication**: Unlimited

### Paid Plan (Blaze - Pay as you go)
Required for:
- Production deployment
- Cloud Functions (if needed)
- Higher usage limits

**Estimated Monthly Cost** (for small marketplace):
- Firestore: $5-20/month
- Storage: $2-10/month
- Authentication: Free
- **Total**: ~$10-30/month

## Troubleshooting

### Issue: "Firebase Admin SDK not initialized"
**Solution**: Check `FIREBASE_SERVICE_ACCOUNT_KEY` is set correctly

### Issue: "Permission denied" errors
**Solution**: Review and update Firestore security rules

### Issue: "Emulator not connecting"
**Solution**: 
1. Check emulator is running: `firebase emulators:start`
2. Verify `FIRESTORE_EMULATOR_HOST` is set in `.env.local`
3. Clear browser cache

### Issue: "Service account key invalid"
**Solution**: 
1. Download new service account key from Firebase Console
2. Ensure JSON is properly formatted (single line, escaped quotes)
3. Verify no extra spaces or line breaks

## Next Steps

1. **Immediate**: Verify current emulator setup works
2. **Before Production**: Create production Firebase project
3. **Before Deployment**: Configure production environment variables
4. **After Deployment**: Monitor Firebase usage and costs

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Firebase Status](https://status.firebase.google.com/)
