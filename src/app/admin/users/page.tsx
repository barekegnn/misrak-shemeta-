/**
 * User Management Page - Mobile-First Responsive
 * 
 * Admin interface for viewing and managing all users on the platform.
 * Designed mobile-first (375px) then scaled up to tablet and desktop.
 * 
 * Requirements: 28.1, 28.3, 34, 35
 */

export const dynamic = 'force-dynamic';

import { getUserList } from '@/app/actions/admin/users';
import { UserTable } from '@/components/admin/UserTable';
import { Users, AlertCircle } from 'lucide-react';

export default async function UserManagementPage() {
  // For local development, use test admin ID
  const adminTelegramId = '123456789';
  
  // Get initial user list (first page, no filters)
  const result = await getUserList(adminTelegramId, undefined, 1, 50);
  
  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load Users
          </h3>
          <p className="text-sm text-gray-600">
            {result.error || 'Unable to retrieve user list'}
          </p>
        </div>
      </div>
    );
  }
  
  const { users, total, page, pageSize } = result.data;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first container */}
      <div className="px-4 py-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Page Header - Mobile optimized */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <Users className="h-6 w-6 sm:h-8 sm:w-8" />
            User Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {total.toLocaleString()} total users
          </p>
        </div>
        
        {/* User Table */}
        <UserTable
          initialUsers={users}
          initialTotal={total}
          initialPage={page}
          pageSize={pageSize}
          adminTelegramId={adminTelegramId}
        />
      </div>
    </div>
  );
}
