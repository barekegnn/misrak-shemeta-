/**
 * Product Creation Form - Premium SaaS Implementation
 * Requirements: 4.1, 4.2, 4.3, 13.1, 13.2, 13.3, 13.5
 * 
 * CRITICAL: Requirement 4.1 states "at least one image" is REQUIRED
 * This is a production SaaS system - every detail matters
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createProduct } from '@/app/actions/products';
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
} from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  images: File[];
}

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: [],
  });

  // Mock telegramId for testing
  const telegramId = '888888888';

  // Requirement 13.5: Validate file types (JPEG, PNG, WebP) and size (max 5MB)
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

  // Requirement 13.3: Support 1-5 images per product
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Check total images (existing + new)
    const totalImages = formData.images.length + files.length;
    if (totalImages > 5) {
      setError(`Maximum 5 images allowed. You're trying to add ${files.length} images but already have ${formData.images.length}.`);
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
      // Create preview URLs
      const newPreviews = await Promise.all(
        files.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      setImagePreviews([...imagePreviews, ...newPreviews]);
      setFormData({
        ...formData,
        images: [...formData.images, ...files],
      });
    } catch (err) {
      console.error('Error processing images:', err);
      setError('Failed to process images. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setFormData({ ...formData, images: newImages });
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Requirement 4.1: Validate required fields
      if (!formData.name.trim()) {
        setError('Product name is required');
        setLoading(false);
        return;
      }

      if (!formData.description.trim()) {
        setError('Product description is required');
        setLoading(false);
        return;
      }

      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        setError('Please enter a valid price greater than 0');
        setLoading(false);
        return;
      }

      if (!formData.category.trim()) {
        setError('Product category is required');
        setLoading(false);
        return;
      }

      const stock = parseInt(formData.stock);
      if (isNaN(stock) || stock < 0) {
        setError('Please enter a valid stock quantity (0 or more)');
        setLoading(false);
        return;
      }

      // Requirement 4.1: "at least one image" is REQUIRED for UI
      if (formData.images.length === 0) {
        setError('At least one product image is required');
        setLoading(false);
        return;
      }

      // Get shop details first
      const { getShopDetails } = await import('@/app/actions/shop');
      const shopResult = await getShopDetails(telegramId);
      
      if (!shopResult.success || !shopResult.data) {
        setError('Failed to get shop details. Please make sure you have registered a shop.');
        return;
      }

      const shopId = shopResult.data.id;

      // Upload images first, then create product with image URLs
      const imageUrls: string[] = [];
      
      for (let i = 0; i < formData.images.length; i++) {
        const imageFile = formData.images[i];
        
        // Convert File to base64 for upload
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data:image/...;base64, prefix
          };
          reader.readAsDataURL(imageFile);
        });

        // Generate a temporary product ID for image upload
        const tempProductId = `temp_${Date.now()}_${i}`;

        // Upload image
        const { uploadProductImage } = await import('@/app/actions/products');
        const uploadResult = await uploadProductImage(
          telegramId,
          shopId,
          tempProductId,
          base64,
          i,
          imageFile.type
        );

        if (!uploadResult.success || !uploadResult.data) {
          console.error('Failed to upload image:', uploadResult.error);
          setError(`Failed to upload image ${i + 1}: ${uploadResult.error || 'Unknown error'}`);
          return;
        } else {
          imageUrls.push(uploadResult.data);
        }
      }

      // Now create product with the uploaded image URLs
      const result = await createProduct(telegramId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price,
        category: formData.category.trim(),
        stock,
        images: imageUrls, // Include uploaded images
      });

      if (!result.success || !result.data) {
        setError(result.error || 'Failed to create product');
        return;
      }

      // Success! Redirect to products list
      router.push('/merchant/products');

    } catch (err) {
      console.error('Error creating product:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Create a new product listing for your shop</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="text-sm sm:text-base">{error}</AlertDescription>
            </Alert>
          )}

          {/* Product Images - REQUIRED (Requirement 4.1, 13.3) */}
          <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <ImageIcon className="w-5 h-5" />
                Product Images
                <span className="text-red-500 text-sm">*</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Upload 1-5 high-quality images. First image will be the main product photo.
                <br />
                <span className="text-xs text-gray-500">
                  Supported: JPEG, PNG, WebP • Max 5MB per image
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
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
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white p-1.5 sm:p-1 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity min-w-[32px] min-h-[32px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                        disabled={loading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            )}

              {/* Upload Button */}
              {formData.images.length < 5 && (
                <div>
                  <input
                    type="file"
                    id="images"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={loading || uploadingImages}
                  />
                  <label htmlFor="images">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors active:bg-primary/10">
                      {uploadingImages ? (
                        <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 animate-spin text-primary" />
                      ) : (
                        <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-400" />
                      )}
                      <p className="text-sm sm:text-base font-medium text-gray-700 mb-1">
                        {uploadingImages ? 'Processing images...' : 'Tap to upload images'}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {formData.images.length === 0
                          ? 'Upload 1-5 images (at least 1 required)'
                          : `${formData.images.length}/5 images uploaded`}
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {formData.images.length === 5 && (
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
              <CardDescription className="text-sm">
                Provide detailed information about your product
              </CardDescription>
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
                  placeholder="e.g., Wireless Headphones"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
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
                  placeholder="Describe your product in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full min-h-[120px] px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500">{formData.description.length}/1000 characters</p>
              </div>

              {/* Price and Stock Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Price */}
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
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      disabled={loading}
                      className="text-base pl-14 min-h-[44px]"
                    />
                  </div>
                </div>

                {/* Stock */}
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-sm sm:text-base">
                    Stock Quantity <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    disabled={loading}
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
                  placeholder="e.g., Electronics, Books, Clothing"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  disabled={loading}
                  className="text-base min-h-[44px]"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500">
                  Choose a category that best describes your product
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/merchant/products')}
              disabled={loading}
              className="w-full sm:flex-1 min-h-[44px]"
              size="lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || uploadingImages || formData.images.length === 0}
              className="w-full sm:flex-1 min-h-[44px]"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Product...
                </>
              ) : (
                <>
                  <Package className="w-5 h-5 mr-2" />
                  Create Product
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
