'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, TelegramWebApp } from '@/types';

interface TelegramAuthContextType {
  user: User | null;
  telegramUser: any | null;
  isLoading: boolean;
  webApp: TelegramWebApp | null;
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

  useEffect(() => {
    // Initialize Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setWebApp(tg);
      
      // Notify Telegram that the Mini App is ready
      tg.ready();

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
    } else {
      // Not running in Telegram, use development mode
      if (process.env.NODE_ENV === 'development') {
        console.warn('Telegram WebApp not available, using mock user');
        const mockTelegramId = '123456789';
        setTelegramUser({ id: mockTelegramId, first_name: 'Dev User' });
        verifyUser(mockTelegramId, 'en');
      } else {
        setIsLoading(false);
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

  return (
    <TelegramAuthContext.Provider value={{ user, telegramUser, isLoading, webApp }}>
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
