# Design Document: Misrak Shemeta Marketplace

## Overview

Misrak Shemeta is a multi-tenant marketplace platform connecting shops in Harar and Dire Dawa with students and residents across three university locations: Haramaya Main Campus, Harar Campus, and Dire Dawa University (DDU). The platform implements a secure escrow payment system with OTP-based delivery verification, ensuring buyers receive products before funds are released to sellers.

The system is architected as a Telegram Mini App using Next.js 15 App Router with Server Actions for all mutations, Firebase for backend services (Firestore, Auth, Storage), and Chapa for payment processing. The platform supports three languages (Amharic, Afaan Oromo, English) and includes an AI Sales Assistant powered by OpenAI with RAG capabilities.

### Key Design Principles

1. **Geographic Fidelity**: All location references use real Eastern Ethiopian locations (Harar, Dire Dawa, Haramaya Main Campus, Harar Campus, DDU) with culturally accurate naming
2. **Mobile-First Reality**: Optimized for mobile data constraints with lazy loading, lightweight bundles, and touch-friendly interfaces
3. **Cultural Trust**: Transparent fee breakdowns and escrow status visibility to build user confidence
4. **Linguistic Priority**: Amharic and Afaan Oromo are first-class citizens with proper Ethiopic script support
5. **Security by Default**: All mutations execute server-side with Firebase Admin SDK verification
6. **Data Integrity**: Firestore Transactions for all critical state changes
7. **Idempotency**: Payment webhooks and state transitions designed to handle duplicate requests safely

## Architecture

### System Architecture

The platform follows a three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Telegram Mini App                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Buyer UI   │  │  Seller UI   │  │  Runner UI   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js 15 App Router (Server)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Server Actions Layer                     │   │
│  │  • Product Management  • Order Processing            │   │
│  │  • Cart Operations     • Payment Webhooks            │   │
│  │  • OTP Verification    • Balance Management          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Business Logic Layer                        │   │
│  │  • Eastern Triangle Pricing Engine                   │   │
│  │  • Escrow State Machine                              │   │
│  │  • Multi-Tenant Isolation                            │   │
│  │  • OTP Generation & Validation                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend Services                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Firestore │  │   Auth   │  │ Storage  │  │  Chapa   │   │
│  │   DB     │  │  (Admin) │  │  (Images)│  │ Gateway  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              OpenAI API (RAG Assistant)              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend**
- Next.js 15 (App Router, React Server Components)
- Tailwind CSS (styling)
- Shadcn UI (component library)
- TypeScript (strict mode)

**Backend**
- Next.js Server Actions (mutations)
- Firebase Admin SDK (server-side operations)
- Firestore (database)
- Firebase Auth (authentication)
- Firebase Storage (image storage)

**External Services**
- Chapa Payment Gateway (Ethiopian payments)
- OpenAI API (AI Sales Assistant with RAG)
- Telegram Mini App SDK (authentication and UI integration)

### Deployment Architecture

The application is deployed as a Telegram Mini App, accessible through Telegram messenger. The Next.js application is hosted on a platform supporting Server Actions (Vercel, Railway, or similar), with Firebase services providing the backend infrastructure.

### Multi-Tenancy Model

Multi-tenancy is implemented at the data model level:
- Each Shop has a unique `shopId`
- All Products are associated with exactly one `shopId`
- All Orders contain items with `shopId` references
- Server Actions enforce tenant isolation by verifying `shopId` ownership before mutations
- Firestore security rules provide defense-in-depth (though primary enforcement is server-side)

## Components and Interfaces

### Core Components

#### 1. Authentication & User Management

**TelegramAuthProvider**
- Retrieves `telegramId` from Telegram Mini App context
- Creates or retrieves User profile from Firestore
- Provides authentication context to all components

**HomeLocationSelector**
- Prompts first-time users to select their campus/city
- Stores selection in Firestore User profile
- Used for product filtering and delivery fee calculation

**LanguageSwitcher**
- Global component for switching between Amharic, Afaan Oromo, and English
- Persists preference to Firestore User profile
- Triggers UI re-render with translated strings

#### 2. Product Management (Shop Owner)

**ProductListManager**
- Displays all products for the authenticated shop owner
- Provides CRUD operations via Server Actions
- Enforces tenant isolation (only shows products for owner's shop)

**ProductForm**
- Form for creating/editing products
- Image upload to Firebase Storage
- Validation: name, description, price, stock, images (1-5)

**ImageUploader**
- Multi-image upload component (max 5 images, 5MB each)
- Supports JPEG, PNG, WebP
- Generates Firebase Storage URLs
- Handles deletion of old images when product is updated/deleted

#### 3. Product Discovery (Buyer)

**ProductCatalog**
- Grid view of all products from all shops
- Filters by shop location, price range, search query
- Filters products based on buyer's home location (only shows products deliverable to their location)
- Lazy loading for mobile optimization

**ProductCard**
- Displays product image, name, price, shop name, shop location
- "Add to Cart" button
- Touch-optimized (44x44px minimum)

**ProductDetailView**
- Full product information with image carousel
- Shop information and location
- Delivery fee estimate based on buyer's home location
- Add to cart with quantity selector

**SearchBar**
- Real-time search across product names and descriptions
- Case-insensitive matching
- Debounced input for performance

**FilterPanel**
- Location filter (Harar, Dire Dawa, or both)
- Price range slider
- Multiple filters applied with AND logic

#### 4. Shopping Cart

**CartView**
- Lists all cart items with product details
- Quantity adjustment controls
- Remove item button
- Total price calculation (products + delivery fee)
- Checkout button

**CartItem**
- Product thumbnail, name, price, quantity
- Quantity increment/decrement buttons
- Remove button

#### 5. Order Management

**OrderCheckout**
- Summary of cart items
- Delivery fee breakdown (Eastern Triangle Pricing)
- Total amount display
- Payment initiation via Chapa

**OrderList** (Buyer)
- Displays order history in reverse chronological order
- Shows order status, date, total, products
- Filters by status

**OrderDetail** (Buyer)
- Full order information
- Status timeline (PENDING → PAID_ESCROW → DISPATCHED → ARRIVED → COMPLETED)
- OTP display when status is ARRIVED
- Cancel button (only for PENDING or PAID_ESCROW)

**ShopOrderList** (Shop Owner)
- Displays orders containing products from owner's shop
- Filters by status
- Mark as DISPATCHED button for PAID_ESCROW orders

**ShopOrderDetail** (Shop Owner)
- Order items, buyer information, delivery location
- Status update controls
- Delivery instructions

**RunnerOrderView** (Runner)
- Active deliveries assigned to runner
- Mark as ARRIVED button
- OTP submission form for completion

#### 6. Payment Integration

**ChapaPaymentButton**
- Initiates payment flow via Chapa Gateway
- Redirects to Chapa payment interface
- Handles return from Chapa

**PaymentWebhookHandler** (Server Action)
- Receives Chapa webhook callbacks
- Validates payment confirmation
- Updates order status to PAID_ESCROW
- Implements idempotency check (prevents double-crediting)
- Uses Firestore Transaction for atomic updates

#### 7. OTP Verification

**OTPGenerator** (Server-side utility)
- Generates 6-digit random OTP
- Stores OTP with order record
- OTP is displayed to buyer when order status is ARRIVED

**OTPValidator** (Server Action)
- Validates submitted OTP against order record
- Maximum 3 attempts before locking order
- Updates order status to COMPLETED on success
- Releases escrow funds to shop balance

**OTPDisplay** (Buyer UI)
- Shows 6-digit OTP when order status is ARRIVED
- Instructions for providing OTP to runner
- Large, readable font for easy communication

**OTPSubmitForm** (Runner UI)
- Input field for 6-digit OTP
- Submit button
- Error display for invalid OTP
- Attempt counter

#### 8. AI Sales Assistant

**AIChatInterface**
- Chat UI for asking product questions
- Message history display
- Input field with send button
- Typing indicator during API call

**RAGQueryHandler** (Server Action)
- Receives user question
- Retrieves relevant products from Firestore
- Constructs prompt with product data
- Calls OpenAI API with RAG context
- Returns AI-generated response
- Detects user language (Amharic, Afaan Oromo, English)
- Responds in detected language

#### 9. Shop Owner Dashboard

**BalanceDashboard**
- Current balance display
- Pending orders value (PAID_ESCROW, DISPATCHED, ARRIVED)
- Completed orders value
- Transaction history

**TransactionHistory**
- List of all balance changes
- Timestamp, order reference, amount
- Filter by date range

#### 10. Internationalization

**i18nProvider**
- Manages current language state
- Provides translation function to all components
- Loads translation files for Amharic, Afaan Oromo, English

**TranslationFiles**
- JSON files with key-value pairs for each language
- Covers all UI strings (navigation, buttons, labels, forms, notifications)

### Server Actions

All mutations are implemented as Next.js Server Actions with the following structure:

```typescript
'use server'

export async function actionName(params: ParamsType): Promise<ResultType> {
  // 1. Verify telegramId using Firebase Admin SDK
  const user = await verifyTelegramUser(params.telegramId);
  
  // 2. Authorization check (if needed)
  if (requiresShopOwnership) {
    await verifyShopOwnership(user.id, params.shopId);
  }
  
  // 3. Business logic with Firestore Transaction (if needed)
  const result = await adminDb.runTransaction(async (transaction) => {
    // Atomic operations
  });
  
  // 4. Return result
  return result;
}
```

**Product Management Actions**
- `createProduct(data: ProductInput): Promise<Product>`
- `updateProduct(productId: string, data: ProductInput): Promise<Product>`
- `deleteProduct(productId: string): Promise<void>`

**Cart Actions**
- `addToCart(userId: string, productId: string, quantity: number): Promise<void>`
- `updateCartItem(userId: string, productId: string, quantity: number): Promise<void>`
- `removeFromCart(userId: string, productId: string): Promise<void>`

**Order Actions**
- `createOrder(userId: string, cartItems: CartItem[]): Promise<Order>`
- `updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>`
- `cancelOrder(orderId: string, reason: string): Promise<Order>`
- `validateOTP(orderId: string, otp: string): Promise<boolean>`

**Payment Actions**
- `initiateChapaPayment(orderId: string): Promise<{ checkoutUrl: string }>`
- `handleChapaWebhook(payload: ChapaWebhookPayload): Promise<void>`

**Shop Actions**
- `registerShop(data: ShopRegistrationInput): Promise<Shop>`
- `updateShopBalance(shopId: string, amount: number): Promise<void>`

**User Actions**
- `updateHomeLocation(userId: string, location: Location): Promise<void>`
- `updateLanguagePreference(userId: string, language: Language): Promise<void>`

**AI Assistant Actions**
- `queryAIAssistant(question: string, userId: string): Promise<string>`

### External Service Interfaces

#### Chapa Payment Gateway

**Payment Initiation**
```typescript
interface ChapaPaymentRequest {
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

interface ChapaPaymentResponse {
  status: 'success' | 'failed';
  message: string;
  data: {
    checkout_url: string;
  };
}
```

**Webhook Payload**
```typescript
interface ChapaWebhookPayload {
  event: 'charge.success' | 'charge.failed';
  data: {
    tx_ref: string; // orderId
    status: 'success' | 'failed';
    amount: number;
    currency: 'ETB';
    reference: string; // Chapa transaction reference
  };
}
```

#### OpenAI API (RAG Assistant)

**Query Request**
```typescript
interface OpenAIRAGRequest {
  model: 'gpt-4-turbo-preview';
  messages: [
    {
      role: 'system';
      content: string; // System prompt with RAG context
    },
    {
      role: 'user';
      content: string; // User question
    }
  ];
  temperature: number;
  max_tokens: number;
}

interface OpenAIRAGResponse {
  choices: [
    {
      message: {
        role: 'assistant';
        content: string; // AI response
      };
    }
  ];
}
```

#### Telegram Mini App SDK

**User Context**
```typescript
interface TelegramUser {
  id: number; // telegramId
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string; // Used for initial language preference
}

interface TelegramWebApp {
  initDataUnsafe: {
    user: TelegramUser;
  };
  ready(): void;
  close(): void;
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy'): void;
  };
}
```

## Data Models

### Firestore Collections

#### Users Collection (`users`)

```typescript
interface User {
  id: string; // Firestore document ID
  telegramId: string; // Primary identifier from Telegram
  role: 'STUDENT' | 'MERCHANT' | 'RUNNER' | 'ADMIN';
  homeLocation: Location; // Haramaya_Main | Harar_Campus | DDU
  languagePreference: 'am' | 'om' | 'en'; // Amharic, Afaan Oromo, English
  phoneNumber?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes:**
- `telegramId` (unique)
- `homeLocation`

#### Shops Collection (`shops`)

```typescript
interface Shop {
  id: string; // Firestore document ID (shopId)
  name: string;
  ownerId: string; // Reference to User.id
  city: 'Harar' | 'Dire_Dawa'; // Shop location
  contactPhone: string;
  balance: number; // Current balance in ETB
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes:**
- `ownerId`
- `city`

#### Products Collection (`products`)

```typescript
interface Product {
  id: string; // Firestore document ID
  shopId: string; // Reference to Shop.id (tenant isolation)
  name: string;
  description: string;
  price: number; // Price in ETB
  category: string;
  images: string[]; // Firebase Storage URLs (1-5 images)
  stock: number; // Inventory quantity
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes:**
- `shopId`
- `name` (for search)
- `category`
- Composite: `shopId` + `category`

#### Orders Collection (`orders`)

```typescript
interface Order {
  id: string; // Firestore document ID (orderId)
  userId: string; // Reference to User.id (buyer)
  items: OrderItem[];
  totalAmount: number; // Sum of all item prices
  deliveryFee: number; // Calculated by Eastern Triangle Pricing Engine
  status: OrderStatus; // PENDING | PAID_ESCROW | DISPATCHED | ARRIVED | COMPLETED | CANCELLED
  userHomeLocation: Location; // Buyer's home location at time of order
  otpCode: string; // 6-digit OTP for delivery verification
  otpAttempts: number; // Number of OTP validation attempts (max 3)
  chapaTransactionRef?: string; // Chapa transaction reference
  cancellationReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  statusHistory: StatusChange[]; // Audit trail
}

interface OrderItem {
  productId: string;
  shopId: string; // Denormalized for multi-tenant queries
  productName: string; // Denormalized for display
  quantity: number;
  priceAtPurchase: number; // Price at time of order (immutable)
  shopCity: 'Harar' | 'Dire_Dawa'; // Denormalized for delivery fee calculation
}

type OrderStatus = 
  | 'PENDING'       // Order created, awaiting payment
  | 'PAID_ESCROW'   // Payment received, held in escrow
  | 'DISPATCHED'    // Product handed to runner
  | 'ARRIVED'       // Runner reached delivery location
  | 'COMPLETED'     // OTP verified, funds released
  | 'CANCELLED';    // Order cancelled

interface StatusChange {
  from: OrderStatus;
  to: OrderStatus;
  timestamp: Timestamp;
  actor: string; // userId who triggered the change
}
```

**Indexes:**
- `userId`
- `status`
- Composite: `userId` + `status`
- Composite: `items.shopId` + `status` (for shop owner queries)

#### Cart Collection (`carts`)

```typescript
interface Cart {
  id: string; // userId (one cart per user)
  items: CartItem[];
  updatedAt: Timestamp;
}

interface CartItem {
  productId: string;
  quantity: number;
}
```

**Indexes:**
- None (document ID is userId)

#### Shop Transactions Collection (`shopTransactions`)

```typescript
interface ShopTransaction {
  id: string; // Firestore document ID
  shopId: string;
  orderId: string; // Reference to Order.id
  amount: number; // Amount in ETB
  type: 'CREDIT' | 'DEBIT'; // CREDIT for completed orders, DEBIT for withdrawals
  balanceBefore: number;
  balanceAfter: number;
  timestamp: Timestamp;
}
```

**Indexes:**
- `shopId`
- Composite: `shopId` + `timestamp`

### Firebase Storage Structure

```
/products
  /{shopId}
    /{productId}
      /image_0.jpg
      /image_1.jpg
      ...
```

### Type Definitions

All TypeScript interfaces are defined in `src/types/index.ts` with strict type checking enabled. The existing types will be extended to match the data models above.

### Eastern Triangle Pricing Engine

The delivery fee calculation is implemented as a pure function:

```typescript
type ShopCity = 'Harar' | 'Dire_Dawa';
type UserLocation = 'Haramaya_Main' | 'Harar_Campus' | 'DDU';

interface DeliveryRoute {
  fee: number; // ETB
  estimatedTime: string; // Human-readable estimate
}

function calculateDeliveryFee(
  shopCity: ShopCity,
  userLocation: UserLocation
): DeliveryRoute {
  // Intra-city routes (40 ETB, 30min-1hr)
  if (shopCity === 'Harar' && userLocation === 'Harar_Campus') {
    return { fee: 40, estimatedTime: '30 minutes - 1 hour' };
  }
  if (shopCity === 'Dire_Dawa' && userLocation === 'DDU') {
    return { fee: 40, estimatedTime: '30 minutes - 1 hour' };
  }
  
  // City-to-campus routes (80-120 ETB, 3-4 hours)
  if (
    (shopCity === 'Harar' && userLocation === 'Haramaya_Main') ||
    (shopCity === 'Dire_Dawa' && userLocation === 'Haramaya_Main')
  ) {
    return { fee: 100, estimatedTime: '3-4 hours' }; // Using midpoint of 80-120
  }
  
  // Inter-city routes (180 ETB, 5-6 hours)
  if (
    (shopCity === 'Harar' && userLocation === 'DDU') ||
    (shopCity === 'Dire_Dawa' && userLocation === 'Harar_Campus')
  ) {
    return { fee: 180, estimatedTime: '5-6 hours' };
  }
  
  throw new Error(`Invalid route: ${shopCity} to ${userLocation}`);
}
```

### Escrow State Machine

The order status follows a strict state machine with allowed transitions:

```
PENDING ──────────────────────────────────────────────┐
   │                                                   │
   │ (payment success)                                 │ (cancel)
   ▼                                                   ▼
PAID_ESCROW ──────────────────────────────────────> CANCELLED
   │                                                   ▲
   │ (shop owner marks dispatched)                     │
   ▼                                                   │
DISPATCHED ────────────────────────────────────────────┘
   │                                                (cannot cancel)
   │ (runner marks arrived)
   ▼
ARRIVED
   │
   │ (OTP validated)
   ▼
COMPLETED
```

**Allowed Transitions:**
- `PENDING → PAID_ESCROW` (payment webhook)
- `PENDING → CANCELLED` (user cancellation)
- `PAID_ESCROW → DISPATCHED` (shop owner action)
- `PAID_ESCROW → CANCELLED` (user cancellation with refund)
- `DISPATCHED → ARRIVED` (runner action)
- `ARRIVED → COMPLETED` (OTP validation)

**Forbidden Transitions:**
- Cannot cancel after `DISPATCHED`
- Cannot skip states (e.g., `PENDING → DISPATCHED`)
- Cannot reverse states (e.g., `COMPLETED → ARRIVED`)

All state transitions are enforced in Server Actions with validation logic.



## Correctness Properties

This section defines executable correctness properties for property-based testing to verify the system behaves correctly under all conditions.

### Property 1: Multi-Tenant Isolation

**Property Statement:** For any two distinct shops S1 and S2, a shop owner of S1 can never access, modify, or delete products belonging to S2.

**Formal Specification:**
```
∀ shopOwner1, shopOwner2, product ∈ Products:
  (shopOwner1.shopId ≠ shopOwner2.shopId) ∧ (product.shopId = shopOwner2.shopId)
  ⟹ canAccess(shopOwner1, product) = false
```

**Test Strategy:**
- Generate random shop owners and products
- Attempt cross-tenant operations (read, update, delete)
- Assert all operations fail with authorization error

**Implementation:**
```typescript
// Property test using fast-check
fc.assert(
  fc.property(
    fc.record({
      shopOwner1: shopOwnerArbitrary(),
      shopOwner2: shopOwnerArbitrary(),
      product: productArbitrary()
    }),
    async ({ shopOwner1, shopOwner2, product }) => {
      fc.pre(shopOwner1.shopId !== shopOwner2.shopId);
      fc.pre(product.shopId === shopOwner2.shopId);
      
      // Attempt to access product from shopOwner1
      const result = await updateProduct(
        product.id,
        { name: 'Hacked' },
        shopOwner1.id
      );
      
      // Should fail with authorization error
      expect(result.error).toBe('UNAUTHORIZED');
    }
  )
);
```

### Property 2: Eastern Triangle Pricing Consistency

**Property Statement:** The delivery fee calculation must always return the correct fee based on the route matrix, and the fee must be deterministic (same inputs always produce same output).

**Formal Specification:**
```
∀ shopCity ∈ {Harar, Dire_Dawa}, userLocation ∈ {Haramaya_Main, Harar_Campus, DDU}:
  calculateDeliveryFee(shopCity, userLocation) = ROUTE_MATRIX[shopCity][userLocation]
  ∧ calculateDeliveryFee(shopCity, userLocation) = calculateDeliveryFee(shopCity, userLocation)
```

**Route Matrix:**
```
Harar → Harar_Campus: 40 ETB
Harar → Haramaya_Main: 100 ETB
Harar → DDU: 180 ETB
Dire_Dawa → DDU: 40 ETB
Dire_Dawa → Haramaya_Main: 100 ETB
Dire_Dawa → Harar_Campus: 180 ETB
```

**Test Strategy:**
- Generate all possible route combinations
- Verify fee matches expected value
- Call function multiple times with same inputs, verify determinism

**Implementation:**
```typescript
fc.assert(
  fc.property(
    fc.record({
      shopCity: fc.constantFrom('Harar', 'Dire_Dawa'),
      userLocation: fc.constantFrom('Haramaya_Main', 'Harar_Campus', 'DDU')
    }),
    ({ shopCity, userLocation }) => {
      const result1 = calculateDeliveryFee(shopCity, userLocation);
      const result2 = calculateDeliveryFee(shopCity, userLocation);
      
      // Determinism check
      expect(result1.fee).toBe(result2.fee);
      
      // Correctness check
      const expectedFee = ROUTE_MATRIX[shopCity][userLocation];
      expect(result1.fee).toBe(expectedFee);
    }
  )
);
```

### Property 3: Escrow State Machine Validity

**Property Statement:** Order status transitions must follow the allowed state machine paths. No invalid transitions are permitted.

**Formal Specification:**
```
∀ order ∈ Orders, newStatus ∈ OrderStatus:
  updateOrderStatus(order.id, newStatus) succeeds
  ⟺ (order.status, newStatus) ∈ ALLOWED_TRANSITIONS
```

**Allowed Transitions:**
```
PENDING → PAID_ESCROW
PENDING → CANCELLED
PAID_ESCROW → DISPATCHED
PAID_ESCROW → CANCELLED
DISPATCHED → ARRIVED
ARRIVED → COMPLETED
```

**Test Strategy:**
- Generate random order with random current status
- Attempt transition to random new status
- Verify success only for allowed transitions

**Implementation:**
```typescript
fc.assert(
  fc.property(
    fc.record({
      currentStatus: orderStatusArbitrary(),
      newStatus: orderStatusArbitrary()
    }),
    async ({ currentStatus, newStatus }) => {
      const order = await createTestOrder({ status: currentStatus });
      const result = await updateOrderStatus(order.id, newStatus);
      
      const isAllowed = ALLOWED_TRANSITIONS.some(
        ([from, to]) => from === currentStatus && to === newStatus
      );
      
      if (isAllowed) {
        expect(result.success).toBe(true);
        expect(result.order.status).toBe(newStatus);
      } else {
        expect(result.error).toBe('INVALID_TRANSITION');
      }
    }
  )
);
```

### Property 4: OTP Validation Security

**Property Statement:** An order can only be completed with the correct OTP, and after 3 failed attempts, the order must be locked.

**Formal Specification:**
```
∀ order ∈ Orders, submittedOTP ∈ String:
  (submittedOTP = order.otpCode) ⟹ validateOTP(order.id, submittedOTP) = true
  ∧ (submittedOTP ≠ order.otpCode) ⟹ validateOTP(order.id, submittedOTP) = false
  ∧ (order.otpAttempts ≥ 3) ⟹ validateOTP(order.id, *) = LOCKED
```

**Test Strategy:**
- Generate order with random OTP
- Submit incorrect OTPs up to 3 times
- Verify order is locked after 3 attempts
- Generate order with correct OTP, verify success

**Implementation:**
```typescript
fc.assert(
  fc.property(
    fc.record({
      correctOTP: fc.string({ minLength: 6, maxLength: 6 }),
      incorrectOTPs: fc.array(fc.string({ minLength: 6, maxLength: 6 }), { minLength: 3, maxLength: 3 })
    }),
    async ({ correctOTP, incorrectOTPs }) => {
      fc.pre(incorrectOTPs.every(otp => otp !== correctOTP));
      
      const order = await createTestOrder({ 
        status: 'ARRIVED',
        otpCode: correctOTP 
      });
      
      // Submit 3 incorrect OTPs
      for (const wrongOTP of incorrectOTPs) {
        const result = await validateOTP(order.id, wrongOTP);
        expect(result.success).toBe(false);
      }
      
      // Order should now be locked
      const lockedResult = await validateOTP(order.id, correctOTP);
      expect(lockedResult.error).toBe('ORDER_LOCKED');
    }
  )
);
```

### Property 5: Payment Webhook Idempotency

**Property Statement:** Processing the same payment webhook multiple times must not result in duplicate credits or status changes.

**Formal Specification:**
```
∀ webhookPayload ∈ ChapaWebhookPayload:
  let result1 = handleChapaWebhook(webhookPayload)
  let result2 = handleChapaWebhook(webhookPayload)
  ⟹ (result1.order.status = result2.order.status)
    ∧ (result1.statusChangeCount = 1)
    ∧ (result2.statusChangeCount = 0)
```

**Test Strategy:**
- Generate random webhook payload
- Process webhook twice
- Verify order status changed only once
- Verify no duplicate balance credits

**Implementation:**
```typescript
fc.assert(
  fc.property(
    fc.record({
      orderId: fc.uuid(),
      amount: fc.integer({ min: 100, max: 10000 }),
      txRef: fc.uuid()
    }),
    async ({ orderId, amount, txRef }) => {
      const order = await createTestOrder({ 
        id: orderId,
        status: 'PENDING',
        totalAmount: amount 
      });
      
      const webhookPayload = {
        event: 'charge.success',
        data: {
          tx_ref: orderId,
          status: 'success',
          amount,
          reference: txRef
        }
      };
      
      // Process webhook first time
      const result1 = await handleChapaWebhook(webhookPayload);
      expect(result1.statusChanged).toBe(true);
      
      const orderAfterFirst = await getOrder(orderId);
      expect(orderAfterFirst.status).toBe('PAID_ESCROW');
      
      // Process webhook second time (duplicate)
      const result2 = await handleChapaWebhook(webhookPayload);
      expect(result2.statusChanged).toBe(false);
      expect(result2.message).toContain('already processed');
      
      const orderAfterSecond = await getOrder(orderId);
      expect(orderAfterSecond.status).toBe('PAID_ESCROW');
      expect(orderAfterSecond).toEqual(orderAfterFirst);
    }
  )
);
```

### Property 6: Shop Balance Consistency

**Property Statement:** The shop balance must always equal the sum of all completed order amounts minus withdrawals.

**Formal Specification:**
```
∀ shop ∈ Shops:
  shop.balance = Σ(order.totalAmount | order.shopId = shop.id ∧ order.status = COMPLETED)
                 - Σ(withdrawal.amount | withdrawal.shopId = shop.id)
```

**Test Strategy:**
- Generate random sequence of orders and completions
- Track expected balance manually
- Verify shop balance matches expected value

**Implementation:**
```typescript
fc.assert(
  fc.property(
    fc.record({
      shopId: fc.uuid(),
      orders: fc.array(
        fc.record({
          amount: fc.integer({ min: 100, max: 5000 }),
          shouldComplete: fc.boolean()
        }),
        { minLength: 1, maxLength: 20 }
      )
    }),
    async ({ shopId, orders }) => {
      const shop = await createTestShop({ id: shopId, balance: 0 });
      
      let expectedBalance = 0;
      
      for (const orderData of orders) {
        const order = await createTestOrder({
          shopId,
          totalAmount: orderData.amount,
          status: 'PAID_ESCROW'
        });
        
        if (orderData.shouldComplete) {
          await completeOrder(order.id);
          expectedBalance += orderData.amount;
        }
      }
      
      const finalShop = await getShop(shopId);
      expect(finalShop.balance).toBe(expectedBalance);
    }
  )
);
```

### Property 7: Cart Total Calculation

**Property Statement:** The cart total must always equal the sum of (price × quantity) for all items.

**Formal Specification:**
```
∀ cart ∈ Carts:
  calculateCartTotal(cart) = Σ(item.price × item.quantity | item ∈ cart.items)
```

**Test Strategy:**
- Generate random cart with random items
- Calculate total manually
- Verify system calculation matches

**Implementation:**
```typescript
fc.assert(
  fc.property(
    fc.array(
      fc.record({
        price: fc.integer({ min: 10, max: 1000 }),
        quantity: fc.integer({ min: 1, max: 10 })
      }),
      { minLength: 1, maxLength: 20 }
    ),
    async (items) => {
      const cart = await createTestCart({ items });
      
      const expectedTotal = items.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
      );
      
      const calculatedTotal = await calculateCartTotal(cart.id);
      expect(calculatedTotal).toBe(expectedTotal);
    }
  )
);
```

### Property 8: Product Stock Consistency

**Property Statement:** Product stock must never go negative, and order creation must fail if insufficient stock.

**Formal Specification:**
```
∀ product ∈ Products, order ∈ Orders:
  (order.items.find(i => i.productId = product.id).quantity > product.stock)
  ⟹ createOrder(order) fails with INSUFFICIENT_STOCK
  ∧ product.stock ≥ 0
```

**Test Strategy:**
- Generate product with random stock
- Attempt to create order with quantity > stock
- Verify order creation fails
- Verify stock never goes negative

**Implementation:**
```typescript
fc.assert(
  fc.property(
    fc.record({
      initialStock: fc.integer({ min: 0, max: 100 }),
      orderQuantity: fc.integer({ min: 1, max: 150 })
    }),
    async ({ initialStock, orderQuantity }) => {
      const product = await createTestProduct({ stock: initialStock });
      
      const result = await createOrder({
        items: [{ productId: product.id, quantity: orderQuantity }]
      });
      
      if (orderQuantity > initialStock) {
        expect(result.error).toBe('INSUFFICIENT_STOCK');
        
        const productAfter = await getProduct(product.id);
        expect(productAfter.stock).toBe(initialStock);
      } else {
        expect(result.success).toBe(true);
        
        const productAfter = await getProduct(product.id);
        expect(productAfter.stock).toBe(initialStock - orderQuantity);
        expect(productAfter.stock).toBeGreaterThanOrEqual(0);
      }
    }
  )
);
```

### Property 9: Language Detection Accuracy

**Property Statement:** The AI Sales Assistant must correctly detect the language of user input (Amharic, Afaan Oromo, or English).

**Formal Specification:**
```
∀ userInput ∈ String:
  (containsAmharicScript(userInput) ⟹ detectLanguage(userInput) = 'am')
  ∧ (containsOromoKeywords(userInput) ⟹ detectLanguage(userInput) = 'om')
  ∧ (isEnglishOnly(userInput) ⟹ detectLanguage(userInput) = 'en')
```

**Test Strategy:**
- Generate sample inputs in each language
- Verify correct language detection
- Test mixed-language inputs

**Implementation:**
```typescript
fc.assert(
  fc.property(
    fc.constantFrom(
      { text: 'ምርቶች ምንድን ናቸው?', expected: 'am' },
      { text: 'Oomisha maalii qabdu?', expected: 'om' },
      { text: 'What products do you have?', expected: 'en' }
    ),
    async ({ text, expected }) => {
      const detected = await detectLanguage(text);
      expect(detected).toBe(expected);
    }
  )
);
```

### Property 10: Firestore Transaction Atomicity

**Property Statement:** When a Firestore transaction updates multiple documents, either all updates succeed or none do (atomicity).

**Formal Specification:**
```
∀ transaction T updating documents D1, D2, ..., Dn:
  (T succeeds ⟹ ∀ Di: Di.updated = true)
  ∧ (T fails ⟹ ∀ Di: Di.state = Di.stateBefore)
```

**Test Strategy:**
- Create transaction that updates order status and shop balance
- Simulate failure mid-transaction
- Verify rollback occurred (no partial updates)

**Implementation:**
```typescript
fc.assert(
  fc.property(
    fc.record({
      orderId: fc.uuid(),
      shopId: fc.uuid(),
      amount: fc.integer({ min: 100, max: 5000 }),
      shouldFail: fc.boolean()
    }),
    async ({ orderId, shopId, amount, shouldFail }) => {
      const initialOrder = await createTestOrder({
        id: orderId,
        shopId,
        status: 'ARRIVED',
        totalAmount: amount
      });
      
      const initialShop = await getShop(shopId);
      const initialBalance = initialShop.balance;
      
      try {
        await completeOrderWithTransaction(orderId, shouldFail);
        
        if (shouldFail) {
          throw new Error('Transaction should have failed');
        }
        
        // Both updates should succeed
        const finalOrder = await getOrder(orderId);
        const finalShop = await getShop(shopId);
        
        expect(finalOrder.status).toBe('COMPLETED');
        expect(finalShop.balance).toBe(initialBalance + amount);
      } catch (error) {
        // Transaction failed, verify rollback
        const finalOrder = await getOrder(orderId);
        const finalShop = await getShop(shopId);
        
        expect(finalOrder.status).toBe('ARRIVED');
        expect(finalShop.balance).toBe(initialBalance);
      }
    }
  )
);
```

## Testing Strategy

### Unit Tests
- Test individual functions and utilities
- Mock external dependencies (Firebase, Chapa, OpenAI)
- Focus on business logic correctness

### Integration Tests
- Test Server Actions with real Firebase emulator
- Test payment webhook flow with Chapa sandbox
- Test AI assistant with OpenAI test API

### Property-Based Tests
- Implement all 10 correctness properties above
- Use fast-check library for property testing
- Run with high iteration count (1000+ per property)

### End-to-End Tests
- Test complete user flows (browse → cart → checkout → delivery → completion)
- Test shop owner flows (product creation → order fulfillment)
- Test runner flows (delivery → OTP submission)
- Use Playwright for Telegram Mini App testing

### Performance Tests
- Load test with 1000+ concurrent users
- Test image loading performance on slow networks
- Test Firestore query performance with large datasets

## Deployment

### Environment Variables

```env
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Server-side only)
FIREBASE_SERVICE_ACCOUNT_KEY=

# Chapa Payment Gateway
CHAPA_SECRET_KEY=
CHAPA_WEBHOOK_SECRET=
CHAPA_MODE=sandbox # or production

# OpenAI
OPENAI_API_KEY=

# Telegram
TELEGRAM_BOT_TOKEN=
```

### Deployment Steps

1. **Firebase Setup**
   - Create Firebase project
   - Enable Firestore, Auth, Storage
   - Deploy Firestore security rules
   - Create service account and download key

2. **Chapa Integration**
   - Register for Chapa merchant account
   - Obtain sandbox and production API keys
   - Configure webhook URL

3. **Next.js Deployment**
   - Deploy to Vercel or similar platform
   - Configure environment variables
   - Enable Server Actions

4. **Telegram Mini App**
   - Register bot with BotFather
   - Configure Mini App URL
   - Set up bot commands and menu

### Monitoring and Observability

- **Error Tracking**: Sentry for error monitoring
- **Analytics**: Firebase Analytics for user behavior
- **Logging**: Structured logging for Server Actions
- **Alerts**: Set up alerts for payment failures, OTP lockouts, high error rates

## Security Considerations

1. **Authentication**: All Server Actions verify telegramId via Firebase Admin SDK
2. **Authorization**: Multi-tenant isolation enforced server-side
3. **Payment Security**: Webhook signature verification for Chapa callbacks
4. **Data Validation**: Input validation on all Server Actions
5. **Rate Limiting**: Implement rate limiting on sensitive operations (OTP validation, payment initiation)
6. **HTTPS Only**: All communication over HTTPS
7. **Environment Variables**: Sensitive keys stored securely, never committed to git

## Performance Optimization

1. **Image Optimization**: Next.js Image component with lazy loading
2. **Code Splitting**: Dynamic imports for heavy components
3. **Caching**: Cache product catalog with revalidation
4. **Database Indexing**: Firestore indexes on frequently queried fields
5. **Bundle Size**: Keep Telegram Mini App bundle under 1MB
6. **Mobile Data**: Optimize for 3G/4G networks in Eastern Ethiopia

## Accessibility

1. **Touch Targets**: Minimum 44x44px for all interactive elements
2. **Color Contrast**: WCAG AA compliance for text and UI elements
3. **Font Sizing**: Support for Ethiopic script with appropriate sizing
4. **Keyboard Navigation**: Full keyboard support for web interface
5. **Screen Reader**: Semantic HTML and ARIA labels

## Internationalization (i18n)

### Translation Files Structure

```
/locales
  /am (Amharic)
    common.json
    products.json
    orders.json
    errors.json
  /om (Afaan Oromo)
    common.json
    products.json
    orders.json
    errors.json
  /en (English)
    common.json
    products.json
    orders.json
    errors.json
```

### Translation Keys

All UI strings use translation keys:
```typescript
t('common.welcome') // "እንኳን ደህና መጡ" (Amharic)
t('products.addToCart') // "ወደ ጋሪ ጨምር" (Amharic)
t('orders.status.paid_escrow') // "ክፍያ ተደርጓል" (Amharic)
```

### RTL Support

While Amharic and Afaan Oromo are LTR, the UI must handle varying text lengths gracefully due to Ethiopic script characteristics.

## Conclusion

This design document provides a comprehensive blueprint for implementing the Misrak Shemeta marketplace platform. The architecture prioritizes security, performance, and cultural relevance while maintaining strict correctness properties verified through property-based testing. The implementation follows the Eastern Triangle Context Constraint, ensuring geographic fidelity, linguistic priority, cultural trust, and mobile-reality optimization throughout the system.
