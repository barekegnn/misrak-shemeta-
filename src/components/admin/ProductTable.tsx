/**
 * Product Table Component
 * 
 * Interactive table for displaying and moderating products with search,
 * filter, and removal capabilities.
 * 
 * Requirements: 30.1
 */

'use client';

import { useState, useTransition } from 'react';
import { Product, ProductFilters } from '@/types';
import { getProductList, removeProduct } from '@/app/actions/admin/products';
import { Search, Filter, Trash2, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { InputDialog } from './InputDialog';

interface ProductTableProps {
  initialProducts: (Product & { shopName?: string; shopCity?: string })[];
  initialTotal: number;
  initialPage: number;
  pageSize: number;
  adminTelegramId: string;
}

export function ProductTable({
  initialProducts,
  initialTotal,
  initialPage,
  pageSize,
  adminTelegramId,
}: ProductTableProps) {
  const [products, setProducts] = useState(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [isPending, startTransition] = useTransition();
  
  const [searchName, setSearchName] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price-asc' | 'price-desc'>('date');
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  
  const [removeDialog, setRemoveDialog] = useState<{ isOpen: boolean; productId: string; productName: string }>({ 
    isOpen: false, productId: '', productName: '' 
  });
  
  const applyFilters = () => {
    startTransition(async () => {
      const filters: ProductFilters = {};
      if (searchName) filters.productName = searchName;
      if (filterLocation) filters.shopCity = filterLocation as any;
      if (minPrice) filters.minPrice = parseFloat(minPrice);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
      
      const result = await getProductList(adminTelegramId, filters, 1, pageSize);
      if (result.success && result.data) {
        let sorted = result.data.products;
        if (sortBy === 'price-asc') sorted = [...sorted].sort((a, b) => a.price - b.price);
        if (sortBy === 'price-desc') sorted = [...sorted].sort((a, b) => b.price - a.price);
        setProducts(sorted);
        setTotal(result.data.total);
        setPage(1);
      }
    });
  };
  
  const clearFilters = () => {
    setSearchName('');
    setFilterLocation('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('date');
    startTransition(async () => {
      const result = await getProductList(adminTelegramId, undefined, 1, pageSize);
      if (result.success && result.data) {
        setProducts(result.data.products);
        setTotal(result.data.total);
        setPage(1);
      }
    });
  };
  
  const goToPage = (newPage: number) => {
    startTransition(async () => {
      const filters: ProductFilters = {};
      if (searchName) filters.productName = searchName;
      if (filterLocation) filters.shopCity = filterLocation as any;
      if (minPrice) filters.minPrice = parseFloat(minPrice);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
      
      const result = await getProductList(adminTelegramId, filters, newPage, pageSize);
      if (result.success && result.data) {
        setProducts(result.data.products);
        setPage(newPage);
      }
    });
  };
  
  const handleRemove = async (reason: string) => {
    const productId = removeDialog.productId;
    setActionLoading(productId);
    setActionError(null);
    setActionSuccess(null);
    
    const result = await removeProduct(adminTelegramId, productId, reason);
    
    if (result.success) {
      setActionSuccess('Product removed successfully');
      const listResult = await getProductList(adminTelegramId, undefined, page, pageSize);
      if (listResult.success && listResult.data) {
        setProducts(listResult.data.products);
        setTotal(listResult.data.total);
      }
    } else {
      setActionError(result.error || 'Failed to remove product');
    }
    
    setActionLoading(null);
    setTimeout(() => { setActionSuccess(null); setActionError(null); }, 3000);
  };
  
  const totalPages = Math.ceil(total / pageSize);
  
  return (
    <div className="space-y-4">
      <InputDialog
        isOpen={removeDialog.isOpen}
        onClose={() => setRemoveDialog({ isOpen: false, productId: '', productName: '' })}
        onSubmit={handleRemove}
        title="Remove Product"
        message={`Are you sure you want to remove "${removeDialog.productName}"? This action cannot be undone.`}
        placeholder="Enter removal reason..."
        inputType="textarea"
        submitText="Remove Product"
      />
      
      {actionSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          {actionSuccess}
        </div>
      )}
      
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {actionError}
        </div>
      )}
      
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Product</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Product name"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Locations</option>
              <option value="Harar">Harar</option>
              <option value="Dire Dawa">Dire Dawa</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="10000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Date (Newest)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="price-asc">Price (Low to High)</option>
            </select>
          </div>
          
          <div className="flex items-end gap-2">
            <button
              onClick={applyFilters}
              disabled={isPending}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Apply
            </button>
            <button
              onClick={clearFilters}
              disabled={isPending}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No products found</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.images && product.images.length > 0 ? (
                        <div className="h-12 w-12 relative rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="max-w-xs truncate">{product.name || 'Unnamed Product'}</div>
                      {product.category && (
                        <div className="text-xs text-gray-500 mt-1">{product.category}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.shopName ? (
                        <div>
                          <div className="font-medium">{product.shopName}</div>
                          {product.shopCity && (
                            <div className="text-xs text-gray-500">{product.shopCity}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.price.toLocaleString()} ETB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stock > 10 ? 'bg-green-100 text-green-800' :
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.createdAt ? (
                        product.createdAt instanceof Date 
                          ? product.createdAt.toISOString().split('T')[0]
                          : new Date(product.createdAt).toISOString().split('T')[0]
                      ) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setRemoveDialog({ isOpen: true, productId: product.id, productName: product.name })}
                        disabled={actionLoading === product.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Remove Product"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} products
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1 || isPending}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages || isPending}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
