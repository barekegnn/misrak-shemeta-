'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';

interface AdminAccessGuardProps {
  children: React.ReactNode;
}

/**
 * Admin Access Guard Component
 * 
 * Protects admin pages by checking if the user has ADMIN role.
 * Redirects non-admin users to an unauthorized page.
 */
export function AdminAccessGuard({ children }: AdminAccessGuardProps) {
  const { user, isLoading } = useTelegramAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for user data to load
    if (isLoading) return;

    // If no user or user is not admin, redirect
    if (!user || user.role !== 'ADMIN') {
      console.log('[AdminAccessGuard] Access denied. User role:', user?.role);
      router.push('/unauthorized');
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized if no user
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Unauthorized Access
          </h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to access this page.
            Admin access is required to view this content.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Show unauthorized if user is not admin
  if (user.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Unauthorized Access
          </h1>
          <p className="text-gray-600 mb-2">
            You do not have permission to access this page.
          </p>
          <p className="text-gray-600 mb-6">
            Your current role: <span className="font-semibold">{user.role}</span>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            If you believe you should have access, please contact the system administrator.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // User is admin, render children
  return <>{children}</>;
}
