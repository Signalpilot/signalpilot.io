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
        padding: 6% 8% !important;
        box-sizing: border-box !important;
      }

      /* ===== Font upscaling for Instagram readability ===== */

      /* Titles — big and centered */
      .slide-title, .header, .hook-main, .hook-title {
        font-size: clamp(36px, 8cqw, 56px) !important;
        margin-bottom: 4% !important;
        text-align: center !important;
        width: 100% !important;
      }
      .slide-title.large {
        font-size: clamp(40px, 9cqw, 64px) !important;
      }

      /* Section titles (h2/h3 inside slide-content) */
      .slide-content h2, .slide-content h3,
      .section-title {
        font-size: clamp(32px, 8cqw, 52px) !important;
        text-align: center !important;
      }

      /* Body text */
      .slide-body, .text {
        font-size: clamp(24px, 6cqw, 36px) !important;
        line-height: 1.65 !important;
        max-width: 95% !important;
        text-align: center !important;
      }

      /* Subtitles */
      .slide-subtitle, .hook-sub {
        font-size: clamp(20px, 5cqw, 30px) !important;
        letter-spacing: 3px !important;
        text-align: center !important;
      }

      /* Paragraphs and lists inside slide-content */
      .slide-content p {
        font-size: clamp(22px, 5.5cqw, 32px) !important;
        text-align: center !important;
      }
      .slide-content ul, .slide-content ol {
        font-size: clamp(22px, 5.5cqw, 32px) !important;
        max-width: 95% !important;
      }

      /* Combo titles and descriptions */
      .combo-title {
        font-size: clamp(28px, 7cqw, 44px) !important;
        font-weight: 700 !important;
      }
      .combo-desc {
        font-size: clamp(20px, 5cqw, 30px) !important;
        line-height: 1.5 !important;
      }
      .combo-arrows, .combo-emojis {
        font-size: clamp(40px, 10cqw, 64px) !important;
      }

      /* Signal items */
      .signal-item .label, .signal-item .name {
        font-size: clamp(18px, 4.5cqw, 28px) !important;
      }
      .signal-item .arrow, .signal-item .icon {
        font-size: clamp(32px, 8cqw, 48px) !important;
      }

      /* Divergence boxes */
      .divergence-title, .divergence-label {
        font-size: clamp(24px, 6cqw, 36px) !important;
        font-weight: 700 !important;
      }
      .divergence-desc {
        font-size: clamp(18px, 5cqw, 28px) !important;
      }

      /* Icons */
      .slide-icon, .icon {
        font-size: clamp(48px, 14cqw, 72px) !important;
        text-align: center !important;
      }

      /* Checklists */
      .checklist {
        font-size: clamp(22px, 5.5cqw, 32px) !important;
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
        font-size: clamp(20px, 5cqw, 28px) !important;
        font-weight: 600 !important;
        letter-spacing: 1px !important;
      }
      .cta-text, .cta-title {
        font-size: clamp(30px, 8cqw, 48px) !important;
        font-family: 'Cormorant Garamond', serif !important;
        font-weight: 600 !important;
        text-align: center !important;
      }
      .link-hint {
        font-size: clamp(16px, 4cqw, 24px) !important;
        margin-top: 3% !important;
        text-align: center !important;
      }

      /* Brand mark — Gugi font, centered at bottom */
      .brand-mark, .logo, .cine-logo {
        font-family: 'Gugi', sans-serif !important;
        font-size: clamp(14px, 3.5cqw, 20px) !important;
        letter-spacing: 4px !important;
      }
      .brand-mark {
        position: absolute !important;
        bottom: 5% !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        right: auto !important;
        text-align: center !important;
        width: auto !important;
      }
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

      /* Arrow lists */
      .arrow-list {
        font-size: clamp(24px, 6cqw, 36px) !important;
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
        font-size: clamp(28px, 7cqw, 44px) !important;
        font-weight: 600 !important;
      }
      .callout-box .callout-text {
        font-size: clamp(22px, 5.5cqw, 34px) !important;
        line-height: 1.6 !important;
      }

      /* Concept cards */
      .concept-card {
        max-width: 95% !important;
        padding: 5% 6% !important;
      }
      .concept-card .card-label {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }
      .concept-card .card-title {
        font-size: clamp(28px, 7cqw, 44px) !important;
        font-weight: 600 !important;
      }
      .concept-card .card-desc {
        font-size: clamp(22px, 5.5cqw, 34px) !important;
        line-height: 1.5 !important;
      }

      /* Data grid items */
      .data-grid {
        max-width: 95% !important;
      }
      .data-item .item-icon {
        font-size: clamp(32px, 8cqw, 48px) !important;
      }
      .data-item .item-value {
        font-size: clamp(28px, 7cqw, 44px) !important;
        font-weight: 600 !important;
      }
      .data-item .item-label {
        font-size: clamp(18px, 4.5cqw, 28px) !important;
        line-height: 1.4 !important;
      }

      /* Quote blocks */
      .quote-block {
        font-size: clamp(32px, 8cqw, 52px) !important;
        line-height: 1.5 !important;
        max-width: 90% !important;
      }
      .quote-attr {
        font-size: clamp(18px, 4.5cqw, 28px) !important;
      }

      /* Step flows */
      .step-flow {
        max-width: 95% !important;
      }
      .step-num {
        font-size: clamp(32px, 8cqw, 52px) !important;
        font-weight: 600 !important;
      }
      .step-text {
        font-size: clamp(22px, 5.5cqw, 34px) !important;
        line-height: 1.5 !important;
      }

      /* Stat values */
      .stat-value {
        font-size: clamp(36px, 9cqw, 56px) !important;
        font-weight: 600 !important;
      }
      .stat-label {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }

      /* Compare grids */
      .compare-grid {
        max-width: 95% !important;
      }
      .compare-item .compare-label {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }
      .compare-item .compare-text {
        font-size: clamp(22px, 5.5cqw, 34px) !important;
        line-height: 1.5 !important;
      }

      /* Indicator pills */
      .indicator-pill {
        font-size: clamp(20px, 5cqw, 30px) !important;
        padding: 2% 5% !important;
      }

      /* ===== Gold Standard Architecture — class-specific upscaling ===== */

      /* Section tags & labels (mono uppercase) */
      .hook-tag, .sec-tag, .lesson-tag, .cta-badge {
        font-size: clamp(14px, 3.5cqw, 22px) !important;
        letter-spacing: 3px !important;
      }

      /* Section titles (.sec-title is the gold standard equivalent of .section-title) */
      .sec-title {
        font-size: clamp(32px, 8cqw, 52px) !important;
        text-align: center !important;
      }

      /* --- Definition cards --- */
      .def-label {
        font-size: clamp(14px, 3.5cqw, 22px) !important;
        letter-spacing: 2px !important;
      }
      .def-quote {
        font-size: clamp(20px, 5cqw, 28px) !important;
      }
      .def-text {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
        line-height: 1.5 !important;
      }

      /* --- Factor / feature cards (2x2 / 2x3 grids) --- */
      .factor-card .fc-name {
        font-size: clamp(22px, 5.5cqw, 32px) !important;
      }
      .factor-card .fc-desc {
        font-size: clamp(16px, 4cqw, 24px) !important;
        line-height: 1.5 !important;
      }
      .factor-card .fc-tag {
        font-size: clamp(12px, 3cqw, 18px) !important;
        padding: 4px 12px !important;
      }
      .factor-card .fc-let {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
      }
      .factor-card .fc-icon {
        width: clamp(32px, 6cqw, 48px) !important;
        height: clamp(32px, 6cqw, 48px) !important;
      }

      /* --- Comparison cards --- */
      .compare-card .cc-label {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
        letter-spacing: 2px !important;
      }
      .compare-card .cc-quote {
        font-size: clamp(22px, 5.5cqw, 32px) !important;
      }
      .compare-card .cc-desc {
        font-size: clamp(16px, 4cqw, 24px) !important;
        line-height: 1.5 !important;
      }

      /* --- Truth cards --- */
      .truth-card .tc-title {
        font-size: clamp(20px, 5cqw, 30px) !important;
      }
      .truth-card .tc-desc {
        font-size: clamp(16px, 4cqw, 24px) !important;
        line-height: 1.5 !important;
      }
      .truth-quote {
        font-size: clamp(26px, 6.5cqw, 38px) !important;
        line-height: 1.5 !important;
      }

      /* --- Step flow --- */
      .step-name {
        font-size: clamp(20px, 5cqw, 30px) !important;
      }
      .step-desc {
        font-size: clamp(16px, 4cqw, 24px) !important;
        line-height: 1.5 !important;
      }
      .step-ring .s-num {
        font-size: clamp(20px, 5cqw, 30px) !important;
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
        font-size: clamp(20px, 5cqw, 32px) !important;
      }

      /* --- Warning / Alert / Insight boxes --- */
      .warn-label, .alert-label, .insight-label {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
        letter-spacing: 2px !important;
      }
      .warn-text, .alert-text, .insight-text {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
        line-height: 1.55 !important;
      }

      /* --- Info boxes --- */
      .info-box {
        background: rgba(94,234,212,0.15) !important;
        border: 2px solid rgba(94,234,212,0.45) !important;
        border-left: 5px solid rgba(94,234,212,1) !important;
        padding: clamp(14px, 3cqw, 22px) !important;
      }
      .info-label {
        font-size: clamp(12px, 3cqw, 18px) !important;
        letter-spacing: 2px !important;
        color: rgba(94,234,212,0.9) !important;
      }
      .info-text {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
        line-height: 1.6 !important;
        color: var(--txt) !important;
      }

      /* --- Stack / layer visualization --- */
      .stack-bar {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
        height: clamp(28px, 5.5cqw, 42px) !important;
      }
      .stack-result {
        font-size: clamp(16px, 4cqw, 22px) !important;
        height: clamp(32px, 6cqw, 48px) !important;
      }
      .stack-arrow {
        font-size: clamp(14px, 3cqw, 20px) !important;
      }

      /* --- CTA slide elements --- */
      .cta-sub {
        font-size: clamp(22px, 5.5cqw, 32px) !important;
        line-height: 1.5 !important;
      }
      .stat-cell .sv {
        font-size: clamp(28px, 7cqw, 42px) !important;
      }
      .stat-cell .sl {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
      }
      .pill {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
        padding: 5px 14px !important;
      }
      .cta-url {
        font-size: clamp(22px, 5.5cqw, 30px) !important;
      }
      .cta-hint {
        font-size: clamp(16px, 4cqw, 22px) !important;
      }

      /* --- Divergence visual elements --- */
      .da-label {
        font-size: clamp(12px, 3cqw, 18px) !important;
      }
      .diverge-vs {
        font-size: clamp(16px, 4cqw, 22px) !important;
      }
      .diverge-arrow .da-line {
        height: clamp(24px, 5cqw, 40px) !important;
        width: clamp(4px, 0.8cqw, 6px) !important;
      }

      /* --- Volume bar / flow ribbon labels --- */
      .flow-ribbon-labels {
        font-size: clamp(12px, 3cqw, 18px) !important;
      }
      .flow-ribbon {
        height: clamp(22px, 4.5cqw, 36px) !important;
      }
      .vol-bar-dot {
        font-size: clamp(8px, 2cqw, 14px) !important;
      }

      /* --- Progress bars (make thicker) --- */
      .prog-bar {
        height: clamp(5px, 1cqw, 8px) !important;
      }

      /* --- Orb / orb-sm letter --- */
      .orb-sm .orb-letter {
        font-size: clamp(28px, 7cqw, 44px) !important;
      }

      /* --- Scales labels inside orb --- */
      .scales-label {
        font-size: clamp(8px, 1.6cqw, 12px) !important;
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

      /* ===== Post-specific custom class upscaling ===== */

      /* --- Answer cards (post-033 pattern) --- */
      .answer-label {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
        letter-spacing: 2px !important;
      }
      .answer-title {
        font-size: clamp(28px, 7cqw, 42px) !important;
      }
      .answer-desc {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
        line-height: 1.5 !important;
      }

      /* --- Risk scenario cards --- */
      .risk-pct {
        font-size: clamp(24px, 6cqw, 36px) !important;
      }
      .risk-remain {
        font-size: clamp(20px, 5cqw, 30px) !important;
      }
      .risk-desc {
        font-size: clamp(16px, 4cqw, 24px) !important;
        line-height: 1.5 !important;
      }
      .risk-label {
        font-size: clamp(12px, 3cqw, 18px) !important;
        letter-spacing: 1px !important;
      }
      .risk-bar {
        height: clamp(10px, 2cqw, 16px) !important;
      }

      /* --- Scenario cards (post-044 pattern) --- */
      .scenario-label {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
        letter-spacing: 2px !important;
      }
      .scenario-desc {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
        line-height: 1.5 !important;
        color: var(--txt2) !important;
      }
      .scenario-desc em {
        color: var(--txt) !important;
      }
      .scenario-badge {
        font-size: clamp(12px, 3cqw, 18px) !important;
        padding: clamp(4px, 0.8cqw, 7px) clamp(8px, 1.6cqw, 14px) !important;
      }
      .scenario-insight-text {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
        line-height: 1.5 !important;
      }

      /* --- Excuse items --- */
      .excuse-x {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
      }
      .excuse-text {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
      }
      .excuse-item {
        padding: clamp(12px, 2.5cqw, 20px) !important;
        gap: clamp(10px, 2cqw, 18px) !important;
      }

      /* --- Formula / Example cards --- */
      .formula-label, .example-label {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
        letter-spacing: 2px !important;
      }
      .formula-exp {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
        line-height: 1.7 !important;
      }
      .ex-key {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }
      .ex-val {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }
      .example-row {
        padding: clamp(5px, 1cqw, 10px) 0 !important;
      }

      /* --- VP chart elements (post-043 pattern) --- */
      .vp-tick {
        font-size: clamp(10px, 2cqw, 16px) !important;
      }
      .vp-pointer {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
      }
      .vp-bar {
        height: clamp(8px, 1.5cqw, 14px) !important;
      }

      /* --- Zone cards (HVN / LVN pattern) --- */
      .zone-name {
        font-size: clamp(28px, 7cqw, 42px) !important;
      }
      .zone-full {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
      }
      .zone-desc {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
        line-height: 1.5 !important;
      }
      .zone-insight {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
        line-height: 1.5 !important;
      }
      .zone-badge {
        width: clamp(48px, 9cqw, 72px) !important;
        height: clamp(48px, 9cqw, 72px) !important;
        font-size: clamp(22px, 5cqw, 36px) !important;
      }

      /* --- Legend / Annotation labels --- */
      .legend-text {
        font-size: clamp(12px, 3cqw, 18px) !important;
      }
      .legend-dot {
        width: clamp(10px, 2cqw, 16px) !important;
        height: clamp(10px, 2cqw, 16px) !important;
      }
      .ann-tag {
        font-size: clamp(10px, 2cqw, 16px) !important;
      }

      /* --- Indicator cards (post-040/045/050/055 patterns) --- */
      .indicator-desc {
        font-size: clamp(16px, 4cqw, 24px) !important;
        line-height: 1.5 !important;
      }
      .indicator-codename {
        font-size: clamp(12px, 3cqw, 18px) !important;
      }
      .section-sub {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
        line-height: 1.5 !important;
      }
      .truth-card-title {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
      }
      .cta-stat-text {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
      }

      /* --- Risk-Reward Display (post-042 pattern) --- */
      .rr-box .rr-num {
        font-size: clamp(36px, 9cqw, 56px) !important;
      }
      .rr-box .rr-label {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
        letter-spacing: 2px !important;
      }
      .rr-colon {
        font-size: clamp(24px, 6cqw, 36px) !important;
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
        font-size: clamp(12px, 3cqw, 18px) !important;
        letter-spacing: 2px !important;
      }
      .winrate-value {
        font-size: clamp(28px, 7cqw, 42px) !important;
      }
      .winrate-desc {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
      }
      .winrate-insight {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
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
        font-size: clamp(12px, 3cqw, 18px) !important;
        letter-spacing: 2px !important;
      }
      .ct-cell .ct-ratio {
        font-size: clamp(20px, 5cqw, 30px) !important;
      }
      .ct-cell .ct-val {
        font-size: clamp(22px, 5.5cqw, 32px) !important;
      }
      .ct-cell .ct-tag {
        font-size: clamp(12px, 3cqw, 18px) !important;
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
        font-size: clamp(32px, 8cqw, 48px) !important;
      }
      .status-box .sb-lbl {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
        letter-spacing: 2px !important;
      }
      .status-vs {
        font-size: clamp(24px, 6cqw, 36px) !important;
      }
      .status-tag {
        font-size: clamp(12px, 3cqw, 18px) !important;
        padding: 4px 12px !important;
      }

      /* --- Merge Flow (post-048 pattern) --- */
      .merge-chip {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
        padding: clamp(8px, 1.5cqw, 14px) clamp(12px, 2.5cqw, 20px) !important;
      }
      .merge-arrow {
        font-size: clamp(28px, 7cqw, 42px) !important;
      }
      .merge-result {
        font-size: clamp(16px, 4cqw, 24px) !important;
        padding: clamp(18px, 3.5cqw, 30px) clamp(12px, 2.5cqw, 20px) !important;
      }

      /* --- Alignment arrows (post-048 pattern) --- */
      .align-arrows {
        font-size: clamp(24px, 6cqw, 36px) !important;
      }
      .align-label {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
        letter-spacing: 2px !important;
      }
      .align-desc {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
        line-height: 1.5 !important;
      }

      /* --- Philosophy quote (post-048 pattern) --- */
      .phil-quote {
        font-size: clamp(28px, 7cqw, 42px) !important;
        line-height: 1.4 !important;
      }
      .phil-desc {
        font-size: clamp(20px, 5cqw, 30px) !important;
        line-height: 1.5 !important;
      }

      /* --- Reveal badge (post-048 pattern) --- */
      .reveal-badge {
        font-size: clamp(18px, 4.5cqw, 28px) !important;
        padding: clamp(10px, 2cqw, 16px) clamp(20px, 4cqw, 36px) !important;
      }

      /* --- Truth Box (teal/gold bordered quote) --- */
      .truth-box .tb-label {
        font-size: clamp(12px, 3cqw, 18px) !important;
        letter-spacing: 2px !important;
      }
      .truth-box .tb-text {
        font-size: clamp(20px, 5cqw, 30px) !important;
        line-height: 1.5 !important;
      }

      /* --- Orb halves labels --- */
      .half-side .half-icon {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }
      .half-side .half-lbl {
        font-size: clamp(10px, 2cqw, 14px) !important;
      }

      /* --- Concept description (post-047 pattern) --- */
      .cd-main {
        font-size: clamp(20px, 5cqw, 30px) !important;
        line-height: 1.5 !important;
      }
      .cd-note {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }

      /* --- Step Flow (post-047 pattern) --- */
      .step-name {
        font-size: clamp(20px, 5cqw, 30px) !important;
      }
      .step-desc {
        font-size: clamp(16px, 4cqw, 24px) !important;
        line-height: 1.5 !important;
      }
      .step-ring .s-num {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
      }
      .step-row {
        padding: clamp(14px, 2.8cqw, 24px) clamp(12px, 2.5cqw, 20px) !important;
      }

      /* --- Zone Card (post-047 pattern) --- */
      .zone-card .zc-label {
        font-size: clamp(12px, 3cqw, 18px) !important;
        letter-spacing: 2px !important;
      }
      .zone-card .zc-title {
        font-size: clamp(28px, 7cqw, 42px) !important;
      }
      .zone-card .zc-desc {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
        line-height: 1.5 !important;
      }

      /* --- Stop loss elements (post-046 pattern) --- */
      .stop-desc {
        font-size: clamp(20px, 5cqw, 30px) !important;
        line-height: 1.5 !important;
      }
      .stop-detail {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }
      .stop-type-tag {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
        letter-spacing: 3px !important;
      }
      .big-stat {
        font-size: clamp(48px, 12cqw, 72px) !important;
      }

      /* --- Param / settings grid (post-060 pattern) --- */
      .param-key, .param-val {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
      }
      .section-label {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
        letter-spacing: 2px !important;
      }
      .row-setting-name {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
      }
      .row-cell {
        font-size: clamp(12px, 3cqw, 18px) !important;
      }
      .card-label {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
      }

      /* --- Swing Ladder (post-049 pattern) --- */
      .swing-hilo {
        font-size: clamp(20px, 5cqw, 30px) !important;
        padding: clamp(6px, 1.2cqw, 12px) clamp(10px, 2cqw, 18px) !important;
      }
      .swing-arrow {
        font-size: clamp(24px, 6cqw, 36px) !important;
      }
      .swing-label {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }
      .swing-step {
        padding: clamp(14px, 2.8cqw, 24px) clamp(16px, 3.2cqw, 28px) !important;
      }

      /* --- Range Zone (post-049 pattern) --- */
      .zone-icon {
        font-size: clamp(14px, 3.5cqw, 22px) !important;
      }
      .zone-label-text {
        font-size: clamp(18px, 4.5cqw, 28px) !important;
      }
      .zone-arrows {
        font-size: clamp(40px, 10cqw, 60px) !important;
      }
      .zone-text {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }

      /* --- S/R Zone (post-052 pattern) --- */
      .sr-zone-badge {
        font-size: clamp(14px, 3.5cqw, 22px) !important;
        padding: clamp(6px, 1.2cqw, 10px) clamp(16px, 3.2cqw, 28px) !important;
      }
      .sr-action-label {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }
      .sr-action-arrow {
        font-size: clamp(28px, 7cqw, 42px) !important;
      }
      .sr-zone-repeat {
        font-size: clamp(12px, 3cqw, 18px) !important;
      }
      .sr-zone-desc {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }
      .sr-zone-arrows {
        font-size: clamp(24px, 6cqw, 36px) !important;
      }
      .sr-zone-arrows-mid {
        font-size: clamp(36px, 9cqw, 56px) !important;
      }
      .sr-zone-mid-text {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }

      /* --- Fail Visual (post-053 pattern) --- */
      .fail-stat-value {
        font-size: clamp(36px, 9cqw, 56px) !important;
      }
      .fail-stat-label {
        font-size: clamp(12px, 3cqw, 18px) !important;
      }
      .fail-verdict-text {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }
      .fail-verdict-icon {
        font-size: clamp(28px, 7cqw, 42px) !important;
      }
      .fail-balance-label {
        font-size: clamp(14px, 3.5cqw, 22px) !important;
      }
      .fail-balance-value {
        font-size: clamp(28px, 7cqw, 42px) !important;
      }
      .fail-balance-vs {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }
      .fail-tl-text {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }
      .fail-tl-dot {
        width: clamp(16px, 3cqw, 24px) !important;
        height: clamp(16px, 3cqw, 24px) !important;
      }

      /* --- Cross Diagram (post-059 pattern) --- */
      .ma-name {
        font-size: clamp(14px, 3.5cqw, 22px) !important;
      }
      .ma-desc {
        font-size: clamp(12px, 3cqw, 18px) !important;
      }
      .ma-cross-icon {
        font-size: clamp(24px, 6cqw, 36px) !important;
      }
      .cross-meaning-text {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }

      /* --- Lag Timeline (post-059 pattern) --- */
      .lag-tl-label {
        font-size: clamp(12px, 3cqw, 18px) !important;
      }
      .lag-tl-desc {
        font-size: clamp(12px, 3cqw, 18px) !important;
      }
      .lag-tl-zone-label {
        font-size: clamp(12px, 3cqw, 18px) !important;
      }

      /* ===== Gold Standard Architecture — layout overrides ===== */

      /* Teal/warm architecture: start from top, compact padding */
      .slide-teal .slide-content,
      .slide-warm .slide-content {
        justify-content: flex-start !important;
        padding: 2% 5% 2% 5% !important;
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
        font-size: clamp(14px, 3.5cqw, 22px) !important;
        letter-spacing: 2px !important;
      }

      /* Hook elements */
      .blog-badge, .chronicle-badge {
        font-size: clamp(14px, 3.5cqw, 22px) !important;
        letter-spacing: 3px !important;
        padding: 6px 18px !important;
      }
      .hook-indicator, .char-indicator {
        font-size: clamp(16px, 4cqw, 24px) !important;
        letter-spacing: 3px !important;
      }
      .hook-quote, .char-quote {
        font-size: clamp(24px, 6cqw, 34px) !important;
        line-height: 1.45 !important;
      }

      /* Pillar / Vision grid cards */
      .pillar-name, .vision-name {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }
      .pillar-desc, .vision-desc {
        font-size: clamp(13px, 3.2cqw, 18px) !important;
        line-height: 1.4 !important;
      }
      .pillar-label, .vision-label {
        font-size: clamp(10px, 2.4cqw, 14px) !important;
        letter-spacing: 1px !important;
      }
      .pillar-icon, .vision-icon {
        font-size: clamp(18px, 4.5cqw, 28px) !important;
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
        font-size: clamp(16px, 4cqw, 24px) !important;
      }
      .dive-desc, .power-desc {
        font-size: clamp(13px, 3.2cqw, 18px) !important;
        line-height: 1.35 !important;
      }
      .dive-label, .power-label {
        font-size: clamp(10px, 2.4cqw, 14px) !important;
        letter-spacing: 1px !important;
      }
      .dive-icon-sym, .power-icon-sym {
        font-size: clamp(18px, 4.5cqw, 28px) !important;
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
        font-size: clamp(11px, 2.8cqw, 16px) !important;
        letter-spacing: 2px !important;
      }
      .cycle-text, .reading-text {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }
      .cycle-desc, .reading-desc {
        font-size: clamp(13px, 3.2cqw, 18px) !important;
        line-height: 1.35 !important;
      }
      .cycle-num, .reading-num {
        font-size: clamp(18px, 4.5cqw, 28px) !important;
      }
      .cycle-ring, .reading-ring {
        width: clamp(38px, 7.5cqw, 56px) !important;
        height: clamp(38px, 7.5cqw, 56px) !important;
      }
      .cycle-arrow, .reading-arrow {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }
      .cycle-truth, .reading-truth {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
        line-height: 1.4 !important;
      }

      /* Strategy grid cards */
      .strat-name {
        font-size: clamp(20px, 5cqw, 30px) !important;
      }
      .strat-desc {
        font-size: clamp(16px, 4cqw, 22px) !important;
        line-height: 1.5 !important;
      }
      .strat-label {
        font-size: clamp(12px, 3cqw, 16px) !important;
        letter-spacing: 1px !important;
      }
      .strat-icon {
        font-size: clamp(22px, 5.5cqw, 36px) !important;
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
        font-size: clamp(14px, 3.5cqw, 20px) !important;
        letter-spacing: 2px !important;
      }
      .strat-warn-text {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
        line-height: 1.55 !important;
      }

      /* CTA stat recap (teal gold standard) */
      .stat-recap .stat-num, .stat-card .stat-num {
        font-size: clamp(22px, 5.5cqw, 34px) !important;
      }
      .stat-recap .stat-name, .stat-card .stat-name {
        font-size: clamp(16px, 4cqw, 22px) !important;
      }
      .stat-recap .stat-val, .stat-card .stat-val {
        font-size: clamp(12px, 3cqw, 16px) !important;
      }
      .stat-ring {
        width: clamp(38px, 7.5cqw, 56px) !important;
        height: clamp(38px, 7.5cqw, 56px) !important;
      }

      /* CTA elements (teal gold standard) */
      .cta-glow-icon {
        font-size: clamp(28px, 7cqw, 44px) !important;
      }
      .cta-tagline {
        font-size: clamp(32px, 8cqw, 52px) !important;
      }
      .cta-desc {
        font-size: clamp(20px, 5cqw, 28px) !important;
        line-height: 1.5 !important;
      }
      .cta-pill {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
        padding: 6px 14px !important;
      }
      .cta-box-text {
        font-size: clamp(22px, 5.5cqw, 32px) !important;
      }
      .cta-link {
        font-size: clamp(20px, 5cqw, 28px) !important;
      }

      /* Slide logo */
      .slide-logo {
        font-size: clamp(10px, 2.5cqw, 14px) !important;
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
        font-size: clamp(14px, 3.5cqw, 22px) !important;
        letter-spacing: 4px !important;
        padding: clamp(6px, 1.2cqw, 12px) clamp(16px, 3cqw, 28px) !important;
      }
      .s1-hook {
        font-size: clamp(36px, 8cqw, 56px) !important;
      }
      .s1-sub {
        font-size: clamp(16px, 4cqw, 22px) !important;
        letter-spacing: 3px !important;
      }
      .s1-divider {
        width: 80px !important;
        height: 3px !important;
      }

      /* Obsession block (post-044 v2 — slide 2) */
      .obsess-label {
        font-size: clamp(14px, 3.5cqw, 22px) !important;
        letter-spacing: 3px !important;
      }
      .obsess-text {
        font-size: clamp(24px, 5.5cqw, 38px) !important;
        line-height: 1.4 !important;
      }
      .obsess-verdict-text {
        font-size: clamp(22px, 5.5cqw, 34px) !important;
        line-height: 1.4 !important;
      }

      /* Graveyard cards (post-044 v2 — slide 3) */
      .grave-pair {
        font-size: clamp(18px, 4.5cqw, 28px) !important;
      }
      .grave-result {
        font-size: clamp(14px, 3.5cqw, 22px) !important;
        padding: clamp(4px, 0.8cqw, 7px) clamp(8px, 1.6cqw, 14px) !important;
      }
      .grave-story {
        font-size: clamp(16px, 4cqw, 22px) !important;
        line-height: 1.45 !important;
      }
      .grave-cause {
        font-size: clamp(13px, 3cqw, 18px) !important;
        letter-spacing: 2px !important;
      }
      .grave-truth-text {
        font-size: clamp(20px, 5cqw, 30px) !important;
        line-height: 1.4 !important;
      }

      /* Scale visual (post-044 v2 — slide 4) */
      .scale-pan-label {
        font-size: clamp(16px, 4cqw, 22px) !important;
        letter-spacing: 3px !important;
      }
      .scale-pan-symbol {
        font-size: clamp(22px, 5cqw, 34px) !important;
      }
      .scale-pan-icon {
        width: clamp(50px, 10cqw, 80px) !important;
        height: clamp(50px, 10cqw, 80px) !important;
      }
      .scale-item {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
        line-height: 1.4 !important;
      }
      .scale-insight {
        font-size: clamp(20px, 5cqw, 30px) !important;
        line-height: 1.5 !important;
      }

      /* Shift columns (post-044 v2 — slide 5) */
      .shift-col-header {
        font-size: clamp(16px, 4cqw, 22px) !important;
        letter-spacing: 3px !important;
      }
      .shift-item-text {
        font-size: clamp(15px, 3.5cqw, 22px) !important;
        line-height: 1.4 !important;
      }
      .shift-truth-text {
        font-size: clamp(22px, 5.5cqw, 34px) !important;
        line-height: 1.4 !important;
      }

      /* Post-085 warm architecture classes */
      .cat-name {
        font-size: clamp(16px, 3.5cqw, 24px) !important;
      }
      .cat-desc {
        font-size: clamp(12px, 2.5cqw, 18px) !important;
      }
      .cat-icon-symbol {
        font-size: clamp(18px, 4cqw, 30px) !important;
      }
      .conf-text {
        font-size: clamp(18px, 4.5cqw, 28px) !important;
      }
      .conf-desc {
        font-size: clamp(14px, 3cqw, 20px) !important;
        line-height: 1.4 !important;
      }
      .conf-step-label {
        font-size: clamp(12px, 3cqw, 18px) !important;
        letter-spacing: 2px !important;
      }
      .conf-num {
        font-size: clamp(22px, 5cqw, 34px) !important;
      }
      .conf-demo-label {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }
      .conf-demo-desc {
        font-size: clamp(14px, 3cqw, 20px) !important;
      }
      .s2-total-text {
        font-size: clamp(18px, 4cqw, 26px) !important;
      }
      .feat-card-title {
        font-size: clamp(18px, 4.5cqw, 28px) !important;
      }
      .feat-card-desc {
        font-size: clamp(14px, 3cqw, 20px) !important;
        line-height: 1.4 !important;
      }
      .feat-bar-label {
        font-size: clamp(11px, 2.5cqw, 16px) !important;
      }
      .feat-icon-letter {
        font-size: clamp(18px, 4cqw, 28px) !important;
      }
      .stat-ring-val {
        font-size: clamp(22px, 5cqw, 34px) !important;
      }
      .stat-ring-label {
        font-size: clamp(14px, 3cqw, 20px) !important;
      }
      .stat-ring-sub {
        font-size: clamp(11px, 2.5cqw, 16px) !important;
      }
      .nr-badge {
        font-size: clamp(14px, 3cqw, 20px) !important;
      }

      /* Warm architecture stat recap / CTA */
      .stat-recap-num {
        font-size: clamp(18px, 4cqw, 28px) !important;
      }
      .stat-recap-label {
        font-size: clamp(14px, 3cqw, 20px) !important;
      }
      .stat-recap-val {
        font-size: clamp(12px, 2.5cqw, 16px) !important;
      }
      .stat-recap-ring {
        width: clamp(44px, 8.5cqw, 68px) !important;
        height: clamp(44px, 8.5cqw, 68px) !important;
      }
      .cta-glow-icon {
        font-size: clamp(28px, 6cqw, 48px) !important;
      }
      .cta-tagline {
        font-size: clamp(32px, 8cqw, 52px) !important;
      }
      .cta-desc {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
        line-height: 1.5 !important;
      }
      .cta-pill {
        font-size: clamp(14px, 3.5cqw, 20px) !important;
        padding: 5px 14px !important;
      }
      .cta-box-text {
        font-size: clamp(20px, 5cqw, 30px) !important;
      }
      .cta-link {
        font-size: clamp(18px, 4.5cqw, 26px) !important;
      }

      /* --- Doji Anatomy (post-056 pattern) --- */
      .da-part {
        font-size: clamp(18px, 4.5cqw, 28px) !important;
      }
      .da-meaning {
        font-size: clamp(14px, 3.5cqw, 22px) !important;
      }
      .type-badge {
        font-size: clamp(12px, 3cqw, 18px) !important;
      }
      .confirm-step {
        font-size: clamp(16px, 4cqw, 24px) !important;
      }
      .confirm-arrow {
        font-size: clamp(24px, 6cqw, 36px) !important;
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

    // Fix "SignalPilot" → "Signal Pilot" and "SIGNALPILOT" → "SIGNAL PILOT"
    document.querySelectorAll('.cine-logo, .brand-mark, .logo, .brand-footer, .cta-button').forEach(el => {
      el.textContent = el.textContent
        .replace(/SignalPilot/g, 'Signal Pilot')
        .replace(/SIGNALPILOT/g, 'SIGNAL PILOT');
    });

    // Inject "SIGNAL PILOT" branding on EVERY slide that doesn't already have it
    document.querySelectorAll('.slide-wrapper').forEach(w => {
      if (!w.querySelector('.brand-mark, .cine-logo, .brand-footer, .slide-logo')) {
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
