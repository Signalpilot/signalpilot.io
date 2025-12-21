/**
 * ENERGY BEAM v14 - STRAIGHT VERTICAL ONLY
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

        // Subtle dust particles
        float particles(vec2 uv, float t) {
          float p = 0.0;
          for (float i = 0.0; i < 3.0; i++) {
            vec2 pos = uv * (8.0 + i * 4.0);
            pos.y -= t * (0.1 + i * 0.05);
            float n = noise(pos);
            p += smoothstep(0.7, 0.9, n) * 0.15;
          }
          return p;
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

          // === ENERGY - subtle shimmer, not bands flying through ===
          // Very subtle variation - beam stays SOLID and POWERFUL
          float shimmer = 0.95 + 0.05 * sin(uv.y * 30.0 + time * 2.0);
          float shimmer2 = 0.97 + 0.03 * sin(uv.y * 50.0 + time * 3.0);
          float subtleFlow = shimmer * shimmer2;

          // === SPARKS - floating particles in the glow ===
          float sparks = 0.0;
          for (float i = 0.0; i < 5.0; i++) {
            vec2 sparkPos = uv * (15.0 + i * 8.0);
            sparkPos.y += time * (0.3 + i * 0.15);
            float spark = noise(sparkPos);
            spark = smoothstep(0.75, 0.95, spark);
            // Only show sparks near the beam
            spark *= exp(-distFromBeam * 15.0);
            sparks += spark * 0.12;
          }

          // === SUBTLE DUST PARTICLES ===
          float dust = particles(uv, time) * innerGlow;

          // === VERTICAL INTENSITY ===
          // Brighter at top, gradual fade
          float vertIntensity = 0.6 + 0.4 * uv.y;

          // === HORIZONTAL SPREAD - curves RIGHT only (beam is on left) ===
          float spreadY = smoothstep(0.25, 0.0, uv.y); // Spread zone at bottom

          // Distance to the right of beam
          float distRight = max(0.0, (uv.x - beamX)) * aspect;

          // Curved spread - the lower, the further right it reaches
          float curveReach = spreadY * spreadY * 0.6; // How far the curve extends
          float curvedRight = distRight / (curveReach + 0.01);

          // Smooth curved glow spreading right
          float curveGlow = exp(-curvedRight * curvedRight * 0.8) * spreadY;

          // Subtle continuous flow along spread (not bands)
          float flowRight = 0.9 + 0.1 * sin(distRight * 4.0 - time * 1.5);

          // Combine curved spread with flow
          float horizSpread = curveGlow * flowRight;

          // Edge glow at very bottom
          float edgeGlow = exp(-uv.y * 15.0) * exp(-distRight * 1.0) * 0.5;
          horizSpread += edgeGlow * flowRight * spreadY;

          // === GROUND GLOW ===
          float groundGlow = exp(-uv.y * 10.0) * exp(-distRight * 0.8) * spreadY * 0.4 * flowRight;

          // === COLORS - Smooth blue gradient ===
          vec3 coreColor = vec3(0.85, 0.92, 1.0);     // Bright white-blue core
          vec3 innerColor = vec3(0.4, 0.6, 1.0);      // Soft blue
          vec3 outerColor = vec3(0.2, 0.4, 0.95);     // Medium blue
          vec3 atmosColor = vec3(0.08, 0.2, 0.7);     // Deep blue atmosphere
          vec3 splashColor = vec3(0.5, 0.7, 1.0);     // Bright splash

          // === COMBINE - SOLID POWERFUL CONTINUOUS BEAM ===
          float topSharpness = uv.y;
          float bottomGlow = 1.0 - uv.y;

          vec3 color = vec3(0.0);

          // Atmosphere - constant, powerful, voluminous
          color += atmosColor * atmosphere * (0.2 + bottomGlow * 0.25);

          // Outer glow - constant and strong
          color += outerColor * outerGlow * (0.4 + bottomGlow * 0.3);

          // Inner glow - subtle shimmer only
          color += innerColor * innerGlow * 0.6 * subtleFlow;

          // Core - SOLID, minimal modulation
          color += coreColor * core * (0.9 + 0.1 * subtleFlow);

          // Sparks floating in the glow
          color += coreColor * sparks;

          // Horizontal spread at bottom
          color += innerColor * horizSpread * 0.9;
          color += splashColor * groundGlow;

          // Subtle dust
          color += innerColor * dust * 0.3;

          // Apply vertical intensity
          color *= vertIntensity;

          // === ALPHA ===
          float alpha = core * 0.95 + innerGlow * 0.5 + outerGlow * 0.25 + atmosphere * 0.1 + horizSpread * 0.7 + groundGlow * 0.5 + dust * 0.3 + sparks * 0.8;
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
