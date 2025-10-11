/**
 * Type untuk role pesan
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Interface untuk pesan chat
 * Mendefinisikan struktur data untuk setiap pesan dalam aplikasi chat
 */
export interface Message {
  /** ID unik untuk setiap pesan */
  id: string;
  /** Role pesan: user (pengguna), assistant (AI), atau system (sistem) */
  role: MessageRole;
  /** Konten/isi pesan */
  content: string;
  /** Waktu pesan dibuat (Unix timestamp) */
  createdAt: number;
  /** Metadata tambahan untuk pesan */
  meta?: {
    /** Apakah pesan mengalami error */
    error?: boolean;
    /** Jumlah token yang digunakan */
    tokens?: number;
    /** Model AI yang digunakan */
    model?: string;
  };
}

/**
 * Interface untuk state management global chat
 * Mengelola seluruh state aplikasi chat
 */
export interface ChatState {
  /** Daftar semua pesan dalam chat */
  messages: Message[];
  /** Status loading saat mengirim atau menerima pesan */
  isLoading: boolean;
  /** Pesan error jika terjadi kesalahan */
  error: string | null;
  /** Status koneksi internet */
  isOnline: boolean;
}

/**
 * Type untuk tema aplikasi
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Interface untuk state tema
 */
export interface ThemeState {
  /** Tema yang dipilih user */
  theme: Theme;
  /** Tema yang benar-benar diterapkan (resolved dari system jika theme = 'system') */
  resolvedTheme: 'light' | 'dark';
  /** Function untuk mengubah tema */
  setTheme: (theme: Theme) => void;
}

/**
 * Interface untuk UI state yang dipersist
 */
export interface UIState {
  /** Status sidebar terbuka/tertutup */
  sidebarOpen: boolean;
  /** Draft input yang belum dikirim */
  inputDraft: string;
  /** ID pesan terakhir yang dibaca user */
  lastReadMessageId: string | null;
}

/**
 * Interface untuk request ke API chat
 * Struktur data yang dikirim ke webhook n8n
 */
export interface ChatRequest {
  /** Pesan yang dikirim pengguna */
  message: string;
  /** Timestamp pengiriman */
  timestamp: string;
  /** ID sesi chat (opsional) */
  sessionId?: string;
  /** Metadata tambahan */
  metadata?: {
    /** User agent browser */
    userAgent: string;
    /** Platform pengguna */
    platform: string;
  };
}

/**
 * Interface untuk response dari API chat
 * Struktur data yang diterima dari webhook n8n
 */
export interface ChatResponse {
  /** Status keberhasilan request */
  success: boolean;
  /** Pesan response (opsional) */
  message?: string;
  /** Data response dari AI */
  data?: {
    /** Response dari AI assistant */
    response: string;
    /** Timestamp response */
    timestamp: string;
  };
  /** Pesan error jika terjadi kesalahan */
  error?: string;
}

/**
 * Interface untuk response error dari API
 * Struktur data error yang konsisten
 */
export interface ErrorResponse {
  /** Pesan error */
  error: string;
  /** Kode error */
  code: string;
  /** Detail error tambahan */
  details?: string;
  /** Timestamp error */
  timestamp: string;
}

/**
 * Interface untuk props komponen ChatInterface
 */
export interface ChatInterfaceProps {
  /** Pesan awal (opsional) */
  initialMessages?: Message[];
  /** ID sesi chat (opsional) */
  sessionId?: string;
}

/**
 * Interface untuk props komponen ChatShell
 */
export interface ChatShellProps {
  /** Pesan awal (opsional) */
  initialMessages?: Message[];
  /** ID sesi chat (opsional) */
  sessionId?: string;
}

/**
 * Interface untuk props komponen TopBar
 */
export interface TopBarProps {
  /** Judul chat (opsional) */
  title?: string;
  /** Callback saat settings button diklik */
  onSettingsClick?: () => void;
  /** Apakah menampilkan sidebar toggle button */
  showSidebarToggle?: boolean;
  /** Callback saat sidebar toggle diklik */
  onSidebarToggle?: () => void;
}

/**
 * Interface untuk props komponen MessageList
 */
export interface MessageListProps {
  /** Daftar pesan yang akan ditampilkan */
  messages: Message[];
  /** Status loading */
  isLoading?: boolean;
  /** Callback saat regenerate message */
  onRegenerate?: (messageId: string) => void;
  /** Callback saat copy message */
  onCopy?: (content: string) => void;
  /** Callback saat reaction pada message */
  onReaction?: (messageId: string, reaction: string) => void;
  /** Callback saat retry failed message */
  onRetry?: (messageId: string) => void;
}

/**
 * Interface untuk props komponen MessageBubble
 */
export interface MessageBubbleProps {
  /** Data pesan */
  message: Message;
  /** Callback saat copy message */
  onCopy?: () => void;
  /** Callback saat regenerate message */
  onRegenerate?: () => void;
  /** Callback saat reaction pada message */
  onReaction?: (reaction: string) => void;
  /** Callback saat retry failed message */
  onRetry?: () => void;
}

/**
 * Interface untuk props komponen MessageInput
 */
export interface MessageInputProps {
  /** Callback saat mengirim pesan */
  onSendMessage: (message: string) => Promise<void>;
  /** Status loading */
  isLoading?: boolean;
  /** Placeholder text untuk textarea */
  placeholder?: string;
  /** Maksimal panjang karakter */
  maxLength?: number;
}

/**
 * Interface untuk props komponen Composer
 */
export interface ComposerProps {
  /** Callback saat mengirim pesan */
  onSend: (message: string) => Promise<void>;
  /** Status loading */
  isLoading?: boolean;
  /** Status koneksi internet */
  isOnline?: boolean;
  /** Placeholder text untuk textarea */
  placeholder?: string;
  /** Maksimal panjang karakter */
  maxLength?: number;
}

/**
 * Interface untuk props komponen EmptyState
 */
export interface EmptyStateProps {
  /** Callback saat suggestion chip diklik */
  onSuggestionClick?: (suggestion: string) => void;
  /** Daftar suggestion chips */
  suggestions?: string[];
}

/**
 * Interface untuk state Error Boundary
 */
export interface ErrorBoundaryState {
  /** Apakah terjadi error */
  hasError: boolean;
  /** Object error yang terjadi */
  error: Error | null;
}

/**
 * Type untuk status koneksi
 */
export type ConnectionStatus = 'online' | 'offline' | 'connecting';

/**
 * Interface untuk konfigurasi aplikasi
 */
export interface AppConfig {
  /** URL endpoint API */
  apiEndpoint: string;
  /** Timeout untuk request API (dalam milidetik) */
  requestTimeout: number;
  /** Jumlah maksimal retry untuk request yang gagal */
  maxRetries: number;
  /** Tema aplikasi */
  theme: Theme;
}
