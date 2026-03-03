/**
 * Product Edit Form - Premium SaaS Implementation
 * Requirements: 4.4, 4.5, 13.1, 13.2, 13.3, 13.4, 13.5
 * 
 * Allows shop owners to update existing products with full image management
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProductById } from '@/app/actions/catalog';
import { updateProduct } from '@/app/actions/products';
import type { Product } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Package,
  Save,
} from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  existingImages: string[];
  newImages: File[];
}

export default function EditProduct({ params }: { params: Promise<{ productId: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [productId, setProductId] = useState<string>('');

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    existingImages: [],
    newImages: [],
  });

  // Mock telegramId for testing
  const telegramId = '111222333';

  useEffect(() => {
    params.then(({ productId }) => {
      setProductId(productId);
      loadProduct(productId);
    });
  }, [params]);

  const loadProduct = async (id: string) => {
    try {
      setLoading(true);
      const result = await getProductById(id);

      if (!result.success || !result.data) {
        setError('Product not found');
        return;
      }

      const prod = result.data;
      setProduct(prod);
      setFormData({
        name: prod.name,
        description: prod.description,
        price: prod.price.toString(),
        category: prod.category,
        stock: prod.stock.toString(),
        existingImages: prod.images || [],
        newImages: [],
      });
    } catch (err) {
      console.error('Error loading product:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  // Requirement 13.5: Validate file types and size
  const validateImage = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return 'Invalid file type. Only JPEG, PNG, and WebP are allowed.';
    }

    if (file.size > maxSize) {
      return `File too large. Maximum size is 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`;
    }

    return null;
  };

  // Requirement 13.3: Support 1-5 images total
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    const totalImages = formData.existingImages.length + formData.newImages.length + files.length;
    if (totalImages > 5) {
      setError(`Maximum 5 images allowed. You currently have ${formData.existingImages.length + formData.newImages.length} images.`);
      return;
    }

    // Validate each file
    for (const file of files) {
      const validationError = validateImage(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError('');
    setUploadingImages(true);

    try {
      const newPreviews = await Promise.all(
        files.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      setNewImagePreviews([...newImagePreviews, ...newPreviews]);
      setFormData({
        ...formData,
        newImages: [...formData.newImages, ...files],
      });
    } catch (err) {
      console.error('Error processing images:', err);
      setError('Failed to process images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeExistingImage = (index: number) => {
    const newExistingImages = formData.existingImages.filter((_, i) => i !== index);
    setFormData({ ...formData, existingImages: newExistingImages });
  };

  const removeNewImage = (index: number) => {
    const newImages = formData.newImages.filter((_, i) => i !== index);
    const newPreviews = newImagePreviews.filter((_, i) => i !== index);
    
    setFormData({ ...formData, newImages });
    setNewImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setError('Product name is required');
        setSaving(false);
        return;
      }

      if (!formData.description.trim()) {
        setError('Product description is required');
        setSaving(false);
        return;
      }

      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        setError('Please enter a valid price greater than 0');
        setSaving(false);
        return;
      }

      if (!formData.category.trim()) {
        setError('Product category is required');
        setSaving(false);
        return;
      }

      const stock = parseInt(formData.stock);
      if (isNaN(stock) || stock < 0) {
        setError('Please enter a valid stock quantity (0 or more)');
        setSaving(false);
        return;
      }

      // Requirement 4.1: At least one image required
      const totalImages = formData.existingImages.length + formData.newImages.length;
      if (totalImages === 0) {
        setError('At least one product image is required');
        setSaving(false);
        return;
      }

      // Upload new images if any
      const newImageUrls: string[] = [];
      if (formData.newImages.length > 0 && product) {
        for (let i = 0; i < formData.newImages.length; i++) {
          const imageFile = formData.newImages[i];
          
          // Convert File to base64 for upload
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result as string;
              resolve(result.split(',')[1]); // Remove data:image/...;base64, prefix
            };
            reader.readAsDataURL(imageFile);
          });

          // Upload via Server Action
          const { uploadProductImage } = await import('@/app/actions/products');
          const uploadResult = await uploadProductImage(
            telegramId,
            product.shopId,
            productId,
            base64,
            formData.existingImages.length + i, // Continue numbering from existing images
            imageFile.type
          );

          if (!uploadResult.success || !uploadResult.data) {
            console.error('Failed to upload image:', uploadResult.error);
            // Use placeholder if upload fails
            newImageUrls.push(`https://via.placeholder.com/400x400?text=${encodeURIComponent(formData.name)}`);
          } else {
            newImageUrls.push(uploadResult.data);
          }
        }
      }

      // Combine existing and new image URLs
      const allImages = [...formData.existingImages, ...newImageUrls];

      // Update product via Server Action
      const result = await updateProduct(telegramId, productId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price,
        category: formData.category.trim(),
        stock,
        images: allImages,
      });

      if (!result.success) {
        setError(result.error || 'Failed to update product');
        return;
      }

      setSuccess(true);
      
      // Reload product data
      setTimeout(() => {
        loadProduct(productId);
        setSuccess(false);
      }, 2000);

    } catch (err) {
      console.error('Error updating product:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-900 mb-2">Product Not Found</h2>
              <p className="text-red-700 mb-4">
                The product you're looking for doesn't exist or you don't have permission to edit it.
              </p>
              <Link href="/merchant/products">
                <Button>Back to Products</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalImages = formData.existingImages.length + formData.newImages.length;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link href="/merchant/products">
            <Button variant="ghost" size="sm" className="mb-4 min-h-[44px]">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Products
            </Button>
          </Link>
          <div className="flex items-start gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex-shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Update product information and images</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success Alert */}
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-sm sm:text-base text-green-800">
                Product updated successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="text-sm sm:text-base">{error}</AlertDescription>
            </Alert>
          )}

          {/* Product Images */}
          <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <ImageIcon className="w-5 h-5" />
                Product Images
                <span className="text-red-500 text-sm">*</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Manage product images (1-5 total). First image will be the main product photo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Existing Images */}
              {formData.existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Images</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    {formData.existingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {index === 0 && (
                          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-primary text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                            Main
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white p-1.5 sm:p-1 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity min-w-[32px] min-h-[32px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                          disabled={saving}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

              {/* New Images */}
              {newImagePreviews.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">New Images (not saved yet)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    {newImagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-green-300">
                          <img
                            src={preview}
                            alt={`New ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-green-500 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                          New
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white p-1.5 sm:p-1 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity min-w-[32px] min-h-[32px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                          disabled={saving}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

              {/* Upload Button */}
              {totalImages < 5 && (
                <div>
                  <input
                    type="file"
                    id="images"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={saving || uploadingImages}
                  />
                  <label htmlFor="images">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors active:bg-primary/10">
                      {uploadingImages ? (
                        <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 animate-spin text-primary" />
                      ) : (
                        <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-400" />
                      )}
                      <p className="text-sm sm:text-base font-medium text-gray-700 mb-1">
                        {uploadingImages ? 'Processing images...' : 'Tap to add more images'}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {totalImages}/5 images • {5 - totalImages} remaining
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {totalImages === 5 && (
                <Alert className="bg-blue-50 border-blue-200">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <AlertDescription className="text-sm sm:text-base text-blue-800">
                    Maximum images reached (5/5). Remove an image to add a different one.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Product Information</CardTitle>
              <CardDescription className="text-sm">Update product details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm sm:text-base">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={saving}
                  className="text-base min-h-[44px]"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500">{formData.name.length}/200 characters</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm sm:text-base">
                  Description <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  disabled={saving}
                  className="w-full min-h-[120px] px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500">{formData.description.length}/1000 characters</p>
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm sm:text-base">
                    Price (ETB) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      ETB
                    </span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      disabled={saving}
                      className="text-base pl-14 min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-sm sm:text-base">
                    Stock Quantity <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    disabled={saving}
                    className="text-base min-h-[44px]"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm sm:text-base">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="category"
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  disabled={saving}
                  className="text-base min-h-[44px]"
                  maxLength={50}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/merchant/products')}
              disabled={saving}
              className="w-full sm:flex-1 min-h-[44px]"
              size="lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || uploadingImages || totalImages === 0}
              className="w-full sm:flex-1 min-h-[44px]"
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
