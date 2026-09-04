/**
 * Interactive Learning Path Map
 * Visual representation of lesson progression across all tiers
 */

(function() {
  'use strict';

  // The tiers, their lesson numbers and their URLs all come from the
  // catalogue. They used to be typed here against the pre-renumber
  // curriculum: tiers of 20/27/27/8 running 1-20, 21-47, 48-74 and 75-82,
  // a total of 86, and URLs of the form beginner/lesson3.html, which has
  // never been a filename in this repo.
  const TIER_META = {
    beginner:     { title: 'Beginner',     level: 'Beginner',     icon: '\u{1F331}', color: '#5b8aff' },
    intermediate: { title: 'Intermediate', level: 'Intermediate', icon: '\u{1F4C8}', color: '#76ddff' },
    advanced:     { title: 'Advanced',     level: 'Advanced',     icon: '\u{1F3AF}', color: '#a855f7' },
    professional: { title: 'Professional', level: 'Professional', icon: '\u{1F3C6}', color: '#ec4899' }
  };

  const CURRICULUM = {};   // filled by loadCurriculum()
  const HREF = {};         // slot number -> lesson URL
  const LEVEL = {};        // slot number -> level, for the storage key
  let TOTAL = 0;
  let loaded = null;

  function loadCurriculum() {
    if (loaded) return loaded;
    loaded = fetch('/education/curriculum/index.json', { cache: 'no-store' })
      .then(r => r.json())
      .then(cat => {
        Object.entries(TIER_META).forEach(([tier, meta]) => {
          const rows = cat.filter(e => e.level === meta.level)
                          .sort((a, b) => a.order - b.order);
          if (!rows.length) return;
          CURRICULUM[tier] = { ...meta, lessons: rows.map(e => e.order) };
          rows.forEach(e => { HREF[e.order] = e.href; LEVEL[e.order] = e.level; });
        });
        TOTAL = cat.length;
        return CURRICULUM;
      })
      .catch(err => {
        console.log('[LearningPathMap] catalogue unavailable', err);
        return CURRICULUM;
      });
    return loaded;
  }

  /**
   * The storage key a lesson page writes. A lesson page stores its own
   * sp-level and sp-order, and sp-order is the global slot, not an index
   * within the tier -- this used to subtract the tier offset, so no key it
   * built ever matched one that had been written.
   */
  function getLessonKey(lessonNum) {
    const level = LEVEL[lessonNum];
    return level ? { level, articleId: lessonNum } : null;
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
    const slots = Object.keys(HREF).map(Number).sort((a, b) => a - b);
    for (const slot of slots) {
      if (!isLessonCompleted(slot)) return slot;
    }
    return slots.length ? slots[slots.length - 1] : 0;  // all completed
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
        const url = HREF[lessonNum];
        if (url) window.location.href = url;
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
      <span>You are ${isLessonCompleted(currentLesson) ? 'all done! 🎉' : `on lesson ${currentLesson}`}</span>
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
    const totalLessons = TOTAL;

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

    const overallProgress = totalLessons ? Math.round((totalCompleted / totalLessons) * 100) : 0;

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
    const draw = () => {
      if (document.getElementById('learningPathMap')) renderLearningPath('learningPathMap');
      if (document.getElementById('progressOverview')) renderProgressOverview('progressOverview');
    };
    loadCurriculum().then(draw);

    // Listen for lesson completion events to update the map
    window.addEventListener('sp:lessonCompleted', () => loadCurriculum().then(draw));
  }

  // Expose public API
  window.LearningPathMap = {
    load: loadCurriculum,
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
