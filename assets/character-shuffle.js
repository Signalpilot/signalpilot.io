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
      console.log('[CharShuffle] Element already initialized, skipping');
      return;
    }

    // Get configuration
    const speed = parseInt(element.dataset.shuffleSpeed || CONFIG.defaultSpeed, 10);
    const delay = parseInt(element.dataset.shuffleDelay || CONFIG.defaultDelay, 10);

    console.log('[CharShuffle] shuffleElement() called with speed:', speed, 'delay:', delay);

    // Store original text for accessibility
    const originalText = element.textContent;
    element.setAttribute('aria-label', originalText);

    // Split text into character spans
    element.innerHTML = splitText(originalText);

    // Add classes for initial state - NO PRE-SHUFFLE HIDING
    element.classList.add('char-shuffle');

    // Mark as initialized
    element.dataset.shuffleInit = 'true';

    // Get all character spans
    const chars = Array.from(element.querySelectorAll('.char:not(.space)'));
    const totalChars = chars.length;

    // Force all characters visible from the start
    element.style.opacity = '1';
    chars.forEach(char => {
      char.style.opacity = '1';
      char.style.visibility = 'visible';
    });

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
      element.classList.add('shuffling');

      console.log('[CharShuffle] Starting animation on', totalChars, 'characters, speed:', speed, 'ms');

      const startTime = performance.now();
      let lastShuffleTime = startTime;

      // Use requestAnimationFrame instead of setInterval for better performance
      function animateFrame(currentTime) {
        const elapsed = currentTime - startTime;
        const timeSinceLastShuffle = currentTime - lastShuffleTime;

        // Only update every ~40ms (CONFIG.shuffleInterval)
        if (timeSinceLastShuffle < CONFIG.shuffleInterval) {
          requestAnimationFrame(animateFrame);
          return;
        }
        lastShuffleTime = currentTime;

        let allSettled = true;

        charStates.forEach(state => {
          if (state.settled) return;

          // Check if it's time for this character to settle
          if (elapsed >= state.settleAt) {
            // Settle the character
            state.element.textContent = state.original;
            state.element.classList.add('settled', 'just-settled');
            state.settled = true;

            // Force visibility immediately - CSS classes alone aren't working
            state.element.style.opacity = '1';
            state.element.style.visibility = 'visible';

            // Remove just-settled class after shimmer completes
            setTimeout(() => {
              state.element.classList.remove('just-settled');
              // Ensure visibility persists
              state.element.style.opacity = '1';
              state.element.style.visibility = 'visible';
            }, 450);
          } else {
            // Keep shuffling
            state.element.textContent = getRandomChar();
            allSettled = false;
          }
        });

        // Continue animation or finish
        if (!allSettled) {
          requestAnimationFrame(animateFrame);
        } else {
          // Animation complete
          element.classList.remove('shuffling');
          element.setAttribute('data-shuffle-complete', 'true');

          console.log('[CharShuffle] Animation complete. Locking visibility on', chars.length, 'characters');

          // FINAL SAFETY NET: Force parent and all children visible
          element.style.opacity = '1';
          element.style.visibility = 'visible';

          chars.forEach(char => {
            char.style.opacity = '1';
            char.style.visibility = 'visible';
            char.style.display = 'inline-block';
          });

          // Double-check after a delay in case something overrides
          setTimeout(() => {
            let fixed = 0;
            chars.forEach(char => {
              if (char.style.opacity !== '1') {
                console.warn('[CharShuffle] Character lost opacity, reapplying');
                char.style.opacity = '1';
                fixed++;
              }
            });
            if (fixed > 0) {
              console.log('[CharShuffle] Fixed', fixed, 'characters');
            } else {
              console.log('[CharShuffle] All characters still visible ✓');
            }
          }, 100);
        }
      }

      // Start the animation loop
      requestAnimationFrame(animateFrame);

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
        // FORCE RESET - Clear any stale initialization flags
        if (element.dataset.shuffleInit === 'true') {
          console.log('[CharShuffle] Clearing stale init flag on element');
          element.dataset.shuffleInit = 'false';
          element.classList.remove('char-shuffle', 'shuffling');
        }

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
      element.classList.remove('char-shuffle', 'shuffling');

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
