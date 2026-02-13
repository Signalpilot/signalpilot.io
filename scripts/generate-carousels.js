#!/usr/bin/env node

// Generate missing carousel.html files from content plan text
// Uses the same design template as existing carousels (CSS, JS, export mode)
// Maps content plan tweets/captions to 10-slide carousel structure
//
// Usage: node scripts/generate-carousels.js [--dry-run] [--start N] [--end N]

import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseAllContent } from '../lib/social/content-parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOCIAL_DIR = join(ROOT, 'INSTAGRAM_CONTENT_HUB', 'social');
const CONTENT_PLAN_DIR = join(ROOT, 'content-plan');

// --- Color Schemes (matching existing carousel variants) ---

const COLOR_SCHEMES = {
  neutral: {
    name: 'NEUTRAL',
    cineLabel: 'rgba(163, 163, 163, 0.9)',
    cineText: 'rgba(229, 229, 229, 0.9)',
    cineSubtle: 'rgba(163, 163, 163, 0.7)',
    cineLogo: 'rgba(163,163,163,0.4)',
    cineDivider: 'rgba(163,163,163,0.6)',
    slideBg: 'linear-gradient(180deg, #0c0c0c 0%, #080808 100%)',
    slideBefore: 'rgba(255,255,255,0.08)',
  },
  teal: {
    name: 'TEAL',
    cineLabel: 'rgba(94, 234, 212, 0.9)',
    cineText: 'rgba(204, 251, 241, 0.95)',
    cineSubtle: 'rgba(94, 234, 212, 0.7)',
    cineLogo: 'rgba(94,234,212,0.4)',
    cineDivider: 'rgba(94,234,212,0.6)',
    slideBg: 'linear-gradient(180deg, #0a0f0e 0%, #080a09 100%)',
    slideBefore: 'rgba(20,184,166,0.08)',
  },
  orange: {
    name: 'ORANGE',
    cineLabel: 'rgba(251, 191, 36, 0.9)',
    cineText: 'rgba(254, 243, 199, 0.95)',
    cineSubtle: 'rgba(251, 191, 36, 0.7)',
    cineLogo: 'rgba(251,191,36,0.4)',
    cineDivider: 'rgba(251,191,36,0.6)',
    slideBg: 'linear-gradient(180deg, #0f0c0a 0%, #0a0908 100%)',
    slideBefore: 'rgba(217,148,74,0.08)',
  },
};

function getColorScheme(postNumber) {
  const mod = postNumber % 3;
  if (mod === 0) return COLOR_SCHEMES.orange;
  if (mod === 1) return COLOR_SCHEMES.neutral;
  return COLOR_SCHEMES.teal;
}

// --- Content-to-Slides Mapping ---

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function splitIntoChunks(text, maxChunks) {
  // Split by double newlines (paragraphs)
  let chunks = text.split(/\n\n+/).map(c => c.trim()).filter(c => c.length > 0);

  if (chunks.length <= maxChunks) return chunks;

  // Merge smallest adjacent chunks to fit maxChunks
  while (chunks.length > maxChunks) {
    let minLen = Infinity;
    let minIdx = 0;
    for (let i = 0; i < chunks.length - 1; i++) {
      const combined = chunks[i].length + chunks[i + 1].length;
      if (combined < minLen) {
        minLen = combined;
        minIdx = i;
      }
    }
    chunks[minIdx] = chunks[minIdx] + '\n\n' + chunks[minIdx + 1];
    chunks.splice(minIdx + 1, 1);
  }

  return chunks;
}

function textToHtml(text) {
  // Convert plain text to slide HTML with formatting
  let html = escapeHtml(text);

  // Convert lines starting with numbers to step list
  if (/^\d+\.\s/m.test(text)) {
    const lines = text.split('\n').filter(l => l.trim());
    const listItems = lines.map(line => {
      const numMatch = line.match(/^(\d+)\.\s*(.+)/);
      if (numMatch) {
        return `<li><span class="num">${escapeHtml(numMatch[1])}.</span> ${escapeHtml(numMatch[2])}</li>`;
      }
      return `<li>${escapeHtml(line)}</li>`;
    });
    return `<ol class="step-list">${listItems.join('\n')}</ol>`;
  }

  // Convert lines starting with arrows/bullets to arrow list
  if (/^[→•✓✗▸►-]\s/m.test(text)) {
    const lines = text.split('\n').filter(l => l.trim());
    const listItems = lines.map(line => {
      const cleaned = line.replace(/^[→•✓✗▸►-]\s*/, '');
      return `<li><span class="arrow">&rarr;</span> ${escapeHtml(cleaned)}</li>`;
    });
    return `<ul class="arrow-list">${listItems.join('\n')}</ul>`;
  }

  // Regular paragraph text with line breaks
  html = html.replace(/\n/g, '<br>\n');
  return `<p class="text">${html}</p>`;
}

function extractHookFromContent(post) {
  const title = post.title || '';
  // Try to extract a short hook subtitle from the first tweet or caption
  let subtitle = '';
  if (post.twitter.tweets.length > 0) {
    const firstLine = post.twitter.tweets[0].split('\n')[0];
    if (firstLine.length < 80) {
      subtitle = firstLine;
    } else {
      subtitle = firstLine.substring(0, 75) + '...';
    }
  } else if (post.instagram.caption) {
    const firstLine = post.instagram.caption.split('\n')[0];
    if (firstLine.length < 80) {
      subtitle = firstLine;
    } else {
      subtitle = firstLine.substring(0, 75) + '...';
    }
  }
  return { title: title.replace(/[""\u201C\u201D]/g, ''), subtitle };
}

function extractQuoteFromContent(post) {
  // Look for a quotable line — something short and impactful
  const allText = post.twitter.tweets.join('\n') + '\n' + (post.instagram.caption || '');
  const lines = allText.split('\n').filter(l => l.trim().length > 10 && l.trim().length < 120);

  // Prefer lines that look like quotes (short, impactful)
  const quoteCandidates = lines.filter(l => {
    const t = l.trim();
    return !t.startsWith('#') && !t.startsWith('http') && !t.startsWith('@')
      && !t.match(/^\d+\./) && !t.startsWith('→') && !t.startsWith('•');
  });

  if (quoteCandidates.length > 0) {
    // Pick one from the middle-to-end (usually more insightful)
    const idx = Math.min(Math.floor(quoteCandidates.length * 0.7), quoteCandidates.length - 1);
    return quoteCandidates[idx].trim();
  }

  return post.title || 'Knowledge is the edge.';
}

function mapContentToSlides(post) {
  const { title, subtitle } = extractHookFromContent(post);
  const quote = extractQuoteFromContent(post);

  // Get main content text
  let contentText = '';
  if (post.twitter.tweets.length > 0) {
    contentText = post.twitter.tweets.join('\n\n');
  } else if (post.instagram.caption) {
    // Strip hashtags from caption for slide content
    contentText = post.instagram.caption.replace(/#\w+\s*/g, '').trim();
  }

  // Split into 6 chunks for slides 2-7
  const chunks = splitIntoChunks(contentText, 6);

  // Slide headers based on post type
  const headers = getSlideHeaders(post.type);

  const slides = [];

  // Slide 1: Hook
  slides.push({ type: 'hook', title, subtitle });

  // Slides 2-7: Content
  for (let i = 0; i < 6; i++) {
    const text = chunks[i] || '';
    const header = headers[i] || '';
    if (text) {
      slides.push({ type: 'content', header, text });
    } else {
      // If we run out of content, create a minimal slide
      slides.push({ type: 'content', header: header || 'Key Insight', text: quote });
    }
  }

  // Slide 8: Quote
  slides.push({ type: 'quote', text: quote });

  // Slide 9: Learn More
  slides.push({
    type: 'learn',
    header: 'Free Resources',
    items: getLearnMoreItems(post.type, post.pillar),
  });

  // Slide 10: CTA
  slides.push({
    type: 'cta',
    text: getCTAText(post.type, post.cta),
    button: getCTAButton(post.type),
  });

  return slides;
}

function getSlideHeaders(type) {
  switch (type) {
    case 'Education':
      return ['The Problem', 'The Pattern', 'Why This Happens', 'The Example', 'The Truth', 'The Solution'];
    case 'Quote':
      return ['The Context', 'The Insight', 'Why It Matters', 'The Application', 'The Shift', 'The Practice'];
    case 'Product':
      return ['The Challenge', 'The Tool', 'How It Works', 'Key Features', 'The Difference', 'Get Started'];
    case 'Marketing':
      return ['The Opportunity', 'What We Built', 'Why It Matters', 'The Details', 'The Results', 'Join Us'];
    case 'Chronicle':
      return ['The Story', 'The Origin', 'The Journey', 'The Challenge', 'The Breakthrough', 'The Vision'];
    case 'Blog':
      return ['The Topic', 'The Core Idea', 'The Deep Dive', 'The Evidence', 'The Takeaway', 'Read More'];
    case 'Docs':
      return ['The Guide', 'Step by Step', 'The Setup', 'Configuration', 'Pro Tips', 'Next Steps'];
    default:
      return ['The Problem', 'The Pattern', 'Why This Happens', 'The Example', 'The Truth', 'The Solution'];
  }
}

function getLearnMoreItems(type, pillar) {
  if (type === 'Education' || type === 'Docs') {
    return ['82 free Education Hub lessons', 'Step-by-step breakdowns', 'Real chart examples'];
  }
  if (type === 'Product') {
    return ['7 professional indicators', 'Non-repainting signals', '7-day money-back guarantee'];
  }
  if (type === 'Quote' || type === 'Chronicle') {
    return ['Trading psychology insights', 'Mindset frameworks', 'Community discussions'];
  }
  return ['Free education resources', 'Professional trading tools', 'Join the community'];
}

function getCTAText(type, cta) {
  if (cta && cta.length < 50) return cta;
  if (type === 'Education' || type === 'Docs') return 'Start Learning Free';
  if (type === 'Product') return 'Try the Indicators';
  if (type === 'Quote') return 'More Trading Insights';
  return 'Learn More';
}

function getCTAButton(type) {
  if (type === 'Education' || type === 'Docs') return 'Education Hub';
  if (type === 'Product') return 'View Indicators';
  return 'Visit SignalPilot';
}

// --- HTML Template Generation ---

function generateCarouselHtml(post, slides, colorScheme) {
  const paddedNum = String(post.postNumber).padStart(3, '0');
  const cs = colorScheme;

  const slideHtmlParts = slides.map((slide, i) => {
    const slideNum = i + 1;
    const wrapperStart = `    <div class="slide-wrapper" data-slide="${slideNum}">`;
    const wrapperEnd = `    </div>`;

    if (slide.type === 'hook') {
      // Slide 1: Cinematic hook
      const labelCategory = post.type === 'Education' ? 'Learn' :
        post.type === 'Product' ? 'Discover' :
        post.type === 'Quote' ? 'Reflect' :
        post.type === 'Chronicle' ? 'Story' : 'Explore';

      return `${wrapperStart}
      <span class="slide-label">Slide ${slideNum} — Cinematic Hook</span>
      <div class="slide slide-1">
        <div class="slide-content">
          <div class="cine-label">${escapeHtml(labelCategory)}</div>
          <div class="hook-main">${escapeHtml(slide.title)}</div>
          <div class="cine-divider"></div>
          <p class="hook-sub">${escapeHtml(slide.subtitle)}</p>
          <div class="cine-logo">SignalPilot</div>
        </div>
      </div>
${wrapperEnd}`;
    }

    if (slide.type === 'quote') {
      return `${wrapperStart}
      <span class="slide-label">Slide ${slideNum} — The Insight</span>
      <div class="slide slide-${slideNum} quote-slide">
        <div class="slide-bg">
          <video autoplay loop muted playsinline>
            <source src="../../videos/starfield-bg.mp4" type="video/mp4">
          </video>
        </div>
        <div class="slide-content">
          <p class="quote">"${escapeHtml(slide.text)}"</p>
        </div>
      </div>
${wrapperEnd}`;
    }

    if (slide.type === 'learn') {
      const items = slide.items.map(item =>
        `            <span class="blue">&rarr;</span> ${escapeHtml(item)}<br><br>`
      ).join('\n');

      return `${wrapperStart}
      <span class="slide-label">Slide ${slideNum} — Learn More</span>
      <div class="slide slide-${slideNum}">
        <div class="slide-bg">
          <video autoplay loop muted playsinline>
            <source src="../../videos/starfield-bg.mp4" type="video/mp4">
          </video>
        </div>
        <div class="slide-content">
          <p class="header">${escapeHtml(slide.header)}</p>
          <p class="text">
${items}
          </p>
        </div>
      </div>
${wrapperEnd}`;
    }

    if (slide.type === 'cta') {
      return `${wrapperStart}
      <span class="slide-label">Slide ${slideNum} — CTA</span>
      <div class="slide slide-10">
        <div class="slide-bg">
          <video autoplay loop muted playsinline>
            <source src="../../videos/starfield-bg.mp4" type="video/mp4">
          </video>
        </div>
        <div class="slide-content">
          <p class="cta-text">${escapeHtml(slide.text)}</p>
          <a href="#" class="cta-button">${escapeHtml(slide.button)}</a>
          <img src="../../signalpilot-logo.svg" alt="Signal Pilot" class="logo">
          <p class="link-hint">Link in bio</p>
        </div>
      </div>
${wrapperEnd}`;
    }

    // Content slide (slides 2-7)
    const contentHtml = textToHtml(slide.text);
    return `${wrapperStart}
      <span class="slide-label">Slide ${slideNum} — ${escapeHtml(slide.header)}</span>
      <div class="slide slide-${slideNum}">
        <div class="slide-bg">
          <video autoplay loop muted playsinline>
            <source src="../../videos/starfield-bg.mp4" type="video/mp4">
          </video>
        </div>
        <div class="slide-content">
          <p class="header">${escapeHtml(slide.header)}</p>
          ${contentHtml}
        </div>
      </div>
${wrapperEnd}`;
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Post ${paddedNum} — ${escapeHtml(post.title)} | Carousel Preview</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg-dark: #0a0a0f;
      --accent-blue: #4a90d9;
      --accent-gold: #c9a962;
      --accent-red: #d94a4a;
      --text-primary: #ffffff;
      --text-secondary: rgba(255, 255, 255, 0.85);
      --cine-text: ${cs.cineText};
      --cine-subtle: ${cs.cineSubtle};
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: #111;
      font-family: 'Inter', sans-serif;
      color: var(--text-primary);
      padding: 2rem;
      min-height: 100vh;
    }

    .controls {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
      display: flex;
      gap: 1rem;
      align-items: center;
      background: rgba(0, 0, 0, 0.8);
      padding: 1rem 1.5rem;
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }

    .controls label {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .controls select,
    .controls button {
      background: var(--bg-dark);
      color: var(--text-primary);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-family: inherit;
    }

    .controls button:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .page-title {
      text-align: center;
      margin-bottom: 2rem;
      font-family: 'Cormorant Garamond', serif;
    }

    .page-title h1 {
      font-size: 2rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .page-title p {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .carousel-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
      max-width: 1800px;
      margin: 0 auto;
      padding-bottom: 4rem;
    }

    .slide-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      container-type: inline-size;
    }

    .slide-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent-gold);
      margin-bottom: 0.75rem;
    }

    .slide {
      width: 100%;
      max-width: 540px;
      aspect-ratio: 4 / 5;
      position: relative;
      overflow: hidden;
      background: var(--bg-dark);
      border-radius: 4px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    }

    .slide-bg {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      z-index: 1;
    }

    .slide-bg video {
      width: 100%; height: 100%;
      object-fit: cover;
      opacity: 0.08;
    }

    .slide.bg-black .slide-bg video { opacity: 0; }

    .slide-content {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      z-index: 2;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 10%;
    }

    /* Slide 1 - Cinematic Hook (${cs.name}) */
    .slide-1 {
      background: ${cs.slideBg};
    }

    .slide-1::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, ${cs.slideBefore} 0%, transparent 100%);
      pointer-events: none;
      z-index: 1;
    }

    .slide-1 .slide-content {
      align-items: center;
      text-align: center;
      z-index: 3;
    }

    .slide-1 .cine-label {
      font-family: 'Inter', sans-serif;
      font-size: clamp(0.5rem, 1.6cqw, 0.875rem);
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: ${cs.cineLabel};
      margin-bottom: 8%;
    }

    .slide-1 .hook-main {
      font-family: 'Inter', sans-serif;
      font-size: clamp(1.4rem, 4.5cqw, 2.5rem);
      font-weight: 600;
      line-height: 1.2;
      color: var(--cine-text);
      margin-bottom: 4%;
    }

    .slide-1 .cine-divider {
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, transparent, ${cs.cineDivider}, transparent);
      margin-bottom: 4%;
    }

    .slide-1 .hook-sub {
      font-family: 'Inter', sans-serif;
      font-size: clamp(0.65rem, 2cqw, 1.1rem);
      font-weight: 300;
      letter-spacing: 0.1em;
      color: var(--cine-subtle);
      line-height: 1.6;
    }

    .slide-1 .cine-logo {
      position: absolute;
      bottom: 8%;
      font-family: 'Inter', sans-serif;
      font-size: clamp(0.4rem, 1.2cqw, 0.625rem);
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: ${cs.cineLogo};
    }

    /* Standard text slides */
    .slide-content .header {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(0.75rem, 2.3cqw, 1.25rem);
      font-weight: 500;
      color: var(--accent-gold);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 3%;
    }

    .slide-content .text {
      font-family: 'Inter', sans-serif;
      font-weight: 300;
      font-size: clamp(0.85rem, 2.6cqw, 1.4rem);
      line-height: 1.7;
      color: var(--text-secondary);
    }

    .slide-content .text em {
      font-style: italic;
      color: var(--accent-gold);
    }

    .slide-content .text .highlight {
      color: var(--text-primary);
      font-weight: 400;
    }

    .slide-content .text .red { color: var(--accent-red); }
    .slide-content .text .blue { color: var(--accent-blue); }

    .step-list {
      list-style: none;
      padding: 0;
      font-family: 'Inter', sans-serif;
      font-weight: 300;
      font-size: clamp(0.75rem, 2.2cqw, 1.2rem);
      line-height: 2;
      color: var(--text-secondary);
    }

    .step-list li {
      display: flex;
      align-items: flex-start;
      gap: 2%;
      margin-bottom: 1%;
    }

    .step-list .num {
      color: var(--accent-gold);
      font-weight: 500;
      min-width: 1.5rem;
    }

    .arrow-list {
      list-style: none;
      padding: 0;
      font-family: 'Inter', sans-serif;
      font-weight: 300;
      font-size: clamp(0.75rem, 2.2cqw, 1.2rem);
      line-height: 2;
      color: var(--text-secondary);
    }

    .arrow-list li {
      display: flex;
      align-items: center;
      gap: 2%;
    }

    .arrow-list .arrow { color: var(--accent-blue); }

    .quote-slide .slide-content {
      align-items: center;
      text-align: center;
    }

    .quote-slide .quote {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(1rem, 3.2cqw, 1.75rem);
      font-style: italic;
      color: var(--text-primary);
      line-height: 1.5;
    }

    .slide-10 .slide-content {
      align-items: center;
      text-align: center;
    }

    .slide-10 .cta-text {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(1rem, 3.2cqw, 1.75rem);
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 4%;
    }

    .slide-10 .cta-button {
      display: inline-block;
      padding: 2% 5%;
      border: 1px solid var(--accent-gold);
      color: var(--accent-gold);
      font-family: 'Inter', sans-serif;
      font-size: clamp(0.5rem, 1.6cqw, 0.875rem);
      font-weight: 400;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      text-decoration: none;
    }

    .slide-10 .logo {
      width: 50%;
      max-width: 200px;
      margin-top: 4%;
      opacity: 0.8;
    }

    .slide-10 .link-hint {
      font-family: 'Inter', sans-serif;
      font-size: clamp(0.5rem, 1.6cqw, 0.875rem);
      color: var(--text-secondary);
      margin-top: 3%;
    }

    /* Export mode */
    body.export-mode {
      padding: 0;
      background: transparent;
    }

    body.export-mode .controls,
    body.export-mode .page-title,
    body.export-mode .slide-label {
      display: none;
    }

    body.export-mode .carousel-grid {
      display: block;
      padding: 0;
    }

    body.export-mode .slide-wrapper {
      display: none;
    }

    body.export-mode .slide-wrapper.active {
      display: flex;
    }

    body.export-mode .slide {
      width: 1080px;
      height: 1350px;
      max-width: none;
      border-radius: 0;
      box-shadow: none;
    }

    @media (max-width: 900px) {
      .carousel-grid { grid-template-columns: 1fr; }
      .controls {
        position: static;
        margin-bottom: 1.5rem;
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  </style>
</head>
<body>
  <div class="controls">
    <label>
      Background:
      <select id="bg-toggle">
        <option value="starfield">Starfield</option>
        <option value="black">Pure Black</option>
      </select>
    </label>
    <label>
      Starfield Opacity:
      <select id="opacity-control">
        <option value="0.03">3%</option>
        <option value="0.05">5%</option>
        <option value="0.08" selected>8%</option>
        <option value="0.12">12%</option>
        <option value="0.15">15%</option>
      </select>
    </label>
    <button id="export-btn">Export Mode</button>
  </div>

  <div class="page-title">
    <h1>Post ${paddedNum} — ${escapeHtml(post.title)}</h1>
    <p>Instagram Carousel &bull; 10 Slides &bull; 1080&times;1350px</p>
  </div>

  <div class="carousel-grid">

${slideHtmlParts.join('\n\n')}

  </div>

  <script>
    const bgToggle = document.getElementById('bg-toggle');
    const opacityControl = document.getElementById('opacity-control');
    const slides = document.querySelectorAll('.slide');
    const videos = document.querySelectorAll('.slide-bg video');

    bgToggle.addEventListener('change', (e) => {
      slides.forEach(slide => {
        if (e.target.value === 'black') {
          slide.classList.add('bg-black');
        } else {
          slide.classList.remove('bg-black');
        }
      });
    });

    opacityControl.addEventListener('change', (e) => {
      videos.forEach(video => {
        video.style.opacity = e.target.value;
      });
    });

    const exportBtn = document.getElementById('export-btn');
    const slideWrappers = document.querySelectorAll('.slide-wrapper');
    let exportMode = false;
    let currentExportSlide = 0;

    exportBtn.addEventListener('click', () => {
      exportMode = !exportMode;
      document.body.classList.toggle('export-mode', exportMode);

      if (exportMode) {
        exportBtn.textContent = 'Exit Export (\\u2190/\\u2192 to navigate)';
        currentExportSlide = 0;
        updateExportSlide();
      } else {
        exportBtn.textContent = 'Export Mode';
        slideWrappers.forEach(w => w.classList.remove('active'));
      }
    });

    function updateExportSlide() {
      slideWrappers.forEach((w, i) => {
        w.classList.toggle('active', i === currentExportSlide);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (!exportMode) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        currentExportSlide = (currentExportSlide + 1) % slideWrappers.length;
        updateExportSlide();
      } else if (e.key === 'ArrowLeft') {
        currentExportSlide = (currentExportSlide - 1 + slideWrappers.length) % slideWrappers.length;
        updateExportSlide();
      } else if (e.key === 'Escape') {
        exportMode = false;
        document.body.classList.remove('export-mode');
        exportBtn.textContent = 'Export Mode';
        slideWrappers.forEach(w => w.classList.remove('active'));
      }
    });
  </script>
</body>
</html>`;
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const startIdx = args.indexOf('--start');
  const endIdx = args.indexOf('--end');
  const start = startIdx !== -1 ? parseInt(args[startIdx + 1]) : 0;
  const end = endIdx !== -1 ? parseInt(args[endIdx + 1]) : 999;

  console.log('Generating missing carousel.html files from content plan...');
  if (dryRun) console.log('  (DRY RUN - no files will be written)');
  console.log(`  Range: post ${start} to ${end}`);
  console.log('');

  // Load and parse content plans
  const part1Path = join(CONTENT_PLAN_DIR, 'CONTENT_PLAN_PART1.md');
  const part2Path = join(CONTENT_PLAN_DIR, 'CONTENT_PLAN_PART2.md');

  if (!existsSync(part1Path) || !existsSync(part2Path)) {
    console.error('Content plan files not found in:', CONTENT_PLAN_DIR);
    process.exit(1);
  }

  const part1Content = readFileSync(part1Path, 'utf-8');
  const part2Content = readFileSync(part2Path, 'utf-8');
  const allPosts = parseAllContent(part1Content, part2Content);

  console.log(`  Parsed ${allPosts.length} posts from content plans`);

  // Find which posts are missing carousel.html
  const missing = [];
  for (const post of allPosts) {
    if (post.postNumber < start || post.postNumber > end) continue;

    const paddedNum = String(post.postNumber).padStart(3, '0');
    const carouselPath = join(SOCIAL_DIR, `post-${paddedNum}`, 'carousel.html');

    if (!existsSync(carouselPath)) {
      missing.push(post);
    }
  }

  console.log(`  Missing carousel.html: ${missing.length} posts`);
  console.log('');

  if (missing.length === 0) {
    console.log('All posts have carousel.html files. Nothing to generate.');
    return;
  }

  let generated = 0;
  let errors = 0;

  for (const post of missing) {
    const paddedNum = String(post.postNumber).padStart(3, '0');

    try {
      // Check if we have content to work with
      if (post.twitter.tweets.length === 0 && !post.instagram.caption) {
        console.log(`  Skipping post-${paddedNum}: no content found in plan`);
        continue;
      }

      const slides = mapContentToSlides(post);
      const colorScheme = getColorScheme(post.postNumber);
      const html = generateCarouselHtml(post, slides, colorScheme);

      if (dryRun) {
        console.log(`  Would generate post-${paddedNum} (${post.type}: "${post.title}")`);
      } else {
        const postDir = join(SOCIAL_DIR, `post-${paddedNum}`);
        mkdirSync(postDir, { recursive: true });
        writeFileSync(join(postDir, 'carousel.html'), html, 'utf-8');
        console.log(`  Generated post-${paddedNum} (${post.type}: "${post.title}")`);
      }
      generated++;
    } catch (err) {
      console.error(`  Error generating post-${paddedNum}: ${err.message}`);
      errors++;
    }
  }

  console.log('');
  console.log(`Done! Generated ${generated} carousel files.`);
  if (errors > 0) console.log(`  Errors: ${errors}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
