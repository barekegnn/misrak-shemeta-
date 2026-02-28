/**
 * User Table Component
 * 
 * Interactive table for displaying and managing users with search, filter,
 * and action capabilities (suspend, activate, change role).
 * 
 * Requirements: 28.1, 28.3
 */

'use client';

import { useState, useTransition } from 'react';
import { User, UserFilters } from '@/types';
import { 
  getUserList, 
  suspendUser, 
  activateUser, 
  changeUserRole 
} from '@/app/actions/admin/users';
import { 
  Search, 
  Filter, 
  Ban, 
  CheckCircle, 
  UserCog,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { InputDialog } from './InputDialog';

interface UserTableProps {
  initialUsers: User[];
  initialTotal: number;
  initialPage: number;
  pageSize: number;
  adminTelegramId: string;
}

export function UserTable({
  initialUsers,
  initialTotal,
  initialPage,
  pageSize,
  adminTelegramId,
}: UserTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [isPending, startTransition] = useTransition();
  
  // Filter state
  const [searchTelegramId, setSearchTelegramId] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterLocation, setFilterLocation] = useState<string>('');
  
  // Action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  
  // Dialog state
  const [suspendDialog, setSuspendDialog] = useState<{ isOpen: boolean; userId: string }>({ isOpen: false, userId: '' });
  const [activateDialog, setActivateDialog] = useState<{ isOpen: boolean; userId: string }>({ isOpen: false, userId: '' });
  const [roleDialog, setRoleDialog] = useState<{ isOpen: boolean; userId: string; currentRole: string }>({ isOpen: false, userId: '', currentRole: '' });
  
  // Apply filters and fetch users
  const applyFilters = () => {
    startTransition(async () => {
      const filters: UserFilters = {};
      
      if (searchTelegramId) filters.telegramId = searchTelegramId;
      if (filterRole) filters.role = filterRole as any;
      if (filterStatus === 'active') filters.suspended = false;
      if (filterStatus === 'suspended') filters.suspended = true;
      if (filterLocation) filters.homeLocation = filterLocation as any;
      
      const result = await getUserList(adminTelegramId, filters, 1, pageSize);
      
      if (result.success && result.data) {
        setUsers(result.data.users);
        setTotal(result.data.total);
        setPage(1);
      }
    });
  };
  
  // Clear filters
  const clearFilters = () => {
    setSearchTelegramId('');
    setFilterRole('');
    setFilterStatus('');
    setFilterLocation('');
    startTransition(async () => {
      const result = await getUserList(adminTelegramId, undefined, 1, pageSize);
      if (result.success && result.data) {
        setUsers(result.data.users);
        setTotal(result.data.total);
        setPage(1);
      }
    });
  };
  
  // Pagination
  const goToPage = (newPage: number) => {
    startTransition(async () => {
      const filters: UserFilters = {};
      if (searchTelegramId) filters.telegramId = searchTelegramId;
      if (filterRole) filters.role = filterRole as any;
      if (filterStatus === 'active') filters.suspended = false;
      if (filterStatus === 'suspended') filters.suspended = true;
      if (filterLocation) filters.homeLocation = filterLocation as any;
      
      const result = await getUserList(adminTelegramId, filters, newPage, pageSize);
      if (result.success && result.data) {
        setUsers(result.data.users);
        setPage(newPage);
      }
    });
  };
  
  // Suspend user
  const handleSuspend = async (reason: string) => {
    const userId = suspendDialog.userId;
    
    setActionLoading(userId);
    setActionError(null);
    setActionSuccess(null);
    
    const result = await suspendUser(adminTelegramId, userId, reason);
    
    if (result.success) {
      setActionSuccess('User suspended successfully');
      // Refresh list
      const listResult = await getUserList(adminTelegramId, undefined, page, pageSize);
      if (listResult.success && listResult.data) {
        setUsers(listResult.data.users);
      }
    } else {
      setActionError(result.error || 'Failed to suspend user');
    }
    
    setActionLoading(null);
    setTimeout(() => {
      setActionSuccess(null);
      setActionError(null);
    }, 3000);
  };
  
  // Activate user
  const handleActivate = async () => {
    const userId = activateDialog.userId;
    
    setActionLoading(userId);
    setActionError(null);
    setActionSuccess(null);
    
    const result = await activateUser(adminTelegramId, userId);
    
    if (result.success) {
      setActionSuccess('User activated successfully');
      // Refresh list
      const listResult = await getUserList(adminTelegramId, undefined, page, pageSize);
      if (listResult.success && listResult.data) {
        setUsers(listResult.data.users);
      }
    } else {
      setActionError(result.error || 'Failed to activate user');
    }
    
    setActionLoading(null);
    setTimeout(() => {
      setActionSuccess(null);
      setActionError(null);
    }, 3000);
  };
  
  // Change role
  const handleChangeRole = async (newRole: string) => {
    const userId = roleDialog.userId;
    
    if (!['STUDENT', 'MERCHANT', 'RUNNER', 'ADMIN'].includes(newRole.toUpperCase())) {
      setActionError('Invalid role');
      return;
    }
    
    setActionLoading(userId);
    setActionError(null);
    setActionSuccess(null);
    
    const result = await changeUserRole(adminTelegramId, userId, newRole.toUpperCase() as any);
    
    if (result.success) {
      setActionSuccess('User role changed successfully');
      // Refresh list
      const listResult = await getUserList(adminTelegramId, undefined, page, pageSize);
      if (listResult.success && listResult.data) {
        setUsers(listResult.data.users);
      }
    } else {
      setActionError(result.error || 'Failed to change user role');
    }
    
    setActionLoading(null);
    setTimeout(() => {
      setActionSuccess(null);
      setActionError(null);
    }, 3000);
  };
  
  const totalPages = Math.ceil(total / pageSize);
  
  return (
    <div className="space-y-4">
      {/* Dialogs */}
      <InputDialog
        isOpen={suspendDialog.isOpen}
        onClose={() => setSuspendDialog({ isOpen: false, userId: '' })}
        onSubmit={handleSuspend}
        title="Suspend User"
        message="Please provide a reason for suspending this user. This will prevent them from accessing the platform."
        placeholder="Enter suspension reason..."
        inputType="textarea"
        submitText="Suspend User"
      />
      
      <ConfirmDialog
        isOpen={activateDialog.isOpen}
        onClose={() => setActivateDialog({ isOpen: false, userId: '' })}
        onConfirm={handleActivate}
        title="Activate User"
        message="Are you sure you want to activate this user? They will regain full access to the platform."
        confirmText="Activate"
        variant="info"
      />
      
      <InputDialog
        isOpen={roleDialog.isOpen}
        onClose={() => setRoleDialog({ isOpen: false, userId: '', currentRole: '' })}
        onSubmit={handleChangeRole}
        title="Change User Role"
        message={`Current role: ${roleDialog.currentRole}. Select a new role for this user.`}
        inputType="select"
        options={[
          { value: 'STUDENT', label: 'Student' },
          { value: 'MERCHANT', label: 'Merchant' },
          { value: 'RUNNER', label: 'Runner' },
          { value: 'ADMIN', label: 'Admin' },
        ]}
        submitText="Change Role"
      />
      
      {/* Action Feedback */}
      {actionSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          {actionSuccess}
        </div>
      )}
      
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {actionError}
        </div>
      )}
      
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search by Telegram ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Telegram ID
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTelegramId}
                onChange={(e) => setSearchTelegramId(e.target.value)}
                placeholder="Enter Telegram ID"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Filter by Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="STUDENT">Student</option>
              <option value="MERCHANT">Merchant</option>
              <option value="RUNNER">Runner</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          
          {/* Filter by Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          
          {/* Filter by Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Home Location
            </label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Locations</option>
              <option value="Haramaya_Main">Haramaya Main</option>
              <option value="Harar_Campus">Harar Campus</option>
              <option value="DDU">DDU</option>
            </select>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={applyFilters}
              disabled={isPending}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Apply
            </button>
            <button
              onClick={clearFilters}
              disabled={isPending}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      
      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telegram ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Home Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.telegramId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'SHOP_OWNER' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'RUNNER' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.suspended ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.homeLocation?.replace('_', ' ') || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.createdAt instanceof Date 
                        ? user.createdAt.toISOString().split('T')[0]
                        : new Date(user.createdAt).toISOString().split('T')[0]
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {user.suspended ? (
                          <button
                            onClick={() => setActivateDialog({ isOpen: true, userId: user.id })}
                            disabled={actionLoading === user.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Activate User"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setSuspendDialog({ isOpen: true, userId: user.id })}
                            disabled={actionLoading === user.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Suspend User"
                          >
                            <Ban className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => setRoleDialog({ isOpen: true, userId: user.id, currentRole: user.role })}
                          disabled={actionLoading === user.id}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          title="Change Role"
                        >
                          <UserCog className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1 || isPending}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages || isPending}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
