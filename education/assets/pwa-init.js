// PWA Initialization and Service Worker Registration
(function() {
  'use strict';

  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    logger.log('[PWA] Service Workers not supported');
    return;
  }

  // Register service worker
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/education/sw.js', {
      scope: '/education/'
    })
    .then((registration) => {
      logger.log('[PWA] Service Worker registered successfully:', registration.scope);

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check every hour

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            showUpdateNotification();
          }
        });
      });
    })
    .catch((error) => {
      logger.log('[PWA] Service Worker registration failed:', error);
    });
  });

  // Handle service worker messages
  navigator.serviceWorker.addEventListener('message', (event) => {
    logger.log('[PWA] Message from SW:', event.data);

    if (event.data.type === 'CACHE_UPDATED') {
      logger.log('[PWA] Cache updated for:', event.data.url);
    }
  });

  // Show update notification
  function showUpdateNotification() {
    // Check if user wants to see update notifications
    if (localStorage.getItem('sp_hide_update_notifications') === 'true') {
      return;
    }

    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
      <div class="pwa-notification-content">
        <span>📦 New version available!</span>
        <button onclick="window.location.reload()" class="btn btn-sm btn-primary">Update Now</button>
        <button onclick="this.parentElement.parentElement.remove()" class="btn btn-sm btn-ghost">Later</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  // Add CSS for update notification
  const style = document.createElement('style');
  style.textContent = `
    .pwa-update-notification {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    .pwa-notification-content {
      background: rgba(91, 138, 255, 0.95);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      max-width: 90vw;
    }

    .pwa-notification-content span {
      font-weight: 600;
    }

    .pwa-notification-content button {
      margin: 0;
    }

    @media (max-width: 480px) {
      .pwa-notification-content {
        flex-direction: column;
        gap: 0.75rem;
      }
    }
  `;
  document.head.appendChild(style);

  // Install prompt handling
  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    logger.log('[PWA] Install prompt available');

    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();

    // Store the event for later use
    deferredPrompt = e;

    // Show custom install button
    showInstallButton();
  });

  // Show install button
  function showInstallButton() {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      logger.log('[PWA] App already installed');
      return;
    }

    // Check if user dismissed install before
    if (localStorage.getItem('sp_install_dismissed') === 'true') {
      return;
    }

    // Create install banner
    const installBanner = document.createElement('div');
    installBanner.id = 'pwa-install-banner';
    installBanner.innerHTML = `
      <div class="pwa-install-content">
        <div class="pwa-install-icon">📱</div>
        <div class="pwa-install-text">
          <strong>Install Signal Pilot Education</strong>
          <p>Get quick access and offline learning</p>
        </div>
        <button id="pwa-install-btn" class="btn btn-primary btn-sm">Install</button>
        <button id="pwa-install-dismiss" class="btn btn-ghost btn-sm">✕</button>
      </div>
    `;

    // Add banner styles
    const bannerStyle = document.createElement('style');
    bannerStyle.textContent = `
      #pwa-install-banner {
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        animation: slideDown 0.3s ease;
        max-width: 90vw;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }

      .pwa-install-content {
        background: linear-gradient(135deg, rgba(91, 138, 255, 0.95), rgba(118, 221, 255, 0.95));
        backdrop-filter: blur(10px);
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 1rem;
        color: white;
      }

      .pwa-install-icon {
        font-size: 2rem;
      }

      .pwa-install-text {
        flex: 1;
      }

      .pwa-install-text strong {
        display: block;
        margin-bottom: 0.25rem;
        font-size: 1rem;
      }

      .pwa-install-text p {
        margin: 0;
        font-size: 0.85rem;
        opacity: 0.9;
      }

      @media (max-width: 640px) {
        #pwa-install-banner {
          top: auto;
          bottom: 20px;
        }

        .pwa-install-content {
          flex-direction: column;
          text-align: center;
        }
      }
    `;
    document.head.appendChild(bannerStyle);

    // Add banner to page
    document.body.appendChild(installBanner);

    // Handle install button click
    document.getElementById('pwa-install-btn').addEventListener('click', async () => {
      if (!deferredPrompt) return;

      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;
      logger.log('[PWA] Install outcome:', outcome);

      if (outcome === 'accepted') {
        logger.log('[PWA] User accepted install');

        // Track installation
        if (typeof trackAchievement === 'function') {
          trackAchievement('app_installed');
        }
      }

      // Remove banner
      installBanner.remove();
      deferredPrompt = null;
    });

    // Handle dismiss button
    document.getElementById('pwa-install-dismiss').addEventListener('click', () => {
      localStorage.setItem('sp_install_dismissed', 'true');
      installBanner.remove();
    });

    // Auto-remove after 15 seconds
    setTimeout(() => {
      if (installBanner.parentElement) {
        installBanner.remove();
      }
    }, 15000);
  }

  // Handle app installed event
  window.addEventListener('appinstalled', () => {
    logger.log('[PWA] App installed successfully');

    // Track installation
    if (typeof trackAchievement === 'function') {
      trackAchievement('app_installed');
    }

    // Show success message
    alert('✅ Signal Pilot Education installed! You can now access lessons offline.');
  });

  // Detect if running as installed app
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    logger.log('[PWA] Running as installed app');
    document.documentElement.setAttribute('data-pwa-mode', 'standalone');

    // Track usage as installed app
    if (typeof plausible !== 'undefined') {
      plausible('PWA Launch');
    }
  }

  // Check for background sync support (for future use)
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    // Will be used for syncing progress to Supabase
    logger.log('[PWA] Background Sync supported');
  }

  logger.log('[PWA] Initialization complete');
})();
