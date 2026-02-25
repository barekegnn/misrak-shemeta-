/**
 * Eastern Triangle Pricing Engine
 * 
 * This module implements the delivery fee calculation logic for the Misrak Shemeta marketplace.
 * It calculates fees based on the geographic triangle formed by Harar, Dire Dawa, and Haramaya.
 * 
 * CRITICAL: This is core business logic. All fees and routes are based on real Eastern Ethiopian geography.
 * 
 * Geographic Context:
 * - Harar: Historic walled city in eastern Ethiopia
 * - Dire Dawa: Major city and commercial hub
 * - Haramaya Main Campus: University campus between Harar and Dire Dawa
 * - Harar Campus: University campus in Harar city
 * - DDU (Dire Dawa University): University in Dire Dawa city
 * 
 * Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7
 */

import { City, Campus, DeliveryRoute } from '@/types';

/**
 * Route matrix defining delivery fees and estimated times for all valid routes.
 * 
 * Fee Structure:
 * - Intra-city (40 ETB): Deliveries within the same city
 *   - Harar → Harar Campus
 *   - Dire Dawa → DDU
 * 
 * - City-to-campus (100 ETB): Deliveries from cities to Haramaya Main Campus
 *   - Harar → Haramaya Main
 *   - Dire Dawa → Haramaya Main
 * 
 * - Inter-city (180 ETB): Deliveries between different cities
 *   - Harar → DDU (Harar to Dire Dawa)
 *   - Dire Dawa → Harar Campus (Dire Dawa to Harar)
 */
const ROUTE_MATRIX: Record<City, Record<Campus, DeliveryRoute>> = {
  'Harar': {
    'Harar_Campus': {
      fee: 40,
      estimatedTime: '30 minutes - 1 hour',
    },
    'Haramaya_Main': {
      fee: 100,
      estimatedTime: '3-4 hours',
    },
    'DDU': {
      fee: 180,
      estimatedTime: '5-6 hours',
    },
  },
  'Dire Dawa': {
    'DDU': {
      fee: 40,
      estimatedTime: '30 minutes - 1 hour',
    },
    'Haramaya_Main': {
      fee: 100,
      estimatedTime: '3-4 hours',
    },
    'Harar_Campus': {
      fee: 180,
      estimatedTime: '5-6 hours',
    },
  },
};

/**
 * Calculates the delivery fee and estimated time for a given route.
 * 
 * This is a pure function that implements the Eastern Triangle Pricing logic.
 * It is deterministic: same inputs always produce the same output.
 * 
 * @param shopCity - The city where the shop is located (Harar or Dire_Dawa)
 * @param userLocation - The campus/location where the user wants delivery
 * @returns DeliveryRoute object containing fee (in ETB) and estimated delivery time
 * @throws Error if the route is invalid (should never happen with proper type checking)
 * 
 * @example
 * // Intra-city delivery
 * calculateDeliveryFee('Harar', 'Harar_Campus')
 * // Returns: { fee: 40, estimatedTime: '30 minutes - 1 hour' }
 * 
 * @example
 * // City-to-campus delivery
 * calculateDeliveryFee('Harar', 'Haramaya_Main')
 * // Returns: { fee: 100, estimatedTime: '3-4 hours' }
 * 
 * @example
 * // Inter-city delivery
 * calculateDeliveryFee('Harar', 'DDU')
 * // Returns: { fee: 180, estimatedTime: '5-6 hours' }
 */
export function calculateDeliveryFee(
  shopCity: City,
  userLocation: Campus
): DeliveryRoute {
  // Validate inputs
  if (!shopCity || !userLocation) {
    throw new Error('Shop city and user location are required');
  }

  // Look up route in matrix
  const cityRoutes = ROUTE_MATRIX[shopCity];
  if (!cityRoutes) {
    throw new Error(`Invalid shop city: ${shopCity}`);
  }

  const route = cityRoutes[userLocation];
  if (!route) {
    throw new Error(`Invalid route: ${shopCity} to ${userLocation}`);
  }

  return route;
}

/**
 * Checks if a delivery route is valid (exists in the route matrix).
 * 
 * @param shopCity - The city where the shop is located
 * @param userLocation - The campus/location where the user wants delivery
 * @returns true if the route is valid, false otherwise
 */
export function isValidRoute(shopCity: City, userLocation: Campus): boolean {
  try {
    calculateDeliveryFee(shopCity, userLocation);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets all valid delivery locations for a given shop city.
 * 
 * @param shopCity - The city where the shop is located
 * @returns Array of campus locations that can receive deliveries from this shop
 */
export function getDeliverableLocations(shopCity: City): Campus[] {
  const cityRoutes = ROUTE_MATRIX[shopCity];
  if (!cityRoutes) {
    return [];
  }
  return Object.keys(cityRoutes) as Campus[];
}

/**
 * Calculates the total delivery fee for multiple items from different shops.
 * 
 * Note: In the current implementation, each shop's delivery fee is calculated separately.
 * This function helps with cart-level calculations where items may come from multiple shops.
 * 
 * @param items - Array of items with their shop cities
 * @param userLocation - The user's delivery location
 * @returns Total delivery fee in ETB
 */
export function calculateTotalDeliveryFee(
  items: Array<{ shopCity: City }>,
  userLocation: Campus
): number {
  // Get unique shop cities
  const uniqueShopCities = Array.from(new Set(items.map(item => item.shopCity)));
  
  // Calculate fee for each unique shop
  const totalFee = uniqueShopCities.reduce((sum, shopCity) => {
    const route = calculateDeliveryFee(shopCity, userLocation);
    return sum + route.fee;
  }, 0);

  return totalFee;
}

/**
 * Gets a human-readable description of the delivery route.
 * 
 * @param shopCity - The city where the shop is located
 * @param userLocation - The campus/location where the user wants delivery
 * @returns Formatted string describing the route
 */
export function getRouteDescription(shopCity: City, userLocation: Campus): string {
  const route = calculateDeliveryFee(shopCity, userLocation);
  
  // Format location names for display
  const shopName = shopCity === 'Harar' ? 'Harar' : 'Dire Dawa';
  const locationName = userLocation === 'Haramaya_Main' 
    ? 'Haramaya Main Campus'
    : userLocation === 'Harar_Campus'
    ? 'Harar Campus'
    : 'Dire Dawa University';

  return `${shopName} → ${locationName}: ${route.fee} ETB (${route.estimatedTime})`;
}

/**
 * Categorizes a route by type (intra-city, city-to-campus, or inter-city).
 * 
 * @param shopCity - The city where the shop is located
 * @param userLocation - The campus/location where the user wants delivery
 * @returns Route category
 */
export function getRouteCategory(
  shopCity: City,
  userLocation: Campus
): 'intra-city' | 'city-to-campus' | 'inter-city' {
  const route = calculateDeliveryFee(shopCity, userLocation);
  
  if (route.fee === 40) {
    return 'intra-city';
  } else if (route.fee === 100) {
    return 'city-to-campus';
  } else if (route.fee === 180) {
    return 'inter-city';
  }
  
  throw new Error('Unknown route category');
}
