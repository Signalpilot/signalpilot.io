/**
 * TEXT STAGGER ANIMATION
 * Apple-style character-by-character text reveal
 *
 * Usage:
 * Add data-text-stagger attribute to any element
 * Optional: data-stagger-variant="slide-up|fade|pop|blur|clip|rotate"
 * Optional: data-stagger-delay="50" (delay between chars in ms)
 * Optional: data-stagger-by="char|word" (animate by character or word)
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    defaultDelay: 30, // ms between each character
    defaultVariant: 'slide-up',
    threshold: 0.2, // Trigger when 20% visible
    rootMargin: '0px'
  };

  /**
   * Split text into individual characters wrapped in spans
   */
  function splitTextByChar(text) {
    return text
      .split('')
      .map(char => {
        if (char === ' ') {
          return '<span class="char space" aria-hidden="true">&nbsp;</span>';
        } else if (char === '\n') {
          return '<br>';
        } else {
          // Escape HTML entities
          const escaped = char
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
          return `<span class="char" aria-hidden="true">${escaped}</span>`;
        }
      })
      .join('');
  }

  /**
   * Split text into words, then characters within each word
   */
  function splitTextByWord(text) {
    const words = text.split(' ');
    return words
      .map((word, wordIndex) => {
        const chars = word
          .split('')
          .map(char => {
            const escaped = char
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
            return `<span class="char" aria-hidden="true">${escaped}</span>`;
          })
          .join('');

        return `<span class="word" aria-hidden="true">${chars}</span>`;
      })
      .join('<span class="char space" aria-hidden="true">&nbsp;</span>');
  }

  /**
   * Apply stagger animation delays to characters
   */
  function applyStagger(element, delay) {
    const chars = element.querySelectorAll('.char');
    chars.forEach((char, index) => {
      char.style.animationDelay = `${index * delay}ms`;
    });
  }

  /**
   * Apply stagger animation delays to words
   */
  function applyWordStagger(element, delay) {
    const words = element.querySelectorAll('.word');
    words.forEach((word, index) => {
      word.style.animationDelay = `${index * delay}ms`;
    });
  }

  /**
   * Initialize text stagger animation for an element
   */
  function initTextStagger(element) {
    // Skip if already initialized
    if (element.dataset.staggerInit === 'true') {
      return;
    }

    // Get configuration from data attributes
    const variant = element.dataset.staggerVariant || CONFIG.defaultVariant;
    const delay = parseInt(element.dataset.staggerDelay || CONFIG.defaultDelay, 10);
    const splitBy = element.dataset.staggerBy || 'char';
    const trigger = element.dataset.staggerTrigger || 'scroll'; // 'scroll' or 'load'

    // Store original text for accessibility
    const originalText = element.textContent;
    element.setAttribute('aria-label', originalText);

    // Split text
    const splitHTML = splitBy === 'word'
      ? splitTextByWord(originalText)
      : splitTextByChar(originalText);

    // Update element
    element.innerHTML = splitHTML;
    element.classList.add('text-stagger', variant);

    if (splitBy === 'word') {
      element.classList.add('by-word');
    }

    // Apply stagger delays
    if (splitBy === 'word') {
      applyWordStagger(element, delay);
    } else {
      applyStagger(element, delay);
    }

    // Mark as initialized
    element.dataset.staggerInit = 'true';

    // If trigger is 'load', we're done - animation plays immediately
    if (trigger === 'load') {
      return;
    }

    // For scroll trigger, initially hide the element
    element.style.visibility = 'hidden';
  }

  /**
   * Setup Intersection Observer for scroll-triggered animations
   */
  function setupScrollTriggers() {
    const elements = document.querySelectorAll('[data-text-stagger]');

    // Check for Intersection Observer support
    if (!('IntersectionObserver' in window)) {
      // Fallback: just show all text immediately
      elements.forEach(el => {
        if (el.dataset.staggerTrigger !== 'load') {
          el.style.visibility = 'visible';
        }
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;

          // Make visible and let animation play
          element.style.visibility = 'visible';

          // Optionally replay animation if configured
          if (element.dataset.staggerReplay === 'true') {
            // Don't disconnect observer for replay
          } else {
            // Stop observing after first trigger
            observer.unobserve(element);
          }
        }
      });
    }, {
      threshold: CONFIG.threshold,
      rootMargin: CONFIG.rootMargin
    });

    elements.forEach(element => {
      if (element.dataset.staggerTrigger !== 'load') {
        observer.observe(element);
      }
    });
  }

  /**
   * Initialize all text stagger animations
   */
  function init() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Skip animations for users who prefer reduced motion
      console.log('[TextStagger] Animations disabled due to prefers-reduced-motion');
      return;
    }

    // Initialize all elements with data-text-stagger
    const elements = document.querySelectorAll('[data-text-stagger]');

    if (elements.length === 0) {
      return;
    }

    console.log(`[TextStagger] Initializing ${elements.length} element(s)`);

    elements.forEach(element => {
      try {
        initTextStagger(element);
      } catch (error) {
        console.error('[TextStagger] Error initializing element:', element, error);
      }
    });

    // Setup scroll triggers after initialization
    setupScrollTriggers();
  }

  /**
   * Public API
   */
  window.TextStagger = {
    init: init,

    // Manually trigger animation on an element
    trigger: function(element) {
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }

      if (!element) {
        console.warn('[TextStagger] Element not found');
        return;
      }

      element.style.visibility = 'visible';
    },

    // Reinitialize a specific element (useful for dynamic content)
    reinit: function(element) {
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }

      if (!element) {
        console.warn('[TextStagger] Element not found');
        return;
      }

      // Reset initialization flag
      element.dataset.staggerInit = 'false';
      initTextStagger(element);

      // If scroll-triggered, observe it
      if (element.dataset.staggerTrigger !== 'load') {
        setupScrollTriggers();
      }
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOMContentLoaded already fired
    init();
  }

  // Re-initialize on dynamic content changes (optional)
  // Uncomment if you add content dynamically
  /*
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          const staggerElements = node.querySelectorAll('[data-text-stagger]');
          if (staggerElements.length > 0) {
            init();
          }
        }
      });
    });
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
  */

})();
