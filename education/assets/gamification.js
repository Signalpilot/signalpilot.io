// gamification.js - Core XP & Level System for Signal Pilot Education Hub
// Version 1.0.0
(function() {
  'use strict';

  // XP rewards configuration
  const XP_CONFIG = {
    lessonComplete: 50,
    dailyStreak: 20,
    weekStreak: 100,
    tierComplete: 500,
    dailyChallenge: 100,
    badgeUnlock: 25,
    commentPosted: 15
  };
  // quizPass and quizPerfect are gone with the event that drove them: the
  // module quizzes are prose with worked answers and produce no score.

  // Level thresholds (XP needed for each level)
  const LEVELS = [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    500,    // Level 4
    1000,   // Level 5
    1750,   // Level 6
    2750,   // Level 7
    4000,   // Level 8
    5500,   // Level 9
    7500,   // Level 10
    10000,  // Level 11
    13000,  // Level 12
    17000,  // Level 13
    22000,  // Level 14
    28000   // Level 15+
  ];

  const Gamification = {
    totalXP: 0,
    level: 1,

    init() {
      this.loadUserXP();
      this.renderXPDisplay();
      // init() is public on window.Gamification. Binding twice would double
      // every award, so the listeners are bound once.
      if (!this._bound) {
        this._bound = true;
        this.listenForEvents();
      }
      console.log('[Gamification] Initialized - Level:', this.level, 'XP:', this.totalXP);
    },

    // Get current XP from localStorage
    loadUserXP() {
      this.totalXP = parseInt(localStorage.getItem('sp_total_xp') || '0');
      this.level = this.calculateLevel(this.totalXP);
    },

    // Calculate level from XP
    calculateLevel(xp) {
      for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVELS[i]) return i + 1;
      }
      return 1;
    },

    // Get XP progress to next level
    getLevelProgress() {
      const currentLevelXP = LEVELS[this.level - 1] || 0;
      const nextLevelXP = LEVELS[this.level] || LEVELS[LEVELS.length - 1];
      const progress = this.totalXP - currentLevelXP;
      const needed = nextLevelXP - currentLevelXP;
      return {
        progress: progress,
        needed: needed,
        percent: Math.min((progress / needed) * 100, 100)
      };
    },

    // Award XP and show animation
    awardXP(amount, reason) {
      if (amount <= 0) return;

      // XP is kept in localStorage like every other progress signal on this
      // site, so it works signed out. syncToCloud() below is a no-op without a
      // user, and loadProgressFromCloud merges it on sign-in.

      const oldLevel = this.level;
      this.totalXP += amount;
      this.level = this.calculateLevel(this.totalXP);

      // Save to localStorage
      localStorage.setItem('sp_total_xp', this.totalXP.toString());

      // Log XP transaction
      this.logXPTransaction(amount, reason);

      // Show XP popup
      this.showXPPopup(amount, reason);

      // Check for level up
      if (this.level > oldLevel) {
        setTimeout(() => this.showLevelUpModal(this.level), 500);
      }

      // Update header display
      this.renderXPDisplay();

      // Sync to cloud if available
      this.syncToCloud();

      console.log('[Gamification] +' + amount + ' XP for:', reason, '| Total:', this.totalXP);
    },

    // Show +XP popup animation
    showXPPopup(amount, reason) {
      // Remove existing popup if any
      const existing = document.querySelector('.xp-popup');
      if (existing) existing.remove();

      const popup = document.createElement('div');
      popup.className = 'xp-popup';

      const progress = this.getLevelProgress();
      popup.innerHTML = `
        <div class="xp-amount">+${amount} XP</div>
        <div class="xp-reason">${reason}</div>
        <div class="xp-bar">
          <div class="xp-bar-fill" style="width: ${progress.percent}%"></div>
        </div>
        <div class="xp-level-info">Level ${this.level} - ${progress.progress}/${progress.needed} XP</div>
      `;
      document.body.appendChild(popup);

      // Animate in
      requestAnimationFrame(() => {
        popup.classList.add('show');
      });

      // Remove after 3.5 seconds
      setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
      }, 3500);
    },

    // Show level up celebration
    showLevelUpModal(newLevel) {
      const modal = document.createElement('div');
      modal.className = 'level-up-modal';
      modal.innerHTML = `
        <div class="level-up-content">
          <div class="level-up-stars">&#9733; &#9733; &#9733;</div>
          <div class="level-up-icon">&#127881;</div>
          <h2>LEVEL UP!</h2>
          <div class="new-level">Level ${newLevel}</div>
          <p>Keep learning to unlock more rewards!</p>
          <button class="level-up-btn" onclick="this.closest('.level-up-modal').remove()">Continue</button>
        </div>
      `;
      document.body.appendChild(modal);

      // Auto-close after 5 seconds
      setTimeout(() => {
        if (modal.parentNode) modal.remove();
      }, 5000);
    },

    // Render XP in header - disabled to reduce header clutter on mobile
    renderXPDisplay() {
      // Level display removed from header - users can see XP in My Library
      return;
    },

    // Format large XP numbers
    formatXP(xp) {
      if (xp >= 10000) {
        return (xp / 1000).toFixed(1) + 'k';
      }
      return xp.toString();
    },

    // Show XP stats popup
    showXPStats() {
      const existing = document.querySelector('.xp-stats-popup');
      if (existing) {
        existing.remove();
        return;
      }

      const progress = this.getLevelProgress();
      const transactions = JSON.parse(localStorage.getItem('sp_xp_log') || '[]');
      const recent = transactions.slice(-5).reverse();

      const popup = document.createElement('div');
      popup.className = 'xp-stats-popup';
      popup.innerHTML = `
        <div class="xp-stats-header">
          <h4>Your Progress</h4>
          <button class="xp-stats-close" onclick="this.closest('.xp-stats-popup').remove()">&times;</button>
        </div>
        <div class="xp-stats-body">
          <div class="xp-stats-level">
            <div class="xp-stats-level-num">Level ${this.level}</div>
            <div class="xp-stats-bar">
              <div class="xp-stats-bar-fill" style="width: ${progress.percent}%"></div>
            </div>
            <div class="xp-stats-xp">${progress.progress} / ${progress.needed} XP to Level ${this.level + 1}</div>
          </div>
          <div class="xp-stats-total">Total XP: <strong>${this.totalXP}</strong></div>
          ${recent.length > 0 ? `
            <div class="xp-stats-recent">
              <h5>Recent Activity</h5>
              ${recent.map(t => `<div class="xp-transaction">+${t.amount} - ${t.reason}</div>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
      document.body.appendChild(popup);

      // Close on outside click
      // The header XP element this used to exclude was removed when
      // renderXPDisplay() was disabled, so getElementById returned null and the
      // popup could never be dismissed: the handler threw before popup.remove().
      setTimeout(() => {
        document.addEventListener('click', function closePopup(e) {
          const trigger = document.getElementById('xp-display');
          if (popup.contains(e.target)) return;
          if (trigger && trigger.contains(e.target)) return;
          popup.remove();
          document.removeEventListener('click', closePopup);
        });
      }, 100);
    },

    // Listen for events that award XP
    listenForEvents() {
      // Lesson completed
      window.addEventListener('sp:lessonCompleted', (e) => {
        this.awardXP(XP_CONFIG.lessonComplete, 'Lesson completed!');
      });

      // Comment posted. discussions.js dispatches this with the note "Dispatch
      // event for XP reward" and nothing had ever awarded it.
      window.addEventListener('sp:commentPosted', () => {
        this.awardXP(XP_CONFIG.commentPosted, 'Joined the discussion!');
      });

      // Streak maintained
      window.addEventListener('sp:streakUpdated', (e) => {
        const streak = e.detail?.streak || 0;
        if (streak > 0 && streak % 7 === 0) {
          this.awardXP(XP_CONFIG.weekStreak, streak + '-day streak bonus!');
        }
      });

      // Daily challenge completed
      window.addEventListener('sp:challengeCompleted', (e) => {
        const xp = e.detail?.xp || XP_CONFIG.dailyChallenge;
        this.awardXP(xp, 'Daily challenge complete!');
      });

      // Badge unlocked
      window.addEventListener('sp:badgeUnlocked', (e) => {
        const badge = e.detail?.badge || 'Badge';
        this.awardXP(XP_CONFIG.badgeUnlock, 'Badge: ' + badge);
      });

      // Tier completed
      window.addEventListener('sp:tierCompleted', (e) => {
        const tier = e.detail?.tier || 'Tier';
        this.awardXP(XP_CONFIG.tierComplete, tier + ' completed!');
      });
    },

    // Log transaction for history
    logXPTransaction(amount, reason) {
      const transactions = JSON.parse(localStorage.getItem('sp_xp_log') || '[]');
      transactions.push({
        amount: amount,
        reason: reason,
        timestamp: new Date().toISOString(),
        totalAfter: this.totalXP
      });
      // Keep last 100 transactions
      while (transactions.length > 100) {
        transactions.shift();
      }
      localStorage.setItem('sp_xp_log', JSON.stringify(transactions));
    },

    // Sync to Supabase (if available)
    syncToCloud() {
      if (typeof window.supabase === 'undefined' || !window.currentUser) return;

      try {
        window.supabase
          .from('user_progress')
          .upsert({
            user_id: window.currentUser.id,
            total_xp: this.totalXP,
            level: this.level,
            updated_at: new Date().toISOString()
          })
          .then(() => console.log('[Gamification] Synced to cloud'))
          .catch(err => console.warn('[Gamification] Sync failed:', err));
      } catch (err) {
        console.warn('[Gamification] Cloud sync error:', err);
      }
    },

    // Get XP config for external use
    getXPConfig() {
      return { ...XP_CONFIG };
    },

    // Get levels config for external use
    getLevelsConfig() {
      return [...LEVELS];
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Gamification.init());
  } else {
    Gamification.init();
  }

  // Expose globally
  window.Gamification = Gamification;

})();
