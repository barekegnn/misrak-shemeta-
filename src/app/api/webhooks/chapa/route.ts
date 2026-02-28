import { NextRequest, NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebase/admin';
import { validateWebhookSignature, processWebhookPayload } from '@/lib/payment/chapa';
import type { OrderStatus } from '@/types';

/**
 * POST /api/webhooks/chapa
 * 
 * Chapa Payment Webhook Handler
 * 
 * This endpoint receives payment confirmation callbacks from Chapa.
 * It implements idempotency to prevent duplicate processing and uses
 * Firestore Transactions to ensure atomic order status updates.
 * 
 * Requirements: 8.3, 8.7, 24.1, 24.2, 24.3, 24.4, 24.5
 * 
 * CRITICAL: This handles real money transactions. All operations must be:
 * - Idempotent (safe to call multiple times)
 * - Atomic (all-or-nothing updates)
 * - Logged (for audit trail)
 * - Secure (signature verification)
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let orderId: string | undefined;
  let webhookEvent: string | undefined;

  try {
    // 1. Read raw request body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-chapa-signature') || '';

    console.log('[Webhook] Received Chapa webhook');
    console.log('[Webhook] Signature present:', !!signature);

    // 2. Validate webhook signature (Requirement 8.3, 24.1)
    // Note: In sandbox mode, signature validation might be skipped
    const isSandbox = process.env.NEXT_PUBLIC_CHAPA_MODE === 'sandbox';
    
    if (!isSandbox && signature) {
      const isValid = validateWebhookSignature(rawBody, signature);
      if (!isValid) {
        console.error('[Webhook] Invalid signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
      console.log('[Webhook] Signature validated');
    } else if (isSandbox) {
      console.log('[Webhook] Sandbox mode - skipping signature validation');
    }

    // 3. Parse webhook payload
    const payload = JSON.parse(rawBody);
    console.log('[Webhook] Raw payload:', JSON.stringify(payload, null, 2));

    const webhookData = processWebhookPayload(payload);
    orderId = webhookData.data.tx_ref;
    webhookEvent = webhookData.event;

    console.log('[Webhook] Processed webhook data:', {
      event: webhookData.event,
      orderId,
      status: webhookData.data.status,
      amount: webhookData.data.amount,
    });

    // 4. Log webhook call (Requirement 24.4)
    const webhookLogRef = adminDb.collection('webhookLogs').doc();
    await webhookLogRef.set({
      orderId,
      event: webhookData.event,
      status: webhookData.data.status,
      amount: webhookData.data.amount,
      reference: webhookData.data.reference,
      timestamp: new Date(),
      processingTimeMs: null, // Will be updated after processing
      result: null, // Will be updated after processing
    });

    // 5. Handle payment success event
    if (webhookData.event === 'charge.success' && webhookData.data.status === 'success') {
      console.log('[Webhook] Processing successful payment for order:', orderId);

      // Use Firestore Transaction for atomic update (Requirement 8.3, 23.1, 24.5)
      const result = await adminDb.runTransaction(async (transaction) => {
        const orderRef = adminDb.collection('orders').doc(orderId);
        const orderDoc = await transaction.get(orderRef);

        if (!orderDoc.exists) {
          throw new Error('ORDER_NOT_FOUND');
        }

        const orderData = orderDoc.data();
        const currentStatus = orderData!.status as OrderStatus;

        console.log('[Webhook] Current order status:', currentStatus);

        // Idempotency check (Requirement 24.1, 24.2)
        if (currentStatus === 'PAID_ESCROW') {
          console.log('[Webhook] Order already processed - idempotent response');
          return {
            statusChanged: false,
            message: 'Order already processed',
            previousStatus: currentStatus,
          };
        }

        // Verify order is in PENDING status
        if (currentStatus !== 'PENDING') {
          throw new Error(`INVALID_STATUS: Expected PENDING, got ${currentStatus}`);
        }

        // Update order status to PAID_ESCROW (Requirement 8.3)
        const statusChange = {
          from: 'PENDING' as OrderStatus,
          to: 'PAID_ESCROW' as OrderStatus,
          timestamp: new Date(),
          actor: 'SYSTEM_WEBHOOK',
        };

        transaction.update(orderRef, {
          status: 'PAID_ESCROW',
          chapaTransactionRef: webhookData.data.reference,
          updatedAt: new Date(),
          statusHistory: FieldValue.arrayUnion(statusChange),
        });

        console.log('[Webhook] Order status updated to PAID_ESCROW');

        return {
          statusChanged: true,
          message: 'Payment confirmed, order updated to PAID_ESCROW',
          previousStatus: currentStatus,
          newStatus: 'PAID_ESCROW',
        };
      });

      // Update webhook log with result
      const processingTime = Date.now() - startTime;
      await webhookLogRef.update({
        processingTimeMs: processingTime,
        result: result,
      });

      console.log('[Webhook] Processing complete:', result);
      console.log('[Webhook] Processing time:', processingTime, 'ms');

      // Return success response
      return NextResponse.json({
        success: true,
        ...result,
      });
    }

    // 6. Handle payment failure event
    if (webhookData.event === 'charge.failed' || webhookData.data.status === 'failed') {
      console.log('[Webhook] Processing failed payment for order:', orderId);

      // Update order status to FAILED
      const result = await adminDb.runTransaction(async (transaction) => {
        const orderRef = adminDb.collection('orders').doc(orderId);
        const orderDoc = await transaction.get(orderRef);

        if (!orderDoc.exists) {
          throw new Error('ORDER_NOT_FOUND');
        }

        const orderData = orderDoc.data();
        const currentStatus = orderData!.status as OrderStatus;

        // Only update if order is still PENDING
        if (currentStatus !== 'PENDING') {
          console.log('[Webhook] Order not in PENDING status, skipping update');
          return {
            statusChanged: false,
            message: 'Order not in PENDING status',
            previousStatus: currentStatus,
          };
        }

        // Update order status to CANCELLED (payment failed)
        const statusChange = {
          from: 'PENDING' as OrderStatus,
          to: 'CANCELLED' as OrderStatus,
          timestamp: new Date(),
          actor: 'SYSTEM_WEBHOOK',
        };

        transaction.update(orderRef, {
          status: 'CANCELLED',
          cancellationReason: 'Payment failed',
          chapaTransactionRef: webhookData.data.reference,
          updatedAt: new Date(),
          statusHistory: FieldValue.arrayUnion(statusChange),
        });

        // Restore product stock
        for (const item of orderData!.items) {
          const productRef = adminDb.collection('products').doc(item.productId);
          transaction.update(productRef, {
            stock: FieldValue.increment(item.quantity),
          });
        }

        console.log('[Webhook] Order cancelled due to payment failure');

        return {
          statusChanged: true,
          message: 'Payment failed, order cancelled',
          previousStatus: currentStatus,
          newStatus: 'CANCELLED',
        };
      });

      // Update webhook log with result
      const processingTime = Date.now() - startTime;
      await webhookLogRef.update({
        processingTimeMs: processingTime,
        result: result,
      });

      console.log('[Webhook] Processing complete:', result);

      return NextResponse.json({
        success: true,
        ...result,
      });
    }

    // 7. Unknown event type
    console.warn('[Webhook] Unknown event type:', webhookData.event);
    return NextResponse.json({
      success: true,
      message: 'Event received but not processed',
      event: webhookData.event,
    });

  } catch (error: any) {
    console.error('[Webhook] Error processing webhook:', error);

    // Log error
    if (orderId) {
      try {
        await adminDb.collection('webhookLogs').add({
          orderId,
          event: webhookEvent || 'unknown',
          timestamp: new Date(),
          processingTimeMs: Date.now() - startTime,
          error: error.message || 'Unknown error',
          result: null,
        });
      } catch (logError) {
        console.error('[Webhook] Failed to log error:', logError);
      }
    }

    // Return error response
    // Note: We return 200 even on error to prevent Chapa from retrying
    // The error is logged for manual review
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 200 } // Return 200 to prevent retries
    );
  }
}

/**
 * GET /api/webhooks/chapa
 * 
 * Health check endpoint for webhook
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Chapa webhook endpoint is active',
    mode: process.env.NEXT_PUBLIC_CHAPA_MODE || 'sandbox',
  });
}
