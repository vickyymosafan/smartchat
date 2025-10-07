# Quick Setup Guide - Vercel Environment Variables

Panduan cepat untuk setup environment variables di Vercel Dashboard.

## Environment Variables yang Diperlukan

Copy dan paste variables berikut ke Vercel Dashboard:

### 1. NEXT_PUBLIC_APP_URL

```
Key: NEXT_PUBLIC_APP_URL
Value: https://your-app.vercel.app
Environment: Production
```

**Catatan:** Ganti `your-app.vercel.app` dengan URL Vercel Anda yang sebenarnya setelah deployment pertama.

### 2. NEXT_PUBLIC_N8N_WEBHOOK_URL

```
Key: NEXT_PUBLIC_N8N_WEBHOOK_URL
Value: https://vickymosafan2.app.n8n.cloud/webhook/d49a228d-703d-4a93-8e7a-ed173500fc6e/chat
Environment: Production
```

### 3. NEXT_PUBLIC_ENABLE_PWA

```
Key: NEXT_PUBLIC_ENABLE_PWA
Value: true
Environment: Production
```

### 4. NODE_ENV

```
Key: NODE_ENV
Value: production
Environment: Production
```

## Cara Menambahkan di Vercel Dashboard

1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project Anda
3. Klik tab **"Settings"**
4. Klik **"Environment Variables"** di sidebar
5. Untuk setiap variable:
   - Klik **"Add New"**
   - Masukkan **Key** dan **Value**
   - Pilih **Environment**: Production
   - Klik **"Save"**

## Screenshot Lokasi

```
Vercel Dashboard
  └── Your Project
      └── Settings
          └── Environment Variables  ← Klik di sini
              └── Add New  ← Tambahkan variables
```

## Verifikasi

Setelah menambahkan semua variables:

1. Buka tab **"Deployments"**
2. Klik **"Redeploy"** pada deployment terakhir
3. Tunggu build selesai
4. Test aplikasi untuk memastikan semua berfungsi

## Optional Variables

Jika ingin customize lebih lanjut:

### API Timeout (Optional)

```
Key: NEXT_PUBLIC_API_TIMEOUT
Value: 30000
Environment: Production
```

### Debug Mode (Optional - untuk troubleshooting)

```
Key: NEXT_PUBLIC_DEBUG
Value: false
Environment: Production
```

## Preview Environment

Untuk testing di preview deployments, tambahkan variables yang sama dengan environment **"Preview"**:

1. Klik **"Add New"**
2. Masukkan Key dan Value yang sama
3. Pilih **Environment**: Preview
4. Klik **"Save"**

## Custom Domain Setup

Jika menggunakan custom domain:

1. Update `NEXT_PUBLIC_APP_URL` dengan domain custom Anda
2. Contoh: `https://chat.example.com`
3. Redeploy aplikasi

## Troubleshooting

### Variable tidak terdeteksi

- Pastikan variable dimulai dengan `NEXT_PUBLIC_` untuk client-side access
- Redeploy setelah menambahkan variables
- Check build logs untuk error

### URL tidak sesuai

- Setelah deployment pertama, update `NEXT_PUBLIC_APP_URL`
- Gunakan URL dari Vercel (format: `https://project-name.vercel.app`)
- Atau gunakan custom domain jika sudah setup

## Checklist

Sebelum deploy, pastikan:

- [ ] Semua 4 environment variables sudah ditambahkan
- [ ] `NEXT_PUBLIC_APP_URL` sesuai dengan domain Anda
- [ ] `NEXT_PUBLIC_N8N_WEBHOOK_URL` valid dan accessible
- [ ] Environment dipilih: Production
- [ ] Redeploy setelah menambahkan variables

---

**Ready to deploy! 🚀**
