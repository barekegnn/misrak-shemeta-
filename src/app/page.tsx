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
import { WelcomePage } from '@/components/home/WelcomePage';

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
    <>
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      <WelcomePage />
      <BottomNav />
    </>
  );
}
