# Accessing Dashboards via Telegram Mini App

**Your Telegram ID**: `779028866`  
**Bot Username**: Check your `.env.local` for `TELEGRAM_BOT_TOKEN`  
**Production URL**: https://misrak-shemeta.vercel.app

---

## 🎯 How It Works

The Misrak Shemeta marketplace is a **Telegram Mini App**. When you open it in Telegram, the app automatically:

1. Detects your Telegram ID
2. Looks up your user role in Firebase
3. Shows the appropriate dashboard based on your role
4. Displays role-specific navigation at the bottom

---

## 📱 Step-by-Step: Access Your Dashboards

### Step 1: Find Your Telegram Bot

Your bot token is: `8739908787:AAHBTXFkXSaLMji05i4J9OfJv-RHs2aSmr0`

To find your bot:
1. Open Telegram
2. Search for your bot (you should have created it with @BotFather)
3. Or use this direct link format: `https://t.me/YOUR_BOT_USERNAME`

### Step 2: Start the Bot

1. Open your bot in Telegram
2. Send `/start` command
3. The bot will reply with a welcome message and a button: **"🛍️ Open Marketplace"**
4. Click the button to open the Mini App

### Step 3: The App Opens Based on Your Role

When the Mini App opens, it will:
- Authenticate you using your Telegram ID (`779028866`)
- Check your role in Firebase
- Show the appropriate dashboard

---

## 🔐 Your Current Role Configuration

Based on your Firebase database, your user document should have:

```json
{
  "id": "y3RnPvOisQLzhGXDEE9K",
  "telegramId": "779028866",
  "role": "ADMIN",  // or MERCHANT, RUNNER, STUDENT
  "homeLocation": "Haramaya_Main",
  "languagePreference": "en"
}
```

---

## 🎨 What You'll See Based on Role

### If Your Role is ADMIN

**Bottom Navigation Shows**:
- 📊 Dashboard → `/admin`
- 👥 Users → `/admin/users`
- 🏪 Shops → `/admin/shops`
- 📦 Orders → `/admin/orders`
- ⋯ More → `/admin/more`

**You Can Access**:
- Platform statistics
- User management
- Shop management
- Product management
- Order management
- Financial overview
- System monitoring

---

### If Your Role is MERCHANT

**Bottom Navigation Shows**:
- 📊 Dashboard → `/merchant`
- 🏪 Products → `/merchant/products`
- 📦 Orders → `/merchant/orders`
- 💰 Balance → `/merchant/balance`
- 👤 Profile → `/profile`

**You Can Access**:
- Shop statistics
- Product management
- Order processing
- Balance and earnings
- Shop settings

---

### If Your Role is RUNNER

**Bottom Navigation Shows**:
- 📦 Deliveries → `/runner`
- 📋 History → `/runner/history`
- 👤 Profile → `/profile`

**You Can Access**:
- Active deliveries
- Delivery status updates
- OTP verification
- Delivery history
- Earnings

---

### If Your Role is STUDENT (Customer)

**Bottom Navigation Shows**:
- 🏠 Home → `/`
- 🏪 Shops → `/shops`
- 🛒 Cart → `/cart`
- 📦 Orders → `/orders`
- 👤 Profile → `/profile`

**You Can Access**:
- Browse products
- Shopping cart
- Checkout and payment
- Order tracking
- Profile management

---

## 🔄 How to Test Different Dashboards

### Option 1: Change Your Role in Firebase (Recommended)

1. **Open Firebase Console**:
   - Go to: https://console.firebase.google.com/
   - Select project: `misrak-shemeta-marketpla-fdbcf`
   - Navigate to Firestore Database

2. **Find Your User**:
   - Collection: `users`
   - Find document with `telegramId == "779028866"`
   - Your document ID: `y3RnPvOisQLzhGXDEE9K`

3. **Change Role**:
   - Click on your user document
   - Edit the `role` field
   - Change to: `ADMIN`, `MERCHANT`, `RUNNER`, or `STUDENT`
   - Save changes

4. **Refresh Telegram Mini App**:
   - Close the Mini App in Telegram
   - Open it again by clicking the bot button
   - You'll see the new dashboard!

---

### Option 2: Use the Script (Then Open in Telegram)

Run this script to change your role:

```bash
# Switch to Admin
npx tsx scripts/switch-my-role.ts ADMIN

# Switch to Merchant
npx tsx scripts/switch-my-role.ts MERCHANT

# Switch to Runner
npx tsx scripts/switch-my-role.ts RUNNER

# Switch to Student
npx tsx scripts/switch-my-role.ts STUDENT
```

Then:
1. Close the Telegram Mini App
2. Open it again from your bot
3. The new dashboard will appear

---

### Option 3: Create Test Users with Different Telegram Accounts

If you have multiple Telegram accounts or test accounts:

1. **Create test users in Firebase**:
   ```bash
   npx tsx scripts/setup-test-users.ts
   ```

2. **This creates**:
   - Admin: Telegram ID `779028866` (you)
   - Merchant: Telegram ID `888888888`
   - Runner: Telegram ID `777777777`
   - Student: Telegram ID `666666666`

3. **Access with different Telegram accounts**:
   - Each Telegram account will see their respective dashboard
   - You need actual Telegram accounts with those IDs

---

## 🚀 Quick Test: Access Admin Dashboard Right Now

### Step 1: Verify Your Role

Run this command to check/set your role to ADMIN:

```bash
npx tsx scripts/switch-my-role.ts ADMIN
```

### Step 2: Open Telegram

1. Open Telegram on your phone or desktop
2. Find your bot (search for the bot username)
3. Send `/start` command
4. Click **"🛍️ Open Marketplace"** button

### Step 3: You Should See Admin Dashboard

The Mini App will open and show:
- Admin navigation at the bottom
- Platform statistics
- Access to all admin features

---

## 🛠️ Testing Merchant Dashboard

### Step 1: Switch to Merchant Role

```bash
npx tsx scripts/switch-my-role.ts MERCHANT
```

### Step 2: Create a Shop (If Needed)

The script will tell you if you need a shop. If yes:
1. Open the Mini App in Telegram
2. You'll see a "Register Shop" page
3. Fill in shop details
4. Submit

### Step 3: Access Merchant Dashboard

1. Close and reopen the Mini App
2. You'll see the merchant dashboard
3. Bottom navigation shows merchant options

---

## 🛠️ Testing Runner Dashboard

### Step 1: Switch to Runner Role

```bash
npx tsx scripts/switch-my-role.ts RUNNER
```

### Step 2: Open Mini App

1. Close and reopen the Mini App in Telegram
2. You'll see the runner dashboard
3. Bottom navigation shows delivery options

---

## 🛠️ Testing Customer Dashboard

### Step 1: Switch to Student Role

```bash
npx tsx scripts/switch-my-role.ts STUDENT
```

### Step 2: Open Mini App

1. Close and reopen the Mini App in Telegram
2. You'll see the customer/shopping interface
3. Bottom navigation shows shopping options

---

## 📊 Navigation Summary

| Role | Main Page | Bottom Nav Items |
|------|-----------|------------------|
| **Admin** | `/admin` | Dashboard, Users, Shops, Orders, More |
| **Merchant** | `/merchant` | Dashboard, Products, Orders, Balance, Profile |
| **Runner** | `/runner` | Deliveries, History, Profile |
| **Student** | `/` | Home, Shops, Cart, Orders, Profile |

---

## 🔍 How the App Detects Your Role

The app uses the `TelegramAuthProvider` component which:

1. **Gets your Telegram ID** from the Telegram Mini App context
2. **Queries Firebase** for your user document
3. **Reads your role** from the user document
4. **Renders the appropriate navigation** based on role
5. **Protects routes** using middleware (admin routes require admin role)

---

## 🚨 Troubleshooting

### Problem: "Unauthorized" or Wrong Dashboard

**Solution**:
1. Check your role in Firebase Console
2. Make sure `telegramId` matches your Telegram ID (`779028866`)
3. Close and reopen the Mini App
4. Clear Telegram cache if needed

### Problem: Can't Access Admin Dashboard

**Solution**:
1. Verify `ADMIN_TELEGRAM_IDS` in Vercel environment variables
2. Should include your Telegram ID: `"779028866"`
3. Check middleware is not blocking you
4. Verify your role in Firebase is `ADMIN`

### Problem: Merchant Dashboard Shows "No Shop"

**Solution**:
1. Your role is `MERCHANT` but you don't have a shop
2. Visit the shop registration page in the Mini App
3. Or run: `npx tsx scripts/setup-test-users.ts` to create a test shop

### Problem: Mini App Not Opening

**Solution**:
1. Check bot token is correct in Vercel environment variables
2. Verify webhook is set up: `npx tsx scripts/setup-telegram-webhook.ts`
3. Check bot is not blocked or deleted
4. Try `/start` command again

---

## 🎯 Summary: How to Access Each Dashboard

### Admin Dashboard
1. Run: `npx tsx scripts/switch-my-role.ts ADMIN`
2. Open Telegram bot
3. Click "Open Marketplace"
4. See admin dashboard with full platform controls

### Merchant Dashboard
1. Run: `npx tsx scripts/switch-my-role.ts MERCHANT`
2. Create shop if needed (via Mini App)
3. Open Telegram bot
4. Click "Open Marketplace"
5. See merchant dashboard with shop management

### Runner Dashboard
1. Run: `npx tsx scripts/switch-my-role.ts RUNNER`
2. Open Telegram bot
3. Click "Open Marketplace"
4. See runner dashboard with delivery management

### Customer Dashboard
1. Run: `npx tsx scripts/switch-my-role.ts STUDENT`
2. Open Telegram bot
3. Click "Open Marketplace"
4. See customer dashboard with shopping features

---

## 📞 Next Steps

1. **Open your Telegram bot** and send `/start`
2. **Click the "Open Marketplace" button**
3. **See your current dashboard** (based on your role)
4. **Switch roles** using the script to test other dashboards
5. **Explore all features** of each dashboard

The key is: **Everything happens inside Telegram!** The Mini App automatically shows the right dashboard based on your role in Firebase.
