'use client';

import { ReactNode, useEffect } from 'react';
import { useViewportCSSVariables } from '@/lib/telegram/viewport';

/**
 * ViewportAdapter Component
 * 
 * Adapts the layout to Telegram viewport dimensions by setting CSS custom properties.
 * 
 * Requirement 21.3: Adapt layout to Telegram viewport dimensions
 */
export function ViewportAdapter({ children }: { children: ReactNode }) {
  // Set CSS custom properties for viewport dimensions
  useViewportCSSVariables();

  useEffect(() => {
    // Prevent pull-to-refresh on mobile
    document.body.style.overscrollBehavior = 'none';

    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (event: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });

    return () => {
      document.removeEventListener('touchend', preventDoubleTapZoom);
    };
  }, []);

  return <>{children}</>;
}
