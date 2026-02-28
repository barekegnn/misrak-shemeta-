# Order Management Testing Guide

This guide walks you through testing the complete order management UI for buyers, including order history, order details, status timeline, OTP display, and order cancellation.

## Prerequisites

- Firebase Emulator running on ports 8080 (Firestore), 9099 (Auth), 9199 (Storage), 4000 (UI)
- Next.js dev server running on http://localhost:3000
- Test data seeded (users, shops, products)
- At least one test order created (from previous checkout testing)

## Test Order ID

From our previous testing session, we have:
- **Order ID**: `0rMR0WxkNbVCUY5OegTS`
- **Status**: `PAID_ESCROW` (after webhook simulation)
- **User**: `123456789` (telegramId)

## Testing Scenarios

### 1. View Order History (Requirement 14.1, 14.2)

**Test Steps:**
1. Navigate to http://localhost:3000/orders
2. Verify the page displays "My Orders" header
3. Verify the order list shows orders in reverse chronological order (newest first)
4. Verify each order card displays:
   - Order ID (first 8 characters)
   - Order date
   - Status badge with appropriate color and icon
   - Preview of first 2 items
   - "+X more items" if more than 2 items
   - Total amount (products + delivery fee)
   - "View Details" button

**Expected Result:**
- Order `0rMR0WxkNbVCUY5OegTS` appears in the list
- Status shows "Payment Secured" with green badge
- Order date matches creation time
- Items preview shows product names and quantities
- Total amount is correct (3260 ETB)

**Luxury UI Elements:**
- Gradient background (slate-50 to white)
- Smooth animations on card appearance
- Hover effects on cards (shadow expansion, chevron movement)
- Premium typography and spacing
- Status badges with custom colors and icons

---

### 2. View Order Details (Requirement 14.3, 14.4)

**Test Steps:**
1. From the orders list, click on order `0rMR0WxkNbVCUY5OegTS`
2. Verify navigation to `/orders/0rMR0WxkNbVCUY5OegTS`
3. Verify the page displays:
   - Order ID in header
   - Order creation date
   - "Back to Orders" button

**Expected Result:**
- Order detail page loads successfully
- Header shows order ID and date
- Back button navigates to orders list

---

### 3. Status Timeline Display (Requirement 14.3)

**Test Steps:**
1. On the order detail page, locate the "Order Status" section
2. Verify the timeline shows 5 steps:
   - Order Placed (PENDING)
   - Payment Secured (PAID_ESCROW) ← Current status
   - On the Way (DISPATCHED)
   - Arrived (ARRIVED)
   - Completed (COMPLETED)
3. Verify visual indicators:
   - Completed steps have green gradient background
   - Current step has ring highlight
   - Future steps have gray background
   - Connector lines between steps are green for completed, gray for future

**Expected Result:**
- Timeline shows current status as "Payment Secured"
- First 2 steps are highlighted (PENDING, PAID_ESCROW)
- Remaining 3 steps are grayed out
- Current step shows timestamp

**Luxury UI Elements:**
- Gradient icons for completed steps
- Ring animation on current step
- Smooth color transitions
- Premium spacing and typography

---

### 4. Order Items Display (Requirement 14.4)

**Test Steps:**
1. Scroll to "Order Items" section
2. Verify each item displays:
   - Product name
   - Quantity × Price per unit
   - Shop city
   - Total price for that item

**Expected Result:**
- All order items are listed
- Quantities and prices match order data
- Shop cities are displayed
- Item totals are calculated correctly

---

### 5. Price Breakdown Display

**Test Steps:**
1. Scroll to "Price Breakdown" section
2. Verify the breakdown shows:
   - Subtotal (sum of all items)
   - Delivery Fee
   - Total (subtotal + delivery fee)

**Expected Result:**
- Subtotal matches sum of item prices
- Delivery fee is displayed (40 ETB, 100 ETB, or 180 ETB based on route)
- Total is correct (3260 ETB in our test case)

**Luxury UI Elements:**
- Large, bold total in emerald green
- Clear visual hierarchy
- Premium spacing

---

### 6. Delivery Information Display

**Test Steps:**
1. Scroll to "Delivery Information" section
2. Verify it displays:
   - Delivery location (user's home location)
   - Location icon

**Expected Result:**
- Shows user's home location (e.g., "Haramaya_Main")
- Icon is displayed with emerald accent

---

### 7. Cancel Order - PAID_ESCROW Status (Requirement 18.1, 18.2)

**Test Steps:**
1. On the order detail page (status: PAID_ESCROW), scroll to bottom
2. Verify "Cancel Order" button is visible (red background)
3. Click "Cancel Order" button
4. Verify modal appears with:
   - Warning icon
   - "Cancel Order?" title
   - Refund message: "Your payment will be refunded within 3-5 business days."
   - Reason textarea
   - "Keep Order" and "Cancel Order" buttons
5. Enter cancellation reason: "Changed my mind"
6. Click "Cancel Order" button in modal
7. Wait for cancellation to complete

**Expected Result:**
- Modal appears with refund message
- Cancellation succeeds
- Order status updates to CANCELLED
- Page refreshes to show cancelled status
- Cancel button disappears

**Verify in Firebase Emulator:**
- Open http://127.0.0.1:4000/firestore
- Navigate to `orders` collection
- Find order `0rMR0WxkNbVCUY5OegTS`
- Verify:
  - `status` = "CANCELLED"
  - `cancellationReason` = "Changed my mind"
  - `statusHistory` has new entry with PAID_ESCROW → CANCELLED transition
  - `updatedAt` timestamp is recent

---

### 8. Cancelled Order Display

**Test Steps:**
1. After cancelling, verify the order detail page shows:
   - Red "Order Cancelled" card instead of timeline
   - Cancellation timestamp
   - Cancellation reason in red box
   - No "Cancel Order" button

**Expected Result:**
- Cancelled status is prominently displayed
- Reason is shown
- Timeline is replaced with cancellation card

**Luxury UI Elements:**
- Red accent colors for cancelled state
- Clear visual distinction from active orders
- Premium error state design

---

### 9. Test OTP Display - ARRIVED Status (Requirement 17.1)

To test OTP display, we need to simulate the order progressing to ARRIVED status.

**Test Steps:**
1. Create a new test order (follow checkout flow)
2. Simulate payment webhook (use `scripts/simulate-chapa-webhook.ts`)
3. Manually update order status to DISPATCHED in Firebase Emulator:
   - Open http://127.0.0.1:4000/firestore
   - Navigate to `orders` collection
   - Find your new order
   - Edit document: change `status` to "DISPATCHED"
   - Add to `statusHistory` array:
     ```json
     {
       "from": "PAID_ESCROW",
       "to": "DISPATCHED",
       "timestamp": "2026-02-27T10:00:00.000Z",
       "actor": "SYSTEM_TEST"
     }
     ```
4. Update status to ARRIVED:
   - Edit document: change `status` to "ARRIVED"
   - Add to `statusHistory` array:
     ```json
     {
       "from": "DISPATCHED",
       "to": "ARRIVED",
       "timestamp": "2026-02-27T10:30:00.000Z",
       "actor": "SYSTEM_TEST"
     }
     ```
5. Refresh the order detail page
6. Verify OTP display card appears with:
   - Purple gradient background
   - Key icon
   - "Your Delivery OTP" title
   - 6-digit OTP code in large font
   - Instructions to verify product before sharing
   - Warning message about fund release

**Expected Result:**
- OTP card is prominently displayed
- OTP code matches the `otpCode` field in Firestore
- Instructions are clear and visible
- Card has premium purple gradient design

**Luxury UI Elements:**
- Gradient background (purple to indigo)
- Large, spaced OTP digits
- Backdrop blur effects
- Clear warning message
- Premium card design with shadows

---

### 10. Empty Orders State

**Test Steps:**
1. Create a new test user (different telegramId)
2. Navigate to http://localhost:3000/orders
3. Verify empty state displays:
   - Shopping bag icon
   - "No Orders Yet" message
   - "Start shopping to see your orders here" description
   - "Browse Products" button

**Expected Result:**
- Empty state is displayed
- Button navigates to /shops

---

### 11. Order Not Found Error

**Test Steps:**
1. Navigate to http://localhost:3000/orders/invalid-order-id
2. Verify error state displays:
   - Alert icon
   - "Order Not Found" message
   - Error description
   - "Back to Orders" button

**Expected Result:**
- Error state is displayed
- Button navigates to /orders

---

### 12. Cancel Order - PENDING Status (Requirement 18.1)

**Test Steps:**
1. Create a new order (don't simulate payment webhook)
2. Order will be in PENDING status
3. Navigate to order detail page
4. Verify "Cancel Order" button is visible
5. Click "Cancel Order"
6. Verify modal shows: "This action cannot be undone." (no refund message)
7. Enter reason and cancel
8. Verify order status updates to CANCELLED

**Expected Result:**
- Cancellation succeeds without refund message
- Order status updates to CANCELLED
- No Chapa refund is initiated (since payment wasn't completed)

---

### 13. Cancel Button Hidden - DISPATCHED Status (Requirement 18.3)

**Test Steps:**
1. Manually update an order to DISPATCHED status in Firebase Emulator
2. Navigate to order detail page
3. Verify "Cancel Order" button is NOT visible

**Expected Result:**
- Cancel button is hidden
- User cannot cancel orders that are already dispatched

---

### 14. Cancel Button Hidden - ARRIVED Status (Requirement 18.3)

**Test Steps:**
1. Manually update an order to ARRIVED status in Firebase Emulator
2. Navigate to order detail page
3. Verify "Cancel Order" button is NOT visible
4. Verify OTP card IS visible

**Expected Result:**
- Cancel button is hidden
- OTP card is displayed
- User cannot cancel orders that have arrived

---

### 15. Cancel Button Hidden - COMPLETED Status

**Test Steps:**
1. Manually update an order to COMPLETED status in Firebase Emulator
2. Navigate to order detail page
3. Verify "Cancel Order" button is NOT visible
4. Verify timeline shows all 5 steps completed

**Expected Result:**
- Cancel button is hidden
- Timeline shows all steps as completed
- Order is finalized

---

## Mobile Responsiveness Testing

**Test Steps:**
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or similar mobile device
4. Test all scenarios above on mobile viewport
5. Verify:
   - Touch-friendly button sizes (minimum 44x44px)
   - Proper text wrapping
   - Readable font sizes
   - Proper spacing on small screens
   - Smooth animations
   - Modal fits within viewport

**Expected Result:**
- All UI elements are touch-friendly
- Layout adapts to mobile viewport
- No horizontal scrolling
- Text is readable
- Buttons are easily tappable

---

## Performance Testing

**Test Steps:**
1. Open Chrome DevTools → Performance tab
2. Start recording
3. Navigate to /orders
4. Stop recording
5. Verify:
   - Page loads in < 2 seconds
   - Smooth animations (60 FPS)
   - No layout shifts

**Expected Result:**
- Fast page load
- Smooth animations
- No performance issues

---

## Accessibility Testing

**Test Steps:**
1. Test keyboard navigation:
   - Tab through all interactive elements
   - Press Enter to activate buttons
   - Press Escape to close modal
2. Test screen reader (if available):
   - Verify all content is announced
   - Verify button labels are descriptive
3. Test color contrast:
   - Verify text is readable on all backgrounds
   - Verify status badges have sufficient contrast

**Expected Result:**
- All interactive elements are keyboard accessible
- Screen reader announces content correctly
- Color contrast meets WCAG AA standards

---

## Summary of Requirements Tested

✅ **Requirement 14.1**: User order history retrieval
✅ **Requirement 14.2**: Orders displayed in reverse chronological order
✅ **Requirement 14.3**: Order status, total, date, and products displayed
✅ **Requirement 14.4**: Order detail view with all items
✅ **Requirement 17.1**: OTP display when status is ARRIVED
✅ **Requirement 18.1**: Cancel order with PENDING status
✅ **Requirement 18.2**: Cancel order with PAID_ESCROW status (refund initiated)
✅ **Requirement 18.3**: Reject cancellation for DISPATCHED or ARRIVED status

---

## Next Steps

After completing these tests, proceed to:
1. **Task 10.6**: Build Shop Owner Order Management UI
2. **Task 10.7**: Build Runner Order View
3. **Task 11**: Shop Balance Management
4. **Task 17**: Notifications System

---

## Troubleshooting

**Issue**: Orders not loading
- **Solution**: Verify Firebase Emulator is running and user is authenticated

**Issue**: OTP not displaying
- **Solution**: Verify order status is exactly "ARRIVED" in Firestore

**Issue**: Cancel button not working
- **Solution**: Check browser console for errors, verify telegramId is correct

**Issue**: Animations not smooth
- **Solution**: Check if Framer Motion is installed: `npm install framer-motion`

---

## Notes

- All UI components use luxury design with gradients, shadows, and smooth animations
- Status timeline provides clear visual feedback on order progress
- OTP display is prominent and secure with clear instructions
- Cancel functionality includes confirmation modal with reason input
- All requirements are implemented with production-ready code
- No placeholder code - all features are fully functional
