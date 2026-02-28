# Admin Dashboard Access Guide

This guide explains how to access and test the admin dashboard for the Misrak Shemeta marketplace platform.

## Overview

The admin dashboard provides system owners with:
- Platform-wide statistics (users, shops, products, orders)
- Financial metrics (total revenue, pending escrow)
- Recent order activity
- System health indicators
- Access to user, shop, product, and order management

## Prerequisites

1. **Development Server Running**
   ```bash
   npm run dev
   ```

2. **Firebase Emulator Running** (for local testing)
   ```bash
   npm run emulator
   ```

3. **Admin Telegram ID Configured** (see Configuration section below)

## Configuration

### Step 1: Set Admin Telegram IDs

Add your Telegram ID to the `.env.local` file:

```bash
# Admin Access
ADMIN_TELEGRAM_IDS=123456789,987654321
```

**Multiple Admins**: Separate multiple Telegram IDs with commas (no spaces needed, they're trimmed automatically)

**Finding Your Telegram ID**:
- Open Telegram and search for `@userinfobot`
- Send `/start` to the bot
- The bot will reply with your Telegram ID

### Step 2: Update Environment Variables

If you don't have a `.env.local` file yet, copy from the example:

```bash
cp .env.local.example .env.local
```

Then add the `ADMIN_TELEGRAM_IDS` line to your `.env.local` file.

### Step 3: Restart Development Server

After updating environment variables, restart your dev server:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

## Accessing the Admin Dashboard

### Method 1: Direct URL Access (Development)

For local development testing, you can bypass the Telegram authentication:

1. **Navigate to**: `http://localhost:3000/admin`

2. **Bypass Middleware** (temporary for testing):
   
   The middleware checks for a Telegram ID. For local testing, you have two options:

   **Option A: Add Cookie in Browser DevTools**
   - Open browser DevTools (F12)
   - Go to Application/Storage → Cookies
   - Add a new cookie:
     - Name: `telegramId`
     - Value: Your admin Telegram ID (e.g., `123456789`)
     - Domain: `localhost`
   - Refresh the page

   **Option B: Modify Middleware Temporarily**
   
   Edit `src/middleware.ts` to hardcode your Telegram ID for testing:
   
   ```typescript
   // In middleware function, replace:
   const telegramId = request.headers.get('x-telegram-id') || 
                     request.cookies.get('telegramId')?.value;
   
   // With (temporarily):
   const telegramId = '123456789'; // Your admin Telegram ID
   ```
   
   **⚠️ IMPORTANT**: Remove this hardcoded value before deploying to production!

### Method 2: Via Telegram Mini App (Production)

In production, the admin dashboard is accessed through the Telegram Mini App:

1. **Open the Telegram Mini App**
2. **Navigate to**: `/admin` route within the app
3. **Authentication**: Automatic via Telegram context
4. **Authorization**: Verified against `ADMIN_TELEGRAM_IDS`

## Admin Dashboard Features

### 1. Platform Overview

**Key Metrics Cards**:
- Total Users
- Total Shops
- Total Products
- Total Orders

**Financial Metrics**:
- Total Revenue (sum of completed orders)
- Pending Escrow (funds held in escrow)
- Active Users (users with orders in last 30 days)

**System Health**:
- Suspended Users count
- Suspended Shops count

### 2. Recent Orders Table

Displays the last 20 orders with:
- Order ID (truncated)
- User ID
- Status (color-coded badges)
- Total amount
- Creation date

**Status Colors**:
- 🟢 Green: COMPLETED
- 🔴 Red: CANCELLED
- 🔵 Blue: PAID_ESCROW
- 🟣 Purple: DISPATCHED
- 🟡 Yellow: ARRIVED
- ⚪ Gray: PENDING

## Testing the Dashboard

### Test Scenario 1: Empty Platform

**Setup**: Fresh database with no data

**Expected Result**:
- All metric cards show `0`
- Recent orders table shows "No orders yet"
- No system health warnings

### Test Scenario 2: Platform with Data

**Setup**: Create test data using Firebase Emulator

1. **Create Test Users**:
   ```typescript
   // In Firebase Emulator UI or via script
   await adminDb.collection('users').add({
     telegramId: '111111111',
     role: 'USER',
     homeLocation: 'Haramaya_Main',
     languagePreference: 'en',
     createdAt: new Date(),
     updatedAt: new Date()
   });
   ```

2. **Create Test Shops**:
   ```typescript
   await adminDb.collection('shops').add({
     name: 'Test Shop',
     location: 'Harar',
     balance: 0,
     createdAt: new Date(),
     updatedAt: new Date()
   });
   ```

3. **Create Test Orders**:
   ```typescript
   await adminDb.collection('orders').add({
     userId: '111111111',
     items: [],
     totalAmount: 500,
     deliveryFee: 40,
     status: 'COMPLETED',
     createdAt: new Date(),
     updatedAt: new Date()
   });
   ```

**Expected Result**:
- Metrics reflect the test data
- Recent orders table shows test orders
- Revenue calculations are correct

### Test Scenario 3: Unauthorized Access

**Setup**: Use a Telegram ID NOT in `ADMIN_TELEGRAM_IDS`

**Expected Result**:
- Redirected to `/unauthorized` page
- Cannot access admin dashboard
- Error message displayed

## Troubleshooting

### Issue: "Failed to Load Statistics"

**Possible Causes**:
1. Firebase Admin SDK not initialized
2. Firestore emulator not running
3. Admin authentication failed

**Solutions**:
- Check Firebase emulator is running: `npm run emulator`
- Verify `FIREBASE_SERVICE_ACCOUNT_KEY` in `.env.local`
- Check browser console for detailed errors

### Issue: Redirected to /unauthorized

**Possible Causes**:
1. Telegram ID not in `ADMIN_TELEGRAM_IDS`
2. Cookie/header not set correctly
3. Environment variable not loaded

**Solutions**:
- Verify your Telegram ID is in `.env.local`
- Restart dev server after changing `.env.local`
- Check cookie is set in browser DevTools
- Verify environment variable: `console.log(process.env.ADMIN_TELEGRAM_IDS)`

### Issue: Middleware Not Working

**Possible Causes**:
1. Middleware not running on `/admin` routes
2. Telegram ID not passed correctly

**Solutions**:
- Check `src/middleware.ts` config matcher includes `/admin/:path*`
- Verify cookie or header is being sent with request
- Check middleware logs in terminal

## Security Notes

### Production Deployment

1. **Never Hardcode Admin IDs**: Always use environment variables
2. **Secure Environment Variables**: Use secure secret management (Vercel, AWS Secrets Manager, etc.)
3. **Telegram Authentication**: Verify Telegram WebApp data signature
4. **HTTPS Only**: Admin routes must use HTTPS in production
5. **Audit Logging**: All admin actions are logged to `adminLogs` collection

### Admin Telegram IDs

- **Keep Secret**: Don't commit admin IDs to version control
- **Rotate Regularly**: Change admin IDs if compromised
- **Minimum Necessary**: Only add trusted system owners
- **Monitor Access**: Review admin logs regularly

## Next Steps

After accessing the admin dashboard, you can:

1. **Implement User Management** (Task 20)
   - View all users
   - Suspend/activate users
   - Change user roles

2. **Implement Shop Management** (Task 21)
   - View all shops
   - Suspend/activate shops
   - Adjust shop balances

3. **Implement Product Moderation** (Task 22)
   - View all products
   - Remove inappropriate products

4. **Implement Order Management** (Task 23)
   - View all orders
   - Manual status updates
   - Process refunds

5. **Implement Financial Reporting** (Task 24)
   - Revenue reports
   - Export to CSV

6. **Implement System Monitoring** (Task 25)
   - Error logs
   - Webhook history
   - System health checks

## Quick Reference

### URLs
- **Admin Dashboard**: `http://localhost:3000/admin`
- **Unauthorized Page**: `http://localhost:3000/unauthorized`

### Environment Variables
```bash
ADMIN_TELEGRAM_IDS=123456789,987654321
```

### Files
- **Dashboard Page**: `src/app/admin/page.tsx`
- **Admin Layout**: `src/app/admin/layout.tsx`
- **Admin Auth**: `src/lib/auth/admin.ts`
- **Middleware**: `src/middleware.ts`
- **Server Actions**: `src/app/actions/admin.ts`

### Commands
```bash
# Start dev server
npm run dev

# Start Firebase emulator
npm run emulator

# View emulator UI
# Open: http://localhost:4000
```

## Support

If you encounter issues:
1. Check this guide's Troubleshooting section
2. Review browser console for errors
3. Check terminal logs for server errors
4. Verify Firebase emulator is running
5. Ensure environment variables are set correctly
