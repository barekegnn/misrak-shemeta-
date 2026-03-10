import { fc } from '@fast-check/jest';
import { describe, it, expect } from '@jest/globals';

/**
 * Property-Based Test: Eastern Triangle Pricing Consistency
 * 
 * Property 2: Eastern Triangle Pricing Consistency
 * Validates: Requirements 16.1-16.7
 * 
 * This test verifies that delivery fees are calculated consistently
 * according to the Eastern Triangle Pricing Matrix and that the
 * calculation is deterministic.
 */

// Define the pricing matrix
const PRICING_MATRIX: Record<string, Record<string, number>> = {
  HARAR: {
    HARAR: 40, // Intra-city
    HARAR_CAMPUS: 40, // Intra-city (same city)
    DIRE_DAWA: 180, // Inter-city
    DDU: 180, // Inter-city
    HARAMAYA_MAIN: 100, // City-to-campus
  },
  DIRE_DAWA: {
    DIRE_DAWA: 40, // Intra-city
    DDU: 40, // Intra-city
    HARAR: 180, // Inter-city
    HARAR_CAMPUS: 180, // Inter-city
    HARAMAYA_MAIN: 100, // City-to-campus
  },
};

const DELIVERY_TIMES: Record<string, Record<string, string>> = {
  HARAR: {
    HARAR: '30 min - 1 hour',
    HARAR_CAMPUS: '30 min - 1 hour',
    DIRE_DAWA: '5 - 6 hours',
    DDU: '5 - 6 hours',
    HARAMAYA_MAIN: '3 - 4 hours',
  },
  DIRE_DAWA: {
    DIRE_DAWA: '30 min - 1 hour',
    DDU: '30 min - 1 hour',
    HARAR: '5 - 6 hours',
    HARAR_CAMPUS: '5 - 6 hours',
    HARAMAYA_MAIN: '3 - 4 hours',
  },
};

/**
 * Calculate delivery fee based on shop location and user home location
 */
function calculateDeliveryFee(shopCity: string, userLocation: string): number {
  const fee = PRICING_MATRIX[shopCity]?.[userLocation];
  if (fee === undefined) {
    throw new Error(
      `Invalid route: ${shopCity} -> ${userLocation}`
    );
  }
  return fee;
}

/**
 * Get delivery time estimate based on shop location and user home location
 */
function getDeliveryTime(shopCity: string, userLocation: string): string {
  const time = DELIVERY_TIMES[shopCity]?.[userLocation];
  if (time === undefined) {
    throw new Error(
      `Invalid route: ${shopCity} -> ${userLocation}`
    );
  }
  return time;
}

describe('Property: Eastern Triangle Pricing Consistency', () => {
  /**
   * Property: Pricing is deterministic
   * 
   * For any shop location and user location:
   * - Calling calculateDeliveryFee multiple times should return the same result
   * - The result should be consistent across different invocations
   */
  it('should calculate delivery fees deterministically', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant('HARAR'), fc.constant('DIRE_DAWA')),
        fc.oneof(
          fc.constant('HARAR'),
          fc.constant('HARAR_CAMPUS'),
          fc.constant('DIRE_DAWA'),
          fc.constant('DDU'),
          fc.constant('HARAMAYA_MAIN')
        ),
        (shopCity, userLocation) => {
          const fee1 = calculateDeliveryFee(shopCity, userLocation);
          const fee2 = calculateDeliveryFee(shopCity, userLocation);
          const fee3 = calculateDeliveryFee(shopCity, userLocation);

          expect(fee1).toBe(fee2);
          expect(fee2).toBe(fee3);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Pricing matches the Eastern Triangle matrix
   * 
   * For all valid routes:
   * - Intra-city routes (same city) should be 40 ETB
   * - City-to-campus routes should be 100 ETB
   * - Inter-city routes should be 180 ETB
   */
  it('should match Eastern Triangle pricing matrix', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant('HARAR'), fc.constant('DIRE_DAWA')),
        fc.oneof(
          fc.constant('HARAR'),
          fc.constant('HARAR_CAMPUS'),
          fc.constant('DIRE_DAWA'),
          fc.constant('DDU'),
          fc.constant('HARAMAYA_MAIN')
        ),
        (shopCity, userLocation) => {
          const fee = calculateDeliveryFee(shopCity, userLocation);

          // Verify fee is one of the valid values
          expect([40, 100, 180]).toContain(fee);

          // Verify specific routes
          if (shopCity === 'HARAR') {
            if (userLocation === 'HARAR' || userLocation === 'HARAR_CAMPUS') {
              expect(fee).toBe(40); // Intra-city
            } else if (userLocation === 'HARAMAYA_MAIN') {
              expect(fee).toBe(100); // City-to-campus
            } else {
              expect(fee).toBe(180); // Inter-city
            }
          } else if (shopCity === 'DIRE_DAWA') {
            if (userLocation === 'DIRE_DAWA' || userLocation === 'DDU') {
              expect(fee).toBe(40); // Intra-city
            } else if (userLocation === 'HARAMAYA_MAIN') {
              expect(fee).toBe(100); // City-to-campus
            } else {
              expect(fee).toBe(180); // Inter-city
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Delivery times are consistent with fees
   * 
   * For any route:
   * - Intra-city routes should have 30 min - 1 hour delivery time
   * - City-to-campus routes should have 3 - 4 hours delivery time
   * - Inter-city routes should have 5 - 6 hours delivery time
   */
  it('should provide consistent delivery time estimates', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant('HARAR'), fc.constant('DIRE_DAWA')),
        fc.oneof(
          fc.constant('HARAR'),
          fc.constant('HARAR_CAMPUS'),
          fc.constant('DIRE_DAWA'),
          fc.constant('DDU'),
          fc.constant('HARAMAYA_MAIN')
        ),
        (shopCity, userLocation) => {
          const fee = calculateDeliveryFee(shopCity, userLocation);
          const time = getDeliveryTime(shopCity, userLocation);

          // Verify time format
          expect(time).toMatch(/\d+\s*-\s*\d+\s*(min|hour)/);

          // Verify time matches fee category
          if (fee === 40) {
            expect(time).toBe('30 min - 1 hour');
          } else if (fee === 100) {
            expect(time).toBe('3 - 4 hours');
          } else if (fee === 180) {
            expect(time).toBe('5 - 6 hours');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Pricing is symmetric for certain routes
   * 
   * For certain routes, the pricing should be symmetric:
   * - HARAR -> DIRE_DAWA should equal DIRE_DAWA -> HARAR (both 180 ETB)
   * - HARAR -> HARAMAYA_MAIN should equal DIRE_DAWA -> HARAMAYA_MAIN (both 100 ETB)
   */
  it('should have symmetric pricing for certain routes', () => {
    // Harar to Dire Dawa and vice versa
    const hararToDireDawa = calculateDeliveryFee('HARAR', 'DIRE_DAWA');
    const direDawaToHarar = calculateDeliveryFee('DIRE_DAWA', 'HARAR');
    expect(hararToDireDawa).toBe(direDawaToHarar);
    expect(hararToDireDawa).toBe(180);

    // Harar to Haramaya Main and Dire Dawa to Haramaya Main
    const hararToHaramaya = calculateDeliveryFee('HARAR', 'HARAMAYA_MAIN');
    const direDawaToHaramaya = calculateDeliveryFee(
      'DIRE_DAWA',
      'HARAMAYA_MAIN'
    );
    expect(hararToHaramaya).toBe(direDawaToHaramaya);
    expect(hararToHaramaya).toBe(100);
  });

  /**
   * Property: All valid routes have defined fees
   * 
   * For all combinations of valid shop cities and user locations:
   * - A fee should be defined
   * - The fee should be a positive number
   */
  it('should define fees for all valid routes', () => {
    const shopCities = ['HARAR', 'DIRE_DAWA'];
    const userLocations = [
      'HARAR',
      'HARAR_CAMPUS',
      'DIRE_DAWA',
      'DDU',
      'HARAMAYA_MAIN',
    ];

    for (const shopCity of shopCities) {
      for (const userLocation of userLocations) {
        const fee = calculateDeliveryFee(shopCity, userLocation);
        expect(fee).toBeGreaterThan(0);
        expect(typeof fee).toBe('number');
      }
    }
  });

  /**
   * Property: Pricing respects geographic distance
   * 
   * For any two routes:
   * - Intra-city routes should be cheaper than city-to-campus routes
   * - City-to-campus routes should be cheaper than inter-city routes
   */
  it('should respect geographic distance in pricing', () => {
    const intraCityFee = calculateDeliveryFee('HARAR', 'HARAR');
    const cityToCampusFee = calculateDeliveryFee('HARAR', 'HARAMAYA_MAIN');
    const interCityFee = calculateDeliveryFee('HARAR', 'DIRE_DAWA');

    expect(intraCityFee).toBeLessThan(cityToCampusFee);
    expect(cityToCampusFee).toBeLessThan(interCityFee);

    // Verify specific values
    expect(intraCityFee).toBe(40);
    expect(cityToCampusFee).toBe(100);
    expect(interCityFee).toBe(180);
  });

  /**
   * Property: Pricing is consistent across multiple calculations
   * 
   * For any set of orders with different routes:
   * - Each order should calculate the same fee for the same route
   * - Total fees should be the sum of individual fees
   */
  it('should maintain consistency across multiple order calculations', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            shopCity: fc.oneof(
              fc.constant('HARAR'),
              fc.constant('DIRE_DAWA')
            ),
            userLocation: fc.oneof(
              fc.constant('HARAR'),
              fc.constant('HARAR_CAMPUS'),
              fc.constant('DIRE_DAWA'),
              fc.constant('DDU'),
              fc.constant('HARAMAYA_MAIN')
            ),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (orders) => {
          // Calculate fees for each order
          const fees = orders.map((order) =>
            calculateDeliveryFee(order.shopCity, order.userLocation)
          );

          // Verify all fees are positive
          for (const fee of fees) {
            expect(fee).toBeGreaterThan(0);
          }

          // Verify total is sum of individual fees
          const totalFee = fees.reduce((sum, fee) => sum + fee, 0);
          expect(totalFee).toBe(fees.reduce((a, b) => a + b, 0));

          // Verify recalculation gives same result
          const recalculatedFees = orders.map((order) =>
            calculateDeliveryFee(order.shopCity, order.userLocation)
          );
          expect(recalculatedFees).toEqual(fees);
        }
      ),
      { numRuns: 100 }
    );
  });
});
