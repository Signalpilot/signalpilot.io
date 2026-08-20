// daily-challenges.js - Daily Challenge System for Signal Pilot Education Hub
// Version 1.0.0
(function() {
  'use strict';

  // Challenge templates
  const CHALLENGE_TEMPLATES = [
    { type: 'lessons', target: 1, xp: 50, text: 'Complete 1 lesson today', icon: '&#128218;' },
    { type: 'lessons', target: 2, xp: 75, text: 'Complete 2 lessons today', icon: '&#128218;' },
    { type: 'lessons', target: 3, xp: 100, text: 'Complete 3 lessons today', icon: '&#128218;' },
    { type: 'quizzes', target: 2, xp: 75, text: 'Pass 2 quizzes today', icon: '&#127919;' },
    { type: 'quizzes', target: 3, xp: 100, text: 'Pass 3 quizzes today', icon: '&#127919;' },
    { type: 'perfectQuiz', target: 1, xp: 75, text: 'Score 100% on a quiz', icon: '&#11088;' },
    { type: 'perfectQuiz', target: 2, xp: 125, text: 'Score 100% on 2 quizzes', icon: '&#11088;' },
    { type: 'notes', target: 1, xp: 50, text: 'Take notes on a lesson', icon: '&#128221;' },
    { type: 'notes', target: 2, xp: 75, text: 'Take notes on 2 lessons', icon: '&#128221;' },
    { type: 'streak', target: 1, xp: 50, text: 'Maintain your streak today', icon: '&#128293;' },
    { type: 'time', target: 15, xp: 75, text: 'Study for 15 minutes', icon: '&#9203;' },
    { type: 'time', target: 30, xp: 100, text: 'Study for 30 minutes', icon: '&#9203;' }
  ];

  const DailyChallenges = {
    challenge: null,
    sessionStartTime: null,
    sessionTimeTracked: 0,

    init() {
      this.sessionStartTime = Date.now();
      this.loadOrGenerateChallenge();
      this.renderChallengeCard();
      this.listenForEvents();
      this.startTimeTracking();
      console.log('[DailyChallenges] Initialized - Challenge:', this.challenge?.text);
    },

    // Get today's date key (YYYY-MM-DD)
    getTodayKey() {
      return new Date().toISOString().split('T')[0];
    },

    // Seeded random for consistent daily challenge
    seededRandom(seed) {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    },

    // Load existing or generate new challenge
    loadOrGenerateChallenge() {
      const stored = JSON.parse(localStorage.getItem('sp_daily_challenge') || '{}');
      const today = this.getTodayKey();

      if (stored.date === today) {
        this.challenge = stored;
      } else {
        // Generate new challenge for today using date as seed
        const dateSeed = parseInt(today.replace(/-/g, ''));
        const index = Math.floor(this.seededRandom(dateSeed) * CHALLENGE_TEMPLATES.length);
        const template = CHALLENGE_TEMPLATES[index];

        this.challenge = {
          date: today,
          ...template,
          progress: 0,
          completed: false,
          completedAt: null
        };

        localStorage.setItem('sp_daily_challenge', JSON.stringify(this.challenge));
      }
    },

    // Update progress
    updateProgress(type, amount) {
      if (!this.challenge || this.challenge.completed) return;
      if (this.challenge.type !== type) return;

      amount = amount || 1;
      this.challenge.progress = Math.min(this.challenge.progress + amount, this.challenge.target);

      if (this.challenge.progress >= this.challenge.target) {
        this.completeChallenge();
      }

      localStorage.setItem('sp_daily_challenge', JSON.stringify(this.challenge));
      this.renderChallengeCard();
    },

    // Complete the challenge
    completeChallenge() {
      if (this.challenge.completed) return;

      this.challenge.completed = true;
      this.challenge.completedAt = new Date().toISOString();

      localStorage.setItem('sp_daily_challenge', JSON.stringify(this.challenge));

      // Track completed challenges
      const history = JSON.parse(localStorage.getItem('sp_challenge_history') || '[]');
      history.push({
        date: this.challenge.date,
        text: this.challenge.text,
        xp: this.challenge.xp
      });
      // Keep last 30 days
      while (history.length > 30) history.shift();
      localStorage.setItem('sp_challenge_history', JSON.stringify(history));

      // Dispatch event for XP reward
      window.dispatchEvent(new CustomEvent('sp:challengeCompleted', {
        detail: { xp: this.challenge.xp, text: this.challenge.text }
      }));

      // Show celebration
      this.showChallengeComplete();

      console.log('[DailyChallenges] Challenge completed! +' + this.challenge.xp + ' XP');
    },

    // Render challenge card
    renderChallengeCard() {
      // Only render on homepage or library
      const isHomepage = ['/','/education/'].includes(window.location.pathname) || ['/index.html','/education/index.html'].includes(window.location.pathname);
      const isLibrary = window.location.pathname.includes('my-library');

      if (!isHomepage && !isLibrary) return;
      if (!this.challenge) return;

      let card = document.getElementById('daily-challenge-card');

      if (!card) {
        card = document.createElement('div');
        card.id = 'daily-challenge-card';
        card.className = 'daily-challenge-card';

        // Insert after hero on homepage, or at top of library
        const hero = document.querySelector('.hero');
        const libraryGrid = document.querySelector('.library-grid');
        const wrap = document.querySelector('.wrap');

        if (hero && hero.nextElementSibling) {
          hero.parentNode.insertBefore(card, hero.nextElementSibling);
        } else if (libraryGrid) {
          libraryGrid.parentNode.insertBefore(card, libraryGrid);
        } else if (wrap) {
          wrap.insertBefore(card, wrap.firstChild);
        } else {
          return; // No suitable place to insert
        }
      }

      const percent = Math.min((this.challenge.progress / this.challenge.target) * 100, 100);
      const timeLeft = this.getTimeUntilReset();

      card.innerHTML = `
        <div class="challenge-header">
          <span class="challenge-icon">${this.challenge.icon || '&#127919;'}</span>
          <span class="challenge-title">DAILY CHALLENGE</span>
          <span class="challenge-timer">${this.challenge.completed ? 'Completed!' : 'Resets in ' + timeLeft}</span>
        </div>
        <div class="challenge-body">
          <p class="challenge-text">${this.challenge.text}</p>
          <div class="challenge-progress">
            <div class="challenge-bar">
              <div class="challenge-bar-fill ${this.challenge.completed ? 'complete' : ''}"
                   style="width: ${percent}%"></div>
            </div>
            <span class="challenge-count">${this.challenge.progress}/${this.challenge.target}</span>
          </div>
          ${this.challenge.completed
            ? '<div class="challenge-complete">&#9989; Completed! +' + this.challenge.xp + ' XP earned</div>'
            : '<div class="challenge-reward">Reward: +' + this.challenge.xp + ' XP</div>'
          }
        </div>
      `;

      // Add completed class for styling
      if (this.challenge.completed) {
        card.classList.add('completed');
      } else {
        card.classList.remove('completed');
      }
    },

    // Get time until midnight reset
    getTimeUntilReset() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return hours + 'h ' + mins + 'm';
    },

    // Show challenge complete celebration
    showChallengeComplete() {
      const celebration = document.createElement('div');
      celebration.className = 'challenge-celebration';
      celebration.innerHTML = `
        <div class="celebration-content">
          <div class="celebration-icon">&#127881;</div>
          <h3>Challenge Complete!</h3>
          <p>+${this.challenge.xp} XP earned</p>
        </div>
      `;
      document.body.appendChild(celebration);

      requestAnimationFrame(() => {
        celebration.classList.add('show');
      });

      setTimeout(() => {
        celebration.classList.remove('show');
        setTimeout(() => celebration.remove(), 300);
      }, 3000);
    },

    // Start tracking time spent
    startTimeTracking() {
      // Track time every minute
      setInterval(() => {
        if (document.visibilityState === 'visible') {
          this.sessionTimeTracked++;

          // Update total time in localStorage
          const totalMinutes = parseInt(localStorage.getItem('sp_total_time') || '0');
          localStorage.setItem('sp_total_time', (totalMinutes + 1).toString());

          // Check time-based challenge progress
          if (this.challenge && this.challenge.type === 'time' && !this.challenge.completed) {
            const todayTime = parseInt(localStorage.getItem('sp_today_time') || '0') + 1;
            localStorage.setItem('sp_today_time', todayTime.toString());
            localStorage.setItem('sp_today_time_date', this.getTodayKey());

            this.challenge.progress = todayTime;
            if (this.challenge.progress >= this.challenge.target) {
              this.completeChallenge();
            }
            localStorage.setItem('sp_daily_challenge', JSON.stringify(this.challenge));
            this.renderChallengeCard();
          }
        }
      }, 60000); // Every minute

      // Reset today's time if it's a new day
      const savedDate = localStorage.getItem('sp_today_time_date');
      if (savedDate !== this.getTodayKey()) {
        localStorage.setItem('sp_today_time', '0');
        localStorage.setItem('sp_today_time_date', this.getTodayKey());
      }

      // If time-based challenge, initialize progress from today's time
      if (this.challenge && this.challenge.type === 'time') {
        this.challenge.progress = parseInt(localStorage.getItem('sp_today_time') || '0');
        localStorage.setItem('sp_daily_challenge', JSON.stringify(this.challenge));
      }
    },

    // Listen for events
    listenForEvents() {
      window.addEventListener('sp:lessonCompleted', () => {
        this.updateProgress('lessons', 1);
        this.updateProgress('streak', 1); // Streak maintained by completing a lesson
      });

      window.addEventListener('sp:quizCompleted', (e) => {
        const score = e.detail?.score || 0;
        if (score >= 70) {
          this.updateProgress('quizzes', 1);
        }
        if (score === 100) {
          this.updateProgress('perfectQuiz', 1);
        }
      });

      window.addEventListener('sp:noteSaved', () => {
        this.updateProgress('notes', 1);
      });
    },

    // Get challenge streak (consecutive days completed)
    getChallengeStreak() {
      const history = JSON.parse(localStorage.getItem('sp_challenge_history') || '[]');
      if (history.length === 0) return 0;

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i <= 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];

        if (history.some(h => h.date === dateStr)) {
          streak++;
        } else if (i > 0) {
          break; // Streak broken
        }
      }

      return streak;
    },

    // Get statistics
    getStats() {
      const history = JSON.parse(localStorage.getItem('sp_challenge_history') || '[]');
      const streak = this.getChallengeStreak();
      const totalXP = history.reduce((sum, h) => sum + (h.xp || 0), 0);

      return {
        totalCompleted: history.length,
        currentStreak: streak,
        totalXPFromChallenges: totalXP,
        thisMonth: history.filter(h => {
          const d = new Date(h.date);
          const now = new Date();
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length
      };
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DailyChallenges.init());
  } else {
    DailyChallenges.init();
  }

  // Expose globally
  window.DailyChallenges = DailyChallenges;

})();
