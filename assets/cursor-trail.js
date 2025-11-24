/**
 * Interactive Particle Cursor Trail
 * Creates glowing particles that follow the cursor with physics-based interactions
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    trailInterval: 25, // milliseconds between droplets
    particleLifetime: 1200, // milliseconds - droplets last longer
    maxParticles: 60, // more droplets for fluid effect
    baseSize: 5, // smaller, defined droplets
    glowIntensity: 1.2, // minimal glow - just for depth
    attractDistance: 80, // pixels
    repelDistance: 30, // pixels
    forceMultiplier: 0.08, // subtle interaction
    friction: 0.985, // less friction - water flows smoothly
    gravity: 0.15, // water droplets fall
    mergeDistance: 15, // droplets merge when close
    colors: [
      { r: 255, g: 255, b: 255 }, // Clear/transparent
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

      // Apply gravity - water droplets fall
      this.vy += CONFIG.gravity;

      // Apply velocity
      this.x += this.vx;
      this.y += this.vy;

      // Apply friction
      this.vx *= CONFIG.friction;
      this.vy *= CONFIG.friction;

      // Attract/repel based on mouse proximity (cursor disturbs water)
      if (!this.isExplosion || age > 200) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CONFIG.attractDistance && distance > 0) {
          let force;
          if (distance < CONFIG.repelDistance) {
            // Repel when very close - cursor pushes water away
            force = -CONFIG.forceMultiplier * (1 - distance / CONFIG.repelDistance);
          } else {
            // Slight attraction creates wake effect
            force = CONFIG.forceMultiplier * (1 - distance / CONFIG.attractDistance) * 0.2;
          }

          const nx = dx / distance;
          const ny = dy / distance;
          this.vx += nx * force;
          this.vy += ny * force;
        }
      }

      // Check for merging with nearby droplets (surface tension)
      cursorTrail.particles.forEach(other => {
        if (other === this) return;

        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CONFIG.mergeDistance && distance > 0) {
          // Droplets attract each other slightly (cohesion)
          const force = 0.02;
          const nx = dx / distance;
          const ny = dy / distance;
          this.vx += nx * force;
          this.vy += ny * force;
        }
      });

      return true;
    }

    draw(ctx) {
      if (this.life <= 0) return;

      // Transparent water droplet - subtle but visible
      const alpha = Math.min(this.life * 0.4, 0.35); // Transparent
      const size = this.size * (0.8 + this.life * 0.2); // Slight shrink as it evaporates

      // Main droplet body - very transparent with slight white
      const dropletGradient = ctx.createRadialGradient(
        this.x - size * 0.3, this.y - size * 0.3, 0,
        this.x, this.y, size
      );

      // Clear water effect with bright highlight
      dropletGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 1.2})`); // Bright highlight
      dropletGradient.addColorStop(0.3, `rgba(255, 255, 255, ${alpha * 0.6})`); // Transparent body
      dropletGradient.addColorStop(0.7, `rgba(255, 255, 255, ${alpha * 0.3})`); // Edge
      dropletGradient.addColorStop(1, `rgba(255, 255, 255, 0)`); // Fade out

      // Draw main droplet
      ctx.fillStyle = dropletGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
      ctx.fill();

      // Add subtle edge for glass-like refraction
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, size * 0.8, 0, Math.PI * 2);
      ctx.stroke();
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

      // Click explosion removed - too much visual noise

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
