# Backend Testing Guide

## 1. Start Development Server

Pertama, jalankan development server:

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## 2. Test Methods

### A. Menggunakan Test Script (Otomatis)

Jalankan test script yang sudah dibuat:

```bash
node test-backend.js
```

### B. Menggunakan curl (Manual)

#### Test 1: Valid Message
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Hello, ini test message\", \"sessionId\": \"test-123\"}"
```

#### Test 2: Empty Message (Should fail)
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"\", \"sessionId\": \"test-123\"}"
```

#### Test 3: Missing Message (Should fail)
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\": \"test-123\"}"
```

#### Test 4: GET Method (Should fail)
```bash
curl -X GET http://localhost:3000/api/chat
```

### C. Menggunakan Browser/Postman

1. Buka Postman atau browser dev tools
2. URL: `http://localhost:3000/api/chat`
3. Method: POST
4. Headers: `Content-Type: application/json`
5. Body (JSON):
```json
{
  "message": "Test message dari browser",
  "sessionId": "browser-test-123"
}
```

## 3. Expected Responses

### Success Response (200):
```json
{
  "success": true,
  "message": "Pesan berhasil dikirim",
  "data": {
    "response": "Response dari AI Assistant",
    "timestamp": "2025-01-06T...",
    "sessionId": "test-123",
    "metadata": {}
  }
}
```

### Validation Error (400):
```json
{
  "success": false,
  "error": "Pesan harus berupa string dan tidak boleh kosong",
  "code": "VALIDATION_ERROR"
}
```

### Method Not Allowed (405):
```json
{
  "success": false,
  "error": "Method GET tidak diizinkan. Gunakan POST.",
  "code": "METHOD_NOT_ALLOWED"
}
```

## 4. Environment Variables

Pastikan file `.env.local` memiliki:

```
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://vickymosafan2.app.n8n.cloud/webhook-test/phvIULu8Kd1RXjfz
```

## 5. Troubleshooting

### Server tidak bisa diakses:
- Pastikan `npm run dev` sudah dijalankan
- Check port 3000 tidak digunakan aplikasi lain
- Coba restart development server

### N8N Webhook Error:
- Check koneksi internet
- Verify webhook URL di environment variable
- Test webhook URL langsung di browser/Postman

### Timeout Error:
- Webhook n8n mungkin lambat respond
- Check network connection
- Coba dengan message yang lebih pendek