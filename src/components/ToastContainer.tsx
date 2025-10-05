'use client';

import React from 'react';
import { Toast, ToastData } from './Toast';

/**
 * Props untuk ToastContainer
 */
interface ToastContainerProps {
  /** Daftar toast yang aktif */
  toasts: ToastData[];
  /** Callback untuk remove toast */
  onRemoveToast: (id: string) => void;
  /** Posisi container */
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}

/**
 * Container untuk menampilkan multiple toast notifications
 * Mendukung berbagai posisi dan responsive design
 */
export function ToastContainer({
  toasts,
  onRemoveToast,
  position = 'top-right',
}: ToastContainerProps) {
  if (toasts.length === 0) {
    return null;
  }

  /**
   * Get positioning classes berdasarkan position prop
   */
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div
      className={`
        fixed z-50 pointer-events-none
        ${getPositionClasses()}
        w-full max-w-sm
        sm:max-w-md
        px-4 sm:px-0
      `}
      aria-live="polite"
      aria-label="Notifikasi"
    >
      <div className="space-y-3">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onRemove={onRemoveToast} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ToastContainer;
