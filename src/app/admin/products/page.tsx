/**
 * Product Moderation Page
 * 
 * Admin interface for viewing and moderating all products on the platform.
 * Supports searching, filtering, and removing products.
 * 
 * Mobile-first responsive design with proper spacing and typography.
 * 
 * Requirements: 30.1, 34, 35
 */

export const dynamic = 'force-dynamic';

import { getProductList } from '@/app/actions/admin/products';
import { ProductTable } from '@/components/admin/ProductTable';
import { Package, AlertCircle } from 'lucide-react';

export default async function ProductModerationPage() {
  const adminTelegramId = '123456789';
  
  const result = await getProductList(adminTelegramId, undefined, 1, 50);
  
  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Failed to Load Products
              </h3>
              <p className="text-sm text-gray-600">
                {result.error || 'Unable to retrieve product list'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const { products, total, page, pageSize } = result.data;
  
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-900" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Moderation</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Moderate all products on the platform - {total.toLocaleString()} total products
          </p>
        </div>
        
        <ProductTable
          initialProducts={products}
          initialTotal={total}
          initialPage={page}
          pageSize={pageSize}
          adminTelegramId={adminTelegramId}
        />
      </div>
    </div>
  );
}
