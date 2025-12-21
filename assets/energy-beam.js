/**
 * ENERGY BEAM v13 - Ultra-smooth Huly-style beam
 * Smooth gradients, subtle animation, dramatic bottom splash
 */

(function() {
  'use strict';

  function init() {
    if (typeof THREE === 'undefined') {
      setTimeout(init, 100);
      return;
    }

    const container = document.getElementById('energy-beam-container');
    if (!container) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const scene = new THREE.Scene();
    const width = container.offsetWidth || window.innerWidth;
    const height = container.offsetHeight || window.innerHeight;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Full-screen quad with shader
    const geometry = new THREE.PlaneGeometry(2, 2);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(width, height) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        varying vec2 vUv;

        // Smooth noise for subtle dust particles
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0); // Smoother interpolation
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        // Ultra-fine dust - subtle specks, no chunky squares
        float fineDust(vec2 uv, float t, float beamDist) {
          float dust = 0.0;

          // Only very fine point-like specks
          for (float i = 0.0; i < 6.0; i++) {
            float scale = 200.0 + i * 100.0; // Very high frequency = tiny
            vec2 p = uv * scale;
            p.y += t * (0.05 + i * 0.02);
            p.x += sin(t * 0.3 + i) * 0.5;

            // Point hash - no interpolation = sharp tiny dots
            float h = hash(floor(p) + i * 73.0);

            // Very sparse - only brightest points show
            float speck = pow(h, 40.0 + i * 10.0);

            // Fade near beam
            float fade = exp(-beamDist * (10.0 + i * 3.0));

            // Gentle twinkle
            float twinkle = 0.5 + 0.5 * sin(t * 3.0 + h * 20.0);

            dust += speck * fade * twinkle * 0.08;
          }

          return dust;
        }

        void main() {
          vec2 uv = vUv;
          float aspect = resolution.x / resolution.y;

          // Position beam on the left side (before logo)
          float beamX = 0.09;
          float distFromBeam = abs(uv.x - beamX) * aspect;

          // === BEAM - gradually widens from top to bottom ===
          // Thin at top, progressively wider, then spreads at bottom
          float gradualWiden = (1.0 - uv.y) * 0.015; // Gradual widening
          float bottomSpread = smoothstep(0.2, 0.0, uv.y); // Extra spread at bottom
          float beamWidth = 0.008 + gradualWiden + bottomSpread * bottomSpread * 0.15;
          float normalizedDist = distFromBeam / beamWidth;

          // === ULTRA-SMOOTH CORE ===
          float core = exp(-normalizedDist * normalizedDist * 8.0);

          // === SMOOTH INNER GLOW ===
          float innerWidth = beamWidth * 3.0;
          float innerDist = distFromBeam / innerWidth;
          float innerGlow = exp(-innerDist * innerDist * 2.0);

          // === WIDE OUTER GLOW ===
          float outerWidth = beamWidth * 8.0;
          float outerDist = distFromBeam / outerWidth;
          float outerGlow = exp(-outerDist * outerDist * 0.8);

          // === ATMOSPHERIC SPREAD ===
          float atmosWidth = beamWidth * 20.0;
          float atmosDist = distFromBeam / atmosWidth;
          float atmosphere = exp(-atmosDist * atmosDist * 0.3);

          // === ENERGY FLOW - POWERFUL pulses traveling DOWN the beam ===
          // Bright energy pulses moving downward
          float pulse1 = pow(0.5 + 0.5 * sin(uv.y * 8.0 - time * 4.0), 3.0);
          float pulse2 = pow(0.5 + 0.5 * sin(uv.y * 12.0 - time * 5.0), 2.0);
          float pulse3 = pow(0.5 + 0.5 * sin(uv.y * 6.0 - time * 3.0), 4.0);

          // Combine pulses - ranges from ~0.3 to ~1.5 for dramatic variation
          float subtleFlow = 0.5 + pulse1 * 0.4 + pulse2 * 0.3 + pulse3 * 0.3;

          // === ULTRA-FINE DUST - subtle tiny specks only ===
          float dust = fineDust(uv, time, distFromBeam);

          // === CONTINUOUS ENERGY SOURCE at top - smooth flowing stream ===
          float topZone = smoothstep(0.6, 1.0, uv.y); // Top 40%

          // Continuous flowing energy - overlapping waves traveling down
          float topFlow1 = sin(uv.y * 25.0 - time * 6.0) * 0.5 + 0.5;
          float topFlow2 = sin(uv.y * 40.0 - time * 8.0) * 0.5 + 0.5;
          float topFlow3 = sin(uv.y * 18.0 - time * 5.0) * 0.5 + 0.5;

          // Smooth continuous pulsing - not fragmented
          float continuousFlow = (topFlow1 + topFlow2 + topFlow3) / 3.0;
          continuousFlow = 0.7 + continuousFlow * 0.3; // Keep it mostly bright with subtle variation

          // Only near the beam center
          float topBeamFade = exp(-distFromBeam * 20.0);

          float fallingParticles = continuousFlow * topBeamFade * topZone * 0.5;

          // === VERTICAL INTENSITY ===
          // Brighter at top, gradual fade
          float vertIntensity = 0.6 + 0.4 * uv.y;

          // === HORIZONTAL SPREAD - curves RIGHT with flowing energy ===
          float spreadY = smoothstep(0.25, 0.0, uv.y); // Spread zone at bottom

          // Distance to the right of beam
          float distRight = max(0.0, (uv.x - beamX)) * aspect;

          // Curved spread - the lower, the further right it reaches
          float curveReach = spreadY * spreadY * 0.6;
          float curvedRight = distRight / (curveReach + 0.01);

          // Base curved glow
          float curveGlow = exp(-curvedRight * curvedRight * 0.8) * spreadY;

          // === CONSTANT ENERGY OVERFLOW - smooth continuous spread ===
          // Subtle flowing movement, not pulsating
          float hFlow1 = sin(distRight * 4.0 - time * 2.5) * 0.5 + 0.5;
          float hFlow2 = sin(distRight * 7.0 - time * 3.0) * 0.5 + 0.5;
          float horizFlow = 0.85 + (hFlow1 + hFlow2) * 0.075; // Mostly constant with subtle variation

          // Combine curve glow with smooth energy
          float horizSpread = curveGlow * horizFlow;

          // Edge glow at very bottom - constant
          float edgeGlow = exp(-uv.y * 15.0) * exp(-distRight * 1.0) * 0.5;
          horizSpread += edgeGlow * spreadY;

          // === GROUND GLOW - constant overflow ===
          float groundGlow = exp(-uv.y * 10.0) * exp(-distRight * 0.8) * spreadY * 0.5;

          // === COLORS - DEEP DARK blue with purple/violet ===
          vec3 coreColor = vec3(0.3, 0.4, 0.9);        // Deep blue core
          vec3 innerColor = vec3(0.2, 0.25, 0.75);     // Dark blue-violet
          vec3 outerColor = vec3(0.18, 0.15, 0.6);     // Dark violet-blue
          vec3 purpleGlow = vec3(0.4, 0.12, 0.65);     // Rich violet
          vec3 atmosColor = vec3(0.12, 0.05, 0.35);    // Deep dark violet atmosphere
          vec3 splashColor = vec3(0.35, 0.2, 0.7);     // Violet-purple splash

          // === COMBINE - SOLID POWERFUL CONTINUOUS BEAM ===
          float topSharpness = uv.y;
          float bottomGlow = 1.0 - uv.y;

          // Purple shift increases with distance from beam and toward bottom
          float purpleShift = smoothstep(0.0, 0.15, distFromBeam) * (0.5 + bottomGlow * 0.5);

          vec3 color = vec3(0.0);

          // Atmosphere - purple-shifted at edges
          vec3 atmosMix = mix(vec3(0.08, 0.12, 0.45), atmosColor, purpleShift);
          color += atmosMix * atmosphere * (0.25 + bottomGlow * 0.3);

          // Outer glow - blue to purple gradient
          vec3 outerMix = mix(outerColor, purpleGlow, purpleShift * 0.6);
          color += outerMix * outerGlow * (0.45 + bottomGlow * 0.35);

          // Inner glow - subtle shimmer only
          color += innerColor * innerGlow * 0.6 * subtleFlow;

          // Core - SOLID white-blue, minimal modulation
          color += coreColor * core * (0.9 + 0.1 * subtleFlow);

          // Fine dust particles floating in the glow
          color += coreColor * dust;

          // Horizontal spread at bottom - purple tinted
          vec3 spreadColor = mix(innerColor, splashColor, 0.4);
          color += spreadColor * horizSpread * 0.9;
          color += splashColor * groundGlow;

          // Falling energy particles at top - infinite source effect
          color += coreColor * fallingParticles;

          // Apply vertical intensity
          color *= vertIntensity;

          // === ALPHA ===
          float alpha = core * 0.95 + innerGlow * 0.5 + outerGlow * 0.25 + atmosphere * 0.1 + horizSpread * 0.7 + groundGlow * 0.5 + dust * 0.6 + fallingParticles * 0.8;
          alpha *= vertIntensity;
          alpha = clamp(alpha, 0.0, 1.0);

          // Smooth alpha falloff at edges
          alpha *= smoothstep(0.0, 0.05, uv.y);

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    function animate() {
      requestAnimationFrame(animate);
      material.uniforms.time.value += 0.016;
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      const w = container.offsetWidth || window.innerWidth;
      const h = container.offsetHeight || window.innerHeight;
      renderer.setSize(w, h);
      material.uniforms.resolution.value.set(w, h);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
