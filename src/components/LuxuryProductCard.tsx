'use client';

import { motion } from 'framer-motion';
import { Product } from '@/types';
import { useI18n } from '@/i18n/provider';
import { useTelegramAuth } from './TelegramAuthProvider';
import { useState } from 'react';
import { ShoppingCart, Package, Sparkles } from 'lucide-react';

interface LuxuryProductCardProps {
  product: Product;
  shopName?: string;
  shopLocation?: string;
  onAddToCart?: (productId: string, quantity: number) => Promise<void>;
  onViewDetails?: (productId: string) => void;
  index?: number;
}

export function LuxuryProductCard({
  product,
  shopName,
  shopLocation,
  onAddToCart,
  onViewDetails,
  index = 0,
}: LuxuryProductCardProps) {
  const { t } = useI18n();
  const { triggerHaptic } = useTelegramAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAddingToCart || isOutOfStock) return;
    
    setIsAddingToCart(true);
    triggerHaptic('medium');
    
    try {
      await onAddToCart?.(product.id, 1);
      triggerHaptic('success');
    } catch (error) {
      triggerHaptic('error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleViewDetails = () => {
    triggerHaptic('light');
    onViewDetails?.(product.id);
  };

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={handleViewDetails}
      className="group cursor-pointer"
    >
      {/* Luxury Card Container */}
      <div className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
        
        {/* Product Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Shimmer Loading Effect */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 shimmer-effect" />
          )}
          
          {!imageError ? (
            <motion.img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ 
                scale: imageLoaded ? 1 : 1.1, 
                opacity: imageLoaded ? 1 : 0 
              }}
              transition={{ duration: 0.6 }}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-16 w-16 text-gray-300" />
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <motion.span 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg"
              >
                {t('products.outOfStock')}
              </motion.span>
            </div>
          )}

          {/* Category Badge - Top Left */}
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-white/95 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-lg border border-gray-200/50">
              {product.category}
            </span>
          </div>

          {/* Low Stock Indicator - Top Right */}
          {isLowStock && !isOutOfStock && (
            <div className="absolute right-3 top-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg"
              >
                {t('products.lowStock')}
              </motion.div>
            </div>
          )}

          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Product Info Section */}
        <div className="p-5 space-y-3">
          {/* Product Name */}
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 min-h-[3.5rem] leading-tight">
            {product.name}
          </h3>

          {/* Shop Info (if provided) */}
          {(shopName || shopLocation) && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <span className="line-clamp-1">
                {shopName}
                {shopName && shopLocation && ' • '}
                {shopLocation}
              </span>
            </div>
          )}

          {/* Price Section */}
          <div className="flex items-end justify-between pt-2">
            <div>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {product.price.toFixed(2)}
                <span className="text-sm font-semibold text-gray-600 ml-1">ETB</span>
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Package className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-xs text-gray-500 font-medium">
                  {product.stock} {t('products.inStock')}
                </p>
              </div>
            </div>
          </div>

          {/* Add to Cart Button - Premium CTA */}
          <motion.button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingToCart}
            whileHover={{ scale: (isOutOfStock || isAddingToCart) ? 1 : 1.02 }}
            whileTap={{ scale: (isOutOfStock || isAddingToCart) ? 1 : 0.98 }}
            className={`
              mt-4 w-full rounded-xl px-6 py-3.5 
              font-semibold text-sm
              transition-all duration-300
              flex items-center justify-center gap-2
              ${(isOutOfStock || isAddingToCart)
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
              }
            `}
          >
            {isAddingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('products.adding')}
              </>
            ) : isOutOfStock ? (
              <>
                <Package className="w-4 h-4" />
                {t('products.outOfStock')}
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                {t('products.addToCart')}
                <Sparkles className="w-3.5 h-3.5 ml-1 opacity-70" />
              </>
            )}
          </motion.button>
        </div>

        {/* Subtle Glow Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.1), transparent 70%)'
          }}
        />
      </div>
    </motion.div>
  );
}
