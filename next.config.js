/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Server Components and Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // For image uploads
    },
  },
  
  // Image optimization for mobile networks
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  
  // Optimize for Telegram Mini App
  output: 'standalone',
  
  // Internationalization
  i18n: {
    locales: ['en', 'am', 'om'],
    defaultLocale: 'en',
  },
};

module.exports = nextConfig;
