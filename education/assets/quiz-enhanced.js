// Enhanced Quiz System with Explanations
(function() {
  'use strict';

  // Quiz data structure with explanations
  // Format: { lessonId: { questions: [{ question, options: [{ text, correct, explanation }] }] } }
  const quizExplanations = {};

  // Initialize quiz system
  function initQuizzes() {
    const quizContainers = document.querySelectorAll('.quiz');

    quizContainers.forEach(container => {
      const questions = container.querySelectorAll('.quiz-question');

      questions.forEach((questionEl, qIndex) => {
        const options = questionEl.querySelectorAll('.quiz-option');
        let selectedOption = null;
        const questionId = `q${qIndex + 1}`;

        // Add feedback container if not present
        let feedbackContainer = questionEl.querySelector('.quiz-feedback');
        if (!feedbackContainer) {
          feedbackContainer = document.createElement('div');
          feedbackContainer.className = 'quiz-feedback';
          feedbackContainer.id = `feedback-${questionId}`;
          questionEl.appendChild(feedbackContainer);
        }

        // Handle option selection
        options.forEach((option, oIndex) => {
          option.addEventListener('click', () => {
            // Remove previous selection
            options.forEach(opt => opt.classList.remove('selected'));

            // Mark as selected
            option.classList.add('selected');
            selectedOption = oIndex;

            // Show feedback immediately
            showFeedback(questionEl, option, questionId);
          });
        });
      });

      // Handle submit button (for quizzes that have one)
      const submitBtn = container.querySelector('.quiz-submit');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          handleQuizSubmit(container);
        });
      }
    });
  }

  // Show feedback for selected option
  function showFeedback(questionEl, optionEl, questionId) {
    const isCorrect = optionEl.dataset.correct === 'true';
    const feedbackContainer = questionEl.querySelector('.quiz-feedback');
    const explanationContainer = questionEl.querySelector('.quiz-explanation');

    // Show quiz-explanation if it exists
    if (explanationContainer) {
      explanationContainer.classList.add('show');
    }

    if (!feedbackContainer) return;

    // Get explanation from data attribute (if available)
    const explanation = optionEl.dataset.explanation || '';

    // Get correct answer for comparison
    const correctOption = questionEl.querySelector('[data-correct="true"]');
    const correctText = correctOption ? correctOption.textContent : '';
    const correctExplanation = correctOption ? (correctOption.dataset.explanation || '') : '';

    // Clear previous feedback
    feedbackContainer.innerHTML = '';
    feedbackContainer.className = 'quiz-feedback';

    if (isCorrect) {
      feedbackContainer.classList.add('correct', 'show');
      feedbackContainer.innerHTML = `
        <div class="feedback-icon">✅</div>
        <h4>Correct!</h4>
        ${explanation ? `<p>${explanation}</p>` : '<p>Well done! You got it right.</p>'}
      `;
    } else {
      feedbackContainer.classList.add('incorrect', 'show');
      feedbackContainer.innerHTML = `
        <div class="feedback-icon">❌</div>
        <h4>Not quite!</h4>
        <div class="feedback-section">
          <strong>Your answer:</strong>
          <p class="user-answer">${optionEl.textContent}</p>
          ${explanation ? `<p class="explanation">${explanation}</p>` : ''}
        </div>
        <hr style="margin: 1rem 0; border-color: rgba(255,255,255,0.1);">
        <div class="feedback-section">
          <strong>Correct answer:</strong>
          <p class="correct-answer">${correctText}</p>
          ${correctExplanation ? `<p class="explanation">${correctExplanation}</p>` : ''}
        </div>
      `;
    }

    // Track quiz answer
    if (typeof trackQuizAnswer === 'function') {
      trackQuizAnswer(questionId, isCorrect);
    }

    // Dispatch event for gamification system (single question quiz)
    window.dispatchEvent(new CustomEvent('sp:quizCompleted', {
      detail: { score: isCorrect ? 100 : 0, correct: isCorrect ? 1 : 0, total: 1 }
    }));

    // Scroll feedback into view
    setTimeout(() => {
      feedbackContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  // Handle quiz submit (for multi-question quizzes)
  function handleQuizSubmit(container) {
    const questions = container.querySelectorAll('.quiz-question');
    let score = 0;
    let total = questions.length;

    questions.forEach(question => {
      const selected = question.querySelector('.quiz-option.selected');
      if (selected && selected.dataset.correct === 'true') {
        score++;
      }
    });

    const percentage = Math.round((score / total) * 100);

    // Show quiz result
    let resultContainer = container.querySelector('.quiz-result');
    if (!resultContainer) {
      resultContainer = document.createElement('div');
      resultContainer.className = 'quiz-result';
      container.appendChild(resultContainer);
    }

    resultContainer.innerHTML = `
      <div class="quiz-result-card ${percentage >= 70 ? 'pass' : 'fail'}">
        <div style="font-size: 3rem; margin-bottom: 1rem;">${percentage >= 70 ? '🎉' : '📚'}</div>
        <h3>${percentage >= 70 ? 'Great job!' : 'Keep learning!'}</h3>
        <p class="score">You scored <strong>${score}/${total}</strong> (${percentage}%)</p>
        ${percentage >= 70 ?
          '<p>You passed! You understand the key concepts.</p>' :
          '<p>Review the lesson and try again. You\'ll get it!</p>'
        }
      </div>
    `;

    // Track quiz completion
    if (typeof trackQuizCompleted === 'function') {
      trackQuizCompleted(score, total);
    }

    // Dispatch event for gamification system
    window.dispatchEvent(new CustomEvent('sp:quizCompleted', {
      detail: { score: percentage, correct: score, total: total }
    }));

    // Scroll to result
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Helper function to add explanations to existing quizzes
  window.addQuizExplanations = function(lessonId, explanations) {
    quizExplanations[lessonId] = explanations;

    // Apply explanations to DOM
    const container = document.querySelector('.quiz');
    if (!container) return;

    const questions = container.querySelectorAll('.quiz-question');
    questions.forEach((questionEl, qIndex) => {
      const questionData = explanations.questions[qIndex];
      if (!questionData) return;

      const options = questionEl.querySelectorAll('.quiz-option');
      options.forEach((option, oIndex) => {
        const optionData = questionData.options[oIndex];
        if (optionData) {
          option.dataset.explanation = optionData.explanation || '';
        }
      });
    });
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuizzes);
  } else {
    initQuizzes();
  }

  // Track quiz started when quiz section comes into view
  const quizObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && typeof trackQuizStarted === 'function') {
        trackQuizStarted();
        quizObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const quizSections = document.querySelectorAll('.quiz');
  quizSections.forEach(section => quizObserver.observe(section));
})();
