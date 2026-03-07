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

'use client';

import { useEffect, useState } from 'react';
import { getShopList } from '@/app/actions/admin/shops';
import { ShopTable } from '@/components/admin/ShopTable';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { Store, AlertCircle } from 'lucide-react';
import type { Shop } from '@/types';

export default function ShopManagementPage() {
  const { telegramUser, isLoading: authLoading } = useTelegramAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadShops() {
      if (authLoading) return;
      
      if (!telegramUser?.id) {
        setError('Unable to authenticate user');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await getShopList(telegramUser.id.toString(), undefined, 1, 50);
        
        if (!result.success || !result.data) {
          setError(result.error || 'Unable to retrieve shop list');
        } else {
          setShops(result.data.shops);
          setTotal(result.data.total);
          setPage(result.data.page);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load shops');
      } finally {
        setIsLoading(false);
      }
    }

    loadShops();
  }, [telegramUser, authLoading]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading shops...</p>
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
                Failed to Load Shops
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
          adminTelegramId={telegramUser?.id.toString() || ''}
        />
      </div>
    </div>
  );
}
