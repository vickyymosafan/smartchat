# Storage Utilities Documentation

This module provides utilities for persisting UI state to localStorage with proper error handling and fallbacks.

## Features

- ✅ Theme preference persistence
- ✅ Sidebar open/closed state persistence
- ✅ Input draft auto-save (1 second debounce)
- ✅ Last read message ID tracking
- ✅ Error handling for localStorage quota exceeded
- ✅ Fallback for browsers without localStorage support
- ✅ Version management for storage schema
- ✅ Automatic state merging for partial updates

## Usage

### Basic Usage

```typescript
import {
  saveUIState,
  loadUIState,
  saveTheme,
  loadTheme,
  saveSidebarState,
  loadSidebarState,
  saveInputDraft,
  loadInputDraft,
  clearInputDraft,
  saveLastReadMessageId,
  loadLastReadMessageId,
  clearUIState,
  getStorageSize,
} from '@/lib/storage';

// Save theme
saveTheme('dark');

// Load theme
const theme = loadTheme(); // 'dark' | 'light' | 'system' | undefined

// Save sidebar state
saveSidebarState(true);

// Load sidebar state
const isOpen = loadSidebarState(); // boolean | undefined

// Save input draft
saveInputDraft('Hello world');

// Load input draft
const draft = loadInputDraft(); // string | undefined

// Clear input draft
clearInputDraft();

// Save last read message ID
saveLastReadMessageId('msg-123');

// Load last read message ID
const messageId = loadLastReadMessageId(); // string | null | undefined

// Save all state at once
saveUIState({
  theme: 'dark',
  sidebarOpen: true,
  inputDraft: 'Draft text',
  lastReadMessageId: 'msg-456',
});

// Load all state
const state = loadUIState();
// Returns: { theme?, sidebarOpen?, inputDraft?, lastReadMessageId? }

// Clear all state
clearUIState();

// Get storage size in bytes
const size = getStorageSize(); // number
```

### Integration Examples

#### Theme Provider

```typescript
import { saveTheme, loadTheme } from '@/lib/storage';

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return loadTheme() ?? 'system';
  });

  const setTheme = newTheme => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  // ... rest of implementation
}
```

#### Composer with Auto-Save

```typescript
import { saveInputDraft, loadInputDraft, clearInputDraft } from '@/lib/storage';

export function Composer({ onSend }) {
  const [message, setMessage] = useState(() => {
    return loadInputDraft() ?? '';
  });

  // Auto-save draft every 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      saveInputDraft(message);
    }, 1000);

    return () => clearTimeout(timer);
  }, [message]);

  const handleSend = async () => {
    await onSend(message);
    setMessage('');
    clearInputDraft(); // Clear draft after sending
  };

  // ... rest of implementation
}
```

#### ChatShell with Sidebar State

```typescript
import { saveSidebarState, loadSidebarState } from '@/lib/storage';

export function ChatShell() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return loadSidebarState() ?? false;
  });

  // Persist sidebar state when it changes
  useEffect(() => {
    saveSidebarState(sidebarOpen);
  }, [sidebarOpen]);

  // ... rest of implementation
}
```

#### Last Read Message Tracking

```typescript
import { saveLastReadMessageId, loadLastReadMessageId } from '@/lib/storage';

export function ChatShell() {
  const [lastReadMessageId, setLastReadMessageId] = useState(() => {
    return loadLastReadMessageId() ?? null;
  });

  // Update last read message when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.id !== lastReadMessageId) {
        setLastReadMessageId(lastMessage.id);
        saveLastReadMessageId(lastMessage.id);
      }
    }
  }, [messages, lastReadMessageId]);

  // ... rest of implementation
}
```

## API Reference

### `saveUIState(state: Partial<UIState>): boolean`

Saves partial UI state to localStorage. Merges with existing state.

**Parameters:**

- `state`: Partial UI state object

**Returns:**

- `true` if save was successful
- `false` if save failed (localStorage unavailable or quota exceeded)

**Example:**

```typescript
const success = saveUIState({ theme: 'dark', sidebarOpen: true });
```

### `loadUIState(): UIState`

Loads complete UI state from localStorage.

**Returns:**

- UI state object (empty object if not found or invalid)

**Example:**

```typescript
const state = loadUIState();
console.log(state.theme); // 'dark' | 'light' | 'system' | undefined
```

### `saveTheme(theme: 'light' | 'dark' | 'system'): boolean`

Saves theme preference.

### `loadTheme(): 'light' | 'dark' | 'system' | undefined`

Loads theme preference.

### `saveSidebarState(isOpen: boolean): boolean`

Saves sidebar open/closed state.

### `loadSidebarState(): boolean | undefined`

Loads sidebar state.

### `saveInputDraft(draft: string): boolean`

Saves input draft text.

### `loadInputDraft(): string | undefined`

Loads input draft text.

### `clearInputDraft(): boolean`

Clears input draft (sets to empty string).

### `saveLastReadMessageId(messageId: string | null): boolean`

Saves last read message ID.

### `loadLastReadMessageId(): string | null | undefined`

Loads last read message ID.

### `clearUIState(): boolean`

Clears all UI state from localStorage.

### `getStorageSize(): number`

Gets storage size in bytes.

**Returns:**

- Size in bytes
- `0` if no data exists
- `-1` if localStorage is unavailable

## Error Handling

The storage utilities handle several error scenarios:

### 1. localStorage Unavailable

If localStorage is not available (e.g., in private browsing mode), all functions will:

- Return `false` for save operations
- Return empty/undefined values for load operations
- Log a warning to console

```typescript
const success = saveTheme('dark');
if (!success) {
  console.warn('Failed to save theme - localStorage unavailable');
}
```

### 2. Quota Exceeded

If localStorage quota is exceeded, the utilities will:

1. Attempt to clear old data
2. Retry the save operation
3. Return `false` if retry fails

```typescript
const success = saveInputDraft(veryLongText);
if (!success) {
  // Show user-friendly error message
  toast.error('Failed to save draft - storage full');
}
```

### 3. Invalid Data

If stored data is corrupted or has wrong version:

- Data will be cleared automatically
- Empty/default values will be returned
- Error will be logged to console

## Storage Schema

Data is stored in localStorage with the following structure:

```json
{
  "version": 1,
  "state": {
    "theme": "dark",
    "sidebarOpen": true,
    "inputDraft": "Hello world",
    "lastReadMessageId": "msg-123"
  },
  "timestamp": 1234567890
}
```

**Key:** `smartchat-ui-state`

**Version:** `1` (current)

## Testing

### Manual Testing

Visit `/storage-test` page to manually test all storage functionality:

1. Change values in the forms
2. Click "Save All State"
3. Click "🔄 Refresh Page"
4. Verify all values are restored

### Automated Testing

Run the test suite:

```bash
npm test -- src/lib/__tests__/storage.test.ts
```

Tests cover:

- Save and load operations
- Partial state updates
- Error handling (quota exceeded, invalid JSON)
- Version management
- Clear operations

## Browser Compatibility

The storage utilities work in all modern browsers that support:

- localStorage API
- JSON.parse/stringify
- ES6+ features

Fallback behavior is provided for browsers without localStorage support.

## Performance Considerations

- **Auto-save debouncing**: Input drafts are saved with 1 second debounce to avoid excessive writes
- **Partial updates**: Only changed values need to be saved, reducing write operations
- **Size monitoring**: Use `getStorageSize()` to monitor storage usage
- **Cleanup**: Old data is automatically cleared on version mismatch

## Security Considerations

- **No sensitive data**: Never store passwords, tokens, or sensitive user data
- **Client-side only**: localStorage is accessible to JavaScript on the same origin
- **No encryption**: Data is stored in plain text
- **XSS protection**: Ensure proper input sanitization to prevent XSS attacks

## Migration Guide

If you need to update the storage schema:

1. Increment `STORAGE_VERSION` in `storage.ts`
2. Add migration logic in `loadUIState()`
3. Test with old data to ensure smooth migration

Example:

```typescript
const STORAGE_VERSION = 2; // Increment version

export function loadUIState(): UIState {
  // ... existing code ...

  // Migration from v1 to v2
  if (data.version === 1) {
    // Transform old data structure to new structure
    data.state = migrateV1ToV2(data.state);
    data.version = 2;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // ... rest of code ...
}
```

## Troubleshooting

### State not persisting after refresh

1. Check browser console for errors
2. Verify localStorage is enabled (not in private mode)
3. Check storage quota with `getStorageSize()`
4. Clear old data with `clearUIState()` and try again

### Storage quota exceeded

1. Clear unnecessary data with `clearUIState()`
2. Reduce input draft length
3. Check for other apps using localStorage on same domain

### Invalid data errors

1. Clear corrupted data with `clearUIState()`
2. Check browser console for specific error messages
3. Verify data structure matches current version

## Future Enhancements

Potential improvements for future versions:

- [ ] IndexedDB fallback for larger data
- [ ] Compression for large drafts
- [ ] Encryption for sensitive data
- [ ] Sync across tabs using BroadcastChannel
- [ ] Cloud sync for cross-device persistence
- [ ] Automatic cleanup of old data
- [ ] Storage usage analytics
