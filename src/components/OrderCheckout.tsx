'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder } from '@/app/actions/orders';
import { initiateChapaPaymentForOrder } from '@/app/actions/payment';
import type { CartItem, Product } from '@/types';

interface OrderCheckoutProps {
  telegramId: string;
  cartItems: Array<CartItem & { product: Product }>;
  deliveryFee: number;
  onSuccess?: () => void;
}

export function OrderCheckout({
  telegramId,
  cartItems,
  deliveryFee,
  onSuccess
}: OrderCheckoutProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Create order
      const orderResult = await createOrder(
        telegramId,
        cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      );

      if (!orderResult.success || !orderResult.data) {
        setError(orderResult.error || 'Failed to create order');
        setIsProcessing(false);
        return;
      }

      const order = orderResult.data;

      // 2. Initiate payment
      const paymentResult = await initiateChapaPaymentForOrder(
        telegramId,
        order.id
      );

      if (!paymentResult.success || !paymentResult.data) {
        setError(paymentResult.error || 'Failed to initiate payment');
        setIsProcessing(false);
        return;
      }

      // 3. Redirect to Chapa checkout
      window.location.href = paymentResult.data.checkoutUrl;

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Order Summary */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        
        {/* Cart Items */}
        <div className="space-y-3 mb-4">
          {cartItems.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.product.name} × {item.quantity}
              </span>
              <span className="font-medium">
                {(item.product.price * item.quantity).toFixed(2)} ETB
              </span>
            </div>
          ))}
        </div>

        {/* Subtotal */}
        <div className="flex justify-between text-sm border-t pt-3">
          <span className="text-gray-700">Subtotal</span>
          <span className="font-medium">{subtotal.toFixed(2)} ETB</span>
        </div>

        {/* Delivery Fee */}
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-700">Delivery Fee</span>
          <span className="font-medium">{deliveryFee.toFixed(2)} ETB</span>
        </div>

        {/* Total */}
        <div className="flex justify-between text-lg font-bold border-t mt-3 pt-3">
          <span>Total</span>
          <span>{total.toFixed(2)} ETB</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={isProcessing || cartItems.length === 0}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-h-[44px]"
      >
        {isProcessing ? 'Processing...' : 'Proceed to Payment'}
      </button>

      {/* Payment Info */}
      <p className="text-xs text-gray-500 text-center">
        You will be redirected to Chapa for secure payment processing
      </p>
    </div>
  );
}
