# Quick Test Reference Card

## 🚀 Fast Track Testing (10 Minutes)

### Prerequisites Check
```bash
# Terminal 1: Emulator running?
ps aux | grep firebase

# Terminal 2: Dev server running?
ps aux | grep next

# If not running, start them:
# Terminal 1:
export PATH="/d/misrak-shemeta-/jdk-21.0.6+7/bin:$PATH" && export FIREBASE_EMULATORS_PATH="$PWD/.firebase-cache" && firebase emulators:start

# Terminal 2:
npm run dev
```

---

## Test Sequence

### 1️⃣ Add to Cart (1 min)
```
Browser: http://localhost:3000
→ Shops
→ Click any shop
→ Add 2-3 products
→ Click cart icon
✅ Verify items in cart
```

### 2️⃣ Checkout (1 min)
```
→ Click "Proceed to Checkout"
✅ Verify delivery fee (40/100/180 ETB)
✅ Verify total = subtotal + delivery
```

### 3️⃣ Create Order (1 min)
```
→ Click "Proceed to Payment"
✅ Copy orderId from console
✅ Verify cart cleared
```

### 4️⃣ Simulate Payment (1 min)
```bash
# Terminal 3:
npx ts-node scripts/test-webhook.ts <ORDER_ID> success
```

**Expected:**
```
✅ Webhook processed successfully
   Order status changed: PENDING → PAID_ESCROW
```

### 5️⃣ Verify in Firestore (2 min)
```
Browser: http://127.0.0.1:4000
→ Firestore
→ orders collection
→ Find your order
✅ status: "PAID_ESCROW"
✅ chapaTransactionRef: present
✅ statusHistory: 2 entries
```

### 6️⃣ Test Idempotency (1 min)
```bash
# Run same webhook again
npx ts-node scripts/test-webhook.ts <ORDER_ID> success
```

**Expected:**
```
✅ Webhook processed successfully
   Order already processed
```

### 7️⃣ Verify No Duplicate (1 min)
```
Firestore → orders → your order
✅ statusHistory still has 2 entries (not 3)
✅ status still PAID_ESCROW
```

---

## Console Log Cheat Sheet

### ✅ Good Logs (Success)

**Checkout:**
```
[CheckoutPage] Loading checkout data
[CheckoutPage] Cart result: { success: true }
```

**Order Creation:**
```
[CheckoutPage] Creating order...
[CheckoutPage] Order created: abc123
```

**Payment:**
```
[Payment] Initiating Chapa payment
[Chapa Sandbox] Payment initiation request
```

**Webhook:**
```
[Webhook] Received Chapa webhook
[Webhook] Processing successful payment
[Webhook] Order status updated to PAID_ESCROW
[Webhook] Processing time: 45 ms
```

### ❌ Bad Logs (Errors)

**Empty Cart:**
```
[CheckoutPage] Cart result: { success: false, error: 'EMPTY_CART' }
```

**Stock Issue:**
```
[Order] Error: INSUFFICIENT_STOCK: Product Name
```

**Webhook Error:**
```
[Webhook] Error: ORDER_NOT_FOUND
```

---

## Quick Fixes

### Issue: Can't add to cart
**Fix:** Ensure user is authenticated and has home location

### Issue: Checkout shows 0 ETB delivery
**Fix:** Check shop has city assigned in Firestore

### Issue: Order not created
**Fix:** Check cart has items, user authenticated

### Issue: Webhook fails
**Fix:** Verify orderId exists, status is PENDING

---

## Firestore Quick Check

### Order Document Structure
```javascript
{
  id: "abc123",
  status: "PAID_ESCROW",  // ← Should change from PENDING
  userId: "user123",
  items: [...],
  totalAmount: 100,
  deliveryFee: 40,
  otpCode: "123456",
  chapaTransactionRef: "CHAPA_TEST_...",  // ← Added by webhook
  statusHistory: [
    { from: null, to: "PENDING", ... },
    { from: "PENDING", to: "PAID_ESCROW", actor: "SYSTEM_WEBHOOK", ... }
  ]
}
```

### Webhook Log Structure
```javascript
{
  orderId: "abc123",
  event: "charge.success",
  status: "success",
  processingTimeMs: 45,
  result: {
    statusChanged: true,
    newStatus: "PAID_ESCROW"
  }
}
```

---

## Test All Delivery Routes (5 min)

```bash
# Change user homeLocation in Firestore, then test:

# Intra-city (40 ETB)
Harar shop → Harar Campus user
Dire Dawa shop → DDU user

# City-to-campus (100 ETB)
Harar shop → Haramaya Main user
Dire Dawa shop → Haramaya Main user

# Inter-city (180 ETB)
Harar shop → DDU user
Dire Dawa shop → Harar Campus user
```

---

## URLs Quick Reference

- **App:** http://localhost:3000
- **Emulator UI:** http://127.0.0.1:4000
- **Firestore:** http://127.0.0.1:4000/firestore
- **Auth:** http://127.0.0.1:4000/auth
- **Webhook:** http://localhost:3000/api/webhooks/chapa

---

## Command Quick Reference

```bash
# Test successful payment
npx ts-node scripts/test-webhook.ts <ORDER_ID> success

# Test failed payment
npx ts-node scripts/test-webhook.ts <ORDER_ID> failed

# Check webhook endpoint
curl http://localhost:3000/api/webhooks/chapa

# View logs
# Check Terminal 2 (dev server) for webhook logs
```

---

## Success Checklist

- [ ] Cart shows items
- [ ] Checkout calculates delivery fee
- [ ] Order created (PENDING)
- [ ] Cart cleared
- [ ] Webhook updates to PAID_ESCROW
- [ ] Idempotency works (no duplicates)
- [ ] Webhook logged
- [ ] Console logs clean

---

## If Everything Works ✅

**Congratulations!** Your payment flow is working perfectly.

**Next Steps:**
1. Read `NEXT_STEPS.md` for what to build next
2. Consider building Order Management UI
3. Or continue with more comprehensive testing

---

## If Something Fails ❌

**Don't Panic!** Check:

1. **Console logs** - What's the error?
2. **Firestore data** - Is the order there?
3. **Emulator running?** - Check both terminals
4. **OrderId correct?** - Copy from console carefully

**Detailed Guides:**
- `CHECKOUT_TESTING_GUIDE.md` - Checkout issues
- `WEBHOOK_TESTING_GUIDE.md` - Webhook issues
- `PAYMENT_FLOW_TESTING.md` - End-to-end issues

---

## Time Estimates

- **Quick Test:** 10 minutes
- **Comprehensive Test:** 30 minutes
- **All Scenarios:** 60 minutes

---

**Print this card and keep it handy while testing!** 📋
