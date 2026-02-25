'use client';

import { useEffect, useState } from 'react';
import { getUserOrders } from '@/app/actions/orders';
import { getStatusDescription } from '@/lib/orders/stateMachine';
import type { Order, Language } from '@/types';

interface OrderListProps {
  telegramId: string;
  language?: Language;
  onOrderClick?: (orderId: string) => void;
}

export function OrderList({ 
  telegramId, 
  language = 'en',
  onOrderClick 
}: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [telegramId]);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);

    const result = await getUserOrders(telegramId);

    if (result.success && result.data) {
      setOrders(result.data);
    } else {
      setError(result.error || 'Failed to load orders');
    }

    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No orders yet</p>
        <p className="text-gray-400 text-sm mt-2">
          Your order history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">My Orders</h2>
      
      {orders.map((order) => (
        <div
          key={order.id}
          onClick={() => onOrderClick?.(order.id)}
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
        >
          {/* Order Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-sm text-gray-500">
                Order #{order.id.slice(0, 8)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(order.createdAt).toLocaleDateString()}
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

          {/* Order Items */}
          <div className="space-y-2 mb-3">
            {order.items.map((item, index) => (
              <div key={index} className="text-sm text-gray-700">
                {item.productName} × {item.quantity}
              </div>
            ))}
          </div>

          {/* Order Total */}
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-lg font-bold">
              {(order.totalAmount + order.deliveryFee).toFixed(2)} ETB
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
