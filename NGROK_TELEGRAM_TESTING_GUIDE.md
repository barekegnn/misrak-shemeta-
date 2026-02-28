# Testing Misrak Shemeta in Telegram with ngrok

## Overview

This guide walks you through testing your Telegram Mini App locally using ngrok to expose your localhost to Telegram.

---

## Step 1: Install ngrok

### Option A: Download from Website (Recommended)
1. Go to https://ngrok.com/download
2. Download for Windows
3. Extract the zip file
4. Move `ngrok.exe` to a folder in your PATH (or keep it in your project folder)

### Option B: Install via Chocolatey (if you have it)
```bash
choco install ngrok
```

### Option C: Install via npm
```bash
npm install -g ngrok
```

---

## Step 2: Sign Up for ngrok (Free Account)

1. Go to https://dashboard.ngrok.com/signup
2. Sign up for a free account
3. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
4. Authenticate ngrok:

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

**Why sign up?**
- Free tier gives you a stable subdomain
- Longer session times
- Better rate limits

---

## Step 3: Start Your Development Server

Make sure your Next.js app is running:

```bash
npm run dev
```

You should see:
```
✓ Ready on http://localhost:3000
```

**Keep this terminal open!**

---

## Step 4: Start ngrok

Open a **NEW terminal** (keep the dev server running) and run:

```bash
ngrok http 3000
```

You'll see output like this:

```
ngrok

Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copy the HTTPS URL:** `https://abc123def456.ngrok-free.app`

⚠️ **Important:** 
- Use the HTTPS URL (not HTTP)
- This URL changes every time you restart ngrok (free tier)
- Keep this terminal open while testing

---

## Step 5: Create Your Telegram Bot

### 5.1: Open Telegram and Find BotFather

1. Open Telegram on your phone or desktop
2. Search for `@BotFather`
3. Start a chat

### 5.2: Create a New Bot

Send this command:
```
/newbot
```

BotFather will ask for:

**Bot Name:** (can be anything)
```
Misrak Shemeta Marketplace
```

**Bot Username:** (must end with 'bot')
```
misrak_shemeta_test_bot
```

BotFather will respond with:
```
Done! Congratulations on your new bot. You will find it at t.me/misrak_shemeta_test_bot

Use this token to access the HTTP API:
123456789:ABCdefGHIjklMNOpqrsTUVwxyz

For a description of the Bot API, see this page: https://core.telegram.org/bots/api
```

**Save the bot token!** You'll need it later.

---

## Step 6: Configure the Bot Menu Button

### 6.1: Open Bot Settings

Send to BotFather:
```
/mybots
```

Select your bot: `@misrak_shemeta_test_bot`

### 6.2: Configure Menu Button

Click: **Bot Settings** → **Menu Button** → **Configure Menu Button**

BotFather asks: "Send me the URL"

**Paste your ngrok URL:**
```
https://abc123def456.ngrok-free.app
```

BotFather asks: "Send me the text for the button"

**Enter:**
```
Open Marketplace
```

BotFather confirms:
```
Success! Menu button URL updated.
```

---

## Step 7: Set Bot Description (Optional but Recommended)

Send to BotFather:
```
/setdescription
```

Select your bot, then send:
```
Misrak Shemeta Marketplace - Connect shops in Harar and Dire Dawa with students. Shop, pay securely, and get delivery with OTP verification. 🛍️
```

---

## Step 8: Test in Telegram! 🎉

### Method 1: Via Bot Menu Button (Recommended)

1. Open Telegram
2. Search for your bot: `@misrak_shemeta_test_bot`
3. Click **START** or send `/start`
4. Look at the bottom left corner - you'll see a **menu button** (☰ icon)
5. Click the menu button
6. **Your app opens inside Telegram!** 🎉

### Method 2: Via Direct Link

Share this link:
```
https://t.me/misrak_shemeta_test_bot/app
```

Anyone clicking this opens your Mini App in Telegram.

---

## Step 9: Verify Telegram Integration

When your app opens in Telegram, check these features:

### ✅ Check 1: Telegram User Data
Open browser console in Telegram Desktop (Ctrl+Shift+I) or check the app behavior:
- Your real Telegram ID should be captured
- No more hardcoded `123456789`
- User's first name should appear

### ✅ Check 2: Haptic Feedback (Mobile Only)
- Click buttons - you should feel vibrations
- Only works on Telegram mobile app
- Desktop Telegram doesn't support haptics

### ✅ Check 3: Full Viewport
- App should expand to full height
- No extra white space at top/bottom

### ✅ Check 4: Theme Integration
- App should adapt to Telegram's theme
- Colors should match Telegram's color scheme

---

## Step 10: Test Core Features

Now test your marketplace features in the real Telegram environment:

### For Buyers:
1. Browse products
2. Add items to cart
3. Go to checkout
4. Test payment flow (use Chapa sandbox)
5. Track order status

### For Shop Owners:
1. Register a shop
2. Add products
3. View orders
4. Mark orders as dispatched

### For Admins:
1. Access admin dashboard at `/admin`
2. Manage users
3. Manage shops
4. View financial reports
5. Check system monitoring

---

## Troubleshooting

### Issue: "This site can't be reached" in Telegram

**Causes:**
- ngrok tunnel stopped
- Dev server stopped
- Wrong URL in BotFather

**Solutions:**
1. Check ngrok is still running (terminal should show active connections)
2. Check dev server is running (`npm run dev`)
3. Verify the URL in BotFather matches your current ngrok URL

### Issue: ngrok shows "ERR_NGROK_108"

**Cause:** Free tier rate limit exceeded

**Solutions:**
1. Wait a few minutes
2. Sign up for ngrok account (increases limits)
3. Restart ngrok with a new URL

### Issue: Telegram shows "Bot domain invalid"

**Cause:** Using HTTP instead of HTTPS

**Solution:** Always use the HTTPS URL from ngrok (not HTTP)

### Issue: Can't see menu button in Telegram

**Causes:**
- Menu button not configured
- Using old Telegram version

**Solutions:**
1. Update Telegram to latest version
2. Reconfigure menu button in BotFather
3. Try `/start` command to refresh bot

### Issue: Telegram user data not loading

**Cause:** App opened in browser instead of Telegram

**Solution:** 
- Must open via Telegram bot menu button
- Direct browser access won't have Telegram context
- Use the bot link: `https://t.me/your_bot/app`

---

## ngrok Web Interface

ngrok provides a web interface to inspect requests:

1. Open http://127.0.0.1:4040 in your browser
2. See all HTTP requests to your app
3. Inspect request/response details
4. Replay requests for debugging

This is super helpful for debugging!

---

## Important Notes

### ⚠️ ngrok URL Changes
- Free tier: URL changes every restart
- Paid tier: Get a permanent subdomain
- Update BotFather each time URL changes

### ⚠️ Keep Terminals Open
You need 2 terminals running:
1. **Terminal 1:** `npm run dev` (dev server)
2. **Terminal 2:** `ngrok http 3000` (tunnel)

### ⚠️ Firewall/Antivirus
- Some firewalls block ngrok
- Add ngrok to firewall exceptions if needed

### ⚠️ Rate Limits
- Free tier has rate limits
- Sign up for free account to increase limits
- Paid plans remove most limits

---

## When You're Done Testing

### Stop ngrok:
Press `Ctrl+C` in the ngrok terminal

### Stop Dev Server:
Press `Ctrl+C` in the dev server terminal

### Next Time:
1. Start dev server: `npm run dev`
2. Start ngrok: `ngrok http 3000`
3. Update BotFather with new ngrok URL (if it changed)
4. Test again!

---

## Upgrading to Permanent URL

### Option 1: ngrok Paid Plan ($8/month)
- Get a permanent subdomain: `your-app.ngrok.io`
- No need to update BotFather each time
- Higher rate limits

### Option 2: Deploy to Production
When ready for real users:
1. Deploy to Vercel/Netlify (free)
2. Get permanent URL: `your-app.vercel.app`
3. Update BotFather with production URL
4. No more ngrok needed!

---

## Quick Reference Commands

```bash
# Start dev server
npm run dev

# Start ngrok (new terminal)
ngrok http 3000

# Authenticate ngrok (one-time)
ngrok config add-authtoken YOUR_TOKEN

# Check ngrok web interface
# Open: http://127.0.0.1:4040
```

---

## Next Steps After Testing

Once you've tested in Telegram with ngrok:

1. ✅ Verify all features work in Telegram
2. ✅ Fix any Telegram-specific issues
3. ✅ Test on both mobile and desktop Telegram
4. 🚀 Deploy to production (Vercel/Netlify)
5. 🎉 Update BotFather with production URL
6. 📢 Announce to users!

---

## Summary

**What you did:**
1. ✅ Installed ngrok
2. ✅ Exposed localhost to internet
3. ✅ Created Telegram bot
4. ✅ Configured bot menu button
5. ✅ Tested app in real Telegram environment

**What you learned:**
- How Telegram Mini Apps work
- How to test locally before deploying
- How to debug Telegram integration

**What's next:**
- Continue testing features in Telegram
- Fix any issues you find
- Deploy to production when ready

Your app is now running in Telegram! 🎉
