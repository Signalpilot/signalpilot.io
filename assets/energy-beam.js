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

          // Position beam on the left side (near logo)
          float beamX = 0.12;
          float distFromBeam = abs(uv.x - beamX) * aspect;

          // === BEAM WIDENING AT BOTTOM ===
          // Beam gets wider as it goes down, creating splash effect
          float beamWidth = 0.008 + (1.0 - uv.y) * (1.0 - uv.y) * 0.15;
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

          // === ENERGY FLOW - distinct pulses traveling DOWN ===
          // Create visible energy bands flowing downward
          float pulse1 = smoothstep(0.3, 0.7, sin(uv.y * 6.0 + time * 2.0));
          float pulse2 = smoothstep(0.4, 0.6, sin(uv.y * 10.0 + time * 3.0));
          float energyFlow = 0.5 + 0.5 * max(pulse1, pulse2 * 0.7);

          // === SUBTLE DUST PARTICLES ===
          float dust = particles(uv, time) * innerGlow;

          // === VERTICAL INTENSITY ===
          // Brighter at top, gradual fade
          float vertIntensity = 0.6 + 0.4 * uv.y;

          // === HORIZONTAL SPREAD AT BOTTOM ===
          // Wide horizontal fan-out - energy spreads when it hits bottom
          float spreadY = smoothstep(0.4, 0.0, uv.y); // Starts spreading from 40% up
          float spreadPulse = 0.8 + 0.2 * sin(time * 2.0); // Subtle pulse in spread
          float horizSpread = exp(-distFromBeam * distFromBeam / (0.6 * spreadY + 0.001)) * spreadY * spreadPulse;

          // === GROUND GLOW - wide horizontal swoosh ===
          float groundPulse = 0.7 + 0.3 * sin(time * 1.5 + distFromBeam * 3.0); // Ripple outward
          float groundGlow = exp(-uv.y * 6.0) * exp(-distFromBeam * 0.3) * 0.7 * groundPulse;

          // === COLORS - Smooth blue gradient ===
          vec3 coreColor = vec3(0.85, 0.92, 1.0);     // Bright white-blue core
          vec3 innerColor = vec3(0.4, 0.6, 1.0);      // Soft blue
          vec3 outerColor = vec3(0.2, 0.4, 0.95);     // Medium blue
          vec3 atmosColor = vec3(0.08, 0.2, 0.7);     // Deep blue atmosphere
          vec3 splashColor = vec3(0.5, 0.7, 1.0);     // Bright splash

          // === COMBINE WITH SMOOTH BLENDING (toned down) ===
          vec3 color = vec3(0.0);

          // Layer from back to front - reduced intensities
          color += atmosColor * atmosphere * 0.15;
          color += outerColor * outerGlow * 0.25;
          color += innerColor * innerGlow * 0.4 * energyFlow;
          color += coreColor * core * 0.7 * energyFlow;

          // Add horizontal spread at bottom
          color += innerColor * horizSpread * 0.5;
          color += outerColor * groundGlow * 0.6;

          // Add subtle dust
          color += innerColor * dust * 0.3;

          // Apply vertical intensity
          color *= vertIntensity;

          // === ALPHA (reduced) ===
          float alpha = core * 0.7 + innerGlow * 0.35 + outerGlow * 0.15 + atmosphere * 0.05 + horizSpread * 0.4 + groundGlow * 0.3 + dust * 0.2;
          alpha *= vertIntensity;
          alpha = clamp(alpha, 0.0, 0.85); // Cap max alpha

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
