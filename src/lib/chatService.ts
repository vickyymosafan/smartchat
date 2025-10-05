// Interface untuk request chat
interface ChatRequest {
  message: string;
  sessionId?: string;
}

// Interface untuk response dari API
interface ChatResponse {
  success: boolean;
  message?: string;
  data?: {
    response: string;
    timestamp: string;
    sessionId?: string;
  };
  error?: string;
  code?: string;
}

// Interface untuk error yang dilempar oleh service
export interface ChatServiceError {
  message: string;
  code: string;
  originalError?: any;
}

// Konfigurasi retry
interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // dalam milliseconds
  maxDelay: number;
  backoffMultiplier: number;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 detik
  maxDelay: 10000, // 10 detik
  backoffMultiplier: 2
};

// Timeout untuk request (30 detik)
const REQUEST_TIMEOUT = 30000;

class ChatService {
  private retryConfig: RetryConfig;
  private baseUrl: string;

  constructor(retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG) {
    this.retryConfig = retryConfig;
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  }

  /**
   * Fungsi untuk menunggu dengan delay
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Hitung delay untuk retry dengan exponential backoff
   */
  private calculateRetryDelay(attempt: number): number {
    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  /**
   * Mapping error code ke pesan bahasa Indonesia
   */
  private mapErrorToIndonesian(code: string, originalMessage?: string): string {
    const errorMap: Record<string, string> = {
      'NETWORK_ERROR': 'Koneksi internet bermasalah. Silakan coba lagi.',
      'TIMEOUT_ERROR': 'Permintaan timeout. Silakan coba lagi.',
      'VALIDATION_ERROR': 'Pesan tidak valid. Silakan periksa input Anda.',
      'SERVER_ERROR': 'Terjadi kesalahan server. Silakan coba lagi nanti.',
      'CLIENT_ERROR': 'Permintaan tidak valid. Silakan periksa input Anda.',
      'INVALID_JSON': 'Format data tidak valid.',
      'INVALID_RESPONSE': 'Response server tidak valid.',
      'METHOD_NOT_ALLOWED': 'Method tidak diizinkan.',
      'INTERNAL_ERROR': 'Terjadi kesalahan internal server.',
      'RATE_LIMIT_ERROR': 'Terlalu banyak permintaan. Silakan tunggu sebentar.',
      'UNAUTHORIZED': 'Akses tidak diizinkan.',
      'FORBIDDEN': 'Akses ditolak.',
      'NOT_FOUND': 'Endpoint tidak ditemukan.'
    };

    return errorMap[code] || originalMessage || 'Terjadi kesalahan yang tidak diketahui.';
  }

  /**
   * Fungsi untuk membuat request dengan timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('TIMEOUT_ERROR');
      }
      
      // Network error atau connection error
      if (error instanceof TypeError || error.message.includes('fetch')) {
        throw new Error('NETWORK_ERROR');
      }
      
      throw error;
    }
  }

  /**
   * Fungsi untuk melakukan single API call
   */
  private async makeApiCall(request: ChatRequest): Promise<ChatResponse> {
    const url = `${this.baseUrl}/api/chat`;
    
    try {
      const response = await this.fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(request),
        },
        REQUEST_TIMEOUT
      );

      // Parse response
      let data: ChatResponse;
      try {
        data = await response.json();
      } catch (error) {
        throw new Error('INVALID_RESPONSE');
      }

      // Jika response tidak OK, lempar error dengan code dari response
      if (!response.ok) {
        const errorCode = data.code || `HTTP_${response.status}`;
        const error = new Error(errorCode) as any;
        error.response = data;
        error.status = response.status;
        throw error;
      }

      return data;

    } catch (error: any) {
      // Re-throw error dengan informasi tambahan
      const errorCode = error.message || 'UNKNOWN_ERROR';
      const serviceError = new Error(errorCode) as any;
      serviceError.originalError = error;
      serviceError.response = error.response;
      serviceError.status = error.status;
      throw serviceError;
    }
  }

  /**
   * Fungsi utama untuk mengirim pesan dengan retry logic
   */
  async sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    const request: ChatRequest = {
      message: message.trim(),
      sessionId
    };

    let lastError: any;

    // Coba request dengan retry logic
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await this.makeApiCall(request);
        return response;
      } catch (error: any) {
        lastError = error;
        
        // Jangan retry untuk error client (4xx) kecuali 408 (timeout) dan 429 (rate limit)
        const status = error.status;
        if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
          break;
        }

        // Jika ini adalah attempt terakhir, jangan delay
        if (attempt === this.retryConfig.maxRetries) {
          break;
        }

        // Hitung delay untuk retry berikutnya
        const delay = this.calculateRetryDelay(attempt);
        console.log(`Chat API attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        
        await this.delay(delay);
      }
    }

    // Jika semua retry gagal, lempar error dengan pesan bahasa Indonesia
    const errorCode = lastError?.message || lastError?.response?.code || 'UNKNOWN_ERROR';
    const errorMessage = this.mapErrorToIndonesian(
      errorCode, 
      lastError?.response?.error || lastError?.message
    );

    const serviceError: ChatServiceError = {
      message: errorMessage,
      code: errorCode,
      originalError: lastError
    };

    throw serviceError;
  }

  /**
   * Fungsi untuk mengecek status koneksi
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/api/chat`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        },
        5000 // 5 detik timeout untuk health check
      );
      
      // Expect 405 Method Not Allowed, yang berarti endpoint ada
      return response.status === 405;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update konfigurasi retry
   */
  updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
  }

  /**
   * Get konfigurasi retry saat ini
   */
  getRetryConfig(): RetryConfig {
    return { ...this.retryConfig };
  }
}

// Export singleton instance
export const chatService = new ChatService();

// Export class untuk testing atau custom instances
export default ChatService;