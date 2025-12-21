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

          // === SERPENTINE PATTERN down the entire site ===
          float leftX = 0.08;
          float rightX = 0.92;
          float beamThickness = 0.012;

          // Horizontal turn points (from top to bottom)
          float h1 = 0.75;  // First turn (left to right)
          float h2 = 0.50;  // Second turn (right to left)
          float h3 = 0.25;  // Third turn (left to right)

          // Calculate distance to each segment
          float distToPath = 100.0;
          float pathPos = 0.0;

          // Segment 1: Top-left vertical (1.0 down to h1)
          float dSeg1 = (uv.y >= h1 && uv.y <= 1.0) ? abs(uv.x - leftX) * aspect : 100.0;

          // Segment 2: First horizontal (left to right at h1)
          float dSeg2 = (uv.x >= leftX && uv.x <= rightX && abs(uv.y - h1) < 0.08) ? abs(uv.y - h1) : 100.0;

          // Segment 3: Right vertical (h1 down to h2)
          float dSeg3 = (uv.y >= h2 && uv.y <= h1) ? abs(uv.x - rightX) * aspect : 100.0;

          // Segment 4: Second horizontal (right to left at h2)
          float dSeg4 = (uv.x >= leftX && uv.x <= rightX && abs(uv.y - h2) < 0.08) ? abs(uv.y - h2) : 100.0;

          // Segment 5: Left vertical (h2 down to h3)
          float dSeg5 = (uv.y >= h3 && uv.y <= h2) ? abs(uv.x - leftX) * aspect : 100.0;

          // Segment 6: Third horizontal (left to right at h3)
          float dSeg6 = (uv.x >= leftX && uv.x <= rightX && abs(uv.y - h3) < 0.08) ? abs(uv.y - h3) : 100.0;

          // Segment 7: Right vertical (h3 down to 0)
          float dSeg7 = (uv.y >= 0.0 && uv.y <= h3) ? abs(uv.x - rightX) * aspect : 100.0;

          // Find minimum distance
          distToPath = min(dSeg1, min(dSeg2, min(dSeg3, min(dSeg4, min(dSeg5, min(dSeg6, dSeg7))))));

          // === PATH POSITION for flowing energy ===
          float horizLen = (rightX - leftX) * aspect;
          float seg1Len = 1.0 - h1;
          float seg2Len = horizLen;
          float seg3Len = h1 - h2;
          float seg4Len = horizLen;
          float seg5Len = h2 - h3;
          float seg6Len = horizLen;
          float seg7Len = h3;
          float totalLen = seg1Len + seg2Len + seg3Len + seg4Len + seg5Len + seg6Len + seg7Len;

          // Calculate path position based on which segment
          if (dSeg1 <= distToPath + 0.001) {
            pathPos = (1.0 - uv.y) / totalLen;
          } else if (dSeg2 <= distToPath + 0.001) {
            pathPos = (seg1Len + (uv.x - leftX) * aspect) / totalLen;
          } else if (dSeg3 <= distToPath + 0.001) {
            pathPos = (seg1Len + seg2Len + (h1 - uv.y)) / totalLen;
          } else if (dSeg4 <= distToPath + 0.001) {
            pathPos = (seg1Len + seg2Len + seg3Len + (rightX - uv.x) * aspect) / totalLen;
          } else if (dSeg5 <= distToPath + 0.001) {
            pathPos = (seg1Len + seg2Len + seg3Len + seg4Len + (h2 - uv.y)) / totalLen;
          } else if (dSeg6 <= distToPath + 0.001) {
            pathPos = (seg1Len + seg2Len + seg3Len + seg4Len + seg5Len + (uv.x - leftX) * aspect) / totalLen;
          } else {
            pathPos = (seg1Len + seg2Len + seg3Len + seg4Len + seg5Len + seg6Len + (h3 - uv.y)) / totalLen;
          }

          // === BEAM CORE AND GLOW ===
          float normalizedDist = distToPath / beamThickness;
          float core = exp(-normalizedDist * normalizedDist * 6.0);

          float innerGlow = exp(-distToPath * distToPath / (beamThickness * beamThickness * 9.0));
          float outerGlow = exp(-distToPath * distToPath / (beamThickness * beamThickness * 50.0));
          float atmosphere = exp(-distToPath * distToPath / (beamThickness * beamThickness * 200.0));

          // === FLOWING ENERGY along the path ===
          float flowSpeed = 1.5;
          float energyPos = fract(pathPos * 3.0 - time * flowSpeed); // 3 energy pulses
          float energy1 = exp(-pow((energyPos - 0.5) * 4.0, 2.0));
          float energyPos2 = fract(pathPos * 3.0 - time * flowSpeed + 0.33);
          float energy2 = exp(-pow((energyPos2 - 0.5) * 4.0, 2.0));
          float energyPos3 = fract(pathPos * 3.0 - time * flowSpeed + 0.66);
          float energy3 = exp(-pow((energyPos3 - 0.5) * 4.0, 2.0));
          float flowingEnergy = max(energy1, max(energy2, energy3));

          // Subtle shimmer
          float shimmer = 0.92 + 0.08 * flowingEnergy;

          // === SPARKS ===
          float sparks = 0.0;
          for (float i = 0.0; i < 4.0; i++) {
            vec2 sparkPos = uv * (12.0 + i * 6.0);
            sparkPos.y += time * (0.2 + i * 0.1);
            float spark = noise(sparkPos);
            spark = smoothstep(0.78, 0.95, spark);
            spark *= exp(-distToPath * 20.0);
            sparks += spark * 0.1;
          }

          // === COLORS ===
          vec3 coreColor = vec3(0.9, 0.95, 1.0);
          vec3 innerColor = vec3(0.4, 0.6, 1.0);
          vec3 outerColor = vec3(0.2, 0.4, 0.95);
          vec3 atmosColor = vec3(0.1, 0.25, 0.7);

          // === COMBINE ===
          vec3 color = vec3(0.0);
          color += atmosColor * atmosphere * 0.3;
          color += outerColor * outerGlow * 0.5;
          color += innerColor * innerGlow * 0.6 * shimmer;
          color += coreColor * core * shimmer;
          color += coreColor * sparks;

          // Boost where energy is flowing
          color += innerColor * core * flowingEnergy * 0.4;

          float alpha = core * 0.9 + innerGlow * 0.5 + outerGlow * 0.3 + atmosphere * 0.15 + sparks * 0.7;
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
