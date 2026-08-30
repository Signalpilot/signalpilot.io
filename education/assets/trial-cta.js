/**
 * Trial CTA System - SignalPilot Education Hub
 *
 * Displays strategic calls-to-action to prompt free learners to start a trial.
 * CTAs are shown at various points throughout lesson pages.
 */

(function() {
  'use strict';

  // ========================================
  // Configuration
  // ========================================
  const CONFIG = {
    // Trial offer details
    trialDays: 14,
    trialUrl: 'https://www.signalpilot.io/#pricing',
    pricingUrl: 'https://www.signalpilot.io/#pricing',

    // CTA trigger points
    inlineTriggerPercent: 50,      // Show inline CTA after 50% of content
    floatingTriggerPercent: 70,   // Show floating banner after 70% scroll
    completionTriggerPercent: 90, // Show completion CTA after 90% scroll

    // Display settings
    // NOTE: Floating CTA disabled - too aggressive, hurts UX
    // Focus on End-of-Lesson + Sidebar + Tier Unlock for best conversion
    showInlineCTA: false,       // Disabled: Can be spammy mid-content
    showFloatingCTA: false,     // Disabled: Pop-ups are annoying
    showSidebarCTA: false,      // Disabled: Using simple HTML links instead
    showCompletionCTA: true,    // Keep: Highest conversion point

    // Dismissal settings (in hours)
    inlineDismissHours: 24,
    floatingDismissHours: 4,

    // A/B test variants (can be extended)
    ctaVariant: 'default',

    // Analytics event names
    analytics: {
      ctaView: 'trial_cta_view',
      ctaClick: 'trial_cta_click',
      ctaDismiss: 'trial_cta_dismiss'
    }
  };

  // ========================================
  // CTA Content Variants
  // ========================================
  // ========================================
  // Contextual Pro Tips - Maps lesson keywords to relevant tools
  // ========================================
  const CONTEXTUAL_TIPS = {
    // Keyword -> Tool mapping for contextual "Pro Tip" blocks
    // All 7 indicators: Pentarch, Janus Atlas, Omnideck, Augury Grid, Volume Oracle, Harmonic Oscillator, Plutus Flow
    'liquidity': {
      tool: 'Janus Atlas',
      tip: 'You can identify these liquidity zones manually, or use <strong>Janus Atlas</strong> to plot them automatically in real-time.',
      icon: '🎯'
    },
    'volume': {
      tool: 'Volume Oracle',
      tip: 'Analyzing volume manually takes time. <strong>Volume Oracle</strong> highlights significant volume anomalies instantly.',
      icon: '📊'
    },
    'order flow': {
      tool: 'Plutus Flow',
      tip: 'Reading order flow from raw data is complex. <strong>Plutus Flow</strong> visualizes accumulation and distribution in real-time.',
      icon: '💹'
    },
    'market structure': {
      tool: 'Janus Atlas',
      tip: 'Mapping market structure by hand works, but <strong>Janus Atlas</strong> automates swing point detection across timeframes.',
      icon: '🏗️'
    },
    'cycles': {
      tool: 'Pentarch',
      tip: 'Cycle analysis requires patience. <strong>Pentarch</strong> identifies cycle positions automatically: TD, IGN, WRN, CAP, BDN.',
      icon: '🔄'
    },
    'divergence': {
      tool: 'Plutus Flow',
      tip: 'Spotting divergences manually is time-consuming. <strong>Plutus Flow</strong> detects them automatically as they form.',
      icon: '↔️'
    },
    'momentum': {
      tool: 'Harmonic Oscillator',
      tip: 'Combining multiple momentum indicators is complex. <strong>Harmonic Oscillator</strong> unifies MACD, RSI, and StochRSI into one score.',
      icon: '📈'
    },
    'screening': {
      tool: 'Augury Grid',
      tip: 'Scanning multiple symbols manually is tedious. <strong>Augury Grid</strong> monitors 8 symbols with quality scoring.',
      icon: '🔍'
    }
  };

  const CTA_CONTENT = {
    // Pro Tip inline blocks (educational, not salesy)
    inline: {
      default: {
        badge: '💡 Professional Workflow',
        title: 'Automate This Analysis',
        text: 'The concepts above can be applied manually, or you can use the SignalPilot indicator suite to automate detection and save hours of chart time.',
        cta: 'Explore the Suite',
        ctaSecondary: null
      }
    },

    // End-of-lesson CTA (highest conversion point)
    completion: {
      default: {
        icon: '📈',
        title: 'Apply What You\'ve Learned',
        text: 'Don\'t just read about these concepts—trade them. The SignalPilot Suite helps you execute the strategies taught in this curriculum.',
        stats: {
          lessons: '86',
          hours: '40+',
          indicators: '7'
        },
        cta: 'Activate Your License',
        ctaSecondary: 'Compare Plans'
      }
    },

    // Sidebar CTA (passive, always visible) - minimal design
    sidebar: {
      default: {
        icon: '⚡',
        title: 'Signal Pilot Suite',
        text: '7 professional indicators',
        cta: 'Learn more'
      }
    },

    // Floating CTA (disabled by default)
    floating: {
      default: {
        icon: '🎯',
        title: 'Ready to level up?',
        subtitle: 'Start your free 14-day Pro trial'
      }
    }
  };

  // ========================================
  // State Management
  // ========================================
  const state = {
    userType: 'free', // 'free', 'trial', 'subscribed'
    isLoggedIn: false,
    lessonsCompleted: 0,
    currentLesson: null,
    ctasShown: new Set(),
    scrollPercent: 0
  };

  // ========================================
  // Utility Functions
  // ========================================

  function getUserState() {
    // Check if user is logged in via Supabase
    if (window.supabaseAuth && typeof window.supabaseAuth.getCurrentUser === 'function') {
      const user = window.supabaseAuth.getCurrentUser();
      state.isLoggedIn = !!user;

      // Check subscription status from user metadata (if available)
      if (user && user.user_metadata) {
        state.userType = user.user_metadata.subscription_type || 'free';
      }
    }

    // Count completed lessons from localStorage
    let completed = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('_completed') && localStorage.getItem(key) === 'true') {
        completed++;
      }
    }
    state.lessonsCompleted = completed;

    // Get current lesson info from meta tags
    const levelMeta = document.querySelector('meta[name="sp-level"]');
    const orderMeta = document.querySelector('meta[name="sp-order"]');
    if (levelMeta && orderMeta) {
      state.currentLesson = {
        level: levelMeta.content,
        order: parseInt(orderMeta.content, 10)
      };
    }

    return state;
  }

  function shouldShowCTA() {
    // Don't show CTAs to subscribed users
    if (state.userType === 'subscribed') {
      document.body.classList.add('user-subscribed');
      return false;
    }
    return true;
  }

  function isDismissed(ctaType) {
    const dismissKey = `sp_cta_dismissed_${ctaType}`;
    const dismissed = localStorage.getItem(dismissKey);
    if (!dismissed) return false;

    const dismissedTime = parseInt(dismissed, 10);
    const hours = ctaType === 'floating' ? CONFIG.floatingDismissHours : CONFIG.inlineDismissHours;
    const expiryTime = dismissedTime + (hours * 60 * 60 * 1000);

    return Date.now() < expiryTime;
  }

  function dismissCTA(ctaType) {
    const dismissKey = `sp_cta_dismissed_${ctaType}`;
    localStorage.setItem(dismissKey, Date.now().toString());
    trackEvent(CONFIG.analytics.ctaDismiss, { cta_type: ctaType });
  }

  function trackEvent(eventName, data = {}) {
    // Integration with existing analytics
    if (window.spAnalytics && typeof window.spAnalytics.track === 'function') {
      window.spAnalytics.track(eventName, data);
    }

    // Also log to console in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('[Trial CTA]', eventName, data);
    }
  }

  function getScrollPercent() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return Math.min(100, Math.round((scrollTop / docHeight) * 100));
  }

  function getContentVariant(ctaType) {
    const variants = CTA_CONTENT[ctaType];
    const variantKey = CONFIG.ctaVariant;
    return variants[variantKey] || variants.default;
  }

  // ========================================
  // CTA Renderers
  // ========================================

  // Get contextual tip based on lesson content
  function getContextualTip() {
    const prose = document.querySelector('.prose');
    if (!prose) return null;

    const text = prose.textContent.toLowerCase();

    // Check for keyword matches in order of specificity
    const keywords = ['order flow', 'liquidity', 'market structure', 'volume', 'cycles', 'divergence'];
    for (const keyword of keywords) {
      if (text.includes(keyword) && CONTEXTUAL_TIPS[keyword]) {
        return CONTEXTUAL_TIPS[keyword];
      }
    }
    return null;
  }

  function renderInlineCTA() {
    const content = getContentVariant('inline');
    const contextualTip = getContextualTip();

    // If we have a contextual tip, use it for more relevant messaging
    const tipText = contextualTip
      ? contextualTip.tip
      : content.text;
    const tipIcon = contextualTip ? contextualTip.icon : '💡';

    return `
      <div class="trial-cta trial-cta-inline trial-cta-inline--protip" data-cta-type="inline">
        <div class="trial-cta-inline__header">
          <span class="trial-cta-inline__icon">${tipIcon}</span>
          <span class="trial-cta-inline__badge">${content.badge}</span>
        </div>
        <p class="trial-cta-inline__text">${tipText}</p>
        <a href="${CONFIG.pricingUrl}" class="trial-cta-inline__link" data-cta-action="explore">
          ${content.cta} →
        </a>
      </div>
    `;
  }

  function renderCompletionCTA() {
    const content = getContentVariant('completion');

    return `
      <div class="trial-cta trial-cta-completion" data-cta-type="completion">
        <div class="trial-cta-completion__icon">${content.icon}</div>
        <h3 class="trial-cta-completion__title">${content.title}</h3>
        <p class="trial-cta-completion__text">${content.text}</p>
        <div class="trial-cta-completion__stats">
          <div class="trial-cta-completion__stat">
            <span class="trial-cta-completion__stat-value">${content.stats.lessons}</span>
            <span class="trial-cta-completion__stat-label">Lessons</span>
          </div>
          <div class="trial-cta-completion__stat">
            <span class="trial-cta-completion__stat-value">${content.stats.hours}</span>
            <span class="trial-cta-completion__stat-label">Hours Content</span>
          </div>
          <div class="trial-cta-completion__stat">
            <span class="trial-cta-completion__stat-value">${content.stats.indicators}</span>
            <span class="trial-cta-completion__stat-label">SP Indicators</span>
          </div>
        </div>
        <div class="trial-cta-completion__actions">
          <a href="${CONFIG.pricingUrl}" class="trial-cta-btn trial-cta-btn--primary" data-cta-action="activate">
            ${content.cta}
          </a>
          ${content.ctaSecondary ? `
            <a href="${CONFIG.pricingUrl}#compare" class="trial-cta-btn trial-cta-btn--secondary" data-cta-action="compare">
              ${content.ctaSecondary}
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderSidebarCTA() {
    // Minimal sidebar links - non-distracting
    return `
      <div class="sidebar-links" style="margin-top:1rem;padding:0.75rem;background:var(--bg-elev);border-radius:8px;font-size:0.85rem" data-cta-type="sidebar">
        <a href="https://www.signalpilot.io" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:0.5rem;color:var(--muted);text-decoration:none;padding:0.5rem 0;border-bottom:1px solid var(--bg-soft)" data-cta-action="learn-more">
          <span>⚡</span> Signal Pilot Suite
        </a>
        <a href="https://discord.gg/5guVbGEyj8" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:0.5rem;color:var(--muted);text-decoration:none;padding:0.5rem 0;border-bottom:1px solid var(--bg-soft)">
          <span>💬</span> Discuss on Discord
        </a>
        <a href="https://www.signalpilot.io/affiliates.html" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:0.5rem;color:var(--muted);text-decoration:none;padding:0.5rem 0">
          <span>💰</span> Earn 15-30% as Affiliate
        </a>
      </div>
    `;
  }

  function renderFloatingCTA() {
    const content = getContentVariant('floating');

    const html = `
      <div class="trial-cta trial-cta-floating" data-cta-type="floating" id="trial-cta-floating">
        <div class="trial-cta-floating__content">
          <span class="trial-cta-floating__icon">${content.icon}</span>
          <div class="trial-cta-floating__text">
            <p class="trial-cta-floating__title">${content.title}</p>
            <p class="trial-cta-floating__subtitle">${content.subtitle}</p>
          </div>
        </div>
        <div class="trial-cta-floating__actions">
          <a href="${CONFIG.trialUrl}" class="trial-cta-btn trial-cta-btn--primary trial-cta-btn--sm" data-cta-action="start-trial">
            Start Free Trial
          </a>
          <button class="trial-cta-floating__close" data-cta-action="dismiss" aria-label="Dismiss">×</button>
        </div>
      </div>
    `;

    // Append to body
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container.firstElementChild);

    return document.getElementById('trial-cta-floating');
  }

  // ========================================
  // CTA Injection Functions
  // ========================================

  function injectInlineCTA() {
    if (!CONFIG.showInlineCTA || isDismissed('inline')) return;

    // Find the prose content area
    const prose = document.querySelector('.prose');
    if (!prose) return;

    // Find all section breaks (usually <hr> or headings)
    const sections = prose.querySelectorAll('h2, h3, hr');
    if (sections.length < 2) return;

    // Insert CTA after ~50% of sections
    const insertIndex = Math.floor(sections.length * (CONFIG.inlineTriggerPercent / 100));
    const insertPoint = sections[Math.min(insertIndex, sections.length - 1)];

    // Check if there's already a CTA placeholder
    const placeholder = prose.querySelector('[data-cta-placeholder="inline"]');
    if (placeholder) {
      placeholder.outerHTML = renderInlineCTA();
    } else if (insertPoint) {
      insertPoint.insertAdjacentHTML('afterend', renderInlineCTA());
    }

    trackEvent(CONFIG.analytics.ctaView, { cta_type: 'inline' });
    state.ctasShown.add('inline');
  }

  function injectSidebarCTA() {
    if (!CONFIG.showSidebarCTA) return;

    // Find the sidebar
    const sidebar = document.querySelector('.toc-sidebar, aside.toc');
    if (!sidebar) return;

    // Check if there's already a CTA placeholder
    const placeholder = sidebar.querySelector('[data-cta-placeholder="sidebar"]');
    if (placeholder) {
      placeholder.outerHTML = renderSidebarCTA();
    } else {
      // Insert after lesson actions
      const lessonActions = sidebar.querySelector('.lesson-actions');
      if (lessonActions) {
        lessonActions.insertAdjacentHTML('afterend', renderSidebarCTA());
      } else {
        sidebar.insertAdjacentHTML('beforeend', renderSidebarCTA());
      }
    }

    trackEvent(CONFIG.analytics.ctaView, { cta_type: 'sidebar' });
    state.ctasShown.add('sidebar');
  }

  function injectCompletionCTA() {
    if (!CONFIG.showCompletionCTA) return;

    // Find insertion points - prefer after quiz/key takeaways, before related lessons
    const quiz = document.querySelector('.quiz');
    const keyTakeaway = document.querySelector('.key-takeaway');
    const relatedLessons = document.querySelector('.section-break + div[style*="grid"]'); // Related lessons grid
    const relatedSection = Array.from(document.querySelectorAll('.section-break')).find(el =>
      el.textContent.toLowerCase().includes('related')
    );
    const discussionSection = document.querySelector('.discussion-section');
    const navArticle = document.querySelector('.nav-article, nav.article-nav');

    // Check if there's already a CTA placeholder
    const placeholder = document.querySelector('[data-cta-placeholder="completion"]');

    // Preferred insertion order: after quiz > after key takeaway > before related > before discussion
    let insertAfter = quiz || keyTakeaway;
    let insertBefore = relatedSection || discussionSection || navArticle;

    if (placeholder) {
      placeholder.outerHTML = renderCompletionCTA();
    } else if (insertAfter) {
      // Insert after quiz or key takeaway
      insertAfter.insertAdjacentHTML('afterend', renderCompletionCTA());
    } else if (insertBefore) {
      // Insert before related lessons or discussion
      insertBefore.insertAdjacentHTML('beforebegin', renderCompletionCTA());
    }

    trackEvent(CONFIG.analytics.ctaView, { cta_type: 'completion' });
    state.ctasShown.add('completion');
  }

  function initFloatingCTA() {
    if (!CONFIG.showFloatingCTA || isDismissed('floating')) return;

    const floatingCTA = renderFloatingCTA();
    let hasShown = false;

    // Show on scroll
    function checkScroll() {
      const scrollPercent = getScrollPercent();

      if (scrollPercent >= CONFIG.floatingTriggerPercent && !hasShown) {
        floatingCTA.classList.add('visible');
        hasShown = true;
        trackEvent(CONFIG.analytics.ctaView, { cta_type: 'floating' });
        state.ctasShown.add('floating');
      }
    }

    // Throttled scroll handler
    let ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          checkScroll();
          ticking = false;
        });
        ticking = true;
      }
    });

    // Handle dismiss
    floatingCTA.querySelector('[data-cta-action="dismiss"]').addEventListener('click', function() {
      floatingCTA.classList.remove('visible');
      dismissCTA('floating');
    });
  }

  // ========================================
  // Click Tracking
  // ========================================

  function initClickTracking() {
    document.addEventListener('click', function(e) {
      const ctaAction = e.target.closest('[data-cta-action]');
      if (!ctaAction) return;

      const action = ctaAction.dataset.ctaAction;
      const ctaContainer = ctaAction.closest('[data-cta-type]');
      const ctaType = ctaContainer ? ctaContainer.dataset.ctaType : 'unknown';

      trackEvent(CONFIG.analytics.ctaClick, {
        cta_type: ctaType,
        action: action,
        lesson: state.currentLesson ? `${state.currentLesson.level}-${state.currentLesson.order}` : 'unknown'
      });
    });
  }

  // ========================================
  // A/B Testing Support
  // ========================================

  function initABTest() {
    // Check for existing variant assignment
    let variant = localStorage.getItem('sp_cta_variant');

    if (!variant) {
      // Randomly assign variant (can be extended for more variants)
      const variants = ['default', 'urgency', 'value'];
      variant = variants[Math.floor(Math.random() * variants.length)];
      localStorage.setItem('sp_cta_variant', variant);
    }

    CONFIG.ctaVariant = variant;
  }

  // ========================================
  // Initialization
  // ========================================

  function init() {
    // Don't run on non-lesson pages
    if (!document.querySelector('.article, article')) return;

    // Get user state
    getUserState();

    // Check if we should show CTAs
    if (!shouldShowCTA()) return;

    // Initialize A/B testing
    initABTest();

    // Inject CTAs
    injectInlineCTA();
    injectSidebarCTA();
    initFloatingCTA();

    // Show completion CTA when user scrolls to end
    let completionShown = false;
    window.addEventListener('scroll', function() {
      if (completionShown) return;

      const scrollPercent = getScrollPercent();
      if (scrollPercent >= CONFIG.completionTriggerPercent) {
        injectCompletionCTA();
        completionShown = true;
      }
    });

    // Initialize click tracking
    initClickTracking();

    // Log initialization
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('[Trial CTA] Initialized', {
        userType: state.userType,
        isLoggedIn: state.isLoggedIn,
        lessonsCompleted: state.lessonsCompleted,
        variant: CONFIG.ctaVariant
      });
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for external use
  window.TrialCTA = {
    init: init,
    config: CONFIG,
    state: state,
    trackEvent: trackEvent,
    dismissCTA: dismissCTA,

    // Manual CTA injection methods
    showInline: injectInlineCTA,
    showSidebar: injectSidebarCTA,
    showCompletion: injectCompletionCTA,
    showFloating: initFloatingCTA
  };

})();
