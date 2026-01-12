/**
 * SCROLL REVEAL ANIMATIONS
 * Premium scroll-into-view animations using Intersection Observer
 *
 * Usage:
 * - Add data-reveal="fade-up" to any element
 * - Add data-reveal-delay="200" for delay in ms
 * - Add data-reveal-stagger to parent for staggered children
 * - Add data-parallax="0.1" for parallax scrolling
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    // How much of element must be visible to trigger (0.0 - 1.0)
    threshold: 0.15,
    // Root margin - trigger slightly before element enters viewport
    rootMargin: '0px 0px -50px 0px',
    // Only animate once (true) or every time it enters view (false)
    once: true,
    // Disable on reduced motion preference
    respectReducedMotion: true
  };

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Track revealed elements for "once" mode
  const revealedElements = new WeakSet();

  // Prevent double initialization
  let initialized = false;

  /**
   * Initialize scroll reveal for all elements with data-reveal
   */
  function initScrollReveal() {
    if (initialized) return;
    initialized = true;

    // Skip all scroll animations on mobile - just show content immediately
    const isMobile = window.innerWidth <= 768;
    if (isMobile || (config.respectReducedMotion && prefersReducedMotion)) {
      document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(el => {
        el.classList.add('revealed');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    // Create Intersection Observer
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: config.threshold,
      rootMargin: config.rootMargin
    });

    // Observe all reveal elements
    document.querySelectorAll('[data-reveal], [data-reveal-stagger], .section-reveal').forEach(el => {
      observer.observe(el);
    });

    // Initialize parallax if any elements have it
    initParallax();

    // Initialize scroll progress indicators
    initScrollProgress();
  }

  /**
   * Handle intersection events
   */
  function handleIntersection(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;

        // Check if already revealed (for "once" mode)
        if (config.once && revealedElements.has(element)) {
          return;
        }

        // Add revealed class
        element.classList.add('revealed');
        revealedElements.add(element);

        // Trigger counter animation if needed
        if (element.dataset.reveal === 'counter') {
          animateCounter(element);
        }

        // Trigger split text reveal if needed
        if (element.dataset.reveal === 'split') {
          revealSplitText(element);
        }

        // Stop observing if only animating once
        if (config.once) {
          observer.unobserve(element);
        }
      } else if (!config.once) {
        // Remove revealed class when out of view (if not "once" mode)
        entry.target.classList.remove('revealed');
      }
    });
  }

  /**
   * Animate number counters
   */
  function animateCounter(element) {
    const target = parseInt(element.dataset.target || element.textContent, 10);
    const duration = parseInt(element.dataset.duration || 2000, 10);
    const start = 0;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out-expo)
      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const current = Math.round(start + (target - start) * easeOutExpo);
      element.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }

    requestAnimationFrame(updateCounter);
  }

  /**
   * Reveal split text character by character
   */
  function revealSplitText(element) {
    const text = element.textContent;
    element.innerHTML = '';

    text.split('').forEach((char, index) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.transitionDelay = `${index * 30}ms`;
      element.appendChild(span);
    });
  }

  /**
   * Initialize parallax scrolling
   */
  function initParallax() {
    // Skip parallax on mobile - not useful and wastes FPS
    if (window.innerWidth <= 768) return;

    const parallaxElements = document.querySelectorAll('[data-parallax]');

    if (parallaxElements.length === 0) return;

    let ticking = false;

    function updateParallax() {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      parallaxElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const speed = parseFloat(el.dataset.parallax) || 0.1;

        // Only update if element is near viewport
        if (rect.top < windowHeight + 200 && rect.bottom > -200) {
          const yPos = (scrollY - el.offsetTop) * speed;
          el.style.transform = `translateY(${yPos}px)`;
        }
      });

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /**
   * Initialize scroll progress indicator
   */
  function initScrollProgress() {
    const progressBar = document.querySelector('[data-scroll-progress]');
    if (!progressBar) return;

    function updateProgress() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / scrollHeight) * 100;
      progressBar.style.width = `${progress}%`;
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /**
   * Utility: Reveal element programmatically
   */
  function revealElement(selector) {
    const element = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (element) {
      element.classList.add('revealed');
      revealedElements.add(element);
    }
  }

  /**
   * Utility: Reset element to hidden state
   */
  function resetElement(selector) {
    const element = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (element) {
      element.classList.remove('revealed');
      revealedElements.delete(element);
    }
  }

  /**
   * Utility: Observe new elements added dynamically
   */
  function observeNewElements(container) {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: config.threshold,
      rootMargin: config.rootMargin
    });

    container.querySelectorAll('[data-reveal], [data-reveal-stagger], .section-reveal').forEach(el => {
      if (!revealedElements.has(el)) {
        observer.observe(el);
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
  } else {
    initScrollReveal();
  }

  // Expose utility functions globally
  window.ScrollReveal = {
    reveal: revealElement,
    reset: resetElement,
    observe: observeNewElements,
    init: initScrollReveal,
    config: config
  };

  // Debug mode - log when elements are revealed
  if (window.location.search.includes('debug-scroll')) {
    const originalHandler = handleIntersection;
    handleIntersection = function(entries, observer) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log('Revealed:', entry.target, entry.target.dataset.reveal);
        }
      });
      originalHandler(entries, observer);
    };
  }

})();
