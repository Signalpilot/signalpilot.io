// My Library - Download & Bookmark Tracking
(function() {
  'use strict';

  /**
   * Track when a user downloads a resource
   * @param {Object} resource - Resource details
   */
  function trackDownload(resource) {
    const downloads = JSON.parse(localStorage.getItem('sp_downloads') || '[]');

    // Check if already downloaded
    const exists = downloads.find(d => d.url === resource.url);
    if (exists) {
      logger.log('[Library] Resource already tracked:', resource.title);
      return;
    }

    downloads.push({
      id: resource.id || generateId(),
      title: resource.title,
      url: resource.url,
      lessonUrl: resource.lessonUrl || window.location.href,
      lessonTitle: resource.lessonTitle || document.title,
      date: new Date().toISOString(),
      type: resource.type || 'pdf'
    });

    localStorage.setItem('sp_downloads', JSON.stringify(downloads));
    logger.log('[Library] Download tracked:', resource.title);

    // Trigger cloud sync
    if (window.supabaseAuth?.onProgressChange) {
      window.supabaseAuth.onProgressChange();
    }

    showToast('📥 Resource added to My Library!');
  }

  /**
   * Add a bookmark
   * @param {Object} bookmark - Bookmark details
   */
  function addBookmark(bookmark) {
    const bookmarks = JSON.parse(localStorage.getItem('sp_bookmarks') || '[]');

    // Check if already bookmarked
    const exists = bookmarks.find(b => b.url === bookmark.url);
    if (exists) {
      logger.log('[Library] Already bookmarked:', bookmark.title);
      showToast('🔖 Already bookmarked!');
      return;
    }

    bookmarks.push({
      id: bookmark.id || generateId(),
      title: bookmark.title,
      url: bookmark.url || window.location.href,
      tier: bookmark.tier || 'Lesson',
      readTime: bookmark.readTime || '15 min read',
      date: new Date().toISOString()
    });

    localStorage.setItem('sp_bookmarks', JSON.stringify(bookmarks));
    logger.log('[Library] Bookmark added:', bookmark.title);

    // Trigger cloud sync
    if (window.supabaseAuth?.onProgressChange) {
      window.supabaseAuth.onProgressChange();
    }

    showToast('🔖 Bookmarked! View in My Library');
    updateBookmarkButton();
  }

  /**
   * Remove a bookmark
   * @param {string} url - URL to remove
   */
  function removeBookmark(url) {
    const bookmarks = JSON.parse(localStorage.getItem('sp_bookmarks') || '[]');
    const filtered = bookmarks.filter(b => b.url !== (url || window.location.href));
    localStorage.setItem('sp_bookmarks', JSON.stringify(filtered));
    logger.log('[Library] Bookmark removed');

    // Trigger cloud sync
    if (window.supabaseAuth?.onProgressChange) {
      window.supabaseAuth.onProgressChange();
    }

    showToast('Bookmark removed');
    updateBookmarkButton();
  }

  /**
   * Check if current page is bookmarked
   */
  function isBookmarked() {
    const bookmarks = JSON.parse(localStorage.getItem('sp_bookmarks') || '[]');
    return bookmarks.some(b => b.url === window.location.href);
  }

  /**
   * Update bookmark button state
   */
  function updateBookmarkButton() {
    const btn = document.getElementById('bookmark-btn');
    if (!btn) return;

    if (isBookmarked()) {
      btn.innerHTML = '⭐ Bookmarked';
      btn.classList.add('btn-secondary');
      btn.classList.remove('btn-ghost');
      btn.onclick = () => removeBookmark();
    } else {
      btn.innerHTML = '🔖 Bookmark';
      btn.classList.add('btn-ghost');
      btn.classList.remove('btn-secondary');
      btn.onclick = () => addBookmark({
        title: document.title,
        tier: document.querySelector('[name="sp-level"]')?.content || 'Lesson'
      });
    }
  }

  /**
   * Generate unique ID
   */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Show toast notification
   */
  function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, rgba(91, 138, 255, 0.95), rgba(118, 221, 255, 0.95));
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      font-weight: 600;
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Auto-track PDF downloads
   */
  function setupDownloadTracking() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[download]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || !href.includes('.pdf')) return;

      // Extract resource info
      const title = link.textContent.replace('Download', '').trim();
      const lessonTitle = document.querySelector('h1')?.textContent || document.title;

      trackDownload({
        title: title || 'Resource',
        url: href,
        lessonTitle: lessonTitle,
        lessonUrl: window.location.href
      });
    });
  }

  /**
   * Add bookmark button to lessons
   * DISABLED: Bookmark button removed from lesson navigation
   */
  function addBookmarkButton() {
    // Bookmark button disabled - no longer added to navigation
    return;
  }

  /**
   * Add print button for full lesson PDF
   * DISABLED: Print button removed from lesson navigation (already exists in sidebar)
   */
  function addPrintButton() {
    // Print button disabled - no longer added to navigation
    return;
  }

  /**
   * Display user's notes in My Library page
   */
  function displayNotes() {
    // Only on my-library page
    if (!window.location.pathname.includes('/education/my-library.html')) return;

    const notesList = document.getElementById('notes-list');
    if (!notesList) return;

    // Load all notes from localStorage
    const allNotes = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sp_notes_')) {
        try {
          const lessonId = key.replace('sp_notes_', '');
          const noteData = JSON.parse(localStorage.getItem(key));
          if (noteData && noteData.content && noteData.content.trim()) {
            allNotes[lessonId] = noteData;
          }
        } catch (e) {
          console.error('Error parsing note:', e);
        }
      }
    }

    const notesArray = Object.values(allNotes);

    if (notesArray.length === 0) {
      notesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <p>No notes yet.</p>
          <p style="font-size: 0.9rem;">Take notes while studying to see them here!</p>
        </div>
      `;
      return;
    }

    // Sort by last modified (most recent first)
    notesArray.sort((a, b) => b.timestamp - a.timestamp);

    // Display notes
    notesList.innerHTML = notesArray.map(note => {
      const date = new Date(note.timestamp);
      const preview = note.content.substring(0, 150) + (note.content.length > 150 ? '...' : '');
      const charCount = note.content.length;

      return `
        <div class="note-card" style="background:rgba(118,221,255,0.05);border:1px solid rgba(118,221,255,0.2);border-radius:8px;padding:1.5rem;margin-bottom:1rem">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem">
            <h4 style="margin:0;font-size:1rem">${note.lessonTitle || 'Untitled Lesson'}</h4>
            <span style="font-size:0.75rem;color:var(--muted);white-space:nowrap;margin-left:1rem">${date.toLocaleDateString()}</span>
          </div>
          <p style="margin:0.5rem 0;font-size:0.9rem;color:var(--muted);line-height:1.5">${preview}</p>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1rem">
            <span style="font-size:0.8rem;color:var(--muted)">${charCount} characters</span>
            <a href="${note.lessonUrl || '#'}" class="btn btn-sm btn-ghost">View Lesson →</a>
          </div>
        </div>
      `;
    }).join('');

    logger.log(`[Library] Displayed ${notesArray.length} notes`);
  }

  /**
   * Setup print event handlers to prevent page breaking
   */
  function setupPrintHandlers() {
    let scrollPosition = 0;

    window.addEventListener('beforeprint', () => {
      // Save scroll position
      scrollPosition = window.scrollY;
      logger.log('[Library] Print dialog opened');
    });

    window.addEventListener('afterprint', () => {
      // Restore scroll position
      window.scrollTo(0, scrollPosition);

      // Force repaint to ensure styles are restored
      document.body.style.display = 'none';
      document.body.offsetHeight; // Force reflow
      document.body.style.display = '';

      logger.log('[Library] Print dialog closed, page restored');
    });
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    setupDownloadTracking();
    setupPrintHandlers();
    addBookmarkButton();
    addPrintButton();
    displayNotes();
    updateLibraryStats();
    logger.log('[Library] Initialized');
  }

  // Update stats on My Library page
  function updateLibraryStats() {
    // Count completed lessons
    let completedCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sp_edu_') && key.endsWith('_completed') && !key.includes('_ach_')) {
        completedCount++;
      }
    }

    // Get other counts
    const bookmarks = JSON.parse(localStorage.getItem('sp_bookmarks') || '[]');
    const downloads = JSON.parse(localStorage.getItem('sp_downloads') || '[]');
    const streak = JSON.parse(localStorage.getItem('sp_learning_streak') || '{"current": 0}');

    // Update DOM elements if they exist
    const statCompleted = document.getElementById('stat-completed');
    const statBookmarks = document.getElementById('stat-bookmarks');
    const statDownloads = document.getElementById('stat-downloads');
    const statStreak = document.getElementById('stat-streak');

    if (statCompleted) statCompleted.textContent = completedCount;
    if (statBookmarks) statBookmarks.textContent = bookmarks.length;
    if (statDownloads) statDownloads.textContent = downloads.length;
    if (statStreak) statStreak.textContent = streak.current || 0;

    logger.log('[Library] Stats updated:', { completed: completedCount, bookmarks: bookmarks.length, downloads: downloads.length });
  }

  // Export public API
  window.library = window.library || {};
  Object.assign(window.library, {
    trackDownload,
    addBookmark,
    removeBookmark,
    isBookmarked,
    displayNotes
  });

})();
