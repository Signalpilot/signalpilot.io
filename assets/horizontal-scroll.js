/**
 * Apple-Style Horizontal Scroll
 * Interactive horizontal scroll for Elite Seven indicators
 * OPTIMIZED for performance
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================

  const CONFIG = {
    trackSelector: '#elite-seven-track',
    cardSelector: '.card.product',
    dotsContainer: '.scroll-dots',
    leftArrow: '.scroll-arrow-left',
    rightArrow: '.scroll-arrow-right',
    activeClass: 'active',
  };

  // ============================================
  // STATE
  // ============================================

  let track = null;
  let cards = [];
  let dotsContainer = null;
  let leftArrow = null;
  let rightArrow = null;
  let currentIndex = 0;
  let isScrolling = false;
  let scrollTimeout = null;
  let ticking = false; // RAF throttle flag

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    track = document.querySelector(CONFIG.trackSelector);
    if (!track) return;

    cards = Array.from(track.querySelectorAll(CONFIG.cardSelector));
    dotsContainer = document.querySelector(CONFIG.dotsContainer);
    leftArrow = document.querySelector(CONFIG.leftArrow);
    rightArrow = document.querySelector(CONFIG.rightArrow);

    if (cards.length === 0) return;

    createDots();
    setupEventListeners();
    updateActiveCard(0);
  }

  // ============================================
  // NAVIGATION DOTS
  // ============================================

  function createDots() {
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';

    cards.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'scroll-dot';
      dot.setAttribute('aria-label', `Go to indicator ${index + 1}`);
      dot.addEventListener('click', () => scrollToCard(index));

      if (index === 0) {
        dot.classList.add(CONFIG.activeClass);
      }

      dotsContainer.appendChild(dot);
    });
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  function setupEventListeners() {
    if (leftArrow) {
      leftArrow.addEventListener('click', () => scrollToCard(currentIndex - 1));
    }

    if (rightArrow) {
      rightArrow.addEventListener('click', () => scrollToCard(currentIndex + 1));
    }

    // Throttled scroll handler
    track.addEventListener('scroll', handleScroll, { passive: true });

    // Keyboard navigation
    track.addEventListener('keydown', handleKeyboard);

    // Drag scroll
    setupDragScroll();
  }

  // ============================================
  // SCROLL HANDLING - OPTIMIZED
  // ============================================

  function handleScroll() {
    isScrolling = true;

    // Clear previous timeout
    clearTimeout(scrollTimeout);

    // Throttle with RAF - only update once per frame
    if (!ticking) {
      requestAnimationFrame(() => {
        updateActiveCardByScroll();
        ticking = false;
      });
      ticking = true;
    }

    // Only snap after scrolling stops (debounced)
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
      // Don't auto-snap - let CSS scroll-snap handle it
    }, 150);
  }

  function updateActiveCardByScroll() {
    // Use scroll position math instead of getBoundingClientRect for each card
    const scrollLeft = track.scrollLeft;
    const trackWidth = track.offsetWidth;
    const cardWidth = cards[0]?.offsetWidth || 350;
    const gap = 32; // 2rem gap

    // Calculate which card is centered
    const centerOffset = scrollLeft + (trackWidth / 2);
    const estimatedIndex = Math.round((centerOffset - cardWidth / 2) / (cardWidth + gap));
    const newIndex = Math.max(0, Math.min(cards.length - 1, estimatedIndex));

    if (newIndex !== currentIndex) {
      updateActiveCard(newIndex);
    }
  }

  // ============================================
  // ACTIVE CARD MANAGEMENT
  // ============================================

  function updateActiveCard(index) {
    if (index < 0 || index >= cards.length) return;

    currentIndex = index;

    // Simple class toggle - no parallax classes
    cards.forEach((card, i) => {
      if (i === index) {
        card.classList.add(CONFIG.activeClass);
      } else {
        card.classList.remove(CONFIG.activeClass);
      }
    });

    updateDots(index);
    updateArrows(index);
  }

  function updateDots(index) {
    if (!dotsContainer) return;

    const dots = dotsContainer.querySelectorAll('.scroll-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle(CONFIG.activeClass, i === index);
    });
  }

  function updateArrows(index) {
    if (leftArrow) {
      leftArrow.disabled = index === 0;
    }

    if (rightArrow) {
      rightArrow.disabled = index === cards.length - 1;
    }
  }

  // ============================================
  // SCROLL TO CARD
  // ============================================

  function scrollToCard(index) {
    if (index < 0 || index >= cards.length) return;

    const card = cards[index];
    if (!card) return;

    // Use scrollIntoView - simpler and browser-optimized
    card.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });

    updateActiveCard(index);
  }

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================

  function handleKeyboard(e) {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        scrollToCard(currentIndex - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        scrollToCard(currentIndex + 1);
        break;
      case 'Home':
        e.preventDefault();
        scrollToCard(0);
        break;
      case 'End':
        e.preventDefault();
        scrollToCard(cards.length - 1);
        break;
    }
  }

  // ============================================
  // DRAG SCROLL
  // ============================================

  function setupDragScroll() {
    let isDown = false;
    let startX;
    let scrollLeft;

    track.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Only left click
      isDown = true;
      track.style.cursor = 'grabbing';
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => {
      isDown = false;
      track.style.cursor = '';
    });

    track.addEventListener('mouseup', () => {
      isDown = false;
      track.style.cursor = '';
    });

    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });
  }

  // ============================================
  // AUTO-INIT
  // ============================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
