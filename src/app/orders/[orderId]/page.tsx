/**
 * Order Detail Page - Individual Order View
 * 
 * Displays complete order information including:
 * - Status timeline (PENDING → PAID_ESCROW → DISPATCHED → ARRIVED → COMPLETED)
 * - OTP display when status is ARRIVED
 * - Cancel button (only for PENDING or PAID_ESCROW)
 * - All order items with product names, quantities, and prices
 * 
 * Requirements: 14.4, 17.1, 18.1, 18.2, 18.3
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { getOrderById, cancelOrder } from '@/app/actions/orders';
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
  Key,
  ShieldCheck,
  CreditCard,
  Home,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    description: 'Funds held securely in escrow',
  },
  {
    status: 'DISPATCHED',
    label: 'On the Way',
    icon: <Truck className="w-5 h-5" />,
    description: 'Runner is delivering your order',
  },
  {
    status: 'ARRIVED',
    label: 'Arrived',
    icon: <MapPin className="w-5 h-5" />,
    description: 'Verify product and provide OTP',
  },
  {
    status: 'COMPLETED',
    label: 'Completed',
    icon: <CheckCircle2 className="w-5 h-5" />,
    description: 'Order successfully delivered',
  },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useTelegramAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const orderId = params.orderId as string;

  useEffect(() => {
    async function fetchOrder() {
      if (!user?.telegramId || !orderId) return;

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

  const handleCancelOrder = async () => {
    if (!user?.telegramId || !order || !cancelReason.trim()) return;

    try {
      setCancelling(true);
      const result = await cancelOrder(user.telegramId, order.id, cancelReason);

      if (result.success && result.data) {
        setOrder(result.data);
        setShowCancelConfirm(false);
        setCancelReason('');
      } else {
        alert(result.error || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('An unexpected error occurred');
    } finally {
      setCancelling(false);
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

  const canCancelOrder = order && (order.status === 'PENDING' || order.status === 'PAID_ESCROW');

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
            onClick={() => router.push('/orders')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const totalWithDelivery = order.totalAmount + order.deliveryFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-lg bg-white/90">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/orders')}
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
            
            {/* Refund Status */}
            {order.refundInitiated && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-1">Refund Initiated</p>
                    <p className="text-sm text-blue-700">
                      Amount: {formatCurrency(order.refundAmount || 0)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Your refund is being processed. It may take 3-5 business days to appear in your account.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {order.refundFailed && (
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900 mb-1">Refund Processing Issue</p>
                    <p className="text-sm text-yellow-700">
                      We encountered an issue processing your refund automatically. Our team has been notified and will process your refund manually within 24 hours.
                    </p>
                    <p className="text-xs text-yellow-600 mt-2">
                      If you have questions, please contact support with order ID: {order.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* OTP Display - Only show when status is ARRIVED */}
        {order.status === 'ARRIVED' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-2xl p-8 text-white"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Your Delivery OTP</h2>
                <p className="text-purple-100 text-sm">Share this code with the runner</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-center text-5xl font-bold tracking-[0.5em] mb-2">
                {order.otpCode}
              </p>
              <p className="text-center text-purple-100 text-sm">
                Verify your product before sharing this code
              </p>
            </div>
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm text-purple-100">
                <strong className="text-white">Important:</strong> Only provide this OTP after inspecting your product. Once verified, funds will be released to the seller.
              </p>
            </div>
          </motion.div>
        )}

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-4">Order Items</h2>
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
                  <p className="text-xs text-slate-500 mt-1">From {item.shopCity}</p>
                </div>
                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(item.priceAtPurchase * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Price Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-4">Price Breakdown</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-slate-700">
              <span>Subtotal</span>
              <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span>Delivery Fee</span>
              <span className="font-semibold">{formatCurrency(order.deliveryFee)}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-lg font-bold text-slate-900">Total</span>
              <span className="text-2xl font-bold text-emerald-600">
                {formatCurrency(totalWithDelivery)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Delivery Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-4">Delivery Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Delivery Location</p>
                <p className="font-semibold text-slate-900">{order.userHomeLocation}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cancel Order Button */}
        {canCancelOrder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-4 px-6 rounded-xl transition-colors border border-red-200"
            >
              Cancel Order
            </button>
          </motion.div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !cancelling && setShowCancelConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Cancel Order?</h2>
              </div>
              <p className="text-slate-600 mb-4">
                {order.status === 'PAID_ESCROW'
                  ? 'Your payment will be refunded within 3-5 business days.'
                  : 'This action cannot be undone.'}
              </p>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for cancellation
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please tell us why you're cancelling..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={cancelling}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={cancelling}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling || !cancelReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
