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

export const dynamic = 'force-dynamic';

import { getOrderList } from '@/app/actions/admin/orders';
import { OrderTable } from '@/components/admin/OrderTable';
import { Package } from 'lucide-react';

export default async function OrderManagementPage() {
  // For local development, use a test admin ID
  // In production, this would come from Telegram context
  const adminTelegramId = '123456789';
  
  // Fetch initial orders
  const result = await getOrderList(adminTelegramId, undefined, 1, 50);
  
  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-900" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Management</h1>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            Failed to load orders: {result.error || 'Unknown error'}
          </div>
        </div>
      </div>
    );
  }
  
  const { orders, total, page, pageSize } = result.data;
  
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
          adminTelegramId={adminTelegramId}
        />
      </div>
    </div>
  );
}
