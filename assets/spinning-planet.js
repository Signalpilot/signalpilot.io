/**
 * Spinning Planet Animation
 * A TradingView-inspired 3D globe with orbital rings and candlestick patterns
 */

(function() {
  'use strict';

  // Wait for Three.js to load
  function initPlanet() {
    if (typeof THREE === 'undefined') {
      setTimeout(initPlanet, 100);
      return;
    }

    const container = document.getElementById('planet-container');
    if (!container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene setup
    const scene = new THREE.Scene();

    // Get container dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Planet group for rotation
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    // Planet sphere with gradient material
    const planetGeometry = new THREE.SphereGeometry(1, 64, 64);

    // Create shader material for gradient planet
    const planetMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x0a1628) },
        color2: { value: new THREE.Color(0x1a3a5c) },
        glowColor: { value: new THREE.Color(0x5b8aff) }
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
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 glowColor;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          // Gradient based on position
          float gradient = smoothstep(-1.0, 1.0, vPosition.y);
          vec3 baseColor = mix(color1, color2, gradient);

          // Fresnel effect for edge glow
          vec3 viewDir = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - dot(vNormal, viewDir), 3.0);

          // Add subtle grid pattern
          float gridX = smoothstep(0.48, 0.5, abs(fract(vUv.x * 20.0) - 0.5));
          float gridY = smoothstep(0.48, 0.5, abs(fract(vUv.y * 10.0) - 0.5));
          float grid = max(gridX, gridY) * 0.15;

          vec3 finalColor = baseColor + grid * glowColor;
          finalColor = mix(finalColor, glowColor, fresnel * 0.5);

          gl_FragColor = vec4(finalColor, 0.95);
        }
      `,
      transparent: true
    });

    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planetGroup.add(planet);

    // Create dots on the planet surface (like TradingView)
    const dotsGroup = new THREE.Group();
    const dotGeometry = new THREE.SphereGeometry(0.015, 8, 8);

    // Create dots in a grid pattern
    for (let lat = -80; lat <= 80; lat += 15) {
      const latRad = lat * Math.PI / 180;
      const circumference = Math.cos(latRad);
      const dotsInRing = Math.floor(24 * circumference);

      for (let i = 0; i < dotsInRing; i++) {
        const lonRad = (i / dotsInRing) * Math.PI * 2;

        // Convert spherical to cartesian
        const x = Math.cos(latRad) * Math.cos(lonRad) * 1.01;
        const y = Math.sin(latRad) * 1.01;
        const z = Math.cos(latRad) * Math.sin(lonRad) * 1.01;

        // Random chance to show dot (creates sparse pattern)
        if (Math.random() > 0.6) {
          const isBright = Math.random() > 0.7;
          const dotColor = isBright
            ? new THREE.Color(0x76ddff) // Cyan for bright dots
            : new THREE.Color(0x5b8aff).multiplyScalar(0.5); // Dimmer blue

          const dotMaterial = new THREE.MeshBasicMaterial({
            color: dotColor,
            transparent: true,
            opacity: isBright ? 1 : 0.6
          });

          const dot = new THREE.Mesh(dotGeometry, dotMaterial);
          dot.position.set(x, y, z);
          dotsGroup.add(dot);
        }
      }
    }
    planetGroup.add(dotsGroup);

    // Create candlestick bars on surface
    const candlesGroup = new THREE.Group();
    const candlePositions = [
      { lat: 20, lon: 30, height: 0.15, color: 0xff4976 },   // Red
      { lat: 25, lon: 35, height: 0.25, color: 0x3ed598 },   // Green
      { lat: 30, lon: 40, height: 0.18, color: 0xff4976 },   // Red
      { lat: 22, lon: 50, height: 0.3, color: 0x3ed598 },    // Green
      { lat: 27, lon: 55, height: 0.12, color: 0x3ed598 },   // Green
      { lat: -10, lon: 120, height: 0.22, color: 0xff4976 }, // Red
      { lat: -15, lon: 125, height: 0.28, color: 0x3ed598 }, // Green
      { lat: -8, lon: 130, height: 0.16, color: 0xff4976 },  // Red
      { lat: -12, lon: 140, height: 0.35, color: 0x3ed598 }, // Green
      { lat: 45, lon: -60, height: 0.2, color: 0xff4976 },   // Red
      { lat: 40, lon: -55, height: 0.32, color: 0x3ed598 },  // Green
      { lat: 50, lon: -50, height: 0.14, color: 0x3ed598 },  // Green
    ];

    candlePositions.forEach(candle => {
      const latRad = candle.lat * Math.PI / 180;
      const lonRad = candle.lon * Math.PI / 180;

      // Position on sphere surface
      const x = Math.cos(latRad) * Math.cos(lonRad);
      const y = Math.sin(latRad);
      const z = Math.cos(latRad) * Math.sin(lonRad);

      // Create candlestick
      const candleGeom = new THREE.BoxGeometry(0.02, candle.height, 0.02);
      const candleMat = new THREE.MeshBasicMaterial({
        color: candle.color,
        transparent: true,
        opacity: 0.9
      });
      const candleMesh = new THREE.Mesh(candleGeom, candleMat);

      // Position and orient the candle
      candleMesh.position.set(x * 1.02, y * 1.02, z * 1.02);
      candleMesh.lookAt(0, 0, 0);
      candleMesh.rotateX(Math.PI / 2);
      candleMesh.translateY(candle.height / 2);

      candlesGroup.add(candleMesh);
    });
    planetGroup.add(candlesGroup);

    // Atmospheric glow
    const glowGeometry = new THREE.SphereGeometry(1.15, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x5b8aff) },
        viewVector: { value: camera.position }
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(0.6 - dot(vNormal, vNormel), 2.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, intensity * 0.5);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    planetGroup.add(glowMesh);

    // Orbital rings
    function createRing(radius, color, tiltX, tiltZ, opacity) {
      const ringGeometry = new THREE.TorusGeometry(radius, 0.008, 16, 100);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = tiltX;
      ring.rotation.z = tiltZ;
      return ring;
    }

    // Main orbital ring (cyan, tilted)
    const ring1 = createRing(1.5, 0x76ddff, Math.PI / 2.5, 0.2, 0.8);
    scene.add(ring1);

    // Second ring (magenta/pink, different tilt)
    const ring2 = createRing(1.7, 0xff4976, Math.PI / 2.2, -0.3, 0.5);
    scene.add(ring2);

    // Third subtle ring
    const ring3 = createRing(1.9, 0x5b8aff, Math.PI / 2.8, 0.1, 0.3);
    scene.add(ring3);

    // Add traveling particles on rings
    const particlesOnRing = [];
    for (let i = 0; i < 8; i++) {
      const particleGeom = new THREE.SphereGeometry(0.02, 8, 8);
      const particleMat = new THREE.MeshBasicMaterial({
        color: i < 4 ? 0x76ddff : 0xff4976,
        transparent: true,
        opacity: 0.9
      });
      const particle = new THREE.Mesh(particleGeom, particleMat);
      particle.userData = {
        angle: (i / 8) * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.2,
        radius: i < 4 ? 1.5 : 1.7,
        tiltX: i < 4 ? Math.PI / 2.5 : Math.PI / 2.2,
        tiltZ: i < 4 ? 0.2 : -0.3
      };
      scene.add(particle);
      particlesOnRing.push(particle);
    }

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Point light
    const pointLight = new THREE.PointLight(0x5b8aff, 1, 10);
    pointLight.position.set(2, 2, 3);
    scene.add(pointLight);

    // Animation
    let animationId;
    const clock = new THREE.Clock();

    function animate() {
      animationId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Rotate planet
        planetGroup.rotation.y = elapsed * 0.1;

        // Subtle wobble
        planetGroup.rotation.x = Math.sin(elapsed * 0.2) * 0.05;

        // Rotate rings at different speeds
        ring1.rotation.z = 0.2 + elapsed * 0.05;
        ring2.rotation.z = -0.3 - elapsed * 0.03;
        ring3.rotation.z = 0.1 + elapsed * 0.02;

        // Animate particles along rings
        particlesOnRing.forEach(particle => {
          particle.userData.angle += particle.userData.speed * 0.01;
          const angle = particle.userData.angle;
          const radius = particle.userData.radius;

          // Calculate position on tilted ring
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius * Math.cos(particle.userData.tiltX);
          const z = Math.sin(angle) * radius * Math.sin(particle.userData.tiltX);

          // Apply tilt
          particle.position.x = x * Math.cos(particle.userData.tiltZ) - y * Math.sin(particle.userData.tiltZ);
          particle.position.y = x * Math.sin(particle.userData.tiltZ) + y * Math.cos(particle.userData.tiltZ);
          particle.position.z = z;

          // Pulse opacity
          particle.material.opacity = 0.5 + Math.sin(elapsed * 3 + particle.userData.angle) * 0.4;
        });

        // Update shader time
        planetMaterial.uniforms.time.value = elapsed;
      }

      renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    function onResize() {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    }

    window.addEventListener('resize', onResize);

    // Cleanup function
    window.cleanupPlanet = function() {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlanet);
  } else {
    initPlanet();
  }
})();
