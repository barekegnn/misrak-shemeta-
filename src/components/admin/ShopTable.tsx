/**
 * Shop Table Component
 * 
 * Interactive table for displaying and managing shops with search, filter,
 * and action capabilities (suspend, activate, adjust balance).
 * 
 * Requirements: 29.1, 29.3
 */

'use client';

import { useState, useTransition } from 'react';
import { Shop, ShopFilters } from '@/types';
import { 
  getShopList, 
  suspendShop, 
  activateShop, 
  adjustShopBalance 
} from '@/app/actions/admin/shops';
import { 
  Search, 
  Filter, 
  Ban, 
  CheckCircle, 
  DollarSign,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { InputDialog } from './InputDialog';

interface ShopTableProps {
  initialShops: (Shop & { ownerTelegramId?: string })[];
  initialTotal: number;
  initialPage: number;
  pageSize: number;
  adminTelegramId: string;
}

export function ShopTable({
  initialShops,
  initialTotal,
  initialPage,
  pageSize,
  adminTelegramId,
}: ShopTableProps) {
  const [shops, setShops] = useState(initialShops);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [isPending, startTransition] = useTransition();
  
  // Filter state
  const [searchName, setSearchName] = useState('');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<'balance-asc' | 'balance-desc' | 'date'>('date');
  
  // Action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  
  // Dialog state
  const [suspendDialog, setSuspendDialog] = useState<{ isOpen: boolean; shopId: string }>({ isOpen: false, shopId: '' });
  const [activateDialog, setActivateDialog] = useState<{ isOpen: boolean; shopId: string }>({ isOpen: false, shopId: '' });
  const [balanceDialog, setBalanceDialog] = useState<{ isOpen: boolean; shopId: string; currentBalance: number }>({ isOpen: false, shopId: '', currentBalance: 0 });
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceReason, setBalanceReason] = useState('');
  
  // Apply filters and fetch shops
  const applyFilters = () => {
    startTransition(async () => {
      const filters: ShopFilters = {};
      
      if (searchName) filters.shopName = searchName;
      if (filterLocation) filters.location = filterLocation as any;
      if (filterStatus === 'active') filters.suspended = false;
      if (filterStatus === 'suspended') filters.suspended = true;
      
      const result = await getShopList(adminTelegramId, filters, 1, pageSize);
      
      if (result.success && result.data) {
        let sortedShops = result.data.shops;
        
        // Apply client-side sorting
        if (sortBy === 'balance-asc') {
          sortedShops = [...sortedShops].sort((a, b) => a.balance - b.balance);
        } else if (sortBy === 'balance-desc') {
          sortedShops = [...sortedShops].sort((a, b) => b.balance - a.balance);
        }
        
        setShops(sortedShops);
        setTotal(result.data.total);
        setPage(1);
      }
    });
  };
  
  // Clear filters
  const clearFilters = () => {
    setSearchName('');
    setFilterLocation('');
    setFilterStatus('');
    setSortBy('date');
    startTransition(async () => {
      const result = await getShopList(adminTelegramId, undefined, 1, pageSize);
      if (result.success && result.data) {
        setShops(result.data.shops);
        setTotal(result.data.total);
        setPage(1);
      }
    });
  };
  
  // Pagination
  const goToPage = (newPage: number) => {
    startTransition(async () => {
      const filters: ShopFilters = {};
      if (searchName) filters.shopName = searchName;
      if (filterLocation) filters.location = filterLocation as any;
      if (filterStatus === 'active') filters.suspended = false;
      if (filterStatus === 'suspended') filters.suspended = true;
      
      const result = await getShopList(adminTelegramId, filters, newPage, pageSize);
      if (result.success && result.data) {
        setShops(result.data.shops);
        setPage(newPage);
      }
    });
  };
  
  // Suspend shop
  const handleSuspend = async (reason: string) => {
    const shopId = suspendDialog.shopId;
    
    setActionLoading(shopId);
    setActionError(null);
    setActionSuccess(null);
    
    const result = await suspendShop(adminTelegramId, shopId, reason);
    
    if (result.success) {
      setActionSuccess('Shop suspended successfully');
      // Refresh list
      const listResult = await getShopList(adminTelegramId, undefined, page, pageSize);
      if (listResult.success && listResult.data) {
        setShops(listResult.data.shops);
      }
    } else {
      setActionError(result.error || 'Failed to suspend shop');
    }
    
    setActionLoading(null);
    setTimeout(() => {
      setActionSuccess(null);
      setActionError(null);
    }, 3000);
  };
  
  // Activate shop
  const handleActivate = async () => {
    const shopId = activateDialog.shopId;
    
    setActionLoading(shopId);
    setActionError(null);
    setActionSuccess(null);
    
    const result = await activateShop(adminTelegramId, shopId);
    
    if (result.success) {
      setActionSuccess('Shop activated successfully');
      // Refresh list
      const listResult = await getShopList(adminTelegramId, undefined, page, pageSize);
      if (listResult.success && listResult.data) {
        setShops(listResult.data.shops);
      }
    } else {
      setActionError(result.error || 'Failed to activate shop');
    }
    
    setActionLoading(null);
    setTimeout(() => {
      setActionSuccess(null);
      setActionError(null);
    }, 3000);
  };
  
  // Adjust balance
  const handleAdjustBalance = async () => {
    const shopId = balanceDialog.shopId;
    const amount = parseFloat(balanceAmount);
    
    if (isNaN(amount) || amount === 0) {
      setActionError('Please enter a valid amount');
      return;
    }
    
    if (!balanceReason.trim()) {
      setActionError('Please provide a reason for the adjustment');
      return;
    }
    
    setActionLoading(shopId);
    setActionError(null);
    setActionSuccess(null);
    
    const result = await adjustShopBalance(adminTelegramId, shopId, amount, balanceReason);
    
    if (result.success) {
      setActionSuccess(`Shop balance adjusted by ${amount > 0 ? '+' : ''}${amount} ETB`);
      setBalanceAmount('');
      setBalanceReason('');
      // Refresh list
      const listResult = await getShopList(adminTelegramId, undefined, page, pageSize);
      if (listResult.success && listResult.data) {
        setShops(listResult.data.shops);
      }
    } else {
      setActionError(result.error || 'Failed to adjust shop balance');
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
        onClose={() => setSuspendDialog({ isOpen: false, shopId: '' })}
        onSubmit={handleSuspend}
        title="Suspend Shop"
        message="Please provide a reason for suspending this shop. This will prevent the shop from operating on the platform."
        placeholder="Enter suspension reason..."
        inputType="textarea"
        submitText="Suspend Shop"
      />
      
      <ConfirmDialog
        isOpen={activateDialog.isOpen}
        onClose={() => setActivateDialog({ isOpen: false, shopId: '' })}
        onConfirm={handleActivate}
        title="Activate Shop"
        message="Are you sure you want to activate this shop? They will regain full access to the platform."
        confirmText="Activate"
        variant="info"
      />
      
      {/* Balance Adjustment Dialog */}
      {balanceDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => {
              setBalanceDialog({ isOpen: false, shopId: '', currentBalance: 0 });
              setBalanceAmount('');
              setBalanceReason('');
            }}
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Adjust Shop Balance
            </h3>
            <p className="text-gray-600 mb-4">
              Current balance: {balanceDialog.currentBalance.toLocaleString()} ETB
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adjustment Amount (ETB)
                </label>
                <input
                  type="number"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder="Enter amount (positive or negative)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use positive numbers to add, negative to subtract
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Adjustment
                </label>
                <textarea
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                  placeholder="Enter reason..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setBalanceDialog({ isOpen: false, shopId: '', currentBalance: 0 });
                  setBalanceAmount('');
                  setBalanceReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustBalance}
                disabled={actionLoading === balanceDialog.shopId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Adjust Balance
              </button>
            </div>
          </div>
        </div>
      )}
      
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
          {/* Search by Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Shop Name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Enter shop name"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Filter by Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Locations</option>
              <option value="Harar">Harar</option>
              <option value="Dire Dawa">Dire Dawa</option>
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
          
          {/* Sort by Balance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Date (Newest)</option>
              <option value="balance-desc">Balance (High to Low)</option>
              <option value="balance-asc">Balance (Low to High)</option>
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
      
      {/* Shops Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shop Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              {shops.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No shops found
                  </td>
                </tr>
              ) : (
                shops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {shop.name || 'Unnamed Shop'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {shop.ownerTelegramId ? (
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {shop.ownerTelegramId}
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {shop.contactPhone ? (
                        <a 
                          href={`tel:${shop.contactPhone}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {shop.contactPhone}
                        </a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {shop.city || shop.location ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (shop.city || shop.location) === 'Harar' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {(shop.city || shop.location)?.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {(shop.balance || 0).toLocaleString()} ETB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {shop.suspended ? (
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
                      {shop.createdAt ? (
                        shop.createdAt instanceof Date 
                          ? shop.createdAt.toISOString().split('T')[0]
                          : new Date(shop.createdAt).toISOString().split('T')[0]
                      ) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {shop.suspended ? (
                          <button
                            onClick={() => setActivateDialog({ isOpen: true, shopId: shop.id })}
                            disabled={actionLoading === shop.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Activate Shop"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setSuspendDialog({ isOpen: true, shopId: shop.id })}
                            disabled={actionLoading === shop.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Suspend Shop"
                          >
                            <Ban className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => setBalanceDialog({ isOpen: true, shopId: shop.id, currentBalance: shop.balance })}
                          disabled={actionLoading === shop.id}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          title="Adjust Balance"
                        >
                          <DollarSign className="h-5 w-5" />
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
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} shops
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
