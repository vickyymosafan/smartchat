/**
 * Interface untuk pesan chat
 * Mendefinisikan struktur data untuk setiap pesan dalam aplikasi chat
 */
export interface Message {
  /** ID unik untuk setiap pesan */
  id: string;
  /** Konten/isi pesan */
  content: string;
  /** Waktu pesan dibuat */
  timestamp: Date;
  /** Tipe pesan: user (pengguna), assistant (AI), atau system (sistem) */
  type: 'user' | 'assistant' | 'system';
  /** Status pengiriman pesan */
  status: 'sending' | 'sent' | 'error';
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
}

/**
 * Interface untuk props komponen MessageList
 */
export interface MessageListProps {
  /** Daftar pesan yang akan ditampilkan */
  messages: Message[];
  /** Status loading */
  isLoading: boolean;
}

/**
 * Interface untuk props komponen MessageInput
 */
export interface MessageInputProps {
  /** Callback function saat mengirim pesan */
  onSendMessage: (message: string) => Promise<void>;
  /** Status loading */
  isLoading: boolean;
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
 * Type untuk tema aplikasi
 */
export type Theme = 'light' | 'dark' | 'system';

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
