/**
 * ENERGY BEAM v8b - Three-sided border (fixed)
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

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Frame dimensions - narrower to fit viewport
    const frameWidth = 5;
    const frameHeight = 3.5;

    const frameGroup = new THREE.Group();
    frameGroup.position.set(0, -0.3, 0);
    scene.add(frameGroup);

    const timeUniform = { value: 0 };

    // === VERTICAL BEAM SHADER (for left and right sides) ===
    const verticalBeamMat = new THREE.ShaderMaterial({
      uniforms: { time: timeUniform },
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

          // Energy flowing down
          float pulse = sin(vUv.y * 12.0 - time * 3.0) * 0.2 + 0.8;

          // Fade at edges
          float edgeFade = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);

          vec3 color = mix(vec3(0.3, 0.5, 1.0), vec3(0.6, 0.8, 1.0), glow);
          float alpha = glow * pulse * edgeFade * 0.7;

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    // === HORIZONTAL BEAM SHADER (for bottom) ===
    const horizontalBeamMat = new THREE.ShaderMaterial({
      uniforms: { time: timeUniform },
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
          float dist = abs(vUv.y - 0.5) * 2.0;
          float glow = exp(-dist * 3.0);

          // Energy flowing from center outward (both directions)
          float pulse1 = sin(vUv.x * 15.0 - time * 3.0) * 0.15 + 0.85;
          float pulse2 = sin(vUv.x * 15.0 + time * 3.0) * 0.15 + 0.85;
          float pulse = max(pulse1, pulse2);

          // Fade at edges
          float edgeFade = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);

          vec3 color = mix(vec3(0.3, 0.5, 1.0), vec3(0.6, 0.8, 1.0), glow);
          float alpha = glow * pulse * edgeFade * 0.7;

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    // === CORNER GLOW SHADER ===
    const cornerMat = new THREE.ShaderMaterial({
      uniforms: { time: timeUniform },
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
          float glow = exp(-dist * 2.0);
          float pulse = 0.85 + 0.15 * sin(time * 2.0);

          vec3 color = vec3(0.5, 0.7, 1.0);
          gl_FragColor = vec4(color, glow * pulse * 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    // LEFT BEAM
    const leftBeam = new THREE.Mesh(
      new THREE.PlaneGeometry(0.4, frameHeight),
      verticalBeamMat
    );
    leftBeam.position.set(-frameWidth / 2, 0, 0);
    frameGroup.add(leftBeam);

    // RIGHT BEAM
    const rightBeam = new THREE.Mesh(
      new THREE.PlaneGeometry(0.4, frameHeight),
      verticalBeamMat.clone()
    );
    rightBeam.position.set(frameWidth / 2, 0, 0);
    frameGroup.add(rightBeam);

    // BOTTOM BEAM
    const bottomBeam = new THREE.Mesh(
      new THREE.PlaneGeometry(frameWidth + 0.4, 0.4),
      horizontalBeamMat
    );
    bottomBeam.position.set(0, -frameHeight / 2, 0);
    frameGroup.add(bottomBeam);

    // CORNER GLOWS
    const blCorner = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, 0.6),
      cornerMat
    );
    blCorner.position.set(-frameWidth / 2, -frameHeight / 2, 0.01);
    frameGroup.add(blCorner);

    const brCorner = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, 0.6),
      cornerMat.clone()
    );
    brCorner.position.set(frameWidth / 2, -frameHeight / 2, 0.01);
    frameGroup.add(brCorner);

    // === PARTICLES traveling the U-path ===
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    const offsets = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0.02;
      speeds[i] = 0.4 + Math.random() * 0.4;
      offsets[i] = Math.random() * 20;
      sizes[i] = 0.5 + Math.random() * 0.8;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    particleGeo.setAttribute('offset', new THREE.BufferAttribute(offsets, 1));
    particleGeo.setAttribute('psize', new THREE.BufferAttribute(sizes, 1));

    const particleMat = new THREE.ShaderMaterial({
      uniforms: {
        time: timeUniform,
        fw: { value: frameWidth },
        fh: { value: frameHeight }
      },
      vertexShader: `
        attribute float speed;
        attribute float offset;
        attribute float psize;
        uniform float time;
        uniform float fw;
        uniform float fh;
        varying float vAlpha;

        void main() {
          // Total path length: left side + bottom + right side
          float pathLen = fh + fw + fh;
          float t = mod(time * speed + offset, pathLen);

          vec3 pos = vec3(0.0, 0.0, 0.02);

          if (t < fh) {
            // Going down left side
            pos.x = -fw * 0.5;
            pos.y = fh * 0.5 - t;
          } else if (t < fh + fw) {
            // Going across bottom
            pos.x = -fw * 0.5 + (t - fh);
            pos.y = -fh * 0.5;
          } else {
            // Going up right side
            pos.x = fw * 0.5;
            pos.y = -fh * 0.5 + (t - fh - fw);
          }

          vAlpha = 0.7;

          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = psize * (45.0 / -mvPos.z);
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

    // Animation
    function animate() {
      requestAnimationFrame(animate);
      timeUniform.value += 0.016;
      renderer.render(scene, camera);
    }
    animate();

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
