/**
 * SignalPilot Theme System
 * Multi-theme support with particle effects, colors, and visual customization
 */

(function() {
  'use strict';

  // Theme definitions
  window.SP_THEMES = {
    default: {
      name: 'Default',
      icon: '🌌',
      description: 'Classic blue space theme',
      colors: {
        bg: '#05070d',
        bgElev: '#0c101b',
        bgSoft: '#151c2d',
        text: '#ecf1ff',
        muted: '#b5c0d8',
        mutedSoft: '#7784a1',
        brand: '#5b8aff',
        brandGlow: 'rgba(91, 138, 255, 0.5)',
        accent: '#76ddff',
        success: '#3ed598',
        warn: '#f9a23c',
        border: 'rgba(102, 128, 214, 0.22)'
      },
      particles: {
        type: 'stars',
        color: 'rgba(180, 200, 255, 0.85)',
        lineColor: 'rgba(180, 200, 255, 0.35)',
        count: 'auto'
      },
      aurora: {
        colors: [
          'rgba(125, 200, 255, 0.40)',
          'rgba(155, 140, 255, 0.38)',
          'rgba(118, 221, 255, 0.28)',
          'rgba(151, 124, 255, 0.22)'
        ]
      }
    },

    halloween: {
      name: 'Halloween',
      icon: '🎃',
      description: 'Spooky season vibes',
      colors: {
        bg: '#0d0510',
        bgElev: '#1a0f1e',
        bgSoft: '#2a1533',
        text: '#f4e8ff',
        muted: '#c4aed4',
        mutedSoft: '#9178a1',
        brand: '#8b5cf6',
        brandGlow: 'rgba(139, 92, 246, 0.6)',
        accent: '#ff6b35',
        success: '#10b981',
        warn: '#fbbf24',
        border: 'rgba(139, 92, 246, 0.25)'
      },
      particles: {
        type: 'ghosts',
        color: 'rgba(139, 92, 246, 0.8)',
        lineColor: 'rgba(255, 107, 53, 0.3)',
        count: 60,
        emoji: '👻'
      },
      aurora: {
        colors: [
          'rgba(139, 92, 246, 0.45)',
          'rgba(255, 107, 53, 0.35)',
          'rgba(16, 185, 129, 0.25)',
          'rgba(251, 191, 36, 0.20)'
        ]
      }
    },

    winter: {
      name: 'Winter',
      icon: '❄️',
      description: 'Frozen wonderland',
      colors: {
        bg: '#0a0f1a',
        bgElev: '#0f172a',
        bgSoft: '#1e293b',
        text: '#f0f9ff',
        muted: '#bae6fd',
        mutedSoft: '#7dd3fc',
        brand: '#60a5fa',
        brandGlow: 'rgba(96, 165, 250, 0.6)',
        accent: '#22d3ee',
        success: '#34d399',
        warn: '#fcd34d',
        border: 'rgba(96, 165, 250, 0.22)'
      },
      particles: {
        type: 'snowflakes',
        color: 'rgba(224, 242, 254, 0.9)',
        lineColor: 'rgba(186, 230, 253, 0.25)',
        count: 80,
        emoji: '❄️'
      },
      aurora: {
        colors: [
          'rgba(96, 165, 250, 0.40)',
          'rgba(34, 211, 238, 0.35)',
          'rgba(240, 249, 255, 0.25)',
          'rgba(186, 230, 253, 0.30)'
        ]
      }
    },

    cyberpunk: {
      name: 'Cyberpunk',
      icon: '⚡',
      description: 'Neon-soaked future',
      colors: {
        bg: '#0a0014',
        bgElev: '#1a0028',
        bgSoft: '#2a0f3d',
        text: '#fdf4ff',
        muted: '#f0abfc',
        mutedSoft: '#c084fc',
        brand: '#ec4899',
        brandGlow: 'rgba(236, 72, 153, 0.7)',
        accent: '#06b6d4',
        success: '#10b981',
        warn: '#f59e0b',
        border: 'rgba(236, 72, 153, 0.28)'
      },
      particles: {
        type: 'neon',
        color: 'rgba(236, 72, 153, 0.9)',
        lineColor: 'rgba(6, 182, 212, 0.4)',
        count: 70
      },
      aurora: {
        colors: [
          'rgba(236, 72, 153, 0.45)',
          'rgba(6, 182, 212, 0.40)',
          'rgba(168, 85, 247, 0.35)',
          'rgba(236, 72, 153, 0.30)'
        ]
      }
    },

    ocean: {
      name: 'Ocean',
      icon: '🌊',
      description: 'Deep sea exploration',
      colors: {
        bg: '#020617',
        bgElev: '#0c1628',
        bgSoft: '#1e293b',
        text: '#e0f2fe',
        muted: '#7dd3fc',
        mutedSoft: '#0ea5e9',
        brand: '#1e40af',
        brandGlow: 'rgba(30, 64, 175, 0.6)',
        accent: '#22d3ee',
        success: '#14b8a6',
        warn: '#f97316',
        border: 'rgba(34, 211, 238, 0.25)'
      },
      particles: {
        type: 'bubbles',
        color: 'rgba(34, 211, 238, 0.7)',
        lineColor: 'rgba(34, 211, 238, 0.2)',
        count: 50,
        emoji: '○'
      },
      aurora: {
        colors: [
          'rgba(30, 64, 175, 0.40)',
          'rgba(34, 211, 238, 0.35)',
          'rgba(20, 184, 166, 0.30)',
          'rgba(6, 182, 212, 0.25)'
        ]
      }
    },

    forest: {
      name: 'Forest',
      icon: '🌲',
      description: 'Natural serenity',
      colors: {
        bg: '#05120a',
        bgElev: '#0d1f14',
        bgSoft: '#1a2e23',
        text: '#ecfdf5',
        muted: '#86efac',
        mutedSoft: '#4ade80',
        brand: '#10b981',
        brandGlow: 'rgba(16, 185, 129, 0.6)',
        accent: '#84cc16',
        success: '#22c55e',
        warn: '#f59e0b',
        border: 'rgba(16, 185, 129, 0.22)'
      },
      particles: {
        type: 'fireflies',
        color: 'rgba(132, 204, 22, 0.8)',
        lineColor: 'rgba(16, 185, 129, 0.25)',
        count: 55,
        emoji: '✨'
      },
      aurora: {
        colors: [
          'rgba(16, 185, 129, 0.35)',
          'rgba(132, 204, 22, 0.30)',
          'rgba(34, 197, 94, 0.25)',
          'rgba(20, 184, 166, 0.20)'
        ]
      }
    },

    matrix: {
      name: 'Matrix',
      icon: '💚',
      description: 'Digital rain - The Matrix',
      colors: {
        bg: '#000000',
        bgElev: '#001a00',
        bgSoft: '#003300',
        text: '#00ff41',
        muted: '#39ff14',
        mutedSoft: '#00cc33',
        brand: '#00ff41',
        brandGlow: 'rgba(0, 255, 65, 0.7)',
        accent: '#39ff14',
        success: '#00cc33',
        warn: '#ffff00',
        border: 'rgba(0, 255, 65, 0.3)'
      },
      particles: {
        type: 'matrix-rain',
        color: 'rgba(0, 255, 65, 0.85)',
        lineColor: 'rgba(0, 255, 65, 0.25)',
        count: 60  // Smooth rain - slower, less dense
      },
      aurora: {
        colors: [
          'rgba(0, 255, 65, 0.35)',
          'rgba(57, 255, 20, 0.30)',
          'rgba(0, 204, 51, 0.25)',
          'rgba(0, 255, 65, 0.20)'
        ]
      }
    },

    midnight: {
      name: 'Midnight',
      icon: '🌙',
      description: 'Moonlit clouds and stars',
      colors: {
        bg: '#0f0620',
        bgElev: '#1a0d33',
        bgSoft: '#2a1547',
        text: '#e9d5ff',
        muted: '#c4b5fd',
        mutedSoft: '#a78bfa',
        brand: '#7c3aed',
        brandGlow: 'rgba(124, 58, 237, 0.6)',
        accent: '#a78bfa',
        success: '#34d399',
        warn: '#fbbf24',
        border: 'rgba(124, 58, 237, 0.25)'
      },
      particles: {
        type: 'moon-clouds',
        color: 'rgba(196, 181, 253, 0.25)',
        lineColor: 'rgba(167, 139, 250, 0.3)',
        count: 70
      },
      aurora: {
        colors: [
          'rgba(124, 58, 237, 0.40)',
          'rgba(167, 139, 250, 0.35)',
          'rgba(233, 213, 255, 0.25)',
          'rgba(196, 181, 253, 0.30)'
        ]
      }
    },

    sakura: {
      name: 'Sakura',
      icon: '🌸',
      description: 'Falling cherry blossoms',
      colors: {
        bg: '#1a0511',
        bgElev: '#2d0f1f',
        bgSoft: '#3d1a2d',
        text: '#fce7f3',
        muted: '#fbcfe8',
        mutedSoft: '#f9a8d4',
        brand: '#ec4899',
        brandGlow: 'rgba(236, 72, 153, 0.6)',
        accent: '#f472b6',
        success: '#86efac',
        warn: '#fcd34d',
        border: 'rgba(236, 72, 153, 0.22)'
      },
      particles: {
        type: 'sakura-petals',
        color: 'rgba(249, 168, 212, 0.85)',
        lineColor: 'rgba(244, 114, 182, 0.3)',
        count: 70
      },
      aurora: {
        colors: [
          'rgba(236, 72, 153, 0.40)',
          'rgba(244, 114, 182, 0.35)',
          'rgba(251, 207, 232, 0.25)',
          'rgba(249, 168, 212, 0.30)'
        ]
      }
    },

    lava: {
      name: 'Lava',
      icon: '🌋',
      description: 'Flames, embers, and volcanic heat',
      colors: {
        bg: '#1a0500',
        bgElev: '#2d0f05',
        bgSoft: '#3d1a0f',
        text: '#fff1f2',
        muted: '#fca5a5',
        mutedSoft: '#f87171',
        brand: '#dc2626',
        brandGlow: 'rgba(220, 38, 38, 0.7)',
        accent: '#fb923c',
        success: '#84cc16',
        warn: '#facc15',
        border: 'rgba(220, 38, 38, 0.3)'
      },
      particles: {
        type: 'lava-embers',
        color: 'rgba(251, 146, 60, 0.9)',
        lineColor: 'rgba(220, 38, 38, 0.4)',
        count: 75
      },
      aurora: {
        colors: [
          'rgba(220, 38, 38, 0.45)',
          'rgba(251, 146, 60, 0.40)',
          'rgba(248, 113, 113, 0.35)',
          'rgba(252, 165, 165, 0.25)'
        ]
      }
    },

    digitalization: {
      name: 'Digitalization',
      icon: '₿',
      description: 'Digital currency rain',
      colors: {
        bg: '#0a0800',
        bgElev: '#1a1400',
        bgSoft: '#2a2410',
        text: '#fef9c3',
        muted: '#fde047',
        mutedSoft: '#facc15',
        brand: '#f59e0b',
        brandGlow: 'rgba(245, 158, 11, 0.7)',
        accent: '#fb923c',
        success: '#84cc16',
        warn: '#ef4444',
        border: 'rgba(245, 158, 11, 0.28)'
      },
      particles: {
        type: 'bitcoin-rain',
        color: 'rgba(253, 224, 71, 0.9)',
        lineColor: 'rgba(245, 158, 11, 0.4)',
        count: 65
      },
      aurora: {
        colors: [
          'rgba(245, 158, 11, 0.45)',
          'rgba(251, 146, 60, 0.40)',
          'rgba(253, 224, 71, 0.35)',
          'rgba(234, 179, 8, 0.30)'
        ]
      }
    },

    newyear: {
      name: 'New Year',
      icon: '🎆',
      description: 'Fireworks celebration',
      colors: {
        bg: '#050510',
        bgElev: '#0f0a1f',
        bgSoft: '#1a142d',
        text: '#fef3c7',
        muted: '#fde047',
        mutedSoft: '#facc15',
        brand: '#eab308',
        brandGlow: 'rgba(234, 179, 8, 0.7)',
        accent: '#f59e0b',
        success: '#84cc16',
        warn: '#ef4444',
        border: 'rgba(234, 179, 8, 0.28)'
      },
      particles: {
        type: 'fireworks',
        color: 'rgba(253, 224, 71, 0.9)',
        lineColor: 'rgba(245, 158, 11, 0.5)',
        count: 40
      },
      aurora: {
        colors: [
          'rgba(234, 179, 8, 0.45)',
          'rgba(251, 146, 60, 0.40)',
          'rgba(239, 68, 68, 0.35)',
          'rgba(168, 85, 247, 0.30)'
        ]
      }
    },

    storm: {
      name: 'Storm',
      icon: '⚡',
      description: 'Epic lightning strikes',
      colors: {
        bg: '#05050a',
        bgElev: '#0a0a14',
        bgSoft: '#0f0f1f',
        text: '#e0e7ff',
        muted: '#a5b4fc',
        mutedSoft: '#818cf8',
        brand: '#6366f1',
        brandGlow: 'rgba(99, 102, 241, 0.7)',
        accent: '#8b5cf6',
        success: '#10b981',
        warn: '#f59e0b',
        border: 'rgba(99, 102, 241, 0.25)'
      },
      particles: {
        type: 'lightning',
        color: 'rgba(255, 255, 255, 1.0)',
        lineColor: 'rgba(165, 180, 252, 0.8)',
        count: 8  // Few, dramatic lightning strikes
      },
      aurora: {
        colors: [
          'rgba(99, 102, 241, 0.40)',
          'rgba(139, 92, 246, 0.35)',
          'rgba(165, 180, 252, 0.30)',
          'rgba(129, 140, 248, 0.25)'
        ]
      }
    },

    vaporwave: {
      name: 'Vaporwave',
      icon: '🌴',
      description: 'Aesthetic A E S T H E T I C',
      colors: {
        bg: '#1a0528',
        bgElev: '#2d0f3d',
        bgSoft: '#3d1a52',
        text: '#fae8ff',
        muted: '#f0abfc',
        mutedSoft: '#e879f9',
        brand: '#d946ef',
        brandGlow: 'rgba(217, 70, 239, 0.7)',
        accent: '#06b6d4',
        success: '#22c55e',
        warn: '#f59e0b',
        border: 'rgba(217, 70, 239, 0.28)'
      },
      particles: {
        type: 'vaporwave-grid',
        color: 'rgba(217, 70, 239, 0.7)',
        lineColor: 'rgba(6, 182, 212, 0.5)',
        count: 35
      },
      aurora: {
        colors: [
          'rgba(217, 70, 239, 0.45)',
          'rgba(6, 182, 212, 0.40)',
          'rgba(251, 146, 60, 0.35)',
          'rgba(236, 72, 153, 0.30)'
        ]
      }
    }
  };

  // Current theme state
  let currentTheme = 'default';

  // Apply theme to CSS variables
  function applyTheme(themeId) {
    const theme = window.SP_THEMES[themeId];
    if (!theme) return;

    const root = document.documentElement;
    const colors = theme.colors;

    // Update CSS variables
    root.style.setProperty('--bg', colors.bg);
    root.style.setProperty('--bg-elev', colors.bgElev);
    root.style.setProperty('--bg-soft', colors.bgSoft);
    root.style.setProperty('--text', colors.text);
    root.style.setProperty('--muted', colors.muted);
    root.style.setProperty('--muted-soft', colors.mutedSoft);
    root.style.setProperty('--brand', colors.brand);
    root.style.setProperty('--brand-glow', colors.brandGlow);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--success', colors.success);
    root.style.setProperty('--warn', colors.warn);
    root.style.setProperty('--border', colors.border);

    // Update hero gradient
    const heroGrad = `radial-gradient(circle at top right, ${colors.brandGlow}, transparent 50%), radial-gradient(circle at 15% 25%, ${colors.accent}33, transparent 45%), var(--bg)`;
    root.style.setProperty('--bg-hero', heroGrad);

    // Update aurora colors
    updateAuroraColors(theme.aurora.colors);

    // Update particles
    if (window.updateParticles) {
      window.updateParticles(theme.particles);
    }

    // Save to localStorage
    currentTheme = themeId;
    localStorage.setItem('sp-theme', themeId);

    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: themeId, config: theme } }));
  }

  // Update aurora gradient colors
  function updateAuroraColors(colors) {
    const aurora = document.querySelector('.bg-aurora');
    if (!aurora) return;

    const gradients = colors.map((color, i) => {
      const positions = [
        ['45% 35% at 12% 12%', '62%'],
        ['36% 28% at 85% 14%', '65%'],
        ['48% 36% at 78% 88%', '70%'],
        ['26% 22% at 8% 72%', '66%']
      ];
      return `radial-gradient(${positions[i][0]}, ${color}, transparent ${positions[i][1]})`;
    }).join(', ');

    aurora.style.background = gradients;
  }

  // Initialize theme system
  function initThemeSystem() {
    // Load saved theme or default
    const savedTheme = localStorage.getItem('sp-theme') || 'default';
    applyTheme(savedTheme);

    // Auto-suggest seasonal themes
    const now = new Date();
    const month = now.getMonth();
    if (month === 9 && savedTheme === 'default') { // October
      showSeasonalSuggestion('halloween', 'Try our spooky Halloween theme! 🎃');
    } else if ((month === 11 || month === 0) && savedTheme === 'default') { // Dec/Jan
      showSeasonalSuggestion('winter', 'Switch to Winter theme for a frosty feel! ❄️');
    }
  }

  // Show seasonal suggestion
  function showSeasonalSuggestion(themeId, message) {
    // Only show once per session
    if (sessionStorage.getItem('seasonal-suggested')) return;
    sessionStorage.setItem('seasonal-suggested', 'true');

    setTimeout(() => {
      if (confirm(message)) {
        applyTheme(themeId);
      }
    }, 3000);
  }

  // Expose API
  window.SP_THEME = {
    apply: applyTheme,
    current: () => currentTheme,
    list: () => Object.keys(window.SP_THEMES),
    get: (id) => window.SP_THEMES[id]
  };

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeSystem);
  } else {
    initThemeSystem();
  }
})();
