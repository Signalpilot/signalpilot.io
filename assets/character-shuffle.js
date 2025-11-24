/**
 * CHARACTER SHUFFLE EFFECT
 * Matrix-style decoding animation
 *
 * Usage:
 * Add data-char-shuffle attribute to any element
 * Optional: data-shuffle-delay="1000" (delay before starting in ms)
 * Optional: data-shuffle-speed="50" (ms between character reveals)
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    defaultSpeed: 50,        // ms between each character settling
    shuffleIterations: 8,    // how many times each char shuffles before settling
    shuffleInterval: 40,     // ms between shuffle frames
    defaultDelay: 0,         // delay before starting effect
    // Character pool for shuffling (mix of symbols, letters, numbers)
    charPool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?~',
  };

  /**
   * Get random character from pool
   */
  function getRandomChar() {
    return CONFIG.charPool[Math.floor(Math.random() * CONFIG.charPool.length)];
  }

  /**
   * Split text into individual characters wrapped in spans
   */
  function splitText(text) {
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
          return `<span class="char" data-original="${escaped}" aria-hidden="true">${escaped}</span>`;
        }
      })
      .join('');
  }

  /**
   * Shuffle effect for a single element
   */
  function shuffleElement(element) {
    // Skip if already initialized
    if (element.dataset.shuffleInit === 'true') {
      return;
    }

    // Get configuration
    const speed = parseInt(element.dataset.shuffleSpeed || CONFIG.defaultSpeed, 10);
    const delay = parseInt(element.dataset.shuffleDelay || CONFIG.defaultDelay, 10);

    // Store original text for accessibility
    const originalText = element.textContent;
    element.setAttribute('aria-label', originalText);

    // Split text into character spans
    element.innerHTML = splitText(originalText);

    // Add classes for initial state
    element.classList.add('char-shuffle', 'pre-shuffle');

    // Mark as initialized
    element.dataset.shuffleInit = 'true';

    // Get all character spans
    const chars = Array.from(element.querySelectorAll('.char:not(.space)'));
    const totalChars = chars.length;

    // Shuffle state for each character
    const charStates = chars.map((char, index) => ({
      element: char,
      original: char.dataset.original,
      settled: false,
      settleAt: index * speed, // stagger the settling
      shuffleCount: 0,
    }));

    // Start shuffling after delay
    setTimeout(() => {
      // Remove pre-shuffle class to make characters visible
      element.classList.remove('pre-shuffle');
      element.classList.add('shuffling');

      let elapsed = 0;
      const startTime = Date.now();

      // Shuffle interval
      const shuffleTimer = setInterval(() => {
        elapsed = Date.now() - startTime;
        let allSettled = true;

        charStates.forEach(state => {
          if (state.settled) return;

          // Check if it's time for this character to settle
          if (elapsed >= state.settleAt) {
            // Settle the character
            state.element.textContent = state.original;
            state.element.classList.add('settled', 'just-settled');
            state.settled = true;

            // Remove just-settled class after animation
            setTimeout(() => {
              state.element.classList.remove('just-settled');
            }, 400);
          } else {
            // Keep shuffling
            state.element.textContent = getRandomChar();
            allSettled = false;
          }
        });

        // Stop when all characters have settled
        if (allSettled) {
          clearInterval(shuffleTimer);
          element.classList.remove('shuffling');
          // Characters remain visible due to .char { opacity: 1 !important }
        }
      }, CONFIG.shuffleInterval);

    }, delay);
  }

  /**
   * Initialize all shuffle effects
   */
  function init() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      console.log('[CharShuffle] Animations disabled due to prefers-reduced-motion');
      return;
    }

    // Find all elements with data-char-shuffle
    const elements = document.querySelectorAll('[data-char-shuffle]');

    if (elements.length === 0) {
      return;
    }

    console.log(`[CharShuffle] Initializing ${elements.length} element(s)`);

    elements.forEach(element => {
      try {
        // Check if trigger is on load or scroll
        const trigger = element.dataset.shuffleTrigger || 'load';

        if (trigger === 'load') {
          // Start immediately
          shuffleElement(element);
        } else if (trigger === 'scroll') {
          // Use Intersection Observer for scroll trigger
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting && entry.target.dataset.shuffleInit !== 'true') {
                shuffleElement(entry.target);
                observer.unobserve(entry.target);
              }
            });
          }, {
            threshold: 0.5,
            rootMargin: '0px'
          });

          observer.observe(element);
        }
      } catch (error) {
        console.error('[CharShuffle] Error initializing element:', element, error);
      }
    });
  }

  /**
   * Public API
   */
  window.CharShuffle = {
    init: init,

    // Manually trigger shuffle on an element
    shuffle: function(element) {
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }

      if (!element) {
        console.warn('[CharShuffle] Element not found');
        return;
      }

      shuffleElement(element);
    },

    // Reset and re-shuffle
    reshuffle: function(element) {
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }

      if (!element) {
        console.warn('[CharShuffle] Element not found');
        return;
      }

      // Reset initialization flag and classes
      element.dataset.shuffleInit = 'false';
      element.classList.remove('char-shuffle', 'shuffling', 'pre-shuffle');

      shuffleElement(element);
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOMContentLoaded already fired
    init();
  }

})();
