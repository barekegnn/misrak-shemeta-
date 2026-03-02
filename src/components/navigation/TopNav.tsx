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
    <nav className="hidden md:block sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Misrak Shemeta
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200",
                    "hover:bg-gray-100",
                    active && "text-blue-600 font-medium"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  
                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="topNavActiveIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side: Cart + Profile */}
          <div className="flex items-center space-x-4">
            {/* Cart (only for buyers) */}
            {role === 'buyer' && (
              <Link
                href="/cart"
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={`Shopping cart with ${cartCount} items`}
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-xs font-bold text-white bg-red-500 rounded-full"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </Link>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{userName}</span>
                <ChevronDown className={cn(
                  "w-4 h-4 text-gray-500 transition-transform",
                  isProfileOpen && "rotate-180"
                )} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                  >
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Profile</span>
                    </Link>
                    
                    <Link
                      href="/settings"
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Settings</span>
                    </Link>
                    
                    <div className="border-t border-gray-200 my-2" />
                    
                    <button
                      className="flex items-center space-x-3 px-4 py-2 w-full hover:bg-gray-50 transition-colors text-left"
                      onClick={() => {
                        setIsProfileOpen(false);
                        // Handle logout
                      }}
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">Logout</span>
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
