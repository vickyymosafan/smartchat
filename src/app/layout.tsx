import type { Metadata, Viewport } from 'next';
import './globals.css';
import PWAProvider from '@/components/PWAProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import ToastProvider from '@/contexts/ToastContext';

export const metadata: Metadata = {
  title: 'Aplikasi Chat Dinamis',
  description: 'Aplikasi chat dinamis dengan dukungan PWA dan integrasi n8n',
  keywords: ['chat', 'PWA', 'Next.js', 'TypeScript', 'Tailwind CSS'],
  authors: [{ name: 'Aplikasi Chat Dinamis Team' }],
  creator: 'Aplikasi Chat Dinamis',
  publisher: 'Aplikasi Chat Dinamis',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Chat App',
    startupImage: [
      {
        url: '/icons/icon-512x512.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icons/chat-icon.svg',
        color: '#3b82f6',
      },
    ],
  },
  openGraph: {
    type: 'website',
    siteName: 'Aplikasi Chat Dinamis',
    title: 'Aplikasi Chat Dinamis',
    description: 'Aplikasi chat dinamis dengan dukungan PWA dan integrasi n8n',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aplikasi Chat Dinamis',
    description: 'Aplikasi chat dinamis dengan dukungan PWA dan integrasi n8n',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="mask-icon" href="/icons/chat-icon.svg" color="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Chat App" />
        <meta name="application-name" content="Chat App" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className="antialiased text-body-large bg-background text-text">
        <ErrorBoundary>
          <ToastProvider position="top-right">
            <PWAProvider>
              {children}
            </PWAProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
