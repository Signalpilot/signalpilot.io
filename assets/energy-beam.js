/**
 * ENERGY BEAM v11 - ONE continuous energy flow around frame
 * Energy spawns at top center, flows outward, then down the sides
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

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const frameWidth = 5.5;
    const frameHeight = 3.5;
    const halfW = frameWidth / 2;
    const halfH = frameHeight / 2;

    // Total path length for unified animation
    const topHalfLen = halfW;
    const sideLen = frameHeight;
    const totalPathLen = topHalfLen + sideLen; // center to corner + down side

    const frameGroup = new THREE.Group();
    frameGroup.position.set(0, -0.8, 0);
    scene.add(frameGroup);

    const timeUniform = { value: 0 };

    // === UNIFIED BEAM - One continuous path ===
    // We'll draw it as one long line that wraps around

    // TOP BEAM - Energy flows FROM CENTER OUTWARD
    const topMat = new THREE.ShaderMaterial({
      uniforms: {
        time: timeUniform,
        pathLen: { value: totalPathLen }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float pathLen;
        varying vec2 vUv;

        void main() {
          float yDist = abs(vUv.y - 0.5) * 2.0;

          // Glow layers
          float core = exp(-yDist * 10.0);
          float inner = exp(-yDist * 4.0);
          float outer = exp(-yDist * 1.5);

          // Distance from center (0 at center, 1 at edges)
          float distFromCenter = abs(vUv.x - 0.5) * 2.0;

          // Energy pulses traveling FROM CENTER OUTWARD
          // Multiple waves at different speeds
          float wave1 = sin((distFromCenter * 8.0 - time * 3.0) * 3.14159) * 0.5 + 0.5;
          float wave2 = sin((distFromCenter * 12.0 - time * 4.5) * 3.14159) * 0.3 + 0.7;
          float pulse = wave1 * 0.7 + wave2 * 0.3;

          // Bright energy source at center
          float centerSource = exp(-distFromCenter * 4.0) * (0.8 + 0.2 * sin(time * 5.0));

          vec3 coreColor = vec3(0.95, 0.98, 1.0);
          vec3 innerColor = vec3(0.5, 0.75, 1.0);
          vec3 outerColor = vec3(0.2, 0.4, 0.9);

          vec3 color = outerColor * outer + innerColor * inner + coreColor * core;
          float alpha = (core + inner * 0.4 + outer * 0.15) * pulse + centerSource;

          gl_FragColor = vec4(color, alpha * 0.85);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const topBeam = new THREE.Mesh(
      new THREE.PlaneGeometry(frameWidth, 0.5),
      topMat
    );
    topBeam.position.set(0, halfH, 0);
    frameGroup.add(topBeam);

    // LEFT SIDE - Energy flows DOWN (continues from top-left corner)
    const leftMat = new THREE.ShaderMaterial({
      uniforms: {
        time: timeUniform,
        topHalfLen: { value: topHalfLen }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float topHalfLen;
        varying vec2 vUv;

        void main() {
          float xDist = abs(vUv.x - 0.5) * 2.0;

          // Glow layers
          float core = exp(-xDist * 10.0);
          float inner = exp(-xDist * 4.0);
          float outer = exp(-xDist * 1.5);

          // Progress down the beam (0 at top, 1 at bottom)
          float downProgress = 1.0 - vUv.y;

          // Energy continues from where top beam left off
          // Wave synced with top beam's edge timing
          float pathProgress = topHalfLen + downProgress * ${frameHeight.toFixed(1)};
          float wave1 = sin((pathProgress - time * 3.0) * 1.5) * 0.5 + 0.5;
          float wave2 = sin((pathProgress - time * 4.5) * 2.0) * 0.3 + 0.7;
          float pulse = wave1 * 0.7 + wave2 * 0.3;

          // Fade at bottom
          float bottomFade = smoothstep(0.0, 0.25, vUv.y);

          vec3 coreColor = vec3(0.95, 0.98, 1.0);
          vec3 innerColor = vec3(0.5, 0.75, 1.0);
          vec3 outerColor = vec3(0.2, 0.4, 0.9);

          vec3 color = outerColor * outer + innerColor * inner + coreColor * core;
          float alpha = (core + inner * 0.4 + outer * 0.15) * pulse * bottomFade;

          gl_FragColor = vec4(color, alpha * 0.85);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const leftBeam = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, frameHeight),
      leftMat
    );
    leftBeam.position.set(-halfW, 0, 0);
    frameGroup.add(leftBeam);

    // RIGHT SIDE - Mirror of left
    const rightMat = new THREE.ShaderMaterial({
      uniforms: {
        time: timeUniform,
        topHalfLen: { value: topHalfLen }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float topHalfLen;
        varying vec2 vUv;

        void main() {
          float xDist = abs(vUv.x - 0.5) * 2.0;

          float core = exp(-xDist * 10.0);
          float inner = exp(-xDist * 4.0);
          float outer = exp(-xDist * 1.5);

          float downProgress = 1.0 - vUv.y;
          float pathProgress = topHalfLen + downProgress * ${frameHeight.toFixed(1)};
          float wave1 = sin((pathProgress - time * 3.0) * 1.5) * 0.5 + 0.5;
          float wave2 = sin((pathProgress - time * 4.5) * 2.0) * 0.3 + 0.7;
          float pulse = wave1 * 0.7 + wave2 * 0.3;

          float bottomFade = smoothstep(0.0, 0.25, vUv.y);

          vec3 coreColor = vec3(0.95, 0.98, 1.0);
          vec3 innerColor = vec3(0.5, 0.75, 1.0);
          vec3 outerColor = vec3(0.2, 0.4, 0.9);

          vec3 color = outerColor * outer + innerColor * inner + coreColor * core;
          float alpha = (core + inner * 0.4 + outer * 0.15) * pulse * bottomFade;

          gl_FragColor = vec4(color, alpha * 0.85);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const rightBeam = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, frameHeight),
      rightMat
    );
    rightBeam.position.set(halfW, 0, 0);
    frameGroup.add(rightBeam);

    // === PARTICLES - Flow along the unified path ===
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    const offsets = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const sides = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0.02;
      speeds[i] = 0.8 + Math.random() * 0.6;
      offsets[i] = Math.random() * 12;
      sizes[i] = 0.4 + Math.random() * 0.8;
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
        hw: { value: halfW },
        hh: { value: halfH },
        fh: { value: frameHeight }
      },
      vertexShader: `
        attribute float speed;
        attribute float offset;
        attribute float psize;
        attribute float side;
        uniform float time;
        uniform float hw;
        uniform float hh;
        uniform float fh;
        varying float vAlpha;

        void main() {
          float topLen = hw;
          float sideLen = fh;
          float totalLen = topLen + sideLen;

          float t = mod(time * speed + offset, totalLen);
          vec3 pos = vec3(0.0, 0.0, 0.02);

          if (t < topLen) {
            // On top beam, moving outward from center
            float x = t;
            pos.x = side < 0.5 ? -x : x;
            pos.y = hh;
            vAlpha = 0.9;
          } else {
            // On side beam, moving down
            float sideT = t - topLen;
            pos.x = side < 0.5 ? -hw : hw;
            pos.y = hh - sideT;
            vAlpha = 0.8 * (1.0 - sideT / sideLen * 0.5);
          }

          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = psize * (55.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float a = (1.0 - d * 2.0) * vAlpha;
          gl_FragColor = vec4(0.75, 0.9, 1.0, a);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    frameGroup.add(particles);

    // === CENTER SOURCE GLOW ===
    const sourceMat = new THREE.ShaderMaterial({
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
          float pulse = 0.85 + 0.15 * sin(time * 4.0);
          float burst = pow(sin(time * 2.0) * 0.5 + 0.5, 4.0) * 0.3;

          vec3 color = vec3(0.6, 0.85, 1.0);
          gl_FragColor = vec4(color, (glow * pulse + burst) * 0.5);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const source = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.8),
      sourceMat
    );
    source.position.set(0, halfH, 0.01);
    frameGroup.add(source);

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
