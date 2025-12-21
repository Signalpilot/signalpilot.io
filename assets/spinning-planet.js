/**
 * Spinning Planet Animation v6 - EXTREME
 * Heavy bloom, neon glow, dramatic effects
 */

(function() {
  'use strict';

  function initPlanet() {
    if (typeof THREE === 'undefined') {
      setTimeout(initPlanet, 100);
      return;
    }

    const container = document.getElementById('planet-container');
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 3.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    container.appendChild(renderer.domElement);

    // Add CSS glow filter to canvas for extra bloom
    renderer.domElement.style.filter = 'contrast(1.1) saturate(1.2)';

    const planetGroup = new THREE.Group();
    planetGroup.rotation.x = 0.2;
    scene.add(planetGroup);

    // ============================================
    // GLOWING PLANET CORE
    // ============================================
    const planetGeo = new THREE.SphereGeometry(1, 128, 128);

    const planetMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          // Deep dark core
          vec3 core = vec3(0.008, 0.015, 0.04);

          // Pulsing energy lines
          float latLines = 10.0;
          float lonLines = 20.0;

          float lat = abs(fract(vUv.y * latLines + time * 0.02) - 0.5) * 2.0;
          float latLine = pow(1.0 - lat, 20.0);

          float lon = abs(fract(vUv.x * lonLines - time * 0.01) - 0.5) * 2.0;
          float lonLine = pow(1.0 - lon, 25.0);

          float grid = (latLine + lonLine) * 0.8;

          // Fresnel glow
          vec3 viewDir = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);

          // Colors
          vec3 gridColor = vec3(0.0, 0.6, 1.0);
          vec3 edgeColor = vec3(0.2, 0.5, 1.0);

          vec3 final = core;
          final += gridColor * grid * 0.6;
          final += edgeColor * fresnel * 0.8;

          gl_FragColor = vec4(final, 0.9 + fresnel * 0.1);
        }
      `,
      transparent: true
    });

    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // ============================================
    // INTENSE ATMOSPHERE LAYERS
    // ============================================

    // Inner glow
    const innerGlowGeo = new THREE.SphereGeometry(1.01, 64, 64);
    const innerGlowMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.75 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          vec3 color = vec3(0.0, 0.7, 1.0);
          gl_FragColor = vec4(color * 2.0, intensity);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    planetGroup.add(new THREE.Mesh(innerGlowGeo, innerGlowMat));

    // Outer glow
    const outerGlowGeo = new THREE.SphereGeometry(1.15, 32, 32);
    const outerGlowMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 1.5);
          vec3 color = vec3(0.1, 0.4, 0.9);
          gl_FragColor = vec4(color, intensity * 0.5);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    planetGroup.add(new THREE.Mesh(outerGlowGeo, outerGlowMat));

    // ============================================
    // NEON RING SYSTEM - EXTREME GLOW
    // ============================================
    function createNeonRing(radius, tiltX, tiltZ, color, intensity) {
      const ringGroup = new THREE.Group();

      // Core ring - bright
      const coreGeo = new THREE.TorusGeometry(radius, 0.015, 16, 200);
      const coreMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1.0
      });
      ringGroup.add(new THREE.Mesh(coreGeo, coreMat));

      // Glow layer 1
      const glow1Geo = new THREE.TorusGeometry(radius, 0.04, 16, 150);
      const glow1Mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.5 * intensity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      ringGroup.add(new THREE.Mesh(glow1Geo, glow1Mat));

      // Glow layer 2
      const glow2Geo = new THREE.TorusGeometry(radius, 0.08, 16, 100);
      const glow2Mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.25 * intensity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      ringGroup.add(new THREE.Mesh(glow2Geo, glow2Mat));

      // Glow layer 3 - wide bloom
      const glow3Geo = new THREE.TorusGeometry(radius, 0.15, 16, 80);
      const glow3Mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.1 * intensity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      ringGroup.add(new THREE.Mesh(glow3Geo, glow3Mat));

      ringGroup.rotation.x = tiltX;
      ringGroup.rotation.z = tiltZ;

      return ringGroup;
    }

    // CYAN RING - main
    const ring1 = createNeonRing(1.35, Math.PI / 2.1, 0.25, 0x00ffff, 1.2);
    scene.add(ring1);

    // MAGENTA RING
    const ring2 = createNeonRing(1.55, Math.PI / 2.3, -0.2, 0xff0080, 1.0);
    scene.add(ring2);

    // PURPLE RING - outer
    const ring3 = createNeonRing(1.75, Math.PI / 2.5, 0.1, 0x8844ff, 0.7);
    scene.add(ring3);

    // ============================================
    // BRIGHT DATA POINTS
    // ============================================
    const dotsGroup = new THREE.Group();
    const dotColors = [0x00ffff, 0xff0080, 0x00ff66, 0xffaa00];

    for (let i = 0; i < 40; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / 40);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      if (Math.random() > 0.5) continue;

      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.sin(phi) * Math.sin(theta);
      const z = Math.cos(phi);

      const color = dotColors[Math.floor(Math.random() * dotColors.length)];

      // Bright core
      const dotGeo = new THREE.SphereGeometry(0.015, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(x * 1.01, y * 1.01, z * 1.01);

      // Glow
      const glowGeo = new THREE.SphereGeometry(0.04, 6, 6);
      const glowMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      dot.add(glow);

      dot.userData.pulseOffset = Math.random() * Math.PI * 2;
      dot.userData.baseScale = 0.8 + Math.random() * 0.4;
      dotsGroup.add(dot);
    }
    planetGroup.add(dotsGroup);

    // ============================================
    // FAST TRAVELING PARTICLES
    // ============================================
    const particles = [];

    function createBrightParticle(radius, tiltX, tiltZ, color) {
      const group = new THREE.Group();

      // Bright core
      const coreGeo = new THREE.SphereGeometry(0.03, 12, 12);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      group.add(new THREE.Mesh(coreGeo, coreMat));

      // Color glow
      const glow1Geo = new THREE.SphereGeometry(0.06, 8, 8);
      const glow1Mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      group.add(new THREE.Mesh(glow1Geo, glow1Mat));

      // Outer glow
      const glow2Geo = new THREE.SphereGeometry(0.12, 6, 6);
      const glow2Mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      group.add(new THREE.Mesh(glow2Geo, glow2Mat));

      group.userData = {
        angle: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.3,
        radius: radius,
        tiltX: tiltX,
        tiltZ: tiltZ
      };

      return group;
    }

    // Cyan particles
    for (let i = 0; i < 3; i++) {
      const p = createBrightParticle(1.35, Math.PI / 2.1, 0.25, 0x00ffff);
      p.userData.angle = i * (Math.PI * 2 / 3);
      scene.add(p);
      particles.push(p);
    }

    // Magenta particles
    for (let i = 0; i < 2; i++) {
      const p = createBrightParticle(1.55, Math.PI / 2.3, -0.2, 0xff0080);
      p.userData.angle = i * Math.PI;
      scene.add(p);
      particles.push(p);
    }

    // ============================================
    // SPARKLE STARS
    // ============================================
    const starsGeo = new THREE.BufferGeometry();
    const starPositions = [];
    const starColors = [];

    for (let i = 0; i < 200; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const dist = 4 + Math.random() * 10;

      starPositions.push(
        dist * Math.sin(phi) * Math.cos(theta),
        dist * Math.sin(phi) * Math.sin(theta),
        dist * Math.cos(phi)
      );

      // Random colors - some white, some colored
      const colorChoice = Math.random();
      if (colorChoice > 0.7) {
        starColors.push(0.5, 1.0, 1.0); // Cyan tint
      } else if (colorChoice > 0.5) {
        starColors.push(1.0, 0.5, 0.8); // Pink tint
      } else {
        const b = 0.7 + Math.random() * 0.3;
        starColors.push(b, b, b); // White
      }
    }

    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    starsGeo.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

    const starsMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    scene.add(new THREE.Points(starsGeo, starsMat));

    // ============================================
    // ANIMATION
    // ============================================
    let animationId;
    const clock = new THREE.Clock();

    function animate() {
      animationId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Fast planet spin
        planetGroup.rotation.y = t * 0.4;

        // Update shader
        planetMat.uniforms.time.value = t;

        // Ring rotation
        ring1.rotation.z = 0.25 + t * 0.03;
        ring2.rotation.z = -0.2 - t * 0.02;
        ring3.rotation.z = 0.1 + t * 0.015;

        // Particles - fast movement
        particles.forEach(p => {
          p.userData.angle += p.userData.speed * 0.02;
          const a = p.userData.angle;
          const r = p.userData.radius;

          // Calculate position
          let x = Math.cos(a) * r;
          let y = 0;
          let z = Math.sin(a) * r;

          // Apply tilts
          const cosX = Math.cos(p.userData.tiltX);
          const sinX = Math.sin(p.userData.tiltX);
          const cosZ = Math.cos(p.userData.tiltZ);
          const sinZ = Math.sin(p.userData.tiltZ);

          const y1 = y * cosX - z * sinX;
          const z1 = y * sinX + z * cosX;
          const x2 = x * cosZ - y1 * sinZ;
          const y2 = x * sinZ + y1 * cosZ;

          p.position.set(x2, y2, z1);
        });

        // Pulse dots
        dotsGroup.children.forEach((dot, i) => {
          const pulse = Math.sin(t * 3 + dot.userData.pulseOffset);
          const scale = dot.userData.baseScale * (0.8 + pulse * 0.4);
          dot.scale.setScalar(scale);
        });
      }

      renderer.render(scene, camera);
    }

    animate();

    // Resize
    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    window.addEventListener('resize', onResize);

    window.cleanupPlanet = function() {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlanet);
  } else {
    initPlanet();
  }
})();
