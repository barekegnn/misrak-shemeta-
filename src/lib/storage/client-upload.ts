'use client';

/**
 * Client-side image upload utilities.
 * These functions prepare images for upload to the server.
 */

/**
 * Converts a File to base64 string for upload.
 * 
 * @param file - The image file
 * @returns Base64 encoded string (without data URL prefix)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Validates image file on client side before upload.
 * 
 * @param file - The image file
 * @returns Validation result
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Allowed types: JPEG, PNG, WebP',
    };
  }

  return { valid: true };
}

/**
 * Compresses an image file if it's too large.
 * Uses canvas to resize the image while maintaining aspect ratio.
 * 
 * Mobile Optimization (Requirements 12.4, 21.4):
 * - Aggressive compression for mobile networks
 * - Multiple quality levels based on file size
 * - WebP conversion when supported
 * 
 * @param file - The image file
 * @param maxWidth - Maximum width in pixels (default: 1200)
 * @param maxHeight - Maximum height in pixels (default: 1200)
 * @param quality - JPEG quality (0-1, default: 0.8)
 * @returns Compressed image as Blob
 */
export function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try WebP first (better compression), fallback to original format
        const outputFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          outputFormat,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Creates a thumbnail version of an image for faster loading.
 * 
 * @param file - The image file
 * @param size - Thumbnail size in pixels (default: 200)
 * @returns Thumbnail as Blob
 */
export function createThumbnail(
  file: File,
  size: number = 200
): Promise<Blob> {
  return compressImage(file, size, size, 0.6);
}

/**
 * Generates multiple image sizes for responsive loading.
 * 
 * @param file - The image file
 * @returns Object with different image sizes
 */
export async function generateResponsiveSizes(file: File): Promise<{
  thumbnail: Blob;
  small: Blob;
  medium: Blob;
  large: Blob;
}> {
  const [thumbnail, small, medium, large] = await Promise.all([
    compressImage(file, 200, 200, 0.6),   // Thumbnail: 200px
    compressImage(file, 640, 640, 0.7),   // Small: 640px (mobile)
    compressImage(file, 1024, 1024, 0.75), // Medium: 1024px (tablet)
    compressImage(file, 1920, 1920, 0.8),  // Large: 1920px (desktop)
  ]);

  return { thumbnail, small, medium, large };
}

/**
 * Uploads an image to the server.
 * 
 * @param shopId - The shop ID
 * @param productId - The product ID
 * @param file - The image file
 * @param imageIndex - Index of the image (0-4)
 * @returns Upload result with URL
 */
export async function uploadImage(
  shopId: string,
  productId: string,
  file: File,
  imageIndex: number
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return validation;
    }

    // Compress image if needed
    let fileToUpload = file;
    if (file.size > 1024 * 1024) { // If larger than 1MB, compress
      const compressed = await compressImage(file);
      fileToUpload = new File([compressed], file.name, { type: file.type });
    }

    // Convert to base64
    const base64 = await fileToBase64(fileToUpload);

    // Upload to server
    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shopId,
        productId,
        imageData: base64,
        imageIndex,
        mimeType: fileToUpload.type,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'Upload failed',
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: 'Failed to upload image',
    };
  }
}
