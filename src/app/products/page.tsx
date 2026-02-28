'use client';

import { ProductCatalog } from '@/components/ProductCatalog';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { useI18n } from '@/i18n/provider';

export default function ProductsPage() {
  const { user, isLoading } = useTelegramAuth();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="text-xl">{t('common.loading')}</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="text-xl">{t('errors.notAuthenticated')}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-20">
      <ProductCatalog />
    </main>
  );
}
