'use client';

import { useEffect, useState } from 'react';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { getRunnerOrders } from '@/app/actions/orders';
import { Order, OrderStatus } from '@/types';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Package, 
  MapPin, 
  Clock, 
  ChevronRight,
  Loader2,
  AlertCircle,
  TruckIcon
} from 'lucide-react';

export default function RunnerOrdersPage() {
  const { telegramId, isLoading: authLoading } = useTelegramAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'DISPATCHED' | 'ARRIVED'>('ALL');

  useEffect(() => {
    if (!authLoading && telegramId) {
      loadOrders();
    }
  }, [authLoading, telegramId]);

  const loadOrders = async () => {
    if (!telegramId) return;

    setIsLoading(true);
    setError(null);

    const result = await getRunnerOrders(telegramId);

    if (result.success && result.data) {
      setOrders(result.data);
    } else {
      setError(result.error || 'Failed to load orders');
    }

    setIsLoading(false);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'DISPATCHED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ARRIVED':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'DISPATCHED':
        return <TruckIcon className="w-4 h-4" />;
      case 'ARRIVED':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading deliveries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 max-w-md w-full backdrop-blur-sm"
        >
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white text-center mb-2">
            Error Loading Deliveries
          </h2>
          <p className="text-gray-300 text-center mb-4">{error}</p>
          <button
            onClick={loadOrders}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-red-500/50 transition-all"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Active Deliveries
          </h1>
          <p className="text-gray-400">
            Manage your delivery assignments
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: 'ALL', label: 'All', count: orders.length },
            { value: 'DISPATCHED', label: 'Ready to Deliver', count: orders.filter(o => o.status === 'DISPATCHED').length },
            { value: 'ARRIVED', label: 'Awaiting OTP', count: orders.filter(o => o.status === 'ARRIVED').length }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as any)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                filter === tab.value
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center"
          >
            <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Deliveries
            </h3>
            <p className="text-gray-400">
              {filter === 'ALL' 
                ? 'No active deliveries at the moment'
                : `No ${filter.toLowerCase()} deliveries`}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => router.push(`/runner/orders/${order.id}`)}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer group"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="text-sm font-medium">
                      {order.status === 'DISPATCHED' ? 'Ready to Deliver' : 'Awaiting OTP'}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </div>

                {/* Delivery Location */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 mb-1">Deliver to</p>
                    <p className="text-white font-medium">
                      {order.userHomeLocation.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-400 mb-2">Items</p>
                  <div className="space-y-2">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-300">{item.productName}</span>
                        <span className="text-gray-400">×{item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-sm text-purple-400">
                        +{order.items.length - 2} more items
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-white font-semibold">
                    {order.totalAmount.toFixed(2)} ETB
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
