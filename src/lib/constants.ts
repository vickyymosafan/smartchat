/**
 * Application constants
 * Centralized location for mock data and configuration
 */

import type { ChatItem } from '@/components/chat/SidePanel';

/**
 * Mock chat history data untuk demo purposes
 * TODO: Replace with real data from API/database
 */
export const MOCK_CHAT_HISTORY: ChatItem[] = [
  {
    id: '1',
    title: 'Cara membuat aplikasi React',
    preview: 'Saya ingin belajar membuat aplikasi React dari awal. Bisa bantu?',
    timestamp: Date.now() - 3600000, // 1 hour ago
    unreadCount: 2,
    isPinned: true,
  },
  {
    id: '2',
    title: 'Pertanyaan tentang TypeScript',
    preview: 'Bagaimana cara menggunakan generics di TypeScript?',
    timestamp: Date.now() - 7200000, // 2 hours ago
    isPinned: true,
  },
  {
    id: '3',
    title: 'Setup Tailwind CSS',
    preview: 'Langkah-langkah setup Tailwind CSS di Next.js',
    timestamp: Date.now() - 86400000, // 1 day ago
  },
  {
    id: '4',
    title: 'Optimasi performa web',
    preview: 'Tips untuk meningkatkan performa website',
    timestamp: Date.now() - 172800000, // 2 days ago
    unreadCount: 1,
  },
  {
    id: '5',
    title: 'Belajar API REST',
    preview: 'Penjelasan tentang RESTful API dan best practices',
    timestamp: Date.now() - 259200000, // 3 days ago
  },
];

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  MAX_MESSAGE_LENGTH: 5000,
  TYPING_INDICATOR_DELAY: 300,
  AUTO_SCROLL_THRESHOLD: 150,
  DEBOUNCE_DELAY: 150,
  STORAGE_VERSION: 1,
} as const;
