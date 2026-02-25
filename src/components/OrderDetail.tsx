'use client';

import { useEffect, useState } from 'react';
import { getOrderById, cancelOrder } from '@/app/actions/orders';
import { getStatusDescription, canCancelOrder } from '@/lib/orders/stateMachine';
import type { Order, Language, OrderStatus } from '@/types';

interface OrderDetailProps {
  telegramId: string;
  orderId: string;
  language?: Language;
  onBack?: () => void;
}

export function OrderDetail({
  telegramId,
  orderId,
  language = 'en',
  onBack
}: OrderDetailProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    loadOrder();
  }, [orderId, telegramId]);

  const loadOrder = async () => {
    setIsLoading(true);
    setError(null);

    const result = await getOrderById(telegramId, orderId);

    if (result.success && result.data) {
      setOrder(result.data);
    } else {
      setError(result.error || 'Failed to load order');
    }

    setIsLoading(false);
  };

  const handleCancelOrder = async () => {
    if (!order || !cancelReason.trim()) return;

    setIsCancelling(true);
    const result = await cancelOrder(telegramId, order.id, cancelReason);

    if (result.success) {
      setOrder(result.data!);
      setShowCancelDialog(false);
      setCancelReason('');
    } else {
      setError(result.error || 'Failed to cancel order');
    }

    setIsCancelling(false);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAID_ESCROW':
        return 'bg-blue-100 text-blue-800';
      case 'DISPATCHED':
        return 'bg-purple-100 text-purple-800';
      case 'ARRIVED':
        return 'bg-orange-100 text-orange-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Order not found'}
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Orders
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back
          </button>
        )}
        <h2 className="text-2xl font-bold">Order Details</h2>
        <div></div>
      </div>

      {/* Order Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        {/* Order ID and Status */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-mono text-sm">{order.id}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
              order.status
            )}`}
          >
            {getStatusDescription(order.status, language)}
          </span>
        </div>

        {/* Status Timeline */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Status History</h3>
          <div className="space-y-2">
            {order.statusHistory.map((change, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {getStatusDescription(change.to, language)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(change.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OTP Display (when ARRIVED) */}
        {order.status === 'ARRIVED' && (
          <div className="border-t pt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Delivery Verification Code
              </h3>
              <p className="text-3xl font-bold text-blue-600 tracking-wider mb-2">
                {order.otpCode}
              </p>
              <p className="text-sm text-blue-700">
                Provide this code to the delivery person to complete your order
              </p>
              {order.otpAttempts > 0 && (
                <p className="text-xs text-orange-600 mt-2">
                  Attempts used: {order.otpAttempts}/3
                </p>
              )}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Items</h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-gray-500">
                    {item.priceAtPurchase.toFixed(2)} ETB × {item.quantity}
                  </p>
                  <p className="text-xs text-gray-400">{item.shopCity}</p>
                </div>
                <p className="font-medium">
                  {(item.priceAtPurchase * item.quantity).toFixed(2)} ETB
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>{order.totalAmount.toFixed(2)} ETB</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee</span>
            <span>{order.deliveryFee.toFixed(2)} ETB</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span>{(order.totalAmount + order.deliveryFee).toFixed(2)} ETB</span>
          </div>
        </div>

        {/* Delivery Location */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Delivery Location</h3>
          <p className="text-gray-700">{order.userHomeLocation}</p>
        </div>

        {/* Cancellation Reason (if cancelled) */}
        {order.status === 'CANCELLED' && order.cancellationReason && (
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Cancellation Reason</h3>
            <p className="text-gray-700">{order.cancellationReason}</p>
          </div>
        )}

        {/* Cancel Button */}
        {canCancelOrder(order.status) && (
          <div className="border-t pt-4">
            <button
              onClick={() => setShowCancelDialog(true)}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors min-h-[44px]"
            >
              Cancel Order
            </button>
          </div>
        )}
      </div>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4">
            <h3 className="text-xl font-bold">Cancel Order</h3>
            <p className="text-gray-600">
              Please provide a reason for cancelling this order:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCancelDialog(false);
                  setCancelReason('');
                }}
                disabled={isCancelling}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 min-h-[44px]"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling || !cancelReason.trim()}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[44px]"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
