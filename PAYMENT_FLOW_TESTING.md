# Complete Payment Flow Testing Guide

## Overview

This guide walks you through testing the **complete payment flow** from cart to order confirmation.

## Prerequisites

✅ Firebase Emulator running (Terminal 1)
✅ Next.js dev server running (Terminal 2)
✅ Test data seeded (users, shops, products)

## Complete Flow Diagram

```
Cart → Checkout → Payment Initiation → Chapa (Simulated) → Webhook → Order Confirmed
  ↓        ↓              ↓                    ↓               ↓            ↓
View    Calculate      Create Order        User Pays      Update to    PAID_ESCROW
Items   Delivery       (PENDING)          (External)     PAID_ESCROW    Status
        Fees
```

## Step-by-Step Testing

### Step 1: Add Products to Cart (2 minutes)

1. Open browser: http://localhost:3000
2. Navigate to "Shops"
3. Click on any shop (e.g., "Harar Tech Hub")
4. Add 2-3 products to cart
5. Click cart icon in bottom navigation
6. Verify cart shows all items

**Expected:** Cart displays items with quantities and prices

---

### Step 2: Proceed to Checkout (2 minutes)

1. In cart page, click "Proceed to Checkout"
2. Verify checkout page displays:
   - Your delivery location
   - Order summary with all items
   - Delivery fee breakdown
   - Total amount

**Expected:** 
- Delivery fee calculated correctly (40/100/180 ETB)
- Total = Subtotal + Delivery Fee
- All items listed

**Console Check:**
```
[CheckoutPage] Loading checkout data for user: ...
[CheckoutPage] Cart result: { success: true, ... }
```

---

### Step 3: Initiate Payment (1 minute)

1. Click "Proceed to Payment" button
2. Watch console logs
3. Note the orderId from console

**Expected Console Logs:**
```
[CheckoutPage] Creating order...
[CheckoutPage] Order created: <ORDER_ID>
[CheckoutPage] Initiating payment...
[Payment] Initiating Chapa payment for order: <ORDER_ID>
[Chapa Sandbox] Payment initiation request: { amount: ..., tx_ref: ... }
[Chapa Sandbox] Payment initiation response: { status: 'success', ... }
[CheckoutPage] Payment initiated, redirecting to: <CHECKOUT_URL>
```

**Expected Behavior:**
- Order created with status PENDING
- Cart cleared
- Browser attempts to redirect to Chapa URL (will fail in local dev)

**Important:** Copy the orderId from console - you'll need it for the next step!

---

### Step 4: Verify Order in Firestore (1 minute)

1. Open Firebase Emulator UI: http://127.0.0.1:4000
2. Navigate to Firestore
3. Open `orders` collection
4. Find your order by ID
5. Verify order data:
   - status: "PENDING"
   - items: array with your products
   - totalAmount: correct sum
   - deliveryFee: correct fee
   - otpCode: 6-digit number
   - userHomeLocation: your location

**Expected:** Order document exists with all correct data

---

### Step 5: Simulate Payment Success (Webhook) (1 minute)

Since we can't actually pay through Chapa in local dev, we'll simulate the webhook:

```bash
# Replace <ORDER_ID> with the orderId from Step 3
npx ts-node scripts/test-webhook.ts <ORDER_ID> success
```

**Example:**
```bash
npx ts-node scripts/test-webhook.ts abc123def456 success
```

**Expected Output:**
```
Sending webhook to: http://localhost:3000/api/webhooks/chapa
Payload: {
  "event": "charge.success",
  "data": {
    "tx_ref": "abc123def456",
    "status": "success",
    ...
  }
}

Response status: 200
Response data: {
  "success": true,
  "statusChanged": true,
  "message": "Payment confirmed, order updated to PAID_ESCROW",
  "previousStatus": "PENDING",
  "newStatus": "PAID_ESCROW"
}

✅ Webhook processed successfully
   Order status changed: PENDING → PAID_ESCROW
```

**Expected Console Logs (Dev Server):**
```
[Webhook] Received Chapa webhook
[Webhook] Sandbox mode - skipping signature validation
[Webhook] Processing successful payment for order: <ORDER_ID>
[Webhook] Current order status: PENDING
[Webhook] Order status updated to PAID_ESCROW
[Webhook] Processing complete: { statusChanged: true, ... }
[Webhook] Processing time: 45 ms
```

---

### Step 6: Verify Order Status Updated (1 minute)

1. Go back to Firebase Emulator UI
2. Refresh the orders collection
3. Open your order document
4. Verify:
   - status: "PAID_ESCROW" (changed from PENDING)
   - chapaTransactionRef: present
   - statusHistory: has two entries
     - Entry 1: null → PENDING
     - Entry 2: PENDING → PAID_ESCROW (actor: SYSTEM_WEBHOOK)

**Expected:** Order status successfully updated to PAID_ESCROW

---

### Step 7: Check Webhook Logs (1 minute)

1. In Firebase Emulator UI, navigate to Firestore
2. Open `webhookLogs` collection
3. Find the log entry for your order
4. Verify:
   - orderId: your order ID
   - event: "charge.success"
   - status: "success"
   - processingTimeMs: < 500
   - result.statusChanged: true

**Expected:** Webhook call logged with all details

---

### Step 8: Test Idempotency (1 minute)

Send the same webhook again to test idempotency:

```bash
npx ts-node scripts/test-webhook.ts <ORDER_ID> success
```

**Expected Output:**
```
✅ Webhook processed successfully
   Order already processed
```

**Expected Console Logs:**
```
[Webhook] Current order status: PAID_ESCROW
[Webhook] Order already processed - idempotent response
```

**Verify in Firestore:**
- Order status still PAID_ESCROW (no change)
- statusHistory still has only 2 entries (no duplicate)
- New webhook log entry created (for audit)

---

## Success Criteria

✅ **Cart to Checkout:** Smooth navigation, correct calculations
✅ **Order Creation:** Order created with PENDING status
✅ **Payment Initiation:** Chapa payment request generated
✅ **Webhook Processing:** Order updated to PAID_ESCROW
✅ **Idempotency:** Duplicate webhooks don't cause issues
✅ **Logging:** All webhook calls logged
✅ **Data Integrity:** Order data correct in Firestore

---

## Testing Different Scenarios

### Scenario A: Multi-Shop Order

1. Add products from 2 different shops
2. Proceed to checkout
3. Verify delivery fee breakdown shows both shops
4. Complete payment flow

**Expected:** Multiple delivery fees calculated and summed

---

### Scenario B: Payment Failure

1. Create an order (note orderId)
2. Simulate failed payment:
   ```bash
   npx ts-node scripts/test-webhook.ts <ORDER_ID> failed
   ```
3. Verify order status changed to CANCELLED
4. Verify product stock restored

**Expected:** Order cancelled, stock restored

---

### Scenario C: Different Delivery Routes

Test all 6 delivery routes:

| Shop Location | User Location     | Expected Fee |
|---------------|-------------------|--------------|
| Harar         | Harar Campus      | 40 ETB       |
| Dire Dawa     | DDU               | 40 ETB       |
| Harar         | Haramaya Main     | 100 ETB      |
| Dire Dawa     | Haramaya Main     | 100 ETB      |
| Harar         | DDU               | 180 ETB      |
| Dire Dawa     | Harar Campus      | 180 ETB      |

**Steps:**
1. Change user home location in Firestore
2. Add products from specific shop
3. Verify delivery fee in checkout

---

## Troubleshooting

### Issue: Order not created
**Check:**
- Console logs for errors
- Cart has items
- User is authenticated

### Issue: Webhook returns error
**Check:**
- Order exists in Firestore
- Order status is PENDING
- Dev server is running
- OrderId is correct

### Issue: Status not updating
**Check:**
- Webhook response shows success
- Console logs show "Order status updated"
- Firestore Transaction didn't fail

### Issue: Duplicate status changes
**Check:**
- Idempotency working correctly
- Only one PAID_ESCROW entry in statusHistory

---

## What's Next

After successful payment flow testing:

1. **Build Order Management UI**
   - Buyer order history page
   - Order details with status timeline
   - Shop owner order management

2. **Implement Order Fulfillment**
   - Shop owner marks DISPATCHED
   - Runner marks ARRIVED
   - Buyer verifies with OTP

3. **End-to-End Testing**
   - Complete buyer journey
   - Complete seller journey
   - Test all edge cases

---

## Quick Test Script

Run this complete test in one go:

```bash
# 1. Add products to cart via UI
# 2. Proceed to checkout via UI
# 3. Click "Proceed to Payment" and copy orderId from console
# 4. Run webhook test
npx ts-node scripts/test-webhook.ts <ORDER_ID> success

# 5. Test idempotency
npx ts-node scripts/test-webhook.ts <ORDER_ID> success

# 6. Verify in Firestore Emulator UI
```

---

## Files Reference

- `src/app/checkout/page.tsx` - Checkout page
- `src/app/actions/payment.ts` - Payment initiation
- `src/app/actions/orders.ts` - Order creation
- `src/app/api/webhooks/chapa/route.ts` - Webhook handler
- `scripts/test-webhook.ts` - Testing utility
- `CHECKOUT_TESTING_GUIDE.md` - Detailed checkout tests
- `WEBHOOK_TESTING_GUIDE.md` - Detailed webhook tests

---

**Status:** ✅ Payment Flow Complete and Ready for Testing

**Estimated Testing Time:** 10-15 minutes for complete flow

**Next Milestone:** Order Management UI
