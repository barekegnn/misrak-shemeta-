'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { createProduct, updateProduct, ProductInput } from '@/app/actions/products';
import { useTelegramAuth } from './TelegramAuthProvider';
import { ImageUploader } from './ImageUploader';
import { useI18n } from '@/i18n/provider';

interface ProductFormProps {
  shopId: string;
  product?: Product; // If provided, form is in edit mode
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
}

export function ProductForm({ shopId, product, onSuccess, onCancel }: ProductFormProps) {
  const { telegramUser } = useTelegramAuth();
  const { t } = useI18n();
  
  // Form state
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [category, setCategory] = useState(product?.category || '');
  const [stock, setStock] = useState(product?.stock?.toString() || '0');
  const [images, setImages] = useState<string[]>(product?.images || []);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Generate temporary product ID for image uploads (for new products)
  const [tempProductId] = useState(() => `temp_${Date.now()}`);
  const productId = product?.id || tempProductId;

  const isEditMode = !!product;

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = t('errors.validation.required');
    } else if (name.length > 100) {
      errors.name = t('errors.validation.maxLength', { max: '100' });
    }

    if (!description.trim()) {
      errors.description = t('errors.validation.required');
    } else if (description.length > 1000) {
      errors.description = t('errors.validation.maxLength', { max: '1000' });
    }

    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    if (!category.trim()) {
      errors.category = t('errors.validation.required');
    }

    const stockNum = parseInt(stock);
    if (stock === '' || isNaN(stockNum) || stockNum < 0) {
      errors.stock = 'Stock cannot be negative';
    }

    if (images.length < 1) {
      errors.images = 'At least 1 image is required';
    } else if (images.length > 5) {
      errors.images = 'Maximum 5 images allowed';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!telegramUser) {
      setError('Not authenticated');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const productData: ProductInput = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category.trim(),
        images,
        stock: parseInt(stock),
      };

      let result;
      if (isEditMode) {
        result = await updateProduct(
          telegramUser.id.toString(),
          product.id,
          productData
        );
      } else {
        result = await createProduct(
          telegramUser.id.toString(),
          productData
        );
      }

      if (result.success && result.data) {
        onSuccess?.(result.data);
      } else {
        setError(result.error || t('errors.generic'));
      }
    } catch (err) {
      setError(t('errors.generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Product Name *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full rounded-md border px-3 py-2 ${
            validationErrors.name ? 'border-destructive' : 'border-border'
          } focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary`}
          placeholder="e.g., Fresh Coffee Beans from Harar"
          maxLength={100}
        />
        {validationErrors.name && (
          <p className="mt-1 text-sm text-destructive">{validationErrors.name}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {name.length}/100 characters
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={`w-full rounded-md border px-3 py-2 ${
            validationErrors.description ? 'border-destructive' : 'border-border'
          } focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary`}
          placeholder="Describe your product in detail..."
          maxLength={1000}
        />
        {validationErrors.description && (
          <p className="mt-1 text-sm text-destructive">{validationErrors.description}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {description.length}/1000 characters
        </p>
      </div>

      {/* Price and Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-2">
            Price (ETB) *
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={`w-full rounded-md border px-3 py-2 ${
              validationErrors.price ? 'border-destructive' : 'border-border'
            } focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary`}
            placeholder="0.00"
          />
          {validationErrors.price && (
            <p className="mt-1 text-sm text-destructive">{validationErrors.price}</p>
          )}
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-medium mb-2">
            Stock Quantity *
          </label>
          <input
            id="stock"
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className={`w-full rounded-md border px-3 py-2 ${
              validationErrors.stock ? 'border-destructive' : 'border-border'
            } focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary`}
            placeholder="0"
          />
          {validationErrors.stock && (
            <p className="mt-1 text-sm text-destructive">{validationErrors.stock}</p>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-2">
          Category *
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`w-full rounded-md border px-3 py-2 ${
            validationErrors.category ? 'border-destructive' : 'border-border'
          } focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary`}
        >
          <option value="">Select a category</option>
          <option value="Food & Beverages">Food & Beverages</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Books & Stationery">Books & Stationery</option>
          <option value="Home & Living">Home & Living</option>
          <option value="Health & Beauty">Health & Beauty</option>
          <option value="Sports & Outdoors">Sports & Outdoors</option>
          <option value="Other">Other</option>
        </select>
        {validationErrors.category && (
          <p className="mt-1 text-sm text-destructive">{validationErrors.category}</p>
        )}
      </div>

      {/* Images */}
      <div>
        <ImageUploader
          shopId={shopId}
          productId={productId}
          images={images}
          onImagesChange={setImages}
          maxImages={5}
        />
        {validationErrors.images && (
          <p className="mt-1 text-sm text-destructive">{validationErrors.images}</p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 touch-target rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting
            ? t('common.loading')
            : isEditMode
            ? t('actions.save')
            : 'Create Product'}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="touch-target rounded-lg border border-border px-4 py-3 font-medium hover:bg-muted disabled:opacity-50"
          >
            {t('actions.cancel')}
          </button>
        )}
      </div>
    </form>
  );
}
