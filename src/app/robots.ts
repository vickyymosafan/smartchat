/**
 * Dynamic robots.txt generator untuk Next.js App Router
 * Menghasilkan robots.txt secara otomatis berdasarkan environment
 */

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-domain.com';
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    rules: {
      userAgent: '*',
      allow: isProduction ? '/' : undefined,
      disallow: isProduction ? ['/api/'] : '/', // Block crawling di development
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
