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

**System Requirements:**
- **Node.js 18.17+** atau **20.0+** (Recommended: Node.js 20 LTS atau lebih baru)
- **npm 9+** (included dengan Node.js) atau **yarn 1.22+** atau **pnpm 8+**
- **Git** untuk version control

**Verifikasi instalasi:**
```bash
node --version   # Harus >= 18.17
npm --version    # Harus >= 9.0
```

### Instalasi

1. **Clone repository:**

```bash
git clone <repository-url>
cd smartchat
```

2. **Install dependencies:**

```bash
npm install
```

**Catatan:** Proses instalasi akan menginstall semua dependencies yang diperlukan:

**Core Dependencies:**
- Next.js 15.5.4 (React 19.1.0)
- TypeScript 5
- Tailwind CSS 4
- Supabase Client 2.75.0

**UI Libraries:**
- Radix UI components (Dialog, Dropdown, Tooltip, dll)
- Lucide React (icons)
- Framer Motion (animations)
- shadcn/ui components

**State & Data:**
- Zustand (state management)
- TanStack Virtual (virtualization)
- React Markdown (markdown rendering)

**Development Tools:**
- ESLint & Prettier (code quality)
- TypeScript ESLint
- Bundle Analyzer

3. **Setup environment variables:**

```bash
# Windows (Command Prompt)
copy .env.local.example .env.local

# Windows (PowerShell)
Copy-Item .env.local.example .env.local

# Linux/Mac
cp .env.local.example .env.local
```

**Edit `.env.local` dan sesuaikan konfigurasi:**

```env
# Required - Ubah sesuai kebutuhan
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook/your-webhook-id

# Optional - Supabase (jika menggunakan authentication)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional - PWA & Debug
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_DEBUG=true
NODE_ENV=development
```

4. **Jalankan development server:**

```bash
npm run dev
```

Server akan berjalan di [http://localhost:3000](http://localhost:3000)

5. **Verifikasi instalasi:**

Buka browser dan akses `http://localhost:3000`. Anda akan melihat interface chat SmartChat.

### Troubleshooting Instalasi

**Jika mengalami error saat `npm install`:**

```bash
# Clear cache dan reinstall
npm cache clean --force
rm -rf node_modules package-lock.json  # Linux/Mac
# atau
rmdir /s /q node_modules & del package-lock.json  # Windows CMD
npm install
```

**Jika port 3000 sudah digunakan:**

```bash
# Gunakan port lain
npm run dev -- -p 3001
```

**Jika ada error TypeScript:**

```bash
# Rebuild TypeScript
npm run type-check
```

## 📦 Available Scripts

### Development
```bash
npm run dev                    # Start dev server dengan Turbopack
npm run build                  # Build untuk production dengan Turbopack
npm run start                  # Start production server
npm run build:production       # Build dengan NODE_ENV=production
npm run start:production       # Start dengan NODE_ENV=production
```

### Code Quality
```bash
npm run lint                   # Run ESLint
npm run lint:fix              # Auto-fix ESLint issues
npm run format                # Format code dengan Prettier
npm run format:check          # Check Prettier formatting
npm run type-check            # TypeScript type checking
```

### Testing & Verification
```bash
npm run test:performance      # Performance testing
npm run test:lighthouse       # Lighthouse audit
npm run test:accessibility    # Accessibility verification
npm run test:contrast         # Color contrast checking
npm run test:bundle           # Build dan test performance
```

### Deployment
```bash
npm run predeployment         # Pre-deployment checks (type, lint, build, verify)
npm run deployment:verify     # Post-deployment verification
```

### Utilities
```bash
npm run generate:icons        # Generate PWA icons
npm run build:analyze         # Analyze bundle size dengan Bundle Analyzer
npm run audit:security        # Security audit (production only)
npm run audit:all             # Full security audit
npm run verify:build          # Verify production build
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
│   ├── chat/              # Chat UI components (NEW UI)
│   │   ├── ChatShell.tsx  # Main chat container
│   │   ├── TopBar.tsx     # Header dengan branding
│   │   ├── MessageList.tsx # Daftar pesan
│   │   ├── MessageBubble.tsx # Bubble pesan individual
│   │   ├── Composer.tsx   # Input form
│   │   ├── EmptyState.tsx # Welcome screen
│   │   ├── SidePanel.tsx  # Chat history sidebar
│   │   ├── CommandPalette.tsx # Keyboard shortcuts
│   │   └── SettingsSheet.tsx # Settings panel
│   ├── ui/                # Reusable UI components
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
# (ChatShell NEW UI digunakan secara default)

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

### Core
- **Framework:** Next.js 15.5.4 (App Router) dengan Turbopack
- **Language:** TypeScript 5
- **Runtime:** React 19.1.0
- **Styling:** Tailwind CSS 4 dengan CSS Variables

### UI & Components
- **Component Library:** Radix UI primitives
- **Design System:** shadcn/ui (New York style)
- **Icons:** Lucide React (0.545.0)
- **Animations:** Framer Motion (12.23.22)
- **Fonts:** Geist font family
- **Command Palette:** cmdk

### State Management & Data
- **Global State:** Zustand (5.0.8)
- **Context:** React Context (Auth, Chat)
- **Backend:** Supabase (2.75.0)
- **Virtualization:** TanStack Virtual (3.13.12)

### Content & Markdown
- **Markdown:** react-markdown (10.1.0)
- **Syntax Highlighting:** rehype-highlight (7.0.2)
- **GFM Support:** remark-gfm (4.0.1)
- **Raw HTML:** rehype-raw (7.0.0)

### Developer Tools
- **Linting:** ESLint 9 + TypeScript ESLint
- **Formatting:** Prettier 3.6.2
- **Bundle Analysis:** @next/bundle-analyzer
- **Type Checking:** TypeScript strict mode

### Features
- **PWA:** Service Worker + Web Manifest
- **Theme:** next-themes (dark/light mode)
- **Notifications:** Sonner (2.0.7)
- **API Integration:** n8n Webhook
- **Deployment:** Vercel (optimized)

### Utilities
- **Class Management:** clsx, tailwind-merge, class-variance-authority
- **Animations:** tw-animate-css

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
