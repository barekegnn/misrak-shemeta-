'use client';

import { useEffect, useState } from 'react';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { useI18n } from '@/i18n/provider';
import { getShops } from '@/app/actions/shop';
import { LuxuryShopCard } from '@/components/LuxuryShopCard';
import { LuxuryShopSkeleton } from '@/components/LuxuryShopSkeleton';
import { motion } from 'framer-motion';

interface Shop {
  id: string;
  name: string;
  city: string;
  description?: string;
  contactPhone?: string;
}

export default function ShopsPage() {
  const { user, isLoading: authLoading } = useTelegramAuth();
  const { t } = useI18n();
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadShops() {
      if (!user) return;

      try {
        setIsLoading(true);
        const result = await getShops();
        
        if (result.success && result.data) {
          setShops(result.data);
        } else {
          setError(result.error || t('errors.generic'));
        }
      } catch (err) {
        setError(t('errors.generic'));
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadShops();
    }
  }, [user, t]);

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen pb-24 px-4 pt-8 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-3">
            <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-5 w-96 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Shop Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LuxuryShopSkeleton />
            <LuxuryShopSkeleton />
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="text-xl">{t('errors.notAuthenticated')}</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="text-xl text-destructive">{error}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24 px-4 pt-8 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Premium Header with Subtle Animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-3"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            {t('shops.title')}
          </h1>
          <p className="text-lg text-gray-600 font-light">
            {t('shops.subtitle')}
          </p>
        </motion.div>

        {/* Shops Grid */}
        {shops.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-xl text-gray-500 font-light">{t('shops.noShops')}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shops.map((shop, index) => (
              <LuxuryShopCard key={shop.id} shop={shop} index={index} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
