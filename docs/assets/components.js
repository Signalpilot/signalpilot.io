/**
 * SignalPilot Component Library
 * Reusable UI components for consistent design
 * Version: 1.0.0
 */

const SPComponents = (function() {
  'use strict';

  // Utility functions
  function sanitizeId(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Component library
  return {

    /* ========================================
       CARD COMPONENT
       ======================================== */
    card: function(props) {
      const {
        title,
        description,
        link,           // { url, text }
        icon,           // Material icon name
        badge,          // { type: 'new'|'pro'|'beta', text }
        image,          // Image URL
        variant = 'default', // 'default', 'featured', 'compact'
        stats           // { label, value }[]
      } = props;

      if (!title) {
        console.error('Card component requires title');
        return '';
      }

      const variantClass = variant !== 'default' ? `sp-card--${variant}` : '';

      return `
        <div class="sp-card ${variantClass}" role="article" aria-labelledby="${sanitizeId(title)}">
          ${badge ? `
            <span class="sp-card__badge sp-card__badge--${badge.type || 'default'}">
              ${escapeHtml(badge.text)}
            </span>
          ` : ''}

          ${image ? `
            <div class="sp-card__image">
              <img src="${image}" alt="${escapeHtml(title)}" loading="lazy">
            </div>
          ` : ''}

          ${icon ? `
            <div class="sp-card__icon">
              <span class="material-icons" aria-hidden="true">${icon}</span>
            </div>
          ` : ''}

          <h3 class="sp-card__title" id="${sanitizeId(title)}">
            ${escapeHtml(title)}
          </h3>

          ${description ? `
            <p class="sp-card__description">
              ${escapeHtml(description)}
            </p>
          ` : ''}

          ${stats ? `
            <div class="sp-card__stats">
              ${stats.map(stat => `
                <div class="sp-card__stat">
                  <div class="sp-card__stat-value">${escapeHtml(stat.value)}</div>
                  <div class="sp-card__stat-label">${escapeHtml(stat.label)}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${link ? `
            <a href="${link.url}"
               class="sp-card__link"
               aria-label="Read more about ${escapeHtml(title)}">
              ${escapeHtml(link.text)} <span aria-hidden="true">→</span>
            </a>
          ` : ''}
        </div>
      `;
    },

    /* ========================================
       BUTTON COMPONENT
       ======================================== */
    button: function(props) {
      const {
        text,
        url,
        variant = 'primary',  // 'primary', 'secondary', 'ghost', 'danger'
        size = 'medium',      // 'small', 'medium', 'large'
        icon,                 // Material icon name
        iconPosition = 'left',
        fullWidth = false,
        disabled = false,
        ariaLabel
      } = props;

      if (!text || !url) {
        console.error('Button requires text and url');
        return '';
      }

      const classes = [
        'sp-button',
        `sp-button--${variant}`,
        `sp-button--${size}`,
        fullWidth ? 'sp-button--full' : '',
        disabled ? 'sp-button--disabled' : ''
      ].filter(Boolean).join(' ');

      const iconHTML = icon ? `<span class="material-icons" aria-hidden="true">${icon}</span>` : '';

      return `
        <a href="${url}"
           class="${classes}"
           ${disabled ? 'aria-disabled="true"' : ''}
           ${ariaLabel ? `aria-label="${escapeHtml(ariaLabel)}"` : ''}>
          ${iconPosition === 'left' ? iconHTML : ''}
          <span class="sp-button__text">${escapeHtml(text)}</span>
          ${iconPosition === 'right' ? iconHTML : ''}
        </a>
      `;
    },

    /* ========================================
       BADGE COMPONENT
       ======================================== */
    badge: function(props) {
      const {
        text,
        type = 'default',     // 'default', 'success', 'warning', 'error', 'info'
        size = 'medium',      // 'small', 'medium', 'large'
        icon,
        removable = false
      } = props;

      if (!text) {
        console.error('Badge requires text');
        return '';
      }

      return `
        <span class="sp-badge sp-badge--${type} sp-badge--${size}">
          ${icon ? `<span class="material-icons" aria-hidden="true">${icon}</span>` : ''}
          <span class="sp-badge__text">${escapeHtml(text)}</span>
          ${removable ? `
            <button class="sp-badge__remove"
                    aria-label="Remove ${escapeHtml(text)}"
                    onclick="this.closest('.sp-badge').remove()">
              <span class="material-icons" aria-hidden="true">close</span>
            </button>
          ` : ''}
        </span>
      `;
    },

    /* ========================================
       ALERT COMPONENT
       ======================================== */
    alert: function(props) {
      const {
        type = 'info',        // 'info', 'success', 'warning', 'error'
        title,
        content,
        dismissible = false,
        icon
      } = props;

      if (!content) {
        console.error('Alert requires content');
        return '';
      }

      const icons = {
        info: 'info',
        success: 'check_circle',
        warning: 'warning',
        error: 'error'
      };

      const displayIcon = icon || icons[type];

      return `
        <div class="sp-alert sp-alert--${type}" role="alert">
          <div class="sp-alert__icon">
            <span class="material-icons" aria-hidden="true">${displayIcon}</span>
          </div>
          <div class="sp-alert__content">
            ${title ? `<h4 class="sp-alert__title">${escapeHtml(title)}</h4>` : ''}
            <div class="sp-alert__text">${content}</div>
          </div>
          ${dismissible ? `
            <button class="sp-alert__close"
                    aria-label="Dismiss alert"
                    onclick="this.parentElement.remove()">
              <span class="material-icons" aria-hidden="true">close</span>
            </button>
          ` : ''}
        </div>
      `;
    },

    /* ========================================
       METRIC/STAT COMPONENT
       ======================================== */
    metric: function(props) {
      const {
        value,
        label,
        trend,              // { direction: 'up'|'down', text: '+10%' }
        icon,
        variant = 'default' // 'default', 'large', 'compact'
      } = props;

      if (!value || !label) {
        console.error('Metric requires value and label');
        return '';
      }

      return `
        <div class="sp-metric sp-metric--${variant}">
          ${icon ? `
            <span class="material-icons sp-metric__icon" aria-hidden="true">${icon}</span>
          ` : ''}
          <div class="sp-metric__value">${escapeHtml(value)}</div>
          <div class="sp-metric__label">${escapeHtml(label)}</div>
          ${trend ? `
            <div class="sp-metric__trend sp-metric__trend--${trend.direction}">
              <span class="material-icons" aria-hidden="true">
                ${trend.direction === 'up' ? 'trending_up' : 'trending_down'}
              </span>
              ${escapeHtml(trend.text)}
            </div>
          ` : ''}
        </div>
      `;
    },

    /* ========================================
       GRID COMPONENT
       ======================================== */
    grid: function(props) {
      const {
        items,              // Array of component props
        component = 'card', // Which component to render
        columns = 3,        // Desktop columns
        gap = '1rem',
        responsive = true   // Auto-adjust columns on mobile
      } = props;

      if (!items || !Array.isArray(items)) {
        console.error('Grid requires items array');
        return '';
      }

      const gridClass = responsive ? 'sp-grid--responsive' : '';

      return `
        <div class="sp-grid ${gridClass}"
             style="grid-template-columns: repeat(${columns}, 1fr); gap: ${gap};">
          ${items.map(item => this[component](item)).join('')}
        </div>
      `;
    },

    /* ========================================
       TABS COMPONENT
       ======================================== */
    tabs: function(props) {
      const {
        tabs,               // [{ id, label, content }]
        defaultTab = 0
      } = props;

      if (!tabs || !Array.isArray(tabs)) {
        console.error('Tabs requires tabs array');
        return '';
      }

      const containerId = `sp-tabs-${Date.now()}`;

      return `
        <div class="sp-tabs" id="${containerId}">
          <div class="sp-tabs__list" role="tablist">
            ${tabs.map((tab, index) => `
              <button class="sp-tabs__tab ${index === defaultTab ? 'sp-tabs__tab--active' : ''}"
                      role="tab"
                      aria-selected="${index === defaultTab}"
                      aria-controls="${containerId}-panel-${index}"
                      id="${containerId}-tab-${index}"
                      onclick="SPComponents.switchTab('${containerId}', ${index})">
                ${escapeHtml(tab.label)}
              </button>
            `).join('')}
          </div>
          <div class="sp-tabs__panels">
            ${tabs.map((tab, index) => `
              <div class="sp-tabs__panel ${index === defaultTab ? 'sp-tabs__panel--active' : ''}"
                   role="tabpanel"
                   id="${containerId}-panel-${index}"
                   aria-labelledby="${containerId}-tab-${index}"
                   ${index !== defaultTab ? 'hidden' : ''}>
                ${tab.content}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    },

    switchTab: function(containerId, tabIndex) {
      const container = document.getElementById(containerId);
      if (!container) return;

      // Update tab buttons
      const tabs = container.querySelectorAll('.sp-tabs__tab');
      tabs.forEach((tab, index) => {
        if (index === tabIndex) {
          tab.classList.add('sp-tabs__tab--active');
          tab.setAttribute('aria-selected', 'true');
        } else {
          tab.classList.remove('sp-tabs__tab--active');
          tab.setAttribute('aria-selected', 'false');
        }
      });

      // Update panels
      const panels = container.querySelectorAll('.sp-tabs__panel');
      panels.forEach((panel, index) => {
        if (index === tabIndex) {
          panel.classList.add('sp-tabs__panel--active');
          panel.removeAttribute('hidden');
        } else {
          panel.classList.remove('sp-tabs__panel--active');
          panel.setAttribute('hidden', '');
        }
      });
    },

    /* ========================================
       FEATURE LIST COMPONENT
       ======================================== */
    featureList: function(props) {
      const {
        features,           // [{ icon, title, description }]
        columns = 2
      } = props;

      if (!features || !Array.isArray(features)) {
        console.error('FeatureList requires features array');
        return '';
      }

      return `
        <div class="sp-feature-list" style="grid-template-columns: repeat(${columns}, 1fr);">
          ${features.map(feature => `
            <div class="sp-feature">
              ${feature.icon ? `
                <div class="sp-feature__icon">
                  <span class="material-icons" aria-hidden="true">${feature.icon}</span>
                </div>
              ` : ''}
              <h4 class="sp-feature__title">${escapeHtml(feature.title)}</h4>
              ${feature.description ? `
                <p class="sp-feature__description">${escapeHtml(feature.description)}</p>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `;
    },

    /* ========================================
       INDICATOR CARD (Custom for SignalPilot)
       ======================================== */
    indicatorCard: function(props) {
      const {
        name,
        type,               // 'Overlay', 'Oscillator', 'Table'
        complexity,         // 1-3 stars
        bestFor,
        keySignals,
        learnTime,
        url,
        isNew = false
      } = props;

      const stars = '⭐'.repeat(complexity);

      return this.card({
        title: name,
        description: `**Type:** ${type} | **Complexity:** ${stars}\n\n**Best for:** ${bestFor}`,
        link: { url, text: 'Learn more' },
        badge: isNew ? { type: 'new', text: 'New' } : null,
        stats: [
          { value: keySignals, label: 'Key Signals' },
          { value: learnTime, label: 'Learn Time' }
        ],
        variant: 'featured'
      });
    }
  };
})();

/* ========================================
   AUTO-INJECTION SYSTEM
   ======================================== */

// Automatically render components from data attributes
function renderSPComponents() {
  document.querySelectorAll('[data-sp-component]').forEach(el => {
    const componentType = el.dataset.spComponent;

    try {
      const props = el.dataset.spProps ? JSON.parse(el.dataset.spProps) : {};

      if (SPComponents[componentType]) {
        el.innerHTML = SPComponents[componentType](props);
        el.dataset.rendered = 'true';
      } else {
        console.error(`Component "${componentType}" not found`);
      }
    } catch (error) {
      console.error(`Error rendering component "${componentType}":`, error);
    }
  });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderSPComponents);
} else {
  renderSPComponents();
}

// Re-render on SPA navigation
if (typeof document$ !== 'undefined') {
  document$.subscribe(() => {
    setTimeout(renderSPComponents, 100);
  });
}

// Export for global use
window.SPComponents = SPComponents;
