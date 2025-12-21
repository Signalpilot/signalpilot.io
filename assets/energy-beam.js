/**
 * ENERGY BEAM v4 - Elegant & Refined
 * Clean, graceful beam that connects to hero video
 * Inspired by Huly.io's subtle elegance
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

    // Main group
    const beamGroup = new THREE.Group();
    beamGroup.position.set(0, 3.5, 0); // Higher start point
    scene.add(beamGroup);

    const beamHeight = 7;

    // === 1. CORE BEAM - Ultra thin, bright white center ===
    const coreGeo = new THREE.PlaneGeometry(0.015, beamHeight);
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
          // Vertical fade - strong at top, dissipates at bottom
          float vFade = pow(vUv.y, 0.4);

          // Subtle energy pulse traveling down
          float pulse = sin(vUv.y * 30.0 - time * 6.0) * 0.1 + 0.9;

          // Occasional bright flash
          float flash = smoothstep(0.98, 1.0, sin(time * 2.0 + vUv.y * 5.0)) * 0.5;

          float intensity = vFade * pulse + flash;
          gl_FragColor = vec4(1.0, 1.0, 1.0, intensity * 0.95);
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
    const innerGeo = new THREE.PlaneGeometry(0.12, beamHeight);
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
          float glow = exp(-dist * 5.0);
          float vFade = pow(vUv.y, 0.6);

          // Gentle breathing
          float breath = 0.85 + 0.15 * sin(time * 1.5);

          vec3 color = vec3(0.45, 0.65, 1.0);
          gl_FragColor = vec4(color, glow * 0.5 * vFade * breath);
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

    // === 3. OUTER GLOW - Very subtle wide aura ===
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
          float glow = exp(-dist * 3.0);
          float vFade = pow(vUv.y, 0.8);

          vec3 color = vec3(0.3, 0.5, 1.0);
          gl_FragColor = vec4(color, glow * 0.15 * vFade);
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

    // === 4. IMPACT GLOW - Where beam meets content ===
    const impactGeo = new THREE.PlaneGeometry(2.5, 0.4);
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
          float distX = abs(vUv.x - 0.5) * 2.0;
          float distY = abs(vUv.y - 0.5) * 2.0;

          // Concentrated glow at impact point
          float impact = exp(-distX * 4.0) * exp(-distY * 3.0);

          // Subtle pulse
          float pulse = 0.8 + 0.2 * sin(time * 3.0);

          vec3 color = vec3(0.4, 0.6, 1.0);
          gl_FragColor = vec4(color, impact * pulse * 0.5);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const impact = new THREE.Mesh(impactGeo, impactMat);
    impact.position.y = -beamHeight - 0.1;
    impact.position.z = -0.003;
    beamGroup.add(impact);

    // === 5. BORDER GLOW LINE - Horizontal spread ===
    const borderGeo = new THREE.PlaneGeometry(4, 0.06);
    const borderMat = new THREE.ShaderMaterial({
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
          float distX = abs(vUv.x - 0.5) * 2.0;
          float fade = exp(-distX * 2.5);

          // Traveling light waves (both directions)
          float wave1 = sin((vUv.x - 0.5) * 25.0 - time * 3.0) * 0.5 + 0.5;
          float wave2 = sin((vUv.x - 0.5) * 25.0 + time * 3.0) * 0.5 + 0.5;
          float waves = max(wave1, wave2) * 0.4 + 0.6;

          // Vertical softness
          float vSoft = 1.0 - pow(abs(vUv.y - 0.5) * 2.0, 1.5);

          vec3 color = vec3(0.45, 0.65, 1.0);
          gl_FragColor = vec4(color, fade * waves * vSoft * 0.4);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.y = -beamHeight - 0.25;
    border.position.z = -0.004;
    beamGroup.add(border);

    // === 6. ELEGANT PARTICLES - Few, refined, flowing down ===
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const offsets = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.15;
      positions[i * 3 + 1] = Math.random() * beamHeight;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      speeds[i] = 1.5 + Math.random() * 2;
      sizes[i] = 0.8 + Math.random() * 1.2;
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

          // Very subtle drift
          pos.x += sin(time * 1.5 + offset) * 0.015;

          // Fade near bottom
          float distFromBottom = pos.y;
          vAlpha = smoothstep(0.0, 1.5, distFromBottom) * 0.7;

          // Fade near edges
          float distFromCenter = length(pos.xz);
          vAlpha *= exp(-distFromCenter * 6.0);

          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (60.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float a = (1.0 - d * 2.0) * vAlpha;
          gl_FragColor = vec4(0.75, 0.88, 1.0, a);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    particles.position.y = -beamHeight;
    beamGroup.add(particles);

    // === 7. SUBTLE AMBIENT GLOW - Very faint atmospheric effect ===
    const ambientGeo = new THREE.PlaneGeometry(3, beamHeight * 0.6);
    const ambientMat = new THREE.ShaderMaterial({
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
          float distX = abs(vUv.x - 0.5) * 2.0;
          float distY = abs(vUv.y - 0.5) * 2.0;

          // Very soft radial gradient
          float glow = exp(-distX * 1.5) * exp(-distY * 1.5);

          // Extremely subtle shimmer
          float shimmer = 0.95 + 0.05 * sin(time * 0.8 + vUv.x * 3.0);

          vec3 color = vec3(0.3, 0.45, 0.9);
          gl_FragColor = vec4(color, glow * shimmer * 0.06);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const ambient = new THREE.Mesh(ambientGeo, ambientMat);
    ambient.position.y = -beamHeight * 0.3;
    ambient.position.z = -0.01;
    beamGroup.add(ambient);

    // === ANIMATION LOOP ===
    let time = 0;

    function animate() {
      requestAnimationFrame(animate);
      time += 0.016;

      // Update all shader uniforms
      coreMat.uniforms.time.value = time;
      innerMat.uniforms.time.value = time;
      outerMat.uniforms.time.value = time;
      impactMat.uniforms.time.value = time;
      borderMat.uniforms.time.value = time;
      particleMat.uniforms.time.value = time;
      ambientMat.uniforms.time.value = time;

      // Very subtle, elegant sway
      beamGroup.rotation.z = Math.sin(time * 0.2) * 0.003;

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
