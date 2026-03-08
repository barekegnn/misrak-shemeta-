'use client';

import { motion } from 'framer-motion';
import { Store, MapPin, Star, Sparkles, Crown, Award } from 'lucide-react';
import { Shop } from '@/types';

interface LuxuryShopCardProps {
  shop: Shop & { tier?: 'luxury' | 'premium' | 'standard' };
  onClick?: () => void;
  index?: number;
}

export function LuxuryShopCard({ shop, onClick, index = 0 }: LuxuryShopCardProps) {
  const tier = shop.tier || 'standard';
  const isHarar = shop.city === 'HARAR';
  
  // City-specific styling
  const cityTheme = isHarar ? {
    gradient: 'from-amber-50 via-orange-50 to-amber-50',
    border: 'border-amber-200/60',
    accent: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700 border-amber-300',
    glow: 'shadow-amber-200/50',
  } : {
    gradient: 'from-blue-50 via-cyan-50 to-blue-50',
    border: 'border-blue-200/60',
    accent: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700 border-blue-300',
    glow: 'shadow-blue-200/50',
  };

  // Tier-specific styling
  const tierConfig = {
    luxury: {
      icon: Crown,
      label: 'Luxury',
      cardStyle: 'bg-gradient-to-br from-purple-50/80 via-white to-pink-50/80',
      borderStyle: 'border-2 border-purple-200/50',
      shadowStyle: 'shadow-2xl hover:shadow-purple-300/40',
      badgeStyle: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-300',
    },
    premium: {
      icon: Sparkles,
      label: 'Premium',
      cardStyle: 'bg-gradient-to-br from-slate-50/80 via-white to-slate-50/80',
      borderStyle: 'border-2 border-slate-200/50',
      shadowStyle: 'shadow-xl hover:shadow-slate-300/40',
      badgeStyle: 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border-slate-300',
    },
    standard: {
      icon: Award,
      label: 'Quality',
      cardStyle: 'bg-gradient-to-br from-gray-50/80 via-white to-gray-50/80',
      borderStyle: 'border border-gray-200/50',
      shadowStyle: 'shadow-lg hover:shadow-gray-300/40',
      badgeStyle: 'bg-gray-100 text-gray-700 border-gray-300',
    },
  };

  const config = tierConfig[tier];
  const TierIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className={`
        relative overflow-hidden rounded-3xl backdrop-blur-xl
        ${config.cardStyle}
        ${config.borderStyle}
        ${config.shadowStyle}
        transition-all duration-500
      `}>
        
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className={`absolute inset-0 bg-gradient-to-br ${cityTheme.gradient}`} />
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`pattern-${shop.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#pattern-${shop.id})`} />
          </svg>
        </div>

        {/* Content Container */}
        <div className="relative p-8">
          
          {/* Header Section */}
          <div className="flex items-start justify-between mb-6">
            
            {/* Shop Icon with City Theme */}
            <motion.div 
              className={`
                relative p-4 rounded-2xl bg-gradient-to-br ${cityTheme.gradient}
                ${cityTheme.border} border-2
                group-hover:scale-110 transition-transform duration-300
              `}
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Store className={`w-8 h-8 ${cityTheme.accent}`} strokeWidth={2.5} />
              
              {/* Glow effect */}
              <div className={`absolute inset-0 rounded-2xl ${cityTheme.glow} blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />
            </motion.div>

            {/* Tier Badge */}
            <div className={`
              flex items-center gap-2 px-4 py-2 rounded-full border
              ${config.badgeStyle}
              font-semibold text-sm tracking-wide
              shadow-sm
            `}>
              <TierIcon className="w-4 h-4" />
              <span>{config.label}</span>
            </div>
          </div>

          {/* Shop Name */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
            {shop.name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
            {shop.description}
          </p>

          {/* Location Badge */}
          <div className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-full border
            ${cityTheme.badge}
            font-medium text-sm
          `}>
            <MapPin className="w-4 h-4" />
            <span>{isHarar ? 'Harar' : 'Dire Dawa'}</span>
          </div>

          {/* Hover Effect Overlay */}
          <motion.div
            className={`
              absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r
              ${isHarar ? 'from-amber-400 via-orange-500 to-amber-400' : 'from-blue-400 via-cyan-500 to-blue-400'}
              opacity-0 group-hover:opacity-100 transition-opacity duration-300
            `}
          />
        </div>

        {/* Premium Shine Effect */}
        {tier === 'luxury' && (
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
