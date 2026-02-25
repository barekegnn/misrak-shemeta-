/**
 * Chapa Payment Gateway Integration
 * 
 * This module provides utilities for integrating with Chapa, the Ethiopian payment gateway.
 * It supports both Sandbox (test) and Production modes for payment processing.
 * 
 * Chapa Documentation: https://developer.chapa.co/docs
 * 
 * CRITICAL: This handles real money transactions in production. All implementations
 * must be thoroughly tested in Sandbox mode before deployment.
 * 
 * Requirements: 8.1, 8.2, 8.6, 25.1, 25.2, 25.3, 25.4, 25.5
 */

import { ChapaPaymentRequest, ChapaPaymentResponse, ChapaWebhookPayload } from '@/types';

/**
 * Chapa API configuration
 */
interface ChapaConfig {
  secretKey: string;
  mode: 'sandbox' | 'production';
  baseUrl: string;
}

/**
 * Gets the Chapa configuration from environment variables.
 * 
 * Environment Variables:
 * - CHAPA_SECRET_KEY: Your Chapa secret key (required)
 * - CHAPA_MODE: 'sandbox' or 'production' (defaults to 'sandbox')
 * 
 * @throws Error if CHAPA_SECRET_KEY is not configured
 */
function getChapaConfig(): ChapaConfig {
  const secretKey = process.env.CHAPA_SECRET_KEY;
  const mode = (process.env.CHAPA_MODE || 'sandbox') as 'sandbox' | 'production';

  if (!secretKey) {
    throw new Error('CHAPA_SECRET_KEY environment variable is not configured');
  }

  // Chapa API endpoints
  const baseUrl = mode === 'sandbox'
    ? 'https://api.chapa.co/v1'
    : 'https://api.chapa.co/v1';

  return {
    secretKey,
    mode,
    baseUrl,
  };
}

/**
 * Initiates a payment with Chapa.
 * 
 * This function creates a payment request and returns a checkout URL
 * where the user can complete the payment.
 * 
 * @param paymentRequest - Payment details including amount, customer info, and order reference
 * @returns Promise resolving to Chapa payment response with checkout URL
 * @throws Error if payment initiation fails
 * 
 * Requirements: 8.1, 8.2, 25.2
 */
export async function initiateChapaPayment(
  paymentRequest: ChapaPaymentRequest
): Promise<ChapaPaymentResponse> {
  const config = getChapaConfig();

  try {
    // Log request in sandbox mode for debugging
    if (config.mode === 'sandbox') {
      console.log('[Chapa Sandbox] Payment initiation request:', {
        amount: paymentRequest.amount,
        tx_ref: paymentRequest.tx_ref,
        email: paymentRequest.email,
      });
    }

    const response = await fetch(`${config.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Chapa API error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
      );
    }

    const data: ChapaPaymentResponse = await response.json();

    // Log response in sandbox mode
    if (config.mode === 'sandbox') {
      console.log('[Chapa Sandbox] Payment initiation response:', {
        status: data.status,
        message: data.message,
        checkout_url: data.data?.checkout_url,
      });
    }

    return data;
  } catch (error) {
    console.error('Error initiating Chapa payment:', error);
    throw error;
  }
}

/**
 * Verifies a payment transaction with Chapa.
 * 
 * This function queries Chapa to verify the status of a payment transaction.
 * It's used to confirm payment status before updating order status.
 * 
 * @param txRef - Transaction reference (orderId)
 * @returns Promise resolving to payment verification data
 * @throws Error if verification fails
 * 
 * Requirements: 8.3, 8.6
 */
export async function verifyPayment(txRef: string): Promise<any> {
  const config = getChapaConfig();

  try {
    const response = await fetch(`${config.baseUrl}/transaction/verify/${txRef}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Chapa verification error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();

    // Log in sandbox mode
    if (config.mode === 'sandbox') {
      console.log('[Chapa Sandbox] Payment verification:', {
        tx_ref: txRef,
        status: data.status,
      });
    }

    return data;
  } catch (error) {
    console.error('Error verifying Chapa payment:', error);
    throw error;
  }
}

/**
 * Validates a Chapa webhook signature.
 * 
 * Chapa signs webhook payloads to ensure they come from Chapa and haven't been tampered with.
 * This function verifies the signature before processing the webhook.
 * 
 * @param payload - The webhook payload as a string
 * @param signature - The signature from the webhook headers
 * @returns true if signature is valid, false otherwise
 * 
 * Requirements: 8.3, 24.1
 */
export function validateWebhookSignature(payload: string, signature: string): boolean {
  const webhookSecret = process.env.CHAPA_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('CHAPA_WEBHOOK_SECRET is not configured');
    return false;
  }

  // Chapa uses HMAC SHA256 for webhook signatures
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}

/**
 * Processes a Chapa webhook payload.
 * 
 * This function extracts and validates the webhook data.
 * It should be called from the webhook API route.
 * 
 * @param payload - The webhook payload
 * @returns Processed webhook data
 * @throws Error if payload is invalid
 * 
 * Requirements: 8.3, 24.1
 */
export function processWebhookPayload(payload: any): ChapaWebhookPayload {
  // Validate required fields
  if (!payload.event || !payload.data) {
    throw new Error('Invalid webhook payload: missing event or data');
  }

  if (!payload.data.tx_ref) {
    throw new Error('Invalid webhook payload: missing tx_ref');
  }

  const webhookData: ChapaWebhookPayload = {
    event: payload.event,
    data: {
      tx_ref: payload.data.tx_ref,
      status: payload.data.status,
      amount: payload.data.amount,
      currency: payload.data.currency || 'ETB',
      reference: payload.data.reference || payload.data.tx_ref,
    },
  };

  return webhookData;
}

/**
 * Initiates a refund for a payment.
 * 
 * This function requests a refund from Chapa for a completed payment.
 * Used when orders are cancelled after payment.
 * 
 * @param txRef - Transaction reference (orderId)
 * @param amount - Amount to refund in ETB
 * @param reason - Reason for refund
 * @returns Promise resolving to refund response
 * @throws Error if refund initiation fails
 * 
 * Requirements: 18.2
 */
export async function initiateRefund(
  txRef: string,
  amount: number,
  reason: string
): Promise<any> {
  const config = getChapaConfig();

  try {
    // Log in sandbox mode
    if (config.mode === 'sandbox') {
      console.log('[Chapa Sandbox] Refund initiation:', {
        tx_ref: txRef,
        amount,
        reason,
      });
    }

    // Note: Chapa refund API endpoint may vary - check latest documentation
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Chapa refund error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();

    // Log in sandbox mode
    if (config.mode === 'sandbox') {
      console.log('[Chapa Sandbox] Refund response:', data);
    }

    return data;
  } catch (error) {
    console.error('Error initiating Chapa refund:', error);
    throw error;
  }
}

/**
 * Checks if Chapa is running in sandbox mode.
 * 
 * @returns true if in sandbox mode, false if in production
 */
export function isSandboxMode(): boolean {
  const mode = process.env.CHAPA_MODE || 'sandbox';
  return mode === 'sandbox';
}

/**
 * Gets a display-friendly mode indicator.
 * 
 * @returns 'Sandbox' or 'Production'
 */
export function getModeDisplay(): string {
  return isSandboxMode() ? 'Sandbox' : 'Production';
}
