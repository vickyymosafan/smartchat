# 🔧 Border Style Conflict Fix

## ❌ Problem

React warning terjadi karena konflik antara shorthand property `border` dan individual property `borderColor`:

```
Updating a style property during rerender (borderColor) when a conflicting 
property is set (border) can lead to styling bugs.
```

### Root Cause

Di `MessageInput.tsx`, textarea menggunakan:
1. **className** dengan `border` (shorthand CSS property)
2. **Event handlers** (`onMouseEnter`, `onMouseLeave`, `onFocus`, `onBlur`) yang mengubah `borderColor` (individual property)

Ini menyebabkan konflik karena React tidak bisa menentukan mana yang harus diprioritaskan.

## ✅ Solution

### Before (Problematic)
```tsx
className={`
  w-full resize-none border focus:outline-none
  ${error ? 'border-[var(--gray-800)]' : 'border-[var(--gray-300)]'}
  focus:border-[var(--gray-800)]
`}
style={{
  borderRadius: 'var(--radius-lg)',
  // ... other styles
}}
onMouseEnter={(e) => {
  e.target.style.borderColor = 'var(--gray-400)'; // ❌ Conflict!
}}
```

**Problem**: 
- `className` menggunakan `border` (shorthand)
- Event handler mengubah `borderColor` (individual)
- React warning muncul

### After (Fixed)
```tsx
className="w-full resize-none focus:outline-none message-textarea"
style={{
  borderWidth: '1px',      // ✅ Individual property
  borderStyle: 'solid',    // ✅ Individual property
  borderColor: error ? 'var(--gray-800)' : 'var(--gray-300)', // ✅ Individual property
  borderRadius: 'var(--radius-lg)',
  // ... other styles
}}
onMouseEnter={(e) => {
  e.target.style.borderColor = 'var(--gray-400)'; // ✅ No conflict!
}}
```

**Solution**:
- Removed `border` shorthand from className
- Moved all border properties to inline style as individual properties
- Event handlers now only modify `borderColor` (consistent)

## 📝 Changes Made

### File: `src/components/MessageInput.tsx`

#### 1. Removed Border from className
```diff
- className={`
-   w-full resize-none border focus:outline-none
-   ${error ? 'border-[var(--gray-800)]' : 'border-[var(--gray-300)]'}
-   focus:border-[var(--gray-800)]
- `}
+ className={`w-full resize-none focus:outline-none message-textarea ${error ? 'animate-shake' : ''}`}
```

#### 2. Added Individual Border Properties to Style
```diff
  style={{
+   borderWidth: '1px',
+   borderStyle: 'solid',
+   borderColor: error ? 'var(--gray-800)' : 'var(--gray-300)',
    borderRadius: 'var(--radius-lg)',
    // ... other styles
  }}
```

#### 3. Updated Event Handlers
```diff
  onMouseLeave={(e) => {
    if (!isLoading && !error && document.activeElement !== target) {
-     target.style.borderColor = 'var(--gray-300)';
+     target.style.borderColor = error ? 'var(--gray-800)' : 'var(--gray-300)';
    }
  }}
  
  onFocus={(e) => {
    if (!error) {
+     e.target.style.borderColor = 'var(--gray-800)';
      e.target.style.boxShadow = '0 0 0 3px rgba(38, 38, 38, 0.1)';
      e.target.style.transform = 'scale(1.005)';
    }
  }}
  
  onBlur={(e) => {
+   e.target.style.borderColor = error ? 'var(--gray-800)' : 'var(--gray-300)';
    e.target.style.boxShadow = 'none';
    e.target.style.transform = 'scale(1)';
  }}
```

## ✅ Verification

### Before Fix
- ❌ React warning in console
- ❌ Potential styling bugs
- ❌ Inconsistent border behavior

### After Fix
- ✅ No React warnings
- ✅ Consistent border behavior
- ✅ All interactions work correctly
- ✅ Error state works correctly
- ✅ Focus state works correctly
- ✅ Hover state works correctly

## 🎯 Best Practices

### Rule: Don't Mix Shorthand and Individual Properties

**❌ Bad:**
```tsx
// Shorthand in className
className="border border-gray-300"

// Individual property in event handler
onMouseEnter={(e) => {
  e.target.style.borderColor = 'gray-400'; // Conflict!
}}
```

**✅ Good:**
```tsx
// All individual properties in style
style={{
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'gray-300'
}}

// Individual property in event handler
onMouseEnter={(e) => {
  e.target.style.borderColor = 'gray-400'; // No conflict!
}}
```

### When to Use What

**Use Shorthand (`border`) when:**
- Static styles that never change
- No dynamic border color changes
- Simple, one-time styling

**Use Individual Properties when:**
- Dynamic border color changes (hover, focus, etc.)
- Conditional styling
- Event handler modifications
- React inline styles

## 🔍 Related Issues

This fix also prevents:
- Potential hydration mismatches
- Inconsistent styling across browsers
- Performance issues from style recalculation
- Accessibility issues from unpredictable focus states

## 📊 Impact

### Performance
- ✅ No impact on performance
- ✅ Slightly more explicit code
- ✅ Better for React optimization

### Functionality
- ✅ All features work as before
- ✅ Better error state handling
- ✅ More predictable behavior

### Code Quality
- ✅ More explicit and clear
- ✅ Follows React best practices
- ✅ Easier to maintain

## 🎉 Result

The border style conflict has been completely resolved. The textarea now uses individual border properties consistently throughout, eliminating the React warning and ensuring predictable styling behavior.

---

**Fixed**: 2025-10-06
**Status**: ✅ Complete
**Impact**: 🟢 No Breaking Changes
