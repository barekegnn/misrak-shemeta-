/**
 * Shop Registration Form
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerShop } from '@/app/actions/shop';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Store, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ShopRegistration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    city: 'Harar' as 'Harar' | 'Dire_Dawa',
    contactPhone: '',
  });

  // Mock telegramId for testing (in production, get from Telegram context)
  const telegramId = '111222333';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await registerShop(telegramId, formData);

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
          case 'CONTACT_PHONE_REQUIRED':
            setError('Contact phone is required');
            break;
          case 'INVALID_PHONE_FORMAT':
            setError('Invalid phone format. Use Ethiopian format: +251XXXXXXXXX or 09XXXXXXXX');
            break;
          case 'SHOP_ALREADY_EXISTS':
            setError('You already have a shop registered');
            break;
          default:
            setError('Failed to register shop. Please try again.');
        }
        return;
      }

      setSuccess(true);
      
      // Redirect to merchant dashboard after 2 seconds
      setTimeout(() => {
        router.push('/merchant');
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-900 mb-2">
                Shop Registered Successfully!
              </h2>
              <p className="text-green-700 mb-4">
                Your shop has been created. Redirecting to dashboard...
              </p>
              <Loader2 className="w-6 h-6 animate-spin text-green-600 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Store className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Register Your Shop
        </h1>
        <p className="text-gray-600">
          Join Misrak Shemeta marketplace and start selling to students across Eastern Ethiopia
        </p>
      </div>

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Shop Information</CardTitle>
          <CardDescription>
            Provide your shop details to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                disabled={loading}
                className="text-base"
              />
              <p className="text-sm text-gray-500">
                Choose a memorable name for your shop
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
                disabled={loading}
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
                disabled={loading}
                className="text-base"
              />
              <p className="text-sm text-gray-500">
                Ethiopian phone number for customer contact
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering Shop...
                </>
              ) : (
                <>
                  <Store className="w-4 h-4 mr-2" />
                  Register Shop
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Your shop will be created instantly</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>You can start adding products immediately</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Students from your city and nearby campuses can discover your products</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Payments are held in escrow until delivery is confirmed</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
