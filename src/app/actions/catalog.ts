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
 * IMPORTANT: Filters products based on user's home location to show only
 * products that can be delivered to them (deliverability check).
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 15.1, 15.2, 15.3, 15.4
 */
export async function getProducts(
  filters: ProductFilters = {}
): Promise<ActionResponse<Product[]>> {
  try {
    let query = adminDb.collection('products');

    // Filter by shop location if specified
    if (filters.shopLocation && filters.shopLocation !== 'all') {
      // We need to join with shops collection to filter by shop city
      // Since Firestore doesn't support joins, we'll filter in memory
      // For production, consider denormalizing shop city to product document
    }

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

    // Filter by shop location (if we have originCity in product)
    // Note: We need to add originCity to Product type or fetch shop data
    if (filters.shopLocation && filters.shopLocation !== 'all') {
      // Get shop IDs for the specified city
      const shopsSnapshot = await adminDb
        .collection('shops')
        .where('city', '==', filters.shopLocation)
        .get();
      
      const shopIds = new Set(shopsSnapshot.docs.map((doc) => doc.id));
      products = products.filter((p) => shopIds.has(p.shopId));
    }

    // Filter by deliverability (based on user location)
    // This ensures users only see products that can be delivered to them
    if (filters.userLocation) {
      products = await filterByDeliverability(products, filters.userLocation);
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
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      images: data.images,
      stock: data.stock,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      shopName: shopData.name,
      shopCity: shopData.city as City,
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
 * Filters products by deliverability based on user location.
 * 
 * This is a critical business logic function that ensures users only see
 * products that can actually be delivered to their location.
 * 
 * Deliverability rules:
 * - Products from Harar can be delivered to: Harar_Campus, Haramaya_Main, DDU (inter-city)
 * - Products from Dire Dawa can be delivered to: DDU, Haramaya_Main, Harar_Campus (inter-city)
 * 
 * Requirements: 2.5 (implicit - filter based on home location)
 */
async function filterByDeliverability(
  products: Product[],
  userLocation: Location
): Promise<Product[]> {
  // If no products, return empty array
  if (products.length === 0) {
    return [];
  }

  // Get shop information for all products
  const shopIds = [...new Set(products.map((p) => p.shopId))];
  
  // If no shop IDs, return empty array
  if (shopIds.length === 0) {
    return [];
  }

  const shopsSnapshot = await adminDb
    .collection('shops')
    .where(FieldPath.documentId(), 'in', shopIds.slice(0, 10)) // Firestore 'in' limit is 10
    .get();

  const shopCityMap = new Map<string, City>();
  shopsSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    shopCityMap.set(doc.id, data.city as City);
  });

  // If we have more than 10 shops, fetch the rest
  if (shopIds.length > 10) {
    const remainingShopIds = shopIds.slice(10);
    for (let i = 0; i < remainingShopIds.length; i += 10) {
      const batch = remainingShopIds.slice(i, i + 10);
      const batchSnapshot = await adminDb
        .collection('shops')
        .where(FieldPath.documentId(), 'in', batch)
        .get();
      
      batchSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        shopCityMap.set(doc.id, data.city as City);
      });
    }
  }

  // Filter products based on deliverability
  return products.filter((product) => {
    const shopCity = shopCityMap.get(product.shopId);
    if (!shopCity) return false; // Shop not found, exclude product

    return isDeliverable(shopCity, userLocation);
  });
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
