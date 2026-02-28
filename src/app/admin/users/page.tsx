/**
 * User Management Page
 * 
 * Admin interface for viewing and managing all users on the platform.
 * Supports searching, filtering, suspending, activating, and changing user roles.
 * 
 * Requirements: 28.1, 28.3
 */

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8" />
            User Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all users on the platform - {total.toLocaleString()} total users
          </p>
        </div>
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
  );
}
