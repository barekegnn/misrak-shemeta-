'use client';

import { useEffect, useState } from 'react';
import { getOrderById, updateOrderStatus } from '@/app/actions/orders';
import { getStatusDescription } from '@/lib/orders/stateMachine';
import type { Order, Language, OrderStatus } from '@/types';

interface ShopOrderDetailProps {
  telegramId: string;
  orderId: string;
  language?: Language;
  onBack?: () => void;
}

export function ShopOrderDetail({
  telegramId,
  orderId,
  language = 'en',
  onBack
}: ShopOrderDetailProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleMarkAsDispatched = async () => {
    if (!order) return;

    setIsUpdating(true);
    setError(null);

    const result = await updateOrderStatus(
      telegramId,
      order.id,
      'DISPATCHED',
      'SHOP_OWNER'
    );

    if (result.success && result.data) {
      setOrder(result.data);
    } else {
      setError(result.error || 'Failed to update order status');
    }

    setIsUpdating(false);
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

  if (error && !order) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
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

  if (!order) return null;

  const shopTotal = order.items.reduce(
    (sum, item) => sum + item.priceAtPurchase * item.quantity,
    0
  );

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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

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

        {/* Delivery Information */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Delivery Information</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Delivery Location:</span>
              <span className="ml-2 font-medium">{order.userHomeLocation}</span>
            </div>
            <div>
              <span className="text-gray-600">Delivery Fee:</span>
              <span className="ml-2 font-medium">
                {order.deliveryFee.toFixed(2)} ETB
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Items to Prepare</h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-gray-500">
                    {item.priceAtPurchase.toFixed(2)} ETB × {item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  {(item.priceAtPurchase * item.quantity).toFixed(2)} ETB
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Shop Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Your Earnings</span>
            <span>{shopTotal.toFixed(2)} ETB</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Funds will be released to your balance when order is completed
          </p>
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

        {/* Action Button */}
        {order.status === 'PAID_ESCROW' && (
          <div className="border-t pt-4">
            <button
              onClick={handleMarkAsDispatched}
              disabled={isUpdating}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >
              {isUpdating ? 'Updating...' : 'Mark as Dispatched'}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Click this button after handing the items to the delivery person
            </p>
          </div>
        )}

        {/* Completion Info */}
        {order.status === 'COMPLETED' && (
          <div className="border-t pt-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">✓ Order Completed</p>
              <p className="text-sm text-green-700 mt-1">
                Funds have been added to your shop balance
              </p>
            </div>
          </div>
        )}

        {/* Cancellation Info */}
        {order.status === 'CANCELLED' && order.cancellationReason && (
          <div className="border-t pt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">Order Cancelled</p>
              <p className="text-sm text-red-700 mt-1">
                Reason: {order.cancellationReason}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
