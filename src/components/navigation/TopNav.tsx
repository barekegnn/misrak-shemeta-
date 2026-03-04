'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, ChevronDown, LogOut, Settings, Package, Store, LayoutDashboard, Users, Building2, DollarSign, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TopNavProps {
  role: 'buyer' | 'merchant' | 'admin' | 'runner';
  cartCount?: number;
  userName?: string;
}

export function TopNav({ role, cartCount = 0, userName = 'User' }: TopNavProps) {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Role-based navigation links
  const getNavLinks = () => {
    switch (role) {
      case 'buyer':
        return [
          { href: '/products', label: 'Browse Products', icon: Store },
          { href: '/orders', label: 'My Orders', icon: Package },
        ];
      
      case 'merchant':
        return [
          { href: '/merchant', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/merchant/products', label: 'Products', icon: Store },
          { href: '/merchant/orders', label: 'Orders', icon: Package },
          { href: '/merchant/balance', label: 'Balance', icon: DollarSign },
        ];
      
      case 'admin':
        return [
          { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/admin/users', label: 'Users', icon: Users },
          { href: '/admin/shops', label: 'Shops', icon: Building2 },
          { href: '/admin/products', label: 'Products', icon: Store },
          { href: '/admin/orders', label: 'Orders', icon: Package },
          { href: '/admin/financial', label: 'Financial', icon: DollarSign },
          { href: '/admin/monitoring', label: 'Monitoring', icon: Activity },
        ];
      
      case 'runner':
        return [
          { href: '/runner', label: 'Active Deliveries', icon: Package },
          { href: '/runner/history', label: 'History', icon: LayoutDashboard },
        ];
      
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const isActive = (href: string) => {
    if (href === '/' || href === '/merchant' || href === '/admin' || href === '/runner') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="hidden md:block sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 group"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:shadow-xl transition-shadow"
            >
              <span className="text-white font-bold text-lg">M</span>
            </motion.div>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Misrak Shemeta
              </span>
              <span className="text-xs text-gray-500 font-medium">Marketplace</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              
              return (
                <motion.div key={link.href} whileHover={{ y: -2 }}>
                  <Link
                    href={link.href}
                    className={cn(
                      "relative flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200",
                      "group",
                      active 
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 font-semibold shadow-md" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4 transition-transform",
                      active && "group-hover:scale-110"
                    )} />
                    <span className="text-sm">{link.label}</span>
                    
                    {/* Active indicator */}
                    {active && (
                      <motion.div
                        layoutId="topNavActiveIndicator"
                        className="absolute -bottom-1 left-4 right-4 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Right side: Cart + Profile */}
          <div className="flex items-center space-x-3">
            {/* Cart (only for buyers) */}
            {role === 'buyer' && (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  href="/cart"
                  className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors group"
                  aria-label={`Shopping cart with ${cartCount} items`}
                >
                  <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg"
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors group"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{userName}</span>
                <ChevronDown className={cn(
                  "w-4 h-4 text-gray-500 transition-transform",
                  isProfileOpen && "rotate-180"
                )} />
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 backdrop-blur-sm"
                  >
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 px-4 py-2.5 hover:bg-blue-50 transition-colors group"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                      <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">Profile</span>
                    </Link>
                    
                    <Link
                      href="/settings"
                      className="flex items-center space-x-3 px-4 py-2.5 hover:bg-blue-50 transition-colors group"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                      <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">Settings</span>
                    </Link>
                    
                    <div className="border-t border-gray-200 my-2" />
                    
                    <button
                      className="flex items-center space-x-3 px-4 py-2.5 w-full hover:bg-red-50 transition-colors text-left group"
                      onClick={() => {
                        setIsProfileOpen(false);
                        // Handle logout
                      }}
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600 group-hover:text-red-700 transition-colors font-medium">Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
