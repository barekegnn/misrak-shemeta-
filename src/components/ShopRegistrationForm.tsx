'use client';

import { useState } from 'react';
import { registerShop } from '@/app/actions/shop';
import type { City, Language } from '@/types';

interface ShopRegistrationFormProps {
  telegramId: string;
  language?: Language;
  onSuccess?: (shopId: string) => void;
}

export function ShopRegistrationForm({
  telegramId,
  language = 'en',
  onSuccess
}: ShopRegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    city: '' as City | '',
    contactPhone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const translations = {
    en: {
      title: 'Register Your Shop',
      subtitle: 'Start selling on Misrak Shemeta marketplace',
      shopName: 'Shop Name',
      shopNamePlaceholder: 'Enter your shop name',
      city: 'Shop Location',
      cityPlaceholder: 'Select city',
      harar: 'Harar',
      direDawa: 'Dire Dawa',
      contactPhone: 'Contact Phone',
      contactPhonePlaceholder: '+251911234567',
      submit: 'Register Shop',
      submitting: 'Registering...',
      errors: {
        SHOP_NAME_REQUIRED: 'Shop name is required',
        SHOP_NAME_TOO_LONG: 'Shop name is too long (max 100 characters)',
        INVALID_CITY: 'Please select a valid city',
        CONTACT_PHONE_REQUIRED: 'Contact phone is required',
        INVALID_PHONE_FORMAT: 'Invalid phone format. Use +251XXXXXXXXX or 09XXXXXXXX',
        SHOP_ALREADY_EXISTS: 'You already have a registered shop',
        INTERNAL_ERROR: 'An error occurred. Please try again.'
      }
    },
    am: {
      title: 'ሱቅዎን ይመዝገቡ',
      subtitle: 'በሚስራክ ሸመታ ገበያ መድረክ መሸጥ ይጀምሩ',
      shopName: 'የሱቅ ስም',
      shopNamePlaceholder: 'የሱቅዎን ስም ያስገቡ',
      city: 'የሱቅ አድራሻ',
      cityPlaceholder: 'ከተማ ይምረጡ',
      harar: 'ሐረር',
      direDawa: 'ድሬዳዋ',
      contactPhone: 'የመገኛ ስልክ',
      contactPhonePlaceholder: '+251911234567',
      submit: 'ሱቅ መዝግብ',
      submitting: 'በመመዝገብ ላይ...',
      errors: {
        SHOP_NAME_REQUIRED: 'የሱቅ ስም ያስፈልጋል',
        SHOP_NAME_TOO_LONG: 'የሱቅ ስም በጣም ረጅም ነው (ከ100 ቁምፊዎች በላይ)',
        INVALID_CITY: 'እባክዎ ትክክለኛ ከተማ ይምረጡ',
        CONTACT_PHONE_REQUIRED: 'የመገኛ ስልክ ያስፈልጋል',
        INVALID_PHONE_FORMAT: 'ልክ ያልሆነ የስልክ ቅርጸት። +251XXXXXXXXX ወይም 09XXXXXXXX ይጠቀሙ',
        SHOP_ALREADY_EXISTS: 'ቀድሞውኑ የተመዘገበ ሱቅ አለዎት',
        INTERNAL_ERROR: 'ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።'
      }
    },
    om: {
      title: 'Suuqa Kee Galmee',
      subtitle: 'Waltajjii gabaa Misrak Shemeta irratti gurgurtaa jalqabi',
      shopName: 'Maqaa Suuqaa',
      shopNamePlaceholder: 'Maqaa suuqa keetii galchi',
      city: 'Bakka Suuqaa',
      cityPlaceholder: 'Magaalaa filadhu',
      harar: 'Harar',
      direDawa: 'Dire Dawa',
      contactPhone: 'Bilbila Quunnamtii',
      contactPhonePlaceholder: '+251911234567',
      submit: 'Suuqa Galmee',
      submitting: 'Galmeessaa jira...',
      errors: {
        SHOP_NAME_REQUIRED: 'Maqaan suuqaa barbaachisaadha',
        SHOP_NAME_TOO_LONG: 'Maqaan suuqaa baay\'ee dheeraadha (arfii 100 ol)',
        INVALID_CITY: 'Maaloo magaalaa sirrii ta\'e filadhu',
        CONTACT_PHONE_REQUIRED: 'Bilbilli quunnamtii barbaachisaadha',
        INVALID_PHONE_FORMAT: 'Bifa bilbilaa sirrii miti. +251XXXXXXXXX ykn 09XXXXXXXX fayyadami',
        SHOP_ALREADY_EXISTS: 'Suuqa galmeeffame duraan qabda',
        INTERNAL_ERROR: 'Dogongora uumameera. Maaloo irra deebi\'ii yaali.'
      }
    }
  };

  const t = translations[language];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t.errors.SHOP_NAME_REQUIRED;
    } else if (formData.name.length > 100) {
      newErrors.name = t.errors.SHOP_NAME_TOO_LONG;
    }

    if (!formData.city) {
      newErrors.city = t.errors.INVALID_CITY;
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = t.errors.CONTACT_PHONE_REQUIRED;
    } else {
      const phoneRegex = /^(\+251|0)?[79]\d{8}$/;
      if (!phoneRegex.test(formData.contactPhone.replace(/\s/g, ''))) {
        newErrors.contactPhone = t.errors.INVALID_PHONE_FORMAT;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerShop(telegramId, {
        name: formData.name,
        city: formData.city as City,
        contactPhone: formData.contactPhone
      });

      if (result.success && result.data) {
        if (onSuccess) {
          onSuccess(result.data.id);
        }
      } else {
        const errorKey = result.error as keyof typeof t.errors;
        setSubmitError(t.errors[errorKey] || t.errors.INTERNAL_ERROR);
      }
    } catch (error) {
      console.error('Shop registration error:', error);
      setSubmitError(t.errors.INTERNAL_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-gray-600 text-sm">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Shop Name */}
        <div>
          <label
            htmlFor="shopName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t.shopName}
          </label>
          <input
            id="shopName"
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder={t.shopNamePlaceholder}
            className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            maxLength={100}
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t.city}
          </label>
          <select
            id="city"
            value={formData.city}
            onChange={(e) =>
              setFormData({ ...formData, city: e.target.value as City })
            }
            className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">{t.cityPlaceholder}</option>
            <option value="Harar">{t.harar}</option>
            <option value="Dire_Dawa">{t.direDawa}</option>
          </select>
          {errors.city && (
            <p className="text-red-600 text-sm mt-1">{errors.city}</p>
          )}
        </div>

        {/* Contact Phone */}
        <div>
          <label
            htmlFor="contactPhone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t.contactPhone}
          </label>
          <input
            id="contactPhone"
            type="tel"
            value={formData.contactPhone}
            onChange={(e) =>
              setFormData({ ...formData, contactPhone: e.target.value })
            }
            placeholder={t.contactPhonePlaceholder}
            className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.contactPhone ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.contactPhone && (
            <p className="text-red-600 text-sm mt-1">{errors.contactPhone}</p>
          )}
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {submitError}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-h-[44px]"
        >
          {isSubmitting ? t.submitting : t.submit}
        </button>
      </form>
    </div>
  );
}
