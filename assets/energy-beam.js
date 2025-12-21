/**
 * ENERGY BEAM EFFECT
 * Huly.io inspired vertical light beam with atmospheric glow
 * Uses Three.js for WebGL rendering
 */

(function() {
  'use strict';

  // Wait for Three.js to load
  function init() {
    if (typeof THREE === 'undefined') {
      setTimeout(init, 100);
      return;
    }

    const container = document.getElementById('energy-beam-container');
    if (!container) return;

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      createStaticFallback(container);
      return;
    }

    // Scene setup
    const scene = new THREE.Scene();

    // Get container dimensions
    const width = container.offsetWidth || window.innerWidth;
    const height = container.offsetHeight || window.innerHeight;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 0;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Position beam on the right side
    const beamGroup = new THREE.Group();
    beamGroup.position.x = 2.5; // Right side
    beamGroup.position.y = -3; // Start from bottom
    scene.add(beamGroup);

    // === MAIN BEAM CORE ===
    const beamGeometry = new THREE.PlaneGeometry(0.08, 15);
    const beamMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0xffffff) },
        color2: { value: new THREE.Color(0x5b8aff) }
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
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;

        void main() {
          float intensity = 1.0 - abs(vUv.x - 0.5) * 2.0;
          intensity = pow(intensity, 0.5);
          float pulse = 0.9 + 0.1 * sin(time * 2.0);
          float verticalFade = 1.0 - pow(vUv.y, 2.0) * 0.3;
          vec3 color = mix(color2, color1, intensity);
          float alpha = intensity * pulse * verticalFade;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.y = 4;
    beamGroup.add(beam);

    // === INNER GLOW ===
    const innerGlowGeometry = new THREE.PlaneGeometry(0.4, 15);
    const innerGlowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x5b8aff) }
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
        uniform vec3 color;
        varying vec2 vUv;

        void main() {
          float dist = abs(vUv.x - 0.5) * 2.0;
          float intensity = exp(-dist * 3.0);
          float pulse = 0.85 + 0.15 * sin(time * 1.5 + vUv.y * 5.0);
          float verticalFade = 1.0 - pow(vUv.y, 1.5) * 0.4;
          float alpha = intensity * 0.6 * pulse * verticalFade;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
    innerGlow.position.y = 4;
    innerGlow.position.z = -0.01;
    beamGroup.add(innerGlow);

    // === OUTER GLOW / ATMOSPHERE ===
    const outerGlowGeometry = new THREE.PlaneGeometry(3, 15);
    const outerGlowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x3366ff) }
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
        uniform vec3 color;
        varying vec2 vUv;

        void main() {
          float dist = abs(vUv.x - 0.5) * 2.0;
          float intensity = exp(-dist * 2.0);
          float noise = sin(vUv.y * 20.0 + time) * 0.05 +
                       sin(vUv.y * 35.0 - time * 0.7) * 0.03;
          float verticalFade = 1.0 - pow(vUv.y, 1.2) * 0.5;
          float alpha = intensity * 0.15 * verticalFade * (1.0 + noise);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    outerGlow.position.y = 4;
    outerGlow.position.z = -0.02;
    beamGroup.add(outerGlow);

    // === ATMOSPHERIC CLOUDS ===
    // These are the clouds that light up randomly near the beam
    const cloudCount = 12;
    const clouds = [];

    for (let i = 0; i < cloudCount; i++) {
      const cloudGeometry = new THREE.PlaneGeometry(
        1.5 + Math.random() * 2,  // width varies
        1 + Math.random() * 1.5   // height varies
      );

      const cloudMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          brightness: { value: 0 },
          targetBrightness: { value: 0 },
          color: { value: new THREE.Color(0x4488ff) },
          seed: { value: Math.random() * 100 }
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
          uniform float brightness;
          uniform vec3 color;
          uniform float seed;
          varying vec2 vUv;

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

          float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            for (int i = 0; i < 4; i++) {
              value += amplitude * noise(p);
              p *= 2.0;
              amplitude *= 0.5;
            }
            return value;
          }

          void main() {
            // Create cloud shape with noise
            vec2 uv = vUv;
            float n = fbm(uv * 3.0 + seed + time * 0.1);

            // Soft edge falloff
            float edgeX = 1.0 - pow(abs(uv.x - 0.5) * 2.0, 2.0);
            float edgeY = 1.0 - pow(abs(uv.y - 0.5) * 2.0, 2.0);
            float edge = edgeX * edgeY;

            // Cloud density
            float density = n * edge;
            density = smoothstep(0.2, 0.6, density);

            // Apply brightness (this is what creates the "lighting up" effect)
            float alpha = density * brightness * 0.7;

            // Slight color variation based on brightness
            vec3 finalColor = mix(color * 0.5, color, brightness);

            gl_FragColor = vec4(finalColor, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);

      // Position clouds around the beam
      const side = Math.random() > 0.5 ? 1 : -1;
      cloud.position.x = side * (0.5 + Math.random() * 2);
      cloud.position.y = Math.random() * 10 - 1;
      cloud.position.z = -0.05 - Math.random() * 0.1;

      // Slight rotation for variety
      cloud.rotation.z = (Math.random() - 0.5) * 0.3;

      beamGroup.add(cloud);
      clouds.push({
        mesh: cloud,
        material: cloudMaterial,
        brightness: 0,
        targetBrightness: 0,
        nextFlashTime: Math.random() * 3,
        flashDuration: 0,
        baseY: cloud.position.y
      });
    }

    // === GROUND GLOW / REFLECTION ===
    const groundGlowGeometry = new THREE.PlaneGeometry(6, 4);
    const groundGlowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x4477ff) }
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
        uniform vec3 color;
        varying vec2 vUv;

        void main() {
          vec2 center = vec2(0.5, 1.0);
          float dist = distance(vUv, center);
          float intensity = exp(-dist * 2.5);
          float pulse = 0.9 + 0.1 * sin(time * 2.0);
          float alpha = intensity * 0.4 * pulse;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const groundGlow = new THREE.Mesh(groundGlowGeometry, groundGlowMaterial);
    groundGlow.position.y = -2.5;
    groundGlow.position.z = -0.03;
    groundGlow.rotation.x = -Math.PI * 0.3;
    beamGroup.add(groundGlow);

    // === FLOATING PARTICLES ===
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const spreadX = (Math.random() - 0.5) * 3;
      const spreadY = Math.random() * 12 - 2;
      const spreadZ = (Math.random() - 0.5) * 2;

      positions[i * 3] = spreadX;
      positions[i * 3 + 1] = spreadY;
      positions[i * 3 + 2] = spreadZ;

      velocities[i] = 0.5 + Math.random() * 1.5;
      sizes[i] = 2 + Math.random() * 4;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x88aaff) }
      },
      vertexShader: `
        attribute float velocity;
        attribute float size;
        uniform float time;
        varying float vAlpha;

        void main() {
          vec3 pos = position;
          pos.y = mod(pos.y + time * velocity * 0.3, 14.0) - 2.0;
          pos.x += sin(time * 0.5 + position.y * 0.5) * 0.2;

          float distFromCenter = abs(pos.x);
          vAlpha = exp(-distFromCenter * 0.8) * 0.6;
          vAlpha *= 1.0 - smoothstep(8.0, 12.0, pos.y);

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vAlpha;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = (1.0 - dist * 2.0) * vAlpha;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    beamGroup.add(particles);

    // === ANIMATION ===
    let time = 0;
    let animationId;

    function animate() {
      animationId = requestAnimationFrame(animate);
      time += 0.016;

      // Update all shader uniforms
      beamMaterial.uniforms.time.value = time;
      innerGlowMaterial.uniforms.time.value = time;
      outerGlowMaterial.uniforms.time.value = time;
      groundGlowMaterial.uniforms.time.value = time;
      particleMaterial.uniforms.time.value = time;

      // === CLOUD LIGHTING ANIMATION ===
      clouds.forEach(cloud => {
        cloud.material.uniforms.time.value = time;

        // Check if it's time for a new flash
        if (time > cloud.nextFlashTime && cloud.targetBrightness === 0) {
          // Start a flash
          cloud.targetBrightness = 0.4 + Math.random() * 0.6; // Random intensity
          cloud.flashDuration = 0.5 + Math.random() * 1.5; // How long to stay lit
          cloud.nextFlashTime = time + cloud.flashDuration + 1 + Math.random() * 4; // Next flash
        }

        // Fade brightness toward target
        if (cloud.brightness < cloud.targetBrightness) {
          cloud.brightness += 0.03; // Fade in speed
        } else if (time > cloud.nextFlashTime - 1 - Math.random() * 2) {
          // Start fading out before next flash time
          cloud.targetBrightness = 0;
          cloud.brightness -= 0.015; // Fade out speed (slower)
          cloud.brightness = Math.max(0, cloud.brightness);
        }

        cloud.material.uniforms.brightness.value = cloud.brightness;

        // Subtle drift movement
        cloud.mesh.position.y = cloud.baseY + Math.sin(time * 0.3 + cloud.baseY) * 0.2;
        cloud.mesh.position.x += Math.sin(time * 0.2) * 0.001;
      });

      // Subtle beam sway
      beamGroup.rotation.z = Math.sin(time * 0.3) * 0.02;

      renderer.render(scene, camera);
    }

    animate();

    // === RESIZE HANDLING ===
    function handleResize() {
      const newWidth = container.offsetWidth || window.innerWidth;
      const newHeight = container.offsetHeight || window.innerHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);

      // Adjust beam position based on screen size
      if (newWidth < 768) {
        beamGroup.position.x = 1.5;
        beamGroup.scale.set(0.7, 0.7, 0.7);
      } else if (newWidth < 1200) {
        beamGroup.position.x = 2;
        beamGroup.scale.set(0.85, 0.85, 0.85);
      } else {
        beamGroup.position.x = 2.5;
        beamGroup.scale.set(1, 1, 1);
      }
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    // === CLEANUP ===
    window.addEventListener('beforeunload', () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
    });

    // Visibility API - pause when tab not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        animate();
      }
    });
  }

  // Static fallback for reduced motion
  function createStaticFallback(container) {
    const fallback = document.createElement('div');
    fallback.style.cssText = `
      position: absolute;
      top: 0;
      right: 20%;
      width: 4px;
      height: 100%;
      background: linear-gradient(to top,
        rgba(91, 138, 255, 0.8) 0%,
        rgba(255, 255, 255, 0.9) 30%,
        rgba(91, 138, 255, 0.4) 70%,
        transparent 100%
      );
      box-shadow:
        0 0 20px rgba(91, 138, 255, 0.5),
        0 0 40px rgba(91, 138, 255, 0.3),
        0 0 80px rgba(91, 138, 255, 0.2);
      filter: blur(1px);
    `;
    container.appendChild(fallback);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
