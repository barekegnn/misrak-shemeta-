'use server';

import { verifyTelegramUser } from '@/lib/auth/telegram';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '@/lib/notifications/service';
import type { ActionResponse } from '@/types';

/**
 * Get all notifications for the authenticated user
 */
export async function getNotifications(
  telegramId: string,
  limit: number = 50
): Promise<ActionResponse<any[]>> {
  try {
    // Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    const notifications = await getUserNotifications(user.id, limit);

    return { success: true, data: notifications };
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: error.message || 'INTERNAL_ERROR' };
  }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(
  telegramId: string,
  notificationId: string
): Promise<ActionResponse<void>> {
  try {
    // Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    await markNotificationAsRead(notificationId);

    return { success: true };
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message || 'INTERNAL_ERROR' };
  }
}

/**
 * Mark all notifications as read for the authenticated user
 */
export async function markAllAsRead(
  telegramId: string
): Promise<ActionResponse<void>> {
  try {
    // Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    await markAllNotificationsAsRead(user.id);

    return { success: true };
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error.message || 'INTERNAL_ERROR' };
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(
  telegramId: string
): Promise<ActionResponse<number>> {
  try {
    // Verify telegramId
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return { success: false, error: 'UNAUTHORIZED' };
    }

    const notifications = await getUserNotifications(user.id, 100);
    const unreadCount = notifications.filter(n => !n.read).length;

    return { success: true, data: unreadCount };
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    return { success: false, error: error.message || 'INTERNAL_ERROR' };
  }
}
