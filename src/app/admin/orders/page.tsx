/**
 * Order Management Page
 * 
 * Admin interface for viewing and managing all orders on the platform.
 * Displays orders with search, filter, and action capabilities.
 * 
 * Mobile-first responsive design with proper spacing and typography.
 * 
 * Requirements: 31.1, 31.3, 34, 35
 */

'use client';

import { useEffect, useState } from 'react';
import { getOrderList } from '@/app/actions/admin/orders';
import { OrderTable } from '@/components/admin/OrderTable';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { Package } from 'lucide-react';
import type { Order } from '@/types';

export default function OrderManagementPage() {
  const { telegramUser, isLoading: authLoading } = useTelegramAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      if (authLoading) return;
      
      if (!telegramUser?.id) {
        setError('Unable to authenticate user');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await getOrderList(telegramUser.id.toString(), undefined, 1, 50);
        
        if (!result.success || !result.data) {
          setError(result.error || 'Unable to retrieve order list');
        } else {
          setOrders(result.data.orders);
          setTotal(result.data.total);
          setPage(result.data.page);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, [telegramUser, authLoading]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-900" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Management</h1>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            Failed to load orders: {error}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-900" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Management</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            View and manage all orders on the platform
          </p>
        </div>
        
        <OrderTable
          initialOrders={orders}
          initialTotal={total}
          initialPage={page}
          pageSize={pageSize}
          adminTelegramId={telegramUser?.id.toString() || ''}
        />
      </div>
    </div>
  );
}
