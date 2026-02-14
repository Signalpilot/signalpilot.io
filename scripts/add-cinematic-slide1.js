#!/usr/bin/env node
/**
 * add-cinematic-slide1.js
 *
 * Replaces slide 1 of ALL carousel HTMLs in INSTAGRAM_CONTENT_HUB/social/
 * with cinematic first slide matching the Instagram design:
 * - Label (LEARN/INSIGHT/INDICATOR/etc.)
 * - Title (white, centered)
 * - Divider line (colored)
 * - Subtitle (colored)
 * - SIGNAL PILOT logo (bottom)
 * - Fat colored vertical edge stripe (teal=LEFT, orange=RIGHT, neutral=NONE)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HUB_DIR = path.join(__dirname, '..', 'INSTAGRAM_CONTENT_HUB', 'social');
const COLOR_MAP_PATH = path.join(__dirname, '..', 'INSTAGRAM_CONTENT_HUB', 'post_color_mapping.json');

// ─── TYPE → LABEL MAPPING ──────────────────────────────────────────
// Source of truth: 9GRID header lines (NOT the content plan Type field)
// Colors come directly from post_color_mapping.json

function getLabel(type) {
  const t = (type || '').toLowerCase().trim();
  const labels = {
    edu: 'LEARN',
    education: 'LEARN',
    blog: 'INSIGHT',
    docs: 'REFERENCE',
    quote: 'REFLECT',
    product: 'INDICATOR',
    chronicle: 'CHRONICLE',
    marketing: 'DISCOVER',
    'main site': 'EXPLORE',
    mainsite: 'EXPLORE',
    manifesto: 'ORIGIN',
    vision: 'VISION',
    finale: 'FINALE',
  };
  return labels[t] || 'LEARN';
}

// ─── LOAD 9GRID COLOR MAPPING ───────────────────────────────────────
// Extracted from 9GRID_COMPLETE_PART1.md and PART2.md header lines
// These headers are the DEFINITIVE source for color/type per post

function loadColorMapping() {
  const raw = fs.readFileSync(COLOR_MAP_PATH, 'utf8');
  return JSON.parse(raw);
}

// ─── COLOR DEFINITIONS ──────────────────────────────────────────────

const COLORS = {
  orange: {
    bg: 'linear-gradient(180deg, #0f0c0a 0%, #0a0908 100%)',
    wash: 'rgba(217,148,74,0.08)',
    accent: 'rgba(251, 191, 36, 0.9)',
    accentDim: 'rgba(251, 191, 36, 0.4)',
    divider: 'rgba(251,191,36,0.6)',
    textVar: 'rgba(254, 243, 199, 0.95)',
    subtleVar: 'rgba(251, 191, 36, 0.7)',
    stripe: `
    .slide-1::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 18px;
      height: 100%;
      background: linear-gradient(180deg, rgba(251,191,36,0.9) 0%, rgba(217,148,74,0.7) 100%);
      z-index: 5;
    }`,
  },
  teal: {
    bg: 'linear-gradient(180deg, #0a0c0f 0%, #080a0c 100%)',
    wash: 'rgba(94,234,212,0.06)',
    accent: 'rgba(94, 234, 212, 0.9)',
    accentDim: 'rgba(94, 234, 212, 0.4)',
    divider: 'rgba(94,234,212,0.6)',
    textVar: 'rgba(220, 252, 247, 0.95)',
    subtleVar: 'rgba(94, 234, 212, 0.7)',
    stripe: `
    .slide-1::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 18px;
      height: 100%;
      background: linear-gradient(180deg, rgba(94,234,212,0.9) 0%, rgba(45,180,160,0.7) 100%);
      z-index: 5;
    }`,
  },
  neutral: {
    bg: 'linear-gradient(180deg, #0c0c0c 0%, #080808 100%)',
    wash: 'rgba(255,255,255,0.04)',
    accent: 'rgba(163, 163, 163, 0.9)',
    accentDim: 'rgba(163, 163, 163, 0.4)',
    divider: 'rgba(163,163,163,0.6)',
    textVar: 'rgba(229, 229, 229, 0.95)',
    subtleVar: 'rgba(163, 163, 163, 0.7)',
    stripe: '', // no stripe for neutral
  },
};

// ─── EXTRACT TITLE/SUBTITLE FROM EXISTING SLIDE 1 ──────────────────

function extractFromSlide1(html) {
  let title = '';
  let subtitle = '';

  // Find the first slide content area
  // Try multiple patterns for title extraction
  const titlePatterns = [
    /<div class="hook-main">([\s\S]*?)<\/div>/,
    /<h2[^>]*class="slide-title[^"]*"[^>]*>([\s\S]*?)<\/h2>/,
    /<h1[^>]*class="hero-headline[^"]*"[^>]*>([\s\S]*?)<\/h1>/,
    /<div class="title">([\s\S]*?)<\/div>/,
    /<h2[^>]*>([\s\S]*?)<\/h2>/,
  ];

  const subtitlePatterns = [
    /<p class="hook-sub">([\s\S]*?)<\/p>/,
    /<p class="slide-body">([\s\S]*?)<\/p>/,
    /<p class="hero-subtitle">([\s\S]*?)<\/p>/,
    /<div class="subtitle">([\s\S]*?)<\/div>/,
    /<div class="quote">([\s\S]*?)<\/div>/,
    /<p class="quote">([\s\S]*?)<\/p>/,
  ];

  for (const pat of titlePatterns) {
    const m = html.match(pat);
    if (m) {
      title = m[1].replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#?\w+;/g, '').trim();
      if (title) break;
    }
  }

  for (const pat of subtitlePatterns) {
    const m = html.match(pat);
    if (m) {
      subtitle = m[1].replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#?\w+;/g, '').trim();
      if (subtitle) break;
    }
  }

  return { title, subtitle };
}

// ─── FIND FIRST SLIDE BLOCK ────────────────────────────────────────

function findFirstSlideBlock(html) {
  // Strategy: find carousel-grid, then find the first slide-wrapper inside it
  const gridIdx = html.indexOf('carousel-grid');
  if (gridIdx === -1) return null;

  // Find first <div class="slide-wrapper after carousel-grid
  const swPattern = /<div\s+class="slide-wrapper/;
  const afterGrid = html.substring(gridIdx);
  const swMatch = afterGrid.match(swPattern);
  if (!swMatch) return null;

  const startInAfterGrid = swMatch.index;
  const absoluteStart = gridIdx + startInAfterGrid;

  // Now find the matching closing </div> by counting nested divs
  let depth = 0;
  let i = absoluteStart;
  let foundOpen = false;

  while (i < html.length) {
    if (html.substring(i, i + 4) === '<div') {
      depth++;
      foundOpen = true;
      i += 4;
    } else if (html.substring(i, i + 6) === '</div>') {
      depth--;
      if (foundOpen && depth === 0) {
        return {
          start: absoluteStart,
          end: i + 6,
          content: html.substring(absoluteStart, i + 6),
        };
      }
      i += 6;
    } else {
      i++;
    }
  }

  return null;
}

// ─── BUILD CINEMATIC CSS ────────────────────────────────────────────

function buildCinematicCSS(color) {
  const c = COLORS[color];
  return `
    /* ═══ Slide 1 - Cinematic Hook (${color.toUpperCase()}) ═══ */
    .slide-1 {
      background: ${c.bg} !important;
    }

    .slide-1::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, ${c.wash} 0%, transparent 100%);
      pointer-events: none;
      z-index: 1;
    }
    ${c.stripe}

    .slide-1 .slide-bg,
    .slide-1 .bg-video,
    .slide-1 .video-bg,
    .slide-1 video {
      display: none !important;
    }

    .slide-1 .slide-content {
      align-items: center;
      text-align: center;
      justify-content: center;
      z-index: 3;
    }

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
      color: rgba(255, 255, 255, 0.95);
      margin-bottom: 4%;
      text-transform: none;
      letter-spacing: 0;
    }

    .slide-1 .cine-divider {
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, transparent, ${c.divider}, transparent);
      margin-bottom: 4%;
    }

    .slide-1 .hook-sub {
      font-family: 'Inter', sans-serif;
      font-size: clamp(0.65rem, 2cqw, 1.1rem);
      font-weight: 300;
      letter-spacing: 0.05em;
      color: ${c.accentDim};
      line-height: 1.6;
    }

    .slide-1 .cine-logo {
      position: absolute;
      bottom: 8%;
      left: 50%;
      transform: translateX(-50%);
      font-family: 'Gugi', sans-serif;
      font-size: clamp(0.4rem, 1.2cqw, 0.625rem);
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: ${c.accentDim};
    }`;
}

// ─── BUILD SLIDE 1 HTML ─────────────────────────────────────────────

function buildSlide1HTML(label, title, subtitle) {
  // Escape HTML
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  return `<div class="slide-wrapper" data-slide="1">
      <span class="slide-label">Slide 1 — Cinematic Hook</span>
      <div class="slide slide-1">
        <div class="slide-content">
          <div class="cine-label">${esc(label)}</div>
          <div class="hook-main">${esc(title)}</div>
          <div class="cine-divider"></div>
          <p class="hook-sub">${esc(subtitle)}</p>
          <div class="cine-logo">Signal Pilot</div>
        </div>
      </div>
    </div>`;
}

// ─── INJECT CSS INTO <style> ────────────────────────────────────────

function injectCSS(html, newCSS) {
  // Remove any existing slide-1 cinematic CSS block
  // Look for /* Slide 1 - Cinematic Hook ... */ or /* ═══ Slide 1 ... ═══ */
  html = html.replace(/\/\*[\s]*[═]*[\s]*Slide 1[\s]*-[\s]*Cinematic Hook[^*]*\*\/[\s\S]*?(?=\/\*|<\/style>)/g, '');
  // Also remove old .slide-1 rules that were part of cinematic blocks
  html = html.replace(/\/\*\s*Slide 1\s*-\s*Cinematic Hook\s*\([^)]*\)\s*\*\/[\s\S]*?(?=\/\*\s*(?:Standard|Slide\s*\d|Export|@media)|<\/style>)/g, '');

  // Remove standalone old .slide-1 CSS blocks (for carousels that had different styling)
  // Match .slide-1 { ... } and .slide-1::before { ... } and .slide-1 .slide-content { ... } etc.
  // But be careful not to remove non-slide-1 rules
  const slide1Patterns = [
    /\n?\s*\/\*\s*Slide 1\s*-\s*Hook[^*]*\*\/\s*\n?/g,
    /\n?\s*\.slide-1\s*\{[^}]*\}\s*\n?/g,
    /\n?\s*\.slide-1::before\s*\{[^}]*\}\s*\n?/g,
    /\n?\s*\.slide-1::after\s*\{[^}]*\}\s*\n?/g,
    /\n?\s*\.slide-1\s+\.slide-content\s*\{[^}]*\}\s*\n?/g,
    /\n?\s*\.slide-1\s+\.cine-label\s*\{[^}]*\}\s*\n?/g,
    /\n?\s*\.slide-1\s+\.hook-main\s*\{[^}]*\}\s*\n?/g,
    /\n?\s*\.slide-1\s+\.cine-divider\s*\{[^}]*\}\s*\n?/g,
    /\n?\s*\.slide-1\s+\.hook-sub\s*\{[^}]*\}\s*\n?/g,
    /\n?\s*\.slide-1\s+\.cine-logo\s*\{[^}]*\}\s*\n?/g,
  ];

  for (const pat of slide1Patterns) {
    html = html.replace(pat, '\n');
  }

  // Inject new CSS before </style>
  const styleCloseIdx = html.indexOf('</style>');
  if (styleCloseIdx === -1) {
    console.warn('  [WARN] No </style> found!');
    return html;
  }

  html = html.substring(0, styleCloseIdx) + newCSS + '\n  </style>' + html.substring(styleCloseIdx + 8);

  // Also ensure --cine-text and --cine-subtle vars exist in :root
  // Remove old ones first, then we don't need them since we use direct colors

  return html;
}

// ─── PROCESS SINGLE CAROUSEL ────────────────────────────────────────

function processCarousel(postNum, postInfo) {
  const dir = path.join(HUB_DIR, `post-${postNum}`);
  const filePath = path.join(dir, 'carousel.html');

  if (!fs.existsSync(filePath)) {
    console.log(`  [SKIP] ${postNum} — no carousel.html`);
    return false;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  const color = postInfo.color; // directly from 9GRID mapping
  const label = getLabel(postInfo.type);

  // Extract title/subtitle from existing slide 1
  const firstSlide = findFirstSlideBlock(html);
  if (!firstSlide) {
    console.log(`  [WARN] ${postNum} — couldn't find first slide block`);
    return false;
  }

  let { title, subtitle } = extractFromSlide1(firstSlide.content);

  // Fallback to content plan title if extraction failed
  if (!title || title.length < 2) {
    title = postInfo.title || `Post ${postNum}`;
  }
  if (!subtitle || subtitle.length < 2) {
    subtitle = '';
  }

  // Clean up title - remove emoji prefixes, replacement chars, type prefixes
  title = title
    .replace(/^[\u{FFFD}\u{1F4DA}\u{1F4DD}\u{1F393}\u{1F6E0}\u{1F4AC}\u{1F310}\u{1F52E}\u{1F3C6}\u{2696}\u{FE0F}\u{1F535}\u{1F7E0}\u{26AA}\u{1F7E2}\u{1F534}]+\s*/gu, '')
    .replace(/^(DOCS|BLOG|EDU|QUOTE|PRODUCT|CHRONICLE|MARKETING)\s*:\s*/i, '')
    .trim();

  // Build new slide 1 HTML
  const newSlide1 = buildSlide1HTML(label, title, subtitle);

  // Replace the first slide block
  html = html.substring(0, firstSlide.start) + newSlide1 + html.substring(firstSlide.end);

  // Build and inject cinematic CSS
  const cinematicCSS = buildCinematicCSS(color);
  html = injectCSS(html, cinematicCSS);

  fs.writeFileSync(filePath, html, 'utf8');
  return true;
}

// ─── MAIN ───────────────────────────────────────────────────────────

function main() {
  console.log('Loading 9GRID color mapping (source of truth)...');
  const postMapping = loadColorMapping();
  console.log(`Found ${Object.keys(postMapping).length} posts in 9GRID mapping\n`);

  // Get all post directories
  const postDirs = fs.readdirSync(HUB_DIR)
    .filter(d => /^post-\d{3}$/.test(d))
    .sort();

  console.log(`Found ${postDirs.length} post directories in INSTAGRAM_CONTENT_HUB/social/\n`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;
  const colorCounts = { orange: 0, teal: 0, neutral: 0 };

  for (const dir of postDirs) {
    const postNum = dir.replace('post-', '');
    let postInfo = postMapping[postNum];

    if (!postInfo) {
      // Fallback: use 9-grid cycle (N%9) to determine color
      const num = parseInt(postNum, 10);
      const pos = num % 9 || 9; // 1-9 cycle
      // 9-grid: 1=Teal/Blog, 2=Neutral/EDU, 3=Orange/Quote,
      //         4=Teal/Chronicle, 5=Neutral/EDU, 6=Orange/Product,
      //         7=Teal/Docs, 8=Neutral/EDU, 9=Orange/Marketing
      const cycleMap = {
        1: { color: 'teal', type: 'Blog' },
        2: { color: 'neutral', type: 'EDU' },
        3: { color: 'orange', type: 'Quote' },
        4: { color: 'teal', type: 'Chronicle' },
        5: { color: 'neutral', type: 'EDU' },
        6: { color: 'orange', type: 'Product' },
        7: { color: 'teal', type: 'Docs' },
        8: { color: 'neutral', type: 'EDU' },
        9: { color: 'orange', type: 'Marketing' },
      };
      postInfo = { ...cycleMap[pos], title: '' };
      console.log(`  [FALLBACK] ${postNum} — not in 9GRID mapping, using cycle: ${postInfo.color}/${postInfo.type}`);
    }

    try {
      const ok = processCarousel(postNum, postInfo);
      if (ok) {
        processed++;
        colorCounts[postInfo.color]++;
      } else {
        skipped++;
      }
    } catch (err) {
      console.error(`  [ERROR] ${postNum}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n════════════════════════════════════════`);
  console.log(`Done!`);
  console.log(`  Processed: ${processed}`);
  console.log(`  Skipped:   ${skipped}`);
  console.log(`  Errors:    ${errors}`);
  console.log(`  Orange:    ${colorCounts.orange}`);
  console.log(`  Teal:      ${colorCounts.teal}`);
  console.log(`  Neutral:   ${colorCounts.neutral}`);
  console.log(`════════════════════════════════════════`);
}

main();
