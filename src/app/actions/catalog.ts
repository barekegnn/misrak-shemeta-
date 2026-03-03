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
    let query = adminDb.collection('products');

    // Filter by category if specified
    if (filters.category) {
      query = query.where('category', '==', filters.category) as any;
    }

    // Get all products (we'll filter in memory for complex conditions)
    const snapshot = await query.get();

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
      products = products.filter((product) => 
        isDeliverable(product.shopCity, filters.userLocation!)
      );
    }

    // Sort by creation date (newest first)
    products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

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
  // In the Eastern Triangle, all routes are deliverable
  // This function exists for future expansion if certain routes become unavailable
  
  // Harar shops can deliver to all locations
  if (shopCity === 'Harar') {
    return ['Harar_Campus', 'Haramaya_Main', 'DDU'].includes(userLocation);
  }
  
  // Dire Dawa shops can deliver to all locations
  if (shopCity === 'Dire Dawa') {
    return ['DDU', 'Haramaya_Main', 'Harar_Campus'].includes(userLocation);
  }
  
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
