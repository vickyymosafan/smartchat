# Markdown Format Support

Komponen `MessageList.tsx` menggunakan **Geist Font System** dari Vercel dan mendukung semua format markdown berikut dengan typography scale yang sesuai dengan v0.app/chat:

## 📝 Format yang Didukung

### 1. Headings (H1-H6)
```markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
```

### 2. Text Formatting
```markdown
**Bold text** atau __Bold text__
*Italic text* atau _Italic text_
***Bold + Italic*** atau ___Bold + Italic___
```

### 3. Lists

#### Bullet List
```markdown
* Item satu
* Item dua
* Item tiga

atau

- Item satu
- Item dua
- Item tiga
```

#### Numbered List
```markdown
1. Langkah pertama
2. Langkah kedua
3. Langkah ketiga
```

#### Nested List (Numbered dengan Bullet)
```markdown
1. Jasa Pembuatan Logo:

* Desain logo custom sesuai kebutuhan brand
* Konsultasi branding
* File siap pakai untuk berbagai media

2. Jasa Fotografi:

* Corporate & branding photoshoot
* Event documentation
* Produk & food photography
```

#### Alphabet List
```markdown
A. Pertama
B. Kedua
C. Ketiga
```

### 4. Numbered Heading (dengan colon)
```markdown
1. Jasa Pembuatan Logo:
2. Jasa Fotografi:
3. Jasa Videografi:
```

### 5. Blockquote
```markdown
> Ini adalah kutipan penting
> Bisa multi-line
```

### 6. Code

#### Inline Code
```markdown
Gunakan `const x = 10;` untuk inline code
```

#### Code Block
````markdown
```javascript
function helloWorld() {
  console.log("Hello, world!");
}
```
````

### 7. Links
```markdown
[Teks link](https://example.com)
```

### 8. Images
```markdown
![Alt text](https://example.com/image.png)
```

### 9. Tables
```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

## 🎨 Styling Features

### Font System (Geist by Vercel)
- **Geist Sans**: Modern sans-serif font untuk body text dan headings
- **Geist Mono**: Monospace font untuk code blocks dan inline code
- **Font Rendering**: Antialiased dengan optimizeLegibility untuk keterbacaan optimal
- **CSS Variables**: `--font-geist-sans` dan `--font-geist-mono` untuk consistency

### Typography Scale (Tailwind-based)
- **H1**: 2.25rem (36px) - text-4xl, line-height 2.5rem, tracking-tight
- **H2**: 1.875rem (30px) - text-3xl, line-height 2.25rem, tracking-tight
- **H3**: 1.5rem (24px) - text-2xl, line-height 2rem, tracking-tight
- **H4**: 1.25rem (20px) - text-xl, line-height 1.75rem
- **H5**: 1.125rem (18px) - text-lg, line-height 1.75rem
- **H6**: 1rem (16px) - text-base, line-height 1.5rem
- **Body**: 1rem (16px) - text-base, line-height 1.5rem

### Color Hierarchy
- **H1-H2**: #0a0a0a, #171717 (gray-900) - Darkest
- **H3-H4**: #262626, #404040 (gray-800, gray-700)
- **H5-H6**: #525252 (gray-600)
- **Body**: #262626 (gray-800)

### Additional Features
- **Responsive**: Semua elemen responsive dan mobile-friendly
- **Accessibility**: Proper semantic HTML, heading hierarchy, dan alt text
- **Nested Lists**: Support untuk numbered list dengan bullet sub-items

## 🔧 Technical Details

### Parsing Order (untuk menghindari konflik):
1. Code blocks (```)
2. Tables (| ... |)
3. Blockquotes (> ...)
4. Headings (#, ##, ###)
5. Numbered headings (1. Text:)
6. Alphabet lists (A. Text)
7. Numbered lists (1. Text)
8. Bullet lists (* Text)
9. Paragraphs

### Inline Formatting Order:
1. Images (![alt](url))
2. Links ([text](url))
3. Code (`code`)
4. Bold (**text**)
5. Italic (*text*)

## ✅ No Redundancy

- Reusable flush functions untuk semua block elements
- Consistent styling dengan design system
- Minimal code duplication
- Efficient regex patterns
