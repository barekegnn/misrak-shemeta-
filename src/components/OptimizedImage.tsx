'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * OptimizedImage Component
 * 
 * Wrapper around Next.js Image component with mobile optimization.
 * 
 * Requirements:
 * - 12.4: Optimize image loading for mobile network conditions
 * - 21.4: Optimize image loading for mobile network conditions using lazy loading and responsive images
 */

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes,
  quality = 75, // Lower quality for mobile optimization
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Default responsive sizes for mobile-first
  const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <svg
          className="h-12 w-12 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
      
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={defaultSizes}
          quality={quality}
          className={`object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={defaultSizes}
          quality={quality}
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
        />
      )}
    </div>
  );
}

/**
 * ProductImage Component
 * 
 * Specialized image component for product images with aspect ratio preservation.
 */
interface ProductImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}

export function ProductImage({
  src,
  alt,
  priority = false,
  className = '',
}: ProductImageProps) {
  return (
    <div className={`relative aspect-square overflow-hidden ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
        quality={75}
      />
    </div>
  );
}

/**
 * ThumbnailImage Component
 * 
 * Small thumbnail images with aggressive optimization.
 */
interface ThumbnailImageProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export function ThumbnailImage({
  src,
  alt,
  size = 80,
  className = '',
}: ThumbnailImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      quality={60} // Lower quality for thumbnails
      sizes={`${size}px`}
      className={className}
    />
  );
}
