'use client';

import { useState } from 'react';
import { updateOrderStatus, validateOTP } from '@/app/actions/orders';
import { getStatusDescription } from '@/lib/orders/stateMachine';
import type { Order, Language } from '@/types';

interface RunnerOrderViewProps {
  telegramId: string;
  order: Order;
  language?: Language;
  onOrderUpdate?: (order: Order) => void;
}

export function RunnerOrderView({
  telegramId,
  order,
  language = 'en',
  onOrderUpdate
}: RunnerOrderViewProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);

  const handleMarkAsArrived = async () => {
    setIsUpdating(true);
    setError(null);

    const result = await updateOrderStatus(
      telegramId,
      order.id,
      'ARRIVED',
      'RUNNER'
    );

    if (result.success && result.data) {
      setShowOtpForm(true);
      if (onOrderUpdate) {
        onOrderUpdate(result.data);
      }
    } else {
      setError(result.error || 'Failed to update order status');
    }

    setIsUpdating(false);
  };

  const handleSubmitOTP = async () => {
    if (otpInput.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setIsValidating(true);
    setError(null);

    const result = await validateOTP(telegramId, order.id, otpInput);

    if (result.success && result.data) {
      setOtpInput('');
      setShowOtpForm(false);
      if (onOrderUpdate) {
        onOrderUpdate(result.data);
      }
    } else {
      setError(result.error || 'Invalid OTP');
    }

    setIsValidating(false);
  };

  const shopTotal = order.items.reduce(
    (sum, item) => sum + item.priceAtPurchase * item.quantity,
    0
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      {/* Order Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {getStatusDescription(order.status, language)}
        </span>
      </div>

      {/* Delivery Information */}
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3">Delivery Details</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-600">Destination:</span>
            <span className="ml-2 font-medium text-lg">
              {order.userHomeLocation}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Delivery Fee:</span>
            <span className="ml-2 font-medium">
              {order.deliveryFee.toFixed(2)} ETB
            </span>
          </div>
        </div>
      </div>

      {/* Items to Deliver */}
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3">Items to Deliver</h3>
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.productName} × {item.quantity}
              </span>
              <span className="text-gray-500">from {item.shopCity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Value */}
      <div className="border-t pt-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Order Value</span>
          <span className="font-bold">{shopTotal.toFixed(2)} ETB</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* Actions based on status */}
      {order.status === 'DISPATCHED' && !showOtpForm && (
        <div className="border-t pt-4">
          <button
            onClick={handleMarkAsArrived}
            disabled={isUpdating}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            {isUpdating ? 'Updating...' : 'Mark as Arrived'}
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Click this when you reach the delivery location
          </p>
        </div>
      )}

      {/* OTP Form */}
      {(order.status === 'ARRIVED' || showOtpForm) && (
        <div className="border-t pt-4 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Complete Delivery
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Ask the customer for their 6-digit verification code
            </p>
            
            <input
              type="text"
              value={otpInput}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtpInput(value);
              }}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full border border-gray-300 rounded-lg p-3 text-center text-2xl font-bold tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            {order.otpAttempts > 0 && (
              <p className="text-xs text-orange-600 mt-2">
                Attempts used: {order.otpAttempts}/3
              </p>
            )}
          </div>

          <button
            onClick={handleSubmitOTP}
            disabled={isValidating || otpInput.length !== 6}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            {isValidating ? 'Verifying...' : 'Complete Delivery'}
          </button>
        </div>
      )}

      {/* Completed Status */}
      {order.status === 'COMPLETED' && (
        <div className="border-t pt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium text-center">
              ✓ Delivery Completed
            </p>
            <p className="text-sm text-green-700 mt-1 text-center">
              Thank you for completing this delivery!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
