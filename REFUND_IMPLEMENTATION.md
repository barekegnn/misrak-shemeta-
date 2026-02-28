# Refund Implementation Documentation

**Date**: February 28, 2026  
**Feature**: Automatic Refund Processing for Order Cancellations  
**Requirement**: 18.2 - Order Cancellation with Refund

---

## Overview

This document describes the implementation of automatic refund processing when users cancel orders that have been paid (PAID_ESCROW status). The system integrates with Chapa's refund API to automatically process refunds and tracks refund status in Firestore.

---

## Implementation Details

### 1. Order Type Extensions

**File**: `src/types/index.ts`

Added refund tracking fields to the `Order` interface:

```typescript
export interface Order {
  // ... existing fields ...
  
  // Refund tracking fields
  refundInitiated?: boolean;      // True if refund was initiated
  refundAmount?: number;           // Amount refunded in ETB
  refundInitiatedAt?: Date;        // Timestamp of refund initiation
  refundFailed?: boolean;          // True if refund failed
  refundError?: string;            // Error message if refund failed
  refundFailedAt?: Date;           // Timestamp of refund failure
}
```

### 2. Refund Processing Logic

**File**: `src/app/actions/orders.ts` - `cancelOrder` function

The refund processing happens after the order cancellation transaction completes:

```typescript
// After transaction completes successfully
if (result && result.requiresRefund && result.chapaTransactionRef) {
  try {
    const { initiateRefund } = await import('@/lib/payment/chapa');
    const refundAmount = result.totalAmount + result.deliveryFee;
    
    await initiateRefund(
      result.chapaTransactionRef,
      refundAmount,
      reason
    );
    
    // Update order with refund success
    await adminDb.collection('orders').doc(orderId).update({
      refundInitiated: true,
      refundAmount,
      refundInitiatedAt: FieldValue.serverTimestamp()
    });
  } catch (refundError) {
    // Log refund failure but don't fail the cancellation
    await adminDb.collection('orders').doc(orderId).update({
      refundFailed: true,
      refundError: refundError.message,
      refundFailedAt: FieldValue.serverTimestamp()
    });
  }
}
```

### 3. Chapa Refund API Integration

**File**: `src/lib/payment/chapa.ts` - `initiateRefund` function

The function calls Chapa's refund API endpoint:

```typescript
export async function initiateRefund(
  txRef: string,
  amount: number,
  reason: string
): Promise<any> {
  const response = await fetch(`${config.baseUrl}/transaction/refund`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tx_ref: txRef,
      amount,
      reason,
    }),
  });
  
  // Handle response...
}
```

### 4. UI Display - Refund Status

**File**: `src/app/orders/[orderId]/page.tsx`

Added refund status display in the order detail page:

**Refund Initiated:**
```tsx
{order.refundInitiated && (
  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
    <p className="text-sm font-medium text-blue-900">Refund Initiated</p>
    <p className="text-sm text-blue-700">
      Amount: {formatCurrency(order.refundAmount || 0)}
    </p>
    <p className="text-xs text-blue-600 mt-1">
      Your refund is being processed. It may take 3-5 business days.
    </p>
  </div>
)}
```

**Refund Failed:**
```tsx
{order.refundFailed && (
  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
    <p className="text-sm font-medium text-yellow-900">Refund Processing Issue</p>
    <p className="text-sm text-yellow-700">
      We encountered an issue processing your refund automatically. 
      Our team will process your refund manually within 24 hours.
    </p>
  </div>
)}
```

---

## Refund Flow Diagram

```
User Cancels Order (PAID_ESCROW)
         │
         ▼
┌─────────────────────────┐
│ Firestore Transaction   │
│ - Update status         │
│ - Restore stock         │
│ - Record cancellation   │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Check requiresRefund    │
│ (status was PAID_ESCROW)│
└─────────────────────────┘
         │
         ▼ YES
┌─────────────────────────┐
│ Call Chapa Refund API   │
│ - tx_ref (orderId)      │
│ - amount (total + fee)  │
│ - reason                │
└─────────────────────────┘
         │
    ┌────┴────┐
    │         │
SUCCESS    FAILURE
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ Update │ │ Update │
│ Order: │ │ Order: │
│ refund │ │ refund │
│ Init   │ │ Failed │
└────────┘ └────────┘
    │         │
    ▼         ▼
┌─────────────────────────┐
│ Notify Shop Owners      │
└─────────────────────────┘
```

---

## Error Handling

### Graceful Degradation

The refund process is designed to fail gracefully:

1. **Order cancellation always succeeds** - Even if refund fails, the order is cancelled and stock is restored
2. **Refund failures are logged** - Failed refunds are tracked with `refundFailed` flag and error message
3. **Manual intervention supported** - Failed refunds trigger alerts for manual processing

### Error Scenarios

| Scenario | Behavior | User Impact |
|----------|----------|-------------|
| Chapa API unavailable | Refund marked as failed, order cancelled | User sees "manual processing" message |
| Invalid transaction ref | Refund marked as failed, order cancelled | User sees "manual processing" message |
| Network timeout | Refund marked as failed, order cancelled | User sees "manual processing" message |
| Insufficient balance | Refund marked as failed, order cancelled | User sees "manual processing" message |

---

## Testing

### Test Script

**File**: `scripts/test-refund.ts`

Run the test script to verify refund data structure:

```bash
export FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
npx tsx scripts/test-refund.ts
```

The script:
1. Creates a test order
2. Marks it as PAID_ESCROW
3. Cancels the order
4. Verifies refund fields are set correctly

### Manual Testing with Chapa Sandbox

1. **Create an order** through the UI
2. **Complete payment** using Chapa sandbox
3. **Cancel the order** with reason
4. **Verify in Chapa dashboard** that refund was initiated
5. **Check order detail page** for refund status

### Test Cases

| Test Case | Expected Result |
|-----------|----------------|
| Cancel PENDING order | No refund initiated (no payment made) |
| Cancel PAID_ESCROW order | Refund initiated, amount = total + delivery fee |
| Cancel with invalid Chapa ref | Refund fails gracefully, order still cancelled |
| Cancel DISPATCHED order | Cancellation rejected (cannot cancel) |
| Cancel ARRIVED order | Cancellation rejected (cannot cancel) |

---

## Monitoring & Alerts

### Recommended Monitoring

1. **Failed Refunds Alert**
   - Query: `orders` collection where `refundFailed == true`
   - Action: Manual refund processing required
   - SLA: Process within 24 hours

2. **Refund Success Rate**
   - Metric: `refundInitiated / (refundInitiated + refundFailed)`
   - Target: > 95%
   - Alert: If rate drops below 90%

3. **Refund Processing Time**
   - Metric: Time from cancellation to refund initiation
   - Target: < 5 seconds
   - Alert: If > 30 seconds

### Firestore Queries for Monitoring

```javascript
// Get all failed refunds
db.collection('orders')
  .where('refundFailed', '==', true)
  .where('refundFailedAt', '>', yesterday)
  .get();

// Get refund success rate (last 7 days)
db.collection('orders')
  .where('status', '==', 'CANCELLED')
  .where('updatedAt', '>', sevenDaysAgo)
  .get();
```

---

## Production Deployment Checklist

### Before Deploying

- [ ] Verify Chapa production API credentials are set
- [ ] Test refund flow in Chapa sandbox mode
- [ ] Verify refund appears in Chapa dashboard
- [ ] Test refund failure handling
- [ ] Set up monitoring for failed refunds
- [ ] Configure alerts for manual refund processing
- [ ] Document manual refund process for support team
- [ ] Test refund status display in UI

### Environment Variables

```bash
# Production
CHAPA_SECRET_KEY=sk_live_xxxxx
CHAPA_MODE=production

# Sandbox (for testing)
CHAPA_SECRET_KEY=sk_test_xxxxx
CHAPA_MODE=sandbox
```

---

## Manual Refund Process

When automatic refund fails, support team should:

1. **Verify order details** in Firestore
   - Check `refundFailed` flag
   - Note `refundError` message
   - Verify `chapaTransactionRef`

2. **Process refund manually** in Chapa dashboard
   - Login to Chapa merchant dashboard
   - Navigate to Transactions
   - Find transaction by reference
   - Initiate manual refund

3. **Update order record** in Firestore
   ```javascript
   db.collection('orders').doc(orderId).update({
     refundInitiated: true,
     refundAmount: amount,
     refundInitiatedAt: new Date(),
     refundFailed: false,
     manualRefund: true,
     manualRefundBy: 'support_user_id'
   });
   ```

4. **Notify customer** via notification system
   - Send confirmation that refund was processed
   - Include expected timeline (3-5 business days)

---

## API Reference

### Chapa Refund API

**Endpoint**: `POST /transaction/refund`

**Headers**:
```
Authorization: Bearer {CHAPA_SECRET_KEY}
Content-Type: application/json
```

**Request Body**:
```json
{
  "tx_ref": "order_id",
  "amount": 1100,
  "reason": "Customer requested cancellation"
}
```

**Response (Success)**:
```json
{
  "status": "success",
  "message": "Refund initiated successfully",
  "data": {
    "refund_id": "ref_xxxxx",
    "amount": 1100,
    "status": "pending"
  }
}
```

**Response (Error)**:
```json
{
  "status": "failed",
  "message": "Invalid transaction reference"
}
```

---

## Future Enhancements

1. **Partial Refunds**
   - Support refunding only specific items
   - Calculate partial refund amounts

2. **Refund Status Tracking**
   - Poll Chapa API for refund status updates
   - Update order when refund completes

3. **Refund Analytics**
   - Dashboard showing refund metrics
   - Refund reasons analysis
   - Refund success rate trends

4. **Automated Retry**
   - Retry failed refunds automatically
   - Exponential backoff strategy
   - Max 3 retry attempts

5. **Customer Notifications**
   - Email notification when refund initiated
   - SMS notification when refund completes
   - Push notification in Telegram

---

## Compliance & Regulations

### Ethiopian Payment Regulations

- Refunds must be processed within 14 days (per Ethiopian banking regulations)
- Refund amount must match original payment amount
- Transaction records must be kept for 7 years
- Customer must be notified of refund status

### Data Retention

- Refund records stored in Firestore indefinitely
- Chapa transaction logs retained per Chapa's policy
- Failed refund logs kept for audit purposes

---

## Support & Troubleshooting

### Common Issues

**Issue**: Refund not appearing in Chapa dashboard  
**Solution**: Check Chapa API credentials, verify transaction reference

**Issue**: Refund marked as failed  
**Solution**: Check `refundError` field, process manually if needed

**Issue**: Customer not receiving refund  
**Solution**: Verify refund status in Chapa, check customer's payment method

### Contact

- **Chapa Support**: support@chapa.co
- **Technical Issues**: Check Chapa API documentation
- **Integration Help**: Refer to Chapa developer docs

---

## Changelog

### Version 1.0.0 (February 28, 2026)
- Initial implementation of automatic refund processing
- Added refund tracking fields to Order type
- Integrated Chapa refund API
- Added refund status display in UI
- Created test script for refund flow
- Documented manual refund process

---

**Document Version**: 1.0.0  
**Last Updated**: February 28, 2026  
**Maintained By**: Development Team
