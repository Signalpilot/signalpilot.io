/**
 * Spinning Planet Animation v4
 * Clean, realistic, subtle - inspired by TradingView
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

    const scene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0.1, 3.8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const planetGroup = new THREE.Group();
    planetGroup.rotation.x = 0.15;
    planetGroup.rotation.z = -0.1;
    scene.add(planetGroup);

    // ============================================
    // PLANET - dark with subtle grid
    // ============================================
    const planetGeo = new THREE.SphereGeometry(1, 64, 64);

    const planetMat = new THREE.ShaderMaterial({
      uniforms: {},
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
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          // Dark base colors
          vec3 dark = vec3(0.02, 0.05, 0.12);
          vec3 mid = vec3(0.04, 0.08, 0.18);

          float gradient = smoothstep(-1.0, 1.0, vPosition.y);
          vec3 base = mix(dark, mid, gradient * 0.6);

          // Subtle latitude lines
          float latLines = 10.0;
          float lat = abs(fract(vUv.y * latLines) - 0.5) * 2.0;
          float latLine = smoothstep(0.02, 0.0, lat) * 0.25;

          // Subtle longitude lines
          float lonLines = 20.0;
          float lon = abs(fract(vUv.x * lonLines) - 0.5) * 2.0;
          float lonLine = smoothstep(0.015, 0.0, lon) * 0.2;

          float grid = max(latLine, lonLine);

          // Edge glow
          vec3 viewDir = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.5);

          vec3 gridColor = vec3(0.15, 0.4, 0.7);
          vec3 edgeColor = vec3(0.1, 0.5, 0.9);

          vec3 final = base + gridColor * grid;
          final = mix(final, edgeColor, fresnel * 0.35);

          gl_FragColor = vec4(final, 0.92);
        }
      `,
      transparent: true
    });

    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // Subtle atmosphere
    const atmosGeo = new THREE.SphereGeometry(1.05, 32, 32);
    const atmosMat = new THREE.ShaderMaterial({
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
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          vec3 color = vec3(0.1, 0.4, 0.8);
          gl_FragColor = vec4(color * intensity, intensity * 0.4);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    planetGroup.add(new THREE.Mesh(atmosGeo, atmosMat));

    // ============================================
    // SMALL DATA DOTS on surface (instead of big candlesticks)
    // ============================================
    const dotsGroup = new THREE.Group();

    // Fibonacci sphere distribution for even spacing
    const numDots = 60;
    const colors = [0x00ddff, 0xff4477, 0x44ff88];

    for (let i = 0; i < numDots; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / numDots);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      // Skip some randomly for organic look
      if (Math.random() > 0.5) continue;

      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.sin(phi) * Math.sin(theta);
      const z = Math.cos(phi);

      const size = 0.008 + Math.random() * 0.012;
      const dotGeo = new THREE.SphereGeometry(size, 6, 6);
      const color = colors[Math.floor(Math.random() * colors.length)];
      const dotMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.7 + Math.random() * 0.3
      });

      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(x * 1.005, y * 1.005, z * 1.005);
      dot.userData.baseOpacity = dotMat.opacity;
      dot.userData.pulseOffset = Math.random() * Math.PI * 2;
      dotsGroup.add(dot);
    }
    planetGroup.add(dotsGroup);

    // ============================================
    // TWO CLEAN ORBITAL RINGS
    // ============================================
    function createRing(radius, tiltX, tiltZ, color, opacity) {
      const ringGroup = new THREE.Group();

      // Main ring
      const geo = new THREE.TorusGeometry(radius, 0.006, 16, 120);
      const mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity
      });
      ringGroup.add(new THREE.Mesh(geo, mat));

      // Subtle glow
      const glowGeo = new THREE.TorusGeometry(radius, 0.025, 16, 80);
      const glowMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity * 0.25,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      ringGroup.add(new THREE.Mesh(glowGeo, glowMat));

      ringGroup.rotation.x = tiltX;
      ringGroup.rotation.z = tiltZ;

      return ringGroup;
    }

    // Cyan ring
    const ring1 = createRing(1.45, Math.PI / 2.2, 0.2, 0x00ddff, 0.7);
    scene.add(ring1);

    // Magenta/pink ring
    const ring2 = createRing(1.65, Math.PI / 2.4, -0.15, 0xff4477, 0.5);
    scene.add(ring2);

    // ============================================
    // FEW TRAVELING PARTICLES
    // ============================================
    const particles = [];

    function createParticle(ring, color) {
      const geo = new THREE.SphereGeometry(0.015, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.9
      });
      const particle = new THREE.Mesh(geo, mat);

      // Small glow
      const glowGeo = new THREE.SphereGeometry(0.035, 6, 6);
      const glowMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      particle.add(new THREE.Mesh(glowGeo, glowMat));

      particle.userData = {
        angle: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.1,
        ring: ring
      };

      return particle;
    }

    // 2 particles on cyan ring
    for (let i = 0; i < 2; i++) {
      const p = createParticle(ring1, 0x00ffff);
      p.userData.angle = i * Math.PI;
      scene.add(p);
      particles.push(p);
    }

    // 1 particle on pink ring
    const p2 = createParticle(ring2, 0xff4477);
    scene.add(p2);
    particles.push(p2);

    // ============================================
    // SPARSE BACKGROUND STARS
    // ============================================
    const starsGeo = new THREE.BufferGeometry();
    const positions = [];

    for (let i = 0; i < 100; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const dist = 8 + Math.random() * 12;

      positions.push(
        dist * Math.sin(phi) * Math.cos(theta),
        dist * Math.sin(phi) * Math.sin(theta),
        dist * Math.cos(phi)
      );
    }

    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const starsMat = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xffffff,
      transparent: true,
      opacity: 0.6
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
        // Fast planet rotation (like TradingView)
        planetGroup.rotation.y = t * 0.3;

        // Ring rotation
        ring1.rotation.z = 0.2 + t * 0.015;
        ring2.rotation.z = -0.15 - t * 0.01;

        // Move particles along rings
        particles.forEach(p => {
          p.userData.angle += p.userData.speed * 0.01;
          const a = p.userData.angle;
          const ring = p.userData.ring;

          // Get ring radius from its first child (the torus)
          const radius = ring.children[0].geometry.parameters.radius;

          // Local position on ring
          const x = Math.cos(a) * radius;
          const z = Math.sin(a) * radius;

          // Apply ring's rotation
          const pos = new THREE.Vector3(x, 0, z);
          pos.applyEuler(ring.rotation);

          p.position.copy(pos);
        });

        // Subtle dot pulsing
        dotsGroup.children.forEach(dot => {
          const pulse = Math.sin(t * 1.5 + dot.userData.pulseOffset) * 0.5 + 0.5;
          dot.material.opacity = dot.userData.baseOpacity * (0.5 + pulse * 0.5);
        });
      }

      renderer.render(scene, camera);
    }

    animate();

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
