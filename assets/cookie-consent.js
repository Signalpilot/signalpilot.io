/**
 * Cookie Consent Manager
 * GDPR/CCPA compliant consent management
 * Blocks Clarity + GA4 until consent is given
 */

(function() {
  'use strict';

  const CONSENT_KEY = 'sp_cookie_consent';
  const CONSENT_VERSION = '1.0';

  // Default consent state
  const defaultConsent = {
    version: CONSENT_VERSION,
    timestamp: null,
    essential: true, // Always true, no consent needed
    analytics: false
  };

  // Get current consent
  function getConsent() {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        const consent = JSON.parse(stored);
        // Check if version matches
        if (consent.version === CONSENT_VERSION) {
          return consent;
        }
      }
    } catch (e) {
      console.error('Error reading consent:', e);
    }
    return null;
  }

  // Save consent
  function saveConsent(consent) {
    try {
      consent.timestamp = new Date().toISOString();
      consent.version = CONSENT_VERSION;
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
      console.log('✅ Cookie consent saved:', consent);
    } catch (e) {
      console.error('Error saving consent:', e);
    }
  }

  // Load analytics scripts
  function loadAnalytics() {
    console.log('📊 Loading analytics with consent...');

    // Load Microsoft Clarity
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "txh7b3h2ja");

    // Load Google Analytics 4
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-3RCZ0JBB0V';
    document.head.appendChild(gaScript);

    gaScript.onload = function() {
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-3RCZ0JBB0V', {
        'anonymize_ip': true
      });
      window.gtag = gtag;
    };

    console.log('✅ Analytics loaded');
  }

  // Show banner
  function showBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      // Force fixed positioning with inline styles for iOS Safari compatibility
      banner.style.cssText = 'display:block !important; position:fixed !important; bottom:0 !important; left:0 !important; right:0 !important; z-index:10001 !important;';
    }
  }

  // Hide banner
  function hideBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.style.display = 'none';
    }
  }

  // Accept all cookies
  function acceptAll() {
    const consent = {
      essential: true,
      analytics: true
    };
    saveConsent(consent);
    hideBanner();
    loadAnalytics();
  }

  // Decline optional cookies
  function declineAll() {
    const consent = {
      essential: true,
      analytics: false
    };
    saveConsent(consent);
    hideBanner();
    console.log('❌ Analytics declined');
  }

  // Show preferences modal
  function showPreferences() {
    const modal = document.getElementById('cookie-preferences-modal');
    if (modal) {
      modal.style.display = 'flex';
      
      // Load current preferences
      const consent = getConsent() || defaultConsent;
      document.getElementById('analytics-toggle').checked = consent.analytics;
    }
  }

  // Hide preferences modal
  function hidePreferences() {
    const modal = document.getElementById('cookie-preferences-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Save preferences from modal
  function savePreferences() {
    const analyticsEnabled = document.getElementById('analytics-toggle').checked;
    
    const consent = {
      essential: true,
      analytics: analyticsEnabled
    };
    
    saveConsent(consent);
    hidePreferences();
    hideBanner();

    if (analyticsEnabled) {
      loadAnalytics();
    }

    // Show confirmation
    console.log('✅ Preferences saved:', consent);
  }

  // Initialize consent system
  function init() {
    // Check if consent already given
    const consent = getConsent();

    if (consent) {
      console.log('📋 Existing consent found:', consent);
      
      // Load analytics if consented
      if (consent.analytics) {
        loadAnalytics();
      }
    } else {
      // No consent yet, show banner
      console.log('🍪 No consent found, showing banner');
      showBanner();
    }

    // Setup event listeners
    const acceptBtn = document.getElementById('cookie-accept-all');
    const declineBtn = document.getElementById('cookie-decline-all');
    const settingsBtn = document.getElementById('cookie-settings');
    const closeModalBtn = document.getElementById('cookie-preferences-close');
    const savePrefsBtn = document.getElementById('cookie-save-preferences');
    const cancelPrefsBtn = document.getElementById('cookie-cancel-preferences');

    if (acceptBtn) acceptBtn.addEventListener('click', acceptAll);
    if (declineBtn) declineBtn.addEventListener('click', declineAll);
    if (settingsBtn) settingsBtn.addEventListener('click', showPreferences);
    if (closeModalBtn) closeModalBtn.addEventListener('click', hidePreferences);
    if (savePrefsBtn) savePrefsBtn.addEventListener('click', savePreferences);
    if (cancelPrefsBtn) cancelPrefsBtn.addEventListener('click', hidePreferences);

    // Close modal on background click
    const modal = document.getElementById('cookie-preferences-modal');
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          hidePreferences();
        }
      });
    }

    // Expose global function for "Manage Cookies" links
    window.manageCookiePreferences = showPreferences;

    console.log('🍪 Cookie consent system initialized');
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
