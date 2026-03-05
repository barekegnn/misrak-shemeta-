'use server';

import { adminDb, FieldPath } from '@/lib/firebase/admin';
import { Product, ActionResponse, Location, City } from '@/types';

/**
 * Filter options for product catalog
 */
export interface ProductFilters {
  searchQuery?: string;
  shopLocation?: City | 'all';
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  userLocation?: Location; // For deliverability check
}

/**
 * Gets products for the catalog with filtering and search.
 * 
 * PERFORMANCE OPTIMIZED: Uses denormalized shopCity to avoid N+1 queries.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 15.1, 15.2, 15.3, 15.4
 */
export async function getProducts(
  filters: ProductFilters = {}
): Promise<ActionResponse<Product[]>> {
  try {
    console.log('[getProducts] Starting with filters:', JSON.stringify(filters));
    
    let query = adminDb.collection('products');

    // Filter by category if specified
    if (filters.category) {
      query = query.where('category', '==', filters.category) as any;
    }

    // Get all products (we'll filter in memory for complex conditions)
    const snapshot = await query.get();
    console.log('[getProducts] Retrieved products from DB:', snapshot.size);

    let products: Product[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        shopId: data.shopId,
        shopCity: data.shopCity as City, // Denormalized for performance
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        images: data.images,
        stock: data.stock,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });
    console.log('[getProducts] Mapped products:', products.length);

    // Filter by search query (case-insensitive)
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Filter by price range
    if (filters.minPrice !== undefined) {
      products = products.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      products = products.filter((p) => p.price <= filters.maxPrice!);
    }

    // Filter by shop location using denormalized shopCity (NO DATABASE QUERIES!)
    if (filters.shopLocation && filters.shopLocation !== 'all') {
      products = products.filter((p) => p.shopCity === filters.shopLocation);
    }

    // Filter by deliverability (based on user location) - now uses denormalized shopCity
    if (filters.userLocation) {
      console.log('[getProducts] Filtering by deliverability. User location:', filters.userLocation);
      const beforeCount = products.length;
      
      products = products.filter((product) => {
        // Skip products without shopCity (data integrity issue)
        if (!product.shopCity) {
          console.warn(`[getProducts] Product ${product.id} (${product.name}) missing shopCity field`);
          return false;
        }
        
        const deliverable = isDeliverable(product.shopCity, filters.userLocation!);
        console.log(`[getProducts] Product "${product.name}" from ${product.shopCity} to ${filters.userLocation}: ${deliverable}`);
        return deliverable;
      });
      
      console.log(`[getProducts] After deliverability filter: ${beforeCount} -> ${products.length}`);
    }

    // Sort by creation date (newest first)
    products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    console.log('[getProducts] Final product count:', products.length);
    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error('Error getting products:', error);
    return {
      success: false,
      error: 'Failed to get products',
    };
  }
}

/**
 * Gets a single product by ID with shop information.
 * 
 * Requirements: 5.5
 */
export async function getProductById(
  productId: string
): Promise<ActionResponse<Product & { shopName: string; shopCity: City }>> {
  try {
    const productDoc = await adminDb.collection('products').doc(productId).get();

    if (!productDoc.exists) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    const data = productDoc.data()!;

    // Get shop information
    const shopDoc = await adminDb.collection('shops').doc(data.shopId).get();
    if (!shopDoc.exists) {
      return {
        success: false,
        error: 'Shop not found',
      };
    }

    const shopData = shopDoc.data()!;

    const product = {
      id: productDoc.id,
      shopId: data.shopId,
      shopCity: data.shopCity as City, // Denormalized for performance
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      images: data.images,
      stock: data.stock,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      shopName: shopData.name,
    };

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error('Error getting product:', error);
    return {
      success: false,
      error: 'Failed to get product',
    };
  }
}

/**
 * Gets all available categories from products.
 * Used for category filter dropdown.
 */
export async function getCategories(): Promise<ActionResponse<string[]>> {
  try {
    const snapshot = await adminDb.collection('products').get();
    
    const categories = new Set<string>();
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.category) {
        categories.add(data.category);
      }
    });

    return {
      success: true,
      data: Array.from(categories).sort(),
    };
  } catch (error) {
    console.error('Error getting categories:', error);
    return {
      success: false,
      error: 'Failed to get categories',
    };
  }
}

/**
 * Checks if a product from a shop city can be delivered to a user location.
 * 
 * Delivery matrix:
 * - Harar → Harar_Campus: Yes (intra-city)
 * - Harar → Haramaya_Main: Yes (city-to-campus)
 * - Harar → DDU: Yes (inter-city)
 * - Dire Dawa → DDU: Yes (intra-city)
 * - Dire Dawa → Haramaya_Main: Yes (city-to-campus)
 * - Dire Dawa → Harar_Campus: Yes (inter-city)
 * 
 * All routes are deliverable in the Eastern Triangle.
 */
function isDeliverable(shopCity: City, userLocation: Location): boolean {
  console.log(`[isDeliverable] Checking: shopCity="${shopCity}", userLocation="${userLocation}"`);
  
  // In the Eastern Triangle, all routes are deliverable
  // This function exists for future expansion if certain routes become unavailable
  
  // Harar shops can deliver to all locations
  if (shopCity === 'Harar') {
    const result = ['Harar_Campus', 'Haramaya_Main', 'DDU'].includes(userLocation);
    console.log(`[isDeliverable] Harar check: ${result}`);
    return result;
  }
  
  // Dire Dawa shops can deliver to all locations
  if (shopCity === 'Dire Dawa') {
    const result = ['DDU', 'Haramaya_Main', 'Harar_Campus'].includes(userLocation);
    console.log(`[isDeliverable] Dire Dawa check: ${result}`);
    return result;
  }
  
  console.log(`[isDeliverable] No match, returning false`);
  return false;
}

/**
 * Searches products by name or description.
 * This is a dedicated search function for better performance.
 * 
 * Requirements: 15.1
 */
export async function searchProducts(
  searchQuery: string,
  userLocation?: Location
): Promise<ActionResponse<Product[]>> {
  if (!searchQuery || searchQuery.trim().length === 0) {
    return {
      success: true,
      data: [],
    };
  }

  return getProducts({ searchQuery, userLocation });
}
