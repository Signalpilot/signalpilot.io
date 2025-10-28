/**
 * SignalPilot Themed Particle System
 * Supports different particle types: stars, ghosts, snowflakes, bubbles, etc.
 */

(function() {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const CANVAS_ID = 'constellations';
  let canvas = document.getElementById(CANVAS_ID);
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = CANVAS_ID;
    canvas.className = 'sp-constellations';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let W = 0, H = 0, RAF = 0, particles = [];
  let currentConfig = {
    type: 'stars',
    color: 'rgba(180, 200, 255, 0.85)',
    lineColor: 'rgba(180, 200, 255, 0.35)',
    count: 'auto',
    emoji: null
  };

  // Particle creation based on type
  function createParticle(type) {
    const base = {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() * 2 - 1) * 0.15,
      vy: (Math.random() * 2 - 1) * 0.15,
      alpha: 0.6 + Math.random() * 0.4
    };

    switch (type) {
      case 'snowflakes':
        return {
          ...base,
          vy: Math.random() * 0.5 + 0.3, // Fall down
          vx: (Math.random() * 2 - 1) * 0.1, // Gentle drift
          size: Math.random() * 3 + 1,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() * 2 - 1) * 0.02
        };

      case 'bubbles':
        return {
          ...base,
          vy: -(Math.random() * 0.4 + 0.2), // Rise up
          vx: (Math.random() * 2 - 1) * 0.1,
          size: Math.random() * 4 + 2,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.03 + 0.02
        };

      case 'ghosts':
        return {
          ...base,
          vx: (Math.random() * 2 - 1) * 0.2,
          vy: -(Math.random() * 0.3 + 0.1), // Float upward slowly
          size: Math.random() * 2 + 1,
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: Math.random() * 0.05 + 0.02
        };

      case 'fireflies':
        return {
          ...base,
          vx: (Math.random() * 2 - 1) * 0.15,
          vy: (Math.random() * 2 - 1) * 0.15,
          size: Math.random() * 2 + 1.5,
          glow: Math.random() * Math.PI * 2,
          glowSpeed: Math.random() * 0.08 + 0.04,
          brightness: Math.random()
        };

      case 'neon':
      case 'sparkles':
        return {
          ...base,
          size: Math.random() * 2.5 + 1,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.1 + 0.05
        };

      default: // stars
        return {
          ...base,
          size: Math.random() * 2 + 0.8,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.04 + 0.02
        };
    }
  }

  // Draw particle based on type
  function drawParticle(p, config) {
    ctx.save();

    switch (config.type) {
      case 'snowflakes':
        // Draw snowflake
        p.rotation += p.rotationSpeed;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.strokeStyle = config.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = p.alpha;

        // Draw 6-pointed snowflake
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -p.size * 3);
          ctx.stroke();
          ctx.rotate(Math.PI / 3);
        }
        break;

      case 'bubbles':
        // Draw bubble with shine
        p.wobble += p.wobbleSpeed;
        const wobbleX = Math.sin(p.wobble) * 2;

        ctx.globalAlpha = p.alpha * 0.6;
        ctx.fillStyle = config.color;
        ctx.beginPath();
        ctx.arc(p.x + wobbleX, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Shine
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(p.x + wobbleX - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'ghosts':
        // Floating ghost effect
        p.phase += p.phaseSpeed;
        const floatY = Math.sin(p.phase) * 3;

        ctx.globalAlpha = p.alpha * 0.7;
        ctx.fillStyle = config.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y + floatY, p.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.beginPath();
        ctx.moveTo(p.x - p.size, p.y + floatY + p.size);
        ctx.quadraticCurveTo(p.x, p.y + floatY + p.size * 3, p.x + p.size, p.y + floatY + p.size);
        ctx.fill();
        break;

      case 'fireflies':
        // Glowing firefly
        p.glow += p.glowSpeed;
        p.brightness = (Math.sin(p.glow) + 1) / 2; // 0 to 1

        const glowSize = p.size * (1 + p.brightness);
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize * 2);
        gradient.addColorStop(0, config.color);
        gradient.addColorStop(0.4, config.color.replace(/[\d.]+\)/, '0.4)'));
        gradient.addColorStop(1, 'transparent');

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowSize * 2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'neon':
      case 'sparkles':
        // Pulsing sparkle
        p.pulse += p.pulseSpeed;
        const pulseSize = p.size * (1 + Math.sin(p.pulse) * 0.3);

        const neonGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseSize * 3);
        neonGrad.addColorStop(0, config.color);
        neonGrad.addColorStop(0.5, config.color.replace(/[\d.]+\)/, '0.3)'));
        neonGrad.addColorStop(1, 'transparent');

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = neonGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseSize * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
        break;

      default: // stars
        // Twinkling star
        p.twinkle += p.twinkleSpeed;
        const starAlpha = p.alpha * (0.7 + Math.sin(p.twinkle) * 0.3);

        ctx.globalAlpha = starAlpha;
        ctx.fillStyle = config.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        ctx.globalAlpha = starAlpha * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  }

  // Update particle position
  function updateParticle(p, config) {
    p.x += p.vx;
    p.y += p.vy;

    // Wrap around edges
    const margin = 20;
    if (p.x < -margin) p.x = W + margin;
    else if (p.x > W + margin) p.x = -margin;

    if (p.y < -margin) p.y = H + margin;
    else if (p.y > H + margin) p.y = -margin;
  }

  // Resize canvas
  function resize() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    canvas.width = Math.floor(vw * dpr);
    canvas.height = Math.floor(vh * dpr);
    canvas.style.width = vw + 'px';
    canvas.style.height = vh + 'px';

    W = canvas.width;
    H = canvas.height;
    ctx.scale(dpr, dpr);

    // Recalculate particle count
    const area = vw * vh;
    let targetCount;

    if (currentConfig.count === 'auto') {
      targetCount = Math.min(120, Math.max(50, Math.floor(area / 12000)));
    } else {
      targetCount = currentConfig.count;
    }

    // Adjust particles array
    if (particles.length < targetCount) {
      const needed = targetCount - particles.length;
      for (let i = 0; i < needed; i++) {
        particles.push(createParticle(currentConfig.type));
      }
    } else if (particles.length > targetCount) {
      particles = particles.slice(0, targetCount);
    }
  }

  // Animation step
  function step() {
    ctx.clearRect(0, 0, W / dpr, H / dpr);

    // Update and draw particles
    for (const p of particles) {
      updateParticle(p, currentConfig);
      drawParticle(p, currentConfig);
    }

    // Draw connections between nearby particles
    const linkDist = Math.min(W, H) / dpr * 0.12;
    ctx.lineWidth = 1;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < linkDist) {
          const alpha = (1 - dist / linkDist) * 0.35;
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = currentConfig.lineColor;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    RAF = requestAnimationFrame(step);
  }

  // Start/stop animation
  function start() {
    if (!RAF) RAF = requestAnimationFrame(step);
  }

  function stop() {
    if (RAF) {
      cancelAnimationFrame(RAF);
      RAF = 0;
    }
  }

  // Update particle configuration
  function updateConfig(config) {
    currentConfig = { ...currentConfig, ...config };

    // Recreate particles with new type
    particles = [];
    resize();
  }

  // Initialize
  resize();
  start();

  // Event listeners
  window.addEventListener('resize', () => {
    stop();
    resize();
    start();
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  // Expose update function
  window.updateParticles = updateConfig;

  // Listen for theme changes
  window.addEventListener('themechange', (e) => {
    const theme = e.detail.config;
    if (theme && theme.particles) {
      updateConfig(theme.particles);
    }
  });
})();
