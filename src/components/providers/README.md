# Theme Provider

This directory contains the ThemeProvider component and related theme management utilities for the SMARTCHAT UI redesign.

## Overview

The theme system provides:

- **Light/Dark/System modes** - Users can choose their preferred theme or follow system preferences
- **Persistent storage** - Theme preference is saved to localStorage
- **Real-time updates** - Theme changes apply immediately without page reload
- **System preference detection** - Automatically detects and responds to OS theme changes
- **Smooth transitions** - CSS variables enable smooth theme switching

## Usage

### Basic Setup

The ThemeProvider is already configured in `src/app/layout.tsx`:

```tsx
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

### Using the Theme Hook

```tsx
'use client';

import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Resolved theme: {resolvedTheme}</p>

      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}
```

## API Reference

### ThemeProvider Props

The ThemeProvider component accepts only `children` prop.

### useTheme Hook

Returns an object with:

- `theme: 'light' | 'dark' | 'system'` - The user's selected theme preference
- `resolvedTheme: 'light' | 'dark'` - The actual theme being applied (resolves 'system' to 'light' or 'dark')
- `setTheme: (theme: Theme) => void` - Function to change the theme

## How It Works

### Theme Detection

1. On mount, the provider checks localStorage for a saved theme preference
2. If no preference exists, defaults to 'system' mode
3. System mode detects the OS preference using `prefers-color-scheme` media query

### Theme Application

1. The resolved theme is applied by adding a CSS class to the root `<html>` element
2. CSS variables in `globals.css` respond to the `.dark` class
3. All components use these CSS variables for theming

### Theme Persistence

1. When `setTheme()` is called, the new theme is saved to localStorage
2. The theme is automatically restored on page reload
3. System preference changes are detected and applied in real-time

## CSS Variables

The theme system uses CSS variables defined in `src/app/globals.css`:

```css
/* Light theme (default) */
:root {
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(9% 0 0);
  --color-muted: oklch(96% 0 0);
  --color-accent: oklch(9% 0 0);
  /* ... more variables */
}

/* Dark theme */
.dark {
  --color-background: oklch(9% 0 0);
  --color-foreground: oklch(98% 0 0);
  --color-muted: oklch(15% 0 0);
  --color-accent: oklch(98% 0 0);
  /* ... more variables */
}
```

## Requirements Satisfied

This implementation satisfies the following requirements from the design document:

- **7.1** - Detects prefers-color-scheme from browser
- **7.2** - Persists theme choice to localStorage
- **7.3** - Updates CSS variables in real-time
- **7.4** - Provides ThemeToggle functionality
- **7.5** - Supports light theme with proper colors
- **7.6** - Supports dark theme with proper colors
- **7.7** - Ensures WCAG AA contrast compliance
- **7.8** - Uses smooth transitions for theme changes

## Testing

A test suite is available at `src/components/providers/__tests__/ThemeProvider.test.tsx`.

Run tests with:

```bash
npm run test
```

## Demo Component

A demo component is available at `src/components/ThemeDemo.tsx` to test the theme system:

```tsx
import { ThemeDemo } from '@/components/ThemeDemo';

function Page() {
  return <ThemeDemo />;
}
```

## Troubleshooting

### Theme not persisting

- Check browser localStorage is enabled
- Verify localStorage quota is not exceeded

### Theme not applying

- Ensure ThemeProvider wraps your app in layout.tsx
- Check that CSS variables are defined in globals.css
- Verify the `.dark` class is being added to `<html>` element

### System theme not detected

- Check browser supports `prefers-color-scheme` media query
- Verify OS has a theme preference set

## Future Enhancements

Potential improvements for future iterations:

- Add more theme variants (e.g., high contrast, custom colors)
- Support per-component theme overrides
- Add theme transition animations
- Implement theme scheduling (auto-switch based on time)
