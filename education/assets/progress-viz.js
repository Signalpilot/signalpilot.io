/**
 * Progress Visualization Module
 * Handles skills radar chart, time tracking, and percentile calculations
 */

(function() {
  'use strict';

  // Tier structure
  const TIER_STRUCTURE = {
    beginner: { start: 1, end: 20, count: 20 },
    intermediate: { start: 21, end: 47, count: 27 },
    advanced: { start: 48, end: 74, count: 27 },
    professional: { start: 75, end: 82, count: 8 }
  };

  /**
   * Convert lesson number (1-82) to level and articleId
   * @param {number} lessonNum - Lesson number (1-82)
   * @returns {{level: string, articleId: number}} - Level and article ID
   */
  function getLessonKey(lessonNum) {
    if (lessonNum >= 1 && lessonNum <= 20) {
      return { level: 'Beginner', articleId: lessonNum };
    } else if (lessonNum >= 21 && lessonNum <= 47) {
      return { level: 'Intermediate', articleId: lessonNum - 20 };
    } else if (lessonNum >= 48 && lessonNum <= 74) {
      return { level: 'Advanced', articleId: lessonNum - 47 };
    } else if (lessonNum >= 75 && lessonNum <= 82) {
      return { level: 'Professional', articleId: lessonNum - 74 };
    }
    return null;
  }

  // Skill categories and lesson mapping
  const SKILL_CATEGORIES = {
    technical_analysis: {
      name: 'Technical Analysis',
      color: 'rgba(91, 138, 255, 0.6)',
      lessons: [1, 2, 3, 7, 8, 9, 13, 14, 15, 19, 20, 29, 30, 31, 35, 36, 37, 41, 42, 43]
    },
    order_flow: {
      name: 'Order Flow',
      color: 'rgba(118, 221, 255, 0.6)',
      lessons: [4, 5, 10, 11, 16, 17, 21, 22, 32, 33, 38, 39, 44, 45, 52, 53, 60, 61]
    },
    risk_management: {
      name: 'Risk Management',
      color: 'rgba(168, 85, 247, 0.6)',
      lessons: [6, 12, 18, 23, 24, 25, 34, 40, 46, 47, 48, 54, 55, 62, 63]
    },
    psychology: {
      name: 'Trading Psychology',
      color: 'rgba(236, 72, 153, 0.6)',
      lessons: [26, 27, 28, 49, 50, 51, 56, 57, 58, 64, 65, 66, 67, 68, 69, 70, 71, 72]
    }
  };

  /**
   * Calculate user's skill progress across all categories
   */
  function calculateSkillProgress() {
    const skills = {};

    // Debug: Show what's actually in localStorage
    console.log('[Progress Viz] Checking localStorage for completed lessons...');
    const allKeys = Object.keys(localStorage).filter(k => k.includes('_completed'));
    console.log('[Progress Viz] All completion keys in localStorage:', allKeys);

    for (const [categoryId, category] of Object.entries(SKILL_CATEGORIES)) {
      const totalLessons = category.lessons.length;
      let completedLessons = 0;

      category.lessons.forEach(lessonNum => {
        const lessonKey = getLessonKey(lessonNum);
        if (lessonKey) {
          const key = `sp_edu_${lessonKey.level}_${lessonKey.articleId}_completed`;
          const completed = localStorage.getItem(key);
          if (completed) {
            console.log(`[Progress Viz] Found completed lesson: ${lessonNum} -> ${key}`);
            completedLessons++;
          }
        }
      });

      console.log(`[Progress Viz] ${category.name}: ${completedLessons}/${totalLessons} lessons completed`);

      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      skills[categoryId] = {
        progress,
        completed: completedLessons,
        total: totalLessons,
        name: category.name,
        color: category.color
      };
    }

    return skills;
  }

  /**
   * Create radar chart for skills visualization
   */
  function createRadarChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn('Radar chart canvas not found:', canvasId);
      return null;
    }

    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded. Please ensure Chart.js CDN is included.');
      return null;
    }

    const ctx = canvas.getContext('2d');
    const skills = calculateSkillProgress();

    const labels = Object.values(skills).map(s => s.name);
    const data = Object.values(skills).map(s => s.progress);

    // Destroy existing chart if it exists
    if (window.skillsRadarChart && typeof window.skillsRadarChart.destroy === 'function') {
      window.skillsRadarChart.destroy();
    }

    window.skillsRadarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Your Progress',
          data: data,
          backgroundColor: 'rgba(91, 138, 255, 0.2)',
          borderColor: 'rgba(91, 138, 255, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(91, 138, 255, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(91, 138, 255, 1)',
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 25,
              color: 'rgba(183, 194, 217, 0.6)',
              backdropColor: 'transparent',
              font: {
                size: 11
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            angleLines: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            pointLabels: {
              color: '#ecf1ff',
              font: {
                size: 13,
                weight: '600'
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#76ddff',
            bodyColor: '#ecf1ff',
            borderColor: 'rgba(91, 138, 255, 0.5)',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: function(context) {
                const skillName = context.label;
                const skillData = Object.values(skills).find(s => s.name === skillName);
                return [
                  `Progress: ${context.parsed.r}%`,
                  `Completed: ${skillData.completed}/${skillData.total} lessons`
                ];
              }
            }
          }
        }
      }
    });

    return window.skillsRadarChart;
  }

  /**
   * Display skills breakdown list
   */
  function displaySkillsBreakdown(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const skills = calculateSkillProgress();
    let html = '<div class="skills-breakdown">';

    for (const [categoryId, skill] of Object.entries(skills)) {
      const barColor = SKILL_CATEGORIES[categoryId].color.replace('0.6', '1');

      html += `
        <div class="skill-item">
          <div class="skill-header">
            <span class="skill-name">${skill.name}</span>
            <span class="skill-progress-text">${skill.progress}%</span>
          </div>
          <div class="skill-progress-bar">
            <div class="skill-progress-fill" style="width: ${skill.progress}%; background: ${barColor};"></div>
          </div>
          <div class="skill-meta">${skill.completed}/${skill.total} lessons completed</div>
        </div>
      `;
    }

    html += '</div>';
    container.innerHTML = html;
  }

  /**
   * Track time spent on lessons
   */
  class TimeTracker {
    constructor() {
      this.startTime = null;
      this.lessonId = null;
      this.intervalId = null;
    }

    start(lessonId) {
      if (this.intervalId) {
        this.stop(); // Stop previous tracking
      }

      this.lessonId = lessonId;
      this.startTime = Date.now();

      // Update every 30 seconds
      this.intervalId = setInterval(() => {
        this.update();
      }, 30000);

      // Track page visibility
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    stop() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }

      if (this.startTime) {
        this.update();
        this.startTime = null;
      }

      document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    update() {
      if (!this.startTime || !this.lessonId) return;

      const elapsed = Math.floor((Date.now() - this.startTime) / 1000); // seconds
      if (elapsed < 5) return; // Ignore very short times

      // Get current time tracking data
      const timeData = this.getTimeData();

      // Update total time
      timeData.total_seconds = (timeData.total_seconds || 0) + elapsed;

      // Update by lesson
      if (!timeData.by_lesson) timeData.by_lesson = {};
      timeData.by_lesson[this.lessonId] = (timeData.by_lesson[this.lessonId] || 0) + elapsed;

      // Update by date
      const today = new Date().toISOString().split('T')[0];
      if (!timeData.by_date) timeData.by_date = {};
      timeData.by_date[today] = (timeData.by_date[today] || 0) + elapsed;

      // Save to localStorage
      this.saveTimeData(timeData);

      // Reset start time for next interval
      this.startTime = Date.now();

      // Sync to cloud if user is logged in
      if (window.supabaseAuth && typeof window.supabaseAuth.syncProgressToCloud === 'function') {
        window.supabaseAuth.syncProgressToCloud();
      }
    }

    handleVisibilityChange() {
      if (document.hidden) {
        this.update(); // Save progress when tab becomes hidden
      } else {
        this.startTime = Date.now(); // Reset start time when tab becomes visible
      }
    }

    getTimeData() {
      try {
        const data = localStorage.getItem('sp_time_tracking');
        return data ? JSON.parse(data) : { total_seconds: 0, by_lesson: {}, by_date: {} };
      } catch (e) {
        return { total_seconds: 0, by_lesson: {}, by_date: {} };
      }
    }

    saveTimeData(data) {
      localStorage.setItem('sp_time_tracking', JSON.stringify(data));
    }

    getTotalTime() {
      const data = this.getTimeData();
      return data.total_seconds || 0;
    }

    getFormattedTotalTime() {
      const seconds = this.getTotalTime();
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    }
  }

  /**
   * Calculate user percentile based on time invested
   */
  async function calculatePercentile() {
    // This requires server-side calculation with all users' data
    // For now, return a mock percentile or fetch from Supabase function

    if (!window.supabase) {
      return null;
    }

    try {
      const user = await window.supabaseAuth?.getCurrentUser();
      if (!user) return null;

      const { data, error } = await window.supabase.rpc('get_user_percentile', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error calculating percentile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in calculatePercentile:', error);
      return null;
    }
  }

  /**
   * Display time stats with percentile
   */
  async function displayTimeStats(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const tracker = new TimeTracker();
    const totalTime = tracker.getFormattedTotalTime();

    // Count completed lessons
    let completedLessons = 0;
    for (let i = 1; i <= 82; i++) {
      const lessonKey = getLessonKey(i);
      if (lessonKey) {
        const key = `sp_edu_${lessonKey.level}_${lessonKey.articleId}_completed`;
        if (localStorage.getItem(key)) {
          completedLessons++;
        }
      }
    }

    // Get streak
    const streakData = JSON.parse(localStorage.getItem('sp_learning_streak') || '{"current": 0}');
    const streak = streakData.current || 0;

    // Calculate percentile
    const percentile = await calculatePercentile();

    let html = `
      <div class="time-stats-grid">
        <div class="time-stat">
          <div class="time-stat-icon">⏱️</div>
          <div class="time-stat-value">${totalTime}</div>
          <div class="time-stat-label">Time invested</div>
        </div>
        <div class="time-stat">
          <div class="time-stat-icon">📚</div>
          <div class="time-stat-value">${completedLessons}/82</div>
          <div class="time-stat-label">Lessons</div>
        </div>
        <div class="time-stat">
          <div class="time-stat-icon">🔥</div>
          <div class="time-stat-value">${streak}</div>
          <div class="time-stat-label">Day streak</div>
        </div>
      </div>
    `;

    if (percentile !== null && percentile > 0) {
      html += `
        <div class="percentile-display">
          <span class="percentile-icon">📈</span>
          You're ahead of ${percentile}% of learners!
        </div>
      `;
    }

    container.innerHTML = html;
  }

  /**
   * Initialize progress visualization on page load
   */
  function init() {
    // Create radar chart if canvas exists
    if (document.getElementById('skillsRadarChart')) {
      // Wait for Chart.js to load
      if (typeof Chart !== 'undefined') {
        createRadarChart('skillsRadarChart');
      } else {
        // Wait for Chart.js to load
        const checkChartJs = setInterval(() => {
          if (typeof Chart !== 'undefined') {
            clearInterval(checkChartJs);
            createRadarChart('skillsRadarChart');
          }
        }, 100);
      }
    }

    // Display skills breakdown if container exists
    if (document.getElementById('skillsBreakdown')) {
      displaySkillsBreakdown('skillsBreakdown');
    }

    // Display time stats if container exists
    if (document.getElementById('timeStats')) {
      displayTimeStats('timeStats');
    }

    // Auto-start time tracking on lesson pages
    const lessonMatch = window.location.pathname.match(/lesson(\d+)\.html/);
    if (lessonMatch) {
      const lessonId = lessonMatch[1];
      const tracker = new TimeTracker();
      tracker.start(lessonId);

      // Stop tracking when leaving page
      window.addEventListener('beforeunload', () => {
        tracker.stop();
      });
    }
  }

  // Expose public API
  window.ProgressViz = {
    calculateSkillProgress,
    createRadarChart,
    displaySkillsBreakdown,
    displayTimeStats,
    TimeTracker,
    calculatePercentile,
    init
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
