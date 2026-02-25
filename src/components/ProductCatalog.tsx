'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Product, City } from '@/types';
import { getProducts, ProductFilters } from '@/app/actions/catalog';
import { ProductCard } from './ProductCard';
import { useTelegramAuth } from './TelegramAuthProvider';
import { useI18n } from '@/i18n/provider';

interface ProductCatalogProps {
  onAddToCart?: (productId: string) => void;
  onViewProduct?: (productId: string) => void;
  filters?: ProductFilters;
}

export function ProductCatalog({
  onAddToCart,
  onViewProduct,
  filters = {},
}: ProductCatalogProps) {
  const { user } = useTelegramAuth();
  const { t } = useI18n();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Lazy loading state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  
  const PRODUCTS_PER_PAGE = 12;

  // Load products
  useEffect(() => {
    loadProducts();
  }, [filters, user]);

  // Lazy loading observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, page]);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    setPage(1);

    try {
      // Include user location for deliverability filtering
      const filtersWithLocation = {
        ...filters,
        userLocation: user?.homeLocation,
      };

      const result = await getProducts(filtersWithLocation);

      if (result.success && result.data) {
        setProducts(result.data);
        setDisplayedProducts(result.data.slice(0, PRODUCTS_PER_PAGE));
        setHasMore(result.data.length > PRODUCTS_PER_PAGE);
      } else {
        setError(result.error || t('errors.generic'));
      }
    } catch (err) {
      setError(t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreProducts = useCallback(() => {
    const nextPage = page + 1;
    const startIndex = page * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    
    const newProducts = products.slice(startIndex, endIndex);
    
    if (newProducts.length > 0) {
      setDisplayedProducts((prev) => [...prev, ...newProducts]);
      setPage(nextPage);
      setHasMore(endIndex < products.length);
    } else {
      setHasMore(false);
    }
  }, [page, products]);

  if (isLoading && displayedProducts.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">
            {t('common.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-6 text-center">
        <svg
          className="mx-auto h-12 w-12 text-destructive"
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
        <button
          onClick={loadProducts}
          className="mt-4 touch-target rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (displayedProducts.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
        <svg
          className="mx-auto h-16 w-16 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium">{t('products.search.noResults')}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {displayedProducts.length} of {products.length} products
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onViewDetails={onViewProduct}
          />
        ))}
      </div>

      {/* Lazy Loading Trigger */}
      {hasMore && (
        <div
          ref={observerTarget}
          className="mt-8 flex items-center justify-center p-4"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* End of Results */}
      {!hasMore && products.length > PRODUCTS_PER_PAGE && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            You've reached the end of the results
          </p>
        </div>
      )}
    </div>
  );
}
