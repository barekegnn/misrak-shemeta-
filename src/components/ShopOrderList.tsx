'use client';

import { useEffect, useState } from 'react';
import { getShopOrders } from '@/app/actions/orders';
import { getStatusDescription } from '@/lib/orders/stateMachine';
import type { Order, OrderStatus, Language } from '@/types';

interface ShopOrderListProps {
  telegramId: string;
  language?: Language;
  statusFilter?: OrderStatus;
  onOrderClick?: (orderId: string) => void;
}

export function ShopOrderList({
  telegramId,
  language = 'en',
  statusFilter,
  onOrderClick
}: ShopOrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<OrderStatus | undefined>(
    statusFilter
  );

  useEffect(() => {
    loadOrders();
  }, [telegramId, selectedFilter]);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);

    const result = await getShopOrders(telegramId, selectedFilter);

    if (result.success && result.data) {
      setOrders(result.data);
    } else {
      setError(result.error || 'Failed to load orders');
    }

    setIsLoading(false);
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

  const statusOptions: OrderStatus[] = [
    'PAID_ESCROW',
    'DISPATCHED',
    'ARRIVED',
    'COMPLETED',
    'CANCELLED'
  ];

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

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Shop Orders</h2>
        
        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedFilter(undefined)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors min-h-[36px] ${
              selectedFilter === undefined
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedFilter(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors min-h-[36px] ${
                selectedFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {getStatusDescription(status, language)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No orders found</p>
          <p className="text-gray-400 text-sm mt-2">
            {selectedFilter
              ? `No orders with status: ${getStatusDescription(selectedFilter, language)}`
              : 'Orders will appear here when customers place them'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
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
                  <p className="text-xs text-gray-500 mt-1">
                    Delivery to: {order.userHomeLocation}
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

              {/* Order Items (shop's items only) */}
              <div className="space-y-2 mb-3">
                {order.items.map((item, index) => (
                  <div key={index} className="text-sm text-gray-700">
                    {item.productName} × {item.quantity}
                  </div>
                ))}
              </div>

              {/* Order Total (shop's items only) */}
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-sm text-gray-600">Shop Total</span>
                <span className="text-lg font-bold">
                  {order.items
                    .reduce(
                      (sum, item) => sum + item.priceAtPurchase * item.quantity,
                      0
                    )
                    .toFixed(2)}{' '}
                  ETB
                </span>
              </div>

              {/* Action Hint */}
              {order.status === 'PAID_ESCROW' && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-blue-600 font-medium">
                    Ready to dispatch →
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
