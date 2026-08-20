/**
 * Scenario Challenge System
 * Interactive trading scenarios with timed decisions and scoring
 */

(function() {
  'use strict';

  // Challenge state
  let currentChallenge = null;
  let startTime = null;
  let timerInterval = null;
  let timeRemaining = 0;
  let challengeAnswered = false;

  /**
   * Fetch scenarios from Supabase
   */
  async function fetchScenarios(options = {}) {
    if (!window.supabase) {
      console.error('Supabase client not initialized');
      return [];
    }

    console.log('Fetching scenarios with options:', options);

    try {
      let query = window.supabase
        .from('scenarios')
        .select('*')
        .eq('is_active', true);

      // Filter by difficulty
      if (options.difficulty) {
        console.log('Filtering by difficulty:', options.difficulty);
        query = query.eq('difficulty', options.difficulty);
      }

      // Filter by skill category
      if (options.skillCategory) {
        console.log('Filtering by skill category:', options.skillCategory);
        query = query.eq('skill_category', options.skillCategory);
      }

      // Limit results
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error fetching scenarios:', error);
        console.error('Error details:', error.message, error.code);
        return [];
      }

      console.log('Fetched scenarios:', data ? data.length : 0, 'scenarios');
      if (data && data.length > 0) {
        console.log('Sample scenario:', data[0]);
      }

      return data || [];
    } catch (error) {
      console.error('Exception in fetchScenarios:', error);
      return [];
    }
  }

  /**
   * Get random scenario
   */
  async function getRandomScenario(options = {}) {
    const scenarios = await fetchScenarios(options);
    if (scenarios.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * scenarios.length);
    return scenarios[randomIndex];
  }

  /**
   * Load scenario by ID
   */
  async function loadScenario(scenarioId) {
    if (!window.supabase) {
      console.error('Supabase client not initialized');
      return null;
    }

    try {
      const { data, error } = await window.supabase
        .from('scenarios')
        .select('*')
        .eq('id', scenarioId)
        .single();

      if (error) {
        console.error('Error loading scenario:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in loadScenario:', error);
      return null;
    }
  }

  /**
   * Render challenge UI
   */
  function renderChallenge(scenario, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    currentChallenge = scenario;
    startTime = Date.now();
    timeRemaining = scenario.time_limit_seconds || 60;
    challengeAnswered = false;

    const difficultyColors = {
      beginner: '#5b8aff',
      intermediate: '#76ddff',
      advanced: '#a855f7'
    };

    const skillIcons = {
      technical_analysis: '📊',
      order_flow: '📈',
      risk_management: '🛡️',
      psychology: '🧠'
    };

    let html = `
      <div class="challenge-container" data-challenge-id="${scenario.id}">
        <div class="challenge-header">
          <div class="challenge-meta">
            <span class="challenge-difficulty" style="color: ${difficultyColors[scenario.difficulty]};">
              ${scenario.difficulty.toUpperCase()}
            </span>
            <span class="challenge-category">
              ${skillIcons[scenario.skill_category] || '📚'}
              ${scenario.skill_category.replace('_', ' ')}
            </span>
          </div>
          <div class="challenge-timer" id="challengeTimer">
            <span class="timer-icon">⏱️</span>
            <span class="timer-value">${timeRemaining}s</span>
          </div>
        </div>

        <div class="challenge-content">
          <h2 class="challenge-title">${scenario.title}</h2>
          <p class="challenge-description">${scenario.description}</p>
    `;

    // Add chart if available
    if (scenario.chart_image_url) {
      html += `
        <div class="challenge-chart">
          <img src="${scenario.chart_image_url}" alt="Trading Chart" />
        </div>
      `;
    }

    html += `
          <div class="challenge-context">
            <strong>Context:</strong> ${scenario.context}
          </div>

          <div class="challenge-question">
            <strong>What would you do?</strong>
          </div>

          <div class="challenge-options" id="challengeOptions">
    `;

    // Render options
    const options = scenario.options || [];
    options.forEach(option => {
      html += `
        <button class="challenge-option" data-option-id="${option.id}">
          <span class="option-letter">${option.id}</span>
          <span class="option-text">${option.text}</span>
        </button>
      `;
    });

    html += `
          </div>
        </div>

        <div class="challenge-result" id="challengeResult" style="display: none;">
          <!-- Result will be inserted here -->
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Add event listeners to options
    const optionButtons = container.querySelectorAll('.challenge-option');
    optionButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const optionId = e.currentTarget.dataset.optionId;
        handleAnswer(optionId);
      });
    });

    // Start timer
    startTimer();
  }

  /**
   * Start challenge timer
   */
  function startTimer() {
    // Stop any existing timer first to prevent double-counting
    stopTimer();

    const timerElement = document.getElementById('challengeTimer');
    if (!timerElement) return;

    timerInterval = setInterval(() => {
      timeRemaining--;

      const timerValue = timerElement.querySelector('.timer-value');
      if (timerValue) {
        timerValue.textContent = `${timeRemaining}s`;

        // Change color when time is running out
        if (timeRemaining <= 10) {
          timerValue.style.color = '#ef4444';
        } else if (timeRemaining <= 30) {
          timerValue.style.color = '#f59e0b';
        }
      }

      if (timeRemaining <= 0) {
        stopTimer();
        handleTimeout();
      }
    }, 1000);
  }

  /**
   * Stop challenge timer
   */
  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  /**
   * Handle timeout
   */
  function handleTimeout() {
    if (challengeAnswered) return; // User already answered, ignore timeout
    challengeAnswered = true;

    // Disable all options
    const options = document.querySelectorAll('.challenge-option');
    options.forEach(opt => opt.disabled = true);

    // Show timeout message
    showResult({
      isCorrect: false,
      message: 'Time\'s up! You ran out of time to make a decision.',
      score: 0,
      timeTaken: currentChallenge.time_limit_seconds
    });
  }

  /**
   * Handle answer selection
   */
  function handleAnswer(selectedOptionId) {
    if (challengeAnswered) return; // Prevent double-submission
    challengeAnswered = true;
    stopTimer();

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const isCorrect = selectedOptionId === currentChallenge.correct_answer_id;

    // Calculate score (correctness + time bonus)
    let score = 0;
    if (isCorrect) {
      const baseScore = currentChallenge.points || 100;
      const timeBonus = Math.max(0, timeRemaining * 2); // 2 points per second remaining
      score = baseScore + timeBonus;
    }

    // Disable all options
    const options = document.querySelectorAll('.challenge-option');
    options.forEach(opt => {
      opt.disabled = true;
      const optId = opt.dataset.optionId;

      if (optId === currentChallenge.correct_answer_id) {
        opt.classList.add('correct');
      } else if (optId === selectedOptionId) {
        opt.classList.add('incorrect');
      }
    });

    // Award XP if gamification is available
    let xpAwarded = 0;
    if (isCorrect && window.Gamification) {
      xpAwarded = score;
      window.Gamification.awardXP(score, 'Scenario Challenge Completed');
    }

    // Show result with XP
    showResult({
      isCorrect,
      selectedOptionId,
      score,
      timeTaken,
      xpAwarded
    });

    // Save result to database
    saveResult({
      scenario_id: currentChallenge.id,
      selected_answer_id: selectedOptionId,
      is_correct: isCorrect,
      time_taken_seconds: timeTaken,
      score
    });
  }

  /**
   * Show challenge result
   */
  function showResult(result) {
    const resultContainer = document.getElementById('challengeResult');
    const optionsContainer = document.getElementById('challengeOptions');

    if (!resultContainer) return;

    const statusIcon = result.isCorrect ? '✅' : '❌';
    const statusText = result.isCorrect ? 'CORRECT!' : 'INCORRECT';
    const statusClass = result.isCorrect ? 'result-correct' : 'result-incorrect';

    let html = `
      <div class="challenge-result-content ${statusClass}">
        <div class="result-header">
          <span class="result-icon">${statusIcon}</span>
          <span class="result-status">${statusText}</span>
        </div>
    `;

    if (result.isCorrect) {
      html += `
        <div class="result-score">
          <div class="result-score-value">+${result.score}</div>
          <div class="result-score-label">Points earned</div>
      `;

      // Show XP earned if available
      if (result.xpAwarded && result.xpAwarded > 0) {
        html += `
          <div class="result-xp-value" style="color: #fbbf24; font-size: 1.5rem; font-weight: bold; margin-top: 0.75rem;">
            ⭐ +${result.xpAwarded} XP
          </div>
          <div class="result-score-label" style="color: #fbbf24;">Experience earned</div>
        `;
      }

      html += `
        </div>
      `;
    }

    html += `
        <div class="result-explanation">
          <h4>Explanation:</h4>
          <p>${currentChallenge.explanation}</p>
        </div>

        <div class="result-stats">
          <div class="result-stat">
            <span class="result-stat-label">Your time:</span>
            <span class="result-stat-value">${result.timeTaken}s</span>
          </div>
        </div>

        <div class="result-actions">
          <button class="btn btn-primary" onclick="window.ScenarioChallenges.loadNextChallenge()">
            Next Challenge
          </button>
          <button class="btn btn-ghost" onclick="window.location.href='/education/challenges.html'">
            Back to Challenges
          </button>
        </div>
      </div>
    `;

    resultContainer.innerHTML = html;
    resultContainer.style.display = 'block';

    // Scroll to result
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Save result to database
   */
  async function saveResult(result) {
    if (!window.supabase || !window.supabaseAuth) {
      console.log('Result not saved - user not authenticated');
      return;
    }

    try {
      const user = await window.supabaseAuth.getCurrentUser();
      if (!user) {
        console.log('Result not saved - no user');
        return;
      }

      const { error } = await window.supabase
        .from('user_scenario_results')
        .insert({
          user_id: user.id,
          ...result
        });

      if (error) {
        console.error('Error saving scenario result:', error);
      } else {
        console.log('Scenario result saved successfully');

        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('sp:scenarioCompleted', {
          detail: result
        }));
      }
    } catch (error) {
      console.error('Error in saveResult:', error);
    }
  }

  /**
   * Load next random challenge
   */
  async function loadNextChallenge(options = {}) {
    const container = document.getElementById(options.containerId || 'challengeContainer');

    // Show loading state
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--muted);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
          <p>Loading challenge...</p>
        </div>
      `;
    }

    const scenario = await getRandomScenario(options);

    if (!scenario) {
      console.error('No scenarios returned from database');

      if (container) {
        container.innerHTML = `
          <div style="text-align: center; padding: 3rem; color: var(--muted);">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📚</div>
            <h3 style="color: var(--text); margin-bottom: 0.5rem;">No Challenges Available</h3>
            <p>No scenarios match your criteria. Try a different difficulty or category.</p>
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem; flex-wrap: wrap;">
              <button class="btn btn-primary" onclick="window.ScenarioChallenges.loadNextChallenge()">
                🎲 Try Random Challenge
              </button>
              <button class="btn btn-ghost" onclick="location.reload()">
                🔄 Reload Page
              </button>
            </div>
          </div>
        `;
      }
      return;
    }

    renderChallenge(scenario, options.containerId || 'challengeContainer');
  }

  /**
   * Get user's challenge statistics
   */
  async function getUserStats() {
    if (!window.supabase || !window.supabaseAuth) {
      return null;
    }

    try {
      const user = await window.supabaseAuth.getCurrentUser();
      if (!user) return null;

      const { data, error } = await window.supabase
        .from('user_scenario_results')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user stats:', error);
        return null;
      }

      const total = data.length;
      const correct = data.filter(r => r.is_correct).length;
      const totalScore = data.reduce((sum, r) => sum + (r.score || 0), 0);
      const avgScore = total > 0 ? Math.round(totalScore / total) : 0;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

      return {
        total,
        correct,
        totalScore,
        avgScore,
        accuracy
      };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      return null;
    }
  }

  /**
   * Get leaderboard
   */
  async function getLeaderboard(limit = 10) {
    if (!window.supabase) {
      return [];
    }

    try {
      const { data, error } = await window.supabase
        .from('scenario_leaderboard')
        .select('*')
        .limit(limit);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLeaderboard:', error);
      return [];
    }
  }

  /**
   * Wait for Supabase to be ready
   */
  function waitForSupabase(callback, maxAttempts = 20) {
    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      if (window.supabase) {
        clearInterval(checkInterval);
        callback();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.error('Supabase failed to initialize after', maxAttempts, 'attempts');

        // Show error message to user
        const container = document.getElementById('challengeContainer');
        if (container) {
          container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--muted);">
              <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
              <h3 style="color: var(--text); margin-bottom: 0.5rem;">Connection Error</h3>
              <p>Unable to load challenges. Please check your internet connection and refresh the page.</p>
              <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 1rem;">
                🔄 Reload Page
              </button>
            </div>
          `;
        }
      }
    }, 100); // Check every 100ms
  }

  /**
   * Initialize challenges system
   */
  function init() {
    // Wait for Supabase to be ready before loading challenges
    waitForSupabase(() => {
      // Auto-load challenge if container exists
      const challengeContainer = document.getElementById('challengeContainer');
      if (challengeContainer && !challengeContainer.hasChildNodes()) {
        // Check URL params for specific challenge or options
        const urlParams = new URLSearchParams(window.location.search);
        const difficulty = urlParams.get('difficulty');
        const skillCategory = urlParams.get('skill');

        loadNextChallenge({
          containerId: 'challengeContainer',
          difficulty,
          skillCategory
        });
      }
    });
  }

  // Expose public API
  window.ScenarioChallenges = {
    fetchScenarios,
    getRandomScenario,
    loadScenario,
    renderChallenge,
    loadNextChallenge,
    getUserStats,
    getLeaderboard,
    init
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
