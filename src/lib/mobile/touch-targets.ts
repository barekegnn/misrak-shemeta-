/**
 * Touch Target Verification Utilities
 * 
 * Ensures all interactive elements meet the minimum touch target size.
 * 
 * Requirements:
 * - 12.2: Ensure all interactive elements have touch-friendly sizing (minimum 44x44 pixels)
 * - 21.2: Ensure all interactive elements have touch-friendly sizing (minimum 44x44 pixels)
 */

const MIN_TOUCH_TARGET_SIZE = 44; // pixels

/**
 * Verifies if an element meets the minimum touch target size
 */
export function isTouchFriendly(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return rect.width >= MIN_TOUCH_TARGET_SIZE && rect.height >= MIN_TOUCH_TARGET_SIZE;
}

/**
 * Finds all interactive elements that don't meet touch target requirements
 * (Development utility)
 */
export function findNonTouchFriendlyElements(): HTMLElement[] {
  if (typeof document === 'undefined') return [];

  const interactiveSelectors = [
    'button',
    'a',
    'input[type="button"]',
    'input[type="submit"]',
    'input[type="reset"]',
    'input[type="checkbox"]',
    'input[type="radio"]',
    '[role="button"]',
    '[onclick]',
    '[tabindex]:not([tabindex="-1"])',
  ];

  const elements = document.querySelectorAll(interactiveSelectors.join(','));
  const nonCompliant: HTMLElement[] = [];

  elements.forEach((element) => {
    if (!isTouchFriendly(element as HTMLElement)) {
      nonCompliant.push(element as HTMLElement);
    }
  });

  return nonCompliant;
}

/**
 * Logs touch target violations to console (development only)
 */
export function auditTouchTargets(): void {
  if (process.env.NODE_ENV !== 'development') return;

  const violations = findNonTouchFriendlyElements();

  if (violations.length > 0) {
    console.group('⚠️ Touch Target Violations');
    console.warn(
      `Found ${violations.length} interactive elements smaller than ${MIN_TOUCH_TARGET_SIZE}x${MIN_TOUCH_TARGET_SIZE}px:`
    );
    
    violations.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      console.log(
        `${index + 1}. ${element.tagName} (${Math.round(rect.width)}x${Math.round(rect.height)}px)`,
        element
      );
    });
    
    console.groupEnd();
  } else {
    console.log('✅ All interactive elements meet touch target requirements');
  }
}

/**
 * Highlights non-touch-friendly elements on the page (development only)
 */
export function highlightTouchTargetViolations(): void {
  if (process.env.NODE_ENV !== 'development') return;

  const violations = findNonTouchFriendlyElements();

  violations.forEach((element) => {
    element.style.outline = '2px solid red';
    element.style.outlineOffset = '2px';
    
    // Add tooltip
    const rect = element.getBoundingClientRect();
    const tooltip = document.createElement('div');
    tooltip.textContent = `${Math.round(rect.width)}x${Math.round(rect.height)}px`;
    tooltip.style.cssText = `
      position: absolute;
      top: ${rect.top - 20}px;
      left: ${rect.left}px;
      background: red;
      color: white;
      padding: 2px 6px;
      font-size: 10px;
      border-radius: 3px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(tooltip);
  });
}

/**
 * React hook for touch target auditing
 */
export function useTouchTargetAudit() {
  if (typeof window === 'undefined') return;

  if (process.env.NODE_ENV === 'development') {
    // Run audit after component mount
    setTimeout(() => {
      auditTouchTargets();
    }, 1000);
  }
}

/**
 * Touch target size constants
 */
export const TouchTargetSizes = {
  MINIMUM: 44,
  SMALL: 40,
  LARGE: 48,
  EXTRA_LARGE: 56,
} as const;

/**
 * Calculates the recommended padding to achieve minimum touch target size
 */
export function calculateTouchPadding(
  currentWidth: number,
  currentHeight: number,
  targetSize: number = MIN_TOUCH_TARGET_SIZE
): { paddingX: number; paddingY: number } {
  const paddingX = Math.max(0, (targetSize - currentWidth) / 2);
  const paddingY = Math.max(0, (targetSize - currentHeight) / 2);

  return {
    paddingX: Math.ceil(paddingX),
    paddingY: Math.ceil(paddingY),
  };
}
