/**
 * Signal Pilot Docs - Feedback System
 * Adds "Was this helpful?" buttons to documentation pages
 * Tracks feedback via Google Analytics
 * Version: 1.0
 * Created: November 2025
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    containerSelector: '.md-content',  // Where to inject feedback widget
    gaEventName: 'page_feedback',
    thankYouDuration: 3000,  // How long to show "thank you" message (ms)
    position: 'bottom'  // 'top' or 'bottom' of content
  };

  // Feedback widget HTML template
  const FEEDBACK_HTML = `
    <div class="sp-feedback" id="sp-feedback-widget">
      <div class="sp-feedback__question">
        <p class="sp-feedback__text">Was this page helpful?</p>
        <div class="sp-feedback__buttons">
          <button class="sp-feedback__btn sp-feedback__btn--yes" data-helpful="yes" aria-label="Yes, this page was helpful">
            <span class="sp-feedback__icon">👍</span>
            <span class="sp-feedback__label">Yes</span>
          </button>
          <button class="sp-feedback__btn sp-feedback__btn--no" data-helpful="no" aria-label="No, this page was not helpful">
            <span class="sp-feedback__icon">👎</span>
            <span class="sp-feedback__label">No</span>
          </button>
        </div>
      </div>
      <div class="sp-feedback__thanks" style="display:none;">
        <span class="sp-feedback__icon">🙏</span>
        <p class="sp-feedback__thanks-text">Thanks for your feedback!</p>
        <p class="sp-feedback__sub-text">This helps us improve our documentation.</p>
      </div>
    </div>
  `;

  /**
   * Initialize feedback system when DOM is ready
   */
  function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initFeedbackWidget);
    } else {
      initFeedbackWidget();
    }
  }

  /**
   * Create and inject feedback widget into page
   */
  function initFeedbackWidget() {
    const container = document.querySelector(CONFIG.containerSelector);

    if (!container) {
      console.warn('SP Feedback: Container not found -', CONFIG.containerSelector);
      return;
    }

    // Don't show feedback on homepage or certain pages
    if (shouldExcludePage()) {
      console.log('SP Feedback: Page excluded from feedback widget');
      return;
    }

    // Create widget element
    const widgetElement = createWidgetElement();

    // Insert widget at top or bottom of content
    if (CONFIG.position === 'top') {
      container.insertBefore(widgetElement, container.firstChild);
    } else {
      container.appendChild(widgetElement);
    }

    // Attach event listeners
    attachEventListeners();

    // Check if user already provided feedback for this page
    checkExistingFeedback();
  }

  /**
   * Create widget DOM element from HTML template
   */
  function createWidgetElement() {
    const temp = document.createElement('div');
    temp.innerHTML = FEEDBACK_HTML.trim();
    return temp.firstChild;
  }

  /**
   * Attach click event listeners to feedback buttons
   */
  function attachEventListeners() {
    const yesBtn = document.querySelector('.sp-feedback__btn--yes');
    const noBtn = document.querySelector('.sp-feedback__btn--no');

    if (yesBtn) {
      yesBtn.addEventListener('click', function() {
        handleFeedback('yes', this);
      });
    }

    if (noBtn) {
      noBtn.addEventListener('click', function() {
        handleFeedback('no', this);
      });
    }
  }

  /**
   * Handle feedback button click
   * @param {string} feedback - 'yes' or 'no'
   * @param {HTMLElement} button - Button that was clicked
   */
  function handleFeedback(feedback, button) {
    const page = window.location.pathname;

    // Track in Google Analytics
    trackFeedback(feedback, page);

    // Store in localStorage to prevent duplicate feedback
    storeFeedback(page, feedback);

    // Show thank you message
    showThankYou();

    // Add visual feedback to button
    button.classList.add('sp-feedback__btn--clicked');
  }

  /**
   * Track feedback event in Google Analytics
   * @param {string} helpful - 'yes' or 'no'
   * @param {string} page - Page path
   */
  function trackFeedback(helpful, page) {
    // Check if gtag is available (Google Analytics)
    if (typeof gtag !== 'undefined') {
      gtag('event', CONFIG.gaEventName, {
        'helpful': helpful,
        'page_path': page,
        'page_title': document.title
      });
      console.log('SP Feedback: Tracked to GA -', helpful, page);
    } else {
      console.warn('SP Feedback: Google Analytics not available');
    }

    // Also send custom event for other analytics tools
    const event = new CustomEvent('sp_feedback', {
      detail: { helpful, page, title: document.title }
    });
    document.dispatchEvent(event);
  }

  /**
   * Store feedback in localStorage
   * @param {string} page - Page path
   * @param {string} feedback - 'yes' or 'no'
   */
  function storeFeedback(page, feedback) {
    try {
      const key = `sp_feedback_${page}`;
      const data = {
        feedback: feedback,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('SP Feedback: Could not store in localStorage', error);
    }
  }

  /**
   * Check if user already provided feedback for this page
   */
  function checkExistingFeedback() {
    try {
      const page = window.location.pathname;
      const key = `sp_feedback_${page}`;
      const stored = localStorage.getItem(key);

      if (stored) {
        const data = JSON.parse(stored);
        // If feedback was given less than 30 days ago, show thank you instead
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (new Date(data.timestamp) > thirtyDaysAgo) {
          showThankYou(true);  // permanent = true
        }
      }
    } catch (error) {
      console.warn('SP Feedback: Could not check existing feedback', error);
    }
  }

  /**
   * Show thank you message
   * @param {boolean} permanent - If true, keep thank you visible indefinitely
   */
  function showThankYou(permanent = false) {
    const widget = document.getElementById('sp-feedback-widget');
    if (!widget) return;

    const question = widget.querySelector('.sp-feedback__question');
    const thanks = widget.querySelector('.sp-feedback__thanks');

    if (question) question.style.display = 'none';
    if (thanks) thanks.style.display = 'block';

    // Fade out after duration (unless permanent)
    if (!permanent) {
      setTimeout(function() {
        widget.classList.add('sp-feedback--fade-out');
        setTimeout(function() {
          widget.style.display = 'none';
        }, 500);
      }, CONFIG.thankYouDuration);
    }
  }

  /**
   * Determine if current page should be excluded from feedback widget
   * @returns {boolean}
   */
  function shouldExcludePage() {
    const path = window.location.pathname;

    // Exclude list
    const excludePatterns = [
      /^\/$/, // Homepage
      /^\/404/, // 404 page
      /^\/search/i, // Search results
    ];

    return excludePatterns.some(pattern => pattern.test(path));
  }

  /**
   * Public API (if needed for manual control)
   */
  window.SPFeedback = {
    show: initFeedbackWidget,
    hide: function() {
      const widget = document.getElementById('sp-feedback-widget');
      if (widget) widget.style.display = 'none';
    },
    reset: function() {
      const page = window.location.pathname;
      const key = `sp_feedback_${page}`;
      localStorage.removeItem(key);
      location.reload();
    }
  };

  // Auto-initialize
  init();

})();
