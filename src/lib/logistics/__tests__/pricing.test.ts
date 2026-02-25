/**
 * Tests for Eastern Triangle Pricing Engine
 * 
 * These tests verify the correctness of the delivery fee calculation logic.
 * They ensure that all routes return the correct fees and estimated times
 * as specified in Requirements 16.1-16.7.
 */

import {
  calculateDeliveryFee,
  isValidRoute,
  getDeliverableLocations,
  calculateTotalDeliveryFee,
  getRouteDescription,
  getRouteCategory,
} from '../pricing';
import { City, Campus } from '@/types';

describe('Eastern Triangle Pricing Engine', () => {
  describe('calculateDeliveryFee', () => {
    // Requirement 16.1: Harar → Harar_Campus = 40 ETB
    it('should calculate 40 ETB for Harar to Harar Campus (intra-city)', () => {
      const result = calculateDeliveryFee('Harar', 'Harar_Campus');
      expect(result.fee).toBe(40);
      expect(result.estimatedTime).toBe('30 minutes - 1 hour');
    });

    // Requirement 16.2: Dire_Dawa → DDU = 40 ETB
    it('should calculate 40 ETB for Dire Dawa to DDU (intra-city)', () => {
      const result = calculateDeliveryFee('Dire Dawa', 'DDU');
      expect(result.fee).toBe(40);
      expect(result.estimatedTime).toBe('30 minutes - 1 hour');
    });

    // Requirement 16.3: Harar → Haramaya_Main = 100 ETB (midpoint of 80-120)
    it('should calculate 100 ETB for Harar to Haramaya Main (city-to-campus)', () => {
      const result = calculateDeliveryFee('Harar', 'Haramaya_Main');
      expect(result.fee).toBe(100);
      expect(result.estimatedTime).toBe('3-4 hours');
    });

    // Requirement 16.4: Dire_Dawa → Haramaya_Main = 100 ETB (midpoint of 80-120)
    it('should calculate 100 ETB for Dire Dawa to Haramaya Main (city-to-campus)', () => {
      const result = calculateDeliveryFee('Dire Dawa', 'Haramaya_Main');
      expect(result.fee).toBe(100);
      expect(result.estimatedTime).toBe('3-4 hours');
    });

    // Requirement 16.5: Harar → DDU = 180 ETB
    it('should calculate 180 ETB for Harar to DDU (inter-city)', () => {
      const result = calculateDeliveryFee('Harar', 'DDU');
      expect(result.fee).toBe(180);
      expect(result.estimatedTime).toBe('5-6 hours');
    });

    // Requirement 16.6: Dire_Dawa → Harar_Campus = 180 ETB
    it('should calculate 180 ETB for Dire Dawa to Harar Campus (inter-city)', () => {
      const result = calculateDeliveryFee('Dire Dawa', 'Harar_Campus');
      expect(result.fee).toBe(180);
      expect(result.estimatedTime).toBe('5-6 hours');
    });

    // Requirement 16.7: Estimated delivery times
    it('should provide correct estimated times for all route types', () => {
      const intraCityRoute = calculateDeliveryFee('Harar', 'Harar_Campus');
      expect(intraCityRoute.estimatedTime).toBe('30 minutes - 1 hour');

      const cityToCampusRoute = calculateDeliveryFee('Harar', 'Haramaya_Main');
      expect(cityToCampusRoute.estimatedTime).toBe('3-4 hours');

      const interCityRoute = calculateDeliveryFee('Harar', 'DDU');
      expect(interCityRoute.estimatedTime).toBe('5-6 hours');
    });

    it('should throw error for invalid shop city', () => {
      expect(() => {
        calculateDeliveryFee('InvalidCity' as City, 'Harar_Campus');
      }).toThrow('Invalid shop city');
    });

    it('should throw error for missing parameters', () => {
      expect(() => {
        calculateDeliveryFee('' as City, 'Harar_Campus');
      }).toThrow('Shop city and user location are required');
    });
  });

  describe('isValidRoute', () => {
    it('should return true for valid routes', () => {
      expect(isValidRoute('Harar', 'Harar_Campus')).toBe(true);
      expect(isValidRoute('Dire Dawa', 'DDU')).toBe(true);
      expect(isValidRoute('Harar', 'Haramaya_Main')).toBe(true);
    });

    it('should return false for invalid routes', () => {
      expect(isValidRoute('InvalidCity' as City, 'Harar_Campus')).toBe(false);
    });
  });

  describe('getDeliverableLocations', () => {
    it('should return all deliverable locations for Harar', () => {
      const locations = getDeliverableLocations('Harar');
      expect(locations).toContain('Harar_Campus');
      expect(locations).toContain('Haramaya_Main');
      expect(locations).toContain('DDU');
      expect(locations).toHaveLength(3);
    });

    it('should return all deliverable locations for Dire Dawa', () => {
      const locations = getDeliverableLocations('Dire Dawa');
      expect(locations).toContain('DDU');
      expect(locations).toContain('Haramaya_Main');
      expect(locations).toContain('Harar_Campus');
      expect(locations).toHaveLength(3);
    });

    it('should return empty array for invalid city', () => {
      const locations = getDeliverableLocations('InvalidCity' as City);
      expect(locations).toEqual([]);
    });
  });

  describe('calculateTotalDeliveryFee', () => {
    it('should calculate total fee for items from single shop', () => {
      const items = [
        { shopCity: 'Harar' as City },
        { shopCity: 'Harar' as City },
      ];
      const total = calculateTotalDeliveryFee(items, 'Harar_Campus');
      expect(total).toBe(40); // Only one shop, so only one delivery fee
    });

    it('should calculate total fee for items from multiple shops', () => {
      const items = [
        { shopCity: 'Harar' as City },
        { shopCity: 'Dire Dawa' as City },
      ];
      const total = calculateTotalDeliveryFee(items, 'Haramaya_Main');
      expect(total).toBe(200); // 100 + 100 (both shops to Haramaya Main)
    });

    it('should handle empty items array', () => {
      const total = calculateTotalDeliveryFee([], 'Harar_Campus');
      expect(total).toBe(0);
    });
  });

  describe('getRouteDescription', () => {
    it('should return formatted route description', () => {
      const description = getRouteDescription('Harar', 'Harar_Campus');
      expect(description).toContain('Harar');
      expect(description).toContain('Harar Campus');
      expect(description).toContain('40 ETB');
      expect(description).toContain('30 minutes - 1 hour');
    });

    it('should format Haramaya Main Campus correctly', () => {
      const description = getRouteDescription('Harar', 'Haramaya_Main');
      expect(description).toContain('Haramaya Main Campus');
    });

    it('should format Dire Dawa University correctly', () => {
      const description = getRouteDescription('Dire Dawa', 'DDU');
      expect(description).toContain('Dire Dawa University');
    });
  });

  describe('getRouteCategory', () => {
    it('should categorize intra-city routes', () => {
      expect(getRouteCategory('Harar', 'Harar_Campus')).toBe('intra-city');
      expect(getRouteCategory('Dire Dawa', 'DDU')).toBe('intra-city');
    });

    it('should categorize city-to-campus routes', () => {
      expect(getRouteCategory('Harar', 'Haramaya_Main')).toBe('city-to-campus');
      expect(getRouteCategory('Dire Dawa', 'Haramaya_Main')).toBe('city-to-campus');
    });

    it('should categorize inter-city routes', () => {
      expect(getRouteCategory('Harar', 'DDU')).toBe('inter-city');
      expect(getRouteCategory('Dire Dawa', 'Harar_Campus')).toBe('inter-city');
    });
  });

  describe('Determinism (Property 2: Eastern Triangle Pricing Consistency)', () => {
    it('should return same result for same inputs (determinism)', () => {
      const result1 = calculateDeliveryFee('Harar', 'Harar_Campus');
      const result2 = calculateDeliveryFee('Harar', 'Harar_Campus');
      
      expect(result1.fee).toBe(result2.fee);
      expect(result1.estimatedTime).toBe(result2.estimatedTime);
    });

    it('should be deterministic for all routes', () => {
      const cities: City[] = ['Harar', 'Dire Dawa'];
      const campuses: Campus[] = ['Harar_Campus', 'Haramaya_Main', 'DDU'];

      cities.forEach(city => {
        campuses.forEach(campus => {
          const result1 = calculateDeliveryFee(city, campus);
          const result2 = calculateDeliveryFee(city, campus);
          
          expect(result1).toEqual(result2);
        });
      });
    });
  });
});
