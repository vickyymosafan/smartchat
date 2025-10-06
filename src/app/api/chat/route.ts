import { NextRequest, NextResponse } from 'next/server';

// Interface untuk request body
interface ChatRequest {
  message: string;
  sessionId?: string;
}

// Interface untuk response dari n8n webhook
interface N8nWebhookResponse {
  success?: boolean;
  message?: string;
  output?: string; // Response dari RAG Agent
  response?: string; // Alternative response field
  data?: {
    response?: string;
    timestamp?: string;
  };
  error?: string;
  metadata?: any; // Additional metadata dari n8n
  [key: string]: any; // Allow additional properties dari n8n
}

// URL n8n webhook untuk RAG System V2 - Upload Doc workflow
// Menggunakan chat trigger yang sudah dikonfigurasi di n8n
const N8N_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ||
  'https://vickymosafan2.app.n8n.cloud/webhook/d49a228d-703d-4a93-8e7a-ed173500fc6e/chat';

// Timeout untuk request ke n8n (30 detik)
const REQUEST_TIMEOUT = 30000;

// Fungsi untuk validasi input
function validateChatRequest(body: any): { isValid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Body request tidak valid' };
  }

  if (!body.message || typeof body.message !== 'string') {
    return {
      isValid: false,
      error: 'Pesan harus berupa string dan tidak boleh kosong',
    };
  }

  if (body.message.trim().length === 0) {
    return { isValid: false, error: 'Pesan tidak boleh kosong' };
  }

  if (body.message.length > 1000) {
    return {
      isValid: false,
      error: 'Pesan terlalu panjang (maksimal 1000 karakter)',
    };
  }

  return { isValid: true };
}

// Fungsi untuk membuat request dengan timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: ChatRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Format JSON tidak valid',
          code: 'INVALID_JSON',
        },
        { status: 400 }
      );
    }

    // Validasi input
    const validation = validateChatRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Siapkan data untuk dikirim ke n8n webhook sesuai format yang diharapkan
    const webhookPayload = {
      action: 'sendMessage',
      sessionId: body.sessionId || `session_${Date.now()}`,
      chatInput: body.message.trim(),
      timestamp: new Date().toISOString(),
      metadata: {
        userAgent: request.headers.get('user-agent') || 'unknown',
        platform: 'web',
      },
    };

    // Kirim request ke n8n webhook
    let webhookResponse: Response;
    try {
      webhookResponse = await fetchWithTimeout(
        N8N_WEBHOOK_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        },
        REQUEST_TIMEOUT
      );
    } catch (error: any) {
      console.error('Error calling n8n webhook:', error);

      // Handle timeout error
      if (error.name === 'AbortError') {
        return NextResponse.json(
          {
            success: false,
            error: 'Permintaan timeout. Silakan coba lagi.',
            code: 'TIMEOUT_ERROR',
          },
          { status: 408 }
        );
      }

      // Handle network error
      return NextResponse.json(
        {
          success: false,
          error: 'Koneksi internet bermasalah. Silakan coba lagi.',
          code: 'NETWORK_ERROR',
        },
        { status: 503 }
      );
    }

    // Handle HTTP error responses
    if (!webhookResponse.ok) {
      console.error(
        `n8n webhook returned ${webhookResponse.status}: ${webhookResponse.statusText}`
      );

      let errorMessage = 'Terjadi kesalahan server. Silakan coba lagi nanti.';
      let errorCode = 'SERVER_ERROR';

      if (webhookResponse.status >= 400 && webhookResponse.status < 500) {
        errorMessage = 'Permintaan tidak valid. Silakan periksa input Anda.';
        errorCode = 'CLIENT_ERROR';
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          code: errorCode,
        },
        { status: webhookResponse.status }
      );
    }

    // Parse response dari n8n
    let n8nData: N8nWebhookResponse;
    try {
      n8nData = await webhookResponse.json();
    } catch (error) {
      console.error('Error parsing n8n response:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Response server tidak valid.',
          code: 'INVALID_RESPONSE',
        },
        { status: 502 }
      );
    }

    // Return successful response dengan data dari RAG Agent
    return NextResponse.json({
      success: true,
      message: 'Pesan berhasil dikirim',
      data: {
        response: n8nData.output || n8nData.response || n8nData.message || 'Response dari AI Assistant',
        timestamp: n8nData.data?.timestamp || new Date().toISOString(),
        sessionId: body.sessionId,
        // Tambahan metadata dari n8n jika ada
        metadata: n8nData.metadata || {},
      },
    });
  } catch (error: any) {
    console.error('Unexpected error in chat API:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi kesalahan internal server.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// Handle method not allowed
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method GET tidak diizinkan. Gunakan POST.',
      code: 'METHOD_NOT_ALLOWED',
    },
    { status: 405 }
  );
}
