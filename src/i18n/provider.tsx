'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/types';
import { defaultLocale } from './config';

type Translations = Record<string, any>;

interface I18nContextType {
  locale: Language;
  setLocale: (locale: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Language>(defaultLocale);
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations when locale changes
  useEffect(() => {
    async function loadTranslations() {
      setIsLoading(true);
      try {
        const [common, products, orders, errors, payment] = await Promise.all([
          import(`@/locales/${locale}/common.json`),
          import(`@/locales/${locale}/products.json`),
          import(`@/locales/${locale}/orders.json`),
          import(`@/locales/${locale}/errors.json`),
          import(`@/locales/${locale}/payment.json`),
        ]);

        setTranslations({
          common: common.default,
          products: products.default,
          orders: orders.default,
          errors: errors.default,
          payment: payment.default,
        });
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        setIsLoading(false);
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

  // Translation function with parameter substitution and fallback
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // Return user-friendly fallback instead of raw key
        return getFallbackText(key);
      }
    }

    if (typeof value !== 'string') {
      return getFallbackText(key);
    }

    // Replace parameters in translation
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  };

  // Fallback text for common keys while translations load
  const getFallbackText = (key: string): string => {
    const fallbacks: Record<string, string> = {
      // Common
      'common.loading': 'Loading...',
      'common.appName': 'Misrak Shemeta',
      'common.appDescription': 'Eastern Ethiopia Marketplace',
      'common.error': 'An error occurred',
      'common.success': 'Success',
      'common.noResults': 'No results found',
      'common.selectLanguage': 'Select Language',
      'common.tryAgain': 'Try Again',
      'common.remove': 'Remove',
      'common.increase': 'Increase',
      'common.decrease': 'Decrease',
      
      // Actions
      'actions.save': 'Save',
      'actions.cancel': 'Cancel',
      'actions.delete': 'Delete',
      'actions.edit': 'Edit',
      'actions.submit': 'Submit',
      'actions.confirm': 'Confirm',
      'actions.back': 'Back',
      'actions.next': 'Next',
      'actions.close': 'Close',
      'actions.search': 'Search',
      'actions.continue': 'Continue',
      'actions.loading': 'Loading...',
      'actions.add': 'Add',
      'actions.remove': 'Remove',
      'actions.update': 'Update',
      'actions.create': 'Create',
      'actions.view': 'View',
      
      // Navigation
      'navigation.home': 'Home',
      'navigation.shops': 'Shops',
      'navigation.products': 'Products',
      'navigation.cart': 'Cart',
      'navigation.orders': 'Orders',
      'navigation.profile': 'Profile',
      'navigation.dashboard': 'Dashboard',
      
      // Products
      'products.addToCart': 'Add to Cart',
      'products.outOfStock': 'Out of Stock',
      'products.title': 'Products',
      'products.noProducts': 'No products available',
      'products.adding': 'Adding...',
      'products.lowStock': 'Low Stock',
      'products.inStock': 'in stock',
      'products.stock': 'Stock',
      'products.items': 'items',
      'products.search.placeholder': 'Search products...',
      'products.search.noResults': 'No products found',
      
      // Shops
      'shops.title': 'Shops',
      'shops.subtitle': 'Browse shops available for delivery to your location',
      'shops.noShops': 'No shops available',
      'shops.viewProducts': 'View Products',
      
      // Payment
      'payment.payNow': 'Pay Now',
      'payment.processing': 'Processing...',
      'payment.securePayment': 'Secure payment powered by Chapa',
      'payment.sandboxMode': 'Sandbox Mode',
      'payment.sandboxDescription': 'This is a test payment. No real money will be charged.',
      
      // Errors
      'errors.generic': 'Something went wrong',
      'errors.notAuthenticated': 'Please log in to continue',
      'errors.notFound': 'Not found',
      'errors.paymentFailed': 'Payment failed. Please try again.',
      'errors.validation.required': 'This field is required',
      'errors.validation.maxLength': 'Maximum length exceeded',
    };
    
    // Return fallback or extract last part of key as readable text
    if (fallbacks[key]) {
      return fallbacks[key];
    }
    
    // Convert key to readable text (e.g., "actions.loading" -> "Loading")
    const parts = key.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/([A-Z])/g, ' $1');
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
    <I18nContext.Provider value={{ locale, setLocale, t, isLoading }}>
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
