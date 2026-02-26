/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Server Components and Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // For image uploads
    },
  },
  
  // Image optimization for mobile networks (Requirements 12.4, 21.4)
  images: {
    formats: ['image/webp', 'image/avif'], // Modern formats for better compression
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Mobile-first device sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Thumbnail sizes
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache for 30 days
    dangerouslyAllowSVG: false, // Security: disable SVG
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
    ],
  },
  
  // Optimize for Telegram Mini App
  output: 'standalone',
  
  // Compression for faster loading
  compress: true,
  
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
