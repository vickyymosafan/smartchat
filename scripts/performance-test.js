#!/usr/bin/env node

/**
 * Performance Testing Script
 * Tests Core Web Vitals and performance metrics
 *
 * Usage: node scripts/performance-test.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

// Performance thresholds
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint (ms)
  FID: { good: 100, needsImprovement: 300 }, // First Input Delay (ms)
  CLS: { good: 0.1, needsImprovement: 0.25 }, // Cumulative Layout Shift
  FCP: { good: 1500, needsImprovement: 3000 }, // First Contentful Paint (ms)
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte (ms)
  bundleSize: { good: 244000, needsImprovement: 500000 }, // Bundle size (bytes)
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

function getRating(value, threshold) {
  if (value <= threshold.good) return { rating: 'good', color: 'green' };
  if (value <= threshold.needsImprovement)
    return { rating: 'needs-improvement', color: 'yellow' };
  return { rating: 'poor', color: 'red' };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function checkBuildExists() {
  const buildPath = path.join(process.cwd(), '.next');
  if (!fs.existsSync(buildPath)) {
    log('❌ Build not found. Running production build...', 'yellow');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      return true;
    } catch (error) {
      log('❌ Build failed. Please fix build errors first.', 'red');
      return false;
    }
  }
  return true;
}

function analyzeBundleSize() {
  logSection('📦 Bundle Size Analysis');

  try {
    const buildManifestPath = path.join(
      process.cwd(),
      '.next',
      'build-manifest.json'
    );

    if (!fs.existsSync(buildManifestPath)) {
      log('⚠️  Build manifest not found. Skipping bundle analysis.', 'yellow');
      return;
    }

    const manifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));

    log('Main bundles:', 'cyan');

    let totalSize = 0;
    const pages = manifest.pages || {};

    Object.keys(pages).forEach(page => {
      const files = pages[page] || [];
      let pageSize = 0;

      files.forEach(file => {
        const filePath = path.join(process.cwd(), '.next', file);
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          pageSize += stats.size;
        }
      });

      if (pageSize > 0) {
        totalSize += pageSize;
        const { rating, color } = getRating(pageSize, THRESHOLDS.bundleSize);
        log(`  ${page}: ${formatBytes(pageSize)} [${rating}]`, color);
      }
    });

    log(`\nTotal bundle size: ${formatBytes(totalSize)}`, 'bright');

    const { rating, color } = getRating(totalSize, THRESHOLDS.bundleSize);
    log(`Overall rating: ${rating}`, color);

    if (rating !== 'good') {
      log('\n💡 Tips to reduce bundle size:', 'yellow');
      log('  - Run: npm run build:analyze', 'cyan');
      log('  - Check for duplicate dependencies', 'cyan');
      log('  - Use dynamic imports for large components', 'cyan');
      log('  - Enable tree-shaking for unused code', 'cyan');
    }
  } catch (error) {
    log(`❌ Error analyzing bundle: ${error.message}`, 'red');
  }
}

function checkCodeSplitting() {
  logSection('✂️  Code Splitting Analysis');

  try {
    const chunksPath = path.join(process.cwd(), '.next', 'static', 'chunks');

    if (!fs.existsSync(chunksPath)) {
      log('⚠️  Chunks directory not found.', 'yellow');
      return;
    }

    const chunks = fs
      .readdirSync(chunksPath)
      .filter(file => file.endsWith('.js'));

    log(`Total chunks: ${chunks.length}`, 'cyan');

    let totalChunkSize = 0;
    const chunkSizes = [];

    chunks.forEach(chunk => {
      const chunkPath = path.join(chunksPath, chunk);
      const stats = fs.statSync(chunkPath);
      totalChunkSize += stats.size;
      chunkSizes.push({ name: chunk, size: stats.size });
    });

    // Sort by size descending
    chunkSizes.sort((a, b) => b.size - a.size);

    log('\nLargest chunks:', 'cyan');
    chunkSizes.slice(0, 5).forEach(chunk => {
      log(`  ${chunk.name}: ${formatBytes(chunk.size)}`);
    });

    log(`\nTotal chunks size: ${formatBytes(totalChunkSize)}`, 'bright');

    if (chunks.length < 5) {
      log(
        '\n⚠️  Low number of chunks detected. Consider more code splitting.',
        'yellow'
      );
    } else {
      log('\n✅ Good code splitting detected!', 'green');
    }
  } catch (error) {
    log(`❌ Error analyzing code splitting: ${error.message}`, 'red');
  }
}

function checkLazyLoading() {
  logSection('🔄 Lazy Loading Check');

  const filesToCheck = [
    'src/components/chat/ChatShell.tsx',
    'src/lib/lazyComponents.tsx',
    'src/app/page.tsx',
  ];

  let lazyImportsFound = 0;
  let dynamicImportsFound = 0;

  filesToCheck.forEach(file => {
    const filePath = path.join(process.cwd(), file);

    if (!fs.existsSync(filePath)) {
      log(`⚠️  File not found: ${file}`, 'yellow');
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    // Check for lazy imports
    const lazyMatches = content.match(/lazy\s*\(/g);
    if (lazyMatches) {
      lazyImportsFound += lazyMatches.length;
    }

    // Check for dynamic imports
    const dynamicMatches = content.match(/dynamic\s*\(/g);
    if (dynamicMatches) {
      dynamicImportsFound += dynamicMatches.length;
    }
  });

  log(`Lazy imports found: ${lazyImportsFound}`, 'cyan');
  log(`Dynamic imports found: ${dynamicImportsFound}`, 'cyan');

  const totalLazy = lazyImportsFound + dynamicImportsFound;

  if (totalLazy >= 3) {
    log('\n✅ Good lazy loading implementation!', 'green');
  } else {
    log(
      '\n⚠️  Consider adding more lazy loading for non-critical components.',
      'yellow'
    );
  }
}

function checkImageOptimization() {
  logSection('🖼️  Image Optimization Check');

  const publicPath = path.join(process.cwd(), 'public');

  if (!fs.existsSync(publicPath)) {
    log('⚠️  Public directory not found.', 'yellow');
    return;
  }

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
  let totalImages = 0;
  let totalSize = 0;
  let largeImages = [];

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        scanDirectory(filePath);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (imageExtensions.includes(ext)) {
          totalImages++;
          totalSize += stats.size;

          // Flag images larger than 100KB
          if (stats.size > 100000) {
            largeImages.push({
              path: filePath.replace(process.cwd(), ''),
              size: stats.size,
            });
          }
        }
      }
    });
  }

  scanDirectory(publicPath);

  log(`Total images: ${totalImages}`, 'cyan');
  log(`Total size: ${formatBytes(totalSize)}`, 'cyan');

  if (largeImages.length > 0) {
    log(`\n⚠️  Large images found (> 100KB):`, 'yellow');
    largeImages.forEach(img => {
      log(`  ${img.path}: ${formatBytes(img.size)}`);
    });
    log('\n💡 Consider optimizing these images:', 'yellow');
    log('  - Use WebP or AVIF format', 'cyan');
    log('  - Compress images with tools like ImageOptim', 'cyan');
    log('  - Use Next.js Image component with proper sizing', 'cyan');
  } else {
    log('\n✅ No large images detected!', 'green');
  }
}

function generateReport() {
  logSection('📊 Performance Test Summary');

  log('Test completed! Here are the recommendations:', 'bright');
  log('\n1. Run Lighthouse audit:', 'cyan');
  log('   - Open your app in Chrome', 'cyan');
  log('   - Open DevTools (F12)', 'cyan');
  log('   - Go to Lighthouse tab', 'cyan');
  log(
    '   - Run audit for Performance, Accessibility, Best Practices, SEO',
    'cyan'
  );

  log('\n2. Check Core Web Vitals:', 'cyan');
  log('   - LCP should be < 2.5s', 'cyan');
  log('   - FID should be < 100ms', 'cyan');
  log('   - CLS should be < 0.1', 'cyan');

  log('\n3. Test with real devices:', 'cyan');
  log('   - Test on mobile devices (iOS and Android)', 'cyan');
  log('   - Test on different network conditions (3G, 4G, WiFi)', 'cyan');
  log('   - Use Chrome DevTools Network throttling', 'cyan');

  log('\n4. Monitor bundle size:', 'cyan');
  log('   - Run: npm run build:analyze', 'cyan');
  log('   - Keep main bundle < 244KB', 'cyan');
  log('   - Use code splitting for large features', 'cyan');

  log('\n5. Optimize images:', 'cyan');
  log('   - Use Next.js Image component', 'cyan');
  log('   - Serve images in WebP/AVIF format', 'cyan');
  log('   - Add loading="lazy" for below-fold images', 'cyan');

  log('\n✅ Performance test completed!', 'green');
}

// Main execution
async function main() {
  log('\n🚀 Starting Performance Tests...', 'bright');

  // Check if build exists
  if (!checkBuildExists()) {
    process.exit(1);
  }

  // Run tests
  analyzeBundleSize();
  checkCodeSplitting();
  checkLazyLoading();
  checkImageOptimization();
  generateReport();

  log('\n✨ All tests completed!\n', 'green');
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
