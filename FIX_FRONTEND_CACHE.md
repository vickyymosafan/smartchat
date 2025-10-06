# Fix Frontend Cache Issue

## Masalah
Backend API sudah berfungsi dengan baik, tapi frontend masih menampilkan mock message "Terima kasih atas pesan Anda. Fitur ini akan segera diimplementasikan dengan integrasi n8n webhook."

## Solusi

### 1. Clear Browser Cache
**Chrome/Edge:**
1. Tekan `Ctrl + Shift + I` (buka DevTools)
2. Klik kanan pada tombol refresh
3. Pilih "Empty Cache and Hard Reload"

**Firefox:**
1. Tekan `Ctrl + Shift + R` (Hard Reload)

### 2. Clear Application Storage
1. Buka DevTools (`F12`)
2. Tab "Application" (Chrome) atau "Storage" (Firefox)
3. Klik "Clear Storage" atau "Clear All"
4. Refresh halaman

### 3. Disable Service Worker (Sementara)
1. Buka DevTools
2. Tab "Application" > "Service Workers"
3. Klik "Unregister" jika ada service worker
4. Refresh halaman

### 4. Restart Development Server
```bash
# Stop server (Ctrl+C di terminal)
# Kemudian jalankan lagi:
npm run dev
```

### 5. Test dengan Incognito/Private Mode
Buka aplikasi di mode incognito untuk memastikan tidak ada cache.

### 6. Manual Test API
Buka browser console dan jalankan:
```javascript
fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Test dari console', sessionId: 'test-123' })
})
.then(r => r.json())
.then(console.log)
```

## Verifikasi
Setelah melakukan langkah di atas, coba kirim pesan di chat interface. Seharusnya akan mendapat response dari n8n seperti "Halo juga! Ada yang bisa saya bantu?"

## Jika Masih Bermasalah
1. Check Network tab di DevTools untuk melihat request/response
2. Check Console tab untuk error JavaScript
3. Pastikan tidak ada error di terminal development server