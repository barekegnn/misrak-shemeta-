'use client';

import { NavigationWrapper } from '@/components/navigation';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { user } = useTelegramAuth();
  const { cartCount } = useCart();
  const [userRole, setUserRole] = useState<'buyer' | 'merchant' | 'admin' | 'runner'>('buyer');

  // Detect role from pathname
  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      setUserRole('admin');
    } else if (pathname.startsWith('/merchant')) {
      setUserRole('merchant');
    } else if (pathname.startsWith('/runner')) {
      setUserRole('runner');
    } else {
      setUserRole('buyer');
    }
  }, [pathname]);

  return (
    <NavigationWrapper 
      userRole={userRole}
      cartCount={cartCount}
      userName={user?.telegramId || 'User'}
    >
      {children}
    </NavigationWrapper>
  );
}
