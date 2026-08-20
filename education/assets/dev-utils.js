// Development utilities
// Wraps console methods to only log in development mode

(function() {
  'use strict';

  // Check if we're in development mode
  // In production, set ?debug=true in URL to enable logs
  const isDev = window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1' ||
                window.location.search.includes('debug=true');

  // Store original console methods
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalInfo = console.info;

  // Override console methods to only work in dev mode
  if (!isDev) {
    console.log = function() {};
    console.info = function() {};
    console.warn = function() {};
    // Keep console.error always enabled for critical issues
  }

  // Expose isDev flag globally if needed
  window.IS_DEV = isDev;

  // Helper function for conditional logging (can be used explicitly)
  window.devLog = function(...args) {
    if (isDev) {
      originalLog.apply(console, args);
    }
  };

  // Utility: Extract lesson ID from current URL
  // Returns the lesson path (e.g., 'beginner/01-the-liquidity-lie') or null
  window.getLessonId = function() {
    const match = window.location.pathname.match(/curriculum\/(.+)\.html/);
    return match ? match[1] : null;
  };

  // Centralized localStorage keys
  // Use these constants instead of hardcoded strings
  window.STORAGE_KEYS = {
    PROGRESS: 'sp_progress',
    LESSON_CURRENT: 'sp_lesson_current',
    LESSON_START_TIME: 'sp_lesson_start_time',
    LESSON_NOTES: 'sp_lesson_notes',
    LEARNING_STREAK: 'sp_learning_streak',
    LAST_ARTICLE: 'sp_edu_last_article',
    CERTIFICATE_CODE: 'sp_certificate_code',
    USER_NAME: 'sp_user_name',
    CHATBOT_HISTORY: 'sp_chatbot_history',
    CHATBOT_BOOKMARKS: 'sp_chatbot_bookmarks',
    LAST_CLOUD_SYNC: 'sp_last_cloud_sync',
    INSTALL_DISMISSED: 'sp_install_dismissed',
    HIDE_UPDATE_NOTIFICATIONS: 'sp_hide_update_notifications',
    REVIEW_REMINDER_LAST_SHOWN: 'sp_review_reminder_last_shown'
  };
})();
