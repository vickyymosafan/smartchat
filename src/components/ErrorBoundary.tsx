'use client';

import React, { Component, ReactNode } from 'react';
import { ErrorBoundaryState } from '@/types/chat';

/**
 * Props untuk ErrorBoundary component
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Error Boundary component untuk menangkap error di level komponen
 * Menampilkan fallback UI yang user-friendly saat terjadi error
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Static method untuk update state saat terjadi error
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Method untuk log error ke console atau service monitoring
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // TODO: Kirim error ke service monitoring (Sentry, LogRocket, dll)
    // if (process.env.NODE_ENV === 'production') {
    //   sendErrorToMonitoring(error, errorInfo);
    // }
  }

  /**
   * Method untuk reset error state
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  /**
   * Method untuk reload halaman
   */
  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Jika ada custom fallback, gunakan itu
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg border border-slate-200">
            {/* Error Icon */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            {/* Error Title */}
            <h2 className="mb-2 text-center text-xl font-semibold text-slate-900">
              Terjadi Kesalahan
            </h2>

            {/* Error Description */}
            <p className="mb-6 text-center text-slate-600">
              Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi atau muat ulang halaman.
            </p>

            {/* Error Details (hanya di development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 rounded-md bg-slate-100 p-3">
                <summary className="cursor-pointer text-sm font-medium text-slate-700">
                  Detail Error (Development)
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-slate-600">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
              <button
                onClick={this.handleReset}
                className="flex-1 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                Coba Lagi
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                Muat Ulang
              </button>
            </div>

            {/* Help Text */}
            <p className="mt-4 text-center text-xs text-slate-500">
              Jika masalah terus berlanjut, silakan hubungi dukungan teknis.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based Error Boundary untuk functional components
 * Menggunakan error state dan useEffect untuk error handling
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = () => setError(null);

  const handleError = React.useCallback((error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
  }, []);

  // Reset error saat component unmount
  React.useEffect(() => {
    return () => setError(null);
  }, []);

  return {
    error,
    resetError,
    handleError,
  };
}

/**
 * Higher-Order Component untuk wrap komponen dengan Error Boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}