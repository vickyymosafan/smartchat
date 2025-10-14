# ⚡ Quick Fix - Vercel "Failed to fetch" Error

## 🎯 Problem

Aplikasi sudah deploy ke Vercel tapi error:
```
❌ Tidak dapat terhubung ke server. Periksa koneksi internet Anda.
❌ AuthRetryableFetchError: Failed to fetch
```

## ✅ Root Cause

**Environment variables tidak di-set di Vercel!**

File `.env.local` tidak ter-upload karena ada di `.gitignore`.

---

## 🚀 Quick Fix (5 Menit)

### Option 1: Via Vercel Dashboard (Recommended)

#### Step 1: Buka Vercel Dashboard
```
https://vercel.com/dashboard
→ Pilih project "smartchat"
→ Klik tab "Settings"
→ Sidebar: "Environment Variables"
```

#### Step 2: Add Variables

**Variable 1:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://yzpjlmdbothjshwpzqxr.supabase.co
Environments: ✅ Production ✅ Preview ✅ Development
```
Klik **Save**

**Variable 2:**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6cGpsbWRib3RoanNod3B6cXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjQ0OTIsImV4cCI6MjA3NTYwMDQ5Mn0.YbbFsCDCL3ePGPkhTcyAEJKtc1nOmJUFd-iAu7O0Wo4
Environments: ✅ Production ✅ Preview ✅ Development
```
Klik **Save**

#### Step 3: Redeploy

**Via Dashboard:**
```
Tab "Deployments"
→ Klik "..." di deployment terakhir
→ Klik "Redeploy"
→ Confirm
```

**Via Git:**
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

#### Step 4: Verify (Tunggu 1-2 menit)

Buka aplikasi di browser, seharusnya:
- ✅ Connection status: "Terhubung ke Supabase"
- ✅ Bisa sign up/sign in

---

### Option 2: Via Vercel CLI (Faster)

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login

```bash
vercel login
```

#### Step 3: Link Project

```bash
cd smartchat
vercel link
```

Pilih:
- Scope: Your account
- Link to existing project: Yes
- Project name: smartchat

#### Step 4: Add Environment Variables

```bash
# Add Supabase URL
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://yzpjlmdbothjshwpzqxr.supabase.co

# Add Supabase Anon Key
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6cGpsbWRib3RoanNod3B6cXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjQ0OTIsImV4cCI6MjA3NTYwMDQ5Mn0.YbbFsCDCL3ePGPkhTcyAEJKtc1nOmJUFd-iAu7O0Wo4
```

#### Step 5: Redeploy

```bash
vercel --prod
```

#### Step 6: Verify

Buka URL yang muncul setelah deploy.

---

### Option 3: One-Line Script (Advanced)

Create file `setup-vercel-env.sh`:

```bash
#!/bin/bash

echo "🚀 Setting up Vercel environment variables..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel
echo "🔐 Logging in to Vercel..."
vercel login

# Link project
echo "🔗 Linking project..."
vercel link

# Add environment variables
echo "📝 Adding environment variables..."

echo "Adding NEXT_PUBLIC_SUPABASE_URL..."
echo "https://yzpjlmdbothjshwpzqxr.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production

echo "Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6cGpsbWRib3RoanNod3B6cXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjQ0OTIsImV4cCI6MjA3NTYwMDQ5Mn0.YbbFsCDCL3ePGPkhTcyAEJKtc1nOmJUFd-iAu7O0Wo4" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Deploy
echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Done! Check your deployment URL."
```

Run:
```bash
chmod +x setup-vercel-env.sh
./setup-vercel-env.sh
```

---

## 🔍 Verify Environment Variables

### Method 1: Vercel Dashboard

```
Settings > Environment Variables
```

Should see:
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY

### Method 2: Browser Console

Buka aplikasi, tekan F12:

```javascript
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
```

Expected:
```
URL: https://yzpjlmdbothjshwpzqxr.supabase.co
Key: eyJhbGciOiJIUzI1NiIsI...
```

If `undefined`:
- ❌ Variables not set
- ❌ Or not redeployed yet

### Method 3: Debug Panel

Aplikasi sekarang punya debug panel di bottom-right.

Klik **"Debug Info"** untuk lihat:
- ✅ Environment variables status
- ✅ Missing variables
- ✅ Quick fix instructions

---

## 🎯 Expected Result

Setelah fix, Anda akan lihat:

### 1. Connection Status
```
✅ Terhubung ke Supabase
```

### 2. Console Logs
```
🔧 Supabase Configuration Check:
  - URL defined: true
  - Key defined: true
  - URL value: https://yzpjlmdbothjshwpzqxr.supabase.co
  - Key preview: eyJhbGciOiJIUzI1NiIsI...
✅ Supabase client initialized successfully
```

### 3. Sign Up Works
```
🔐 Attempting to sign up with Supabase...
📧 Email: user@example.com
🌐 Supabase URL: https://yzpjlmdbothjshwpzqxr.supabase.co
✅ SignUp successful
```

---

## 🆘 Still Not Working?

### Check 1: Redeploy Status

Pastikan redeploy sudah selesai:
```
Vercel Dashboard > Deployments
Status: Ready ✅
```

### Check 2: Clear Browser Cache

```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Check 3: Try Incognito Mode

```
Ctrl + Shift + N (Chrome)
Cmd + Shift + N (Safari)
```

### Check 4: Check Vercel Logs

```
Dashboard > Deployments > [Latest] > Runtime Logs
```

Look for errors.

### Check 5: Verify Supabase Project

```
https://supabase.com/dashboard
→ Check project status
→ Should be "Active" not "Paused"
```

---

## 📋 Troubleshooting Checklist

- [ ] Environment variables added to Vercel
- [ ] Both variables checked for all environments
- [ ] Redeployed after adding variables
- [ ] Deployment status = Ready
- [ ] Browser cache cleared
- [ ] Tried in incognito mode
- [ ] Supabase project status = Active
- [ ] SQL schema already run in Supabase
- [ ] No typos in variable names
- [ ] No extra spaces in variable values

---

## 💡 Pro Tips

### 1. Use Environment Variable Templates

Create `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Commit to Git untuk reference.

### 2. Automate with GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 3. Use Vercel Preview Deployments

Test environment variables di preview sebelum production:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel
```

---

## 📚 Additional Resources

- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - Comprehensive guide
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Detailed troubleshooting
- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)

---

## ✅ Success!

Jika semua benar, aplikasi sekarang:
- ✅ Bisa connect ke Supabase
- ✅ Sign up/sign in works
- ✅ Messages tersimpan di database
- ✅ Production-ready!

**Selamat! Aplikasi sudah live!** 🎉
