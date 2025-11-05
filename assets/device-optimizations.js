/**
 * Device Optimization System
 * Detects device capabilities and network conditions, then optimizes accordingly
 */

(function() {
  'use strict';

  console.log('🔧 Device Optimization System initializing...');

  // Store device info
  const deviceInfo = {
    type: 'desktop', // mobile, tablet, desktop
    os: 'unknown',
    browser: 'unknown',
    connection: 'unknown',
    memory: null,
    cores: null,
    screenSize: { width: window.innerWidth, height: window.innerHeight },
    pixelRatio: window.devicePixelRatio || 1,
    touchEnabled: false,
    saveData: false
  };

  // ========================================
  // DEVICE TYPE DETECTION
  // ========================================

  function detectDeviceType() {
    const ua = navigator.userAgent.toLowerCase();
    const width = window.innerWidth;

    // Mobile detection
    if (/iphone|ipod|android.*mobile|blackberry|opera mini|windows phone/.test(ua)) {
      deviceInfo.type = 'mobile';
    }
    // Tablet detection
    else if (/ipad|android(?!.*mobile)|tablet|kindle|silk|playbook/.test(ua) ||
             (width >= 768 && width <= 1024)) {
      deviceInfo.type = 'tablet';
    }
    // Desktop
    else {
      deviceInfo.type = 'desktop';
    }

    // OS detection
    if (/iphone|ipad|ipod/.test(ua)) {
      deviceInfo.os = 'ios';
      // Extract iOS version
      const match = ua.match(/os (\d+)_/);
      if (match) {
        deviceInfo.osVersion = parseInt(match[1]);
      }
    } else if (/android/.test(ua)) {
      deviceInfo.os = 'android';
      const match = ua.match(/android (\d+)/);
      if (match) {
        deviceInfo.osVersion = parseInt(match[1]);
      }
    } else if (/windows/.test(ua)) {
      deviceInfo.os = 'windows';
    } else if (/mac/.test(ua)) {
      deviceInfo.os = 'macos';
    } else if (/linux/.test(ua)) {
      deviceInfo.os = 'linux';
    }

    // Browser detection
    if (/chrome/.test(ua) && !/edge/.test(ua)) {
      deviceInfo.browser = 'chrome';
    } else if (/safari/.test(ua) && !/chrome/.test(ua)) {
      deviceInfo.browser = 'safari';
    } else if (/firefox/.test(ua)) {
      deviceInfo.browser = 'firefox';
    } else if (/edge/.test(ua)) {
      deviceInfo.browser = 'edge';
    }

    // Touch detection
    deviceInfo.touchEnabled = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    console.log('📱 Device:', deviceInfo.type, `(${deviceInfo.os})`, deviceInfo.browser);
  }

  // ========================================
  // HARDWARE CAPABILITIES
  // ========================================

  function detectHardware() {
    // Memory
    if (navigator.deviceMemory) {
      deviceInfo.memory = navigator.deviceMemory;
      console.log('💾 Memory:', deviceInfo.memory, 'GB');
    }

    // CPU cores
    if (navigator.hardwareConcurrency) {
      deviceInfo.cores = navigator.hardwareConcurrency;
      console.log('⚙️  CPU Cores:', deviceInfo.cores);
    }

    // Screen info
    console.log('🖥️  Screen:', `${deviceInfo.screenSize.width}x${deviceInfo.screenSize.height}`,
                `@ ${deviceInfo.pixelRatio}x DPR`);
  }

  // ========================================
  // NETWORK DETECTION
  // ========================================

  function detectNetwork() {
    if (navigator.connection) {
      const conn = navigator.connection;

      // Connection type
      deviceInfo.connection = conn.effectiveType || 'unknown';
      deviceInfo.saveData = conn.saveData || false;

      console.log('🌐 Connection:', deviceInfo.connection,
                  deviceInfo.saveData ? '(Save Data ON)' : '');

      // Set data attribute for CSS
      document.documentElement.setAttribute('data-connection', deviceInfo.connection);

      if (deviceInfo.saveData) {
        document.documentElement.setAttribute('data-save-data', 'true');
      }

      // Listen for connection changes
      conn.addEventListener('change', () => {
        deviceInfo.connection = conn.effectiveType;
        document.documentElement.setAttribute('data-connection', deviceInfo.connection);
        console.log('🔄 Connection changed:', deviceInfo.connection);
        adaptToNetwork();
      });
    }
  }

  // ========================================
  // ADAPTIVE LOADING BASED ON NETWORK
  // ========================================

  function adaptToNetwork() {
    const conn = deviceInfo.connection;

    // Slow connection - disable non-essential features
    if (conn === 'slow-2g' || conn === '2g') {
      console.log('🐌 Slow connection - minimal mode activated');

      // Hide videos
      document.querySelectorAll('video[autoplay]').forEach(video => {
        video.pause();
        video.style.display = 'none';
      });

      // Lazy load all images
      document.querySelectorAll('img:not([loading])').forEach(img => {
        img.setAttribute('loading', 'lazy');
      });

      // Disable particles
      const particlesCanvas = document.getElementById('particles-canvas');
      if (particlesCanvas) {
        particlesCanvas.style.display = 'none';
      }
    }

    // Save Data mode
    if (deviceInfo.saveData) {
      console.log('💾 Save Data mode - ultra minimal activated');

      // Remove all non-critical images
      document.querySelectorAll('img[data-optional]').forEach(img => {
        img.style.display = 'none';
      });

      // Disable all animations
      document.documentElement.style.setProperty('--animation-speed', '0s');
      document.documentElement.style.setProperty('--transition-speed', '0s');
    }
  }

  // ========================================
  // RESPONSIVE IMAGE SYSTEM
  // ========================================

  function setupResponsiveImages() {
    // Add responsive loading for images
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          const srcset = img.dataset.srcset;

          if (srcset) {
            img.srcset = srcset;
          }
          if (src) {
            img.src = src;
          }

          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px' // Start loading 50px before visible
    });

    images.forEach(img => imageObserver.observe(img));

    console.log('🖼️  Responsive image system active:', images.length, 'images');
  }

  // ========================================
  // TOUCH OPTIMIZATION
  // ========================================

  function optimizeForTouch() {
    if (!deviceInfo.touchEnabled) return;

    console.log('👆 Touch device detected - optimizing');

    // Add touch class
    document.documentElement.classList.add('touch-device');

    // Remove title attributes (they don't work well on touch)
    document.querySelectorAll('[title]').forEach(el => {
      el.dataset.title = el.title;
      el.removeAttribute('title');
    });

    // Faster tap response (remove 300ms delay on old mobile browsers)
    document.addEventListener('touchstart', function() {}, { passive: true });

    // Prevent double-tap zoom on buttons
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }

  // ========================================
  // ORIENTATION HANDLING
  // ========================================

  function handleOrientation() {
    function updateOrientation() {
      const orientation = window.matchMedia('(orientation: portrait)').matches
        ? 'portrait'
        : 'landscape';

      document.documentElement.setAttribute('data-orientation', orientation);

      console.log('📐 Orientation:', orientation);
    }

    updateOrientation();

    // Listen for orientation changes
    window.addEventListener('orientationchange', updateOrientation);
    window.matchMedia('(orientation: portrait)').addEventListener('change', updateOrientation);
  }

  // ========================================
  // BATTERY STATUS (if available)
  // ========================================

  async function detectBattery() {
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();

        function updateBatteryStatus() {
          const level = Math.round(battery.level * 100);
          const charging = battery.charging;

          console.log('🔋 Battery:', `${level}%`, charging ? '(charging)' : '');

          // Low battery mode
          if (!charging && level < 20) {
            console.log('⚠️  Low battery - enabling power save mode');
            document.documentElement.setAttribute('data-battery', 'low');
            document.documentElement.setAttribute('data-capability', 'low');
          } else {
            document.documentElement.removeAttribute('data-battery');
          }
        }

        updateBatteryStatus();
        battery.addEventListener('levelchange', updateBatteryStatus);
        battery.addEventListener('chargingchange', updateBatteryStatus);
      } catch (err) {
        console.log('ℹ️  Battery API not available');
      }
    }
  }

  // ========================================
  // VIEWPORT SIZE TRACKING
  // ========================================

  function trackViewportChanges() {
    let resizeTimer;

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        deviceInfo.screenSize = {
          width: window.innerWidth,
          height: window.innerHeight
        };

        // Re-detect device type on resize (for responsive testing)
        detectDeviceType();

        console.log('📏 Viewport resized:',
          `${deviceInfo.screenSize.width}x${deviceInfo.screenSize.height}`);
      }, 250);
    });
  }

  // ========================================
  // APPLY DATA ATTRIBUTES TO HTML
  // ========================================

  function applyDataAttributes() {
    const html = document.documentElement;

    html.setAttribute('data-device-type', deviceInfo.type);
    html.setAttribute('data-os', deviceInfo.os);
    html.setAttribute('data-browser', deviceInfo.browser);

    if (deviceInfo.touchEnabled) {
      html.setAttribute('data-touch', 'true');
    }

    if (deviceInfo.pixelRatio >= 2) {
      html.setAttribute('data-retina', 'true');
    }

    // Screen size classes
    const width = deviceInfo.screenSize.width;
    if (width < 768) {
      html.setAttribute('data-screen', 'small');
    } else if (width < 1024) {
      html.setAttribute('data-screen', 'medium');
    } else if (width < 1920) {
      html.setAttribute('data-screen', 'large');
    } else {
      html.setAttribute('data-screen', 'xlarge');
    }
  }

  // ========================================
  // PERFORMANCE MONITORING
  // ========================================

  function monitorPerformance() {
    // Use existing capability detection if available
    if (window.SP_CAPABILITIES) {
      console.log('✅ Using existing capability detection');
      return;
    }

    // Simple FPS check
    let lastTime = performance.now();
    let frames = 0;

    function checkFPS() {
      frames++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        frames = 0;
        lastTime = currentTime;

        // If FPS is low, reduce effects
        if (fps < 30) {
          console.log('⚠️  Low FPS detected:', fps, '- reducing effects');
          document.documentElement.setAttribute('data-capability', 'low');
        }
      }

      if (frames < 60) {
        requestAnimationFrame(checkFPS);
      }
    }

    requestAnimationFrame(checkFPS);
  }

  // ========================================
  // PUBLIC API
  // ========================================

  window.DeviceOptimization = {
    getInfo: () => deviceInfo,
    isMobile: () => deviceInfo.type === 'mobile',
    isTablet: () => deviceInfo.type === 'tablet',
    isDesktop: () => deviceInfo.type === 'desktop',
    isTouchDevice: () => deviceInfo.touchEnabled,
    isSlowConnection: () => ['slow-2g', '2g', '3g'].includes(deviceInfo.connection),
    getSaveDataMode: () => deviceInfo.saveData,
    refresh: () => {
      detectDeviceType();
      detectHardware();
      detectNetwork();
      applyDataAttributes();
    }
  };

  // ========================================
  // INITIALIZE
  // ========================================

  function init() {
    detectDeviceType();
    detectHardware();
    detectNetwork();
    optimizeForTouch();
    handleOrientation();
    detectBattery();
    trackViewportChanges();
    applyDataAttributes();
    adaptToNetwork();
    setupResponsiveImages();

    // Monitor performance after 2 seconds
    setTimeout(monitorPerformance, 2000);

    console.log('✅ Device Optimization System ready');
    console.log('📊 Device Info:', deviceInfo);

    // Dispatch event
    window.dispatchEvent(new CustomEvent('deviceoptimization:ready', {
      detail: deviceInfo
    }));
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
