/**
 * EPIC ENERGY BEAM EFFECT v2
 * Going all out - multiple layers, particles, volumetric light
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

    // Main group positioned to the right
    const beamGroup = new THREE.Group();
    beamGroup.position.set(3, 0, 0);
    scene.add(beamGroup);

    // === 1. BEAM CORE - Ultra bright center line ===
    const coreGeo = new THREE.PlaneGeometry(0.03, 20);
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
          float intensity = 1.0 - pow(abs(vUv.x - 0.5) * 2.0, 0.3);
          float flicker = 0.95 + 0.05 * sin(time * 10.0 + vUv.y * 50.0);
          gl_FragColor = vec4(1.0, 1.0, 1.0, intensity * flicker);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    beamGroup.add(core);

    // === 2. INNER GLOW - Bright blue halo ===
    const innerGeo = new THREE.PlaneGeometry(0.15, 20);
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
          float pulse = 0.9 + 0.1 * sin(time * 3.0);
          vec3 color = vec3(0.4, 0.6, 1.0);
          gl_FragColor = vec4(color, glow * 0.8 * pulse);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    inner.position.z = -0.001;
    beamGroup.add(inner);

    // === 3. OUTER GLOW - Wider atmospheric glow ===
    const outerGeo = new THREE.PlaneGeometry(0.6, 20);
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
          float wave = sin(vUv.y * 30.0 + time * 2.0) * 0.1 + 0.9;
          vec3 color = vec3(0.2, 0.4, 1.0);
          gl_FragColor = vec4(color, glow * 0.3 * wave);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const outer = new THREE.Mesh(outerGeo, outerMat);
    outer.position.z = -0.002;
    beamGroup.add(outer);

    // === 4. VOLUMETRIC RAYS - Light rays emanating outward ===
    const rayCount = 12;
    const rays = [];
    for (let i = 0; i < rayCount; i++) {
      const rayGeo = new THREE.PlaneGeometry(0.02, 3 + Math.random() * 4);
      const rayMat = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          offset: { value: Math.random() * 100 }
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
          uniform float offset;
          varying vec2 vUv;
          void main() {
            float fade = 1.0 - vUv.y;
            float flicker = 0.5 + 0.5 * sin(time * 5.0 + offset);
            vec3 color = vec3(0.3, 0.5, 1.0);
            gl_FragColor = vec4(color, fade * flicker * 0.15);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const ray = new THREE.Mesh(rayGeo, rayMat);
      const angle = (i / rayCount) * Math.PI * 2;
      ray.position.set(Math.cos(angle) * 0.1, -8 + Math.random() * 16, -0.003);
      ray.rotation.z = angle + Math.PI / 2;
      beamGroup.add(ray);
      rays.push({ mesh: ray, mat: rayMat, baseAngle: angle, speed: 0.5 + Math.random() });
    }

    // === 5. ENERGY PARTICLES - Rising sparks ===
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const offsets = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = Math.random() * 20 - 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
      speeds[i] = 1 + Math.random() * 3;
      sizes[i] = 1 + Math.random() * 3;
      offsets[i] = Math.random() * 100;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    particleGeo.setAttribute('offset', new THREE.BufferAttribute(offsets, 1));

    const particleMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        attribute float speed;
        attribute float size;
        attribute float offset;
        uniform float time;
        varying float vAlpha;
        void main() {
          vec3 pos = position;
          pos.y = mod(pos.y + time * speed, 20.0) - 10.0;
          pos.x += sin(time * 2.0 + offset) * 0.05;

          float distFromCenter = length(pos.xz);
          vAlpha = exp(-distFromCenter * 4.0) * (0.5 + 0.5 * sin(time * 10.0 + offset));

          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (100.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float a = (1.0 - d * 2.0) * vAlpha;
          gl_FragColor = vec4(0.6, 0.8, 1.0, a);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    beamGroup.add(particles);

    // === 6. BASE PORTAL EFFECT ===
    const portalGeo = new THREE.RingGeometry(0.1, 0.8, 64);
    const portalMat = new THREE.ShaderMaterial({
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
          float ring = sin(vUv.x * 6.28318 * 3.0 + time * 5.0) * 0.5 + 0.5;
          float fade = 1.0 - abs(vUv.y - 0.5) * 2.0;
          vec3 color = mix(vec3(0.2, 0.4, 1.0), vec3(0.6, 0.8, 1.0), ring);
          gl_FragColor = vec4(color, ring * fade * 0.5);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const portal = new THREE.Mesh(portalGeo, portalMat);
    portal.rotation.x = -Math.PI / 2;
    portal.position.y = -9;
    beamGroup.add(portal);

    // === 7. LENS FLARE / HOT SPOTS ===
    const flareGeo = new THREE.PlaneGeometry(0.5, 0.5);
    const flareMat = new THREE.ShaderMaterial({
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
          vec2 center = vUv - 0.5;
          float dist = length(center);
          float flare = exp(-dist * 8.0);
          float pulse = 0.7 + 0.3 * sin(time * 4.0);
          gl_FragColor = vec4(0.8, 0.9, 1.0, flare * pulse * 0.6);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const flares = [];
    const flarePositions = [0, 3, -3, 6, -6];
    flarePositions.forEach((y, i) => {
      const flare = new THREE.Mesh(flareGeo, flareMat.clone());
      flare.position.set(0, y, 0.01);
      flare.scale.setScalar(0.3 + Math.random() * 0.4);
      beamGroup.add(flare);
      flares.push({ mesh: flare, baseY: y, phase: Math.random() * Math.PI * 2 });
    });

    // === 8. ELECTRICITY / LIGHTNING TENDRILS ===
    const lightningCount = 6;
    const lightnings = [];

    for (let i = 0; i < lightningCount; i++) {
      const points = [];
      const segments = 20;
      for (let j = 0; j <= segments; j++) {
        points.push(new THREE.Vector3(0, j * 0.8 - 8, 0));
      }

      const lightningGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lightningMat = new THREE.LineBasicMaterial({
        color: 0x88aaff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
      });

      const lightning = new THREE.Line(lightningGeo, lightningMat);
      beamGroup.add(lightning);
      lightnings.push({
        line: lightning,
        geo: lightningGeo,
        mat: lightningMat,
        nextFlash: Math.random() * 2,
        segments: segments
      });
    }

    // === ANIMATION LOOP ===
    let time = 0;

    function animate() {
      requestAnimationFrame(animate);
      time += 0.016;

      // Update shaders
      coreMat.uniforms.time.value = time;
      innerMat.uniforms.time.value = time;
      outerMat.uniforms.time.value = time;
      particleMat.uniforms.time.value = time;
      portalMat.uniforms.time.value = time;

      // Animate rays
      rays.forEach(r => {
        r.mat.uniforms.time.value = time;
        r.mesh.rotation.z = r.baseAngle + Math.sin(time * r.speed) * 0.1;
      });

      // Animate flares
      flares.forEach(f => {
        f.mesh.material.uniforms.time.value = time;
        f.mesh.position.y = f.baseY + Math.sin(time * 2 + f.phase) * 0.3;
        const scale = 0.3 + Math.sin(time * 3 + f.phase) * 0.1;
        f.mesh.scale.setScalar(scale);
      });

      // Animate lightning
      lightnings.forEach(l => {
        if (time > l.nextFlash) {
          // Flash on
          l.mat.opacity = 0.6 + Math.random() * 0.4;

          // Randomize lightning path
          const positions = l.geo.attributes.position.array;
          for (let i = 0; i <= l.segments; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 0.3 * Math.sin(i / l.segments * Math.PI);
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
          }
          l.geo.attributes.position.needsUpdate = true;

          l.nextFlash = time + 0.05 + Math.random() * 0.1;

          // Schedule fade out
          setTimeout(() => {
            l.mat.opacity *= 0.5;
            setTimeout(() => {
              l.mat.opacity = 0;
              l.nextFlash = time + 1 + Math.random() * 3;
            }, 50);
          }, 30);
        }
      });

      // Subtle beam sway
      beamGroup.rotation.z = Math.sin(time * 0.5) * 0.01;
      beamGroup.position.x = 3 + Math.sin(time * 0.3) * 0.05;

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
