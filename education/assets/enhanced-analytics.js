/**
 * Enhanced Analytics for SignalPilot Education Hub
 * Tracks: Scroll depth, section time, interactions, quiz performance, downloads
 * Version: 1.0
 * Date: November 5, 2025
 */

(function() {
  'use strict';

  // Only run if Plausible is available
  if (!window.plausible) {
    console.warn('[Analytics] Plausible not loaded, enhanced analytics disabled');
    return;
  }

  const lessonTitle = document.querySelector('h1.headline')?.textContent?.trim() || 'Unknown Lesson';
  const lessonLevel = document.querySelector('.badge')?.textContent?.match(/(Beginner|Intermediate|Advanced|Professional)/)?.[1] || 'Unknown';

  console.log(`[Analytics] Initialized for: ${lessonTitle}`);

  // ============================================
  // 1. SCROLL DEPTH TRACKING
  // ============================================
  let maxScroll = 0;
  const scrollMilestones = [25, 50, 75, 90, 100];
  const trackedMilestones = new Set();

  function trackScrollDepth() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const scrollPercent = Math.min(Math.round((window.scrollY / docHeight) * 100), 100);

    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;

      scrollMilestones.forEach(milestone => {
        if (maxScroll >= milestone && !trackedMilestones.has(milestone)) {
          trackedMilestones.add(milestone);
          plausible('Scroll Depth', {
            props: {
              percent: milestone,
              lesson: lessonTitle,
              level: lessonLevel
            }
          });
          console.log(`[Analytics] Scroll depth: ${milestone}%`);
        }
      });
    }
  }

  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(trackScrollDepth, 100);
  }, { passive: true });

  // ============================================
  // 2. SECTION TIME TRACKING
  // ============================================
  const sectionTimes = new Map();

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const h2 = entry.target.querySelector('h2');
      const sectionId = entry.target.id || h2?.id || h2?.textContent?.trim();

      if (!sectionId) return;

      if (entry.isIntersecting) {
        // Start timing when section becomes visible
        if (!sectionTimes.has(sectionId)) {
          sectionTimes.set(sectionId, Date.now());
        }
      } else {
        // Stop timing when section leaves viewport
        const startTime = sectionTimes.get(sectionId);
        if (startTime) {
          const timeSpent = Math.round((Date.now() - startTime) / 1000);

          // Only track if spent at least 5 seconds
          if (timeSpent >= 5) {
            plausible('Section Time', {
              props: {
                section: sectionId.substring(0, 50), // Limit length
                seconds: timeSpent,
                lesson: lessonTitle,
                level: lessonLevel
              }
            });
            console.log(`[Analytics] Section "${sectionId}": ${timeSpent}s`);
          }
          sectionTimes.delete(sectionId);
        }
      }
    });
  }, { threshold: 0.5 });

  // Observe all major sections (those with H2 headings)
  document.querySelectorAll('.prose h2').forEach(h2 => {
    const section = h2.closest('section') || h2.parentElement;
    if (section) {
      sectionObserver.observe(section);
    }
  });

  // ============================================
  // 3. INTERACTIVE ELEMENTS TRACKING
  // ============================================

  // 3a. TL;DR toggle
  document.querySelectorAll('details').forEach(details => {
    let openTime = null;

    details.addEventListener('toggle', function() {
      if (this.open) {
        openTime = Date.now();
        plausible('TL;DR Opened', {
          props: {
            lesson: lessonTitle,
            level: lessonLevel
          }
        });
        console.log('[Analytics] TL;DR opened');
      } else if (openTime) {
        const timeSpent = Math.round((Date.now() - openTime) / 1000);
        if (timeSpent >= 3) {
          plausible('TL;DR Read Time', {
            props: {
              seconds: timeSpent,
              lesson: lessonTitle
            }
          });
        }
        openTime = null;
      }
    });
  });

  // 3b. Tabs
  document.querySelectorAll('.tabs button').forEach(btn => {
    btn.addEventListener('click', function() {
      const tabText = this.textContent.trim();
      plausible('Tab Clicked', {
        props: {
          tab: tabText.substring(0, 50),
          lesson: lessonTitle
        }
      });
      console.log(`[Analytics] Tab clicked: ${tabText}`);
    });
  });

  // 3c. Accordions
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', function() {
      const accordionText = this.textContent.trim();
      plausible('Accordion Opened', {
        props: {
          section: accordionText.substring(0, 50),
          lesson: lessonTitle
        }
      });
      console.log(`[Analytics] Accordion: ${accordionText}`);
    });
  });

  // 3d. Callout boxes (viewability)
  const calloutObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.tracked) {
        entry.target.dataset.tracked = 'true';

        const calloutClasses = entry.target.className.split(' ');
        const type = calloutClasses.find(c => c.startsWith('callout-')) || 'callout-unknown';
        const heading = entry.target.querySelector('h4, h3')?.textContent?.trim() || 'No heading';

        plausible('Callout Viewed', {
          props: {
            type: type.replace('callout-', ''),
            heading: heading.substring(0, 50),
            lesson: lessonTitle
          }
        });
        console.log(`[Analytics] Callout viewed: ${type} - ${heading}`);
      }
    });
  }, { threshold: 0.7 });

  document.querySelectorAll('[class*="callout-"]').forEach(callout => {
    calloutObserver.observe(callout);
  });

  // ============================================
  // 4. QUIZ PERFORMANCE TRACKING
  // ============================================
  document.querySelectorAll('.quiz-submit').forEach(btn => {
    btn.addEventListener('click', function() {
      const quiz = this.closest('.quiz');
      if (!quiz) return;

      const question = quiz.querySelector('.quiz-question p')?.textContent?.trim() || 'Unknown question';
      const options = quiz.querySelectorAll('.quiz-option');
      let selectedOption = null;

      // Find selected option (various possible states)
      options.forEach(opt => {
        if (opt.classList.contains('selected') ||
            opt.style.background ||
            opt === document.activeElement) {
          selectedOption = opt;
        }
      });

      const isCorrect = selectedOption?.dataset.correct === 'true';

      plausible('Quiz Answered', {
        props: {
          lesson: lessonTitle,
          level: lessonLevel,
          correct: isCorrect ? 'yes' : 'no',
          question: question.substring(0, 80)
        }
      });

      console.log(`[Analytics] Quiz answered: ${isCorrect ? 'Correct' : 'Incorrect'}`);
    });
  });

  // ============================================
  // 5. DOWNLOAD TRACKING
  // ============================================
  document.querySelectorAll('a[download], a[href*=".pdf"], a[href*="/education/resources/"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const resourceName = this.textContent.trim() || this.href.split('/').pop();

      plausible('Resource Downloaded', {
        props: {
          resource: resourceName.substring(0, 60),
          lesson: lessonTitle,
          level: lessonLevel
        }
      });

      console.log(`[Analytics] Resource downloaded: ${resourceName}`);
    });
  });

  // ============================================
  // 6. CHECKPOINT TRACKING
  // ============================================
  const checkpointObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.tracked) {
        entry.target.dataset.tracked = 'true';

        const checkpointText = entry.target.querySelector('h4')?.textContent || '';
        const checkpointMatch = checkpointText.match(/🔴|🟡|🟢/);
        const checkpointType = checkpointMatch ? checkpointMatch[0] : 'unknown';

        let percentage = 0;
        if (checkpointText.includes('5 minutes') || checkpointType === '🔴') percentage = 33;
        else if (checkpointText.includes('10 minutes') || checkpointType === '🟡') percentage = 66;
        else if (checkpointText.includes('15 minutes') || checkpointType === '🟢') percentage = 90;

        if (percentage > 0) {
          plausible('Checkpoint Reached', {
            props: {
              checkpoint: `${percentage}%`,
              lesson: lessonTitle,
              level: lessonLevel
            }
          });
          console.log(`[Analytics] Checkpoint reached: ${percentage}%`);
        }
      }
    });
  }, { threshold: 0.8 });

  document.querySelectorAll('[class*="callout-info"]').forEach(callout => {
    const text = callout.textContent || '';
    if (text.includes('CHECKPOINT')) {
      checkpointObserver.observe(callout);
    }
  });

  // ============================================
  // 7. NAVIGATION TRACKING
  // ============================================
  document.querySelectorAll('.nav-article a').forEach(link => {
    link.addEventListener('click', function() {
      const direction = this.textContent.includes('Previous') ? 'previous' : 'next';

      plausible('Lesson Navigation', {
        props: {
          direction: direction,
          from_lesson: lessonTitle,
          level: lessonLevel
        }
      });
      console.log(`[Analytics] Navigation: ${direction}`);
    });
  });

  // Related lessons links
  document.querySelectorAll('.card a[href*="/education/curriculum/"]').forEach(link => {
    link.addEventListener('click', function() {
      const targetLesson = this.querySelector('h4')?.textContent?.trim() || 'Unknown';

      plausible('Related Lesson Clicked', {
        props: {
          target: targetLesson.substring(0, 50),
          from_lesson: lessonTitle
        }
      });
      console.log(`[Analytics] Related lesson clicked: ${targetLesson}`);
    });
  });

  // ============================================
  // 8. SESSION SUMMARY (on exit)
  // ============================================
  let sessionStartTime = Date.now();

  window.addEventListener('beforeunload', () => {
    const timeOnPage = Math.round((Date.now() - sessionStartTime) / 1000);

    // Only track if spent at least 10 seconds
    if (timeOnPage >= 10) {
      plausible('Lesson Exit', {
        props: {
          lesson: lessonTitle,
          level: lessonLevel,
          max_scroll: maxScroll,
          time_on_page: timeOnPage
        }
      });
    }
  });

  // ============================================
  // 9. PAGE VISIBILITY (track when user switches tabs)
  // ============================================
  let visibilityStartTime = Date.now();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // User switched away
      const activeTime = Math.round((Date.now() - visibilityStartTime) / 1000);
      if (activeTime >= 30) {
        plausible('Tab Switched Away', {
          props: {
            active_time: activeTime,
            lesson: lessonTitle
          }
        });
      }
    } else {
      // User returned
      visibilityStartTime = Date.now();
      plausible('Tab Returned', {
        props: {
          lesson: lessonTitle
        }
      });
    }
  });

  console.log('[Analytics] ✓ Enhanced analytics fully initialized');

})();
