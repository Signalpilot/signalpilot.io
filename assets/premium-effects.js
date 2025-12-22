/**
 * PREMIUM EFFECTS
 * Parallax, scroll-linked animations, and advanced interactions
 * OPTIMIZED for performance
 */

(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Throttle helper
  function throttle(func, limit) {
    let lastTime = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastTime >= limit) {
        lastTime = now;
        func.apply(this, args);
      }
    };
  }

  // Lerp helper
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // ============================================
  // 1. PARALLAX SCROLLING - OPTIMIZED
  // ============================================

  class ParallaxController {
    constructor() {
      this.elements = [];
      this.scrollY = 0;
      this.targetScrollY = 0;
      this.rafId = null;
      this.isVisible = true;

      this.init();
    }

    init() {
      document.querySelectorAll('[data-parallax-speed]').forEach(el => {
        this.elements.push({
          el,
          speed: parseFloat(el.dataset.parallaxSpeed) || 0.5,
          isOrb: false
        });
      });

      const orb1 = document.getElementById('parallax-orb-1');
      const orb2 = document.getElementById('parallax-orb-2');

      if (orb1) this.elements.push({ el: orb1, speed: 0.3, isOrb: true });
      if (orb2) this.elements.push({ el: orb2, speed: 0.5, isOrb: true });

      if (this.elements.length === 0) return;

      // Throttled scroll listener
      window.addEventListener('scroll', throttle(() => {
        this.targetScrollY = window.scrollY;
        if (!this.rafId) this.startAnimation();
      }, 16), { passive: true });

      // Pause when tab not visible
      document.addEventListener('visibilitychange', () => {
        this.isVisible = !document.hidden;
        if (this.isVisible && !this.rafId) {
          this.startAnimation();
        }
      });
    }

    startAnimation() {
      if (!this.isVisible) return;
      this.animate();
    }

    animate() {
      // Stop if close enough (no need to keep animating)
      const diff = Math.abs(this.scrollY - this.targetScrollY);
      if (diff < 0.5) {
        this.scrollY = this.targetScrollY;
        this.rafId = null;
        return; // STOP the loop!
      }

      this.scrollY = lerp(this.scrollY, this.targetScrollY, 0.1);

      this.elements.forEach(item => {
        const { el, speed, isOrb } = item;
        if (isOrb) {
          el.style.transform = `translateY(${-this.scrollY * speed}px)`;
        } else {
          el.style.transform = `translateY(${this.scrollY * speed * 0.1}px)`;
        }
      });

      this.rafId = requestAnimationFrame(() => this.animate());
    }
  }

  // ============================================
  // 2. SCROLL-LINKED ANIMATIONS - OPTIMIZED
  // ============================================

  class ScrollLinkedAnimations {
    constructor() {
      this.progressBar = null;
      this.ticking = false;
      this.init();
    }

    init() {
      this.createProgressBar();

      // RAF-throttled scroll
      window.addEventListener('scroll', () => {
        if (!this.ticking) {
          requestAnimationFrame(() => {
            this.onScroll();
            this.ticking = false;
          });
          this.ticking = true;
        }
      }, { passive: true });

      this.onScroll();
    }

    createProgressBar() {
      const progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress';
      progressBar.id = 'scroll-progress-bar';
      document.body.appendChild(progressBar);
      this.progressBar = progressBar;
    }

    onScroll() {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;

      if (this.progressBar) {
        this.progressBar.style.transform = `scaleX(${scrollPercent})`;
      }
    }
  }

  // ============================================
  // 3. MOUSE GLOW EFFECT - OPTIMIZED
  // ============================================

  class MouseGlow {
    constructor() {
      this.glow = null;
      this.mouseX = 0;
      this.mouseY = 0;
      this.currentX = 0;
      this.currentY = 0;
      this.isActive = false;
      this.rafId = null;

      this.init();
    }

    init() {
      this.glow = document.createElement('div');
      this.glow.id = 'mouse-glow';
      this.glow.style.cssText = `
        position: fixed;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(91, 138, 255, 0.1) 0%, transparent 70%);
        pointer-events: none;
        z-index: 0;
        transform: translate(-50%, -50%);
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(this.glow);

      // Throttled mousemove
      document.addEventListener('mousemove', throttle((e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;

        if (!this.isActive) {
          this.isActive = true;
          this.glow.style.opacity = '1';
          this.currentX = this.mouseX;
          this.currentY = this.mouseY;
          this.startAnimation();
        }
      }, 32));

      document.addEventListener('mouseleave', () => {
        this.isActive = false;
        this.glow.style.opacity = '0';
      });
    }

    startAnimation() {
      if (this.rafId) return;
      this.animate();
    }

    animate() {
      if (!this.isActive) {
        this.rafId = null;
        return; // STOP when mouse leaves
      }

      this.currentX = lerp(this.currentX, this.mouseX, 0.1);
      this.currentY = lerp(this.currentY, this.mouseY, 0.1);

      this.glow.style.left = `${this.currentX}px`;
      this.glow.style.top = `${this.currentY}px`;

      this.rafId = requestAnimationFrame(() => this.animate());
    }
  }

  // ============================================
  // 4. TILT EFFECT ON CARDS - OPTIMIZED
  // ============================================

  class TiltEffect {
    constructor() {
      this.init();
    }

    init() {
      // Removed .plan - was causing weird movement on pricing cards
      document.querySelectorAll('.card-tilt').forEach(card => {
        let rect = null;
        let rafId = null;
        let targetRotateX = 0;
        let targetRotateY = 0;

        card.addEventListener('mouseenter', () => {
          rect = card.getBoundingClientRect();
          card.style.willChange = 'transform';
        });

        card.addEventListener('mousemove', throttle((e) => {
          if (!rect) return;

          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          targetRotateX = (y - centerY) / 20;
          targetRotateY = (centerX - x) / 20;

          if (!rafId) {
            rafId = requestAnimationFrame(() => {
              card.style.transform = `perspective(1000px) rotateX(${targetRotateX}deg) rotateY(${targetRotateY}deg) scale(1.02)`;
              rafId = null;
            });
          }
        }, 32));

        card.addEventListener('mouseleave', () => {
          rect = null;
          if (rafId) cancelAnimationFrame(rafId);
          rafId = null;
          card.style.transform = '';
          card.style.willChange = '';
          card.style.transition = 'transform 0.5s ease';
          setTimeout(() => { card.style.transition = ''; }, 500);
        });
      });
    }
  }

  // ============================================
  // 5. MAGNETIC BUTTONS - OPTIMIZED
  // ============================================

  class MagneticButtons {
    constructor() {
      this.init();
    }

    init() {
      document.querySelectorAll('.btn-magnetic, .btn-primary').forEach(btn => {
        let rect = null;

        btn.addEventListener('mouseenter', () => {
          rect = btn.getBoundingClientRect();
        });

        btn.addEventListener('mousemove', throttle((e) => {
          if (!rect) return;

          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;

          btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        }, 32));

        btn.addEventListener('mouseleave', () => {
          rect = null;
          btn.style.transform = '';
          btn.style.transition = 'transform 0.3s ease';
          setTimeout(() => { btn.style.transition = ''; }, 300);
        });
      });
    }
  }

  // ============================================
  // INITIALIZE ALL EFFECTS
  // ============================================

  function initPremiumEffects() {
    const isDesktop = window.innerWidth > 768;

    new ParallaxController();
    // ScrollLinkedAnimations removed - progress bar not needed

    if (isDesktop) {
      new MouseGlow();
      new TiltEffect();
      new MagneticButtons();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPremiumEffects);
  } else {
    initPremiumEffects();
  }

})();
