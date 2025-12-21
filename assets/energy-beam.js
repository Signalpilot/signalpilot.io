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

          // === OVERFLOW SHAPE: down left, across bottom, DOWN on right (overflow) ===
          float leftX = 0.09;      // Left beam position
          float rightX = 0.92;     // Right beam position
          float horizY = 0.35;     // Horizontal beam Y position (where left turns right)
          float beamThickness = 0.012;

          // Distance to left vertical beam (from top down to horizY)
          float distLeft = abs(uv.x - leftX) * aspect;

          // Distance to horizontal beam (from leftX to rightX at horizY)
          float distHoriz = abs(uv.y - horizY);

          // Distance to right vertical beam (from horizY going DOWN to bottom)
          float distRight = abs(uv.x - rightX) * aspect;

          // Calculate which segment each pixel is closest to
          float dLeft = (uv.y >= horizY) ? distLeft : 100.0;  // Left beam: from top to horizY
          float dHoriz = (uv.x >= leftX && uv.x <= rightX) ? distHoriz : 100.0;  // Horizontal beam
          float dRight = (uv.y <= horizY) ? distRight : 100.0; // Right beam: from horizY DOWN to bottom

          float distToPath = min(dLeft, min(dHoriz, dRight));

          // === PATH PARAMETER (0 to 1 along entire path) ===
          // Path: top-left -> bottom-left corner -> right along horizontal -> down right side
          float leftLen = 1.0 - horizY;  // Length of left segment
          float horizLen = (rightX - leftX) * aspect;  // Length of horizontal
          float rightLen = horizY;  // Length of right segment (goes down to 0)
          float pathLength = leftLen + horizLen + rightLen;
          float pathPos = 0.0;

          // Determine which segment and calculate path position
          if (dLeft <= dHoriz && dLeft <= dRight) {
            // On left beam - flows DOWN from top
            pathPos = (1.0 - uv.y) / pathLength;
          } else if (dHoriz <= dLeft && dHoriz <= dRight) {
            // On horizontal beam - flows RIGHT
            float leftPathLen = leftLen / pathLength;
            pathPos = leftPathLen + ((uv.x - leftX) * aspect) / pathLength;
          } else {
            // On right beam - flows DOWN (overflow)
            float leftPathLen = leftLen / pathLength;
            float horizPathLen = horizLen / pathLength;
            pathPos = leftPathLen + horizPathLen + (horizY - uv.y) / pathLength;
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
