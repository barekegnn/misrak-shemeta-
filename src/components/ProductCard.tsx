'use client';

import { Product } from '@/types';
import { useI18n } from '@/i18n/provider';
import { useTelegramAuth } from './TelegramAuthProvider';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  shopName?: string;
  shopLocation?: string;
  onAddToCart?: (productId: string) => void;
  onViewDetails?: (productId: string) => void;
}

export function ProductCard({
  product,
  shopName,
  shopLocation,
  onAddToCart,
  onViewDetails,
}: ProductCardProps) {
  const { t } = useI18n();
  const { triggerHaptic } = useTelegramAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Trigger haptic feedback on add to cart (Requirement 21.5)
    triggerHaptic('light');
    
    onAddToCart?.(product.id);
  };

  const handleViewDetails = () => {
    onViewDetails?.(product.id);
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div
      onClick={handleViewDetails}
      className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
        
        {!imageError ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`h-full w-full object-cover transition-transform group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
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
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded-full bg-destructive px-3 py-1 text-sm font-medium text-destructive-foreground">
              {t('products.outOfStock')}
            </span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute left-2 top-2">
          <span className="rounded-full bg-background/90 px-2 py-1 text-xs font-medium backdrop-blur-sm">
            {product.category}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-semibold line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Shop Info */}
        {(shopName || shopLocation) && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span className="line-clamp-1">
              {shopName}
              {shopName && shopLocation && ' • '}
              {shopLocation}
            </span>
          </div>
        )}

        {/* Price and Stock */}
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-xl font-bold text-primary">
              {product.price.toFixed(2)} ETB
            </p>
            <p className="text-xs text-muted-foreground">
              {t('products.stock')}: {product.stock}
            </p>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="mt-4 w-full touch-target rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isOutOfStock ? t('products.outOfStock') : t('products.addToCart')}
        </button>
      </div>
    </div>
  );
}
