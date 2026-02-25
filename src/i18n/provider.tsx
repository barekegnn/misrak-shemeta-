'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/types';
import { defaultLocale } from './config';

type Translations = Record<string, any>;

interface I18nContextType {
  locale: Language;
  setLocale: (locale: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Language>(defaultLocale);
  const [translations, setTranslations] = useState<Translations>({});

  // Load translations when locale changes
  useEffect(() => {
    async function loadTranslations() {
      try {
        const [common, products, orders, errors] = await Promise.all([
          import(`@/locales/${locale}/common.json`),
          import(`@/locales/${locale}/products.json`),
          import(`@/locales/${locale}/orders.json`),
          import(`@/locales/${locale}/errors.json`),
        ]);

        setTranslations({
          common: common.default,
          products: products.default,
          orders: orders.default,
          errors: errors.default,
        });
      } catch (error) {
        console.error('Failed to load translations:', error);
      }
    }

    loadTranslations();
  }, [locale]);

  const setLocale = (newLocale: Language) => {
    setLocaleState(newLocale);
    // Store preference in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
  };

  // Translation function with parameter substitution
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters in translation
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  };

  // Initialize locale from localStorage or Telegram
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('locale') as Language;
      if (stored && ['en', 'am', 'om'].includes(stored)) {
        setLocaleState(stored);
      }
    }
  }, []);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
