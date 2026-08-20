// Production-safe logger utility
// Automatically disabled in production unless DEBUG_MODE is set

(function() {
  'use strict';

  // Check if we're in debug mode
  // Enable debug mode by setting: localStorage.setItem('DEBUG_MODE', 'true')
  const isDebugMode = () => {
    try {
      return localStorage.getItem('DEBUG_MODE') === 'true' ||
             window.location.hostname === 'localhost' ||
             window.location.hostname === '127.0.0.1';
    } catch (e) {
      return false;
    }
  };

  // Create logger object
  window.logger = {
    log: function(...args) {
      if (isDebugMode()) {
        console.log(...args);
      }
    },
    error: function(...args) {
      // Always show errors
      console.error(...args);
    },
    warn: function(...args) {
      if (isDebugMode()) {
        console.warn(...args);
      }
    },
    info: function(...args) {
      if (isDebugMode()) {
        console.info(...args);
      }
    },
    debug: function(...args) {
      if (isDebugMode()) {
        console.log('[DEBUG]', ...args);
      }
    }
  };

  // For backwards compatibility, allow console methods but wrap them
  // Note: This doesn't override global console, just provides wrapped version
  window.safeConsole = {
    log: window.logger.log,
    error: window.logger.error,
    warn: window.logger.warn,
    info: window.logger.info
  };

  console.log('[Logger] Debug mode:', isDebugMode() ? 'ENABLED' : 'DISABLED (set localStorage.DEBUG_MODE=true to enable)');
})();
