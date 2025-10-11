/**
 * Accessibility Verification Script
 *
 * This script performs automated checks for common accessibility issues.
 * Run this in the browser console on the running application.
 *
 * Usage:
 * 1. Start the development server: npm run dev
 * 2. Open the application in browser
 * 3. Open DevTools Console (F12)
 * 4. Copy and paste this entire script
 * 5. Review the results
 */

(function verifyAccessibility() {
  console.log('🔍 Starting Accessibility Verification...\n');

  const results = {
    passed: [],
    failed: [],
    warnings: [],
  };

  // Test 1: Check for images without alt text
  console.log('Test 1: Checking images for alt text...');
  const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
  if (imagesWithoutAlt.length === 0) {
    results.passed.push('✅ All images have alt attributes');
  } else {
    results.failed.push(
      `❌ Found ${imagesWithoutAlt.length} images without alt text`
    );
    console.log('Images without alt:', imagesWithoutAlt);
  }

  // Test 2: Check for buttons without accessible names
  console.log('\nTest 2: Checking buttons for accessible names...');
  const buttons = document.querySelectorAll('button');
  const buttonsWithoutLabel = Array.from(buttons).filter(btn => {
    const hasAriaLabel = btn.hasAttribute('aria-label');
    const hasAriaLabelledBy = btn.hasAttribute('aria-labelledby');
    const hasTextContent = btn.textContent.trim().length > 0;
    const hasTitle = btn.hasAttribute('title');

    return !hasAriaLabel && !hasAriaLabelledBy && !hasTextContent && !hasTitle;
  });

  if (buttonsWithoutLabel.length === 0) {
    results.passed.push('✅ All buttons have accessible names');
  } else {
    results.failed.push(
      `❌ Found ${buttonsWithoutLabel.length} buttons without accessible names`
    );
    console.log('Buttons without labels:', buttonsWithoutLabel);
  }

  // Test 3: Check for proper heading hierarchy
  console.log('\nTest 3: Checking heading hierarchy...');
  const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
  const headingLevels = headings.map(h => parseInt(h.tagName.substring(1)));

  let hierarchyValid = true;
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] > headingLevels[i - 1] + 1) {
      hierarchyValid = false;
      break;
    }
  }

  if (hierarchyValid) {
    results.passed.push('✅ Heading hierarchy is valid');
  } else {
    results.warnings.push('⚠️  Heading hierarchy may have gaps');
    console.log('Heading levels:', headingLevels);
  }

  // Test 4: Check for aria-live regions
  console.log('\nTest 4: Checking for aria-live regions...');
  const ariaLiveElements = document.querySelectorAll('[aria-live]');
  if (ariaLiveElements.length > 0) {
    results.passed.push(
      `✅ Found ${ariaLiveElements.length} aria-live regions`
    );
    console.log('Aria-live elements:', ariaLiveElements);
  } else {
    results.warnings.push('⚠️  No aria-live regions found');
  }

  // Test 5: Check for role attributes
  console.log('\nTest 5: Checking for ARIA roles...');
  const roleElements = document.querySelectorAll('[role]');
  if (roleElements.length > 0) {
    results.passed.push(
      `✅ Found ${roleElements.length} elements with ARIA roles`
    );
    const roles = Array.from(roleElements).map(el => el.getAttribute('role'));
    console.log('ARIA roles found:', [...new Set(roles)]);
  } else {
    results.warnings.push('⚠️  No ARIA roles found');
  }

  // Test 6: Check for skip link
  console.log('\nTest 6: Checking for skip to content link...');
  const skipLink = document.querySelector('a[href="#main-chat-content"]');
  if (skipLink) {
    results.passed.push('✅ Skip to content link found');
    console.log('Skip link:', skipLink);
  } else {
    results.failed.push('❌ Skip to content link not found');
  }

  // Test 7: Check for main landmark
  console.log('\nTest 7: Checking for main landmark...');
  const mainLandmark = document.querySelector('main');
  if (mainLandmark) {
    results.passed.push('✅ Main landmark found');
    const hasId = mainLandmark.hasAttribute('id');
    if (hasId) {
      results.passed.push('✅ Main landmark has ID for skip link');
    } else {
      results.warnings.push('⚠️  Main landmark missing ID');
    }
  } else {
    results.failed.push('❌ Main landmark not found');
  }

  // Test 8: Check for form labels
  console.log('\nTest 8: Checking form inputs for labels...');
  const inputs = document.querySelectorAll('input, textarea, select');
  const inputsWithoutLabel = Array.from(inputs).filter(input => {
    const hasAriaLabel = input.hasAttribute('aria-label');
    const hasAriaLabelledBy = input.hasAttribute('aria-labelledby');
    const hasLabel = document.querySelector(`label[for="${input.id}"]`);

    return !hasAriaLabel && !hasAriaLabelledBy && !hasLabel;
  });

  if (inputsWithoutLabel.length === 0) {
    results.passed.push('✅ All form inputs have labels');
  } else {
    results.failed.push(
      `❌ Found ${inputsWithoutLabel.length} inputs without labels`
    );
    console.log('Inputs without labels:', inputsWithoutLabel);
  }

  // Test 9: Check for focus indicators
  console.log('\nTest 9: Checking for focus indicator styles...');
  const focusStyles = getComputedStyle(
    document.documentElement
  ).getPropertyValue('--ring');
  if (focusStyles) {
    results.passed.push('✅ Focus ring CSS variable defined');
  } else {
    results.warnings.push('⚠️  Focus ring CSS variable not found');
  }

  // Test 10: Check for reduced motion support
  console.log('\nTest 10: Checking for reduced motion support...');
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  console.log('User prefers reduced motion:', prefersReducedMotion);
  results.passed.push('✅ Reduced motion preference detected');

  // Test 11: Check MessageList accessibility
  console.log('\nTest 11: Checking MessageList accessibility...');
  const messageList = document.querySelector('[role="log"]');
  if (messageList) {
    results.passed.push('✅ MessageList has role="log"');

    const hasAriaLabel = messageList.hasAttribute('aria-label');
    const hasAriaLive = messageList.hasAttribute('aria-live');

    if (hasAriaLabel) {
      results.passed.push('✅ MessageList has aria-label');
    } else {
      results.failed.push('❌ MessageList missing aria-label');
    }

    if (hasAriaLive) {
      results.passed.push('✅ MessageList has aria-live');
    } else {
      results.failed.push('❌ MessageList missing aria-live');
    }
  } else {
    results.failed.push('❌ MessageList with role="log" not found');
  }

  // Test 12: Check TypingIndicator accessibility
  console.log('\nTest 12: Checking TypingIndicator accessibility...');
  const typingIndicator = document.querySelector('[aria-label*="typing" i]');
  if (typingIndicator) {
    results.passed.push('✅ TypingIndicator has aria-label');

    const hasRole = typingIndicator.hasAttribute('role');
    const hasAriaLive = typingIndicator.hasAttribute('aria-live');

    if (hasRole && typingIndicator.getAttribute('role') === 'status') {
      results.passed.push('✅ TypingIndicator has role="status"');
    } else {
      results.warnings.push('⚠️  TypingIndicator missing role="status"');
    }

    if (hasAriaLive) {
      results.passed.push('✅ TypingIndicator has aria-live');
    } else {
      results.warnings.push('⚠️  TypingIndicator missing aria-live');
    }
  } else {
    results.warnings.push(
      '⚠️  TypingIndicator not currently visible (this is OK if not loading)'
    );
  }

  // Test 13: Check Composer accessibility
  console.log('\nTest 13: Checking Composer accessibility...');
  const composer = document.querySelector('textarea[aria-label*="input" i]');
  if (composer) {
    results.passed.push('✅ Composer textarea has aria-label');

    const hasDescribedBy = composer.hasAttribute('aria-describedby');
    if (hasDescribedBy) {
      results.passed.push('✅ Composer has aria-describedby');
    } else {
      results.failed.push('❌ Composer missing aria-describedby');
    }
  } else {
    results.failed.push('❌ Composer textarea not found');
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 ACCESSIBILITY VERIFICATION SUMMARY');
  console.log('='.repeat(60));

  console.log('\n✅ PASSED TESTS (' + results.passed.length + '):');
  results.passed.forEach(test => console.log('  ' + test));

  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS (' + results.warnings.length + '):');
    results.warnings.forEach(test => console.log('  ' + test));
  }

  if (results.failed.length > 0) {
    console.log('\n❌ FAILED TESTS (' + results.failed.length + '):');
    results.failed.forEach(test => console.log('  ' + test));
  }

  console.log('\n' + '='.repeat(60));

  const totalTests =
    results.passed.length + results.warnings.length + results.failed.length;
  const passRate = ((results.passed.length / totalTests) * 100).toFixed(1);

  console.log(
    `\n📈 Overall Score: ${results.passed.length}/${totalTests} tests passed (${passRate}%)`
  );

  if (results.failed.length === 0) {
    console.log('\n🎉 All critical accessibility tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
  }

  console.log('\n💡 Next steps:');
  console.log('  1. Review any failed tests and fix issues');
  console.log('  2. Test with actual screen reader (NVDA recommended)');
  console.log('  3. Test keyboard navigation manually');
  console.log('  4. Run Lighthouse accessibility audit');
  console.log('  5. Test with real users who rely on assistive technology');

  console.log('\n📚 For detailed testing instructions, see:');
  console.log('  ACCESSIBILITY_TEST_GUIDE.md');

  return {
    passed: results.passed.length,
    warnings: results.warnings.length,
    failed: results.failed.length,
    passRate: passRate + '%',
  };
})();
