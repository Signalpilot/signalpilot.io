#!/usr/bin/env node

// Generate carousel.html files from content plan data
// Uses indicator knowledge base from docs.signalpilot.io for enrichment
// Dynamic slide counts: Quote=1, Chronicle/Marketing=4-7, Education/Product/Docs=6-10
//
// Key design: each slide gets ONE coherent educational point — never repeat content
//
// Usage: node scripts/generate-carousels.js [--dry-run] [--force] [--start N] [--end N]

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseAllContent } from '../lib/social/content-parser.js';
import { INDICATORS, detectIndicators, getContextualHeaders } from '../lib/social/indicator-knowledge.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOCIAL_DIR = join(ROOT, 'INSTAGRAM_CONTENT_HUB', 'social');
const CONTENT_PLAN_DIR = join(ROOT, 'content-plan');

// --- Color Schemes (3-color rotation for 9-grid: Orange → Neutral → Teal) ---

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

function getColorScheme(postNumber, postType) {
  // Quote cards are always orange regardless of grid position
  if (postType === 'Quote') return COLOR_SCHEMES.orange;
  // 9-grid columns: Orange (right) → Neutral (center) → Teal (left)
  const mod = postNumber % 3;
  if (mod === 0) return COLOR_SCHEMES.orange;   // right column
  if (mod === 1) return COLOR_SCHEMES.teal;     // left column
  return COLOR_SCHEMES.neutral;                  // center column
}

// --- HTML Escaping ---

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// --- Content Extraction ---
// Extract discrete educational points from the content plan.
// Each point becomes one carousel slide.

function extractContentPoints(post) {
  const points = [];
  const seen = new Set(); // Deduplication

  // Helper: normalize text for dedup comparison
  function normalize(text) {
    return text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
  }

  // Helper: check if text is just a section header (e.g., "FLOW + PRICE COMBINATIONS:")
  function isSectionHeader(text) {
    const trimmed = text.trim();
    return (trimmed.length < 45 && trimmed.endsWith(':'))
      || (trimmed.length < 30 && trimmed === trimmed.toUpperCase() && !trimmed.includes('.'));
  }

  // Helper: add a point if it's unique and substantial
  function addPoint(text) {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 30) return false;
    if (isSectionHeader(trimmed)) return false;
    const norm = normalize(trimmed);
    if (norm.length < 15) return false;
    // Skip if we've seen very similar content
    if (seen.has(norm)) return false;
    // Check for partial overlap with existing points
    for (const existing of seen) {
      if (existing.includes(norm) || norm.includes(existing)) return false;
    }
    // Skip if it's mostly hashtags or links
    if (trimmed.match(/^(#\w+\s*){3,}$/)) return false;
    if (trimmed.match(/^https?:\/\//)) return false;
    if (/^(🔗|Get |Full |Link |Read )/i.test(trimmed) && trimmed.length < 80) return false;
    if (/link in bio|docs in bio|full docs/i.test(trimmed) && trimmed.length < 60) return false;
    if (/^save this|^bookmark this/i.test(trimmed) && trimmed.length < 60) return false;
    seen.add(norm);
    points.push(trimmed);
    return true;
  }

  // Source 1: Instagram caption — merge short consecutive paragraphs
  const caption = (post.instagram.caption || '').replace(/#\w+\s*/g, '').trim();
  if (caption) {
    const rawParagraphs = caption.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);
    // Group consecutive short paragraphs (< 80 chars) into one content point
    const merged = [];
    let buffer = '';
    for (const para of rawParagraphs) {
      if (isSectionHeader(para)) {
        // Flush buffer, skip the header
        if (buffer.trim().length > 20) merged.push(buffer.trim());
        buffer = '';
        continue;
      }
      if (para.length < 80) {
        buffer += (buffer ? '\n' : '') + para;
        // If buffer has enough content, flush it
        if (buffer.length > 150) {
          merged.push(buffer.trim());
          buffer = '';
        }
      } else {
        // Long paragraph — flush any buffer first, then add this
        if (buffer.trim().length > 20) merged.push(buffer.trim());
        buffer = '';
        merged.push(para);
      }
    }
    if (buffer.trim().length > 20) merged.push(buffer.trim());

    for (const block of merged) {
      addPoint(block);
    }
  }

  // Source 2: Individual content plan points (supplement if caption didn't fill 6 slots)
  if (points.length < 6 && post.twitter.tweets.length > 0) {
    const tweets = post.twitter.tweets;
    // Skip first tweet (usually a hook like "I blew 3 accounts...🧵")
    // Skip last tweet if it contains links
    const start = 1;
    const end = tweets[tweets.length - 1].match(/https?:\/\//) ? tweets.length - 1 : tweets.length;

    for (let i = start; i < end; i++) {
      const tweet = tweets[i]
        .replace(/\d+\/\d+\s*$/, '')  // Remove thread numbering
        .replace(/🧵\s*$/, '')        // Remove thread emoji
        .trim();
      if (tweet.length > 30) {
        addPoint(tweet);
      }
    }
  }

  return points;
}

// --- Content-to-Slide Formatting ---
// Convert a text block into slide-ready HTML with proper formatting

function formatSlideContent(text) {
  const escaped = escapeHtml(text);

  // Detect numbered list (1. First, 2. Second, etc.)
  if (/^\d+[\.\)]\s/m.test(text)) {
    const lines = text.split('\n').filter(l => l.trim());
    const listItems = lines.map(line => {
      const numMatch = line.match(/^(\d+)[\.\)]\s*(.+)/);
      if (numMatch) {
        return `<li><span class="num">${escapeHtml(numMatch[1])}.</span> ${escapeHtml(numMatch[2])}</li>`;
      }
      return `<li>${escapeHtml(line)}</li>`;
    });
    return `<ol class="step-list">${listItems.join('\n')}</ol>`;
  }

  // Detect arrow/bullet list (→ point, • point, - point, ◾ point)
  // Use unicode flag to handle multi-byte emojis correctly
  const bulletPrefixRe = /^(?:→|•|✓|✗|▸|►|◾|▪|■|□|☐|☑|-)\s/m;
  if (bulletPrefixRe.test(text)) {
    const lines = text.split('\n').filter(l => l.trim());
    const listItems = lines.map(line => {
      const cleaned = line.replace(/^(?:→|•|✓|✗|▸|►|◾|▪|■|□|☐|☑|-)\s*/, '').trim();
      if (!cleaned) return '';
      return `<li><span class="arrow">&rarr;</span> ${escapeHtml(cleaned)}</li>`;
    }).filter(l => l);
    if (listItems.length > 0) {
      return `<ul class="arrow-list">${listItems.join('\n')}</ul>`;
    }
  }

  // Detect lines with emoji prefixes or → prefixed content pairs
  const lines = text.split('\n').filter(l => l.trim());
  const emojiOrArrowLines = lines.filter(l => /^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(l.trim()) || /^→\s/.test(l.trim()));
  if (emojiOrArrowLines.length >= 2) {
    const listItems = lines.map(line => {
      return `<li><span class="arrow">&rarr;</span> ${escapeHtml(line.trim())}</li>`;
    });
    return `<ul class="arrow-list">${listItems.join('\n')}</ul>`;
  }

  // Regular paragraph text — add formatting
  let html = escaped;

  // Bold markers **text** → <span class="highlight">
  html = html.replace(/\*\*(.+?)\*\*/g, '<span class="highlight">$1</span>');

  // Italic markers *text* → <em>
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // "Quoted text" → <em> with gold color
  html = html.replace(/"([^"]{10,})"/g, '<em>$1</em>');

  // → at start of lines
  html = html.replace(/^→\s*(.+)/gm, '<span class="blue">&rarr;</span> $1');

  // Single newlines → <br>
  html = html.replace(/\n/g, '<br>\n');

  return `<p class="text">${html}</p>`;
}

// --- Quote Extraction ---
// Find the best quote-worthy line from the content

function extractQuote(post, contentPoints) {
  // Also check tweet content for punchier quotes
  const tweetText = post.twitter.tweets
    .slice(1, -1)  // skip hook tweet and link tweet
    .join('\n');
  const allText = tweetText + '\n' + contentPoints.join('\n');

  const lines = allText.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 25 && l.length < 120);

  // Prefer lines that feel quotable: short, punchy, no lists/numbers/headers
  const candidates = lines.filter(l => {
    return !l.startsWith('#') && !l.match(/^https?:\/\//) && !l.startsWith('@')
      && !l.match(/^\d+[\.\)]/) && !l.startsWith('→') && !l.startsWith('•')
      && !l.startsWith('◾') && !l.endsWith(':')
      && !l.match(/^[\u{1F300}-\u{1FAFF}]/u) // Skip emoji-prefixed lines
      && !l.match(/^(FLOW|STEP|HOW|WHAT|WHY|WHEN|THE)\s/i) // Skip header-style lines
      && l !== l.toUpperCase(); // Skip ALL CAPS lines
  });

  if (candidates.length > 0) {
    // Pick from the middle-to-end (usually more insightful)
    const idx = Math.min(Math.floor(candidates.length * 0.6), candidates.length - 1);
    return candidates[idx];
  }

  // Fallback: try indicator quick tips
  const indicatorKeys = detectIndicators(post);
  for (const key of indicatorKeys) {
    const indicator = INDICATORS[key];
    if (indicator && indicator.quickTips.length > 0) {
      return indicator.quickTips[0];
    }
  }

  // Last resort
  const title = post.title.replace(/[📚🌐🎓📝💬🛠️🔮📊]/g, '').trim();
  return title || 'Knowledge is the edge.';
}

// --- Hook Extraction ---

function extractHook(post) {
  let title = post.title
    .replace(/[📚🌐🎓📝💬🛠️🔮📊]/g, '') // Remove emoji prefixes
    .replace(/^(DOCS|BLOG|EDUCATION|MARKETING|PRODUCT|CHRONICLE|QUOTE)[:\s]+/i, '') // Remove type prefixes
    .trim();

  // Get subtitle: prefer the first tweet (it's usually a punchy hook)
  let subtitle = '';
  if (post.twitter.tweets.length > 0) {
    const firstTweet = post.twitter.tweets[0]
      .replace(/🧵\s*$/, '')
      .replace(/\d+\/\d+\s*$/, '')
      .trim();
    // Skip if it just repeats the title
    const titleNorm = title.toLowerCase().replace(/[^\w]/g, '');
    const tweetNorm = firstTweet.toLowerCase().replace(/[^\w]/g, '');
    if (tweetNorm !== titleNorm && tweetNorm.length > 5) {
      if (firstTweet.length < 80 && firstTweet.length > 10) {
        subtitle = firstTweet;
      } else {
        const firstLine = firstTweet.split('\n')[0].trim();
        if (firstLine.length < 80 && firstLine.length > 10) {
          subtitle = firstLine;
        }
      }
    }
  }

  // Fallback to Instagram caption first line
  if (!subtitle && post.instagram.caption) {
    const firstLine = post.instagram.caption.split('\n')[0]
      .replace(/#\w+\s*/g, '')
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '') // Remove emojis
      .trim();
    const titleNorm = title.toLowerCase().replace(/[^\w]/g, '');
    const lineNorm = firstLine.toLowerCase().replace(/[^\w]/g, '');
    if (lineNorm !== titleNorm && firstLine.length > 10 && firstLine.length < 80) {
      subtitle = firstLine;
    }
  }

  // Fallback: use indicator tagline if available
  if (!subtitle) {
    const indicatorKeys = detectIndicators(post);
    for (const key of indicatorKeys) {
      const indicator = INDICATORS[key];
      if (indicator) {
        subtitle = indicator.tagline;
        break;
      }
    }
  }

  if (!subtitle) {
    subtitle = 'Signal Pilot';
  }

  // Clean up title: remove quotes
  title = title.replace(/[""\u201C\u201D]/g, '');
  subtitle = subtitle.replace(/[""\u201C\u201D]/g, '');

  return { title, subtitle };
}

// --- Slide Header Assignment ---

function getSlideHeaders(post, indicatorKeys) {
  // Try contextual headers from indicator knowledge
  const contextual = getContextualHeaders(post, indicatorKeys);
  if (contextual) return contextual;

  // Type-based headers
  switch (post.type) {
    case 'Education':
      return ['The Problem', 'The Pattern', 'Why This Happens', 'The Example', 'The Truth', 'The Solution'];
    case 'Quote':
      return ['The Context', 'The Insight', 'Why It Matters', 'The Application', 'The Shift', 'The Practice'];
    case 'Product':
      return ['The Challenge', 'How It Works', 'Key Features', 'The Difference', 'Pro Tip', 'Getting Started'];
    case 'Marketing':
      return ['The Opportunity', 'What We Built', 'Why It Matters', 'The Details', 'The Results', 'Join Us'];
    case 'Chronicle':
      return ['The Story', 'The Origin', 'The Journey', 'The Challenge', 'The Breakthrough', 'The Vision'];
    case 'Blog':
      return ['The Topic', 'The Core Idea', 'The Deep Dive', 'The Evidence', 'The Takeaway', 'Read More'];
    case 'Docs':
      return ['The Guide', 'Step by Step', 'Key Concepts', 'How To Use It', 'Pro Tips', 'Next Steps'];
    case 'Manifesto':
      return ['The Mission', 'The Problem', 'The Promise', 'The Approach', 'The Difference', 'The Future'];
    default:
      return ['The Concept', 'The Details', 'Why It Matters', 'The Application', 'Key Takeaway', 'Next Steps'];
  }
}

// --- Slide Configuration by Post Type ---
// Each type has a natural range — no more forcing everything to 10

function getSlideConfig(type) {
  switch (type) {
    case 'Quote':
      // Quote cards = 1 single image. Not a carousel.
      return { singleSlide: true, minContent: 0, maxContent: 0, includeQuote: false, includeLearnMore: false };
    case 'Chronicle':
      return { minContent: 3, maxContent: 5, includeQuote: true, includeLearnMore: false };
    case 'Marketing':
      return { minContent: 3, maxContent: 5, includeQuote: false, includeLearnMore: false };
    case 'Blog':
      return { minContent: 3, maxContent: 6, includeQuote: true, includeLearnMore: false };
    case 'Education':
      return { minContent: 4, maxContent: 7, includeQuote: true, includeLearnMore: true };
    case 'Product':
      return { minContent: 4, maxContent: 7, includeQuote: false, includeLearnMore: true };
    case 'Docs':
      return { minContent: 4, maxContent: 7, includeQuote: false, includeLearnMore: true };
    case 'Manifesto':
      return { minContent: 4, maxContent: 7, includeQuote: true, includeLearnMore: true };
    default:
      return { minContent: 3, maxContent: 6, includeQuote: true, includeLearnMore: false };
  }
}

// --- Indicator Content Enrichment ---
// For posts about specific indicators, supplement thin content with docs knowledge

function getIndicatorEnrichment(indicatorKeys, existingPointCount, existingPoints, targetMin) {
  if (indicatorKeys.length === 0) return [];

  // Calculate how many thin points we have (under 60 chars)
  const thinCount = (existingPoints || []).filter(p => p.length < 60).length;
  const effectiveCount = existingPointCount - thinCount;

  if (effectiveCount >= targetMin) return [];

  const enrichments = [];
  const needed = Math.max(targetMin - existingPointCount, thinCount);

  for (const key of indicatorKeys) {
    const indicator = INDICATORS[key];
    if (!indicator) continue;

    // Add quick tips as supplementary content
    for (const tip of indicator.quickTips) {
      if (enrichments.length >= needed) break;
      enrichments.push(tip);
    }

    // Add feature highlights if still needed
    if (enrichments.length < needed) {
      for (const feature of indicator.features.slice(0, needed - enrichments.length)) {
        enrichments.push(feature);
      }
    }
  }

  return enrichments.slice(0, needed);
}

// --- Learn More Items ---

function getLearnMoreItems(post, indicatorKeys) {
  if (indicatorKeys.length > 0) {
    const indicator = INDICATORS[indicatorKeys[0]];
    if (indicator) {
      return [
        `Full ${indicator.name} documentation`,
        '82 free Education Hub lessons',
        'Step-by-step chart breakdowns',
      ];
    }
  }

  switch (post.type) {
    case 'Education':
    case 'Docs':
      return ['82 free Education Hub lessons', 'Step-by-step breakdowns', 'Real chart examples'];
    case 'Product':
      return ['7 professional indicators', 'Non-repainting signals', '7-day money-back guarantee'];
    case 'Quote':
    case 'Chronicle':
      return ['Trading psychology insights', 'Mindset frameworks', 'Community discussions'];
    case 'Blog':
      return ['Full article on the blog', 'More deep dives weekly', 'Free education resources'];
    default:
      return ['Free education resources', 'Professional trading tools', 'Join the community'];
  }
}

// --- CTA ---

function getCTAText(post) {
  if (post.cta && post.cta.length > 3 && post.cta.length < 50) {
    // Clean up CTA from content plan
    const cta = post.cta
      .replace(/Lead Magnet[^)]*\)/gi, '')
      .replace(/\(.+\)/g, '')
      .trim();
    if (cta.length > 3) return cta;
  }

  switch (post.type) {
    case 'Education': case 'Docs': return 'Start Learning Free';
    case 'Product': return 'Try the Indicators';
    case 'Blog': return 'Read the Full Article';
    case 'Quote': case 'Chronicle': return 'More Trading Insights';
    case 'Marketing': return 'Learn More';
    default: return 'Learn More';
  }
}

function getCTAButton(post) {
  switch (post.type) {
    case 'Education': case 'Docs': return 'Education Hub';
    case 'Product': return 'View Indicators';
    case 'Blog': return 'Read on Blog';
    default: return 'Visit Signal Pilot';
  }
}

// --- Master Slide Mapper ---
// Takes a post and produces a VARIABLE-length array of slides.
// Slide count depends on post type + actual content volume.

function mapContentToSlides(post) {
  const { title, subtitle } = extractHook(post);
  const indicatorKeys = detectIndicators(post);
  const config = getSlideConfig(post.type);

  // --- Single-slide posts (Quote cards) ---
  if (config.singleSlide) {
    const quote = extractQuote(post, []);
    return [{ type: 'quote-card', title, quote, subtitle: 'Signal Pilot' }];
  }

  // Extract content points from the post
  let contentPoints = extractContentPoints(post);

  // Enrich with indicator knowledge if content is below minimum for this type
  const enrichments = getIndicatorEnrichment(indicatorKeys, contentPoints.length, contentPoints, config.minContent);
  if (enrichments.length > 0) {
    // Replace thin points with enrichments, or append
    const thinIndices = contentPoints
      .map((p, i) => p.length < 60 ? i : -1)
      .filter(i => i !== -1);

    let eIdx = 0;
    for (const thinIdx of thinIndices) {
      if (eIdx < enrichments.length) {
        contentPoints[thinIdx] = enrichments[eIdx++];
      }
    }
    // Append remaining enrichments
    while (eIdx < enrichments.length && contentPoints.length < config.maxContent) {
      contentPoints.push(enrichments[eIdx++]);
    }
  }

  // Only pad if we're below the MINIMUM for this type (not a hardcoded 6)
  if (contentPoints.length < config.minContent) {
    const fallbacks = [
      'Understanding the why behind each signal gives you conviction to hold through noise.',
      'Every tool works differently in trending vs ranging markets. Know which environment you\'re in.',
      'Paper trade first. Build confidence in the process before risking capital.',
      'The best setups combine multiple confirmations. One signal is a hypothesis, three is conviction.',
      'Risk management isn\'t optional. It\'s the entire game.',
      'Journal every trade. The patterns in your behavior matter more than the patterns on the chart.',
    ];
    while (contentPoints.length < config.minContent) {
      const idx = contentPoints.length % fallbacks.length;
      contentPoints.push(fallbacks[idx]);
    }
  }

  // Take content points up to the max for this type (not a hardcoded 6)
  const numContentSlides = Math.min(contentPoints.length, config.maxContent);
  const slideContent = contentPoints.slice(0, numContentSlides);

  // Get headers matched to actual content slide count
  const headers = getSlideHeaders(post, indicatorKeys);

  // Build slides array dynamically
  const slides = [];

  // Slide 1: Cinematic Hook (always)
  slides.push({ type: 'hook', title, subtitle });

  // Content slides (variable count)
  for (let i = 0; i < numContentSlides; i++) {
    slides.push({
      type: 'content',
      header: headers[i % headers.length] || 'Key Insight',
      text: slideContent[i],
    });
  }

  // Quote slide (only if config says so)
  if (config.includeQuote) {
    let quote = extractQuote(post, contentPoints);
    // Ensure quote doesn't duplicate slide content
    const slideTexts = slideContent.map(s => s.toLowerCase().trim());
    if (slideTexts.some(t => t === quote.toLowerCase().trim())) {
      const altLines = post.twitter.tweets.slice(1).join('\n').split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 25 && l.length < 120 && !slideTexts.includes(l.toLowerCase().trim()));
      if (altLines.length > 0) {
        quote = altLines[Math.floor(altLines.length * 0.6)];
      }
    }
    slides.push({ type: 'quote', text: quote });
  }

  // Learn More slide (only if config says so)
  if (config.includeLearnMore) {
    slides.push({
      type: 'learn',
      header: 'Free Resources',
      items: getLearnMoreItems(post, indicatorKeys),
    });
  }

  // CTA (always last)
  slides.push({
    type: 'cta',
    text: getCTAText(post),
    button: getCTAButton(post),
  });

  return slides;
}

// --- HTML Template Generation ---

function getLabelCategory(post) {
  switch (post.type) {
    case 'Education': return 'Learn';
    case 'Product': return 'Discover';
    case 'Quote': return 'Reflect';
    case 'Chronicle': return 'Story';
    case 'Blog': return 'Read';
    case 'Docs': return 'Guide';
    case 'Marketing': return 'Explore';
    case 'Manifesto': return 'Manifest';
    default: return 'Explore';
  }
}

function generateCarouselHtml(post, slides, colorScheme) {
  const paddedNum = String(post.postNumber).padStart(3, '0');
  const cs = colorScheme;

  const slideHtmlParts = slides.map((slide, i) => {
    const slideNum = i + 1;
    const wrapperStart = `    <div class="slide-wrapper" data-slide="${slideNum}">`;
    const wrapperEnd = `    </div>`;

    // Single-slide quote card — one beautiful image
    if (slide.type === 'quote-card') {
      return `${wrapperStart}
      <span class="slide-label">Quote Card</span>
      <div class="slide slide-1 quote-card-slide">
        <div class="slide-bg">
          <video autoplay loop muted playsinline>
            <source src="../../videos/starfield-bg.mp4" type="video/mp4">
          </video>
        </div>
        <div class="slide-content">
          <div class="cine-label">Reflect</div>
          <p class="quote">&ldquo;${escapeHtml(slide.quote)}&rdquo;</p>
          <div class="cine-divider"></div>
          <p class="quote-title">${escapeHtml(slide.title)}</p>
          <div class="cine-logo">Signal Pilot</div>
        </div>
      </div>
${wrapperEnd}`;
    }

    if (slide.type === 'hook') {
      const labelCategory = getLabelCategory(post);
      return `${wrapperStart}
      <span class="slide-label">Slide ${slideNum} — Cinematic Hook</span>
      <div class="slide slide-1">
        <div class="slide-content">
          <div class="cine-label">${escapeHtml(labelCategory)}</div>
          <div class="hook-main">${escapeHtml(slide.title)}</div>
          <div class="cine-divider"></div>
          <p class="hook-sub">${escapeHtml(slide.subtitle)}</p>
          <div class="cine-logo">Signal Pilot</div>
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
          <p class="quote">&ldquo;${escapeHtml(slide.text)}&rdquo;</p>
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
      <div class="slide slide-${slideNum} cta-slide">
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
    const contentHtml = formatSlideContent(slide.text);
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
      left: 50%;
      transform: translateX(-50%);
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

    /* Single-slide quote card (standalone image, not carousel) */
    .quote-card-slide .slide-content {
      align-items: center;
      text-align: center;
      z-index: 3;
    }

    .quote-card-slide .cine-label {
      font-family: 'Inter', sans-serif;
      font-size: clamp(0.5rem, 1.6cqw, 0.875rem);
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: ${cs.cineLabel};
      margin-bottom: 6%;
    }

    .quote-card-slide .quote {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(1.2rem, 3.8cqw, 2.2rem);
      font-style: italic;
      color: var(--text-primary);
      line-height: 1.5;
      margin-bottom: 5%;
      max-width: 85%;
    }

    .quote-card-slide .cine-divider {
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, transparent, ${cs.cineDivider}, transparent);
      margin-bottom: 4%;
    }

    .quote-card-slide .quote-title {
      font-family: 'Inter', sans-serif;
      font-size: clamp(0.65rem, 2cqw, 1rem);
      font-weight: 300;
      letter-spacing: 0.1em;
      color: var(--cine-subtle);
      line-height: 1.6;
    }

    .quote-card-slide .cine-logo {
      position: absolute;
      bottom: 8%;
      left: 50%;
      transform: translateX(-50%);
      font-family: 'Inter', sans-serif;
      font-size: clamp(0.4rem, 1.2cqw, 0.625rem);
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: ${cs.cineLogo};
    }

    .cta-slide .slide-content {
      align-items: center;
      text-align: center;
    }

    .cta-slide .cta-text {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(1rem, 3.2cqw, 1.75rem);
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 4%;
    }

    .cta-slide .cta-button {
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

    .cta-slide .logo {
      width: 50%;
      max-width: 200px;
      margin-top: 4%;
      opacity: 0.8;
    }

    .cta-slide .link-hint {
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
    <p>Instagram ${slides.length === 1 ? 'Single Image' : 'Carousel'} &bull; ${slides.length} Slide${slides.length === 1 ? '' : 's'} &bull; 1080&times;1350px</p>
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
  const force = args.includes('--force');
  const startIdx = args.indexOf('--start');
  const endIdx = args.indexOf('--end');
  const start = startIdx !== -1 ? parseInt(args[startIdx + 1]) : 0;
  const end = endIdx !== -1 ? parseInt(args[endIdx + 1]) : 999;

  console.log(force ? 'Regenerating carousel.html files from content plan...' : 'Generating missing carousel.html files from content plan...');
  if (dryRun) console.log('  (DRY RUN - no files will be written)');
  if (force) console.log('  (FORCE - overwriting existing carousels)');
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

  // Process all posts in range
  const targets = [];
  for (const post of allPosts) {
    if (post.postNumber < start || post.postNumber > end) continue;

    const paddedNum = String(post.postNumber).padStart(3, '0');
    const carouselPath = join(SOCIAL_DIR, `post-${paddedNum}`, 'carousel.html');

    if (force || !existsSync(carouselPath)) {
      targets.push(post);
    }
  }

  console.log(`  ${force ? 'Posts to regenerate' : 'Missing carousel.html'}: ${targets.length} posts`);
  console.log('');

  if (targets.length === 0) {
    console.log('All posts have carousel.html files. Nothing to generate.');
    return;
  }

  let generated = 0;
  let errors = 0;

  for (const post of targets) {
    const paddedNum = String(post.postNumber).padStart(3, '0');

    try {
      if (!post.instagram.caption && post.twitter.tweets.length === 0) {
        console.log(`  Skipping post-${paddedNum}: no content found in plan`);
        continue;
      }

      const slides = mapContentToSlides(post);
      const colorScheme = getColorScheme(post.postNumber, post.type);
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
