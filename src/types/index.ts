// Core type definitions for Misrak Shemeta marketplace

// Location Types
export type City = 'Harar' | 'Dire Dawa';
export type Campus = 'Haramaya_Main' | 'Harar_Campus' | 'DDU';
export type Location = Campus | 'Harar_City' | 'Dire_Dawa_City';

// Language Types
export type Language = 'am' | 'om' | 'en'; // Amharic, Afaan Oromo, English

// User Types
export type UserRole = 'STUDENT' | 'MERCHANT' | 'RUNNER' | 'ADMIN';

export interface User {
  id: string; // Firestore document ID
  telegramId: string; // Primary identifier from Telegram
  role: UserRole;
  homeLocation: Location;
  languagePreference: Language;
  phoneNumber?: string;
  suspended: boolean; // Admin suspension flag
  suspendedAt?: Date;
  suspendedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Shop Types
export interface Shop {
  id: string; // Firestore document ID (shopId)
  name: string;
  ownerId: string; // Reference to User.id
  city: City; // Shop location
  contactPhone: string;
  balance: number; // Current balance in ETB
  suspended: boolean; // Admin suspension flag
  suspendedAt?: Date;
  suspendedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
export interface Product {
  id: string; // Firestore document ID
  shopId: string; // Reference to Shop.id (tenant isolation)
  name: string;
  description: string;
  price: number; // Price in ETB
  category: string;
  images: string[]; // Firebase Storage URLs (1-5 images)
  stock: number; // Inventory quantity
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export type OrderStatus = 
  | 'PENDING'       // Order created, awaiting payment
  | 'PAID_ESCROW'   // Payment received, held in escrow
  | 'DISPATCHED'    // Product handed to runner
  | 'ARRIVED'       // Runner reached delivery location
  | 'COMPLETED'     // OTP verified, funds released
  | 'CANCELLED';    // Order cancelled

export interface OrderItem {
  productId: string;
  shopId: string; // Denormalized for multi-tenant queries
  productName: string; // Denormalized for display
  quantity: number;
  priceAtPurchase: number; // Price at time of order (immutable)
  shopCity: City; // Denormalized for delivery fee calculation
}

export interface StatusChange {
  from: OrderStatus;
  to: OrderStatus;
  timestamp: Date;
  actor: string; // userId who triggered the change
}

export interface Order {
  id: string; // Firestore document ID (orderId)
  userId: string; // Reference to User.id (buyer)
  items: OrderItem[];
  totalAmount: number; // Sum of all item prices
  deliveryFee: number; // Calculated by Eastern Triangle Pricing Engine
  status: OrderStatus;
  userHomeLocation: Location; // Buyer's home location at time of order
  otpCode: string; // 6-digit OTP for delivery verification
  otpAttempts: number; // Number of OTP validation attempts (max 3)
  chapaTransactionRef?: string; // Chapa transaction reference
  cancellationReason?: string;
  refundInitiated?: boolean; // True if refund was initiated
  refundAmount?: number; // Amount refunded in ETB
  refundInitiatedAt?: Date; // Timestamp of refund initiation
  refundFailed?: boolean; // True if refund failed
  refundError?: string; // Error message if refund failed
  refundFailedAt?: Date; // Timestamp of refund failure
  createdAt: Date;
  updatedAt: Date;
  statusHistory: StatusChange[]; // Audit trail
}

// Cart Types
export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  id: string; // userId (one cart per user)
  items: CartItem[];
  updatedAt: Date;
}

// Shop Transaction Types
export type TransactionType = 'CREDIT' | 'DEBIT';

export interface ShopTransaction {
  id: string; // Firestore document ID
  shopId: string;
  orderId: string; // Reference to Order.id
  amount: number; // Amount in ETB
  type: TransactionType; // CREDIT for completed orders, DEBIT for withdrawals
  balanceBefore: number;
  balanceAfter: number;
  timestamp: Date;
}

// Delivery Route Types
export interface DeliveryRoute {
  fee: number; // ETB
  estimatedTime: string; // Human-readable estimate
}

// Chapa Payment Types
export interface ChapaPaymentRequest {
  amount: number;
  currency: 'ETB';
  email: string;
  first_name: string;
  last_name: string;
  tx_ref: string; // orderId
  callback_url: string;
  return_url: string;
  customization: {
    title: string;
    description: string;
  };
}

export interface ChapaPaymentResponse {
  status: 'success' | 'failed';
  message: string;
  data: {
    checkout_url: string;
  };
}

export interface ChapaWebhookPayload {
  event: 'charge.success' | 'charge.failed';
  data: {
    tx_ref: string; // orderId
    status: 'success' | 'failed';
    amount: number;
    currency: 'ETB';
    reference: string; // Chapa transaction reference
  };
}

// Telegram Types
export interface TelegramUser {
  id: number; // telegramId
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string; // Used for initial language preference
}

export interface TelegramWebApp {
  initDataUnsafe: {
    user: TelegramUser;
  };
  ready(): void;
  close(): void;
  expand?(): void; // Expand to full viewport height
  viewportHeight?: number; // Current viewport height
  onEvent?: (eventType: string, callback: () => void) => void;
  offEvent?: (eventType: string, callback: () => void) => void;
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy'): void;
  };
}

// State Machine Types
export type StateTransition = [OrderStatus, OrderStatus];

export const ALLOWED_TRANSITIONS: StateTransition[] = [
  ['PENDING', 'PAID_ESCROW'],
  ['PENDING', 'CANCELLED'],
  ['PAID_ESCROW', 'DISPATCHED'],
  ['PAID_ESCROW', 'CANCELLED'],
  ['DISPATCHED', 'ARRIVED'],
  ['ARRIVED', 'COMPLETED'],
];

// Admin Types
export type AdminAction =
  | 'USER_SUSPEND'
  | 'USER_ACTIVATE'
  | 'USER_ROLE_CHANGE'
  | 'SHOP_SUSPEND'
  | 'SHOP_ACTIVATE'
  | 'SHOP_BALANCE_ADJUST'
  | 'PRODUCT_REMOVE'
  | 'ORDER_STATUS_UPDATE'
  | 'ORDER_REFUND';

export type AdminTargetType = 'USER' | 'SHOP' | 'PRODUCT' | 'ORDER';

export interface AdminLog {
  id: string; // Firestore document ID
  adminId: string; // Reference to User.id (admin who performed action)
  adminTelegramId: string; // Denormalized for quick lookup
  action: AdminAction; // Type of admin action
  targetType: AdminTargetType;
  targetId: string; // ID of affected entity
  targetDetails: Record<string, any>; // Snapshot of entity at time of action
  reason?: string; // Admin-provided reason for action
  metadata: Record<string, any>; // Additional action-specific data
  timestamp: Date;
}

export interface ErrorLog {
  id: string; // Firestore document ID
  errorType: string; // Error classification
  errorMessage: string;
  stackTrace?: string;
  affectedEntityType?: AdminTargetType;
  affectedEntityId?: string;
  userId?: string; // User who triggered the error (if applicable)
  shopId?: string; // Shop involved in the error (if applicable)
  requestPath?: string; // API path or Server Action name
  requestPayload?: Record<string, any>; // Sanitized request data
  timestamp: Date;
}

export interface WebhookCall {
  id: string; // Firestore document ID
  provider: 'CHAPA'; // Payment provider
  event: string; // Webhook event type
  orderId: string; // Associated order
  payload: Record<string, any>; // Full webhook payload
  responseCode: number; // HTTP response code sent back
  processed: boolean; // Whether webhook was successfully processed
  error?: string; // Error message if processing failed
  timestamp: Date;
}

export interface PlatformStats {
  totalUsers: number;
  totalShops: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number; // Sum of all COMPLETED orders
  pendingEscrow: number; // Sum of PAID_ESCROW + DISPATCHED + ARRIVED orders
  activeUsers: number; // Users with orders in last 30 days
  suspendedUsers: number;
  suspendedShops: number;
  recentOrders: Order[]; // Last 20 orders
}

export interface UserFilters {
  search?: string; // Search by telegramId
  role?: UserRole;
  status?: 'active' | 'suspended';
  homeLocation?: Location;
  startDate?: Date;
  endDate?: Date;
}

export interface ShopFilters {
  search?: string; // Search by shop name
  city?: City;
  status?: 'active' | 'suspended';
  startDate?: Date;
  endDate?: Date;
}

export interface ProductFilters {
  search?: string; // Search by product name or shop name
  shopCity?: City;
  minPrice?: number;
  maxPrice?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface OrderFilters {
  search?: string; // Search by orderId, user telegramId, or shop name
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface FinancialReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueByShop: Array<{
    shopId: string;
    shopName: string;
    revenue: number;
    orderCount: number;
  }>;
  revenueByLocation: Array<{
    location: City;
    revenue: number;
    orderCount: number;
  }>;
  deliveryFeeRevenue: number;
  startDate: Date;
  endDate: Date;
}

export interface SystemMonitoringData {
  activeUsers: number;
  pendingOrders: number;
  failedPayments: number;
  recentErrors: ErrorLog[];
  webhookHistory: WebhookCall[];
  chapaStats: {
    successRate: number;
    averageResponseTime: number;
    failedRequests: number;
  };
}

export interface ErrorLogFilters {
  errorType?: string;
  affectedEntityType?: AdminTargetType;
  startDate?: Date;
  endDate?: Date;
}

export interface WebhookFilters {
  provider?: 'CHAPA';
  processed?: boolean;
  startDate?: Date;
  endDate?: Date;
}

// Server Action Response Types
export interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
