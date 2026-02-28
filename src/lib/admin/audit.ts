/**
 * Admin Audit Logging Utilities
 * 
 * Provides functions for logging all admin actions to the adminLogs collection
 * for complete audit trail and compliance.
 * 
 * Requirements: 28.2, 29.2, 30.2, 31.2
 */

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { AdminAction, AdminTargetType } from '@/types';

/**
 * Logs an admin action to the adminLogs collection
 * 
 * Creates a complete audit trail entry with all relevant details including
 * admin ID, action type, target entity, reason, and metadata.
 * 
 * @param params - Admin action logging parameters
 * @returns Promise<void>
 * 
 * @example
 * await logAdminAction({
 *   adminId: 'user123',
 *   adminTelegramId: '123456789',
 *   action: 'USER_SUSPEND',
 *   targetType: 'USER',
 *   targetId: 'user456',
 *   targetDetails: { telegramId: '987654321', role: 'STUDENT' },
 *   reason: 'Violation of terms of service',
 *   metadata: { suspendedUntil: '2024-12-31' }
 * });
 */
export async function logAdminAction(params: {
  adminId: string;
  adminTelegramId: string;
  action: AdminAction;
  targetType: AdminTargetType;
  targetId: string;
  targetDetails: Record<string, any>;
  reason?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    await adminDb.collection('adminLogs').add({
      adminId: params.adminId,
      adminTelegramId: params.adminTelegramId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      targetDetails: params.targetDetails,
      reason: params.reason || '',
      metadata: params.metadata || {},
      timestamp: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
    // Don't throw - we don't want audit logging failures to block admin actions
    // But we should log this error somewhere for monitoring
  }
}

/**
 * Gets recent admin logs with optional filtering
 * 
 * @param filters - Optional filters for admin logs
 * @returns Promise<AdminLog[]> - Array of admin log entries
 */
export async function getAdminLogs(filters?: {
  adminId?: string;
  action?: AdminAction;
  targetType?: AdminTargetType;
  targetId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): Promise<any[]> {
  try {
    let query = adminDb.collection('adminLogs').orderBy('timestamp', 'desc');
    
    if (filters?.adminId) {
      query = query.where('adminId', '==', filters.adminId) as any;
    }
    
    if (filters?.action) {
      query = query.where('action', '==', filters.action) as any;
    }
    
    if (filters?.targetType) {
      query = query.where('targetType', '==', filters.targetType) as any;
    }
    
    if (filters?.targetId) {
      query = query.where('targetId', '==', filters.targetId) as any;
    }
    
    if (filters?.startDate) {
      query = query.where('timestamp', '>=', filters.startDate) as any;
    }
    
    if (filters?.endDate) {
      query = query.where('timestamp', '<=', filters.endDate) as any;
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    } else {
      query = query.limit(100) as any; // Default limit
    }
    
    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(),
    }));
  } catch (error) {
    console.error('Error getting admin logs:', error);
    return [];
  }
}

/**
 * Gets admin logs for a specific target entity
 * 
 * Useful for viewing the complete history of admin actions on a user, shop, etc.
 * 
 * @param targetType - Type of target entity
 * @param targetId - ID of target entity
 * @returns Promise<AdminLog[]> - Array of admin log entries for the target
 */
export async function getAdminLogsForTarget(
  targetType: AdminTargetType,
  targetId: string
): Promise<any[]> {
  return getAdminLogs({ targetType, targetId });
}

/**
 * Gets admin logs for a specific admin user
 * 
 * Useful for viewing all actions performed by a specific admin
 * 
 * @param adminId - ID of admin user
 * @returns Promise<AdminLog[]> - Array of admin log entries by the admin
 */
export async function getAdminLogsByAdmin(adminId: string): Promise<any[]> {
  return getAdminLogs({ adminId });
}
