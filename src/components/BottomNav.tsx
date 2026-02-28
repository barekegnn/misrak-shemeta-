'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/i18n/provider';
import { Home, Store, ShoppingCart, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    { href: '/', label: t('navigation.home'), icon: Home },
    { href: '/shops', label: t('navigation.shops'), icon: Store },
    { href: '/cart', label: t('navigation.cart'), icon: ShoppingCart },
    { href: '/orders', label: t('navigation.orders'), icon: Package },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Glassmorphism Background */}
      <div className="relative bg-white/80 backdrop-blur-xl border-t border-gray-200 shadow-2xl">
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none" />
        
        <div className="relative flex items-center justify-around h-20 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center flex-1 h-full group"
              >
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-x-2 top-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Icon Container */}
                <div className={`
                  relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30' 
                    : 'group-hover:bg-gray-100'
                  }
                `}>
                  <Icon 
                    className={`w-6 h-6 transition-colors ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  
                  {/* Glow Effect */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 rounded-xl bg-indigo-500/20 blur-xl"
                    />
                  )}
                </div>

                {/* Label */}
                <span className={`
                  mt-1 text-xs font-medium transition-colors
                  ${isActive ? 'text-indigo-600' : 'text-gray-600 group-hover:text-indigo-600'}
                `}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
