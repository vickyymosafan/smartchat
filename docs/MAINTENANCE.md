# Panduan Maintenance - Aplikasi Chat Dinamis

Dokumen ini menjelaskan prosedur maintenance dan best practices untuk menjaga aplikasi chat dinamis tetap berjalan optimal.

## Daftar Isi

- [Maintenance Rutin](#maintenance-rutin)
- [Update Dependencies](#update-dependencies)
- [Monitoring](#monitoring)
- [Backup dan Recovery](#backup-dan-recovery)
- [Performance Optimization](#performance-optimization)
- [Security Updates](#security-updates)

## Maintenance Rutin

### Daily Checks (Harian)

**1. Monitor Application Health**
- Check aplikasi dapat diakses
- Verify chat functionality berfungsi
- Check response time < 3 detik

```bash
# Quick health check
curl -I https://your-app.vercel.app
```

**2. Check Error Logs**
- Login ke Vercel Dashboard
- Buka tab "Logs"
- Filter errors dalam 24 jam terakhir
- Investigate dan fix critical errors

**3. Monitor n8n Webhook**
- Verify webhook masih aktif
- Check n8n workflow execution logs
- Test webhook dengan curl:

```bash
curl -X POST https://vickymosafan2.app.n8n.cloud/webhook/d49a228d-703d-4a93-8e7a-ed173500fc6e/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"health check"}'
```

### Weekly Checks (Mingguan)

**1. Performance Audit**
- Run Lighthouse audit
- Check Core Web Vitals
- Monitor bundle size

```bash
# Analyze bundle size
npm run build:analyze
```

**2. Security Scan**
- Run npm audit
- Check for vulnerabilities
- Update vulnerable packages

```bash
# Check vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

**3. Review Analytics**
- Check Vercel Analytics
- Monitor user traffic
- Identify performance bottlenecks
- Review error rates

### Monthly Checks (Bulanan)

**1. Dependency Updates**
- Update minor versions
- Test thoroughly sebelum deploy
- Check breaking changes

```bash
# Check outdated packages
npm outdated

# Update dependencies
npm update
```

**2. Code Quality Review**
- Run linter
- Fix code smells
- Refactor jika diperlukan

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Check formatting
npm run format:check
```

**3. Documentation Update**
- Update README jika ada perubahan
- Update API documentation
- Review troubleshooting guide

**4. Backup Configuration**
- Backup environment variables
- Export Vercel configuration
- Document any custom settings

## Update Dependencies

### Check for Updates

```bash
# Check outdated packages
npm outdated

# Check for major updates
npx npm-check-updates
```

### Update Process

**1. Update Minor/Patch Versions** (Aman):

```bash
# Update semua dependencies ke latest minor/patch
npm update

# Test aplikasi
npm run dev
npm run build
```

**2. Update Major Versions** (Hati-hati):

```bash
# Update satu package
npm install package-name@latest

# Atau update semua major versions
npx npm-check-updates -u
npm install

# PENTING: Test thoroughly!
npm run dev
npm run build
npm run type-check
```

**3. Testing After Update**:

```bash
# 1. Type check
npm run type-check

# 2. Lint check
npm run lint

# 3. Build check
npm run build

# 4. Manual testing
npm run dev
# Test semua fitur utama:
# - Kirim pesan
# - Terima response
# - PWA install
# - Offline mode
```

**4. Deploy Update**:

```bash
git add package.json package-lock.json
git commit -m "chore: update dependencies"
git push origin main
```

### Critical Updates

Untuk security updates yang critical:

```bash
# Fix vulnerabilities immediately
npm audit fix

# Force fix (jika diperlukan)
npm audit fix --force

# Test dan deploy ASAP
npm run build
git add .
git commit -m "security: fix vulnerabilities"
git push origin main
```

## Monitoring

### Vercel Dashboard

**1. Deployments**
- Monitor deployment status
- Check build times
- Review deployment logs

**2. Analytics**
- Track page views
- Monitor user engagement
- Identify popular features

**3. Speed Insights**
- Monitor Core Web Vitals
- Track performance metrics
- Identify slow pages

**4. Logs**
- Real-time error monitoring
- Filter by severity
- Track API errors

### Custom Monitoring

**Setup Vercel Analytics** (jika belum):

```bash
# Install package
npm install @vercel/analytics

# Add to layout.tsx
```

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Setup Speed Insights**:

```bash
# Install package
npm install @vercel/speed-insights
```

```typescript
// src/app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### External Monitoring

**Setup Uptime Monitoring** (Recommended):

1. **UptimeRobot** (Free):
   - Monitor: `https://your-app.vercel.app`
   - Interval: 5 menit
   - Alert: Email/SMS jika down

2. **Pingdom** (Paid):
   - Advanced monitoring
   - Performance tracking
   - Detailed reports

## Backup dan Recovery

### Backup Environment Variables

**1. Export dari Vercel**:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Pull environment variables
vercel env pull .env.backup
```

**2. Manual Backup**:

Simpan environment variables di password manager atau secure storage:

```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://...
NEXT_PUBLIC_ENABLE_PWA=true
NODE_ENV=production
```

### Backup Code

**1. Git Repository**:

```bash
# Pastikan semua changes di-commit
git status
git add .
git commit -m "backup: latest changes"
git push origin main

# Create backup branch
git checkout -b backup-$(date +%Y%m%d)
git push origin backup-$(date +%Y%m%d)
```

**2. Download Source Code**:

```bash
# Clone repository ke backup location
git clone https://github.com/your-repo/chat-app.git backup-chat-app
```

### Recovery Process

**Jika deployment bermasalah**:

1. **Rollback di Vercel**:
   - Buka Vercel Dashboard → Deployments
   - Pilih deployment sebelumnya yang stabil
   - Klik "..." → "Promote to Production"

2. **Restore dari Git**:
   ```bash
   # Revert ke commit sebelumnya
   git log --oneline
   git revert <commit-hash>
   git push origin main
   ```

3. **Restore Environment Variables**:
   ```bash
   # Restore dari backup
   vercel env add NEXT_PUBLIC_APP_URL production < .env.backup
   ```

## Performance Optimization

### Bundle Size Optimization

**1. Analyze Bundle**:

```bash
# Run bundle analyzer
npm run build:analyze
```

**2. Optimize Imports**:

```typescript
// ❌ Bad: Import entire library
import _ from 'lodash';

// ✅ Good: Import only what you need
import debounce from 'lodash/debounce';
```

**3. Dynamic Imports**:

```typescript
// ❌ Bad: Static import
import HeavyComponent from './HeavyComponent';

// ✅ Good: Dynamic import
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />
});
```

### Image Optimization

**1. Use Next.js Image**:

```typescript
// ✅ Use Next.js Image component
import Image from 'next/image';

<Image
  src="/icon.png"
  alt="Icon"
  width={192}
  height={192}
  priority
/>
```

**2. Optimize Image Files**:

```bash
# Install image optimization tool
npm install -g sharp-cli

# Optimize images
sharp -i input.png -o output.png --quality 80
```

### Caching Strategy

**1. Service Worker Cache**:

Verify service worker caching berfungsi:
- Buka DevTools → Application → Cache Storage
- Check cached assets
- Test offline mode

**2. Browser Cache**:

Headers sudah dikonfigurasi di `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/icons/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ];
}
```

### Database/API Optimization

**1. Implement Request Caching**:

```typescript
// Cache API responses (jika applicable)
const cache = new Map();

async function getCachedData(key: string) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await fetchData();
  cache.set(key, data);
  return data;
}
```

**2. Debounce User Input**:

```typescript
// Prevent spam requests
const debouncedSend = useMemo(
  () => debounce(sendMessage, 500),
  [sendMessage]
);
```

## Security Updates

### Regular Security Checks

**1. npm audit**:

```bash
# Check vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Fix with breaking changes (careful!)
npm audit fix --force
```

**2. Dependency Security**:

```bash
# Check for known vulnerabilities
npx snyk test

# Monitor continuously
npx snyk monitor
```

### Security Best Practices

**1. Environment Variables**:
- ✅ Never commit `.env.local` atau `.env.production`
- ✅ Use Vercel environment variables
- ✅ Rotate secrets regularly
- ✅ Use different values untuk dev/prod

**2. Dependencies**:
- ✅ Update regularly
- ✅ Review package before installing
- ✅ Use lock files (`package-lock.json`)
- ✅ Audit dependencies monthly

**3. Code Security**:
- ✅ Sanitize user input
- ✅ Validate API requests
- ✅ Use HTTPS only
- ✅ Implement rate limiting

**4. Headers Security**:

Verify security headers di `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ];
}
```

### Incident Response

**Jika terjadi security incident**:

1. **Immediate Actions**:
   - Pause deployments
   - Rotate compromised credentials
   - Review access logs

2. **Investigation**:
   - Identify vulnerability
   - Check affected systems
   - Document incident

3. **Remediation**:
   - Fix vulnerability
   - Update dependencies
   - Deploy patch

4. **Post-Incident**:
   - Review security practices
   - Update documentation
   - Implement preventive measures

## Maintenance Checklist

### Daily
- [ ] Check aplikasi accessible
- [ ] Review error logs
- [ ] Monitor response times

### Weekly
- [ ] Run Lighthouse audit
- [ ] Check npm audit
- [ ] Review analytics
- [ ] Test critical features

### Monthly
- [ ] Update dependencies
- [ ] Run code quality checks
- [ ] Update documentation
- [ ] Backup configuration
- [ ] Review security

### Quarterly
- [ ] Major dependency updates
- [ ] Performance optimization review
- [ ] Security audit
- [ ] Disaster recovery test

## Tools dan Resources

### Monitoring Tools
- [Vercel Dashboard](https://vercel.com/dashboard)
- [UptimeRobot](https://uptimerobot.com/)
- [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Security Tools
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)

### Performance Tools
- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

## Support

Jika memerlukan bantuan maintenance:

1. Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Review [Deployment Guide](../DEPLOYMENT.md)
3. Check Vercel documentation
4. Open issue di repository

---

**Maintenance yang baik = Aplikasi yang stabil dan aman! 🛠️**
