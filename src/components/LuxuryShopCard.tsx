'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import { useI18n } from '@/i18n/provider';
import { useTelegramAuth } from './TelegramAuthProvider';

interface Shop {
  id: string;
  name: string;
  city: string;
  description?: string;
  contactPhone?: string;
}

interface LuxuryShopCardProps {
  shop: Shop;
  index: number;
}

// Brand DNA: Each shop gets a unique color palette
const BRAND_COLORS = {
  'Harar': {
    primary: '#FF6B35',
    gradient: 'from-orange-500/20 via-red-500/10 to-transparent',
    glow: 'shadow-orange-500/20',
    border: 'border-orange-500/30',
  },
  'Dire_Dawa': {
    primary: '#4F46E5',
    gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    glow: 'shadow-indigo-500/20',
    border: 'border-indigo-500/30',
  },
};

export function LuxuryShopCard({ shop, index }: LuxuryShopCardProps) {
  const { t } = useI18n();
  const { triggerHaptic } = useTelegramAuth();
  
  const brandColor = BRAND_COLORS[shop.city as keyof typeof BRAND_COLORS] || BRAND_COLORS['Harar'];

  const handleTap = () => {
    triggerHaptic('medium');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1] // Custom easing for premium feel
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className="group"
    >
      <Link
        href={`/shops/${shop.id}`}
        onClick={handleTap}
        className="block"
      >
        {/* Luxury Card Container with Glassmorphism */}
        <div className={`
          relative overflow-hidden rounded-2xl
          bg-gradient-to-br ${brandColor.gradient}
          backdrop-blur-xl
          border ${brandColor.border}
          shadow-2xl ${brandColor.glow}
          transition-all duration-300
          group-hover:shadow-3xl group-hover:${brandColor.glow}
        `}>
          {/* Hero Banner Area */}
          <div className="relative h-32 overflow-hidden">
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${brandColor.gradient} opacity-60`} />
            
            {/* Abstract Pattern (Premium Touch) */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id={`pattern-${shop.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="2" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#pattern-${shop.id})`} />
              </svg>
            </div>

            {/* Verified Badge - Top Right */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-lg">
              <CheckCircle2 className="w-4 h-4" style={{ color: brandColor.primary }} />
              <span className="text-xs font-semibold text-gray-900">Verified</span>
            </div>
          </div>

          {/* Shop Identity Card */}
          <div className="relative p-6 bg-white/80 backdrop-blur-md">
            {/* Shop Logo Placeholder (Premium Circle) */}
            <div className="absolute -top-10 left-6">
              <div 
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl border-4 border-white flex items-center justify-center"
                style={{ 
                  boxShadow: `0 8px 32px ${brandColor.primary}20` 
                }}
              >
                <span 
                  className="text-2xl font-bold"
                  style={{ color: brandColor.primary }}
                >
                  {shop.name.charAt(0)}
                </span>
              </div>
            </div>

            {/* Content Area with Premium Spacing */}
            <div className="mt-12 space-y-4">
              {/* Shop Name - Bold & Authoritative */}
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">
                {shop.name}
              </h3>

              {/* Location & Contact - Elegant & Minimal */}
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

              {/* Description (if available) */}
              {shop.description && (
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                  {shop.description}
                </p>
              )}

              {/* CTA Button - Premium & Magnetic */}
              <div className="pt-4">
                <div 
                  className="flex items-center justify-between px-6 py-3 rounded-xl transition-all duration-300 group-hover:translate-x-1"
                  style={{ 
                    backgroundColor: `${brandColor.primary}10`,
                    borderLeft: `3px solid ${brandColor.primary}`
                  }}
                >
                  <span 
                    className="font-semibold text-sm"
                    style={{ color: brandColor.primary }}
                  >
                    {t('shops.viewProducts')}
                  </span>
                  <ArrowRight 
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                    style={{ color: brandColor.primary }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subtle Glow Effect on Hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${brandColor.primary}15, transparent 70%)`
            }}
          />
        </div>
      </Link>
    </motion.div>
  );
}
