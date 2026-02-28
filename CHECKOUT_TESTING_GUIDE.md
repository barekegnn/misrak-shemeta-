# Checkout Flow Testing Guide

## Overview

This guide covers testing the complete checkout and payment flow for the Misrak Shemeta marketplace. The checkout flow implements Requirements 7 (Order Creation) and 8 (Escrow Payment Lifecycle).

## Prerequisites

1. Firebase Emulator running (Firestore, Auth, Storage)
2. Next.js dev server running (`npm run dev`)
3. Test data seeded (users, shops, products)
4. User authenticated with home location selected

## Checkout Flow Architecture

```
Cart → Checkout → Payment → Order Confirmation
  ↓       ↓          ↓            ↓
 View   Calculate  Chapa      Order Status
Items   Delivery   Payment    PENDING →
        Fees                  PAID_ESCROW
```

## Test Scenarios

### Scenario 1: Single Shop Checkout (Intra-City Delivery)

**Setup:**
- User location: Harar Campus
- Shop location: Harar
- Expected delivery fee: 40 ETB

**Steps:**
1. Navigate to a Harar shop (e.g., Harar Tech Hub)
2. Add 1-2 products to cart
3. Navigate to `/cart`
4. Click "Proceed to Checkout"
5. Verify checkout page displays:
   - Delivery location: Harar Campus
   - Order summary with correct items and prices
   - Delivery fee breakdown showing 40 ETB
   - Total = Subtotal + 40 ETB
6. Click "Proceed to Payment"

**Expected Results:**
- Order created with status PENDING
- Cart cleared
- Redirected to Chapa payment interface (sandbox)
- Order includes 6-digit OTP

**Requirements Validated:**
- 7.1: Order creation with cart items
- 7.2: Unique orderId assigned
- 7.3: Initial status PENDING
- 7.5: Delivery fee calculated (40 ETB for intra-city)
- 7.6: OTP generated and stored

---

### Scenario 2: Single Shop Checkout (City-to-Campus Delivery)

**Setup:**
- User location: Haramaya Main Campus
- Shop location: Harar
- Expected delivery fee: 100 ETB

**Steps:**
1. Navigate to a Harar shop
2. Add products to cart
3. Proceed to checkout
4. Verify delivery fee shows 100 ETB
5. Verify estimated time: "3-4 hours"

**Expected Results:**
- Delivery fee: 100 ETB
- Total = Subtotal + 100 ETB

**Requirements Validated:**
- 16.3: City-to-campus delivery fee (100 ETB)
- 16.7: Estimated delivery time displayed

---

### Scenario 3: Single Shop Checkout (Inter-City Delivery)

**Setup:**
- User location: DDU (Dire Dawa University)
- Shop location: Harar
- Expected delivery fee: 180 ETB

**Steps:**
1. Navigate to a Harar shop
2. Add products to cart
3. Proceed to checkout
4. Verify delivery fee shows 180 ETB
5. Verify estimated time: "5-6 hours"

**Expected Results:**
- Delivery fee: 180 ETB
- Total = Subtotal + 180 ETB

**Requirements Validated:**
- 16.5: Inter-city delivery fee (180 ETB)
- 16.7: Estimated delivery time displayed

---

### Scenario 4: Multi-Shop Checkout

**Setup:**
- User location: Haramaya Main Campus
- Shop 1: Harar (fee: 100 ETB)
- Shop 2: Dire Dawa (fee: 100 ETB)
- Expected total delivery fee: 200 ETB

**Steps:**
1. Add products from Harar Tech Hub to cart
2. Add products from Dire Dawa Shoe Palace to cart
3. Navigate to checkout
4. Verify delivery fee breakdown shows:
   - Harar → Haramaya Main: 100 ETB
   - Dire Dawa → Haramaya Main: 100 ETB
   - Total delivery: 200 ETB

**Expected Results:**
- Two separate delivery fee entries
- Each shop's items listed under its delivery fee
- Total delivery fee: 200 ETB
- Total = Subtotal + 200 ETB

**Requirements Validated:**
- 7.4: Order items associated with shopId
- 7.5: Delivery fee calculated per shop
- 16.3, 16.4: Multiple delivery routes

---

### Scenario 5: Empty Cart Redirect

**Steps:**
1. Navigate to `/checkout` with empty cart

**Expected Results:**
- Automatically redirected to `/cart`
- No order created

**Requirements Validated:**
- Input validation
- User experience protection

---

### Scenario 6: Stock Validation

**Setup:**
- Product with low stock (e.g., 2 items)

**Steps:**
1. Add 3 items of low-stock product to cart
2. Proceed to checkout
3. Click "Proceed to Payment"

**Expected Results:**
- Error message: "INSUFFICIENT_STOCK: [Product Name]"
- Order not created
- User remains on checkout page

**Requirements Validated:**
- 7.1: Stock availability check
- Data integrity

---

### Scenario 7: Payment Initiation

**Steps:**
1. Complete checkout with valid cart
2. Click "Proceed to Payment"
3. Observe console logs

**Expected Results:**
- Console shows: "[CheckoutPage] Creating order..."
- Console shows: "[CheckoutPage] Order created: [orderId]"
- Console shows: "[CheckoutPage] Initiating payment..."
- Console shows: "[Payment] Initiating Chapa payment for order: [orderId]"
- Console shows: "[Chapa Sandbox] Payment initiation request"
- Redirected to Chapa checkout URL

**Requirements Validated:**
- 8.1: Payment request initiated with order total + delivery fee
- 8.2: User redirected to Chapa payment interface
- 8.6: Chapa transaction reference stored

---

## Delivery Fee Matrix Reference

| Shop Location | User Location      | Fee (ETB) | Time        | Category     |
|---------------|-------------------|-----------|-------------|--------------|
| Harar         | Harar Campus      | 40        | 30min-1hr   | Intra-city   |
| Dire Dawa     | DDU               | 40        | 30min-1hr   | Intra-city   |
| Harar         | Haramaya Main     | 100       | 3-4 hours   | City-campus  |
| Dire Dawa     | Haramaya Main     | 100       | 3-4 hours   | City-campus  |
| Harar         | DDU               | 180       | 5-6 hours   | Inter-city   |
| Dire Dawa     | Harar Campus      | 180       | 5-6 hours   | Inter-city   |

## Testing Checklist

### UI/UX Validation
- [ ] Back button navigates to cart
- [ ] Delivery location displays correctly
- [ ] Order summary shows all cart items
- [ ] Item quantities and prices are correct
- [ ] Subtotal calculation is accurate
- [ ] Delivery fee breakdown is clear and detailed
- [ ] Each shop's delivery fee is shown separately
- [ ] Estimated delivery times are displayed
- [ ] Total calculation is correct (subtotal + delivery)
- [ ] Escrow information is displayed
- [ ] Payment button is prominent and clear
- [ ] Loading states work (spinner during processing)
- [ ] Error messages are user-friendly

### Functional Validation
- [ ] Order creation succeeds with valid data
- [ ] Stock validation prevents over-ordering
- [ ] Empty cart redirects to cart page
- [ ] Delivery fees calculated correctly for all routes
- [ ] Multi-shop orders calculate multiple delivery fees
- [ ] Payment initiation returns checkout URL
- [ ] Cart is cleared after order creation
- [ ] OTP is generated and stored with order
- [ ] Order status is set to PENDING
- [ ] Product stock is decremented

### Security Validation
- [ ] Unauthenticated users cannot access checkout
- [ ] Users can only checkout their own cart
- [ ] Order creation verifies user identity
- [ ] Payment initiation verifies order ownership
- [ ] Server-side validation for all operations

### Mobile Optimization
- [ ] Touch-friendly buttons (44x44px minimum)
- [ ] Responsive layout on small screens
- [ ] Haptic feedback on interactions
- [ ] Smooth animations and transitions
- [ ] Readable text sizes

## Common Issues and Solutions

### Issue: "Failed to load checkout data"
**Cause:** Cart is empty or user not authenticated
**Solution:** Ensure user is logged in and has items in cart

### Issue: "INSUFFICIENT_STOCK" error
**Cause:** Product stock is less than cart quantity
**Solution:** Reduce quantity in cart or remove item

### Issue: "ORDER_NOT_PENDING" error
**Cause:** Attempting to pay for non-pending order
**Solution:** Create a new order

### Issue: Delivery fee shows 0 ETB
**Cause:** Shop city or user location not properly set
**Solution:** Verify user has selected home location and shop has city assigned

### Issue: Payment redirect fails
**Cause:** NEXT_PUBLIC_APP_URL not set or Chapa credentials invalid
**Solution:** Check .env.local has NEXT_PUBLIC_APP_URL=http://localhost:3000

## Next Steps After Checkout

After successful checkout testing, proceed to:

1. **Payment Webhook Testing** (Requirement 8.3)
   - Test webhook handler at `/api/webhooks/chapa`
   - Verify order status updates to PAID_ESCROW
   - Test idempotency (duplicate webhooks)

2. **Order Fulfillment Testing** (Requirement 9)
   - Shop owner marks order as DISPATCHED
   - Runner marks order as ARRIVED
   - Buyer receives OTP

3. **OTP Verification Testing** (Requirement 17)
   - Validate correct OTP completes order
   - Verify incorrect OTP fails
   - Test 3-attempt lockout

4. **Order Cancellation Testing** (Requirement 18)
   - Cancel PENDING order
   - Cancel PAID_ESCROW order (with refund)
   - Verify DISPATCHED orders cannot be cancelled

## Files Created/Modified

### New Files
- `src/app/checkout/page.tsx` - Checkout page component
- `src/app/actions/payment.ts` - Payment server actions
- `src/app/api/shops/[shopId]/route.ts` - Shop details API endpoint
- `CHECKOUT_TESTING_GUIDE.md` - This testing guide

### Modified Files
- `src/app/cart/page.tsx` - Updated to navigate to checkout
- `.env.local` - Added NEXT_PUBLIC_APP_URL
- `.env.local.example` - Added NEXT_PUBLIC_APP_URL documentation

## Requirements Coverage

This implementation covers:

- ✅ Requirement 7.1: Order creation with cart items
- ✅ Requirement 7.2: Unique orderId assignment
- ✅ Requirement 7.3: Initial status PENDING
- ✅ Requirement 7.4: Order items associated with shopId
- ✅ Requirement 7.5: Delivery fee calculation
- ✅ Requirement 7.6: OTP generation
- ✅ Requirement 8.1: Payment request initiation
- ✅ Requirement 8.2: Redirect to Chapa payment interface
- ✅ Requirement 8.6: Chapa transaction reference storage
- ✅ Requirement 16.1-16.7: Eastern Triangle Pricing Engine integration

## Production Considerations

Before deploying to production:

1. Replace demo Chapa credentials with real production keys
2. Update NEXT_PUBLIC_APP_URL to production domain
3. Configure Chapa webhook URL in Chapa dashboard
4. Test with real Chapa sandbox transactions
5. Implement proper error tracking (Sentry, etc.)
6. Add analytics for checkout funnel
7. Implement retry logic for failed payments
8. Add email/SMS notifications for order confirmation
