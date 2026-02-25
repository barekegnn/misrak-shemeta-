/**
 * Notification System Types
 * 
 * Defines types for the notification system.
 * 
 * Requirement 26.5: Translate all system-generated notifications
 * (order status updates, payment confirmations) based on user's language preference
 */

import { OrderStatus, Language } from '@/types';

export type NotificationType = 
  | 'ORDER_DISPATCHED'
  | 'ORDER_ARRIVED'
  | 'ORDER_CANCELLED'
  | 'ORDER_COMPLETED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export interface NotificationTemplate {
  type: NotificationType;
  getTitleKey: () => string;
  getMessageKey: () => string;
  getDataForTemplate?: (data: any) => Record<string, any>;
}

/**
 * Notification templates for different event types
 */
export const NotificationTemplates: Record<NotificationType, NotificationTemplate> = {
  ORDER_DISPATCHED: {
    type: 'ORDER_DISPATCHED',
    getTitleKey: () => 'notifications.orderDispatched.title',
    getMessageKey: () => 'notifications.orderDispatched.message',
  },
  ORDER_ARRIVED: {
    type: 'ORDER_ARRIVED',
    getTitleKey: () => 'notifications.orderArrived.title',
    getMessageKey: () => 'notifications.orderArrived.message',
  },
  ORDER_CANCELLED: {
    type: 'ORDER_CANCELLED',
    getTitleKey: () => 'notifications.orderCancelled.title',
    getMessageKey: () => 'notifications.orderCancelled.message',
  },
  ORDER_COMPLETED: {
    type: 'ORDER_COMPLETED',
    getTitleKey: () => 'notifications.orderCompleted.title',
    getMessageKey: () => 'notifications.orderCompleted.message',
  },
  PAYMENT_SUCCESS: {
    type: 'PAYMENT_SUCCESS',
    getTitleKey: () => 'notifications.paymentSuccess.title',
    getMessageKey: () => 'notifications.paymentSuccess.message',
  },
  PAYMENT_FAILED: {
    type: 'PAYMENT_FAILED',
    getTitleKey: () => 'notifications.paymentFailed.title',
    getMessageKey: () => 'notifications.paymentFailed.message',
  },
};
