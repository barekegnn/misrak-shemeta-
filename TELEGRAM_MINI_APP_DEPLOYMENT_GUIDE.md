# Telegram Mini App Deployment & Testing Guide

## Overview

Your Misrak Shemeta marketplace is built as a **Telegram Mini App**, but currently runs in Chrome for development. This guide explains how to deploy and test it in the actual Telegram environment.

## Current Development Setup (Chrome Browser)

**What you're doing now:**
- Running `npm run dev` on `http://localhost:3000`
- Testing in Chrome browser
- Using hardcoded Telegram IDs for authentication
- This is ONLY for development and testing individual features

**Limitations:**
- No real Telegram authentication
- No Telegram UI integration
- No access to Telegram user data
- No Telegram-specific features (haptic feedback, theme, etc.)

---

## Deploying to Telegram Mini App (Production/Staging)

### Phase 1: Deploy Your App to a Public URL

Telegram Mini Apps require a **publicly accessible HTTPS URL**. You have several options:

#### Option A: Vercel (Recommended - Easiest)
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel

# 4. Get your production URL (e.g., https://misrak-shemeta.vercel.app)
vercel --prod
```

**Pros:**
- Free tier available
- Automatic HTTPS
- Easy deployment
- Great for Next.js apps

#### Option B: Netlify
```bash
# 1. Install Netlify CLI
npm i -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --prod
```

#### Option C: Your Own Server
- Deploy to your VPS/cloud server
- Ensure HTTPS is configured (required by Telegram)
- Use nginx/Apache as reverse proxy

---

### Phase 2: Create a Telegram Bot

**Step 1: Talk to BotFather**

1. Open Telegram and search for `@BotFather`
2. Start a chat and send `/newbot`
3. Follow the prompts:
   - Bot name: `Misrak Shemeta Marketplace`
   - Bot username: `misrak_shemeta_bot` (must end with 'bot')
4. Save the **Bot Token** (e.g., `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

**Step 2: Configure Mini App**

Send these commands to BotFather:

```
/mybots
→ Select your bot
→ Bot Settings
→ Menu Button
→ Configure Menu Button
→ Enter your app URL: https://your-app-url.vercel.app
→ Enter button text: Open Marketplace
```

**Step 3: Set Bot Description**

```
/setdescription
→ Select your bot
→ Enter description:
"Misrak Shemeta Marketplace - Connect shops in Harar and Dire Dawa with students across Haramaya campuses. Shop, pay securely, and get delivery with OTP verification."
```

**Step 4: Set Bot Commands**

```
/setcommands
→ Select your bot
→ Enter commands:
start - Open the marketplace
help - Get help and support
orders - View your orders
shop - Browse products
```

---

### Phase 3: Configure Your App for Telegram

**Update Environment Variables:**

Add to your `.env.local` (and production environment):

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_USERNAME=misrak_shemeta_bot

# Public URL (for webhooks and redirects)
NEXT_PUBLIC_APP_URL=https://your-app-url.vercel.app

# Existing variables
ADMIN_TELEGRAM_IDS=123456789,987654321
FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase configs
```

**Update Telegram SDK Integration:**

The app already has Telegram SDK integration in the codebase. When deployed, it will automatically:
- Detect Telegram environment
- Retrieve real Telegram user data
- Enable Telegram-specific features (haptic feedback, theme)

---

### Phase 4: Testing in Telegram

#### Method 1: Test via Bot Menu Button (Recommended)

1. Open Telegram on your phone
2. Search for your bot: `@misrak_shemeta_bot`
3. Start the bot: `/start`
4. Click the **Menu Button** (bottom left, next to message input)
5. Your Mini App opens inside Telegram! 🎉

#### Method 2: Test via Direct Link

Share this link format:
```
https://t.me/misrak_shemeta_bot/app
```

Anyone clicking this link will open your Mini App in Telegram.

#### Method 3: Test via Inline Button

Create a message with an inline button:
```
/start
```

The bot can respond with an inline keyboard button that opens the Mini App.

---

## Development Workflow

### Local Development (Current)
```bash
npm run dev
# Test in Chrome: http://localhost:3000
# Use hardcoded Telegram IDs
```

### Staging Testing (Telegram Environment)
```bash
# 1. Deploy to staging URL
vercel

# 2. Update BotFather with staging URL
# 3. Test in Telegram with real users
# 4. Verify Telegram features work
```

### Production Deployment
```bash
# 1. Deploy to production
vercel --prod

# 2. Update BotFather with production URL
# 3. Announce to users
```

---

## Testing Checklist for Telegram Environment

When you first deploy to Telegram, test these features:

### ✅ Authentication
- [ ] Telegram user data is retrieved correctly
- [ ] User's Telegram ID is captured
- [ ] User's language preference is detected
- [ ] First-time users see onboarding

### ✅ Telegram-Specific Features
- [ ] Haptic feedback works on button clicks
- [ ] App expands to full viewport height
- [ ] Telegram theme colors are applied
- [ ] Back button behavior works correctly

### ✅ Core Functionality
- [ ] Browse products
- [ ] Add to cart
- [ ] Checkout and payment
- [ ] Order tracking
- [ ] Admin dashboard (for admin users)

### ✅ Mobile Optimization
- [ ] Touch-friendly buttons (44x44px minimum)
- [ ] Responsive layout on mobile
- [ ] Images load properly
- [ ] Smooth scrolling

---

## Exposing Localhost to Telegram (For Testing)

If you want to test with Telegram BEFORE deploying, use **ngrok**:

### Step 1: Install ngrok
```bash
# Download from https://ngrok.com/download
# Or install via npm
npm install -g ngrok
```

### Step 2: Start Your Dev Server
```bash
npm run dev
# Running on http://localhost:3000
```

### Step 3: Expose with ngrok
```bash
ngrok http 3000
```

You'll get a public URL like:
```
https://abc123.ngrok.io
```

### Step 4: Update BotFather
Use the ngrok URL in BotFather's Menu Button configuration.

### Step 5: Test in Telegram
Open your bot in Telegram and click the menu button!

**⚠️ Important Notes:**
- ngrok URLs change every time you restart (free tier)
- Only use for testing, not production
- ngrok has rate limits on free tier

---

## When to Deploy to Telegram?

### Option 1: Deploy Now (Recommended)
**Pros:**
- Test in real Telegram environment early
- Catch Telegram-specific issues
- Get real user feedback
- Verify authentication works

**Cons:**
- Need to set up deployment
- May need to iterate on fixes

### Option 2: Deploy After All Features Complete
**Pros:**
- All features tested in Chrome first
- Less back-and-forth deployment

**Cons:**
- May discover Telegram-specific issues late
- Harder to fix integration problems

### My Recommendation: **Deploy to Staging Now**

Here's why:
1. You've completed all core features
2. Admin platform is fully functional
3. Better to catch Telegram issues early
4. You can test with real Telegram users
5. Parallel testing: Chrome for features, Telegram for integration

---

## Quick Start: Deploy to Telegram in 15 Minutes

### Step 1: Deploy to Vercel (5 min)
```bash
vercel login
vercel
# Copy the URL: https://your-app.vercel.app
```

### Step 2: Create Telegram Bot (5 min)
1. Message `@BotFather` on Telegram
2. `/newbot` → Follow prompts
3. Save bot token

### Step 3: Configure Menu Button (3 min)
1. `/mybots` → Select bot
2. Bot Settings → Menu Button
3. Enter your Vercel URL
4. Enter button text: "Open Marketplace"

### Step 4: Test (2 min)
1. Open your bot in Telegram
2. Click menu button
3. Your app opens! 🎉

---

## Environment-Specific Configuration

### Development (Chrome)
```typescript
// Detects Chrome environment
const isTelegramEnv = typeof window !== 'undefined' && window.Telegram?.WebApp;

if (!isTelegramEnv) {
  // Use mock Telegram data for Chrome testing
  const mockTelegramId = '123456789';
}
```

### Production (Telegram)
```typescript
// Real Telegram environment
const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
const telegramId = telegramUser.id.toString();
```

The app already handles both environments automatically!

---

## Troubleshooting

### Issue: "This bot can't be added to groups"
**Solution:** This is normal. Mini Apps are for individual users, not groups.

### Issue: "Invalid URL" in BotFather
**Solution:** 
- Ensure URL starts with `https://`
- URL must be publicly accessible
- No localhost URLs (use ngrok for testing)

### Issue: Telegram user data not loading
**Solution:**
- Check Telegram SDK is initialized
- Verify app is opened via Telegram (not direct browser)
- Check browser console for errors

### Issue: Haptic feedback not working
**Solution:**
- Only works on mobile Telegram apps
- Desktop Telegram doesn't support haptics
- Test on actual phone

---

## Next Steps

1. **Now:** Continue development in Chrome
2. **Soon:** Deploy to Vercel staging
3. **Test:** Open in Telegram and verify features
4. **Iterate:** Fix any Telegram-specific issues
5. **Launch:** Deploy to production and announce

---

## Summary

**Current State:** ✅ Development in Chrome  
**Next Step:** 🚀 Deploy to Vercel + Configure Telegram Bot  
**Timeline:** 15-30 minutes to get running in Telegram  
**Recommendation:** Deploy to staging now, test in parallel with Chrome

Your app is ready for Telegram deployment! All the Telegram integration code is already in place - you just need to deploy and configure the bot.

Would you like me to help you with the deployment process?
