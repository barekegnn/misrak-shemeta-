/**
 * Order Management Page
 * 
 * Admin interface for viewing and managing all orders on the platform.
 * Displays orders with search, filter, and action capabilities.
 * 
 * Requirements: 31.1, 31.3
 */

import { getOrderList } from '@/app/actions/admin/orders';
import { OrderTable } from '@/components/admin/OrderTable';

export default async function OrderManagementPage() {
  // For local development, use a test admin ID
  // In production, this would come from Telegram context
  const adminTelegramId = '123456789';
  
  // Fetch initial orders
  const result = await getOrderList(adminTelegramId, undefined, 1, 50);
  
  if (!result.success || !result.data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h1>
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          Failed to load orders: {result.error || 'Unknown error'}
        </div>
      </div>
    );
  }
  
  const { orders, total, page, pageSize } = result.data;
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600 mt-1">
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
  );
}
