// Note-taking Feature for Lessons
(function() {
  'use strict';

  // Only initialize on curriculum pages
  const isLessonPage = window.location.pathname.includes('/education/curriculum/');
  if (!isLessonPage) return;

  // Get lesson ID from URL
  function getLessonId() {
    return window.getLessonId();
  }

  // Get lesson title from page
  function getLessonTitle() {
    const titleEl = document.querySelector('.article header .headline');
    return titleEl ? titleEl.textContent.trim() : 'Current Lesson';
  }

  // Create notes UI
  function createNotesUI() {
    // Toggle button
    const button = document.createElement('button');
    button.className = 'notes-toggle';
    button.setAttribute('aria-label', 'Open notes');
    button.setAttribute('title', 'Take notes (Ctrl+N)');
    button.innerHTML = '📝';

    // Notes panel
    const panel = document.createElement('div');
    panel.className = 'notes-panel';

    const lessonTitle = getLessonTitle();
    const lessonId = getLessonId();

    panel.innerHTML = `
      <div class="notes-header">
        <h3>📝 Lesson Notes</h3>
        <button class="notes-close" aria-label="Close">&times;</button>
      </div>
      <div class="notes-info">
        <p><strong>${lessonTitle}</strong></p>
        <p style="margin-top:0.25rem;font-size:0.85rem;opacity:0.7">Your notes are automatically saved and synced across your devices.</p>
      </div>
      <div class="notes-content">
        <div class="notes-editor">
          <textarea
            class="notes-textarea"
            id="notes-textarea"
            placeholder="Write your notes here...

Tips:
• Summarize key concepts in your own words
• Note questions to review later
• Write examples that clarify the material
• Highlight connections to other lessons"
          ></textarea>
          <div class="notes-actions">
            <button class="notes-btn notes-btn-primary" id="notes-save">💾 Save Notes</button>
            <button class="notes-btn notes-btn-secondary" id="notes-clear">🗑️ Clear</button>
          </div>
        </div>
      </div>
      <div class="notes-metadata">
        <span id="notes-count">0 characters</span>
        <span style="margin:0 0.5rem">•</span>
        <span id="notes-last-saved">Not saved yet</span>
      </div>
    `;

    // Saved notification
    const notification = document.createElement('div');
    notification.className = 'notes-saved';
    notification.innerHTML = '✓ Notes saved!';

    document.body.appendChild(button);
    document.body.appendChild(panel);
    document.body.appendChild(notification);

    return { button, panel, notification };
  }

  // Load notes from localStorage
  function loadNotes(lessonId) {
    const key = `sp_notes_${lessonId}`;
    const data = localStorage.getItem(key);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Save notes to localStorage
  function saveNotes(lessonId, content) {
    const key = `sp_notes_${lessonId}`;
    const data = {
      content: content,
      timestamp: Date.now(),
      lessonTitle: getLessonTitle(),
      lessonUrl: window.location.href
    };
    localStorage.setItem(key, JSON.stringify(data));

    // daily-challenges.js counts notes towards a daily goal and listened for
    // this event; nothing had ever dispatched it.
    window.dispatchEvent(new CustomEvent('sp:noteSaved', {
      detail: { lessonId: lessonId, length: content.length }
    }));
    return data;
  }

  // Update character count
  function updateCharCount(textarea) {
    const count = textarea.value.length;
    const countEl = document.getElementById('notes-count');
    if (countEl) {
      countEl.textContent = `${count.toLocaleString()} character${count !== 1 ? 's' : ''}`;
    }
  }

  // Update last saved time
  function updateLastSaved(timestamp) {
    const el = document.getElementById('notes-last-saved');
    if (!el || !timestamp) return;

    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) {
      el.textContent = 'Saved just now';
    } else if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      el.textContent = `Saved ${mins} minute${mins !== 1 ? 's' : ''} ago`;
    } else if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      el.textContent = `Saved ${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const date = new Date(timestamp);
      el.textContent = `Saved ${date.toLocaleDateString()}`;
    }
  }

  // Show saved notification
  function showSavedNotification(notification) {
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
    }, 2000);
  }

  // Update button indicator if notes exist
  function updateButtonIndicator(button, lessonId) {
    const notes = loadNotes(lessonId);
    if (notes && notes.content.trim().length > 0) {
      button.classList.add('has-notes');
      button.setAttribute('title', 'View your notes (Ctrl+N)');
    } else {
      button.classList.remove('has-notes');
      button.setAttribute('title', 'Take notes (Ctrl+N)');
    }
  }

  // Initialize notes feature
  function init() {
    const lessonId = getLessonId();
    if (!lessonId) return;

    const { button, panel, notification } = createNotesUI();
    const textarea = document.getElementById('notes-textarea');
    const saveBtn = document.getElementById('notes-save');
    const clearBtn = document.getElementById('notes-clear');
    const closeBtn = panel.querySelector('.notes-close');

    // Load existing notes
    const existingNotes = loadNotes(lessonId);
    if (existingNotes) {
      textarea.value = existingNotes.content;
      updateCharCount(textarea);
      updateLastSaved(existingNotes.timestamp);
      updateButtonIndicator(button, lessonId);
    }

    // Toggle panel
    function togglePanel() {
      const isActive = panel.classList.toggle('active');
      button.setAttribute('aria-expanded', isActive);
      if (isActive) {
        // Track notes opened
        if (typeof trackNotesOpened === 'function') {
          trackNotesOpened();
        }

        // Only auto-focus on desktop, not mobile (prevents keyboard from opening on mobile)
        if (window.innerWidth > 768) {
          textarea.focus();
          // Set cursor to end
          textarea.selectionStart = textarea.value.length;
          textarea.selectionEnd = textarea.value.length;
        }
      }
    }

    // Close panel
    function closePanel() {
      panel.classList.remove('active');
      button.setAttribute('aria-expanded', 'false');
    }

    // Save notes
    function handleSave() {
      const content = textarea.value;
      const data = saveNotes(lessonId, content);
      updateLastSaved(data.timestamp);
      updateButtonIndicator(button, lessonId);
      showSavedNotification(notification);

      // Track in analytics if available
      if (window.gtag) {
        gtag('event', 'notes_saved', {
          lesson_id: lessonId,
          character_count: content.length
        });
      }

      // Track notes saved
      if (typeof trackNotesSaved === 'function') {
        trackNotesSaved();
      }

      // Trigger cloud sync
      if (window.supabaseAuth?.onProgressChange) {
        window.supabaseAuth.onProgressChange();
      }
    }

    // Clear notes
    function handleClear() {
      if (confirm('Are you sure you want to clear your notes for this lesson?')) {
        textarea.value = '';
        const data = saveNotes(lessonId, '');
        updateCharCount(textarea);
        updateLastSaved(data.timestamp);
        updateButtonIndicator(button, lessonId);
        showSavedNotification(notification);
      }
    }

    // Event listeners
    button.addEventListener('click', togglePanel);
    closeBtn.addEventListener('click', closePanel);
    saveBtn.addEventListener('click', handleSave);
    clearBtn.addEventListener('click', handleClear);

    // Auto-save on typing (debounced)
    let saveTimeout;
    textarea.addEventListener('input', () => {
      updateCharCount(textarea);
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        handleSave();
      }, 2000); // Auto-save after 2 seconds of no typing
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+N or Cmd+N to toggle notes
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        togglePanel();
      }

      // Escape to close notes
      if (e.key === 'Escape' && panel.classList.contains('active')) {
        closePanel();
      }

      // Ctrl+S or Cmd+S to save when panel is open
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && panel.classList.contains('active')) {
        e.preventDefault();
        handleSave();
      }
    });

    // Update "last saved" time periodically
    setInterval(() => {
      const notes = loadNotes(lessonId);
      if (notes && notes.timestamp) {
        updateLastSaved(notes.timestamp);
      }
    }, 60000); // Update every minute
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
