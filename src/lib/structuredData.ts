/**
 * Structured Data (JSON-LD) untuk SEO
 * Membantu search engines memahami konten aplikasi dengan lebih baik
 */

interface WebApplicationSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  browserRequirements: string;
  offers: {
    '@type': string;
    price: string;
    priceCurrency: string;
  };
  author: {
    '@type': string;
    name: string;
  };
  aggregateRating?: {
    '@type': string;
    ratingValue: string;
    ratingCount: string;
  };
  screenshot?: string[];
  featureList?: string[];
}

interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  logo: string;
  sameAs?: string[];
}

interface WebsiteSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  potentialAction: {
    '@type': string;
    target: string;
    'query-input': string;
  };
}

/**
 * Generate structured data untuk Web Application
 */
export function generateWebApplicationSchema(): WebApplicationSchema {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-domain.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Aplikasi Chat Dinamis',
    description:
      'Aplikasi chat dinamis dengan teknologi AI modern, dukungan PWA untuk pengalaman offline, dan integrasi n8n untuk otomasi workflow.',
    url: baseUrl,
    applicationCategory: 'CommunicationApplication',
    operatingSystem: 'Web Browser, iOS, Android',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
    },
    author: {
      '@type': 'Organization',
      name: 'Aplikasi Chat Dinamis Team',
    },
    featureList: [
      'Chat AI dengan respons real-time',
      'Progressive Web App (PWA)',
      'Dukungan offline',
      'Responsive design',
      'Integrasi n8n webhook',
      'Interface modern dengan Tailwind CSS',
      'TypeScript untuk type safety',
      'Optimasi performa dengan lazy loading',
    ],
    screenshot: [
      `${baseUrl}/images/screenshot-desktop.png`,
      `${baseUrl}/images/screenshot-mobile.png`,
    ],
  };
}

/**
 * Generate structured data untuk Organization
 */
export function generateOrganizationSchema(): OrganizationSchema {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-domain.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Aplikasi Chat Dinamis',
    description: 'Tim pengembang aplikasi chat dinamis dengan teknologi modern',
    url: baseUrl,
    logo: `${baseUrl}/icons/icon-512x512.png`,
    sameAs: [
      // Tambahkan social media links jika ada
      // 'https://twitter.com/your_handle',
      // 'https://github.com/your-repo',
      // 'https://linkedin.com/company/your-company',
    ],
  };
}

/**
 * Generate structured data untuk Website
 */
export function generateWebsiteSchema(): WebsiteSchema {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-domain.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Aplikasi Chat Dinamis',
    description:
      'Aplikasi chat dinamis dengan teknologi AI modern dan dukungan PWA',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate semua structured data dalam satu object
 */
export function generateAllStructuredData() {
  return {
    webApplication: generateWebApplicationSchema(),
    organization: generateOrganizationSchema(),
    website: generateWebsiteSchema(),
  };
}

/**
 * Convert structured data ke JSON-LD string
 */
export function structuredDataToJsonLd(data: any): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Generate script tag untuk JSON-LD
 */
export function generateJsonLdScript(data: any): string {
  return `<script type="application/ld+json">${structuredDataToJsonLd(data)}</script>`;
}
