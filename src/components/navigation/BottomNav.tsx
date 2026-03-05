'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ShoppingCart, Store, User, LayoutDashboard, Users, Building2, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface BottomNavProps {
  role: 'buyer' | 'merchant' | 'admin' | 'runner';
  cartCount?: number;
}

export function BottomNav({ role, cartCount = 0 }: BottomNavProps) {
  const pathname = usePathname();

  // Role-based navigation items
  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'buyer':
        return [
          { href: '/', label: 'Home', icon: Home },
          { href: '/shops', label: 'Shops', icon: Store },
          { href: '/cart', label: 'Cart', icon: ShoppingCart, badge: cartCount },
          { href: '/orders', label: 'Orders', icon: Package },
          { href: '/profile', label: 'Profile', icon: User },
        ];
      
      case 'merchant':
        return [
          { href: '/merchant', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/merchant/products', label: 'Products', icon: Store },
          { href: '/merchant/orders', label: 'Orders', icon: Package },
          { href: '/merchant/balance', label: 'Balance', icon: Building2 },
          { href: '/profile', label: 'Profile', icon: User },
        ];
      
      case 'admin':
        return [
          { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/admin/users', label: 'Users', icon: Users },
          { href: '/admin/shops', label: 'Shops', icon: Building2 },
          { href: '/admin/orders', label: 'Orders', icon: Package },
          { href: '/admin/more', label: 'More', icon: MoreHorizontal },
        ];
      
      case 'runner':
        return [
          { href: '/runner', label: 'Deliveries', icon: Package },
          { href: '/runner/history', label: 'History', icon: LayoutDashboard },
          { href: '/profile', label: 'Profile', icon: User },
        ];
      
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  // Check if current path is active
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      aria-label="Mobile navigation"
    >
      {/* Background with premium glassmorphism effect */}
      <div className="relative bg-white/98 backdrop-blur-2xl border-t border-gray-200/50 shadow-2xl">
        {/* Gradient accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50/20 to-transparent pointer-events-none" />
        
        {/* Navigation items container */}
        <div className="relative flex items-center justify-around h-20 px-2 safe-area-inset-bottom">
          {navItems.map((item) => {
            const active = isActive(item.href);
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
                  className={cn(
                    "relative flex flex-col items-center justify-center w-full h-full group",
                    "min-w-[50px] min-h-[50px]", // Touch-friendly minimum size
                    "transition-all duration-200"
                  )}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                >
                  {/* Active indicator pill at top */}
                  {active && (
                    <motion.div
                      layoutId="bottomNavActiveIndicator"
                      className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Icon container with background */}
                  <motion.div
                    animate={active ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={cn(
                      "relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
                      active 
                        ? "bg-gradient-to-br from-blue-100 to-indigo-100 shadow-md" 
                        : "group-hover:bg-gray-100"
                    )}
                  >
                    <motion.div
                      animate={active ? { rotate: 0 } : { rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Icon 
                        className={cn(
                          "w-5 h-5 transition-all duration-200",
                          active 
                            ? "text-blue-600 scale-110" 
                            : "text-gray-600 group-hover:text-blue-600"
                        )}
                        strokeWidth={active ? 2.5 : 2}
                        aria-hidden="true"
                      />
                    </motion.div>
                    
                    {/* Badge for cart count or notifications */}
                    {item.badge !== undefined && item.badge > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[10px] font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg"
                        aria-label={`${item.badge} items`}
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </motion.span>
                    )}
                  </motion.div>

                  {/* Label */}
                  <motion.span 
                    animate={active ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={cn(
                      "mt-1 text-[10px] font-semibold transition-all duration-200",
                      active 
                        ? "text-blue-600" 
                        : "text-gray-600 group-hover:text-gray-800"
                    )}
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
