/**
 * ENERGY BEAM v7 - Side positioned with WORKING horizontal dissipation
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

    // === SCENE SETUP ===
    const scene = new THREE.Scene();
    const width = container.offsetWidth || window.innerWidth;
    const height = container.offsetHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Main group - LEFT SIDE
    const beamGroup = new THREE.Group();
    beamGroup.position.set(-3.2, 3.5, 0);
    scene.add(beamGroup);

    const beamHeight = 5;

    // === 1. CORE BEAM ===
    const coreGeo = new THREE.PlaneGeometry(0.025, beamHeight);
    const coreMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        void main() {
          // Fade at very bottom where it dissipates
          float bottomFade = smoothstep(0.0, 0.08, vUv.y);
          float topFade = smoothstep(1.0, 0.95, vUv.y);

          float pulse = sin(vUv.y * 20.0 - time * 5.0) * 0.12 + 0.88;

          float intensity = bottomFade * topFade * pulse;
          gl_FragColor = vec4(1.0, 1.0, 1.0, intensity * 0.9);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = -beamHeight / 2;
    beamGroup.add(core);

    // === 2. INNER GLOW ===
    const innerGeo = new THREE.PlaneGeometry(0.18, beamHeight);
    const innerMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        void main() {
          float dist = abs(vUv.x - 0.5) * 2.0;
          float glow = exp(-dist * 4.5);
          float bottomFade = smoothstep(0.0, 0.1, vUv.y);
          float topFade = smoothstep(1.0, 0.92, vUv.y);

          float breath = 0.85 + 0.15 * sin(time * 1.3);

          vec3 color = vec3(0.45, 0.65, 1.0);
          gl_FragColor = vec4(color, glow * 0.5 * bottomFade * topFade * breath);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    inner.position.y = -beamHeight / 2;
    inner.position.z = -0.001;
    beamGroup.add(inner);

    // === 3. OUTER GLOW ===
    const outerGeo = new THREE.PlaneGeometry(0.6, beamHeight);
    const outerMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        void main() {
          float dist = abs(vUv.x - 0.5) * 2.0;
          float glow = exp(-dist * 2.5);
          float bottomFade = smoothstep(0.0, 0.15, vUv.y);
          float topFade = smoothstep(1.0, 0.88, vUv.y);

          vec3 color = vec3(0.3, 0.5, 1.0);
          gl_FragColor = vec4(color, glow * 0.18 * bottomFade * topFade);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const outer = new THREE.Mesh(outerGeo, outerMat);
    outer.position.y = -beamHeight / 2;
    outer.position.z = -0.002;
    beamGroup.add(outer);

    // === 4. IMPACT POINT - Bright glow where beam meets horizontal ===
    const impactGeo = new THREE.PlaneGeometry(0.4, 0.4);
    const impactMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        void main() {
          float dist = length(vUv - 0.5) * 2.0;
          float glow = exp(-dist * 3.0);

          float pulse = 0.8 + 0.2 * sin(time * 3.0);

          vec3 color = vec3(0.5, 0.7, 1.0);
          gl_FragColor = vec4(color, glow * pulse * 0.7);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const impact = new THREE.Mesh(impactGeo, impactMat);
    impact.position.y = -beamHeight;
    impact.position.z = 0.001;
    beamGroup.add(impact);

    // === 5. HORIZONTAL DISSIPATION LINE - Traveling energy to the right ===
    const horizGeo = new THREE.PlaneGeometry(5, 0.08);
    const horizMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        void main() {
          // Fade from left (bright) to right (dark)
          float hFade = exp(-vUv.x * 2.0);

          // Vertical softness
          float vSoft = 1.0 - pow(abs(vUv.y - 0.5) * 2.0, 2.0);

          // Traveling energy pulses moving to the right
          float wave1 = smoothstep(0.3, 0.0, abs(fract(vUv.x * 3.0 - time * 0.8) - 0.5));
          float wave2 = smoothstep(0.25, 0.0, abs(fract(vUv.x * 3.0 - time * 0.8 + 0.33) - 0.5));
          float wave3 = smoothstep(0.2, 0.0, abs(fract(vUv.x * 3.0 - time * 0.8 + 0.66) - 0.5));
          float waves = (wave1 + wave2 * 0.7 + wave3 * 0.5) * 0.5;

          // Combine base glow with waves
          float intensity = hFade * vSoft * (0.4 + waves);

          vec3 color = vec3(0.4, 0.6, 1.0);
          gl_FragColor = vec4(color, intensity * 0.6);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const horiz = new THREE.Mesh(horizGeo, horizMat);
    horiz.position.x = 2.5; // Offset to the right of beam
    horiz.position.y = -beamHeight;
    horiz.position.z = -0.001;
    beamGroup.add(horiz);

    // === 6. SECONDARY HORIZONTAL LINE - Subtle trailing glow ===
    const horiz2Geo = new THREE.PlaneGeometry(4, 0.2);
    const horiz2Mat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        void main() {
          float hFade = exp(-vUv.x * 1.8);
          float vSoft = exp(-pow(abs(vUv.y - 0.5) * 2.0, 2.0) * 3.0);

          vec3 color = vec3(0.3, 0.5, 1.0);
          gl_FragColor = vec4(color, hFade * vSoft * 0.2);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const horiz2 = new THREE.Mesh(horiz2Geo, horiz2Mat);
    horiz2.position.x = 2.0;
    horiz2.position.y = -beamHeight;
    horiz2.position.z = -0.003;
    beamGroup.add(horiz2);

    // === 7. PARTICLES - Flowing down and then sideways ===
    const particleCount = 50;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 2); // vx, vy
    const sizes = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.15;
      positions[i * 3 + 1] = Math.random() * beamHeight;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      velocities[i * 2] = 0.5 + Math.random() * 1.5; // Horizontal speed after impact
      velocities[i * 2 + 1] = 1.2 + Math.random() * 1.5; // Vertical fall speed
      sizes[i] = 0.5 + Math.random() * 1.0;
      phases[i] = Math.random() * 100;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 2));
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    particleGeo.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    const particleMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        beamHeight: { value: beamHeight }
      },
      vertexShader: `
        attribute vec2 velocity;
        attribute float size;
        attribute float phase;
        uniform float time;
        uniform float beamHeight;
        varying float vAlpha;

        void main() {
          vec3 pos = position;
          float t = mod(time * velocity.y + phase, beamHeight + 3.0);

          if (t < beamHeight) {
            // Falling down the beam
            pos.y = beamHeight - t;
            pos.x += sin(time * 0.8 + phase) * 0.02;
            vAlpha = smoothstep(0.0, 1.0, pos.y) * smoothstep(beamHeight, beamHeight - 0.5, pos.y) * 0.7;
          } else {
            // Moving horizontally after hitting bottom
            float horizT = t - beamHeight;
            pos.y = 0.0 + sin(horizT * 2.0) * 0.05; // Slight wave
            pos.x = horizT * velocity.x; // Move right
            vAlpha = (1.0 - horizT / 3.0) * 0.6; // Fade out
          }

          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (50.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float a = (1.0 - d * 2.0) * max(vAlpha, 0.0);
          gl_FragColor = vec4(0.7, 0.85, 1.0, a);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    particles.position.y = -beamHeight;
    beamGroup.add(particles);

    // === ANIMATION LOOP ===
    let time = 0;

    function animate() {
      requestAnimationFrame(animate);
      time += 0.016;

      coreMat.uniforms.time.value = time;
      innerMat.uniforms.time.value = time;
      outerMat.uniforms.time.value = time;
      impactMat.uniforms.time.value = time;
      horizMat.uniforms.time.value = time;
      horiz2Mat.uniforms.time.value = time;
      particleMat.uniforms.time.value = time;

      // Subtle sway
      beamGroup.rotation.z = Math.sin(time * 0.15) * 0.002;

      renderer.render(scene, camera);
    }

    animate();

    // Resize handler
    window.addEventListener('resize', () => {
      const w = container.offsetWidth || window.innerWidth;
      const h = container.offsetHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
