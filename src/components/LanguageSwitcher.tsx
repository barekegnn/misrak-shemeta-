'use client';

import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useI18n } from '@/i18n/provider';
import { locales, localeNames } from '@/i18n/config';
import { Language } from '@/types';

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
        <Globe className="w-4 h-4 text-indigo-600" />
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Language)}
          className="bg-transparent border-none text-sm font-medium text-gray-900 focus:outline-none focus:ring-0 cursor-pointer pr-8 appearance-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236366f1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.25rem center',
            backgroundSize: '1.25rem',
          }}
        >
          {locales.map((loc) => (
            <option key={loc} value={loc}>
              {localeNames[loc]}
            </option>
          ))}
        </select>
      </div>
    </motion.div>
  );
}
