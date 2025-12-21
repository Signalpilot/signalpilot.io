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

          // Center the beam
          float beamX = 0.5;
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

          // === ENERGY FLOW - visible downward motion ===
          float flow1 = sin(uv.y * 15.0 - time * 3.0) * 0.5 + 0.5;
          float flow2 = sin(uv.y * 25.0 - time * 4.5) * 0.3 + 0.7;
          float energyFlow = mix(0.7, 1.0, flow1 * flow2);

          // === SUBTLE DUST PARTICLES ===
          float dust = particles(uv, time) * innerGlow;

          // === VERTICAL INTENSITY ===
          // Brighter at top, gradual fade
          float vertIntensity = 0.6 + 0.4 * uv.y;

          // === HORIZONTAL SPREAD AT BOTTOM ===
          // Wide horizontal fan-out like Huly
          float spreadY = smoothstep(0.35, 0.0, uv.y); // Starts spreading from 35% up
          float horizSpread = exp(-distFromBeam * distFromBeam / (0.5 * spreadY + 0.001)) * spreadY;

          // === GROUND GLOW - wide horizontal ===
          float groundGlow = exp(-uv.y * 8.0) * exp(-distFromBeam * 0.5) * 0.6;

          // === COLORS - Smooth blue gradient ===
          vec3 coreColor = vec3(0.85, 0.92, 1.0);     // Bright white-blue core
          vec3 innerColor = vec3(0.4, 0.6, 1.0);      // Soft blue
          vec3 outerColor = vec3(0.2, 0.4, 0.95);     // Medium blue
          vec3 atmosColor = vec3(0.08, 0.2, 0.7);     // Deep blue atmosphere
          vec3 splashColor = vec3(0.5, 0.7, 1.0);     // Bright splash

          // === COMBINE WITH SMOOTH BLENDING ===
          vec3 color = vec3(0.0);

          // Layer from back to front
          color += atmosColor * atmosphere * 0.25;
          color += outerColor * outerGlow * 0.4;
          color += innerColor * innerGlow * 0.6 * energyFlow;
          color += coreColor * core * energyFlow;

          // Add horizontal spread at bottom
          color += innerColor * horizSpread * 0.8;
          color += outerColor * groundGlow;

          // Add subtle dust
          color += innerColor * dust * 0.5;

          // Apply vertical intensity
          color *= vertIntensity;

          // === ALPHA ===
          float alpha = core * 0.95 + innerGlow * 0.5 + outerGlow * 0.2 + atmosphere * 0.08 + horizSpread * 0.7 + groundGlow * 0.5 + dust * 0.3;
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
