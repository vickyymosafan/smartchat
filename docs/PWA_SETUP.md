# Progressive Web App (PWA) Setup

Aplikasi Chat Dinamis telah dikonfigurasi sebagai Progressive Web App (PWA) dengan dukungan offline dan installable.

## Fitur PWA

### ✅ Sudah Diimplementasikan

1. **Web App Manifest** (`/public/manifest.json`)
   - Konfigurasi nama aplikasi, ikon, dan tema
   - Dukungan berbagai ukuran ikon (72x72 hingga 512x512)
   - Mode standalone untuk pengalaman seperti aplikasi native

2. **Service Worker** (`/public/sw.js`)
   - Caching strategy untuk offline support
   - Background sync untuk pesan offline
   - Cache First untuk static assets
   - Network First untuk API requests

3. **Install Prompt** (`PWAInstallPrompt` component)
   - Auto-detect dukungan PWA di browser
   - Instruksi khusus untuk iOS
   - Prompt install untuk Android/Chrome

4. **Offline Support**
   - Indikator status online/offline
   - Penyimpanan pesan offline
   - Background sync saat kembali online

## Cara Menggunakan

### Install sebagai PWA

#### Android/Chrome:
1. Buka aplikasi di browser Chrome
2. Tunggu prompt install muncul (atau klik tombol install)
3. Tap "Install" untuk menambahkan ke home screen

#### iOS Safari:
1. Buka aplikasi di Safari
2. Tap tombol Share (📤)
3. Pilih "Add to Home Screen"
4. Tap "Add" untuk konfirmasi

### Fitur Offline

1. **Automatic Caching**: Static assets dan halaman utama di-cache otomatis
2. **Offline Messages**: Pesan disimpan saat offline dan dikirim saat online
3. **Background Sync**: Sinkronisasi otomatis saat koneksi kembali

## Konfigurasi Development

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_ENABLE_PWA=true
```

### Testing PWA

1. **Build Production**:
   ```bash
   npm run build
   npm start
   ```

2. **Test dengan Chrome DevTools**:
   - Buka DevTools → Application → Service Workers
   - Cek Manifest di Application → Manifest
   - Test offline di Network → Offline

3. **Lighthouse Audit**:
   - Buka DevTools → Lighthouse
   - Run PWA audit untuk cek compliance

## File Structure

```
public/
├── manifest.json           # PWA manifest
├── sw.js                  # Service worker
├── browserconfig.xml      # Windows tiles config
├── robots.txt            # SEO robots
├── sitemap.xml           # SEO sitemap
└── icons/                # PWA icons
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    ├── icon-512x512.png
    ├── apple-touch-icon.png
    └── chat-icon.svg

src/
├── components/
│   ├── PWAProvider.tsx        # PWA context provider
│   └── PWAInstallPrompt.tsx   # Install prompt component
└── lib/
    └── serviceWorker.ts       # Service worker utilities
```

## Customization

### Update Icons

1. Replace placeholder icons di `/public/icons/`
2. Gunakan tool seperti [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
3. Update `manifest.json` jika perlu ukuran berbeda

### Modify Caching Strategy

Edit `/public/sw.js`:

```javascript
// Ubah cache name untuk force update
const CACHE_NAME = 'chat-app-v2';

// Tambah URL ke static assets
const STATIC_ASSETS = [
  '/',
  '/new-page',
  // ...
];
```

### Custom Install Prompt

```tsx
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

<PWAInstallPrompt 
  onInstall={() => {
    // Custom logic setelah install
    analytics.track('pwa_installed');
  }}
  onDismiss={() => {
    // Custom logic saat dismiss
    analytics.track('pwa_install_dismissed');
  }}
  className="custom-styling"
/>
```

## Troubleshooting

### Service Worker Tidak Terdaftar

1. Cek console untuk error
2. Pastikan HTTPS (required untuk SW)
3. Clear browser cache dan reload

### Install Prompt Tidak Muncul

1. Cek PWA criteria di Lighthouse
2. Pastikan manifest.json valid
3. Cek service worker aktif
4. Clear browser data dan coba lagi

### Offline Mode Tidak Bekerja

1. Cek service worker di DevTools
2. Verify caching strategy di Network tab
3. Test dengan throttling "Offline"

## Production Deployment

### Vercel

PWA sudah dikonfigurasi untuk Vercel:

```json
// vercel.json (optional)
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

### Environment Variables di Vercel

1. Buka Vercel Dashboard
2. Pilih project → Settings → Environment Variables
3. Tambahkan:
   - `NEXT_PUBLIC_ENABLE_PWA=true`

## Best Practices

1. **Update Strategy**: Gunakan versioning di cache names
2. **Icon Quality**: Gunakan high-quality icons untuk semua ukuran
3. **Testing**: Test di berbagai device dan browser
4. **Performance**: Monitor cache size dan cleanup old caches
5. **User Experience**: Provide clear feedback untuk offline state

## Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Workbox](https://developers.google.com/web/tools/workbox) (untuk advanced caching)