# SignalPilot Theme - Integration Guide for Education Hub & Docs

Quick start guide for integrating the SignalPilot theme into your other properties.

## For Education Hub (education.signalpilot.io)

### Step 1: Add Files

```bash
# Copy theme files to your education hub repo
cp THEME_PACKAGE/signalpilot-theme.css assets/
cp THEME_PACKAGE/signalpilot-theme.js assets/
```

### Step 2: Update HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Existing head content -->

  <!-- ADD: SignalPilot Theme -->
  <link rel="stylesheet" href="assets/signalpilot-theme.css">
</head>
<body>

  <!-- Your existing header -->
  <header>
    <nav>
      <!-- Your nav items -->

      <!-- ADD: Theme toggle button -->
      <button id="themeToggle" class="btn btn-ghost btn-sm" aria-label="Toggle theme">
        <span id="theme-icon">🌙</span>
      </button>
    </nav>
  </header>

  <!-- Your content -->

  <!-- ADD: Theme switcher script (before closing body) -->
  <script src="assets/signalpilot-theme.js"></script>
</body>
</html>
```

### Step 3: Replace Existing Styles

Replace your current CSS variables with the theme variables:

**Before:**
```css
:root {
  --your-bg: #000;
  --your-text: #fff;
}
```

**After:**
```css
/* Remove your old variables - use signalpilot-theme.css instead */
/* The theme provides: --bg, --text, --brand, --accent, etc. */
```

### Step 4: Update Class Names

Replace your existing classes with theme classes:

**Before:**
```html
<button class="your-button-class">Click</button>
<div class="your-card-class">Content</div>
```

**After:**
```html
<button class="btn btn-primary">Click</button>
<div class="card">Content</div>
```

---

## For Docs (docs.signalpilot.io)

### Step 1: Add Files

```bash
# Copy theme files to your docs repo
cp THEME_PACKAGE/signalpilot-theme.css assets/
cp THEME_PACKAGE/signalpilot-theme.js assets/
```

### Step 2: If Using a Docs Framework

#### Docusaurus Example

```js
// docusaurus.config.js
module.exports = {
  stylesheets: [
    '/assets/signalpilot-theme.css',
  ],
  scripts: [
    '/assets/signalpilot-theme.js',
  ],
};
```

#### VitePress Example

```js
// .vitepress/config.js
export default {
  head: [
    ['link', { rel: 'stylesheet', href: '/assets/signalpilot-theme.css' }],
    ['script', { src: '/assets/signalpilot-theme.js' }]
  ]
}
```

#### MkDocs Example

```yaml
# mkdocs.yml
extra_css:
  - assets/signalpilot-theme.css
extra_javascript:
  - assets/signalpilot-theme.js
```

### Step 3: Add Theme Toggle to Navbar

Add this wherever you want the theme toggle:

```html
<button id="themeToggle" class="btn btn-ghost btn-sm" aria-label="Toggle theme">
  <span id="theme-icon">🌙</span>
</button>
```

---

## Common Integration Tasks

### Task 1: Replace Your Color Palette

**Find & Replace:**
```
Your Old Variable → New Theme Variable
--primary-color    → --brand
--secondary-color  → --accent
--success-color    → --good
--warning-color    → --warn
--bg-color         → --bg
--text-color       → --text
```

### Task 2: Update Button Styles

**Find all buttons and replace with:**
```html
<!-- Primary action -->
<button class="btn btn-primary">Action</button>

<!-- Secondary action -->
<button class="btn btn-ghost">Secondary</button>

<!-- Small button -->
<button class="btn btn-sm">Small</button>
```

### Task 3: Update Card Components

**Replace card markup:**
```html
<div class="card">
  <h3>Card Title</h3>
  <p style="color:var(--muted)">Card description</p>
</div>
```

### Task 4: Update Container/Layout

**Replace layout containers:**
```html
<!-- Max-width container -->
<div class="container">
  <section class="section">
    Content here
  </section>
</div>

<!-- Grid layout -->
<div class="grid auto-300">
  <div class="card">Item 1</div>
  <div class="card">Item 2</div>
  <div class="card">Item 3</div>
</div>
```

---

## Testing Checklist

After integration, test these scenarios:

### ✅ Theme Switching
- [ ] Click theme toggle - should switch between light/dark
- [ ] Reload page - theme should persist
- [ ] Check localStorage - `sp_theme` key should be set

### ✅ Colors
- [ ] Background changes properly (dark: #05070d, light: #ffffff)
- [ ] Text is readable in both modes
- [ ] Buttons have correct colors
- [ ] Cards/borders visible in both modes

### ✅ Responsive
- [ ] Desktop (1200px+) - all elements visible
- [ ] Tablet (768px-1200px) - layout adapts
- [ ] Mobile (<768px) - touch targets are 44px minimum

### ✅ Accessibility
- [ ] Keyboard navigation works (Tab through elements)
- [ ] Focus indicators visible
- [ ] Screen reader announces theme changes
- [ ] Color contrast meets WCAG AA

### ✅ JavaScript API
Open browser console and test:
```javascript
SignalPilotTheme.current()  // Should return 'light' or 'dark'
SignalPilotTheme.toggle()   // Should switch theme
SignalPilotTheme.isDark()   // Should return boolean
```

---

## Troubleshooting

### Issue: Theme doesn't switch

**Solution:**
1. Check browser console for errors
2. Verify button has `id="themeToggle"`
3. Ensure `signalpilot-theme.js` is loaded

### Issue: Colors look wrong

**Solution:**
1. Check if you have conflicting CSS
2. Make sure `signalpilot-theme.css` loads AFTER your base CSS
3. Use browser DevTools to inspect computed variables

### Issue: Layout broken on mobile

**Solution:**
1. Add viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
2. Use `.container` class for max-width
3. Check responsive utility classes

### Issue: Theme doesn't persist

**Solution:**
1. Check if localStorage is enabled
2. Verify `signalpilot-theme.js` is running
3. Check browser console for storage errors

---

## Claude Code Instructions

When giving to Claude Code instance, provide this exact message:

```
Please integrate the SignalPilot theme into this repository:

1. Copy these files from the THEME_PACKAGE folder:
   - signalpilot-theme.css → assets/
   - signalpilot-theme.js → assets/

2. Add to your HTML <head>:
   <link rel="stylesheet" href="assets/signalpilot-theme.css">

3. Add before closing </body>:
   <script src="assets/signalpilot-theme.js"></script>

4. Add theme toggle button in your header:
   <button id="themeToggle" class="btn btn-ghost btn-sm" aria-label="Toggle theme">
     <span id="theme-icon">🌙</span>
   </button>

5. Replace your existing CSS variables and utility classes with the theme's:
   - Use .btn, .btn-primary, .btn-ghost for buttons
   - Use .card for cards
   - Use .container and .section for layout
   - Use CSS variables: --bg, --text, --brand, --accent, --good, --warn

6. Test in both light and dark modes

See INTEGRATION_GUIDE.md for detailed instructions.
```

---

## Support

Questions? Issues?
- Check README.md for full documentation
- Review examples in INTEGRATION_GUIDE.md
- Test with the provided code snippets

**Happy theming! 🎨**
