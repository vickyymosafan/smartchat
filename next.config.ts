import type { NextConfig } from 'next';

// Bundle analyzer untuk monitoring ukuran bundle (optional)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Optimasi untuk production
  output: 'standalone',

  // Environment variables
  env: {
    NEXT_PUBLIC_ENABLE_PWA: process.env.NEXT_PUBLIC_ENABLE_PWA || 'true',
  },

  // PWA dan Service Worker headers
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },

  // Security headers
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Webpack optimizations untuk code splitting dan tree shaking
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimasi untuk production build
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          // Pisahkan PWA components ke chunk terpisah
          pwa: {
            test: /[\\/]src[\\/]components[\\/](PWA|ServiceWorker)/,
            name: 'pwa',
            priority: 10,
            chunks: 'all',
          },
          // Pisahkan context providers
          contexts: {
            test: /[\\/]src[\\/]contexts[\\/]/,
            name: 'contexts',
            priority: 5,
            chunks: 'all',
          },
        },
      };

      // Tree shaking optimizations
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    // Alias untuk import yang lebih efisien
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };

    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
