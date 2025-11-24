/**
 * Apple-Style Horizontal Scroll
 * Interactive horizontal scroll for Elite Seven indicators
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
    parallaxLeftClass: 'parallax-left',
    parallaxRightClass: 'parallax-right',
    scrollThreshold: 0.3, // 30% scroll to snap to next card
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

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    // Get elements
    track = document.querySelector(CONFIG.trackSelector);
    if (!track) {
      console.warn('Horizontal scroll track not found');
      return;
    }

    cards = Array.from(track.querySelectorAll(CONFIG.cardSelector));
    dotsContainer = document.querySelector(CONFIG.dotsContainer);
    leftArrow = document.querySelector(CONFIG.leftArrow);
    rightArrow = document.querySelector(CONFIG.rightArrow);

    if (cards.length === 0) {
      console.warn('No product cards found in horizontal scroll');
      return;
    }

    // Create navigation dots
    createDots();

    // Set up event listeners
    setupEventListeners();

    // Initialize first card as active
    updateActiveCard(0);

    // Observe scroll
    observeScroll();

    console.log('🎯 Horizontal scroll initialized with', cards.length, 'cards');
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
    // Arrow navigation
    if (leftArrow) {
      leftArrow.addEventListener('click', () => scrollToCard(currentIndex - 1));
    }

    if (rightArrow) {
      rightArrow.addEventListener('click', () => scrollToCard(currentIndex + 1));
    }

    // Track scroll event
    track.addEventListener('scroll', handleScroll, { passive: true });

    // Keyboard navigation
    track.addEventListener('keydown', handleKeyboard);

    // Touch/mouse drag enhancement
    setupDragScroll();

    // Update on window resize
    window.addEventListener('resize', debounce(handleResize, 250));
  }

  // ============================================
  // SCROLL HANDLING
  // ============================================

  function handleScroll() {
    isScrolling = true;

    // Clear previous timeout
    clearTimeout(scrollTimeout);

    // Update active card based on scroll position
    updateActiveCardByScroll();

    // Set timeout to mark scrolling as complete
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
      track.classList.add('settled');

      // Final position snap
      snapToNearestCard();
    }, 150);
  }

  function updateActiveCardByScroll() {
    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(cardCenter - trackCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== currentIndex) {
      updateActiveCard(closestIndex);
    }
  }

  function snapToNearestCard() {
    // Ensure we're snapped to the current active card
    scrollToCard(currentIndex, 'smooth');
  }

  // ============================================
  // ACTIVE CARD MANAGEMENT
  // ============================================

  function updateActiveCard(index) {
    // Bounds check
    if (index < 0 || index >= cards.length) return;

    currentIndex = index;

    // Update cards
    cards.forEach((card, i) => {
      card.classList.remove(CONFIG.activeClass, CONFIG.parallaxLeftClass, CONFIG.parallaxRightClass);

      if (i === index) {
        card.classList.add(CONFIG.activeClass);
      } else if (i < index) {
        card.classList.add(CONFIG.parallaxLeftClass);
      } else {
        card.classList.add(CONFIG.parallaxRightClass);
      }
    });

    // Update dots
    updateDots(index);

    // Update arrows
    updateArrows(index);
  }

  function updateDots(index) {
    if (!dotsContainer) return;

    const dots = dotsContainer.querySelectorAll('.scroll-dot');
    dots.forEach((dot, i) => {
      if (i === index) {
        dot.classList.add(CONFIG.activeClass);
      } else {
        dot.classList.remove(CONFIG.activeClass);
      }
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

  function scrollToCard(index, behavior = 'smooth') {
    // Bounds check
    if (index < 0 || index >= cards.length) return;

    const card = cards[index];
    if (!card) return;

    // Calculate scroll position to center the card
    const trackRect = track.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    const trackCenter = trackRect.width / 2;
    const cardCenter = cardRect.width / 2;
    const cardLeft = cardRect.left - trackRect.left;

    const scrollLeft = track.scrollLeft + cardLeft - trackCenter + cardCenter;

    track.scrollTo({
      left: scrollLeft,
      behavior: behavior,
    });

    // Update active card immediately
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
  // DRAG SCROLL (Enhanced Touch/Mouse)
  // ============================================

  function setupDragScroll() {
    let isDown = false;
    let startX;
    let scrollLeft;

    track.addEventListener('mousedown', (e) => {
      // Only for mouse drag, not touch
      if (e.touches) return;

      isDown = true;
      track.classList.add('dragging');
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      track.style.cursor = 'grabbing';
    });

    track.addEventListener('mouseleave', () => {
      isDown = false;
      track.classList.remove('dragging');
      track.style.cursor = '';
    });

    track.addEventListener('mouseup', () => {
      isDown = false;
      track.classList.remove('dragging');
      track.style.cursor = '';
    });

    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();

      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 2; // Multiply for faster scroll
      track.scrollLeft = scrollLeft - walk;
    });
  }

  // ============================================
  // INTERSECTION OBSERVER (Lazy Load)
  // ============================================

  function observeScroll() {
    if (!('IntersectionObserver' in window)) return;

    const options = {
      root: track,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, options);

    cards.forEach((card) => {
      observer.observe(card);
    });
  }

  // ============================================
  // RESIZE HANDLER
  // ============================================

  function handleResize() {
    // Re-center current card on resize
    scrollToCard(currentIndex, 'auto');
  }

  // ============================================
  // UTILITIES
  // ============================================

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
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
