/**
 * Admin Layout Component
 * 
 * Layout wrapper for all admin pages with navigation sidebar and header.
 * Provides consistent structure across all admin routes.
 * 
 * Requirements: 27.3
 */

import { AdminNav } from '@/components/admin/AdminNav';

export const metadata = {
  title: 'Admin Panel - Misrak Shemeta',
  description: 'Admin dashboard for Misrak Shemeta marketplace platform',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <AdminNav />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage users, shops, products, and monitor platform health
                </p>
              </div>
              
              {/* Admin User Info */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    System Administrator
                  </p>
                  <p className="text-xs text-gray-500">
                    Admin Access
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    A
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
