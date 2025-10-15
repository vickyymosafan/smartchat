import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate unique message ID
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Map error to Indonesian message
 */
export function mapErrorToIndonesian(error: any): string {
  const message = error?.message || '';
  
  if (message.includes('fetch') || message.includes('network')) {
    return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
  }
  if (message.includes('not authenticated')) {
    return 'Sesi Anda telah berakhir. Silakan login kembali.';
  }
  if (message.includes('Unauthorized')) {
    return 'Anda tidak memiliki akses.';
  }
  if (message.includes('Invalid login credentials') || message.includes('Invalid')) {
    return 'Email atau password salah.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Email belum diverifikasi. Silakan cek email Anda.';
  }
  if (message.includes('User already registered')) {
    return 'Email sudah terdaftar. Silakan login.';
  }
  if (message.includes('Invalid email')) {
    return 'Format email tidak valid.';
  }
  if (message.includes('Password')) {
    return 'Password harus minimal 6 karakter.';
  }
  
  return message || 'Terjadi kesalahan yang tidak diketahui.';
}

/**
 * Format Unix timestamp to time only (HH:MM)
 */
export function formatTimeOnly(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format Unix timestamp to full date and time
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return formatTimeOnly(timestamp);
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isYesterday) {
    return `Kemarin ${formatTimeOnly(timestamp)}`;
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year} ${formatTimeOnly(timestamp)}`;
}

/**
 * Validate message content
 */
export function validateMessage(content: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = content.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Pesan tidak boleh kosong' };
  }

  if (content.length > 5000) {
    return {
      isValid: false,
      error: 'Pesan terlalu panjang (maksimal 5000 karakter)',
    };
  }

  return { isValid: true };
}

/**
 * Sanitize message content
 */
export function sanitizeMessage(content: string): string {
  return content.trim().slice(0, 10000);
}
