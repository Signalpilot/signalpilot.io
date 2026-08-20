// Spaced Repetition System for Quiz Review
// Based on SM-2 algorithm (SuperMemo)
(function() {
  'use strict';

  const REVIEW_INTERVALS = {
    again: 1,      // Review in 1 day (forgot)
    hard: 3,       // Review in 3 days (difficult)
    good: 7,       // Review in 7 days (remembered)
    easy: 14       // Review in 14 days (easy)
  };

  // Get all quiz answers from localStorage
  function getAllQuizAnswers() {
    const answers = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('sp_quiz_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          answers.push({
            key: key,
            lessonId: key.replace('sp_quiz_', ''),
            ...data
          });
        } catch (e) {
          // Skip invalid data
        }
      }
    }
    return answers;
  }

  // Calculate next review date
  function calculateNextReview(lastReview, difficulty) {
    const now = Date.now();
    const daysSinceReview = lastReview ? (now - lastReview) / (1000 * 60 * 60 * 24) : 0;

    let interval;
    switch (difficulty) {
      case 'again':
        interval = REVIEW_INTERVALS.again;
        break;
      case 'hard':
        interval = REVIEW_INTERVALS.hard;
        break;
      case 'good':
        interval = REVIEW_INTERVALS.good;
        break;
      case 'easy':
        interval = REVIEW_INTERVALS.easy;
        break;
      default:
        interval = REVIEW_INTERVALS.good;
    }

    return now + (interval * 24 * 60 * 60 * 1000);
  }

  // Get items due for review
  function getDueReviews() {
    const now = Date.now();
    const allAnswers = getAllQuizAnswers();

    return allAnswers.filter(item => {
      if (!item.nextReview) return true; // Never reviewed
      return item.nextReview <= now; // Due for review
    }).sort((a, b) => {
      // Sort by priority: overdue first, then by due date
      const aOverdue = (a.nextReview || 0) - now;
      const bOverdue = (b.nextReview || 0) - now;
      return aOverdue - bOverdue;
    });
  }

  // Save quiz result with spaced repetition data
  function saveQuizResult(lessonId, score, totalQuestions, difficulty = 'good') {
    const key = `sp_quiz_${lessonId}`;
    const now = Date.now();

    const data = {
      score: score,
      total: totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      lastReview: now,
      nextReview: calculateNextReview(now, difficulty),
      difficulty: difficulty,
      reviewCount: (JSON.parse(localStorage.getItem(key) || '{}').reviewCount || 0) + 1,
      history: (JSON.parse(localStorage.getItem(key) || '{}').history || []).concat([{
        timestamp: now,
        score: score,
        total: totalQuestions,
        difficulty: difficulty
      }]).slice(-10) // Keep last 10 attempts
    };

    localStorage.setItem(key, JSON.stringify(data));
    return data;
  }

  // Create review reminder UI
  function createReviewReminder() {
    const dueReviews = getDueReviews();
    if (dueReviews.length === 0) return;

    // Check if we already showed reminder today
    const lastShown = localStorage.getItem('sp_review_reminder_last_shown');
    const now = Date.now();
    if (lastShown && (now - parseInt(lastShown)) < 24 * 60 * 60 * 1000) {
      return; // Don't spam - show once per day
    }

    const reminder = document.createElement('div');
    reminder.className = 'review-reminder';
    reminder.innerHTML = `
      <div class="review-reminder-content">
        <h4>📚 Time to Review!</h4>
        <p>You have <strong>${dueReviews.length}</strong> lesson${dueReviews.length !== 1 ? 's' : ''} ready for review to strengthen your memory.</p>
        <div class="review-reminder-actions">
          <button class="btn btn-primary" id="start-review">Start Review</button>
          <button class="btn btn-ghost" id="dismiss-review">Later</button>
        </div>
      </div>
    `;

    // Add styles dynamically
    const style = document.createElement('style');
    style.textContent = `
      .review-reminder {
        position: fixed;
        top: 6rem;
        right: 2rem;
        max-width: 360px;
        background: linear-gradient(135deg, rgba(91,138,255,0.15), rgba(118,221,255,0.1));
        border: 2px solid rgba(91,138,255,0.3);
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideInRight 0.4s ease;
      }
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .review-reminder-content h4 {
        margin: 0 0 0.75rem 0;
        font-size: 1.1rem;
        color: #76ddff;
      }
      .review-reminder-content p {
        margin: 0 0 1rem 0;
        line-height: 1.6;
        color: #b7c2d9;
      }
      .review-reminder-actions {
        display: flex;
        gap: 0.75rem;
      }
      .review-reminder-actions .btn {
        flex: 1;
        font-size: 0.9rem;
        padding: 0.65rem 1rem;
      }
      @media (max-width: 768px) {
        .review-reminder {
          top: 5rem;
          right: 1rem;
          left: 1rem;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(reminder);

    // Event listeners
    document.getElementById('start-review').addEventListener('click', () => {
      window.location.href = '/education/review.html';
      localStorage.setItem('sp_review_reminder_last_shown', now.toString());
    });

    document.getElementById('dismiss-review').addEventListener('click', () => {
      reminder.remove();
      localStorage.setItem('sp_review_reminder_last_shown', now.toString());
    });

    // Auto-dismiss after 15 seconds
    setTimeout(() => {
      if (document.body.contains(reminder)) {
        reminder.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => reminder.remove(), 400);
      }
    }, 15000);
  }

  // Enhance existing quiz submission
  function enhanceQuizSubmission() {
    // Look for quiz forms
    const quizForms = document.querySelectorAll('.quiz');
    quizForms.forEach(quiz => {
      const submitBtn = quiz.querySelector('.quiz-submit, [type="submit"]');
      if (!submitBtn) return;

      // Add difficulty rating after quiz completion
      submitBtn.addEventListener('click', function(e) {
        setTimeout(() => {
          // Check if quiz is completed (all answered)
          const questions = quiz.querySelectorAll('.quiz-question');
          const answered = quiz.querySelectorAll('.quiz-option.selected').length;

          if (answered === questions.length) {
            showDifficultyRating(quiz);
          }
        }, 500);
      });
    });
  }

  // Show difficulty rating after quiz
  function showDifficultyRating(quizElement) {
    // Don't show if already exists
    if (quizElement.querySelector('.difficulty-rating')) return;

    const rating = document.createElement('div');
    rating.className = 'difficulty-rating';
    rating.innerHTML = `
      <div style="margin-top:2rem;padding:1.5rem;background:rgba(118,221,255,0.1);border:1px solid rgba(118,221,255,0.3);border-radius:12px;">
        <h4 style="margin:0 0 1rem 0;font-size:1rem;color:#76ddff;">How well did you know this material?</h4>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <button class="btn btn-sm" data-difficulty="again" style="flex:1;min-width:100px;background:rgba(255,107,107,0.15);border:1px solid rgba(255,107,107,0.3);">🔴 Again<br><small style="opacity:0.7;">Review in 1 day</small></button>
          <button class="btn btn-sm" data-difficulty="hard" style="flex:1;min-width:100px;background:rgba(249,162,60,0.15);border:1px solid rgba(249,162,60,0.3);">🟡 Hard<br><small style="opacity:0.7;">Review in 3 days</small></button>
          <button class="btn btn-sm" data-difficulty="good" style="flex:1;min-width:100px;background:rgba(91,138,255,0.15);border:1px solid rgba(91,138,255,0.3);">🟢 Good<br><small style="opacity:0.7;">Review in 7 days</small></button>
          <button class="btn btn-sm" data-difficulty="easy" style="flex:1;min-width:100px;background:rgba(0,212,170,0.15);border:1px solid rgba(0,212,170,0.3);">✨ Easy<br><small style="opacity:0.7;">Review in 14 days</small></button>
        </div>
        <p style="margin:1rem 0 0 0;font-size:0.85rem;color:rgba(255,255,255,0.6);">This helps schedule your review sessions for optimal retention.</p>
      </div>
    `;

    quizElement.appendChild(rating);

    // Handle difficulty selection
    rating.querySelectorAll('[data-difficulty]').forEach(btn => {
      btn.addEventListener('click', function() {
        const difficulty = this.dataset.difficulty;
        const lessonId = getLessonIdFromUrl();

        // Get quiz score
        const correct = quizElement.querySelectorAll('.quiz-option.correct').length;
        const total = quizElement.querySelectorAll('.quiz-question').length;

        // Save with spaced repetition
        saveQuizResult(lessonId, correct, total, difficulty);

        // Show confirmation
        rating.innerHTML = `
          <div style="margin-top:2rem;padding:1.5rem;background:rgba(0,212,170,0.1);border:1px solid rgba(0,212,170,0.3);border-radius:12px;text-align:center;">
            <div style="font-size:2rem;margin-bottom:0.5rem;">✓</div>
            <p style="margin:0;color:#00d4aa;font-weight:700;">Scheduled for review!</p>
            <p style="margin:0.5rem 0 0 0;font-size:0.9rem;color:rgba(255,255,255,0.7);">You'll be reminded to review this lesson at the optimal time.</p>
          </div>
        `;
      });
    });
  }

  // Get lesson ID from URL
  function getLessonIdFromUrl() {
    return window.getLessonId() || 'unknown';
  }

  // Add review stats to dashboard
  function addReviewStatsToDashboard() {
    const dashboard = document.querySelector('.progress-card');
    if (!dashboard) return;

    const dueReviews = getDueReviews();
    const stats = document.querySelector('.progress-stats');
    if (!stats) return;

    const reviewStat = document.createElement('div');
    reviewStat.className = 'progress-stat';
    reviewStat.innerHTML = `
      <span class="stat-value" style="color:#76ddff;">${dueReviews.length}</span>
      <span class="stat-label">Due for Review</span>
    `;
    stats.appendChild(reviewStat);
  }

  // Initialize
  function init() {
    // Show review reminder on homepage
    if (['/','/education/'].includes(window.location.pathname) || ['/index.html','/education/index.html'].includes(window.location.pathname)) {
      setTimeout(createReviewReminder, 2000); // Show after 2 seconds
      addReviewStatsToDashboard();
    }

    // Enhance quizzes on lesson pages
    if (window.location.pathname.includes('/education/curriculum/')) {
      enhanceQuizSubmission();
    }
  }

  // Expose API for manual use
  window.SpacedRepetition = {
    saveQuizResult,
    getDueReviews,
    calculateNextReview
  };

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
