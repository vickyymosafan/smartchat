# UI Utilities

This directory contains UI-related utilities and components for the SMARTCHAT application.

## MarkdownRenderer

A comprehensive markdown rendering component with syntax highlighting, custom styling, and interactive features.

### Features

- ✅ **Syntax Highlighting**: Code blocks with language-specific highlighting using `rehype-highlight`
- ✅ **Copy Button**: One-click copy functionality for code blocks with visual feedback
- ✅ **GFM Support**: GitHub Flavored Markdown support via `remark-gfm`
- ✅ **Custom Components**: Customized rendering for all markdown elements
- ✅ **Security**: Links open in new tabs with `rel="noopener noreferrer"`
- ✅ **Responsive**: Proper spacing and layout that works on all screen sizes
- ✅ **Dark Mode**: Full support for light and dark themes
- ✅ **Accessibility**: Semantic HTML and proper ARIA labels

### Usage

```typescript
import MarkdownRenderer from '@/lib/ui/MarkdownRenderer';

function MyComponent() {
  const content = `
# Hello World

This is **bold** and this is *italic*.

\`\`\`typescript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`
  `;

  return <MarkdownRenderer content={content} />;
}
```

### Supported Markdown Features

#### Headings

```markdown
# H1 Heading

## H2 Heading

### H3 Heading
```

#### Text Formatting

```markdown
**Bold text**
_Italic text_
~~Strikethrough~~
`Inline code`
```

#### Links

```markdown
[Link text](https://example.com)
```

All links automatically open in new tabs with security attributes.

#### Code Blocks

````markdown
```typescript
interface User {
  id: string;
  name: string;
}
```
````

Code blocks include:

- Syntax highlighting for 100+ languages
- Copy button (appears on hover)
- Dark theme optimized colors

#### Lists

```markdown
- Unordered list item
- Another item

1. Ordered list item
2. Another item
```

#### Tables

```markdown
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
```

#### Blockquotes

```markdown
> This is a blockquote
> It can span multiple lines
```

#### Images

```markdown
![Alt text](image-url.jpg)
```

Images are lazy-loaded and responsive.

#### Horizontal Rules

```markdown
---
```

#### Task Lists (GFM)

```markdown
- [x] Completed task
- [ ] Incomplete task
```

### Styling

The component uses Tailwind CSS with custom prose classes. All styles are theme-aware and work in both light and dark modes.

#### Custom CSS Variables Used

- `--color-foreground`: Text color
- `--color-muted`: Muted background
- `--color-muted-foreground`: Muted text
- `--color-accent`: Accent color for links
- `--color-border`: Border color

### Props

```typescript
interface MarkdownRendererProps {
  content: string; // Markdown content to render
  className?: string; // Additional CSS classes
}
```

### Integration with MessageBubble

The MarkdownRenderer is integrated into the MessageBubble component for assistant messages:

```typescript
// In MessageBubble.tsx
if (role === 'assistant') {
  return (
    <div className="...">
      <MarkdownRenderer content={content} />
    </div>
  );
}
```

### Testing

Test pages are available:

- `/test-markdown` - Standalone MarkdownRenderer test
- `/test-message-bubble-markdown` - MessageBubble with markdown integration

### Dependencies

- `react-markdown`: Core markdown rendering
- `remark-gfm`: GitHub Flavored Markdown support
- `rehype-highlight`: Syntax highlighting
- `rehype-raw`: HTML in markdown support
- `lucide-react`: Icons for copy button

### Performance Considerations

- Code blocks are rendered with proper overflow handling
- Images are lazy-loaded
- Copy functionality uses native Clipboard API
- No external CSS dependencies for syntax highlighting

### Accessibility

- Semantic HTML elements
- Proper heading hierarchy
- ARIA labels for interactive elements
- Keyboard accessible copy buttons
- Screen reader friendly

### Browser Support

Works in all modern browsers that support:

- ES6+
- CSS Grid
- Flexbox
- Clipboard API
