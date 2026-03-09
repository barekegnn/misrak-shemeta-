'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { TruckIcon, Package, MapPin, Clock } from 'lucide-react';
import { User } from '@/types';
import { Logo } from '@/components/Logo';

interface RunnerHomeProps {
  user: User;
}

export function RunnerHome({ user }: RunnerHomeProps) {
  const router = useRouter();

  const quickActions = [
    {
      icon: TruckIcon,
      label: 'Active Deliveries',
      description: 'View orders to deliver',
      href: '/runner/orders',
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      icon: Package,
      label: 'Delivery History',
      description: 'Past completed deliveries',
      href: '/runner/orders',
      gradient: 'from-blue-500 to-cyan-600',
    },
  ];

  return (
    <main className="min-h-screen pb-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-6 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <Logo size={80} className="mx-auto drop-shadow-2xl" />
          <h1 className="text-3xl font-bold text-white">
            Welcome, Runner!
          </h1>
          <p className="text-gray-300">
            Deliver orders across Eastern Ethiopia
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
        <div className="max-w-md mx-auto p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <TruckIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Runner Account</p>
              <p className="font-semibold text-white">ID: {user.telegramId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <MapPin className="w-4 h-4 text-purple-400" />
            <span>{user.homeLocation.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="px-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
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
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg hover:shadow-xl hover:bg-white/10 transition-all text-left"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">{action.label}</h3>
              <p className="text-sm text-gray-400">{action.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="px-6 max-w-4xl mx-auto mt-8"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-purple-400" />
              <p className="text-sm text-gray-400">Today</p>
            </div>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-xs text-gray-500">Deliveries</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-pink-400" />
              <p className="text-sm text-gray-400">This Week</p>
            </div>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-xs text-gray-500">Deliveries</p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
