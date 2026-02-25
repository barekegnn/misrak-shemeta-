# Implementation Plan: Misrak Shemeta Marketplace

## Overview

This implementation plan follows the Eastern Triangle Context Constraint and builds the Misrak Shemeta marketplace platform as a Telegram Mini App using Next.js 15 App Router, Firebase services, and Chapa payment integration. The platform connects shops in Harar and Dire Dawa with students across Haramaya Main Campus, Harar Campus, and DDU, implementing a secure escrow payment system with OTP-based delivery verification.

The implementation is organized into 6 phases following the roadmap: Infrastructure, Merchant Flow, Logistics Engine, Payment Flow, Order Lifecycle, and AI Layer. Each phase builds incrementally with property-based tests to verify correctness properties.

## Tasks

- [x] 1. Project Setup and Infrastructure
  - [x] 1.1 Initialize Next.js 15 project with TypeScript and App Router
    - Create Next.js 15 project with `create-next-app`
    - Configure TypeScript in strict mode
    - Set up App Router directory structure (`app/`, `src/`)
    - Install core dependencies: `firebase`, `firebase-admin`, `@telegram-apps/sdk-react`
    - Configure `next.config.js` for Telegram Mini App deployment
    - _Requirements: 11.1, 11.2, 11.4_

  - [x] 1.2 Configure Tailwind CSS and Shadcn UI
    - Install and configure Tailwind CSS
    - Set up Shadcn UI with `npx shadcn-ui@latest init`
    - Configure theme for mobile-first design
    - Add custom Tailwind utilities for touch-friendly sizing (44x44px minimum)
    - _Requirements: 12.1, 12.2, 21.2_

  - [x] 1.3 Set up Firebase client and admin configurations
    - Create `src/lib/firebase/config.ts` for client-side Firebase config
    - Create `src/lib/firebase/admin.ts` for Firebase Admin SDK initialization
    - Configure environment variables for Firebase credentials
    - Initialize Firestore, Auth, and Storage clients
    - _Requirements: 10.2, 10.3_

  - [x] 1.4 Define TypeScript interfaces for all data models
    - Create `src/types/index.ts` with interfaces for User, Shop, Product, Order, Cart, ShopTransaction
    - Define Location types: `ShopCity`, `UserLocation`
    - Define OrderStatus enum and state machine types
    - Define Chapa and OpenAI API interfaces
    - _Requirements: 11.1, 11.3_

  - [x] 1.5 Set up i18n infrastructure with Amharic, Afaan Oromo, and English
    - Install `next-intl` or similar i18n library
    - Create translation files: `/locales/am/`, `/locales/om/`, `/locales/en/`
    - Create translation keys for common UI elements (common.json, products.json, orders.json, errors.json)
    - Implement language detection from Telegram user context
    - Create LanguageSwitcher component
    - _Requirements: 26.1, 26.2, 26.4, 26.6_

- [x] 2. Authentication and User Profile Management
  - [x] 2.1 Implement Telegram Mini App authentication
    - Create `src/lib/auth/telegram.ts` for Telegram authentication utilities
    - Implement `verifyTelegramUser()` function using Firebase Admin SDK
    - Create TelegramAuthProvider context component
    - Retrieve telegramId from Telegram Mini App SDK
    - _Requirements: 19.1, 19.2, 19.4_

  - [x] 2.2 Create User profile management Server Actions
    - Implement `createUserProfile()` Server Action for first-time users
    - Implement `updateHomeLocation()` Server Action
    - Implement `updateLanguagePreference()` Server Action
    - Add telegramId verification to all Server Actions
    - _Requirements: 2.3, 2.4, 10.2, 26.3_

  - [x] 2.3 Build HomeLocationSelector component
    - Create UI for selecting home location (Haramaya_Main, Harar_Campus, DDU)
    - Display on first app load for new users
    - Store selection in Firestore User profile
    - _Requirements: 2.2, 2.3_

  - [ ]* 2.4 Write property test for multi-tenant isolation
    - **Property 1: Multi-Tenant Isolation**
    - **Validates: Requirements 1.4, 1.5, 10.3**
    - Implement property test verifying shop owners cannot access other shops' products
    - Use fast-check to generate random shop owners and products
    - _Requirements: 1.4, 1.5, 10.3_

- [x] 3. Checkpoint - Verify authentication and user setup
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Product Management (Merchant Flow)
  - [x] 4.1 Implement Product CRUD Server Actions
    - Create `src/app/actions/products.ts` with Server Actions
    - Implement `createProduct()` with shopId association and tenant isolation
    - Implement `updateProduct()` with ownership verification
    - Implement `deleteProduct()` with ownership verification
    - Implement `getProductsByShop()` for shop owner view
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 10.3_

  - [x] 4.2 Implement Firebase Storage image upload utilities
    - Create `src/lib/storage/images.ts` for image operations
    - Implement `uploadProductImage()` function (max 5MB, JPEG/PNG/WebP)
    - Implement `deleteProductImage()` function
    - Generate public URLs for uploaded images
    - Organize storage: `/products/{shopId}/{productId}/image_N.jpg`
    - _Requirements: 13.1, 13.2, 13.4, 13.5_

  - [x] 4.3 Build ProductForm component for creating/editing products
    - Create form with fields: name, description, price, category, stock, images
    - Implement ImageUploader sub-component (1-5 images)
    - Add client-side validation
    - Connect to createProduct/updateProduct Server Actions
    - _Requirements: 4.1, 4.2, 13.3_

  - [x] 4.4 Build ProductListManager component for shop owners
    - Display all products for authenticated shop owner
    - Add edit and delete buttons for each product
    - Implement tenant isolation (only show owner's products)
    - _Requirements: 1.5, 4.4, 4.5_

  - [ ]* 4.5 Write unit tests for Product CRUD operations
    - Test product creation with valid data
    - Test product update with ownership verification
    - Test product deletion with image cleanup
    - Test tenant isolation enforcement
    - _Requirements: 1.4, 4.1, 4.4, 4.5_

- [x] 5. Product Discovery (Buyer Flow)
  - [x] 5.1 Implement product catalog Server Actions
    - Create `getProducts()` Server Action with filtering by shop location
    - Implement search functionality (case-insensitive name/description matching)
    - Implement price range filtering
    - Filter products based on buyer's home location (deliverability check)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 15.1, 15.2, 15.3, 15.4_

  - [x] 5.2 Build ProductCatalog component with grid view
    - Display products in responsive grid layout
    - Implement lazy loading for mobile optimization
    - Show shop name and location with each product
    - Add "Add to Cart" button on each ProductCard
    - _Requirements: 5.1, 5.2, 12.4, 21.4_

  - [x] 5.3 Build SearchBar and FilterPanel components
    - Create SearchBar with debounced input
    - Create FilterPanel with location and price range filters
    - Apply multiple filters with AND logic
    - Display "no results" message when appropriate
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [x] 5.4 Build ProductDetailView component
    - Display full product information with image carousel
    - Show shop information and location
    - Calculate and display delivery fee based on buyer's home location
    - Add quantity selector and "Add to Cart" button
    - _Requirements: 5.5_

- [x] 6. Shopping Cart Management
  - [x] 6.1 Implement Cart Server Actions
    - Create `addToCart()` Server Action
    - Implement `updateCartItem()` for quantity changes
    - Implement `removeFromCart()` Server Action
    - Implement `getCart()` Server Action
    - Implement `calculateCartTotal()` utility function
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 6.2 Build CartView component
    - Display all cart items with product details
    - Add quantity increment/decrement controls
    - Add remove item button
    - Display total price (products + delivery fee)
    - Add checkout button
    - _Requirements: 6.5_

  - [ ]* 6.3 Write property test for cart total calculation
    - **Property 7: Cart Total Calculation**
    - **Validates: Requirements 6.4**
    - Verify cart total equals sum of (price × quantity) for all items
    - Generate random carts with varying items
    - _Requirements: 6.4_

- [x] 7. Eastern Triangle Pricing Engine (Logistics)
  - [x] 7.1 Implement delivery fee calculation utility
    - Create `src/lib/logistics/pricing.ts`
    - Implement `calculateDeliveryFee()` function with route matrix
    - Define routes: Harar→Harar_Campus (40 ETB), Dire_Dawa→DDU (40 ETB)
    - Define routes: Harar→Haramaya_Main (100 ETB), Dire_Dawa→Haramaya_Main (100 ETB)
    - Define routes: Harar→DDU (180 ETB), Dire_Dawa→Harar_Campus (180 ETB)
    - Include estimated delivery times for each route
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

  - [ ]* 7.2 Write property test for Eastern Triangle Pricing consistency
    - **Property 2: Eastern Triangle Pricing Consistency**
    - **Validates: Requirements 16.1-16.7**
    - Verify delivery fee matches route matrix for all combinations
    - Verify determinism (same inputs always produce same output)
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

- [x] 8. Checkpoint - Verify product catalog and cart functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Chapa Payment Integration (Payment Flow)
  - [x] 9.1 Set up Chapa SDK and configuration
    - Install Chapa SDK or create HTTP client for Chapa API
    - Configure environment variables: CHAPA_SECRET_KEY, CHAPA_WEBHOOK_SECRET, CHAPA_MODE
    - Create `src/lib/payment/chapa.ts` for Chapa utilities
    - Implement sandbox mode support
    - _Requirements: 25.1, 25.2, 25.4, 25.5_

  - [x] 9.2 Implement payment initiation Server Action
    - Create `initiateChapaPayment()` Server Action
    - Generate Chapa payment request with order details
    - Return checkout URL for redirect
    - Store Chapa transaction reference with order
    - _Requirements: 8.1, 8.2, 8.6_

  - [x] 9.3 Implement payment webhook handler
    - Create `/app/api/webhooks/chapa/route.ts` API route
    - Verify webhook signature using CHAPA_WEBHOOK_SECRET
    - Implement idempotency check (prevent duplicate processing)
    - Update order status to PAID_ESCROW on payment success
    - Use Firestore Transaction for atomic status update
    - _Requirements: 8.3, 8.7, 24.1, 24.2, 24.3, 24.4, 24.5_

  - [x] 9.4 Build ChapaPaymentButton component
    - Create button to initiate payment flow
    - Handle redirect to Chapa payment interface
    - Handle return from Chapa after payment
    - _Requirements: 8.1, 8.2_

  - [ ]* 9.5 Write property test for payment webhook idempotency
    - **Property 5: Payment Webhook Idempotency**
    - **Validates: Requirements 8.7, 24.1-24.5**
    - Verify duplicate webhook calls don't cause double-crediting
    - Verify order status changes only once
    - _Requirements: 8.7, 24.1, 24.2, 24.3, 24.4, 24.5_

- [ ] 10. Order Lifecycle and Escrow State Machine
  - [ ] 10.1 Implement Order creation Server Action
    - Create `createOrder()` Server Action
    - Calculate total amount and delivery fee
    - Generate 6-digit OTP and store with order
    - Set initial status to PENDING
    - Associate order items with shopId
    - Check product stock availability
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ] 10.2 Implement Escrow State Machine utilities
    - Create `src/lib/orders/stateMachine.ts`
    - Define allowed state transitions
    - Implement `validateTransition()` function
    - Implement `updateOrderStatus()` Server Action with transition validation
    - Use Firestore Transactions for all status updates
    - Record status history with timestamps and actors
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

  - [ ] 10.3 Implement OTP generation and validation
    - Create `src/lib/orders/otp.ts`
    - Implement `generateOTP()` function (6-digit random)
    - Implement `validateOTP()` Server Action with attempt tracking
    - Lock order after 3 failed attempts
    - Update order status to COMPLETED on successful validation
    - Release escrow funds to shop balance using Firestore Transaction
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

  - [ ] 10.4 Build OrderCheckout component
    - Display cart summary with delivery fee breakdown
    - Show total amount
    - Add payment button (connects to Chapa)
    - _Requirements: 7.1, 7.5_

  - [ ] 10.5 Build OrderList and OrderDetail components for buyers
    - Display order history in reverse chronological order
    - Show order status, date, total, products
    - Display status timeline (PENDING → PAID_ESCROW → DISPATCHED → ARRIVED → COMPLETED)
    - Show OTP when status is ARRIVED
    - Add cancel button (only for PENDING or PAID_ESCROW)
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 17.1_

  - [ ] 10.6 Build ShopOrderList and ShopOrderDetail components for shop owners
    - Display orders containing products from owner's shop
    - Filter by status
    - Show buyer information and delivery location
    - Add "Mark as DISPATCHED" button for PAID_ESCROW orders
    - _Requirements: 9.1, 9.2, 9.6_

  - [ ] 10.7 Build RunnerOrderView component for runners
    - Display active deliveries
    - Add "Mark as ARRIVED" button
    - Create OTP submission form
    - Show attempt counter and error messages
    - _Requirements: 9.4, 9.5_

  - [ ] 10.8 Implement order cancellation Server Action
    - Create `cancelOrder()` Server Action
    - Allow cancellation for PENDING status (no refund needed)
    - Allow cancellation for PAID_ESCROW status (initiate Chapa refund)
    - Reject cancellation for DISPATCHED or ARRIVED status
    - Send notification to shop owner
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

  - [ ]* 10.9 Write property test for Escrow State Machine validity
    - **Property 3: Escrow State Machine Validity**
    - **Validates: Requirements 23.1-23.5**
    - Verify only allowed state transitions succeed
    - Generate random status transitions and verify correctness
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

  - [ ]* 10.10 Write property test for OTP validation security
    - **Property 4: OTP Validation Security**
    - **Validates: Requirements 17.1-17.6**
    - Verify correct OTP completes order
    - Verify incorrect OTP fails validation
    - Verify order locks after 3 failed attempts
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

  - [ ]* 10.11 Write property test for product stock consistency
    - **Property 8: Product Stock Consistency**
    - **Validates: Requirements 4.6**
    - Verify stock never goes negative
    - Verify order creation fails with insufficient stock
    - _Requirements: 4.6_

- [ ] 11. Shop Owner Balance Management
  - [ ] 11.1 Implement shop balance Server Actions
    - Create `updateShopBalance()` Server Action (internal use only)
    - Implement balance increment on order completion (use Firestore Transaction)
    - Create `getShopBalance()` Server Action
    - Create `getShopTransactions()` Server Action
    - _Requirements: 22.1, 22.2, 22.5_

  - [ ] 11.2 Build BalanceDashboard component
    - Display current balance
    - Show pending orders value (PAID_ESCROW, DISPATCHED, ARRIVED)
    - Show completed orders value
    - Display transaction history
    - _Requirements: 22.3, 22.4_

  - [ ]* 11.3 Write property test for shop balance consistency
    - **Property 6: Shop Balance Consistency**
    - **Validates: Requirements 22.1, 22.2, 22.5**
    - Verify balance equals sum of completed orders minus withdrawals
    - Generate random order sequences and verify balance
    - _Requirements: 22.1, 22.2, 22.5_

- [ ] 12. Checkpoint - Verify complete order lifecycle
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. AI Sales Assistant (AI Layer)
  - [ ] 13.1 Set up OpenAI API integration
    - Install OpenAI SDK
    - Configure OPENAI_API_KEY environment variable
    - Create `src/lib/ai/openai.ts` for OpenAI utilities
    - _Requirements: 20.2_

  - [ ] 13.2 Implement RAG query handler Server Action
    - Create `queryAIAssistant()` Server Action
    - Retrieve relevant products from Firestore based on user question
    - Construct system prompt with product data (RAG context)
    - Call OpenAI API with user question and context
    - Implement language detection (Amharic, Afaan Oromo, English)
    - Return AI-generated response in detected language
    - Add 5-second timeout and fallback message
    - _Requirements: 20.2, 20.3, 20.4, 20.5, 20.6, 20.7_

  - [ ] 13.3 Build AIChatInterface component
    - Create chat UI with message history
    - Add input field and send button
    - Show typing indicator during API call
    - Display AI responses with proper Ethiopic script rendering
    - _Requirements: 20.1_

  - [ ]* 13.4 Write property test for language detection accuracy
    - **Property 9: Language Detection Accuracy**
    - **Validates: Requirements 20.6, 20.7**
    - Verify correct detection of Amharic, Afaan Oromo, and English
    - Test with sample inputs in each language
    - _Requirements: 20.6, 20.7_

- [ ] 14. Firestore Transaction Integrity
  - [ ]* 14.1 Write property test for Firestore Transaction atomicity
    - **Property 10: Firestore Transaction Atomicity**
    - **Validates: Requirements 23.1-23.5**
    - Verify all updates succeed or all rollback on failure
    - Test order status + shop balance atomic updates
    - Simulate mid-transaction failures
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

- [ ] 15. Shop Registration Flow
  - [ ] 15.1 Implement shop registration Server Action
    - Create `registerShop()` Server Action
    - Create Firebase Auth account for shop owner
    - Create Shop record in Firestore with unique shopId
    - Associate Firebase Auth user ID with Shop record
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 15.2 Build shop registration form component
    - Create form with fields: shop name, location (Harar/Dire_Dawa), contact phone, credentials
    - Add client-side validation
    - Connect to registerShop Server Action
    - _Requirements: 3.2_

  - [ ] 15.3 Implement shop owner authentication
    - Verify credentials using Firebase Auth
    - Retrieve Shop record on authentication
    - _Requirements: 3.5_

- [ ] 16. Mobile Optimization and Telegram Integration
  - [ ] 16.1 Implement Telegram Mini App SDK integration
    - Initialize Telegram WebApp SDK
    - Retrieve user context (telegramId, language_code)
    - Implement haptic feedback for key interactions
    - Adapt layout to Telegram viewport dimensions
    - _Requirements: 19.1, 21.3, 21.5_

  - [ ] 16.2 Optimize images for mobile networks
    - Implement lazy loading for product images
    - Use Next.js Image component with responsive sizes
    - Compress images on upload
    - _Requirements: 12.4, 21.4_

  - [ ] 16.3 Ensure touch-friendly UI elements
    - Verify all interactive elements are minimum 44x44px
    - Test on mobile devices
    - Optimize button spacing and sizing
    - _Requirements: 12.2, 21.2_

- [ ] 17. Notifications and Status Updates
  - [ ] 17.1 Implement notification system
    - Send notification when order status changes to DISPATCHED
    - Send notification when order status changes to ARRIVED (include OTP instructions)
    - Send notification to shop owner when order is cancelled
    - Translate notifications based on user language preference
    - _Requirements: 9.3, 9.5, 18.4, 26.5_

- [ ] 18. Final Integration and Testing
  - [ ] 18.1 Set up Firebase Emulator for local testing
    - Configure Firestore, Auth, and Storage emulators
    - Create seed data for testing
    - _Requirements: All_

  - [ ] 18.2 Run all property-based tests
    - Execute all 10 property tests with 1000+ iterations each
    - Verify all properties pass
    - _Requirements: All correctness properties_

  - [ ] 18.3 Perform end-to-end testing
    - Test complete buyer flow: browse → cart → checkout → delivery → completion
    - Test shop owner flow: product creation → order fulfillment
    - Test runner flow: delivery → OTP submission
    - Test cancellation flows
    - _Requirements: All_

  - [ ] 18.4 Deploy to staging environment
    - Configure production Firebase project
    - Set up Chapa sandbox integration
    - Deploy Next.js application
    - Configure Telegram Mini App
    - _Requirements: All_

- [ ] 19. Final checkpoint - Production readiness verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- All Server Actions must verify telegramId using Firebase Admin SDK before processing
- All critical state transitions must use Firestore Transactions for atomicity
- The Eastern Triangle Pricing Engine uses fixed fees: 40 ETB (intra-city), 100 ETB (city-to-campus), 180 ETB (inter-city)
- Payment webhook must implement idempotency checks to prevent double-crediting
- OTP validation locks order after 3 failed attempts
- Multi-tenancy is enforced at the data model level with shopId associations
- All UI strings must use i18n translation keys for Amharic, Afaan Oromo, and English
- Mobile-first design with touch-friendly elements (44x44px minimum)
- No placeholder code - all implementations must be functional using Chapa Sandbox for testing
