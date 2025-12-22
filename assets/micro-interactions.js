/**
 * Micro-Interactions
 * Stunning visual effects for enhanced user experience
 * OPTIMIZED for performance
 */

// ============================================
// THROTTLE UTILITY
// ============================================
function throttle(fn, wait) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// ============================================
// 1. MAGNETIC CURSOR EFFECT - OPTIMIZED
// ============================================
function initMagneticCards() {
  // Removed .card.plan and .card.product - 3D effect was causing issues on cards
  const cards = document.querySelectorAll('.feature');

  cards.forEach(card => {
    let isHovering = false;
    let rect = null;
    let rafId = null;
    let targetX = 0;
    let targetY = 0;

    // Cache rect on mouseenter (not on every move!)
    card.addEventListener('mouseenter', () => {
      isHovering = true;
      rect = card.getBoundingClientRect();
      card.style.transition = 'none';
      card.style.willChange = 'transform';
    });

    // Throttled mousemove - just store target values
    card.addEventListener('mousemove', throttle((e) => {
      if (!isHovering || !rect) return;

      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      targetX = (e.clientX - cardCenterX) / 20;
      targetY = (e.clientY - cardCenterY) / 20;

      // Only request one RAF at a time
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          if (isHovering) {
            card.style.transform = `
              perspective(1000px)
              rotateY(${targetX}deg)
              rotateX(${-targetY}deg)
              translateZ(10px)
              scale(1.02)
            `;
          }
          rafId = null;
        });
      }
    }, 32)); // ~30fps throttle

    card.addEventListener('mouseleave', () => {
      isHovering = false;
      rect = null;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      card.style.transform = '';
      card.style.willChange = '';
    });
  });
}

// ============================================
// 2. BUTTON RIPPLE EFFECT
// ============================================
function initButtonRipple() {
  const buttons = document.querySelectorAll('.btn');

  buttons.forEach(button => {
    if (getComputedStyle(button).position === 'static') {
      button.style.position = 'relative';
    }

    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');

      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';

      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });
}

// ============================================
// 3. SMOOTH PAGE TRANSITIONS
// ============================================
function initSmoothTransitions() {
  if (!document.startViewTransition) return;

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');

    if (!link ||
        link.target === '_blank' ||
        link.href.startsWith('mailto:') ||
        link.href.startsWith('tel:') ||
        link.hostname !== window.location.hostname) {
      return;
    }

    if (link.hash && link.pathname === window.location.pathname) {
      e.preventDefault();
      const target = document.getElementById(link.hash.slice(1));
      if (target) {
        document.startViewTransition(() => {
          target.scrollIntoView({ behavior: 'smooth' });
        });
      }
    }
  });
}

// ============================================
// 4. ENHANCED HOVER EFFECTS
// ============================================
function initEnhancedHovers() {
  const primaryButtons = document.querySelectorAll('.btn-primary, .btn-cta');

  primaryButtons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.filter = 'brightness(1.1)';
    });

    button.addEventListener('mouseleave', function() {
      this.style.filter = '';
    });
  });
}

// ============================================
// 5. PARALLAX MICRO-SHIFTS - OPTIMIZED
// ============================================
function initParallaxMicroShifts() {
  const elements = document.querySelectorAll('.hero-content, .section-header');
  if (elements.length === 0) return;

  let ticking = false;

  function updateParallax() {
    const scrolled = window.pageYOffset;

    elements.forEach((element, index) => {
      const speed = (index + 1) * 0.05;
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
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

// ============================================
// INITIALIZATION
// ============================================
function initMicroInteractions() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const isLowEndDevice = window.deviceCapability?.tier === 'low';
  const isMobile = window.innerWidth <= 768;

  // Only ripple on mobile - everything else is desktop only for performance
  initButtonRipple();

  if (!isLowEndDevice && !isMobile) {
    initMagneticCards();
    initEnhancedHovers();
    initSmoothTransitions();
    initParallaxMicroShifts();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMicroInteractions);
} else {
  initMicroInteractions();
}
