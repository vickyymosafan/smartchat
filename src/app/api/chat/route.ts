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
  'https://vickymosafan3.app.n8n.cloud/webhook/904d9596-4432-43f9-9bc3-00cf93055d63/chat';

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

      return NextResponse.json(
        {
          success: false,
          error: 'Koneksi internet bermasalah. Silakan coba lagi.',
          code: 'NETWORK_ERROR',
        },
        { status: 503 }
      );
    }

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

    const fullResponse =
      n8nData.output ||
      n8nData.response ||
      n8nData.message ||
      'Response dari AI Assistant';

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = fullResponse.split(' ');

        for (let i = 0; i < words.length; i++) {
          const chunk = i === 0 ? words[i] : ' ' + words[i];
          const data = JSON.stringify({ content: chunk, done: false }) + '\n';
          controller.enqueue(encoder.encode(data));

          await new Promise(resolve => setTimeout(resolve, 10));
        }

        const doneData = JSON.stringify({
          content: '',
          done: true,
          metadata: {
            timestamp: n8nData.data?.timestamp || new Date().toISOString(),
            sessionId: body.sessionId,
          }
        }) + '\n';
        controller.enqueue(encoder.encode(doneData));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
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
