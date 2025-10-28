# SignalPilot Theme System

Beautiful, dynamic themes for the SignalPilot website with custom particle effects and color schemes.

## 🎨 Available Themes

### 1. **Default** 🌌
The classic SignalPilot space theme with blue gradients and stars.
- **Colors**: Deep blue, cyan accents
- **Particles**: Twinkling stars with constellation connections
- **Vibe**: Professional, cosmic, tech-forward

### 2. **Halloween** 🎃
Spooky season special with purple and orange.
- **Colors**: Deep purple, pumpkin orange, eerie green
- **Particles**: Floating ghosts with spectral connections
- **Vibe**: Mysterious, playful, seasonal
- **Auto-suggest**: Automatically suggested in October

### 3. **Winter** ❄️
Frozen wonderland with icy blues and snowflakes.
- **Colors**: Ice blue, crystal cyan, frost white
- **Particles**: Falling snowflakes
- **Vibe**: Calm, elegant, seasonal
- **Auto-suggest**: Automatically suggested in December/January

### 4. **Cyberpunk** ⚡
Neon-soaked future with hot pink and electric cyan.
- **Colors**: Hot pink, electric cyan, neon purple
- **Particles**: Pulsing neon sparkles
- **Vibe**: Edgy, futuristic, high-energy

### 5. **Ocean** 🌊
Deep sea exploration with aquatic blues.
- **Colors**: Deep ocean blue, aqua, coral accents
- **Particles**: Rising bubbles
- **Vibe**: Calm, mysterious, natural

### 6. **Sunset** 🌅
Golden hour warmth with oranges and pinks.
- **Colors**: Warm orange, sunset pink, violet sky
- **Particles**: Glowing sparkles
- **Vibe**: Warm, inviting, energetic

### 7. **Forest** 🌲
Natural serenity with greens and earth tones.
- **Colors**: Forest green, moss, earth brown
- **Particles**: Fireflies with organic glow
- **Vibe**: Natural, calming, grounded

## 🚀 Usage

### Opening the Theme Switcher
- **Click** the floating theme button (🎨) in the bottom-right corner
- **Keyboard**: Press `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac)

### Switching Themes
1. Open the theme switcher
2. Click on any theme card to apply it instantly
3. Your choice is automatically saved

### Persistence
- Theme preferences are saved in `localStorage`
- Your theme will persist across page visits
- Clearing browser data will reset to the default theme

## 🛠️ Technical Details

### Architecture
- **themes.js**: Theme configuration and application logic
- **particles.js**: Dynamic particle system supporting multiple types
- **theme-switcher.js**: UI component for theme selection

### CSS Variables
All themes update CSS custom properties:
- `--bg`, `--bg-elev`, `--bg-soft`: Background colors
- `--text`, `--muted`, `--muted-soft`: Text colors
- `--brand`, `--accent`: Primary brand colors
- `--success`, `--warn`: Status colors
- `--border`: Border colors

### Particle Types
Each theme includes custom particle effects:
- **stars**: Classic twinkling stars (Default)
- **ghosts**: Floating spectral particles (Halloween)
- **snowflakes**: Falling crystalline flakes (Winter)
- **bubbles**: Rising aquatic bubbles (Ocean)
- **neon**: Pulsing electric particles (Cyberpunk)
- **sparkles**: Glowing warmth particles (Sunset)
- **fireflies**: Organic glowing orbs (Forest)

### Performance
- Particle count auto-adjusts based on screen size
- Animations respect `prefers-reduced-motion`
- Canvas rendering optimized for mobile
- Automatic pause when page is hidden

## 🎯 Seasonal Suggestions

The system intelligently suggests seasonal themes:
- **October**: Halloween theme prompt
- **December/January**: Winter theme prompt

Suggestions appear once per session and can be dismissed.

## 🔧 API

### JavaScript API
```javascript
// Apply a theme
window.SP_THEME.apply('halloween');

// Get current theme
const current = window.SP_THEME.current();

// List all themes
const themes = window.SP_THEME.list();

// Get theme configuration
const config = window.SP_THEME.get('cyberpunk');

// Open theme switcher programmatically
window.SP_THEME_UI.open();

// Close theme switcher
window.SP_THEME_UI.close();
```

### Events
```javascript
// Listen for theme changes
window.addEventListener('themechange', (e) => {
  console.log('New theme:', e.detail.theme);
  console.log('Theme config:', e.detail.config);
});
```

## 📱 Mobile Support

- Fully responsive theme switcher
- Touch-optimized particle interactions
- Reduced particle count on mobile for performance
- Accessible with proper ARIA labels

## ♿ Accessibility

- Keyboard navigation support
- Focus management in modal
- Proper contrast ratios
- Respects `prefers-reduced-motion`
- ARIA labels on interactive elements

## 🎨 Adding New Themes

To add a new theme, edit `assets/themes.js`:

```javascript
window.SP_THEMES.mytheme = {
  name: 'My Theme',
  icon: '🌟',
  description: 'My amazing theme',
  colors: {
    bg: '#...',
    // ... other colors
  },
  particles: {
    type: 'stars', // or custom
    color: 'rgba(...)',
    lineColor: 'rgba(...)',
    count: 70
  },
  aurora: {
    colors: [
      'rgba(...)',
      // ... 4 gradient colors
    ]
  }
};
```

## 📄 License

Part of the SignalPilot platform. All rights reserved.

---

**Enjoy exploring different themes!** 🎨✨
