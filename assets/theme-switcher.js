/**
 * SignalPilot Theme Switcher UI
 * Beautiful modal interface for switching themes
 */

(function() {
  'use strict';

  // Create theme switcher styles
  const styles = `
    .sp-theme-toggle {
      position: fixed;
      bottom: 6.5rem;
      right: 2rem;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--brand), var(--accent));
      border: 2px solid rgba(255, 255, 255, 0.2);
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      z-index: 1001;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px var(--brand-glow);
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .sp-theme-toggle:hover {
      transform: scale(1.1) rotate(15deg);
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5), 0 0 30px var(--brand-glow);
    }

    .sp-theme-toggle:active {
      transform: scale(0.95);
    }

    @media (max-width: 768px) {
      .sp-theme-toggle {
        bottom: max(6rem, calc(5.5rem + env(safe-area-inset-bottom)));
        right: 1.5rem;
        width: 52px;
        height: 52px;
        font-size: 1.3rem;
      }
    }

    /* Ultra-small screens */
    @media (max-width: 380px) {
      .sp-theme-toggle {
        bottom: max(5.7rem, calc(5.3rem + env(safe-area-inset-bottom)));
        right: 1.2rem;
        width: 48px;
        height: 48px;
        font-size: 1.2rem;
      }
    }

    .sp-theme-modal {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(12px);
      z-index: 2000;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: sp-fadeIn 0.3s ease;
    }

    .sp-theme-modal.active {
      display: flex;
    }

    @keyframes sp-fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .sp-theme-modal-content {
      background: var(--bg-elev);
      border: 2px solid var(--border);
      border-radius: 24px;
      padding: 2rem;
      max-width: 900px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
      animation: sp-slideUp 0.3s ease;
    }

    @keyframes sp-slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .sp-theme-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
    }

    .sp-theme-modal-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--text);
      margin: 0;
    }

    .sp-theme-modal-close {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--muted);
      font-size: 1.5rem;
      transition: all 0.2s ease;
    }

    .sp-theme-modal-close:hover {
      background: rgba(255, 255, 255, 0.15);
      color: var(--text);
      transform: rotate(90deg);
    }

    .sp-theme-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.25rem;
      margin-top: 1.5rem;
    }

    @media (max-width: 640px) {
      .sp-theme-grid {
        grid-template-columns: 1fr;
      }
    }

    .sp-theme-card {
      background: linear-gradient(160deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
      border: 2px solid transparent;
      border-radius: 16px;
      padding: 1.25rem;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .sp-theme-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 14px;
      padding: 2px;
      background: linear-gradient(135deg, var(--card-color-1), var(--card-color-2));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .sp-theme-card:hover::before {
      opacity: 1;
    }

    .sp-theme-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
    }

    .sp-theme-card.active {
      border-color: var(--accent);
      box-shadow: 0 8px 24px var(--brand-glow);
    }

    .sp-theme-card.active::after {
      content: '✓';
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      width: 24px;
      height: 24px;
      background: var(--accent);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .sp-theme-icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
      display: block;
      filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
    }

    .sp-theme-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text);
      margin: 0 0 0.4rem;
    }

    .sp-theme-desc {
      font-size: 0.85rem;
      color: var(--muted);
      margin: 0;
      line-height: 1.4;
    }

    .sp-theme-preview {
      display: flex;
      gap: 0.4rem;
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sp-theme-color-dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .sp-theme-footer {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border);
      text-align: center;
      color: var(--muted);
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .sp-theme-modal-content {
        padding: 1.5rem;
        border-radius: 20px;
      }

      .sp-theme-modal-title {
        font-size: 1.5rem;
      }
    }
  `;

  // Inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Create theme toggle button
  function createToggleButton() {
    const button = document.createElement('button');
    button.className = 'sp-theme-toggle';
    button.innerHTML = '🎨';
    button.setAttribute('aria-label', 'Theme selection (Ctrl+T)');
    button.setAttribute('title', 'Theme selection (Ctrl+T)');
    button.onclick = () => openThemeModal();
    document.body.appendChild(button);
    return button;
  }

  // Create theme modal
  function createThemeModal() {
    const modal = document.createElement('div');
    modal.className = 'sp-theme-modal';
    modal.onclick = (e) => {
      if (e.target === modal) closeThemeModal();
    };

    const content = document.createElement('div');
    content.className = 'sp-theme-modal-content';

    // Header
    const header = document.createElement('div');
    header.className = 'sp-theme-modal-header';
    header.innerHTML = `
      <h2 class="sp-theme-modal-title">Theme Selection</h2>
      <button class="sp-theme-modal-close" aria-label="Close modal">×</button>
    `;
    header.querySelector('.sp-theme-modal-close').onclick = closeThemeModal;

    // Grid
    const grid = document.createElement('div');
    grid.className = 'sp-theme-grid';

    // Create theme cards
    const currentTheme = window.SP_THEME?.current() || 'default';
    Object.keys(window.SP_THEMES || {}).forEach(themeId => {
      const theme = window.SP_THEMES[themeId];
      const card = createThemeCard(themeId, theme, currentTheme);
      grid.appendChild(card);
    });

    // Footer
    const footer = document.createElement('div');
    footer.className = 'sp-theme-footer';
    footer.textContent = 'Your theme preference is saved automatically';

    content.appendChild(header);
    content.appendChild(grid);
    content.appendChild(footer);
    modal.appendChild(content);
    document.body.appendChild(modal);

    return modal;
  }

  // Create individual theme card
  function createThemeCard(themeId, theme, currentTheme) {
    const card = document.createElement('div');
    card.className = 'sp-theme-card';
    if (themeId === currentTheme) {
      card.classList.add('active');
    }

    // Set CSS variables for gradient border
    card.style.setProperty('--card-color-1', theme.colors.brand);
    card.style.setProperty('--card-color-2', theme.colors.accent);

    card.innerHTML = `
      <span class="sp-theme-icon">${theme.icon}</span>
      <h3 class="sp-theme-name">${theme.name}</h3>
      <p class="sp-theme-desc">${theme.description}</p>
      <div class="sp-theme-preview">
        <div class="sp-theme-color-dot" style="background: ${theme.colors.brand}"></div>
        <div class="sp-theme-color-dot" style="background: ${theme.colors.accent}"></div>
        <div class="sp-theme-color-dot" style="background: ${theme.colors.success}"></div>
      </div>
    `;

    card.onclick = () => {
      // Apply theme
      if (window.SP_THEME) {
        window.SP_THEME.apply(themeId);
      }

      // Update active state
      document.querySelectorAll('.sp-theme-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      // Close modal after short delay
      setTimeout(closeThemeModal, 500);
    };

    return card;
  }

  let modalInstance = null;

  function openThemeModal() {
    if (!modalInstance) {
      modalInstance = createThemeModal();
    }

    // Refresh active state
    const currentTheme = window.SP_THEME?.current() || 'default';
    document.querySelectorAll('.sp-theme-card').forEach(card => {
      const themeId = [...document.querySelectorAll('.sp-theme-card')].indexOf(card);
      const themeKeys = Object.keys(window.SP_THEMES || {});
      if (themeKeys[themeId] === currentTheme) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    modalInstance.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeThemeModal() {
    if (modalInstance) {
      modalInstance.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Initialize on load
  function init() {
    createToggleButton();

    // Listen for keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape to close
      if (e.key === 'Escape' && modalInstance?.classList.contains('active')) {
        closeThemeModal();
      }

      // Ctrl/Cmd + T to open theme switcher
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        if (modalInstance?.classList.contains('active')) {
          closeThemeModal();
        } else {
          openThemeModal();
        }
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.SP_THEME_UI = {
    open: openThemeModal,
    close: closeThemeModal
  };
})();
