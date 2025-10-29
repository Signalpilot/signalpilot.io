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

  const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: false });

  // Safari iOS detection
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // Use lower DPR for Safari iOS to improve performance and compatibility
  let dpr = (isSafari || isIOS) ? 1 : Math.max(1, Math.min(2, window.devicePixelRatio || 1));
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

      case 'matrix-rain':
        // Matrix rain columns - CONSISTENT and EVENLY DISTRIBUTED
        // Use particle count to evenly space columns
        if (!createParticle.matrixIndex) createParticle.matrixIndex = 0;

        const columnSpacing = W / 75; // Divide screen width by column count
        const xPosition = (createParticle.matrixIndex % 75) * columnSpacing + (columnSpacing / 2);

        // Stagger Y positions evenly across the drop zone
        const dropZone = H * 0.8; // Spread initial positions across 80% of screen height
        const yOffset = (createParticle.matrixIndex % 20) * (dropZone / 20);

        createParticle.matrixIndex++;

        return {
          x: xPosition,
          y: -yOffset - 100, // Start just above screen, staggered
          vx: 0,
          vy: 5, // CONSISTENT fall speed (was 3-7, now constant 5)
          size: 20, // Font size
          chars: [], // Array of characters in this column
          trailLength: Math.floor(Math.random() * 4) + 15, // 15-18 chars (tighter range)
          speed: 0.3, // CONSISTENT character change speed (was 0.2-0.5)
          frame: 0,
          alpha: 1.0
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

  // Matrix characters (katakana, numbers, symbols)
  const MATRIX_CHARS = 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789ABCDEFZ:・."=*+-<>¦｜';

  function getRandomMatrixChar() {
    return MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
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

      case 'matrix-rain':
        // Falling Matrix rain column
        ctx.font = `bold ${p.size}px monospace`;  // BOLD for visibility
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Initialize chars array if empty
        if (p.chars.length === 0) {
          for (let i = 0; i < p.trailLength; i++) {
            p.chars.push(getRandomMatrixChar());
          }
        }

        // Randomly change characters
        p.frame += p.speed;
        if (p.frame > 1) {
          p.frame = 0;
          const idx = Math.floor(Math.random() * p.chars.length);
          p.chars[idx] = getRandomMatrixChar();
        }

        // Draw trail of characters
        for (let i = 0; i < p.trailLength; i++) {
          const charY = p.y + (i * p.size);

          if (i === 0) {
            // Head character - BRIGHT WHITE with glow
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(p.chars[i], p.x, charY);
            ctx.shadowBlur = 0;
          } else if (i < 4) {
            // Near-head characters - bright green with glow
            const alpha = 0.95 - (i * 0.15);
            ctx.shadowColor = `rgba(0, 255, 65, ${alpha * 0.6})`;
            ctx.shadowBlur = 6;
            ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
            ctx.fillText(p.chars[i], p.x, charY);
            ctx.shadowBlur = 0;
          } else {
            // Trail - fading green (brighter than before)
            const alpha = Math.max(0.3, (1 - i / p.trailLength) * p.alpha);
            ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
            ctx.fillText(p.chars[i], p.x, charY);
          }
        }
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

    // Special handling for matrix-rain
    if (config.type === 'matrix-rain') {
      // When column falls off bottom, reset to top with new x position
      if (p.y > H + (p.trailLength * p.size)) {
        p.y = -p.size * p.trailLength;
        p.x = Math.random() * W;
        p.chars = []; // Reset characters
      }
      return;
    }

    // Wrap around edges for other particle types
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

    // Update DPR for Safari iOS
    dpr = (isSafari || isIOS) ? 1 : Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    // Set canvas dimensions
    canvas.width = Math.floor(vw * dpr);
    canvas.height = Math.floor(vh * dpr);
    canvas.style.width = vw + 'px';
    canvas.style.height = vh + 'px';

    W = vw;  // Use actual viewport dimensions for calculations
    H = vh;

    // Scale context for high DPR displays (but not on Safari iOS)
    if (dpr !== 1) {
      ctx.scale(dpr, dpr);
    }

    // Recalculate particle count
    const area = vw * vh;
    let targetCount;

    if (currentConfig.count === 'auto') {
      // Reduce particle count on iOS Safari for better performance
      const maxParticles = (isIOS || isSafari) ? 80 : 120;
      const minParticles = (isIOS || isSafari) ? 40 : 50;
      const divisor = (isIOS || isSafari) ? 15000 : 12000;
      targetCount = Math.min(maxParticles, Math.max(minParticles, Math.floor(area / divisor)));
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
    ctx.clearRect(0, 0, W, H);

    // Update and draw particles
    for (const p of particles) {
      updateParticle(p, currentConfig);
      drawParticle(p, currentConfig);
    }

    // Draw connections between nearby particles
    const linkDist = Math.min(W, H) * 0.12;
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
  try {
    resize();
    start();
    // Debug log for Safari
    if (isIOS || isSafari) {
      console.log('SignalPilot Particles: Initialized for Safari/iOS', {
        canvas: canvas.id,
        width: canvas.width,
        height: canvas.height,
        particles: particles.length,
        dpr: dpr
      });
    }
  } catch (err) {
    console.error('SignalPilot Particles: Initialization failed', err);
  }

  // Event listeners
  window.addEventListener('resize', () => {
    stop();
    resize();
    start();
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  // Expose API functions
  window.updateParticles = updateConfig;
  window.stopParticles = stop;
  window.startParticles = start;

  // Listen for theme changes
  window.addEventListener('themechange', (e) => {
    const theme = e.detail.config;
    if (theme && theme.particles) {
      updateConfig(theme.particles);
    }
  });

  // Listen for capability changes
  window.addEventListener('capabilitiesdetected', (e) => {
    const caps = e.detail;
    if (!caps.canHandleParticles) {
      console.log('🚫 Device cannot handle particles, stopping');
      stop();
      if (canvas) {
        canvas.style.display = 'none';
      }
    }
  });
})();
