'use client';

import { useState } from 'react';
import { initiateChapaPaymentForOrder } from '@/app/actions/payment';
import { useTelegramAuth } from './TelegramAuthProvider';
import { useI18n } from '@/i18n/provider';

interface ChapaPaymentButtonProps {
  orderId: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

/**
 * ChapaPaymentButton Component
 * 
 * Initiates payment flow with Chapa payment gateway.
 * Redirects user to Chapa checkout page for payment completion.
 * 
 * Features:
 * - Touch-friendly button (44px minimum)
 * - Loading state during payment initiation
 * - Error handling with user feedback
 * - Sandbox mode indicator
 * 
 * Requirements: 8.1, 8.2, 25.5
 */
export function ChapaPaymentButton({
  orderId,
  amount,
  onSuccess,
  onError,
  disabled = false,
}: ChapaPaymentButtonProps) {
  const { user } = useTelegramAuth();
  const { t } = useI18n();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!user) {
      setError(t('errors.notAuthenticated'));
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Initiate payment with Chapa
      const result = await initiateChapaPaymentForOrder(user.telegramId, orderId);

      if (result.success && result.data) {
        // Redirect to Chapa checkout page
        window.location.href = result.data.checkoutUrl;
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const errorMessage = result.error || t('errors.paymentFailed');
        setError(errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }
      }
    } catch (err) {
      const errorMessage = t('errors.paymentFailed');
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if in sandbox mode (from environment)
  const isSandbox = process.env.NEXT_PUBLIC_CHAPA_MODE === 'sandbox';

  return (
    <div className="space-y-4">
      {/* Sandbox Mode Indicator (Requirement 25.5) */}
      {isSandbox && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-sm font-medium text-yellow-800">
              {t('payment.sandboxMode')}
            </p>
          </div>
          <p className="mt-1 text-xs text-yellow-700">
            {t('payment.sandboxDescription')}
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="rounded-lg bg-destructive/10 p-4">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={disabled || isProcessing}
        className="w-full touch-target rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {t('payment.processing')}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            {t('payment.payNow')} {amount.toFixed(2)} ETB
          </span>
        )}
      </button>

      {/* Payment Info */}
      <p className="text-xs text-center text-muted-foreground">
        {t('payment.securePayment')}
      </p>
    </div>
  );
}
