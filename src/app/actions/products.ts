'use server';

import { adminDb, FieldValue } from '@/lib/firebase/admin';
import { verifyTelegramUser, getShopIdForOwner } from '@/lib/auth/telegram';
import { Product, ActionResponse, City } from '@/types';
import { deleteProductImages } from '@/lib/storage/images';

/**
 * UTILITY FUNCTIONS FOR PRODUCT UPLOAD
 * Medium-Priority Fixes for Manual Product Creation
 */

/**
 * Fix 8: Check Firebase Storage quota before upload
 */
async function checkStorageQuota(): Promise<{ available: boolean; message: string }> {
  try {
    console.log('[checkStorageQuota] Checking storage quota...');
    
    // Try to upload a small test file to verify quota
    const { storage } = await import('@/lib/firebase/config');
    const { ref, uploadBytes, deleteObject } = await import('firebase/storage');
    
    const testFile = new Blob(['test'], { type: 'text/plain' });
    const testRef = ref(storage, `quota_check_${Date.now()}.txt`);
    
    try {
      await uploadBytes(testRef, testFile);
      await deleteObject(testRef);
      
      console.log('[checkStorageQuota] Storage quota check passed');
      return { available: true, message: 'Storage available' };
    } catch (uploadError: any) {
      if (uploadError.code === 'storage/quota-exceeded') {
        console.error('[checkStorageQuota] Storage quota exceeded');
        return {
          available: false,
          message: 'Storage quota exceeded. Please contact support.'
        };
      }
      throw uploadError;
    }
  } catch (error) {
    console.error('[checkStorageQuota] Error checking quota:', error);
    // Don't block upload if quota check fails - let the actual upload attempt
    return { available: true, message: 'Storage check passed' };
  }
}

/**
 * Fix 5: Retry logic with exponential backoff for image uploads
 */
async function uploadProductImageWithRetry(
  telegramId: string,
  shopId: string,
  productId: string,
  imageData: string,
  imageIndex: number,
  mimeType: string,
  maxRetries: number = 3
): Promise<ActionResponse<string>> {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[uploadProductImageWithRetry] Attempt ${attempt + 1}/${maxRetries} for image ${imageIndex}`);
      
      // Import and call the upload function
      const { uploadProductImage: uploadImage } = await import('@/lib/storage/images');
      
      const isTemporaryId = productId.startsWith('temp_');
      const actualProductId = isTemporaryId ? `temp/${productId}` : productId;
      
      const result = await uploadImage(shopId, actualProductId, imageData, imageIndex, mimeType);
      
      if (result.success && result.url) {
        console.log(`[uploadProductImageWithRetry] Success on attempt ${attempt + 1}`);
        return {
          success: true,
          data: result.url,
        };
      }
      
      lastError = result.error || 'Upload failed';
      
    } catch (error) {
      console.error(`[uploadProductImageWithRetry] Error on attempt ${attempt + 1}:`, error);
      lastError = error instanceof Error ? error.message : String(error);
    }
    
    // Don't retry on last attempt
    if (attempt < maxRetries - 1) {
      // Exponential backoff: 1s, 2s, 4s
      const delayMs = 1000 * Math.pow(2, attempt);
      console.log(`[uploadProductImageWithRetry] Retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  // All retries failed
  console.error('[uploadProductImageWithRetry] All retries failed:', lastError);
  return {
    success: false,
    error: `Failed to upload image after ${maxRetries} attempts: ${lastError}`
  };
}

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
    console.log('[createProduct] Starting product creation for telegramId:', telegramId);
    console.log('[createProduct] Product data:', JSON.stringify({
      name: productData.name,
      price: productData.price,
      category: productData.category,
      stock: productData.stock,
      imageCount: productData.images.length
    }));
    
    // 1. Verify user
    const user = await verifyTelegramUser(telegramId);
    if (!user) {
      console.error('[createProduct] User verification failed');
      return {
        success: false,
        error: 'User not found or unauthorized',
      };
    }
    console.log('[createProduct] User verified:', user.id, 'Role:', user.role);

    // 2. Verify user is a shop owner
    if (user.role !== 'MERCHANT') {
      console.error('[createProduct] User is not a merchant, role:', user.role);
      return {
        success: false,
        error: 'Only shop owners can create products',
      };
    }

    // 3. Get shop ID for this owner
    console.log('[createProduct] Getting shop ID for owner:', user.id);
    const shopId = await getShopIdForOwner(user.id);
    if (!shopId) {
      console.error('[createProduct] No shop found for owner:', user.id);
      return {
        success: false,
        error: 'Shop not found for this owner',
      };
    }
    console.log('[createProduct] Shop ID found:', shopId);

    // 4. Get shop details to get originCity
    console.log('[createProduct] Fetching shop details...');
    const shopDoc = await adminDb.collection('shops').doc(shopId).get();
    if (!shopDoc.exists) {
      console.error('[createProduct] Shop document does not exist:', shopId);
      return {
        success: false,
        error: 'Shop not found',
      };
    }
    const shopData = shopDoc.data()!;
    console.log('[createProduct] Shop city:', shopData.city);

    // 5. Validate product data
    console.log('[createProduct] Validating product data...');
    const validation = validateProductInput(productData);
    if (!validation.valid) {
      console.error('[createProduct] Validation failed:', validation.error);
      return {
        success: false,
        error: validation.error,
      };
    }
    console.log('[createProduct] Product data validated successfully');

    // 6. Create product with shopId association (TENANT ISOLATION)
    console.log('[createProduct] Creating product document...');
    const productRef = await adminDb.collection('products').add({
      shopId, // CRITICAL: Associate with shop for tenant isolation
      shopCity: shopData.city as City, // Denormalized for performance (eliminates N+1 queries)
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      images: productData.images,
      stock: productData.stock,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    console.log('[createProduct] Product document created with ID:', productRef.id);

    // 7. Get created product
    console.log('[createProduct] Fetching created product...');
    const productDoc = await productRef.get();
    const productDataFromDb = productDoc.data()!;

    const product: Product = {
      id: productRef.id,
      shopId: productDataFromDb.shopId,
      shopCity: productDataFromDb.shopCity as City,
      name: productDataFromDb.name,
      description: productDataFromDb.description,
      price: productDataFromDb.price,
      category: productDataFromDb.category,
      images: productDataFromDb.images,
      stock: productDataFromDb.stock,
      createdAt: productDataFromDb.createdAt.toDate(),
      updatedAt: productDataFromDb.updatedAt.toDate(),
    };

    console.log('[createProduct] Product creation completed successfully:', product.id);
    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error('[createProduct] ERROR during product creation:', error);
    console.error('[createProduct] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[createProduct] Error message:', error instanceof Error ? error.message : String(error));
    return {
      success: false,
      error: `Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`,
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

    if (productData.images && productData.images.length > 0 && productData.images.length > 5) {
      return {
        success: false,
        error: 'Product cannot have more than 5 images',
      };
    }

    // 6. Update product
    await adminDb.collection('products').doc(productId).update({
      ...productData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 7. Get updated product
    const updatedDoc = await adminDb.collection('products').doc(productId).get();
    const updatedData = updatedDoc.data()!;

    const product: Product = {
      id: productId,
      shopId: updatedData.shopId,
      shopCity: updatedData.shopCity as City,
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
        shopCity: data.shopCity as City,
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
        shopCity: data.shopCity as City,
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
 * Uploads a product image to Firebase Storage.
 * 
 * SECURITY: Verifies user is shop owner before allowing upload.
 * STORAGE: Uploads to /products/{shopId}/{productId}/image_{index}.{ext}
 * 
 * Requirements: 13.1, 13.2, 13.5
 */
export async function uploadProductImage(
  telegramId: string,
  shopId: string,
  productId: string,
  imageData: string, // base64 without prefix
  imageIndex: number,
  mimeType: string
): Promise<ActionResponse<string>> {
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
        error: 'Only shop owners can upload product images',
      };
    }

    // 3. Verify shop ownership
    const userShopId = await getShopIdForOwner(user.id);
    if (!userShopId || userShopId !== shopId) {
      return {
        success: false,
        error: 'You can only upload images for your own shop',
      };
    }

    // FIX 8: Check storage quota before upload
    const quotaCheck = await checkStorageQuota();
    if (!quotaCheck.available) {
      console.error('[uploadProductImage] Storage quota check failed:', quotaCheck.message);
      return {
        success: false,
        error: quotaCheck.message,
      };
    }

    // FIX 5: Use retry logic for image upload
    return await uploadProductImageWithRetry(
      telegramId,
      shopId,
      productId,
      imageData,
      imageIndex,
      mimeType,
      3 // maxRetries
    );
  } catch (error) {
    console.error('Error uploading product image:', error);
    return {
      success: false,
      error: 'Failed to upload image',
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

  if (!data.images || data.images.length > 5) {
    return { valid: false, error: 'Product cannot have more than 5 images' };
  }

  if (data.stock < 0) {
    return { valid: false, error: 'Stock cannot be negative' };
  }

  return { valid: true };
}
