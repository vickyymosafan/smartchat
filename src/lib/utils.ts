/**
 * Utility functions dan helpers untuk aplikasi chat
 * Berisi fungsi-fungsi bantuan yang digunakan di seluruh aplikasi
 */

/**
 * Menghasilkan ID unik untuk pesan
 * Menggunakan timestamp dan random string untuk memastikan keunikan
 * @returns String ID unik
 */
export function generateMessageId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `msg_${timestamp}_${randomStr}`;
}

/**
 * Memformat timestamp ke format bahasa Indonesia
 * @param date - Date object yang akan diformat
 * @param includeTime - Apakah menyertakan waktu (default: true)
 * @returns String tanggal dalam format Indonesia
 */
export function formatTimestamp(
  date: Date,
  includeTime: boolean = true
): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Jika kurang dari 1 menit
  if (diffInMinutes < 1) {
    return 'Baru saja';
  }

  // Jika kurang dari 1 jam
  if (diffInMinutes < 60) {
    return `${diffInMinutes} menit yang lalu`;
  }

  // Jika kurang dari 24 jam
  if (diffInHours < 24) {
    return `${diffInHours} jam yang lalu`;
  }

  // Jika kurang dari 7 hari
  if (diffInDays < 7) {
    return `${diffInDays} hari yang lalu`;
  }

  // Format lengkap untuk tanggal yang lebih lama
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  return date.toLocaleDateString('id-ID', options);
}

/**
 * Memformat timestamp untuk tampilan waktu saja
 * @param date - Date object yang akan diformat
 * @returns String waktu dalam format HH:MM
 */
export function formatTimeOnly(date: Date): string {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Validasi input pesan dari pengguna
 * @param message - String pesan yang akan divalidasi
 * @returns Object dengan status validasi dan pesan error
 */
export function validateMessage(message: string): {
  isValid: boolean;
  error?: string;
} {
  // Cek apakah pesan kosong atau hanya whitespace
  if (!message || message.trim().length === 0) {
    return {
      isValid: false,
      error: 'Pesan tidak boleh kosong',
    };
  }

  // Cek panjang minimum pesan
  if (message.trim().length < 1) {
    return {
      isValid: false,
      error: 'Pesan terlalu pendek',
    };
  }

  // Cek panjang maksimum pesan (5000 karakter)
  if (message.length > 5000) {
    return {
      isValid: false,
      error: 'Pesan terlalu panjang (maksimal 5000 karakter)',
    };
  }

  // Cek karakter yang tidak diizinkan (contoh: script tags)
  const forbiddenPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(message)) {
      return {
        isValid: false,
        error: 'Pesan mengandung konten yang tidak diizinkan',
      };
    }
  }

  return {
    isValid: true,
  };
}

/**
 * Membersihkan dan sanitasi input pesan
 * @param message - String pesan yang akan dibersihkan
 * @returns String pesan yang sudah dibersihkan
 */
export function sanitizeMessage(message: string): string {
  return message
    .trim()
    .replace(/\s+/g, ' ') // Ganti multiple spaces dengan single space
    .replace(/[\r\n]+/g, '\n') // Normalisasi line breaks
    .substring(0, 5000); // Potong jika terlalu panjang
}

/**
 * Menghasilkan session ID unik untuk chat
 * @returns String session ID
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 12);
  return `session_${timestamp}_${randomStr}`;
}

/**
 * Mendapatkan informasi platform pengguna
 * @returns String platform (mobile, tablet, desktop)
 */
export function getPlatform(): string {
  if (typeof window === 'undefined') return 'server';

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isMobile =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    );
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);

  if (isMobile && !isTablet) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}

/**
 * Mengecek apakah browser mendukung PWA
 * @returns Boolean apakah PWA didukung
 */
export function isPWASupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Mengecek status koneksi internet
 * @returns Boolean status online
 */
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Delay function untuk retry logic
 * @param ms - Jumlah milidetik untuk delay
 * @returns Promise yang resolve setelah delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Menghasilkan delay untuk exponential backoff
 * @param attempt - Nomor percobaan (mulai dari 0)
 * @param baseDelay - Base delay dalam milidetik (default: 1000)
 * @returns Jumlah milidetik untuk delay
 */
export function getExponentialBackoffDelay(
  attempt: number,
  baseDelay: number = 1000
): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 30000); // Max 30 detik
}

/**
 * Memformat ukuran file ke format yang mudah dibaca
 * @param bytes - Ukuran dalam bytes
 * @returns String ukuran file yang diformat
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Mengecek apakah string adalah URL yang valid
 * @param string - String yang akan dicek
 * @returns Boolean apakah string adalah URL valid
 */
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Memotong teks jika terlalu panjang dan menambahkan ellipsis
 * @param text - Teks yang akan dipotong
 * @param maxLength - Panjang maksimum (default: 100)
 * @returns String teks yang sudah dipotong
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}
