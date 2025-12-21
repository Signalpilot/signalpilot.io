/**
 * ENERGY BEAM v12 - Huly-style dramatic vertical beam
 * Single beam from sky with atmospheric glow
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

        // Noise function for atmospheric effect
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 4; i++) {
            v += a * noise(p);
            p *= 2.0;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec2 uv = vUv;
          float aspect = resolution.x / resolution.y;

          // Center the beam horizontally
          float beamX = 0.5;
          float distFromBeam = abs(uv.x - beamX) * aspect;

          // === CORE BEAM - very thin, bright ===
          float core = exp(-distFromBeam * 80.0);

          // === INNER GLOW ===
          float innerGlow = exp(-distFromBeam * 20.0);

          // === OUTER GLOW - wide atmospheric ===
          float outerGlow = exp(-distFromBeam * 5.0);

          // === ATMOSPHERIC GLOW - very wide ===
          float atmosphere = exp(-distFromBeam * 1.5);

          // === ENERGY FLOW - pulses moving down ===
          float flow1 = sin(uv.y * 20.0 - time * 4.0) * 0.5 + 0.5;
          float flow2 = sin(uv.y * 35.0 - time * 6.0) * 0.3 + 0.7;
          float flow = flow1 * flow2;

          // === FLICKERING ===
          float flicker = 0.9 + 0.1 * sin(time * 15.0 + uv.y * 10.0);

          // === ATMOSPHERIC NOISE ===
          vec2 noiseCoord = vec2(uv.x * 3.0, uv.y * 2.0 - time * 0.3);
          float atmosphereNoise = fbm(noiseCoord * 4.0);
          float cloudEffect = atmosphereNoise * atmosphere * 0.4;

          // === VERTICAL FADE ===
          // Beam comes from top, fades slightly at bottom
          float vertFade = smoothstep(0.0, 0.2, uv.y) * (0.7 + 0.3 * uv.y);

          // === IMPACT GLOW at bottom ===
          float impactY = 0.15;
          float impactDist = length(vec2(distFromBeam * 0.5, (uv.y - impactY) * 2.0));
          float impact = exp(-impactDist * 8.0) * smoothstep(0.3, 0.0, uv.y);

          // === SPREAD at bottom ===
          float spreadWidth = (1.0 - uv.y) * 0.3;
          float spread = exp(-distFromBeam / max(spreadWidth, 0.01) * 3.0) * smoothstep(0.25, 0.0, uv.y);

          // === COMBINE LAYERS ===
          // Core: bright white-blue
          vec3 coreColor = vec3(0.7, 0.85, 1.0);
          // Inner: blue
          vec3 innerColor = vec3(0.3, 0.5, 1.0);
          // Outer: deeper blue
          vec3 outerColor = vec3(0.1, 0.3, 0.9);
          // Atmosphere: very deep blue
          vec3 atmosColor = vec3(0.05, 0.15, 0.6);

          vec3 color = vec3(0.0);

          // Add atmosphere
          color += atmosColor * atmosphere * 0.3;
          color += atmosColor * cloudEffect;

          // Add glows
          color += outerColor * outerGlow * 0.5 * flow;
          color += innerColor * innerGlow * 0.7 * flow * flicker;
          color += coreColor * core * flow * flicker;

          // Add impact and spread
          color += innerColor * impact * 1.5;
          color += outerColor * spread * 0.8;

          // Apply vertical fade
          color *= vertFade;

          // Calculate alpha
          float alpha = (core * 0.9 + innerGlow * 0.5 + outerGlow * 0.25 + atmosphere * 0.1 + cloudEffect + impact + spread * 0.5) * vertFade;

          // Clamp and output
          alpha = clamp(alpha, 0.0, 1.0);

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
