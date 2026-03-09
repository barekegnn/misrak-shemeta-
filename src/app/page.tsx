'use client';

import { motion } from 'framer-motion';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { HomeLocationSelector } from '@/components/HomeLocationSelector';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { BottomNav } from '@/components/BottomNav';
import { useI18n } from '@/i18n/provider';
import { useState, useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { StudentHome } from '@/components/home/StudentHome';
import { MerchantHome } from '@/components/home/MerchantHome';
import { AdminHome } from '@/components/home/AdminHome';
import { RunnerHome } from '@/components/home/RunnerHome';

export default function Home() {
  const { user, isLoading } = useTelegramAuth();
  const { t } = useI18n();
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  useEffect(() => {
    // Show location selector if user exists but hasn't selected a proper location
    if (user && user.homeLocation === 'Haramaya_Main') {
      setShowLocationSelector(true);
    } else {
      setShowLocationSelector(false);
    }
  }, [user]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          {/* Logo in loading state - responsive */}
          <div className="mx-auto">
            <Logo size={64} className="sm:hidden" />
            <Logo size={80} className="hidden sm:block" />
          </div>
          <div className="w-16 h-16 mx-auto">
            <svg className="animate-spin text-indigo-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-xl text-gray-600">{t('common.loading')}</p>
        </motion.div>
      </main>
    );
  }

  // Show location selector FIRST if user hasn't selected their location
  if (showLocationSelector || (user && user.homeLocation === 'Haramaya_Main')) {
    return <HomeLocationSelector onComplete={() => setShowLocationSelector(false)} />;
  }

  // Show role-specific home page
  if (user) {
    return (
      <>
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>
        {user.role === 'ADMIN' && <AdminHome user={user} />}
        {user.role === 'MERCHANT' && <MerchantHome user={user} />}
        {user.role === 'RUNNER' && <RunnerHome user={user} />}
        {user.role === 'STUDENT' && <StudentHome user={user} />}
        <BottomNav />
      </>
    );
  }

  return (
    <main className="min-h-screen pb-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      
      {/* Hero Section - Generic landing for non-authenticated users */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="2" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-pattern)" />
          </svg>
        </div>

        <div className="relative px-6 pt-20 pb-16 text-center space-y-6">
          {/* Logo - Responsive sizing for mobile and desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="inline-flex items-center justify-center"
          >
            <Logo size={96} className="drop-shadow-2xl sm:hidden" />
            <Logo size={112} className="drop-shadow-2xl hidden sm:block md:hidden" />
            <Logo size={128} className="drop-shadow-2xl hidden md:block" />
          </motion.div>

          {/* Title - Responsive text sizing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              {t('common.appName')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-light max-w-md mx-auto px-4 sm:px-0">
              {t('common.appDescription')}
            </p>
          </motion.div>

          {/* Location Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-3 justify-center max-w-lg mx-auto"
          >
            {['harar', 'direDawa', 'haramayaMain'].map((loc) => (
              <span
                key={loc}
                className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-700 shadow-sm"
              >
                {t(`common.locations.${loc}`)}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
