/**
 * Product Moderation Page
 * 
 * Admin interface for viewing and moderating all products on the platform.
 * Supports searching, filtering, and removing products.
 * 
 * Requirements: 30.1
 */

import { getProductList } from '@/app/actions/admin/products';
import { ProductTable } from '@/components/admin/ProductTable';
import { Package, AlertCircle } from 'lucide-react';

export default async function ProductModerationPage() {
  const adminTelegramId = '123456789';
  
  const result = await getProductList(adminTelegramId, undefined, 1, 50);
  
  if (!result.success || !result.data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load Products
          </h3>
          <p className="text-sm text-gray-600">
            {result.error || 'Unable to retrieve product list'}
          </p>
        </div>
      </div>
    );
  }
  
  const { products, total, page, pageSize } = result.data;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="h-8 w-8" />
            Product Moderation
          </h1>
          <p className="text-gray-600 mt-2">
            Moderate all products on the platform - {total.toLocaleString()} total products
          </p>
        </div>
      </div>
      
      <ProductTable
        initialProducts={products}
        initialTotal={total}
        initialPage={page}
        pageSize={pageSize}
        adminTelegramId={adminTelegramId}
      />
    </div>
  );
}
