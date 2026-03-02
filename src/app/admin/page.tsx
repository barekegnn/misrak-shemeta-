/**
 * Admin Dashboard Page - Mobile-First Responsive
 * 
 * Main admin dashboard displaying platform-wide statistics and recent activity.
 * Designed mobile-first (375px) then scaled up to tablet and desktop.
 * 
 * Requirements: 27.3, 33.1, 34, 35
 */

import { getPlatformStatistics } from '@/app/actions/admin';
import { StatCard } from '@/components/admin/StatCard';
import { BackButton } from '@/components/navigation';
import { 
  Users, 
  Store, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default async function AdminDashboardPage() {
  // For local development, use a test admin ID
  // In production, this would come from Telegram context
  const adminTelegramId = '123456789';
  
  // Get platform statistics
  const result = await getPlatformStatistics(adminTelegramId);
  
  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load Statistics
          </h3>
          <p className="text-sm text-gray-600">
            {result.error || 'Unable to retrieve platform statistics'}
          </p>
        </div>
      </div>
    );
  }
  
  const stats = result.data;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first container with proper padding */}
      <div className="px-4 py-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        
        {/* Page Header - Mobile optimized */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Platform Overview
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Real-time statistics and insights
          </p>
        </div>
        
        {/* Key Metrics Grid - Single column on mobile, responsive grid on larger screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Users"
            value={stats.totalUsers}
            icon={Users}
            colorScheme="blue"
          />
          
          <StatCard
            label="Total Shops"
            value={stats.totalShops}
            icon={Store}
            colorScheme="purple"
          />
          
          <StatCard
            label="Total Products"
            value={stats.totalProducts}
            icon={Package}
            colorScheme="green"
          />
          
          <StatCard
            label="Total Orders"
            value={stats.totalOrders}
            icon={ShoppingCart}
            colorScheme="yellow"
          />
        </div>
        
        {/* Financial Metrics - Single column on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Total Revenue"
            value={`${stats.totalRevenue.toLocaleString()} ETB`}
            icon={DollarSign}
            colorScheme="green"
          />
          
          <StatCard
            label="Pending Escrow"
            value={`${stats.pendingEscrow.toLocaleString()} ETB`}
            icon={Clock}
            colorScheme="yellow"
          />
          
          <StatCard
            label="Active Users (30d)"
            value={stats.activeUsers}
            icon={TrendingUp}
            colorScheme="blue"
          />
        </div>
        
        {/* System Health Indicators */}
        {(stats.suspendedUsers > 0 || stats.suspendedShops > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.suspendedUsers > 0 && (
              <StatCard
                label="Suspended Users"
                value={stats.suspendedUsers}
                icon={AlertCircle}
                colorScheme="red"
              />
            )}
            
            {stats.suspendedShops > 0 && (
              <StatCard
                label="Suspended Shops"
                value={stats.suspendedShops}
                icon={AlertCircle}
                colorScheme="red"
              />
            )}
          </div>
        )}
        
        {/* Recent Orders - Card layout on mobile, table on desktop */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Recent Orders
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Last 20 orders across the platform
            </p>
          </div>
          
          {/* Mobile: Card layout */}
          <div className="block md:hidden">
            {stats.recentOrders.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No orders yet
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="px-4 py-4 space-y-2">
                    {/* Order ID */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Order ID</span>
                      <span className="text-sm font-medium text-gray-900">
                        {order.id.substring(0, 8)}...
                      </span>
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        order.status === 'PAID_ESCROW' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'DISPATCHED' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'ARRIVED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    
                    {/* Total */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Total</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {order.totalAmount.toLocaleString()} ETB
                      </span>
                    </div>
                    
                    {/* Date */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Date</span>
                      <span className="text-xs text-gray-600">
                        {order.createdAt instanceof Date 
                          ? order.createdAt.toISOString().split('T')[0]
                          : new Date(order.createdAt).toISOString().split('T')[0]
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Desktop: Table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.userId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          order.status === 'PAID_ESCROW' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'DISPATCHED' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'ARRIVED' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.totalAmount.toLocaleString()} ETB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.createdAt instanceof Date 
                          ? order.createdAt.toISOString().split('T')[0]
                          : new Date(order.createdAt).toISOString().split('T')[0]
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
