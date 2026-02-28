/**
 * Admin Dashboard Page
 * 
 * Main admin dashboard displaying platform-wide statistics and recent activity.
 * Shows key metrics including total users, shops, products, orders, revenue,
 * and pending escrow amounts.
 * 
 * Requirements: 27.3, 33.1
 */

import { getPlatformStatistics } from '@/app/actions/admin';
import { StatCard } from '@/components/admin/StatCard';
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Platform Overview
        </h1>
        <p className="text-gray-600 mt-2">
          Real-time statistics and insights for Misrak Shemeta marketplace
        </p>
      </div>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      
      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      
      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Orders
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Last 20 orders across the platform
          </p>
        </div>
        
        <div className="overflow-x-auto">
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
  );
}
