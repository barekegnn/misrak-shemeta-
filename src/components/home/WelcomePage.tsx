'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/provider';
import { useTelegramAuth } from '@/components/TelegramAuthProvider';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/Logo';

interface WelcomeContent {
  greeting: string;
  headline: string;
  subheadline: string;
  cta: string;
  features: string[];
  trustBadges: string[];
}

const welcomeContent: Record<string, WelcomeContent> = {
  en: {
    greeting: 'Welcome',
    headline: 'Your Gateway to Eastern Ethiopia\'s Marketplace',
    subheadline: 'Shop from Harar & Dire Dawa. Delivered to your campus or city.',
    cta: 'Start Shopping',
    features: [
      '🛍️ Thousands of products from trusted sellers',
      '🚚 Fast delivery to your location',
      '💰 Secure payments with Chapa',
      '🔒 Buyer protection with escrow',
    ],
    trustBadges: [
      'Trusted by students',
      'Secure payments',
      'Fast delivery',
    ],
  },
  am: {
    greeting: 'እንኳን ደህና መጡ',
    headline: 'ምስራቅ ኢትዮጵያ ገበያ ወደ ሚሳ ሸመታ',
    subheadline: 'ከሐረር እና ከደሬ ዳዋ ይገዙ። ወደ ካምፓስ ወይም ከተማ ይደርሳል።',
    cta: 'ገዝ ጀምር',
    features: [
      '🛍️ ከታማኝ ሻጮች ሺህ ሺህ ምርቶች',
      '🚚 ወደ ሥፍራህ ፈጣን ማድረስ',
      '💰 ከቻፓ ጋር ደህንነቱ የተጠበቀ ክፍያ',
      '🔒 ከ escrow ጋር ገዢ ጥበቃ',
    ],
    trustBadges: [
      'ተማሪዎች ያምናሉ',
      'ደህንነቱ የተጠበቀ ክፍያ',
      'ፈጣን ማድረስ',
    ],
  },
  om: {
    greeting: 'Akam Galateeffadha',
    headline: 'Karaa Gara Gabaa Bahaasaa Baab\'a Itoophiyaa',
    subheadline: 'Irraa Haarar fi Dire Daawaa bitaa. Gara kampasaa ykn magaalaa keessatti geessaa.',
    cta: 'Bitaa Jalqabi',
    features: [
      '🛍️ Midhaa kuma midhaa irraa gurgurtoota amansiisaa',
      '🚚 Geessaa saffisaa gara bakka kee',
      '💰 Kaffaltii nageenya qabu Chapa waliin',
      '🔒 Eegumsa bitaa escrow waliin',
    ],
    trustBadges: [
      'Barattoonni amansiisu',
      'Kaffaltii nageenya qabu',
      'Geessaa saffisaa',
    ],
  },
};

export function WelcomePage() {
  const { telegramUser } = useTelegramAuth();
  const { locale } = useI18n();
  const [displayName, setDisplayName] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get user's first name from Telegram
    if (telegramUser?.first_name) {
      setDisplayName(telegramUser.first_name);
    }
  }, [telegramUser]);

  if (!mounted) return null;

  const content = welcomeContent[locale] || welcomeContent.en;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-20 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200 to-indigo-200 rounded-full opacity-20 blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 py-12 sm:py-16 md:py-20">
        <motion.div
          className="max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-8 sm:mb-12"
          >
            <Logo size={80} className="drop-shadow-lg" />
          </motion.div>

          {/* Personalized Greeting */}
          <motion.div
            variants={itemVariants}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              {content.greeting}
              {displayName && (
                <span className="block text-3xl sm:text-4xl md:text-5xl mt-2">
                  {displayName}! 👋
                </span>
              )}
            </h1>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            variants={itemVariants}
            className="text-center mb-6 sm:mb-8"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {content.headline}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 font-light">
              {content.subheadline}
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-14"
          >
            {content.features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-4 sm:p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-shadow"
              >
                <p className="text-base sm:text-lg text-gray-700 font-medium">
                  {feature}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-3 justify-center mb-10 sm:mb-14"
          >
            {content.trustBadges.map((badge, index) => (
              <motion.span
                key={index}
                variants={itemVariants}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200 text-sm sm:text-base font-semibold text-indigo-700 shadow-md"
              >
                ✓ {badge}
              </motion.span>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 sm:px-12 py-4 sm:py-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg sm:text-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform"
            >
              {content.cta}
            </motion.button>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            variants={itemVariants}
            className="mt-16 sm:mt-20 pt-12 sm:pt-16 border-t border-gray-200"
          >
            <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">
                  500+
                </p>
                <p className="text-sm sm:text-base text-gray-600">
                  {locale === 'am' ? 'ምርቶች' : locale === 'om' ? 'Midhaa' : 'Products'}
                </p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">
                  50+
                </p>
                <p className="text-sm sm:text-base text-gray-600">
                  {locale === 'am' ? 'ሻጮች' : locale === 'om' ? 'Gurgurtoota' : 'Sellers'}
                </p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
                  24/7
                </p>
                <p className="text-sm sm:text-base text-gray-600">
                  {locale === 'am' ? 'ድጋፍ' : locale === 'om' ? 'Deeggarsa' : 'Support'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Footer Message */}
          <motion.div
            variants={itemVariants}
            className="mt-12 sm:mt-16 text-center"
          >
            <p className="text-sm sm:text-base text-gray-500">
              {locale === 'am'
                ? '🔒 ሁሉም ግብይቶች በ Chapa ተጠብቀዋል'
                : locale === 'om'
                ? '🔒 Miidhaagni hundinuu Chapa waliin eegamaa jira'
                : '🔒 All transactions are secured by Chapa'}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
