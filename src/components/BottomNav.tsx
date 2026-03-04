'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Store, ShoppingCart, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/shops', label: 'Shops', icon: Store },
    { href: '/cart', label: 'Cart', icon: ShoppingCart },
    { href: '/orders', label: 'Orders', icon: Package },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Premium Glassmorphism Background */}
      <div className="relative bg-white/98 backdrop-blur-2xl border-t border-gray-200/50 shadow-2xl">
        {/* Gradient accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50/20 to-transparent pointer-events-none" />
        
        <div className="relative flex items-center justify-around h-20 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <motion.div
                key={item.href}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 flex flex-col items-center justify-center h-full"
              >
                <Link
                  href={item.href}
                  className="relative flex flex-col items-center justify-center w-full h-full group"
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Icon Container */}
                  <motion.div
                    animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`
                      relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-br from-blue-100 to-indigo-100 shadow-md' 
                        : 'group-hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon 
                      className={`w-5 h-5 transition-all ${isActive ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'}`}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    
                    {/* Glow Effect */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 rounded-xl bg-blue-500/20 blur-xl"
                      />
                    )}
                  </motion.div>

                  {/* Label */}
                  <motion.span
                    animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`
                      mt-1 text-[10px] font-semibold transition-colors
                      ${isActive ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'}
                    `}
                  >
                    {item.label}
                  </motion.span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
