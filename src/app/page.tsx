'use client';

import { motion } from 'framer-motion';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { HomeLocationSelector } from '@/components/HomeLocationSelector';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { BottomNav } from '@/components/BottomNav';
import { useI18n } from '@/i18n/provider';
import { useState, useEffect } from 'react';
import { Sparkles, MapPin, User } from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useTelegramAuth();
  const { t } = useI18n();
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  useEffect(() => {
    if (user && user.homeLocation === 'Haramaya_Main') {
      setShowLocationSelector(true);
    }
  }, [user]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
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

  if (showLocationSelector) {
    return <HomeLocationSelector onComplete={() => setShowLocationSelector(false)} />;
  }

  return (
    <main className="min-h-screen pb-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      
      {/* Hero Section */}
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
          {/* Logo/Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-2xl shadow-indigo-500/30"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3"
          >
            <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
              {t('common.appName')}
            </h1>
            <p className="text-xl text-gray-600 font-light max-w-md mx-auto">
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
            {['harar', 'direDawa', 'haramayaMain'].map((loc, index) => (
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

      {/* User Profile Card */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mx-6 mb-8"
        >
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-white border border-gray-200 shadow-xl">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-2">
                <p className="text-sm text-gray-500 font-medium">Welcome back!</p>
                <p className="text-lg font-semibold text-gray-900">
                  Telegram ID: {user.telegramId}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span>
                    {user.homeLocation === 'Haramaya_Main' ? t('common.locations.haramayaMain') :
                     user.homeLocation === 'Harar_Campus' ? t('common.locations.hararCampus') :
                     user.homeLocation === 'DDU' ? t('common.locations.ddu') :
                     user.homeLocation}
                  </span>
                </div>
                <div className="inline-flex px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                  {user.role}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <BottomNav />
    </main>
  );
}
