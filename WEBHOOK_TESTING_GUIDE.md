# Payment Webhook Testing Guide

## Overview

This guide covers testing the Chapa payment webhook handler, which is the critical component that updates order status from PENDING to PAID_ESCROW after successful payment.

## What the Webhook Does

The webhook handler (`/api/webhooks/chapa`) receives payment confirmation from Chapa and:

1. **Validates** the webhook signature (production) or skips validation (sandbox)
2. **Checks idempotency** - prevents duplicate processing
3. **Updates order status** atomically using Firestore Transaction
4. **Logs all webhook calls** for audit trail
5. **Handles payment failures** by cancelling orders and restoring stock

## Requirements Covered

- ✅ 8.3: Payment webhook receives confirmation and updates order status
- ✅ 8.7: Webhook verifies orderId hasn't been processed (idempotency)
- ✅ 23.1: Uses Firestore Transaction for atomic status update
- ✅ 24.1: Checks if orderId already processed to PAID_ESCROW
- ✅ 24.2: Returns success without modifying if already processed
- ✅ 24.3: Updates status only if not already processed
- ✅ 24.4: Logs all webhook calls with timestamp and result
- ✅ 24.5: Uses Firestore Transaction for atomic check-and-update

## Testing Methods

### Method 1: Manual Webhook Simulation (Recommended for Local Testing)

Use the provided test script to simulate webhook calls:

```bash
# Test successful payment
npx ts-node scripts/test-webhook.ts <orderId> success

# Test failed payment
npx ts-node scripts/test-webhook.ts <orderId> failed
```

**Example:**
```bash
# 1. Create an order through checkout (note the orderId from console)
# 2. Test successful payment
npx ts-node scripts/test-webhook.ts abc123def456 success

# 3. Test idempotency (call again with same orderId)
npx ts-node scripts/test-webhook.ts abc123def456 success
```

### Method 2: cURL Commands

```bash
# Successful payment webhook
curl -X POST http://localhost:3000/api/webhooks/chapa \
  -H "Content-Type: application/json" \
  -d '{
    "event": "charge.success",
    "data": {
      "tx_ref": "YOUR_ORDER_ID",
      "status": "success",
      "amount": 100,
      "currency": "ETB",
      "reference": "CHAPA_TEST_123"
    }
  }'

# Failed payment webhook
curl -X POST http://localhost:3000/api/webhooks/chapa \
  -H "Content-Type: application/json" \
  -d '{
    "event": "charge.failed",
    "data": {
      "tx_ref": "YOUR_ORDER_ID",
      "status": "failed",
      "amount": 100,
      "currency": "ETB",
      "reference": "CHAPA_TEST_456"
    }
  }'
```

### Method 3: Postman/Insomnia

**Endpoint:** `POST http://localhost:3000/api/webhooks/chapa`

**Headers:**
```
Content-Type: application/json
```

**Body (Success):**
```json
{
  "event": "charge.success",
  "data": {
    "tx_ref": "YOUR_ORDER_ID",
    "status": "success",
    "amount": 100,
    "currency": "ETB",
    "reference": "CHAPA_TEST_123"
  }
}
```

**Body (Failure):**
```json
{
  "event": "charge.failed",
  "data": {
    "tx_ref": "YOUR_ORDER_ID",
    "status": "failed",
    "amount": 100,
    "currency": "ETB",
    "reference": "CHAPA_TEST_456"
  }
}
```

## Test Scenarios

### Scenario 1: Successful Payment (First Time)

**Setup:**
1. Create an order through checkout
2. Note the orderId from console logs
3. Verify order status is PENDING in Firestore

**Steps:**
```bash
npx ts-node scripts/test-webhook.ts <orderId> success
```

**Expected Results:**
- ✅ Response: `{ success: true, statusChanged: true }`
- ✅ Order status updated to PAID_ESCROW
- ✅ chapaTransactionRef stored with order
- ✅ statusHistory includes PENDING → PAID_ESCROW transition
- ✅ Webhook logged in webhookLogs collection
- ✅ Console shows: "Order status updated to PAID_ESCROW"

**Firestore Verification:**
```javascript
// Check order document
{
  status: 'PAID_ESCROW',
  chapaTransactionRef: 'CHAPA_TEST_...',
  statusHistory: [
    { from: null, to: 'PENDING', ... },
    { from: 'PENDING', to: 'PAID_ESCROW', actor: 'SYSTEM_WEBHOOK', ... }
  ]
}
```

---

### Scenario 2: Idempotency Test (Duplicate Webhook)

**Setup:**
1. Complete Scenario 1 (order already in PAID_ESCROW)

**Steps:**
```bash
# Call webhook again with same orderId
npx ts-node scripts/test-webhook.ts <orderId> success
```

**Expected Results:**
- ✅ Response: `{ success: true, statusChanged: false, message: 'Order already processed' }`
- ✅ Order status remains PAID_ESCROW (no change)
- ✅ No duplicate statusHistory entry
- ✅ Webhook still logged (for audit)
- ✅ Console shows: "Order already processed - idempotent response"

**Requirements Validated:**
- 24.1: Checks if orderId already processed
- 24.2: Returns success without modifying order
- Idempotency ensures duplicate webhooks don't cause issues

---

### Scenario 3: Failed Payment

**Setup:**
1. Create an order through checkout
2. Note the orderId
3. Verify order status is PENDING

**Steps:**
```bash
npx ts-node scripts/test-webhook.ts <orderId> failed
```

**Expected Results:**
- ✅ Response: `{ success: true, statusChanged: true, newStatus: 'CANCELLED' }`
- ✅ Order status updated to CANCELLED
- ✅ cancellationReason: 'Payment failed'
- ✅ Product stock restored (incremented)
- ✅ statusHistory includes PENDING → CANCELLED transition
- ✅ Console shows: "Order cancelled due to payment failure"

**Firestore Verification:**
```javascript
// Check order document
{
  status: 'CANCELLED',
  cancellationReason: 'Payment failed',
  chapaTransactionRef: 'CHAPA_TEST_...',
  statusHistory: [
    { from: null, to: 'PENDING', ... },
    { from: 'PENDING', to: 'CANCELLED', actor: 'SYSTEM_WEBHOOK', ... }
  ]
}

// Check product stock was restored
// Original stock + order quantity
```

---

### Scenario 4: Invalid Order ID

**Steps:**
```bash
npx ts-node scripts/test-webhook.ts nonexistent_order success
```

**Expected Results:**
- ✅ Response: `{ success: false, error: 'ORDER_NOT_FOUND' }`
- ✅ Error logged in webhookLogs
- ✅ HTTP status: 200 (to prevent Chapa retries)
- ✅ Console shows error

---

### Scenario 5: Invalid Status Transition

**Setup:**
1. Create an order
2. Manually update order status to DISPATCHED in Firestore

**Steps:**
```bash
npx ts-node scripts/test-webhook.ts <orderId> success
```

**Expected Results:**
- ✅ Response: `{ success: false, error: 'INVALID_STATUS: Expected PENDING, got DISPATCHED' }`
- ✅ Order status unchanged
- ✅ Error logged
- ✅ Transaction rolled back

---

### Scenario 6: Concurrent Webhooks (Race Condition Test)

**Setup:**
1. Create an order (status PENDING)

**Steps:**
```bash
# Send two webhooks simultaneously
npx ts-node scripts/test-webhook.ts <orderId> success &
npx ts-node scripts/test-webhook.ts <orderId> success &
```

**Expected Results:**
- ✅ First webhook: `statusChanged: true`
- ✅ Second webhook: `statusChanged: false` (idempotent)
- ✅ Order status updated exactly once
- ✅ No race condition issues
- ✅ Firestore Transaction ensures atomicity

---

## Webhook Logs Collection

All webhook calls are logged in Firestore:

**Collection:** `webhookLogs`

**Document Structure:**
```javascript
{
  orderId: 'abc123',
  event: 'charge.success',
  status: 'success',
  amount: 100,
  reference: 'CHAPA_TEST_123',
  timestamp: Timestamp,
  processingTimeMs: 45,
  result: {
    statusChanged: true,
    message: 'Payment confirmed, order updated to PAID_ESCROW',
    previousStatus: 'PENDING',
    newStatus: 'PAID_ESCROW'
  }
}
```

**Viewing Logs:**
1. Open Firebase Emulator UI: http://127.0.0.1:4000
2. Navigate to Firestore
3. Open `webhookLogs` collection
4. Review webhook processing history

---

## Testing Checklist

### Functional Tests
- [ ] Successful payment updates order to PAID_ESCROW
- [ ] Failed payment cancels order and restores stock
- [ ] Duplicate webhooks are idempotent (no double-processing)
- [ ] Invalid order IDs return error
- [ ] Invalid status transitions are rejected
- [ ] Concurrent webhooks handled correctly
- [ ] Webhook logs created for all calls
- [ ] Processing time logged
- [ ] Chapa transaction reference stored

### Security Tests
- [ ] Signature validation works (production mode)
- [ ] Signature validation skipped in sandbox mode
- [ ] Invalid signatures rejected (production)
- [ ] Malformed payloads handled gracefully

### Data Integrity Tests
- [ ] Order status updated atomically
- [ ] statusHistory includes all transitions
- [ ] Product stock restored on payment failure
- [ ] No partial updates (transaction rollback works)
- [ ] Timestamps recorded correctly

### Performance Tests
- [ ] Webhook processes in < 500ms
- [ ] Transaction retries work on conflicts
- [ ] Logs don't block webhook response

---

## Console Log Examples

### Successful Payment (First Time)
```
[Webhook] Received Chapa webhook
[Webhook] Signature present: false
[Webhook] Sandbox mode - skipping signature validation
[Webhook] Raw payload: { "event": "charge.success", ... }
[Webhook] Processed webhook data: { event: 'charge.success', orderId: 'abc123', ... }
[Webhook] Processing successful payment for order: abc123
[Webhook] Current order status: PENDING
[Webhook] Order status updated to PAID_ESCROW
[Webhook] Processing complete: { statusChanged: true, ... }
[Webhook] Processing time: 45 ms
```

### Idempotent Call
```
[Webhook] Received Chapa webhook
[Webhook] Processing successful payment for order: abc123
[Webhook] Current order status: PAID_ESCROW
[Webhook] Order already processed - idempotent response
[Webhook] Processing complete: { statusChanged: false, ... }
```

### Failed Payment
```
[Webhook] Received Chapa webhook
[Webhook] Processing failed payment for order: abc123
[Webhook] Order cancelled due to payment failure
[Webhook] Processing complete: { statusChanged: true, newStatus: 'CANCELLED' }
```

---

## Common Issues and Solutions

### Issue: "ORDER_NOT_FOUND"
**Cause:** Order ID doesn't exist in Firestore
**Solution:** Verify orderId is correct, check Firestore for order document

### Issue: "INVALID_STATUS: Expected PENDING"
**Cause:** Order is not in PENDING status
**Solution:** Only PENDING orders can be updated by webhook. Check order status in Firestore.

### Issue: Webhook not receiving calls
**Cause:** Dev server not running or wrong URL
**Solution:** Ensure `npm run dev` is running on port 3000

### Issue: Signature validation fails
**Cause:** CHAPA_WEBHOOK_SECRET not set or incorrect
**Solution:** Check .env.local has correct webhook secret, or use sandbox mode

---

## Integration with Checkout Flow

**Complete Flow:**
```
1. User clicks "Proceed to Payment" in checkout
2. Order created with status PENDING
3. Payment initiated with Chapa
4. User redirected to Chapa payment page
5. User completes payment on Chapa
6. Chapa sends webhook to /api/webhooks/chapa
7. Webhook handler updates order to PAID_ESCROW
8. User can now see order in "Paid" status
9. Shop owner can see order and mark as DISPATCHED
```

---

## Next Steps After Webhook Testing

Once webhook is working:

1. **Test End-to-End Flow**
   - Create order → Pay → Verify PAID_ESCROW status
   - Test with multiple orders
   - Test with different delivery fees

2. **Build Order Management UI**
   - Buyer order history
   - Order details with status timeline
   - Shop owner order view

3. **Implement Order Fulfillment**
   - Shop owner marks DISPATCHED
   - Runner marks ARRIVED
   - Buyer verifies with OTP

---

## Production Considerations

Before going live:

1. **Enable signature validation** - Set production webhook secret
2. **Configure Chapa webhook URL** - Point to production domain
3. **Set up monitoring** - Alert on webhook failures
4. **Review webhook logs** - Regular audit of processing
5. **Test with real Chapa sandbox** - Use actual Chapa test transactions
6. **Implement retry logic** - Handle temporary failures
7. **Add rate limiting** - Prevent webhook abuse

---

## Files Created

- ✅ `src/app/api/webhooks/chapa/route.ts` - Webhook handler
- ✅ `scripts/test-webhook.ts` - Testing utility
- ✅ `WEBHOOK_TESTING_GUIDE.md` - This guide

---

**Status:** ✅ Ready for Testing

**Estimated Testing Time:** 20-30 minutes

**Critical Path:** This completes the payment flow. After testing, you can build order management UI.
