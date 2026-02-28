/**
 * Shop Settings Page - Edit shop information
 * Allows merchants to update shop name, contact info, etc.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getShopDetails } from '@/app/actions/shop';
import { adminDb } from '@/lib/firebase/admin';
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
    city: 'Harar' as 'Harar' | 'Dire_Dawa',
    contactPhone: '',
    description: '',
  });

  // Mock telegramId for testing
  const telegramId = '111222333';

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
          contactPhone: result.data.contactPhone,
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
      // Validate input
      if (!formData.name || formData.name.trim().length === 0) {
        setError('Shop name is required');
        setSaving(false);
        return;
      }

      if (formData.name.length > 100) {
        setError('Shop name is too long (max 100 characters)');
        setSaving(false);
        return;
      }

      if (!formData.contactPhone || formData.contactPhone.trim().length === 0) {
        setError('Contact phone is required');
        setSaving(false);
        return;
      }

      // Validate phone number format
      const phoneRegex = /^(\+251|0)?[79]\d{8}$/;
      if (!phoneRegex.test(formData.contactPhone.replace(/\s/g, ''))) {
        setError('Invalid phone format. Use Ethiopian format: +251XXXXXXXXX or 09XXXXXXXX');
        setSaving(false);
        return;
      }

      if (!shop) {
        setError('Shop not found');
        setSaving(false);
        return;
      }

      // Update shop in Firestore (using client-side for now, should be Server Action in production)
      // Note: In production, create an updateShop Server Action
      const response = await fetch('/api/shops/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId,
          shopId: shop.id,
          updates: {
            name: formData.name.trim(),
            city: formData.city,
            contactPhone: formData.contactPhone.trim(),
            description: formData.description.trim(),
            updatedAt: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update shop');
      }

      setSuccess(true);
      
      // Reload shop details
      setTimeout(() => {
        loadShopDetails();
        setSuccess(false);
      }, 2000);

    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update shop. Please try again.');
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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/merchant">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
            <Store className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shop Settings</h1>
            <p className="text-gray-600">Update your shop information</p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle>Shop Information</CardTitle>
          <CardDescription>
            Keep your shop details up to date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Alert */}
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Shop updated successfully!
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Shop Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
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
                className="text-base"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Shop Description</Label>
              <textarea
                id="description"
                placeholder="Describe your shop and what you sell..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={saving}
                className="w-full min-h-[100px] px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={500}
              />
              <p className="text-sm text-gray-500">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* City Selection */}
            <div className="space-y-3">
              <Label>
                Shop Location <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.city}
                onValueChange={(value) =>
                  setFormData({ ...formData, city: value as 'Harar' | 'Dire_Dawa' })
                }
                disabled={saving}
              >
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="Harar" id="harar" />
                  <Label htmlFor="harar" className="flex-1 cursor-pointer">
                    <div className="font-medium">Harar</div>
                    <div className="text-sm text-gray-500">
                      Serve customers in Harar and Harar Campus
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="Dire_Dawa" id="dire-dawa" />
                  <Label htmlFor="dire-dawa" className="flex-1 cursor-pointer">
                    <div className="font-medium">Dire Dawa</div>
                    <div className="text-sm text-gray-500">
                      Serve customers in Dire Dawa and DDU
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
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
                className="text-base"
              />
            </div>

            {/* Shop ID (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="shopId">Shop ID</Label>
              <Input
                id="shopId"
                type="text"
                value={shop?.id || ''}
                disabled
                className="text-base bg-gray-50"
              />
              <p className="text-sm text-gray-500">
                Your unique shop identifier (cannot be changed)
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/merchant')}
                disabled={saving}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
  );
}
