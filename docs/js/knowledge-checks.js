/**
 * Knowledge Check Quizzes
 * Interactive self-assessment for learning verification
 */

(function() {
  'use strict';

  const STORAGE_PREFIX = 'sp-quiz-';

  // Initialize knowledge checks
  function init() {
    const quizContainers = document.querySelectorAll('.knowledge-check');
    quizContainers.forEach(container => {
      initializeQuiz(container);
    });

    console.log('[Knowledge Checks] Initialized', quizContainers.length, 'quizzes');
  }

  // Initialize individual quiz
  function initializeQuiz(container) {
    const form = container.querySelector('.quiz-form');
    const button = container.querySelector('.check-answer-btn');
    const feedback = container.querySelector('.quiz-feedback');

    if (!form || !button || !feedback) {
      console.warn('[Knowledge Checks] Missing required elements in quiz');
      return;
    }

    // Get quiz ID from data attribute or generate one
    const quizId = container.dataset.quizId || generateQuizId();
    container.dataset.quizId = quizId;

    // Load previous attempt if exists
    loadPreviousAttempt(quizId, form, feedback);

    // Add event listener to check button
    button.addEventListener('click', () => {
      checkAnswer(container, form, feedback, quizId);
    });

    // Allow Enter key to submit
    form.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        checkAnswer(container, form, feedback, quizId);
      }
    });
  }

  // Check answer
  function checkAnswer(container, form, feedback, quizId) {
    const selectedOption = form.querySelector('input[type="radio"]:checked');

    if (!selectedOption) {
      showFeedback(feedback, 'Please select an answer first.', 'neutral');
      return;
    }

    const value = selectedOption.value;
    const correctAnswer = container.dataset.correctAnswer;

    if (!correctAnswer) {
      console.error('[Knowledge Checks] No correct answer specified');
      return;
    }

    const isCorrect = value === correctAnswer;

    // Get feedback messages from data attributes
    const correctMsg = container.dataset.correctFeedback || 'Correct! Well done.';
    const incorrectMsg = container.dataset.incorrectFeedback || 'Not quite. Try reviewing the section above and try again.';

    if (isCorrect) {
      showFeedback(feedback, correctMsg, 'correct');
      saveAttempt(quizId, value, true);
      markQuestionComplete(form);
    } else {
      showFeedback(feedback, incorrectMsg, 'incorrect');
      saveAttempt(quizId, value, false);
    }

    // Track with Google Analytics if available
    if (typeof gtag === 'function') {
      gtag('event', 'knowledge_check', {
        quiz_id: quizId,
        answer: value,
        correct: isCorrect
      });
    }
  }

  // Show feedback
  function showFeedback(feedbackEl, message, type) {
    feedbackEl.textContent = message;
    feedbackEl.className = 'quiz-feedback ' + type;
    feedbackEl.style.display = 'block';

    // Add icon based on type
    if (type === 'correct') {
      feedbackEl.textContent = '✓ ' + message;
    } else if (type === 'incorrect') {
      feedbackEl.textContent = '✗ ' + message;
    }

    // Scroll to feedback
    feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Mark question as complete
  function markQuestionComplete(form) {
    // Disable all inputs
    const inputs = form.querySelectorAll('input[type="radio"]');
    inputs.forEach(input => {
      input.disabled = true;
    });

    // Add visual indicator
    form.classList.add('completed');

    // Update button
    const container = form.closest('.knowledge-check');
    const button = container.querySelector('.check-answer-btn');
    if (button) {
      button.textContent = '✓ Completed';
      button.disabled = true;
      button.style.background = '#10b981';
    }
  }

  // Save attempt to localStorage
  function saveAttempt(quizId, answer, correct) {
    const attempt = {
      answer: answer,
      correct: correct,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(STORAGE_PREFIX + quizId, JSON.stringify(attempt));
    } catch (e) {
      console.warn('[Knowledge Checks] Failed to save attempt:', e);
    }
  }

  // Load previous attempt
  function loadPreviousAttempt(quizId, form, feedback) {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + quizId);
      if (!saved) return;

      const attempt = JSON.parse(saved);

      // Check if attempt was within last 7 days
      const age = Date.now() - attempt.timestamp;
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (age > sevenDays) return;

      // If correct answer was saved, mark as complete
      if (attempt.correct) {
        const radio = form.querySelector(`input[value="${attempt.answer}"]`);
        if (radio) {
          radio.checked = true;
          markQuestionComplete(form);
          showFeedback(feedback, 'You previously answered this correctly.', 'correct');
        }
      }
    } catch (e) {
      console.warn('[Knowledge Checks] Failed to load previous attempt:', e);
    }
  }

  // Generate unique quiz ID
  function generateQuizId() {
    const path = window.location.pathname;
    const timestamp = Date.now();
    return path.replace(/\//g, '-') + '-' + timestamp;
  }

  // Add styles if not already present
  function addStyles() {
    if (document.getElementById('knowledge-checks-styles')) return;

    const style = document.createElement('style');
    style.id = 'knowledge-checks-styles';
    style.textContent = `
      .quiz-form.completed {
        opacity: 0.7;
      }

      .quiz-form.completed label {
        cursor: not-allowed;
      }

      .quiz-form input[type="radio"]:disabled {
        cursor: not-allowed;
      }

      .quiz-feedback {
        animation: slideIn 0.3s ease;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .quiz-feedback.neutral {
        background: rgba(148, 163, 184, 0.2);
        border: 2px solid #94a3b8;
        color: #cbd5e0;
      }

      .check-answer-btn:disabled {
        cursor: not-allowed;
        opacity: 0.8;
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addStyles();
      init();
    });
  } else {
    addStyles();
    init();
  }

  // Expose API
  window.SignalPilotKnowledgeChecks = {
    init: init,
    resetQuiz: function(quizId) {
      localStorage.removeItem(STORAGE_PREFIX + quizId);
      console.log('[Knowledge Checks] Reset quiz:', quizId);
    },
    resetAll: function() {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      console.log('[Knowledge Checks] Reset all quizzes');
    }
  };

})();
