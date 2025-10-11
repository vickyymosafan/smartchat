import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';

// Configure Plus Jakarta Sans as primary font
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

// Configure Inter as fallback font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans-fallback',
});
import ErrorBoundary from '@/components/ErrorBoundary';
import { LazyPWAProvider } from '@/lib/lazyComponents';
import ResourcePreloader, {
  PerformanceMonitor,
} from '@/components/ResourcePreloader';
import SEOHead, { SEOMonitor } from '@/components/SEOHead';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { TranslationProvider } from '@/components/providers/TranslationProvider';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: {
    default: 'Aplikasi Chat Dinamis - Asisten AI Modern',
    template: '%s | Aplikasi Chat Dinamis',
  },
  description:
    'Aplikasi chat dinamis dengan teknologi AI modern, dukungan PWA untuk pengalaman offline, dan integrasi n8n untuk otomasi workflow. Dibangun dengan Next.js 15 dan Tailwind CSS.',
  keywords: [
    'chat AI',
    'aplikasi chat',
    'PWA',
    'Progressive Web App',
    'Next.js',
    'TypeScript',
    'Tailwind CSS',
    'n8n integration',
    'asisten AI',
    'chat dinamis',
    'offline chat',
    'modern UI',
    'responsive design',
    'Indonesian chat app',
  ],
  authors: [
    { name: 'Aplikasi Chat Dinamis Team', url: 'https://github.com/your-repo' },
  ],
  creator: 'Aplikasi Chat Dinamis Team',
  publisher: 'Aplikasi Chat Dinamis',
  category: 'Technology',
  classification: 'Chat Application',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',

  // Apple Web App Configuration
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Chat Dinamis',
    startupImage: [
      {
        url: '/icons/apple-splash-2048-2732.png',
        media:
          '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: '/icons/apple-splash-1668-2388.png',
        media:
          '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: '/icons/apple-splash-1536-2048.png',
        media:
          '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: '/icons/apple-splash-1125-2436.png',
        media:
          '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: '/icons/apple-splash-1242-2208.png',
        media:
          '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)',
      },
      {
        url: '/icons/apple-splash-750-1334.png',
        media:
          '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
      {
        url: '/icons/apple-splash-640-1136.png',
        media:
          '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)',
      },
    ],
  },

  // Icons Configuration
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      {
        url: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icons/safari-pinned-tab.svg',
        color: '#3b82f6',
      },
    ],
  },

  // Open Graph Configuration
  openGraph: {
    type: 'website',
    siteName: 'Aplikasi Chat Dinamis',
    title: 'Aplikasi Chat Dinamis - Asisten AI Modern',
    description:
      'Aplikasi chat dinamis dengan teknologi AI modern, dukungan PWA untuk pengalaman offline, dan integrasi n8n untuk otomasi workflow.',
    locale: 'id_ID',
    alternateLocale: ['en_US'],
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-domain.com',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Aplikasi Chat Dinamis - Screenshot',
        type: 'image/png',
      },
      {
        url: '/images/og-image-square.png',
        width: 1200,
        height: 1200,
        alt: 'Aplikasi Chat Dinamis - Logo',
        type: 'image/png',
      },
    ],
  },

  // Twitter Card Configuration
  twitter: {
    card: 'summary_large_image',
    site: '@your_twitter_handle',
    creator: '@your_twitter_handle',
    title: 'Aplikasi Chat Dinamis - Asisten AI Modern',
    description:
      'Aplikasi chat dinamis dengan teknologi AI modern dan dukungan PWA untuk pengalaman offline yang optimal.',
    images: ['/images/twitter-image.png'],
  },

  // Robots Configuration
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Additional SEO
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-domain.com',
    languages: {
      'id-ID': '/id',
      'en-US': '/en',
    },
  },

  // Verification
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
    other: {
      'msvalidate.01': process.env.BING_SITE_VERIFICATION || '',
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  // Ensure proper orientation handling
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <head>
        {/* Favicons dan Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link
          rel="mask-icon"
          href="/icons/safari-pinned-tab.svg"
          color="#3b82f6"
        />

        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Chat Dinamis" />
        <meta name="application-name" content="Chat Dinamis" />

        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta
          name="msapplication-TileImage"
          content="/icons/mstile-144x144.png"
        />

        {/* DNS Prefetch untuk performa */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//vickymosafan2.app.n8n.cloud" />

        {/* Preconnect untuk resources penting */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://vickymosafan2.app.n8n.cloud"
          crossOrigin="anonymous"
        />

        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta
          httpEquiv="Referrer-Policy"
          content="strict-origin-when-cross-origin"
        />

        {/* Performance Hints */}
        <meta httpEquiv="Accept-CH" content="DPR, Viewport-Width, Width" />

        {/* Language dan Locale */}
        <meta httpEquiv="Content-Language" content="id" />
        <link
          rel="alternate"
          hrefLang="id"
          href={
            process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-domain.com'
          }
        />
        <link
          rel="alternate"
          hrefLang="en"
          href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-domain.com'}/en`}
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href={
            process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-domain.com'
          }
        />
      </head>
      <body
        className="antialiased text-body-large bg-background text-text"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <TranslationProvider>
            <ErrorBoundary>
              <LazyPWAProvider>
                {children}
                <ResourcePreloader />
                <PerformanceMonitor />
                <SEOHead />
                <SEOMonitor />
                <Toaster />
              </LazyPWAProvider>
            </ErrorBoundary>
          </TranslationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
