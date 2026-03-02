# Firebase Setup - Action Plan

## ✅ Current Status (Completed)

1. **Local Development Setup**: ✅ Working
   - Firebase Emulator configured and running
   - Demo credentials in place
   - All services enabled (Firestore, Auth, Storage)
   - Verification script created

2. **Documentation**: ✅ Complete
   - Comprehensive setup guide created (`FIREBASE_SETUP_GUIDE.md`)
   - Configuration verification script (`scripts/verify-firebase-config.js`)
   - Security rules documented
   - Cost estimates provided

## 🎯 Next Steps for Production

### Phase 1: Create Firebase Project (15-30 minutes)

**What you need to do:**

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click "Add project"
   - Project name: `misrak-shemeta-marketplace` (or your choice)
   - Enable Google Analytics (recommended)
   - Click "Create project"

3. **Enable Services**
   - **Firestore Database**:
     - Go to Build > Firestore Database
     - Click "Create database"
     - Choose "Production mode"
     - Location: `europe-west1` (Belgium) - closest to Ethiopia
   
   - **Authentication**:
     - Go to Build > Authentication
     - Click "Get started"
     - Enable "Anonymous" sign-in method
   
   - **Storage**:
     - Go to Build > Storage
     - Click "Get started"
     - Choose "Production mode"
     - Same location as Firestore

### Phase 2: Get Configuration (10 minutes)

**What you need to do:**

1. **Get Client Config**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps"
   - Click Web icon (`</>`)
   - Register app: "Misrak Shemeta Marketplace"
   - Copy the `firebaseConfig` object

2. **Get Service Account Key**
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - **IMPORTANT**: Keep this file secure!

### Phase 3: Configure Environment (10 minutes)

**What you need to do:**

1. **Create `.env.production.local`**
   - Copy from `.env.local.example`
   - Paste your Firebase config values
   - Paste service account JSON (as single line)
   - Remove emulator variables
   - Update Chapa keys (if you have production keys)

2. **Update `.firebaserc`**
   ```json
   {
     "projects": {
       "default": "your-production-project-id",
       "development": "demo-misrak-shemeta",
       "production": "your-production-project-id"
     }
   }
   ```

### Phase 4: Deploy Security Rules (5 minutes)

**What you need to do:**

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage

# Deploy indexes
firebase deploy --only firestore:indexes
```

### Phase 5: Test Production Setup (15 minutes)

**What you need to do:**

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Test locally with production Firebase**
   ```bash
   npm start
   ```

3. **Verify**:
   - Can create users
   - Can read/write Firestore
   - Can upload images
   - Check Firebase Console for data

## 📊 Decision Points

### Do you want to set up production Firebase now?

**Option A: Yes, set up production now**
- Follow Phase 1-5 above
- Takes about 1 hour total
- Allows testing with real Firebase
- Required before actual deployment

**Option B: Continue with emulator for now**
- Keep using current setup
- Set up production later (before deployment)
- Good for continued development

### Do you have Chapa production credentials?

**If YES**:
- Add them to `.env.production.local`
- Set `NEXT_PUBLIC_CHAPA_MODE=live`

**If NO**:
- Keep using sandbox mode
- Get production keys from Chapa before deployment
- Visit: https://chapa.co/

## 🔍 Quick Verification Commands

```bash
# Verify current configuration
node scripts/verify-firebase-config.js

# Start Firebase emulators (development)
firebase emulators:start

# Test production build
npm run build && npm start

# Deploy to Firebase (when ready)
firebase deploy
```

## 📝 Important Notes

### Security Checklist
- [ ] Never commit `.env.production.local` to Git
- [ ] Keep service account key secure
- [ ] Add `.env.production.local` to `.gitignore` (already done)
- [ ] Use environment variables for all secrets
- [ ] Enable Firebase App Check (recommended)

### Cost Management
- [ ] Set up billing alerts in Firebase Console
- [ ] Monitor usage in Firebase Console
- [ ] Start with Spark (free) plan for testing
- [ ] Upgrade to Blaze (pay-as-you-go) when ready

### Before Production Deployment
- [ ] Create production Firebase project
- [ ] Configure production environment variables
- [ ] Deploy security rules
- [ ] Deploy indexes
- [ ] Test thoroughly
- [ ] Set up monitoring
- [ ] Configure custom domain (if needed)

## 🆘 Need Help?

### Resources
- **Setup Guide**: See `FIREBASE_SETUP_GUIDE.md`
- **Firebase Docs**: https://firebase.google.com/docs
- **Firebase Console**: https://console.firebase.google.com/
- **Chapa Docs**: https://developer.chapa.co/

### Common Issues
- **"Permission denied"**: Check security rules
- **"Service account invalid"**: Re-download key from Firebase Console
- **"Emulator not connecting"**: Verify emulator is running

## ✨ What's Next?

After Firebase setup, you can move on to:
1. **Chapa Payment Configuration** - Set up production payment gateway
2. **Telegram Bot Setup** - Configure bot for production
3. **Testing** - End-to-end testing with real services
4. **Deployment** - Deploy to Vercel/production server

---

**Current Recommendation**: Continue development with emulator, set up production Firebase when you're ready to deploy (probably in 1-2 weeks).
