// discussions.js - Discussion Threads System
// Version 1.0.0
(function() {
  'use strict';

  const DiscussionSystem = {
    currentLessonId: null,
    currentUser: null,
    comments: [],
    sortBy: 'recent', // 'recent', 'top', 'oldest'
    displayLimit: 3, // Initially show 3 comments
    loadMoreIncrement: 5, // Load 5 more each time

    async init(lessonId) {
      this.currentLessonId = lessonId;

      // Wait for auth system to be ready, then get user
      await this.waitForAuth();
      this.currentUser = await this.getCurrentUser();

      // Set up mobile collapse behavior
      this.setupMobileCollapse();

      // Load and render comments
      await this.loadComments();
      this.render();

      // Set up event listeners
      this.setupEventListeners();

      // Listen for auth changes to update UI
      if (window.supabaseAuth && typeof window.supabaseAuth.onAuthStateChange === 'function') {
        window.supabaseAuth.onAuthStateChange((user) => {
          this.currentUser = user;
          this.render(); // Re-render when auth state changes
          console.log('[Discussions] Auth state changed, user:', user ? user.email : 'none');
        });
      }

      console.log('[Discussions] Initialized for lesson:', lessonId, 'User:', this.currentUser?.email || 'not signed in');
    },

    async waitForAuth() {
      // Wait up to 3 seconds for auth system to be ready
      const maxWait = 3000;
      const checkInterval = 100;
      let waited = 0;

      while (waited < maxWait) {
        if (window.supabaseAuth && typeof window.supabaseAuth.getCurrentUser === 'function') {
          // Wait an additional 200ms to ensure auth has checked session
          await new Promise(resolve => setTimeout(resolve, 200));
          return;
        }
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        waited += checkInterval;
      }

      console.warn('[Discussions] Auth system not ready after waiting');
    },

    async getCurrentUser() {
      // Use the main auth system's getCurrentUser function
      if (window.supabaseAuth && typeof window.supabaseAuth.getCurrentUser === 'function') {
        return window.supabaseAuth.getCurrentUser();
      }
      return null;
    },

    setupMobileCollapse() {
      // On mobile, collapse discussion by default
      if (window.innerWidth <= 768) {
        const section = document.querySelector('.discussion-section');
        if (section) {
          section.classList.add('collapsed');
        }
      }
    },

    setupEventListeners() {
      // Sort dropdown
      const sortSelect = document.getElementById('discussion-sort');
      if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
          this.sortBy = e.target.value;
          this.render();
        });
      }

      // Post comment button
      const postBtn = document.getElementById('post-comment-btn');
      if (postBtn) {
        postBtn.addEventListener('click', () => this.postComment());
      }

      // Comment textarea character count
      const textarea = document.getElementById('comment-input');
      if (textarea) {
        textarea.addEventListener('input', (e) => {
          const charCount = document.getElementById('comment-char-count');
          if (charCount) {
            charCount.textContent = `${e.target.value.length}/1000`;
          }
        });
      }

      // Mobile toggle
      const toggle = document.getElementById('discussion-toggle');
      if (toggle) {
        toggle.addEventListener('click', () => {
          const section = document.querySelector('.discussion-section');
          section.classList.toggle('collapsed');
        });
      }
    },

    async loadComments() {
      // Check if Supabase is available via the global supabase object
      const supabase = window.supabase;

      if (!supabase || typeof supabase.from !== 'function') {
        console.warn('[Discussions] Supabase not initialized, using local comments');
        this.comments = this.getLocalComments();
        return;
      }

      try {
        // Use the view instead of the table with problematic joins
        const { data, error } = await supabase
          .from('comments_with_users')
          .select('*')
          .eq('lesson_id', this.currentLessonId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        this.comments = data || [];
        console.log('[Discussions] Loaded', this.comments.length, 'comments from view');
      } catch (error) {
        console.error('[Discussions] Failed to load comments:', error);
        this.comments = this.getLocalComments();
      }
    },

    getLocalComments() {
      // Fallback to localStorage for offline mode
      const key = `sp_comments_${this.currentLessonId}`;
      return JSON.parse(localStorage.getItem(key) || '[]');
    },

    saveLocalComments() {
      const key = `sp_comments_${this.currentLessonId}`;
      localStorage.setItem(key, JSON.stringify(this.comments));
    },

    getSortedComments() {
      const sorted = [...this.comments];

      switch(this.sortBy) {
        case 'top':
          return sorted.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
        case 'oldest':
          return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        case 'recent':
        default:
          return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
    },

    async postComment() {
      if (!this.currentUser) {
        alert('Please sign in to post a comment');
        return;
      }

      const textarea = document.getElementById('comment-input');
      const content = textarea.value.trim();

      if (!content) {
        alert('Please enter a comment');
        return;
      }

      if (content.length > 1000) {
        alert('Comment is too long (max 1000 characters)');
        return;
      }

      const newComment = {
        lesson_id: this.currentLessonId,
        user_id: this.currentUser.id,
        content: content,
        parent_id: null,
        upvotes: 0,
        created_at: new Date().toISOString(),
        is_pinned: false,
        is_deleted: false,
        user: {
          id: this.currentUser.id,
          email: this.currentUser.email,
          user_metadata: this.currentUser.user_metadata || {}
        },
        votes: []
      };

      if (window.supabase) {
        try {
          const { data, error } = await window.supabase
            .from('comments')
            .insert([{
              lesson_id: newComment.lesson_id,
              user_id: newComment.user_id,
              content: newComment.content,
              parent_id: newComment.parent_id
            }])
            .select()
            .single();

          if (error) throw error;

          console.log('[Discussions] Comment inserted successfully:', data);

          // Reload all comments to get full data with user info
          await this.loadComments();

        } catch (error) {
          console.error('[Discussions] Failed to post comment:', error);
          console.error('[Discussions] Error details:', error.message, error.code);
          alert('Failed to post comment. Please try again.');
          return;
        }
      } else {
        // Offline mode - use localStorage
        newComment.id = 'local_' + Date.now();
        this.comments.unshift(newComment);
        this.saveLocalComments();
      }

      // Clear textarea
      textarea.value = '';
      document.getElementById('comment-char-count').textContent = '0/1000';

      // Re-render
      this.render();

      // Dispatch event for XP reward
      window.dispatchEvent(new CustomEvent('sp:commentPosted', {
        detail: { lessonId: this.currentLessonId }
      }));
    },

    async upvoteComment(commentId) {
      if (!this.currentUser) {
        alert('Please sign in to upvote');
        return;
      }

      // Convert to number if it's a string (from onclick handler)
      const id = typeof commentId === 'string' ? parseInt(commentId) : commentId;
      const comment = this.comments.find(c => c.id === id);
      if (!comment) {
        console.error('[Discussions] Comment not found:', commentId);
        return;
      }

      const hasUpvoted = comment.votes?.some(v => v.user_id === this.currentUser.id && v.vote_type === 'up');

      if (window.supabase) {
        try {
          if (hasUpvoted) {
            // Remove upvote
            await window.supabase
              .from('comment_votes')
              .delete()
              .eq('comment_id', id)
              .eq('user_id', this.currentUser.id);

            comment.upvotes = Math.max(0, (comment.upvotes || 0) - 1);
            comment.votes = comment.votes.filter(v => v.user_id !== this.currentUser.id);
          } else {
            // Add upvote
            await window.supabase
              .from('comment_votes')
              .insert([{
                comment_id: id,
                user_id: this.currentUser.id,
                vote_type: 'up'
              }]);

            comment.upvotes = (comment.upvotes || 0) + 1;
            comment.votes = comment.votes || [];
            comment.votes.push({ user_id: this.currentUser.id, vote_type: 'up' });
          }

          // Update comment upvote count
          await window.supabase
            .from('comments')
            .update({ upvotes: comment.upvotes })
            .eq('id', id);

        } catch (error) {
          console.error('[Discussions] Failed to upvote:', error);
          return;
        }
      } else {
        // Offline mode
        if (hasUpvoted) {
          comment.upvotes = Math.max(0, (comment.upvotes || 0) - 1);
          comment.votes = comment.votes.filter(v => v.user_id !== this.currentUser.id);
        } else {
          comment.upvotes = (comment.upvotes || 0) + 1;
          comment.votes = comment.votes || [];
          comment.votes.push({ user_id: this.currentUser.id, vote_type: 'up' });
        }
        this.saveLocalComments();
      }

      this.render();
    },

    async postReply(parentId) {
      if (!this.currentUser) {
        alert('Please sign in to reply');
        return;
      }

      // Convert to number if it's a string (from onclick handler)
      const id = typeof parentId === 'string' ? parseInt(parentId) : parentId;

      const textarea = document.getElementById(`reply-input-${id}`);
      if (!textarea) {
        console.error('[Discussions] Reply textarea not found for:', parentId);
        return;
      }

      const content = textarea.value.trim();

      if (!content) return;

      if (content.length > 500) {
        alert('Reply is too long (max 500 characters)');
        return;
      }

      const newReply = {
        lesson_id: this.currentLessonId,
        user_id: this.currentUser.id,
        content: content,
        parent_id: id,
        upvotes: 0,
        created_at: new Date().toISOString(),
        is_pinned: false,
        is_deleted: false,
        user: {
          id: this.currentUser.id,
          email: this.currentUser.email,
          user_metadata: this.currentUser.user_metadata || {}
        },
        votes: []
      };

      if (window.supabase) {
        try {
          const { data, error } = await window.supabase
            .from('comments')
            .insert([{
              lesson_id: newReply.lesson_id,
              user_id: newReply.user_id,
              content: newReply.content,
              parent_id: newReply.parent_id
            }])
            .select()
            .single();

          if (error) throw error;

          console.log('[Discussions] Reply inserted successfully:', data);

          // Reload all comments to get full data with user info
          await this.loadComments();

        } catch (error) {
          console.error('[Discussions] Failed to post reply:', error);
          console.error('[Discussions] Error details:', error.message, error.code);
          alert('Failed to post reply. Please try again.');
          return;
        }
      } else {
        newReply.id = 'local_' + Date.now();
        this.comments.push(newReply);
        this.saveLocalComments();
      }

      textarea.value = '';
      this.render();
    },

    toggleReplyBox(commentId) {
      // Convert to number if it's a string (from onclick handler)
      const id = typeof commentId === 'string' ? parseInt(commentId) : commentId;
      const replyBox = document.getElementById(`reply-box-${id}`);
      if (replyBox) {
        replyBox.style.display = replyBox.style.display === 'none' ? 'block' : 'none';
      }
    },

    getUserInitials(user) {
      if (user?.user_metadata?.full_name) {
        return user.user_metadata.full_name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);
      }
      if (user?.email) {
        return user.email.substring(0, 2).toUpperCase();
      }
      return '??';
    },

    getUserDisplayName(user) {
      return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anonymous';
    },

    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

      return date.toLocaleDateString();
    },

    render() {
      const container = document.getElementById('comments-list');
      if (!container) return;

      // Update comment count
      const countEl = document.getElementById('discussion-count');
      if (countEl) {
        const topLevelComments = this.comments.filter(c => !c.parent_id);
        countEl.textContent = `${topLevelComments.length} comment${topLevelComments.length !== 1 ? 's' : ''}`;
      }

      const sortedComments = this.getSortedComments();
      const topLevelComments = sortedComments.filter(c => !c.parent_id);

      if (topLevelComments.length === 0) {
        container.innerHTML = `
          <div class="comment-empty">
            <div class="comment-empty-icon">💬</div>
            <div class="comment-empty-text">No comments yet. Be the first to start the discussion!</div>
          </div>
        `;
        return;
      }

      // Limit the number of comments displayed
      const displayedComments = topLevelComments.slice(0, this.displayLimit);
      const hasMore = topLevelComments.length > this.displayLimit;

      console.log('[Discussions] Rendering:', {
        total: topLevelComments.length,
        displaying: displayedComments.length,
        limit: this.displayLimit,
        hasMore: hasMore
      });

      let html = displayedComments.map(comment => {
        const replies = sortedComments.filter(c => c.parent_id === comment.id);
        const hasUpvoted = comment.votes?.some(v => v.user_id === this.currentUser?.id && v.vote_type === 'up');

        return `
          <div class="comment ${comment.is_pinned ? 'pinned' : ''}" data-comment-id="${comment.id}">
            ${comment.is_pinned ? '<span class="comment-pin-icon">📌</span>' : ''}
            <div class="comment-header">
              <div class="comment-avatar">${this.getUserInitials(comment.user)}</div>
              <div class="comment-meta">
                <div>
                  <span class="comment-author">${this.getUserDisplayName(comment.user)}</span>
                  ${comment.user?.user_metadata?.is_admin ? '<span class="comment-badge">Admin</span>' : ''}
                  <span class="comment-time">${this.formatTime(comment.created_at)}</span>
                </div>
              </div>
            </div>
            <div class="comment-content">${this.escapeHtml(comment.content)}</div>
            <div class="comment-actions">
              <button class="comment-action ${hasUpvoted ? 'upvoted' : ''}" onclick="window.DiscussionSystem.upvoteComment('${comment.id}')">
                <span class="comment-action-icon">👍</span>
                <span>${comment.upvotes || 0}</span>
              </button>
              <button class="comment-action" onclick="window.DiscussionSystem.toggleReplyBox('${comment.id}')">
                <span class="comment-action-icon">💬</span>
                <span>${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}</span>
              </button>
            </div>

            <!-- Reply composer -->
            ${this.currentUser ? `
              <div id="reply-box-${comment.id}" class="reply-composer" style="display:none">
                <textarea id="reply-input-${comment.id}" placeholder="Write a reply..." maxlength="500"></textarea>
                <div class="reply-actions">
                  <button class="btn btn-sm btn-primary" onclick="window.DiscussionSystem.postReply('${comment.id}')">Post Reply</button>
                  <button class="btn btn-sm btn-ghost" onclick="window.DiscussionSystem.toggleReplyBox('${comment.id}')">Cancel</button>
                </div>
              </div>
            ` : ''}

            <!-- Replies -->
            ${replies.length > 0 ? `
              <div class="comment-replies">
                ${replies.map(reply => {
                  const replyUpvoted = reply.votes?.some(v => v.user_id === this.currentUser?.id && v.vote_type === 'up');
                  return `
                    <div class="comment-reply">
                      <div class="comment-header">
                        <div class="comment-avatar" style="width:32px;height:32px;font-size:0.9rem">${this.getUserInitials(reply.user)}</div>
                        <div class="comment-meta">
                          <div>
                            <span class="comment-author">${this.getUserDisplayName(reply.user)}</span>
                            <span class="comment-time">${this.formatTime(reply.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div class="comment-content" style="font-size:0.85rem">${this.escapeHtml(reply.content)}</div>
                      <div class="comment-actions">
                        <button class="comment-action ${replyUpvoted ? 'upvoted' : ''}" onclick="window.DiscussionSystem.upvoteComment('${reply.id}')">
                          <span class="comment-action-icon">👍</span>
                          <span>${reply.upvotes || 0}</span>
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : ''}
          </div>
        `;
      }).join('');

      // Add "Load More" button if there are more comments
      if (hasMore) {
        html += `
          <div class="comment-load-more">
            <button class="btn btn-secondary btn-sm" onclick="window.DiscussionSystem.loadMore()">
              Load More Comments (${topLevelComments.length - this.displayLimit} remaining)
            </button>
          </div>
        `;
      }

      container.innerHTML = html;
    },

    loadMore() {
      this.displayLimit += this.loadMoreIncrement;
      this.render();
    },

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };

  // Expose globally
  window.DiscussionSystem = DiscussionSystem;

  console.log('[Discussions] Module loaded');

})();
