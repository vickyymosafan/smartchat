# Dokumentasi API - Aplikasi Chat Dinamis

Dokumen ini menjelaskan API endpoints yang tersedia di aplikasi chat dinamis.

## Daftar Isi

- [Overview](#overview)
- [API Endpoints](#api-endpoints)
- [Request/Response Format](#requestresponse-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Testing API](#testing-api)

## Overview

Aplikasi chat dinamis menggunakan Next.js API Routes untuk berkomunikasi dengan n8n webhook. Semua API endpoints berada di direktori `/api`.

### Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-app.vercel.app/api`

### Authentication

Saat ini aplikasi tidak menggunakan authentication. Semua endpoints bersifat public.

## API Endpoints

### POST /api/chat

Endpoint utama untuk mengirim pesan chat dan menerima response dari n8n webhook.

#### Request

**URL**: `/api/chat`

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "message": "Halo, apa kabar?",
  "sessionId": "optional-session-id",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "platform": "web"
  }
}
```

**Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | ✅ Yes | Pesan yang akan dikirim (max 1000 karakter) |
| `sessionId` | string | ❌ No | ID sesi untuk tracking conversation |
| `metadata` | object | ❌ No | Metadata tambahan (userAgent, platform, dll) |

#### Response

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "response": "Halo! Saya baik, terima kasih. Ada yang bisa saya bantu?",
    "timestamp": "2025-10-07T10:30:00.000Z",
    "messageId": "msg_abc123"
  }
}
```

**Error Response** (400 Bad Request):

```json
{
  "success": false,
  "error": "Pesan tidak boleh kosong",
  "code": "VALIDATION_ERROR",
  "timestamp": "2025-10-07T10:30:00.000Z"
}
```

**Error Response** (500 Internal Server Error):

```json
{
  "success": false,
  "error": "Terjadi kesalahan server. Silakan coba lagi nanti.",
  "code": "SERVER_ERROR",
  "timestamp": "2025-10-07T10:30:00.000Z"
}
```

**Error Response** (504 Gateway Timeout):

```json
{
  "success": false,
  "error": "Permintaan timeout. Silakan coba lagi.",
  "code": "TIMEOUT_ERROR",
  "timestamp": "2025-10-07T10:30:00.000Z"
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 200 | Request berhasil |
| 400 | Bad request (validasi gagal) |
| 405 | Method not allowed (hanya POST yang diizinkan) |
| 429 | Too many requests (rate limit exceeded) |
| 500 | Internal server error |
| 504 | Gateway timeout (n8n tidak response) |

#### Example Request

**cURL**:
```bash
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Halo, apa kabar?"
  }'
```

**JavaScript (Fetch)**:
```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Halo, apa kabar?'
  })
});

const data = await response.json();
console.log(data);
```

**JavaScript (Axios)**:
```javascript
import axios from 'axios';

const response = await axios.post('/api/chat', {
  message: 'Halo, apa kabar?'
});

console.log(response.data);
```

## Request/Response Format

### Request Validation

API melakukan validasi berikut pada request:

1. **Message tidak boleh kosong**
   ```json
   { "error": "Pesan tidak boleh kosong" }
   ```

2. **Message terlalu panjang** (> 1000 karakter)
   ```json
   { "error": "Pesan terlalu panjang (maksimal 1000 karakter)" }
   ```

3. **Invalid JSON**
   ```json
   { "error": "Format JSON tidak valid" }
   ```

4. **Method tidak diizinkan** (selain POST)
   ```json
   { "error": "Method tidak diizinkan. Gunakan POST." }
   ```

### Response Structure

Semua response mengikuti struktur standar:

**Success**:
```typescript
{
  success: true,
  data: {
    response: string,
    timestamp: string,
    messageId?: string
  }
}
```

**Error**:
```typescript
{
  success: false,
  error: string,
  code: string,
  timestamp: string,
  details?: string
}
```

## Error Handling

### Error Codes

| Code | Description | Action |
|------|-------------|--------|
| `VALIDATION_ERROR` | Input tidak valid | Periksa format request |
| `NETWORK_ERROR` | Koneksi bermasalah | Coba lagi atau check koneksi |
| `TIMEOUT_ERROR` | Request timeout | Coba lagi setelah beberapa saat |
| `SERVER_ERROR` | Error di server | Hubungi support jika berlanjut |
| `WEBHOOK_ERROR` | n8n webhook error | Check konfigurasi webhook |

### Retry Logic

API client sudah mengimplementasikan retry logic dengan exponential backoff:

- **Retry attempts**: 3 kali
- **Initial delay**: 1 detik
- **Max delay**: 10 detik
- **Backoff multiplier**: 2x

```javascript
// Contoh implementasi retry
async function sendMessageWithRetry(message, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      lastError = await response.json();
    } catch (error) {
      lastError = error;
      
      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, i), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
```

## Rate Limiting

### Limits

Saat ini tidak ada rate limiting yang diterapkan, namun disarankan untuk:

- **Max requests per user**: 60 requests/menit
- **Max concurrent requests**: 5 requests
- **Timeout per request**: 30 detik

### Best Practices

1. **Debounce user input** untuk menghindari spam requests
2. **Disable submit button** saat request sedang diproses
3. **Show loading state** untuk user feedback
4. **Handle errors gracefully** dengan retry logic

```javascript
// Contoh debounce
import { useState, useCallback } from 'react';

function useDebounce(callback, delay) {
  const [timeoutId, setTimeoutId] = useState(null);
  
  return useCallback((...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    
    const id = setTimeout(() => {
      callback(...args);
    }, delay);
    
    setTimeoutId(id);
  }, [callback, delay, timeoutId]);
}
```

## Testing API

### Manual Testing

**1. Test dengan cURL**:
```bash
# Test basic request
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'

# Test dengan metadata
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "test",
    "metadata": {
      "userAgent": "curl/7.68.0",
      "platform": "cli"
    }
  }'
```

**2. Test dengan Postman**:
- Method: POST
- URL: `http://localhost:3000/api/chat`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "message": "Halo, ini test dari Postman"
  }
  ```

**3. Test dengan Browser DevTools**:
```javascript
// Buka Console di DevTools
fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Test dari browser' })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Automated Testing

**Unit Test Example** (Jest):
```javascript
describe('POST /api/chat', () => {
  it('should return success response', async () => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'test' })
    });
    
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.response).toBeDefined();
  });
  
  it('should return error for empty message', async () => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' })
    });
    
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });
});
```

## n8n Webhook Integration

### Webhook Configuration

**Endpoint**: `https://vickymosafan2.app.n8n.cloud/webhook/d49a228d-703d-4a93-8e7a-ed173500fc6e/chat`

**Method**: POST

**Expected Request Format**:
```json
{
  "message": "string",
  "sessionId": "string (optional)",
  "metadata": {
    "userAgent": "string",
    "platform": "string"
  }
}
```

**Expected Response Format**:
```json
{
  "response": "string",
  "timestamp": "ISO 8601 string"
}
```

### Testing n8n Webhook

Test webhook langsung dengan cURL:

```bash
curl -X POST https://vickymosafan2.app.n8n.cloud/webhook/d49a228d-703d-4a93-8e7a-ed173500fc6e/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test dari curl"}'
```

### Troubleshooting Webhook

**Webhook tidak response**:
1. Check apakah n8n workflow aktif
2. Verify webhook URL benar
3. Check n8n execution logs
4. Test dengan curl langsung ke webhook

**Response format tidak sesuai**:
1. Check n8n workflow output format
2. Pastikan response memiliki field `response`
3. Verify timestamp format (ISO 8601)

## Environment Variables

API menggunakan environment variables berikut:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_N8N_WEBHOOK_URL` | URL n8n webhook | ✅ Yes |
| `NEXT_PUBLIC_API_TIMEOUT` | Timeout dalam ms (default: 30000) | ❌ No |

Lihat [.env.local.example](.env.local.example) untuk detail.

## Security Considerations

### Input Sanitization

API melakukan sanitization pada input:
- Trim whitespace
- Remove HTML tags
- Limit message length
- Validate JSON format

### CORS

API menggunakan Next.js default CORS policy:
- Same-origin requests: Allowed
- Cross-origin requests: Blocked (kecuali dikonfigurasi)

### Rate Limiting

Disarankan untuk implementasi rate limiting di production:

```javascript
// Contoh middleware rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 60, // max 60 requests per window
  message: 'Terlalu banyak request. Silakan coba lagi nanti.'
});
```

## Support

Jika mengalami masalah dengan API:

1. Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Verify environment variables
3. Check API logs di Vercel Dashboard
4. Test webhook langsung dengan curl
5. Open issue di repository

---

**Dokumentasi ini akan diupdate seiring perkembangan aplikasi.**
