/**
 * Order Table Component
 * 
 * Interactive table for displaying and managing orders with search, filter,
 * and action capabilities (update status, issue refund).
 * 
 * Requirements: 31.1, 31.3
 */

'use client';

import { useState, useTransition } from 'react';
import { Order, OrderFilters, OrderStatus } from '@/types';
import { 
  getOrderList, 
  manualUpdateOrderStatus, 
  manualRefund 
} from '@/app/actions/admin/orders';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Edit, 
  DollarSign,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { InputDialog } from './InputDialog';

interface OrderTableProps {
  initialOrders: Order[];
  initialTotal: number;
  initialPage: number;
  pageSize: number;
  adminTelegramId: string;
}

export function OrderTable({
  initialOrders,
  initialTotal,
  initialPage,
  pageSize,
  adminTelegramId,
}: OrderTableProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [isPending, startTransition] = useTransition();
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  
  // Dialog state
  const [statusDialog, setStatusDialog] = useState<{ 
    isOpen: boolean; 
    orderId: string; 
    currentStatus: string;
  }>({ isOpen: false, orderId: '', currentStatus: '' });
  
  const [refundDialog, setRefundDialog] = useState<{ 
    isOpen: boolean; 
    orderId: string;
  }>({ isOpen: false, orderId: '' });
  
  // Apply filters and fetch orders
  const applyFilters = () => {
    startTransition(async () => {
      const filters: OrderFilters = {};
      
      if (searchQuery) filters.search = searchQuery;
      if (filterStatus) filters.status = filterStatus as OrderStatus;
      if (filterStartDate) filters.startDate = new Date(filterStartDate);
      if (filterEndDate) filters.endDate = new Date(filterEndDate);
      
      const result = await getOrderList(adminTelegramId, filters, 1, pageSize);
      
      if (result.success && result.data) {
        let sortedOrders = result.data.orders;
        
        // Apply sorting
        if (sortBy === 'amount') {
          sortedOrders = [...sortedOrders].sort((a, b) => {
            const totalA = a.totalAmount + a.deliveryFee;
            const totalB = b.totalAmount + b.deliveryFee;
            return sortOrder === 'asc' ? totalA - totalB : totalB - totalA;
          });
        } else {
          sortedOrders = [...sortedOrders].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
          });
        }
        
        setOrders(sortedOrders);
        setTotal(result.data.total);
        setPage(1);
      }
    });
  };
  
  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('');
    setFilterStartDate('');
    setFilterEndDate('');
    setSortBy('date');
    setSortOrder('desc');
    startTransition(async () => {
      const result = await getOrderList(adminTelegramId, undefined, 1, pageSize);
      if (result.success && result.data) {
        setOrders(result.data.orders);
        setTotal(result.data.total);
        setPage(1);
      }
    });
  };
  
  // Pagination
  const goToPage = (newPage: number) => {
    startTransition(async () => {
      const filters: OrderFilters = {};
      if (searchQuery) filters.search = searchQuery;
      if (filterStatus) filters.status = filterStatus as OrderStatus;
      if (filterStartDate) filters.startDate = new Date(filterStartDate);
      if (filterEndDate) filters.endDate = new Date(filterEndDate);
      
      const result = await getOrderList(adminTelegramId, filters, newPage, pageSize);
      if (result.success && result.data) {
        setOrders(result.data.orders);
        setPage(newPage);
      }
    });
  };
  
  // Update order status
  const handleUpdateStatus = async (statusData: string) => {
    const orderId = statusDialog.orderId;
    
    // Parse status and reason from input
    // Format: "STATUS|reason"
    const [newStatus, ...reasonParts] = statusData.split('|');
    const reason = reasonParts.join('|') || 'Manual admin update';
    
    if (!['PENDING', 'PAID_ESCROW', 'DISPATCHED', 'ARRIVED', 'COMPLETED', 'CANCELLED'].includes(newStatus)) {
      setActionError('Invalid status');
      return;
    }
    
    setActionLoading(orderId);
    setActionError(null);
    setActionSuccess(null);
    
    const result = await manualUpdateOrderStatus(
      adminTelegramId, 
      orderId, 
      newStatus as OrderStatus, 
      reason
    );
    
    if (result.success) {
      setActionSuccess('Order status updated successfully');
      // Refresh list
      const listResult = await getOrderList(adminTelegramId, undefined, page, pageSize);
      if (listResult.success && listResult.data) {
        setOrders(listResult.data.orders);
      }
    } else {
      setActionError(result.error || 'Failed to update order status');
    }
    
    setActionLoading(null);
    setTimeout(() => {
      setActionSuccess(null);
      setActionError(null);
    }, 3000);
  };
  
  // Issue refund
  const handleRefund = async (reason: string) => {
    const orderId = refundDialog.orderId;
    
    setActionLoading(orderId);
    setActionError(null);
    setActionSuccess(null);
    
    const result = await manualRefund(adminTelegramId, orderId, reason);
    
    if (result.success) {
      setActionSuccess('Refund initiated successfully');
      // Refresh list
      const listResult = await getOrderList(adminTelegramId, undefined, page, pageSize);
      if (listResult.success && listResult.data) {
        setOrders(listResult.data.orders);
      }
    } else {
      setActionError(result.error || 'Failed to issue refund');
    }
    
    setActionLoading(null);
    setTimeout(() => {
      setActionSuccess(null);
      setActionError(null);
    }, 3000);
  };
  
  // Get status badge color
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAID_ESCROW':
        return 'bg-blue-100 text-blue-800';
      case 'DISPATCHED':
        return 'bg-purple-100 text-purple-800';
      case 'ARRIVED':
        return 'bg-indigo-100 text-indigo-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const totalPages = Math.ceil(total / pageSize);
  
  return (
    <div className="space-y-4">
      {/* Dialogs */}
      <InputDialog
        isOpen={statusDialog.isOpen}
        onClose={() => setStatusDialog({ isOpen: false, orderId: '', currentStatus: '' })}
        onSubmit={handleUpdateStatus}
        title="Update Order Status"
        message={`Current status: ${statusDialog.currentStatus}. Select new status and provide a reason.`}
        inputType="select"
        options={[
          { value: 'PENDING|Manual update to pending', label: 'PENDING' },
          { value: 'PAID_ESCROW|Manual update to paid escrow', label: 'PAID_ESCROW' },
          { value: 'DISPATCHED|Manual update to dispatched', label: 'DISPATCHED' },
          { value: 'ARRIVED|Manual update to arrived', label: 'ARRIVED' },
          { value: 'COMPLETED|Manual completion by admin', label: 'COMPLETED' },
          { value: 'CANCELLED|Manual cancellation by admin', label: 'CANCELLED' },
        ]}
        submitText="Update Status"
      />
      
      <InputDialog
        isOpen={refundDialog.isOpen}
        onClose={() => setRefundDialog({ isOpen: false, orderId: '' })}
        onSubmit={handleRefund}
        title="Issue Refund"
        message="Please provide a reason for issuing this refund. This will cancel the order and initiate a refund through Chapa."
        placeholder="Enter refund reason..."
        inputType="textarea"
        submitText="Issue Refund"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Order ID, Buyer ID, or Shop"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
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
              <option value="PENDING">Pending</option>
              <option value="PAID_ESCROW">Paid (Escrow)</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="ARRIVED">Arrived</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
        
        {/* Sort Options */}
        <div className="mt-4 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="date">Date</option>
            <option value="amount">Total Amount</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
          <button
            onClick={applyFilters}
            disabled={isPending}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            Apply Sort
          </button>
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buyer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shop(s)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
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
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const uniqueShops = Array.from(
                    new Set(order.items.map((item: any) => item.shopName || 'Unknown'))
                  );
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {(order as any).buyerTelegramId || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="max-w-xs truncate">
                          {uniqueShops.join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {(order.totalAmount + order.deliveryFee).toFixed(2)} ETB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.createdAt instanceof Date 
                          ? order.createdAt.toISOString().split('T')[0]
                          : new Date(order.createdAt).toISOString().split('T')[0]
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setStatusDialog({ 
                              isOpen: true, 
                              orderId: order.id, 
                              currentStatus: order.status 
                            })}
                            disabled={actionLoading === order.id}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            title="Update Status"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          {['PAID_ESCROW', 'DISPATCHED', 'ARRIVED'].includes(order.status) && (
                            <button
                              onClick={() => setRefundDialog({ isOpen: true, orderId: order.id })}
                              disabled={actionLoading === order.id || order.refundInitiated}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Issue Refund"
                            >
                              <DollarSign className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} orders
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
