/**
 * Shop Order Detail Page - Individual Order View for Shop Owners
 * 
 * Displays complete order information including buyer details, delivery location,
 * and status update controls for shop owners.
 * 
 * Requirements: 9.1, 9.2
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { getOrderById, updateOrderStatus } from '@/app/actions/orders';
import { Order, OrderStatus } from '@/types';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  MapPin,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  Home,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';

// Status timeline configuration
const STATUS_TIMELINE: Array<{
  status: OrderStatus;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    status: 'PENDING',
    label: 'Order Placed',
    icon: <Clock className="w-5 h-5" />,
    description: 'Awaiting payment confirmation',
  },
  {
    status: 'PAID_ESCROW',
    label: 'Payment Secured',
    icon: <ShieldCheck className="w-5 h-5" />,
    description: 'Ready to prepare and dispatch',
  },
  {
    status: 'DISPATCHED',
    label: 'Dispatched',
    icon: <Truck className="w-5 h-5" />,
    description: 'Order handed to delivery runner',
  },
  {
    status: 'ARRIVED',
    label: 'Arrived',
    icon: <MapPin className="w-5 h-5" />,
    description: 'Awaiting customer confirmation',
  },
  {
    status: 'COMPLETED',
    label: 'Completed',
    icon: <CheckCircle2 className="w-5 h-5" />,
    description: 'Order delivered and confirmed',
  },
];

export default function ShopOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useTelegramAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dispatching, setDispatching] = useState(false);

  const orderId = params.orderId as string;

  useEffect(() => {
    async function fetchOrder() {
      if (!user?.telegramId || !orderId) return;

      // Check if user is a merchant
      if (user.role !== 'MERCHANT') {
        setError('Access denied. Only shop owners can view this page.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await getOrderById(user.telegramId, orderId);

        if (result.success && result.data) {
          setOrder(result.data);
        } else {
          setError(result.error || 'Failed to load order');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchOrder();
    }
  }, [user, authLoading, orderId]);

  const handleDispatchOrder = async () => {
    if (!user?.telegramId || !order) return;

    try {
      setDispatching(true);

      const result = await updateOrderStatus(
        user.telegramId,
        order.id,
        'DISPATCHED',
        'SHOP_OWNER'
      );

      if (result.success && result.data) {
        setOrder(result.data);
      } else {
        alert(result.error || 'Failed to dispatch order');
      }
    } catch (err) {
      console.error('Error dispatching order:', err);
      alert('An unexpected error occurred');
    } finally {
      setDispatching(false);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ETB`;
  };

  const getStatusIndex = (status: OrderStatus): number => {
    if (status === 'CANCELLED') return -1;
    return STATUS_TIMELINE.findIndex(s => s.status === status);
  };

  const canDispatch = order && order.status === 'PAID_ESCROW';

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-red-100">
          <div className="flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 text-center mb-2">
            Order Not Found
          </h2>
          <p className="text-slate-600 text-center mb-6">{error || 'This order does not exist'}</p>
          <button
            onClick={() => router.push('/shop/orders')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const shopEarnings = order.items.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-lg bg-white/90">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/shop/orders')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Orders</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Order #{order.id.substring(0, 8)}
              </h1>
              <p className="text-sm text-slate-600">{formatDate(order.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Status Timeline */}
        {order.status !== 'CANCELLED' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
          >
            <h2 className="text-lg font-bold text-slate-900 mb-6">Order Status</h2>
            <div className="relative">
              {STATUS_TIMELINE.map((step, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                return (
                  <div key={step.status} className="relative">
                    {/* Connector Line */}
                    {index < STATUS_TIMELINE.length - 1 && (
                      <div
                        className={`absolute left-6 top-12 w-0.5 h-16 transition-colors ${
                          isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                    )}

                    {/* Step */}
                    <div className="flex items-start gap-4 pb-8">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30'
                            : 'bg-slate-100'
                        } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                      >
                        <span className={isCompleted ? 'text-white' : 'text-slate-400'}>
                          {step.icon}
                        </span>
                      </div>
                      <div className="flex-1 pt-2">
                        <h3
                          className={`font-semibold mb-1 ${
                            isCompleted ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </h3>
                        <p
                          className={`text-sm ${
                            isCompleted ? 'text-slate-600' : 'text-slate-400'
                          }`}
                        >
                          {step.description}
                        </p>
                        {isCurrent && order.statusHistory.length > 0 && (
                          <p className="text-xs text-emerald-600 mt-2 font-medium">
                            {formatDate(order.statusHistory[order.statusHistory.length - 1].timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Cancelled Status */}
        {order.status === 'CANCELLED' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-red-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Order Cancelled</h2>
                <p className="text-sm text-slate-600">
                  {formatDate(order.statusHistory[order.statusHistory.length - 1].timestamp)}
                </p>
              </div>
            </div>
            {order.cancellationReason && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <p className="text-sm font-medium text-red-900 mb-1">Cancellation Reason:</p>
                <p className="text-sm text-red-700">{order.cancellationReason}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Delivery Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-4">Delivery Information</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Delivery Location</p>
                <p className="font-semibold text-slate-900">{order.userHomeLocation}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Customer ID</p>
                <p className="font-semibold text-slate-900">{order.userId.substring(0, 12)}...</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-4">Items from Your Shop</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">{item.productName}</h3>
                  <p className="text-sm text-slate-600">
                    Quantity: {item.quantity} × {formatCurrency(item.priceAtPurchase)}
                  </p>
                </div>
                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(item.priceAtPurchase * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Earnings Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-2xl p-6 text-white"
        >
          <h2 className="text-lg font-bold mb-2">Your Earnings from This Order</h2>
          <p className="text-4xl font-bold mb-2">{formatCurrency(shopEarnings)}</p>
          <p className="text-emerald-100 text-sm">
            {order.status === 'COMPLETED' 
              ? 'Funds released to your balance' 
              : 'Funds will be released after delivery confirmation'}
          </p>
        </motion.div>

        {/* Dispatch Button */}
        {canDispatch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={handleDispatchOrder}
              disabled={dispatching}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {dispatching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Dispatching Order...</span>
                </>
              ) : (
                <>
                  <Truck className="w-6 h-6" />
                  <span>Mark as Dispatched</span>
                </>
              )}
            </button>
            <p className="text-sm text-slate-600 text-center mt-3">
              Click this button after handing the order to the delivery runner
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
