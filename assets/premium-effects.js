/**
 * PREMIUM EFFECTS
 * Parallax, scroll-linked animations, and advanced interactions
 */

(function() {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Throttle helper
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Lerp helper for smooth animations
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // ============================================
  // 1. PARALLAX SCROLLING
  // ============================================

  class ParallaxController {
    constructor() {
      this.elements = [];
      this.scrollY = 0;
      this.targetScrollY = 0;
      this.rafId = null;

      this.init();
    }

    init() {
      // Find all parallax elements
      document.querySelectorAll('[data-parallax-speed]').forEach(el => {
        this.elements.push({
          el,
          speed: parseFloat(el.dataset.parallaxSpeed) || 0.5,
          offset: el.offsetTop,
          height: el.offsetHeight
        });
      });

      // Also add the hero orbs
      const orb1 = document.getElementById('parallax-orb-1');
      const orb2 = document.getElementById('parallax-orb-2');

      if (orb1) {
        this.elements.push({
          el: orb1,
          speed: 0.3,
          offset: 0,
          height: 500,
          isOrb: true
        });
      }

      if (orb2) {
        this.elements.push({
          el: orb2,
          speed: 0.5,
          offset: 0,
          height: 400,
          isOrb: true
        });
      }

      if (this.elements.length === 0) return;

      window.addEventListener('scroll', () => {
        this.targetScrollY = window.scrollY;
      }, { passive: true });

      this.animate();
    }

    animate() {
      // Smooth scroll interpolation
      this.scrollY = lerp(this.scrollY, this.targetScrollY, 0.1);

      this.elements.forEach(item => {
        const { el, speed, isOrb } = item;

        if (isOrb) {
          // Orbs move opposite to scroll for depth effect
          const yOffset = this.scrollY * speed;
          el.style.transform = `translateY(${-yOffset}px)`;
        } else {
          // Regular parallax elements
          const rect = el.getBoundingClientRect();
          const viewportCenter = window.innerHeight / 2;
          const elementCenter = rect.top + rect.height / 2;
          const distance = elementCenter - viewportCenter;

          const yOffset = distance * speed * 0.1;
          el.style.transform = `translateY(${yOffset}px)`;
        }
      });

      this.rafId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
      cancelAnimationFrame(this.rafId);
    }
  }

  // ============================================
  // 2. SCROLL-LINKED ANIMATIONS
  // ============================================

  class ScrollLinkedAnimations {
    constructor() {
      this.elements = {
        scale: [],
        rotate: [],
        fade: [],
        progress: []
      };

      this.init();
    }

    init() {
      // Collect scale elements
      document.querySelectorAll('[data-scroll-scale]').forEach(el => {
        this.elements.scale.push({
          el,
          start: parseFloat(el.dataset.scrollScaleStart) || 0.8,
          end: parseFloat(el.dataset.scrollScaleEnd) || 1
        });
      });

      // Collect rotate elements
      document.querySelectorAll('[data-scroll-rotate]').forEach(el => {
        this.elements.rotate.push({
          el,
          amount: parseFloat(el.dataset.scrollRotate) || 360
        });
      });

      // Collect fade elements
      document.querySelectorAll('[data-scroll-fade]').forEach(el => {
        this.elements.fade.push({ el });
      });

      // Create scroll progress bar
      this.createProgressBar();

      // Listen to scroll
      window.addEventListener('scroll', throttle(() => this.onScroll(), 16), { passive: true });
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
      const scrollPercent = Math.min(scrollY / docHeight, 1);

      // Update progress bar
      if (this.progressBar) {
        this.progressBar.style.width = `${scrollPercent * 100}%`;
      }

      // Update scale elements
      this.elements.scale.forEach(item => {
        const progress = this.getElementProgress(item.el);
        const scale = lerp(item.start, item.end, progress);
        item.el.style.transform = `scale(${scale})`;
      });

      // Update rotate elements
      this.elements.rotate.forEach(item => {
        const progress = this.getElementProgress(item.el);
        const rotation = progress * item.amount;
        item.el.style.transform = `rotate(${rotation}deg)`;
      });

      // Update fade elements
      this.elements.fade.forEach(item => {
        const progress = this.getElementProgress(item.el);
        item.el.style.opacity = progress;
      });
    }

    getElementProgress(el) {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Element progress: 0 when entering, 1 when at center
      const elementTop = rect.top;
      const elementCenter = elementTop + rect.height / 2;

      // Progress from bottom of screen to center
      const progress = 1 - (elementCenter / windowHeight);
      return Math.max(0, Math.min(1, progress * 1.5));
    }
  }

  // ============================================
  // 3. FLOATING 3D SHAPES
  // ============================================

  class FloatingShapes {
    constructor() {
      this.shapes = [];
      this.init();
    }

    init() {
      // Add shapes between sections
      this.addShapesToSection('trial', [
        { type: 'orb', position: { top: '10%', left: '5%' }, size: 150 },
        { type: 'ring', position: { bottom: '20%', right: '10%' }, size: 200 }
      ]);

      this.addShapesToSection('pricing', [
        { type: 'blob', position: { top: '-10%', right: '-5%' }, size: 300 },
        { type: 'diamond', position: { bottom: '30%', left: '8%' }, size: 80 }
      ]);

      this.addShapesToSection('faq', [
        { type: 'orb', position: { top: '20%', right: '5%' }, size: 120 },
        { type: 'line', position: { top: '50%', left: '3%' }, size: 150 }
      ]);
    }

    addShapesToSection(sectionId, shapeConfigs) {
      const section = document.getElementById(sectionId);
      if (!section) return;

      // Ensure section has relative positioning
      const currentPosition = window.getComputedStyle(section).position;
      if (currentPosition === 'static') {
        section.style.position = 'relative';
      }

      shapeConfigs.forEach(config => {
        const shape = document.createElement('div');
        shape.className = `floating-shape shape-${config.type}`;

        // Apply positioning
        Object.entries(config.position).forEach(([prop, value]) => {
          shape.style[prop] = value;
        });

        // Apply size
        if (config.type !== 'line') {
          shape.style.width = `${config.size}px`;
          shape.style.height = `${config.size}px`;
        } else {
          shape.style.height = `${config.size}px`;
        }

        // Random animation delay for variety
        shape.style.animationDelay = `${Math.random() * 5}s`;

        section.appendChild(shape);
        this.shapes.push(shape);
      });
    }
  }

  // ============================================
  // 4. MOUSE GLOW EFFECT
  // ============================================

  class MouseGlow {
    constructor() {
      this.glow = null;
      this.mouseX = 0;
      this.mouseY = 0;
      this.currentX = 0;
      this.currentY = 0;

      this.init();
    }

    init() {
      // Create glow element
      this.glow = document.createElement('div');
      this.glow.id = 'mouse-glow';
      this.glow.style.cssText = `
        position: fixed;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(91, 138, 255, 0.15) 0%, transparent 70%);
        pointer-events: none;
        z-index: 0;
        transform: translate(-50%, -50%);
        opacity: 0;
        transition: opacity 0.3s ease;
        filter: blur(40px);
      `;
      document.body.appendChild(this.glow);

      // Track mouse
      document.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        this.glow.style.opacity = '1';
      });

      document.addEventListener('mouseleave', () => {
        this.glow.style.opacity = '0';
      });

      this.animate();
    }

    animate() {
      // Smooth follow
      this.currentX = lerp(this.currentX, this.mouseX, 0.1);
      this.currentY = lerp(this.currentY, this.mouseY, 0.1);

      this.glow.style.left = `${this.currentX}px`;
      this.glow.style.top = `${this.currentY}px`;

      requestAnimationFrame(() => this.animate());
    }
  }

  // ============================================
  // 5. TILT EFFECT ON CARDS
  // ============================================

  class TiltEffect {
    constructor() {
      this.init();
    }

    init() {
      document.querySelectorAll('.card-tilt, .plan').forEach(card => {
        card.addEventListener('mousemove', (e) => this.onMouseMove(e, card));
        card.addEventListener('mouseleave', (e) => this.onMouseLeave(e, card));
      });
    }

    onMouseMove(e, card) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      card.style.transition = 'transform 0.1s ease';
    }

    onMouseLeave(e, card) {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.transition = 'transform 0.5s ease';
    }
  }

  // ============================================
  // 6. MAGNETIC BUTTONS
  // ============================================

  class MagneticButtons {
    constructor() {
      this.init();
    }

    init() {
      document.querySelectorAll('.btn-magnetic, .btn-primary').forEach(btn => {
        btn.addEventListener('mousemove', (e) => this.onMouseMove(e, btn));
        btn.addEventListener('mouseleave', (e) => this.onMouseLeave(e, btn));
      });
    }

    onMouseMove(e, btn) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      btn.style.transition = 'transform 0.1s ease';
    }

    onMouseLeave(e, btn) {
      btn.style.transform = 'translate(0, 0)';
      btn.style.transition = 'transform 0.3s ease';
    }
  }

  // ============================================
  // INITIALIZE ALL EFFECTS
  // ============================================

  function initPremiumEffects() {
    // Only init on larger screens for performance
    const isDesktop = window.innerWidth > 768;

    new ParallaxController();
    new ScrollLinkedAnimations();
    // FloatingShapes disabled - was too prominent/ugly
    // new FloatingShapes();

    if (isDesktop) {
      new MouseGlow();
      new TiltEffect();
      new MagneticButtons();
    }
  }

  // Init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPremiumEffects);
  } else {
    initPremiumEffects();
  }

})();
