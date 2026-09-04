// Social Sharing - Enhanced with completion milestones
(function() {
  'use strict';

  /**
   * Share on Twitter
   * @param {string} text - Text to share
   * @param {string} url - URL to share
   */
  function shareOnTwitter(text, url) {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');

    // Track analytics
    if (window.trackEvent) {
      window.trackEvent('social_share', { platform: 'twitter', type: text.includes('completed') ? 'completion' : 'lesson' });
    }
  }

  /**
   * Share on LinkedIn
   * @param {string} url - URL to share
   */
  function shareOnLinkedIn(url) {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');

    // Track analytics
    if (window.trackEvent) {
      window.trackEvent('social_share', { platform: 'linkedin' });
    }
  }

  /**
   * Copy link to clipboard
   * @param {string} url - URL to copy
   */
  function copyToClipboard(url) {
    navigator.clipboard.writeText(url).then(() => {
      showShareToast('✅ Link copied to clipboard!');

      // Track analytics
      if (window.trackEvent) {
        window.trackEvent('social_share', { platform: 'clipboard' });
      }
    }).catch(() => {
      showShareToast('❌ Could not copy link');
    });
  }

  /**
   * Show toast notification
   */
  function showShareToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, rgba(91, 138, 255, 0.95), rgba(118, 221, 255, 0.95));
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      font-weight: 600;
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Tier sizes, refreshed from the catalogue so a renumber cannot leave a
  // milestone that never fires.
  const TIER_TOTALS = { Beginner: 24, Intermediate: 28, Advanced: 18, Professional: 15, all: 85 };

  function loadTotals() {
    return fetch('/education/curriculum/index.json', { cache: 'no-store' })
      .then(r => r.json())
      .then(cat => {
        ['Beginner', 'Intermediate', 'Advanced', 'Professional'].forEach(level => {
          const n = cat.filter(e => e.level === level).length;
          if (n) TIER_TOTALS[level] = n;
        });
        if (cat.length) TIER_TOTALS.all = cat.length;
      })
      .catch(() => {});
  }

  /**
   * Check for completion milestones and offer sharing
   */
  function checkCompletionMilestones() {
    // Count total completed lessons
    const allCompleted = Object.keys(localStorage).filter(k =>
      k.startsWith('sp_edu_') && k.endsWith('_completed') && !k.includes('_ach_')
    ).length;

    // Count tier-specific completions.
    //
    // A lesson page writes sp_edu_<Level>_<slot>_completed, with the level
    // capitalised, so the lowercase prefixes this used never matched a key
    // that had been written and every tier count was zero. The totals were
    // typed too, at 20/27/35/86 against a curriculum of 24/28/18/15 and 85,
    // with no professional milestone at all.
    const countTier = level => Object.keys(localStorage).filter(k =>
      k.startsWith(`sp_edu_${level}_`) && k.endsWith('_completed')
    ).length;

    const beginnerCompleted     = countTier('Beginner');
    const intermediateCompleted = countTier('Intermediate');
    const advancedCompleted     = countTier('Advanced');
    const professionalCompleted = countTier('Professional');

    // Tier sizes come from the catalogue; TIER_TOTALS is refreshed by
    // loadTotals() below and falls back to the sizes at time of writing.
    const BEGINNER_TOTAL     = TIER_TOTALS.Beginner;
    const INTERMEDIATE_TOTAL = TIER_TOTALS.Intermediate;
    const ADVANCED_TOTAL     = TIER_TOTALS.Advanced;
    const PROFESSIONAL_TOTAL = TIER_TOTALS.Professional;
    const TOTAL_LESSONS      = TIER_TOTALS.all;

    // Define milestones with tier-specific tracking
    const milestones = [
      { count: 1, key: 'first', name: 'your first lesson', type: 'total' },
      { count: 5, key: '5_lessons', name: '5 lessons', type: 'total' },
      { count: BEGINNER_TOTAL, key: 'beginner_tier', name: `Beginner Tier Complete (all ${BEGINNER_TOTAL} beginner lessons)`, type: 'tier', tier: 'beginner', tierCount: beginnerCompleted, tierTotal: BEGINNER_TOTAL },
      { count: INTERMEDIATE_TOTAL, key: 'intermediate_tier', name: `Intermediate Tier Complete (all ${INTERMEDIATE_TOTAL} intermediate lessons)`, type: 'tier', tier: 'intermediate', tierCount: intermediateCompleted, tierTotal: INTERMEDIATE_TOTAL },
      { count: ADVANCED_TOTAL, key: 'advanced_tier', name: `Advanced Tier Complete (all ${ADVANCED_TOTAL} advanced lessons)`, type: 'tier', tier: 'advanced', tierCount: advancedCompleted, tierTotal: ADVANCED_TOTAL },
      { count: PROFESSIONAL_TOTAL, key: 'professional_tier', name: `Professional Tier Complete (all ${PROFESSIONAL_TOTAL} professional lessons)`, type: 'tier', tier: 'professional', tierCount: professionalCompleted, tierTotal: PROFESSIONAL_TOTAL },
      { count: TOTAL_LESSONS, key: 'complete_mastery', name: `all ${TOTAL_LESSONS} lessons - Complete Mastery`, type: 'total' }
    ];

    // Check each milestone
    milestones.forEach(milestone => {
      const sharedKey = `sp_shared_milestone_${milestone.key}`;

      // Skip if already shared
      if (localStorage.getItem(sharedKey)) return;

      let shouldTrigger = false;

      if (milestone.type === 'total') {
        // Total lesson count milestones
        shouldTrigger = (allCompleted === milestone.count);
      } else if (milestone.type === 'tier') {
        // Tier-specific milestones - only trigger when tier is 100% complete
        shouldTrigger = (milestone.tierCount === milestone.tierTotal);
      }

      if (shouldTrigger) {
        setTimeout(() => {
          showSharePrompt(milestone.key, milestone.name);
        }, 2000); // Show after 2 seconds
      }
    });
  }

  /**
   * Show share prompt for milestones
   */
  function showSharePrompt(milestoneKey, milestoneName) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      animation: fadeIn 0.3s ease;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
      background: linear-gradient(135deg, #0a0e1a, #1a2332);
      border: 2px solid rgba(91, 138, 255, 0.3);
      border-radius: 16px;
      padding: 1.5rem;
      max-width: 500px;
      width: calc(100vw - 2rem);
      margin: 0 1rem;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      box-sizing: border-box;
    `;

    // Add responsive padding for larger screens
    if (window.innerWidth > 480) {
      card.style.padding = '2rem';
    }

    // Stack buttons vertically on very small screens
    const isMobile = window.innerWidth < 380;
    const buttonContainer = isMobile
      ? 'display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;'
      : 'display: flex; gap: 0.75rem; justify-content: center; margin-bottom: 1.5rem; flex-wrap: wrap;';

    const buttonStyle = isMobile
      ? 'width: 100%; font-size: 0.95rem; padding: 0.75rem 1rem;'
      : 'flex: 1; min-width: 130px; max-width: 200px; font-size: clamp(0.85rem, 3vw, 1rem); padding: 0.75rem 1rem;';

    card.innerHTML = `
      <div style="font-size: clamp(3rem, 8vw, 4rem); margin-bottom: 1rem;">🎉</div>
      <h2 style="margin: 0 0 1rem 0; color: #5b8aff; font-size: clamp(1.5rem, 5vw, 2rem);">Milestone Achieved!</h2>
      <p style="font-size: clamp(1rem, 3.5vw, 1.2rem); margin-bottom: 1.5rem;">You've completed ${milestoneName}!</p>
      <p style="color: var(--muted); margin-bottom: 2rem; font-size: clamp(0.9rem, 3vw, 1rem);">Share your progress and inspire others</p>

      <div style="${buttonContainer}">
        <button id="share-twitter" class="btn btn-primary" style="${buttonStyle}">
          Share on Twitter
        </button>
        <button id="share-linkedin" class="btn btn-primary" style="${buttonStyle}">
          Share on LinkedIn
        </button>
      </div>

      <button id="share-later" class="btn btn-ghost btn-sm">Maybe later</button>
    `;

    modal.appendChild(card);
    document.body.appendChild(modal);

    const shareText = `Just completed ${milestoneName} at Signal Pilot Education! 🚀 #Trading #Education`;
    const shareUrl = 'https://www.signalpilot.io/education';

    document.getElementById('share-twitter').onclick = () => {
      shareOnTwitter(shareText, shareUrl);
      localStorage.setItem(`sp_shared_milestone_${milestoneKey}`, 'true');
      modal.remove();
    };

    document.getElementById('share-linkedin').onclick = () => {
      shareOnLinkedIn(shareUrl);
      localStorage.setItem(`sp_shared_milestone_${milestoneKey}`, 'true');
      modal.remove();
    };

    document.getElementById('share-later').onclick = () => {
      localStorage.setItem(`sp_shared_milestone_${milestoneKey}`, 'true');
      modal.remove();
    };

    // Close on background click
    modal.onclick = (e) => {
      if (e.target === modal) {
        localStorage.setItem(`sp_shared_milestone_${milestoneKey}`, 'true');
        modal.remove();
      }
    };
  }

  /**
   * Add share buttons to lesson pages
   */
  function addShareButtons() {
    // Only add to lesson pages
    if (!window.location.pathname.includes('/education/curriculum/')) return;

    // Don't add if already exists
    if (document.querySelector('.social-share')) return;

    // Try to find Related Lessons section first (better placement)
    let insertTarget = null;

    // Check section-breaks first
    const sectionBreaks = document.querySelectorAll('.section-break');
    for (const sb of sectionBreaks) {
      if (sb.textContent.includes('Related Lessons')) {
        insertTarget = sb;
        break;
      }
    }

    // If not found, check h3 headings (some lessons use h3 for Related Lessons)
    if (!insertTarget) {
      const headings = document.querySelectorAll('.prose h3');
      for (const h3 of headings) {
        if (h3.textContent.includes('Related Lessons')) {
          insertTarget = h3;
          break;
        }
      }
    }

    // Fallback to nav-article if Related Lessons not found
    if (!insertTarget) {
      insertTarget = document.querySelector('.nav-article');
    }

    if (!insertTarget) return;

    // Create share section
    const shareSection = document.createElement('div');
    shareSection.className = 'social-share';
    shareSection.innerHTML = `
      <h4 style="margin: 0 0 1rem 0; font-size: 1rem;">Share this lesson:</h4>
      <div class="social-share-buttons">
        <a href="#" class="social-btn twitter" data-share="twitter" aria-label="Share on X (Twitter)" title="Share on X">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          <span>X</span>
        </a>
        <a href="#" class="social-btn reddit" data-share="reddit" aria-label="Share on Reddit" title="Share on Reddit">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
          <span>Reddit</span>
        </a>
        <a href="#" class="social-btn linkedin" data-share="linkedin" aria-label="Share on LinkedIn" title="Share on LinkedIn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          <span>LinkedIn</span>
        </a>
        <a href="#" class="social-btn facebook" data-share="facebook" aria-label="Share on Facebook" title="Share on Facebook">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          <span>Facebook</span>
        </a>
        <a href="#" class="social-btn whatsapp" data-share="whatsapp" aria-label="Share on WhatsApp" title="Share on WhatsApp">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          <span>WhatsApp</span>
        </a>
        <a href="#" class="social-btn telegram" data-share="telegram" aria-label="Share on Telegram" title="Share on Telegram">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          <span>Telegram</span>
        </a>
        <a href="#" class="social-btn email" data-share="email" aria-label="Share via Email" title="Share via Email">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <span>Email</span>
        </a>
        <a href="#" class="social-btn copy-link" data-share="copy" aria-label="Copy link" title="Copy link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          <span>Copy</span>
        </a>
      </div>
    `;

    // Insert before target (Related Lessons or nav-article)
    insertTarget.parentNode.insertBefore(shareSection, insertTarget);

    // Add click handlers
    shareSection.querySelectorAll('[data-share]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const type = btn.dataset.share;
        const url = window.location.href;
        const title = document.title.split('—')[0].trim();

        switch(type) {
          case 'twitter':
            shareOnTwitter(`Just learned about "${title}" on Signal Pilot Education 📚`, url);
            break;
          case 'reddit':
            window.open(`https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
            break;
          case 'linkedin':
            shareOnLinkedIn(url);
            break;
          case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
            break;
          case 'whatsapp':
            window.open(`https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`, '_blank');
            break;
          case 'telegram':
            window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
            break;
          case 'email':
            window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this lesson: ${title}\n\n${url}`)}`;
            break;
          case 'copy':
            copyToClipboard(url);
            break;
        }
      });
    });
  }

  // Initialize
  function init() {
    addShareButtons();
    loadTotals().then(checkCompletionMilestones);
    logger.log('[Social Share] Initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export public API
  window.socialShare = {
    shareOnTwitter,
    shareOnLinkedIn,
    copyToClipboard,
    checkMilestones: checkCompletionMilestones
  };

})();
