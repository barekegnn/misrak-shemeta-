/**
 * Product Management Page for Merchants
 * 
 * Mobile-first responsive design with proper spacing and typography.
 * 
 * Requirements: 1.5, 4.4, 4.5, 34, 35
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProductsByShop, deleteProduct } from '@/app/actions/products';
import type { Product } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  AlertCircle,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ProductManagement() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // Mock telegramId for testing
  const telegramId = '888888888';

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    // Filter products based on search query
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredProducts(
        products.filter(
          (product) =>
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await getProductsByShop(telegramId);

      if (result.success && result.data) {
        setProducts(result.data);
        setFilteredProducts(result.data);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError('An error occurred while loading products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true);
      const result = await deleteProduct(telegramId, productToDelete.id);

      if (result.success) {
        // Remove from local state
        setProducts(products.filter((p) => p.id !== productToDelete.id));
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      } else {
        setError('Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('An error occurred while deleting the product');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage your product listings ({products.length} total)
            </p>
          </div>
          <Link href="/merchant/products/new">
            <Button size="lg" className="w-full sm:w-auto min-h-[44px]">
              <Plus className="w-5 h-5 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-sm sm:text-base">{error}</AlertDescription>
          </Alert>
        )}

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search products by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-base py-3 min-h-[44px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="py-12 sm:py-16">
              <div className="text-center text-gray-500">
                <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                {searchQuery ? (
                  <>
                    <p className="text-base sm:text-lg font-medium">No products found</p>
                    <p className="text-sm mt-1">
                      Try adjusting your search query
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-base sm:text-lg font-medium">No products yet</p>
                    <p className="text-sm mt-1 mb-4">
                      Start by adding your first product
                    </p>
                    <Link href="/merchant/products/new">
                      <Button className="min-h-[44px]">
                        <Plus className="w-5 h-5 mr-2" />
                        Add Your First Product
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 relative">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300" />
                    </div>
                  )}
                  {/* Stock Badge */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        product.stock > 10
                          ? 'bg-green-100 text-green-800'
                          : product.stock > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.stock} in stock
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl sm:text-2xl font-bold text-primary">
                      {product.price.toFixed(2)} ETB
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link href={`/merchant/products/${product.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full min-h-[44px]" size="sm">
                        <Edit className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(product)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 min-w-[44px] min-h-[44px]"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="max-w-md mx-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg sm:text-xl">Delete Product?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm sm:text-base">
                Are you sure you want to delete "{productToDelete?.name}"? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel disabled={deleting} className="w-full sm:w-auto min-h-[44px]">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto min-h-[44px]"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
