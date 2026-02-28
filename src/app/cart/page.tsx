'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { useI18n } from '@/i18n/provider';
import { getCart, updateCartItem, removeFromCart, calculateCartTotal } from '@/app/actions/cart';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react';
import type { CartItem, Product } from '@/types';

interface EnrichedCartItem extends CartItem {
  product: Product;
}

export default function CartPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, triggerHaptic } = useTelegramAuth();
  const { t } = useI18n();
  
  const [cartItems, setCartItems] = useState<EnrichedCartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadCart() {
      if (!user) {
        console.log('[CartPage] Waiting for user');
        return;
      }

      try {
        setIsLoading(true);
        console.log('[CartPage] Loading cart for user:', user.telegramId);
        
        // Load cart
        const cartResult = await getCart(user.telegramId);
        console.log('[CartPage] Cart result:', cartResult);
        
        if (cartResult.success && cartResult.data) {
          setCartItems(cartResult.data.enrichedItems);
          
          // Calculate total
          const totalResult = await calculateCartTotal(user.telegramId);
          if (totalResult.success && totalResult.data !== undefined) {
            setCartTotal(totalResult.data);
          }
        } else {
          setError(cartResult.error || t('errors.generic'));
        }
      } catch (err) {
        console.error('[CartPage] Error:', err);
        setError(t('errors.generic'));
      } finally {
        setIsLoading(false);
      }
    }

    loadCart();
  }, [user, t]);

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (!user || newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set(prev).add(productId));
    triggerHaptic('light');
    
    try {
      const result = await updateCartItem(user.telegramId, productId, newQuantity);
      if (result.success) {
        // Update local state
        setCartItems(prev => 
          prev.map(item => 
            item.productId === productId 
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
        
        // Recalculate total
        const totalResult = await calculateCartTotal(user.telegramId);
        if (totalResult.success && totalResult.data !== undefined) {
          setCartTotal(totalResult.data);
        }
        
        triggerHaptic('success');
      } else {
        triggerHaptic('error');
        alert(result.error || 'Failed to update quantity');
      }
    } catch (error) {
      triggerHaptic('error');
      alert('Failed to update quantity');
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!user) return;
    
    setUpdatingItems(prev => new Set(prev).add(productId));
    triggerHaptic('medium');
    
    try {
      const result = await removeFromCart(user.telegramId, productId);
      if (result.success) {
        // Update local state
        setCartItems(prev => prev.filter(item => item.productId !== productId));
        
        // Recalculate total
        const totalResult = await calculateCartTotal(user.telegramId);
        if (totalResult.success && totalResult.data !== undefined) {
          setCartTotal(totalResult.data);
        }
        
        triggerHaptic('success');
      } else {
        triggerHaptic('error');
        alert(result.error || 'Failed to remove item');
      }
    } catch (error) {
      triggerHaptic('error');
      alert('Failed to remove item');
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleCheckout = () => {
    triggerHaptic('medium');
    router.push('/checkout');
  };

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-24 pt-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-48 bg-gray-200 rounded-lg" />
            <div className="h-32 bg-gray-200 rounded-2xl" />
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
          <div className="text-xl font-semibold text-red-600">{error}</div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-24 pt-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <ShoppingCart className="w-8 h-8 text-indigo-600" />
          <h1 className="text-4xl font-bold text-gray-900">{t('navigation.cart')}</h1>
        </motion.div>

        {/* Empty Cart */}
        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-6">Your cart is empty</p>
            <motion.button
              onClick={() => {
                triggerHaptic('light');
                router.push('/shops');
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg"
            >
              Browse Shops
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.product.price.toFixed(2)} ETB
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Stock: {item.product.stock}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <motion.button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updatingItems.has(item.productId)}
                          whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4 text-gray-700" />
                        </motion.button>
                        
                        <span className="w-8 text-center font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        
                        <motion.button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock || updatingItems.has(item.productId)}
                          whileTap={{ scale: 0.9 }}
                          className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4 text-gray-700" />
                        </motion.button>
                      </div>

                      {/* Remove Button */}
                      <motion.button
                        onClick={() => handleRemoveItem(item.productId)}
                        disabled={updatingItems.has(item.productId)}
                        whileTap={{ scale: 0.9 }}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>

                      {/* Item Total */}
                      <p className="font-bold text-lg text-gray-900">
                        {(item.product.price * item.quantity).toFixed(2)} ETB
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Cart Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: cartItems.length * 0.05 + 0.1 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-6 space-y-4"
            >
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">{cartTotal.toFixed(2)} ETB</span>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Delivery fee</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-indigo-600">{cartTotal.toFixed(2)} ETB</span>
                </div>
              </div>

              <motion.button
                onClick={handleCheckout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </>
        )}
      </div>
    </main>
  );
}
