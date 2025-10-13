/**
 * Komponen SEO untuk inject structured data dan meta tags tambahan
 * Membantu meningkatkan visibility di search engines
 */

'use client';

import { useEffect } from 'react';
import {
  generateAllStructuredData,
  structuredDataToJsonLd,
} from '@/lib/structuredData';

interface SEOHeadProps {
  /**
   * Page-specific title (akan di-append ke base title)
   */
  title?: string;
  /**
   * Page-specific description
   */
  description?: string;
  /**
   * Canonical URL untuk page ini
   */
  canonicalUrl?: string;
  /**
   * Keywords tambahan untuk page ini
   */
  keywords?: string[];
  /**
   * Open Graph image untuk page ini
   */
  ogImage?: string;
  /**
   * Disable structured data injection
   */
  noStructuredData?: boolean;
}

export default function SEOHead({
  title,
  description,
  canonicalUrl,
  keywords = [],
  ogImage,
  noStructuredData = false,
}: SEOHeadProps) {
  useEffect(() => {
    // Inject structured data jika tidak di-disable
    if (!noStructuredData) {
      const structuredData = generateAllStructuredData();

      // Remove existing structured data scripts
      const existingScripts = document.querySelectorAll(
        'script[type="application/ld+json"]'
      );
      existingScripts.forEach(script => script.remove());

      // Inject Web Application schema
      const webAppScript = document.createElement('script');
      webAppScript.type = 'application/ld+json';
      webAppScript.textContent = structuredDataToJsonLd(
        structuredData.webApplication
      );
      document.head.appendChild(webAppScript);

      // Inject Organization schema
      const orgScript = document.createElement('script');
      orgScript.type = 'application/ld+json';
      orgScript.textContent = structuredDataToJsonLd(
        structuredData.organization
      );
      document.head.appendChild(orgScript);

      // Inject Website schema
      const websiteScript = document.createElement('script');
      websiteScript.type = 'application/ld+json';
      websiteScript.textContent = structuredDataToJsonLd(
        structuredData.website
      );
      document.head.appendChild(websiteScript);
    }

    // Update page-specific meta tags
    if (title) {
      document.title = `${title} | SmartChat`;
    }

    if (description) {
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    }

    if (keywords.length > 0) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        const existingKeywords = metaKeywords.getAttribute('content') || '';
        const allKeywords = [...existingKeywords.split(','), ...keywords]
          .filter(Boolean)
          .join(',');
        metaKeywords.setAttribute('content', allKeywords);
      }
    }

    if (canonicalUrl) {
      // Remove existing canonical link
      const existingCanonical = document.querySelector('link[rel="canonical"]');
      if (existingCanonical) {
        existingCanonical.remove();
      }

      // Add new canonical link
      const canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = canonicalUrl;
      document.head.appendChild(canonicalLink);
    }

    if (ogImage) {
      // Update Open Graph image
      const ogImageMeta = document.querySelector('meta[property="og:image"]');
      if (ogImageMeta) {
        ogImageMeta.setAttribute('content', ogImage);
      }

      // Update Twitter image
      const twitterImageMeta = document.querySelector(
        'meta[name="twitter:image"]'
      );
      if (twitterImageMeta) {
        twitterImageMeta.setAttribute('content', ogImage);
      }
    }

    // Cleanup function
    return () => {
      // Reset title jika perlu
      if (title) {
        document.title = 'SmartChat - Intelligent Conversations';
      }
    };
  }, [title, description, canonicalUrl, keywords, ogImage, noStructuredData]);

  // Komponen ini tidak render apapun
  return null;
}

/**
 * Hook untuk SEO utilities
 */
export function useSEO() {
  const updatePageTitle = (title: string) => {
    document.title = `${title} | SmartChat`;
  };

  const updateMetaDescription = (description: string) => {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
  };

  const addBreadcrumbSchema = (
    breadcrumbs: Array<{ name: string; url: string }>
  ) => {
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = structuredDataToJsonLd(breadcrumbSchema);
    document.head.appendChild(script);
  };

  return {
    updatePageTitle,
    updateMetaDescription,
    addBreadcrumbSchema,
  };
}

/**
 * Komponen untuk monitoring SEO metrics
 */
export function SEOMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals untuk SEO
    if ('PerformanceObserver' in window) {
      // Monitor Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        // Log LCP untuk monitoring
        console.log('SEO: LCP =', lastEntry.startTime);

        // LCP harus < 2.5s untuk SEO yang baik
        if (lastEntry.startTime > 2500) {
          console.warn('SEO Warning: LCP > 2.5s dapat mempengaruhi ranking');
        }
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });

        console.log('SEO: CLS =', clsValue);

        // CLS harus < 0.1 untuk SEO yang baik
        if (clsValue > 0.1) {
          console.warn('SEO Warning: CLS > 0.1 dapat mempengaruhi ranking');
        }
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });

      return () => {
        lcpObserver.disconnect();
        clsObserver.disconnect();
      };
    }
  }, []);

  return null;
}
