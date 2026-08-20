/**
 * WHEEL EVENT DIAGNOSTIC - Find what's blocking mouse wheel
 */
(function() {
  'use strict';

  console.log('🔍 WHEEL DIAGNOSTIC: Starting...');

  // Log the element under the mouse when wheel event fires
  document.addEventListener('wheel', function(e) {
    const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);

    console.log('🎯 WHEEL EVENT:', {
      deltaY: e.deltaY,
      target: e.target.tagName + (e.target.className ? '.' + e.target.className.split(' ')[0] : ''),
      elementUnderMouse: elementUnderMouse ?
        elementUnderMouse.tagName + (elementUnderMouse.className ? '.' + elementUnderMouse.className.split(' ')[0] : '') :
        'null',
      defaultPrevented: e.defaultPrevented,
      propagationStopped: e.cancelBubble
    });

    // If wheel event is being prevented, find out by what
    if (e.defaultPrevented) {
      console.error('⛔ Wheel event is being PREVENTED!');
    }

    // Check if element under mouse is blocking scroll
    if (elementUnderMouse) {
      const styles = window.getComputedStyle(elementUnderMouse);
      console.log('📊 Element under mouse styles:', {
        position: styles.position,
        zIndex: styles.zIndex,
        pointerEvents: styles.pointerEvents,
        overflow: styles.overflow,
        overflowY: styles.overflowY,
        width: styles.width,
        height: styles.height
      });
    }
  }, { passive: false, capture: true });

  // Find all elements that might be blocking
  setTimeout(() => {
    const suspects = [];

    // Check for fixed/sticky elements that cover the viewport
    document.querySelectorAll('*').forEach(el => {
      const styles = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();

      if ((styles.position === 'fixed' || styles.position === 'sticky') &&
          rect.width > window.innerWidth * 0.8 &&
          rect.height > window.innerHeight * 0.8) {
        suspects.push({
          element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
          position: styles.position,
          zIndex: styles.zIndex,
          pointerEvents: styles.pointerEvents,
          width: rect.width,
          height: rect.height
        });
      }
    });

    if (suspects.length > 0) {
      console.warn('⚠️ FOUND SUSPICIOUS FULL-SCREEN ELEMENTS:', suspects);
    }
  }, 2000);

})();
