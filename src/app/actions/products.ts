'use server';

import { adminDb } from '@/lib/firebase/admin';
import { verifyTelegramUser, getShopIdForOwner } from '@/lib/auth/telegram';
import { Product, ActionResponse, City } from '@/types';
import { deleteProductImages } from '@/lib/storage/images';

/**
 * Input type for creating/updating products
 */
export interface ProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[]; // Firebase Storage URLs
  stock: number;
}

/**
 * Creates a new product for a shop.
 * 
 * SECURITY: Verifies telegramId and ensures user is a shop owner.
 * MULTI-TENANCY: Automatically associates product with shop owner's shop.
 * 
 * Requirements: 4.1, 4.2, 4.3, 10.3
 */
export async function createProduct(
  telegramId: string,
  productData: ProductInput
): Promise<ActionResponse<Product>> {
  try {
    // 1. Verify user
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return {
        success: false,
        error: 'User not found or unauthorized',
      };
    }

    // 2. Verify user is a shop owner
    if (user.role !== 'MERCHANT') {
      return {
        success: false,
        error: 'Only shop owners can create products',
      };
    }

    // 3. Get shop ID for this owner
    const shopId = await getShopIdForOwner(user.id);
    if (!shopId) {
      return {
        success: false,
        error: 'Shop not found for this owner',
      };
    }

    // 4. Get shop details to get originCity
    const shopDoc = await adminDb.collection('shops').doc(shopId).get();
    if (!shopDoc.exists) {
      return {
        success: false,
        error: 'Shop not found',
      };
    }
    const shopData = shopDoc.data()!;

    // 5. Validate product data
    const validation = validateProductInput(productData);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // 6. Create product with shopId association (TENANT ISOLATION)
    const productRef = await adminDb.collection('products').add({
      shopId, // CRITICAL: Associate with shop for tenant isolation
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      images: productData.images,
      stock: productData.stock,
      originCity: shopData.city as City, // Denormalized for delivery fee calculation
      createdAt: adminDb.FieldValue.serverTimestamp(),
      updatedAt: adminDb.FieldValue.serverTimestamp(),
    });

    // 7. Get created product
    const productDoc = await productRef.get();
    const productDataFromDb = productDoc.data()!;

    const product: Product = {
      id: productRef.id,
      shopId: productDataFromDb.shopId,
      name: productDataFromDb.name,
      description: productDataFromDb.description,
      price: productDataFromDb.price,
      category: productDataFromDb.category,
      images: productDataFromDb.images,
      stock: productDataFromDb.stock,
      createdAt: productDataFromDb.createdAt.toDate(),
      updatedAt: productDataFromDb.updatedAt.toDate(),
    };

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      success: false,
      error: 'Failed to create product',
    };
  }
}

/**
 * Updates an existing product.
 * 
 * SECURITY: Verifies ownership before allowing update.
 * MULTI-TENANCY: Ensures product belongs to shop owner's shop.
 * 
 * Requirements: 4.4, 10.3
 */
export async function updateProduct(
  telegramId: string,
  productId: string,
  productData: Partial<ProductInput>
): Promise<ActionResponse<Product>> {
  try {
    // 1. Verify user
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return {
        success: false,
        error: 'User not found or unauthorized',
      };
    }

    // 2. Verify user is a shop owner
    if (user.role !== 'MERCHANT') {
      return {
        success: false,
        error: 'Only shop owners can update products',
      };
    }

    // 3. Get shop ID for this owner
    const shopId = await getShopIdForOwner(user.id);
    if (!shopId) {
      return {
        success: false,
        error: 'Shop not found for this owner',
      };
    }

    // 4. Get product and verify ownership (CRITICAL SECURITY CHECK)
    const productDoc = await adminDb.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    const existingProduct = productDoc.data()!;
    
    // TENANT ISOLATION: Verify product belongs to this shop
    if (existingProduct.shopId !== shopId) {
      return {
        success: false,
        error: 'You cannot modify products from other shops',
      };
    }

    // 5. Validate update data
    if (productData.price !== undefined && productData.price <= 0) {
      return {
        success: false,
        error: 'Price must be greater than 0',
      };
    }

    if (productData.stock !== undefined && productData.stock < 0) {
      return {
        success: false,
        error: 'Stock cannot be negative',
      };
    }

    if (productData.images && (productData.images.length < 1 || productData.images.length > 5)) {
      return {
        success: false,
        error: 'Product must have between 1 and 5 images',
      };
    }

    // 6. Update product
    await adminDb.collection('products').doc(productId).update({
      ...productData,
      updatedAt: adminDb.FieldValue.serverTimestamp(),
    });

    // 7. Get updated product
    const updatedDoc = await adminDb.collection('products').doc(productId).get();
    const updatedData = updatedDoc.data()!;

    const product: Product = {
      id: productId,
      shopId: updatedData.shopId,
      name: updatedData.name,
      description: updatedData.description,
      price: updatedData.price,
      category: updatedData.category,
      images: updatedData.images,
      stock: updatedData.stock,
      createdAt: updatedData.createdAt.toDate(),
      updatedAt: updatedData.updatedAt.toDate(),
    };

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      success: false,
      error: 'Failed to update product',
    };
  }
}

/**
 * Deletes a product.
 * 
 * SECURITY: Verifies ownership before allowing deletion.
 * CLEANUP: Deletes associated images from Firebase Storage.
 * 
 * Requirements: 4.5, 13.4
 */
export async function deleteProduct(
  telegramId: string,
  productId: string
): Promise<ActionResponse<void>> {
  try {
    // 1. Verify user
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return {
        success: false,
        error: 'User not found or unauthorized',
      };
    }

    // 2. Verify user is a shop owner
    if (user.role !== 'MERCHANT') {
      return {
        success: false,
        error: 'Only shop owners can delete products',
      };
    }

    // 3. Get shop ID for this owner
    const shopId = await getShopIdForOwner(user.id);
    if (!shopId) {
      return {
        success: false,
        error: 'Shop not found for this owner',
      };
    }

    // 4. Get product and verify ownership (CRITICAL SECURITY CHECK)
    const productDoc = await adminDb.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    const product = productDoc.data()!;
    
    // TENANT ISOLATION: Verify product belongs to this shop
    if (product.shopId !== shopId) {
      return {
        success: false,
        error: 'You cannot delete products from other shops',
      };
    }

    // 5. Delete images from Firebase Storage
    if (product.images && product.images.length > 0) {
      await deleteProductImages(shopId, productId);
    }

    // 6. Delete product document
    await adminDb.collection('products').doc(productId).delete();

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting product:', error);
    return {
      success: false,
      error: 'Failed to delete product',
    };
  }
}

/**
 * Gets all products for a shop owner.
 * 
 * MULTI-TENANCY: Only returns products belonging to the owner's shop.
 * 
 * Requirements: 1.5
 */
export async function getProductsByShop(
  telegramId: string
): Promise<ActionResponse<Product[]>> {
  try {
    // 1. Verify user
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      return {
        success: false,
        error: 'User not found or unauthorized',
      };
    }

    // 2. Verify user is a shop owner
    if (user.role !== 'MERCHANT') {
      return {
        success: false,
        error: 'Only shop owners can view their products',
      };
    }

    // 3. Get shop ID for this owner
    const shopId = await getShopIdForOwner(user.id);
    if (!shopId) {
      return {
        success: false,
        error: 'Shop not found for this owner',
      };
    }

    // 4. Get products for this shop (TENANT ISOLATION)
    const snapshot = await adminDb
      .collection('products')
      .where('shopId', '==', shopId)
      .orderBy('createdAt', 'desc')
      .get();

    const products: Product[] = snapshot.docs.map((doc) => {
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

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error('Error getting products by shop:', error);
    return {
      success: false,
      error: 'Failed to get products',
    };
  }
}

/**
 * Gets all products for a specific shop (for buyers to browse).
 * Public function - no authentication required.
 * 
 * Requirements: 5.1, 5.2
 */
export async function getProductsByShopId(
  shopId: string
): Promise<ActionResponse<Product[]>> {
  try {
    console.log('[getProductsByShopId] Fetching products for shopId:', shopId);
    
    // Get products for this shop
    const snapshot = await adminDb
      .collection('products')
      .where('shopId', '==', shopId)
      .orderBy('createdAt', 'desc')
      .get();

    console.log('[getProductsByShopId] Found', snapshot.docs.length, 'products');

    const products: Product[] = snapshot.docs.map((doc) => {
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

    console.log('[getProductsByShopId] Returning', products.length, 'products');

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error('[getProductsByShopId] Error getting products by shop ID:', error);
    return {
      success: false,
      error: 'Failed to get products',
    };
  }
}

/**
 * Validates product input data.
 * Ensures all required fields are present and valid.
 */
function validateProductInput(data: ProductInput): { valid: boolean; error?: string } {
  if (!data.name || data.name.trim().length === 0) {
    return { valid: false, error: 'Product name is required' };
  }

  if (data.name.length > 100) {
    return { valid: false, error: 'Product name must be 100 characters or less' };
  }

  if (!data.description || data.description.trim().length === 0) {
    return { valid: false, error: 'Product description is required' };
  }

  if (data.description.length > 1000) {
    return { valid: false, error: 'Product description must be 1000 characters or less' };
  }

  if (!data.price || data.price <= 0) {
    return { valid: false, error: 'Price must be greater than 0' };
  }

  if (!data.category || data.category.trim().length === 0) {
    return { valid: false, error: 'Category is required' };
  }

  if (!data.images || data.images.length < 1 || data.images.length > 5) {
    return { valid: false, error: 'Product must have between 1 and 5 images' };
  }

  if (data.stock < 0) {
    return { valid: false, error: 'Stock cannot be negative' };
  }

  return { valid: true };
}
