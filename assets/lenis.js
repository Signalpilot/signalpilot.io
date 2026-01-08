/**
 * Lenis Smooth Scroll - Butter smooth scrolling
 * https://lenis.darkroom.engineering
 */
(function() {
  'use strict';

  // Initialize Lenis smooth scrolling
  const lenis = new Lenis({
    duration: 10,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
    orientation: 'vertical',
    smoothWheel: true,
    syncTouch: true,
    syncTouchLerp: 0.12,
    touchMultiplier: 2,
  });

  // Integrate with requestAnimationFrame
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Make lenis globally accessible for other scripts
  window.lenis = lenis;
})();
