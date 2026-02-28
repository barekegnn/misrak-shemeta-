/**
 * Shop Management Page
 * 
 * Admin interface for viewing and managing all shops on the platform.
 * Supports searching, filtering, suspending, activating, and adjusting balances.
 * 
 * Requirements: 29.1, 29.3
 */

import { getShopList } from '@/app/actions/admin/shops';
import { ShopTable } from '@/components/admin/ShopTable';
import { Store, AlertCircle } from 'lucide-react';

export default async function ShopManagementPage() {
  // For local development, use test admin ID
  const adminTelegramId = '123456789';
  
  // Get initial shop list (first page, no filters)
  const result = await getShopList(adminTelegramId, undefined, 1, 50);
  
  if (!result.success || !result.data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load Shops
          </h3>
          <p className="text-sm text-gray-600">
            {result.error || 'Unable to retrieve shop list'}
          </p>
        </div>
      </div>
    );
  }
  
  const { shops, total, page, pageSize } = result.data;
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Store className="h-8 w-8" />
            Shop Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all shops on the platform - {total.toLocaleString()} total shops
          </p>
        </div>
      </div>
      
      {/* Shop Table */}
      <ShopTable
        initialShops={shops}
        initialTotal={total}
        initialPage={page}
        pageSize={pageSize}
        adminTelegramId={adminTelegramId}
      />
    </div>
  );
}
