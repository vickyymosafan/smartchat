# Panduan Troubleshooting - Aplikasi Chat Dinamis

Dokumen ini berisi solusi untuk masalah umum yang mungkin terjadi pada aplikasi chat dinamis.

## Daftar Isi

- [Masalah Development](#masalah-development)
- [Masalah Build](#masalah-build)
- [Masalah Deployment](#masalah-deployment)
- [Masalah PWA](#masalah-pwa)
- [Masalah API](#masalah-api)
- [Masalah Performance](#masalah-performance)
- [Masalah Browser](#masalah-browser)

## Masalah Development

### Port 3000 Sudah Digunakan

**Gejala**: Error `Port 3000 is already in use`

**Solusi**:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Atau gunakan port lain
npm run dev -- -p 3001
```

### Module Not Found

**Gejala**: Error `Cannot find module 'xxx'`

**Solusi**:

```bash
# Hapus node_modules dan reinstall
rmdir /s /q node_modules
del package-lock.json
npm install

# Atau clear npm cache
npm cache clean --force
npm install
```

### TypeScript Errors

**Gejala**: Type errors di editor atau saat build

**Solusi**:

```bash
# Run type check
npm run type-check

# Restart TypeScript server di VS Code
# Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Clear TypeScript cache
del tsconfig.tsbuildinfo
npm run type-check
```

### Hot Reload Tidak Berfungsi

**Gejala**: Perubahan kode tidak terdeteksi

**Solusi**:

```bash
# Restart dev server
# Ctrl+C untuk stop
npm run dev

# Clear .next cache
rmdir /s /q .next
npm run dev

# Check file watcher limit (Linux/Mac)
# echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
# sudo sysctl -p
```

### Environment Variables Tidak Terbaca

**Gejala**: `process.env.NEXT_PUBLIC_XXX` undefined

**Solusi**:

1. **Check file `.env.local` ada**:
   ```bash
   # Copy dari example
   copy .env.local.example .env.local
   ```

2. **Pastikan variable dimulai dengan `NEXT_PUBLIC_`**:
   ```env
   # ✅ Correct (accessible di client)
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # ❌ Wrong (hanya accessible di server)
   APP_URL=http://localhost:3000
   ```

3. **Restart dev server** setelah mengubah env variables:
   ```bash
   # Ctrl+C untuk stop
   npm run dev
   ```

## Masalah Build

### Build Failed

**Gejala**: `npm run build` gagal dengan error

**Solusi 1 - Type Errors**:

```bash
# Check type errors
npm run type-check

# Fix errors dan build lagi
npm run build
```

**Solusi 2 - Memory Issues**:

```bash
# Increase Node memory limit
set NODE_OPTIONS=--max-old-space-size=4096
npm run build
```

**Solusi 3 - Clear Cache**:

```bash
# Clear Next.js cache
rmdir /s /q .next
npm run build
```

### Build Timeout di Vercel

**Gejala**: Build timeout setelah 15 menit

**Solusi**:

1. **Optimize dependencies**:
   ```bash
   # Remove unused dependencies
   npm prune
   
   # Check bundle size
   npm run build:analyze
   ```

2. **Reduce build complexity**:
   - Remove heavy dependencies
   - Use dynamic imports
   - Optimize images

3. **Upgrade Vercel plan** (jika diperlukan)

### Out of Memory Error

**Gejala**: `JavaScript heap out of memory`

**Solusi**:

```bash
# Increase memory limit
set NODE_OPTIONS=--max-old-space-size=4096
npm run build

# Atau tambahkan di package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

## Masalah Deployment

### Deployment Failed di Vercel

**Gejala**: Deployment gagal dengan error

**Solusi 1 - Check Build Logs**:

1. Buka Vercel Dashboard
2. Klik deployment yang gagal
3. Lihat "Build Logs"
4. Identify error dan fix

**Solusi 2 - Environment Variables**:

```bash
# Verify semua env variables ada
# Vercel Dashboard → Settings → Environment Variables

# Required variables:
# - NEXT_PUBLIC_APP_URL
# - NEXT_PUBLIC_N8N_WEBHOOK_URL
# - NEXT_PUBLIC_ENABLE_PWA
# - NODE_ENV
```

**Solusi 3 - Redeploy**:

```bash
# Force redeploy
git commit --allow-empty -m "Force redeploy"
git push origin main
```

### 404 Error Setelah Deploy

**Gejala**: Halaman menampilkan 404 Not Found

**Solusi**:

1. **Check routing**:
   - Pastikan `src/app/page.tsx` ada
   - Check file structure sesuai App Router

2. **Check vercel.json**:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/"
       }
     ]
   }
   ```

3. **Clear Vercel cache**:
   - Vercel Dashboard → Settings → Clear Cache
   - Redeploy

### Environment Variables Tidak Terbaca di Production

**Gejala**: API calls gagal di production

**Solusi**:

1. **Verify variables di Vercel**:
   - Settings → Environment Variables
   - Pastikan environment = "Production"

2. **Redeploy setelah menambah variables**:
   ```bash
   git commit --allow-empty -m "Update env variables"
   git push origin main
   ```

3. **Check variable names**:
   - Harus dimulai dengan `NEXT_PUBLIC_` untuk client-side
   - Case-sensitive

### SSL Certificate Error

**Gejala**: HTTPS tidak berfungsi atau certificate invalid

**Solusi**:

1. **Tunggu SSL provisioning** (bisa 24-48 jam untuk custom domain)

2. **Check DNS configuration**:
   ```
   # Verify DNS records
   nslookup your-domain.com
   ```

3. **Force SSL renewal**:
   - Vercel Dashboard → Domains
   - Remove dan add domain lagi

## Masalah PWA

### Service Worker Tidak Register

**Gejala**: PWA tidak berfungsi, install prompt tidak muncul

**Solusi**:

1. **Check HTTPS**:
   - PWA hanya berfungsi di HTTPS
   - Atau localhost untuk development

2. **Check service worker file**:
   ```bash
   # Pastikan file ada
   dir public\sw.js
   ```

3. **Check browser console**:
   - Buka DevTools → Console
   - Look for service worker errors

4. **Clear service worker cache**:
   - DevTools → Application → Service Workers
   - Click "Unregister"
   - Reload page

5. **Check manifest.json**:
   ```bash
   # Verify manifest valid
   # DevTools → Application → Manifest
   ```

### Install Prompt Tidak Muncul

**Gejala**: Tidak ada prompt untuk install PWA

**Solusi**:

1. **Check PWA requirements**:
   - ✅ HTTPS enabled
   - ✅ manifest.json valid
   - ✅ Service worker registered
   - ✅ Icons tersedia (192x192, 512x512)

2. **Check browser support**:
   - Chrome/Edge: ✅ Supported
   - Firefox: ⚠️ Limited support
   - Safari: ⚠️ Different install method

3. **Manual install**:
   - **Chrome**: Menu → Install App
   - **iOS Safari**: Share → Add to Home Screen

4. **Check manifest**:
   ```json
   {
     "name": "Aplikasi Chat Dinamis",
     "short_name": "ChatApp",
     "start_url": "/",
     "display": "standalone",
     "icons": [...]
   }
   ```

### Offline Mode Tidak Berfungsi

**Gejala**: Aplikasi tidak berfungsi saat offline

**Solusi**:

1. **Check service worker caching**:
   - DevTools → Application → Cache Storage
   - Verify assets cached

2. **Test offline mode**:
   - DevTools → Network → Offline checkbox
   - Reload page

3. **Check service worker code**:
   ```javascript
   // Verify caching strategy di sw.js
   self.addEventListener('fetch', (event) => {
     event.respondWith(
       caches.match(event.request)
         .then(response => response || fetch(event.request))
     );
   });
   ```

4. **Clear cache dan retry**:
   - DevTools → Application → Clear storage
   - Reload dan test lagi

## Masalah API

### API Request Failed

**Gejala**: Error saat mengirim pesan

**Solusi 1 - Check Network**:

```bash
# Test API endpoint
curl -X POST http://localhost:3000/api/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"test\"}"
```

**Solusi 2 - Check n8n Webhook**:

```bash
# Test webhook langsung
curl -X POST https://vickymosafan2.app.n8n.cloud/webhook/d49a228d-703d-4a93-8e7a-ed173500fc6e/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"test\"}"
```

**Solusi 3 - Check CORS**:

```typescript
// Verify CORS headers di API route
export async function POST(request: Request) {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Adjust as needed
    },
  });
}
```

### Timeout Error

**Gejala**: Request timeout setelah 30 detik

**Solusi**:

1. **Check n8n workflow**:
   - Pastikan workflow aktif
   - Check execution time
   - Optimize workflow jika lambat

2. **Increase timeout** (jika diperlukan):
   ```typescript
   // Di chatService.ts
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 detik
   
   const response = await fetch(url, {
     signal: controller.signal,
     // ...
   });
   ```

3. **Implement retry logic**:
   - Sudah diimplementasikan di chatService
   - Check retry attempts dan delays

### CORS Error

**Gejala**: `Access-Control-Allow-Origin` error

**Solusi**:

1. **Use API route sebagai proxy**:
   - Jangan call n8n webhook langsung dari client
   - Use `/api/chat` endpoint

2. **Check API route configuration**:
   ```typescript
   // src/app/api/chat/route.ts
   export async function POST(request: Request) {
     // Proxy request ke n8n
     const response = await fetch(webhookUrl, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(data),
     });
     
     return response;
   }
   ```

### Invalid Response Format

**Gejala**: Response dari API tidak sesuai format

**Solusi**:

1. **Check n8n workflow output**:
   - Verify response format
   - Pastikan ada field `response`

2. **Add response validation**:
   ```typescript
   const data = await response.json();
   
   if (!data.response) {
     throw new Error('Invalid response format');
   }
   ```

3. **Handle different response formats**:
   ```typescript
   // Normalize response
   const normalizedData = {
     response: data.response || data.message || data.text,
     timestamp: data.timestamp || new Date().toISOString(),
   };
   ```

## Masalah Performance

### Slow Loading

**Gejala**: Aplikasi lambat saat loading

**Solusi**:

1. **Analyze bundle size**:
   ```bash
   npm run build:analyze
   ```

2. **Optimize imports**:
   ```typescript
   // ❌ Bad
   import _ from 'lodash';
   
   // ✅ Good
   import debounce from 'lodash/debounce';
   ```

3. **Use dynamic imports**:
   ```typescript
   const HeavyComponent = dynamic(() => import('./HeavyComponent'));
   ```

4. **Optimize images**:
   ```typescript
   import Image from 'next/image';
   
   <Image
     src="/icon.png"
     alt="Icon"
     width={192}
     height={192}
     priority // For above-the-fold images
   />
   ```

### High Memory Usage

**Gejala**: Browser menggunakan banyak memory

**Solusi**:

1. **Check memory leaks**:
   - DevTools → Memory → Take heap snapshot
   - Look for detached DOM nodes

2. **Cleanup effects**:
   ```typescript
   useEffect(() => {
     const timer = setInterval(() => {}, 1000);
     
     return () => clearInterval(timer); // Cleanup
   }, []);
   ```

3. **Limit message history**:
   ```typescript
   // Keep only last 100 messages
   const MAX_MESSAGES = 100;
   setMessages(prev => prev.slice(-MAX_MESSAGES));
   ```

### Slow API Response

**Gejala**: Response dari API lambat

**Solusi**:

1. **Check n8n workflow**:
   - Optimize workflow execution
   - Remove unnecessary nodes
   - Use caching jika applicable

2. **Implement loading states**:
   ```typescript
   const [isLoading, setIsLoading] = useState(false);
   
   // Show loading indicator
   {isLoading && <LoadingSpinner />}
   ```

3. **Add timeout**:
   ```typescript
   const timeout = 30000; // 30 seconds
   const response = await fetch(url, {
     signal: AbortSignal.timeout(timeout),
   });
   ```

## Masalah Browser

### Tidak Berfungsi di Safari

**Gejala**: Aplikasi tidak berfungsi di Safari/iOS

**Solusi**:

1. **Check browser compatibility**:
   - Verify polyfills untuk Safari
   - Test di Safari DevTools

2. **Fix iOS-specific issues**:
   ```css
   /* Fix iOS input zoom */
   input {
     font-size: 16px; /* Prevent zoom on focus */
   }
   
   /* Fix iOS safe area */
   padding-bottom: env(safe-area-inset-bottom);
   ```

3. **Test PWA di iOS**:
   - Install method berbeda (Share → Add to Home Screen)
   - Service worker support terbatas

### Tidak Berfungsi di Firefox

**Gejala**: Fitur tertentu tidak berfungsi di Firefox

**Solusi**:

1. **Check Firefox console** untuk errors

2. **Test PWA support**:
   - Firefox desktop: Limited PWA support
   - Firefox Android: Better support

3. **Use feature detection**:
   ```typescript
   if ('serviceWorker' in navigator) {
     // Register service worker
   }
   ```

### Layout Broken di Mobile

**Gejala**: Layout tidak responsive di mobile

**Solusi**:

1. **Check viewport meta tag**:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1" />
   ```

2. **Test responsive design**:
   - DevTools → Toggle device toolbar
   - Test di berbagai ukuran layar

3. **Fix Tailwind breakpoints**:
   ```typescript
   // Use mobile-first approach
   <div className="w-full md:w-1/2 lg:w-1/3">
   ```

## Diagnostic Tools

### Check Application Health

```bash
# 1. Check if app is accessible
curl -I https://your-app.vercel.app

# 2. Test API endpoint
curl -X POST https://your-app.vercel.app/api/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"health check\"}"

# 3. Check n8n webhook
curl -X POST https://vickymosafan2.app.n8n.cloud/webhook/d49a228d-703d-4a93-8e7a-ed173500fc6e/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"health check\"}"
```

### Browser DevTools Checklist

1. **Console**: Check for JavaScript errors
2. **Network**: Monitor API requests
3. **Application**: 
   - Check service worker status
   - Verify manifest.json
   - Check cache storage
4. **Performance**: Run Lighthouse audit
5. **Memory**: Check for memory leaks

### Vercel Dashboard Checklist

1. **Deployments**: Check deployment status
2. **Logs**: Review error logs
3. **Analytics**: Monitor traffic
4. **Speed Insights**: Check performance metrics

## Getting Help

Jika masalah masih berlanjut:

1. **Check documentation**:
   - [README.md](../README.md)
   - [DEPLOYMENT.md](../DEPLOYMENT.md)
   - [API.md](./API.md)

2. **Search existing issues**:
   - GitHub repository issues
   - Vercel community discussions

3. **Create new issue**:
   - Describe masalah dengan detail
   - Include error messages
   - Provide steps to reproduce
   - Include environment info (OS, browser, Node version)

4. **Contact support**:
   - Vercel support (untuk Pro plan)
   - n8n community forum

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Debugging
npm run type-check       # Check TypeScript errors
npm run lint             # Check linting errors
npm run build:analyze    # Analyze bundle size

# Cleanup
rmdir /s /q .next        # Clear Next.js cache
rmdir /s /q node_modules # Remove dependencies
npm cache clean --force  # Clear npm cache
```

---

**Jika menemukan solusi baru, silakan update dokumen ini! 📝**
