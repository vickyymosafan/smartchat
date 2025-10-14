# 🚀 Vercel Deployment Guide - SmartChat

## ❌ Error: "Failed to fetch" di Vercel

### Gejala:
- ✅ Deploy ke Vercel berhasil
- ✅ Aplikasi bisa diakses
- ❌ Error "Tidak dapat terhubung ke server" saat sign up/sign in
- ❌ Console error: "AuthRetryableFetchError: Failed to fetch"

### Akar Masalah:

**99% kemungkinan: Environment Variables tidak di-set di Vercel!**

File `.env.local` **TIDAK** otomatis ter-upload ke Vercel karena:
1. `.env.local` ada di `.gitignore`
2. Vercel tidak bisa baca file local
3. Environment variables harus di-set manual di Vercel Dashboard

---

## ✅ Solusi: Set Environment Variables di Vercel

### Step 1: Buka Vercel Dashboard

1. Login ke https://vercel.com
2. Pilih project **smartchat**
3. Klik **Settings** (tab di atas)

### Step 2: Tambahkan Environment Variables

1. Di sidebar kiri, klik **Environment Variables**
2. Tambahkan variable satu per satu:

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://yzpjlmdbothjshwpzqxr.supabase.co
Environment: Production, Preview, Development (check all)
```

Klik **Save**

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6cGpsbWRib3RoanNod3B6cXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjQ0OTIsImV4cCI6MjA3NTYwMDQ5Mn0.YbbFsCDCL3ePGPkhTcyAEJKtc1nOmJUFd-iAu7O0Wo4
Environment: Production, Preview, Development (check all)
```

Klik **Save**

#### Variable 3: NEXT_PUBLIC_APP_URL (Optional tapi recommended)

```
Name: NEXT_PUBLIC_APP_URL
Value: https://your-app.vercel.app
Environment: Production, Preview, Development (check all)
```

Klik **Save**

### Step 3: Redeploy

**PENTING:** Setelah add environment variables, Anda **HARUS** redeploy!

**Option A: Redeploy via Dashboard**
1. Klik tab **Deployments**
2. Klik **...** (three dots) di deployment terakhir
3. Klik **Redeploy**
4. Confirm

**Option B: Redeploy via Git Push**
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

**Option C: Redeploy via Vercel CLI**
```bash
vercel --prod
```

### Step 4: Verify

1. Tunggu deployment selesai (1-2 menit)
2. Buka aplikasi di browser
3. Check connection status
4. Try sign up/sign in

---

## 🔍 Verify Environment Variables

### Method 1: Check di Vercel Dashboard

1. Settings > Environment Variables
2. Pastikan ada 2 variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Pastikan **Production** checked

### Method 2: Check di Browser Console

Buka aplikasi di Vercel, tekan F12, dan jalankan:

```javascript
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
```

**Expected Output:**
```
URL: https://yzpjlmdbothjshwpzqxr.supabase.co
Key: eyJhbGciOiJIUzI1NiIsI...
```

**Jika `undefined`:**
- Environment variables belum di-set
- Atau belum redeploy setelah set

---

## 🌐 CORS Configuration (Jika Masih Error)

Jika environment variables sudah benar tapi masih error, mungkin CORS issue.

### Step 1: Whitelist Vercel Domain di Supabase

1. Buka Supabase Dashboard
2. Pilih project Anda
3. Navigasi ke **Settings** > **API**
4. Scroll ke **CORS Allowed Origins**
5. Tambahkan Vercel domain:
   ```
   https://your-app.vercel.app
   https://*.vercel.app
   ```
6. Klik **Save**

### Step 2: Test Lagi

1. Refresh aplikasi di Vercel
2. Try sign up/sign in
3. Check browser console

---

## 🔧 Advanced Troubleshooting

### Issue 1: Environment Variables Tidak Terbaca

**Gejala:**
```javascript
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL) // undefined
```

**Solusi:**
1. Pastikan variable name **EXACT** match (case-sensitive)
2. Pastikan prefix `NEXT_PUBLIC_` ada
3. Redeploy setelah add variables
4. Clear browser cache

### Issue 2: "Invalid API Key"

**Gejala:**
- Error "Invalid API key" atau "Unauthorized"

**Solusi:**
1. Verify Anon Key di Supabase Dashboard
2. Copy ulang dari Dashboard > Settings > API
3. Paste ke Vercel Environment Variables
4. Redeploy

### Issue 3: CORS Error

**Gejala:**
- Console error: "CORS policy blocked"
- Network tab: Status (CORS error)

**Solusi:**
1. Whitelist Vercel domain di Supabase (lihat di atas)
2. Atau temporarily set CORS to `*` (testing only!)
3. Redeploy

### Issue 4: "Failed to fetch" Intermittent

**Gejala:**
- Kadang work, kadang error
- Random "Failed to fetch"

**Solusi:**
1. Check Supabase status: https://status.supabase.com
2. Check Vercel status: https://www.vercel-status.com
3. Implement retry logic (sudah ada di code)
4. Check network tab untuk timeout

---

## 📋 Deployment Checklist

Sebelum deploy, pastikan:

- [ ] SQL schema sudah dijalankan di Supabase
- [ ] Tabel `conversations` dan `messages` exists
- [ ] RLS policies aktif
- [ ] Supabase project status = Active
- [ ] Environment variables di-set di Vercel:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Redeploy setelah add environment variables
- [ ] Vercel domain di-whitelist di Supabase CORS
- [ ] Test di browser (not incognito)
- [ ] Check browser console untuk errors

---

## 🎯 Expected Behavior di Vercel

### Saat Buka Aplikasi:
```
1. Loading spinner
2. Connection test: "🔵 Memeriksa koneksi..."
3. Jika OK: "✅ Terhubung ke Supabase"
4. Jika error: "❌ Gagal terhubung..." dengan detail
```

### Saat Sign Up:
```
1. Fill email & password
2. Klik "Daftar"
3. Console: "🔐 Attempting to sign up..."
4. Console: "🌐 Supabase URL: https://yzpjlmdbothjshwpzqxr.supabase.co"
5. Success: "✅ SignUp successful"
6. Toast: "Akun berhasil dibuat!"
```

---

## 💡 Pro Tips

### 1. Use Vercel CLI untuk Faster Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables via CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 2. Use Preview Deployments untuk Testing

```bash
# Deploy to preview (not production)
vercel

# Test di preview URL
# Jika OK, promote to production
vercel --prod
```

### 3. Enable Vercel Analytics

1. Vercel Dashboard > Analytics
2. Enable Web Analytics
3. Monitor errors dan performance

### 4. Setup Custom Domain

1. Vercel Dashboard > Settings > Domains
2. Add custom domain
3. Update CORS di Supabase dengan custom domain

---

## 🆘 Masih Error Setelah Semua Ini?

### Debug Steps:

1. **Check Vercel Logs:**
   ```
   Dashboard > Deployments > [Latest] > Runtime Logs
   ```

2. **Check Browser Console:**
   ```
   F12 > Console tab
   Look for detailed error messages
   ```

3. **Test Supabase Connection Manually:**
   ```javascript
   fetch('https://yzpjlmdbothjshwpzqxr.supabase.co/auth/v1/health')
     .then(res => res.json())
     .then(data => console.log('✅ Supabase OK:', data))
     .catch(err => console.error('❌ Supabase Error:', err))
   ```

4. **Compare Local vs Production:**
   - Local work? → Environment variables issue
   - Both error? → Supabase issue
   - Both work? → Browser cache issue

---

## 📚 Resources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase CORS Configuration](https://supabase.com/docs/guides/api/cors)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Deployment Docs](https://vercel.com/docs/deployments/overview)

---

## ✅ Success Indicators

Jika semua benar, Anda akan lihat:

1. ✅ Connection status: "Terhubung ke Supabase"
2. ✅ Console logs: "🔐 Attempting to sign up..."
3. ✅ Console logs: "🌐 Supabase URL: https://..."
4. ✅ Sign up berhasil dengan toast notification
5. ✅ Auto-login setelah sign up
6. ✅ Conversations tersimpan di database
7. ✅ Messages tersimpan dan persist setelah refresh

**Selamat! Aplikasi sudah production-ready!** 🎉
