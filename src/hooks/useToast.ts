'use client';

import { useState, useCallback } from 'react';
import { ToastData, ToastType } from '@/components/Toast';

/**
 * Options untuk membuat toast
 */
interface ToastOptions {
  /** Durasi tampil dalam milidetik (default: 5000, 0 = tidak auto dismiss) */
  duration?: number;
  /** Apakah bisa ditutup manual (default: true) */
  dismissible?: boolean;
  /** Callback saat toast ditutup */
  onClose?: () => void;
}

/**
 * Interface untuk return value useToast hook
 */
interface UseToastReturn {
  /** Daftar toast yang aktif */
  toasts: ToastData[];
  /** Tambah toast success */
  success: (title: string, message?: string, options?: ToastOptions) => string;
  /** Tambah toast error */
  error: (title: string, message?: string, options?: ToastOptions) => string;
  /** Tambah toast warning */
  warning: (title: string, message?: string, options?: ToastOptions) => string;
  /** Tambah toast info */
  info: (title: string, message?: string, options?: ToastOptions) => string;
  /** Tambah toast dengan tipe custom */
  addToast: (type: ToastType, title: string, message?: string, options?: ToastOptions) => string;
  /** Remove toast berdasarkan ID */
  removeToast: (id: string) => void;
  /** Clear semua toast */
  clearToasts: () => void;
}

/**
 * Custom hook untuk mengelola toast notifications
 * Menyediakan API yang mudah untuk menampilkan berbagai jenis notifikasi
 */
export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  /**
   * Generate unique ID untuk toast
   */
  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Tambah toast baru
   */
  const addToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    options: ToastOptions = {}
  ): string => {
    const id = generateId();
    const {
      duration = 5000,
      dismissible = true,
      onClose,
    } = options;

    const newToast: ToastData = {
      id,
      type,
      title,
      message,
      duration,
      dismissible,
      onClose,
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, [generateId]);

  /**
   * Remove toast berdasarkan ID
   */
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  /**
   * Clear semua toast
   */
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  /**
   * Helper function untuk success toast
   */
  const success = useCallback((
    title: string,
    message?: string,
    options?: ToastOptions
  ): string => {
    return addToast('success', title, message, options);
  }, [addToast]);

  /**
   * Helper function untuk error toast
   */
  const error = useCallback((
    title: string,
    message?: string,
    options?: ToastOptions
  ): string => {
    return addToast('error', title, message, options);
  }, [addToast]);

  /**
   * Helper function untuk warning toast
   */
  const warning = useCallback((
    title: string,
    message?: string,
    options?: ToastOptions
  ): string => {
    return addToast('warning', title, message, options);
  }, [addToast]);

  /**
   * Helper function untuk info toast
   */
  const info = useCallback((
    title: string,
    message?: string,
    options?: ToastOptions
  ): string => {
    return addToast('info', title, message, options);
  }, [addToast]);

  return {
    toasts,
    success,
    error,
    warning,
    info,
    addToast,
    removeToast,
    clearToasts,
  };
}

export default useToast;