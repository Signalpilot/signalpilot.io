/**
 * Lenis Smooth Scroll - Butter smooth scrolling
 * https://lenis.darkroom.engineering
 *
 * MOBILE OPTIMIZATION: Disabled on mobile/tablet devices
 * Native iOS/Android scrolling is smoother and more battery-efficient
 */
(function() {
  'use strict';

  // Mobile/tablet detection - disable Lenis for better native scroll
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth <= 1024
    || ('ontouchstart' in window && navigator.maxTouchPoints > 1);

  // Skip Lenis entirely on mobile - native scroll is better
  if (isMobile) {
    // Remove any Lenis-injected styles that might interfere
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
    window.lenis = null;
    return;
  }

  // Desktop-only: Initialize Lenis with optimized settings
  const lenis = new Lenis({
    duration: 1.2,  // Much faster - was 4 (way too slow!)
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
    orientation: 'vertical',
    smoothWheel: true,
    syncTouch: false,  // Disable touch sync on desktop (mouse/trackpad only)
    touchMultiplier: 1.5,
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

  // Start RAF on scroll/wheel events (desktop only)
  window.addEventListener('scroll', startRAF, { passive: true });
  window.addEventListener('wheel', startRAF, { passive: true });

  // Initial RAF call for page load animations
  rafId = requestAnimationFrame(raf);
  scrollTimeout = setTimeout(() => {
    isScrolling = false;
  }, 500);

  // Make lenis globally accessible for other scripts
  window.lenis = lenis;
})();
