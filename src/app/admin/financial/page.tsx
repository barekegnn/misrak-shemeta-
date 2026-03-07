/**
 * Financial Reporting Page
 * 
 * Admin interface for viewing financial reports and analytics.
 * Displays revenue metrics, breakdowns by shop and location, and export functionality.
 * 
 * Mobile-first responsive design with proper spacing and typography.
 * 
 * Requirements: 32.1, 32.2, 34, 35
 */

'use client';

import { useState, useEffect } from 'react';
import { generateFinancialReport, exportFinancialReportCSV } from '@/app/actions/admin/financial';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { StatCard } from '@/components/admin/StatCard';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Download,
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';
import type { FinancialReport } from '@/types';

export default function FinancialReportingPage() {
  const { telegramUser, isLoading: authLoading } = useTelegramAuth();
  
  // State
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  
  // Date range state
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Calculate date range
  const getDateRange = (): { startDate: Date; endDate: Date } => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate.setTime(new Date(customEndDate).getTime());
        }
        break;
    }
    
    return { startDate, endDate };
  };
  
  // Load report
  const loadReport = async () => {
    if (!telegramUser?.id) {
      setError('Unable to authenticate user');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    const { startDate, endDate } = getDateRange();
    
    const result = await generateFinancialReport(telegramUser.id.toString(), startDate, endDate);
    
    if (result.success && result.data) {
      setReport(result.data);
    } else {
      setError(result.error || 'Failed to load financial report');
    }
    
    setLoading(false);
  };
  
  // Export to CSV
  const handleExport = async () => {
    if (!telegramUser?.id) return;

    setExporting(true);
    
    const { startDate, endDate } = getDateRange();
    
    const result = await exportFinancialReportCSV(telegramUser.id.toString(), startDate, endDate);
    
    if (result.success && result.data) {
      // Create blob and download
      const blob = new Blob([result.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      setError(result.error || 'Failed to export report');
    }
    
    setExporting(false);
  };
  
  // Load report on mount and when date range changes
  useEffect(() => {
    if (!authLoading && telegramUser?.id) {
      loadReport();
    }
  }, [dateRange, customStartDate, customEndDate, telegramUser, authLoading]);
  
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Financial Reporting</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Revenue analytics and performance metrics
            </p>
          </div>
          
          <button
            onClick={handleExport}
            disabled={exporting || loading || !report}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] font-medium"
          >
            {exporting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            <span>Export CSV</span>
          </button>
        </div>
        
        {/* Date Range Selector */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Date Range:</span>
            </div>
            
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              <button
                onClick={() => setDateRange('7d')}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  dateRange === '7d'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setDateRange('30d')}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  dateRange === '30d'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setDateRange('90d')}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  dateRange === '90d'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Last 90 Days
              </button>
              <button
                onClick={() => setDateRange('custom')}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  dateRange === 'custom'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Custom
              </button>
            </div>
            
            {dateRange === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm sm:text-base">{error}</span>
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}
        
        {/* Report Content */}
        {!loading && report && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                label="Total Revenue"
                value={`${report.totalRevenue.toLocaleString()} ETB`}
                icon={DollarSign}
                colorScheme="green"
              />
              
              <StatCard
                label="Total Orders"
                value={report.totalOrders}
                icon={ShoppingCart}
                colorScheme="blue"
              />
              
              <StatCard
                label="Average Order Value"
                value={`${report.averageOrderValue.toFixed(2)} ETB`}
                icon={TrendingUp}
                colorScheme="purple"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                label="Delivery Fee Revenue"
                value={`${report.deliveryFeeRevenue.toLocaleString()} ETB`}
                icon={DollarSign}
                colorScheme="yellow"
              />
              
              <StatCard
                label="Product Revenue"
                value={`${(report.totalRevenue - report.deliveryFeeRevenue).toLocaleString()} ETB`}
                icon={DollarSign}
                colorScheme="green"
              />
            </div>
            
            {/* Revenue by Shop - Mobile Cards */}
            <div className="md:hidden space-y-3">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Revenue by Shop
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Top performing shops by revenue
                </p>
                
                {report.revenueByShop.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No shop data available
                  </div>
                ) : (
                  <div className="space-y-3">
                    {report.revenueByShop.map((shop, index) => (
                      <div key={shop.shopId} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                          <span className="text-lg font-semibold text-green-600">
                            {shop.revenue.toLocaleString()} ETB
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900 mb-2">{shop.shopName}</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Orders:</span>
                            <span className="ml-1 font-medium text-gray-900">{shop.orderCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Avg:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              {(shop.revenue / shop.orderCount).toFixed(2)} ETB
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Revenue by Shop - Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Revenue by Shop
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Top performing shops by revenue
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shop Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Order
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.revenueByShop.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No shop data available
                      </td>
                    </tr>
                  ) : (
                    report.revenueByShop.map((shop, index) => (
                      <tr key={shop.shopId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {shop.shopName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {shop.orderCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {shop.revenue.toLocaleString()} ETB
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {(shop.revenue / shop.orderCount).toFixed(2)} ETB
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
            
            {/* Revenue by Location - Mobile Cards */}
            <div className="md:hidden space-y-3">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Revenue by Location
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Revenue breakdown by shop location
                </p>
                
                {report.revenueByLocation.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No location data available
                  </div>
                ) : (
                  <div className="space-y-3">
                    {report.revenueByLocation.map((location) => {
                      const percentage = ((location.revenue / report.totalRevenue) * 100).toFixed(1);
                      return (
                        <div key={location.location} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              location.location === 'Harar' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {location.location}
                            </span>
                            <span className="text-lg font-semibold text-green-600">
                              {location.revenue.toLocaleString()} ETB
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Orders:</span>
                              <span className="ml-1 font-medium text-gray-900">{location.orderCount}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">% of Total:</span>
                              <span className="ml-1 font-medium text-gray-900">{percentage}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Revenue by Location - Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Revenue by Location
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Revenue breakdown by shop location
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        % of Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.revenueByLocation.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          No location data available
                        </td>
                      </tr>
                    ) : (
                      report.revenueByLocation.map((location) => {
                        const percentage = ((location.revenue / report.totalRevenue) * 100).toFixed(1);
                        return (
                          <tr key={location.location} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                location.location === 'Harar' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {location.location}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {location.orderCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              {location.revenue.toLocaleString()} ETB
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {percentage}%
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        </>
      )}
      </div>
    </div>
  );
}
