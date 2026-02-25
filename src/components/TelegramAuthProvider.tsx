'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, TelegramWebApp } from '@/types';

interface TelegramAuthContextType {
  user: User | null;
  telegramUser: any | null;
  isLoading: boolean;
  webApp: TelegramWebApp | null;
  triggerHaptic: (style: 'light' | 'medium' | 'heavy') => void;
  viewportHeight: number;
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

// Declare Telegram WebApp global
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function TelegramAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [telegramUser, setTelegramUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    // Initialize Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setWebApp(tg);
      
      // Notify Telegram that the Mini App is ready
      tg.ready();

      // Expand to full viewport height (Requirement 21.3)
      tg.expand?.();

      // Set initial viewport height
      setViewportHeight(tg.viewportHeight || window.innerHeight);

      // Listen for viewport changes (Requirement 21.3)
      const handleViewportChanged = () => {
        setViewportHeight(tg.viewportHeight || window.innerHeight);
      };

      // Telegram WebApp viewport change event
      if (tg.onEvent) {
        tg.onEvent('viewportChanged', handleViewportChanged);
      }

      // Get Telegram user data
      const tgUser = tg.initDataUnsafe?.user;
      
      if (tgUser) {
        setTelegramUser(tgUser);
        
        // Verify user with backend
        verifyUser(tgUser.id.toString(), tgUser.language_code);
      } else {
        // Development mode: use mock user
        if (process.env.NODE_ENV === 'development') {
          console.warn('Running in development mode with mock Telegram user');
          const mockTelegramId = '123456789';
          setTelegramUser({ id: mockTelegramId, first_name: 'Dev User' });
          verifyUser(mockTelegramId, 'en');
        } else {
          setIsLoading(false);
        }
      }

      // Cleanup
      return () => {
        if (tg.offEvent) {
          tg.offEvent('viewportChanged', handleViewportChanged);
        }
      };
    } else {
      // Not running in Telegram, use development mode
      if (process.env.NODE_ENV === 'development') {
        console.warn('Telegram WebApp not available, using mock user');
        const mockTelegramId = '123456789';
        setTelegramUser({ id: mockTelegramId, first_name: 'Dev User' });
        verifyUser(mockTelegramId, 'en');
        setViewportHeight(window.innerHeight);
      } else {
        setIsLoading(false);
        setViewportHeight(window.innerHeight);
      }
    }
  }, []);

  async function verifyUser(telegramId: string, languageCode?: string) {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId, languageCode }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to verify user:', error);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Trigger haptic feedback (Requirement 21.5)
   * Provides tactile feedback for key interactions
   */
  const triggerHaptic = (style: 'light' | 'medium' | 'heavy') => {
    if (webApp?.HapticFeedback) {
      try {
        webApp.HapticFeedback.impactOccurred(style);
      } catch (error) {
        // Haptic feedback not supported, silently fail
        console.debug('Haptic feedback not supported:', error);
      }
    }
  };

  return (
    <TelegramAuthContext.Provider 
      value={{ 
        user, 
        telegramUser, 
        isLoading, 
        webApp, 
        triggerHaptic,
        viewportHeight 
      }}
    >
      {children}
    </TelegramAuthContext.Provider>
  );
}

export function useTelegramAuth() {
  const context = useContext(TelegramAuthContext);
  if (!context) {
    throw new Error('useTelegramAuth must be used within TelegramAuthProvider');
  }
  return context;
}
