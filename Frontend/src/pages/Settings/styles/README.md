# Settings CSS Modules - Documentation

## 📁 Structure Overview

The Settings CSS has been refactored into modular, maintainable pieces:

```
styles/
├── Settings.module.css      # Main coordinator (imports all modules)
├── variables.module.css     # Design tokens & CSS variables
├── MessageBanner.module.css # Error/success banners
├── Sidebar.module.css       # Tab navigation sidebar
├── Forms.module.css         # Form inputs, textareas, buttons
├── Avatar.module.css        # Profile picture component
├── SettingItem.module.css   # Setting list items & toggles
├── Utilities.module.css     # Dividers, info boxes, danger zones
├── index.js                 # Export coordinator
└── README.md               # This file
```

## 🎯 Benefits

### 1. **Better Maintainability**
- Each component has its own CSS file
- Easy to find and update specific styles
- Changes are isolated and predictable

### 2. **Improved Scalability**
- Add new components without touching existing CSS
- Create new modules following the same pattern
- CSS file sizes stay manageable

### 3. **Enhanced Reusability**
- Import only what you need
- Share styles across components
- Consistent design tokens

### 4. **Easier Debugging**
- Clear separation of concerns
- Smaller files are easier to debug
- Browser DevTools shows exact file paths

## 📖 Usage Guide

### Basic Usage (Recommended)

The simplest way to use the styles is to import from the main Settings module:

```jsx
import styles from './Settings.module.css';

// All styles are available through the styles object
<div className={styles.settings}>
  <h1 className={styles.title}>Settings</h1>
  <div className={styles.sidebar}>...</div>
</div>
```

### Using Specific Modules

If you need to import specific modules for a component:

```jsx
import formStyles from './styles/Forms.module.css';
import avatarStyles from './styles/Avatar.module.css';

<form className={formStyles.form}>
  <div className={avatarStyles.avatarContainer}>...</div>
</form>
```

### Using the Index Export

```jsx
import styles, { messageBanner, sidebar } from './styles';

<div className={styles.settings}>
  <div className={messageBanner.errorMessage}>Error!</div>
  <aside className={sidebar.sidebar}>...</aside>
</div>
```

## 🎨 Design Tokens (CSS Variables)

All design tokens are centralized in `variables.module.css`:

### Spacing Scale
```css
--spacing-xs: 0.25rem    /* 4px */
--spacing-sm: 0.5rem     /* 8px */
--spacing-md: 1rem       /* 16px */
--spacing-lg: 1.5rem     /* 24px */
--spacing-xl: 2rem       /* 32px */
--spacing-2xl: 2.5rem    /* 40px */
--spacing-3xl: 3rem      /* 48px */
```

### Border Radius
```css
--radius-sm: 8px
--radius-md: 10px
--radius-lg: 12px
--radius-xl: 14px
--radius-2xl: 16px
--radius-3xl: 20px
--radius-full: 50%
```

### Typography
```css
--font-size-xs: 0.75rem
--font-size-sm: 0.85rem
--font-size-base: 0.9375rem
--font-size-md: 1rem
--font-size-lg: 1.0625rem
--font-size-xl: 1.35rem
--font-size-2xl: 1.5rem
--font-size-3xl: 2rem
--font-size-4xl: 2.75rem
```

### Transitions
```css
--transition-fast: 0.2s cubic-bezier(0.4, 0, 0.2, 1)
--transition-base: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 0.4s cubic-bezier(0.4, 0, 0.2, 1)
```

## 🔧 Adding New Components

### Step 1: Create a New CSS Module

```bash
# Create a new module file
touch Frontend/src/pages/Settings/styles/YourComponent.module.css
```

### Step 2: Write Your Styles

```css
/**
 * YourComponent Component Styles
 * Description of what this component does
 */

.componentContainer {
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.componentTitle {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-color);
}

/* Responsive */
@media (max-width: 768px) {
  .componentContainer {
    padding: var(--spacing-sm);
  }
}
```

### Step 3: Import in Main Settings CSS

Add to `Settings.module.css`:

```css
@import './YourComponent.module.css';
```

### Step 4: Export in Index (Optional)

Add to `index.js`:

```javascript
export { default as yourComponent } from './YourComponent.module.css';
```

### Step 5: Use in Component

```jsx
import styles from '../Settings.module.css';

function YourComponent() {
  return (
    <div className={styles.componentContainer}>
      <h2 className={styles.componentTitle}>Title</h2>
    </div>
  );
}
```

## 📦 Module Breakdown

### Settings.module.css
**Purpose:** Main coordinator and layout structure
**Contains:** 
- Main `.settings` container
- Header styles (`.title`, `.subtitle`)
- Grid layout (`.container`)
- Content area (`.content`, `.section`)
- Responsive breakpoints

### variables.module.css
**Purpose:** Design tokens and CSS variables
**Contains:**
- Spacing scale
- Typography scale
- Color tokens
- Border radius values
- Transition timings
- Shadow definitions

### MessageBanner.module.css
**Purpose:** Error and success message styling
**Contains:**
- `.errorMessage` / `.successMessage`
- `.closeBtn`
- Slide-down animation
- Responsive styles

### Sidebar.module.css
**Purpose:** Tab navigation sidebar
**Contains:**
- `.sidebar` container
- `.tabList` navigation
- `.tab` / `.activeTab` states
- `.tabIcon` / `.tabLabel`
- Hover and active animations
- Mobile horizontal scroll

### Forms.module.css
**Purpose:** All form-related components
**Contains:**
- `.form` / `.formGroup`
- `.input` / `.textarea` / `.select`
- `.label` / `.helperText`
- `.saveBtn` / `.secondaryBtn`
- `.formActions`
- Focus states and validation

### Avatar.module.css
**Purpose:** Profile picture component
**Contains:**
- `.avatarContainer`
- `.avatar` / `.avatarImage` / `.avatarInitial`
- `.avatarActions`
- `.changeAvatarBtn` / `.removeAvatarBtn`
- Responsive sizing

### SettingItem.module.css
**Purpose:** Individual setting items with toggles
**Contains:**
- `.settingsList`
- `.settingItem` / `.settingInfo`
- `.settingTitle` / `.settingDesc`
- `.switch` / `.slider` (toggle switch)
- Hover states

### Utilities.module.css
**Purpose:** Miscellaneous utility components
**Contains:**
- `.divider`
- `.infoBox`
- `.dangerZone` / `.dangerTitle` / `.dangerBtn`
- Utility classes

## 🎯 Best Practices

### 1. Use CSS Variables
Always use CSS variables from `variables.module.css` for consistency:

```css
/* ✅ Good */
.myComponent {
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  border-radius: var(--radius-md);
}

/* ❌ Avoid */
.myComponent {
  padding: 16px;
  font-size: 14px;
  border-radius: 8px;
}
```

### 2. Keep Modules Focused
Each module should have a single responsibility:

```css
/* ✅ Good - Forms.module.css */
.input { /* input styles */ }
.textarea { /* textarea styles */ }
.select { /* select styles */ }

/* ❌ Avoid - mixing concerns */
.input { /* input styles */ }
.avatar { /* avatar styles - should be in Avatar.module.css */ }
```

### 3. Document Your CSS
Add comments explaining complex styles:

```css
/**
 * Complex Component Styles
 * Handles the intricate layout for XYZ feature
 * 
 * Note: Uses grid with specific gap for mobile responsiveness
 */
.complexComponent {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}
```

### 4. Mobile-First Responsive Design
Start with mobile styles, then add desktop enhancements:

```css
/* Mobile first (default) */
.component {
  padding: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    padding: var(--spacing-md);
    font-size: var(--font-size-base);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    padding: var(--spacing-lg);
    font-size: var(--font-size-lg);
  }
}
```

### 5. Consistent Naming Conventions
Follow BEM-inspired naming within modules:

```css
/* Component */
.card { }

/* Component element */
.cardHeader { }
.cardBody { }
.cardFooter { }

/* Component modifier */
.cardPrimary { }
.cardSecondary { }

/* Component state */
.cardActive { }
.cardDisabled { }
```

## 🔄 Migration Guide

If you're migrating from the old monolithic CSS file:

### Before (Old Way)
```jsx
import styles from './Settings.module.css'; // 1200+ lines

<div className={styles.settings}>
  {/* All 1200+ lines in one file */}
</div>
```

### After (New Way)
```jsx
import styles from './Settings.module.css'; // Imports all modules

<div className={styles.settings}>
  {/* Same syntax, but organized into modules */}
</div>
```

**No changes needed in your JSX!** The class names remain the same.

## 🐛 Troubleshooting

### Issue: Styles not applying
**Solution:** Make sure you're importing from the correct path:
```jsx
// ✅ Correct
import styles from './Settings.module.css';

// ❌ Wrong
import styles from './styles/Settings.module.css';
```

### Issue: CSS variables not working
**Solution:** Ensure the `.settings` class is applied to the root container:
```jsx
<div className={styles.settings}>
  {/* Variables are scoped here */}
</div>
```

### Issue: Module not found
**Solution:** Check that all imports in `Settings.module.css` are correct:
```css
@import './MessageBanner.module.css'; /* ✅ Correct path */
@import './components/MessageBanner.module.css'; /* ❌ Wrong */
```

## 📊 Performance Benefits

- **Reduced bundle size:** Only import what you need
- **Better caching:** Smaller files = better browser caching
- **Faster builds:** Webpack can process smaller files faster
- **Code splitting:** Easier to implement lazy loading

## 🔮 Future Enhancements

Potential improvements for the future:

1. **CSS-in-JS Alternative:** Consider styled-components for dynamic theming
2. **CSS Grid Templates:** Create reusable grid layouts
3. **Animation Library:** Extract animations into separate module
4. **Dark/Light Mode:** Enhanced theme switching system
5. **RTL Support:** Right-to-left language support

## 📚 Additional Resources

- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [BEM Naming Convention](http://getbem.com/)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Mobile-First Design](https://www.browserstack.com/guide/how-to-implement-mobile-first-design)

---

**Last Updated:** November 2025  
**Maintained by:** Rivo Development Team
