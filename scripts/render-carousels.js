#!/usr/bin/env node

// Render carousel HTML files to PNG images for Instagram posting
// Uses each carousel's built-in Export Mode for pixel-perfect 1080x1350 slides
//
// Usage: node scripts/render-carousels.js [--start N] [--end N]
// Requires: puppeteer-core (npm install puppeteer-core)

import { readdir, readFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOCIAL_DIR = join(ROOT, 'INSTAGRAM_CONTENT_HUB', 'social');
const OUTPUT_DIR = join(ROOT, 'assets', 'social');

const SLIDE_WIDTH = 1080;
const SLIDE_HEIGHT = 1350;

async function renderCarousel(page, postDir, postNumber) {
  const carouselPath = join(postDir, 'carousel.html');
  if (!existsSync(carouselPath)) {
    console.log(`  Skipping post-${postNumber}: no carousel.html`);
    return 0;
  }

  let html = readFileSync(carouselPath, 'utf8');

  // Remove Google Fonts link tags — real fonts are installed locally
  html = html.replace(/<link[^>]*fonts\.googleapis\.com[^>]*>/gi, '');
  html = html.replace(/<link[^>]*fonts\.gstatic\.com[^>]*>/gi, '');

  // Remove video elements — no video in PNG renders
  html = html.replace(/<video[^>]*>[\s\S]*?<\/video>/gi, '');

  // Render styles: local fonts + export dimensions + font upscaling for readability
  // NO starfield, NO background overrides — let each carousel's theme show through
  const renderStyles = `
    <style>
      /* ===== Local font declarations ===== */
      @font-face { font-family: 'Cormorant Garamond'; font-style: normal; font-weight: 400; src: local('Cormorant Garamond'); }
      @font-face { font-family: 'Cormorant Garamond'; font-style: italic; font-weight: 400; src: local('Cormorant Garamond Italic'); }
      @font-face { font-family: 'Cormorant Garamond'; font-style: normal; font-weight: 500; src: local('Cormorant Garamond Medium'); }
      @font-face { font-family: 'Cormorant Garamond'; font-style: normal; font-weight: 600; src: local('Cormorant Garamond SemiBold'); }
      @font-face { font-family: 'Cormorant Garamond'; font-style: normal; font-weight: 700; src: local('Cormorant Garamond Bold'); }
      @font-face { font-family: 'Cormorant Garamond'; font-style: italic; font-weight: 500; src: local('Cormorant Garamond Medium Italic'); }
      @font-face { font-family: 'Inter'; font-style: normal; font-weight: 300; src: local('Inter Light'); }
      @font-face { font-family: 'Inter'; font-style: normal; font-weight: 400; src: local('Inter'); }
      @font-face { font-family: 'Inter'; font-style: normal; font-weight: 500; src: local('Inter Medium'); }
      @font-face { font-family: 'Inter'; font-style: normal; font-weight: 600; src: local('Inter SemiBold'); }
      @font-face { font-family: 'Inter'; font-style: normal; font-weight: 700; src: local('Inter Bold'); }
      @font-face { font-family: 'JetBrains Mono'; font-style: normal; font-weight: 400; src: local('JetBrains Mono'); }
      @font-face { font-family: 'JetBrains Mono'; font-style: normal; font-weight: 500; src: local('JetBrains Mono Medium'); }
      @font-face { font-family: 'JetBrains Mono'; font-style: normal; font-weight: 600; src: local('JetBrains Mono SemiBold'); }
      @font-face { font-family: 'JetBrains Mono'; font-style: normal; font-weight: 700; src: local('JetBrains Mono Bold'); }
      @font-face { font-family: 'Gugi'; font-style: normal; font-weight: 400; src: url('file:///usr/local/share/fonts/Gugi-Regular.ttf') format('truetype'), local('Gugi'); }

      /* ===== Export mode: exact Instagram dimensions ===== */
      body.export-mode {
        margin: 0 !important;
        padding: 0 !important;
      }

      /* Force slide-wrapper to exact Instagram dimensions — NO background override */
      body.export-mode .slide-wrapper {
        container-type: inline-size !important;
        width: 1080px !important;
        height: 1350px !important;
        overflow: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      /* Ensure intermediate .slide div fills wrapper — ONLY target .slide class */
      body.export-mode .slide-wrapper > .slide {
        width: 100% !important;
        height: 100% !important;
        position: relative !important;
      }

      /* Center slide content */
      .slide-content {
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
        text-align: center !important;
        width: 100% !important;
        height: 100% !important;
        padding: 5% 6% 9% 6% !important;
        box-sizing: border-box !important;
      }

      /* ===== Font upscaling for Instagram readability ===== */

      /* Titles — big and centered */
      .slide-title, .header, .hook-main, .hook-title {
        font-size: clamp(41px, 9.2cqw, 64px) !important;
        margin-bottom: 4% !important;
        text-align: center !important;
        width: 100% !important;
      }
      .slide-title.large {
        font-size: clamp(46px, 10.3cqw, 74px) !important;
      }

      /* Section titles (h2/h3 inside slide-content) */
      .slide-content h2, .slide-content h3,
      .section-title {
        font-size: clamp(37px, 9.2cqw, 60px) !important;
        text-align: center !important;
      }

      /* Body text — boosted for Instagram readability */
      .slide-body, .text {
        font-size: clamp(35px, 8.6cqw, 51px) !important;
        line-height: 1.65 !important;
        max-width: 95% !important;
        text-align: center !important;
        color: rgba(255,255,255,0.85) !important;
      }

      /* Subtitles — boosted for Instagram readability */
      .slide-subtitle, .hook-sub {
        font-size: clamp(37px, 8.6cqw, 53px) !important;
        letter-spacing: 3px !important;
        text-align: center !important;
        color: rgba(255,255,255,0.88) !important;
      }

      /* Paragraphs and lists inside slide-content */
      .slide-content p {
        font-size: clamp(32px, 7.5cqw, 46px) !important;
        text-align: center !important;
        color: rgba(255,255,255,0.85) !important;
      }
      .slide-content ul, .slide-content ol {
        font-size: clamp(32px, 7.5cqw, 46px) !important;
        max-width: 95% !important;
        color: rgba(255,255,255,0.85) !important;
      }

      /* Combo titles and descriptions */
      .combo-title {
        font-size: clamp(32px, 8cqw, 51px) !important;
        font-weight: 700 !important;
      }
      .combo-desc {
        font-size: clamp(30px, 7.5cqw, 44px) !important;
        line-height: 1.5 !important;
        color: rgba(255,255,255,0.85) !important;
      }
      .combo-arrows, .combo-emojis {
        font-size: clamp(46px, 11.5cqw, 74px) !important;
      }

      /* Signal items */
      .signal-item .label, .signal-item .name {
        font-size: clamp(28px, 6.9cqw, 41px) !important;
      }
      .signal-item .arrow, .signal-item .icon {
        font-size: clamp(46px, 11.5cqw, 70px) !important;
      }

      /* Divergence boxes */
      .divergence-title, .divergence-label {
        font-size: clamp(32px, 8cqw, 51px) !important;
        font-weight: 700 !important;
      }
      .divergence-desc {
        font-size: clamp(28px, 6.9cqw, 41px) !important;
      }

      /* Icons */
      .slide-icon, .icon {
        font-size: clamp(55px, 16.1cqw, 83px) !important;
        text-align: center !important;
      }

      /* Checklists */
      .checklist {
        font-size: clamp(30px, 7.5cqw, 44px) !important;
        line-height: 1.8 !important;
        text-align: left !important;
        max-width: 95% !important;
      }
      .checklist li {
        font-size: inherit !important;
        margin-bottom: 2% !important;
      }

      /* CTA elements */
      .cta-link, .cta-button {
        padding: 4% 8% !important;
        font-size: clamp(23px, 5.8cqw, 32px) !important;
        font-weight: 600 !important;
        letter-spacing: 1px !important;
      }
      .cta-text, .cta-title {
        font-size: clamp(35px, 9.2cqw, 55px) !important;
        font-family: 'Cormorant Garamond', serif !important;
        font-weight: 600 !important;
        text-align: center !important;
      }
      .link-hint {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
        margin-top: 3% !important;
        text-align: center !important;
      }

      /* Feature cards (grid items like "Wait for Confluence") */
      .feature-text {
        font-size: clamp(28px, 6.9cqw, 41px) !important;
        color: rgba(255,255,255,0.9) !important;
      }
      .feature-card {
        border-color: rgba(255,255,255,0.15) !important;
      }

      /* Brand mark — Gugi font, centered at bottom, themed per column */
      .brand-mark, .logo, .cine-logo, .slide-logo {
        font-family: 'Gugi', sans-serif !important;
        font-size: clamp(18px, 4.6cqw, 28px) !important;
        letter-spacing: 4px !important;
        text-transform: uppercase !important;
      }
      .brand-mark, .slide-logo {
        position: absolute !important;
        bottom: 5% !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        right: auto !important;
        text-align: center !important;
        width: auto !important;
        color: #c9a962 !important;
      }
      /* Theme-specific brand colors */
      .slide-warm .brand-mark, .slide-warm .slide-logo { color: #f59e0b !important; }
      .slide-teal .brand-mark, .slide-teal .slide-logo { color: #5eead4 !important; }
      .slide-1 .cine-logo {
        left: 50% !important;
        transform: translateX(-50%) !important;
      }

      /* ===== Hide non-slide UI ===== */
      .export-nav, .slide-nav, .nav-controls {
        display: none !important;
      }
      .slide-number, .slide-indicator {
        display: none !important;
      }
      .controls, .slide-label, .page-title {
        display: none !important;
      }
      .slide-wrapper {
        margin: 0 !important;
        padding: 0 !important;
      }

      /* ===== Component overrides for readability ===== */

      .combo-box {
        max-width: 95% !important;
        padding: 6% !important;
        text-align: center !important;
      }
      .signal-grid {
        max-width: 95% !important;
        gap: 16px !important;
      }
      .signal-item {
        padding: 5% 4% !important;
      }
      .divergence-box {
        max-width: 95% !important;
        padding: 7% !important;
        text-align: center !important;
      }

      /* System items (Five Systems slide etc.) */
      .system-name {
        font-size: clamp(18px, 4.2cqw, 26px) !important;
      }
      .system-detail {
        font-size: clamp(16px, 3.4cqw, 22px) !important;
        color: rgba(255,255,255,0.75) !important;
      }
      .system-item {
        padding: 2.5% 3.5% !important;
      }
      .system-list {
        gap: clamp(8px, 1.5cqw, 16px) !important;
      }

      /* Instagram readability utility classes (used across many carousels) */
      .ig-body-text {
        font-size: clamp(18px, 4.2cqw, 26px) !important;
        color: rgba(255,255,255,0.85) !important;
      }
      .ig-label-text {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
        color: rgba(255,255,255,0.8) !important;
        letter-spacing: 1px !important;
      }

      /* Liquidity zone descriptions (post-070 slide 2) */
      .liq-why {
        font-size: clamp(16px, 3.4cqw, 22px) !important;
        color: rgba(255,255,255,0.7) !important;
      }

      /* Fix card descriptions (post-070 slide 4) */
      .fix-card-desc {
        font-size: clamp(16px, 3.4cqw, 22px) !important;
        color: rgba(255,255,255,0.7) !important;
      }

      /* Sweep descriptions (post-070 slide 3) */
      .sweep-desc {
        font-size: clamp(16px, 3.4cqw, 22px) !important;
        color: rgba(255,255,255,0.7) !important;
      }

      /* Fix result quote (post-070 slide 4) */
      .fix-result-text {
        font-size: clamp(21px, 5.2cqw, 32px) !important;
      }

      /* Arrow lists */
      .arrow-list {
        font-size: clamp(28px, 6.9cqw, 41px) !important;
        line-height: 1.6 !important;
        max-width: 95% !important;
        text-align: left !important;
      }
      .arrow-list li {
        font-size: inherit !important;
        margin-bottom: 3% !important;
        gap: 3% !important;
      }
      .arrow-list .arrow {
        font-size: inherit !important;
      }

      /* Callout boxes */
      .callout-box {
        max-width: 95% !important;
        padding: 5% 6% !important;
      }
      .callout-box .callout-title {
        font-size: clamp(32px, 8cqw, 51px) !important;
        font-weight: 600 !important;
      }
      .callout-box .callout-text {
        font-size: clamp(30px, 7.5cqw, 46px) !important;
        line-height: 1.6 !important;
      }

      /* Concept cards */
      .concept-card {
        max-width: 95% !important;
        padding: 5% 6% !important;
      }
      .concept-card .card-label {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
      }
      .concept-card .card-title {
        font-size: clamp(32px, 8cqw, 51px) !important;
        font-weight: 600 !important;
      }
      .concept-card .card-desc {
        font-size: clamp(30px, 7.5cqw, 46px) !important;
        line-height: 1.5 !important;
      }

      /* Data grid items */
      .data-grid {
        max-width: 95% !important;
      }
      .data-item .item-icon {
        font-size: clamp(37px, 9.2cqw, 55px) !important;
      }
      .data-item .item-value {
        font-size: clamp(32px, 8cqw, 51px) !important;
        font-weight: 600 !important;
      }
      .data-item .item-label {
        font-size: clamp(21px, 5.2cqw, 32px) !important;
        line-height: 1.4 !important;
      }

      /* Quote blocks */
      .quote-block {
        font-size: clamp(37px, 9.2cqw, 60px) !important;
        line-height: 1.5 !important;
        max-width: 90% !important;
      }
      .quote-attr {
        font-size: clamp(21px, 5.2cqw, 32px) !important;
      }

      /* Step flows */
      .step-flow {
        max-width: 95% !important;
      }
      .step-num {
        font-size: clamp(37px, 9.2cqw, 60px) !important;
        font-weight: 600 !important;
      }
      .step-text {
        font-size: clamp(30px, 7.5cqw, 46px) !important;
        line-height: 1.5 !important;
      }

      /* Stat values */
      .stat-value {
        font-size: clamp(41px, 10.3cqw, 64px) !important;
        font-weight: 600 !important;
      }
      .stat-label {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
      }

      /* Compare grids */
      .compare-grid {
        max-width: 95% !important;
      }
      .compare-item .compare-label {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
      }
      .compare-item .compare-text {
        font-size: clamp(30px, 7.5cqw, 46px) !important;
        line-height: 1.5 !important;
      }

      /* Indicator pills */
      .indicator-pill {
        font-size: clamp(23px, 5.8cqw, 35px) !important;
        padding: 2% 5% !important;
      }

      /* ===== Gold Standard Architecture — class-specific upscaling ===== */

      /* Section tags & labels (mono uppercase) */
      .hook-tag, .sec-tag, .lesson-tag, .cta-badge {
        font-size: clamp(16px, 4cqw, 25px) !important;
        letter-spacing: 3px !important;
      }

      /* Section titles (.sec-title is the gold standard equivalent of .section-title) */
      .sec-title {
        font-size: clamp(37px, 9.2cqw, 60px) !important;
        text-align: center !important;
      }

      /* --- Definition cards --- */
      .def-label {
        font-size: clamp(16px, 4cqw, 25px) !important;
        letter-spacing: 2px !important;
      }
      .def-quote {
        font-size: clamp(23px, 5.8cqw, 32px) !important;
      }
      .def-text {
        font-size: clamp(23px, 5.8cqw, 35px) !important;
        line-height: 1.45 !important;
      }

      /* --- Factor / feature cards (2x2 / 2x3 grids) --- */
      .factor-card .fc-name {
        font-size: clamp(23px, 5.8cqw, 32px) !important;
      }
      .factor-card .fc-desc {
        font-size: clamp(21px, 5.2cqw, 30px) !important;
        line-height: 1.45 !important;
      }
      .factor-card .fc-tag {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
        padding: 4px 12px !important;
      }
      .factor-card .fc-let {
        font-size: clamp(21px, 5.2cqw, 30px) !important;
      }
      .factor-card .fc-icon {
        width: clamp(32px, 6cqw, 48px) !important;
        height: clamp(32px, 6cqw, 48px) !important;
      }

      /* --- Comparison cards --- */
      .compare-card .cc-label {
        font-size: clamp(16px, 4cqw, 23px) !important;
        letter-spacing: 2px !important;
      }
      .compare-card .cc-quote {
        font-size: clamp(25px, 6.3cqw, 37px) !important;
      }
      .compare-card .cc-desc {
        font-size: clamp(21px, 5.2cqw, 32px) !important;
        line-height: 1.5 !important;
      }

      /* --- Truth cards --- */
      .truth-card .tc-title {
        font-size: clamp(23px, 5.8cqw, 32px) !important;
      }
      .truth-card .tc-desc {
        font-size: clamp(21px, 5.2cqw, 30px) !important;
        line-height: 1.45 !important;
      }
      .truth-quote {
        font-size: clamp(30px, 7.5cqw, 44px) !important;
        line-height: 1.5 !important;
      }

      /* --- Step flow --- */
      .step-name {
        font-size: clamp(23px, 5.8cqw, 32px) !important;
      }
      .step-desc {
        font-size: clamp(18px, 4.6cqw, 25px) !important;
        line-height: 1.45 !important;
      }
      .step-ring .s-num {
        font-size: clamp(23px, 5.8cqw, 32px) !important;
      }
      .step-ring {
        width: clamp(36px, 7cqw, 52px) !important;
        height: clamp(36px, 7cqw, 52px) !important;
      }

      /* --- Icon circles --- */
      .icon-circle {
        width: clamp(42px, 8cqw, 64px) !important;
        height: clamp(42px, 8cqw, 64px) !important;
      }
      .icon-circle .ic-letter {
        font-size: clamp(23px, 5.8cqw, 37px) !important;
      }

      /* --- Warning / Alert / Insight boxes --- */
      .warn-label, .alert-label, .insight-label {
        font-size: clamp(16px, 4cqw, 23px) !important;
        letter-spacing: 2px !important;
      }
      .warn-text, .alert-text, .insight-text {
        font-size: clamp(23px, 5.8cqw, 35px) !important;
        line-height: 1.5 !important;
      }

      /* --- Info boxes --- */
      .info-box {
        background: rgba(94,234,212,0.15) !important;
        border: 2px solid rgba(94,234,212,0.45) !important;
        border-left: 5px solid rgba(94,234,212,1) !important;
        padding: clamp(14px, 3cqw, 22px) !important;
      }
      .info-label {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
        letter-spacing: 2px !important;
        color: rgba(94,234,212,0.9) !important;
      }
      .info-text {
        font-size: clamp(23px, 5.8cqw, 35px) !important;
        line-height: 1.5 !important;
        color: var(--txt) !important;
      }

      /* --- Stack / layer visualization --- */
      .stack-bar {
        font-size: clamp(16px, 4cqw, 23px) !important;
        height: clamp(28px, 5.5cqw, 42px) !important;
      }
      .stack-result {
        font-size: clamp(18px, 4.6cqw, 25px) !important;
        height: clamp(32px, 6cqw, 48px) !important;
      }
      .stack-arrow {
        font-size: clamp(16px, 3.4cqw, 23px) !important;
      }

      /* --- CTA slide elements --- */
      .cta-sub {
        font-size: clamp(30px, 7.5cqw, 44px) !important;
        line-height: 1.5 !important;
      }
      .stat-cell .sv {
        font-size: clamp(32px, 8cqw, 48px) !important;
      }
      .stat-cell .sl {
        font-size: clamp(16px, 4cqw, 23px) !important;
      }
      .pill {
        font-size: clamp(16px, 4cqw, 23px) !important;
        padding: 5px 14px !important;
      }
      .cta-url {
        font-size: clamp(25px, 6.3cqw, 35px) !important;
      }
      .cta-hint {
        font-size: clamp(18px, 4.6cqw, 25px) !important;
      }
      .cta-url-main {
        font-size: clamp(25px, 6.3cqw, 35px) !important;
      }
      .cta-badge-pill {
        font-size: clamp(16px, 4cqw, 23px) !important;
        padding: 5px 14px !important;
      }

      /* --- Divergence visual elements --- */
      .da-label {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
      }
      .diverge-vs {
        font-size: clamp(18px, 4.6cqw, 25px) !important;
      }
      .diverge-arrow .da-line {
        height: clamp(24px, 5cqw, 40px) !important;
        width: clamp(4px, 0.8cqw, 6px) !important;
      }

      /* --- Volume bar / flow ribbon labels --- */
      .flow-ribbon-labels {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
      }
      .flow-ribbon {
        height: clamp(22px, 4.5cqw, 36px) !important;
      }
      .vol-bar-dot {
        font-size: clamp(9px, 2.3cqw, 16px) !important;
      }

      /* --- Progress bars (make thicker) --- */
      .prog-bar {
        height: clamp(5px, 1cqw, 8px) !important;
      }

      /* --- Orb / orb-sm letter --- */
      .orb-sm .orb-letter {
        font-size: clamp(32px, 8cqw, 51px) !important;
      }

      /* --- Scales labels inside orb --- */
      .scales-label {
        font-size: clamp(9px, 1.8cqw, 14px) !important;
      }

      /* --- Slide-1 column line (thicker for grid visibility) --- */
      .s1::after {
        width: 60px !important;
      }
      /* Old architecture slide-1 line */
      .slide-teal.slide-1::after,
      .slide-warm.slide-1::after {
        width: 60px !important;
      }

      /* ===== Signal card overrides (dense slides with 3+ cards) ===== */
      .signal-card {
        padding: clamp(6px, 1.2cqw, 12px) !important;
        margin-bottom: 1% !important;
      }
      .signal-card .signal-icon {
        width: clamp(24px, 4.5cqw, 38px) !important;
        height: clamp(24px, 4.5cqw, 38px) !important;
        font-size: clamp(12px, 2.3cqw, 18px) !important;
        margin: 0 auto clamp(2px, 0.5cqw, 6px) !important;
      }
      .signal-card .signal-name {
        font-size: clamp(14px, 2.9cqw, 21px) !important;
        margin-bottom: 0.5% !important;
      }
      .signal-card .signal-full {
        font-size: clamp(16px, 3.2cqw, 23px) !important;
        margin-bottom: 1% !important;
      }
      .signal-card .signal-desc {
        font-size: clamp(13px, 2.5cqw, 18px) !important;
        line-height: 1.35 !important;
      }
      .signal-card .signal-detail {
        font-size: clamp(9px, 1.8cqw, 14px) !important;
        margin-top: 0.5% !important;
      }

      /* Feature-benefit overrides (dense benefit lists) */
      .feature-benefit {
        padding: clamp(5px, 1cqw, 10px) !important;
        margin-bottom: 1.5% !important;
        gap: clamp(5px, 1cqw, 8px) !important;
      }
      .feature-benefit .benefit-icon {
        width: clamp(16px, 3cqw, 24px) !important;
        height: clamp(16px, 3cqw, 24px) !important;
        font-size: clamp(12px, 2.3cqw, 18px) !important;
      }
      .feature-benefit .benefit-title {
        font-size: clamp(13px, 2.5cqw, 18px) !important;
        margin-bottom: 0.5% !important;
      }
      .feature-benefit .benefit-desc {
        font-size: clamp(12px, 2.1cqw, 16px) !important;
        line-height: 1.3 !important;
      }

      /* Premium feature overrides */
      .premium-feature {
        padding: clamp(6px, 1.2cqw, 12px) !important;
        margin-bottom: 1% !important;
      }
      .premium-feature .premium-feature-title {
        font-size: clamp(12px, 2.3cqw, 16px) !important;
      }
      .premium-feature .premium-feature-desc {
        font-size: clamp(10px, 2.1cqw, 15px) !important;
        line-height: 1.3 !important;
      }

      /* Cycle row overrides */
      .cycle-row {
        padding: clamp(5px, 1cqw, 10px) clamp(8px, 1.6cqw, 16px) !important;
        margin-bottom: clamp(3px, 0.6cqw, 6px) !important;
      }
      .cycle-row .cycle-label {
        font-size: clamp(13px, 2.5cqw, 18px) !important;
      }
      .cycle-row .cycle-meaning {
        font-size: clamp(13px, 2.5cqw, 18px) !important;
      }

      /* Feat cards (post-065 slide 6 pattern) */
      .feat-card {
        padding: clamp(6px, 1.2cqw, 12px) !important;
      }

      /* ===== Post-specific custom class upscaling ===== */

      /* --- Answer cards (post-033 pattern) --- */
      .answer-label {
        font-size: clamp(16px, 4cqw, 23px) !important;
        letter-spacing: 2px !important;
      }
      .answer-title {
        font-size: clamp(32px, 8cqw, 48px) !important;
      }
      .answer-desc {
        font-size: clamp(23px, 5.8cqw, 35px) !important;
        line-height: 1.5 !important;
      }

      /* --- Risk scenario cards --- */
      .risk-pct {
        font-size: clamp(28px, 6.9cqw, 41px) !important;
      }
      .risk-remain {
        font-size: clamp(23px, 5.8cqw, 35px) !important;
      }
      .risk-desc {
        font-size: clamp(21px, 5.2cqw, 32px) !important;
        line-height: 1.5 !important;
      }
      .risk-label {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
        letter-spacing: 1px !important;
      }
      .risk-bar {
        height: clamp(10px, 2cqw, 16px) !important;
      }

      /* --- Scenario cards (post-044 pattern) --- */
      .scenario-label {
        font-size: clamp(16px, 4cqw, 23px) !important;
        letter-spacing: 2px !important;
      }
      .scenario-desc {
        font-size: clamp(23px, 5.8cqw, 35px) !important;
        line-height: 1.5 !important;
        color: var(--txt2) !important;
      }
      .scenario-desc em {
        color: var(--txt) !important;
      }
      .scenario-badge {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
        padding: clamp(4px, 0.8cqw, 7px) clamp(8px, 1.6cqw, 14px) !important;
      }
      .scenario-insight-text {
        font-size: clamp(23px, 5.8cqw, 35px) !important;
        line-height: 1.5 !important;
      }

      /* --- Excuse items --- */
      .excuse-x {
        font-size: clamp(21px, 5.2cqw, 30px) !important;
      }
      .excuse-text {
        font-size: clamp(23px, 5.8cqw, 35px) !important;
      }
      .excuse-item {
        padding: clamp(12px, 2.5cqw, 20px) !important;
        gap: clamp(10px, 2cqw, 18px) !important;
      }

      /* --- Formula / Example cards --- */
      .formula-label, .example-label {
        font-size: clamp(16px, 4cqw, 23px) !important;
        letter-spacing: 2px !important;
      }
      .formula-exp {
        font-size: clamp(21px, 5.2cqw, 30px) !important;
        line-height: 1.7 !important;
      }
      .ex-key {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
      }
      .ex-val {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
      }
      .example-row {
        padding: clamp(5px, 1cqw, 10px) 0 !important;
      }

      /* --- VP chart elements (post-043 pattern) --- */
      .vp-tick {
        font-size: clamp(12px, 2.3cqw, 18px) !important;
      }
      .vp-pointer {
        font-size: clamp(16px, 4cqw, 23px) !important;
      }
      .vp-bar {
        height: clamp(8px, 1.5cqw, 14px) !important;
      }

      /* --- Zone cards (HVN / LVN pattern) --- */
      .zone-name {
        font-size: clamp(32px, 8cqw, 48px) !important;
      }
      .zone-full {
        font-size: clamp(16px, 4cqw, 23px) !important;
      }
      .zone-desc {
        font-size: clamp(23px, 5.8cqw, 35px) !important;
        line-height: 1.5 !important;
      }
      .zone-insight {
        font-size: clamp(23px, 5.8cqw, 35px) !important;
        line-height: 1.5 !important;
      }
      .zone-badge {
        width: clamp(48px, 9cqw, 72px) !important;
        height: clamp(48px, 9cqw, 72px) !important;
        font-size: clamp(25px, 5.8cqw, 41px) !important;
      }

      /* --- Legend / Annotation labels --- */
      .legend-text {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
      }
      .legend-dot {
        width: clamp(10px, 2cqw, 16px) !important;
        height: clamp(10px, 2cqw, 16px) !important;
      }
      .ann-tag {
        font-size: clamp(12px, 2.3cqw, 18px) !important;
      }

      /* --- Indicator cards (post-040/045/050/055 patterns) --- */
      .indicator-desc {
        font-size: clamp(21px, 5.2cqw, 32px) !important;
        line-height: 1.5 !important;
      }
      .indicator-codename {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
      }
      .section-sub {
        font-size: clamp(30px, 7.5cqw, 46px) !important;
        line-height: 1.5 !important;
      }
      .truth-card-title {
        font-size: clamp(25px, 6.3cqw, 39px) !important;
      }
      .cta-stat-text {
        font-size: clamp(18px, 4.6cqw, 30px) !important;
      }

      /* --- Risk-Reward Display (post-042 pattern) --- */
      .rr-box .rr-num {
        font-size: clamp(41px, 10.3cqw, 64px) !important;
      }
      .rr-box .rr-label {
        font-size: clamp(16px, 4cqw, 23px) !important;
        letter-spacing: 2px !important;
      }
      .rr-colon {
        font-size: clamp(28px, 6.9cqw, 41px) !important;
      }
      .rr-display {
        gap: clamp(12px, 2.5cqw, 24px) !important;
        margin-bottom: clamp(16px, 3cqw, 28px) !important;
      }
      .rr-box {
        padding: clamp(16px, 3cqw, 28px) clamp(14px, 2.8cqw, 24px) !important;
        min-width: clamp(100px, 20cqw, 180px) !important;
      }

      /* --- Winrate Section (post-042 pattern) --- */
      .winrate-label {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
        letter-spacing: 2px !important;
      }
      .winrate-value {
        font-size: clamp(32px, 8cqw, 48px) !important;
      }
      .winrate-desc {
        font-size: clamp(16px, 4cqw, 23px) !important;
      }
      .winrate-insight {
        font-size: clamp(23px, 5.8cqw, 35px) !important;
        line-height: 1.5 !important;
      }
      .winrate-insight em {
        font-style: normal !important;
      }
      .winrate-bar {
        height: clamp(8px, 1.5cqw, 12px) !important;
      }
      .winrate-section {
        padding: clamp(16px, 3cqw, 28px) !important;
      }

      /* --- Compare Table (post-042 pattern) --- */
      .ct-header span {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
        letter-spacing: 2px !important;
      }
      .ct-cell .ct-ratio {
        font-size: clamp(23px, 5.8cqw, 35px) !important;
      }
      .ct-cell .ct-val {
        font-size: clamp(25px, 6.3cqw, 37px) !important;
      }
      .ct-cell .ct-tag {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
        padding: 4px 10px !important;
      }
      .ct-row {
        padding: clamp(12px, 2.5cqw, 20px) clamp(10px, 2cqw, 18px) !important;
      }
      .ct-bar-wrap {
        height: clamp(5px, 1cqw, 8px) !important;
      }

      /* --- Status Display (post-048 pattern) --- */
      .status-box .sb-val {
        font-size: clamp(37px, 9.2cqw, 55px) !important;
      }
      .status-box .sb-lbl {
        font-size: clamp(16px, 4cqw, 23px) !important;
        letter-spacing: 2px !important;
      }
      .status-vs {
        font-size: clamp(28px, 6.9cqw, 41px) !important;
      }
      .status-tag {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
        padding: 4px 12px !important;
      }

      /* --- Merge Flow (post-048 pattern) --- */
      .merge-chip {
        font-size: clamp(16px, 4cqw, 23px) !important;
        padding: clamp(8px, 1.5cqw, 14px) clamp(12px, 2.5cqw, 20px) !important;
      }
      .merge-arrow {
        font-size: clamp(32px, 8cqw, 48px) !important;
      }
      .merge-result {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
        padding: clamp(18px, 3.5cqw, 30px) clamp(12px, 2.5cqw, 20px) !important;
      }

      /* --- Alignment arrows (post-048 pattern) --- */
      .align-arrows {
        font-size: clamp(28px, 6.9cqw, 41px) !important;
      }
      .align-label {
        font-size: clamp(16px, 4cqw, 23px) !important;
        letter-spacing: 2px !important;
      }
      .align-desc {
        font-size: clamp(23px, 5.8cqw, 35px) !important;
        line-height: 1.5 !important;
      }

      /* --- Philosophy quote (post-048 pattern) --- */
      .phil-quote {
        font-size: clamp(32px, 8cqw, 48px) !important;
        line-height: 1.4 !important;
      }
      .phil-desc {
        font-size: clamp(28px, 6.9cqw, 41px) !important;
        line-height: 1.5 !important;
      }

      /* --- Reveal badge (post-048 pattern) --- */
      .reveal-badge {
        font-size: clamp(21px, 5.2cqw, 32px) !important;
        padding: clamp(10px, 2cqw, 16px) clamp(20px, 4cqw, 36px) !important;
      }

      /* --- Truth Box (teal/gold bordered quote) --- */
      .truth-box .tb-label {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
        letter-spacing: 2px !important;
      }
      .truth-box .tb-text {
        font-size: clamp(28px, 6.9cqw, 41px) !important;
        line-height: 1.5 !important;
      }

      /* --- Orb halves labels --- */
      .half-side .half-icon {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
      }
      .half-side .half-lbl {
        font-size: clamp(12px, 2.3cqw, 16px) !important;
      }

      /* --- Concept description (post-047 pattern) --- */
      .cd-main {
        font-size: clamp(28px, 6.9cqw, 41px) !important;
        line-height: 1.5 !important;
      }
      .cd-note {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
      }

      /* --- Step Flow (post-047 pattern) --- */
      .step-name {
        font-size: clamp(23px, 5.8cqw, 32px) !important;
      }
      .step-desc {
        font-size: clamp(18px, 4.6cqw, 25px) !important;
        line-height: 1.45 !important;
      }
      .step-ring .s-num {
        font-size: clamp(23px, 5.8cqw, 32px) !important;
      }
      .step-row {
        padding: clamp(14px, 2.8cqw, 24px) clamp(12px, 2.5cqw, 20px) !important;
      }

      /* --- Zone Card (post-047 pattern) --- */
      .zone-card .zc-label {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
        letter-spacing: 2px !important;
      }
      .zone-card .zc-title {
        font-size: clamp(32px, 8cqw, 48px) !important;
      }
      .zone-card .zc-desc {
        font-size: clamp(23px, 5.8cqw, 35px) !important;
        line-height: 1.5 !important;
      }

      /* --- Stop loss elements (post-046 pattern) --- */
      .stop-desc {
        font-size: clamp(28px, 6.9cqw, 41px) !important;
        line-height: 1.5 !important;
      }
      .stop-detail {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
      }
      .stop-type-tag {
        font-size: clamp(16px, 4cqw, 23px) !important;
        letter-spacing: 3px !important;
      }
      .big-stat {
        font-size: clamp(55px, 13.8cqw, 83px) !important;
      }

      /* --- Param / settings grid (post-060 pattern) --- */
      .param-key, .param-val {
        font-size: clamp(16px, 4cqw, 23px) !important;
      }
      .section-label {
        font-size: clamp(16px, 4cqw, 23px) !important;
        letter-spacing: 2px !important;
      }
      .row-setting-name {
        font-size: clamp(16px, 4cqw, 23px) !important;
      }
      .row-cell {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
      }
      .card-label {
        font-size: clamp(16px, 4cqw, 23px) !important;
      }

      /* --- Swing Ladder (post-049 pattern) --- */
      .swing-hilo {
        font-size: clamp(23px, 5.8cqw, 35px) !important;
        padding: clamp(6px, 1.2cqw, 12px) clamp(10px, 2cqw, 18px) !important;
      }
      .swing-arrow {
        font-size: clamp(28px, 6.9cqw, 41px) !important;
      }
      .swing-label {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
      }
      .swing-step {
        padding: clamp(14px, 2.8cqw, 24px) clamp(16px, 3.2cqw, 28px) !important;
      }

      /* --- Range Zone (post-049 pattern) --- */
      .zone-icon {
        font-size: clamp(16px, 4cqw, 25px) !important;
      }
      .zone-label-text {
        font-size: clamp(21px, 5.2cqw, 32px) !important;
      }
      .zone-arrows {
        font-size: clamp(46px, 11.5cqw, 69px) !important;
      }
      .zone-text {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
      }

      /* --- S/R Zone (post-052 pattern) --- */
      .sr-zone-badge {
        font-size: clamp(16px, 4cqw, 25px) !important;
        padding: clamp(6px, 1.2cqw, 10px) clamp(16px, 3.2cqw, 28px) !important;
      }
      .sr-action-label {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
      }
      .sr-action-arrow {
        font-size: clamp(32px, 8cqw, 48px) !important;
      }
      .sr-zone-repeat {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
      }
      .sr-zone-desc {
        font-size: clamp(21px, 5.2cqw, 32px) !important;
      }
      .sr-zone-arrows {
        font-size: clamp(28px, 6.9cqw, 41px) !important;
      }
      .sr-zone-arrows-mid {
        font-size: clamp(41px, 10.3cqw, 64px) !important;
      }
      .sr-zone-mid-text {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
      }

      /* --- Fail Visual (post-053 pattern) --- */
      .fail-stat-value {
        font-size: clamp(41px, 10.3cqw, 64px) !important;
      }
      .fail-stat-label {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
      }
      .fail-verdict-text {
        font-size: clamp(21px, 5.2cqw, 32px) !important;
      }
      .fail-verdict-icon {
        font-size: clamp(32px, 8cqw, 48px) !important;
      }
      .fail-balance-label {
        font-size: clamp(16px, 4cqw, 25px) !important;
      }
      .fail-balance-value {
        font-size: clamp(32px, 8cqw, 48px) !important;
      }
      .fail-balance-vs {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
      }
      .fail-tl-text {
        font-size: clamp(21px, 5.2cqw, 32px) !important;
      }
      .fail-tl-dot {
        width: clamp(16px, 3cqw, 24px) !important;
        height: clamp(16px, 3cqw, 24px) !important;
      }

      /* --- Cross Diagram (post-059 pattern) --- */
      .ma-name {
        font-size: clamp(16px, 4cqw, 25px) !important;
      }
      .ma-desc {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
      }
      .ma-cross-icon {
        font-size: clamp(28px, 6.9cqw, 41px) !important;
      }
      .cross-meaning-text {
        font-size: clamp(21px, 5.2cqw, 32px) !important;
      }

      /* --- Lag Timeline (post-059 pattern) --- */
      .lag-tl-label {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
      }
      .lag-tl-desc {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
      }
      .lag-tl-zone-label {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
      }

      /* ===== Gold Standard Architecture — layout overrides ===== */

      /* Teal/warm architecture: center content, compact padding */
      .slide-teal .slide-content,
      .slide-warm .slide-content {
        justify-content: center !important;
        padding: 2% 5% 8% 5% !important;
        gap: 1.2cqw !important;
      }
      /* Keep slide-1 centered (hook) */
      .slide-teal.slide-1 .slide-content,
      .slide-warm.slide-1 .slide-content {
        justify-content: center !important;
        padding: 6% 8% !important;
        gap: 2cqw !important;
      }
      /* Keep CTA slides centered */
      .slide-teal.slide-6 .slide-content,
      .slide-warm.slide-6 .slide-content,
      .slide-teal.slide-5:last-child .slide-content,
      .slide-warm.slide-5:last-child .slide-content {
        justify-content: center !important;
        padding: 4% 6% !important;
        gap: 2cqw !important;
      }

      /* Teal/warm grids — tighter gaps */
      .slide-teal .pillar-grid, .slide-warm .pillar-grid,
      .slide-teal .vision-grid, .slide-warm .vision-grid,
      .slide-teal .strat-grid, .slide-warm .strat-grid {
        gap: 1.5cqw !important;
      }
      .slide-teal .dive-stack, .slide-warm .dive-stack,
      .slide-teal .power-stack, .slide-warm .power-stack {
        gap: 1cqw !important;
      }
      .slide-teal .cycle-flow, .slide-warm .cycle-flow,
      .slide-teal .reading-flow, .slide-warm .reading-flow {
        gap: 0.8cqw !important;
      }
      /* Tighter internal card padding */
      .slide-teal .pillar-card, .slide-warm .pillar-card,
      .slide-teal .vision-card, .slide-warm .vision-card,
      .slide-teal .strat-card, .slide-warm .strat-card {
        padding: 1.5cqw !important;
        gap: 0.6cqw !important;
      }
      .slide-teal .dive-card, .slide-warm .dive-card,
      .slide-teal .power-card, .slide-warm .power-card {
        padding: 1.5cqw 2cqw !important;
        gap: 1.2cqw !important;
      }
      .slide-teal .cycle-step, .slide-warm .cycle-step,
      .slide-teal .reading-step, .slide-warm .reading-step {
        padding: 1.5cqw 2cqw !important;
        gap: 0.6cqw !important;
      }

      /* ===== Gold Standard Teal Architecture (post-077/078/047) ===== */

      /* Slide counter */
      .slide-counter {
        font-size: clamp(16px, 4cqw, 25px) !important;
        letter-spacing: 2px !important;
      }

      /* Hook elements */
      .blog-badge, .chronicle-badge {
        font-size: clamp(16px, 4cqw, 25px) !important;
        letter-spacing: 3px !important;
        padding: 6px 18px !important;
      }
      .hook-indicator, .char-indicator {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
        letter-spacing: 3px !important;
      }
      .hook-quote, .char-quote {
        font-size: clamp(28px, 6.9cqw, 39px) !important;
        line-height: 1.45 !important;
      }

      /* Pillar / Vision grid cards */
      .pillar-name, .vision-name {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
      }
      .pillar-desc, .vision-desc {
        font-size: clamp(17px, 4.3cqw, 24px) !important;
        line-height: 1.4 !important;
      }
      .pillar-label, .vision-label {
        font-size: clamp(12px, 2.8cqw, 16px) !important;
        letter-spacing: 1px !important;
      }
      .pillar-icon, .vision-icon {
        font-size: clamp(21px, 5.2cqw, 32px) !important;
      }
      .pillar-ring, .vision-ring {
        width: clamp(40px, 8cqw, 60px) !important;
        height: clamp(40px, 8cqw, 60px) !important;
      }
      .pillar-bar, .vision-bar {
        height: clamp(5px, 1cqw, 8px) !important;
      }

      /* Dive / Power cards (horizontal layout) */
      .dive-name, .power-name {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
      }
      .dive-desc, .power-desc {
        font-size: clamp(17px, 4.3cqw, 24px) !important;
        line-height: 1.35 !important;
      }
      .dive-label, .power-label {
        font-size: clamp(12px, 2.8cqw, 16px) !important;
        letter-spacing: 1px !important;
      }
      .dive-icon-sym, .power-icon-sym {
        font-size: clamp(21px, 5.2cqw, 32px) !important;
      }
      .dive-icon-circle, .power-icon-circle {
        width: clamp(42px, 8.5cqw, 64px) !important;
        height: clamp(42px, 8.5cqw, 64px) !important;
      }
      .dive-bar, .power-bar {
        height: clamp(5px, 1cqw, 8px) !important;
      }

      /* Cycle / Reading flow steps */
      .cycle-label, .reading-label {
        font-size: clamp(13px, 3.2cqw, 18px) !important;
        letter-spacing: 2px !important;
      }
      .cycle-text, .reading-text {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
      }
      .cycle-desc, .reading-desc {
        font-size: clamp(15px, 3.7cqw, 21px) !important;
        line-height: 1.35 !important;
      }
      .cycle-num, .reading-num {
        font-size: clamp(21px, 5.2cqw, 32px) !important;
      }
      .cycle-ring, .reading-ring {
        width: clamp(38px, 7.5cqw, 56px) !important;
        height: clamp(38px, 7.5cqw, 56px) !important;
      }
      .cycle-arrow, .reading-arrow {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
      }
      .cycle-truth, .reading-truth {
        font-size: clamp(21px, 5.2cqw, 30px) !important;
        line-height: 1.4 !important;
      }

      /* Strategy grid cards */
      .strat-name {
        font-size: clamp(23px, 5.8cqw, 35px) !important;
      }
      .strat-desc {
        font-size: clamp(18px, 4.6cqw, 25px) !important;
        line-height: 1.5 !important;
      }
      .strat-label {
        font-size: clamp(14px, 3.4cqw, 18px) !important;
        letter-spacing: 1px !important;
      }
      .strat-icon {
        font-size: clamp(25px, 6.3cqw, 41px) !important;
      }
      .strat-ring {
        width: clamp(52px, 10cqw, 80px) !important;
        height: clamp(52px, 10cqw, 80px) !important;
      }
      .strat-bar {
        height: clamp(6px, 1.2cqw, 10px) !important;
      }

      /* Strategy warning box */
      .strat-warn-label {
        font-size: clamp(16px, 4cqw, 23px) !important;
        letter-spacing: 2px !important;
      }
      .strat-warn-text {
        font-size: clamp(21px, 5.2cqw, 30px) !important;
        line-height: 1.55 !important;
      }

      /* CTA stat recap (teal gold standard) */
      .stat-recap .stat-num, .stat-card .stat-num {
        font-size: clamp(25px, 6.3cqw, 39px) !important;
      }
      .stat-recap .stat-name, .stat-card .stat-name {
        font-size: clamp(18px, 4.6cqw, 25px) !important;
      }
      .stat-recap .stat-val, .stat-card .stat-val {
        font-size: clamp(14px, 3.4cqw, 18px) !important;
      }
      .stat-ring {
        width: clamp(38px, 7.5cqw, 56px) !important;
        height: clamp(38px, 7.5cqw, 56px) !important;
      }

      /* CTA elements (teal gold standard) */
      .cta-glow-icon {
        font-size: clamp(32px, 8cqw, 51px) !important;
      }
      .cta-tagline {
        font-size: clamp(37px, 9.2cqw, 60px) !important;
      }
      .cta-desc {
        font-size: clamp(23px, 5.8cqw, 32px) !important;
        line-height: 1.5 !important;
      }
      .cta-pill {
        font-size: clamp(16px, 4cqw, 23px) !important;
        padding: 6px 14px !important;
      }
      .cta-box-text {
        font-size: clamp(25px, 6.3cqw, 37px) !important;
      }
      .cta-link {
        font-size: clamp(23px, 5.8cqw, 32px) !important;
      }

      /* Slide logo */
      .slide-logo {
        font-size: clamp(12px, 2.9cqw, 16px) !important;
        letter-spacing: 3px !important;
        padding-bottom: 1.5cqw !important;
        margin-top: auto !important;
      }

      /* Teal/warm slide titles — reduce margin on content slides */
      .slide-teal:not(.slide-1) .slide-title,
      .slide-warm:not(.slide-1) .slide-title,
      .slide-teal:not(.slide-1) .section-title,
      .slide-warm:not(.slide-1) .section-title {
        margin-bottom: 1.5% !important;
      }

      /* ===== Warm Gold Standard Architecture — class-specific upscaling ===== */

      /* S1 hook elements */
      .s1-prod-label {
        font-size: clamp(16px, 4cqw, 25px) !important;
        letter-spacing: 4px !important;
        padding: clamp(6px, 1.2cqw, 12px) clamp(16px, 3cqw, 28px) !important;
      }
      .s1-hook {
        font-size: clamp(41px, 9.2cqw, 64px) !important;
      }
      .s1-sub {
        font-size: clamp(18px, 4.6cqw, 25px) !important;
        letter-spacing: 3px !important;
      }
      .s1-divider {
        width: 80px !important;
        height: 3px !important;
      }

      /* Obsession block (post-044 v2 — slide 2) */
      .obsess-label {
        font-size: clamp(16px, 4cqw, 25px) !important;
        letter-spacing: 3px !important;
      }
      .obsess-text {
        font-size: clamp(28px, 6.3cqw, 44px) !important;
        line-height: 1.4 !important;
      }
      .obsess-verdict-text {
        font-size: clamp(25px, 6.3cqw, 39px) !important;
        line-height: 1.4 !important;
      }

      /* Graveyard cards (post-044 v2 — slide 3) */
      .grave-pair {
        font-size: clamp(21px, 5.2cqw, 32px) !important;
      }
      .grave-result {
        font-size: clamp(16px, 4cqw, 25px) !important;
        padding: clamp(4px, 0.8cqw, 7px) clamp(8px, 1.6cqw, 14px) !important;
      }
      .grave-story {
        font-size: clamp(18px, 4.6cqw, 25px) !important;
        line-height: 1.45 !important;
      }
      .grave-cause {
        font-size: clamp(15px, 3.4cqw, 21px) !important;
        letter-spacing: 2px !important;
      }
      .grave-truth-text {
        font-size: clamp(23px, 5.8cqw, 35px) !important;
        line-height: 1.4 !important;
      }

      /* Scale visual (post-044 v2 — slide 4) */
      .scale-pan-label {
        font-size: clamp(18px, 4.6cqw, 25px) !important;
        letter-spacing: 3px !important;
      }
      .scale-pan-symbol {
        font-size: clamp(25px, 5.8cqw, 39px) !important;
      }
      .scale-pan-icon {
        width: clamp(50px, 10cqw, 80px) !important;
        height: clamp(50px, 10cqw, 80px) !important;
      }
      .scale-item {
        font-size: clamp(16px, 4cqw, 23px) !important;
        line-height: 1.4 !important;
      }
      .scale-insight {
        font-size: clamp(23px, 5.8cqw, 35px) !important;
        line-height: 1.5 !important;
      }

      /* Shift columns (post-044 v2 — slide 5) */
      .shift-col-header {
        font-size: clamp(18px, 4.6cqw, 25px) !important;
        letter-spacing: 3px !important;
      }
      .shift-item-text {
        font-size: clamp(17px, 4cqw, 25px) !important;
        line-height: 1.4 !important;
      }
      .shift-truth-text {
        font-size: clamp(25px, 6.3cqw, 39px) !important;
        line-height: 1.4 !important;
      }

      /* Post-085 warm architecture classes */
      .cat-name {
        font-size: clamp(18px, 4cqw, 28px) !important;
      }
      .cat-desc {
        font-size: clamp(14px, 2.9cqw, 21px) !important;
      }
      .cat-icon-symbol {
        font-size: clamp(21px, 4.6cqw, 35px) !important;
      }
      .conf-text {
        font-size: clamp(21px, 5.2cqw, 32px) !important;
      }
      .conf-desc {
        font-size: clamp(16px, 3.4cqw, 23px) !important;
        line-height: 1.4 !important;
      }
      .conf-step-label {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
        letter-spacing: 2px !important;
      }
      .conf-num {
        font-size: clamp(25px, 5.8cqw, 39px) !important;
      }
      .conf-demo-label {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
      }
      .conf-demo-desc {
        font-size: clamp(16px, 3.4cqw, 23px) !important;
      }
      .s2-total-text {
        font-size: clamp(21px, 4.6cqw, 30px) !important;
      }
      .feat-card-title {
        font-size: clamp(21px, 5.2cqw, 32px) !important;
      }
      .feat-card-desc {
        font-size: clamp(16px, 3.4cqw, 23px) !important;
        line-height: 1.4 !important;
      }
      .feat-bar-label {
        font-size: clamp(13px, 2.9cqw, 18px) !important;
      }
      .feat-icon-letter {
        font-size: clamp(21px, 4.6cqw, 32px) !important;
      }
      .stat-ring-val {
        font-size: clamp(25px, 5.8cqw, 39px) !important;
      }
      .stat-ring-label {
        font-size: clamp(16px, 3.4cqw, 23px) !important;
      }
      .stat-ring-sub {
        font-size: clamp(13px, 2.9cqw, 18px) !important;
      }
      .nr-badge {
        font-size: clamp(16px, 3.4cqw, 23px) !important;
      }

      /* Warm architecture stat recap / CTA */
      .stat-recap-num {
        font-size: clamp(21px, 4.6cqw, 32px) !important;
      }
      .stat-recap-label {
        font-size: clamp(16px, 3.4cqw, 23px) !important;
      }
      .stat-recap-val {
        font-size: clamp(14px, 2.9cqw, 18px) !important;
      }
      .stat-recap-ring {
        width: clamp(44px, 8.5cqw, 68px) !important;
        height: clamp(44px, 8.5cqw, 68px) !important;
      }
      .cta-glow-icon {
        font-size: clamp(32px, 6.9cqw, 55px) !important;
      }
      .cta-tagline {
        font-size: clamp(37px, 9.2cqw, 60px) !important;
      }
      .cta-desc {
        font-size: clamp(21px, 5.2cqw, 30px) !important;
        line-height: 1.5 !important;
      }
      .cta-pill {
        font-size: clamp(16px, 4cqw, 23px) !important;
        padding: 5px 14px !important;
      }
      .cta-box-text {
        font-size: clamp(23px, 5.8cqw, 35px) !important;
      }
      .cta-link {
        font-size: clamp(21px, 5.2cqw, 30px) !important;
      }

      /* --- Doji Anatomy (post-056 pattern) --- */
      .da-part {
        font-size: clamp(21px, 5.2cqw, 32px) !important;
      }
      .da-meaning {
        font-size: clamp(16px, 4cqw, 25px) !important;
      }
      .type-badge {
        font-size: clamp(14px, 3.4cqw, 21px) !important;
      }
      .confirm-step {
        font-size: clamp(18px, 4.6cqw, 28px) !important;
      }
      .confirm-arrow {
        font-size: clamp(28px, 6.9cqw, 41px) !important;
      }

      /* ===== Old Architecture — feature cards (post-045/050) ===== */
      .feature-text {
        font-size: clamp(21px, 5.2cqw, 30px) !important;
        font-weight: 600 !important;
      }
      .feature-desc {
        font-size: clamp(18px, 4.6cqw, 25px) !important;
        line-height: 1.45 !important;
      }
      .feature-ic, .fic-letter {
        min-width: clamp(32px, 6cqw, 44px) !important;
        min-height: clamp(32px, 6cqw, 44px) !important;
      }
      .fic-letter {
        font-size: clamp(21px, 5.2cqw, 30px) !important;
      }
      .inner-heading {
        font-size: clamp(37px, 8cqw, 55px) !important;
      }
      .indicator-bar {
        height: clamp(5px, 1cqw, 8px) !important;
      }

      /* ===== Old Architecture — definition cards (post-045/050 slide 2/3) ===== */
      .def-name {
        font-size: clamp(23px, 5.8cqw, 32px) !important;
        font-weight: 600 !important;
      }
      .def-tag {
        font-size: clamp(15px, 3.7cqw, 21px) !important;
        letter-spacing: 2px !important;
      }
      .def-desc {
        font-size: clamp(18px, 4.6cqw, 25px) !important;
        line-height: 1.45 !important;
      }

      /* ===== Old Architecture — access cards (post-051) ===== */
      .access-name {
        font-size: clamp(23px, 5.8cqw, 32px) !important;
        font-weight: 600 !important;
      }
      .access-desc {
        font-size: clamp(18px, 4.6cqw, 25px) !important;
        line-height: 1.45 !important;
      }
      .access-bar {
        height: clamp(4px, 0.8cqw, 8px) !important;
      }

      /* ===== Old Architecture — promise / philosophy (post-051) ===== */
      .promise-card-title {
        font-size: clamp(23px, 5.8cqw, 32px) !important;
        font-weight: 600 !important;
      }
      .promise-card-text {
        font-size: clamp(18px, 4.6cqw, 25px) !important;
        line-height: 1.45 !important;
      }
      .philosophy-text {
        font-size: clamp(25px, 6.3cqw, 37px) !important;
        line-height: 1.5 !important;
      }

      /* ===== Old Architecture — stat pills ===== */
      .stat-pill .stat-val {
        font-size: clamp(28px, 6.9cqw, 41px) !important;
        font-weight: 600 !important;
      }
      .stat-pill .stat-label {
        font-size: clamp(16px, 4cqw, 23px) !important;
      }
      .cta-stat-val {
        font-size: clamp(28px, 6.9cqw, 41px) !important;
        font-weight: 600 !important;
      }
      .cta-stat-label {
        font-size: clamp(15px, 3.7cqw, 21px) !important;
      }
    </style>
  `;
  html = html.replace('</head>', renderStyles + '</head>');

  // Write to temp file so file:// URLs resolve correctly
  const { writeFileSync, unlinkSync } = await import('fs');
  const tmpHtml = join(postDir, '_render_temp.html');
  writeFileSync(tmpHtml, html);
  await page.goto(`file://${tmpHtml}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  try { unlinkSync(tmpHtml); } catch {}

  // Delay for fonts to load
  await page.evaluate(() => new Promise(r => setTimeout(r, 500)));

  // Activate Export Mode and fix branding text
  const slideCount = await page.evaluate(() => {
    document.body.classList.add('export-mode');

    // Convert <img> logo elements to text spans (fixes broken image icon)
    document.querySelectorAll('img.logo, img.cine-logo, img.brand-mark').forEach(img => {
      const span = document.createElement('span');
      span.className = 'brand-mark';
      span.textContent = 'SIGNAL PILOT';
      img.parentNode.replaceChild(span, img);
    });

    // Convert .slide-logo → .brand-mark for consistent render styling (prevents duplicates)
    document.querySelectorAll('.slide-logo').forEach(el => {
      const span = document.createElement('span');
      span.className = 'brand-mark';
      span.textContent = 'SIGNAL PILOT';
      el.parentNode.replaceChild(span, el);
    });

    // Fix "SignalPilot" → "Signal Pilot" and "SIGNALPILOT" → "SIGNAL PILOT"
    document.querySelectorAll('.cine-logo, .brand-mark, .logo, .brand-footer, .cta-button').forEach(el => {
      el.textContent = el.textContent
        .replace(/SignalPilot/g, 'Signal Pilot')
        .replace(/SIGNALPILOT/g, 'SIGNAL PILOT');
    });

    // Inject "SIGNAL PILOT" branding on EVERY slide that doesn't already have it
    document.querySelectorAll('.slide-wrapper').forEach(w => {
      if (!w.querySelector('.brand-mark, .cine-logo, .brand-footer')) {
        const container = w.querySelector('.slide-content') || w;
        const brand = document.createElement('span');
        brand.className = 'brand-mark';
        brand.textContent = 'SIGNAL PILOT';
        container.appendChild(brand);
      }
    });

    const wrappers = document.querySelectorAll('.slide-wrapper');
    wrappers.forEach(w => w.classList.remove('active'));
    return wrappers.length;
  });

  if (slideCount === 0) {
    console.log(`  Skipping post-${postNumber}: no .slide-wrapper elements found`);
    return 0;
  }

  const paddedNum = String(postNumber).padStart(3, '0');
  const outputDir = join(OUTPUT_DIR, `post-${paddedNum}`);
  mkdirSync(outputDir, { recursive: true });

  // Clean up stale PNGs from previous renders
  if (existsSync(outputDir)) {
    const oldFiles = readdirSync(outputDir).filter(f => /^slide-\d+\.png$/.test(f));
    for (const f of oldFiles) {
      const slideNum = parseInt(f.match(/slide-(\d+)/)[1], 10);
      if (slideNum > slideCount) {
        unlinkSync(join(outputDir, f));
      }
    }
  }

  for (let i = 0; i < slideCount; i++) {
    await page.evaluate((index) => {
      const wrappers = document.querySelectorAll('.slide-wrapper');
      wrappers.forEach((w, j) => w.classList.toggle('active', j === index));
    }, i);

    await page.evaluate(() => new Promise(r => setTimeout(r, 50)));

    await page.screenshot({
      path: join(outputDir, `slide-${i + 1}.png`),
      type: 'png',
      clip: { x: 0, y: 0, width: SLIDE_WIDTH, height: SLIDE_HEIGHT },
    });
  }

  console.log(`  Rendered post-${paddedNum}: ${slideCount} slide(s)`);
  return slideCount;
}

async function main() {
  const args = process.argv.slice(2);
  const startIdx = args.indexOf('--start');
  const endIdx = args.indexOf('--end');
  const start = startIdx !== -1 ? parseInt(args[startIdx + 1]) : 0;
  const end = endIdx !== -1 ? parseInt(args[endIdx + 1]) : 999;

  console.log('Rendering carousel HTML files to PNG images...');
  console.log(`  Source: ${SOCIAL_DIR}`);
  console.log(`  Output: ${OUTPUT_DIR}`);
  console.log(`  Dimensions: ${SLIDE_WIDTH}x${SLIDE_HEIGHT} (4:5 Instagram)`);
  console.log(`  Range: post ${start} to ${end}`);
  console.log('');

  if (!existsSync(SOCIAL_DIR)) {
    console.error(`Source directory not found: ${SOCIAL_DIR}`);
    process.exit(1);
  }

  // Find Chrome/Chromium binary
  const chromePaths = [
    '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
  ];
  let executablePath = chromePaths.find(p => existsSync(p));
  if (!executablePath) {
    try { executablePath = execSync('which chromium-browser || which chromium || which google-chrome', { encoding: 'utf8' }).trim(); }
    catch { /* ignore */ }
  }
  if (!executablePath) {
    console.error('No Chrome/Chromium found. Install chromium or set CHROME_PATH env var.');
    process.exit(1);
  }
  console.log(`  Browser: ${executablePath}`);

  const puppeteer = await import('puppeteer-core');
  const browser = await puppeteer.default.launch({
    executablePath,
    headless: 'new',
    args: [
      '--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu',
      '--disable-dev-shm-usage', '--disable-software-rasterizer',
      '--disable-extensions', '--disable-background-networking',
      '--disable-sync', '--disable-translate',
      '--no-first-run', '--no-zygote', '--single-process',
      '--font-render-hinting=none', '--allow-file-access-from-files',
    ],
    protocolTimeout: 120000,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: SLIDE_WIDTH, height: SLIDE_HEIGHT, deviceScaleFactor: 1 });

  const dirs = await new Promise((resolve, reject) => {
    readdir(SOCIAL_DIR, { withFileTypes: true }, (err, entries) => {
      if (err) reject(err);
      else resolve(entries.filter(e => e.isDirectory()).map(e => e.name).sort());
    });
  });

  let totalSlides = 0;
  let processed = 0;
  let skipped = 0;
  let errors = 0;

  const t0 = Date.now();

  for (const dir of dirs) {
    const match = dir.match(/^post-(\d+)$/);
    if (!match) continue;

    const postNumber = parseInt(match[1], 10);
    if (postNumber < start || postNumber > end) continue;

    try {
      const slides = await renderCarousel(page, join(SOCIAL_DIR, dir), postNumber);
      if (slides > 0) {
        totalSlides += slides;
        processed++;
      } else {
        skipped++;
      }
    } catch (err) {
      console.error(`  Error rendering ${dir}: ${err.message}`);
      errors++;
    }

    // Progress every 50 posts
    if (processed > 0 && processed % 50 === 0) {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
      const rate = (processed / (Date.now() - t0) * 1000).toFixed(1);
      console.log(`  Progress: ${processed} posts (${totalSlides} slides) in ${elapsed}s [${rate} posts/sec]`);
    }
  }

  await browser.close();

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log('');
  console.log(`Done! Rendered ${processed} posts (${totalSlides} slides) in ${elapsed}s`);
  if (skipped > 0) console.log(`  Skipped: ${skipped} (no carousel.html or no slides)`);
  if (errors > 0) console.log(`  Errors: ${errors}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
