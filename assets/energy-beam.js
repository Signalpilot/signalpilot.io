/**
 * ENERGY BEAM v10 - Top + Sides frame (upside-down U)
 * Epic glowing border that doesn't block content below
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

    const frameWidth = 5.5;
    const frameHeight = 3.5;

    const frameGroup = new THREE.Group();
    frameGroup.position.set(0, -0.8, 0); // Position so top beam is above video
    scene.add(frameGroup);

    const timeUniform = { value: 0 };

    // === EPIC VERTICAL BEAM (sides) ===
    const verticalMat = new THREE.ShaderMaterial({
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
          float xDist = abs(vUv.x - 0.5) * 2.0;

          // Multi-layer glow for epic effect
          float core = exp(-xDist * 12.0);
          float inner = exp(-xDist * 5.0);
          float outer = exp(-xDist * 2.0);

          // Energy pulses traveling DOWN the sides
          float pulse1 = sin(vUv.y * 8.0 - time * 4.0) * 0.5 + 0.5;
          float pulse2 = sin(vUv.y * 15.0 - time * 6.0) * 0.3 + 0.7;
          float pulse = pulse1 * 0.6 + pulse2 * 0.4;

          // Bright flashes
          float flash = pow(sin(vUv.y * 3.0 - time * 2.0) * 0.5 + 0.5, 8.0) * 0.4;

          // Fade at bottom (trails off)
          float yFade = smoothstep(0.0, 0.3, vUv.y);
          // Slight fade at top where it meets horizontal
          float topFade = smoothstep(1.0, 0.95, vUv.y);

          vec3 coreColor = vec3(0.9, 0.95, 1.0);
          vec3 innerColor = vec3(0.5, 0.7, 1.0);
          vec3 outerColor = vec3(0.2, 0.4, 0.9);

          vec3 color = outerColor * outer + innerColor * inner + coreColor * core;
          float alpha = (core * 1.0 + inner * 0.5 + outer * 0.2) * pulse * yFade * topFade + flash * yFade;

          gl_FragColor = vec4(color, alpha * 0.9);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    // === EPIC HORIZONTAL BEAM (top) ===
    const horizontalMat = new THREE.ShaderMaterial({
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
          float yDist = abs(vUv.y - 0.5) * 2.0;

          // Multi-layer glow
          float core = exp(-yDist * 12.0);
          float inner = exp(-yDist * 5.0);
          float outer = exp(-yDist * 2.0);

          // Energy pulses from CENTER outward (both directions)
          float distFromCenter = abs(vUv.x - 0.5) * 2.0;
          float pulse1 = sin(distFromCenter * 10.0 - time * 5.0) * 0.5 + 0.5;
          float pulse2 = sin(distFromCenter * 20.0 - time * 8.0) * 0.3 + 0.7;
          float pulse = pulse1 * 0.6 + pulse2 * 0.4;

          // Bright center
          float centerGlow = exp(-distFromCenter * 3.0) * 0.5;

          // Fade at edges
          float xFade = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);

          vec3 coreColor = vec3(0.9, 0.95, 1.0);
          vec3 innerColor = vec3(0.5, 0.7, 1.0);
          vec3 outerColor = vec3(0.2, 0.4, 0.9);

          vec3 color = outerColor * outer + innerColor * inner + coreColor * core;
          float alpha = (core * 1.0 + inner * 0.5 + outer * 0.2 + centerGlow) * pulse * xFade;

          gl_FragColor = vec4(color, alpha * 0.9);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    // TOP BEAM
    const topBeam = new THREE.Mesh(
      new THREE.PlaneGeometry(frameWidth + 0.6, 0.6),
      horizontalMat
    );
    topBeam.position.set(0, frameHeight / 2, 0);
    frameGroup.add(topBeam);

    // LEFT BEAM
    const leftBeam = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, frameHeight),
      verticalMat
    );
    leftBeam.position.set(-frameWidth / 2, 0, 0);
    frameGroup.add(leftBeam);

    // RIGHT BEAM (clone with same material)
    const rightMat = verticalMat.clone();
    rightMat.uniforms.time = timeUniform;
    const rightBeam = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, frameHeight),
      rightMat
    );
    rightBeam.position.set(frameWidth / 2, 0, 0);
    frameGroup.add(rightBeam);

    // === TOP CORNER GLOWS - where beams meet ===
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
          float glow = exp(-dist * 2.5);
          float pulse = 0.8 + 0.2 * sin(time * 3.0);
          float flash = pow(sin(time * 5.0) * 0.5 + 0.5, 6.0) * 0.3;

          vec3 color = vec3(0.6, 0.8, 1.0);
          gl_FragColor = vec4(color, (glow * pulse + flash) * 0.7);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    // Top-left corner
    const tlCorner = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.8),
      cornerMat
    );
    tlCorner.position.set(-frameWidth / 2, frameHeight / 2, 0.01);
    frameGroup.add(tlCorner);

    // Top-right corner
    const trCorner = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.8),
      cornerMat.clone()
    );
    trCorner.material.uniforms.time = timeUniform;
    trCorner.position.set(frameWidth / 2, frameHeight / 2, 0.01);
    frameGroup.add(trCorner);

    // === EPIC PARTICLES - Flow from top down the sides ===
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    const offsets = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const sides = new Float32Array(particleCount); // 0 = left, 1 = right

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0.02;
      speeds[i] = 0.5 + Math.random() * 0.6;
      offsets[i] = Math.random() * 15;
      sizes[i] = 0.5 + Math.random() * 1.0;
      sides[i] = Math.random() > 0.5 ? 1.0 : 0.0;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    particleGeo.setAttribute('offset', new THREE.BufferAttribute(offsets, 1));
    particleGeo.setAttribute('psize', new THREE.BufferAttribute(sizes, 1));
    particleGeo.setAttribute('side', new THREE.BufferAttribute(sides, 1));

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
        attribute float side;
        uniform float time;
        uniform float fw;
        uniform float fh;
        varying float vAlpha;

        void main() {
          // Path: across top, then down the appropriate side
          float topLen = fw;
          float sideLen = fh;
          float totalLen = topLen * 0.5 + sideLen; // Half top + full side

          float t = mod(time * speed + offset, totalLen);
          vec3 pos = vec3(0.0, 0.0, 0.02);

          if (side < 0.5) {
            // LEFT PATH: center -> left along top -> down left side
            if (t < topLen * 0.5) {
              pos.x = -t;
              pos.y = fh * 0.5;
            } else {
              pos.x = -fw * 0.5;
              pos.y = fh * 0.5 - (t - topLen * 0.5);
            }
          } else {
            // RIGHT PATH: center -> right along top -> down right side
            if (t < topLen * 0.5) {
              pos.x = t;
              pos.y = fh * 0.5;
            } else {
              pos.x = fw * 0.5;
              pos.y = fh * 0.5 - (t - topLen * 0.5);
            }
          }

          // Fade as they travel
          float progress = t / totalLen;
          vAlpha = (1.0 - progress * 0.5) * 0.8;

          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = psize * (50.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float a = (1.0 - d * 2.0) * vAlpha;
          gl_FragColor = vec4(0.7, 0.88, 1.0, a);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    frameGroup.add(particles);

    // === AMBIENT GLOW at top center ===
    const ambientMat = new THREE.ShaderMaterial({
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
          float dist = length(vUv - vec2(0.5, 0.8)) * 2.0;
          float glow = exp(-dist * 1.5);
          float pulse = 0.9 + 0.1 * sin(time * 1.5);

          vec3 color = vec3(0.25, 0.4, 0.8);
          gl_FragColor = vec4(color, glow * pulse * 0.15);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const ambient = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 3),
      ambientMat
    );
    ambient.position.set(0, frameHeight / 2, -0.1);
    frameGroup.add(ambient);

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
