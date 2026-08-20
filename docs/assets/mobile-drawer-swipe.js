/**
 * Mobile Drawer Swipe-to-Close
 * DISABLED: Accordion navigation doesn't need swipe gestures
 * This file is kept for easy reversion but functionality is disabled
 */
(function() {
  'use strict';

  // ACCORDION MODE: Swipe gestures disabled
  console.log('ℹ️  Accordion navigation active - swipe gestures disabled');
  return; // Exit early

  // Only run on touch-enabled devices
  if (!('ontouchstart' in window)) return;

  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  let isSwiping = false;

  const drawer = document.getElementById('__drawer');
  const overlay = document.querySelector('.md-overlay');
  const sidebar = document.querySelector('.md-sidebar--primary');

  if (!drawer || !overlay || !sidebar) return;

  // Minimum swipe distance (in pixels)
  const MIN_SWIPE_DISTANCE = 50;
  // Maximum vertical movement to still count as horizontal swipe
  const MAX_VERTICAL_DISTANCE = 100;

  function handleTouchStart(e) {
    // Only handle if drawer is open
    if (!drawer.checked) return;

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = true;
  }

  function handleTouchMove(e) {
    if (!isSwiping || !drawer.checked) return;

    touchEndX = e.touches[0].clientX;
    touchEndY = e.touches[0].clientY;

    // Just track the movement - with passive listeners we can't preventDefault
    // This allows smooth scrolling while still detecting swipe gestures
  }

  function handleTouchEnd(e) {
    if (!isSwiping || !drawer.checked) return;

    const deltaX = touchEndX - touchStartX;
    const deltaY = Math.abs(touchEndY - touchStartY);

    // Check if it's a valid left swipe
    const isLeftSwipe = deltaX < -MIN_SWIPE_DISTANCE;
    const isHorizontal = deltaY < MAX_VERTICAL_DISTANCE;

    if (isLeftSwipe && isHorizontal) {
      // Close the drawer
      drawer.checked = false;

      // Add visual feedback
      sidebar.style.transition = 'transform 0.3s ease-out';
      setTimeout(() => {
        sidebar.style.transition = '';
      }, 300);
    }

    // Reset
    isSwiping = false;
    touchStartX = 0;
    touchStartY = 0;
    touchEndX = 0;
    touchEndY = 0;
  }

  // Add event listeners to the sidebar
  // PASSIVE LISTENERS: Allows smooth scrolling without browser waiting for JS
  // The trade-off is we can't preventDefault, but smooth scrolling is more important
  sidebar.addEventListener('touchstart', handleTouchStart, { passive: true });
  sidebar.addEventListener('touchmove', handleTouchMove, { passive: true });
  sidebar.addEventListener('touchend', handleTouchEnd, { passive: true });

  // Also support swipe-left on the overlay to close
  overlay.addEventListener('touchstart', function(e) {
    if (!drawer.checked) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = true;
  }, { passive: true });

  overlay.addEventListener('touchmove', function(e) {
    if (!isSwiping || !drawer.checked) return;
    touchEndX = e.touches[0].clientX;
    touchEndY = e.touches[0].clientY;
  }, { passive: true });

  overlay.addEventListener('touchend', handleTouchEnd, { passive: true });

  // Re-initialize on page navigation (for MkDocs instant loading)
  if (typeof document$ !== 'undefined') {
    document$.subscribe(() => {
      // Slight delay to ensure DOM is ready
      setTimeout(() => {
        const newDrawer = document.getElementById('__drawer');
        const newOverlay = document.querySelector('.md-overlay');
        const newSidebar = document.querySelector('.md-sidebar--primary');

        if (newDrawer && newOverlay && newSidebar) {
          drawer = newDrawer;
          overlay = newOverlay;
          sidebar = newSidebar;
        }
      }, 100);
    });
  }

  console.log('✅ Mobile drawer swipe-to-close enabled');
})();
