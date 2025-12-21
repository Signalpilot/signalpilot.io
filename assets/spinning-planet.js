/**
 * Spinning Planet Animation v5
 * More realistic with proper lighting, atmosphere, and depth
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

    // Light direction (simulated sun from top-right)
    const lightDir = new THREE.Vector3(1.0, 0.5, 0.8).normalize();

    // ============================================
    // REALISTIC PLANET with lighting
    // ============================================
    const planetGeo = new THREE.SphereGeometry(1, 96, 96);

    const planetMat = new THREE.ShaderMaterial({
      uniforms: {
        lightDirection: { value: lightDir },
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        varying vec3 vWorldNormal;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 lightDirection;
        uniform float time;

        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        varying vec3 vWorldNormal;

        // Simple noise function
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        void main() {
          // Lighting - day/night
          float NdotL = dot(vWorldNormal, lightDirection);
          float lightIntensity = smoothstep(-0.2, 0.6, NdotL);

          // Base colors - deep ocean blues
          vec3 nightColor = vec3(0.01, 0.02, 0.05);
          vec3 dayColorDeep = vec3(0.02, 0.06, 0.15);
          vec3 dayColorMid = vec3(0.04, 0.10, 0.22);

          // Noise for surface variation
          float n = noise(vUv * 30.0) * 0.5 + noise(vUv * 60.0) * 0.25 + noise(vUv * 120.0) * 0.125;

          // Mix day colors with noise
          vec3 dayColor = mix(dayColorDeep, dayColorMid, n);

          // Apply lighting
          vec3 baseColor = mix(nightColor, dayColor, lightIntensity);

          // Subtle grid lines (only visible on lit side)
          float latLines = 12.0;
          float lonLines = 24.0;

          float lat = abs(fract(vUv.y * latLines) - 0.5) * 2.0;
          float latLine = smoothstep(0.03, 0.0, lat);

          float lon = abs(fract(vUv.x * lonLines) - 0.5) * 2.0;
          float lonLine = smoothstep(0.02, 0.0, lon);

          float grid = max(latLine, lonLine) * 0.15 * lightIntensity;

          // Grid color - subtle blue glow
          vec3 gridColor = vec3(0.1, 0.3, 0.6);

          // Fresnel for edge highlight (atmosphere effect)
          vec3 viewDir = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 4.0);

          // Atmospheric scattering color
          vec3 atmosColor = vec3(0.15, 0.4, 0.8);

          // Terminator glow (edge between day/night)
          float terminator = 1.0 - abs(NdotL);
          terminator = pow(terminator, 3.0) * 0.3;
          vec3 terminatorColor = vec3(0.1, 0.2, 0.4);

          // Compose
          vec3 final = baseColor;
          final += gridColor * grid;
          final += terminatorColor * terminator * (1.0 - fresnel);
          final = mix(final, atmosColor, fresnel * 0.5);

          // Slight ambient to prevent pure black
          final += vec3(0.005, 0.01, 0.02);

          gl_FragColor = vec4(final, 0.95);
        }
      `,
      transparent: true
    });

    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // ============================================
    // MULTI-LAYER ATMOSPHERE
    // ============================================

    // Inner atmosphere (sharp edge glow)
    const atmos1Geo = new THREE.SphereGeometry(1.02, 64, 64);
    const atmos1Mat = new THREE.ShaderMaterial({
      uniforms: {
        lightDirection: { value: lightDir }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 lightDirection;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        void main() {
          float NdotL = dot(vWorldNormal, lightDirection);
          float litSide = smoothstep(-0.1, 0.3, NdotL);

          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          vec3 color = vec3(0.2, 0.5, 1.0) * litSide + vec3(0.05, 0.1, 0.2) * (1.0 - litSide);
          gl_FragColor = vec4(color * intensity, intensity * 0.6);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    planetGroup.add(new THREE.Mesh(atmos1Geo, atmos1Mat));

    // Outer atmosphere (soft haze)
    const atmos2Geo = new THREE.SphereGeometry(1.08, 32, 32);
    const atmos2Mat = new THREE.ShaderMaterial({
      uniforms: {
        lightDirection: { value: lightDir }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 lightDirection;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        void main() {
          float NdotL = dot(vWorldNormal, lightDirection);
          float litSide = smoothstep(-0.3, 0.5, NdotL);

          float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          vec3 color = vec3(0.1, 0.3, 0.7) * litSide;
          gl_FragColor = vec4(color * intensity, intensity * 0.25);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    planetGroup.add(new THREE.Mesh(atmos2Geo, atmos2Mat));

    // ============================================
    // SMALL DATA DOTS on surface
    // ============================================
    const dotsGroup = new THREE.Group();
    const numDots = 50;
    const colors = [0x00ddff, 0xff4477, 0x44ff88];

    for (let i = 0; i < numDots; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / numDots);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      if (Math.random() > 0.4) continue;

      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.sin(phi) * Math.sin(theta);
      const z = Math.cos(phi);

      const size = 0.006 + Math.random() * 0.008;
      const dotGeo = new THREE.SphereGeometry(size, 6, 6);
      const color = colors[Math.floor(Math.random() * colors.length)];
      const dotMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6 + Math.random() * 0.4
      });

      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(x * 1.003, y * 1.003, z * 1.003);
      dot.userData.baseOpacity = dotMat.opacity;
      dot.userData.pulseOffset = Math.random() * Math.PI * 2;
      dotsGroup.add(dot);
    }
    planetGroup.add(dotsGroup);

    // ============================================
    // REFINED ORBITAL RINGS
    // ============================================
    function createRing(radius, tiltX, tiltZ, color, opacity) {
      const ringGroup = new THREE.Group();

      // Main ring - thinner
      const geo = new THREE.TorusGeometry(radius, 0.004, 16, 150);
      const mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity
      });
      ringGroup.add(new THREE.Mesh(geo, mat));

      // Soft glow
      const glowGeo = new THREE.TorusGeometry(radius, 0.018, 16, 100);
      const glowMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity * 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      ringGroup.add(new THREE.Mesh(glowGeo, glowMat));

      ringGroup.rotation.x = tiltX;
      ringGroup.rotation.z = tiltZ;

      return ringGroup;
    }

    const ring1 = createRing(1.4, Math.PI / 2.2, 0.18, 0x00ccff, 0.6);
    scene.add(ring1);

    const ring2 = createRing(1.6, Math.PI / 2.4, -0.12, 0xff3366, 0.4);
    scene.add(ring2);

    // ============================================
    // TRAVELING PARTICLES
    // ============================================
    const particles = [];

    function createParticle(ring, color) {
      const geo = new THREE.SphereGeometry(0.012, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.85
      });
      const particle = new THREE.Mesh(geo, mat);

      const glowGeo = new THREE.SphereGeometry(0.028, 6, 6);
      const glowMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending
      });
      particle.add(new THREE.Mesh(glowGeo, glowMat));

      particle.userData = {
        angle: Math.random() * Math.PI * 2,
        speed: 0.15 + Math.random() * 0.1,
        ring: ring
      };

      return particle;
    }

    for (let i = 0; i < 2; i++) {
      const p = createParticle(ring1, 0x00ffff);
      p.userData.angle = i * Math.PI;
      scene.add(p);
      particles.push(p);
    }

    const p2 = createParticle(ring2, 0xff4477);
    scene.add(p2);
    particles.push(p2);

    // ============================================
    // BACKGROUND STARS with size variation
    // ============================================
    const starsGeo = new THREE.BufferGeometry();
    const positions = [];
    const sizes = [];

    for (let i = 0; i < 150; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const dist = 6 + Math.random() * 15;

      positions.push(
        dist * Math.sin(phi) * Math.cos(theta),
        dist * Math.sin(phi) * Math.sin(theta),
        dist * Math.cos(phi)
      );
      sizes.push(0.5 + Math.random() * 1.5);
    }

    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    starsGeo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const starsMat = new THREE.PointsMaterial({
      size: 0.025,
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
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
        // Planet rotation
        planetGroup.rotation.y = t * 0.3;

        // Update shader time
        planetMat.uniforms.time.value = t;

        // Ring rotation
        ring1.rotation.z = 0.18 + t * 0.012;
        ring2.rotation.z = -0.12 - t * 0.008;

        // Particles
        particles.forEach(p => {
          p.userData.angle += p.userData.speed * 0.01;
          const a = p.userData.angle;
          const ring = p.userData.ring;
          const radius = ring.children[0].geometry.parameters.radius;

          const x = Math.cos(a) * radius;
          const z = Math.sin(a) * radius;

          const pos = new THREE.Vector3(x, 0, z);
          pos.applyEuler(ring.rotation);
          p.position.copy(pos);
        });

        // Dot pulsing
        dotsGroup.children.forEach(dot => {
          const pulse = Math.sin(t * 1.2 + dot.userData.pulseOffset) * 0.5 + 0.5;
          dot.material.opacity = dot.userData.baseOpacity * (0.4 + pulse * 0.6);
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
