'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { getProductsByShop, deleteProduct } from '@/app/actions/products';
import { useTelegramAuth } from './TelegramAuthProvider';
import { ProductForm } from './ProductForm';
import { useI18n } from '@/i18n/provider';

interface ProductListManagerProps {
  shopId: string;
}

export function ProductListManager({ shopId }: ProductListManagerProps) {
  const { telegramUser } = useTelegramAuth();
  const { t } = useI18n();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    if (!telegramUser) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getProductsByShop(telegramUser.id.toString());
      
      if (result.success && result.data) {
        setProducts(result.data);
      } else {
        setError(result.error || t('errors.generic'));
      }
    } catch (err) {
      setError(t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!telegramUser) return;
    
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setDeletingProductId(productId);

    try {
      const result = await deleteProduct(telegramUser.id.toString(), productId);
      
      if (result.success) {
        // Remove from local state
        setProducts(products.filter((p) => p.id !== productId));
      } else {
        alert(result.error || 'Failed to delete product');
      }
    } catch (err) {
      alert('Failed to delete product');
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleFormSuccess = (product: Product) => {
    if (editingProduct) {
      // Update existing product in list
      setProducts(products.map((p) => (p.id === product.id ? product : p)));
    } else {
      // Add new product to list
      setProducts([product, ...products]);
    }
    
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-lg">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
        {error}
      </div>
    );
  }

  // Show form if creating or editing
  if (showForm) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {editingProduct ? 'Edit Product' : 'Create New Product'}
          </h2>
        </div>
        
        <ProductForm
          shopId={shopId}
          product={editingProduct || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Products</h2>
          <p className="text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
        </div>
        
        <button
          onClick={handleCreateProduct}
          className="touch-target rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Add Product
        </button>
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium">No products yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by creating your first product
          </p>
          <button
            onClick={handleCreateProduct}
            className="mt-6 touch-target rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
          >
            Create Product
          </button>
        </div>
      )}

      {/* Product Grid */}
      {products.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-lg border border-border bg-card"
            >
              {/* Product Image */}
              <div className="aspect-square relative">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                {product.stock === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="rounded-full bg-destructive px-3 py-1 text-sm font-medium text-destructive-foreground">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold">{product.price} ETB</p>
                    <p className="text-xs text-muted-foreground">
                      Stock: {product.stock}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs">
                    {product.category}
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="flex-1 touch-target rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    {t('actions.edit')}
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    disabled={deletingProductId === product.id}
                    className="flex-1 touch-target rounded-md border border-destructive px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    {deletingProductId === product.id
                      ? t('common.loading')
                      : t('actions.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
