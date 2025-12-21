/**
 * EPIC ENERGY BEAM v3
 * Beam connects to hero video and dissipates into it
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

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
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

    // Main group - centered, beam goes from top to middle (where video is)
    const beamGroup = new THREE.Group();
    beamGroup.position.set(0, 2, 0); // Centered, starts from top
    scene.add(beamGroup);

    // === 1. MAIN BEAM - From top, fading as it reaches the "video" area ===
    const beamHeight = 8;
    const coreGeo = new THREE.PlaneGeometry(0.04, beamHeight);
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
          // Horizontal intensity - bright center
          float hIntensity = 1.0 - pow(abs(vUv.x - 0.5) * 2.0, 0.3);

          // Vertical fade - strong at top (vUv.y=1), dissipates at bottom (vUv.y=0)
          float vFade = pow(vUv.y, 0.3);

          // Energy flow animation - pulses traveling down
          float flow = sin(vUv.y * 20.0 - time * 8.0) * 0.15 + 0.85;

          float flicker = 0.95 + 0.05 * sin(time * 15.0);
          gl_FragColor = vec4(1.0, 1.0, 1.0, hIntensity * vFade * flow * flicker);
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
    const innerGeo = new THREE.PlaneGeometry(0.2, beamHeight);
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
          float vFade = pow(vUv.y, 0.5);
          float pulse = 0.9 + 0.1 * sin(time * 3.0 - vUv.y * 10.0);
          vec3 color = vec3(0.4, 0.6, 1.0);
          gl_FragColor = vec4(color, glow * 0.7 * vFade * pulse);
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
    const outerGeo = new THREE.PlaneGeometry(0.8, beamHeight);
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
          float vFade = pow(vUv.y, 0.7);
          float wave = sin(vUv.y * 15.0 - time * 3.0) * 0.1 + 0.9;
          vec3 color = vec3(0.2, 0.4, 1.0);
          gl_FragColor = vec4(color, glow * 0.25 * vFade * wave);
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

    // === 4. IMPACT POINT - Where beam hits the "video" border ===
    // This creates the absorption/dissipation effect
    const impactGeo = new THREE.PlaneGeometry(3, 0.8);
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
          // Distance from center
          float distX = abs(vUv.x - 0.5) * 2.0;
          float distY = abs(vUv.y - 0.5) * 2.0;

          // Glow spreading horizontally from impact point
          float spread = exp(-distX * 3.0) * exp(-distY * 4.0);

          // Ripple effect
          float ripple = sin(distX * 20.0 - time * 5.0) * 0.3 + 0.7;

          // Pulse
          float pulse = 0.8 + 0.2 * sin(time * 4.0);

          vec3 color = vec3(0.3, 0.5, 1.0);
          gl_FragColor = vec4(color, spread * ripple * pulse * 0.6);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const impact = new THREE.Mesh(impactGeo, impactMat);
    impact.position.y = -beamHeight - 0.2;
    impact.position.z = -0.003;
    beamGroup.add(impact);

    // === 5. HORIZONTAL GLOW LINE - Along the "border" ===
    const borderGlowGeo = new THREE.PlaneGeometry(5, 0.1);
    const borderGlowMat = new THREE.ShaderMaterial({
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
          // Fade from center outward
          float distX = abs(vUv.x - 0.5) * 2.0;
          float fade = exp(-distX * 2.0);

          // Traveling light effect
          float travel = sin((vUv.x - 0.5) * 30.0 - time * 4.0) * 0.5 + 0.5;
          float travel2 = sin((vUv.x - 0.5) * 30.0 + time * 4.0) * 0.5 + 0.5;
          float combined = max(travel, travel2);

          // Vertical fade
          float vFade = 1.0 - pow(abs(vUv.y - 0.5) * 2.0, 2.0);

          vec3 color = vec3(0.4, 0.6, 1.0);
          gl_FragColor = vec4(color, fade * combined * vFade * 0.5);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const borderGlow = new THREE.Mesh(borderGlowGeo, borderGlowMat);
    borderGlow.position.y = -beamHeight - 0.4;
    borderGlow.position.z = -0.004;
    beamGroup.add(borderGlow);

    // === 6. ENERGY PARTICLES - Flowing down into the impact ===
    const particleCount = 150;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const offsets = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 1] = Math.random() * beamHeight;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
      speeds[i] = 2 + Math.random() * 4;
      sizes[i] = 1 + Math.random() * 2;
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

          // Flow downward (negative Y)
          pos.y = beamHeight - mod(time * speed + offset, beamHeight);

          // Slight horizontal drift
          pos.x += sin(time * 2.0 + offset) * 0.03;

          // Fade out as approaching impact point
          float distFromBottom = pos.y;
          vAlpha = smoothstep(0.0, 2.0, distFromBottom) * 0.8;

          // Also fade based on distance from center
          float distFromCenter = length(pos.xz);
          vAlpha *= exp(-distFromCenter * 3.0);

          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (80.0 / -mvPos.z);
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

    // === 7. ABSORPTION SPARKS - Particles that shoot along the border ===
    const sparkCount = 40;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkSpeeds = new Float32Array(sparkCount);
    const sparkSizes = new Float32Array(sparkCount);
    const sparkDirections = new Float32Array(sparkCount);

    for (let i = 0; i < sparkCount; i++) {
      sparkPositions[i * 3] = 0;
      sparkPositions[i * 3 + 1] = 0;
      sparkPositions[i * 3 + 2] = 0;
      sparkSpeeds[i] = 3 + Math.random() * 5;
      sparkSizes[i] = 1 + Math.random() * 2;
      sparkDirections[i] = Math.random() > 0.5 ? 1 : -1;
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    sparkGeo.setAttribute('speed', new THREE.BufferAttribute(sparkSpeeds, 1));
    sparkGeo.setAttribute('size', new THREE.BufferAttribute(sparkSizes, 1));
    sparkGeo.setAttribute('direction', new THREE.BufferAttribute(sparkDirections, 1));

    const sparkMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        attribute float speed;
        attribute float size;
        attribute float direction;
        uniform float time;
        varying float vAlpha;
        void main() {
          vec3 pos = position;

          // Move along X axis (the border)
          float progress = mod(time * speed, 8.0);
          pos.x = direction * progress - direction * 4.0;

          // Fade out as moving away from center
          vAlpha = exp(-abs(pos.x) * 0.5) * 0.6;

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
          gl_FragColor = vec4(0.5, 0.7, 1.0, a);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const sparks = new THREE.Points(sparkGeo, sparkMat);
    sparks.position.y = -beamHeight - 0.4;
    beamGroup.add(sparks);

    // === ANIMATION LOOP ===
    let time = 0;

    function animate() {
      requestAnimationFrame(animate);
      time += 0.016;

      // Update shaders
      coreMat.uniforms.time.value = time;
      innerMat.uniforms.time.value = time;
      outerMat.uniforms.time.value = time;
      impactMat.uniforms.time.value = time;
      borderGlowMat.uniforms.time.value = time;
      particleMat.uniforms.time.value = time;
      sparkMat.uniforms.time.value = time;

      // Very subtle sway
      beamGroup.rotation.z = Math.sin(time * 0.3) * 0.005;

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
