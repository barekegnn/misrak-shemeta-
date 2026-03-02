# Vercel Production Deployment Guide

## Overview

This guide walks you through deploying your Misrak Shemeta marketplace to Vercel for production use. This is the proper approach for a real SaaS business where shop owners will trust their livelihoods.

## Prerequisites

✅ Vercel CLI installed (version 50.8.1)
✅ Git repository with all changes committed
✅ Firebase project configured
✅ Environment variables ready

## Step 1: Prepare Environment Variables

You'll need to add these environment variables to Vercel. Get them from your `.env.local` file:

### Firebase Configuration (Public)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Firebase Admin SDK (Secret)
```
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
```

### Admin Configuration (Secret)
```
ADMIN_TELEGRAM_IDS=123456789,987654321
```

### Chapa Payment (Secret)
```
CHAPA_SECRET_KEY=your_chapa_secret_key
NEXT_PUBLIC_CHAPA_PUBLIC_KEY=your_chapa_public_key
```

### OpenAI (Secret)
```
OPENAI_API_KEY=your_openai_api_key
```

### Telegram Bot (Public)
```
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

1. **Login to Vercel**
```bash
vercel login
```
Follow the prompts to authenticate.

2. **Deploy to Production**
```bash
vercel --prod
```

The CLI will:
- Ask if you want to link to an existing project (choose "No" for first deployment)
- Ask for project name (suggest: `misrak-shemeta-marketplace`)
- Ask which directory to deploy (press Enter for current directory)
- Build and deploy your application
- Give you a production URL (e.g., `https://misrak-shemeta-marketplace.vercel.app`)

3. **Add Environment Variables**

After deployment, add environment variables via CLI:

```bash
# Firebase Public Variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production

# Firebase Admin (paste the entire private key when prompted)
vercel env add FIREBASE_ADMIN_PROJECT_ID production
vercel env add FIREBASE_ADMIN_CLIENT_EMAIL production
vercel env add FIREBASE_ADMIN_PRIVATE_KEY production

# Admin IDs
vercel env add ADMIN_TELEGRAM_IDS production

# Chapa
vercel env add CHAPA_SECRET_KEY production
vercel env add NEXT_PUBLIC_CHAPA_PUBLIC_KEY production

# OpenAI
vercel env add OPENAI_API_KEY production

# Telegram Bot (add after creating bot)
vercel env add NEXT_PUBLIC_TELEGRAM_BOT_USERNAME production
```

4. **Redeploy with Environment Variables**
```bash
vercel --prod
```

### Option B: Deploy via Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click "Add New Project"

2. **Import Git Repository**
   - Connect your GitHub account
   - Select your repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add all variables from Step 1 above
   - Make sure to select "Production" for each variable

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-5 minutes)
   - Get your production URL

## Step 3: Configure Firebase for Production

### Update Firebase Security Rules

Your Firestore rules need to allow production domain:

1. Go to Firebase Console → Firestore Database → Rules
2. Ensure rules allow server-side access (already configured)

### Update Firebase Authentication

1. Go to Firebase Console → Authentication → Settings
2. Add your Vercel domain to authorized domains:
   - `your-project.vercel.app`
   - Any custom domain you'll use

### Update Firebase Storage CORS

If using Firebase Storage for images:

1. Create `cors.json`:
```json
[
  {
    "origin": ["https://your-project.vercel.app"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

2. Apply CORS configuration:
```bash
gsutil cors set cors.json gs://your-bucket-name.appspot.com
```

## Step 4: Create Production Telegram Bot

Now create your official production bot:

### 4.1 Create Bot via BotFather

1. Open Telegram → Search `@BotFather`
2. Send `/newbot`
3. **Bot Name**: `Misrak Shemeta Marketplace` (official name)
4. **Bot Username**: `misrak_shemeta_bot` (or similar - must be unique)
5. **Save the Bot Token** - you'll need it for future integrations

### 4.2 Configure Mini App Menu Button

1. Send `/setmenubutton` to BotFather
2. Select your bot
3. **Button Text**: `🛍️ Open Marketplace` (or `Shop Now`)
4. **Web App URL**: Your Vercel production URL
   ```
   https://your-project.vercel.app
   ```

### 4.3 Set Bot Description (Optional but Recommended)

1. Send `/setdescription` to BotFather
2. Select your bot
3. Enter description:
   ```
   Misrak Shemeta connects shops in Harar and Dire Dawa with students across Eastern Ethiopia. Browse products, place orders, and track deliveries - all with secure escrow payments.
   ```

### 4.4 Set Bot About Text (Optional)

1. Send `/setabouttext` to BotFather
2. Select your bot
3. Enter about text:
   ```
   Eastern Ethiopia's trusted marketplace platform
   ```

### 4.5 Set Bot Profile Picture (Optional)

1. Send `/setuserpic` to BotFather
2. Select your bot
3. Upload your marketplace logo

### 4.6 Update Environment Variable

Add your bot username to Vercel:
```bash
vercel env add NEXT_PUBLIC_TELEGRAM_BOT_USERNAME production
# Enter: misrak_shemeta_bot (or your bot username)
```

Then redeploy:
```bash
vercel --prod
```

## Step 5: Configure Chapa Webhook

Update your Chapa webhook URL to point to production:

1. Go to Chapa Dashboard
2. Navigate to Webhooks settings
3. Set webhook URL to:
   ```
   https://your-project.vercel.app/api/webhooks/chapa
   ```

## Step 6: Test Production Deployment

### 6.1 Test in Browser
1. Visit your Vercel URL in a browser
2. Test basic navigation
3. Check that Firebase connection works

### 6.2 Test in Telegram
1. Open your bot in Telegram
2. Click the menu button
3. Your marketplace should open inside Telegram
4. Test all user flows:
   - Browse products
   - Add to cart
   - Checkout (use Chapa test mode first)
   - Merchant dashboard
   - Admin dashboard

### 6.3 Test Telegram Authentication
The app should automatically:
- Detect your Telegram ID
- Create/retrieve your user profile
- Show personalized content

## Step 7: Switch from Emulator to Production Firebase

### Update Environment Variables

Make sure you're using production Firebase, not emulator:

**Remove these if present:**
```
FIRESTORE_EMULATOR_HOST
FIREBASE_AUTH_EMULATOR_HOST
FIREBASE_STORAGE_EMULATOR_HOST
```

**Ensure these are set:**
```
FIREBASE_ADMIN_PROJECT_ID=your_production_project
FIREBASE_ADMIN_CLIENT_EMAIL=your_production_service_account
FIREBASE_ADMIN_PRIVATE_KEY=your_production_private_key
```

### Seed Production Data (Optional)

If you want to seed initial data to production:

1. Update seed script to use production Firebase
2. Run seed script locally pointing to production
3. Or manually create initial shops/products via the UI

## Step 8: Monitor Production

### Vercel Dashboard
- Monitor deployments: https://vercel.com/dashboard
- View logs and analytics
- Check function execution times

### Firebase Console
- Monitor Firestore usage
- Check Authentication users
- Review Storage usage
- Monitor costs

### Chapa Dashboard
- Monitor payment transactions
- Check webhook delivery status
- Review transaction history

## Production Checklist

Before launching to real users:

- [ ] Vercel deployment successful
- [ ] All environment variables configured
- [ ] Production Telegram bot created and configured
- [ ] Bot menu button points to Vercel URL
- [ ] Firebase production database active
- [ ] Chapa webhook configured
- [ ] Test complete user flow in Telegram
- [ ] Test merchant flow
- [ ] Test admin access
- [ ] Test payment flow (Chapa sandbox first)
- [ ] Monitor logs for errors
- [ ] Set up admin Telegram IDs
- [ ] Create initial shops (or enable shop registration)
- [ ] Test on multiple devices (iOS, Android, Desktop)

## Custom Domain (Optional)

To use a custom domain like `marketplace.misrakshemeta.com`:

1. **Purchase Domain** (from Namecheap, GoDaddy, etc.)

2. **Add Domain to Vercel**
   ```bash
   vercel domains add marketplace.misrakshemeta.com
   ```

3. **Configure DNS**
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Wait for DNS propagation (5-60 minutes)

4. **Update Telegram Bot**
   - Send `/setmenubutton` to BotFather
   - Update URL to your custom domain

5. **Update Firebase**
   - Add custom domain to authorized domains

## Troubleshooting

### Build Fails on Vercel
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Test build locally: `npm run build`

### Environment Variables Not Working
- Ensure variables are added to "Production" environment
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Telegram Mini App Doesn't Load
- Check Vercel deployment status
- Verify bot menu button URL is correct
- Test URL in regular browser first
- Check browser console for errors

### Firebase Connection Fails
- Verify Firebase credentials in environment variables
- Check Firebase project is active
- Ensure service account has correct permissions

### Chapa Webhook Not Receiving Events
- Verify webhook URL in Chapa dashboard
- Check Vercel function logs
- Test webhook endpoint manually

## Cost Estimates

### Vercel
- **Hobby Plan**: Free
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS
  - Good for testing and small scale

- **Pro Plan**: $20/month
  - 1 TB bandwidth/month
  - Better performance
  - Team collaboration
  - Recommended for production

### Firebase
- **Spark Plan**: Free
  - 1 GB storage
  - 10 GB bandwidth/month
  - 50K reads/day, 20K writes/day
  - Good for testing

- **Blaze Plan**: Pay as you go
  - Free tier included
  - ~$25-100/month for small-medium scale
  - Recommended for production

### Total Estimated Cost
- **Testing**: $0/month (free tiers)
- **Small Scale** (100-500 users): $20-50/month
- **Medium Scale** (500-2000 users): $50-150/month

## Next Steps

After successful deployment:

1. **Announce Launch**
   - Share bot link with initial users
   - Post in relevant Telegram groups
   - Share on social media

2. **Monitor Performance**
   - Watch error logs daily
   - Monitor user feedback
   - Track key metrics (orders, revenue)

3. **Iterate and Improve**
   - Fix bugs quickly
   - Add requested features
   - Optimize performance

4. **Scale Infrastructure**
   - Upgrade Vercel plan if needed
   - Monitor Firebase usage
   - Optimize database queries

## Support

If you encounter issues:
- Check Vercel logs
- Check Firebase logs
- Review Telegram bot settings
- Test in browser first, then Telegram
- Check all environment variables are set correctly
