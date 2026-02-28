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
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Admin UI                           │   │
│  │  Dashboard | Users | Shops | Products | Orders      │   │
│  │  Financial | Monitoring                             │   │
│  └──────────────────────────────────────────────────────┘   │
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
│  │  • Admin Operations    • Audit Logging               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Business Logic Layer                        │   │
│  │  • Eastern Triangle Pricing Engine                   │   │
│  │  • Escrow State Machine                              │   │
│  │  • Multi-Tenant Isolation                            │   │
│  │  • OTP Generation & Validation                       │   │
│  │  • Admin Authorization & Audit                       │   │
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

#### 11. Admin Dashboard and Management

**AdminAuthMiddleware**
- Server-side middleware for admin route protection
- Verifies telegramId against ADMIN_TELEGRAM_IDS environment variable
- Rejects unauthorized access with 403 error
- Applied to all /admin routes

**AdminLayout**
- Layout component for admin pages
- Navigation sidebar with links to all admin sections
- Displays admin user information
- Responsive design (desktop-focused, mobile-compatible)

**AdminDashboard**
- Overview page with platform statistics
- Displays total users, shops, products, orders
- Shows total platform revenue and pending escrow amount
- Recent orders list (last 20)
- Quick action buttons for common tasks

**AdminNav**
- Navigation component for admin sidebar
- Links to: Dashboard, Users, Shops, Products, Orders, Financial, Monitoring
- Active route highlighting
- Collapsible on mobile

**StatCard**
- Reusable component for displaying metrics
- Shows label, value, and optional trend indicator
- Supports different color schemes for different metric types

**UserManagement**
- Table view of all users with pagination
- Columns: telegramId, Home_Location, registration date, total orders, status
- Search by telegramId or date range
- Actions: Suspend, Activate, Change Role
- Bulk actions support

**UserTable**
- Data table component for user list
- Sortable columns
- Row selection for bulk actions
- Status badges (active, suspended)

**ShopManagement**
- Table view of all shops with pagination
- Columns: shop name, Location, owner telegramId, registration date, balance, products count, status
- Search by shop name, Location, or date range
- Actions: Suspend, Activate, Adjust Balance
- Bulk actions support

**ShopTable**
- Data table component for shop list
- Sortable columns
- Row selection for bulk actions
- Balance display with formatting
- Status badges (active, suspended)

**ProductModeration**
- Grid/table view of all products with pagination
- Columns: product name, shop name, price, images, creation date
- Search by product name, shop name, or price range
- Actions: Remove Product
- Image preview on hover
- Bulk removal support

**ProductTable**
- Data table component for product list
- Sortable columns
- Image thumbnails
- Price formatting
- Remove action with confirmation dialog

**OrderManagement**
- Table view of all orders with pagination
- Columns: orderId, user telegramId, shop name, status, total price, order date
- Search by orderId, user, shop, status, or date range
- Actions: Manual Status Update, Manual Refund
- Status filter dropdown
- Export to CSV

**OrderTable**
- Data table component for order list
- Sortable columns
- Status badges with color coding
- Price formatting
- Action buttons per row

**FinancialReporting**
- Financial analytics dashboard
- Date range selector
- Total platform revenue display
- Revenue breakdown by shop (table)
- Revenue breakdown by location (chart)
- Delivery fee revenue
- Top-performing shops list
- Export to CSV button

**RevenueChart**
- Chart component for revenue visualization
- Line chart for revenue over time
- Bar chart for revenue by location
- Pie chart for revenue by shop

**SystemMonitoring**
- System health dashboard
- Real-time statistics: active users, pending orders, failed payments
- Error logs table with filtering
- Payment webhook call history
- Failed Firestore transaction logs
- Chapa API statistics (success rate, response time)
- Auto-refresh every 30 seconds

**ErrorLogTable**
- Table component for error logs
- Columns: timestamp, error type, affected entity, error message
- Filter by date range, error type
- Expandable rows for full error details

**WebhookHistoryTable**
- Table component for webhook call history
- Columns: timestamp, orderId, status, response code
- Filter by date range, status
- Retry button for failed webhooks

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

**Admin Actions**
- `verifyAdminAccess(telegramId: string): Promise<boolean>`
- `getPlatformStatistics(): Promise<PlatformStats>`
- `getAllUsers(filters: UserFilters): Promise<User[]>`
- `suspendUser(userId: string, reason: string, adminId: string): Promise<void>`
- `activateUser(userId: string, adminId: string): Promise<void>`
- `changeUserRole(userId: string, newRole: UserRole, adminId: string): Promise<void>`
- `getAllShops(filters: ShopFilters): Promise<Shop[]>`
- `suspendShop(shopId: string, reason: string, adminId: string): Promise<void>`
- `activateShop(shopId: string, adminId: string): Promise<void>`
- `adjustShopBalance(shopId: string, amount: number, reason: string, adminId: string): Promise<void>`
- `getAllProducts(filters: ProductFilters): Promise<Product[]>`
- `removeProduct(productId: string, reason: string, adminId: string): Promise<void>`
- `getAllOrders(filters: OrderFilters): Promise<Order[]>`
- `manualUpdateOrderStatus(orderId: string, newStatus: OrderStatus, reason: string, adminId: string): Promise<Order>`
- `manualRefundOrder(orderId: string, reason: string, adminId: string): Promise<void>`
- `generateFinancialReport(startDate: Date, endDate: Date): Promise<FinancialReport>`
- `exportFinancialReportCSV(startDate: Date, endDate: Date): Promise<string>`
- `getSystemMonitoring(): Promise<SystemMonitoringData>`
- `getErrorLogs(filters: ErrorLogFilters): Promise<ErrorLog[]>`
- `getWebhookHistory(filters: WebhookFilters): Promise<WebhookCall[]>`

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
  suspended: boolean; // Admin suspension flag
  suspendedAt?: Timestamp;
  suspendedReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes:**
- `telegramId` (unique)
- `homeLocation`
- `suspended`

#### Shops Collection (`shops`)

```typescript
interface Shop {
  id: string; // Firestore document ID (shopId)
  name: string;
  ownerId: string; // Reference to User.id
  city: 'Harar' | 'Dire_Dawa'; // Shop location
  contactPhone: string;
  balance: number; // Current balance in ETB
  suspended: boolean; // Admin suspension flag
  suspendedAt?: Timestamp;
  suspendedReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes:**
- `ownerId`
- `city`
- `suspended`

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

#### Admin Logs Collection (`adminLogs`)

```typescript
interface AdminLog {
  id: string; // Firestore document ID
  adminId: string; // Reference to User.id (admin who performed action)
  adminTelegramId: string; // Denormalized for quick lookup
  action: AdminAction; // Type of admin action
  targetType: 'USER' | 'SHOP' | 'PRODUCT' | 'ORDER';
  targetId: string; // ID of affected entity
  targetDetails: Record<string, any>; // Snapshot of entity at time of action
  reason?: string; // Admin-provided reason for action
  metadata: Record<string, any>; // Additional action-specific data
  timestamp: Timestamp;
}

type AdminAction =
  | 'USER_SUSPEND'
  | 'USER_ACTIVATE'
  | 'USER_ROLE_CHANGE'
  | 'SHOP_SUSPEND'
  | 'SHOP_ACTIVATE'
  | 'SHOP_BALANCE_ADJUST'
  | 'PRODUCT_REMOVE'
  | 'ORDER_STATUS_UPDATE'
  | 'ORDER_REFUND';
```

**Indexes:**
- `adminId`
- `action`
- `targetType`
- `timestamp`
- Composite: `adminId` + `timestamp`
- Composite: `targetType` + `targetId`

#### Error Logs Collection (`errorLogs`)

```typescript
interface ErrorLog {
  id: string; // Firestore document ID
  errorType: string; // Error classification
  errorMessage: string;
  stackTrace?: string;
  affectedEntityType?: 'USER' | 'SHOP' | 'PRODUCT' | 'ORDER';
  affectedEntityId?: string;
  userId?: string; // User who triggered the error (if applicable)
  shopId?: string; // Shop involved in the error (if applicable)
  requestPath?: string; // API path or Server Action name
  requestPayload?: Record<string, any>; // Sanitized request data
  timestamp: Timestamp;
}
```

**Indexes:**
- `errorType`
- `timestamp`
- `affectedEntityType`
- Composite: `errorType` + `timestamp`

#### Webhook Calls Collection (`webhookCalls`)

```typescript
interface WebhookCall {
  id: string; // Firestore document ID
  provider: 'CHAPA'; // Payment provider
  event: string; // Webhook event type
  orderId: string; // Associated order
  payload: Record<string, any>; // Full webhook payload
  responseCode: number; // HTTP response code sent back
  processed: boolean; // Whether webhook was successfully processed
  error?: string; // Error message if processing failed
  timestamp: Timestamp;
}
```

**Indexes:**
- `orderId`
- `provider`
- `processed`
- `timestamp`
- Composite: `provider` + `timestamp`

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

### Admin Authentication and Authorization

Admin access is controlled through environment variable configuration and server-side verification:

#### Environment Variable Configuration

```env
# Admin Telegram IDs (comma-separated list)
ADMIN_TELEGRAM_IDS=123456789,987654321,555666777
```

#### Admin Verification Function

```typescript
async function verifyAdminAccess(telegramId: string): Promise<boolean> {
  const adminIds = process.env.ADMIN_TELEGRAM_IDS?.split(',') || [];
  return adminIds.includes(telegramId);
}
```

#### Admin Middleware

All admin routes (`/admin/*`) are protected by server-side middleware:

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const telegramId = await getTelegramIdFromRequest(request);
    
    if (!telegramId) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    const isAdmin = await verifyAdminAccess(telegramId);
    
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  return NextResponse.next();
}
```

#### Admin Server Action Authorization

All admin Server Actions verify admin access before execution:

```typescript
'use server'

export async function suspendUser(
  userId: string,
  reason: string,
  adminTelegramId: string
): Promise<void> {
  // 1. Verify admin access
  const isAdmin = await verifyAdminAccess(adminTelegramId);
  if (!isAdmin) {
    throw new Error('UNAUTHORIZED: Admin access required');
  }
  
  // 2. Get admin user record
  const adminUser = await getUserByTelegramId(adminTelegramId);
  
  // 3. Perform action with transaction
  await adminDb.runTransaction(async (transaction) => {
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists) {
      throw new Error('USER_NOT_FOUND');
    }
    
    // Update user
    transaction.update(userRef, {
      suspended: true,
      suspendedAt: FieldValue.serverTimestamp(),
      suspendedReason: reason,
      updatedAt: FieldValue.serverTimestamp()
    });
    
    // Create audit log
    const logRef = adminDb.collection('adminLogs').doc();
    transaction.set(logRef, {
      adminId: adminUser.id,
      adminTelegramId,
      action: 'USER_SUSPEND',
      targetType: 'USER',
      targetId: userId,
      targetDetails: userDoc.data(),
      reason,
      metadata: {},
      timestamp: FieldValue.serverTimestamp()
    });
  });
}
```

#### Admin Route Protection Pattern

All admin pages follow this pattern:

```typescript
// app/admin/users/page.tsx
export default async function AdminUsersPage() {
  // Get telegram ID from context
  const telegramId = await getTelegramId();
  
  // Verify admin access (redundant with middleware, but defense in depth)
  const isAdmin = await verifyAdminAccess(telegramId);
  
  if (!isAdmin) {
    redirect('/unauthorized');
  }
  
  // Fetch data and render
  const users = await getAllUsers({});
  
  return <UserManagement users={users} />;
}
```

### Admin File Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx              # Admin layout with navigation
│   │   ├── page.tsx                # Admin dashboard (overview)
│   │   ├── users/
│   │   │   └── page.tsx            # User management
│   │   ├── shops/
│   │   │   └── page.tsx            # Shop management
│   │   ├── products/
│   │   │   └── page.tsx            # Product moderation
│   │   ├── orders/
│   │   │   └── page.tsx            # Order management
│   │   ├── financial/
│   │   │   └── page.tsx            # Financial reporting
│   │   └── monitoring/
│   │       └── page.tsx            # System monitoring
│   └── actions/
│       └── admin/
│           ├── users.ts            # User management actions
│           ├── shops.ts            # Shop management actions
│           ├── products.ts         # Product moderation actions
│           ├── orders.ts           # Order management actions
│           ├── reports.ts          # Financial reporting actions
│           └── monitoring.ts       # System monitoring actions
├── components/
│   └── admin/
│       ├── AdminNav.tsx            # Admin navigation sidebar
│       ├── StatCard.tsx            # Metric display card
│       ├── UserTable.tsx           # User list table
│       ├── ShopTable.tsx           # Shop list table
│       ├── ProductTable.tsx        # Product list table
│       ├── OrderTable.tsx          # Order list table
│       ├── RevenueChart.tsx        # Revenue visualization
│       ├── ErrorLogTable.tsx       # Error logs table
│       └── WebhookHistoryTable.tsx # Webhook history table
└── lib/
    └── admin/
        ├── auth.ts                 # Admin authentication utilities
        ├── audit.ts                # Audit logging utilities
        └── reports.ts              # Report generation utilities
```

### Admin Audit Logging

All admin actions are logged to the `adminLogs` collection for audit trail:

```typescript
async function logAdminAction(
  adminId: string,
  adminTelegramId: string,
  action: AdminAction,
  targetType: 'USER' | 'SHOP' | 'PRODUCT' | 'ORDER',
  targetId: string,
  targetDetails: Record<string, any>,
  reason?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await adminDb.collection('adminLogs').add({
    adminId,
    adminTelegramId,
    action,
    targetType,
    targetId,
    targetDetails,
    reason,
    metadata: metadata || {},
    timestamp: FieldValue.serverTimestamp()
  });
}
```

### Admin Dashboard Statistics

The admin dashboard displays real-time platform statistics:

```typescript
interface PlatformStats {
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

async function getPlatformStatistics(): Promise<PlatformStats> {
  const [users, shops, products, orders] = await Promise.all([
    adminDb.collection('users').get(),
    adminDb.collection('shops').get(),
    adminDb.collection('products').get(),
    adminDb.collection('orders').get()
  ]);
  
  const completedOrders = orders.docs.filter(
    doc => doc.data().status === 'COMPLETED'
  );
  
  const escrowOrders = orders.docs.filter(doc =>
    ['PAID_ESCROW', 'DISPATCHED', 'ARRIVED'].includes(doc.data().status)
  );
  
  const totalRevenue = completedOrders.reduce(
    (sum, doc) => sum + doc.data().totalAmount,
    0
  );
  
  const pendingEscrow = escrowOrders.reduce(
    (sum, doc) => sum + doc.data().totalAmount,
    0
  );
  
  const suspendedUsers = users.docs.filter(
    doc => doc.data().suspended === true
  ).length;
  
  const suspendedShops = shops.docs.filter(
    doc => doc.data().suspended === true
  ).length;
  
  const recentOrders = orders.docs
    .sort((a, b) => b.data().createdAt - a.data().createdAt)
    .slice(0, 20)
    .map(doc => ({ id: doc.id, ...doc.data() }));
  
  return {
    totalUsers: users.size,
    totalShops: shops.size,
    totalProducts: products.size,
    totalOrders: orders.size,
    totalRevenue,
    pendingEscrow,
    activeUsers: 0, // TODO: Calculate from orders in last 30 days
    suspendedUsers,
    suspendedShops,
    recentOrders
  };
}
```

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

### Property 11: Admin Authorization Enforcement

**Property Statement:** For any admin operation, the operation must succeed only if the telegramId is in the ADMIN_TELEGRAM_IDS list.

**Formal Specification:**
```
∀ telegramId ∈ String, adminOperation ∈ AdminOperations:
  (telegramId ∈ ADMIN_TELEGRAM_IDS) ⟹ adminOperation(telegramId) succeeds
  ∧ (telegramId ∉ ADMIN_TELEGRAM_IDS) ⟹ adminOperation(telegramId) fails with UNAUTHORIZED
```

**Test Strategy:**
- Generate random telegramIds (some in admin list, some not)
- Attempt admin operations with each telegramId
- Verify operations succeed only for admin telegramIds

**Implementation:**
```typescript
fc.assert(
  fc.property(
    fc.record({
      telegramId: fc.string(),
      isAdmin: fc.boolean()
    }),
    async ({ telegramId, isAdmin }) => {
      // Mock admin list
      const adminIds = isAdmin ? [telegramId] : ['other_admin_id'];
      process.env.ADMIN_TELEGRAM_IDS = adminIds.join(',');
      
      const result = await suspendUser('user123', 'test reason', telegramId);
      
      if (isAdmin) {
        expect(result.success).toBe(true);
      } else {
        expect(result.error).toBe('UNAUTHORIZED');
      }
    }
  )
);
```

**Validates: Requirements 27.1, 28.1, 29.1, 30.1, 31.1, 32.1, 33.1**

### Property 12: Admin Audit Logging Completeness

**Property Statement:** For any admin action that modifies data, an audit log entry must be created with complete details.

**Formal Specification:**
```
∀ adminAction ∈ AdminActions:
  adminAction executes successfully
  ⟹ ∃ auditLog ∈ AdminLogs:
    auditLog.action = adminAction.type
    ∧ auditLog.adminId = adminAction.adminId
    ∧ auditLog.targetId = adminAction.targetId
    ∧ auditLog.timestamp ≤ now()
```

**Test Strategy:**
- Execute random admin actions
- Verify audit log entry exists for each action
- Verify audit log contains all required fields

**Implementation:**
```typescript
fc.assert(
  fc.property(
    fc.record({
      userId: fc.uuid(),
      reason: fc.string(),
      adminTelegramId: fc.string()
    }),
    async ({ userId, reason, adminTelegramId }) => {
      // Setup admin access
      process.env.ADMIN_TELEGRAM_IDS = adminTelegramId;
      
      const beforeCount = await getAdminLogCount();
      
      await suspendUser(userId, reason, adminTelegramId);
      
      const afterCount = await getAdminLogCount();
      expect(afterCount).toBe(beforeCount + 1);
      
      const latestLog = await getLatestAdminLog();
      expect(latestLog.action).toBe('USER_SUSPEND');
      expect(latestLog.adminTelegramId).toBe(adminTelegramId);
      expect(latestLog.targetId).toBe(userId);
      expect(latestLog.reason).toBe(reason);
    }
  )
);
```

**Validates: Requirements 28.3, 29.3, 30.4, 31.6**

### Property 13: Suspended User Operation Rejection

**Property Statement:** For any user with suspended flag set to true, all operations must be rejected.

**Formal Specification:**
```
∀ user ∈ Users, operation ∈ UserOperations:
  (user.suspended = true) ⟹ operation(user.id) fails with USER_SUSPENDED
```

**Test Strategy:**
- Create user and suspend them
- Attempt various operations (add to cart, create order, etc.)
- Verify all operations are rejected

**Implementation:**
```typescript
fc.assert(
  fc.property(
    fc.record({
      userId: fc.uuid(),
      operation: fc.constantFrom('addToCart', 'createOrder', 'updateProfile')
    }),
    async ({ userId, operation }) => {
      const user = await createTestUser({ id: userId, suspended: true });
      
      let result;
      switch (operation) {
        case 'addToCart':
          result = await addToCart(userId, 'product123', 1);
          break;
        case 'createOrder':
          result = await createOrder(userId, []);
          break;
        case 'updateProfile':
          result = await updateHomeLocation(userId, 'Haramaya_Main');
          break;
      }
      
      expect(result.error).toBe('USER_SUSPENDED');
    }
  )
);
```

**Validates: Requirements 28.4**

### Property 14: Suspended Shop Operation Rejection

**Property Statement:** For any shop with suspended flag set to true, all shop owner operations must be rejected.

**Formal Specification:**
```
∀ shop ∈ Shops, operation ∈ ShopOperations:
  (shop.suspended = true) ⟹ operation(shop.id) fails with SHOP_SUSPENDED
```

**Test Strategy:**
- Create shop and suspend it
- Attempt various shop operations (create product, update order status, etc.)
- Verify all operations are rejected

**Implementation:**
```typescript
fc.assert(
  fc.property(
    fc.record({
      shopId: fc.uuid(),
      operation: fc.constantFrom('createProduct', 'updateOrderStatus')
    }),
    async ({ shopId, operation }) => {
      const shop = await createTestShop({ id: shopId, suspended: true });
      
      let result;
      switch (operation) {
        case 'createProduct':
          result = await createProduct({
            shopId,
            name: 'Test Product',
            price: 100
          });
          break;
        case 'updateOrderStatus':
          result = await updateOrderStatus('order123', 'DISPATCHED');
          break;
      }
      
      expect(result.error).toBe('SHOP_SUSPENDED');
    }
  )
);
```

**Validates: Requirements 29.4**

### Property 15: Shop Balance Adjustment Consistency

**Property Statement:** When an admin adjusts a shop balance, the new balance must equal the old balance plus the adjustment amount.

**Formal Specification:**
```
∀ shop ∈ Shops, adjustment ∈ Number:
  let oldBalance = shop.balance
  adjustShopBalance(shop.id, adjustment)
  ⟹ shop.balance = oldBalance + adjustment
```

**Test Strategy:**
- Generate random shop with random initial balance
- Generate random adjustment amount (positive or negative)
- Verify final balance equals initial balance plus adjustment

**Implementation:**
```typescript
fc.assert(
  fc.property(
    fc.record({
      shopId: fc.uuid(),
      initialBalance: fc.integer({ min: 0, max: 100000 }),
      adjustment: fc.integer({ min: -10000, max: 10000 })
    }),
    async ({ shopId, initialBalance, adjustment }) => {
      const shop = await createTestShop({ 
        id: shopId, 
        balance: initialBalance 
      });
      
      await adjustShopBalance(
        shopId, 
        adjustment, 
        'test adjustment', 
        'admin123'
      );
      
      const updatedShop = await getShop(shopId);
      expect(updatedShop.balance).toBe(initialBalance + adjustment);
    }
  )
);
```

**Validates: Requirements 29.6**

### Property 16: Financial Report Accuracy

**Property Statement:** The total revenue in a financial report must equal the sum of all completed order totals within the date range.

**Formal Specification:**
```
∀ startDate, endDate ∈ Date:
  let report = generateFinancialReport(startDate, endDate)
  let completedOrders = Orders.filter(o => 
    o.status = COMPLETED ∧ 
    o.createdAt ≥ startDate ∧ 
    o.createdAt ≤ endDate
  )
  ⟹ report.totalRevenue = Σ(order.totalAmount | order ∈ completedOrders)
```

**Test Strategy:**
- Generate random orders with random dates and amounts
- Generate financial report for date range
- Manually calculate expected revenue
- Verify report matches expected value

**Implementation:**
```typescript
fc.assert(
  fc.property(
    fc.record({
      orders: fc.array(
        fc.record({
          amount: fc.integer({ min: 100, max: 5000 }),
          date: fc.date(),
          status: fc.constantFrom('COMPLETED', 'PENDING', 'CANCELLED')
        }),
        { minLength: 10, maxLength: 50 }
      ),
      startDate: fc.date(),
      endDate: fc.date()
    }),
    async ({ orders, startDate, endDate }) => {
      fc.pre(startDate <= endDate);
      
      // Create test orders
      for (const orderData of orders) {
        await createTestOrder({
          totalAmount: orderData.amount,
          createdAt: orderData.date,
          status: orderData.status
        });
      }
      
      // Generate report
      const report = await generateFinancialReport(startDate, endDate);
      
      // Calculate expected revenue
      const expectedRevenue = orders
        .filter(o => 
          o.status === 'COMPLETED' &&
          o.date >= startDate &&
          o.date <= endDate
        )
        .reduce((sum, o) => sum + o.amount, 0);
      
      expect(report.totalRevenue).toBe(expectedRevenue);
    }
  )
);
```

**Validates: Requirements 32.1**

## Error Handling

### Server Action Error Handling

All Server Actions follow a consistent error handling pattern:

```typescript
'use server'

export async function serverAction(params: Params): Promise<Result> {
  try {
    // 1. Verify authentication
    const user = await verifyTelegramUser(params.telegramId);
    if (!user) {
      return { error: 'UNAUTHORIZED', message: 'Authentication failed' };
    }
    
    // 2. Check suspension status
    if (user.suspended) {
      return { error: 'USER_SUSPENDED', message: 'Your account has been suspended' };
    }
    
    // 3. Validate input
    const validation = validateInput(params);
    if (!validation.success) {
      return { error: 'INVALID_INPUT', message: validation.message };
    }
    
    // 4. Execute business logic
    const result = await executeBusinessLogic(params);
    
    return { success: true, data: result };
  } catch (error) {
    // Log error
    await logError({
      errorType: 'SERVER_ACTION_ERROR',
      errorMessage: error.message,
      stackTrace: error.stack,
      requestPath: 'serverAction',
      requestPayload: sanitizePayload(params)
    });
    
    return { 
      error: 'INTERNAL_ERROR', 
      message: 'An unexpected error occurred' 
    };
  }
}
```

### Admin Error Handling

Admin operations include additional error handling:

```typescript
'use server'

export async function adminAction(params: AdminParams): Promise<Result> {
  try {
    // 1. Verify admin access
    const isAdmin = await verifyAdminAccess(params.adminTelegramId);
    if (!isAdmin) {
      await logError({
        errorType: 'UNAUTHORIZED_ADMIN_ACCESS',
        errorMessage: 'Non-admin user attempted admin operation',
        affectedEntityType: 'USER',
        affectedEntityId: params.adminTelegramId,
        requestPath: 'adminAction'
      });
      return { error: 'UNAUTHORIZED', message: 'Admin access required' };
    }
    
    // 2. Validate target exists
    const target = await getTarget(params.targetId);
    if (!target) {
      return { error: 'NOT_FOUND', message: 'Target not found' };
    }
    
    // 3. Execute with transaction
    await adminDb.runTransaction(async (transaction) => {
      // Perform action
      // Create audit log
    });
    
    return { success: true };
  } catch (error) {
    await logError({
      errorType: 'ADMIN_ACTION_ERROR',
      errorMessage: error.message,
      stackTrace: error.stack,
      requestPath: 'adminAction',
      requestPayload: sanitizePayload(params)
    });
    
    return { 
      error: 'INTERNAL_ERROR', 
      message: 'Admin operation failed' 
    };
  }
}
```

### Error Logging

All errors are logged to the `errorLogs` collection:

```typescript
async function logError(errorData: {
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  affectedEntityType?: 'USER' | 'SHOP' | 'PRODUCT' | 'ORDER';
  affectedEntityId?: string;
  userId?: string;
  shopId?: string;
  requestPath?: string;
  requestPayload?: Record<string, any>;
}): Promise<void> {
  await adminDb.collection('errorLogs').add({
    ...errorData,
    timestamp: FieldValue.serverTimestamp()
  });
}
```

### Payment Webhook Error Handling

Payment webhooks implement special error handling to ensure idempotency:

```typescript
export async function handleChapaWebhook(
  payload: ChapaWebhookPayload
): Promise<void> {
  try {
    // 1. Verify webhook signature
    const isValid = verifyWebhookSignature(payload);
    if (!isValid) {
      await logWebhookCall({
        provider: 'CHAPA',
        event: payload.event,
        orderId: payload.data.tx_ref,
        payload,
        responseCode: 401,
        processed: false,
        error: 'Invalid webhook signature'
      });
      throw new Error('Invalid webhook signature');
    }
    
    // 2. Process with transaction (idempotent)
    await adminDb.runTransaction(async (transaction) => {
      const orderRef = adminDb.collection('orders').doc(payload.data.tx_ref);
      const orderDoc = await transaction.get(orderRef);
      
      if (!orderDoc.exists) {
        throw new Error('Order not found');
      }
      
      const order = orderDoc.data();
      
      // Idempotency check
      if (order.status !== 'PENDING') {
        // Already processed
        return;
      }
      
      // Update order status
      transaction.update(orderRef, {
        status: 'PAID_ESCROW',
        chapaTransactionRef: payload.data.reference,
        updatedAt: FieldValue.serverTimestamp()
      });
    });
    
    // Log successful webhook
    await logWebhookCall({
      provider: 'CHAPA',
      event: payload.event,
      orderId: payload.data.tx_ref,
      payload,
      responseCode: 200,
      processed: true
    });
  } catch (error) {
    // Log failed webhook
    await logWebhookCall({
      provider: 'CHAPA',
      event: payload.event,
      orderId: payload.data.tx_ref,
      payload,
      responseCode: 500,
      processed: false,
      error: error.message
    });
    
    throw error;
  }
}
```

### Client-Side Error Display

Errors are displayed to users with appropriate messaging:

```typescript
// User-friendly error messages
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Please log in to continue',
  USER_SUSPENDED: 'Your account has been suspended. Please contact support.',
  SHOP_SUSPENDED: 'This shop has been suspended.',
  INSUFFICIENT_STOCK: 'Not enough items in stock',
  INVALID_TRANSITION: 'Cannot perform this action at this time',
  ORDER_LOCKED: 'Too many failed attempts. Please contact support.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  INTERNAL_ERROR: 'Something went wrong. Please try again later.'
};

function displayError(errorCode: string) {
  const message = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.INTERNAL_ERROR;
  toast.error(message);
}
```

### Retry Logic

Critical operations implement retry logic with exponential backoff:

```typescript
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
}

// Usage
await retryWithBackoff(
  () => adminDb.runTransaction(async (transaction) => {
    // Transaction logic
  })
);
```

## Testing Strategy

### Unit Tests
- Test individual functions and utilities
- Mock external dependencies (Firebase, Chapa, OpenAI)
- Focus on business logic correctness
- Test admin authorization functions
- Test audit logging utilities

### Integration Tests
- Test Server Actions with real Firebase emulator
- Test payment webhook flow with Chapa sandbox
- Test AI assistant with OpenAI test API
- Test admin operations with Firebase emulator
- Test admin audit log creation

### Property-Based Tests
- Implement all 16 correctness properties above
- Use fast-check library for property testing
- Run with high iteration count (1000+ per property)
- Include admin-specific properties (11-16)

### End-to-End Tests
- Test complete user flows (browse → cart → checkout → delivery → completion)
- Test shop owner flows (product creation → order fulfillment)
- Test runner flows (delivery → OTP submission)
- Test admin flows (user management → shop suspension → order refund)
- Use Playwright for Telegram Mini App testing

### Admin-Specific Tests
- Test admin authentication and authorization
- Test user suspension and activation
- Test shop suspension and activation
- Test shop balance adjustments
- Test product removal
- Test manual order status updates
- Test manual refunds
- Test financial report generation
- Test audit log creation for all admin actions
- Test error log viewing and filtering
- Test webhook history viewing

### Performance Tests
- Load test with 1000+ concurrent users
- Test image loading performance on slow networks
- Test Firestore query performance with large datasets
- Test admin dashboard with large datasets (10,000+ users, shops, orders)

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

# Admin Access (comma-separated list of Telegram IDs)
ADMIN_TELEGRAM_IDS=123456789,987654321
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
3. **Admin Access**: Admin operations protected by environment variable whitelist (ADMIN_TELEGRAM_IDS)
4. **Admin Audit Trail**: All admin actions logged to adminLogs collection with full details
5. **Payment Security**: Webhook signature verification for Chapa callbacks
6. **Data Validation**: Input validation on all Server Actions
7. **Rate Limiting**: Implement rate limiting on sensitive operations (OTP validation, payment initiation, admin operations)
8. **HTTPS Only**: All communication over HTTPS
9. **Environment Variables**: Sensitive keys stored securely, never committed to git
10. **Defense in Depth**: Admin authorization checked in both middleware and Server Actions
11. **Suspension Enforcement**: Suspended users and shops blocked at Server Action level

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
