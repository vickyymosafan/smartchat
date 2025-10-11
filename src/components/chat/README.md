# Chat Components

This directory contains the redesigned chat UI components for SMARTCHAT.

## Components

### MessageBubble

Individual message component with three variants:

- **User messages**: Right-aligned with accent background and rounded-br-md corner cut
- **Assistant messages**: Left-aligned with muted background, border, and rounded-bl-md corner cut
- **System messages**: Centered with rounded-full styling and small text

**Features:**

- Responsive max-width: 85% (mobile) → 75% (tablet) → 70% (desktop)
- Hover effect with subtle scale (1.02)
- Timestamp display using formatTimeOnly utility
- Status indicators for user messages (sent/error)
- Proper padding: 0.75rem 1rem (mobile) → 1rem 1.25rem (desktop)
- Accessibility: semantic HTML, ARIA labels, proper time elements
- Dark mode support with semantic color tokens

**Usage:**

```tsx
import { MessageBubble } from '@/components/chat/MessageBubble';

<MessageBubble
  message={message}
  onCopy={() => console.log('Copy')}
  onRegenerate={() => console.log('Regenerate')}
  onReaction={reaction => console.log('Reaction:', reaction)}
/>;
```

**Test Page:** `/test-message-bubble`

### Other Components

- **ChatShell**: Root container component
- **TopBar**: Header with branding and actions
- **EmptyState**: Initial chat view with suggestions
- **ThemeToggle**: Theme switcher component

## Utilities

### Time Formatting (`src/lib/time.ts`)

- `formatTimeOnly(timestamp)`: Format to HH:MM
- `formatTimestamp(timestamp)`: Format to full date/time
- `formatRelativeTime(timestamp)`: Format to relative time (e.g., "2 minutes ago")

## Testing

Each component has a dedicated test page at `/test-{component-name}` for visual verification and manual testing.
