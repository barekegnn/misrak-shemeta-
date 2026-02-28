/**
 * Shop Orders Page - Shop Owner Order Management
 * 
 * Displays all orders containing products from the authenticated shop owner's shop.
 * Allows filtering by status and marking orders as DISPATCHED.
 * 
 * Requirements: 9.1, 9.2, 9.6
 */

'use client';

import { useEffect, useState } from 'react';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { getShopOrders, updateOrderStatus } from '@/app/actions/orders';
import { Order, OrderStatus } from '@/types';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  MapPin,
  ChevronRight,
  Store,
  AlertCircle,
  Filter,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Status filter options
const STATUS_FILTERS: Array<{ value: OrderStatus | 'ALL'; label: string; color: string }> = [
  { value: 'ALL', label: 'All Orders', color: 'text-slate-600' },
  { value: 'PAID_ESCROW', label: 'Ready to Dispatch', color: 'text-emerald-600' },
  { value: 'DISPATCHED', label: 'In Transit', color: 'text-blue-600' },
  { value: 'ARRIVED', label: 'Awaiting Confirmation', color: 'text-purple-600' },
  { value: 'COMPLETED', label: 'Completed', color: 'text-green-600' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'text-gray-500' },
];

// Status configuration
const STATUS_CONFIG: Record<OrderStatus, {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  PENDING: {
    label: 'Awaiting Payment',
    icon: <Clock className="w-4 h-4" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  PAID_ESCROW: {
    label: 'Ready to Dispatch',
    icon: <ShieldCheck className="w-4 h-4" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  DISPATCHED: {
    label: 'In Transit',
    icon: <Truck className="w-4 h-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  ARRIVED: {
    label: 'Awaiting Confirmation',
    icon: <MapPin className="w-4 h-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  COMPLETED: {
    label: 'Completed',
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: <XCircle className="w-4 h-4" />,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
};

export default function ShopOrdersPage() {
  const { user, isLoading: authLoading } = useTelegramAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [dispatchingOrderId, setDispatchingOrderId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.telegramId) return;

      // Check if user is a merchant
      if (user.role !== 'MERCHANT') {
        setError('Access denied. Only shop owners can view this page.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await getShopOrders(user.telegramId);

        if (result.success && result.data) {
          setOrders(result.data);
          setFilteredOrders(result.data);
        } else {
          setError(result.error || 'Failed to load orders');
        }
      } catch (err) {
        console.error('Error fetching shop orders:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchOrders();
    }
  }, [user, authLoading]);

  // Filter orders when status filter changes
  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  }, [statusFilter, orders]);

  const handleDispatchOrder = async (orderId: string) => {
    if (!user?.telegramId) return;

    try {
      setDispatchingOrderId(orderId);

      const result = await updateOrderStatus(
        user.telegramId,
        orderId,
        'DISPATCHED',
        'SHOP_OWNER'
      );

      if (result.success && result.data) {
        // Update the order in the list
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? result.data! : order
          )
        );
      } else {
        alert(result.error || 'Failed to dispatch order');
      }
    } catch (err) {
      console.error('Error dispatching order:', err);
      alert('An unexpected error occurred');
    } finally {
      setDispatchingOrderId(null);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ETB`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-red-100">
          <div className="flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 text-center mb-2">
            Unable to Load Orders
          </h2>
          <p className="text-slate-600 text-center mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-slate-100">
          <div className="flex items-center justify-center w-20 h-20 bg-slate-50 rounded-full mx-auto mb-6">
            <Package className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-3">
            No Orders Yet
          </h2>
          <p className="text-slate-600 text-center mb-8">
            Orders will appear here when customers purchase from your shop
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/30"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-lg bg-white/90">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Shop Orders</h1>
              <p className="text-sm text-slate-600">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
              </p>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Filter className="w-5 h-5 text-slate-400 flex-shrink-0" />
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  statusFilter === filter.value
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No {statusFilter !== 'ALL' && STATUS_FILTERS.find(f => f.value === statusFilter)?.label}
            </h3>
            <p className="text-slate-600">
              {statusFilter === 'ALL' 
                ? 'No orders found'
                : `No orders with status "${STATUS_FILTERS.find(f => f.value === statusFilter)?.label}"`
              }
            </p>
          </div>
        ) : (
          filteredOrders.map((order, index) => {
            const statusConfig = STATUS_CONFIG[order.status];
            const canDispatch = order.status === 'PAID_ESCROW';
            const isDispatching = dispatchingOrderId === order.id;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                        Order #{order.id.substring(0, 8)}
                      </p>
                      <p className="text-sm text-slate-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
                      <span className={statusConfig.color}>
                        {statusConfig.icon}
                      </span>
                      <span className={`text-sm font-semibold ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Information */}
                  <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                          Delivery Location
                        </p>
                        <p className="font-semibold text-slate-900">{order.userHomeLocation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                      Items from Your Shop
                    </p>
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">{item.productName}</p>
                            <p className="text-xs text-slate-500">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatCurrency(item.priceAtPurchase * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="px-6 py-4 bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Your Earnings</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {formatCurrency(order.items.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {canDispatch && (
                      <button
                        onClick={() => handleDispatchOrder(order.id)}
                        disabled={isDispatching}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isDispatching ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Dispatching...</span>
                          </>
                        ) : (
                          <>
                            <Truck className="w-5 h-5" />
                            <span>Mark as Dispatched</span>
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/shop/orders/${order.id}`)}
                      className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
