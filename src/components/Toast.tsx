'use client';

import React, { useEffect, useState } from 'react';

/**
 * Tipe toast notification
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Interface untuk data toast
 */
export interface ToastData {
  /** ID unik toast */
  id: string;
  /** Tipe toast */
  type: ToastType;
  /** Judul toast */
  title: string;
  /** Pesan toast */
  message?: string;
  /** Durasi tampil dalam milidetik (0 = tidak auto dismiss) */
  duration?: number;
  /** Apakah bisa ditutup manual */
  dismissible?: boolean;
  /** Callback saat toast ditutup */
  onClose?: () => void;
}

/**
 * Props untuk komponen Toast
 */
interface ToastProps extends ToastData {
  /** Callback untuk remove toast */
  onRemove: (id: string) => void;
}

/**
 * Komponen Toast individual
 * Menampilkan notifikasi dengan berbagai tipe dan styling
 */
export function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  dismissible = true,
  onClose,
  onRemove,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Auto dismiss toast setelah duration
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  // Animasi masuk
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Handle close toast dengan animasi
   */
  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose?.();
      onRemove(id);
    }, 300);
  };

  /**
   * Get icon berdasarkan tipe toast
   */
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'info':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  /**
   * Get styling berdasarkan tipe toast
   */
  const getStyles = () => {
    const baseStyles =
      'flex items-start p-4 rounded-lg shadow-lg border transition-all duration-300 ease-in-out';

    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`;
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`;
    }
  };

  /**
   * Get icon color berdasarkan tipe
   */
  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
    }
  };

  return (
    <div
      className={`
        ${getStyles()}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isLeaving ? 'translate-x-full opacity-0' : ''}
        transform
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${getIconColor()}`}>{getIcon()}</div>

      {/* Content */}
      <div className="ml-3 flex-1">
        <h4 className="text-sm font-medium">{title}</h4>
        {message && <p className="mt-1 text-sm opacity-90">{message}</p>}
      </div>

      {/* Close Button */}
      {dismissible && (
        <button
          onClick={handleClose}
          className="ml-4 flex-shrink-0 rounded-md p-1 hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Tutup notifikasi"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
