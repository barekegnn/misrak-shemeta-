import { Language } from '@/types';

export const locales: Language[] = ['en', 'am', 'om'];
export const defaultLocale: Language = 'en';

export const localeNames: Record<Language, string> = {
  en: 'English',
  am: 'አማርኛ', // Amharic
  om: 'Afaan Oromo',
};
