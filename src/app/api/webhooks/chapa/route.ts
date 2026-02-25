/**
 * Chapa Payment Webhook Handler
 * 
 * This API route receives webhook callbacks from Chapa when payment status changes.
 * It implements idempotency to prevent duplicate processing and uses Firestore Transactions
 * for atomic status updates.
 * 
 * CRITICAL: This handles real money transactions. All validations and error handling
 * must be robust to prevent double-crediting or lost payments.
 * 
 * Security:
 * - Validates webhook signature to ensure requests come from Chapa
 * - Uses Firestore Transactions for atomic updates
 * - Implements idempotency checks
 * 
 * Requirements: 8.3, 8.7, 24.1, 24.2, 24.3, 24.4, 24.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { validateWebhookSignature, processWebhookPayload } from '@/lib/payment/chapa';

/**
 * POST /api/webhooks/chapa
 * 
 * Handles Chapa webhook callbacks for payment confirmations.
 * 
 * Flow:
 * 1. Validate webhook signature
 * 2. Parse and validate payload
 * 3. Check idempotency (has this webhook been processed before?)
 * 4. Use Firestore Transaction to atomically update order status
 * 5. Log webhook processing
 * 6. Return success response
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get raw body for signature validation
    const rawBody = await request.text();
    const signature = request.headers.get('x-chapa-signature') || '';

    // 2. Validate webhook signature (Requirement 8.3)
    if (!validateWebhookSignature(rawBody, signature)) {
      console.error('[Chapa Webhook] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 3. Parse payload
    const payload = JSON.parse(rawBody);
    const webhookData = processWebhookPayload(payload);

    // 4. Log webhook receipt (Requirement 24.4)
    console.log('[Chapa Webhook] Received:', {
      event: webhookData.event,
      tx_ref: webhookData.data.tx_ref,
      status: webhookData.data.status,
      amount: webhookData.data.amount,
      timestamp: new Date().toISOString(),
    });

    // 5. Only process successful payments
    if (webhookData.event !== 'charge.success' || webhookData.data.status !== 'success') {
      console.log('[Chapa Webhook] Non-success event, skipping processing');
      return NextResponse.json({ message: 'Event acknowledged' });
    }

    const orderId = webhookData.data.tx_ref;

    // 6. Use Firestore Transaction for atomic idempotency check and update (Requirements 23.3, 24.1, 24.5)
    const result = await adminDb.runTransaction(async (transaction) => {
      // Get order
      const orderRef = adminDb.collection('orders').doc(orderId);
      const orderDoc = await transaction.get(orderRef);

      if (!orderDoc.exists) {
        throw new Error(`Order ${orderId} not found`);
      }

      const order = orderDoc.data()!;

      // IDEMPOTENCY CHECK (Requirement 24.1, 24.2)
      // If order is already PAID_ESCROW or beyond, this webhook has already been processed
      if (['PAID_ESCROW', 'DISPATCHED', 'ARRIVED', 'COMPLETED'].includes(order.status)) {
        console.log('[Chapa Webhook] Order already processed (idempotency check):', {
          orderId,
          currentStatus: order.status,
        });
        return {
          alreadyProcessed: true,
          status: order.status,
        };
      }

      // Verify order is in PENDING status
      if (order.status !== 'PENDING') {
        throw new Error(`Cannot process payment for order with status ${order.status}`);
      }

      // Verify payment amount matches order total
      const expectedAmount = order.totalAmount + order.deliveryFee;
      if (Math.abs(webhookData.data.amount - expectedAmount) > 0.01) {
        throw new Error(
          `Payment amount mismatch: expected ${expectedAmount}, received ${webhookData.data.amount}`
        );
      }

      // Update order status to PAID_ESCROW (Requirement 8.3, 23.1)
      transaction.update(orderRef, {
        status: 'PAID_ESCROW',
        chapaTransactionRef: webhookData.data.reference,
        updatedAt: adminDb.FieldValue.serverTimestamp(),
        statusHistory: adminDb.FieldValue.arrayUnion({
          from: 'PENDING',
          to: 'PAID_ESCROW',
          timestamp: adminDb.FieldValue.serverTimestamp(),
          actor: 'system_webhook',
        }),
      });

      console.log('[Chapa Webhook] Order status updated to PAID_ESCROW:', {
        orderId,
        amount: webhookData.data.amount,
      });

      return {
        alreadyProcessed: false,
        status: 'PAID_ESCROW',
      };
    });

    // 7. Return success response (Requirement 24.3)
    if (result.alreadyProcessed) {
      return NextResponse.json({
        message: 'Webhook already processed (idempotent)',
        orderId,
        status: result.status,
      });
    }

    return NextResponse.json({
      message: 'Payment processed successfully',
      orderId,
      status: result.status,
    });

  } catch (error) {
    // Log error for debugging (Requirement 24.4)
    console.error('[Chapa Webhook] Error processing webhook:', error);

    // Return 500 so Chapa will retry
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/chapa
 * 
 * Health check endpoint for webhook.
 * Chapa may call this to verify the webhook URL is accessible.
 */
export async function GET() {
  return NextResponse.json({
    message: 'Chapa webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
