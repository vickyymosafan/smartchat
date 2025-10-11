import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
