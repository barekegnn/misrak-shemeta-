'use client';

import { useState, useEffect } from 'react';
import { Product, CartItem } from '@/types';
import { getCart, updateCartItem, removeFromCart, calculateCartTotal } from '@/app/actions/cart';
import { useTelegramAuth } from './TelegramAuthProvider';
import { useI18n } from '@/i18n/provider';
import Image from 'next/image';

interface CartViewProps {
  onCheckout?: () => void;
}

interface EnrichedCartItem extends CartItem {
  product: Product;
}

export function CartView({ onCheckout }: CartViewProps) {
  const { user } = useTelegramAuth();
  const { t } = useI18n();
  
  const [cartItems, setCartItems] = useState<EnrichedCartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCart();
  }, [user]);

  const loadCart = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const [cartResult, totalResult] = await Promise.all([
        getCart(user.telegramId),
        calculateCartTotal(user.telegramId),
      ]);

      if (cartResult.success && cartResult.data) {
        setCartItems(cartResult.data.enrichedItems);
      } else {
        setError(cartResult.error || t('errors.generic'));
      }

      if (totalResult.success && totalResult.data !== undefined) {
        setTotal(totalResult.data);
      }
    } catch (err) {
      setError(t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (!user || newQuantity <= 0) return;

    setUpdatingItems(prev => new Set(prev).add(productId));

    try {
      const result = await updateCartItem(user.telegramId, productId, newQuantity);

      if (result.success) {
        // Reload cart to get updated totals
        await loadCart();
      } else {
        setError(result.error || t('errors.generic'));
      }
    } catch (err) {
      setError(t('errors.generic'));
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!user) return;

    setUpdatingItems(prev => new Set(prev).add(productId));

    try {
      const result = await removeFromCart(user.telegramId, productId);

      if (result.success) {
        // Reload cart
        await loadCart();
      } else {
        setError(result.error || t('errors.generic'));
      }
    } catch (err) {
      setError(t('errors.generic'));
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  if (isLoading) {
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
        <p className="text-destructive">{error}</p>
        <button
          onClick={loadCart}
          className="mt-4 touch-target rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t('common.tryAgain')}
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
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
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium">{t('orders.cart.empty')}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('orders.cart.emptyDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cart Items */}
      <div className="space-y-4">
        {cartItems.map((item) => (
          <CartItemCard
            key={item.productId}
            item={item}
            isUpdating={updatingItems.has(item.productId)}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveItem}
          />
        ))}
      </div>

      {/* Cart Summary */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold">{t('orders.cart.summary')}</h3>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('orders.cart.subtotal')}</span>
            <span className="font-medium">{total.toFixed(2)} ETB</span>
          </div>
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('orders.cart.deliveryFee')}</span>
            <span>{t('orders.cart.calculatedAtCheckout')}</span>
          </div>
          
          <div className="border-t pt-2">
            <div className="flex justify-between">
              <span className="font-semibold">{t('orders.cart.total')}</span>
              <span className="text-lg font-bold">{total.toFixed(2)} ETB</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('orders.cart.excludingDelivery')}
            </p>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={onCheckout}
          className="mt-6 w-full touch-target rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          disabled={cartItems.length === 0}
        >
          {t('orders.cart.proceedToCheckout')}
        </button>
      </div>
    </div>
  );
}

interface CartItemCardProps {
  item: EnrichedCartItem;
  isUpdating: boolean;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

function CartItemCard({ item, isUpdating, onUpdateQuantity, onRemove }: CartItemCardProps) {
  const { t } = useI18n();
  const { product, quantity } = item;

  const itemTotal = product.price * quantity;
  const isOutOfStock = product.stock === 0;
  const exceedsStock = quantity > product.stock;

  return (
    <div className={`rounded-lg border bg-card p-4 ${isUpdating ? 'opacity-50' : ''}`}>
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg
                className="h-8 w-8 text-muted-foreground"
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
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{product.name}</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            {product.price.toFixed(2)} ETB
          </p>

          {/* Stock Warning */}
          {isOutOfStock && (
            <p className="mt-1 text-sm text-destructive font-medium">
              {t('products.outOfStock')}
            </p>
          )}
          {exceedsStock && !isOutOfStock && (
            <p className="mt-1 text-sm text-destructive">
              {t('products.onlyInStock', { count: product.stock })}
            </p>
          )}

          {/* Quantity Controls */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                disabled={isUpdating || quantity <= 1}
                className="touch-target flex h-8 w-8 items-center justify-center rounded-md border bg-background hover:bg-accent disabled:opacity-50"
                aria-label={t('common.decrease')}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <span className="w-8 text-center font-medium">{quantity}</span>
              
              <button
                onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                disabled={isUpdating || quantity >= product.stock}
                className="touch-target flex h-8 w-8 items-center justify-center rounded-md border bg-background hover:bg-accent disabled:opacity-50"
                aria-label={t('common.increase')}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onRemove(product.id)}
              disabled={isUpdating}
              className="touch-target ml-auto text-sm text-destructive hover:text-destructive/80 disabled:opacity-50"
            >
              {t('common.remove')}
            </button>
          </div>
        </div>

        {/* Item Total */}
        <div className="flex-shrink-0 text-right">
          <p className="font-semibold">{itemTotal.toFixed(2)} ETB</p>
        </div>
      </div>
    </div>
  );
}
