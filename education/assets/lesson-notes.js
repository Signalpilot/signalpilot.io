/**
 * Lesson Notes Feature
 * Allows students to take notes on each lesson
 * Auto-saves to localStorage and syncs to cloud
 */

(function() {
  'use strict';

  const NOTES_KEY = 'sp_lesson_notes';
  let saveTimeout;
  let currentLessonId;
  let currentLessonTitle;
  let currentLessonUrl;

  /**
   * Get lesson metadata from page
   */
  function getLessonMetadata() {
    // Extract lesson ID from URL: /curriculum/intermediate/27-the-liquidity-lie.html → beginner-01
    // Now supports all 7 tiers including bridges and mastery tiers
    const path = window.location.pathname;
    const match = path.match(/curriculum\/(beginner|intermediate|advanced|professional)\/(\d+)-/);

    if (match) {
      currentLessonId = `${match[1]}-${match[2]}`;
      currentLessonTitle = document.querySelector('h1')?.textContent || document.title;
      currentLessonUrl = window.location.pathname;
      return true;
    }
    return false;
  }

  /**
   * Load existing notes for current lesson
   */
  function loadNotes() {
    const allNotes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
    const lessonNote = allNotes[currentLessonId];

    if (lessonNote && lessonNote.content) {
      return lessonNote.content;
    }
    return '';
  }

  /**
   * Save notes for current lesson
   */
  function saveNotes(content) {
    const allNotes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');

    if (content.trim()) {
      allNotes[currentLessonId] = {
        lessonTitle: currentLessonTitle,
        lessonUrl: currentLessonUrl,
        content: content.trim(),
        lastModified: new Date().toISOString()
      };
    } else {
      // Remove note if empty
      delete allNotes[currentLessonId];
    }

    localStorage.setItem(NOTES_KEY, JSON.stringify(allNotes));
    logger.log('[Notes] Saved for lesson:', currentLessonId);

    if (content.trim()) {
      window.dispatchEvent(new CustomEvent('sp:noteSaved', {
        detail: { lessonId: currentLessonId, length: content.trim().length }
      }));
    }

    // Trigger cloud sync
    if (window.supabaseAuth?.onProgressChange) {
      window.supabaseAuth.onProgressChange();
    }

    showSaveIndicator();
  }

  /**
   * Auto-save with debounce
   */
  function autoSave(content) {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveNotes(content);
    }, 1000); // Save 1 second after user stops typing
  }

  /**
   * Show save indicator
   */
  function showSaveIndicator() {
    const indicator = document.getElementById('notes-save-indicator');
    if (!indicator) return;

    indicator.textContent = '✓ Saved';
    indicator.style.color = '#00d4aa';
    indicator.style.opacity = '1';

    setTimeout(() => {
      indicator.style.opacity = '0';
    }, 2000);
  }

  /**
   * Create notes UI
   * DISABLED: Redundant with notes button in header
   */
  function createNotesUI() {
    // Disabled - notes functionality exists in header/sidebar already
    return;

    // Only on lesson pages
    if (!window.location.pathname.includes('/education/curriculum/')) return;

    if (!getLessonMetadata()) {
      logger.log('[Notes] Could not extract lesson metadata');
      return;
    }

    // Find where to insert notes (before the nav-article)
    const navArticle = document.querySelector('.nav-article');
    if (!navArticle) {
      logger.log('[Notes] Could not find .nav-article element');
      return;
    }

    // Create notes section
    const notesSection = document.createElement('div');
    notesSection.className = 'notes-section';
    notesSection.innerHTML = `
      <div class="section-break"><span>📝 Your Notes</span></div>

      <div style="background:rgba(91,138,255,0.05);padding:1.5rem;border-radius:8px;border:1px solid rgba(91,138,255,0.2);margin-bottom:2rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
          <label for="lesson-notes" style="font-weight:600;color:var(--text);margin:0;">
            Take notes on this lesson
          </label>
          <span id="notes-save-indicator" style="font-size:0.85rem;color:var(--muted);opacity:0;transition:opacity 0.3s;">
            Saved
          </span>
        </div>

        <textarea
          id="lesson-notes"
          placeholder="Jot down key insights, questions, or trading ideas from this lesson...

Your notes auto-save and sync across devices when signed in."
          style="
            width:100%;
            min-height:120px;
            padding:0.75rem;
            border:1px solid rgba(255,255,255,0.1);
            border-radius:6px;
            background:var(--bg-2);
            color:var(--text);
            font-family:inherit;
            font-size:0.95rem;
            line-height:1.6;
            resize:vertical;
          "
        ></textarea>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.5rem;font-size:0.85rem;color:var(--muted);">
          <span>✓ Auto-saves every second</span>
          <span id="notes-char-count">0 characters</span>
        </div>
      </div>
    `;

    // Insert before nav-article
    navArticle.parentNode.insertBefore(notesSection, navArticle);

    // Get textarea and load existing notes
    const textarea = document.getElementById('lesson-notes');
    const existingNotes = loadNotes();

    if (existingNotes) {
      textarea.value = existingNotes;
      updateCharCount(existingNotes.length);
    }

    // Attach event listeners
    textarea.addEventListener('input', (e) => {
      const content = e.target.value;
      updateCharCount(content.length);
      autoSave(content);
    });

    // Save on page unload
    window.addEventListener('beforeunload', () => {
      const content = textarea.value;
      if (content.trim()) {
        saveNotes(content);
      }
    });

    logger.log('[Notes] UI initialized for lesson:', currentLessonId);
  }

  /**
   * Update character count
   */
  function updateCharCount(count) {
    const counter = document.getElementById('notes-char-count');
    if (counter) {
      counter.textContent = `${count} character${count !== 1 ? 's' : ''}`;
    }
  }

  /**
   * Initialize on page load
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createNotesUI);
  } else {
    createNotesUI();
  }

  logger.log('[Notes] Module loaded');
})();
