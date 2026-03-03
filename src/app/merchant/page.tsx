/**
 * Merchant Dashboard - Main hub for shop owners
 * 
 * Mobile-first responsive design with proper spacing and typography.
 * 
 * Requirements: 1.5, 4.4, 22.3, 34, 35
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { hasShop, getShopStatistics, getShopDetails } from '@/app/actions/shop';
import { getProductsByShop } from '@/app/actions/products';
import { getShopOrders } from '@/app/actions/orders';
import type { Shop, Product, Order } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Store, Package, ShoppingCart, DollarSign, Plus, Settings } from 'lucide-react';

export default function MerchantDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasShopAccount, setHasShopAccount] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [statistics, setStatistics] = useState({
    currentBalance: 0,
    pendingOrdersValue: 0,
    completedOrdersValue: 0,
  });
  const [productCount, setProductCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  // Mock telegramId for testing (in production, get from Telegram context)
  const telegramId = '111222333'; // Merchant 1 from seed data

  useEffect(() => {
    checkShopStatus();
  }, []);

  const checkShopStatus = async () => {
    try {
      setLoading(true);

      // Check if user has a shop
      const shopCheck = await hasShop(telegramId);
      
      if (!shopCheck.success || !shopCheck.data?.hasShop) {
        // Redirect to shop registration
        router.push('/merchant/register');
        return;
      }

      setHasShopAccount(true);

      // Load shop details
      const shopResult = await getShopDetails(telegramId);
      if (shopResult.success && shopResult.data) {
        setShop(shopResult.data);
      }

      // Load statistics
      const statsResult = await getShopStatistics(telegramId);
      if (statsResult.success && statsResult.data) {
        setStatistics({
          currentBalance: statsResult.data.currentBalance,
          pendingOrdersValue: statsResult.data.pendingOrdersValue,
          completedOrdersValue: statsResult.data.completedOrdersValue,
        });
      }

      // Load product count
      const productsResult = await getProductsByShop(telegramId);
      if (productsResult.success && productsResult.data) {
        setProductCount(productsResult.data.length);
      }

      // Load recent orders
      const ordersResult = await getShopOrders(telegramId);
      if (ordersResult.success && ordersResult.data) {
        setRecentOrders(ordersResult.data.slice(0, 5));
      }

    } catch (error) {
      console.error('Error loading merchant dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasShopAccount) {
    return null; // Will redirect to registration
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Merchant Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Welcome back, {shop?.name || 'Shop Owner'}
            </p>
          </div>
          <Link href="/merchant/settings">
            <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px]">
              <Settings className="w-5 h-5 mr-2" />
              Shop Settings
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current Balance */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700">
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-green-900">
                    {statistics.currentBalance.toFixed(2)} ETB
                  </p>
                  <p className="text-xs text-green-600 mt-1">Available to withdraw</p>
                </div>
                <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* Pending Orders */}
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-700">
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-900">
                    {statistics.pendingOrdersValue.toFixed(2)} ETB
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">In escrow</p>
                </div>
                <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* Completed Orders */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700">
                Completed Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-900">
                    {statistics.completedOrdersValue.toFixed(2)} ETB
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Total earnings</p>
                </div>
                <Store className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700">
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-900">
                    {productCount}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">Active listings</p>
                </div>
                <Package className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/merchant/products/new">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary h-full">
              <CardContent className="flex flex-col items-center justify-center py-6 sm:py-8">
                <Plus className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-3" />
                <h3 className="font-semibold text-base sm:text-lg">Add New Product</h3>
                <p className="text-sm text-gray-600 text-center mt-1">
                  List a new product in your shop
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/merchant/products">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center py-6 sm:py-8">
                <Package className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mb-3" />
                <h3 className="font-semibold text-base sm:text-lg">Manage Products</h3>
                <p className="text-sm text-gray-600 text-center mt-1">
                  Edit, update, or remove products
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/shop/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center py-6 sm:py-8">
                <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mb-3" />
                <h3 className="font-semibold text-base sm:text-lg">View Orders</h3>
                <p className="text-sm text-gray-600 text-center mt-1">
                  Manage customer orders
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-lg sm:text-xl">Recent Orders</CardTitle>
                <CardDescription className="text-sm">Latest orders from your shop</CardDescription>
              </div>
              <Link href="/shop/orders">
                <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px]">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm sm:text-base">No orders yet</p>
                <p className="text-xs sm:text-sm mt-1">Orders will appear here when customers make purchases</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/shop/orders/${order.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm sm:text-base">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {order.items.length} item(s) • {order.totalAmount.toFixed(2)} ETB
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'PAID_ESCROW'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'DISPATCHED'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
