'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { Location } from '@/types';
import { updateHomeLocation } from '@/app/actions/users';
import { useTelegramAuth } from './TelegramAuthProvider';
import { useI18n } from '@/i18n/provider';

const LOCATIONS: { value: Location; labelKey: string; emoji: string }[] = [
  { value: 'Haramaya_Main', labelKey: 'common.locations.haramayaMain', emoji: '🎓' },
  { value: 'Harar_Campus', labelKey: 'common.locations.hararCampus', emoji: '🏛️' },
  { value: 'DDU', labelKey: 'common.locations.ddu', emoji: '🏫' },
];

interface HomeLocationSelectorProps {
  onComplete?: () => void;
}

export function HomeLocationSelector({ onComplete }: HomeLocationSelectorProps) {
  const { telegramUser, triggerHaptic } = useTelegramAuth();
  const { t } = useI18n();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    triggerHaptic('light');
  };

  const handleSubmit = async () => {
    if (!selectedLocation || !telegramUser) {
      setError(t('errors.validation.required'));
      return;
    }

    triggerHaptic('medium');
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updateHomeLocation(
        telegramUser.id.toString(),
        selectedLocation
      );

      if (result.success) {
        triggerHaptic('heavy');
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
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="w-full max-w-md space-y-8">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center space-y-3"
        >
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            {t('common.welcome')}
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Please select your home location to get started
          </p>
        </motion.div>

        {/* Luxury Location Cards */}
        <div className="space-y-4">
          {LOCATIONS.map((location, index) => {
            const isSelected = selectedLocation === location.value;
            
            return (
              <motion.button
                key={location.value}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLocationSelect(location.value)}
                className={`
                  w-full p-6 rounded-2xl text-left transition-all duration-300
                  ${isSelected 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/30 border-2 border-indigo-400' 
                    : 'bg-white border-2 border-gray-200 hover:border-indigo-300 shadow-lg hover:shadow-xl'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`
                      w-14 h-14 rounded-xl flex items-center justify-center text-2xl
                      ${isSelected ? 'bg-white/20' : 'bg-gray-100'}
                    `}>
                      {location.emoji}
                    </div>
                    <div>
                      <span className={`
                        text-lg font-semibold block
                        ${isSelected ? 'text-white' : 'text-gray-900'}
                      `}>
                        {t(location.labelKey)}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className={`w-4 h-4 ${isSelected ? 'text-white/80' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                          Eastern Ethiopia
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600"
          >
            {error}
          </motion.div>
        )}

        {/* Premium CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          onClick={handleSubmit}
          disabled={!selectedLocation || isSubmitting}
          className={`
            w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300
            ${selectedLocation && !isSubmitting
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-[1.02]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('common.loading')}
            </span>
          ) : (
            t('actions.continue')
          )}
        </motion.button>
      </div>
    </div>
  );
}
