'use client';

import { useState, useEffect } from 'react';
import { Product, City, Location } from '@/types';
import { getProductById } from '@/app/actions/catalog';
import { useTelegramAuth } from './TelegramAuthProvider';
import { useI18n } from '@/i18n/provider';

interface ProductDetailViewProps {
  productId: string;
  onAddToCart?: (productId: string, quantity: number) => void;
  onClose?: () => void;
}

export function ProductDetailView({
  productId,
  onAddToCart,
  onClose,
}: ProductDetailViewProps) {
  const { user } = useTelegramAuth();
  const { t } = useI18n();
  
  const [product, setProduct] = useState<(Product & { shopName: string; shopCity: City }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (product && user) {
      calculateDeliveryFee(product.shopCity, user.homeLocation);
    }
  }, [product, user]);

  const loadProduct = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getProductById(productId);

      if (result.success && result.data) {
        setProduct(result.data);
      } else {
        setError(result.error || t('errors.product.notFound'));
      }
    } catch (err) {
      setError(t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDeliveryFee = (shopCity: City, userLocation: Location) => {
    // Eastern Triangle Pricing Matrix
    // Intra-city: 40 ETB
    // City-to-campus: 100 ETB (midpoint of 80-120)
    // Inter-city: 180 ETB

    if (shopCity === 'Harar') {
      if (userLocation === 'Harar_Campus') {
        setDeliveryFee(40);
        setEstimatedTime('30-45 minutes');
      } else if (userLocation === 'Haramaya_Main') {
        setDeliveryFee(100);
        setEstimatedTime('1-1.5 hours');
      } else if (userLocation === 'DDU') {
        setDeliveryFee(180);
        setEstimatedTime('3-4 hours');
      }
    } else if (shopCity === 'Dire Dawa') {
      if (userLocation === 'DDU') {
        setDeliveryFee(40);
        setEstimatedTime('30-45 minutes');
      } else if (userLocation === 'Haramaya_Main') {
        setDeliveryFee(100);
        setEstimatedTime('1-1.5 hours');
      } else if (userLocation === 'Harar_Campus') {
        setDeliveryFee(180);
        setEstimatedTime('3-4 hours');
      }
    }
  };

  const handleAddToCart = () => {
    if (product && quantity > 0 && quantity <= product.stock) {
      onAddToCart?.(product.id, quantity);
    }
  };

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <svg
            className="mx-auto h-16 w-16 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-destructive">{error}</p>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 touch-target rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t('actions.back')}
            </button>
          )}
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const totalPrice = product.price * quantity + (deliveryFee || 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {onClose && (
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex items-center gap-3 p-4">
            <button
              onClick={onClose}
              className="touch-target rounded-lg p-2 hover:bg-muted"
              aria-label="Go back"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-lg font-semibold line-clamp-1">{product.name}</h1>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl p-4 sm:p-6">
        {/* Image Carousel */}
        <div className="mb-6">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={product.images[selectedImageIndex]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="rounded-full bg-destructive px-4 py-2 text-lg font-medium text-destructive-foreground">
                  {t('products.outOfStock')}
                </span>
              </div>
            )}
          </div>

          {/* Image Thumbnails */}
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                    selectedImageIndex === index
                      ? 'border-primary'
                      : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="h-16 w-16 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title and Price */}
          <div>
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                {product.price.toFixed(2)} ETB
              </span>
              <span className="text-sm text-muted-foreground">
                {t('products.stock')}: {product.stock}
              </span>
            </div>
          </div>

          {/* Shop Info */}
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 text-sm">
              <svg
                className="h-5 w-5 text-muted-foreground"
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
              <div>
                <p className="font-medium">{product.shopName}</p>
                <p className="text-muted-foreground">
                  {product.shopCity === 'Harar'
                    ? t('common.locations.harar')
                    : t('common.locations.direDawa')}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          {deliveryFee !== null && estimatedTime && (
            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="mb-2 font-semibold">{t('products.deliveryFee')}</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Fee:</span>{' '}
                  <span className="font-medium">{deliveryFee} ETB</span>
                </p>
                <p>
                  <span className="text-muted-foreground">{t('products.estimatedTime')}:</span>{' '}
                  <span className="font-medium">{estimatedTime}</span>
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="mb-2 font-semibold">Description</h3>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {product.description}
            </p>
          </div>

          {/* Category */}
          <div>
            <span className="inline-block rounded-full bg-muted px-3 py-1 text-sm">
              {product.category}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1 || isOutOfStock}
                className="touch-target flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted disabled:opacity-50"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </button>
              
              <span className="w-12 text-center font-medium">{quantity}</span>
              
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock || isOutOfStock}
                className="touch-target flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted disabled:opacity-50"
              >
                <svg
                  className="h-5 w-5"
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
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 touch-target rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isOutOfStock ? (
                t('products.outOfStock')
              ) : (
                <span>
                  {t('products.addToCart')} • {totalPrice.toFixed(2)} ETB
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
