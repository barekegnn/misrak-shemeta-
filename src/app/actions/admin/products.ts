/**
 * Admin Product Moderation Server Actions
 * 
 * Provides server actions for moderating products including removal,
 * listing with search/filter, and viewing flagged products.
 * 
 * Requirements: 30.1, 30.2
 */

'use server';

import { adminDb, adminStorage } from '@/lib/firebase/admin';
import { requireAdminAccess } from '@/lib/auth/admin';
import { logAdminAction } from '@/lib/admin/audit';
import type { Product, ActionResponse, ProductFilters } from '@/types';

/**
 * Removes a product from the platform
 * 
 * Deletes the product record from Firestore and removes associated images
 * from Firebase Storage. This action is irreversible.
 * 
 * @param adminTelegramId - Telegram ID of admin performing the action
 * @param productId - ID of product to remove
 * @param reason - Reason for removal
 * @returns ActionResponse<void>
 * 
 * Requirements: 30.1, 30.2
 */
export async function removeProduct(
  adminTelegramId: string,
  productId: string,
  reason: string
): Promise<ActionResponse<void>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Get product data before deletion
    const productDoc = await adminDb.collection('products').doc(productId).get();
    
    if (!productDoc.exists) {
      return { success: false, error: 'Product not found' };
    }
    
    const productData = productDoc.data()!;
    
    // Delete product images from Storage
    if (productData.images && Array.isArray(productData.images)) {
      try {
        const bucket = adminStorage.bucket();
        const deletePromises = productData.images.map(async (imageUrl: string) => {
          try {
            // Extract file path from URL
            const urlParts = imageUrl.split('/o/');
            if (urlParts.length > 1) {
              const filePath = decodeURIComponent(urlParts[1].split('?')[0]);
              await bucket.file(filePath).delete();
            }
          } catch (error) {
            console.error('Error deleting image:', error);
            // Continue even if image deletion fails
          }
        });
        await Promise.all(deletePromises);
      } catch (error) {
        console.error('Error deleting product images:', error);
        // Continue with product deletion even if images fail
      }
    }
    
    // Delete product record
    await adminDb.collection('products').doc(productId).delete();
    
    // Log admin action
    await logAdminAction({
      adminTelegramId,
      action: 'REMOVE_PRODUCT',
      targetType: 'PRODUCT',
      targetId: productId,
      details: { 
        reason,
        productName: productData.name,
        shopId: productData.shopId,
      },
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error removing product:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to remove product' };
  }
}

/**
 * Gets list of all products with pagination and filtering
 * 
 * Retrieves products from Firestore with optional filters for shop, location,
 * price range, and search by product name.
 * 
 * @param adminTelegramId - Telegram ID of admin requesting the list
 * @param filters - Optional filters for the product list
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of products per page
 * @returns ActionResponse<{ products: Product[], total: number, page: number, pageSize: number }>
 * 
 * Requirements: 30.1
 */
export async function getProductList(
  adminTelegramId: string,
  filters?: ProductFilters,
  page: number = 1,
  pageSize: number = 50
): Promise<ActionResponse<{
  products: (Product & { shopName?: string; shopCity?: string })[];
  total: number;
  page: number;
  pageSize: number;
}>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Build query
    let query: FirebaseFirestore.Query = adminDb.collection('products');
    
    // Apply filters
    if (filters?.shopId) {
      query = query.where('shopId', '==', filters.shopId);
    }
    
    if (filters?.productName) {
      query = query.where('name', '>=', filters.productName)
                   .where('name', '<=', filters.productName + '\uf8ff');
    }
    
    if (filters?.minPrice !== undefined) {
      query = query.where('price', '>=', filters.minPrice);
    }
    
    if (filters?.maxPrice !== undefined) {
      query = query.where('price', '<=', filters.maxPrice);
    }
    
    // Get total count
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;
    
    // Apply pagination and sorting
    const offset = (page - 1) * pageSize;
    query = query.orderBy('createdAt', 'desc').limit(pageSize).offset(offset);
    
    // Execute query
    const snapshot = await query.get();
    
    // Map to Product objects and fetch shop info
    const productsWithShops = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // Fetch shop information
        let shopName: string | undefined;
        let shopCity: string | undefined;
        if (data.shopId) {
          try {
            const shopDoc = await adminDb.collection('shops').doc(data.shopId).get();
            if (shopDoc.exists) {
              const shopData = shopDoc.data();
              shopName = shopData?.name;
              shopCity = shopData?.city || shopData?.location;
            }
          } catch (error) {
            console.error('Error fetching shop info:', error);
          }
        }
        
        return {
          id: doc.id,
          shopId: data.shopId,
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          images: data.images || [],
          stock: data.stock || 0,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          shopName,
          shopCity,
        } as Product & { shopName?: string; shopCity?: string };
      })
    );
    
    // Apply client-side location filter if needed
    let filteredProducts = productsWithShops;
    if (filters?.shopCity) {
      filteredProducts = productsWithShops.filter(
        p => p.shopCity === filters.shopCity
      );
    }
    
    return {
      success: true,
      data: {
        products: filteredProducts,
        total: filteredProducts.length,
        page,
        pageSize,
      },
    };
  } catch (error: any) {
    console.error('Error getting product list:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to get product list' };
  }
}

/**
 * Gets a single product by ID
 * 
 * @param adminTelegramId - Telegram ID of admin requesting the product
 * @param productId - ID of product to retrieve
 * @returns ActionResponse<Product>
 * 
 * Requirements: 30.1
 */
export async function getProductById(
  adminTelegramId: string,
  productId: string
): Promise<ActionResponse<Product>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // Get product document
    const productDoc = await adminDb.collection('products').doc(productId).get();
    
    if (!productDoc.exists) {
      return { success: false, error: 'Product not found' };
    }
    
    const data = productDoc.data()!;
    const product: Product = {
      id: productDoc.id,
      shopId: data.shopId,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      images: data.images || [],
      stock: data.stock || 0,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
    
    return { success: true, data: product };
  } catch (error: any) {
    console.error('Error getting product:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to get product' };
  }
}

/**
 * Gets flagged products (placeholder for future implementation)
 * 
 * In the future, this will return products that have been reported by users.
 * For now, it returns an empty list.
 * 
 * @param adminTelegramId - Telegram ID of admin requesting flagged products
 * @returns ActionResponse<Product[]>
 * 
 * Requirements: 30.1
 */
export async function getFlaggedProducts(
  adminTelegramId: string
): Promise<ActionResponse<Product[]>> {
  try {
    // Verify admin access
    await requireAdminAccess(adminTelegramId);
    
    // TODO: Implement flagged products functionality
    // For now, return empty array
    return { success: true, data: [] };
  } catch (error: any) {
    console.error('Error getting flagged products:', error);
    
    if (error.message?.includes('UNAUTHORIZED')) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Failed to get flagged products' };
  }
}
