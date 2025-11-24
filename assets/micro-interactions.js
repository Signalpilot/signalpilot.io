/**
 * Micro-Interactions
 * Stunning visual effects for enhanced user experience
 */

// ============================================
// 1. MAGNETIC CURSOR EFFECT
// ============================================
function initMagneticCards() {
  const cards = document.querySelectorAll('.card.product, .card.plan, .feature');

  cards.forEach(card => {
    // Store original transform for reset
    let isHovering = false;

    card.addEventListener('mouseenter', () => {
      isHovering = true;
      card.style.transition = 'none';
    });

    card.addEventListener('mousemove', (e) => {
      if (!isHovering) return;

      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      // Calculate offset from center
      const x = (e.clientX - cardCenterX) / 20;
      const y = (e.clientY - cardCenterY) / 20;

      // Apply 3D transform with spring physics feel
      card.style.transform = `
        perspective(1000px)
        rotateY(${x}deg)
        rotateX(${-y}deg)
        translateZ(10px)
        scale(1.02)
      `;

      // Add subtle glow effect
      const glowIntensity = Math.min(Math.abs(x) + Math.abs(y), 15) / 15;
      card.style.boxShadow = `
        0 20px 60px rgba(91, 138, 255, ${0.15 + glowIntensity * 0.15}),
        0 0 ${20 + glowIntensity * 30}px rgba(118, 221, 255, ${0.1 + glowIntensity * 0.2})
      `;
    });

    card.addEventListener('mouseleave', () => {
      isHovering = false;
      // Smooth return to original position
      card.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1)';
      card.style.boxShadow = ''; // Reset to default

      // Remove transition after animation completes
      setTimeout(() => {
        if (!isHovering) {
          card.style.transition = '';
        }
      }, 500);
    });
  });
}

// ============================================
// 2. BUTTON RIPPLE EFFECT
// ============================================
function initButtonRipple() {
  const buttons = document.querySelectorAll('.btn');

  buttons.forEach(button => {
    // Ensure button has position context for ripple
    if (getComputedStyle(button).position === 'static') {
      button.style.position = 'relative';
    }

    button.addEventListener('click', function(e) {
      // Create ripple element
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');

      // Calculate ripple position
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      // Set ripple styles
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';

      // Add ripple to button
      this.appendChild(ripple);

      // Remove ripple after animation
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

// ============================================
// 3. SMOOTH PAGE TRANSITIONS
// ============================================
function initSmoothTransitions() {
  // Check if View Transitions API is supported
  if (!document.startViewTransition) {
    console.log('View Transitions API not supported, using fallback');
    return;
  }

  // Intercept navigation for smooth transitions
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');

    // Only handle internal links
    if (!link ||
        link.target === '_blank' ||
        link.href.startsWith('mailto:') ||
        link.href.startsWith('tel:') ||
        link.hostname !== window.location.hostname) {
      return;
    }

    // Handle hash links (same page navigation)
    if (link.hash && link.pathname === window.location.pathname) {
      e.preventDefault();
      const targetId = link.hash.slice(1);
      const target = document.getElementById(targetId);

      if (target) {
        document.startViewTransition(() => {
          target.scrollIntoView({ behavior: 'smooth' });
        });
      }
    }
  });

  // Add morph animation for section transitions
  const sections = document.querySelectorAll('section[id]');
  sections.forEach(section => {
    section.style.viewTransitionName = `section-${section.id}`;
  });
}

// ============================================
// 4. ENHANCED HOVER EFFECTS
// ============================================
function initEnhancedHovers() {
  // Add glow effect to primary buttons
  const primaryButtons = document.querySelectorAll('.btn-primary, .btn-cta');

  primaryButtons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.transition = 'all 0.3s ease';
      this.style.filter = 'brightness(1.1) drop-shadow(0 0 20px rgba(91, 138, 255, 0.4))';
    });

    button.addEventListener('mouseleave', function() {
      this.style.filter = '';
    });
  });
}

// ============================================
// 5. PARALLAX MICRO-SHIFTS
// ============================================
function initParallaxMicroShifts() {
  const elements = document.querySelectorAll('.hero-content, .section-header');

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    elements.forEach((element, index) => {
      const speed = (index + 1) * 0.05; // Different speed per element
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  }, { passive: true });
}

// ============================================
// INITIALIZATION
// ============================================
function initMicroInteractions() {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    console.log('User prefers reduced motion - skipping micro-interactions');
    return;
  }

  // Check device capability for performance
  const isLowEndDevice = window.deviceCapability?.tier === 'low' ||
                         /Android.*Chrome/.test(navigator.userAgent);

  // Initialize button ripple (lightweight, works everywhere)
  initButtonRipple();

  // Initialize magnetic cards only on capable devices
  if (!isLowEndDevice) {
    initMagneticCards();
    initEnhancedHovers();
    initSmoothTransitions();
    // Skip parallax on mobile for better performance
    if (window.innerWidth > 768) {
      initParallaxMicroShifts();
    }
  }

  console.log('🎨 Micro-interactions initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMicroInteractions);
} else {
  initMicroInteractions();
}
