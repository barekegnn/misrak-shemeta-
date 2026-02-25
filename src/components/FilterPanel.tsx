'use client';

import { useState, useEffect } from 'react';
import { City } from '@/types';
import { getCategories } from '@/app/actions/catalog';
import { useI18n } from '@/i18n/provider';

export interface FilterValues {
  shopLocation: City | 'all';
  minPrice: number | undefined;
  maxPrice: number | undefined;
  category: string | undefined;
}

interface FilterPanelProps {
  onFilterChange: (filters: FilterValues) => void;
  initialFilters?: Partial<FilterValues>;
}

export function FilterPanel({ onFilterChange, initialFilters = {} }: FilterPanelProps) {
  const { t } = useI18n();
  
  const [shopLocation, setShopLocation] = useState<City | 'all'>(
    initialFilters.shopLocation || 'all'
  );
  const [minPrice, setMinPrice] = useState<string>(
    initialFilters.minPrice?.toString() || ''
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    initialFilters.maxPrice?.toString() || ''
  );
  const [category, setCategory] = useState<string>(initialFilters.category || '');
  const [categories, setCategories] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const result = await getCategories();
    if (result.success && result.data) {
      setCategories(result.data);
    }
  };

  const handleApplyFilters = () => {
    const filters: FilterValues = {
      shopLocation,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      category: category || undefined,
    };
    
    onFilterChange(filters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setShopLocation('all');
    setMinPrice('');
    setMaxPrice('');
    setCategory('');
    
    onFilterChange({
      shopLocation: 'all',
      minPrice: undefined,
      maxPrice: undefined,
      category: undefined,
    });
  };

  const hasActiveFilters =
    shopLocation !== 'all' || minPrice || maxPrice || category;

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="touch-target flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 hover:bg-muted"
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
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span className="font-medium">{t('products.filters.title')}</span>
        {hasActiveFilters && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {[shopLocation !== 'all', minPrice, maxPrice, category].filter(Boolean).length}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-background p-6 shadow-lg">
            <div className="space-y-6">
              {/* Shop Location Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t('products.filters.location')}
                </label>
                <select
                  value={shopLocation}
                  onChange={(e) => setShopLocation(e.target.value as City | 'all')}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">{t('products.filters.allLocations')}</option>
                  <option value="Harar">{t('common.locations.harar')}</option>
                  <option value="Dire Dawa">{t('common.locations.direDawa')}</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t('products.category')}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {t('products.filters.priceRange')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Price in ETB</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 touch-target rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted"
                >
                  {t('products.filters.clear')}
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 touch-target rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {t('products.filters.apply')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
