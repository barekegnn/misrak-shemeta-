/**
 * Shop Management Page
 * 
 * Admin interface for viewing and managing all shops on the platform.
 * Supports searching, filtering, suspending, activating, and adjusting balances.
 * 
 * Mobile-first responsive design with proper spacing and typography.
 * 
 * Requirements: 29.1, 29.3, 34, 35
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
      <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Failed to Load Shops
              </h3>
              <p className="text-sm text-gray-600">
                {result.error || 'Unable to retrieve shop list'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const { shops, total, page, pageSize } = result.data;
  
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Store className="h-6 w-6 sm:h-8 sm:w-8 text-gray-900" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop Management</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Manage all shops on the platform - {total.toLocaleString()} total shops
          </p>
        </div>
        
        <ShopTable
          initialShops={shops}
          initialTotal={total}
          initialPage={page}
          pageSize={pageSize}
          adminTelegramId={adminTelegramId}
        />
      </div>
    </div>
  );
}
