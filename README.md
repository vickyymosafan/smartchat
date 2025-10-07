# Aplikasi Chat Dinamis

Aplikasi chat dinamis yang dibangun dengan Next.js 15, Tailwind CSS, dan dukungan Progressive Web App (PWA). Aplikasi ini terintegrasi dengan n8n webhook untuk pemrosesan pesan dan dapat berfungsi secara offline.

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
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://vickymosafan2.app.n8n.cloud/webhook/d49a228d-703d-4a93-8e7a-ed173500fc6e/chat
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

Aplikasi ini sudah dikonfigurasi untuk deployment ke Vercel.

#### Quick Deploy

1. Push kode ke Git repository (GitHub/GitLab/Bitbucket)
2. Import project ke [Vercel](https://vercel.com)
3. Setup environment variables di Vercel Dashboard
4. Deploy!

#### Panduan Lengkap

Lihat [DEPLOYMENT.md](./DEPLOYMENT.md) untuk panduan deployment lengkap, termasuk:
- Setup environment variables
- Custom domain configuration
- SSL setup
- Monitoring dan troubleshooting

#### Quick Reference

Lihat [VERCEL_SETUP.md](./VERCEL_SETUP.md) untuk quick reference setup environment variables.

### Environment Variables untuk Production

Di Vercel Dashboard, tambahkan variables berikut:

```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://vickymosafan2.app.n8n.cloud/webhook/...
NEXT_PUBLIC_ENABLE_PWA=true
NODE_ENV=production
```

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
2. Atau: Menu → Install Aplikasi Chat Dinamis

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

## 📧 Support

Jika mengalami masalah atau ada pertanyaan:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) untuk troubleshooting
2. Open an issue di repository
3. Contact support

---

**Dibuat dengan ❤️ menggunakan Next.js dan Tailwind CSS**
