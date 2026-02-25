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

// Server Action Response Types
export interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
