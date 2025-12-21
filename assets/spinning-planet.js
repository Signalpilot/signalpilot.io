/**
 * Spinning Planet Animation v3
 * Complete rebuild with sweeping light trails, proper bloom, and cinematic feel
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

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.2, 3.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Planet group
    const planetGroup = new THREE.Group();
    planetGroup.rotation.x = 0.2;
    planetGroup.rotation.z = -0.15;
    scene.add(planetGroup);

    // ============================================
    // DARK PLANET with subtle dot grid
    // ============================================
    const planetGeo = new THREE.SphereGeometry(1, 64, 64);

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
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          // Very dark base
          vec3 darkBlue = vec3(0.02, 0.04, 0.08);
          vec3 midBlue = vec3(0.05, 0.1, 0.18);

          // Gradient from bottom to top
          float gradient = smoothstep(-1.0, 1.0, vPosition.y);
          vec3 baseColor = mix(darkBlue, midBlue, gradient * 0.5);

          // Subtle dot grid pattern
          float latDots = 16.0;
          float lonDots = 32.0;

          vec2 gridUv = vec2(vUv.x * lonDots, vUv.y * latDots);
          vec2 gridFract = fract(gridUv);
          float dot = length(gridFract - 0.5);
          float dotPattern = 1.0 - smoothstep(0.0, 0.15, dot);

          // Faint grid lines
          float latLine = 1.0 - smoothstep(0.0, 0.03, abs(fract(vUv.y * 8.0) - 0.5) * 2.0);
          float lonLine = 1.0 - smoothstep(0.0, 0.02, abs(fract(vUv.x * 16.0) - 0.5) * 2.0);
          float gridLine = max(latLine, lonLine) * 0.15;

          // Edge fresnel
          vec3 viewDir = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);

          // Combine
          vec3 gridColor = vec3(0.2, 0.5, 0.8);
          vec3 edgeColor = vec3(0.0, 0.8, 1.0);

          vec3 finalColor = baseColor;
          finalColor += gridColor * dotPattern * 0.08;
          finalColor += gridColor * gridLine;
          finalColor = mix(finalColor, edgeColor, fresnel * 0.4);

          gl_FragColor = vec4(finalColor, 0.95 - fresnel * 0.1);
        }
      `,
      transparent: true,
      depthWrite: true
    });

    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // ============================================
    // ATMOSPHERE GLOW
    // ============================================
    const atmosGeo = new THREE.SphereGeometry(1.08, 32, 32);
    const atmosMat = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0x00aaff) }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          gl_FragColor = vec4(glowColor, intensity * 0.6);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    planetGroup.add(atmosphere);

    // ============================================
    // SWEEPING LIGHT TRAIL RINGS
    // ============================================
    function createSweepingRing(radius, tiltX, tiltY, color, arcLength, thickness, segments) {
      const ringGroup = new THREE.Group();

      // Create arc path
      const curve = new THREE.EllipseCurve(
        0, 0,
        radius, radius,
        0, Math.PI * arcLength,
        false,
        0
      );

      const points = curve.getPoints(segments);
      const points3D = points.map(p => new THREE.Vector3(p.x, 0, p.y));

      // Create tube along the arc with tapering
      const path = new THREE.CatmullRomCurve3(points3D);

      // Main bright core
      const tubeGeo = new THREE.TubeGeometry(path, segments, thickness, 8, false);
      const tubeMat = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(color) },
          time: { value: 0 }
        },
        vertexShader: `
          attribute float tubeT;
          varying float vT;
          varying vec3 vPosition;
          void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          varying vec3 vPosition;
          void main() {
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      ringGroup.add(tube);

      // Glow layer 1
      const glow1Geo = new THREE.TubeGeometry(path, segments, thickness * 3, 8, false);
      const glow1Mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const glow1 = new THREE.Mesh(glow1Geo, glow1Mat);
      ringGroup.add(glow1);

      // Glow layer 2 (wider)
      const glow2Geo = new THREE.TubeGeometry(path, segments, thickness * 8, 8, false);
      const glow2Mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const glow2 = new THREE.Mesh(glow2Geo, glow2Mat);
      ringGroup.add(glow2);

      // Glow layer 3 (widest - bloom simulation)
      const glow3Geo = new THREE.TubeGeometry(path, segments, thickness * 15, 8, false);
      const glow3Mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const glow3 = new THREE.Mesh(glow3Geo, glow3Mat);
      ringGroup.add(glow3);

      ringGroup.rotation.x = tiltX;
      ringGroup.rotation.y = tiltY;

      return ringGroup;
    }

    // Main cyan ring (front arc)
    const ring1 = createSweepingRing(1.5, Math.PI * 0.55, 0.3, 0x00ffff, 1.3, 0.012, 80);
    scene.add(ring1);

    // Second cyan ring (back arc)
    const ring2 = createSweepingRing(1.55, Math.PI * 0.52, Math.PI + 0.2, 0x00ddff, 1.1, 0.01, 70);
    scene.add(ring2);

    // Magenta/pink ring
    const ring3 = createSweepingRing(1.75, Math.PI * 0.48, 0.8, 0xff0066, 1.4, 0.008, 80);
    scene.add(ring3);

    // Second magenta arc
    const ring4 = createSweepingRing(1.8, Math.PI * 0.5, Math.PI + 1.0, 0xff3388, 0.9, 0.007, 60);
    scene.add(ring4);

    // Subtle blue outer ring
    const ring5 = createSweepingRing(2.0, Math.PI * 0.58, 1.5, 0x4488ff, 1.6, 0.006, 90);
    scene.add(ring5);

    // ============================================
    // CANDLESTICKS on planet surface
    // ============================================
    const candleGroup = new THREE.Group();

    const candleData = [
      // Visible front cluster
      { lat: 20, lon: 35, h: 0.12, c: 0xff3366 },
      { lat: 25, lon: 45, h: 0.18, c: 0x00ff88 },
      { lat: 18, lon: 55, h: 0.10, c: 0xff3366 },
      { lat: 28, lon: 60, h: 0.22, c: 0x00ff88 },
      { lat: 22, lon: 70, h: 0.15, c: 0x00ff88 },
      { lat: 30, lon: 42, h: 0.08, c: 0xff3366 },
      // Right side
      { lat: 5, lon: 85, h: 0.14, c: 0x00ff88 },
      { lat: -5, lon: 95, h: 0.20, c: 0xff3366 },
      { lat: 10, lon: 100, h: 0.11, c: 0x00ff88 },
      // Upper area
      { lat: 45, lon: 20, h: 0.16, c: 0x00ff88 },
      { lat: 50, lon: 30, h: 0.12, c: 0xff3366 },
      { lat: 42, lon: -10, h: 0.19, c: 0x00ff88 },
    ];

    candleData.forEach(c => {
      const latRad = c.lat * Math.PI / 180;
      const lonRad = c.lon * Math.PI / 180;

      const x = Math.cos(latRad) * Math.cos(lonRad);
      const y = Math.sin(latRad);
      const z = Math.cos(latRad) * Math.sin(lonRad);

      // Candle body
      const bodyGeo = new THREE.BoxGeometry(0.018, c.h, 0.018);
      const bodyMat = new THREE.MeshBasicMaterial({
        color: c.c,
        transparent: true,
        opacity: 0.9
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);

      body.position.set(x * 1.01, y * 1.01, z * 1.01);
      body.lookAt(0, 0, 0);
      body.rotateX(Math.PI / 2);
      body.translateY(c.h / 2);

      // Glow
      const glowGeo = new THREE.BoxGeometry(0.04, c.h * 1.2, 0.04);
      const glowMat = new THREE.MeshBasicMaterial({
        color: c.c,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      body.add(glow);

      candleGroup.add(body);
    });
    planetGroup.add(candleGroup);

    // ============================================
    // SURFACE DATA DOTS
    // ============================================
    const dotsGroup = new THREE.Group();
    const dotColors = [0x00ffff, 0xff0066, 0x00ff88, 0x4488ff];

    for (let i = 0; i < 80; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / 80);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      if (Math.random() > 0.4) continue;

      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.sin(phi) * Math.sin(theta);
      const z = Math.cos(phi);

      const dotGeo = new THREE.SphereGeometry(0.015 + Math.random() * 0.01, 6, 6);
      const dotColor = dotColors[Math.floor(Math.random() * dotColors.length)];
      const dotMat = new THREE.MeshBasicMaterial({
        color: dotColor,
        transparent: true,
        opacity: 0.6 + Math.random() * 0.4
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(x * 1.01, y * 1.01, z * 1.01);
      dot.userData.pulseOffset = Math.random() * Math.PI * 2;
      dot.userData.baseOpacity = dot.material.opacity;
      dotsGroup.add(dot);
    }
    planetGroup.add(dotsGroup);

    // ============================================
    // BACKGROUND STARS
    // ============================================
    const starsGeo = new THREE.BufferGeometry();
    const starPositions = [];
    const starColors = [];

    for (let i = 0; i < 300; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const dist = 6 + Math.random() * 10;

      starPositions.push(
        dist * Math.sin(phi) * Math.cos(theta),
        dist * Math.sin(phi) * Math.sin(theta),
        dist * Math.cos(phi)
      );

      const brightness = 0.5 + Math.random() * 0.5;
      starColors.push(brightness, brightness, brightness * 1.1);
    }

    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    starsGeo.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

    const starsMat = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    // ============================================
    // TRAVELING PARTICLES on rings
    // ============================================
    const particles = [];

    function createParticle(radius, tiltX, tiltY, color, speed) {
      const particleGeo = new THREE.SphereGeometry(0.03, 8, 8);
      const particleMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1
      });
      const particle = new THREE.Mesh(particleGeo, particleMat);

      // Glow
      const glowGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const glowMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
      });
      particle.add(new THREE.Mesh(glowGeo, glowMat));

      particle.userData = {
        angle: Math.random() * Math.PI * 2,
        radius: radius,
        tiltX: tiltX,
        tiltY: tiltY,
        speed: speed
      };

      return particle;
    }

    // Cyan particles
    for (let i = 0; i < 3; i++) {
      const p = createParticle(1.52, Math.PI * 0.55, 0.3, 0x00ffff, 0.3 + Math.random() * 0.2);
      scene.add(p);
      particles.push(p);
    }

    // Magenta particles
    for (let i = 0; i < 2; i++) {
      const p = createParticle(1.77, Math.PI * 0.48, 0.8, 0xff0066, 0.25 + Math.random() * 0.15);
      scene.add(p);
      particles.push(p);
    }

    // ============================================
    // ANIMATION
    // ============================================
    let animationId;
    const clock = new THREE.Clock();

    function animate() {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Rotate planet
        planetGroup.rotation.y = elapsed * 0.06;

        // Subtle float
        planetGroup.position.y = Math.sin(elapsed * 0.4) * 0.015;

        // Rotate ring groups slowly
        ring1.rotation.z = elapsed * 0.02;
        ring2.rotation.z = -elapsed * 0.015;
        ring3.rotation.z = elapsed * 0.018;
        ring4.rotation.z = -elapsed * 0.012;
        ring5.rotation.z = elapsed * 0.01;

        // Animate particles
        particles.forEach(p => {
          p.userData.angle += p.userData.speed * 0.02;
          const a = p.userData.angle;
          const r = p.userData.radius;

          // Position on ring
          let x = Math.cos(a) * r;
          let y = 0;
          let z = Math.sin(a) * r;

          // Apply tilt
          const cosX = Math.cos(p.userData.tiltX);
          const sinX = Math.sin(p.userData.tiltX);
          const cosY = Math.cos(p.userData.tiltY);
          const sinY = Math.sin(p.userData.tiltY);

          // Rotate around X
          const y1 = y * cosX - z * sinX;
          const z1 = y * sinX + z * cosX;

          // Rotate around Y
          const x2 = x * cosY + z1 * sinY;
          const z2 = -x * sinY + z1 * cosY;

          p.position.set(x2, y1, z2);

          // Pulse
          p.material.opacity = 0.7 + Math.sin(elapsed * 4 + p.userData.angle) * 0.3;
        });

        // Pulse dots
        dotsGroup.children.forEach(dot => {
          const pulse = Math.sin(elapsed * 2 + dot.userData.pulseOffset);
          dot.material.opacity = dot.userData.baseOpacity * (0.6 + pulse * 0.4);
        });

        // Update planet shader
        planetMat.uniforms.time.value = elapsed;
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
