'use client';

import { useEffect, useState } from 'react';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { getOrderById, updateOrderStatus, validateOTP } from '@/app/actions/orders';
import { Order, OrderStatus } from '@/types';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Package, 
  MapPin, 
  Clock, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  TruckIcon,
  KeyRound,
  AlertTriangle
} from 'lucide-react';

export default function RunnerOrderDetailPage() {
  const { telegramId, isLoading: authLoading } = useTelegramAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && telegramId) {
      loadOrder();
    }
  }, [authLoading, telegramId, orderId]);

  const loadOrder = async () => {
    if (!telegramId) return;

    setIsLoading(true);
    setError(null);

    const result = await getOrderById(orderId, telegramId);

    if (result.success && result.data) {
      setOrder(result.data);
    } else {
      setError(result.error || 'Failed to load order');
    }

    setIsLoading(false);
  };

  const handleMarkAsArrived = async () => {
    if (!telegramId || !order) return;

    setIsUpdating(true);
    setError(null);

    const result = await updateOrderStatus(
      order.id,
      'ARRIVED',
      telegramId
    );

    if (result.success) {
      await loadOrder();
    } else {
      setError(result.error || 'Failed to update order status');
    }

    setIsUpdating(false);
  };

  const handleSubmitOTP = async () => {
    if (!telegramId || !order || !otpInput) return;

    if (otpInput.length !== 6) {
      setOtpError('OTP must be 6 digits');
      return;
    }

    setIsUpdating(true);
    setOtpError(null);

    const result = await validateOTP(order.id, otpInput, telegramId);

    if (result.success) {
      await loadOrder();
      router.push('/runner/orders');
    } else {
      setOtpError(result.error || 'Invalid OTP');
    }

    setIsUpdating(false);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'DISPATCHED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ARRIVED':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'COMPLETED':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'DISPATCHED':
        return <TruckIcon className="w-5 h-5" />;
      case 'ARRIVED':
        return <MapPin className="w-5 h-5" />;
      case 'COMPLETED':
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-md w-full backdrop-blur-sm"
        >
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white text-center mb-2">
            Error Loading Order
          </h2>
          <p className="text-gray-300 text-center mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-red-500/50 transition-all"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">
              Delivery Details
            </h1>
            <p className="text-gray-400 text-sm">Order #{order.id.slice(0, 8)}</p>
          </div>
        </div>

        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            <span className="font-medium">
              {order.status === 'DISPATCHED' ? 'Ready to Deliver' : 
               order.status === 'ARRIVED' ? 'Awaiting OTP' : 
               order.status}
            </span>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Delivery Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                Delivery Location
              </h3>
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                {order.userHomeLocation.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-start p-4 bg-white/5 rounded-xl"
              >
                <div className="flex-1">
                  <p className="text-white font-medium mb-1">{item.productName}</p>
                  <p className="text-sm text-gray-400">
                    {item.priceAtPurchase.toFixed(2)} ETB × {item.quantity}
                  </p>
                </div>
                <p className="text-white font-semibold">
                  {(item.priceAtPurchase * item.quantity).toFixed(2)} ETB
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">
                {(order.totalAmount - order.deliveryFee).toFixed(2)} ETB
              </span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-400">Delivery Fee</span>
              <span className="text-white">{order.deliveryFee.toFixed(2)} ETB</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">Total</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {order.totalAmount.toFixed(2)} ETB
              </span>
            </div>
          </div>
        </motion.div>

        {/* Order Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Order Timeline</h3>
          <div className="space-y-3">
            {order.statusHistory.map((history, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {history.to}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(history.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        {order.status === 'DISPATCHED' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={handleMarkAsArrived}
              disabled={isUpdating}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5" />
                  Mark as Arrived
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* OTP Submission Form */}
        {order.status === 'ARRIVED' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Complete Delivery
                </h3>
                <p className="text-sm text-gray-300">
                  Get the 6-digit OTP from the customer
                </p>
              </div>
            </div>

            {/* OTP Attempts Warning */}
            {order.otpAttempts > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-yellow-300 text-sm font-medium">
                    {order.otpAttempts} failed attempt{order.otpAttempts > 1 ? 's' : ''}
                  </p>
                  <p className="text-yellow-300/80 text-xs mt-1">
                    {3 - order.otpAttempts} attempts remaining
                  </p>
                </div>
              </div>
            )}

            {/* OTP Input */}
            <div className="mb-4">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setOtpInput(value);
                  setOtpError(null);
                }}
                placeholder="Enter 6-digit OTP"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-white text-center text-2xl font-mono tracking-widest placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {otpError && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {otpError}
                </p>
              )}
            </div>

            <button
              onClick={handleSubmitOTP}
              disabled={isUpdating || otpInput.length !== 6}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Complete Delivery
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Completed Status */}
        {order.status === 'COMPLETED' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 text-center"
          >
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Delivery Completed
            </h3>
            <p className="text-gray-300">
              This order has been successfully delivered
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
