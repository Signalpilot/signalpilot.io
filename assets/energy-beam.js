/**
 * ENERGY BEAM v8 - Three-sided border (left, bottom, right)
 * Creates a glowing frame around the hero content
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

    // Frame dimensions
    const frameWidth = 7;
    const frameHeight = 4.5;
    const beamThickness = 0.03;
    const glowThickness = 0.25;
    const outerGlowThickness = 0.8;

    // Position frame to wrap around content
    const frameGroup = new THREE.Group();
    frameGroup.position.set(0, -0.8, 0);
    scene.add(frameGroup);

    // Shared shader for beam cores
    function createBeamMaterial(isVertical, isRightSide) {
      return new THREE.ShaderMaterial({
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
            float coord = ${isVertical ? 'vUv.y' : 'vUv.x'};
            ${isRightSide ? 'coord = 1.0 - coord;' : ''}

            // Energy pulse traveling along beam
            float pulse = sin(coord * 15.0 - time * 4.0) * 0.15 + 0.85;

            // Fade at edges
            float edgeFade = smoothstep(0.0, 0.05, coord) * smoothstep(1.0, 0.95, coord);

            float intensity = edgeFade * pulse;
            gl_FragColor = vec4(1.0, 1.0, 1.0, intensity * 0.85);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
    }

    // Shared shader for inner glow
    function createGlowMaterial(isVertical, isRightSide) {
      return new THREE.ShaderMaterial({
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
            float crossCoord = ${isVertical ? 'vUv.x' : 'vUv.y'};
            float alongCoord = ${isVertical ? 'vUv.y' : 'vUv.x'};
            ${isRightSide ? 'alongCoord = 1.0 - alongCoord;' : ''}

            float dist = abs(crossCoord - 0.5) * 2.0;
            float glow = exp(-dist * 4.0);
            float edgeFade = smoothstep(0.0, 0.08, alongCoord) * smoothstep(1.0, 0.92, alongCoord);

            float breath = 0.85 + 0.15 * sin(time * 1.2 + alongCoord * 3.0);

            vec3 color = vec3(0.45, 0.65, 1.0);
            gl_FragColor = vec4(color, glow * 0.5 * edgeFade * breath);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
    }

    // Outer glow material
    function createOuterGlowMaterial(isVertical, isRightSide) {
      return new THREE.ShaderMaterial({
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
            float crossCoord = ${isVertical ? 'vUv.x' : 'vUv.y'};
            float alongCoord = ${isVertical ? 'vUv.y' : 'vUv.x'};
            ${isRightSide ? 'alongCoord = 1.0 - alongCoord;' : ''}

            float dist = abs(crossCoord - 0.5) * 2.0;
            float glow = exp(-dist * 2.0);
            float edgeFade = smoothstep(0.0, 0.12, alongCoord) * smoothstep(1.0, 0.88, alongCoord);

            vec3 color = vec3(0.3, 0.5, 1.0);
            gl_FragColor = vec4(color, glow * 0.15 * edgeFade);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
    }

    // Store materials for animation
    const materials = [];

    // === LEFT BEAM ===
    const leftCore = new THREE.Mesh(
      new THREE.PlaneGeometry(beamThickness, frameHeight),
      createBeamMaterial(true, false)
    );
    leftCore.position.set(-frameWidth / 2, 0, 0);
    materials.push(leftCore.material);
    frameGroup.add(leftCore);

    const leftGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(glowThickness, frameHeight),
      createGlowMaterial(true, false)
    );
    leftGlow.position.set(-frameWidth / 2, 0, -0.001);
    materials.push(leftGlow.material);
    frameGroup.add(leftGlow);

    const leftOuterGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(outerGlowThickness, frameHeight),
      createOuterGlowMaterial(true, false)
    );
    leftOuterGlow.position.set(-frameWidth / 2, 0, -0.002);
    materials.push(leftOuterGlow.material);
    frameGroup.add(leftOuterGlow);

    // === RIGHT BEAM ===
    const rightCore = new THREE.Mesh(
      new THREE.PlaneGeometry(beamThickness, frameHeight),
      createBeamMaterial(true, true)
    );
    rightCore.position.set(frameWidth / 2, 0, 0);
    materials.push(rightCore.material);
    frameGroup.add(rightCore);

    const rightGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(glowThickness, frameHeight),
      createGlowMaterial(true, true)
    );
    rightGlow.position.set(frameWidth / 2, 0, -0.001);
    materials.push(rightGlow.material);
    frameGroup.add(rightGlow);

    const rightOuterGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(outerGlowThickness, frameHeight),
      createOuterGlowMaterial(true, true)
    );
    rightOuterGlow.position.set(frameWidth / 2, 0, -0.002);
    materials.push(rightOuterGlow.material);
    frameGroup.add(rightOuterGlow);

    // === BOTTOM BEAM ===
    const bottomCore = new THREE.Mesh(
      new THREE.PlaneGeometry(frameWidth, beamThickness),
      createBeamMaterial(false, false)
    );
    bottomCore.position.set(0, -frameHeight / 2, 0);
    materials.push(bottomCore.material);
    frameGroup.add(bottomCore);

    const bottomGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(frameWidth, glowThickness),
      createGlowMaterial(false, false)
    );
    bottomGlow.position.set(0, -frameHeight / 2, -0.001);
    materials.push(bottomGlow.material);
    frameGroup.add(bottomGlow);

    const bottomOuterGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(frameWidth, outerGlowThickness),
      createOuterGlowMaterial(false, false)
    );
    bottomOuterGlow.position.set(0, -frameHeight / 2, -0.002);
    materials.push(bottomOuterGlow.material);
    frameGroup.add(bottomOuterGlow);

    // === CORNER GLOWS - Bright spots at corners ===
    function createCornerGlow() {
      return new THREE.ShaderMaterial({
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
            float glow = exp(-dist * 2.5);
            float pulse = 0.8 + 0.2 * sin(time * 2.5);

            vec3 color = vec3(0.5, 0.7, 1.0);
            gl_FragColor = vec4(color, glow * pulse * 0.6);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
    }

    // Bottom-left corner
    const blCorner = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.5),
      createCornerGlow()
    );
    blCorner.position.set(-frameWidth / 2, -frameHeight / 2, 0.001);
    materials.push(blCorner.material);
    frameGroup.add(blCorner);

    // Bottom-right corner
    const brCorner = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.5),
      createCornerGlow()
    );
    brCorner.position.set(frameWidth / 2, -frameHeight / 2, 0.001);
    materials.push(brCorner.material);
    frameGroup.add(brCorner);

    // === TRAVELING ENERGY PARTICLES ===
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const params = new Float32Array(particleCount * 3); // speed, phase, side (0=left, 1=bottom, 2=right)
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const side = Math.floor(Math.random() * 3);
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0.01;
      params[i * 3] = 0.3 + Math.random() * 0.5; // speed
      params[i * 3 + 1] = Math.random(); // phase (0-1 along path)
      params[i * 3 + 2] = side;
      sizes[i] = 0.4 + Math.random() * 0.8;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('params', new THREE.BufferAttribute(params, 3));
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        frameWidth: { value: frameWidth },
        frameHeight: { value: frameHeight }
      },
      vertexShader: `
        attribute vec3 params;
        attribute float size;
        uniform float time;
        uniform float frameWidth;
        uniform float frameHeight;
        varying float vAlpha;

        void main() {
          float speed = params.x;
          float phase = params.y;
          float side = params.z;

          // Calculate position along the U-shaped path
          // Path: top-left -> bottom-left -> bottom-right -> top-right
          float totalLen = frameHeight + frameWidth + frameHeight;
          float t = mod(time * speed + phase * totalLen, totalLen);

          vec3 pos = vec3(0.0);

          if (t < frameHeight) {
            // Left side, going down
            pos.x = -frameWidth / 2.0;
            pos.y = frameHeight / 2.0 - t;
            vAlpha = 0.7;
          } else if (t < frameHeight + frameWidth) {
            // Bottom, going right
            float bt = t - frameHeight;
            pos.x = -frameWidth / 2.0 + bt;
            pos.y = -frameHeight / 2.0;
            vAlpha = 0.8;
          } else {
            // Right side, going up
            float rt = t - frameHeight - frameWidth;
            pos.x = frameWidth / 2.0;
            pos.y = -frameHeight / 2.0 + rt;
            vAlpha = 0.7;
          }

          // Add slight randomness
          pos.x += sin(time * 2.0 + phase * 10.0) * 0.02;
          pos.y += cos(time * 2.0 + phase * 10.0) * 0.02;
          pos.z = 0.01;

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
          float a = (1.0 - d * 2.0) * vAlpha;
          gl_FragColor = vec4(0.7, 0.85, 1.0, a);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    frameGroup.add(particles);
    materials.push(particleMat);

    // === ANIMATION LOOP ===
    let time = 0;

    function animate() {
      requestAnimationFrame(animate);
      time += 0.016;

      // Update all materials
      materials.forEach(mat => {
        mat.uniforms.time.value = time;
      });

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
