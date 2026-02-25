'use client';

import { useState } from 'react';
import { Location } from '@/types';
import { updateHomeLocation } from '@/app/actions/users';
import { useTelegramAuth } from './TelegramAuthProvider';
import { useI18n } from '@/i18n/provider';

const LOCATIONS: { value: Location; labelKey: string }[] = [
  { value: 'Haramaya_Main', labelKey: 'locations.haramayaMain' },
  { value: 'Harar_Campus', labelKey: 'locations.hararCampus' },
  { value: 'DDU', labelKey: 'locations.ddu' },
];

interface HomeLocationSelectorProps {
  onComplete?: () => void;
}

export function HomeLocationSelector({ onComplete }: HomeLocationSelectorProps) {
  const { telegramUser } = useTelegramAuth();
  const { t } = useI18n();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedLocation || !telegramUser) {
      setError(t('errors.validation.required'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updateHomeLocation(
        telegramUser.id.toString(),
        selectedLocation
      );

      if (result.success) {
        onComplete?.();
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
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{t('welcome')}</h1>
          <p className="text-muted-foreground">
            Please select your home location to get started
          </p>
        </div>

        <div className="space-y-3">
          {LOCATIONS.map((location) => (
            <button
              key={location.value}
              onClick={() => setSelectedLocation(location.value)}
              className={`
                w-full touch-target rounded-lg border-2 p-4 text-left transition-all
                ${
                  selectedLocation === location.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">
                  {t(location.labelKey)}
                </span>
                {selectedLocation === location.value && (
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selectedLocation || isSubmitting}
          className="
            w-full touch-target rounded-lg bg-primary px-4 py-3 font-medium 
            text-primary-foreground transition-colors
            hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isSubmitting ? t('common.loading') : t('actions.continue')}
        </button>
      </div>
    </div>
  );
}
