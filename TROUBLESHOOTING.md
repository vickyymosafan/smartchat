# 🔧 Troubleshooting Guide - SmartChat Supabase Integration

## ❌ Error: "Failed to fetch"

### Deskripsi Error
Error ini muncul saat aplikasi tidak bisa terhubung ke Supabase API. Biasanya terjadi saat sign up atau sign in.

```
TypeError: Failed to fetch
at SupabaseAuthClient.signUp
```

### Kemungkinan Penyebab & Solusi

#### 1. **Koneksi Internet Bermasalah**

**Gejala:**
- Error muncul saat sign up/sign in
- Browser console menunjukkan "Failed to fetch"

**Solusi:**
```bash
# Test koneksi ke Supabase
curl https://yzpjlmdbothjshwpzqxr.supabase.co

# Atau buka di browser
https://yzpjlmdbothjshwpzqxr.supabase.co
```

Jika tidak bisa akses, check:
- ✅ Koneksi internet aktif
- ✅ Tidak ada proxy/VPN yang blocking
- ✅ Firewall tidak blocking Supabase domain

#### 2. **Supabase Credentials Salah**

**Gejala:**
- Error "Failed to fetch" atau "Invalid API key"

**Solusi:**

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Navigasi ke **Settings** > **API**
4. Copy **Project URL** dan **anon public** key
5. Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

6. Restart dev server:
```bash
npm run dev
```

#### 3. **Supabase Project Tidak Aktif**

**Gejala:**
- Error "Failed to fetch"
- Supabase Dashboard menunjukkan project paused

**Solusi:**

1. Buka Supabase Dashboard
2. Check status project (top right corner)
3. Jika paused, klik **Resume Project**
4. Tunggu beberapa menit sampai project aktif
5. Refresh aplikasi

#### 4. **Database Belum Di-Setup**

**Gejala:**
- Bisa sign up/sign in tapi error saat save data
- Error "relation does not exist"

**Solusi:**

1. Buka Supabase Dashboard
2. Navigasi ke **SQL Editor**
3. Copy isi file `supabase-schema.sql`
4. Paste dan klik **Run**
5. Verify tabel sudah dibuat di **Table Editor**

**Detail lengkap ada di `SUPABASE_SETUP.md`**

#### 5. **Email Confirmation Required**

**Gejala:**
- Sign up berhasil tapi tidak bisa login
- Error "Email not confirmed"

**Solusi (Untuk Testing):**

1. Buka Supabase Dashboard
2. Navigasi ke **Authentication** > **Settings**
3. Scroll ke **Email Auth**
4. **Disable** "Enable email confirmations"
5. Klik **Save**
6. Try sign up lagi

**Solusi (Production):**

1. Check email spam folder
2. Klik link verifikasi di email
3. Atau manually confirm di Dashboard > Authentication > Users

#### 6. **CORS Issue (Jarang Terjadi)**

**Gejala:**
- Error "CORS policy" di browser console
- Failed to fetch dari localhost

**Solusi:**

Supabase seharusnya sudah handle CORS by default. Jika masih error:

1. Buka Supabase Dashboard
2. Navigasi ke **Settings** > **API**
3. Check **CORS Allowed Origins**
4. Pastikan `http://localhost:3000` ada di list
5. Atau tambahkan `*` untuk allow all (testing only!)

#### 7. **Browser Extension Blocking**

**Gejala:**
- Error hanya terjadi di browser tertentu
- Works di incognito mode

**Solusi:**

1. Disable browser extensions (AdBlock, Privacy Badger, etc.)
2. Try di incognito/private mode
3. Whitelist Supabase domain di extension settings

## 🧪 Testing & Debugging

### 1. Test Koneksi Manual

Buka browser console dan jalankan:

```javascript
// Test fetch ke Supabase
fetch('https://yzpjlmdbothjshwpzqxr.supabase.co')
  .then(res => console.log('✅ Connection OK:', res.status))
  .catch(err => console.error('❌ Connection Failed:', err))
```

### 2. Check Environment Variables

```javascript
// Di browser console
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
```

### 3. Test Auth Endpoint

```bash
# Test dengan curl
curl -X POST 'https://yzpjlmdbothjshwpzqxr.supabase.co/auth/v1/signup' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

### 4. Check Browser Network Tab

1. Buka DevTools (F12)
2. Tab **Network**
3. Try sign up/sign in
4. Look for failed requests
5. Check request headers dan response

### 5. Enable Debug Logging

Aplikasi sudah include console logging. Check browser console untuk:
- 🔍 Initial session check
- 🔐 Sign up/sign in attempts
- ✅ Success messages
- ❌ Error details

## 📋 Checklist Troubleshooting

Jika masih error, check satu per satu:

- [ ] Internet connection aktif
- [ ] Bisa akses https://supabase.com
- [ ] Bisa akses project URL di browser
- [ ] `.env.local` file exists dan berisi credentials
- [ ] Credentials di `.env.local` match dengan Supabase Dashboard
- [ ] Dev server sudah di-restart setelah update `.env.local`
- [ ] Supabase project status = Active (not paused)
- [ ] SQL schema sudah dijalankan di Supabase
- [ ] Tabel `conversations` dan `messages` exists
- [ ] RLS policies sudah dibuat
- [ ] Email confirmation disabled (untuk testing)
- [ ] No browser extensions blocking requests
- [ ] No firewall/proxy blocking Supabase domain

## 🆘 Masih Error?

### Option 1: Check Logs

**Browser Console:**
```
F12 > Console tab
Look for 🔐, ✅, ❌ emoji logs
```

**Supabase Logs:**
```
Dashboard > Logs > Auth Logs
Check for failed auth attempts
```

### Option 2: Test dengan Postman/Insomnia

1. Create new POST request
2. URL: `https://yzpjlmdbothjshwpzqxr.supabase.co/auth/v1/signup`
3. Headers:
   - `apikey: <your-anon-key>`
   - `Content-Type: application/json`
4. Body:
   ```json
   {
     "email": "test@example.com",
     "password": "test123456"
   }
   ```
5. Send request
6. Check response

### Option 3: Create New Supabase Project

Jika semua gagal, mungkin project bermasalah:

1. Create new project di Supabase Dashboard
2. Copy new credentials
3. Update `.env.local`
4. Run SQL schema
5. Test lagi

## 📚 Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Troubleshooting](https://supabase.com/docs/guides/platform/troubleshooting)
- [Supabase Status Page](https://status.supabase.com/)
- [Supabase Discord](https://discord.supabase.com/)

## 💡 Tips

1. **Always check browser console first** - Most errors have detailed logs
2. **Test in incognito mode** - Rules out browser extension issues
3. **Verify credentials** - Most common cause of errors
4. **Check Supabase status** - Sometimes it's their server issue
5. **Read error messages carefully** - They usually tell you what's wrong

---

**Jika masih stuck, share:**
1. Full error message dari console
2. Network tab screenshot
3. Supabase project status
4. Steps yang sudah dicoba
