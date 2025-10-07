# Panduan Deployment - Aplikasi Chat Dinamis

Dokumen ini menjelaskan langkah-langkah untuk deploy aplikasi chat dinamis ke Vercel.

## Prasyarat

- Akun Vercel (gratis di [vercel.com](https://vercel.com))
- Repository Git (GitHub, GitLab, atau Bitbucket)
- Node.js 18+ terinstall di local

## Langkah 1: Persiapan Repository

### 1.1 Push Kode ke Git Repository

```bash
git add .
git commit -m "Siap untuk deployment"
git push origin main
```

### 1.2 Pastikan File Penting Ada

Pastikan file-file berikut ada di repository:
- `next.config.ts` - Konfigurasi Next.js
- `vercel.json` - Konfigurasi Vercel
- `.env.production.example` - Template environment variables
- `package.json` - Dependencies
- `public/manifest.json` - PWA manifest
- `public/sw.js` - Service worker

## Langkah 2: Setup Vercel Project

### 2.1 Import Project ke Vercel

1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik tombol **"Add New..."** → **"Project"**
3. Pilih Git provider Anda (GitHub/GitLab/Bitbucket)
4. Pilih repository aplikasi chat dinamis
5. Klik **"Import"**

### 2.2 Konfigurasi Project Settings

Vercel akan otomatis mendeteksi Next.js. Pastikan settings berikut:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (root)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)
- **Node.js Version**: 18.x atau lebih tinggi

## Langkah 3: Setup Environment Variables

### 3.1 Tambahkan Environment Variables di Vercel

Di Vercel Dashboard, buka tab **"Settings"** → **"Environment Variables"**

Tambahkan variables berikut:

#### Production Environment

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production |
| `NEXT_PUBLIC_N8N_WEBHOOK_URL` | `https://vickymosafan2.app.n8n.cloud/webhook/d49a228d-703d-4a93-8e7a-ed173500fc6e/chat` | Production |
| `NEXT_PUBLIC_ENABLE_PWA` | `true` | Production |
| `NODE_ENV` | `production` | Production |

#### Preview Environment (Optional)

Untuk deployment preview/staging, tambahkan variables yang sama dengan environment **"Preview"**.

### 3.2 Cara Menambahkan Environment Variables

1. Klik **"Add New"** di bagian Environment Variables
2. Masukkan **Key** (nama variable)
3. Masukkan **Value** (nilai variable)
4. Pilih **Environment**: Production, Preview, atau Development
5. Klik **"Save"**

**Catatan Penting:**
- Ganti `https://your-app.vercel.app` dengan domain Vercel Anda yang sebenarnya
- Jangan commit file `.env.local` atau `.env.production` ke Git
- Gunakan `.env.production.example` sebagai referensi

## Langkah 4: Deploy Aplikasi

### 4.1 Deploy Pertama Kali

1. Setelah setup environment variables, klik **"Deploy"**
2. Vercel akan mulai build dan deploy aplikasi
3. Proses biasanya memakan waktu 2-5 menit
4. Setelah selesai, Anda akan mendapat URL deployment

### 4.2 Verifikasi Deployment

Setelah deployment selesai:

1. Klik URL deployment untuk membuka aplikasi
2. Test fitur-fitur utama:
   - ✅ Kirim pesan
   - ✅ Terima response dari n8n
   - ✅ PWA install prompt muncul
   - ✅ Offline mode berfungsi
   - ✅ Responsive di mobile dan desktop

### 4.3 Check Build Logs

Jika ada error, check build logs:
1. Buka tab **"Deployments"**
2. Klik deployment yang gagal
3. Lihat **"Build Logs"** untuk detail error

## Langkah 5: Setup Custom Domain (Optional)

### 5.1 Tambah Custom Domain

1. Buka tab **"Settings"** → **"Domains"**
2. Klik **"Add"**
3. Masukkan domain Anda (contoh: `chat.example.com`)
4. Ikuti instruksi untuk setup DNS

### 5.2 Konfigurasi DNS

Tambahkan record berikut di DNS provider Anda:

**Untuk subdomain (chat.example.com):**
```
Type: CNAME
Name: chat
Value: cname.vercel-dns.com
```

**Untuk root domain (example.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

### 5.3 SSL Certificate

Vercel otomatis menyediakan SSL certificate gratis dari Let's Encrypt. Tunggu beberapa menit hingga SSL aktif.

### 5.4 Update Environment Variables

Setelah custom domain aktif, update `NEXT_PUBLIC_APP_URL`:

```
NEXT_PUBLIC_APP_URL=https://chat.example.com
```

Kemudian redeploy aplikasi.

## Langkah 6: Automatic Deployments

### 6.1 Setup Git Integration

Vercel otomatis deploy setiap kali ada push ke repository:

- **Production Branch** (main/master): Deploy ke production
- **Other Branches**: Deploy ke preview URL

### 6.2 Deployment Workflow

```
git push origin main
  ↓
Vercel deteksi push
  ↓
Build & Deploy otomatis
  ↓
Deployment selesai
  ↓
Notifikasi via email/Slack
```

### 6.3 Preview Deployments

Setiap pull request otomatis mendapat preview URL untuk testing sebelum merge.

## Langkah 7: Monitoring dan Maintenance

### 7.1 Analytics

Aktifkan Vercel Analytics:
1. Buka tab **"Analytics"**
2. Klik **"Enable Analytics"**
3. Install package: `npm install @vercel/analytics`
4. Tambahkan di `app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 7.2 Speed Insights

Aktifkan Speed Insights untuk monitoring performa:
1. Buka tab **"Speed Insights"**
2. Klik **"Enable Speed Insights"**
3. Install package: `npm install @vercel/speed-insights`

### 7.3 Monitoring Logs

Check logs real-time:
1. Buka tab **"Logs"**
2. Filter by function atau time range
3. Monitor errors dan performance issues

## Troubleshooting

### Build Gagal

**Error: Module not found**
```bash
# Solution: Install missing dependencies
npm install
npm run build  # Test locally
```

**Error: Environment variable not defined**
```bash
# Solution: Check environment variables di Vercel dashboard
# Pastikan semua NEXT_PUBLIC_* variables sudah ditambahkan
```

### PWA Tidak Berfungsi

**Service Worker tidak register**
- Check `public/sw.js` ada di repository
- Check browser console untuk error
- Pastikan HTTPS aktif (required untuk PWA)

**Install prompt tidak muncul**
- PWA hanya berfungsi di HTTPS
- Check `public/manifest.json` valid
- Test di Chrome DevTools → Application → Manifest

### API Error

**n8n webhook tidak response**
- Check `NEXT_PUBLIC_N8N_WEBHOOK_URL` benar
- Test webhook URL langsung dengan curl:
```bash
curl -X POST https://vickymosafan2.app.n8n.cloud/webhook/d49a228d-703d-4a93-8e7a-ed173500fc6e/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

### Performance Issues

**Slow loading**
- Check bundle size: `ANALYZE=true npm run build`
- Optimize images dengan Next.js Image
- Enable caching di service worker

## Rollback Deployment

Jika deployment bermasalah:

1. Buka tab **"Deployments"**
2. Pilih deployment sebelumnya yang stabil
3. Klik **"..."** → **"Promote to Production"**
4. Deployment akan rollback ke versi sebelumnya

## Best Practices

### Security

- ✅ Jangan commit `.env.local` atau `.env.production`
- ✅ Gunakan environment variables untuk sensitive data
- ✅ Enable security headers (sudah dikonfigurasi di `next.config.ts`)
- ✅ Regular update dependencies: `npm audit fix`

### Performance

- ✅ Enable bundle analyzer: `ANALYZE=true npm run build`
- ✅ Monitor bundle size (target: < 200KB first load)
- ✅ Use dynamic imports untuk code splitting
- ✅ Optimize images dan fonts

### Monitoring

- ✅ Setup Vercel Analytics
- ✅ Monitor error logs regularly
- ✅ Check performance metrics
- ✅ Setup alerts untuk downtime

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PWA Best Practices](https://web.dev/pwa/)
- [n8n Webhook Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)

## Support

Jika mengalami masalah:
1. Check [Vercel Status](https://www.vercel-status.com/)
2. Baca [Vercel Community](https://github.com/vercel/vercel/discussions)
3. Contact Vercel Support (untuk Pro plan)

---

**Selamat! Aplikasi chat dinamis Anda sudah live di production! 🎉**
