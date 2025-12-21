/**
 * ENERGY BEAM v6 - Side positioned, simple vertical
 * Clean beam on the side, not blocking content
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

    // Main group - POSITIONED TO THE LEFT SIDE
    const beamGroup = new THREE.Group();
    beamGroup.position.set(-3.5, 3, 0); // Left side of screen
    scene.add(beamGroup);

    const beamHeight = 8;

    // === 1. CORE BEAM - Thin, bright white center ===
    const coreGeo = new THREE.PlaneGeometry(0.02, beamHeight);
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
          // Fade at top and bottom edges
          float edgeFade = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);

          // Subtle energy pulse traveling down
          float pulse = sin(vUv.y * 25.0 - time * 4.0) * 0.15 + 0.85;

          float intensity = edgeFade * pulse;
          gl_FragColor = vec4(1.0, 1.0, 1.0, intensity * 0.85);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = -beamHeight / 2;
    beamGroup.add(core);

    // === 2. INNER GLOW - Soft blue aura ===
    const innerGeo = new THREE.PlaneGeometry(0.15, beamHeight);
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
          float glow = exp(-dist * 4.0);
          float edgeFade = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);

          float breath = 0.85 + 0.15 * sin(time * 1.2);

          vec3 color = vec3(0.45, 0.65, 1.0);
          gl_FragColor = vec4(color, glow * 0.45 * edgeFade * breath);
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

    // === 3. OUTER GLOW - Subtle wide aura ===
    const outerGeo = new THREE.PlaneGeometry(0.5, beamHeight);
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
          float edgeFade = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);

          vec3 color = vec3(0.3, 0.5, 1.0);
          gl_FragColor = vec4(color, glow * 0.15 * edgeFade);
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

    // === 4. PARTICLES - Flow along the beam ===
    const particleCount = 35;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const offsets = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.1;
      positions[i * 3 + 1] = Math.random() * beamHeight;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
      speeds[i] = 1.0 + Math.random() * 1.5;
      sizes[i] = 0.5 + Math.random() * 0.8;
      offsets[i] = Math.random() * 100;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    particleGeo.setAttribute('offset', new THREE.BufferAttribute(offsets, 1));

    const particleMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        beamHeight: { value: beamHeight }
      },
      vertexShader: `
        attribute float speed;
        attribute float size;
        attribute float offset;
        uniform float time;
        uniform float beamHeight;
        varying float vAlpha;
        void main() {
          vec3 pos = position;

          // Flow downward
          pos.y = beamHeight - mod(time * speed + offset, beamHeight);

          // Fade near edges
          float edgeFade = smoothstep(0.0, 1.0, pos.y) * smoothstep(beamHeight, beamHeight - 1.0, pos.y);
          vAlpha = edgeFade * 0.6;

          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (45.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float a = (1.0 - d * 2.0) * vAlpha;
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
      particleMat.uniforms.time.value = time;

      // Very subtle sway
      beamGroup.rotation.z = Math.sin(time * 0.15) * 0.003;

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
