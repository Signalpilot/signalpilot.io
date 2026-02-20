#!/usr/bin/env node
/**
 * Renders Twitter card images (1200x675 PNG) for all posts in content-queue.json.
 *
 * Usage:
 *   node scripts/render-twitter-cards.cjs                  # Render all
 *   node scripts/render-twitter-cards.cjs --sample 5       # Render 5 samples
 *   node scripts/render-twitter-cards.cjs --range 0-10     # Render posts 0-10
 *   node scripts/render-twitter-cards.cjs --post 42        # Render single post
 *
 * Output: assets/social/post-XXX/twitter-card.png per post
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const QUEUE_PATH = path.join(ROOT, 'data', 'social', 'content-queue.json');
const TEMPLATE_PATH = path.join(ROOT, 'assets', 'social', 'twitter-card-template.html');
const ASSETS_DIR = path.join(ROOT, 'assets', 'social');

// Chromium binary — use playwright's cached chromium
const CHROME_PATH = '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome';

// Pillar colors
const PILLAR_COLORS = {
  'P1: Liquidity Lie':      { color: '#d94050', glow: 'rgba(217, 64, 80, 0.04)' },
  'P2: Indicator Truth':    { color: '#4a90d9', glow: 'rgba(74, 144, 217, 0.04)' },
  'P3: Market Mechanics':   { color: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.04)' },
  'P4: Trading Psychology': { color: '#c9a962', glow: 'rgba(201, 169, 98, 0.04)' },
  'P5: Chronicle':          { color: '#a78bfa', glow: 'rgba(167, 139, 250, 0.04)' },
  'P6: Community':          { color: '#22d3ee', glow: 'rgba(34, 211, 238, 0.04)' },
};

// Type tag labels
const TYPE_TAGS = {
  'Education': 'LEARN',
  'Blog': 'INSIGHT',
  'Product': 'PRODUCT',
  'Quote': 'WISDOM',
  'Chronicle': 'CHRONICLE',
  'Marketing': 'DISCOVER',
  'Docs': 'REFERENCE',
  'Manifesto': 'MANIFESTO',
};

function cleanHookText(text) {
  let t = text;
  // Remove 🧵 thread emoji and variants
  t = t.replace(/\s*🧵\s*/g, '');
  // Trim trailing periods after emoji removal
  t = t.trim();
  // Convert newlines to HTML breaks
  t = t.replace(/\n\n/g, '<br><br>');
  t = t.replace(/\n/g, '<br>');
  // Escape angle brackets (but preserve our <br> tags)
  t = t.replace(/<(?!br>|br\/>|\/br>)/g, '&lt;');
  return t;
}

function getSizeClass(text) {
  // Use raw text length (before HTML conversion) to determine font size
  const rawLen = text.replace(/<br>/g, ' ').replace(/&lt;/g, '<').length;
  if (rawLen < 55) return 'size-xl';
  if (rawLen < 90) return 'size-lg';
  if (rawLen < 140) return 'size-md';
  if (rawLen < 200) return 'size-sm';
  return 'size-xs';
}

function getPostDir(postNumber) {
  const padded = String(postNumber).padStart(3, '0');
  return path.join(ASSETS_DIR, `post-${padded}`);
}

async function main() {
  const args = process.argv.slice(2);
  let mode = 'all';
  let sampleCount = 0;
  let rangeStart = 0, rangeEnd = 844;
  let singlePost = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--sample' && args[i+1]) { mode = 'sample'; sampleCount = parseInt(args[i+1]); i++; }
    if (args[i] === '--range' && args[i+1]) { mode = 'range'; const [s, e] = args[i+1].split('-').map(Number); rangeStart = s; rangeEnd = e; i++; }
    if (args[i] === '--post' && args[i+1]) { mode = 'single'; singlePost = parseInt(args[i+1]); i++; }
  }

  // Load content
  const posts = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  console.log(`Loaded ${posts.length} posts from content queue`);

  // Select posts to render
  let toRender;
  if (mode === 'single') {
    toRender = posts.filter(p => p.postNumber === singlePost);
  } else if (mode === 'range') {
    toRender = posts.filter(p => p.postNumber >= rangeStart && p.postNumber <= rangeEnd);
  } else if (mode === 'sample') {
    // Evenly spaced samples for visual variety
    const step = Math.floor(posts.length / sampleCount);
    toRender = [];
    for (let i = 0; i < sampleCount && i * step < posts.length; i++) {
      toRender.push(posts[i * step]);
    }
  } else {
    toRender = posts;
  }

  console.log(`Rendering ${toRender.length} Twitter cards...`);

  // Load puppeteer-core
  const puppeteer = require('puppeteer-core');

  // Verify Chrome binary exists
  if (!fs.existsSync(CHROME_PATH)) {
    console.error(`Chrome not found at ${CHROME_PATH}`);
    console.error('Install via: npx playwright install chromium');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 675, deviceScaleFactor: 2 });

  // Load template
  const templateUrl = `file://${TEMPLATE_PATH}`;
  await page.goto(templateUrl, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready);
  console.log('Template loaded, fonts ready');

  let rendered = 0;
  let errors = 0;
  const startTime = Date.now();

  for (const post of toRender) {
    try {
      const tweets = post.twitter?.tweets;
      if (!tweets || tweets.length === 0) {
        console.log(`  #${post.postNumber}: SKIP (no tweets)`);
        continue;
      }

      const hookRaw = tweets[0];
      const hookHtml = cleanHookText(hookRaw);
      const sizeClass = getSizeClass(hookHtml);
      const pillar = PILLAR_COLORS[post.pillar] || PILLAR_COLORS['P4: Trading Psychology'];
      const typeTag = TYPE_TAGS[post.type] || 'SIGNAL PILOT';

      // Render the card content
      await page.evaluate(
        (hookText, tag, color, glow, size) => {
          // eslint-disable-next-line no-undef
          render(hookText, tag, color, glow, size);
        },
        hookHtml, typeTag, pillar.color, pillar.glow, sizeClass
      );

      // Small delay for paint
      await new Promise(r => setTimeout(r, 50));

      // Ensure output directory exists
      const outDir = getPostDir(post.postNumber);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      // Screenshot
      const outPath = path.join(outDir, 'twitter-card.png');
      await page.screenshot({
        path: outPath,
        type: 'png',
        clip: { x: 0, y: 0, width: 1200, height: 675 },
      });

      rendered++;
      if (rendered % 50 === 0 || rendered === toRender.length) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = (rendered / (Date.now() - startTime) * 1000).toFixed(1);
        console.log(`  Progress: ${rendered}/${toRender.length} (${elapsed}s, ${rate}/s)`);
      }
    } catch (err) {
      console.error(`  #${post.postNumber}: ERROR — ${err.message}`);
      errors++;
    }
  }

  await browser.close();

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nDone! Rendered ${rendered} cards in ${totalTime}s (${errors} errors)`);

  // Verify output
  let verified = 0;
  for (const post of toRender) {
    const cardPath = path.join(getPostDir(post.postNumber), 'twitter-card.png');
    if (fs.existsSync(cardPath)) {
      const stat = fs.statSync(cardPath);
      if (stat.size > 1000) verified++;
    }
  }
  console.log(`Verified: ${verified}/${rendered} cards exist and are >1KB`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
