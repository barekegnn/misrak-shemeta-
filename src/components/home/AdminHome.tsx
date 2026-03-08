'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Shield, Users, Store, Package, DollarSign, Activity, ShoppingCart } from 'lucide-react';
import { User } from '@/types';
import { Logo } from '@/components/Logo';

interface AdminHomeProps {
  user: User;
}

export function AdminHome({ user }: AdminHomeProps) {
  const router = useRouter();

  const quickActions = [
    {
      icon: Users,
      label: 'Manage Users',
      description: 'View and manage users',
      href: '/admin/users',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: Store,
      label: 'Manage Shops',
      description: 'Oversee all shops',
      href: '/admin/shops',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: Package,
      label: 'Manage Products',
      description: 'Product moderation',
      href: '/admin/products',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      icon: ShoppingCart,
      label: 'Orders',
      description: 'View all orders',
      href: '/admin/orders',
      gradient: 'from-rose-500 to-pink-600',
    },
    {
      icon: DollarSign,
      label: 'Financial',
      description: 'Revenue reports',
      href: '/admin/financial',
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      icon: Activity,
      label: 'Monitoring',
      description: 'System health',
      href: '/admin/monitoring',
      gradient: 'from-orange-500 to-red-600',
    },
  ];

  return (
    <main className="min-h-screen pb-24 bg-gradient-to-br from-slate-50 via-white to-gray-50">
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
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Platform management and oversight
          </p>
        </motion.div>
      </div>

      {/* Admin Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mx-6 mb-8"
      >
        <div className="max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-gray-800 text-white shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-white/70">Administrator</p>
              <p className="font-semibold">ID: {user.telegramId}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="px-6 max-w-6xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Management Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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