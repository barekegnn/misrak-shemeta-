# Local Testing Guide - Misrak Shemeta Marketplace

## Prerequisites Installation

### 1. Install Java (Required for Firestore Emulator)

The Firebase Emulator requires Java JDK 11 or higher.

#### Windows:
1. Download Java JDK from: https://adoptium.net/
2. Choose "Temurin 17 (LTS)" or later
3. Download the Windows installer (.msi)
4. Run the installer and follow the prompts
5. Verify installation:
   ```bash
   java -version
   ```

#### Alternative (Using Chocolatey):
```bash
choco install openjdk17
```

#### Alternative (Using Scoop):
```bash
scoop install openjdk17
```

### 2. Verify Firebase CLI Installation

```bash
firebase --version
# Should show: 15.8.0 or higher
```

If not installed:
```bash
npm install -g firebase-tools
```

## Starting the System

### Option A: Manual Step-by-Step (Recommended for First Time)

#### Step 1: Start Firebase Emulator

Open a terminal and run:
```bash
firebase emulators:start
```

Wait for the message:
```
✔  All emulators ready! It is now safe to connect your app.
```

You should see:
- Firestore Emulator: http://127.0.0.1:8080
- Auth Emulator: http://127.0.0.1:9099
- Storage Emulator: http://127.0.0.1:9199
- Emulator UI: http://127.0.0.1:4000

#### Step 2: Seed Test Data

Open a **new terminal** and run:
```bash
npm run seed
```

This creates:
- 5 test users (buyers, merchants, runner)
- 2 shops (Harar Electronics, Dire Dawa Books)
- 6 products
- 1 sample cart
- 1 sample order

#### Step 3: Start the Next.js Development Server

Open a **third terminal** and run:
```bash
npm run dev
```

Wait for:
```
✓ Ready in X.Xs
○ Local: http://localhost:3000
```

#### Step 4: Access the Application

- **Application**: http://localhost:3000
- **Emulator UI**: http://127.0.0.1:4000

### Option B: Automated (After Java is Installed)

If you have `concurrently` installed:
```bash
npm install --save-dev concurrently
npm run dev:emulator
```

This starts both the emulator and dev server together.

## Test Users

The seed script creates these test users for different roles:

### 🛒 Buyer 1 (English)
- **Telegram ID**: `123456789`
- **Role**: STUDENT
- **Location**: Haramaya Main Campus
- **Language**: English
- **Use for**: Testing buyer flow (browse, cart, checkout, payment)

### 🛒 Buyer 2 (Amharic)
- **Telegram ID**: `987654321`
- **Role**: STUDENT
- **Location**: Harar Campus
- **Language**: Amharic (አማርኛ)
- **Use for**: Testing Amharic translations

### 🏪 Merchant 1 (Harar Electronics)
- **Telegram ID**: `111222333`
- **Role**: MERCHANT
- **Shop**: Harar Electronics
- **Location**: Harar
- **Language**: English
- **Use for**: Testing shop owner flow (products, orders, balance)

### 🏪 Merchant 2 (Dire Dawa Books)
- **Telegram ID**: `444555666`
- **Role**: MERCHANT
- **Shop**: Dire Dawa Books & Stationery
- **Location**: Dire Dawa
- **Language**: Afaan Oromo
- **Use for**: Testing Afaan Oromo translations

### 🚚 Runner
- **Telegram ID**: `777888999`
- **Role**: RUNNER
- **Location**: Harar
- **Language**: English
- **Use for**: Testing delivery flow (mark arrived, submit OTP)

## Testing Workflows

### 1. Buyer Flow (Complete Purchase)

**User**: Telegram ID `123456789` (Buyer 1)

1. **Browse Products**
   - Open http://localhost:3000
   - View product catalog
   - Products from both Harar and Dire Dawa shops should appear

2. **Add to Cart**
   - Click on a product
   - View product details with delivery fee
   - Add to cart
   - Verify cart updates

3. **Checkout**
   - Go to cart
   - Review items and total (products + delivery fee)
   - Click "Checkout"
   - Order should be created with status PENDING

4. **Payment (Chapa Sandbox)**
   - Click "Pay Now"
   - Should redirect to Chapa sandbox page
   - Use test card: `4000 0000 0000 0002`
   - Complete payment
   - Order status should change to PAID_ESCROW

5. **Track Order**
   - View order in "My Orders"
   - See status timeline
   - Wait for shop owner to dispatch

### 2. Shop Owner Flow (Fulfill Order)

**User**: Telegram ID `111222333` (Merchant 1)

1. **Manage Products**
   - Login as merchant
   - View product list
   - Create new product (with images)
   - Edit existing product
   - Delete product

2. **View Orders**
   - Go to "Shop Orders"
   - See orders containing your products
   - Filter by status

3. **Dispatch Order**
   - Find order with status PAID_ESCROW
   - Click "Mark as Dispatched"
   - Order status changes to DISPATCHED
   - Buyer receives notification

4. **View Balance**
   - Go to "Dashboard"
   - See current balance
   - View pending orders value
   - View completed orders value
   - Check transaction history

### 3. Runner Flow (Deliver Order)

**User**: Telegram ID `777888999` (Runner)

1. **View Active Deliveries**
   - Login as runner
   - See orders with status DISPATCHED

2. **Mark as Arrived**
   - Select an order
   - Click "Mark as Arrived"
   - Order status changes to ARRIVED
   - Buyer receives notification with OTP

3. **Complete Delivery**
   - Get OTP from buyer (shown in buyer's order detail)
   - Enter OTP in runner interface
   - Submit OTP
   - Order status changes to COMPLETED
   - Shop owner's balance is credited

### 4. Order Cancellation Flow

**User**: Telegram ID `123456789` (Buyer 1)

1. **Cancel Before Payment**
   - Create an order (status: PENDING)
   - Click "Cancel Order"
   - Provide reason
   - Order status changes to CANCELLED
   - Stock is restored

2. **Cancel After Payment**
   - Create and pay for an order (status: PAID_ESCROW)
   - Click "Cancel Order"
   - Provide reason
   - Order status changes to CANCELLED
   - Refund is initiated through Chapa
   - Shop owner receives notification

### 5. Multi-Language Testing

**Test Amharic**:
- Login as Telegram ID `987654321`
- Change language to Amharic (አማርኛ)
- Verify all UI elements are translated
- Test notifications in Amharic

**Test Afaan Oromo**:
- Login as Telegram ID `444555666`
- Change language to Afaan Oromo
- Verify all UI elements are translated
- Test notifications in Afaan Oromo

### 6. Delivery Fee Testing

Test the Eastern Triangle Pricing Engine:

**Intra-City (40 ETB)**:
- Harar shop → Harar Campus buyer
- Dire Dawa shop → DDU buyer

**City-to-Campus (100 ETB)**:
- Harar shop → Haramaya Main buyer
- Dire Dawa shop → Haramaya Main buyer

**Inter-City (180 ETB)**:
- Harar shop → DDU buyer
- Dire Dawa shop → Harar Campus buyer

## Using the Emulator UI

Access: http://127.0.0.1:4000

### Firestore Tab
- View all collections (users, shops, products, orders, carts)
- Inspect documents
- Manually edit data
- Delete documents

### Authentication Tab
- View authenticated users
- Create test users
- Delete users

### Storage Tab
- View uploaded files
- Browse product images
- Download files

### Logs Tab
- See all emulator requests
- Debug issues
- View function calls

## Troubleshooting

### Emulator Won't Start

**Error: "Could not spawn java"**
- Install Java JDK 11+ (see Prerequisites above)
- Verify: `java -version`

**Error: "Port already in use"**
- Check if another process is using ports 8080, 9099, 9199, or 4000
- Kill the process or change ports in `firebase.json`

**Error: "EADDRINUSE"**
- Stop the emulator: Ctrl+C
- Kill any remaining processes
- Restart the emulator

### Application Not Connecting

**Check Environment Variables**:
```bash
# Verify .env.local has:
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199
```

**Restart Dev Server**:
- Stop: Ctrl+C
- Start: `npm run dev`

### Seed Script Fails

**Error: "FIRESTORE_EMULATOR_HOST not set"**
```bash
# Windows (PowerShell)
$env:FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
npm run seed

# Windows (CMD)
set FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
npm run seed

# Linux/Mac
export FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
npm run seed
```

### No Data Appearing

1. Check emulator is running: http://127.0.0.1:4000
2. Run seed script: `npm run seed`
3. Verify data in Emulator UI → Firestore tab
4. Check browser console for errors

### Payment Not Working

- Verify `NEXT_PUBLIC_CHAPA_MODE=sandbox` in `.env.local`
- Use Chapa test card: `4000 0000 0000 0002`
- Check webhook is configured correctly
- View logs in Emulator UI

## Stopping the System

1. **Stop Dev Server**: Ctrl+C in the dev server terminal
2. **Stop Emulator**: Ctrl+C in the emulator terminal
3. **Save Data** (optional):
   ```bash
   firebase emulators:start --export-on-exit=./emulator-data
   ```

## Next Steps

After successful local testing:
1. Fix any bugs found
2. Test all user flows thoroughly
3. Verify security rules work correctly
4. Test edge cases
5. Proceed to staging deployment

## Quick Reference

```bash
# Start emulator
firebase emulators:start

# Seed data
npm run seed

# Start dev server
npm run dev

# Access points
# App: http://localhost:3000
# Emulator UI: http://127.0.0.1:4000
```

## Need Help?

- Check EMULATOR_SETUP.md for detailed setup instructions
- Check SETUP.md for general project setup
- Check QUICKSTART.md for quick start guide
- View Firebase Emulator docs: https://firebase.google.com/docs/emulator-suite
