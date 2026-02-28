'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { useI18n } from '@/i18n/provider';
import { getCart } from '@/app/actions/cart';
import { createOrder } from '@/app/actions/orders';
import { initiateChapaPayment } from '@/app/actions/payment';
import { calculateTotalDeliveryFee } from '@/lib/logistics/pricing';
import { 
  ShoppingCart, 
  MapPin, 
  Truck, 
  CreditCard, 
  AlertCircle,
  Loader2,
  Package,
  ArrowLeft
} from 'lucide-react';
import type { Product, City, Campus } from '@/types';

interface EnrichedCartItem {
  productId: string;
  quantity: number;
  product: Product;
}

interface DeliveryBreakdown {
  shopCity: City;
  shopName: string;
  fee: number;
  estimatedTime: string;
  items: Array<{ name: string; quantity: number }>;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, triggerHaptic } = useTelegramAuth();
  const { t } = useI18n();
  
  const [cartItems, setCartItems] = useState<EnrichedCartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryBreakdown, setDeliveryBreakdown] = useState<DeliveryBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCheckoutData() {
      if (!user) {
        console.log('[CheckoutPage] Waiting for user');
        return;
      }

      try {
        setIsLoading(true);
        console.log('[CheckoutPage] Loading checkout data for user:', user.telegramId);
        
        // Load cart
        const cartResult = await getCart(user.telegramId);
        console.log('[CheckoutPage] Cart result:', cartResult);
        
        if (!cartResult.success || !cartResult.data) {
          setError(cartResult.error || 'Failed to load cart');
          return;
        }

        const enrichedItems = cartResult.data.enrichedItems;
        
        // Check if cart is empty
        if (enrichedItems.length === 0) {
          router.push('/cart');
          return;
        }

        setCartItems(enrichedItems);

        // Calculate cart total
        const total = enrichedItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        setCartTotal(total);

        // Calculate delivery fees by shop
        const shopMap = new Map<string, {
          city: City;
          name: string;
          items: Array<{ name: string; quantity: number }>;
        }>();

        // Group items by shop
        for (const item of enrichedItems) {
          const shopId = item.product.shopId;
          if (!shopMap.has(shopId)) {
            // Fetch shop details to get city
            const shopResponse = await fetch(`/api/shops/${shopId}`);
            if (shopResponse.ok) {
              const shopData = await shopResponse.json();
              shopMap.set(shopId, {
                city: shopData.city,
                name: shopData.name,
                items: []
              });
            }
          }
          
          const shopData = shopMap.get(shopId);
          if (shopData) {
            shopData.items.push({
              name: item.product.name,
              quantity: item.quantity
            });
          }
        }

        // Calculate delivery fee for each shop
        const breakdown: DeliveryBreakdown[] = [];
        let totalDeliveryFee = 0;

        for (const [shopId, shopData] of shopMap.entries()) {
          try {
            const { calculateDeliveryFee } = await import('@/lib/logistics/pricing');
            const route = calculateDeliveryFee(shopData.city, user.homeLocation as Campus);
            
            breakdown.push({
              shopCity: shopData.city,
              shopName: shopData.name,
              fee: route.fee,
              estimatedTime: route.estimatedTime,
              items: shopData.items
            });

            totalDeliveryFee += route.fee;
          } catch (err) {
            console.error('[CheckoutPage] Error calculating delivery fee:', err);
          }
        }

        setDeliveryBreakdown(breakdown);
        setDeliveryFee(totalDeliveryFee);

      } catch (err) {
        console.error('[CheckoutPage] Error:', err);
        setError('Failed to load checkout data');
      } finally {
        setIsLoading(false);
      }
    }

    loadCheckoutData();
  }, [user, router]);

  const handlePlaceOrder = async () => {
    if (!user || isProcessing) return;

    try {
      setIsProcessing(true);
      triggerHaptic('medium');

      console.log('[CheckoutPage] Creating order...');

      // Step 1: Create order (Requirement 7.1-7.6)
      const orderResult = await createOrder(
        user.telegramId,
        cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      );

      if (!orderResult.success || !orderResult.data) {
        triggerHaptic('error');
        setError(orderResult.error || 'Failed to create order');
        return;
      }

      const order = orderResult.data;
      console.log('[CheckoutPage] Order created:', order.id);

      // Step 2: Initiate payment (Requirement 8.1, 8.2)
      console.log('[CheckoutPage] Initiating payment...');
      const paymentResult = await initiateChapaPayment(user.telegramId, order.id);

      if (!paymentResult.success || !paymentResult.data) {
        triggerHaptic('error');
        setError(paymentResult.error || 'Failed to initiate payment');
        return;
      }

      const checkoutUrl = paymentResult.data.checkoutUrl;
      console.log('[CheckoutPage] Payment initiated, redirecting to:', checkoutUrl);

      // Step 3: Redirect to Chapa payment interface (Requirement 8.2)
      triggerHaptic('success');
      window.location.href = checkoutUrl;

    } catch (err) {
      console.error('[CheckoutPage] Error placing order:', err);
      triggerHaptic('error');
      setError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-24 pt-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-48 bg-gray-200 rounded-lg" />
            <div className="h-64 bg-gray-200 rounded-2xl" />
            <div className="h-32 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-xl font-semibold text-gray-900">{t('errors.notAuthenticated')}</div>
        </motion.div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <div className="text-xl font-semibold text-red-600">{error}</div>
          <motion.button
            onClick={() => router.push('/cart')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg"
          >
            Back to Cart
          </motion.button>
        </motion.div>
      </main>
    );
  }

  const grandTotal = cartTotal + deliveryFee;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-24 pt-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <motion.button
            onClick={() => {
              triggerHaptic('light');
              router.push('/cart');
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-white/50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </motion.button>
          <CreditCard className="w-8 h-8 text-indigo-600" />
          <h1 className="text-4xl font-bold text-gray-900">Checkout</h1>
        </motion.div>

        {/* Delivery Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Delivery Location</h2>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span className="font-semibold">
              {user.homeLocation === 'Haramaya_Main' && 'Haramaya Main Campus'}
              {user.homeLocation === 'Harar_Campus' && 'Harar Campus'}
              {user.homeLocation === 'DDU' && 'Dire Dawa University'}
            </span>
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
          </div>
          
          <div className="space-y-3">
            {cartItems.map((item, index) => (
              <div key={item.productId} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.product.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.product.price.toFixed(2)} ETB × {item.quantity}
                  </p>
                </div>
                <p className="font-bold text-gray-900">
                  {(item.product.price * item.quantity).toFixed(2)} ETB
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-900">{cartTotal.toFixed(2)} ETB</span>
            </div>
          </div>
        </motion.div>

        {/* Delivery Fee Breakdown (Requirement 7.5, 16.1-16.7) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Truck className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Delivery Fee Breakdown</h2>
          </div>

          <div className="space-y-4">
            {deliveryBreakdown.map((delivery, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{delivery.shopName}</p>
                    <p className="text-sm text-gray-600">
                      {delivery.shopCity === 'Harar' ? 'Harar' : 'Dire Dawa'} → {' '}
                      {user.homeLocation === 'Haramaya_Main' && 'Haramaya Main'}
                      {user.homeLocation === 'Harar_Campus' && 'Harar Campus'}
                      {user.homeLocation === 'DDU' && 'DDU'}
                    </p>
                  </div>
                  <p className="font-bold text-indigo-600">{delivery.fee} ETB</p>
                </div>
                <p className="text-xs text-gray-500">
                  Estimated delivery: {delivery.estimatedTime}
                </p>
                <div className="mt-2 text-xs text-gray-600">
                  {delivery.items.map((item, idx) => (
                    <span key={idx}>
                      {item.name} ({item.quantity})
                      {idx < delivery.items.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-600">Total Delivery Fee</span>
              <span className="font-semibold text-gray-900">{deliveryFee.toFixed(2)} ETB</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-2xl border border-indigo-200/50 p-6 space-y-4"
        >
          <div className="flex justify-between items-center text-3xl font-bold">
            <span className="text-gray-900">Total</span>
            <span className="text-indigo-600">{grandTotal.toFixed(2)} ETB</span>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>• Payment will be held in escrow until delivery</p>
            <p>• You'll receive a 6-digit OTP when your order arrives</p>
            <p>• Funds are released to the seller only after you verify delivery</p>
          </div>

          <motion.button
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            whileHover={{ scale: isProcessing ? 1 : 1.02 }}
            whileTap={{ scale: isProcessing ? 1 : 0.98 }}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Proceed to Payment
              </>
            )}
          </motion.button>

          <p className="text-xs text-center text-gray-500">
            Powered by Chapa • Secure Payment Gateway
          </p>
        </motion.div>
      </div>
    </main>
  );
}
