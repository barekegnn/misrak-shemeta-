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

'use client';

import { useEffect, useState } from 'react';
import { getProductList } from '@/app/actions/admin/products';
import { ProductTable } from '@/components/admin/ProductTable';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { Package, AlertCircle } from 'lucide-react';
import type { Product } from '@/types';

export default function ProductModerationPage() {
  const { telegramUser, isLoading: authLoading } = useTelegramAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      if (authLoading) return;
      
      if (!telegramUser?.id) {
        setError('Unable to authenticate user');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await getProductList(telegramUser.id.toString(), undefined, 1, 50);
        
        if (!result.success || !result.data) {
          setError(result.error || 'Unable to retrieve product list');
        } else {
          setProducts(result.data.products);
          setTotal(result.data.total);
          setPage(result.data.page);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [telegramUser, authLoading]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
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
                {error}
              </p>
            </div>
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
          adminTelegramId={telegramUser?.id.toString() || ''}
        />
      </div>
    </div>
  );
}
