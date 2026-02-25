# Requirements Document

## Introduction

Misrak Shemeta is a multi-tenant marketplace platform designed for Eastern Ethiopia, connecting buyers and sellers across university campuses and cities. The platform enables shop owners in Harar and Dire Dawa to list products, while students and residents from Haramaya Main Campus, Harar Campus, and Dire Dawa University can browse and purchase items. The system integrates with Chapa for payments and is optimized for mobile-first usage as a Telegram Mini App.

## Glossary

- **Marketplace_Platform**: The complete Misrak Shemeta system including web interface, database, and integrations
- **Shop**: A vendor account that can list and sell products, located in either Harar or Dire Dawa
- **Product**: An item listed for sale by a shop
- **User**: A buyer who can browse products and make purchases, associated with Haramaya_Main, Harar_Campus, or DDU
- **Shop_Owner**: A user with permissions to manage a shop and its products
- **Location**: Geographic identifier - either Haramaya_Main, Harar_Campus, DDU (for users) or Harar, Dire_Dawa (for shops)
- **Tenant**: A shop instance with isolated data within the multi-tenant architecture
- **Order**: A purchase transaction initiated by a user for one or more products
- **Chapa_Gateway**: The payment processing service integration
- **Firebase_Auth**: The authentication service for user identity management
- **Firestore**: The database service for storing marketplace data
- **Firebase_Storage**: The file storage service for product images and media
- **Delivery_Route**: A logistics path between two Location values with associated fee and time
- **Escrow_Account**: Platform-held funds during order processing before release to Shop
- **Runner**: A delivery person (Bajaj driver or on-foot courier) who transports Products
- **OTP**: One-Time Password, a 6-digit code used to verify Product delivery
- **Telegram_Mini_App**: The web application interface embedded within Telegram messenger
- **Home_Location**: The User's selected primary Location used for filtering available Products
- **AI_Sales_Assistant**: RAG-based chatbot using OpenAI to answer product questions
- **Payment_Webhook**: Chapa callback endpoint that receives payment confirmation events
- **Firestore_Transaction**: Atomic database operation ensuring data consistency across multiple writes

## Requirements

### Requirement 1: Multi-Tenant Shop Management

**User Story:** As a shop owner, I want to manage my own shop with isolated data, so that my products and orders remain separate from other shops.

#### Acceptance Criteria

1. THE Marketplace_Platform SHALL associate every Product with exactly one Shop
2. THE Marketplace_Platform SHALL associate every Shop with exactly one Location value of either Harar or Dire_Dawa
3. WHEN a Shop_Owner creates a Product, THE Marketplace_Platform SHALL automatically assign the Product to the Shop_Owner's Shop
4. THE Marketplace_Platform SHALL prevent access to Product data across different Tenant boundaries
5. WHEN a Shop_Owner queries Products, THE Marketplace_Platform SHALL return only Products belonging to their Shop

### Requirement 2: User Location Assignment and Home Location

**User Story:** As a user, I want to be associated with my campus or city location, so that the marketplace can provide location-relevant features and filter available products.

#### Acceptance Criteria

1. THE Marketplace_Platform SHALL associate every User with exactly one Location value of Haramaya_Main, Harar_Campus, or DDU
2. WHEN a User first loads the Telegram_Mini_App, THE Marketplace_Platform SHALL prompt the User to select their Home_Location
3. THE Marketplace_Platform SHALL store the Home_Location in Firestore with the user profile
4. WHEN a User authenticates, THE Marketplace_Platform SHALL retrieve the Home_Location from Firestore
5. WHEN a User views the product catalog, THE Marketplace_Platform SHALL filter Products to show only those available for delivery to the User's Home_Location

### Requirement 3: Shop Registration and Authentication

**User Story:** As a prospective shop owner, I want to register my shop with authentication, so that I can start selling products on the platform.

#### Acceptance Criteria

1. WHEN a Shop_Owner submits registration information, THE Marketplace_Platform SHALL create an account using Firebase_Auth
2. THE Marketplace_Platform SHALL require shop name, Location (Harar or Dire_Dawa), contact information, and authentication credentials during registration
3. WHEN Shop registration completes, THE Marketplace_Platform SHALL create a Shop record in Firestore with a unique shopId
4. THE Marketplace_Platform SHALL associate the Firebase_Auth user ID with the Shop record
5. WHEN a Shop_Owner authenticates, THE Marketplace_Platform SHALL verify credentials using Firebase_Auth

### Requirement 4: Product Listing Management

**User Story:** As a shop owner, I want to create and manage product listings, so that customers can discover and purchase my items.

#### Acceptance Criteria

1. WHEN a Shop_Owner creates a Product, THE Marketplace_Platform SHALL require product name, description, price, shopId, and at least one image
2. THE Marketplace_Platform SHALL store Product images in Firebase_Storage
3. THE Marketplace_Platform SHALL store Product metadata in Firestore with the associated shopId
4. WHEN a Shop_Owner updates a Product, THE Marketplace_Platform SHALL modify only Products belonging to their Shop
5. WHEN a Shop_Owner deletes a Product, THE Marketplace_Platform SHALL remove only Products belonging to their Shop
6. THE Marketplace_Platform SHALL support Product inventory quantity tracking

### Requirement 5: Product Discovery and Browsing

**User Story:** As a user, I want to browse available products from all shops, so that I can find items to purchase.

#### Acceptance Criteria

1. WHEN a User requests the product catalog, THE Marketplace_Platform SHALL return Products from all Shops
2. THE Marketplace_Platform SHALL display Shop name and Location with each Product
3. THE Marketplace_Platform SHALL support filtering Products by Shop Location (Harar or Dire_Dawa)
4. THE Marketplace_Platform SHALL support searching Products by name or description
5. WHEN a User views a Product, THE Marketplace_Platform SHALL display product name, description, price, images, Shop name, and Shop Location

### Requirement 6: Shopping Cart Management

**User Story:** As a user, I want to add products to a cart, so that I can purchase multiple items in a single transaction.

#### Acceptance Criteria

1. WHEN a User adds a Product to cart, THE Marketplace_Platform SHALL store the cart item with productId, quantity, and userId
2. THE Marketplace_Platform SHALL allow Users to modify cart item quantities
3. WHEN a User removes a Product from cart, THE Marketplace_Platform SHALL delete the cart item
4. THE Marketplace_Platform SHALL calculate the total cart price by summing all cart item prices multiplied by quantities
5. WHEN a User views their cart, THE Marketplace_Platform SHALL display all cart items with Product details and total price

### Requirement 7: Order Creation and Processing

**User Story:** As a user, I want to place orders for products, so that I can complete purchases.

#### Acceptance Criteria

1. WHEN a User initiates checkout, THE Marketplace_Platform SHALL create an Order record in Firestore with userId, cart items, total price, delivery fee, and timestamp
2. THE Marketplace_Platform SHALL assign each Order a unique orderId
3. THE Marketplace_Platform SHALL set the initial Order status to PENDING
4. WHEN an Order is created, THE Marketplace_Platform SHALL associate each order item with its respective shopId
5. THE Marketplace_Platform SHALL calculate the delivery fee based on the Delivery_Route between Shop Location and User Home_Location
6. THE Marketplace_Platform SHALL generate a unique 6-digit OTP for each Order and store it with the Order record

### Requirement 8: Escrow Payment Lifecycle

**User Story:** As a user, I want my payment held securely until I receive and verify my order, so that I am protected from fraud.

#### Acceptance Criteria

1. WHEN a User confirms an Order with status PENDING, THE Marketplace_Platform SHALL initiate a payment request to Chapa_Gateway with the Order total plus delivery fee
2. THE Marketplace_Platform SHALL redirect the User to the Chapa_Gateway payment interface
3. WHEN the Payment_Webhook receives payment confirmation from Chapa_Gateway, THE Marketplace_Platform SHALL update the Order status to PAID_ESCROW using a Firestore_Transaction
4. THE Marketplace_Platform SHALL hold funds in the Escrow_Account until Order completion
5. WHEN Chapa_Gateway reports payment failure, THE Marketplace_Platform SHALL update the Order status to FAILED
6. THE Marketplace_Platform SHALL store the Chapa transaction reference with the Order record
7. WHEN the Payment_Webhook processes a payment confirmation, THE Marketplace_Platform SHALL verify the orderId has not been previously processed to ensure idempotency

### Requirement 9: Order Fulfillment and Delivery

**User Story:** As a shop owner, I want to manage order fulfillment and coordinate with delivery runners, so that customers receive their products.

#### Acceptance Criteria

1. WHEN a Shop_Owner views an Order with status PAID_ESCROW, THE Marketplace_Platform SHALL display Order details including User delivery location and contact information
2. WHEN a Shop_Owner hands a Product to a Runner, THE Marketplace_Platform SHALL allow the Shop_Owner to update the Order status to DISPATCHED using a Firestore_Transaction
3. WHEN an Order status changes to DISPATCHED, THE Marketplace_Platform SHALL send a notification to the User
4. WHEN a Runner reaches the delivery location, THE Marketplace_Platform SHALL allow the Runner to update the Order status to ARRIVED using a Firestore_Transaction
5. WHEN an Order status changes to ARRIVED, THE Marketplace_Platform SHALL send a notification to the User with instructions to inspect the Product and provide the OTP
6. THE Marketplace_Platform SHALL display only Orders containing Products from the Shop_Owner's Shop

### Requirement 10: Server-Side Security Enforcement

**User Story:** As a system administrator, I want all database operations to be secured server-side, so that unauthorized access is prevented.

#### Acceptance Criteria

1. THE Marketplace_Platform SHALL execute all Firestore write operations using Server Actions exclusively
2. THE Marketplace_Platform SHALL verify User identity using Firebase Admin SDK before processing any database mutation
3. WHEN a Shop_Owner attempts a Product operation, THE Marketplace_Platform SHALL verify the Product belongs to their Shop using Firebase Admin SDK
4. THE Marketplace_Platform SHALL reject any database mutation request that fails authentication or authorization checks
5. THE Marketplace_Platform SHALL not expose database mutation endpoints in the /api directory

### Requirement 11: TypeScript Type Safety

**User Story:** As a developer, I want strict TypeScript interfaces for all data models, so that type errors are caught at compile time.

#### Acceptance Criteria

1. THE Marketplace_Platform SHALL define TypeScript interfaces for Shop, Product, User, Order, and CartItem entities
2. THE Marketplace_Platform SHALL enforce strict TypeScript mode in the compiler configuration
3. THE Marketplace_Platform SHALL require all Firestore document operations to use typed interfaces
4. THE Marketplace_Platform SHALL require all Server Actions to declare parameter and return types

### Requirement 12: Mobile-First Responsive Interface

**User Story:** As a user accessing the platform on mobile, I want a responsive interface optimized for small screens, so that I can easily browse and purchase products.

#### Acceptance Criteria

1. THE Marketplace_Platform SHALL render all user interfaces with mobile-first responsive design using Tailwind CSS
2. THE Marketplace_Platform SHALL ensure all interactive elements have touch-friendly sizing (minimum 44x44 pixels)
3. WHEN the viewport width is less than 768 pixels, THE Marketplace_Platform SHALL display navigation in a mobile-optimized layout
4. THE Marketplace_Platform SHALL optimize image loading for mobile network conditions
5. THE Marketplace_Platform SHALL function correctly when embedded as a Telegram Mini App

### Requirement 13: Product Image Management

**User Story:** As a shop owner, I want to upload and manage product images, so that customers can see what they are purchasing.

#### Acceptance Criteria

1. WHEN a Shop_Owner uploads a Product image, THE Marketplace_Platform SHALL store the image in Firebase_Storage
2. THE Marketplace_Platform SHALL generate a public URL for each uploaded image
3. THE Marketplace_Platform SHALL support multiple images per Product (minimum 1, maximum 5)
4. WHEN a Shop_Owner deletes a Product, THE Marketplace_Platform SHALL remove associated images from Firebase_Storage
5. THE Marketplace_Platform SHALL validate image file types (JPEG, PNG, WebP) and size (maximum 5MB per image)

### Requirement 14: User Order History

**User Story:** As a user, I want to view my past orders, so that I can track my purchase history.

#### Acceptance Criteria

1. WHE N a User requests order history, THE Marketplace_Platform SHALL return all Orders associated with their userId
2. THE Marketplace_Platform SHALL display Orders in reverse chronological order (newest first)
3. THE Marketplace_Platform SHALL show Order status, total price, order date, and Products for each Order
4. WHEN a User views Order details, THE Marketplace_Platform SHALL display all order items with Product names, quantities, and prices

### Requirement 15: Search and Filter Functionality

**User Story:** As a user, I want to search and filter products, so that I can quickly find items I'm interested in.

#### Acceptance Criteria

1. WHEN a User enters a search query, THE Marketplace_Platform SHALL return Products where the query matches product name or description (case-insensitive)
2. THE Marketplace_Platform SHALL support filtering Products by Shop Location (Harar, Dire_Dawa, or both)
3. THE Marketplace_Platform SHALL support filtering Products by price range (minimum and maximum values)
4. THE Marketplace_Platform SHALL apply multiple filters simultaneously using AND logic
5. WHEN no Products match the search or filter criteria, THE Marketplace_Platform SHALL display a message indicating no results found

### Requirement 16: Eastern Triangle Pricing Engine

**User Story:** As a user, I want accurate delivery fees calculated based on my location and the shop location, so that I know the total cost upfront.

#### Acceptance Criteria

1. WHEN an Order is created with Shop Location Harar and User Home_Location Harar, THE Marketplace_Platform SHALL calculate a delivery fee of 40 ETB
2. WHEN an Order is created with Shop Location Dire_Dawa and User Home_Location DDU, THE Marketplace_Platform SHALL calculate a delivery fee of 40 ETB
3. WHEN an Order is created with Shop Location Harar and User Home_Location Haramaya_Main, THE Marketplace_Platform SHALL calculate a delivery fee between 80 ETB and 120 ETB
4. WHEN an Order is created with Shop Location Dire_Dawa and User Home_Location Haramaya_Main, THE Marketplace_Platform SHALL calculate a delivery fee between 80 ETB and 120 ETB
5. WHEN an Order is created with Shop Location Harar and User Home_Location DDU, THE Marketplace_Platform SHALL calculate a delivery fee of 180 ETB
6. WHEN an Order is created with Shop Location Dire_Dawa and User Home_Location Harar, THE Marketplace_Platform SHALL calculate a delivery fee of 180 ETB
7. THE Marketplace_Platform SHALL display the estimated delivery time with each delivery fee (30 minute-1 hour  for intra-city, 3-4 hours for city-to-campus, 5-6 hours for inter-city)

### Requirement 17: OTP-Based Order Completion

**User Story:** As a user, I want to verify product delivery using an OTP, so that funds are only released when I confirm receipt.

#### Acceptance Criteria

1. WHEN a User receives an Order with status ARRIVED, THE Marketplace_Platform SHALL display the 6-digit OTP to the User
2. WHEN a Runner submits an OTP for an Order, THE Marketplace_Platform SHALL validate the OTP matches the Order's stored OTP
3. WHEN the OTP validation succeeds, THE Marketplace_Platform SHALL update the Order status to COMPLETED using a Firestore_Transaction
4. WHEN an Order status changes to COMPLETED, THE Marketplace_Platform SHALL release funds from the Escrow_Account to the Shop_Owner's balance
5. WHEN the OTP validation fails, THE Marketplace_Platform SHALL reject the completion request and display an error message
6. THE Marketplace_Platform SHALL allow a maximum of 3 OTP validation attempts per Order before locking the Order for manual review

### Requirement 18: Order Cancellation

**User Story:** As a user, I want to cancel orders under certain conditions, so that I can change my mind before delivery.

#### Acceptance Criteria

1. WHEN a User requests to cancel an Order with status PENDING, THE Marketplace_Platform SHALL update the Order status to CANCELLED using a Firestore_Transaction
2. WHEN a User requests to cancel an Order with status PAID_ESCROW, THE Marketplace_Platform SHALL update the Order status to CANCELLED and initiate a refund through Chapa_Gateway
3. WHEN a User requests to cancel an Order with status DISPATCHED or ARRIVED, THE Marketplace_Platform SHALL reject the cancellation request
4. WHEN an Order status changes to CANCELLED, THE Marketplace_Platform SHALL send a notification to the Shop_Owner
5. THE Marketplace_Platform SHALL record the cancellation timestamp and reason with the Order record

### Requirement 19: Telegram Mini App Authentication

**User Story:** As a user, I want to authenticate using my Telegram identity, so that I can access the marketplace without creating a separate account.

#### Acceptance Criteria

1. WHEN a User opens the Telegram_Mini_App, THE Marketplace_Platform SHALL retrieve the User's telegramId from the Telegram context
2. THE Marketplace_Platform SHALL use the telegramId as the primary User identifier in Firestore
3. WHEN a User accesses the Telegram_Mini_App for the first time, THE Marketplace_Platform SHALL create a User profile with the telegramId
4. THE Marketplace_Platform SHALL verify the telegramId using Firebase Admin SDK before processing any Server Action
5. WHEN telegramId verification fails, THE Marketplace_Platform SHALL reject the request and return an authentication error

### Requirement 20: AI Sales Assistant

**User Story:** As a user, I want to ask questions about products using a chat interface, so that I can get information without browsing manually.

#### Acceptance Criteria

1. THE Marketplace_Platform SHALL provide an AI_Sales_Assistant interface accessible from the product browsing page
2. WHEN a User submits a question to the AI_Sales_Assistant, THE Marketplace_Platform SHALL query the OpenAI API with the question and relevant Product data from Firestore
3. THE AI_Sales_Assistant SHALL use RAG (Retrieval-Augmented Generation) to answer questions based on Product names, descriptions, prices, and Shop information
4. THE AI_Sales_Assistant SHALL respond within 5 seconds for 95% of queries
5. WHEN the AI_Sales_Assistant cannot answer a question, THE Marketplace_Platform SHALL provide a fallback message directing the User to contact the Shop_Owner directly
6. THE AI_Sales_Assistant SHALL automatically detect if a User is speaking in Amharic, Afaan Oromo, or English
7. THE AI_Sales_Assistant SHALL be capable of explaining Product details in any of these three languages, regardless of the language used in the Firestore record

### Requirement 21: Mobile-Optimized Telegram Interface

**User Story:** As a user accessing the platform through Telegram on mobile, I want a touch-optimized interface, so that I can easily navigate and make purchases.

#### Acceptance Criteria

1. THE Marketplace_Platform SHALL render all user interfaces using Shadcn UI components optimized for touch interaction
2. THE Marketplace_Platform SHALL ensure all interactive elements have touch-friendly sizing (minimum 44x44 pixels)
3. WHEN the Telegram_Mini_App loads, THE Marketplace_Platform SHALL adapt the layout to the Telegram viewport dimensions
4. THE Marketplace_Platform SHALL optimize image loading for mobile network conditions using lazy loading and responsive images
5. THE Marketplace_Platform SHALL provide haptic feedback for key interactions (add to cart, place order, payment confirmation) when supported by the device

### Requirement 22: Shop Owner Balance Management

**User Story:** As a shop owner, I want to track my earnings and available balance, so that I can manage my business finances.

#### Acceptance Criteria

1. THE Marketplace_Platform SHALL maintain a balance field in the Shop record in Firestore
2. WHEN an Order status changes to COMPLETED, THE Marketplace_Platform SHALL increment the Shop balance by the Order product total (excluding delivery fee) using a Firestore_Transaction
3. WHEN a Shop_Owner views their dashboard, THE Marketplace_Platform SHALL display the current balance, pending orders value, and completed orders value
4. THE Marketplace_Platform SHALL maintain a transaction history for each Shop showing all balance changes with timestamps and Order references
5. THE Marketplace_Platform SHALL calculate the Shop balance as the sum of all COMPLETED Order product totals minus any withdrawals

### Requirement 23: Data Integrity with Firestore Transactions

**User Story:** As a system administrator, I want all critical state changes to use atomic transactions, so that data remains consistent under concurrent access.

#### Acceptance Criteria

1. WHEN the Order status changes from PENDING to PAID_ESCROW, THE Marketplace_Platform SHALL use a Firestore_Transaction to update the status atomically
2. WHEN the Order status changes from ARRIVED to COMPLETED, THE Marketplace_Platform SHALL use a Firestore_Transaction to update both the Order status and Shop balance atomically
3. WHEN the Payment_Webhook processes a payment confirmation, THE Marketplace_Platform SHALL use a Firestore_Transaction to check and update the Order status atomically
4. WHEN a User cancels an Order with status PAID_ESCROW, THE Marketplace_Platform SHALL use a Firestore_Transaction to update the Order status atomically
5. THE Marketplace_Platform SHALL retry failed Firestore_Transactions up to 3 times with exponential backoff

### Requirement 24: Payment Webhook Idempotency

**User Story:** As a system administrator, I want payment webhooks to be idempotent, so that duplicate webhook calls do not cause double-crediting.

#### Acceptance Criteria

1. WHEN the Payment_Webhook receives a payment confirmation, THE Marketplace_Platform SHALL check if the orderId has already been processed to PAID_ESCROW status
2. WHEN the orderId has already been processed, THE Marketplace_Platform SHALL return a success response without modifying the Order
3. WHEN the orderId has not been processed, THE Marketplace_Platform SHALL update the Order status to PAID_ESCROW and return a success response
4. THE Marketplace_Platform SHALL log all Payment_Webhook calls with timestamp, orderId, and processing result
5. THE Marketplace_Platform SHALL use a Firestore_Transaction to ensure atomic check-and-update of Order status in the Payment_Webhook handler

### Requirement 25: Chapa Sandbox Integration

**User Story:** As a developer, I want to test payment flows using Chapa Sandbox mode, so that I can verify functionality without real money transactions.

#### Acceptance Criteria

1. THE Marketplace_Platform SHALL support configuration for Chapa Sandbox mode via environment variables
2. WHEN Chapa Sandbox mode is enabled, THE Marketplace_Platform SHALL use Chapa test API endpoints for all payment requests
3. THE Marketplace_Platform SHALL accept Chapa Sandbox webhook callbacks at the same Payment_Webhook endpoint
4. THE Marketplace_Platform SHALL log all Chapa API requests and responses when in Sandbox mode for debugging
5. THE Marketplace_Platform SHALL display a visual indicator in the UI when operating in Sandbox mode

### Requirement 26: Regional i18n Support

**User Story:** As a user, I want to use the marketplace in my preferred language (Amharic, Afaan Oromo, or English), so that I can understand all interface elements and notifications.

#### Acceptance Criteria

1. THE Marketplace_Platform SHALL provide a global language switcher with options for Amharic, Afaan Oromo, and English
2. THE Marketplace_Platform SHALL store the User's language preference in their Firestore profile
3. WHEN a User changes their language preference, THE Marketplace_Platform SHALL update the User profile in Firestore and refresh the UI
4. THE Marketplace_Platform SHALL translate all core UI elements (navigation, buttons, labels, forms) based on the User's language preference
5. THE Marketplace_Platform SHALL translate all system-generated notifications (order status updates, payment confirmations) based on the User's language preference
6. WHEN a User first loads the Telegram_Mini_App, THE Marketplace_Platform SHALL detect the User's Telegram language setting and set the initial language preference accordingly

## Notes

- The platform uses Next.js 15 App Router architecture with Server Actions for all mutations
- Firebase services (Firestore, Auth, Storage) provide the backend infrastructure
- Chapa payment gateway integration is required for Ethiopian market payment processing, with support for both Sandbox and Production modes
- The system is designed for deployment as a Telegram Mini App with mobile-first considerations
- Multi-tenancy is enforced at the data model level with shopId associations
- The escrow payment lifecycle follows a strict state machine: PENDING → PAID_ESCROW → DISPATCHED → ARRIVED → COMPLETED (or CANCELLED at certain stages)
- All critical state transitions must use Firestore Transactions to ensure data integrity
- The Eastern Triangle Pricing Engine implements fixed delivery fees based on route: 40 ETB (intra-city), 80-120 ETB (city-to-campus), 180 ETB (inter-city)
- OTP-based delivery verification ensures funds are only released when the user confirms receipt
- Payment webhook handlers must implement idempotency checks to prevent double-crediting
- All Server Actions must verify telegramId using Firebase Admin SDK before processing requests
- The AI Sales Assistant uses RAG with OpenAI to answer product-specific questions based on Firestore data
- No placeholder code is permitted - all implementations must be functional using Chapa Sandbox for testing

## Implementation Roadmap

The requirements should be implemented in the following order to ensure dependencies are satisfied:

1. Infrastructure: Authentication and User Profile management with Home_Location selection and i18n language preference setup
2. Merchant Flow: Product CRUD operations with Firebase Storage for images
3. Logistics Engine: Eastern Triangle Pricing Matrix utility implementation
4. Payment Flow: Chapa Sandbox integration and idempotent Payment_Webhook handler
5. Order Lifecycle: OTP generation, validation logic, and escrow state machine
6. AI Layer: RAG-based AI_Sales_Assistant integration with OpenAI
