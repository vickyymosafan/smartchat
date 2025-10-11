/**
 * Lighthouse Performance Testing Script
 *
 * Script ini menjalankan Lighthouse audit untuk mengukur Core Web Vitals
 * dan performance metrics lainnya.
 *
 * Usage:
 * 1. Build aplikasi: npm run build
 * 2. Start production server: npm start
 * 3. Run script: node scripts/lighthouse-test.js
 *
 * Requirements:
 * - npm install -g lighthouse
 * - atau npm install --save-dev lighthouse
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  url: process.env.LIGHTHOUSE_URL || 'http://localhost:3000',
  outputPath: path.join(__dirname, '../lighthouse-report.html'),
  jsonOutputPath: path.join(__dirname, '../lighthouse-report.json'),
  thresholds: {
    performance: 90,
    accessibility: 95,
    'best-practices': 90,
    seo: 95,
    pwa: 80,
  },
  coreWebVitals: {
    lcp: 2500, // Largest Contentful Paint (ms)
    fid: 100, // First Input Delay (ms)
    cls: 0.1, // Cumulative Layout Shift
  },
};

/**
 * Run Lighthouse audit
 */
async function runLighthouse() {
  console.log('🚀 Starting Lighthouse audit...');
  console.log(`📍 URL: ${CONFIG.url}`);
  console.log('');

  let chrome;

  try {
    // Launch Chrome
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
    });

    // Run Lighthouse
    const options = {
      logLevel: 'info',
      output: ['html', 'json'],
      onlyCategories: [
        'performance',
        'accessibility',
        'best-practices',
        'seo',
        'pwa',
      ],
      port: chrome.port,
    };

    const runnerResult = await lighthouse(CONFIG.url, options);

    // Extract results
    const { lhr } = runnerResult;
    const scores = {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      'best-practices': Math.round(
        lhr.categories['best-practices'].score * 100
      ),
      seo: Math.round(lhr.categories.seo.score * 100),
      pwa: Math.round(lhr.categories.pwa.score * 100),
    };

    // Extract Core Web Vitals
    const metrics = lhr.audits['metrics'].details.items[0];
    const coreWebVitals = {
      lcp: Math.round(metrics.largestContentfulPaint),
      fid: Math.round(metrics.maxPotentialFID || 0),
      cls: parseFloat(metrics.cumulativeLayoutShift.toFixed(3)),
      fcp: Math.round(metrics.firstContentfulPaint),
      tti: Math.round(metrics.interactive),
      tbt: Math.round(metrics.totalBlockingTime),
      si: Math.round(metrics.speedIndex),
    };

    // Save reports
    fs.writeFileSync(CONFIG.outputPath, runnerResult.report[0]);
    fs.writeFileSync(CONFIG.jsonOutputPath, JSON.stringify(lhr, null, 2));

    // Print results
    console.log('📊 Lighthouse Scores:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Object.entries(scores).forEach(([category, score]) => {
      const threshold = CONFIG.thresholds[category];
      const status = score >= threshold ? '✅' : '❌';
      const color = score >= threshold ? '\x1b[32m' : '\x1b[31m';
      console.log(
        `${status} ${category.padEnd(20)} ${color}${score}\x1b[0m / ${threshold}`
      );
    });
    console.log('');

    console.log('🎯 Core Web Vitals:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // LCP
    const lcpStatus =
      coreWebVitals.lcp <= CONFIG.coreWebVitals.lcp ? '✅' : '❌';
    const lcpColor =
      coreWebVitals.lcp <= CONFIG.coreWebVitals.lcp ? '\x1b[32m' : '\x1b[31m';
    console.log(
      `${lcpStatus} LCP (Largest Contentful Paint)  ${lcpColor}${coreWebVitals.lcp}ms\x1b[0m / ${CONFIG.coreWebVitals.lcp}ms`
    );

    // FID
    const fidStatus =
      coreWebVitals.fid <= CONFIG.coreWebVitals.fid ? '✅' : '❌';
    const fidColor =
      coreWebVitals.fid <= CONFIG.coreWebVitals.fid ? '\x1b[32m' : '\x1b[31m';
    console.log(
      `${fidStatus} FID (First Input Delay)         ${fidColor}${coreWebVitals.fid}ms\x1b[0m / ${CONFIG.coreWebVitals.fid}ms`
    );

    // CLS
    const clsStatus =
      coreWebVitals.cls <= CONFIG.coreWebVitals.cls ? '✅' : '❌';
    const clsColor =
      coreWebVitals.cls <= CONFIG.coreWebVitals.cls ? '\x1b[32m' : '\x1b[31m';
    console.log(
      `${clsStatus} CLS (Cumulative Layout Shift)   ${clsColor}${coreWebVitals.cls}\x1b[0m / ${CONFIG.coreWebVitals.cls}`
    );

    console.log('');
    console.log('📈 Other Metrics:');
    console.log(`   FCP (First Contentful Paint)    ${coreWebVitals.fcp}ms`);
    console.log(`   TTI (Time to Interactive)       ${coreWebVitals.tti}ms`);
    console.log(`   TBT (Total Blocking Time)       ${coreWebVitals.tbt}ms`);
    console.log(`   SI (Speed Index)                ${coreWebVitals.si}ms`);
    console.log('');

    console.log('📄 Reports saved:');
    console.log(`   HTML: ${CONFIG.outputPath}`);
    console.log(`   JSON: ${CONFIG.jsonOutputPath}`);
    console.log('');

    // Check if all thresholds are met
    const allScoresPassed = Object.entries(scores).every(
      ([category, score]) => score >= CONFIG.thresholds[category]
    );
    const allCWVPassed =
      coreWebVitals.lcp <= CONFIG.coreWebVitals.lcp &&
      coreWebVitals.fid <= CONFIG.coreWebVitals.fid &&
      coreWebVitals.cls <= CONFIG.coreWebVitals.cls;

    if (allScoresPassed && allCWVPassed) {
      console.log('✅ All performance targets met! 🎉');
      process.exit(0);
    } else {
      console.log(
        '❌ Some performance targets not met. Please review the report.'
      );
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error running Lighthouse:', error);
    process.exit(1);
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

// Check if lighthouse is installed
try {
  require.resolve('lighthouse');
  require.resolve('chrome-launcher');
} catch (error) {
  console.error('❌ Lighthouse not installed. Please run:');
  console.error('   npm install --save-dev lighthouse chrome-launcher');
  process.exit(1);
}

// Run the audit
runLighthouse();
