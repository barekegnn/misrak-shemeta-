'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { getCart } from '@/app/actions/cart';

interface CartContextType {
  cartCount: number;
  refreshCartCount: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useTelegramAuth();
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCartCount = useCallback(async () => {
    if (!user) {
      setCartCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const cartResult = await getCart(user.telegramId);
      
      if (cartResult.success && cartResult.data) {
        // Calculate total number of items (sum of all quantities)
        const totalItems = cartResult.data.enrichedItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setCartCount(totalItems);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error('[CartContext] Error refreshing cart count:', error);
      setCartCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load cart count when user changes
  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount, isLoading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
