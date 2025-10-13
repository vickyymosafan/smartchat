# SmartChat - Intelligent Conversations

SmartChat adalah platform chat cerdas dengan AI yang dibangun dengan Next.js 15, Tailwind CSS, dan dukungan Progressive Web App (PWA). Aplikasi ini terintegrasi dengan n8n webhook untuk pemrosesan pesan dan dapat berfungsi secara offline.

## ✨ Fitur Utama

- 💬 **Chat Interface Modern** - Antarmuka chat yang responsif dan user-friendly
- 📱 **Progressive Web App** - Install sebagai aplikasi native di perangkat
- 🔌 **Offline Support** - Tetap berfungsi tanpa koneksi internet
- 🎨 **Tailwind CSS** - Styling modern tanpa gradasi warna
- 🚀 **Next.js 15** - Framework React terbaru dengan App Router
- 🔗 **n8n Integration** - Terintegrasi dengan webhook n8n untuk AI responses
- 🌐 **Bahasa Indonesia** - Seluruh UI dan kode dalam bahasa Indonesia

## 🚀 Quick Start

### Prasyarat

- Node.js 18+
- npm atau yarn
- Git

### Instalasi

1. Clone repository:

```bash
git clone <repository-url>
cd aplikasi-chat-dinamis
```

2. Install dependencies:

```bash
npm install
```

3. Setup environment variables:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` dan sesuaikan dengan konfigurasi Anda.

4. Jalankan development server:

```bash
npm run dev
```

5. Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📦 Scripts

```bash
# Development
npm run dev          # Jalankan development server
npm run build        # Build untuk production
npm run start        # Jalankan production server
npm run lint         # Lint kode dengan ESLint

# Utilities
npm run analyze      # Analyze bundle size
```

## 🔧 Konfigurasi

### Environment Variables

Buat file `.env.local` dengan variables berikut:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_N8N_WEBHOOK_URL=
NEXT_PUBLIC_ENABLE_PWA=true
NODE_ENV=development
```

Lihat `.env.local.example` untuk daftar lengkap variables.

## 🏗️ Struktur Project

```
src/
├── app/                    # Next.js App Router
│   ├── api/chat/          # API endpoint untuk chat
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Halaman utama
├── components/            # React components
│   ├── ChatInterface.tsx  # Komponen utama chat
│   ├── MessageList.tsx    # Daftar pesan
│   ├── MessageInput.tsx   # Input form
│   └── ...
├── contexts/              # React contexts
├── hooks/                 # Custom hooks
├── lib/                   # Utilities dan services
└── types/                 # TypeScript types

public/
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
└── icons/                 # PWA icons
```

## 🌐 Deployment

### Deploy ke Vercel

Aplikasi ini sudah dikonfigurasi untuk deployment ke Vercel dan **READY FOR PRODUCTION**.

#### Quick Deploy (5 Minutes)

```bash
# 1. Run pre-deployment checks
npm run predeployment

# 2. Deploy to production
vercel --prod

# Or push to main branch (auto-deploy)
git push origin main
```

#### Comprehensive Documentation

**Essential Guides:**
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete step-by-step deployment guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Comprehensive pre/post-deployment checklist
- **[DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)** - Quick commands and tips
- **[DEPLOYMENT_DAY_CHECKLIST.md](./DEPLOYMENT_DAY_CHECKLIST.md)** - Day-of-deployment checklist
- **[PRODUCTION_READINESS_REPORT.md](./PRODUCTION_READINESS_REPORT.md)** - Full readiness assessment

**Legacy Guides:**
- [VERCEL_SETUP.md](./VERCEL_SETUP.md) - Quick reference environment variables

### Environment Variables untuk Production

Di Vercel Dashboard, tambahkan variables berikut:

```bash
# Required
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://vickymosafan2.app.n8n.cloud/webhook/...
NODE_ENV=production

# UI Configuration
NEXT_PUBLIC_ENABLE_NEW_UI=true

# PWA
NEXT_PUBLIC_ENABLE_PWA=true

# Performance
NEXT_PUBLIC_API_TIMEOUT=30000

# Security (MUST be false in production)
NEXT_PUBLIC_DEBUG=false
ANALYZE=false
```

### Production Readiness Status

✅ **READY FOR DEPLOYMENT**

- ✅ Build configuration optimized
- ✅ Security headers configured
- ✅ Performance optimized (132 KB First Load JS)
- ✅ Accessibility compliant (WCAG 2.1 AA)
- ✅ PWA functionality ready
- ✅ SEO metadata configured
- ✅ Comprehensive documentation complete

**Readiness Score: 95/100**

See [PRODUCTION_READINESS_REPORT.md](./PRODUCTION_READINESS_REPORT.md) for details.

## 🔒 Security

Aplikasi ini sudah dikonfigurasi dengan security headers:

- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- Dan lainnya

Lihat `next.config.ts` untuk detail konfigurasi security.

## 📱 Progressive Web App

### Install PWA

**Desktop (Chrome/Edge):**

1. Klik icon install di address bar
2. Atau: Menu → Install SmartChat

**Mobile (Android):**

1. Tap menu (⋮)
2. Tap "Add to Home screen"

**iOS:**

1. Tap Share button
2. Tap "Add to Home Screen"

### Offline Support

Aplikasi dapat berfungsi offline dengan fitur:

- Cache app shell dan static assets
- Queue pesan untuk dikirim saat online
- Indikator status koneksi

## 🧪 Testing

```bash
# Run tests (jika sudah dikonfigurasi)
npm run test

# Run tests dengan coverage
npm run test:coverage
```

## 📊 Performance

- ⚡ First Load JS: < 200KB
- 🎯 Lighthouse Score: 90+
- 📦 Optimized bundle dengan code splitting
- 🖼️ Image optimization dengan Next.js Image
- 💾 Efficient caching strategy

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **PWA:** Service Worker + Manifest
- **API Integration:** n8n Webhook
- **Deployment:** Vercel

## 📝 License

[MIT License](LICENSE)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## � Dokumentasi Lengkap

Untuk informasi lebih detail, lihat dokumentasi berikut:

### Panduan Utama

- **[Deployment Guide](./DEPLOYMENT.md)** - Panduan deployment ke Vercel
- **[Final Checklist](./FINAL_CHECKLIST.md)** - Checklist sebelum dan sesudah deployment
- **[Vercel Setup](./VERCEL_SETUP.md)** - Quick reference environment variables

### Dokumentasi Teknis

- **[API Documentation](./docs/API.md)** - Dokumentasi lengkap API endpoints dan integrasi n8n
- **[Maintenance Guide](./docs/MAINTENANCE.md)** - Panduan maintenance dan best practices
- **[Troubleshooting Guide](./docs/TROUBLESHOOTING.md)** - Solusi untuk masalah umum
- **[Testing Report](./docs/TESTING_REPORT.md)** - Laporan hasil testing dan quality assurance

## 📧 Support

Jika mengalami masalah atau ada pertanyaan:

1. Check [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) untuk solusi masalah umum
2. Review [API Documentation](./docs/API.md) untuk masalah API
3. Check [Maintenance Guide](./docs/MAINTENANCE.md) untuk panduan maintenance
4. Open an issue di repository
5. Contact support

## 🤝 Contributing

Contributions are welcome! Jika ingin berkontribusi:

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

Pastikan untuk:

- Follow code style (run `npm run lint`)
- Update documentation jika diperlukan
- Test thoroughly sebelum submit PR

---

**Dibuat dengan ❤️ menggunakan Next.js dan Tailwind CSS**
