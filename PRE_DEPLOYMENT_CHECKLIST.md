# Pre-Deployment Checklist

Gunakan checklist ini sebelum deploy ke production untuk memastikan semua sudah siap.

## 📋 Checklist Persiapan

### 1. Kode dan Repository

- [ ] Semua perubahan sudah di-commit
- [ ] Branch main/master up-to-date
- [ ] Tidak ada console.log atau debug code
- [ ] Tidak ada TODO atau FIXME yang critical
- [ ] Build berhasil di local: `npm run build`
- [ ] Lint check passed: `npm run lint`

### 2. Environment Variables

- [ ] File `.env.local.example` sudah update
- [ ] File `.env.production.example` sudah update
- [ ] Tidak ada file `.env.local` atau `.env.production` di Git
- [ ] Semua sensitive data menggunakan environment variables
- [ ] `NEXT_PUBLIC_APP_URL` sudah disiapkan untuk production
- [ ] `NEXT_PUBLIC_N8N_WEBHOOK_URL` valid dan tested

### 3. Konfigurasi

- [ ] `next.config.ts` sudah dikonfigurasi dengan benar
- [ ] Security headers sudah aktif
- [ ] CSP (Content Security Policy) sudah dikonfigurasi
- [ ] `vercel.json` sudah ada dan valid
- [ ] PWA manifest (`public/manifest.json`) sudah update
- [ ] Service worker (`public/sw.js`) berfungsi

### 4. Assets dan Media

- [ ] Semua icons PWA sudah ada di `public/icons/`
  - [ ] icon-192x192.png
  - [ ] icon-512x512.png
  - [ ] apple-touch-icon.png
- [ ] Favicon sudah ada
- [ ] Semua images sudah dioptimasi
- [ ] Tidak ada broken links atau missing assets

### 5. Testing

- [ ] Test di Chrome (desktop)
- [ ] Test di Firefox (desktop)
- [ ] Test di Safari (desktop)
- [ ] Test di Chrome Mobile (Android)
- [ ] Test di Safari Mobile (iOS)
- [ ] Test PWA install di berbagai browser
- [ ] Test offline functionality
- [ ] Test form submission dan API integration
- [ ] Test responsive design di berbagai ukuran layar

### 6. Performance

- [ ] Bundle size check: `ANALYZE=true npm run build`
- [ ] First Load JS < 200KB
- [ ] Lighthouse score > 90
- [ ] No performance warnings di console
- [ ] Images menggunakan Next.js Image component
- [ ] Lazy loading untuk komponen besar

### 7. Security

- [ ] No sensitive data di client-side code
- [ ] API endpoints protected
- [ ] Input validation implemented
- [ ] XSS protection active
- [ ] CSRF protection active
- [ ] Security headers configured
- [ ] Dependencies up-to-date: `npm audit`

### 8. SEO dan Metadata

- [ ] Title dan description sudah set
- [ ] Open Graph tags sudah ada
- [ ] robots.txt sudah ada
- [ ] sitemap.xml sudah ada (jika applicable)
- [ ] Canonical URLs configured

### 9. Dokumentasi

- [ ] README.md up-to-date
- [ ] DEPLOYMENT.md lengkap
- [ ] VERCEL_SETUP.md tersedia
- [ ] Komentar kode dalam bahasa Indonesia
- [ ] API documentation (jika ada)

### 10. Vercel Setup

- [ ] Vercel account sudah siap
- [ ] Repository connected ke Vercel
- [ ] Environment variables list sudah disiapkan
- [ ] Custom domain sudah disiapkan (jika ada)
- [ ] DNS records sudah disiapkan (jika custom domain)

## 🚀 Ready to Deploy?

Jika semua checklist di atas sudah ✅, Anda siap untuk deploy!

### Next Steps:

1. Push kode ke repository:
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. Follow panduan di [DEPLOYMENT.md](./DEPLOYMENT.md)

3. Setup environment variables di Vercel (lihat [VERCEL_SETUP.md](./VERCEL_SETUP.md))

4. Deploy dan monitor!

## 📊 Post-Deployment Checklist

Setelah deployment selesai:

- [ ] Aplikasi accessible di production URL
- [ ] Semua fitur berfungsi dengan baik
- [ ] PWA install prompt muncul
- [ ] Offline mode berfungsi
- [ ] API integration berfungsi
- [ ] No errors di browser console
- [ ] No errors di Vercel logs
- [ ] SSL certificate active
- [ ] Custom domain working (jika ada)
- [ ] Analytics tracking active (jika ada)

## 🔍 Monitoring

Setup monitoring untuk production:

- [ ] Vercel Analytics enabled
- [ ] Speed Insights enabled
- [ ] Error tracking setup
- [ ] Uptime monitoring
- [ ] Performance monitoring

## 🆘 Rollback Plan

Jika ada masalah setelah deployment:

1. Buka Vercel Dashboard → Deployments
2. Pilih deployment sebelumnya yang stabil
3. Klik "Promote to Production"
4. Fix issues di development
5. Redeploy setelah fix

---

**Good luck with your deployment! 🚀**
