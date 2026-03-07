/**
 * System Monitoring Page
 * 
 * Real-time monitoring dashboard displaying system health, error logs,
 * webhook history, and Chapa API statistics with auto-refresh functionality.
 * 
 * Mobile-first responsive design with proper spacing and typography.
 * 
 * Requirements: 33.1, 33.2, 34, 35
 */

'use client';

import { useState, useEffect } from 'react';
import { getSystemMonitoring } from '@/app/actions/admin/monitoring';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import type { SystemMonitoringData } from '@/types';
import { StatCard } from '@/components/admin/StatCard';
import { ErrorLogTable } from '@/components/admin/ErrorLogTable';
import { WebhookHistoryTable } from '@/components/admin/WebhookHistoryTable';
import { 
  Activity, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function SystemMonitoringPage() {
  const { telegramUser, isLoading: authLoading } = useTelegramAuth();
  
  const [monitoringData, setMonitoringData] = useState<SystemMonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Fetch monitoring data
  const fetchData = async () => {
    if (!telegramUser?.id) {
      setError('Unable to authenticate user');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    const result = await getSystemMonitoring(telegramUser.id.toString());
    
    if (result.success && result.data) {
      setMonitoringData(result.data);
      setLastRefresh(new Date());
    } else {
      setError(result.error || 'Failed to load monitoring data');
    }
    
    setLoading(false);
  };
  
  // Initial load
  useEffect(() => {
    if (!authLoading && telegramUser?.id) {
      fetchData();
    }
  }, [telegramUser, authLoading]);
  
  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh || !telegramUser?.id) return;
    
    const interval = setInterval(() => {
      fetchData();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh, telegramUser]);
  
  // Manual refresh
  const handleManualRefresh = () => {
    fetchData();
  };
  
  if (authLoading || (loading && !monitoringData)) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <p className="text-sm sm:text-base text-gray-600">Loading monitoring data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error && !monitoringData) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Failed to Load Monitoring Data
              </h3>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <button
                onClick={handleManualRefresh}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px] font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!monitoringData) return null;
  
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              System Monitoring
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Real-time system health and activity monitoring
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Last Refresh */}
            <div className="text-sm text-gray-600">
              Last refresh: {lastRefresh.toLocaleTimeString()}
            </div>
            
            {/* Auto-refresh Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
              />
              <span className="text-sm text-gray-700">Auto-refresh (30s)</span>
            </label>
            
            {/* Manual Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 min-h-[44px] font-medium sm:ml-auto"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        
        {/* System Health Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Active Users"
            value={monitoringData.activeUsers}
            icon={Activity}
            colorScheme="blue"
          />
          
          <StatCard
            label="Pending Orders"
            value={monitoringData.pendingOrders}
            icon={Clock}
            colorScheme="yellow"
          />
          
          <StatCard
            label="Failed Payments"
            value={monitoringData.failedPayments}
            icon={AlertCircle}
            colorScheme="red"
          />
          
          <StatCard
            label="Recent Errors"
            value={monitoringData.recentErrors.length}
            icon={XCircle}
            colorScheme="red"
          />
        </div>
        
        {/* Chapa API Statistics */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Chapa API Statistics
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Success Rate</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {monitoringData.chapaStats.successRate.toFixed(1)}%
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Avg Response Time</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {monitoringData.chapaStats.averageResponseTime > 0 
                  ? `${monitoringData.chapaStats.averageResponseTime}ms`
                  : 'N/A'
                }
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-gray-700">Failed Requests</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {monitoringData.chapaStats.failedRequests}
              </div>
            </div>
          </div>
        </div>
        
        {/* Error Logs */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Recent Error Logs
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Last 50 errors across the platform
            </p>
          </div>
          
          <ErrorLogTable errorLogs={monitoringData.recentErrors} />
        </div>
        
        {/* Webhook History */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-4 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Webhook History
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Last 100 webhook calls from payment providers
            </p>
          </div>
          
          <WebhookHistoryTable webhookCalls={monitoringData.webhookHistory} />
        </div>
      </div>
    </div>
  );
}
