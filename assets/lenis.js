/**
 * Lenis Smooth Scroll - Butter smooth scrolling
 * https://lenis.darkroom.engineering
 */
(function() {
  'use strict';

  // Initialize Lenis smooth scrolling
  const lenis = new Lenis({
    duration: 4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
    orientation: 'vertical',
    smoothWheel: true,
    syncTouch: true,
    syncTouchLerp: 0.045,
    touchMultiplier: 2,
  });

  // Integrate with requestAnimationFrame - OPTIMIZED
  // Only run RAF when actively scrolling to prevent FPS drops
  let rafId = null;
  let isScrolling = false;
  let scrollTimeout = null;

  function raf(time) {
    lenis.raf(time);
    if (isScrolling) {
      rafId = requestAnimationFrame(raf);
    } else {
      rafId = null;
    }
  }

  function startRAF() {
    if (!rafId) {
      isScrolling = true;
      rafId = requestAnimationFrame(raf);
    }
    // Reset the timeout on each scroll event
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 150); // Stop RAF 150ms after last scroll
  }

  // Start RAF on scroll/wheel events
  window.addEventListener('scroll', startRAF, { passive: true });
  window.addEventListener('wheel', startRAF, { passive: true });
  window.addEventListener('touchmove', startRAF, { passive: true });

  // Initial RAF call for page load animations
  rafId = requestAnimationFrame(raf);
  scrollTimeout = setTimeout(() => {
    isScrolling = false;
  }, 500);

  // Make lenis globally accessible for other scripts
  window.lenis = lenis;
})();
