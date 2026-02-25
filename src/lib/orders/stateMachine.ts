/**
 * Escrow State Machine Utilities
 * Requirements: 23.1, 23.2, 23.3, 23.4, 23.5
 */

import type { OrderStatus, StateTransition } from '@/types';
import { ALLOWED_TRANSITIONS } from '@/types';

/**
 * Validate if a state transition is allowed
 * Requirement: 23.1
 */
export function isValidTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  // Same status is always valid (idempotent)
  if (currentStatus === newStatus) {
    return true;
  }

  // Check if transition is in allowed list
  return ALLOWED_TRANSITIONS.some(
    ([from, to]) => from === currentStatus && to === newStatus
  );
}

/**
 * Get allowed next states for a given current state
 */
export function getAllowedNextStates(
  currentStatus: OrderStatus
): OrderStatus[] {
  return ALLOWED_TRANSITIONS
    .filter(([from]) => from === currentStatus)
    .map(([, to]) => to);
}

/**
 * Check if an order can be cancelled from its current status
 * Requirements: 18.1, 18.2, 18.3
 */
export function canCancelOrder(currentStatus: OrderStatus): boolean {
  return currentStatus === 'PENDING' || currentStatus === 'PAID_ESCROW';
}

/**
 * Check if a refund is required for cancellation
 * Requirement: 18.2
 */
export function requiresRefund(currentStatus: OrderStatus): boolean {
  return currentStatus === 'PAID_ESCROW';
}

/**
 * Get human-readable status description
 */
export function getStatusDescription(
  status: OrderStatus,
  language: 'en' | 'am' | 'om' = 'en'
): string {
  const descriptions: Record<OrderStatus, Record<string, string>> = {
    PENDING: {
      en: 'Awaiting Payment',
      am: 'ክፍያ በመጠባበቅ ላይ',
      om: 'Kaffaltii eegaa jira'
    },
    PAID_ESCROW: {
      en: 'Payment Received',
      am: 'ክፍያ ተደርጓል',
      om: 'Kaffaltiin raawwatameera'
    },
    DISPATCHED: {
      en: 'Out for Delivery',
      am: 'በማድረስ ላይ',
      om: 'Geessisaaf kaafameera'
    },
    ARRIVED: {
      en: 'Arrived at Location',
      am: 'ቦታው ላይ ደርሷል',
      om: 'Bakka gaheera'
    },
    COMPLETED: {
      en: 'Completed',
      am: 'ተጠናቋል',
      om: 'Xumurameera'
    },
    CANCELLED: {
      en: 'Cancelled',
      am: 'ተሰርዟል',
      om: 'Haqameera'
    }
  };

  return descriptions[status][language] || descriptions[status].en;
}
