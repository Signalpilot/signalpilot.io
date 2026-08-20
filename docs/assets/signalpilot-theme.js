/**
 * SignalPilot Theme Switcher - MkDocs Material Compatible
 * Syncs SignalPilot theme with Material for MkDocs color scheme
 *
 * Features:
 * - Light/Dark mode toggle
 * - Syncs with Material theme (data-md-color-scheme)
 * - Respects system preference
 * - Persists user choice
 * - Updates meta theme-color
 * - Smooth transitions
 *
 * Requirements:
 * - Button with id="themeToggle"
 * - Optional: span with id="theme-icon" for emoji toggle
 *
 * Version: 1.1.0 (Material Compatible)
 * Updated: 2025-10-28
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    storageKey: 'sp_theme',
    attribute: 'data-theme',
    materialAttribute: 'data-md-color-scheme',  // Material theme attribute
    toggleButtonId: 'themeToggle',
    iconElementId: 'theme-icon',
    lightIcon: '☀️',
    darkIcon: '🌙',
    lightMetaColor: '#ffffff',
    darkMetaColor: '#05070d'
  };

  /**
   * Get system color scheme preference
   * @returns {string} 'light' or 'dark'
   */
  function getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  /**
   * Get saved theme or system preference
   * @returns {string} 'light' or 'dark'
   */
  function getSavedTheme() {
    return localStorage.getItem(CONFIG.storageKey) || getSystemPreference();
  }

  /**
   * Apply theme to document
   * @param {string} theme - 'light' or 'dark'
   */
  function setTheme(theme) {
    // Validate theme
    if (theme !== 'light' && theme !== 'dark') {
      console.warn(`Invalid theme: ${theme}. Defaulting to dark.`);
      theme = 'dark';
    }

    // Apply to document (SignalPilot attribute)
    document.documentElement.setAttribute(CONFIG.attribute, theme);

    // SYNC WITH MATERIAL: Set Material's color scheme
    const materialScheme = theme === 'light' ? 'default' : 'slate';
    document.documentElement.setAttribute(CONFIG.materialAttribute, materialScheme);

    // Save to localStorage
    localStorage.setItem(CONFIG.storageKey, theme);

    // Update theme icon if exists
    updateThemeIcon(theme);

    // Update meta theme-color
    updateMetaThemeColor(theme);

    // Dispatch custom event for other scripts
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme, materialScheme }
    }));

    console.log(`Theme changed to: ${theme} (Material: ${materialScheme})`);
  }

  /**
   * Update theme toggle icon
   * @param {string} theme - 'light' or 'dark'
   */
  function updateThemeIcon(theme) {
    const icon = document.getElementById(CONFIG.iconElementId);
    if (icon) {
      icon.textContent = theme === 'light' ? CONFIG.darkIcon : CONFIG.lightIcon;
    }
  }

  /**
   * Update meta theme-color tag
   * @param {string} theme - 'light' or 'dark'
   */
  function updateMetaThemeColor(theme) {
    let meta = document.querySelector('meta[name="theme-color"]');

    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }

    const color = theme === 'light' ? CONFIG.lightMetaColor : CONFIG.darkMetaColor;
    meta.setAttribute('content', color);
  }

  /**
   * Toggle between light and dark theme
   */
  function toggleTheme() {
    const current = document.documentElement.getAttribute(CONFIG.attribute);
    const next = current === 'light' ? 'dark' : 'light';
    setTheme(next);
  }

  /**
   * Initialize theme system
   */
  function init() {
    // Apply saved/system theme on load
    const initialTheme = getSavedTheme();
    setTheme(initialTheme);

    // Set up toggle button
    const toggleButton = document.getElementById(CONFIG.toggleButtonId);
    if (toggleButton) {
      toggleButton.addEventListener('click', toggleTheme);

      // Ensure proper accessibility
      toggleButton.setAttribute('aria-label', 'Toggle theme');
      toggleButton.setAttribute('type', 'button');
    } else {
      console.warn(`Theme toggle button not found. Expected id="${CONFIG.toggleButtonId}"`);
    }

    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');

      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', (e) => {
          // Only auto-switch if user hasn't manually set a preference
          if (!localStorage.getItem(CONFIG.storageKey)) {
            setTheme(e.matches ? 'light' : 'dark');
          }
        });
      }
      // Older browsers
      else if (mediaQuery.addListener) {
        mediaQuery.addListener((e) => {
          if (!localStorage.getItem(CONFIG.storageKey)) {
            setTheme(e.matches ? 'light' : 'dark');
          }
        });
      }
    }

    // Keyboard shortcut: Ctrl+Shift+L to toggle theme
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for programmatic control
  window.SignalPilotTheme = {
    /**
     * Get current theme
     * @returns {string} 'light' or 'dark'
     */
    current: () => document.documentElement.getAttribute(CONFIG.attribute) || 'dark',

    /**
     * Set theme programmatically
     * @param {string} theme - 'light' or 'dark'
     */
    set: setTheme,

    /**
     * Toggle theme
     */
    toggle: toggleTheme,

    /**
     * Reset to system preference
     */
    reset: () => {
      localStorage.removeItem(CONFIG.storageKey);
      setTheme(getSystemPreference());
    },

    /**
     * Check if dark mode is active
     * @returns {boolean}
     */
    isDark: () => document.documentElement.getAttribute(CONFIG.attribute) === 'dark',

    /**
     * Check if light mode is active
     * @returns {boolean}
     */
    isLight: () => document.documentElement.getAttribute(CONFIG.attribute) === 'light'
  };

  // Debug info
  console.log('SignalPilot Theme System loaded (Material Compatible)', {
    initialTheme: getSavedTheme(),
    systemPreference: getSystemPreference()
  });

})();
