/**
 * System Monitoring Page
 * 
 * Real-time monitoring dashboard displaying system health, error logs,
 * webhook history, and Chapa API statistics with auto-refresh functionality.
 * 
 * Requirements: 33.1, 33.2
 */

'use client';

import { useState, useEffect } from 'react';
import { getSystemMonitoring } from '@/app/actions/admin/monitoring';
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
  // For local development, use a test admin ID
  const adminTelegramId = '123456789';
  
  const [monitoringData, setMonitoringData] = useState<SystemMonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Fetch monitoring data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    const result = await getSystemMonitoring(adminTelegramId);
    
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
    fetchData();
  }, []);
  
  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchData();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh]);
  
  // Manual refresh
  const handleManualRefresh = () => {
    fetchData();
  };
  
  if (loading && !monitoringData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading monitoring data...</p>
        </div>
      </div>
    );
  }
  
  if (error && !monitoringData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load Monitoring Data
          </h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleManualRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  if (!monitoringData) return null;
  
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            System Monitoring
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time system health and activity monitoring
          </p>
        </div>
        
        <div className="flex items-center gap-4">
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
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Auto-refresh (30s)</span>
          </label>
          
          {/* Manual Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      
      {/* System Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Chapa API Statistics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Success Rate</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {monitoringData.chapaStats.successRate.toFixed(1)}%
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Avg Response Time</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
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
            <div className="text-3xl font-bold text-gray-900">
              {monitoringData.chapaStats.failedRequests}
            </div>
          </div>
        </div>
      </div>
      
      {/* Error Logs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
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
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Webhook History
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Last 100 webhook calls from payment providers
          </p>
        </div>
        
        <WebhookHistoryTable webhookCalls={monitoringData.webhookHistory} />
      </div>
    </div>
  );
}
