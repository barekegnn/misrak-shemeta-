'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Store, Package, ShoppingCart, Settings, Plus } from 'lucide-react';
import { User } from '@/types';
import { Logo } from '@/components/Logo';

interface MerchantHomeProps {
  user: User;
}

export function MerchantHome({ user }: MerchantHomeProps) {
  const router = useRouter();

  const quickActions = [
    {
      icon: Store,
      label: 'My Shop',
      description: 'Manage your shop',
      href: '/merchant',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Plus,
      label: 'Add Product',
      description: 'List new products',
      href: '/merchant/products/new',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      icon: ShoppingCart,
      label: 'Orders',
      description: 'View shop orders',
      href: '/shop/orders',
      gradient: 'from-rose-500 to-pink-600',
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'Shop settings',
      href: '/merchant/settings',
      gradient: 'from-slate-500 to-gray-600',
    },
  ];

  return (
    <main className="min-h-screen pb-24 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-6 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <Logo size={80} className="mx-auto drop-shadow-2xl" />
          <h1 className="text-3xl font-bold text-gray-900">
            Merchant Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your shop and grow your business
          </p>
        </motion.div>
      </div>

      {/* Merchant Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mx-6 mb-8"
      >
        <div className="max-w-md mx-auto p-6 rounded-2xl bg-white border border-emerald-200 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Merchant Account</p>
              <p className="font-semibold text-gray-900">ID: {user.telegramId}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="px-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(action.href)}
              className="p-6 rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all text-left"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{action.label}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </main>
  );
}