// Auth UI Components for Signal Pilot Education
(function() {
  'use strict';

  // Show auth modal
  window.showAuthModal = function(mode = 'signin') {
    // Remove existing modal if present
    const existing = document.getElementById('auth-modal');
    if (existing) existing.remove();

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.className = 'auth-modal';

    modal.innerHTML = `
      <div class="auth-modal-overlay"></div>
      <div class="auth-modal-content">
        <button class="auth-modal-close" onclick="closeAuthModal()">✕</button>

        <div class="auth-header">
          <h2 id="auth-title">Sign in to Signal Pilot</h2>
          <p id="auth-subtitle">Sync your progress across devices</p>
        </div>

        <!-- Sign In Form -->
        <form id="signin-form" class="auth-form" style="display: ${mode === 'signin' ? 'block' : 'none'}">
          <div class="form-group">
            <label for="signin-email">Email</label>
            <input type="email" id="signin-email" required placeholder="you@example.com" autocomplete="email">
          </div>

          <div class="form-group">
            <label for="signin-password">Password</label>
            <input type="password" id="signin-password" required placeholder="••••••••" autocomplete="current-password">
          </div>

          <button type="submit" class="btn btn-primary btn-full">
            Sign In
          </button>

          <div class="auth-links">
            <a href="#" onclick="event.preventDefault(); showForgotPassword()">Forgot password?</a>
            <a href="#" onclick="event.preventDefault(); switchAuthMode('signup')">Create account</a>
          </div>
        </form>

        <!-- Sign Up Form -->
        <form id="signup-form" class="auth-form" style="display: ${mode === 'signup' ? 'block' : 'none'}">
          <div class="form-group">
            <label for="signup-name">Name</label>
            <input type="text" id="signup-name" required placeholder="Your name" autocomplete="name">
          </div>

          <div class="form-group">
            <label for="signup-email">Email</label>
            <input type="email" id="signup-email" required placeholder="you@example.com" autocomplete="email">
          </div>

          <div class="form-group">
            <label for="signup-password">Password</label>
            <input type="password" id="signup-password" required placeholder="••••••••" autocomplete="new-password" minlength="6">
            <small>Minimum 6 characters</small>
          </div>

          <button type="submit" class="btn btn-primary btn-full">
            Create Account
          </button>

          <div class="auth-links">
            <a href="#" onclick="event.preventDefault(); switchAuthMode('signin')">Already have an account? Sign in</a>
          </div>
        </form>

        <!-- Forgot Password Form -->
        <form id="forgot-form" class="auth-form" style="display: none">
          <div class="form-group">
            <label for="forgot-email">Email</label>
            <input type="email" id="forgot-email" required placeholder="you@example.com" autocomplete="email">
            <small>We'll send you a password reset link</small>
          </div>

          <button type="submit" class="btn btn-primary btn-full">
            Send Reset Link
          </button>

          <div class="auth-links">
            <a href="#" onclick="event.preventDefault(); switchAuthMode('signin')">Back to sign in</a>
          </div>
        </form>

        <div id="auth-message" class="auth-message" style="display: none"></div>

        <div class="auth-benefits">
          <h4>Why create an account?</h4>
          <ul>
            <li><strong>☁️ Cloud Sync</strong> — Access your progress from any device</li>
            <li><strong>📊 Track Progress</strong> — See your completion stats and learning streaks</li>
            <li><strong>📝 Save Notes</strong> — Keep your lesson notes synced across devices</li>
            <li><strong>🎓 Get Certificate</strong> — Earn a completion certificate for all 90 lessons</li>
          </ul>
        </div>

        <div class="auth-footer">
          <p>✅ Free forever • 🔒 Secure • No credit card required</p>
          <p class="privacy-note">🛡️ Your data is yours — we never sell, share, or use it for marketing.</p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Attach form handlers
    attachFormHandlers();

    // Focus first input
    setTimeout(() => {
      const firstInput = modal.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 100);

    // Close on overlay click
    modal.querySelector('.auth-modal-overlay').addEventListener('click', closeAuthModal);

    // Close on Escape key
    document.addEventListener('keydown', function escapeHandler(e) {
      if (e.key === 'Escape') {
        closeAuthModal();
        document.removeEventListener('keydown', escapeHandler);
      }
    });
  };

  // Close auth modal
  window.closeAuthModal = function() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.remove();
    }
  };

  // Switch between auth modes
  window.switchAuthMode = function(mode) {
    const forms = {
      signin: document.getElementById('signin-form'),
      signup: document.getElementById('signup-form'),
      forgot: document.getElementById('forgot-form')
    };

    // Hide all forms
    Object.values(forms).forEach(form => {
      if (form) form.style.display = 'none';
    });

    // Show selected form
    if (forms[mode]) {
      forms[mode].style.display = 'block';
    }

    // Update title
    const titles = {
      signin: { title: 'Sign in to Signal Pilot', subtitle: 'Sync your progress across devices' },
      signup: { title: 'Create Your Account', subtitle: 'Start syncing your progress' },
      forgot: { title: 'Reset Password', subtitle: 'We\'ll send you a reset link' }
    };

    const titleEl = document.getElementById('auth-title');
    const subtitleEl = document.getElementById('auth-subtitle');

    if (titleEl && titles[mode]) {
      titleEl.textContent = titles[mode].title;
      subtitleEl.textContent = titles[mode].subtitle;
    }
  };

  // Show forgot password form
  window.showForgotPassword = function() {
    switchAuthMode('forgot');
  };

  // Attach form handlers
  function attachFormHandlers() {
    // Sign In
    const signinForm = document.getElementById('signin-form');
    if (signinForm) {
      signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        logger.log('[Auth UI] Sign in form submitted');

        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;

        logger.log('[Auth UI] Sign in email:', email);

        if (!window.supabaseAuth) {
          console.error('[Auth UI] window.supabaseAuth is not available!');
          showMessage('❌ Authentication system not loaded. Please refresh the page.', 'error');
          return;
        }

        setLoading(true, 'Signing in...');

        try {
          const result = await window.supabaseAuth.signIn(email, password);
          logger.log('[Auth UI] Sign in result:', result);

          if (result.success) {
            showMessage('✅ Signed in successfully! Loading your progress...', 'success');
            setTimeout(() => {
              closeAuthModal();
              // Page will reload automatically when cloud progress loads
              // (handled by supabase-client.js auth listener)
            }, 1000);
          } else {
            showMessage(`❌ ${result.error}`, 'error');
            setLoading(false);
          }
        } catch (error) {
          console.error('[Auth UI] Sign in error:', error);
          showMessage(`❌ ${error.message}`, 'error');
          setLoading(false);
        }
      });
    }

    // Sign Up
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        logger.log('[Auth UI] Sign up form submitted');

        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        logger.log('[Auth UI] Sign up data:', { name, email, passwordLength: password.length });

        if (!window.supabaseAuth) {
          console.error('[Auth UI] window.supabaseAuth is not available!');
          showMessage('❌ Authentication system not loaded. Please refresh the page.', 'error');
          return;
        }

        setLoading(true, 'Creating account...');

        try {
          const result = await window.supabaseAuth.signUp(email, password, name);
          logger.log('[Auth UI] Sign up result:', result);

          if (result.success) {
            showMessage('✅ Account created! Check your email to verify.', 'success');
            setTimeout(() => {
              switchAuthMode('signin');
              setLoading(false);
            }, 3000);
          } else {
            showMessage(`❌ ${result.error}`, 'error');
            setLoading(false);
          }
        } catch (error) {
          console.error('[Auth UI] Sign up error:', error);
          showMessage(`❌ ${error.message}`, 'error');
          setLoading(false);
        }
      });
    }

    // Forgot Password
    const forgotForm = document.getElementById('forgot-form');
    if (forgotForm) {
      forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('forgot-email').value;

        setLoading(true, 'Sending reset link...');

        const result = await window.supabaseAuth.resetPassword(email);

        if (result.success) {
          showMessage('✅ Password reset link sent! Check your email.', 'success');
          setTimeout(() => {
            switchAuthMode('signin');
            setLoading(false);
          }, 3000);
        } else {
          showMessage(`❌ ${result.error}`, 'error');
          setLoading(false);
        }
      });
    }
  }

  // Show message
  function showMessage(text, type = 'info') {
    const messageEl = document.getElementById('auth-message');
    if (!messageEl) return;

    messageEl.textContent = text;
    messageEl.className = `auth-message ${type}`;
    messageEl.style.display = 'block';

    // Auto-hide after 5 seconds (unless error)
    if (type !== 'error') {
      setTimeout(() => {
        messageEl.style.display = 'none';
      }, 5000);
    }
  }

  // Set loading state
  function setLoading(loading, message = '') {
    const buttons = document.querySelectorAll('.auth-form button[type="submit"]');
    const inputs = document.querySelectorAll('.auth-form input');

    buttons.forEach(btn => {
      btn.disabled = loading;
      if (loading) {
        btn.dataset.originalText = btn.textContent;
        btn.textContent = message || 'Loading...';
      } else if (btn.dataset.originalText) {
        btn.textContent = btn.dataset.originalText;
      }
    });

    inputs.forEach(input => {
      input.disabled = loading;
    });
  }

  // Create auth button in header
  function createAuthButton() {
    // Find header controls
    const headerControls = document.querySelector('.header-ctls');
    if (!headerControls) return;

    // Check if button already exists
    if (document.getElementById('auth-button')) return;

    // Create auth button
    const authBtn = document.createElement('button');
    authBtn.id = 'auth-button';
    authBtn.className = 'btn btn-ghost btn-sm';
    authBtn.textContent = 'Sign In';
    authBtn.onclick = () => showAuthModal('signin');

    // Insert before theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      headerControls.insertBefore(authBtn, themeToggle);
    } else {
      headerControls.appendChild(authBtn);
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createAuthButton);
  } else {
    createAuthButton();
  }

  logger.log('[Auth UI] Module loaded');
})();
