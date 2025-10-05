/**
 * Komponen LoadingSpinner
 * Menampilkan indikator loading dengan animasi Tailwind CSS
 * Mendukung berbagai ukuran dan responsif untuk semua perangkat
 */

import React from 'react';

/**
 * Interface untuk props LoadingSpinner
 */
interface LoadingSpinnerProps {
  /** Ukuran spinner - default 'md' */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Warna spinner - menggunakan color palette tanpa gradasi */
  color?: 'primary' | 'success' | 'error' | 'warning' | 'muted';
  /** Teks loading yang ditampilkan */
  text?: string;
  /** Apakah menampilkan teks loading */
  showText?: boolean;
  /** Class CSS tambahan */
  className?: string;
}

/**
 * Komponen LoadingSpinner dengan animasi Tailwind CSS
 * Responsif untuk berbagai ukuran layar
 */
export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  text = 'Memuat...',
  showText = true,
  className = '',
}: LoadingSpinnerProps) {
  // Mapping ukuran spinner untuk responsivitas
  const sizeClasses = {
    sm: 'w-4 h-4 sm:w-5 sm:h-5',
    md: 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8',
    lg: 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12',
    xl: 'w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16',
  };

  // Mapping warna sesuai color palette tanpa gradasi
  const colorClasses = {
    primary: 'border-blue-500',
    success: 'border-emerald-500',
    error: 'border-red-500',
    warning: 'border-amber-500',
    muted: 'border-slate-500',
  };

  // Mapping ukuran teks untuk responsivitas
  const textSizeClasses = {
    sm: 'text-xs sm:text-sm',
    md: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
    xl: 'text-lg sm:text-xl',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-2 sm:space-y-3 ${className}`}
      role="status"
      aria-label={text}
    >
      {/* Spinner dengan animasi rotate */}
      <div
        className={`
          ${sizeClasses[size]}
          ${colorClasses[color]}
          border-2 border-t-transparent border-r-transparent
          rounded-full animate-spin
        `}
        aria-hidden="true"
      />
      
      {/* Teks loading - responsif dan opsional */}
      {showText && (
        <p
          className={`
            ${textSizeClasses[size]}
            text-slate-600 font-medium text-center
            animate-pulse
          `}
        >
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * Komponen LoadingSpinner inline untuk digunakan dalam button atau elemen kecil
 */
export function InlineLoadingSpinner({
  size = 'sm',
  color = 'primary',
  className = '',
}: Pick<LoadingSpinnerProps, 'size' | 'color' | 'className'>) {
  const sizeClasses = {
    sm: 'w-3 h-3 sm:w-4 sm:h-4',
    md: 'w-4 h-4 sm:w-5 sm:h-5',
    lg: 'w-5 h-5 sm:w-6 sm:h-6',
    xl: 'w-6 h-6 sm:w-7 sm:h-7',
  };

  const colorClasses = {
    primary: 'border-blue-500',
    success: 'border-emerald-500',
    error: 'border-red-500',
    warning: 'border-amber-500',
    muted: 'border-slate-500',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${colorClasses[color]}
        ${className}
        border-2 border-t-transparent border-r-transparent
        rounded-full animate-spin inline-block
      `}
      role="status"
      aria-label="Loading"
      aria-hidden="true"
    />
  );
}

/**
 * Komponen LoadingSpinner untuk overlay fullscreen
 */
export function FullscreenLoadingSpinner({
  text = 'Memuat aplikasi...',
  className = '',
}: Pick<LoadingSpinnerProps, 'text' | 'className'>) {
  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-white/80 backdrop-blur-sm
        ${className}
      `}
      role="status"
      aria-label={text}
    >
      <LoadingSpinner
        size="lg"
        color="primary"
        text={text}
        showText={true}
        className="p-6 sm:p-8 bg-white rounded-lg shadow-lg border border-slate-200"
      />
    </div>
  );
}