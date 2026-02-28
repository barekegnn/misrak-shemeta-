'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { useI18n } from '@/i18n/provider';
import { getShopById } from '@/app/actions/shop';
import { getProductsByShopId } from '@/app/actions/products';
import { addToCart } from '@/app/actions/cart';
import { LuxuryProductCard } from '@/components/LuxuryProductCard';
import { LuxuryShopSkeleton } from '@/components/LuxuryShopSkeleton';
import { Product } from '@/types';
import { ArrowLeft, MapPin, Phone, CheckCircle2, Package, Sparkles } from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  city: string;
  description?: string;
  contactPhone?: string;
}

// Brand DNA colors matching LuxuryShopCard
const BRAND_COLORS = {
  'Harar': {
    primary: '#FF6B35',
    gradient: 'from-orange-500/20 via-red-500/10 to-transparent',
    glow: 'shadow-orange-500/20',
  },
  'Dire_Dawa': {
    primary: '#4F46E5',
    gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    glow: 'shadow-indigo-500/20',
  },
};

export default function ShopProductsPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.shopId as string;
  const { user, isLoading: authLoading, triggerHaptic } = useTelegramAuth();
  const { t } = useI18n();
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAddToCart = async (productId: string, quantity: number) => {
    if (!user) return;
    
    try {
      const result = await addToCart(user.telegramId, productId, quantity);
      if (result.success) {
        // Show success feedback
        triggerHaptic('success');
        setSuccessMessage('Item added to cart!');
        setTimeout(() => setSuccessMessage(null), 3000); // Hide after 3 seconds
      } else {
        // Show error feedback
        triggerHaptic('error');
        alert(result.error || 'Failed to add to cart');
      }
    } catch (error) {
      triggerHaptic('error');
      alert('Failed to add to cart');
    }
  };

  useEffect(() => {
    async function loadShopAndProducts() {
      if (!user || !shopId) {
        console.log('[ShopProductsPage] Waiting for user or shopId', { user: !!user, shopId });
        return;
      }

      try {
        setIsLoading(true);
        console.log('[ShopProductsPage] Loading shop and products for shopId:', shopId);
        
        // Load shop details
        const shopResult = await getShopById(shopId);
        console.log('[ShopProductsPage] Shop result:', shopResult);
        if (!shopResult.success || !shopResult.data) {
          setError(t('errors.notFound'));
          return;
        }
        setShop(shopResult.data);

        // Load products for this shop
        console.log('[ShopProductsPage] Fetching products for shopId:', shopId);
        const productsResult = await getProductsByShopId(shopId);
        console.log('[ShopProductsPage] Products result:', productsResult);
        if (productsResult.success && productsResult.data) {
          console.log('[ShopProductsPage] Setting', productsResult.data.length, 'products');
          setProducts(productsResult.data);
        } else {
          console.error('[ShopProductsPage] Failed to get products:', productsResult.error);
        }
      } catch (err) {
        console.error('[ShopProductsPage] Error:', err);
        setError(t('errors.generic'));
      } finally {
        setIsLoading(false);
      }
    }

    loadShopAndProducts();
  }, [user, shopId, t]);

  const brandColor = shop ? (BRAND_COLORS[shop.city as keyof typeof BRAND_COLORS] || BRAND_COLORS['Harar']) : BRAND_COLORS['Harar'];

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-20">
        <div className="p-6 space-y-6">
          <LuxuryShopSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <LuxuryShopSkeleton key={i} />
            ))}
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

  if (error || !shop) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="text-xl font-semibold text-red-600">{error || t('errors.notFound')}</div>
          <motion.button
            onClick={() => {
              triggerHaptic('light');
              router.push('/shops');
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg"
          >
            {t('actions.back')}
          </motion.button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-20">
      {/* Success Toast */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 bg-green-500 text-white rounded-xl shadow-2xl flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold">{successMessage}</span>
        </motion.div>
      )}
      
      {/* Luxury Shop Header */}
      <div className="relative overflow-hidden">
        {/* Hero Banner with Brand Color */}
        <div className={`relative h-48 bg-gradient-to-br ${brandColor.gradient}`}>
          {/* Abstract Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id={`header-pattern-${shopId}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="2" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#header-pattern-${shopId})`} />
            </svg>
          </div>

          {/* Back Button */}
          <div className="absolute top-6 left-6 z-10">
            <motion.button
              onClick={() => {
                triggerHaptic('light');
                router.push('/shops');
              }}
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md shadow-lg border border-gray-200/50 font-semibold text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('actions.back')}
            </motion.button>
          </div>

          {/* Verified Badge */}
          <div className="absolute top-6 right-6 z-10">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/90 backdrop-blur-md shadow-lg">
              <CheckCircle2 className="w-4 h-4" style={{ color: brandColor.primary }} />
              <span className="text-xs font-semibold text-gray-900">Verified</span>
            </div>
          </div>
        </div>

        {/* Shop Info Card - Overlapping Hero */}
        <div className="relative -mt-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-8"
          >
            {/* Shop Logo */}
            <div className="flex items-start gap-6">
              <div 
                className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl border-4 border-white flex items-center justify-center flex-shrink-0"
                style={{ boxShadow: `0 8px 32px ${brandColor.primary}20` }}
              >
                <span className="text-3xl font-bold" style={{ color: brandColor.primary }}>
                  {shop.name.charAt(0)}
                </span>
              </div>

              <div className="flex-1 space-y-3">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{shop.name}</h1>
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" style={{ color: brandColor.primary }} />
                    <span className="font-medium">
                      {shop.city === 'Harar' ? t('common.locations.harar') : t('common.locations.direDawa')}
                    </span>
                  </div>
                  
                  {shop.contactPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" style={{ color: brandColor.primary }} />
                      <span>{shop.contactPhone}</span>
                    </div>
                  )}
                </div>

                {shop.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{shop.description}</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Products Section */}
      <div className="px-6 mt-12">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6" style={{ color: brandColor.primary }} />
              <h2 className="text-2xl font-bold text-gray-900">{t('products.title')}</h2>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-gray-200/50">
              <Package className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-900">{products.length} {t('products.items')}</span>
            </div>
          </motion.div>
          
          {products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{t('products.noProducts')}</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <LuxuryProductCard 
                  key={product.id} 
                  product={product}
                  index={index}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
