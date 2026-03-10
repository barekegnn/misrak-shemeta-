import { adminStorage } from '@/lib/firebase/admin';

/**
 * Maximum file size: 5MB
 * Requirement: 13.5
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

/**
 * Allowed image MIME types
 * Requirement: 13.5
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

/**
 * Validates an image file before upload.
 * This is a client-side utility function, not a Server Action.
 * 
 * Requirements: 13.5
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: JPEG, PNG, WebP`,
    };
  }

  return { valid: true };
}

/**
 * Uploads a product image to Firebase Storage.
 * 
 * Storage path: /products/{shopId}/{productId}/image_{index}.{ext}
 * 
 * Requirements: 13.1, 13.2
 * 
 * @param shopId - The shop ID (for organizing storage)
 * @param productId - The product ID
 * @param imageData - Base64 encoded image data
 * @param imageIndex - Index of the image (0-4)
 * @param mimeType - MIME type of the image
 * @returns Public URL of the uploaded image
 */
export async function uploadProductImage(
  shopId: string,
  productId: string,
  imageData: string, // Base64 encoded
  imageIndex: number,
  mimeType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  'use server';
  
  try {
    console.log(`[uploadProductImage] Starting upload for shop: ${shopId}, product: ${productId}, index: ${imageIndex}`);
    
    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      console.error(`[uploadProductImage] Invalid MIME type: ${mimeType}`);
      return {
        success: false,
        error: 'Invalid file type',
      };
    }

    // Get file extension from MIME type
    const ext = mimeType.split('/')[1];
    
    // Construct storage path
    const filePath = `products/${shopId}/${productId}/image_${imageIndex}.${ext}`;
    console.log(`[uploadProductImage] Storage path: ${filePath}`);
    
    // Get bucket
    const bucket = adminStorage.bucket();
    console.log(`[uploadProductImage] Using bucket: ${bucket.name}`);
    
    // Convert base64 to buffer
    const buffer = Buffer.from(imageData, 'base64');
    console.log(`[uploadProductImage] Buffer size: ${buffer.length} bytes`);
    
    // Check file size
    if (buffer.length > MAX_FILE_SIZE) {
      console.error(`[uploadProductImage] File too large: ${buffer.length} bytes`);
      return {
        success: false,
        error: 'File size exceeds 5MB limit',
      };
    }
    
    // Upload file
    const file = bucket.file(filePath);
    await file.save(buffer, {
      metadata: {
        contentType: mimeType,
      },
      public: true, // Make file publicly accessible
    });
    
    console.log(`[uploadProductImage] File uploaded successfully`);
    
    // Make the file publicly accessible
    await file.makePublic();
    console.log(`[uploadProductImage] File made public`);
    
    // Get correct public URL for Firebase Storage
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`;
    console.log(`[uploadProductImage] Public URL: ${publicUrl}`);
    
    return {
      success: true,
      url: publicUrl,
    };
  } catch (error) {
    console.error('[uploadProductImage] Error uploading product image:', error);
    return {
      success: false,
      error: `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Deletes all images for a product from Firebase Storage.
 * 
 * Requirements: 13.4
 * 
 * @param shopId - The shop ID
 * @param productId - The product ID
 */
export async function deleteProductImages(
  shopId: string,
  productId: string
): Promise<void> {
  'use server';
  
  try {
    const bucket = adminStorage.bucket();
    const prefix = `products/${shopId}/${productId}/`;
    
    // List all files with this prefix
    const [files] = await bucket.getFiles({ prefix });
    
    // Delete all files
    await Promise.all(files.map((file) => file.delete()));
    
    console.log(`Deleted ${files.length} images for product ${productId}`);
  } catch (error) {
    console.error('Error deleting product images:', error);
    // Don't throw error - log and continue
    // This is a cleanup operation and shouldn't block product deletion
  }
}

/**
 * Deletes a single product image from Firebase Storage.
 * 
 * @param imageUrl - The public URL of the image to delete
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  'use server';
  
  try {
    const bucket = adminStorage.bucket();
    
    // Extract file path from URL
    // URL format: https://storage.googleapis.com/{bucket}/{path}
    const urlParts = imageUrl.split(`${bucket.name}/`);
    if (urlParts.length < 2) {
      console.error('Invalid image URL format:', imageUrl);
      return;
    }
    
    const filePath = urlParts[1];
    const file = bucket.file(filePath);
    
    await file.delete();
    
    console.log(`Deleted image: ${filePath}`);
  } catch (error) {
    console.error('Error deleting product image:', error);
    // Don't throw error - log and continue
  }
}

/**
 * Gets the download URL for an image.
 * This is used when the image is not public.
 * 
 * @param filePath - The storage path of the file
 * @returns Signed URL valid for 1 hour
 */
export async function getImageDownloadUrl(filePath: string): Promise<string | null> {
  'use server';
  
  try {
    const bucket = adminStorage.bucket();
    const file = bucket.file(filePath);
    
    // Generate signed URL valid for 1 hour
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });
    
    return url;
  } catch (error) {
    console.error('Error getting download URL:', error);
    return null;
  }
}
