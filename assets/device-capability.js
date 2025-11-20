/**
 * SignalPilot Device Capability Detection
 * Intelligently detects if device can handle high-performance VISUAL EFFECTS
 *
 * PURPOSE: Determines capability for DECORATIVE EFFECTS (aurora, particles, videos)
 * COMPLEMENTARY TO: device-optimizations.js (handles responsive design & browser compat)
 *
 * How it works:
 * 1. Scores device based on: memory, CPU cores, GPU, connection, battery
 * 2. Checks for low-end devices (old Android/iOS, software rendering)
 * 3. Measures actual FPS performance for 2 seconds
 * 4. Sets data attributes on <html> that CSS uses to show/hide effects
 * 5. Dispatches 'capabilitiesdetected' event for scripts to react
 *
 * Performance Levels:
 * - HIGH (score 70+): All effects enabled (aurora, particles, video, blend modes)
 * - MEDIUM (score 35-69): Aurora + particles only, no video
 * - LOW (score <35): Particles only (aurora/video disabled for performance)
 *
 * Data Attributes Set:
 * - data-performance: high|medium|low (used by inline CSS)
 * - data-aurora, data-particles, data-video, data-blendmodes: true|false
 *
 * Manual Override:
 * - In console: SP_CAPABILITIES.override('low|medium|high')
 * - Or localStorage.setItem('sp-performance-override', 'low')
 */

(function() {
  'use strict';

  // Capability detection result
  let capabilities = {
    canHandleAurora: true,
    canHandleParticles: true,
    canHandleVideo: true,
    canHandleBlendModes: true,
    performanceLevel: 'high' // high, medium, low
  };

  /**
   * Detect device capabilities
   */
  function detectCapabilities() {
    let score = 100; // Start with perfect score

    // 1. Check device memory (if available)
    if (navigator.deviceMemory) {
      if (navigator.deviceMemory < 2) {
        score -= 40; // Very low memory
      } else if (navigator.deviceMemory < 4) {
        score -= 20; // Low memory
      }
    }

    // 2. Check CPU cores
    if (navigator.hardwareConcurrency) {
      if (navigator.hardwareConcurrency < 2) {
        score -= 30; // Single core
      } else if (navigator.hardwareConcurrency < 4) {
        score -= 15; // Dual core
      }
    }

    // 3. Check connection type (if available)
    if (navigator.connection) {
      const conn = navigator.connection;
      if (conn.saveData) {
        score -= 25; // User wants to save data
      }
      if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
        score -= 20; // Slow connection
      }
    }

    // 4. Check screen size and pixel ratio
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    if (width < 768) {
      score -= 10; // Mobile screen
    }

    if (dpr > 2) {
      score -= 10; // High DPI = more pixels to render
    }

    // 5. Check for specific low-end devices
    const ua = navigator.userAgent.toLowerCase();

    // Low-end Android
    if (ua.includes('android')) {
      if (ua.includes('android 4') || ua.includes('android 5')) {
        score -= 30; // Very old Android
      } else if (ua.includes('android 6') || ua.includes('android 7')) {
        score -= 15; // Older Android
      }
    }

    // iOS
    if (/iphone|ipad|ipod/.test(ua)) {
      // Check iOS version
      const match = ua.match(/os (\d+)_/);
      if (match) {
        const iosVersion = parseInt(match[1]);
        if (iosVersion < 13) {
          score -= 25; // Old iOS
        } else if (iosVersion < 15) {
          score -= 10; // Older iOS
        }
      }
    }

    // 6. Check GPU capabilities
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      score -= 40; // No WebGL support
    } else {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();

        // Check for software rendering
        if (renderer.includes('swiftshader') || renderer.includes('llvmpipe') || renderer.includes('software')) {
          score -= 50; // Software rendering
        }

        // Check for known low-end GPUs
        if (renderer.includes('adreno 3') || renderer.includes('adreno 4') ||
            renderer.includes('mali-4') || renderer.includes('powervr sgx')) {
          score -= 25; // Low-end mobile GPU
        }
      }
    }

    // 7. Battery status (if available)
    if (navigator.getBattery) {
      navigator.getBattery().then(battery => {
        if (battery.level < 0.2 && !battery.charging) {
          // Low battery, reduce performance
          adjustForLowBattery();
        }
      });
    }

    // Calculate performance level - optimized for beautiful mobile constellation experience
    if (score >= 70) {
      capabilities.performanceLevel = 'high';
      capabilities.canHandleAurora = true;
      capabilities.canHandleParticles = true;
      capabilities.canHandleVideo = true;
      capabilities.canHandleBlendModes = true;
    } else if (score >= 35) {
      capabilities.performanceLevel = 'medium';
      capabilities.canHandleAurora = true;
      capabilities.canHandleParticles = true;
      capabilities.canHandleVideo = false; // No video on medium
      capabilities.canHandleBlendModes = true;
    } else {
      capabilities.performanceLevel = 'low';
      capabilities.canHandleAurora = true; // Keep aurora - it's CSS-only gradients, very lightweight!
      capabilities.canHandleParticles = true; // Still show constellations! They're lightweight
      capabilities.canHandleVideo = false;
      capabilities.canHandleBlendModes = false;
    }

    console.log('🎨 Device Capability Score:', score, '| Level:', capabilities.performanceLevel);

    return capabilities;
  }

  /**
   * Performance monitoring - measure actual FPS
   */
  function monitorPerformance(callback) {
    let frames = 0;
    let lastTime = performance.now();
    let testDuration = 2000; // Test for 2 seconds
    let startTime = lastTime;

    function measureFrame() {
      frames++;
      const currentTime = performance.now();
      const elapsed = currentTime - startTime;

      if (elapsed < testDuration) {
        requestAnimationFrame(measureFrame);
      } else {
        const fps = Math.round((frames / elapsed) * 1000);
        const avgFps = fps;

        console.log('📊 Average FPS:', avgFps);

        // If FPS is too low, downgrade heavy effects but keep lightweight visual effects
        if (avgFps < 30) {
          console.warn('⚠️ Low FPS detected, reducing heavy effects (keeping aurora & particles for beauty)');
          capabilities.performanceLevel = 'low';
          capabilities.canHandleVideo = false;
          capabilities.canHandleBlendModes = false;
          // Keep aurora & particles enabled - they're lightweight and essential for the experience!
          // Aurora is just CSS gradients, particles are optimized canvas
          // capabilities.canHandleAurora stays true
          // capabilities.canHandleParticles stays true
        } else if (avgFps < 50) {
          if (capabilities.performanceLevel === 'high') {
            console.warn('⚠️ Medium FPS detected, adjusting to medium');
            capabilities.performanceLevel = 'medium';
            capabilities.canHandleVideo = false;
          }
        }

        if (callback) callback(avgFps, capabilities);
      }
    }

    requestAnimationFrame(measureFrame);
  }

  /**
   * Adjust for low battery
   */
  function adjustForLowBattery() {
    console.log('🔋 Low battery detected, reducing effects');
    capabilities.canHandleVideo = false;
    if (capabilities.performanceLevel === 'high') {
      capabilities.performanceLevel = 'medium';
    }
    applyCapabilities();
  }

  /**
   * Apply capabilities to the page
   */
  function applyCapabilities() {
    const root = document.documentElement;

    // Set data attributes for CSS targeting
    root.setAttribute('data-performance', capabilities.performanceLevel);
    root.setAttribute('data-aurora', capabilities.canHandleAurora);
    root.setAttribute('data-particles', capabilities.canHandleParticles);
    root.setAttribute('data-video', capabilities.canHandleVideo);
    root.setAttribute('data-blendmodes', capabilities.canHandleBlendModes);

    // Hide/show elements based on capabilities
    if (!capabilities.canHandleVideo) {
      const videos = document.querySelectorAll('.bg-aurora-video');
      videos.forEach(v => {
        v.style.display = 'none';
        v.style.visibility = 'hidden';
      });
    }

    if (!capabilities.canHandleAurora) {
      const auroras = document.querySelectorAll('.bg-aurora');
      auroras.forEach(a => {
        a.style.display = 'none';
        a.style.visibility = 'hidden';
      });
    }

    // Particles are now always enabled for beautiful mobile experience!
    // Let CSS handle visibility via data-particles attribute if needed
    // Canvas is managed by particles.js itself

    if (!capabilities.canHandleBlendModes) {
      root.classList.add('no-blend-modes');
    }

    // Dispatch event so other scripts can react
    window.dispatchEvent(new CustomEvent('capabilitiesdetected', {
      detail: capabilities
    }));
  }

  /**
   * Initialize capability detection
   */
  function init() {
    // Respect user preference for reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      console.log('♿ Reduced motion preferred, disabling all effects');
      capabilities.performanceLevel = 'low';
      capabilities.canHandleAurora = false;
      capabilities.canHandleParticles = false;
      capabilities.canHandleVideo = false;
      capabilities.canHandleBlendModes = false;
      applyCapabilities();
      return;
    }

    // Detect initial capabilities
    detectCapabilities();
    applyCapabilities();

    // Monitor performance after page loads
    if (document.readyState === 'complete') {
      setTimeout(() => monitorPerformance((fps, caps) => {
        applyCapabilities();
      }), 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => monitorPerformance((fps, caps) => {
          applyCapabilities();
        }), 1000);
      });
    }

    // Listen for battery changes
    if (navigator.getBattery) {
      navigator.getBattery().then(battery => {
        battery.addEventListener('levelchange', () => {
          if (battery.level < 0.2 && !battery.charging) {
            adjustForLowBattery();
          }
        });
      });
    }

    // Allow manual override via localStorage
    const override = localStorage.getItem('sp-performance-override');
    if (override) {
      console.log('🔧 Performance override:', override);
      capabilities.performanceLevel = override;
      if (override === 'low') {
        capabilities.canHandleAurora = true; // Keep aurora - CSS gradients are lightweight!
        capabilities.canHandleParticles = true; // Keep particles - they're lightweight!
        capabilities.canHandleVideo = false;
        capabilities.canHandleBlendModes = false;
      } else if (override === 'medium') {
        capabilities.canHandleVideo = false;
      }
      applyCapabilities();
    }
  }

  // Initialize immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.SP_CAPABILITIES = {
    get: () => capabilities,
    refresh: () => {
      detectCapabilities();
      applyCapabilities();
    },
    override: (level) => {
      localStorage.setItem('sp-performance-override', level);
      location.reload();
    }
  };
})();
