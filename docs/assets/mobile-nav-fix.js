/**
 * Mobile Navigation Fix
 * Simple toggle behavior for mobile:
 * - Click the arrow (→) to expand/collapse nested items
 * - Browse and select specific pages from the expanded list
 * - Prevent body scroll when sidebar is open (keeps sidebar truly fixed)
 */

(function() {
  'use strict';

  // Only run on mobile/tablet (same breakpoint as CSS)
  function isMobileView() {
    return window.matchMedia('(max-width: 76.24em)').matches;
  }

  function setupMobileNavigation() {
    if (!isMobileView()) return;

    // Get the primary sidebar
    const primarySidebar = document.querySelector('.md-sidebar--primary');
    if (!primarySidebar) return;

    // Find all top-level navigation items that are labels (section headers)
    const topLevelLabels = primarySidebar.querySelectorAll('.md-nav--primary > .md-nav__list > .md-nav__item > label.md-nav__link');

    topLevelLabels.forEach(label => {
      // Make it clear the toggle is clickable
      label.style.cursor = 'pointer';
    });
  }

  // FIX: Prevent body scroll when drawer is open on mobile
  // This keeps the sidebar truly fixed and prevents disorienting background scrolling
  function setupBodyScrollLock() {
    const drawerCheckbox = document.getElementById('__drawer');
    if (!drawerCheckbox) return;

    drawerCheckbox.addEventListener('change', function() {
      if (!isMobileView()) return;

      if (this.checked) {
        // Sidebar opened - prevent body scroll
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      } else {
        // Sidebar closed - restore body scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
    });
  }

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setupMobileNavigation();
      setupBodyScrollLock();
    });
  } else {
    setupMobileNavigation();
    setupBodyScrollLock();
  }

  // Re-run on window resize (if user rotates device or resizes window)
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      setupMobileNavigation();
      // Reset body styles if switched to desktop
      if (!isMobileView()) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
    }, 250);
  });
})();
