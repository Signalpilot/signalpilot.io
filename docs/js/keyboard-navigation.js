/**
 * Keyboard Navigation Enhancement
 * Adds keyboard shortcuts for power users
 */

(function() {
  'use strict';

  // Keyboard shortcuts configuration
  const shortcuts = {
    'c': { // Alt+C: Toggle chatbot
      handler: toggleChatbot,
      description: 'Toggle chatbot'
    },
    's': { // Alt+S: Focus search
      handler: focusSearch,
      description: 'Focus search'
    },
    'n': { // Alt+N: Next page
      handler: goToNextPage,
      description: 'Next page'
    },
    'p': { // Alt+P: Previous page
      handler: goToPreviousPage,
      description: 'Previous page'
    },
    'h': { // Alt+H: Go to home
      handler: goToHome,
      description: 'Go to homepage'
    },
    't': { // Alt+T: Scroll to top
      handler: scrollToTop,
      description: 'Scroll to top'
    },
    '/': { // Just /: Focus search (like GitHub)
      handler: focusSearch,
      description: 'Focus search',
      requiresAlt: false
    }
  };

  // Initialize keyboard navigation
  function init() {
    // Don't initialize on touch devices (mobile/tablet)
    if (isTouchDevice()) {
      console.log('[Keyboard Navigation] Skipped - touch device detected');
      return;
    }

    document.addEventListener('keydown', handleKeyPress);
    createShortcutGuide();
    console.log('[Keyboard Navigation] Initialized');
  }

  // Detect if device is touch-enabled
  function isTouchDevice() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    );
  }

  // Handle key press events
  function handleKeyPress(e) {
    // Skip if user is typing in an input field
    if (e.target.matches('input, textarea, select, [contenteditable]')) {
      // Exception: Allow / to focus search even from input
      if (e.key === '/' && !e.altKey && e.target !== document.querySelector('input[type="search"]')) {
        return;
      }
      // If already in search, ignore /
      if (e.key === '/' && e.target.matches('input[type="search"]')) {
        return;
      }
    }

    const key = e.key.toLowerCase();
    const shortcut = shortcuts[key];

    if (!shortcut) return;

    // Check if Alt key is required
    const needsAlt = shortcut.requiresAlt !== false; // Default to true
    if (needsAlt && !e.altKey) return;
    if (!needsAlt && e.altKey) return;

    // Prevent default behavior
    e.preventDefault();

    // Execute handler
    shortcut.handler();
  }

  // Toggle chatbot
  function toggleChatbot() {
    const chatbotToggle = document.querySelector('#sp-chatbot-toggle, .sp-chatbot-toggle');
    if (chatbotToggle) {
      chatbotToggle.click();
      console.log('[Keyboard Navigation] Toggled chatbot');
    }
  }

  // Focus search input
  function focusSearch() {
    const searchInput = document.querySelector('input[type="search"], input[name="query"], .md-search__input');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
      console.log('[Keyboard Navigation] Focused search');
    }
  }

  // Go to next page
  function goToNextPage() {
    const nextLink = document.querySelector('.md-footer__link--next, a[rel="next"]');
    if (nextLink) {
      nextLink.click();
      console.log('[Keyboard Navigation] Going to next page');
    }
  }

  // Go to previous page
  function goToPreviousPage() {
    const prevLink = document.querySelector('.md-footer__link--prev, a[rel="prev"]');
    if (prevLink) {
      prevLink.click();
      console.log('[Keyboard Navigation] Going to previous page');
    }
  }

  // Go to home
  function goToHome() {
    window.location.href = '/';
    console.log('[Keyboard Navigation] Going to home');
  }

  // Scroll to top
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    console.log('[Keyboard Navigation] Scrolling to top');
  }

  // Create shortcut guide
  function createShortcutGuide() {
    const guide = document.createElement('div');
    guide.id = 'keyboard-shortcuts-guide';
    guide.className = 'keyboard-shortcuts-guide';
    guide.innerHTML = `
      <div class="shortcuts-toggle" title="Keyboard Shortcuts (Alt+?)">
        ⌨️
      </div>
      <div class="shortcuts-panel" style="display: none;">
        <h3>⌨️ Keyboard Shortcuts</h3>
        <div class="shortcuts-list">
          <div class="shortcut-item">
            <kbd>Alt</kbd> + <kbd>C</kbd>
            <span>Toggle chatbot</span>
          </div>
          <div class="shortcut-item">
            <kbd>Alt</kbd> + <kbd>S</kbd>
            <span>Focus search</span>
          </div>
          <div class="shortcut-item">
            <kbd>/</kbd>
            <span>Focus search</span>
          </div>
          <div class="shortcut-item">
            <kbd>Alt</kbd> + <kbd>N</kbd>
            <span>Next page</span>
          </div>
          <div class="shortcut-item">
            <kbd>Alt</kbd> + <kbd>P</kbd>
            <span>Previous page</span>
          </div>
          <div class="shortcut-item">
            <kbd>Alt</kbd> + <kbd>H</kbd>
            <span>Go to homepage</span>
          </div>
          <div class="shortcut-item">
            <kbd>Alt</kbd> + <kbd>T</kbd>
            <span>Scroll to top</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(guide);

    // Toggle shortcuts panel
    const toggle = guide.querySelector('.shortcuts-toggle');
    const panel = guide.querySelector('.shortcuts-panel');

    toggle.addEventListener('click', () => {
      const isVisible = panel.style.display !== 'none';
      panel.style.display = isVisible ? 'none' : 'block';
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.style.display !== 'none') {
        panel.style.display = 'none';
      }
    });

    // Add Alt+? to toggle guide
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === '?') {
        e.preventDefault();
        const isVisible = panel.style.display !== 'none';
        panel.style.display = isVisible ? 'none' : 'block';
      }
    });

    addShortcutStyles();
  }

  // Add CSS styles for shortcut guide
  function addShortcutStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-shortcuts-guide {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999;
      }

      .shortcuts-toggle {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        transition: all 0.3s ease;
        font-size: 24px;
      }

      .shortcuts-toggle:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
      }

      .shortcuts-panel {
        position: absolute;
        bottom: 60px;
        right: 0;
        background: #1a202c;
        border: 2px solid #667eea;
        border-radius: 12px;
        padding: 20px;
        min-width: 280px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      }

      .shortcuts-panel h3 {
        margin: 0 0 16px 0;
        color: #e2e8f0;
        font-size: 18px;
        border-bottom: 2px solid #667eea;
        padding-bottom: 8px;
      }

      .shortcuts-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .shortcut-item {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        color: #cbd5e0;
      }

      .shortcut-item kbd {
        background: #2d3748;
        border: 1px solid #4a5568;
        border-radius: 4px;
        padding: 4px 8px;
        font-family: 'Roboto Mono', monospace;
        font-size: 12px;
        color: #e2e8f0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .shortcut-item span {
        flex: 1;
      }

      @media (max-width: 768px) {
        .keyboard-shortcuts-guide {
          bottom: 80px;
          right: 16px;
        }

        .shortcuts-toggle {
          width: 40px;
          height: 40px;
          font-size: 20px;
        }

        .shortcuts-panel {
          min-width: 240px;
          padding: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Enhance focus indicators for accessibility
  function enhanceFocusIndicators() {
    const style = document.createElement('style');
    style.textContent = `
      /* Enhanced focus indicators */
      a:focus,
      button:focus,
      input:focus,
      select:focus,
      textarea:focus,
      [tabindex]:focus {
        outline: 2px solid #00bcd4;
        outline-offset: 2px;
      }

      /* Skip to content link */
      .skip-to-content {
        position: absolute;
        top: -40px;
        left: 0;
        background: #00bcd4;
        color: #1a202c;
        padding: 8px 16px;
        text-decoration: none;
        font-weight: 600;
        z-index: 10000;
      }

      .skip-to-content:focus {
        top: 0;
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  enhanceFocusIndicators();

})();
