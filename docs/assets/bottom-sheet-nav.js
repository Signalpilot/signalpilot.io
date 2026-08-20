/**
 * Bottom Sheet Mobile Navigation
 * Modern mobile app-style navigation that slides up from bottom
 * Features: Swipe down to dismiss, tap outside to close, drag handle
 */

(function() {
  'use strict';

  // Only run on mobile/tablet (same breakpoint as CSS)
  function isMobileView() {
    return window.matchMedia('(max-width: 76.24em)').matches;
  }

  // Add visual drag handle to bottom sheet
  function addDragHandle() {
    if (!isMobileView()) return;

    const sidebar = document.querySelector('.md-sidebar--primary');
    if (!sidebar) return;

    // Check if handle already exists
    if (sidebar.querySelector('.bottom-sheet-handle')) return;

    // Create drag handle element
    const handle = document.createElement('div');
    handle.className = 'bottom-sheet-handle';
    handle.setAttribute('aria-hidden', 'true');
    handle.innerHTML = '<div class="bottom-sheet-handle-bar"></div>';

    // Insert at the very top of sidebar
    sidebar.insertBefore(handle, sidebar.firstChild);

    // Add styles via JavaScript (keeps CSS separate)
    if (!document.getElementById('bottom-sheet-handle-styles')) {
      const style = document.createElement('style');
      style.id = 'bottom-sheet-handle-styles';
      style.textContent = `
        .bottom-sheet-handle {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--md-default-bg-color);
          z-index: 10;
          cursor: grab;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
        }
        .bottom-sheet-handle-bar {
          width: 40px;
          height: 4px;
          background: rgba(148, 163, 184, 0.4);
          border-radius: 2px;
          transition: background 0.2s ease;
        }
        .bottom-sheet-handle:active {
          cursor: grabbing;
        }
        .bottom-sheet-handle:active .bottom-sheet-handle-bar {
          background: rgba(148, 163, 184, 0.6);
        }
      `;
      document.head.appendChild(style);
    }

    console.log('[Bottom Sheet] Drag handle added');
  }

  // Swipe down to dismiss functionality
  function setupSwipeGestures() {
    if (!isMobileView()) return;

    const sidebar = document.querySelector('.md-sidebar--primary');
    const drawerCheckbox = document.getElementById('__drawer');
    if (!sidebar || !drawerCheckbox) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    const swipeThreshold = 50; // pixels to swipe before dismissing

    sidebar.addEventListener('touchstart', function(e) {
      // Only start drag from the drag handle or top area
      const handle = sidebar.querySelector('.bottom-sheet-handle');
      if (handle && handle.contains(e.target)) {
        startY = e.touches[0].clientY;
        isDragging = true;
      }
    }, { passive: true });

    sidebar.addEventListener('touchmove', function(e) {
      if (!isDragging) return;

      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      // Only allow dragging down (positive delta)
      if (deltaY > 0) {
        // Visual feedback: translate the sheet down as user drags
        sidebar.style.transform = `translateY(${Math.min(deltaY, 200)}px)`;
        sidebar.style.transition = 'none';
      }
    }, { passive: true });

    sidebar.addEventListener('touchend', function(e) {
      if (!isDragging) return;

      const deltaY = currentY - startY;

      // If swiped down more than threshold, close the sheet
      if (deltaY > swipeThreshold) {
        drawerCheckbox.checked = false; // Close the drawer
        console.log('[Bottom Sheet] Dismissed via swipe');
      }

      // Reset transform and re-enable transition
      sidebar.style.transform = '';
      sidebar.style.transition = '';

      isDragging = false;
      startY = 0;
      currentY = 0;
    }, { passive: true });

    console.log('[Bottom Sheet] Swipe gestures enabled');
  }

  // Prevent body scroll when sheet is open
  function setupBodyScrollLock() {
    const drawerCheckbox = document.getElementById('__drawer');
    if (!drawerCheckbox) return;

    drawerCheckbox.addEventListener('change', function() {
      if (!isMobileView()) return;

      if (this.checked) {
        // Sheet opened - prevent body scroll
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        console.log('[Bottom Sheet] Opened');
      } else {
        // Sheet closed - restore body scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        console.log('[Bottom Sheet] Closed');
      }
    });
  }

  // Initialize everything
  function init() {
    if (!isMobileView()) {
      console.log('[Bottom Sheet] Desktop mode - bottom sheet disabled');
      return;
    }

    addDragHandle();
    setupSwipeGestures();
    setupBodyScrollLock();

    console.log('[Bottom Sheet] Initialized successfully');
  }

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-run on window resize (if user rotates device)
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      // Clean up if switched to desktop
      if (!isMobileView()) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';

        const handle = document.querySelector('.bottom-sheet-handle');
        if (handle) handle.remove();
      } else {
        // Switched to mobile - reinitialize
        init();
      }
    }, 250);
  });
})();
