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

  // Detect role from user object (from Firebase)
  useEffect(() => {
    if (user?.role) {
      // Map Firebase roles to navigation roles
      const roleMap: Record<string, 'buyer' | 'merchant' | 'admin' | 'runner'> = {
        'ADMIN': 'admin',
        'MERCHANT': 'merchant',
        'RUNNER': 'runner',
        'STUDENT': 'buyer',
      };
      
      setUserRole(roleMap[user.role] || 'buyer');
    }
  }, [user]);

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
