/**
 * Telegram Viewport Utilities
 * 
 * Handles viewport adaptation for Telegram Mini App.
 * 
 * Requirement 21.3: Adapt layout to Telegram viewport dimensions
 */

import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { useEffect, useState } from 'react';

/**
 * Hook for accessing Telegram viewport dimensions
 */
export function useTelegramViewport() {
  const { viewportHeight, webApp } = useTelegramAuth();
  const [dimensions, setDimensions] = useState({
    height: viewportHeight,
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateDimensions = () => {
      setDimensions({
        height: viewportHeight || window.innerHeight,
        width: window.innerWidth,
      });
    };

    // Update on window resize
    window.addEventListener('resize', updateDimensions);
    
    // Initial update
    updateDimensions();

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [viewportHeight]);

  return {
    height: dimensions.height,
    width: dimensions.width,
    isMobile: dimensions.width < 768,
    isTablet: dimensions.width >= 768 && dimensions.width < 1024,
    isDesktop: dimensions.width >= 1024,
    isTelegram: !!webApp,
  };
}

/**
 * Calculate safe area for content (accounting for Telegram UI elements)
 */
export function useSafeArea() {
  const { height } = useTelegramViewport();

  // Telegram typically reserves ~50px at the top and bottom
  const TELEGRAM_HEADER_HEIGHT = 50;
  const TELEGRAM_FOOTER_HEIGHT = 50;

  return {
    top: TELEGRAM_HEADER_HEIGHT,
    bottom: TELEGRAM_FOOTER_HEIGHT,
    contentHeight: height - TELEGRAM_HEADER_HEIGHT - TELEGRAM_FOOTER_HEIGHT,
  };
}

/**
 * CSS custom properties for viewport-aware styling
 */
export function useViewportCSSVariables() {
  const { height, width } = useTelegramViewport();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Set CSS custom properties for viewport dimensions
    document.documentElement.style.setProperty('--viewport-height', `${height}px`);
    document.documentElement.style.setProperty('--viewport-width', `${width}px`);
  }, [height, width]);
}
