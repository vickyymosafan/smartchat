# i18n (Internationalization) System

This directory contains the internationalization setup for SMARTCHAT, supporting multiple languages with a simple and type-safe API.

## Features

- ✅ Type-safe translations with TypeScript
- ✅ Automatic language detection from browser or localStorage
- ✅ Default to Bahasa Indonesia
- ✅ Support for variable interpolation
- ✅ Nested translation keys
- ✅ Language persistence to localStorage
- ✅ React Context for global access

## Supported Languages

- 🇮🇩 **Bahasa Indonesia** (id) - Default
- 🇬🇧 **English** (en)

## Usage

### 1. Wrap your app with TranslationProvider

```tsx
// app/layout.tsx
import { TranslationProvider } from '@/components/providers/TranslationProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TranslationProvider>{children}</TranslationProvider>
      </body>
    </html>
  );
}
```

### 2. Use translations in components

```tsx
import { useTranslation } from '@/hooks/useTranslation';

function MyComponent() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div>
      {/* Simple translation */}
      <button>{t('common.send')}</button>

      {/* Nested keys */}
      <p>{t('chat.emptyState.title')}</p>

      {/* With variable interpolation */}
      <span>
        {t('chat.composer.characterCount', { current: 100, max: 5000 })}
      </span>

      {/* Change language */}
      <button onClick={() => setLocale('en')}>Switch to English</button>
      <button onClick={() => setLocale('id')}>Switch to Indonesian</button>
    </div>
  );
}
```

### 3. Add LanguageSwitcher to your UI

```tsx
import { LanguageSwitcher } from '@/components/chat/LanguageSwitcher';

function TopBar() {
  return (
    <header>
      <h1>SMARTCHAT</h1>
      <LanguageSwitcher />
    </header>
  );
}
```

## Translation Keys Structure

```typescript
{
  "common": {
    "send": "Kirim",
    "cancel": "Batal",
    // ... common UI strings
  },
  "chat": {
    "emptyState": {
      "title": "Mulai Percakapan",
      // ... empty state strings
    },
    "composer": {
      "placeholder": "Ketik pesan Anda di sini...",
      // ... composer strings
    },
    // ... other chat-related strings
  },
  // ... other sections
}
```

## Adding New Translations

1. Add the key to both `dictionaries/id.json` and `dictionaries/en.json`
2. Update the `Dictionary` type in `types.ts` to include the new key
3. Use the new key in your components with `t('your.new.key')`

## Variable Interpolation

Use curly braces in translation strings for variables:

```json
{
  "greeting": "Hello {name}!",
  "count": "You have {count} messages"
}
```

Then use them in code:

```tsx
t('greeting', { name: 'John' }); // => "Hello John!"
t('count', { count: 5 }); // => "You have 5 messages"
```

## Language Detection Priority

1. **localStorage** - Previously selected language
2. **Browser language** - User's browser language setting
3. **Default** - Bahasa Indonesia (id)

## Files

- `dictionaries/id.json` - Indonesian translations
- `dictionaries/en.json` - English translations
- `types.ts` - TypeScript type definitions
- `dictionaries.ts` - Dictionary loader and utilities
- `index.ts` - Public API exports

## Hooks

- `useTranslation()` - Main hook for accessing translations
- `useTranslationContext()` - Access translation context (requires TranslationProvider)
