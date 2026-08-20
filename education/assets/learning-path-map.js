/**
 * Interactive Learning Path Map
 * Visual representation of lesson progression across all tiers
 */

(function() {
  'use strict';

  // Lesson structure by tier
  const CURRICULUM = {
    beginner: {
      title: 'Beginner',
      icon: '🌱',
      color: '#5b8aff',
      lessons: Array.from({ length: 20 }, (_, i) => i + 1),
      baseUrl: '/education/curriculum/beginner/lesson'
    },
    intermediate: {
      title: 'Intermediate',
      icon: '📈',
      color: '#76ddff',
      lessons: Array.from({ length: 27 }, (_, i) => i + 21),
      baseUrl: '/education/curriculum/intermediate/lesson'
    },
    advanced: {
      title: 'Advanced',
      icon: '🎯',
      color: '#a855f7',
      lessons: Array.from({ length: 27 }, (_, i) => i + 48),
      baseUrl: '/education/curriculum/advanced/lesson'
    },
    professional: {
      title: 'Professional',
      icon: '🏆',
      color: '#ec4899',
      lessons: Array.from({ length: 8 }, (_, i) => i + 75),
      baseUrl: '/education/curriculum/professional/lesson'
    }
  };

  /**
   * Convert lesson number to level and articleId
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

  /**
   * Get lesson completion status
   */
  function isLessonCompleted(lessonNum) {
    const lessonKey = getLessonKey(lessonNum);
    if (!lessonKey) return false;
    const key = `sp_edu_${lessonKey.level}_${lessonKey.articleId}_completed`;
    return !!localStorage.getItem(key);
  }

  /**
   * Calculate tier progress
   */
  function getTierProgress(tier) {
    const lessons = CURRICULUM[tier].lessons;
    const completed = lessons.filter(num => isLessonCompleted(num)).length;
    const total = lessons.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }

  /**
   * Check if tier is unlocked
   */
  function isTierUnlocked(tier) {
    // Beginner is always unlocked
    if (tier === 'beginner') return true;

    // Check if previous tier is completed
    const tiers = ['beginner', 'intermediate', 'advanced', 'professional'];
    const currentIndex = tiers.indexOf(tier);
    if (currentIndex === -1) return false;

    const previousTier = tiers[currentIndex - 1];
    const progress = getTierProgress(previousTier);

    return progress.percentage === 100;
  }

  /**
   * Find current lesson (first incomplete lesson)
   */
  function findCurrentLesson() {
    for (let i = 1; i <= 82; i++) {
      if (!isLessonCompleted(i)) {
        return i;
      }
    }
    return 82; // All completed
  }

  /**
   * Create lesson node element
   */
  function createLessonNode(lessonNum, tier, isCurrent) {
    const completed = isLessonCompleted(lessonNum);
    const tierUnlocked = isTierUnlocked(tier);
    const locked = !tierUnlocked && !completed;

    const node = document.createElement('div');
    node.className = 'lesson-node';
    node.textContent = lessonNum;

    if (completed) {
      node.classList.add('completed');
      node.innerHTML = '✓';
    } else if (isCurrent) {
      node.classList.add('current');
    } else if (locked) {
      node.classList.add('locked');
      node.innerHTML = '🔒';
    }

    // Add tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'lesson-node-tooltip';

    if (completed) {
      tooltip.textContent = `Lesson ${lessonNum} - Completed`;
    } else if (isCurrent) {
      tooltip.textContent = `Lesson ${lessonNum} - Continue here`;
    } else if (locked) {
      tooltip.textContent = `Lesson ${lessonNum} - Locked`;
    } else {
      tooltip.textContent = `Lesson ${lessonNum}`;
    }

    node.appendChild(tooltip);

    // Add click handler
    if (!locked) {
      node.style.cursor = 'pointer';
      node.addEventListener('click', () => {
        const url = `${CURRICULUM[tier].baseUrl}${lessonNum}.html`;
        window.location.href = url;
      });
    }

    return node;
  }

  /**
   * Render learning path for a specific tier
   */
  function renderTierPath(tier, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const tierData = CURRICULUM[tier];
    const progress = getTierProgress(tier);
    const unlocked = isTierUnlocked(tier);
    const currentLesson = findCurrentLesson();

    let html = `
      <div class="learning-path-tier">
        <div class="tier-header">
          <div class="tier-title">
            <span class="tier-icon">${tierData.icon}</span>
            ${tierData.title}
          </div>
    `;

    if (unlocked) {
      html += `<div class="tier-progress-text">${progress.completed}/${progress.total} lessons</div>`;
    } else {
      html += `
        <div class="tier-locked-badge">
          🔒 Complete ${Object.keys(CURRICULUM)[Object.keys(CURRICULUM).indexOf(tier) - 1]} to unlock
        </div>
      `;
    }

    html += `
        </div>
        <div class="lesson-path">
    `;

    // Create lesson nodes
    const lessonNodesHtml = tierData.lessons.map(lessonNum => {
      const isCurrent = lessonNum === currentLesson;
      const node = createLessonNode(lessonNum, tier, isCurrent);
      return node.outerHTML;
    }).join('');

    html += lessonNodesHtml;

    html += `
        </div>
      </div>
    `;

    container.innerHTML += html;
  }

  /**
   * Render complete learning path
   */
  function renderLearningPath(containerId = 'learningPathMap') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear container
    container.innerHTML = '';

    // Render each tier
    Object.keys(CURRICULUM).forEach(tier => {
      renderTierPath(tier, containerId);
    });

    // Add current position indicator
    const currentLesson = findCurrentLesson();
    const indicator = document.createElement('div');
    indicator.className = 'current-position-indicator';
    indicator.innerHTML = `
      <span style="font-size: 1.2rem;">📍</span>
      <span>You are ${currentLesson <= 82 ? `on lesson ${currentLesson}` : 'all done! 🎉'}</span>
    `;
    container.appendChild(indicator);
  }

  /**
   * Render compact progress overview
   */
  function renderProgressOverview(containerId = 'progressOverview') {
    const container = document.getElementById(containerId);
    if (!container) return;

    let totalCompleted = 0;
    let totalLessons = 82;

    let html = '<div class="progress-overview">';

    Object.entries(CURRICULUM).forEach(([tier, data]) => {
      const progress = getTierProgress(tier);
      totalCompleted += progress.completed;

      html += `
        <div class="tier-progress-item">
          <div class="tier-progress-header">
            <span>${data.icon} ${data.title}</span>
            <span class="tier-progress-percentage">${progress.percentage}%</span>
          </div>
          <div class="skill-progress-bar">
            <div class="skill-progress-fill" style="width: ${progress.percentage}%; background: ${data.color};"></div>
          </div>
          <div class="tier-progress-meta">${progress.completed}/${progress.total} lessons</div>
        </div>
      `;
    });

    const overallProgress = Math.round((totalCompleted / totalLessons) * 100);

    html += `
      <div class="overall-progress">
        <div class="overall-progress-title">Overall Progress</div>
        <div class="overall-progress-bar">
          <div class="overall-progress-fill" style="width: ${overallProgress}%;"></div>
        </div>
        <div class="overall-progress-text">${totalCompleted}/${totalLessons} lessons (${overallProgress}%)</div>
      </div>
    `;

    html += '</div>';
    container.innerHTML = html;
  }

  /**
   * Initialize learning path map
   */
  function init() {
    if (document.getElementById('learningPathMap')) {
      renderLearningPath('learningPathMap');
    }

    if (document.getElementById('progressOverview')) {
      renderProgressOverview('progressOverview');
    }

    // Listen for lesson completion events to update the map
    window.addEventListener('sp:lessonCompleted', () => {
      if (document.getElementById('learningPathMap')) {
        renderLearningPath('learningPathMap');
      }
      if (document.getElementById('progressOverview')) {
        renderProgressOverview('progressOverview');
      }
    });
  }

  // Expose public API
  window.LearningPathMap = {
    render: renderLearningPath,
    renderOverview: renderProgressOverview,
    getTierProgress,
    isTierUnlocked,
    findCurrentLesson,
    init
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
