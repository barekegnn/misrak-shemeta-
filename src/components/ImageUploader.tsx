'use client';

import { useState, useRef } from 'react';
import { uploadImage } from '@/lib/storage/client-upload';
import { useI18n } from '@/i18n/provider';

interface ImageUploaderProps {
  shopId: string;
  productId: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({
  shopId,
  productId,
  images,
  onImagesChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const { t } = useI18n();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed max images
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map((file, index) => {
        const imageIndex = images.length + index;
        return uploadImage(shopId, productId, file, imageIndex);
      });

      const results = await Promise.all(uploadPromises);

      // Check for errors
      const failedUploads = results.filter((r) => !r.success);
      if (failedUploads.length > 0) {
        setError(failedUploads[0].error || 'Upload failed');
        return;
      }

      // Add successful URLs to images array
      const newUrls = results
        .filter((r) => r.success && r.url)
        .map((r) => r.url!);
      
      onImagesChange([...images, ...newUrls]);
    } catch (err) {
      setError('Failed to upload images');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Product Images ({images.length}/{maxImages})
        </label>
        {canAddMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="touch-target rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {uploading ? t('common.loading') : 'Add Images'}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {images.map((url, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={url}
              alt={`Product image ${index + 1}`}
              className="h-full w-full rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90"
              aria-label="Remove image"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}

        {/* Empty slots */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted disabled:opacity-50 flex items-center justify-center"
          >
            <div className="text-center">
              <svg
                className="mx-auto h-8 w-8 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <p className="mt-2 text-xs text-muted-foreground">Add Image</p>
            </div>
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Supported formats: JPEG, PNG, WebP. Max size: 5MB per image.
      </p>
    </div>
  );
}
