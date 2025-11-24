/**
 * Interactive Particle Cursor Trail
 * Creates glowing particles that follow the cursor with physics-based interactions
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    trailInterval: 16, // milliseconds between trail particles (60fps)
    particleLifetime: 2000, // milliseconds
    maxParticles: 150,
    explosionParticles: 25,
    baseSize: 3,
    glowIntensity: 15,
    attractDistance: 100, // pixels
    repelDistance: 50, // pixels
    forceMultiplier: 0.3,
    friction: 0.95,
    colors: [
      { r: 139, g: 92, b: 246 }, // Purple
      { r: 59, g: 130, b: 246 }, // Blue
      { r: 236, g: 72, b: 153 }, // Pink
      { r: 251, g: 146, b: 60 }, // Orange
    ]
  };

  class Particle {
    constructor(x, y, vx = 0, vy = 0, isExplosion = false) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.life = 1.0;
      this.maxLife = isExplosion ? 1500 : CONFIG.particleLifetime;
      this.createdAt = Date.now();
      this.size = CONFIG.baseSize + (isExplosion ? Math.random() * 3 : Math.random() * 2);
      this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
      this.isExplosion = isExplosion;
    }

    update(deltaTime, mouseX, mouseY, cursorTrail) {
      // Update lifetime
      const age = Date.now() - this.createdAt;
      this.life = 1 - (age / this.maxLife);

      if (this.life <= 0) return false;

      // Apply velocity
      this.x += this.vx;
      this.y += this.vy;

      // Apply friction
      this.vx *= CONFIG.friction;
      this.vy *= CONFIG.friction;

      // Attract/repel based on mouse proximity
      if (!this.isExplosion || age > 200) { // Explosion particles ignore mouse for first 200ms
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CONFIG.attractDistance && distance > 0) {
          let force;
          if (distance < CONFIG.repelDistance) {
            // Repel when very close
            force = -CONFIG.forceMultiplier * (1 - distance / CONFIG.repelDistance);
          } else {
            // Attract when within range but not too close
            force = CONFIG.forceMultiplier * (1 - distance / CONFIG.attractDistance) * 0.3;
          }

          const nx = dx / distance;
          const ny = dy / distance;
          this.vx += nx * force;
          this.vy += ny * force;
        }
      }

      return true;
    }

    draw(ctx) {
      if (this.life <= 0) return;

      const alpha = this.life * 0.8;
      const size = this.size * (this.isExplosion ? this.life * 1.5 : 1);

      // Draw glow
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, size * CONFIG.glowIntensity);
      gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha * 0.8})`);
      gradient.addColorStop(0.3, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha * 0.4})`);
      gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, size * CONFIG.glowIntensity, 0, Math.PI * 2);
      ctx.fill();

      // Draw core
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  class CursorTrail {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.particles = [];
      this.mouseX = -1000;
      this.mouseY = -1000;
      this.lastTrailTime = 0;
      this.animationId = null;
      this.isActive = false;
      this.devicePerformance = 'high';

      this.init();
    }

    init() {
      // Check device performance
      const perfAttr = document.documentElement.getAttribute('data-performance');
      this.devicePerformance = perfAttr || 'high';

      // Skip on low-end devices or if reduced motion is preferred
      if (this.devicePerformance === 'low' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        console.log('Cursor trail disabled for performance/accessibility');
        return;
      }

      // Create canvas
      this.createCanvas();

      // Setup event listeners
      this.setupEventListeners();

      // Start animation loop
      this.start();
    }

    createCanvas() {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'cursor-trail-canvas';
      this.canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
      `;

      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d', { alpha: true });

      this.resizeCanvas();
    }

    resizeCanvas() {
      if (!this.canvas) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = window.innerWidth * dpr;
      this.canvas.height = window.innerHeight * dpr;
      this.canvas.style.width = window.innerWidth + 'px';
      this.canvas.style.height = window.innerHeight + 'px';
      this.ctx.scale(dpr, dpr);
    }

    setupEventListeners() {
      // Mouse move - track position and create trail
      document.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;

        const now = Date.now();
        if (now - this.lastTrailTime > CONFIG.trailInterval) {
          this.createTrailParticle(e.clientX, e.clientY);
          this.lastTrailTime = now;
        }
      });

      // Click - create explosion
      document.addEventListener('click', (e) => {
        this.createExplosion(e.clientX, e.clientY);
      });

      // Window resize
      window.addEventListener('resize', () => {
        this.resizeCanvas();
      });

      // Pause when page is hidden (performance)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stop();
        } else {
          this.start();
        }
      });
    }

    createTrailParticle(x, y) {
      if (this.particles.length >= CONFIG.maxParticles) {
        this.particles.shift(); // Remove oldest particle
      }

      // Add slight random velocity for organic movement
      const vx = (Math.random() - 0.5) * 0.5;
      const vy = (Math.random() - 0.5) * 0.5;

      this.particles.push(new Particle(x, y, vx, vy, false));
    }

    createExplosion(x, y) {
      const count = this.devicePerformance === 'medium' ?
        CONFIG.explosionParticles * 0.6 :
        CONFIG.explosionParticles;

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed = 3 + Math.random() * 4;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        this.particles.push(new Particle(x, y, vx, vy, true));
      }

      // Add some random particles for chaotic effect
      for (let i = 0; i < count * 0.3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 6;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        this.particles.push(new Particle(x, y, vx, vy, true));
      }
    }

    update(deltaTime) {
      // Update all particles
      this.particles = this.particles.filter(particle =>
        particle.update(deltaTime, this.mouseX, this.mouseY, this)
      );
    }

    draw() {
      if (!this.ctx) return;

      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw all particles
      this.particles.forEach(particle => particle.draw(this.ctx));
    }

    animate() {
      if (!this.isActive) return;

      this.update(16); // Approximate 60fps
      this.draw();

      this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
      if (this.isActive) return;
      this.isActive = true;
      this.animate();
    }

    stop() {
      this.isActive = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }

    destroy() {
      this.stop();
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
      this.particles = [];
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.cursorTrail = new CursorTrail();
    });
  } else {
    window.cursorTrail = new CursorTrail();
  }

  // Export for potential external control
  window.CursorTrail = CursorTrail;

})();
