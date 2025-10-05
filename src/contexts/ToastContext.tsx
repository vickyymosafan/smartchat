'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ToastContainer';
import { ToastType } from '@/components/Toast';

/**
 * Options untuk toast context
 */
interface ToastOptions {
  duration?: number;
  dismissible?: boolean;
  onClose?: () => void;
}

/**
 * Interface untuk Toast Context
 */
interface ToastContextType {
  /** Tambah toast success */
  success: (title: string, message?: string, options?: ToastOptions) => string;
  /** Tambah toast error */
  error: (title: string, message?: string, options?: ToastOptions) => string;
  /** Tambah toast warning */
  warning: (title: string, message?: string, options?: ToastOptions) => string;
  /** Tambah toast info */
  info: (title: string, message?: string, options?: ToastOptions) => string;
  /** Tambah toast dengan tipe custom */
  addToast: (
    type: ToastType,
    title: string,
    message?: string,
    options?: ToastOptions
  ) => string;
  /** Remove toast berdasarkan ID */
  removeToast: (id: string) => void;
  /** Clear semua toast */
  clearToasts: () => void;
}

/**
 * Toast Context
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Props untuk ToastProvider
 */
interface ToastProviderProps {
  children: ReactNode;
  /** Posisi toast container */
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}

/**
 * Toast Provider component
 * Menyediakan toast functionality ke seluruh aplikasi
 */
export function ToastProvider({
  children,
  position = 'top-right',
}: ToastProviderProps) {
  const {
    toasts,
    success,
    error,
    warning,
    info,
    addToast,
    removeToast,
    clearToasts,
  } = useToast();

  const contextValue: ToastContextType = {
    success,
    error,
    warning,
    info,
    addToast,
    removeToast,
    clearToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        toasts={toasts}
        onRemoveToast={removeToast}
        position={position}
      />
    </ToastContext.Provider>
  );
}

/**
 * Hook untuk menggunakan Toast Context
 * Harus digunakan di dalam ToastProvider
 */
export function useToastContext(): ToastContextType {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error('useToastContext harus digunakan di dalam ToastProvider');
  }

  return context;
}

/**
 * Higher-Order Component untuk wrap komponen dengan ToastProvider
 */
export function withToastProvider<P extends object>(
  Component: React.ComponentType<P>,
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center'
) {
  const WrappedComponent = (props: P) => (
    <ToastProvider position={position}>
      <Component {...props} />
    </ToastProvider>
  );

  WrappedComponent.displayName = `withToastProvider(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default ToastProvider;
