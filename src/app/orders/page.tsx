/**
 * Orders Page - Buyer Order History
 * 
 * Displays all orders for the authenticated user in reverse chronological order.
 * Shows order status, date, total, and products for each order.
 * 
 * Requirements: 14.1, 14.2, 14.3, 14.4
 */

'use client';

import { useEffect, useState } from 'react';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { getUserOrders } from '@/app/actions/orders';
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
  ShoppingBag,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

// Status configuration with luxury styling
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
    label: 'Payment Secured',
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  DISPATCHED: {
    label: 'On the Way',
    icon: <Truck className="w-4 h-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  ARRIVED: {
    label: 'Arrived - Verify OTP',
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

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useTelegramAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.telegramId) return;

      try {
        setLoading(true);
        setError(null);

        const result = await getUserOrders(user.telegramId);

        if (result.success && result.data) {
          setOrders(result.data);
        } else {
          setError(result.error || 'Failed to load orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchOrders();
    }
  }, [user, authLoading]);

  // Format date with luxury styling
  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ETB`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Loading your orders...</p>
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
            <ShoppingBag className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-3">
            No Orders Yet
          </h2>
          <p className="text-slate-600 text-center mb-8">
            Start shopping to see your orders here
          </p>
          <button
            onClick={() => router.push('/shops')}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/30"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-lg bg-white/90">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
              <p className="text-sm text-slate-600">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {orders.map((order, index) => {
          const statusConfig = STATUS_CONFIG[order.status];
          const totalWithDelivery = order.totalAmount + order.deliveryFee;

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => router.push(`/orders/${order.id}`)}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
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

                {/* Order Items Preview */}
                <div className="space-y-2">
                  {order.items.slice(0, 2).map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <p className="text-sm text-slate-700 flex-1">
                        {item.productName} <span className="text-slate-500">× {item.quantity}</span>
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(item.priceAtPurchase * item.quantity)}
                      </p>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-sm text-slate-500 pl-5">
                      +{order.items.length - 2} more {order.items.length - 2 === 1 ? 'item' : 'items'}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Footer */}
              <div className="px-6 py-4 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-slate-900">
                    {formatCurrency(totalWithDelivery)}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 group-hover:gap-3 transition-all">
                  <span className="text-sm font-semibold">View Details</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
