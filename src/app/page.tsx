'use client';

import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { HomeLocationSelector } from '@/components/HomeLocationSelector';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/i18n/provider';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user, isLoading } = useTelegramAuth();
  const { t } = useI18n();
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  useEffect(() => {
    // Show location selector if user exists but hasn't set a location yet
    // (default location is Haramaya_Main, so we check if it's still default)
    if (user && user.homeLocation === 'Haramaya_Main') {
      // In a real app, you'd check if this is their first login
      // For now, we'll show it if they have the default location
      setShowLocationSelector(true);
    }
  }, [user]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="text-xl">{t('common.loading')}</div>
      </main>
    );
  }

  if (showLocationSelector) {
    return <HomeLocationSelector onComplete={() => setShowLocationSelector(false)} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{t('appName')}</h1>
        <p className="text-xl text-muted-foreground">{t('appDescription')}</p>
        <div className="flex gap-2 justify-center text-sm text-muted-foreground">
          <span>{t('common.locations.harar')}</span>
          <span>•</span>
          <span>{t('common.locations.direDawa')}</span>
          <span>•</span>
          <span>{t('common.locations.haramayaMain')}</span>
        </div>
        
        {user && (
          <div className="mt-8 p-4 bg-card rounded-lg border">
            <p className="text-sm text-muted-foreground">Welcome!</p>
            <p className="font-medium">Telegram ID: {user.telegramId}</p>
            <p className="text-sm">Location: {t(`common.locations.${user.homeLocation.toLowerCase().replace('_', '')}`)}</p>
            <p className="text-sm">Role: {user.role}</p>
          </div>
        )}
      </div>
    </main>
  );
}
