/**
 * Date and time utilities untuk formatting dan grouping messages
 */

import { Message } from '@/types/chat';

/**
 * Format Unix timestamp to time only (HH:MM)
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted time string (e.g., "14:30")
 */
export function formatTimeOnly(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format timestamp menjadi readable date string
 *
 * @param timestamp - Unix timestamp dalam milidetik
 * @returns Formatted date string (e.g., "Hari ini", "Kemarin", "12 Jan 2024")
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time untuk comparison
  const dateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const yesterdayOnly = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate()
  );

  // Check if today
  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Hari ini';
  }

  // Check if yesterday
  if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Kemarin';
  }

  // Format untuk tanggal lain
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  };

  return date.toLocaleDateString('id-ID', options);
}

/**
 * Format Unix timestamp to full date and time
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date and time string
 */
export function formatFullTimestamp(timestamp: number): string {
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

  // Format: DD/MM/YYYY HH:MM
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year} ${formatTimeOnly(timestamp)}`;
}

/**
 * Format Unix timestamp to relative time (e.g., "2 minutes ago")
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'Baru saja';
  }

  if (minutes < 60) {
    return `${minutes} menit yang lalu`;
  }

  if (hours < 24) {
    return `${hours} jam yang lalu`;
  }

  if (days < 7) {
    return `${days} hari yang lalu`;
  }

  return formatFullTimestamp(timestamp);
}

/**
 * Group messages by date
 *
 * @param messages - Array of messages to group
 * @returns Array of grouped messages dengan date separators
 */
export interface MessageGroup {
  type: 'separator' | 'message';
  date?: string;
  message?: Message;
  id: string;
}

export function groupMessagesByDate(messages: Message[]): MessageGroup[] {
  if (messages.length === 0) return [];

  const grouped: MessageGroup[] = [];
  let currentDate: string | null = null;

  messages.forEach(message => {
    const messageDate = new Date(message.createdAt).toDateString();

    // Add date separator jika tanggal berbeda
    if (messageDate !== currentDate) {
      currentDate = messageDate;
      grouped.push({
        type: 'separator',
        date: formatTimestamp(message.createdAt),
        id: `separator-${messageDate}`,
      });
    }

    // Add message
    grouped.push({
      type: 'message',
      message,
      id: message.id,
    });
  });

  return grouped;
}
