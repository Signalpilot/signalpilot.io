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

      case 'sun-rays':
        // Sun rays emanating from center-left of screen
        if (!createParticle.rayIndex) createParticle.rayIndex = 0;
        const rayAngle = (createParticle.rayIndex / 40) * Math.PI * 2; // Evenly distributed rays
        createParticle.rayIndex++;

        return {
          x: W * 0.15, // Sun position X (left side)
          y: H * 0.3, // Sun position Y (upper area)
          vx: 0,
          vy: 0,
          angle: rayAngle,
          baseAngle: rayAngle, // Store original angle
          length: Math.random() * 150 + 100, // Ray length 100-250
          opacity: Math.random() * 0.4 + 0.3, // 0.3-0.7 opacity
          rotationSpeed: 0.001, // Slow rotation
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          alpha: 1.0,
          size: Math.random() * 3 + 2 // Width of ray
        };

      case 'matrix-rain':
        // Matrix rain columns - CONSISTENT and EVENLY DISTRIBUTED
        // Start with particles already on screen for smooth immediate effect
        if (!createParticle.matrixIndex) createParticle.matrixIndex = 0;

        const columnSpacing = W / 60; // Divide screen width by column count
        const xPosition = (createParticle.matrixIndex % 60) * columnSpacing + (columnSpacing / 2);

        // Start particles at random Y positions across entire screen height
        // This creates immediate full-screen rain effect without initialization cascade
        const yPosition = Math.random() * H - 200; // Random position, some above screen

        createParticle.matrixIndex++;

        return {
          x: xPosition,
          y: yPosition, // Random Y position for immediate rain effect
          vx: 0,
          vy: 2.0, // Smooth fall speed
          size: 18, // Slightly smaller font for smoother look
          chars: [], // Array of characters in this column
          trailLength: Math.floor(Math.random() * 3) + 14, // 14-16 chars (shorter trails)
          speed: 0.12, // Slower character change for smoothness
          frame: 0,
          alpha: 1.0
        };

      case 'bitcoin-rain':
        // Falling Bitcoin symbols - golden rain
        if (!createParticle.bitcoinIndex) createParticle.bitcoinIndex = 0;

        const btcSpacing = W / 50; // 50 columns of falling bitcoins
        const btcX = (createParticle.bitcoinIndex % 50) * btcSpacing + (btcSpacing / 2);
        const btcDropZone = H * 0.8;
        const btcYOffset = (createParticle.bitcoinIndex % 15) * (btcDropZone / 15);

        createParticle.bitcoinIndex++;

        return {
          x: btcX,
          y: -btcYOffset - 100,
          vx: (Math.random() * 2 - 1) * 0.3, // Slight horizontal drift
          vy: Math.random() * 1.5 + 1.5, // Fall speed 1.5-3
          size: Math.random() * 10 + 20, // Size variation 20-30px
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() * 2 - 1) * 0.05, // Spinning
          alpha: 0.7 + Math.random() * 0.3,
          glow: Math.random() * Math.PI * 2,
          glowSpeed: Math.random() * 0.06 + 0.03
        };

      case 'sakura-petals':
        // Falling cherry blossom petals
        return {
          x: Math.random() * W,
          y: -20 - Math.random() * H * 0.3, // Stagger initial positions
          vx: (Math.random() * 2 - 1) * 0.4, // Gentle drift
          vy: Math.random() * 0.8 + 0.5, // Slow fall 0.5-1.3
          size: Math.random() * 6 + 4, // Size 4-10px
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() * 2 - 1) * 0.08, // Flutter
          sway: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.04 + 0.02,
          swayAmount: Math.random() * 1.5 + 1, // Side-to-side movement
          alpha: 0.6 + Math.random() * 0.4
        };

      case 'lava-embers':
        // Rising embers, flames, and smoke particles
        const emberType = Math.random();
        if (emberType < 0.5) {
          // Hot ember
          return {
            x: Math.random() * W,
            y: H + 20, // Start at bottom
            vx: (Math.random() * 2 - 1) * 0.3,
            vy: -(Math.random() * 1.5 + 1.2), // Rise up 1.2-2.7
            size: Math.random() * 4 + 2, // 2-6px
            type: 'ember',
            glow: Math.random() * Math.PI * 2,
            glowSpeed: Math.random() * 0.15 + 0.1,
            heat: 1.0, // Starts hot
            alpha: 0.9
          };
        } else if (emberType < 0.75) {
          // Smoke particle
          return {
            x: Math.random() * W,
            y: H + 10,
            vx: (Math.random() * 2 - 1) * 0.5,
            vy: -(Math.random() * 0.8 + 0.6), // Slower rise 0.6-1.4
            size: Math.random() * 15 + 10, // 10-25px
            type: 'smoke',
            expansion: 1.0,
            expansionSpeed: 0.02,
            alpha: 0.4
          };
        } else {
          // Flame particle
          return {
            x: Math.random() * W,
            y: H + 15,
            vx: (Math.random() * 2 - 1) * 0.2,
            vy: -(Math.random() * 2 + 1.5), // Fast rise 1.5-3.5
            size: Math.random() * 8 + 6, // 6-14px
            type: 'flame',
            flicker: Math.random() * Math.PI * 2,
            flickerSpeed: Math.random() * 0.2 + 0.15,
            alpha: 0.8
          };
        }

      case 'moon-clouds':
        // Drifting clouds, stars, and a moon for midnight theme

        // First particle is always the moon (only create once)
        if (!createParticle.moonCreated) {
          createParticle.moonCreated = true;
          return {
            x: W * 0.85, // Upper right area (85% across)
            y: H * 0.15, // 15% down from top
            vx: 0,
            vy: 0,
            size: 60, // Large moon
            type: 'moon',
            glow: 0,
            glowSpeed: 0.01,
            alpha: 0.9,
            craters: [ // Random crater positions for detail
              {x: 0.2, y: 0.3, size: 0.15},
              {x: -0.3, y: 0.1, size: 0.2},
              {x: 0.1, y: -0.2, size: 0.12},
              {x: -0.1, y: -0.3, size: 0.18}
            ]
          };
        }

        const cloudType = Math.random();
        if (cloudType < 0.7) {
          // Cloud
          return {
            x: Math.random() * W,
            y: Math.random() * H * 0.6, // Upper 60% of screen
            vx: Math.random() * 0.3 + 0.1, // Drift right 0.1-0.4
            vy: (Math.random() * 2 - 1) * 0.05, // Gentle vertical drift
            size: Math.random() * 40 + 30, // 30-70px
            type: 'cloud',
            puff: Math.random() * Math.PI * 2,
            puffSpeed: Math.random() * 0.02 + 0.01,
            alpha: 0.15 + Math.random() * 0.15 // 0.15-0.3
          };
        } else {
          // Twinkling star
          return {
            x: Math.random() * W,
            y: Math.random() * H,
            vx: 0,
            vy: 0,
            size: Math.random() * 1.5 + 0.5,
            type: 'star',
            twinkle: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 0.04 + 0.02,
            alpha: 0.6 + Math.random() * 0.4
          };
        }

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

      case 'sun-rays':
        // Animated sun rays
        p.pulse += p.pulseSpeed;
        p.angle += p.rotationSpeed;

        const rayLength = p.length * (1 + Math.sin(p.pulse) * 0.15); // Pulsing length
        const rayOpacity = p.opacity * p.alpha;

        // Calculate ray end point
        const endX = p.x + Math.cos(p.angle) * rayLength;
        const endY = p.y + Math.sin(p.angle) * rayLength;

        // Create gradient along the ray
        const rayGrad = ctx.createLinearGradient(p.x, p.y, endX, endY);
        rayGrad.addColorStop(0, config.lineColor.replace(/[\d.]+\)/, `${rayOpacity})`));
        rayGrad.addColorStop(0.5, config.color.replace(/[\d.]+\)/, `${rayOpacity * 0.6})`));
        rayGrad.addColorStop(1, 'transparent');

        ctx.globalAlpha = 1;
        ctx.strokeStyle = rayGrad;
        ctx.lineWidth = p.size;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Add glow at the center
        if (Math.random() < 0.05) { // Occasional extra glow
          const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 30);
          glowGrad.addColorStop(0, config.color.replace(/[\d.]+\)/, '0.4)'));
          glowGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 30, 0, Math.PI * 2);
          ctx.fill();
        }
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

        // Draw trail of characters - smooth, minimal glow
        for (let i = 0; i < p.trailLength; i++) {
          const charY = p.y + (i * p.size);

          if (i === 0) {
            // Head character - subtle white glow
            ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
            ctx.shadowBlur = 3;
            ctx.fillStyle = '#e0ffe0';
            ctx.fillText(p.chars[i], p.x, charY);
            ctx.shadowBlur = 0;
          } else if (i < 3) {
            // Near-head characters - bright green, minimal glow
            const alpha = 0.9 - (i * 0.12);
            ctx.shadowColor = `rgba(0, 255, 65, ${alpha * 0.3})`;
            ctx.shadowBlur = 2;
            ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
            ctx.fillText(p.chars[i], p.x, charY);
            ctx.shadowBlur = 0;
          } else {
            // Trail - smooth fading green, no glow
            const alpha = Math.max(0.25, (1 - i / p.trailLength) * p.alpha * 0.85);
            ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
            ctx.fillText(p.chars[i], p.x, charY);
          }
        }
        break;

      case 'bitcoin-rain':
        // Falling Bitcoin symbol with rotation and glow
        p.rotation += p.rotationSpeed;
        p.glow += p.glowSpeed;
        const btcGlowIntensity = (Math.sin(p.glow) + 1) / 2; // 0 to 1

        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        // Glow effect
        ctx.shadowColor = config.color.replace(/[\d.]+\)/, '0.8)');
        ctx.shadowBlur = 15 * btcGlowIntensity;

        // Draw Bitcoin symbol
        ctx.globalAlpha = p.alpha;
        ctx.font = `bold ${p.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = config.color;
        ctx.fillText('₿', 0, 0);

        ctx.shadowBlur = 0;
        break;

      case 'sakura-petals':
        // Falling cherry blossom petal with sway
        p.rotation += p.rotationSpeed;
        p.sway += p.swaySpeed;
        const swayOffset = Math.sin(p.sway) * p.swayAmount;

        ctx.translate(p.x + swayOffset, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;

        // Draw petal shape (simplified 5-petal design)
        ctx.fillStyle = config.color;

        // Center
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // 5 petals around center
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
          ctx.beginPath();
          ctx.ellipse(
            Math.cos(angle) * p.size * 0.4,
            Math.sin(angle) * p.size * 0.4,
            p.size * 0.5,
            p.size * 0.3,
            angle,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        break;

      case 'lava-embers':
        // Render embers, flames, and smoke
        if (p.type === 'ember') {
          // Hot glowing ember
          p.glow += p.glowSpeed;
          p.heat = Math.max(0, p.heat - 0.003); // Cool down over time

          const emberGlow = (Math.sin(p.glow) + 1) / 2; // 0 to 1
          const heatIntensity = p.heat * emberGlow;

          // Outer glow (orange/red)
          const emberGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
          emberGrad.addColorStop(0, `rgba(255, 100, 20, ${p.alpha * heatIntensity})`);
          emberGrad.addColorStop(0.3, `rgba(255, 80, 0, ${p.alpha * heatIntensity * 0.6})`);
          emberGrad.addColorStop(0.6, `rgba(220, 40, 0, ${p.alpha * heatIntensity * 0.3})`);
          emberGrad.addColorStop(1, 'transparent');

          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = emberGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          ctx.fill();

          // Hot core (white/yellow)
          ctx.fillStyle = `rgba(255, 255, 180, ${heatIntensity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();

        } else if (p.type === 'smoke') {
          // Rising smoke
          p.expansion += p.expansionSpeed;
          const smokeSize = p.size * p.expansion;
          p.alpha = Math.max(0, p.alpha - 0.002); // Fade out

          // Dark smoke gradient
          const smokeGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, smokeSize);
          smokeGrad.addColorStop(0, `rgba(60, 30, 20, ${p.alpha * 0.6})`);
          smokeGrad.addColorStop(0.4, `rgba(40, 20, 15, ${p.alpha * 0.4})`);
          smokeGrad.addColorStop(0.7, `rgba(30, 15, 10, ${p.alpha * 0.2})`);
          smokeGrad.addColorStop(1, 'transparent');

          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = smokeGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, smokeSize, 0, Math.PI * 2);
          ctx.fill();

        } else if (p.type === 'flame') {
          // Animated flame
          p.flicker += p.flickerSpeed;
          const flickerIntensity = (Math.sin(p.flicker) + 1) / 2; // 0 to 1
          const flameSize = p.size * (0.8 + flickerIntensity * 0.4);

          // Flame gradient (yellow to red to transparent)
          const flameGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y - flameSize, flameSize * 2);
          flameGrad.addColorStop(0, `rgba(255, 255, 100, ${p.alpha})`);
          flameGrad.addColorStop(0.2, `rgba(255, 180, 50, ${p.alpha * 0.9})`);
          flameGrad.addColorStop(0.4, `rgba(255, 100, 20, ${p.alpha * 0.7})`);
          flameGrad.addColorStop(0.6, `rgba(220, 50, 20, ${p.alpha * 0.4})`);
          flameGrad.addColorStop(1, 'transparent');

          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = flameGrad;

          // Draw flame shape (elongated upward)
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, flameSize * 0.6, flameSize * 1.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Bright core
          ctx.fillStyle = `rgba(255, 255, 200, ${p.alpha * flickerIntensity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, flameSize * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'moon-clouds':
        // Render moon, clouds, and stars
        if (p.type === 'moon') {
          // Draw beautiful moon with glow and craters
          p.glow += p.glowSpeed;
          const glowIntensity = (Math.sin(p.glow) * 0.15 + 0.85); // Gentle pulsing 0.7-1.0

          // Outer glow halo
          const haloGrad = ctx.createRadialGradient(p.x, p.y, p.size * 0.5, p.x, p.y, p.size * 2.5);
          haloGrad.addColorStop(0, 'rgba(196, 181, 253, 0.3)');
          haloGrad.addColorStop(0.4, 'rgba(196, 181, 253, 0.15)');
          haloGrad.addColorStop(1, 'transparent');

          ctx.globalAlpha = p.alpha * glowIntensity;
          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Main moon body with gradient
          const moonGrad = ctx.createRadialGradient(
            p.x - p.size * 0.3, p.y - p.size * 0.3, 0,
            p.x, p.y, p.size
          );
          moonGrad.addColorStop(0, 'rgba(245, 240, 255, 0.95)');
          moonGrad.addColorStop(0.6, 'rgba(220, 210, 245, 0.9)');
          moonGrad.addColorStop(1, 'rgba(196, 181, 253, 0.8)');

          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = moonGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Draw craters for detail
          ctx.globalAlpha = p.alpha * 0.2;
          ctx.fillStyle = 'rgba(150, 130, 200, 0.3)';
          p.craters.forEach(crater => {
            ctx.beginPath();
            ctx.arc(
              p.x + crater.x * p.size,
              p.y + crater.y * p.size,
              crater.size * p.size,
              0,
              Math.PI * 2
            );
            ctx.fill();
          });

          // Bright highlight spot
          ctx.globalAlpha = p.alpha * 0.6;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.25, p.y - p.size * 0.25, p.size * 0.2, 0, Math.PI * 2);
          ctx.fill();

        } else if (p.type === 'cloud') {
          // Drifting cloud
          p.puff += p.puffSpeed;
          const puffSize = 1 + Math.sin(p.puff) * 0.1; // Slight breathing effect

          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = config.color;

          // Draw cloud as multiple overlapping circles
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.5 * puffSize, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.3, p.y + p.size * 0.2, p.size * 0.4 * puffSize, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x + p.size * 0.3, p.y + p.size * 0.1, p.size * 0.45 * puffSize, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x + p.size * 0.1, p.y - p.size * 0.2, p.size * 0.35 * puffSize, 0, Math.PI * 2);
          ctx.fill();

        } else if (p.type === 'star') {
          // Twinkling star
          p.twinkle += p.twinkleSpeed;
          const starAlpha = p.alpha * (0.6 + Math.sin(p.twinkle) * 0.4);

          ctx.globalAlpha = starAlpha;
          ctx.fillStyle = config.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Star glow
          ctx.globalAlpha = starAlpha * 0.4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
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

    // Special handling for bitcoin-rain - reset to top when falling off bottom
    if (config.type === 'bitcoin-rain') {
      if (p.y > H + 50) {
        p.y = -50;
        p.x = Math.random() * W;
        p.rotation = Math.random() * Math.PI * 2;
      }
      return;
    }

    // Special handling for sakura-petals - reset to top when falling off bottom
    if (config.type === 'sakura-petals') {
      if (p.y > H + 30) {
        p.y = -30;
        p.x = Math.random() * W;
        p.rotation = Math.random() * Math.PI * 2;
        p.sway = Math.random() * Math.PI * 2;
      }
      return;
    }

    // Special handling for moon-clouds
    if (config.type === 'moon-clouds') {
      // Moon stays fixed
      if (p.type === 'moon') {
        p.x = W * 0.85; // Keep moon in upper right
        p.y = H * 0.15;
        return;
      }

      // Clouds wrap around horizontally, reset vertically
      if (p.type === 'cloud') {
        if (p.x > W + p.size) p.x = -p.size;
        if (p.y < -p.size || p.y > H * 0.7) p.y = Math.random() * H * 0.5;
        return;
      }

      // Stars don't move (vx and vy are 0)
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

    // Draw connections between nearby particles (skip for matrix-rain and falling effects)
    const skipConnections = ['matrix-rain', 'bitcoin-rain', 'sakura-petals', 'snowflakes', 'lava-embers'].includes(currentConfig.type);

    if (!skipConnections) {
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
