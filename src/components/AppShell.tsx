'use client';

import { NavigationWrapper } from '@/components/navigation';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<'buyer' | 'merchant' | 'admin' | 'runner'>('buyer');
  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState('User');

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

  // TODO: Get cart count from context/state management
  // TODO: Get user name from auth context
  // For now using mock data

  return (
    <NavigationWrapper 
      userRole={userRole}
      cartCount={cartCount}
      userName={userName}
    >
      {children}
    </NavigationWrapper>
  );
}
