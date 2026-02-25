/**
 * Notification Service
 * 
 * Handles sending notifications to users based on order status changes.
 * 
 * Requirements:
 * - 9.3: Send notification when order status changes to DISPATCHED
 * - 9.5: Send notification when order status changes to ARRIVED (include OTP instructions)
 * - 18.4: Send notification to shop owner when order is cancelled
 * - 26.5: Translate notifications based on user language preference
 */

import { adminDb } from '@/lib/firebase/admin';
import { NotificationType, NotificationTemplates } from './types';
import { Language } from '@/types';

/**
 * Translation keys for notifications
 */
const translations: Record<Language, Record<string, string>> = {
  en: {
    'notifications.orderDispatched.title': 'Order Dispatched',
    'notifications.orderDispatched.message': 'Your order #{orderId} has been dispatched and is on its way!',
    'notifications.orderArrived.title': 'Order Arrived',
    'notifications.orderArrived.message': 'Your order #{orderId} has arrived! Please inspect the product and provide the OTP: {otp}',
    'notifications.orderCancelled.title': 'Order Cancelled',
    'notifications.orderCancelled.message': 'Order #{orderId} has been cancelled. {reason}',
    'notifications.orderCompleted.title': 'Order Completed',
    'notifications.orderCompleted.message': 'Your order #{orderId} has been completed. Thank you for your purchase!',
    'notifications.paymentSuccess.title': 'Payment Successful',
    'notifications.paymentSuccess.message': 'Payment for order #{orderId} was successful. Amount: {amount} ETB',
    'notifications.paymentFailed.title': 'Payment Failed',
    'notifications.paymentFailed.message': 'Payment for order #{orderId} failed. Please try again.',
  },
  am: {
    'notifications.orderDispatched.title': 'ትዕዛዝ ተልኳል',
    'notifications.orderDispatched.message': 'ትዕዛዝዎ #{orderId} ተልኳል እና በመንገድ ላይ ነው!',
    'notifications.orderArrived.title': 'ትዕዛዝ ደርሷል',
    'notifications.orderArrived.message': 'ትዕዛዝዎ #{orderId} ደርሷል! እባክዎ ምርቱን ይመርምሩ እና OTP ያቅርቡ: {otp}',
    'notifications.orderCancelled.title': 'ትዕዛዝ ተሰርዟል',
    'notifications.orderCancelled.message': 'ትዕዛዝ #{orderId} ተሰርዟል። {reason}',
    'notifications.orderCompleted.title': 'ትዕዛዝ ተጠናቋል',
    'notifications.orderCompleted.message': 'ትዕዛዝዎ #{orderId} ተጠናቋል። ስለገዙ እናመሰግናለን!',
    'notifications.paymentSuccess.title': 'ክፍያ ተሳክቷል',
    'notifications.paymentSuccess.message': 'ለትዕዛዝ #{orderId} ክፍያ ተሳክቷል። መጠን: {amount} ብር',
    'notifications.paymentFailed.title': 'ክፍያ አልተሳካም',
    'notifications.paymentFailed.message': 'ለትዕዛዝ #{orderId} ክፍያ አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
  },
  om: {
    'notifications.orderDispatched.title': 'Ajajni Ergame',
    'notifications.orderDispatched.message': 'Ajajni keessan #{orderId} ergamee karaa irra jira!',
    'notifications.orderArrived.title': 'Ajajni Dhufe',
    'notifications.orderArrived.message': 'Ajajni keessan #{orderId} dhufee jira! Mee oomisha kana qoradhaa fi OTP kana kennaa: {otp}',
    'notifications.orderCancelled.title': 'Ajajni Haqame',
    'notifications.orderCancelled.message': 'Ajajni #{orderId} haqame. {reason}',
    'notifications.orderCompleted.title': 'Ajajni Xumurameera',
    'notifications.orderCompleted.message': 'Ajajni keessan #{orderId} xumurameera. Bituuf galatoomaa!',
    'notifications.paymentSuccess.title': 'Kaffaltiin Milkaawe',
    'notifications.paymentSuccess.message': 'Kaffaltiin ajaja #{orderId} milkaawe. Hanga: {amount} ETB',
    'notifications.paymentFailed.title': 'Kaffaltiin Hin Milkoofne',
    'notifications.paymentFailed.message': 'Kaffaltiin ajaja #{orderId} hin milkoofne. Mee irra deebitii yaali.',
  },
};

/**
 * Translates a notification message
 */
function translate(key: string, language: Language, params?: Record<string, string>): string {
  let message = translations[language][key] || translations.en[key] || key;

  // Replace parameters
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      message = message.replace(`{${param}}`, value);
    });
  }

  return message;
}

/**
 * Creates a notification record in Firestore
 */
async function createNotification(
  userId: string,
  type: NotificationType,
  data: Record<string, any>,
  language: Language
): Promise<void> {
  const template = NotificationTemplates[type];
  
  const title = translate(template.getTitleKey(), language);
  const message = translate(template.getMessageKey(), language, data);

  const notification = {
    userId,
    type,
    title,
    message,
    data,
    read: false,
    createdAt: new Date(),
  };

  await adminDb.collection('notifications').add(notification);
}

/**
 * Sends a notification when order is dispatched (Requirement 9.3)
 */
export async function notifyOrderDispatched(
  userId: string,
  orderId: string,
  language: Language
): Promise<void> {
  await createNotification(
    userId,
    'ORDER_DISPATCHED',
    { orderId },
    language
  );
}

/**
 * Sends a notification when order arrives with OTP instructions (Requirement 9.5)
 */
export async function notifyOrderArrived(
  userId: string,
  orderId: string,
  otp: string,
  language: Language
): Promise<void> {
  await createNotification(
    userId,
    'ORDER_ARRIVED',
    { orderId, otp },
    language
  );
}

/**
 * Sends a notification when order is cancelled (Requirement 18.4)
 */
export async function notifyOrderCancelled(
  userId: string,
  orderId: string,
  reason: string,
  language: Language
): Promise<void> {
  await createNotification(
    userId,
    'ORDER_CANCELLED',
    { orderId, reason },
    language
  );
}

/**
 * Sends a notification when order is completed
 */
export async function notifyOrderCompleted(
  userId: string,
  orderId: string,
  language: Language
): Promise<void> {
  await createNotification(
    userId,
    'ORDER_COMPLETED',
    { orderId },
    language
  );
}

/**
 * Sends a notification when payment succeeds
 */
export async function notifyPaymentSuccess(
  userId: string,
  orderId: string,
  amount: number,
  language: Language
): Promise<void> {
  await createNotification(
    userId,
    'PAYMENT_SUCCESS',
    { orderId, amount: amount.toFixed(2) },
    language
  );
}

/**
 * Sends a notification when payment fails
 */
export async function notifyPaymentFailed(
  userId: string,
  orderId: string,
  language: Language
): Promise<void> {
  await createNotification(
    userId,
    'PAYMENT_FAILED',
    { orderId },
    language
  );
}

/**
 * Gets all notifications for a user
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 50
): Promise<any[]> {
  const snapshot = await adminDb
    .collection('notifications')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate(),
  }));
}

/**
 * Marks a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await adminDb
    .collection('notifications')
    .doc(notificationId)
    .update({ read: true });
}

/**
 * Marks all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const snapshot = await adminDb
    .collection('notifications')
    .where('userId', '==', userId)
    .where('read', '==', false)
    .get();

  const batch = adminDb.batch();
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { read: true });
  });

  await batch.commit();
}
