/**
 * Spinning Planet Animation v2
 * TradingView-inspired 3D globe with glowing orbital rings and candlesticks
 * Much improved version with better glow, grid, and visual effects
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

    // Scene
    const scene = new THREE.Scene();

    // Dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Camera - closer for more drama
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0.3, 3.2);

    // Renderer with better settings
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Planet group
    const planetGroup = new THREE.Group();
    planetGroup.rotation.x = 0.15; // Slight tilt
    planetGroup.rotation.z = -0.1;
    scene.add(planetGroup);

    // ============================================
    // PLANET SPHERE with visible grid
    // ============================================
    const planetGeometry = new THREE.SphereGeometry(1, 64, 64);

    const planetMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor1: { value: new THREE.Color(0x0a1a2e) },
        baseColor2: { value: new THREE.Color(0x1a3a5c) },
        gridColor: { value: new THREE.Color(0x4a9eff) },
        glowColor: { value: new THREE.Color(0x00d4ff) }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        varying vec3 vWorldPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 baseColor1;
        uniform vec3 baseColor2;
        uniform vec3 gridColor;
        uniform vec3 glowColor;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        varying vec3 vWorldPosition;

        void main() {
          // Base gradient
          float gradient = smoothstep(-1.0, 1.0, vPosition.y);
          vec3 baseColor = mix(baseColor1, baseColor2, gradient * 0.7 + 0.15);

          // VISIBLE GRID LINES - latitude and longitude
          float latLines = 12.0;
          float lonLines = 24.0;

          // Latitude lines (horizontal)
          float lat = abs(fract(vUv.y * latLines) - 0.5) * 2.0;
          float latLine = 1.0 - smoothstep(0.0, 0.08, lat);

          // Longitude lines (vertical)
          float lon = abs(fract(vUv.x * lonLines) - 0.5) * 2.0;
          float lonLine = 1.0 - smoothstep(0.0, 0.06, lon);

          // Combine grid
          float grid = max(latLine, lonLine) * 0.6;

          // Fresnel edge glow
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.5);

          // Compose final color
          vec3 finalColor = baseColor;
          finalColor += gridColor * grid * 0.5;
          finalColor = mix(finalColor, glowColor, fresnel * 0.7);

          // Atmosphere fade at edges
          float alpha = 0.85 + fresnel * 0.15;

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.FrontSide
    });

    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planetGroup.add(planet);

    // ============================================
    // GLOWING ATMOSPHERE - multiple layers
    // ============================================
    function createAtmosphere(size, color, intensity) {
      const geo = new THREE.SphereGeometry(size, 32, 32);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          glowColor: { value: new THREE.Color(color) },
          intensity: { value: intensity }
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPositionNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 glowColor;
          uniform float intensity;
          varying vec3 vNormal;
          varying vec3 vPositionNormal;
          void main() {
            float strength = pow(0.65 - dot(vNormal, vPositionNormal), 2.0);
            vec3 glow = glowColor * strength * intensity;
            gl_FragColor = vec4(glow, strength * 0.8);
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
      });
      return new THREE.Mesh(geo, mat);
    }

    // Inner glow (cyan)
    const atmosphere1 = createAtmosphere(1.12, 0x00d4ff, 1.5);
    planetGroup.add(atmosphere1);

    // Outer glow (blue)
    const atmosphere2 = createAtmosphere(1.25, 0x4a9eff, 0.8);
    planetGroup.add(atmosphere2);

    // ============================================
    // SURFACE DOTS - scattered data points
    // ============================================
    const dotsGroup = new THREE.Group();
    const dotColors = [0x00ffff, 0xff4976, 0x3ed598, 0x4a9eff, 0xff6b9d];

    for (let i = 0; i < 120; i++) {
      // Random position on sphere using fibonacci
      const phi = Math.acos(1 - 2 * (i + 0.5) / 120);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.sin(phi) * Math.sin(theta);
      const z = Math.cos(phi);

      // Randomly skip some dots
      if (Math.random() > 0.5) continue;

      const dotSize = 0.012 + Math.random() * 0.015;
      const dotGeo = new THREE.SphereGeometry(dotSize, 6, 6);
      const dotColor = dotColors[Math.floor(Math.random() * dotColors.length)];
      const dotMat = new THREE.MeshBasicMaterial({
        color: dotColor,
        transparent: true,
        opacity: 0.7 + Math.random() * 0.3
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(x * 1.01, y * 1.01, z * 1.01);
      dot.userData.baseOpacity = dot.material.opacity;
      dot.userData.pulseOffset = Math.random() * Math.PI * 2;
      dotsGroup.add(dot);
    }
    planetGroup.add(dotsGroup);

    // ============================================
    // CANDLESTICKS - trading bars on surface
    // ============================================
    const candlesGroup = new THREE.Group();

    // More candlesticks in visible clusters
    const candleData = [
      // Front-facing cluster
      { lat: 15, lon: 20, h: 0.18, c: 0xff4976 },
      { lat: 20, lon: 28, h: 0.28, c: 0x3ed598 },
      { lat: 25, lon: 35, h: 0.15, c: 0xff4976 },
      { lat: 18, lon: 42, h: 0.35, c: 0x3ed598 },
      { lat: 22, lon: 50, h: 0.22, c: 0x3ed598 },
      { lat: 28, lon: 55, h: 0.12, c: 0xff4976 },
      // Upper cluster
      { lat: 45, lon: -30, h: 0.25, c: 0x3ed598 },
      { lat: 50, lon: -22, h: 0.18, c: 0xff4976 },
      { lat: 42, lon: -15, h: 0.32, c: 0x3ed598 },
      { lat: 48, lon: -8, h: 0.14, c: 0xff4976 },
      // Right side cluster
      { lat: -5, lon: 80, h: 0.2, c: 0x3ed598 },
      { lat: -10, lon: 88, h: 0.28, c: 0xff4976 },
      { lat: -2, lon: 95, h: 0.16, c: 0x3ed598 },
      { lat: -15, lon: 100, h: 0.24, c: 0x3ed598 },
      // Lower cluster
      { lat: -35, lon: 45, h: 0.22, c: 0xff4976 },
      { lat: -40, lon: 52, h: 0.3, c: 0x3ed598 },
      { lat: -32, lon: 60, h: 0.18, c: 0x3ed598 },
    ];

    candleData.forEach(c => {
      const latRad = c.lat * Math.PI / 180;
      const lonRad = c.lon * Math.PI / 180;

      const x = Math.cos(latRad) * Math.cos(lonRad);
      const y = Math.sin(latRad);
      const z = Math.cos(latRad) * Math.sin(lonRad);

      // Candle body
      const bodyGeo = new THREE.BoxGeometry(0.025, c.h, 0.025);
      const bodyMat = new THREE.MeshBasicMaterial({
        color: c.c,
        transparent: true,
        opacity: 0.95
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);

      // Position and orient
      body.position.set(x * 1.01, y * 1.01, z * 1.01);
      body.lookAt(0, 0, 0);
      body.rotateX(Math.PI / 2);
      body.translateY(c.h / 2);

      // Add wick
      const wickGeo = new THREE.BoxGeometry(0.006, c.h * 0.4, 0.006);
      const wickMat = new THREE.MeshBasicMaterial({ color: c.c, opacity: 0.7, transparent: true });
      const wick = new THREE.Mesh(wickGeo, wickMat);
      wick.position.y = c.h / 2 + c.h * 0.2;
      body.add(wick);

      // Glow effect for candle
      const glowGeo = new THREE.BoxGeometry(0.05, c.h * 1.2, 0.05);
      const glowMat = new THREE.MeshBasicMaterial({
        color: c.c,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      body.add(glow);

      candlesGroup.add(body);
    });
    planetGroup.add(candlesGroup);

    // ============================================
    // ORBITAL RINGS - with glow effect
    // ============================================
    function createGlowingRing(radius, tiltX, tiltZ, color, thickness, glowIntensity) {
      const ringGroup = new THREE.Group();

      // Core ring
      const coreGeo = new THREE.TorusGeometry(radius, thickness, 16, 150);
      const coreMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.9
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      ringGroup.add(core);

      // Inner glow
      const glow1Geo = new THREE.TorusGeometry(radius, thickness * 3, 16, 100);
      const glow1Mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3 * glowIntensity,
        blending: THREE.AdditiveBlending
      });
      const glow1 = new THREE.Mesh(glow1Geo, glow1Mat);
      ringGroup.add(glow1);

      // Outer glow
      const glow2Geo = new THREE.TorusGeometry(radius, thickness * 8, 16, 100);
      const glow2Mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.12 * glowIntensity,
        blending: THREE.AdditiveBlending
      });
      const glow2 = new THREE.Mesh(glow2Geo, glow2Mat);
      ringGroup.add(glow2);

      ringGroup.rotation.x = tiltX;
      ringGroup.rotation.z = tiltZ;

      return ringGroup;
    }

    // Main cyan ring
    const ring1 = createGlowingRing(1.6, Math.PI / 2.3, 0.25, 0x00ffff, 0.008, 1.2);
    scene.add(ring1);

    // Magenta/pink ring
    const ring2 = createGlowingRing(1.85, Math.PI / 2.1, -0.2, 0xff4976, 0.006, 1.0);
    scene.add(ring2);

    // Subtle blue outer ring
    const ring3 = createGlowingRing(2.1, Math.PI / 2.5, 0.1, 0x4a9eff, 0.005, 0.6);
    scene.add(ring3);

    // ============================================
    // RING PARTICLES - traveling lights
    // ============================================
    const ringParticles = [];

    function createRingParticle(radius, tiltX, tiltZ, color, startAngle, speed) {
      const particleGeo = new THREE.SphereGeometry(0.025, 8, 8);
      const particleMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1
      });
      const particle = new THREE.Mesh(particleGeo, particleMat);

      // Glow around particle
      const glowGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      particle.add(glow);

      particle.userData = {
        angle: startAngle,
        speed: speed,
        radius: radius,
        tiltX: tiltX,
        tiltZ: tiltZ
      };
      return particle;
    }

    // Particles on cyan ring
    for (let i = 0; i < 4; i++) {
      const p = createRingParticle(1.6, Math.PI / 2.3, 0.25, 0x00ffff, i * Math.PI / 2, 0.4);
      scene.add(p);
      ringParticles.push(p);
    }

    // Particles on magenta ring
    for (let i = 0; i < 3; i++) {
      const p = createRingParticle(1.85, Math.PI / 2.1, -0.2, 0xff4976, i * Math.PI * 2 / 3, 0.3);
      scene.add(p);
      ringParticles.push(p);
    }

    // ============================================
    // BACKGROUND STARS
    // ============================================
    const starsGroup = new THREE.Group();
    for (let i = 0; i < 200; i++) {
      const starGeo = new THREE.SphereGeometry(0.008 + Math.random() * 0.012, 4, 4);
      const brightness = 0.3 + Math.random() * 0.7;
      const starMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(brightness, brightness, brightness * 1.1),
        transparent: true,
        opacity: 0.4 + Math.random() * 0.6
      });
      const star = new THREE.Mesh(starGeo, starMat);

      // Random position in a sphere around the scene
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const dist = 5 + Math.random() * 8;

      star.position.x = dist * Math.sin(phi) * Math.cos(theta);
      star.position.y = dist * Math.sin(phi) * Math.sin(theta);
      star.position.z = dist * Math.cos(phi);

      star.userData.twinkleOffset = Math.random() * Math.PI * 2;
      star.userData.twinkleSpeed = 1 + Math.random() * 2;
      star.userData.baseOpacity = star.material.opacity;

      starsGroup.add(star);
    }
    scene.add(starsGroup);

    // ============================================
    // LIGHTING
    // ============================================
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00d4ff, 1.5, 20);
    pointLight1.position.set(3, 2, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff4976, 0.5, 15);
    pointLight2.position.set(-3, -1, 2);
    scene.add(pointLight2);

    // ============================================
    // ANIMATION LOOP
    // ============================================
    let animationId;
    const clock = new THREE.Clock();

    function animate() {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Rotate planet slowly
        planetGroup.rotation.y = elapsed * 0.08;

        // Subtle bobbing
        planetGroup.position.y = Math.sin(elapsed * 0.5) * 0.02;

        // Rotate rings at different speeds
        ring1.rotation.z = 0.25 + elapsed * 0.04;
        ring2.rotation.z = -0.2 - elapsed * 0.025;
        ring3.rotation.z = 0.1 + elapsed * 0.015;

        // Animate ring particles
        ringParticles.forEach(p => {
          p.userData.angle += p.userData.speed * 0.015;
          const a = p.userData.angle;
          const r = p.userData.radius;

          // Position on tilted ring
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r;

          // Apply tilt transformations
          const cosX = Math.cos(p.userData.tiltX);
          const sinX = Math.sin(p.userData.tiltX);
          const cosZ = Math.cos(p.userData.tiltZ);
          const sinZ = Math.sin(p.userData.tiltZ);

          // Transform position
          const y2 = y * cosX;
          const z2 = y * sinX;

          p.position.x = x * cosZ - y2 * sinZ;
          p.position.y = x * sinZ + y2 * cosZ;
          p.position.z = z2;

          // Pulse effect
          p.material.opacity = 0.6 + Math.sin(elapsed * 4 + p.userData.angle) * 0.4;
        });

        // Twinkle stars
        starsGroup.children.forEach(star => {
          const twinkle = Math.sin(elapsed * star.userData.twinkleSpeed + star.userData.twinkleOffset);
          star.material.opacity = star.userData.baseOpacity * (0.5 + twinkle * 0.5);
        });

        // Pulse surface dots
        dotsGroup.children.forEach(dot => {
          const pulse = Math.sin(elapsed * 2 + dot.userData.pulseOffset);
          dot.material.opacity = dot.userData.baseOpacity * (0.7 + pulse * 0.3);
        });

        // Update planet shader
        planetMaterial.uniforms.time.value = elapsed;
      }

      renderer.render(scene, camera);
    }

    animate();

    // ============================================
    // RESIZE HANDLER
    // ============================================
    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    window.addEventListener('resize', onResize);

    // Cleanup
    window.cleanupPlanet = function() {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlanet);
  } else {
    initPlanet();
  }
})();
