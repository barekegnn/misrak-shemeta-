'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Store, Package, MapPin } from 'lucide-react';
import { User } from '@/types';
import { Logo } from '@/components/Logo';

interface StudentHomeProps {
  user: User;
}

export function StudentHome({ user }: StudentHomeProps) {
  const router = useRouter();

  const quickActions = [
    {
      icon: Store,
      label: 'Browse Shops',
      description: 'Explore local shops',
      href: '/shops',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: ShoppingBag,
      label: 'View Products',
      description: 'Find what you need',
      href: '/products',
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      icon: Package,
      label: 'My Orders',
      description: 'Track your purchases',
      href: '/orders',
      gradient: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <main className="min-h-screen pb-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
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
            Welcome Back!
          </h1>
          <p className="text-gray-600">
            Shop from local merchants in Eastern Ethiopia
          </p>
        </motion.div>
      </div>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mx-6 mb-8"
      >
        <div className="max-w-md mx-auto p-6 rounded-2xl bg-white border border-gray-200 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Student Account</p>
              <p className="font-semibold text-gray-900">ID: {user.telegramId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>{user.homeLocation.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="px-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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