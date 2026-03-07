# Quick Dashboard Access Guide

## 🎯 Your Current Setup

**Your Telegram ID**: `779028866`  
**Your Current Role**: `ADMIN`  
**Your User ID**: `y3RnPvOisQLzhGXDEE9K`

---

## 🚀 Quick Access (Right Now!)

### 1. Admin Dashboard ✅ (You Have Access!)

**Local**: http://localhost:3000/admin  
**Production**: https://misrak-shemeta.vercel.app/admin

Just open the URL in your browser - you're already configured as admin!

---

## 🔄 To Test Other Dashboards

### Option 1: Quick Role Switch (Recommended)

Run this command to switch your role:

```bash
# Switch to Merchant
npx tsx scripts/switch-my-role.ts MERCHANT

# Switch to Runner
npx tsx scripts/switch-my-role.ts RUNNER

# Switch to Student
npx tsx scripts/switch-my-role.ts STUDENT

# Switch back to Admin
npx tsx scripts/switch-my-role.ts ADMIN
```

After switching, visit the corresponding dashboard URL.

### Option 2: Create Test Users

Run this to create separate test users for each role:

```bash
npx tsx scripts/setup-test-users.ts
```

This creates:
- Admin: `779028866` (you)
- Merchant: `888888888`
- Runner: `777777777`
- Student: `666666666`

---

## 📱 Dashboard URLs

| Role | Local URL | Production URL |
|------|-----------|----------------|
| **Admin** | http://localhost:3000/admin | https://misrak-shemeta.vercel.app/admin |
| **Merchant** | http://localhost:3000/merchant | https://misrak-shemeta.vercel.app/merchant |
| **Runner** | http://localhost:3000/runner/orders | https://misrak-shemeta.vercel.app/runner/orders |
| **Student** | http://localhost:3000/ | https://misrak-shemeta.vercel.app/ |

---

## 🎨 What Each Dashboard Shows

### Admin Dashboard
- Platform statistics (users, shops, orders, revenue)
- User management (suspend/activate)
- Shop management (approve/suspend)
- Product management
- Order management (refunds)
- Financial overview
- System monitoring

### Merchant Dashboard
- Shop statistics
- Product management (add/edit/delete)
- Order management
- Balance and earnings
- Shop settings

### Runner Dashboard
- Active deliveries
- Delivery status updates
- OTP verification
- Delivery history
- Earnings

### Customer Dashboard
- Browse products
- Shopping cart
- Checkout and payment
- Order tracking
- Profile management

---

## 🛠️ Step-by-Step: Testing Merchant Dashboard

1. **Switch your role to MERCHANT**:
   ```bash
   npx tsx scripts/switch-my-role.ts MERCHANT
   ```

2. **Create a shop** (if you don't have one):
   - Visit: http://localhost:3000/merchant/register
   - Fill in shop details
   - Submit

3. **Access merchant dashboard**:
   - Visit: http://localhost:3000/merchant

4. **Switch back to ADMIN** when done:
   ```bash
   npx tsx scripts/switch-my-role.ts ADMIN
   ```

---

## 🛠️ Step-by-Step: Testing Runner Dashboard

1. **Switch your role to RUNNER**:
   ```bash
   npx tsx scripts/switch-my-role.ts RUNNER
   ```

2. **Access runner dashboard**:
   - Visit: http://localhost:3000/runner/orders

3. **Switch back to ADMIN** when done:
   ```bash
   npx tsx scripts/switch-my-role.ts ADMIN
   ```

---

## 📝 Important Notes

- **Development Mode**: Admin access is automatic if `ADMIN_TELEGRAM_IDS` is set
- **Role Changes**: May require browser refresh or clearing cookies
- **Merchant Role**: Requires a shop to be created
- **Production**: Requires Telegram Mini App authentication

---

## 🆘 Troubleshooting

### Can't Access Admin Dashboard
- Check `.env.local` has `ADMIN_TELEGRAM_IDS="779028866"`
- Restart dev server: `npm run dev`

### "No Shop Found" on Merchant Dashboard
- Visit `/merchant/register` to create a shop
- Or run: `npx tsx scripts/setup-test-users.ts`

### Role Switch Not Working
- Clear browser cookies
- Refresh the page
- Check Firebase Console to verify role was updated

---

## 🎉 Ready to Test!

You can start testing the admin dashboard right now:

**Local**: http://localhost:3000/admin

For other dashboards, use the role switch script above!
