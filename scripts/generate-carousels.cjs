#!/usr/bin/env node
/**
 * Carousel HTML Generator v2 — Rebuilds bad carousels with bespoke designs
 * Uses 9GRID slide structures + content queue Twitter threads
 */
const fs = require('fs');
const path = require('path');

// ── Load data ──────────────────────────────────────────────
const contentQueue = JSON.parse(fs.readFileSync('data/social/content-queue.json', 'utf8'));
const gridData = JSON.parse(fs.readFileSync('data/social/9grid-structures.json', 'utf8'));
const gridPosts = gridData.posts;

// ── Detect bad carousels ───────────────────────────────────
const CUSTOM_MARKERS = [
  'combo-box', 'signal-grid', 'divergence-box', 'flow-card', 'cheat-row',
  'metric-card', 'phase-card', 'cycle-card', 'step-card', 'feature-card',
  'comparison', 'warning-box', 'insight-box', 'indicator-card', 'grid-item',
  'stat-box', 'data-row', 'scenario-box', 'rule-card', 'concept-card',
  'tip-card', 'slide-number', 'formula-box', 'example-block', 'result-box',
  'definition-box', 'view-box', 'philosophy-box', 'method-list', 'alignment-grid',
  'indicator-badge', 'behavior-grid', 'concept-box', 'found-box', 'ignored-box',
  'fix-box', 'checklist', 'key-point', 'combo-arrows', 'brand-mark'
];

function isBadCarousel(postNum) {
  const dir = `INSTAGRAM_CONTENT_HUB/social/post-${String(postNum).padStart(3,'0')}`;
  const htmlPath = path.join(dir, 'carousel.html');
  if (!fs.existsSync(htmlPath)) return true;
  const html = fs.readFileSync(htmlPath, 'utf8');
  return !CUSTOM_MARKERS.some(m => html.includes(m));
}

// ── Color scheme per column ────────────────────────────────
const TYPE_TO_COLUMN = {
  'Quote': 'orange', 'Product': 'orange', 'Marketing': 'orange',
  'Education': 'neutral',
  'Blog': 'teal', 'Chronicle': 'teal', 'Docs': 'teal'
};

function getColumnColor(post) {
  return TYPE_TO_COLUMN[post.type] || 'neutral';
}

// ── Hook label per type ────────────────────────────────────
const TYPE_TO_LABEL = {
  'Education': 'LEARN', 'Product': 'INDICATOR', 'Blog': 'INSIGHT',
  'Quote': 'REFLECT', 'Marketing': 'DISCOVER', 'Chronicle': 'CHRONICLE',
  'Docs': 'REFERENCE'
};

// ── Parse Twitter content into slide-worthy chunks ─────────
function parseTwitterContent(post) {
  if (!post.twitter || !post.twitter.tweets) return [];
  return post.twitter.tweets.map(t => {
    return t.replace(/\\n/g, '\n')
            .replace(/🧵$/, '').trim()
            .split('\n').filter(l => l.trim()).join('\n');
  });
}

// ── Extract key sentences from text ────────────────────────
function extractKeyPoints(text) {
  const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('http'));
  return lines.map(l => l.replace(/^[→•\-\d.]+\s*/, '').trim()).filter(l => l.length > 5);
}

// ── Smart truncation (word/sentence boundary aware) ────────
function smartTruncate(text, maxLen) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  const chunk = text.substring(0, maxLen);
  // Try to break at a sentence boundary (. ? !) within the limit
  for (let j = chunk.length - 1; j >= Math.floor(maxLen * 0.4); j--) {
    if ('.?!'.includes(chunk[j]) && (j === chunk.length - 1 || chunk[j + 1] === ' ')) {
      return chunk.substring(0, j + 1).trim();
    }
  }
  // Fall back to last word boundary
  const lastSpace = chunk.lastIndexOf(' ');
  if (lastSpace > Math.floor(maxLen * 0.4)) return chunk.substring(0, lastSpace).trim();
  return chunk.trim();
}

// ── Detect content patterns ────────────────────────────────
function detectPatterns(tweets, caption) {
  const allText = tweets.join('\n') + '\n' + (caption || '');
  return {
    hasComparison: /vs\.?\s|versus|compared to|difference between/i.test(allText),
    hasList: /\d[.)]\s|→\s|•\s/m.test(allText),
    hasFormula: /[=×÷%]/i.test(allText),
    hasStats: /\d+%|\d+x|\$[\d,]+/i.test(allText),
    hasWarning: /warning|danger|caution|careful|avoid|mistake|trap|don't/i.test(allText),
    hasQuote: /[""\u201c\u201d][^"""\u201c\u201d]{15,}[""\u201c\u201d]/.test(allText),
    hasSteps: /step\s*\d|first.*then|1\)|2\)/i.test(allText),
    hasBullBear: /bull|bear|long|short|buy|sell|up.?trend|down.?trend/i.test(allText),
    hasIndicator: /pentarch|volume oracle|janus atlas|plutus flow|harmonic oscillator|augury grid|omnideck/i.test(allText),
    hasPsychology: /mindset|psychology|emotion|fear|greed|discipline|patience/i.test(allText),
  };
}

// ── CSS Library ────────────────────────────────────────────
function getBaseCSS() {
  return `
    :root {
      --bg-dark: #0a0a0f;
      --accent-blue: #4a90d9;
      --accent-gold: #c9a962;
      --accent-red: #d94a4a;
      --accent-green: #4ad97a;
      --accent-teal: #5eecd4;
      --text-primary: #e8e8e8;
      --text-secondary: #a0a0a0;
      --text-dim: #6a6a6a;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: var(--bg-dark); color: var(--text-primary); font-family: 'Inter', sans-serif; min-height: 100vh; padding: 40px 20px; }
    .controls { position: fixed; top: 20px; right: 20px; z-index: 100; display: flex; gap: 12px; align-items: center; }
    .controls label { color: var(--text-secondary); font-size: 12px; display: flex; align-items: center; gap: 6px; }
    .controls input[type="checkbox"] { cursor: pointer; }
    .controls input[type="range"] { width: 80px; cursor: pointer; }
    .controls button { background: var(--accent-blue); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; }
    .page-title { text-align: center; margin-bottom: 40px; }
    .page-title h1 { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 400; margin-bottom: 8px; }
    .page-title p { color: var(--text-dim); font-size: 14px; }
    .carousel-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; max-width: 1400px; margin: 0 auto; }
    .slide-wrapper { aspect-ratio: 4 / 5; position: relative; border-radius: 12px; overflow: hidden; background: var(--bg-dark); box-shadow: 0 4px 24px rgba(0,0,0,0.4); container-type: inline-size; }
    .slide-wrapper .bg-video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: var(--video-opacity, 0.08); pointer-events: none; }
    .slide-wrapper .slide-content { position: relative; z-index: 2; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 8%; text-align: center; }
    .slide-number { position: absolute; top: 4%; left: 4%; font-size: clamp(9px, 3cqw, 11px); color: var(--text-dim); font-weight: 500; letter-spacing: 1px; }
    .brand-mark { position: absolute; bottom: 4%; right: 4%; font-size: clamp(8px, 2.5cqw, 10px); color: var(--text-dim); letter-spacing: 1px; }
    .slide-icon { font-size: clamp(28px, 10cqw, 48px); margin-bottom: 4%; }
    .slide-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(18px, 7cqw, 28px); font-weight: 600; color: var(--text-primary); margin-bottom: 3%; line-height: 1.2; }
    .slide-title.large { font-size: clamp(22px, 8cqw, 32px); }
    .slide-subtitle { font-size: clamp(10px, 3.5cqw, 14px); color: var(--accent-gold); text-transform: uppercase; letter-spacing: 3px; margin-bottom: 4%; font-weight: 500; }
    .slide-body { font-size: clamp(12px, 4cqw, 16px); color: var(--text-secondary); line-height: 1.7; max-width: 90%; }
    .cta-link { display: inline-block; margin-top: 5%; padding: 3% 6%; background: var(--accent-gold); color: var(--bg-dark); text-decoration: none; border-radius: 8px; font-weight: 500; font-size: clamp(11px, 3.5cqw, 14px); letter-spacing: 0.5px; }

    /* ── Visual Components ── */
    .concept-card { width: 100%; max-width: 90%; border-radius: 12px; padding: 5%; margin: 2% 0; text-align: left; }
    .concept-card.green { background: rgba(74,217,122,0.08); border: 1.5px solid rgba(74,217,122,0.35); }
    .concept-card.red { background: rgba(217,74,74,0.08); border: 1.5px solid rgba(217,74,74,0.35); }
    .concept-card.blue { background: rgba(74,144,217,0.08); border: 1.5px solid rgba(74,144,217,0.35); }
    .concept-card.gold { background: rgba(201,169,98,0.08); border: 1.5px solid rgba(201,169,98,0.35); }
    .concept-card .card-label { font-size: clamp(9px, 3cqw, 11px); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 2%; font-weight: 500; }
    .concept-card.green .card-label { color: var(--accent-green); }
    .concept-card.red .card-label { color: var(--accent-red); }
    .concept-card.blue .card-label { color: var(--accent-blue); }
    .concept-card.gold .card-label { color: var(--accent-gold); }
    .concept-card .card-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(14px, 5cqw, 20px); font-weight: 600; color: var(--text-primary); margin-bottom: 2%; }
    .concept-card .card-desc { font-size: clamp(10px, 3.5cqw, 14px); color: var(--text-secondary); line-height: 1.5; }

    .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3%; width: 100%; max-width: 90%; }
    .data-item { padding: 5%; border-radius: 10px; text-align: center; }
    .data-item.up { background: rgba(74,217,122,0.1); border: 1px solid rgba(74,217,122,0.3); }
    .data-item.down { background: rgba(217,74,74,0.1); border: 1px solid rgba(217,74,74,0.3); }
    .data-item.info { background: rgba(74,144,217,0.1); border: 1px solid rgba(74,144,217,0.3); }
    .data-item.warn { background: rgba(201,169,98,0.1); border: 1px solid rgba(201,169,98,0.3); }
    .data-item .item-icon { font-size: clamp(20px, 7cqw, 32px); margin-bottom: 3%; }
    .data-item .item-label { font-size: clamp(9px, 3cqw, 12px); color: var(--text-secondary); line-height: 1.4; }
    .data-item .item-value { font-family: 'Cormorant Garamond', serif; font-size: clamp(14px, 5cqw, 20px); font-weight: 600; color: var(--text-primary); margin-bottom: 2%; }

    .arrow-list { list-style: none; text-align: left; width: 100%; max-width: 90%; padding: 0; }
    .arrow-list li { display: flex; align-items: flex-start; gap: 3%; margin-bottom: 3%; font-size: clamp(11px, 3.5cqw, 15px); color: var(--text-secondary); line-height: 1.5; }
    .arrow-list .arrow { color: var(--accent-blue); font-weight: 600; flex-shrink: 0; }

    .checklist { list-style: none; text-align: left; width: 100%; max-width: 90%; padding: 0; }
    .checklist li { display: flex; align-items: flex-start; gap: 3%; margin-bottom: 3%; font-size: clamp(11px, 3.5cqw, 15px); color: var(--text-secondary); line-height: 1.5; }
    .checklist .check { color: var(--accent-green); flex-shrink: 0; }
    .checklist .cross { color: var(--accent-red); flex-shrink: 0; }

    .callout-box { width: 100%; max-width: 90%; border-radius: 12px; padding: 5%; margin: 3% 0; text-align: left; }
    .callout-box.warning { background: rgba(217,74,74,0.08); border-left: 4px solid var(--accent-red); }
    .callout-box.insight { background: rgba(201,169,98,0.08); border-left: 4px solid var(--accent-gold); }
    .callout-box.success { background: rgba(74,217,122,0.08); border-left: 4px solid var(--accent-green); }
    .callout-box.info { background: rgba(74,144,217,0.08); border-left: 4px solid var(--accent-blue); }
    .callout-box .callout-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(14px, 5cqw, 20px); font-weight: 600; margin-bottom: 2%; }
    .callout-box.warning .callout-title { color: var(--accent-red); }
    .callout-box.insight .callout-title { color: var(--accent-gold); }
    .callout-box.success .callout-title { color: var(--accent-green); }
    .callout-box.info .callout-title { color: var(--accent-blue); }
    .callout-box .callout-text { font-size: clamp(11px, 3.5cqw, 14px); color: var(--text-secondary); line-height: 1.6; }

    .stat-row { display: flex; justify-content: center; gap: 4%; width: 100%; max-width: 90%; margin: 3% 0; }
    .stat-item { text-align: center; flex: 1; }
    .stat-value { font-family: 'Cormorant Garamond', serif; font-size: clamp(20px, 8cqw, 32px); font-weight: 600; color: var(--accent-gold); }
    .stat-label { font-size: clamp(9px, 3cqw, 11px); color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; margin-top: 2%; }

    .compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3%; width: 100%; max-width: 90%; }
    .compare-item { padding: 5%; border-radius: 10px; text-align: center; }
    .compare-item.before { background: rgba(217,74,74,0.08); border: 1.5px solid rgba(217,74,74,0.3); }
    .compare-item.after { background: rgba(74,217,122,0.08); border: 1.5px solid rgba(74,217,122,0.3); }
    .compare-item .compare-label { font-size: clamp(9px, 3cqw, 11px); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 3%; font-weight: 500; }
    .compare-item.before .compare-label { color: var(--accent-red); }
    .compare-item.after .compare-label { color: var(--accent-green); }
    .compare-item .compare-text { font-size: clamp(10px, 3.5cqw, 14px); color: var(--text-secondary); line-height: 1.5; }

    .quote-block { font-family: 'Cormorant Garamond', serif; font-size: clamp(16px, 6cqw, 26px); font-style: italic; color: var(--text-primary); line-height: 1.5; max-width: 85%; margin: 4% 0; }
    .quote-attr { font-family: 'Inter', sans-serif; font-size: clamp(10px, 3cqw, 12px); color: var(--accent-gold); letter-spacing: 1px; margin-top: 3%; }

    .step-flow { width: 100%; max-width: 90%; text-align: left; }
    .step-item { display: flex; gap: 4%; margin-bottom: 4%; align-items: flex-start; }
    .step-num { font-family: 'Cormorant Garamond', serif; font-size: clamp(18px, 7cqw, 28px); font-weight: 600; color: var(--accent-gold); min-width: 8%; }
    .step-text { font-size: clamp(11px, 3.5cqw, 15px); color: var(--text-secondary); line-height: 1.5; padding-top: 1%; }

    .indicator-pill { display: inline-block; padding: 2% 5%; background: rgba(201,169,98,0.15); border: 1px solid var(--accent-gold); border-radius: 20px; font-size: clamp(10px, 3.5cqw, 14px); color: var(--accent-gold); letter-spacing: 1px; font-weight: 500; margin: 3% 0; }

    /* Export mode */
    body.export-mode { padding: 0; background: #000; }
    body.export-mode .controls, body.export-mode .page-title { display: none; }
    body.export-mode .carousel-grid { display: block; }
    body.export-mode .slide-wrapper { display: none; width: 1080px; height: 1350px; border-radius: 0; margin: 0; }
    body.export-mode .slide-wrapper.active { display: block; }
    .export-nav { display: none; position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); gap: 12px; z-index: 1000; }
    body.export-mode .export-nav { display: flex; }
    .export-nav button { background: var(--accent-blue); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; }
    .export-nav .slide-indicator { background: rgba(255,255,255,0.1); color: white; padding: 12px 24px; border-radius: 8px; font-size: 14px; }
    @media (max-width: 768px) { .carousel-grid { grid-template-columns: 1fr; max-width: 400px; } }
  `;
}

// ── Slide 1 Hook CSS per color ─────────────────────────────
function getHookCSS(color) {
  const colors = {
    orange: { accent: 'rgba(251,191,36,0.9)', glow: 'rgba(217,148,74,0.08)', bar: 'right', barGrad: 'rgba(251,191,36,0.9) 0%, rgba(217,148,74,0.7) 100%', dim: 'rgba(251,191,36,0.4)' },
    neutral: { accent: 'rgba(180,180,200,0.9)', glow: 'rgba(180,180,200,0.06)', bar: 'none', barGrad: '', dim: 'rgba(180,180,200,0.4)' },
    teal: { accent: 'rgba(94,234,212,0.9)', glow: 'rgba(94,234,212,0.06)', bar: 'left', barGrad: 'rgba(94,234,212,0.9) 0%, rgba(45,180,160,0.7) 100%', dim: 'rgba(94,234,212,0.4)' },
  };
  const c = colors[color] || colors.neutral;

  let barCSS = '';
  if (c.bar !== 'none') {
    barCSS = `
    .slide-1::after {
      content: '';
      position: absolute;
      top: 0;
      ${c.bar}: 0;
      width: 18px;
      height: 100%;
      background: linear-gradient(180deg, ${c.barGrad});
      z-index: 5;
    }`;
  }

  const bgStart = color === 'teal' ? '#0a0c0f' : color === 'orange' ? '#0f0c0a' : '#0c0c0f';
  const bgEnd = color === 'teal' ? '#080a0c' : color === 'orange' ? '#0a0908' : '#090910';

  return `
    .slide-1 { background: linear-gradient(180deg, ${bgStart} 0%, ${bgEnd} 100%) !important; }
    .slide-1::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, ${c.glow} 0%, transparent 100%);
      pointer-events: none;
      z-index: 1;
    }
    ${barCSS}
    .slide-1 .bg-video, .slide-1 video { display: none !important; }
    .slide-1 .slide-content { align-items: center; text-align: center; justify-content: center; z-index: 3; }
    .slide-1 .cine-label {
      font-family: 'Inter', sans-serif;
      font-size: clamp(0.5rem, 1.6cqw, 0.875rem);
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: ${c.accent};
      margin-bottom: 8%;
    }
    .slide-1 .hook-main {
      font-family: 'Inter', sans-serif;
      font-size: clamp(1.4rem, 4.5cqw, 2.5rem);
      font-weight: 600;
      line-height: 1.2;
      color: rgba(255,255,255,0.95);
      margin-bottom: 4%;
    }
    .slide-1 .cine-divider {
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, transparent, ${c.dim.replace('0.4', '0.6')}, transparent);
      margin-bottom: 4%;
    }
    .slide-1 .hook-sub {
      font-family: 'Inter', sans-serif;
      font-size: clamp(0.65rem, 2cqw, 1.1rem);
      font-weight: 300;
      letter-spacing: 0.05em;
      color: ${c.dim};
      line-height: 1.6;
    }
    .slide-1 .cine-logo {
      position: absolute;
      bottom: 8%;
      left: 50%;
      transform: translateX(-50%);
      font-size: clamp(0.4rem, 1.2cqw, 0.625rem);
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: ${c.dim};
    }
  `;
}

// ── Generate slide HTML ────────────────────────────────────
function generateHookSlide(title, subtitle, label) {
  return `
    <div class="slide-wrapper" data-slide="1">
      <div class="slide slide-1">
        <div class="slide-content">
          <div class="cine-label">${escHtml(label)}</div>
          <div class="hook-main">${escHtml(title)}</div>
          <div class="cine-divider"></div>
          <p class="hook-sub">${escHtml(subtitle)}</p>
          <div class="cine-logo">Signal Pilot</div>
        </div>
      </div>
    </div>`;
}

function generateContentSlide(slideNum, totalSlides, subtitle, title, bodyHtml) {
  return `
    <div class="slide-wrapper" data-slide="${slideNum}">
      <video class="bg-video" autoplay muted loop playsinline>
        <source src="../../video/starfield.mp4" type="video/mp4">
      </video>
      <div class="slide-content">
        <span class="slide-number">${String(slideNum).padStart(2,'0')} / ${String(totalSlides).padStart(2,'0')}</span>
        ${subtitle ? `<div class="slide-subtitle">${escHtml(subtitle)}</div>` : ''}
        ${title ? `<h2 class="slide-title">${escHtml(title)}</h2>` : ''}
        ${bodyHtml}
        <span class="brand-mark">SIGNAL PILOT</span>
      </div>
    </div>`;
}

function generateCTASlide(slideNum, totalSlides, icon, title, desc, linkUrl, linkText) {
  return `
    <div class="slide-wrapper" data-slide="${slideNum}">
      <video class="bg-video" autoplay muted loop playsinline>
        <source src="../../video/starfield.mp4" type="video/mp4">
      </video>
      <div class="slide-content">
        <span class="slide-number">${String(slideNum).padStart(2,'0')} / ${String(totalSlides).padStart(2,'0')}</span>
        <div class="slide-icon">${icon}</div>
        <h2 class="slide-title">${escHtml(title)}</h2>
        <p class="slide-body">${escHtml(desc)}</p>
        ${linkUrl ? `<a href="${escHtml(linkUrl)}" class="cta-link">${escHtml(linkText || 'Learn More')}</a>` : ''}
        <span class="brand-mark">SIGNAL PILOT</span>
      </div>
    </div>`;
}

// ── Visual component generators ────────────────────────────
function makeArrowList(items) {
  return `<ul class="arrow-list">${items.map(i => `<li><span class="arrow">\u2192</span> ${escHtml(i)}</li>`).join('')}</ul>`;
}

function makeConceptCard(color, label, title, desc) {
  return `<div class="concept-card ${color}"><div class="card-label">${escHtml(label)}</div>${title ? `<div class="card-title">${escHtml(title)}</div>` : ''}<div class="card-desc">${escHtml(desc)}</div></div>`;
}

function makeCallout(type, title, text) {
  return `<div class="callout-box ${type}"><div class="callout-title">${escHtml(title)}</div><div class="callout-text">${escHtml(text)}</div></div>`;
}

function makeDataGrid(items) {
  return `<div class="data-grid">${items.map(i => `<div class="data-item ${i.type || 'info'}"><div class="item-icon">${i.icon}</div><div class="item-value">${escHtml(i.value || '')}</div><div class="item-label">${escHtml(i.label)}</div></div>`).join('')}</div>`;
}

function makeCompareGrid(beforeLabel, before, afterLabel, after) {
  return `<div class="compare-grid">
    <div class="compare-item before"><div class="compare-label">${escHtml(beforeLabel)}</div><div class="compare-text">${escHtml(before)}</div></div>
    <div class="compare-item after"><div class="compare-label">${escHtml(afterLabel)}</div><div class="compare-text">${escHtml(after)}</div></div>
  </div>`;
}

function makeStepFlow(steps) {
  return `<div class="step-flow">${steps.map((s, i) => `<div class="step-item"><div class="step-num">${i + 1}</div><div class="step-text">${escHtml(s)}</div></div>`).join('')}</div>`;
}

function makeStatRow(stats) {
  return `<div class="stat-row">${stats.map(s => `<div class="stat-item"><div class="stat-value">${escHtml(s.value)}</div><div class="stat-label">${escHtml(s.label)}</div></div>`).join('')}</div>`;
}

function makeQuoteBlock(quote, attr) {
  return `<div class="quote-block">\u201c${escHtml(quote)}\u201d</div>${attr ? `<div class="quote-attr">\u2014 ${escHtml(attr)}</div>` : ''}`;
}

// ── Content-aware slide builder ────────────────────────────
function buildContentSlides(post, gridPost, tweets, totalSlides, allContentPoints) {
  const slides = [];
  const type = post.type;
  const patterns = detectPatterns(tweets, post.instagram?.caption);
  const slideStructure = gridPost?.slideStructure || [];

  // Distribute pooled content points evenly across content slides — every slide gets unique content
  const numContentSlides = totalSlides - 2;
  const ptsPerSlide = Math.max(1, Math.ceil(allContentPoints.length / numContentSlides));
  const usedTitles = new Set();
  const usedBodyKeys = new Set();

  for (let i = 0; i < numContentSlides; i++) {
    const slideNum = i + 2;
    const structure = slideStructure[i + 1] || '';
    // Each slide gets its own unique slice of content points — no duplicates
    const sliceStart = i * ptsPerSlide;
    let slidePoints = allContentPoints.slice(sliceStart, sliceStart + ptsPerSlide);
    // If pool exhausted, skip this slide entirely to avoid duplicate content
    if (slidePoints.length === 0) break;
    const lines = slidePoints;
    const mainPoints = slidePoints;

    let subtitle = '';
    let title = '';
    let bodyHtml = '';

    // Parse structure hint — deduplicate titles from slide structures
    const structParts = structure.split(':');
    const structLabel = structParts[0]?.trim() || '';
    let structContent = structParts.slice(1).join(':')?.trim() || '';
    // If this structContent title was already used, clear it so we fall back to unique key point
    if (structContent && usedTitles.has(structContent.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim())) {
      structContent = '';
    }

    if (type === 'Education') {
      subtitle = structLabel || ['The Concept', 'Why It Matters', 'How It Works', 'The Application', 'Key Insight', 'The Framework'][i] || 'Deep Dive';
      title = smartTruncate(structContent?.replace(/^[""]|[""]$/g, ''), 60) || smartTruncate(lines[0], 60);

      if (i === 0 && mainPoints.length >= 2) {
        bodyHtml = makeConceptCard('blue', 'Key Concept', '', mainPoints.slice(0, 2).join(' '));
        if (mainPoints.length > 2) bodyHtml += makeConceptCard('gold', 'Why It Matters', '', mainPoints.slice(2, 4).join(' '));
      } else if (mainPoints.length >= 3 && (patterns.hasList || i > 0)) {
        bodyHtml = makeArrowList(mainPoints.slice(0, 5));
      } else if (patterns.hasWarning && i >= totalSlides - 4) {
        bodyHtml = makeCallout('warning', 'Important', mainPoints.join(' '));
      } else if (mainPoints.length >= 2) {
        bodyHtml = mainPoints.slice(0, 2).map((p, j) =>
          makeConceptCard(j % 2 === 0 ? 'blue' : 'gold', '', '', p)
        ).join('');
      } else {
        bodyHtml = `<p class="slide-body">${escHtml(mainPoints[0] || lines.join(' '))}</p>`;
      }
    } else if (type === 'Product') {
      subtitle = structLabel || ['The Challenge', 'The Solution', 'Key Feature', 'How It Works', 'See the Difference'][i] || 'Feature';
      title = smartTruncate(structContent, 60) || smartTruncate(lines[0], 60);

      if (i === 0) {
        bodyHtml = makeCallout('warning', 'The Challenge', mainPoints.slice(0, 2).join(' '));
      } else if (i === 1 && patterns.hasIndicator) {
        const indicatorName = (mainPoints.join(' ').match(/pentarch|volume oracle|janus atlas|plutus flow|harmonic oscillator|augury grid|omnideck/i) || [''])[0];
        bodyHtml = `<div class="indicator-pill">${escHtml(indicatorName.toUpperCase())}</div><p class="slide-body">${escHtml(mainPoints.slice(0, 2).join(' '))}</p>`;
      } else if (i === 2 && patterns.hasComparison) {
        bodyHtml = makeCompareGrid('Without', mainPoints[0] || 'Standard approach', 'With SignalPilot', mainPoints[1] || 'Clear signals');
      } else if (mainPoints.length >= 3) {
        bodyHtml = makeArrowList(mainPoints.slice(0, 4));
      } else {
        bodyHtml = mainPoints.length >= 2
          ? makeConceptCard('gold', 'Feature', '', mainPoints.join(' '))
          : `<p class="slide-body">${escHtml(mainPoints[0] || lines.join(' '))}</p>`;
      }
    } else if (type === 'Blog') {
      subtitle = structLabel || ['The Reality', 'The Pattern', 'Why This Happens', 'The Fix', 'Key Takeaway'][i] || 'Insight';
      title = smartTruncate(structContent, 60) || smartTruncate(lines[0], 60);

      if (i === 0) {
        bodyHtml = makeCallout('insight', 'Consider This', mainPoints.slice(0, 2).join(' '));
      } else if (mainPoints.length >= 3) {
        bodyHtml = makeArrowList(mainPoints.slice(0, 5));
      } else if (patterns.hasWarning && i >= 2) {
        bodyHtml = makeCallout('warning', 'Watch Out', mainPoints.join(' '));
      } else if (i === totalSlides - 3) {
        bodyHtml = makeCallout('success', 'Key Takeaway', mainPoints.join(' '));
      } else {
        bodyHtml = `<p class="slide-body">${escHtml(mainPoints.join(' '))}</p>`;
      }
    } else if (type === 'Chronicle') {
      subtitle = structLabel || ['The Story', 'The Philosophy', 'The Method', 'The Wisdom', 'The Lesson'][i] || 'Chapter';
      title = smartTruncate(structContent, 60) || smartTruncate(lines[0], 60);

      if (patterns.hasIndicator && i >= totalSlides - 4) {
        const indicatorName = (tweets.join(' ').match(/pentarch|volume oracle|janus atlas|plutus flow|harmonic oscillator|augury grid|omnideck/i) || [''])[0];
        bodyHtml = `<div class="indicator-pill">${escHtml(indicatorName.toUpperCase())}</div><p class="slide-body">${escHtml(mainPoints.join(' '))}</p>`;
      } else if (mainPoints.length > 1) {
        bodyHtml = makeConceptCard('gold', 'Chronicle', '', mainPoints.join(' '));
      } else {
        bodyHtml = `<p class="slide-body" style="font-style:italic;">${escHtml(mainPoints[0] || lines.join(' '))}</p>`;
      }
    } else if (type === 'Docs') {
      subtitle = structLabel || ['Overview', 'Configuration', 'Key Settings', 'Best Practices', 'Reference'][i] || 'Documentation';
      title = smartTruncate(structContent, 60) || smartTruncate(lines[0], 60);

      if (mainPoints.length >= 3) {
        bodyHtml = mainPoints.slice(0, 3).map((p, j) =>
          makeConceptCard(['blue', 'green', 'gold'][j % 3], '', '', p)
        ).join('');
      } else {
        bodyHtml = makeCallout('info', 'Reference', mainPoints.join(' '));
      }
    } else if (type === 'Marketing') {
      subtitle = structLabel || '';
      title = smartTruncate(structContent, 60) || smartTruncate(lines[0], 60);

      if (i === 0) {
        bodyHtml = makeStatRow([
          { value: '7', label: 'Indicators' },
          { value: '82', label: 'Free Lessons' },
          { value: '0', label: 'Repainting' }
        ]);
      } else if (mainPoints.length >= 3) {
        bodyHtml = makeArrowList(mainPoints.slice(0, 5));
      } else {
        bodyHtml = `<p class="slide-body">${escHtml(mainPoints.join(' '))}</p>`;
      }
    } else if (type === 'Quote') {
      subtitle = ['', 'The Context', 'The Insight', 'Why It Matters', 'The Application'][i] || '';
      title = '';
      if (i === Math.floor((totalSlides - 2) / 2)) {
        const quoteLine = allContentPoints.find(l => /[""\u201c\u201d]/.test(l)) || lines[0] || '';
        bodyHtml = makeQuoteBlock(quoteLine.replace(/[""\u201c\u201d]/g, ''), 'Signal Pilot');
      } else {
        bodyHtml = `<p class="slide-body">${escHtml(mainPoints.join(' '))}</p>`;
      }
    }

    // Track used titles to prevent duplicates across slides
    if (title) usedTitles.add(title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim());

    slides.push(generateContentSlide(slideNum, totalSlides, subtitle, title, bodyHtml));
  }

  return slides;
}

// ── Get CTA info per type ──────────────────────────────────
function getCTAInfo(post) {
  const source = post.source || '';
  const ctaMap = {
    'Education': { icon: '\uD83D\uDCDA', title: 'Continue Learning', desc: 'Free education from beginner to professional.', text: 'Start Learning' },
    'Product': { icon: '\uD83D\uDD17', title: 'Try It Free', desc: 'Non-repainting indicators on TradingView.', text: 'Get Access' },
    'Blog': { icon: '\uD83D\uDCD6', title: 'Read the Full Article', desc: 'Deep dive into this topic.', text: 'Read Article' },
    'Quote': { icon: '\u2728', title: 'Follow for More', desc: 'Daily trading wisdom and insights.', text: 'Follow SignalPilot' },
    'Marketing': { icon: '\uD83D\uDE80', title: 'Get Started', desc: '7 indicators. 82 free lessons. Education first.', text: 'Visit SignalPilot' },
    'Chronicle': { icon: '\uD83D\uDCDC', title: 'Enter the Chronicle', desc: 'Discover the stories of the Elite Seven.', text: 'Read the Chronicle' },
    'Docs': { icon: '\uD83D\uDCCB', title: 'Full Documentation', desc: 'Complete reference and settings guide.', text: 'Read the Docs' },
  };
  const cta = ctaMap[post.type] || ctaMap['Education'];
  return { ...cta, url: source };
}

// ── Extract hook title from content ────────────────────────
function getHookTitle(post, gridPost, tweets) {
  if (gridPost?.slideStructure?.[0]) {
    const first = gridPost.slideStructure[0];
    const hookContent = first.split(':').slice(1).join(':').trim().replace(/^[""\u201c\u201d]|[""\u201c\u201d]$/g, '');
    if (hookContent && hookContent.length > 3 && hookContent.length < 60) return hookContent;
  }
  if (tweets[0]) {
    const firstLine = tweets[0].split('\n')[0].replace(/\uD83E\uDDF5$/, '').trim();
    if (firstLine.length > 3 && firstLine.length < 60) return firstLine;
  }
  const title = (post.title || '').replace(/^[\uD83C-\uDBFF][\uDC00-\uDFFF]*\s*/, '').replace(/\(.*\)$/, '').trim();
  return smartTruncate(title, 55);
}

function getHookSubtitle(post, tweets) {
  if (tweets[0]) {
    const lines = tweets[0].split('\n').filter(l => l.trim());
    if (lines.length > 1) return smartTruncate(lines[1], 80);
  }
  const cap = post.instagram?.caption;
  if (cap) {
    const lines = cap.split('\n').filter(l => l.trim());
    if (lines.length > 1) return smartTruncate(lines[1], 80);
  }
  return '';
}

// ── Main HTML assembly ─────────────────────────────────────
function generateCarouselHTML(post, gridPost) {
  const postNum = post.postNumber;
  const padded = String(postNum).padStart(3, '0');
  const color = getColumnColor(post);
  const label = TYPE_TO_LABEL[post.type] || 'LEARN';
  const tweets = parseTwitterContent(post);
  // Pool ALL unique key points from the post content (all sources)
  const contentTweets = tweets.length > 2 ? tweets.slice(1, -1) : tweets.slice(0);
  const allContentPoints = [];
  const seenPts = new Set();
  for (const t of contentTweets) {
    for (const p of extractKeyPoints(t)) {
      const key = p.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
      if (key.length > 3 && !seenPts.has(key)) { seenPts.add(key); allContentPoints.push(p); }
    }
  }
  if (post.instagram?.caption) {
    for (const p of extractKeyPoints(post.instagram.caption)) {
      const key = p.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
      if (key.length > 3 && !seenPts.has(key)) { seenPts.add(key); allContentPoints.push(p); }
    }
  }
  const totalSlides = gridPost?.slideCount || (post.type === 'Quote' || post.type === 'Marketing' ? 5 : 6);
  const slideCount = Math.max(4, Math.min(10, totalSlides));

  const hookTitle = getHookTitle(post, gridPost, tweets);
  const hookSub = getHookSubtitle(post, tweets);
  const ctaInfo = getCTAInfo(post);

  const hookSlide = generateHookSlide(hookTitle, hookSub, label);
  const contentSlides = buildContentSlides(post, gridPost, tweets, slideCount, allContentPoints);
  const ctaSlide = generateCTASlide(slideCount, slideCount, ctaInfo.icon, ctaInfo.title, ctaInfo.desc, ctaInfo.url, ctaInfo.text);

  const allSlides = [hookSlide, ...contentSlides, ctaSlide].join('\n');
  const cleanTitle = (post.title || '').replace(/^[\uD83C-\uDBFF][\uDC00-\uDFFF]*\s*/, '').trim();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Post ${padded} \u2014 ${escHtml(cleanTitle)} | Carousel Preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    ${getBaseCSS()}
    ${getHookCSS(color)}
  </style>
</head>
<body>
  <div class="controls">
    <label><input type="checkbox" id="bgToggle" checked> Background</label>
    <label>Opacity <input type="range" id="opacitySlider" min="0" max="30" value="8"></label>
    <button onclick="toggleExportMode()">Export Mode</button>
  </div>

  <div class="page-title">
    <h1>Post ${padded} \u2014 ${escHtml(cleanTitle)}</h1>
    <p>${escHtml(post.type)} Carousel \u2014 ${slideCount} Slides</p>
  </div>

  <div class="carousel-grid">
${allSlides}
  </div>

  <div class="export-nav">
    <button onclick="prevSlide()">\u2190 Previous</button>
    <span class="slide-indicator"><span id="currentSlide">1</span> / ${slideCount}</span>
    <button onclick="nextSlide()">Next \u2192</button>
  </div>

  <script>
    const bgToggle = document.getElementById('bgToggle');
    const opacitySlider = document.getElementById('opacitySlider');
    const videos = document.querySelectorAll('.bg-video');
    const slides = document.querySelectorAll('.slide-wrapper');
    let currentSlide = 0;
    let exportMode = false;
    bgToggle.addEventListener('change', (e) => { videos.forEach(v => v.style.display = e.target.checked ? 'block' : 'none'); });
    opacitySlider.addEventListener('input', (e) => { document.documentElement.style.setProperty('--video-opacity', e.target.value / 100); });
    function toggleExportMode() { exportMode = !exportMode; document.body.classList.toggle('export-mode', exportMode); if (exportMode) { currentSlide = 0; updateExportView(); } }
    function updateExportView() { slides.forEach((s, i) => s.classList.toggle('active', i === currentSlide)); document.getElementById('currentSlide').textContent = currentSlide + 1; }
    function nextSlide() { currentSlide = (currentSlide + 1) % slides.length; updateExportView(); }
    function prevSlide() { currentSlide = (currentSlide - 1 + slides.length) % slides.length; updateExportView(); }
    document.addEventListener('keydown', (e) => { if (!exportMode) return; if (e.key === 'ArrowRight') nextSlide(); if (e.key === 'ArrowLeft') prevSlide(); if (e.key === 'Escape') toggleExportMode(); });
  </script>
</body>
</html>`;
}

// ── Utility ────────────────────────────────────────────────
function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Detect hand-crafted carousels (should NOT be overwritten) ──
const HANDCRAFTED_MARKERS = [
  'combo-box', 'signal-grid', 'divergence-box', 'flow-card', 'cheat-row',
  'metric-card', 'phase-card', 'cycle-card', 'scenario-box', 'rule-card',
  'formula-box', 'example-block', 'result-box', 'definition-box', 'view-box',
  'philosophy-box', 'method-list', 'alignment-grid', 'indicator-badge', 'behavior-grid',
  'found-box', 'ignored-box', 'fix-box', 'combo-arrows'
];

function isHandcraftedCarousel(postNum) {
  const dir = `INSTAGRAM_CONTENT_HUB/social/post-${String(postNum).padStart(3,'0')}`;
  const htmlPath = path.join(dir, 'carousel.html');
  if (!fs.existsSync(htmlPath)) return false;
  const html = fs.readFileSync(htmlPath, 'utf8');
  return HANDCRAFTED_MARKERS.some(m => html.includes(m));
}

// ── Main ───────────────────────────────────────────────────
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const forceAll = args.includes('--force');
  const onlyPost = args.find(a => a.startsWith('--post='));
  const singlePost = onlyPost ? parseInt(onlyPost.split('=')[1]) : null;

  let rebuilt = 0;
  let skipped = 0;
  let errors = 0;

  const postsToProcess = singlePost !== null
    ? contentQueue.filter(p => p.postNumber === singlePost)
    : forceAll
    ? contentQueue.filter(p => !isHandcraftedCarousel(p.postNumber))
    : contentQueue.filter(p => isBadCarousel(p.postNumber));

  console.log(`Found ${postsToProcess.length} carousels to rebuild${dryRun ? ' (dry run)' : ''}...`);

  for (const post of postsToProcess) {
    const postNum = post.postNumber;
    const padded = String(postNum).padStart(3, '0');
    const gridPost = gridPosts.find(g => g.postNumber === postNum);
    const dir = `INSTAGRAM_CONTENT_HUB/social/post-${padded}`;

    if (!post.twitter?.tweets || post.twitter.tweets.length === 0) {
      console.log(`  SKIP ${padded}: No Twitter content to build from`);
      skipped++;
      continue;
    }

    try {
      const html = generateCarouselHTML(post, gridPost);
      if (!dryRun) {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'carousel.html'), html);
      }
      rebuilt++;
      if (rebuilt % 50 === 0) console.log(`  ... rebuilt ${rebuilt} so far`);
    } catch (e) {
      console.error(`  ERROR ${padded}: ${e.message}`);
      errors++;
    }
  }

  console.log(`\nDone! Rebuilt: ${rebuilt}, Skipped: ${skipped}, Errors: ${errors}`);
}

main();
