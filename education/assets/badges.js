// badges.js - Badge System for Signal Pilot Education Hub
// Version 1.0.0
(function() {
  'use strict';

  // Badge definitions
  const BADGES = {
    // Time-based badges
    earlyBird: {
      id: 'earlyBird',
      name: 'Early Bird',
      icon: '&#127749;', // sunrise
      emoji: '\u{1F305}',
      description: 'Complete a lesson before 8am',
      category: 'time',
      check: function(stats, context) {
        return context.hour !== undefined && context.hour < 8;
      }
    },
    nightOwl: {
      id: 'nightOwl',
      name: 'Night Owl',
      icon: '&#129417;', // owl
      emoji: '\u{1F989}',
      description: 'Complete a lesson after 10pm',
      category: 'time',
      check: function(stats, context) {
        return context.hour !== undefined && context.hour >= 22;
      }
    },
    weekendWarrior: {
      id: 'weekendWarrior',
      name: 'Weekend Warrior',
      icon: '&#9876;', // swords
      emoji: '\u{2694}',
      description: 'Complete 5 lessons on weekends',
      category: 'time',
      check: function(stats) {
        return stats.weekendLessons >= 5;
      }
    },

    // Achievement badges
    quizMaster: {
      id: 'quizMaster',
      name: 'Quiz Master',
      icon: '&#129504;', // brain
      emoji: '\u{1F9E0}',
      description: 'Score 100% on 10 quizzes',
      category: 'achievement',
      check: function(stats) {
        return stats.perfectQuizzes >= 10;
      }
    },
    speedReader: {
      id: 'speedReader',
      name: 'Speed Reader',
      icon: '&#9889;', // lightning
      emoji: '\u{26A1}',
      description: 'Complete a lesson in under 5 minutes',
      category: 'achievement',
      check: function(stats) {
        return stats.fastestLesson > 0 && stats.fastestLesson < 300;
      }
    },
    noteTaker: {
      id: 'noteTaker',
      name: 'Note Taker',
      icon: '&#128221;', // memo
      emoji: '\u{1F4DD}',
      description: 'Save 20 lesson notes',
      category: 'achievement',
      check: function(stats) {
        return stats.totalNotes >= 20;
      }
    },
    socialButterfly: {
      id: 'socialButterfly',
      name: 'Social Butterfly',
      icon: '&#129419;', // butterfly
      emoji: '\u{1F98B}',
      description: 'Share 5 achievements',
      category: 'achievement',
      check: function(stats) {
        return stats.totalShares >= 5;
      }
    },
    bookworm: {
      id: 'bookworm',
      name: 'Bookworm',
      icon: '&#128218;', // books
      emoji: '\u{1F4DA}',
      description: 'Read 10 lessons in one week',
      category: 'achievement',
      check: function(stats) {
        return stats.lessonsThisWeek >= 10;
      }
    },

    // Streak badges
    streakStarter: {
      id: 'streakStarter',
      name: 'Streak Starter',
      icon: '&#128293;', // fire
      emoji: '\u{1F525}',
      description: 'Maintain a 7-day streak',
      category: 'streak',
      check: function(stats) {
        return stats.currentStreak >= 7 || stats.bestStreak >= 7;
      }
    },
    streakChampion: {
      id: 'streakChampion',
      name: 'Streak Champion',
      icon: '&#127942;', // trophy
      emoji: '\u{1F3C6}',
      description: 'Maintain a 30-day streak',
      category: 'streak',
      check: function(stats) {
        return stats.currentStreak >= 30 || stats.bestStreak >= 30;
      }
    },
    streakLegend: {
      id: 'streakLegend',
      name: 'Streak Legend',
      icon: '&#128081;', // crown
      emoji: '\u{1F451}',
      description: 'Maintain a 100-day streak',
      category: 'streak',
      check: function(stats) {
        return stats.currentStreak >= 100 || stats.bestStreak >= 100;
      }
    },

    // Completion badges
    firstSteps: {
      id: 'firstSteps',
      name: 'First Steps',
      icon: '&#128099;', // footprints
      emoji: '\u{1F463}',
      description: 'Complete your first lesson',
      category: 'completion',
      check: function(stats) {
        return stats.lessonsCompleted >= 1;
      }
    },
    gettingStarted: {
      id: 'gettingStarted',
      name: 'Getting Started',
      icon: '&#127919;', // target
      emoji: '\u{1F3AF}',
      description: 'Complete 10 lessons',
      category: 'completion',
      check: function(stats) {
        return stats.lessonsCompleted >= 10;
      }
    },
    halfwayThere: {
      id: 'halfwayThere',
      name: 'Halfway There',
      icon: '&#11088;', // star
      emoji: '\u{2B50}',
      description: 'Complete 41 lessons',
      category: 'completion',
      check: function(stats) {
        return stats.lessonsCompleted >= 41;
      }
    },
    almostThere: {
      id: 'almostThere',
      name: 'Almost There',
      icon: '&#128170;', // flexed biceps
      emoji: '\u{1F4AA}',
      description: 'Complete 70 lessons',
      category: 'completion',
      check: function(stats) {
        return stats.lessonsCompleted >= 70;
      }
    },
    graduateScholar: {
      id: 'graduateScholar',
      name: 'Graduate Scholar',
      icon: '&#127891;', // graduation cap
      emoji: '\u{1F393}',
      description: 'Complete all 86 lessons',
      category: 'completion',
      check: function(stats) {
        return stats.lessonsCompleted >= 82;
      }
    },

    // Special badges
    dedicated: {
      id: 'dedicated',
      name: 'Dedicated Learner',
      icon: '&#128214;', // open book
      emoji: '\u{1F4D6}',
      description: 'Study for 10 total hours',
      category: 'special',
      check: function(stats) {
        return stats.totalTimeMinutes >= 600;
      }
    },
    perfectionist: {
      id: 'perfectionist',
      name: 'Perfectionist',
      icon: '&#10024;', // sparkles
      emoji: '\u{2728}',
      description: 'Score 100% on 5 quizzes in a row',
      category: 'special',
      check: function(stats) {
        return stats.perfectQuizStreak >= 5;
      }
    }
  };

  const BadgeSystem = {
    unlockedBadges: [],
    stats: {},

    init() {
      this.unlockedBadges = JSON.parse(localStorage.getItem('sp_earned_badges') || '[]');
      this.stats = this.loadStats();
      this.listenForEvents();
      console.log('[Badges] Initialized - Unlocked:', this.unlockedBadges.length, 'badges');
    },

    loadStats() {
      // Gather stats from various localStorage keys
      const completed = this.getCompletedLessons();
      const notes = Object.keys(localStorage).filter(k => k.startsWith('sp_notes_')).length;
      const streakData = JSON.parse(localStorage.getItem('sp_learning_streak') || '{}');
      const activity = JSON.parse(localStorage.getItem('sp_activity') || '{}');

      // Count weekend lessons
      let weekendLessons = parseInt(localStorage.getItem('sp_weekend_lessons') || '0');

      // Count lessons this week
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      let lessonsThisWeek = 0;
      Object.keys(activity).forEach(date => {
        if (new Date(date) >= weekStart) {
          lessonsThisWeek += activity[date].lessonsCompleted || 0;
        }
      });

      return {
        lessonsCompleted: completed.length,
        perfectQuizzes: parseInt(localStorage.getItem('sp_perfect_quizzes') || '0'),
        perfectQuizStreak: parseInt(localStorage.getItem('sp_perfect_quiz_streak') || '0'),
        weekendLessons: weekendLessons,
        lessonsThisWeek: lessonsThisWeek,
        totalNotes: notes,
        totalShares: parseInt(localStorage.getItem('sp_shares') || '0'),
        currentStreak: streakData.current || 0,
        bestStreak: streakData.best || 0,
        fastestLesson: parseInt(localStorage.getItem('sp_fastest_lesson') || '0'),
        totalTimeMinutes: parseInt(localStorage.getItem('sp_total_time') || '0')
      };
    },

    getCompletedLessons() {
      const completed = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.endsWith('_completed') && key.startsWith('sp_edu_')) {
          completed.push(key);
        }
      }
      return completed;
    },

    // Check all badges and unlock new ones
    checkBadges(context) {
      context = context || {};
      this.stats = this.loadStats();

      // Add current time context
      const now = new Date();
      context.hour = now.getHours();
      context.dayOfWeek = now.getDay();
      context.isWeekend = context.dayOfWeek === 0 || context.dayOfWeek === 6;

      Object.values(BADGES).forEach(badge => {
        if (this.unlockedBadges.includes(badge.id)) return; // Already unlocked

        try {
          if (badge.check(this.stats, context)) {
            this.unlockBadge(badge);
          }
        } catch (e) {
          console.warn('[Badges] Check failed for:', badge.id, e);
        }
      });
    },

    // Unlock a badge
    unlockBadge(badge) {
      if (this.unlockedBadges.includes(badge.id)) return;

      // Skip badge unlocks for non-logged-in users
      if (typeof window.currentUser === 'undefined' || !window.currentUser) {
        console.log('[Badges] Skipped unlock (not logged in):', badge.name);
        return;
      }

      this.unlockedBadges.push(badge.id);
      localStorage.setItem('sp_earned_badges', JSON.stringify(this.unlockedBadges));

      // Store badge earned date
      localStorage.setItem('sp_badge_' + badge.id, JSON.stringify({
        earnedAt: new Date().toISOString()
      }));

      // Log unlock
      const unlockLog = JSON.parse(localStorage.getItem('sp_badge_log') || '[]');
      unlockLog.push({
        badgeId: badge.id,
        name: badge.name,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('sp_badge_log', JSON.stringify(unlockLog));

      // Show unlock notification
      this.showBadgeUnlock(badge);

      // Dispatch event for XP reward
      window.dispatchEvent(new CustomEvent('sp:badgeUnlocked', {
        detail: { badge: badge.name, badgeId: badge.id }
      }));

      console.log('[Badges] Unlocked:', badge.name);
    },

    // Show badge unlock animation
    showBadgeUnlock(badge) {
      // Remove existing notification if any
      const existing = document.querySelector('.badge-unlock-notification');
      if (existing) existing.remove();

      const notification = document.createElement('div');
      notification.className = 'badge-unlock-notification';
      notification.innerHTML = `
        <div class="badge-unlock-content">
          <div class="badge-icon">${badge.icon}</div>
          <div class="badge-info">
            <div class="badge-label">Badge Unlocked!</div>
            <div class="badge-name">${badge.name}</div>
            <div class="badge-desc">${badge.description}</div>
          </div>
        </div>
      `;
      document.body.appendChild(notification);

      requestAnimationFrame(() => {
        notification.classList.add('show');
      });

      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, 4500);
    },

    // Get all badges for display
    getAllBadges() {
      return Object.values(BADGES).map(badge => ({
        ...badge,
        unlocked: this.unlockedBadges.includes(badge.id),
        unlockedAt: this.getUnlockDate(badge.id)
      }));
    },

    // Get badges by category
    getBadgesByCategory(category) {
      return this.getAllBadges().filter(b => b.category === category);
    },

    // Get unlock date for a badge
    getUnlockDate(badgeId) {
      const log = JSON.parse(localStorage.getItem('sp_badge_log') || '[]');
      const entry = log.find(l => l.badgeId === badgeId);
      return entry ? entry.timestamp : null;
    },

    // Get unlocked badge count
    getUnlockedCount() {
      return this.unlockedBadges.length;
    },

    // Get total badge count
    getTotalCount() {
      return Object.keys(BADGES).length;
    },

    // Get progress for a locked badge
    getProgress(badge) {
      if (this.unlockedBadges.includes(badge.id)) {
        return { current: 1, needed: 1, percent: 100, message: 'Unlocked!' };
      }

      const stats = this.stats;
      let current = 0;
      let needed = 1;
      let message = '';

      switch(badge.id) {
        // Completion badges
        case 'firstSteps':
          current = stats.lessonsCompleted || 0;
          needed = 1;
          message = `${Math.max(0, needed - current)} more lesson${needed - current !== 1 ? 's' : ''} to unlock`;
          break;
        case 'gettingStarted':
          current = stats.lessonsCompleted || 0;
          needed = 10;
          message = `${Math.max(0, needed - current)} more lesson${needed - current !== 1 ? 's' : ''} to unlock`;
          break;
        case 'halfwayThere':
          current = stats.lessonsCompleted || 0;
          needed = 41;
          message = `${Math.max(0, needed - current)} more lesson${needed - current !== 1 ? 's' : ''} to unlock`;
          break;
        case 'almostThere':
          current = stats.lessonsCompleted || 0;
          needed = 70;
          message = `${Math.max(0, needed - current)} more lesson${needed - current !== 1 ? 's' : ''} to unlock`;
          break;
        case 'graduateScholar':
          current = stats.lessonsCompleted || 0;
          needed = 82;
          message = `${Math.max(0, needed - current)} more lesson${needed - current !== 1 ? 's' : ''} to unlock`;
          break;

        // Streak badges
        case 'streakStarter':
          current = Math.max(stats.currentStreak || 0, stats.bestStreak || 0);
          needed = 7;
          message = `${Math.max(0, needed - current)} more day${needed - current !== 1 ? 's' : ''} to unlock`;
          break;
        case 'streakChampion':
          current = Math.max(stats.currentStreak || 0, stats.bestStreak || 0);
          needed = 30;
          message = `${Math.max(0, needed - current)} more day${needed - current !== 1 ? 's' : ''} to unlock`;
          break;
        case 'streakLegend':
          current = Math.max(stats.currentStreak || 0, stats.bestStreak || 0);
          needed = 100;
          message = `${Math.max(0, needed - current)} more day${needed - current !== 1 ? 's' : ''} to unlock`;
          break;

        // Achievement badges
        case 'quizMaster':
          current = stats.perfectQuizzes || 0;
          needed = 10;
          message = `${Math.max(0, needed - current)} more perfect quiz${needed - current !== 1 ? 'zes' : ''} to unlock`;
          break;
        case 'speedReader':
          current = (stats.fastestLesson || 0) > 0 && (stats.fastestLesson || 0) < 300 ? 1 : 0;
          needed = 1;
          message = 'Complete any lesson in under 5 minutes';
          break;
        case 'noteTaker':
          current = stats.totalNotes || 0;
          needed = 20;
          message = `${Math.max(0, needed - current)} more note${needed - current !== 1 ? 's' : ''} to unlock`;
          break;
        case 'socialButterfly':
          current = stats.totalShares || 0;
          needed = 5;
          message = `${Math.max(0, needed - current)} more share${needed - current !== 1 ? 's' : ''} to unlock`;
          break;
        case 'bookworm':
          current = stats.lessonsThisWeek || 0;
          needed = 10;
          message = `${Math.max(0, needed - current)} more lesson${needed - current !== 1 ? 's' : ''} this week to unlock`;
          break;

        // Time badges
        case 'earlyBird':
          current = 0;
          needed = 1;
          message = 'Complete any lesson before 8am';
          break;
        case 'nightOwl':
          current = 0;
          needed = 1;
          message = 'Complete any lesson after 10pm';
          break;
        case 'weekendWarrior':
          current = stats.weekendLessons || 0;
          needed = 5;
          message = `${Math.max(0, needed - current)} more weekend lesson${needed - current !== 1 ? 's' : ''} to unlock`;
          break;

        // Special badges
        case 'dedicated':
          current = stats.totalTimeMinutes || 0;
          needed = 600;
          const hoursNeeded = Math.ceil((needed - current) / 60 * 10) / 10;
          message = `${hoursNeeded > 0 ? hoursNeeded + ' more hours' : 'Almost there!'} to unlock`;
          break;
        case 'perfectionist':
          current = stats.perfectQuizStreak || 0;
          needed = 5;
          message = `${Math.max(0, needed - current)} more perfect quiz${needed - current !== 1 ? 'zes' : ''} in a row to unlock`;
          break;

        default:
          message = 'Keep learning to unlock!';
      }

      const percent = needed > 0 ? Math.min(100, Math.floor((current / needed) * 100)) : 0;
      return { current, needed, percent, message };
    },

    // Listen for events
    listenForEvents() {
      window.addEventListener('sp:lessonCompleted', () => {
        // Track weekend lessons
        const day = new Date().getDay();
        if (day === 0 || day === 6) {
          const count = parseInt(localStorage.getItem('sp_weekend_lessons') || '0');
          localStorage.setItem('sp_weekend_lessons', (count + 1).toString());
        }
        this.checkBadges({ event: 'lessonCompleted' });
      });

      window.addEventListener('sp:quizCompleted', (e) => {
        if (e.detail?.score === 100) {
          const count = parseInt(localStorage.getItem('sp_perfect_quizzes') || '0');
          localStorage.setItem('sp_perfect_quizzes', (count + 1).toString());

          // Track perfect quiz streak
          const streak = parseInt(localStorage.getItem('sp_perfect_quiz_streak') || '0');
          localStorage.setItem('sp_perfect_quiz_streak', (streak + 1).toString());
        } else {
          // Reset perfect quiz streak
          localStorage.setItem('sp_perfect_quiz_streak', '0');
        }
        this.checkBadges({ event: 'quizCompleted', score: e.detail?.score });
      });

      window.addEventListener('sp:streakUpdated', () => {
        this.checkBadges({ event: 'streakUpdated' });
      });

      window.addEventListener('sp:noteSaved', () => {
        this.checkBadges({ event: 'noteSaved' });
      });

      window.addEventListener('sp:socialShare', () => {
        const count = parseInt(localStorage.getItem('sp_shares') || '0');
        localStorage.setItem('sp_shares', (count + 1).toString());
        this.checkBadges({ event: 'socialShare' });
      });
    },

    // Render badges grid (for My Library page)
    renderBadgesGrid(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      const badges = this.getAllBadges();
      const categories = ['completion', 'streak', 'achievement', 'time', 'special'];

      let html = '';
      categories.forEach(cat => {
        const catBadges = badges.filter(b => b.category === cat);
        if (catBadges.length === 0) return;

        const catName = cat.charAt(0).toUpperCase() + cat.slice(1);
        html += `<div class="badge-category">
          <h4 class="badge-category-title">${catName}</h4>
          <div class="badge-grid">
            ${catBadges.map(b => `
              <div class="badge-item ${b.unlocked ? 'unlocked' : 'locked'}" title="${b.description}">
                <div class="badge-item-icon">${b.unlocked ? b.icon : '&#128274;'}</div>
                <div class="badge-item-name">${b.name}</div>
              </div>
            `).join('')}
          </div>
        </div>`;
      });

      container.innerHTML = html;
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BadgeSystem.init());
  } else {
    BadgeSystem.init();
  }

  // Expose globally
  window.BadgeSystem = BadgeSystem;
  window.BADGES = BADGES;

})();
