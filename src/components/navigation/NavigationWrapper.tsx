'use client';

import { usePathname } from 'next/navigation';
import { BottomNav } from './BottomNav';
import { TopNav } from './TopNav';
import { Breadcrumbs } from './Breadcrumbs';

interface NavigationWrapperProps {
  children: React.ReactNode;
  userRole?: 'buyer' | 'merchant' | 'admin' | 'runner';
  cartCount?: number;
  userName?: string;
}

export function NavigationWrapper({ 
  children, 
  userRole = 'buyer',
  cartCount = 0,
  userName = 'User'
}: NavigationWrapperProps) {
  const pathname = usePathname();

  // Paths where we don't want to show navigation
  const hideNavigation = [
    '/login',
    '/register',
    '/onboarding',
  ].some(path => pathname.startsWith(path));

  if (hideNavigation) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Top Navigation (Desktop) */}
      <TopNav role={userRole} cartCount={cartCount} userName={userName} />

      {/* Breadcrumbs (Desktop) */}
      <Breadcrumbs />

      {/* Main Content with bottom padding for mobile nav */}
      <main className="pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav role={userRole} cartCount={cartCount} />
    </>
  );
}
