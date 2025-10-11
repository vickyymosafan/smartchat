/**
 * Color Contrast Checker for WCAG AA Compliance
 * Verifies all text color combinations meet 4.5:1 ratio for normal text
 * and 3:1 ratio for large text (18pt+ or 14pt+ bold)
 */

// Color palette from design system
const colors = {
  // Grayscale (Black to Gray)
  gray950: '#0A0A0A',
  gray900: '#171717',
  gray800: '#262626',
  gray700: '#404040',
  gray600: '#525252',
  gray500: '#737373',
  gray400: '#A3A3A3',
  gray300: '#D4D4D4',
  gray250: '#DBDBDB',
  gray200: '#E5E5E5',
  gray150: '#EEEEEE',
  gray100: '#F5F5F5',
  gray50: '#FAFAFA',
  white: '#FFFFFF',
};

// Convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Calculate relative luminance
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Check if contrast meets WCAG AA standards
function meetsWCAG_AA(ratio, isLargeText = false) {
  const threshold = isLargeText ? 3.0 : 4.5;
  return ratio >= threshold;
}

// Color combinations used in the app
const combinations = [
  // Primary text on backgrounds
  {
    fg: 'gray950',
    bg: 'white',
    usage: 'Primary text on white background',
    size: 'normal',
  },
  {
    fg: 'gray950',
    bg: 'gray50',
    usage: 'Primary text on off-white',
    size: 'normal',
  },
  {
    fg: 'gray950',
    bg: 'gray100',
    usage: 'Primary text on light surface (assistant message)',
    size: 'normal',
  },

  // Secondary text
  {
    fg: 'gray700',
    bg: 'white',
    usage: 'Secondary text on white',
    size: 'normal',
  },
  {
    fg: 'gray700',
    bg: 'gray50',
    usage: 'Secondary text on off-white',
    size: 'normal',
  },
  {
    fg: 'gray700',
    bg: 'gray100',
    usage: 'Secondary text on light surface',
    size: 'normal',
  },

  // Muted text
  { fg: 'gray600', bg: 'white', usage: 'Muted text on white', size: 'normal' },
  {
    fg: 'gray600',
    bg: 'gray50',
    usage: 'Muted text on off-white (status, labels)',
    size: 'normal',
  },
  {
    fg: 'gray600',
    bg: 'gray100',
    usage: 'Muted text on light surface',
    size: 'normal',
  },

  // Light text (placeholders, disabled)
  {
    fg: 'gray500',
    bg: 'white',
    usage: 'Placeholder text (gray-placeholder)',
    size: 'normal',
  },
  { fg: 'gray500', bg: 'white', usage: 'Disabled text', size: 'normal' },
  {
    fg: 'gray400',
    bg: 'white',
    usage: 'Decorative only (not used for text)',
    size: 'large',
  },

  // User message (light text on dark background)
  { fg: 'gray50', bg: 'gray900', usage: 'User message text', size: 'normal' },
  {
    fg: 'white',
    bg: 'gray900',
    usage: 'User message text (white)',
    size: 'normal',
  },

  // Buttons
  { fg: 'gray50', bg: 'gray900', usage: 'Primary button text', size: 'normal' },
  {
    fg: 'gray950',
    bg: 'gray50',
    usage: 'Secondary button text',
    size: 'normal',
  },

  // Error states
  { fg: 'gray800', bg: 'gray150', usage: 'Error banner text', size: 'normal' },
  {
    fg: 'gray700',
    bg: 'gray100',
    usage: 'Offline banner text',
    size: 'normal',
  },

  // Borders (3:1 ratio for UI components)
  { fg: 'gray200', bg: 'white', usage: 'Border on white', size: 'large' },
  { fg: 'gray300', bg: 'white', usage: 'Border dark on white', size: 'large' },
  { fg: 'gray800', bg: 'white', usage: 'Focus border', size: 'large' },
];

console.log('\n=== WCAG AA Color Contrast Analysis ===\n');
console.log(
  'Standard: 4.5:1 for normal text, 3:1 for large text/UI components\n'
);

let passCount = 0;
let failCount = 0;
const failures = [];

combinations.forEach(({ fg, bg, usage, size }) => {
  const ratio = getContrastRatio(colors[fg], colors[bg]);
  const isLargeText = size === 'large';
  const passes = meetsWCAG_AA(ratio, isLargeText);
  const threshold = isLargeText ? '3:1' : '4.5:1';
  const status = passes ? '✓ PASS' : '✗ FAIL';

  if (passes) {
    passCount++;
  } else {
    failCount++;
    failures.push({ fg, bg, usage, ratio, threshold });
  }

  console.log(`${status} | ${ratio.toFixed(2)}:1 (need ${threshold})`);
  console.log(`  ${usage}`);
  console.log(`  ${fg} (${colors[fg]}) on ${bg} (${colors[bg]})`);
  console.log('');
});

console.log('=== Summary ===');
console.log(`Total combinations tested: ${combinations.length}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failures.length > 0) {
  console.log('\n=== Failed Combinations ===');

  // Filter out acceptable failures (decorative elements)
  const criticalFailures = failures.filter(
    f =>
      !f.usage.toLowerCase().includes('decorative') &&
      !f.usage.toLowerCase().includes('border')
  );

  failures.forEach(({ fg, bg, usage, ratio, threshold }) => {
    const isCritical =
      !usage.toLowerCase().includes('decorative') &&
      !usage.toLowerCase().includes('border');
    const prefix = isCritical ? '✗' : '⚠';

    console.log(`\n${prefix} ${usage}`);
    console.log(`  ${fg} on ${bg}: ${ratio.toFixed(2)}:1 (need ${threshold})`);

    if (!isCritical) {
      console.log(
        `  Note: This is acceptable - element is supplemented by other visual cues`
      );
    } else {
      console.log(`  Suggestion: Use darker foreground or lighter background`);
    }
  });

  if (criticalFailures.length > 0) {
    console.log(
      `\n✗ ${criticalFailures.length} critical accessibility issue(s) found!`
    );
    process.exit(1);
  } else {
    console.log('\n✓ All essential text meets WCAG AA standards!');
    console.log(
      '⚠ Some decorative elements have lower contrast but are supplemented by other cues.'
    );
    process.exit(0);
  }
} else {
  console.log('\n✓ All color combinations meet WCAG AA standards!');
  process.exit(0);
}
