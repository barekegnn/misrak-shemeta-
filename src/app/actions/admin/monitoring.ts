/**
 * Admin System Monitoring Server Actions
 * 
 * Provides server actions for monitoring system health, error logs,
 * webhook history, and Chapa API statistics.
 * 
 * Requirements: 33.1, 33.2
 */

'use server';

import { adminDb } from '@/lib/firebase/admin';
import { requireAdminAccess } from '@/lib/auth/admin';
import type { 
  ActionResponse, 
  SystemMonitoringData, 
  ErrorLog, 
  WebhookCall,
  ErrorLogFilters,
  WebhookFilters 
} from '@/types';

/**
 * Gets system monitoring data including health stats and recent activity
 * 
 * Retrieves active users, pending orders, failed payments, recent errors,
 * webhook history, and Chapa API statistics.
 * 
 * @param adminTelegramId - Telegram ID of admin requesting the data
 * @returns ActionResponse<SystemMonitoringData>
 * 
 * Requirements: 33.1, 33.2
 */
export async function getSystemMonitoring(
  adminTelegramId: string
): Promise<ActionResponse<SystemMonitoringData>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Get active users (users with orders in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrdersSnapshot = await adminDb
      .collection('orders')
      .where('createdAt', '>=', thirtyDaysAgo)
      .get();
    
    const activeUserIds = new Set<string>();
    recentOrdersSnapshot.docs.forEach(doc => {
      activeUserIds.add(doc.data().userId);
    });
    const activeUsers = activeUserIds.size;
    
    // Get pending orders
    const pendingOrdersSnapshot = await adminDb
      .collection('orders')
      .where('status', 'in', ['PENDING', 'PAID_ESCROW', 'DISPATCHED', 'ARRIVED'])
      .get();
    const pendingOrders = pendingOrdersSnapshot.size;
    
    // Get failed payments (orders with CANCELLED status and refund info)
    const failedPaymentsSnapshot = await adminDb
      .collection('orders')
      .where('status', '==', 'CANCELLED')
      .where('refundInitiated', '==', true)
      .get();
    const failedPayments = failedPaymentsSnapshot.size;
    
    // Get recent error logs (last 50)
    const errorLogsSnapshot = await adminDb
      .collection('errorLogs')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    
    const recentErrors: ErrorLog[] = errorLogsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        errorType: data.errorType,
        errorMessage: data.errorMessage,
        stackTrace: data.stackTrace,
        affectedEntityType: data.affectedEntityType,
        affectedEntityId: data.affectedEntityId,
        userId: data.userId,
        shopId: data.shopId,
        requestPath: data.requestPath,
        requestPayload: data.requestPayload,
        timestamp: data.timestamp.toDate(),
      };
    });
    
    // Get webhook history (last 100)
    const webhookHistorySnapshot = await adminDb
      .collection('webhookCalls')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();
    
    const webhookHistory: WebhookCall[] = webhookHistorySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        provider: data.provider,
        event: data.event,
        orderId: data.orderId,
        payload: data.payload,
        responseCode: data.responseCode,
        processed: data.processed,
        error: data.error,
        timestamp: data.timestamp.toDate(),
      };
    });
    
    // Calculate Chapa stats
    const chapaWebhooks = webhookHistory.filter(w => w.provider === 'CHAPA');
    const successfulWebhooks = chapaWebhooks.filter(w => w.processed);
    const failedWebhooks = chapaWebhooks.filter(w => !w.processed);
    
    const successRate = chapaWebhooks.length > 0 
      ? (successfulWebhooks.length / chapaWebhooks.length) * 100 
      : 0;
    
    // Note: Response time would need to be tracked in webhook handler
    // For now, we'll use a placeholder
    const averageResponseTime = 0;
    
    const monitoringData: SystemMonitoringData = {
      activeUsers,
      pendingOrders,
      failedPayments,
      recentErrors,
      webhookHistory,
      chapaStats: {
        successRate,
        averageResponseTime,
        failedRequests: failedWebhooks.length,
      },
    };
    
    return { success: true, data: monitoringData };
  } catch (error: any) {
    console.error('Error getting system monitoring data:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to get system monitoring data' };
  }
}

/**
 * Gets error logs with filtering
 * 
 * Retrieves error logs from Firestore with optional filters for error type,
 * affected entity type, and date range.
 * 
 * @param adminTelegramId - Telegram ID of admin requesting the logs
 * @param filters - Optional filters for the error logs
 * @param limit - Maximum number of logs to retrieve
 * @returns ActionResponse<ErrorLog[]>
 * 
 * Requirements: 33.2
 */
export async function getErrorLogs(
  adminTelegramId: string,
  filters?: ErrorLogFilters,
  limit: number = 100
): Promise<ActionResponse<ErrorLog[]>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Build query
    let query: FirebaseFirestore.Query = adminDb.collection('errorLogs');
    
    // Apply filters
    if (filters?.errorType) {
      query = query.where('errorType', '==', filters.errorType);
    }
    
    if (filters?.affectedEntityType) {
      query = query.where('affectedEntityType', '==', filters.affectedEntityType);
    }
    
    if (filters?.startDate) {
      query = query.where('timestamp', '>=', filters.startDate);
    }
    
    if (filters?.endDate) {
      query = query.where('timestamp', '<=', filters.endDate);
    }
    
    // Order and limit
    query = query.orderBy('timestamp', 'desc').limit(limit);
    
    // Execute query
    const snapshot = await query.get();
    
    // Map to ErrorLog objects
    const errorLogs: ErrorLog[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        errorType: data.errorType,
        errorMessage: data.errorMessage,
        stackTrace: data.stackTrace,
        affectedEntityType: data.affectedEntityType,
        affectedEntityId: data.affectedEntityId,
        userId: data.userId,
        shopId: data.shopId,
        requestPath: data.requestPath,
        requestPayload: data.requestPayload,
        timestamp: data.timestamp.toDate(),
      };
    });
    
    return { success: true, data: errorLogs };
  } catch (error: any) {
    console.error('Error getting error logs:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to get error logs' };
  }
}

/**
 * Gets webhook call history with filtering
 * 
 * Retrieves webhook calls from Firestore with optional filters for provider,
 * processed status, and date range.
 * 
 * @param adminTelegramId - Telegram ID of admin requesting the history
 * @param filters - Optional filters for the webhook history
 * @param limit - Maximum number of webhook calls to retrieve
 * @returns ActionResponse<WebhookCall[]>
 * 
 * Requirements: 33.2
 */
export async function getWebhookHistory(
  adminTelegramId: string,
  filters?: WebhookFilters,
  limit: number = 100
): Promise<ActionResponse<WebhookCall[]>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Build query
    let query: FirebaseFirestore.Query = adminDb.collection('webhookCalls');
    
    // Apply filters
    if (filters?.provider) {
      query = query.where('provider', '==', filters.provider);
    }
    
    if (filters?.processed !== undefined) {
      query = query.where('processed', '==', filters.processed);
    }
    
    if (filters?.startDate) {
      query = query.where('timestamp', '>=', filters.startDate);
    }
    
    if (filters?.endDate) {
      query = query.where('timestamp', '<=', filters.endDate);
    }
    
    // Order and limit
    query = query.orderBy('timestamp', 'desc').limit(limit);
    
    // Execute query
    const snapshot = await query.get();
    
    // Map to WebhookCall objects
    const webhookCalls: WebhookCall[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        provider: data.provider,
        event: data.event,
        orderId: data.orderId,
        payload: data.payload,
        responseCode: data.responseCode,
        processed: data.processed,
        error: data.error,
        timestamp: data.timestamp.toDate(),
      };
    });
    
    return { success: true, data: webhookCalls };
  } catch (error: any) {
    console.error('Error getting webhook history:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to get webhook history' };
  }
}

/**
 * Gets system health status
 * 
 * Checks connectivity to Firebase services and returns health indicators.
 * 
 * @param adminTelegramId - Telegram ID of admin requesting the health check
 * @returns ActionResponse<{ firebase: boolean; firestore: boolean; storage: boolean }>
 * 
 * Requirements: 33.1
 */
export async function getSystemHealth(
  adminTelegramId: string
): Promise<ActionResponse<{ firebase: boolean; firestore: boolean; storage: boolean }>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Check Firestore connectivity
    let firestoreHealthy = false;
    try {
      await adminDb.collection('_health_check').limit(1).get();
      firestoreHealthy = true;
    } catch (error) {
      console.error('Firestore health check failed:', error);
    }
    
    // For now, assume Firebase and Storage are healthy if Firestore is healthy
    // In production, you would implement actual health checks for each service
    const health = {
      firebase: firestoreHealthy,
      firestore: firestoreHealthy,
      storage: firestoreHealthy,
    };
    
    return { success: true, data: health };
  } catch (error: any) {
    console.error('Error checking system health:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to check system health' };
  }
}
