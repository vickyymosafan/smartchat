import type { Metadata, Viewport } from 'next';
import './globals.css';

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
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
