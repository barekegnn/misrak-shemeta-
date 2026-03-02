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
          { href: '/products', label: 'Browse', icon: Store },
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
      {/* Background with glassmorphism effect */}
      <div className="relative bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50/30 to-transparent pointer-events-none" />
        
        {/* Navigation items container */}
        <div className="relative flex items-center justify-around h-16 px-2 safe-area-inset-bottom">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 h-full group",
                  "min-w-[44px] min-h-[44px]", // Touch-friendly minimum size
                  "transition-all duration-200"
                )}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                {/* Active indicator line at top */}
                {active && (
                  <motion.div
                    layoutId="bottomNavActiveIndicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Icon container */}
                <div className="relative flex items-center justify-center">
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-colors duration-200",
                      active 
                        ? "text-blue-600" 
                        : "text-gray-500 group-hover:text-gray-700"
                    )}
                    strokeWidth={active ? 2.5 : 2}
                    aria-hidden="true"
                  />
                  
                  {/* Badge for cart count or notifications */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full"
                      aria-label={`${item.badge} items`}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </motion.span>
                  )}
                </div>

                {/* Label */}
                <span 
                  className={cn(
                    "mt-0.5 text-[11px] font-medium transition-colors duration-200",
                    active 
                      ? "text-blue-600" 
                      : "text-gray-600 group-hover:text-gray-800"
                  )}
                >
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
