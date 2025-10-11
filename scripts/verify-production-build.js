#!/usr/bin/env node

/**
 * Production Build Verification Script
 * Verifies that the production build meets all requirements
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Production Build...\n');

let hasErrors = false;
let hasWarnings = false;

// Check if .next directory exists
function checkBuildExists() {
  console.log('📦 Checking build output...');
  const buildPath = path.join(process.cwd(), '.next');

  if (!fs.existsSync(buildPath)) {
    console.error(
      '❌ Build directory (.next) not found. Run "npm run build" first.'
    );
    hasErrors = true;
    return false;
  }

  console.log('✅ Build directory exists\n');
  return true;
}

// Check environment variables
function checkEnvironmentVariables() {
  console.log('🔐 Checking environment variables...');

  const requiredVars = ['NEXT_PUBLIC_APP_URL', 'NEXT_PUBLIC_N8N_WEBHOOK_URL'];

  const missingVars = [];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.warn('⚠️  Missing environment variables:');
    missingVars.forEach(varName => {
      console.warn(`   - ${varName}`);
    });
    console.warn(
      '   These should be set in .env.production or Vercel dashboard\n'
    );
    hasWarnings = true;
  } else {
    console.log('✅ All required environment variables are set\n');
  }
}

// Check production mode
function checkProductionMode() {
  console.log('⚙️  Checking production mode...');

  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  NODE_ENV is not set to "production"');
    console.warn('   Set NODE_ENV=production for production builds\n');
    hasWarnings = true;
  } else {
    console.log('✅ NODE_ENV is set to production\n');
  }
}

// Check debug mode
function checkDebugMode() {
  console.log('🐛 Checking debug mode...');

  if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
    console.warn('⚠️  Debug mode is enabled');
    console.warn('   Set NEXT_PUBLIC_DEBUG=false for production\n');
    hasWarnings = true;
  } else {
    console.log('✅ Debug mode is disabled\n');
  }
}

// Check bundle size
function checkBundleSize() {
  console.log('📊 Checking bundle size...');

  const buildManifestPath = path.join(
    process.cwd(),
    '.next',
    'build-manifest.json'
  );

  if (!fs.existsSync(buildManifestPath)) {
    console.warn('⚠️  Build manifest not found, skipping bundle size check\n');
    hasWarnings = true;
    return;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));
    const pages = manifest.pages || {};

    let totalSize = 0;
    let largestChunk = { name: '', size: 0 };

    Object.entries(pages).forEach(([page, files]) => {
      files.forEach(file => {
        const filePath = path.join(process.cwd(), '.next', file);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          totalSize += stats.size;

          if (stats.size > largestChunk.size) {
            largestChunk = { name: file, size: stats.size };
          }
        }
      });
    });

    const totalSizeKB = (totalSize / 1024).toFixed(2);
    const largestChunkKB = (largestChunk.size / 1024).toFixed(2);

    console.log(`   Total bundle size: ${totalSizeKB} KB`);
    console.log(
      `   Largest chunk: ${largestChunk.name} (${largestChunkKB} KB)`
    );

    // Warning thresholds
    if (totalSize > 500 * 1024) {
      // 500 KB
      console.warn('⚠️  Total bundle size is large (> 500 KB)');
      console.warn(
        '   Consider code splitting or removing unused dependencies\n'
      );
      hasWarnings = true;
    } else if (largestChunk.size > 200 * 1024) {
      // 200 KB
      console.warn('⚠️  Largest chunk is large (> 200 KB)');
      console.warn('   Consider splitting this chunk\n');
      hasWarnings = true;
    } else {
      console.log('✅ Bundle size is within acceptable limits\n');
    }
  } catch (error) {
    console.warn('⚠️  Could not analyze bundle size:', error.message, '\n');
    hasWarnings = true;
  }
}

// Check critical files
function checkCriticalFiles() {
  console.log('📄 Checking critical files...');

  const criticalFiles = [
    'public/manifest.json',
    'public/sw.js',
    'public/robots.txt',
    'public/sitemap.xml',
    'public/icons/icon-192x192.png',
    'public/icons/icon-512x512.png',
  ];

  const missingFiles = [];

  criticalFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  });

  if (missingFiles.length > 0) {
    console.warn('⚠️  Missing critical files:');
    missingFiles.forEach(file => {
      console.warn(`   - ${file}`);
    });
    console.warn('');
    hasWarnings = true;
  } else {
    console.log('✅ All critical files are present\n');
  }
}

// Check security
function checkSecurity() {
  console.log('🔒 Checking security configuration...');

  const nextConfigPath = path.join(process.cwd(), 'next.config.ts');

  if (!fs.existsSync(nextConfigPath)) {
    console.error('❌ next.config.ts not found');
    hasErrors = true;
    return;
  }

  const configContent = fs.readFileSync(nextConfigPath, 'utf8');

  const securityChecks = [
    { name: 'HSTS', pattern: /Strict-Transport-Security/i },
    { name: 'X-Frame-Options', pattern: /X-Frame-Options/i },
    { name: 'X-Content-Type-Options', pattern: /X-Content-Type-Options/i },
    { name: 'CSP', pattern: /Content-Security-Policy/i },
  ];

  const missingHeaders = [];

  securityChecks.forEach(check => {
    if (!check.pattern.test(configContent)) {
      missingHeaders.push(check.name);
    }
  });

  if (missingHeaders.length > 0) {
    console.warn('⚠️  Missing security headers:');
    missingHeaders.forEach(header => {
      console.warn(`   - ${header}`);
    });
    console.warn('');
    hasWarnings = true;
  } else {
    console.log('✅ Security headers are configured\n');
  }
}

// Check TypeScript
function checkTypeScript() {
  console.log('📝 Checking TypeScript configuration...');

  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');

  if (!fs.existsSync(tsconfigPath)) {
    console.warn('⚠️  tsconfig.json not found\n');
    hasWarnings = true;
    return;
  }

  console.log('✅ TypeScript configuration exists');
  console.log('   Run "npm run type-check" to verify types\n');
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  SMARTCHAT Production Build Verification');
  console.log('═══════════════════════════════════════════════════════\n');

  checkBuildExists();
  checkEnvironmentVariables();
  checkProductionMode();
  checkDebugMode();
  checkBundleSize();
  checkCriticalFiles();
  checkSecurity();
  checkTypeScript();

  console.log('═══════════════════════════════════════════════════════');

  if (hasErrors) {
    console.log(
      '❌ Verification FAILED - Please fix errors before deploying\n'
    );
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  Verification completed with WARNINGS\n');
    console.log('Review warnings above before deploying to production.\n');
    process.exit(0);
  } else {
    console.log('✅ Verification PASSED - Ready for deployment!\n');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('❌ Verification script failed:', error);
  process.exit(1);
});
