/**
 * Browser Compatibility Testing Script
 *
 * This script checks for browser compatibility with the UI/UX improvements.
 * Run this in the browser console to verify feature support.
 */

(function () {
  'use strict';

  const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
  };

  function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  function checkFeature(name, supported) {
    const icon = supported ? '✓' : '✗';
    const color = supported ? colors.green : colors.red;
    log(`${icon} ${name}`, color);
    return supported;
  }

  // Browser Detection
  function detectBrowser() {
    const ua = navigator.userAgent;
    let browser = { name: 'Unknown', version: 'Unknown' };

    if (ua.indexOf('Firefox') > -1) {
      browser.name = 'Firefox';
      browser.version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Edg') > -1) {
      browser.name = 'Edge';
      browser.version = ua.match(/Edg\/([0-9.]+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Chrome') > -1) {
      browser.name = 'Chrome';
      browser.version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Safari') > -1) {
      browser.name = 'Safari';
      browser.version = ua.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
    }

    return browser;
  }

  // CSS Feature Detection
  function checkCSSFeatures() {
    log('\n=== CSS Features ===', colors.blue);

    const features = {
      'CSS Grid': CSS.supports('display', 'grid'),
      'CSS Flexbox': CSS.supports('display', 'flex'),
      'CSS Variables': CSS.supports('--test', '0'),
      'CSS Animations': CSS.supports('animation', 'test 1s'),
      'CSS Transforms': CSS.supports('transform', 'translateX(0)'),
      'CSS Transitions': CSS.supports('transition', 'all 0.3s'),
      'Border Radius': CSS.supports('border-radius', '8px'),
      'Box Shadow': CSS.supports('box-shadow', '0 0 10px rgba(0,0,0,0.1)'),
      'Backdrop Filter': CSS.supports('backdrop-filter', 'blur(10px)'),
      'CSS Containment': CSS.supports('contain', 'layout'),
    };

    let allSupported = true;
    for (const [name, supported] of Object.entries(features)) {
      if (!checkFeature(name, supported)) {
        allSupported = false;
      }
    }

    return allSupported;
  }

  // JavaScript API Detection
  function checkJSAPIs() {
    log('\n=== JavaScript APIs ===', colors.blue);

    const apis = {
      'Intersection Observer': 'IntersectionObserver' in window,
      'Resize Observer': 'ResizeObserver' in window,
      'Request Animation Frame': 'requestAnimationFrame' in window,
      'Local Storage': 'localStorage' in window,
      'Session Storage': 'sessionStorage' in window,
      'Fetch API': 'fetch' in window,
      Promise: 'Promise' in window,
      'Async/Await': (async () => {})().constructor.name === 'Promise',
    };

    let allSupported = true;
    for (const [name, supported] of Object.entries(apis)) {
      if (!checkFeature(name, supported)) {
        allSupported = false;
      }
    }

    return allSupported;
  }

  // Touch and Input Detection
  function checkInputCapabilities() {
    log('\n=== Input Capabilities ===', colors.blue);

    const capabilities = {
      'Touch Events': 'ontouchstart' in window,
      'Pointer Events': 'PointerEvent' in window,
      'Mouse Events': 'MouseEvent' in window,
      'Keyboard Events': 'KeyboardEvent' in window,
      'Clipboard API': 'clipboard' in navigator,
    };

    for (const [name, supported] of Object.entries(capabilities)) {
      checkFeature(name, supported);
    }
  }

  // Viewport and Screen Info
  function checkViewportInfo() {
    log('\n=== Viewport Information ===', colors.blue);

    const info = {
      'Screen Width': screen.width,
      'Screen Height': screen.height,
      'Viewport Width': window.innerWidth,
      'Viewport Height': window.innerHeight,
      'Device Pixel Ratio': window.devicePixelRatio,
      'Color Depth': screen.colorDepth,
      Orientation: screen.orientation?.type || 'Unknown',
    };

    for (const [name, value] of Object.entries(info)) {
      log(`  ${name}: ${value}`);
    }

    // Determine device type
    const width = window.innerWidth;
    let deviceType = 'Desktop';
    if (width < 640) deviceType = 'Mobile';
    else if (width < 1024) deviceType = 'Tablet';

    log(`  Device Type: ${deviceType}`, colors.yellow);
  }

  // Performance Capabilities
  function checkPerformanceAPIs() {
    log('\n=== Performance APIs ===', colors.blue);

    const apis = {
      'Performance API': 'performance' in window,
      'Performance Observer': 'PerformanceObserver' in window,
      'Navigation Timing': 'performance' in window && 'timing' in performance,
      'Resource Timing':
        'performance' in window && 'getEntriesByType' in performance,
      'User Timing': 'performance' in window && 'mark' in performance,
    };

    for (const [name, supported] of Object.entries(apis)) {
      checkFeature(name, supported);
    }
  }

  // Animation Performance Test
  function testAnimationPerformance() {
    log('\n=== Animation Performance Test ===', colors.blue);
    log('Testing for 3 seconds...', colors.yellow);

    let frameCount = 0;
    let lastTime = performance.now();
    let fps = [];
    let testDuration = 3000; // 3 seconds
    let startTime = performance.now();

    function countFrames(currentTime) {
      frameCount++;

      if (currentTime >= lastTime + 1000) {
        const currentFPS = Math.round(
          (frameCount * 1000) / (currentTime - lastTime)
        );
        fps.push(currentFPS);
        frameCount = 0;
        lastTime = currentTime;
      }

      if (currentTime - startTime < testDuration) {
        requestAnimationFrame(countFrames);
      } else {
        // Calculate statistics
        const avgFPS = Math.round(fps.reduce((a, b) => a + b, 0) / fps.length);
        const minFPS = Math.min(...fps);
        const maxFPS = Math.max(...fps);

        log(
          `  Average FPS: ${avgFPS}`,
          avgFPS >= 55 ? colors.green : colors.red
        );
        log(`  Min FPS: ${minFPS}`);
        log(`  Max FPS: ${maxFPS}`);

        if (avgFPS >= 55) {
          log('✓ Animation performance is excellent!', colors.green);
        } else if (avgFPS >= 30) {
          log(
            '⚠ Animation performance is acceptable but could be better',
            colors.yellow
          );
        } else {
          log('✗ Animation performance is poor', colors.red);
        }
      }
    }

    requestAnimationFrame(countFrames);
  }

  // Color Rendering Test
  function testColorRendering() {
    log('\n=== Color Rendering Test ===', colors.blue);

    const testColors = {
      'Gray 950': '#0A0A0A',
      'Gray 900': '#171717',
      'Gray 800': '#262626',
      'Gray 700': '#404040',
      'Gray 600': '#525252',
      'Gray 500': '#737373',
      'Gray 400': '#A3A3A3',
      'Gray 300': '#D4D4D4',
      'Gray 200': '#E5E5E5',
      'Gray 100': '#F5F5F5',
      'Gray 50': '#FAFAFA',
    };

    // Create a temporary element to test color rendering
    const testDiv = document.createElement('div');
    testDiv.style.position = 'absolute';
    testDiv.style.left = '-9999px';
    document.body.appendChild(testDiv);

    let allCorrect = true;
    for (const [name, color] of Object.entries(testColors)) {
      testDiv.style.backgroundColor = color;
      const computed = window.getComputedStyle(testDiv).backgroundColor;

      // Convert hex to rgb for comparison
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const expected = `rgb(${r}, ${g}, ${b})`;

      const matches =
        computed === expected || computed === `rgba(${r}, ${g}, ${b}, 1)`;

      if (!matches) {
        log(`  ${name}: Expected ${expected}, got ${computed}`, colors.yellow);
        allCorrect = false;
      }
    }

    document.body.removeChild(testDiv);

    if (allCorrect) {
      log('✓ All colors render correctly', colors.green);
    } else {
      log('⚠ Some color rendering differences detected', colors.yellow);
      log(
        '  This may be due to color profiles and is usually acceptable',
        colors.yellow
      );
    }
  }

  // Media Query Support
  function checkMediaQueries() {
    log('\n=== Media Query Support ===', colors.blue);

    const queries = {
      'Prefers Reduced Motion': window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches,
      'Prefers Color Scheme Dark': window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches,
      'Hover Support': window.matchMedia('(hover: hover)').matches,
      'Pointer Fine': window.matchMedia('(pointer: fine)').matches,
      'Pointer Coarse': window.matchMedia('(pointer: coarse)').matches,
    };

    for (const [name, value] of Object.entries(queries)) {
      log(`  ${name}: ${value ? 'Yes' : 'No'}`);
    }
  }

  // Main Test Runner
  function runAllTests() {
    const browser = detectBrowser();

    log('\n╔════════════════════════════════════════════╗', colors.blue);
    log('║   Browser Compatibility Test Suite        ║', colors.blue);
    log('╚════════════════════════════════════════════╝', colors.blue);

    log(`\nBrowser: ${browser.name} ${browser.version}`, colors.yellow);
    log(`Platform: ${navigator.platform}`, colors.yellow);
    log(`User Agent: ${navigator.userAgent}`, colors.yellow);

    const cssSupported = checkCSSFeatures();
    const jsSupported = checkJSAPIs();

    checkInputCapabilities();
    checkViewportInfo();
    checkPerformanceAPIs();
    checkMediaQueries();
    testColorRendering();
    testAnimationPerformance();

    // Final Summary
    log('\n╔════════════════════════════════════════════╗', colors.blue);
    log('║   Test Summary                             ║', colors.blue);
    log('╚════════════════════════════════════════════╝', colors.blue);

    if (cssSupported && jsSupported) {
      log('\n✓ All critical features are supported!', colors.green);
      log(
        'This browser is fully compatible with the UI/UX improvements.',
        colors.green
      );
    } else {
      log('\n⚠ Some features are not supported', colors.yellow);
      log(
        'The application may not work optimally in this browser.',
        colors.yellow
      );
    }

    log('\nFor detailed testing, open test-cross-browser.html', colors.blue);
  }

  // Export for use in console
  window.browserCompatTest = {
    runAll: runAllTests,
    checkCSS: checkCSSFeatures,
    checkJS: checkJSAPIs,
    checkInput: checkInputCapabilities,
    checkViewport: checkViewportInfo,
    checkPerformance: checkPerformanceAPIs,
    testAnimation: testAnimationPerformance,
    testColors: testColorRendering,
    detectBrowser: detectBrowser,
  };

  // Auto-run if script is loaded directly
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
  } else {
    runAllTests();
  }

  log('\n💡 Tip: You can run individual tests using:', colors.blue);
  log('   browserCompatTest.checkCSS()', colors.yellow);
  log('   browserCompatTest.testAnimation()', colors.yellow);
  log('   browserCompatTest.testColors()', colors.yellow);
})();
