/**
 * Performance monitoring utilities
 * Untuk tracking Core Web Vitals dan performance metrics
 */

'use client';

/**
 * Interface untuk Web Vitals metrics
 */
export interface WebVitalsMetric {
  id: string;
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
}

/**
 * Thresholds untuk Core Web Vitals (berdasarkan Google guidelines)
 */
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 }, // First Input Delay
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
  INP: { good: 200, poor: 500 }, // Interaction to Next Paint
};

/**
 * Get rating untuk metric value
 */
function getRating(
  name: WebVitalsMetric['name'],
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Report Web Vitals metric
 * Dapat di-extend untuk send ke analytics service
 */
export function reportWebVitals(metric: WebVitalsMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }

  // Send to analytics service (optional)
  // Example: sendToAnalytics(metric);

  // Store in localStorage untuk debugging (optional)
  try {
    const stored = localStorage.getItem('webVitals') || '[]';
    const metrics = JSON.parse(stored);
    metrics.push({
      ...metric,
      timestamp: Date.now(),
    });
    // Keep only last 10 metrics
    localStorage.setItem('webVitals', JSON.stringify(metrics.slice(-10)));
  } catch (error) {
    // Ignore storage errors
  }
}

/**
 * Measure component render time
 * Gunakan dengan React.Profiler atau manual timing
 */
export function measureRenderTime(componentName: string, callback: () => void) {
  if (typeof window === 'undefined') {
    callback();
    return;
  }

  const startTime = performance.now();
  callback();
  const endTime = performance.now();
  const duration = endTime - startTime;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Render Time] ${componentName}: ${duration.toFixed(2)}ms`);
  }

  // Warn if render time is too long
  if (duration > 16) {
    // 16ms = 60fps threshold
    console.warn(
      `[Performance Warning] ${componentName} took ${duration.toFixed(2)}ms to render (> 16ms)`
    );
  }
}

/**
 * Measure async operation time
 */
export async function measureAsyncOperation<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await operation();
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Async Operation] ${operationName}: ${duration.toFixed(2)}ms`
      );
    }

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    console.error(
      `[Async Operation Error] ${operationName} failed after ${duration.toFixed(2)}ms:`,
      error
    );

    throw error;
  }
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics() {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const navigation = performance.getEntriesByType(
    'navigation'
  )[0] as PerformanceNavigationTiming;

  if (!navigation) {
    return null;
  }

  return {
    // Time to First Byte
    ttfb: navigation.responseStart - navigation.requestStart,

    // DOM Content Loaded
    domContentLoaded:
      navigation.domContentLoadedEventEnd -
      navigation.domContentLoadedEventStart,

    // Load Complete
    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,

    // DOM Interactive
    domInteractive: navigation.domInteractive - navigation.fetchStart,

    // Total Load Time
    totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
  };
}

/**
 * Check if performance API is supported
 */
export function isPerformanceSupported(): boolean {
  return typeof window !== 'undefined' && 'performance' in window;
}

/**
 * Mark performance milestone
 * Gunakan untuk custom performance marks
 */
export function markPerformance(name: string) {
  if (!isPerformanceSupported()) return;

  try {
    performance.mark(name);
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Measure performance between two marks
 */
export function measurePerformance(
  name: string,
  startMark: string,
  endMark: string
) {
  if (!isPerformanceSupported()) return null;

  try {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name)[0];

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Performance Measure] ${name}: ${measure.duration.toFixed(2)}ms`
      );
    }

    return measure.duration;
  } catch (error) {
    return null;
  }
}

/**
 * Clear performance marks and measures
 */
export function clearPerformanceMarks() {
  if (!isPerformanceSupported()) return;

  try {
    performance.clearMarks();
    performance.clearMeasures();
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Get bundle size information (development only)
 */
export function logBundleInfo() {
  if (process.env.NODE_ENV !== 'development') return;

  console.group('[Bundle Info]');
  console.log('Run `npm run build:analyze` to see detailed bundle analysis');
  console.log('Target metrics:');
  console.log('- LCP < 2.5s');
  console.log('- FID < 100ms');
  console.log('- CLS < 0.1');
  console.groupEnd();
}
