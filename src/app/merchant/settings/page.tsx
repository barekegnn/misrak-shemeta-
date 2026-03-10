/**
 * Shop Settings Page - Edit shop information
 * Allows merchants to update shop name, contact info, etc.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getShopDetails, updateShop } from '@/app/actions/shop';
import type { Shop } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Store, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ShopSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    city: 'HARAR' as 'HARAR' | 'DIRE_DAWA',
    specificLocation: '',
    landmark: '',
    contactPhone: '',
    description: '',
  });

  // Mock telegramId for testing
  const telegramId = '888888888';

  useEffect(() => {
    loadShopDetails();
  }, []);

  const loadShopDetails = async () => {
    try {
      setLoading(true);
      const result = await getShopDetails(telegramId);

      if (result.success && result.data) {
        setShop(result.data);
        setFormData({
          name: result.data.name,
          city: result.data.city,
          specificLocation: result.data.specificLocation || '',
          landmark: result.data.landmark || '',
          contactPhone: result.data.contactPhone || '',
          description: result.data.description || '',
        });
      } else {
        setError('Failed to load shop details');
      }
    } catch (err) {
      console.error('Error loading shop:', err);
      setError('An error occurred while loading shop details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      // Use the updateShop Server Action
      const result = await updateShop(telegramId, {
        name: formData.name.trim(),
        city: formData.city,
        specificLocation: formData.specificLocation.trim(),
        landmark: formData.landmark.trim() || undefined,
        contactPhone: formData.contactPhone.trim(),
        description: formData.description.trim(),
      });

      if (!result.success) {
        // Handle specific errors
        switch (result.error) {
          case 'SHOP_NAME_REQUIRED':
            setError('Shop name is required');
            break;
          case 'SHOP_NAME_TOO_LONG':
            setError('Shop name is too long (max 100 characters)');
            break;
          case 'INVALID_CITY':
            setError('Please select a valid city');
            break;
          case 'SPECIFIC_LOCATION_REQUIRED':
            setError('Specific address is required');
            break;
          case 'SPECIFIC_LOCATION_TOO_LONG':
            setError('Address is too long (max 200 characters)');
            break;
          case 'CONTACT_PHONE_REQUIRED':
            setError('Contact phone is required');
            break;
          case 'INVALID_PHONE_FORMAT':
            setError('Invalid phone format. Use Ethiopian format: +251XXXXXXXXX or 09XXXXXXXX');
            break;
          case 'LANDMARK_TOO_LONG':
            setError('Landmark is too long (max 100 characters)');
            break;
          case 'DESCRIPTION_TOO_LONG':
            setError('Description is too long (max 500 characters)');
            break;
          case 'SHOP_NOT_FOUND':
            setError('Shop not found');
            break;
          case 'UNAUTHORIZED':
            setError('You are not authorized to update this shop');
            break;
          default:
            setError('Failed to update shop. Please try again.');
        }
        return;
      }

      setSuccess(true);
      
      // Update local shop state with the returned data
      if (result.data) {
        setShop(result.data);
        setFormData({
          name: result.data.name,
          city: result.data.city,
          specificLocation: result.data.specificLocation || '',
          landmark: result.data.landmark || '',
          contactPhone: result.data.contactPhone || '',
          description: result.data.description || '',
        });
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err) {
      console.error('Update error:', err);
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

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link href="/merchant">
            <Button variant="ghost" size="sm" className="mb-4 min-h-[44px]">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-start gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex-shrink-0">
              <Store className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop Settings</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Update your shop information</p>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Shop Information</CardTitle>
            <CardDescription className="text-sm">
              Keep your shop details up to date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Success Alert */}
              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-sm sm:text-base text-green-800">
                    Shop updated successfully!
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

              {/* Shop Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm sm:text-base">
                  Shop Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Harar Tech Hub"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  maxLength={100}
                  disabled={saving}
                  className="text-base min-h-[44px]"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm sm:text-base">Shop Description</Label>
                <textarea
                  id="description"
                  placeholder="Describe your shop and what you sell..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  disabled={saving}
                  className="w-full min-h-[100px] px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                  maxLength={500}
                />
                <p className="text-xs sm:text-sm text-gray-500">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* City Selection */}
              <div className="space-y-3">
                <Label className="text-sm sm:text-base">
                  Shop Location <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.city}
                  onValueChange={(value) =>
                    setFormData({ ...formData, city: value as 'HARAR' | 'DIRE_DAWA' })
                  }
                  disabled={saving}
                >
                  <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 cursor-pointer active:bg-gray-100">
                    <RadioGroupItem value="HARAR" id="harar" className="min-w-[20px] min-h-[20px]" />
                    <Label htmlFor="harar" className="flex-1 cursor-pointer">
                      <div className="font-medium text-sm sm:text-base">Harar</div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Serve customers in Harar and Harar Campus
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-gray-50 cursor-pointer active:bg-gray-100">
                    <RadioGroupItem value="DIRE_DAWA" id="dire-dawa" className="min-w-[20px] min-h-[20px]" />
                    <Label htmlFor="dire-dawa" className="flex-1 cursor-pointer">
                      <div className="font-medium text-sm sm:text-base">Dire Dawa</div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Serve customers in Dire Dawa and DDU
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Specific Location */}
              <div className="space-y-2">
                <Label htmlFor="specificLocation" className="text-sm sm:text-base">
                  Specific Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="specificLocation"
                  type="text"
                  placeholder="e.g., Near Ras Hotel, Main Street"
                  value={formData.specificLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, specificLocation: e.target.value })
                  }
                  required
                  maxLength={200}
                  disabled={saving}
                  className="text-base min-h-[44px]"
                />
                <p className="text-xs sm:text-sm text-gray-500">
                  {formData.specificLocation.length}/200 characters
                </p>
              </div>

              {/* Landmark */}
              <div className="space-y-2">
                <Label htmlFor="landmark" className="text-sm sm:text-base">
                  Landmark (Optional)
                </Label>
                <Input
                  id="landmark"
                  type="text"
                  placeholder="e.g., Next to Commercial Bank"
                  value={formData.landmark}
                  onChange={(e) =>
                    setFormData({ ...formData, landmark: e.target.value })
                  }
                  maxLength={100}
                  disabled={saving}
                  className="text-base min-h-[44px]"
                />
                <p className="text-xs sm:text-sm text-gray-500">
                  Help customers find your shop more easily
                </p>
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm sm:text-base">
                  Contact Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+251912345678 or 0912345678"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPhone: e.target.value })
                  }
                  required
                  disabled={saving}
                  className="text-base min-h-[44px]"
                />
              </div>

              {/* Shop ID (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="shopId" className="text-sm sm:text-base">Shop ID</Label>
                <Input
                  id="shopId"
                  type="text"
                  value={shop?.id || ''}
                  disabled
                  className="text-base bg-gray-50 min-h-[44px]"
                />
                <p className="text-xs sm:text-sm text-gray-500">
                  Your unique shop identifier (cannot be changed)
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/merchant')}
                  disabled={saving}
                  className="w-full sm:flex-1 min-h-[44px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:flex-1 min-h-[44px]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
