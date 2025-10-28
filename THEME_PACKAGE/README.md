# SignalPilot Brand Theme Package

Unified design system for all SignalPilot properties:
- signalpilot.io
- education.signalpilot.io
- docs.signalpilot.io

## Installation

### 1. Copy Files

Copy these files to your project:
```
THEME_PACKAGE/
├── signalpilot-theme.css    (Design system CSS)
├── signalpilot-theme.js     (Theme switcher JS)
└── README.md                (This file)
```

### 2. Include in HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- SignalPilot Theme CSS -->
  <link rel="stylesheet" href="path/to/signalpilot-theme.css">

  <title>Your Page</title>
</head>
<body>

  <!-- Your content -->

  <!-- Theme Toggle Button (Required) -->
  <button id="themeToggle" class="btn btn-ghost btn-sm" aria-label="Toggle theme">
    <span id="theme-icon">🌙</span>
  </button>

  <!-- SignalPilot Theme JS (Before closing body tag) -->
  <script src="path/to/signalpilot-theme.js"></script>
</body>
</html>
```

## Usage

### Basic HTML Structure

```html
<div class="container">
  <section class="section">
    <h1>Heading</h1>
    <p>Text content with proper color and spacing.</p>

    <button class="btn btn-primary">Primary Button</button>
    <button class="btn btn-ghost">Ghost Button</button>

    <div class="card">
      Card content
    </div>
  </section>
</div>
```

### Available CSS Classes

#### Layout
- `.container` - Max-width container with responsive padding
- `.section` - Vertical section spacing
- `.stack` - Vertical stack layout (grid)
- `.grid` - Grid layout
- `.grid.auto-300` - Auto-fit grid with 300px minimum
- `.measure` - Max-width for readable text

#### Buttons
- `.btn` - Base button style
- `.btn-primary` - Primary button (gradient blue)
- `.btn-ghost` - Ghost button (transparent with border)
- `.btn-crypto` - Crypto-themed button (gold gradient)
- `.btn-sm` - Small button variant

#### Cards
- `.card` - Card component with shadow and border

#### Badges
- `.badge` - Badge/tag component
- `.mini-pill` - Small pill badge

#### Utility
- `.sr-only` - Screen reader only (accessible hidden content)

### CSS Variables

All colors use CSS variables for easy theming:

#### Dark Mode (Default)
```css
--bg: #05070d;           /* Background */
--text: #ecf1ff;         /* Text */
--brand: #5b8aff;        /* Brand blue */
--accent: #76ddff;       /* Accent cyan */
--good: #3ed598;         /* Success green */
--warn: #f9a23c;         /* Warning orange */
```

#### Light Mode
```css
--bg: #ffffff;           /* Background */
--text: #0f172a;         /* Text */
--brand: #3b82f6;        /* Brand blue */
--accent: #0ea5e9;       /* Accent cyan */
--good: #10b981;         /* Success green */
--warn: #f97316;         /* Warning orange */
```

### JavaScript API

The theme switcher exposes a global API:

```javascript
// Get current theme
SignalPilotTheme.current(); // Returns 'light' or 'dark'

// Set theme programmatically
SignalPilotTheme.set('light');
SignalPilotTheme.set('dark');

// Toggle theme
SignalPilotTheme.toggle();

// Reset to system preference
SignalPilotTheme.reset();

// Check theme state
SignalPilotTheme.isDark();  // Returns boolean
SignalPilotTheme.isLight(); // Returns boolean
```

### Events

Listen for theme changes:

```javascript
window.addEventListener('themechange', (event) => {
  console.log('Theme changed to:', event.detail.theme);
});
```

### Keyboard Shortcuts

- `Ctrl+Shift+L` - Toggle theme

## Customization

### Adding Custom Colors

```css
:root {
  /* Your custom colors */
  --custom-color: #ff5733;
}

html[data-theme="light"] {
  --custom-color: #cc4529;
}
```

### Custom Button Variant

```css
.btn-custom {
  background: linear-gradient(115deg, var(--custom-color), var(--accent));
  color: #fff;
}
```

### Custom Card Style

```css
.card-elevated {
  box-shadow: 0 24px 80px rgba(12, 16, 27, 0.5);
  border: 2px solid var(--brand);
}
```

## Responsive Breakpoints

The theme includes built-in responsive utilities:

- `1300px` - Large desktop
- `1200px` - Desktop
- `1060px` - Tablet landscape
- `768px` - Tablet portrait
- `600px` - Mobile landscape
- `480px` - Mobile portrait

## Accessibility Features

✅ **Focus Visible** - Clear focus indicators for keyboard navigation
✅ **Prefers Reduced Motion** - Respects user's motion preferences
✅ **Touch Targets** - Minimum 44px for all interactive elements
✅ **Color Contrast** - WCAG AA compliant in both themes
✅ **Screen Reader Support** - Proper ARIA labels and semantic HTML

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+

## Examples

### Hero Section
```html
<section class="section">
  <div class="container">
    <h1 style="background:var(--grad);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent">
      Beautiful Gradient Heading
    </h1>
    <p style="color:var(--muted);font-size:1.15rem">
      Subtitle text with perfect color contrast
    </p>
    <div style="display:flex;gap:1rem">
      <button class="btn btn-primary">Get Started</button>
      <button class="btn btn-ghost">Learn More</button>
    </div>
  </div>
</section>
```

### Card Grid
```html
<div class="container">
  <div class="grid auto-300">
    <div class="card">
      <h3>Feature One</h3>
      <p style="color:var(--muted)">Description here</p>
    </div>
    <div class="card">
      <h3>Feature Two</h3>
      <p style="color:var(--muted)">Description here</p>
    </div>
    <div class="card">
      <h3>Feature Three</h3>
      <p style="color:var(--muted)">Description here</p>
    </div>
  </div>
</div>
```

## Support

For questions or issues:
- GitHub: [Signalpilot/signalpilot.io](https://github.com/Signalpilot/signalpilot.io)
- Email: support@signalpilot.io

## Version History

**v1.0.0** (2025-10-28)
- Initial release
- Dark/Light theme support
- Responsive utilities
- Accessibility features
- JavaScript API

---

**Built with ❤️ by SignalPilot**
