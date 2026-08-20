// Analytics Tracking System for Signal Pilot Education
(function() {
  'use strict';

  // Initialize Plausible if not already present
  window.plausible = window.plausible || function() {
    (window.plausible.q = window.plausible.q || []).push(arguments);
  };

  // ========== LESSON TRACKING ==========

  // Get lesson info from page
  function getLessonInfo() {
    const path = window.location.pathname;
    const match = path.match(/\/curriculum\/(beginner|intermediate|advanced)\/(\d+)-(.+)\.html/);

    if (match) {
      return {
        tier: match[1],
        number: parseInt(match[2]),
        slug: match[3],
        title: document.querySelector('.headline')?.textContent || document.title
      };
    }
    return null;
  }

  // Track lesson started
  function trackLessonStarted() {
    const lesson = getLessonInfo();
    if (!lesson) return;

    plausible('Lesson Started', {
      props: {
        lesson: `L${lesson.number}`,
        tier: lesson.tier,
        title: lesson.title
      }
    });

    // Start time tracking
    localStorage.setItem('sp_lesson_start_time', Date.now());
    localStorage.setItem('sp_lesson_current', lesson.number);
  }

  // Track lesson completed (when user marks it complete or reaches end)
  function trackLessonCompleted() {
    const lesson = getLessonInfo();
    if (!lesson) return;

    const startTime = localStorage.getItem('sp_lesson_start_time');
    const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
    const minutes = Math.floor(timeSpent / 60);

    plausible('Lesson Completed', {
      props: {
        lesson: `L${lesson.number}`,
        tier: lesson.tier,
        timeSpent: `${minutes}m`
      }
    });

    // Clear tracking
    localStorage.removeItem('sp_lesson_start_time');
  }

  // Track page visibility (time spent tracking)
  let visibilityStartTime = Date.now();
  let totalTimeVisible = 0;

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      totalTimeVisible += Date.now() - visibilityStartTime;
    } else {
      visibilityStartTime = Date.now();
    }
  });

  // Track time on page unload
  window.addEventListener('beforeunload', () => {
    if (!document.hidden) {
      totalTimeVisible += Date.now() - visibilityStartTime;
    }

    const lesson = getLessonInfo();
    if (lesson && totalTimeVisible > 30000) { // Only track if > 30 seconds
      const minutes = Math.floor(totalTimeVisible / 60000);
      plausible('Lesson Time Spent', {
        props: {
          lesson: `L${lesson.number}`,
          minutes: minutes.toString()
        }
      });
    }
  });

  // ========== QUIZ TRACKING ==========

  // Track quiz started
  window.trackQuizStarted = function() {
    const lesson = getLessonInfo();
    if (!lesson) return;

    plausible('Quiz Started', {
      props: {
        lesson: `L${lesson.number}`,
        tier: lesson.tier
      }
    });
  };

  // Track quiz answer
  window.trackQuizAnswer = function(questionId, isCorrect) {
    const lesson = getLessonInfo();
    if (!lesson) return;

    plausible('Quiz Answer', {
      props: {
        lesson: `L${lesson.number}`,
        question: questionId,
        correct: isCorrect ? 'true' : 'false'
      }
    });
  };

  // Track quiz completed
  window.trackQuizCompleted = function(score, totalQuestions) {
    const lesson = getLessonInfo();
    if (!lesson) return;

    const percentage = Math.round((score / totalQuestions) * 100);

    plausible('Quiz Completed', {
      props: {
        lesson: `L${lesson.number}`,
        score: `${percentage}%`,
        questions: totalQuestions.toString()
      }
    });

    // Also track if passed (>70%)
    if (percentage >= 70) {
      trackLessonCompleted();
    }
  };

  // ========== FEATURE TRACKING ==========

  // Track chatbot usage
  window.trackChatbotOpened = function() {
    plausible('Chatbot Opened');
  };

  window.trackChatbotQuery = function(queryType) {
    plausible('Chatbot Query', {
      props: { query: queryType }
    });
  };

  // Track notes usage
  window.trackNotesOpened = function() {
    const lesson = getLessonInfo();
    plausible('Notes Opened', {
      props: lesson ? { lesson: `L${lesson.number}` } : {}
    });
  };

  window.trackNotesSaved = function() {
    const lesson = getLessonInfo();
    plausible('Notes Saved', {
      props: lesson ? { lesson: `L${lesson.number}` } : {}
    });
  };

  // Track calculator usage
  window.trackCalculatorUsed = function(calculatorName) {
    plausible('Calculator Used', {
      props: { calculator: calculatorName }
    });
  };

  // ========== ENGAGEMENT TRACKING ==========

  // Track scroll depth
  let maxScrollDepth = 0;
  let scrollTracked = false;

  window.addEventListener('scroll', () => {
    const scrollPercent = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
    maxScrollDepth = Math.max(maxScrollDepth, scrollPercent);

    // Track 75% scroll depth (indicates engaged reading)
    if (maxScrollDepth >= 75 && !scrollTracked) {
      scrollTracked = true;
      const lesson = getLessonInfo();
      if (lesson) {
        plausible('Lesson 75% Scrolled', {
          props: { lesson: `L${lesson.number}` }
        });
      }
    }
  });

  // Track search usage
  window.trackSearch = function(query) {
    plausible('Search', {
      props: { query: query.toLowerCase().substring(0, 50) }
    });
  };

  // ========== ACHIEVEMENT TRACKING ==========

  window.trackAchievement = function(achievementName) {
    plausible('Achievement Unlocked', {
      props: { achievement: achievementName }
    });
  };

  // Track streak milestones
  window.trackStreak = function(days) {
    if ([3, 7, 14, 30, 60, 90].includes(days)) {
      plausible('Streak Milestone', {
        props: { days: days.toString() }
      });
    }
  };

  // Track certificate download
  window.trackCertificateDownload = function() {
    plausible('Certificate Downloaded');
  };

  // ========== INITIALIZATION ==========

  // Track lesson started when page loads
  if (getLessonInfo()) {
    trackLessonStarted();
  }

  // Track page type
  const pageType = (() => {
    if (getLessonInfo()) return 'lesson';
    if (window.location.pathname.includes('/calculators')) return 'calculator';
    if (window.location.pathname.includes('/search')) return 'search';
    if (['/','/education/'].includes(window.location.pathname)) return 'home';
    return 'other';
  })();

  plausible('Page View', {
    props: { pageType }
  });

  logger.log('📊 Analytics initialized');
})();
