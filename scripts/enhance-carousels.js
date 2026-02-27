#!/usr/bin/env node
/**
 * One-time script to rebuild 22 short carousel HTML files into proper
 * ~1000-line posts matching the quality of posts 091/094.
 *
 * Each generated file includes:
 *   ~680 lines custom CSS with responsive clamp() sizing
 *   ~300 lines rich HTML (5 slides with visual components)
 *   ~25 lines JS (export mode toggle)
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOCIAL = join(ROOT, 'INSTAGRAM_CONTENT_HUB', 'social');

// ═══════════════════════════════════════════════════════════════
// COLOUR THEMES
// ═══════════════════════════════════════════════════════════════
const ORANGE = {
  name: 'orange', accent: '#f59e0b',
  r: 245, g: 158, b: 11,
  barSide: 'right',
  gradientBg: 'linear-gradient(180deg, #0f0c0a 0%, #0a0908 100%)',
  glowBg: (a) => `rgba(245,158,11,${a})`,
};
const TEAL = {
  name: 'teal', accent: '#5eead4',
  r: 94, g: 234, b: 212,
  barSide: 'left',
  gradientBg: 'linear-gradient(180deg, #0a0c0f 0%, #080a0c 100%)',
  glowBg: (a) => `rgba(94,234,212,${a})`,
};

// Which posts are teal column
const TEAL_POSTS = new Set([158,168,173,178,188,198,208,218]);

function themeFor(num) { return TEAL_POSTS.has(num) ? TEAL : ORANGE; }

// Helper: rgba string for a theme
function rgba(t, a) { return `rgba(${t.r},${t.g},${t.b},${a})`; }

// ═══════════════════════════════════════════════════════════════
// CSS TEMPLATE GENERATOR  (~680 lines)
// ═══════════════════════════════════════════════════════════════
function generateCSS(t) {
  const a = rgba.bind(null, t);
  return `
    :root {
      --bg-dark: #0a0a0f;
      --bg-card: rgba(255,255,255,0.03);
      --text-primary: #ffffff;
      --text-secondary: rgba(255,255,255,0.7);
      --text-muted: rgba(255,255,255,0.4);
      --border-subtle: rgba(255,255,255,0.06);
      --accent-orange: #f59e0b;
      --accent-red: #f87171;
      --accent-green: #4ade80;
      --accent-teal: #5eead4;
      --accent-gold: #c9a962;
      --accent-purple: #a855f7;
      --accent-blue: #60a5fa;
      --accent-primary: ${t.accent};
      --font-serif: 'Cormorant Garamond', Georgia, serif;
      --font-sans: 'Inter', -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
      --font-brand: 'Gugi', sans-serif;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: var(--font-sans); background: var(--bg-dark); color: var(--text-primary); min-height: 100vh; padding: 2rem; }
    body.export-mode { padding: 0; background: transparent; }
    body.export-mode .controls, body.export-mode .page-title, body.export-mode .slide-label { display: none; }
    body.export-mode .carousel-grid { display: block; }
    body.export-mode .slide-wrapper { display: none; margin: 0; }
    body.export-mode .slide-wrapper.active { display: block; }
    body.export-mode .slide-wrapper.exporting { display: block; }
    body.export-mode .slide { width: 1080px; height: 1350px; max-width: none; border-radius: 0; }

    .controls { display: flex; justify-content: center; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .controls button { background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--text-primary); padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; cursor: pointer; }
    .page-title { text-align: center; margin-bottom: 2rem; }
    .page-title h1 { font-family: var(--font-serif); font-size: 2rem; font-weight: 600; margin-bottom: 0.5rem; }
    .page-title p { color: var(--text-muted); font-size: 0.875rem; }

    .carousel-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem; max-width: 1800px; margin: 0 auto; }
    .slide-wrapper { display: flex; flex-direction: column; align-items: center; container-type: inline-size; }
    .slide-label { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; }
    .slide { width: 100%; max-width: 540px; aspect-ratio: 4 / 5; background: var(--bg-dark); border-radius: 0.5rem; position: relative; overflow: hidden; display: flex; flex-direction: column; }
    .slide-content { position: relative; z-index: 3; flex: 1; display: flex; flex-direction: column; padding: clamp(20px, 5.5%, 50px); }

    /* ─── Warm slide theme ─── */
    .slide-warm { background: ${t.gradientBg} !important; }
    .slide-warm::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, ${a(0.06)} 0%, transparent 60%); pointer-events: none; z-index: 1; }
    .slide-warm::after { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 0%, ${a(0.04)} 0%, transparent 70%); pointer-events: none; z-index: 1; }
    .slide-warm .slide-content { z-index: 3; }

    .slide-1.slide-warm .accent-bar {
      position: absolute;
      top: 0; ${t.barSide}: 0;
      width: clamp(10px, 1.8cqw, 18px);
      height: 100%;
      background: linear-gradient(180deg, ${a(0.9)} 0%, ${a(0.7)} 100%);
      z-index: 5;
    }

    /* ─── Logo ─── */
    .slide-logo {
      position: absolute;
      bottom: 4%;
      left: 50%;
      transform: translateX(-50%);
      font-family: var(--font-brand);
      font-size: clamp(6px, 1.2cqw, 10px);
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: ${a(0.35)};
      z-index: 4;
      white-space: nowrap;
    }
    .slide-counter {
      position: absolute;
      top: 4%;
      right: 5%;
      font-family: var(--font-mono);
      font-size: clamp(7px, 1cqw, 10px);
      color: rgba(255,255,255,0.2);
      letter-spacing: 0.1em;
      z-index: 2;
    }

    /* ─── Shared ─── */
    .warm { color: var(--accent-primary); }
    .section-tag {
      font-family: var(--font-mono);
      font-size: clamp(7px, 1cqw, 10px);
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: ${a(0.5)};
      margin-bottom: clamp(4px, 1cqw, 10px);
    }
    .section-title {
      font-family: var(--font-serif);
      font-size: clamp(18px, 3.5cqw, 36px);
      font-weight: 700;
      color: var(--text-primary);
      text-align: center;
      margin-bottom: clamp(6px, 1.5cqw, 14px);
      line-height: 1.15;
    }
    .warm-divider {
      width: clamp(30px, 6cqw, 55px);
      height: 2px;
      background: linear-gradient(90deg, transparent, ${a(0.5)}, transparent);
      margin-bottom: clamp(8px, 2cqw, 18px);
    }

    /* ═══════════════════════════════════════════
       ICON CIRCLES  (7 colour variants)
       ═══════════════════════════════════════════ */
    .icon-circle {
      width: clamp(36px, 7cqw, 60px);
      height: clamp(36px, 7cqw, 60px);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      position: relative;
      flex-shrink: 0;
    }
    .icon-circle::before {
      content: '';
      position: absolute;
      inset: 4px;
      border-radius: 50%;
    }
    .icon-circle .ic-icon {
      font-size: clamp(12px, 2.5cqw, 22px);
      position: relative;
      z-index: 1;
    }

    .icon-circle.orange-ic {
      background: radial-gradient(circle at 40% 35%, rgba(245,158,11,0.3) 0%, rgba(245,158,11,0.08) 60%, transparent 100%);
      border: 1.5px solid rgba(245,158,11,0.3);
      box-shadow: 0 0 18px rgba(245,158,11,0.1);
    }
    .icon-circle.orange-ic::before { border: 1px solid rgba(245,158,11,0.12); }

    .icon-circle.green-ic {
      background: radial-gradient(circle at 40% 35%, rgba(74,222,128,0.3) 0%, rgba(74,222,128,0.08) 60%, transparent 100%);
      border: 1.5px solid rgba(74,222,128,0.3);
      box-shadow: 0 0 18px rgba(74,222,128,0.1);
    }
    .icon-circle.green-ic::before { border: 1px solid rgba(74,222,128,0.12); }

    .icon-circle.red-ic {
      background: radial-gradient(circle at 40% 35%, rgba(248,113,113,0.3) 0%, rgba(248,113,113,0.08) 60%, transparent 100%);
      border: 1.5px solid rgba(248,113,113,0.3);
      box-shadow: 0 0 18px rgba(248,113,113,0.1);
    }
    .icon-circle.red-ic::before { border: 1px solid rgba(248,113,113,0.12); }

    .icon-circle.teal-ic {
      background: radial-gradient(circle at 40% 35%, rgba(94,234,212,0.3) 0%, rgba(94,234,212,0.08) 60%, transparent 100%);
      border: 1.5px solid rgba(94,234,212,0.3);
      box-shadow: 0 0 18px rgba(94,234,212,0.1);
    }
    .icon-circle.teal-ic::before { border: 1px solid rgba(94,234,212,0.12); }

    .icon-circle.purple-ic {
      background: radial-gradient(circle at 40% 35%, rgba(168,85,247,0.3) 0%, rgba(168,85,247,0.08) 60%, transparent 100%);
      border: 1.5px solid rgba(168,85,247,0.3);
      box-shadow: 0 0 18px rgba(168,85,247,0.1);
    }
    .icon-circle.purple-ic::before { border: 1px solid rgba(168,85,247,0.12); }

    .icon-circle.blue-ic {
      background: radial-gradient(circle at 40% 35%, rgba(96,165,250,0.3) 0%, rgba(96,165,250,0.08) 60%, transparent 100%);
      border: 1.5px solid rgba(96,165,250,0.3);
      box-shadow: 0 0 18px rgba(96,165,250,0.1);
    }
    .icon-circle.blue-ic::before { border: 1px solid rgba(96,165,250,0.12); }

    .icon-circle.gold-ic {
      background: radial-gradient(circle at 40% 35%, rgba(201,169,98,0.3) 0%, rgba(201,169,98,0.08) 60%, transparent 100%);
      border: 1.5px solid rgba(201,169,98,0.3);
      box-shadow: 0 0 18px rgba(201,169,98,0.1);
    }
    .icon-circle.gold-ic::before { border: 1px solid rgba(201,169,98,0.12); }

    /* ═══════════════════════════════════════════
       PROGRESS BARS
       ═══════════════════════════════════════════ */
    .bar-track {
      width: 100%;
      height: clamp(4px, 0.8cqw, 7px);
      background: rgba(255,255,255,0.06);
      border-radius: 99px;
      overflow: hidden;
    }
    .bar-fill { height: 100%; border-radius: 99px; }
    .bar-fill.orange-fill { background: linear-gradient(90deg, rgba(245,158,11,0.4), rgba(245,158,11,0.8)); }
    .bar-fill.green-fill { background: linear-gradient(90deg, rgba(74,222,128,0.4), rgba(74,222,128,0.8)); }
    .bar-fill.red-fill { background: linear-gradient(90deg, rgba(248,113,113,0.4), rgba(248,113,113,0.8)); }
    .bar-fill.teal-fill { background: linear-gradient(90deg, rgba(94,234,212,0.4), rgba(94,234,212,0.8)); }
    .bar-fill.purple-fill { background: linear-gradient(90deg, rgba(168,85,247,0.4), rgba(168,85,247,0.8)); }
    .bar-fill.blue-fill { background: linear-gradient(90deg, rgba(96,165,250,0.4), rgba(96,165,250,0.8)); }
    .bar-fill.gold-fill { background: linear-gradient(90deg, rgba(201,169,98,0.4), rgba(201,169,98,0.8)); }
    .bar-label {
      font-family: var(--font-mono);
      font-size: clamp(6px, 0.9cqw, 9px);
      color: var(--text-muted);
      letter-spacing: 0.05em;
      display: flex;
      justify-content: space-between;
      margin-bottom: clamp(2px, 0.3cqw, 4px);
    }

    /* ═══════════════════════════════════════════
       SLIDE 1 — HOOK / ORB
       ═══════════════════════════════════════════ */
    .slide-1 .slide-content { align-items: center; text-align: center; justify-content: center; gap: clamp(8px, 1.6cqw, 18px); }

    .hook-orb {
      width: clamp(90px, 18cqw, 180px);
      height: clamp(90px, 18cqw, 180px);
      border-radius: 50%;
      background: radial-gradient(circle at 40% 35%, ${a(0.3)} 0%, ${a(0.1)} 40%, rgba(255,255,255,0.03) 70%, transparent 100%);
      border: 2px solid ${a(0.25)};
      box-shadow: 0 0 50px ${a(0.12)}, 0 0 100px ${a(0.04)}, inset 0 0 30px ${a(0.06)};
      position: relative;
      display: flex; align-items: center; justify-content: center;
    }
    .hook-orb::before {
      content: '';
      position: absolute;
      inset: 7px;
      border-radius: 50%;
      border: 1.5px solid ${a(0.15)};
    }
    .hook-orb::after {
      content: '';
      position: absolute;
      inset: 18px;
      border-radius: 50%;
      border: 1px dashed ${a(0.12)};
    }
    .orb-inner {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: clamp(2px, 0.4cqw, 5px);
    }
    .orb-icon {
      font-size: clamp(20px, 4.5cqw, 44px);
      color: ${a(0.8)};
    }
    .orb-label {
      font-family: var(--font-mono);
      font-size: clamp(5px, 0.8cqw, 8px);
      color: ${a(0.6)};
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }

    .hook-badge {
      font-family: var(--font-mono);
      font-size: clamp(8px, 1.2cqw, 12px);
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: ${a(0.8)};
      padding: clamp(3px, 0.6cqw, 7px) clamp(10px, 2cqw, 20px);
      border: 1px solid ${a(0.25)};
      border-radius: clamp(3px, 0.6cqw, 6px);
      background: ${a(0.05)};
    }
    .hook-title {
      font-family: var(--font-serif);
      font-size: clamp(22px, 4.5cqw, 48px);
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.15;
    }
    .hook-title em { color: var(--accent-primary); font-style: italic; }
    .hook-divider {
      width: clamp(30px, 8cqw, 60px);
      height: 2px;
      background: linear-gradient(90deg, transparent, ${a(0.5)}, transparent);
    }
    .hook-sub {
      font-family: var(--font-sans);
      font-size: clamp(10px, 1.8cqw, 18px);
      font-weight: 300;
      color: var(--text-muted);
      letter-spacing: 0.05em;
      line-height: 1.5;
      max-width: 85%;
    }

    /* ═══════════════════════════════════════════
       SLIDE 2 — CARD GRID + VS BOX
       ═══════════════════════════════════════════ */
    .slide-2 .slide-content { justify-content: center; align-items: center; }

    .card-grid {
      width: 92%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: clamp(5px, 1cqw, 10px);
      margin-bottom: clamp(8px, 1.5cqw, 16px);
    }
    .grid-card {
      background: rgba(248,113,113,0.04);
      border: 1px solid rgba(248,113,113,0.12);
      border-radius: clamp(6px, 1.2cqw, 12px);
      padding: clamp(7px, 1.4cqw, 14px);
      display: flex;
      gap: clamp(5px, 1cqw, 10px);
      align-items: flex-start;
    }
    .grid-card.card-green {
      background: rgba(74,222,128,0.04);
      border-color: rgba(74,222,128,0.12);
    }
    .grid-card.card-blue {
      background: rgba(96,165,250,0.04);
      border-color: rgba(96,165,250,0.12);
    }
    .grid-card.card-gold {
      background: rgba(201,169,98,0.04);
      border-color: rgba(201,169,98,0.12);
    }
    .grid-card.card-teal {
      background: rgba(94,234,212,0.04);
      border-color: rgba(94,234,212,0.12);
    }
    .grid-card.card-purple {
      background: rgba(168,85,247,0.04);
      border-color: rgba(168,85,247,0.12);
    }
    .card-icon {
      width: clamp(28px, 5.5cqw, 48px);
      height: clamp(28px, 5.5cqw, 48px);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      position: relative;
      flex-shrink: 0;
    }
    .card-icon::before {
      content: '';
      position: absolute;
      inset: 3px;
      border-radius: 50%;
    }
    .card-icon.ci-red {
      background: radial-gradient(circle at 40% 35%, rgba(248,113,113,0.3) 0%, rgba(248,113,113,0.08) 60%, transparent 100%);
      border: 1.5px solid rgba(248,113,113,0.3);
    }
    .card-icon.ci-red::before { border: 1px solid rgba(248,113,113,0.12); }
    .card-icon.ci-green {
      background: radial-gradient(circle at 40% 35%, rgba(74,222,128,0.3) 0%, rgba(74,222,128,0.08) 60%, transparent 100%);
      border: 1.5px solid rgba(74,222,128,0.3);
    }
    .card-icon.ci-green::before { border: 1px solid rgba(74,222,128,0.12); }
    .card-icon.ci-blue {
      background: radial-gradient(circle at 40% 35%, rgba(96,165,250,0.3) 0%, rgba(96,165,250,0.08) 60%, transparent 100%);
      border: 1.5px solid rgba(96,165,250,0.3);
    }
    .card-icon.ci-blue::before { border: 1px solid rgba(96,165,250,0.12); }
    .card-icon.ci-gold {
      background: radial-gradient(circle at 40% 35%, rgba(201,169,98,0.3) 0%, rgba(201,169,98,0.08) 60%, transparent 100%);
      border: 1.5px solid rgba(201,169,98,0.3);
    }
    .card-icon.ci-gold::before { border: 1px solid rgba(201,169,98,0.12); }
    .card-icon.ci-teal {
      background: radial-gradient(circle at 40% 35%, rgba(94,234,212,0.3) 0%, rgba(94,234,212,0.08) 60%, transparent 100%);
      border: 1.5px solid rgba(94,234,212,0.3);
    }
    .card-icon.ci-teal::before { border: 1px solid rgba(94,234,212,0.12); }
    .card-icon.ci-purple {
      background: radial-gradient(circle at 40% 35%, rgba(168,85,247,0.3) 0%, rgba(168,85,247,0.08) 60%, transparent 100%);
      border: 1.5px solid rgba(168,85,247,0.3);
    }
    .card-icon.ci-purple::before { border: 1px solid rgba(168,85,247,0.12); }
    .card-icon-sym {
      font-size: clamp(10px, 1.8cqw, 18px);
      position: relative;
      z-index: 2;
    }
    .ci-red .card-icon-sym { color: var(--accent-red); }
    .ci-green .card-icon-sym { color: var(--accent-green); }
    .ci-blue .card-icon-sym { color: var(--accent-blue); }
    .ci-gold .card-icon-sym { color: var(--accent-gold); }
    .ci-teal .card-icon-sym { color: var(--accent-teal); }
    .ci-purple .card-icon-sym { color: var(--accent-purple); }

    .card-info { flex: 1; min-width: 0; }
    .card-title {
      font-size: clamp(8px, 1.3cqw, 13px);
      font-weight: 600;
      color: var(--accent-red);
      margin-bottom: clamp(1px, 0.3cqw, 3px);
    }
    .grid-card.card-green .card-title { color: var(--accent-green); }
    .grid-card.card-blue .card-title { color: var(--accent-blue); }
    .grid-card.card-gold .card-title { color: var(--accent-gold); }
    .grid-card.card-teal .card-title { color: var(--accent-teal); }
    .grid-card.card-purple .card-title { color: var(--accent-purple); }
    .card-desc {
      font-size: clamp(6px, 0.95cqw, 9px);
      color: var(--text-muted);
      line-height: 1.35;
      margin-bottom: clamp(3px, 0.6cqw, 6px);
    }
    .card-bar-track {
      width: 100%;
      height: clamp(3px, 0.5cqw, 5px);
      background: rgba(255,255,255,0.04);
      border-radius: 3px;
      overflow: hidden;
    }
    .card-bar-fill {
      height: 100%;
      border-radius: 3px;
    }

    /* VS comparison panel */
    .vs-box {
      width: 92%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: clamp(6px, 1.2cqw, 12px);
    }
    .vs-side {
      border-radius: clamp(6px, 1.2cqw, 12px);
      padding: clamp(8px, 1.5cqw, 15px);
      text-align: center;
    }
    .vs-side.vs-bad {
      background: rgba(248,113,113,0.04);
      border: 1px solid rgba(248,113,113,0.12);
    }
    .vs-side.vs-good {
      background: ${a(0.04)};
      border: 1px solid ${a(0.12)};
    }
    .vs-side-icon {
      width: clamp(26px, 5cqw, 44px);
      height: clamp(26px, 5cqw, 44px);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto clamp(4px, 0.8cqw, 8px);
      position: relative;
    }
    .vs-side-icon::before {
      content: '';
      position: absolute;
      inset: 3px;
      border-radius: 50%;
    }
    .vs-bad .vs-side-icon {
      background: radial-gradient(circle at 40% 35%, rgba(248,113,113,0.3) 0%, rgba(248,113,113,0.08) 60%, transparent 100%);
      border: 1.5px solid rgba(248,113,113,0.25);
    }
    .vs-bad .vs-side-icon::before { border: 1px solid rgba(248,113,113,0.1); }
    .vs-good .vs-side-icon {
      background: radial-gradient(circle at 40% 35%, ${a(0.3)} 0%, ${a(0.08)} 60%, transparent 100%);
      border: 1.5px solid ${a(0.25)};
    }
    .vs-good .vs-side-icon::before { border: 1px solid ${a(0.1)}; }
    .vs-icon-sym {
      font-size: clamp(10px, 1.6cqw, 16px);
      position: relative;
      z-index: 2;
    }
    .vs-bad .vs-icon-sym { color: var(--accent-red); }
    .vs-good .vs-icon-sym { color: var(--accent-primary); }
    .vs-side-label {
      font-family: var(--font-mono);
      font-size: clamp(7px, 1cqw, 10px);
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-bottom: clamp(3px, 0.5cqw, 5px);
    }
    .vs-bad .vs-side-label { color: var(--accent-red); }
    .vs-good .vs-side-label { color: var(--accent-primary); }
    .vs-side-text {
      font-size: clamp(7px, 1cqw, 10px);
      color: var(--text-muted);
      line-height: 1.4;
    }

    /* ═══════════════════════════════════════════
       SLIDE 3 — PILLAR STACK
       ═══════════════════════════════════════════ */
    .slide-3 .slide-content { justify-content: center; align-items: center; }

    .pillar-stack {
      width: 88%;
      display: flex;
      flex-direction: column;
      gap: clamp(5px, 1cqw, 10px);
    }
    .pillar-row {
      display: flex;
      align-items: flex-start;
      gap: clamp(6px, 1.2cqw, 12px);
    }
    .pillar-left {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
      width: clamp(30px, 6cqw, 52px);
    }
    .pillar-ring {
      width: clamp(28px, 5.5cqw, 48px);
      height: clamp(28px, 5.5cqw, 48px);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .pillar-ring::before {
      content: '';
      position: absolute;
      inset: 3px;
      border-radius: 50%;
    }
    .pillar-ring.pr-orange {
      background: radial-gradient(circle at 40% 35%, rgba(245,158,11,0.3) 0%, rgba(245,158,11,0.08) 60%, transparent 100%);
      border: 1.5px solid rgba(245,158,11,0.3);
    }
    .pillar-ring.pr-orange::before { border: 1px solid rgba(245,158,11,0.12); }
    .pillar-ring.pr-gold {
      background: radial-gradient(circle at 40% 35%, rgba(201,169,98,0.3) 0%, rgba(201,169,98,0.08) 60%, transparent 100%);
      border: 1.5px solid rgba(201,169,98,0.3);
    }
    .pillar-ring.pr-gold::before { border: 1px solid rgba(201,169,98,0.12); }
    .pillar-ring.pr-teal {
      background: radial-gradient(circle at 40% 35%, rgba(94,234,212,0.3) 0%, rgba(94,234,212,0.08) 60%, transparent 100%);
      border: 1.5px solid rgba(94,234,212,0.3);
    }
    .pillar-ring.pr-teal::before { border: 1px solid rgba(94,234,212,0.12); }
    .pillar-ring.pr-purple {
      background: radial-gradient(circle at 40% 35%, rgba(168,85,247,0.3) 0%, rgba(168,85,247,0.08) 60%, transparent 100%);
      border: 1.5px solid rgba(168,85,247,0.3);
    }
    .pillar-ring.pr-purple::before { border: 1px solid rgba(168,85,247,0.12); }
    .pillar-ring.pr-green {
      background: radial-gradient(circle at 40% 35%, rgba(74,222,128,0.3) 0%, rgba(74,222,128,0.08) 60%, transparent 100%);
      border: 1.5px solid rgba(74,222,128,0.3);
    }
    .pillar-ring.pr-green::before { border: 1px solid rgba(74,222,128,0.12); }
    .pillar-ring.pr-blue {
      background: radial-gradient(circle at 40% 35%, rgba(96,165,250,0.3) 0%, rgba(96,165,250,0.08) 60%, transparent 100%);
      border: 1.5px solid rgba(96,165,250,0.3);
    }
    .pillar-ring.pr-blue::before { border: 1px solid rgba(96,165,250,0.12); }

    .pillar-num {
      font-family: var(--font-mono);
      font-size: clamp(9px, 1.5cqw, 15px);
      font-weight: 700;
      position: relative;
      z-index: 2;
    }
    .pr-orange .pillar-num { color: var(--accent-orange); }
    .pr-gold .pillar-num { color: var(--accent-gold); }
    .pr-teal .pillar-num { color: var(--accent-teal); }
    .pr-purple .pillar-num { color: var(--accent-purple); }
    .pr-green .pillar-num { color: var(--accent-green); }
    .pr-blue .pillar-num { color: var(--accent-blue); }

    .pillar-connector {
      width: 2px;
      height: clamp(6px, 1.2cqw, 12px);
      background: linear-gradient(180deg, ${a(0.3)}, ${a(0.08)});
      margin: clamp(2px, 0.3cqw, 4px) 0;
    }
    .pillar-body {
      flex: 1;
      min-width: 0;
      padding-top: clamp(2px, 0.4cqw, 4px);
    }
    .pillar-title {
      font-size: clamp(9px, 1.5cqw, 15px);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: clamp(2px, 0.4cqw, 4px);
    }
    .pillar-desc {
      font-size: clamp(7px, 1.1cqw, 11px);
      color: var(--text-muted);
      line-height: 1.4;
      margin-bottom: clamp(3px, 0.5cqw, 5px);
    }
    .pillar-bar-track {
      width: 80%;
      height: clamp(3px, 0.5cqw, 5px);
      background: rgba(255,255,255,0.04);
      border-radius: 3px;
      overflow: hidden;
    }
    .pillar-bar-fill {
      height: 100%;
      border-radius: 3px;
    }

    /* ═══════════════════════════════════════════
       SLIDE 4 — TRUTH / INSIGHT GRID
       ═══════════════════════════════════════════ */
    .slide-4 .slide-content { justify-content: center; align-items: center; }

    .truth-orb {
      width: clamp(60px, 12cqw, 110px);
      height: clamp(60px, 12cqw, 110px);
      border-radius: 50%;
      background: radial-gradient(circle at 40% 35%, ${a(0.25)} 0%, ${a(0.06)} 50%, transparent 100%);
      border: 1.5px solid ${a(0.2)};
      box-shadow: 0 0 35px ${a(0.08)};
      display: flex; align-items: center; justify-content: center;
      position: relative;
      margin-bottom: clamp(8px, 1.8cqw, 18px);
    }
    .truth-orb::before {
      content: '';
      position: absolute;
      inset: 5px;
      border-radius: 50%;
      border: 1px solid ${a(0.12)};
    }
    .truth-orb-icon {
      font-size: clamp(16px, 3.2cqw, 32px);
      color: ${a(0.7)};
      position: relative;
      z-index: 2;
    }

    .truth-title {
      font-family: var(--font-serif);
      font-size: clamp(16px, 3cqw, 30px);
      font-weight: 700;
      color: var(--text-primary);
      text-align: center;
      margin-bottom: clamp(8px, 1.5cqw, 16px);
    }

    .truth-grid {
      width: 92%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: clamp(5px, 1cqw, 10px);
      margin-bottom: clamp(8px, 1.5cqw, 16px);
    }
    .truth-card {
      background: ${a(0.03)};
      border: 1px solid ${a(0.08)};
      border-radius: clamp(6px, 1cqw, 10px);
      padding: clamp(6px, 1.2cqw, 12px);
      display: flex;
      align-items: flex-start;
      gap: clamp(4px, 0.8cqw, 8px);
    }
    .truth-icon-sm {
      width: clamp(22px, 4.2cqw, 36px);
      height: clamp(22px, 4.2cqw, 36px);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      position: relative;
      flex-shrink: 0;
    }
    .truth-icon-sm::before {
      content: '';
      position: absolute;
      inset: 2px;
      border-radius: 50%;
    }
    .truth-icon-sm.ti-orange {
      background: radial-gradient(circle at 40% 35%, rgba(245,158,11,0.3) 0%, rgba(245,158,11,0.08) 60%, transparent 100%);
      border: 1px solid rgba(245,158,11,0.25);
    }
    .truth-icon-sm.ti-orange::before { border: 1px solid rgba(245,158,11,0.1); }
    .truth-icon-sm.ti-gold {
      background: radial-gradient(circle at 40% 35%, rgba(201,169,98,0.3) 0%, rgba(201,169,98,0.08) 60%, transparent 100%);
      border: 1px solid rgba(201,169,98,0.25);
    }
    .truth-icon-sm.ti-gold::before { border: 1px solid rgba(201,169,98,0.1); }
    .truth-icon-sm.ti-teal {
      background: radial-gradient(circle at 40% 35%, rgba(94,234,212,0.3) 0%, rgba(94,234,212,0.08) 60%, transparent 100%);
      border: 1px solid rgba(94,234,212,0.25);
    }
    .truth-icon-sm.ti-teal::before { border: 1px solid rgba(94,234,212,0.1); }
    .truth-icon-sm.ti-green {
      background: radial-gradient(circle at 40% 35%, rgba(74,222,128,0.3) 0%, rgba(74,222,128,0.08) 60%, transparent 100%);
      border: 1px solid rgba(74,222,128,0.25);
    }
    .truth-icon-sm.ti-green::before { border: 1px solid rgba(74,222,128,0.1); }
    .truth-icon-sm.ti-purple {
      background: radial-gradient(circle at 40% 35%, rgba(168,85,247,0.3) 0%, rgba(168,85,247,0.08) 60%, transparent 100%);
      border: 1px solid rgba(168,85,247,0.25);
    }
    .truth-icon-sm.ti-purple::before { border: 1px solid rgba(168,85,247,0.1); }
    .truth-icon-sm.ti-blue {
      background: radial-gradient(circle at 40% 35%, rgba(96,165,250,0.3) 0%, rgba(96,165,250,0.08) 60%, transparent 100%);
      border: 1px solid rgba(96,165,250,0.25);
    }
    .truth-icon-sm.ti-blue::before { border: 1px solid rgba(96,165,250,0.1); }

    .truth-icon-sym {
      font-size: clamp(8px, 1.4cqw, 14px);
      position: relative;
      z-index: 2;
    }
    .ti-orange .truth-icon-sym { color: var(--accent-orange); }
    .ti-gold .truth-icon-sym { color: var(--accent-gold); }
    .ti-teal .truth-icon-sym { color: var(--accent-teal); }
    .ti-green .truth-icon-sym { color: var(--accent-green); }
    .ti-purple .truth-icon-sym { color: var(--accent-purple); }
    .ti-blue .truth-icon-sym { color: var(--accent-blue); }

    .truth-info { flex: 1; min-width: 0; }
    .truth-card-title {
      font-size: clamp(8px, 1.2cqw, 12px);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: clamp(1px, 0.2cqw, 2px);
    }
    .truth-card-desc {
      font-size: clamp(6px, 0.95cqw, 9px);
      color: var(--text-muted);
      line-height: 1.35;
    }

    .philosophy-box {
      width: 92%;
      background: ${a(0.02)};
      border: 1px solid ${a(0.06)};
      border-radius: clamp(6px, 1cqw, 10px);
      padding: clamp(8px, 1.5cqw, 14px);
      text-align: center;
    }
    .philosophy-text {
      font-family: var(--font-serif);
      font-size: clamp(9px, 1.4cqw, 14px);
      font-style: italic;
      color: rgba(255,255,255,0.3);
      line-height: 1.5;
    }

    /* ═══════════════════════════════════════════
       SLIDE 5 — CTA
       ═══════════════════════════════════════════ */
    .slide-5 .slide-content { align-items: center; text-align: center; justify-content: center; gap: clamp(6px, 1.2cqw, 14px); }

    .cta-stat-grid {
      width: 80%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: clamp(6px, 1cqw, 12px);
    }
    .cta-stat {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: clamp(6px, 1cqw, 10px);
      padding: clamp(6px, 1.2cqw, 14px) clamp(8px, 1.5cqw, 16px);
      text-align: center;
    }
    .cta-stat-value {
      font-family: var(--font-mono);
      font-size: clamp(14px, 2.8cqw, 28px);
      font-weight: 700;
      color: var(--accent-primary);
      line-height: 1;
    }
    .cta-stat-label {
      font-family: var(--font-mono);
      font-size: clamp(6px, 0.9cqw, 9px);
      color: var(--text-muted);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-top: clamp(2px, 0.4cqw, 5px);
    }

    .cta-glow-orb {
      width: clamp(50px, 10cqw, 90px);
      height: clamp(50px, 10cqw, 90px);
      border-radius: 50%;
      background: radial-gradient(circle at 40% 35%, ${a(0.2)} 0%, ${a(0.06)} 50%, transparent 100%);
      border: 1.5px solid ${a(0.2)};
      box-shadow: 0 0 40px ${a(0.1)}, 0 0 80px ${a(0.03)};
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .cta-glow-orb::before {
      content: '';
      position: absolute;
      inset: 5px;
      border-radius: 50%;
      border: 1px solid ${a(0.12)};
    }
    .cta-glow-orb .cta-orb-icon {
      font-size: clamp(16px, 3.5cqw, 32px);
      color: var(--accent-primary);
      position: relative;
      z-index: 1;
    }

    .cta-tagline {
      font-family: var(--font-serif);
      font-size: clamp(18px, 3.5cqw, 36px);
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
    }
    .cta-desc {
      font-size: clamp(9px, 1.5cqw, 16px);
      color: var(--text-secondary);
      line-height: 1.5;
      max-width: 85%;
    }
    .cta-pills {
      display: flex;
      gap: clamp(4px, 0.8cqw, 8px);
      flex-wrap: wrap;
      justify-content: center;
    }
    .cta-pill {
      font-family: var(--font-mono);
      font-size: clamp(6px, 0.9cqw, 9px);
      letter-spacing: 0.15em;
      text-transform: uppercase;
      padding: clamp(3px, 0.5cqw, 6px) clamp(8px, 1.5cqw, 14px);
      border-radius: 99px;
      background: ${a(0.06)};
      border: 1px solid ${a(0.2)};
      color: ${a(0.8)};
    }
    .cta-box {
      background: linear-gradient(135deg, ${a(0.12)} 0%, ${a(0.04)} 100%);
      border: 2px solid var(--accent-primary);
      border-radius: clamp(10px, 1.8cqw, 18px);
      padding: clamp(10px, 2cqw, 22px) clamp(20px, 4cqw, 44px);
    }
    .cta-box-text {
      font-size: clamp(11px, 2cqw, 20px);
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: clamp(2px, 0.3cqw, 4px);
    }
    .cta-link {
      font-size: clamp(9px, 1.6cqw, 16px);
      font-weight: 600;
      color: var(--accent-primary);
    }
`;
}

// ═══════════════════════════════════════════════════════════════
// HTML GENERATORS
// ═══════════════════════════════════════════════════════════════

function slide1Html(p) {
  return `
    <!-- ══════ SLIDE 1: Hook ══════ -->
    <div class="slide-wrapper" data-slide="1">
      <span class="slide-label">Slide 1 &mdash; Hook</span>
      <div class="slide slide-warm slide-1">
        <div class="accent-bar"></div>
        <div class="slide-content">
          <div class="hook-badge">${p.hookBadge}</div>

          <div class="hook-orb">
            <div class="orb-inner">
              <span class="orb-icon">${p.orbIcon}</span>
              <span class="orb-label">${p.orbLabel}</span>
            </div>
          </div>

          <div class="hook-title">${p.hookTitle}</div>
          <div class="hook-divider"></div>
          <div class="hook-sub">${p.hookSub}</div>
          <div class="slide-logo">Signal Pilot</div>
        </div>
      </div>
    </div>`;
}

function slide2Html(p) {
  const cards = p.s2Cards.map(c => `
            <div class="grid-card${c.cardClass ? ' ' + c.cardClass : ''}">
              <div class="card-icon ci-${c.iconColor}">
                <span class="card-icon-sym">${c.icon}</span>
              </div>
              <div class="card-info">
                <div class="card-title">${c.title}</div>
                <div class="card-desc">${c.desc}</div>
                <div class="card-bar-track"><div class="card-bar-fill" style="width:${c.barWidth}%;background:linear-gradient(90deg,rgba(${c.barRgb},0.3),rgba(${c.barRgb},0.7))"></div></div>
              </div>
            </div>`).join('\n');
  return `
    <!-- ══════ SLIDE 2: ${p.s2Tag} ══════ -->
    <div class="slide-wrapper" data-slide="2">
      <span class="slide-label">Slide 2 &mdash; ${p.s2Tag}</span>
      <div class="slide slide-warm slide-2">
        <span class="slide-counter">02 / 05</span>
        <div class="slide-content">
          <div class="section-tag">${p.s2Tag}</div>
          <div class="section-title">${p.s2Title}</div>
          <div class="warm-divider"></div>

          <div class="card-grid">${cards}
          </div>

          <div class="vs-box">
            <div class="vs-side vs-bad">
              <div class="vs-side-icon">
                <span class="vs-icon-sym">&#10007;</span>
              </div>
              <div class="vs-side-label">${p.vsLeft.label}</div>
              <div class="vs-side-text">${p.vsLeft.text}</div>
            </div>
            <div class="vs-side vs-good">
              <div class="vs-side-icon">
                <span class="vs-icon-sym">&#10003;</span>
              </div>
              <div class="vs-side-label">${p.vsRight.label}</div>
              <div class="vs-side-text">${p.vsRight.text}</div>
            </div>
          </div>

          <div class="slide-logo">Signal Pilot</div>
        </div>
      </div>
    </div>`;
}

function slide3Html(p) {
  const pillars = p.s3Pillars.map((pil, i) => {
    const isLast = i === p.s3Pillars.length - 1;
    return `
            <div class="pillar-row">
              <div class="pillar-left">
                <div class="pillar-ring pr-${pil.color}"><span class="pillar-num">${i + 1}</span></div>${isLast ? '' : '\n                <div class="pillar-connector"></div>'}
              </div>
              <div class="pillar-body">
                <div class="pillar-title">${pil.title}</div>
                <div class="pillar-desc">${pil.desc}</div>
                <div class="pillar-bar-track"><div class="pillar-bar-fill" style="width:${pil.barWidth}%;background:linear-gradient(90deg,rgba(${pil.barRgb},0.3),rgba(${pil.barRgb},0.7))"></div></div>
              </div>
            </div>`;
  }).join('\n');
  return `
    <!-- ══════ SLIDE 3: ${p.s3Tag} ══════ -->
    <div class="slide-wrapper" data-slide="3">
      <span class="slide-label">Slide 3 &mdash; ${p.s3Tag}</span>
      <div class="slide slide-warm slide-3">
        <span class="slide-counter">03 / 05</span>
        <div class="slide-content">
          <div class="section-tag">${p.s3Tag}</div>
          <div class="section-title">${p.s3Title}</div>
          <div class="warm-divider"></div>

          <div class="pillar-stack">${pillars}
          </div>

          <div class="slide-logo">Signal Pilot</div>
        </div>
      </div>
    </div>`;
}

function slide4Html(p) {
  const truths = p.s4Truths.map(t => `
            <div class="truth-card">
              <div class="truth-icon-sm ti-${t.color}">
                <span class="truth-icon-sym">${t.icon}</span>
              </div>
              <div class="truth-info">
                <div class="truth-card-title">${t.title}</div>
                <div class="truth-card-desc">${t.desc}</div>
              </div>
            </div>`).join('\n');
  return `
    <!-- ══════ SLIDE 4: ${p.s4Tag} ══════ -->
    <div class="slide-wrapper" data-slide="4">
      <span class="slide-label">Slide 4 &mdash; ${p.s4Tag}</span>
      <div class="slide slide-warm slide-4">
        <span class="slide-counter">04 / 05</span>
        <div class="slide-content">
          <div class="section-tag">${p.s4Tag}</div>

          <div class="truth-orb">
            <span class="truth-orb-icon">${p.s4OrbIcon}</span>
          </div>

          <div class="truth-title">${p.s4Title}</div>

          <div class="truth-grid">${truths}
          </div>

          <div class="philosophy-box">
            <div class="philosophy-text">${p.s4Philosophy}</div>
          </div>

          <div class="slide-logo">Signal Pilot</div>
        </div>
      </div>
    </div>`;
}

function slide5Html(p) {
  const stats = p.ctaStats.map(s => `
            <div class="cta-stat">
              <div class="cta-stat-value">${s.value}</div>
              <div class="cta-stat-label">${s.label}</div>
            </div>`).join('\n');
  const pills = p.ctaPills.map(l => `            <span class="cta-pill">${l}</span>`).join('\n');
  return `
    <!-- ══════ SLIDE 5: CTA ══════ -->
    <div class="slide-wrapper" data-slide="5">
      <span class="slide-label">Slide 5 &mdash; CTA</span>
      <div class="slide slide-warm slide-5">
        <span class="slide-counter">05 / 05</span>
        <div class="slide-content">

          <div class="cta-stat-grid">${stats}
          </div>

          <div class="cta-glow-orb">
            <span class="cta-orb-icon">${p.ctaOrbIcon}</span>
          </div>

          <div class="cta-tagline">${p.ctaTagline}</div>

          <p class="cta-desc">${p.ctaDesc}</p>

          <div class="cta-pills">
${pills}
          </div>

          <div class="cta-box">
            <p class="cta-box-text">${p.ctaBoxText}</p>
            <span class="cta-link">signalpilot.io</span>
          </div>

          <div class="slide-logo">Signal Pilot</div>
        </div>
      </div>
    </div>`;
}

function jsBlock() {
  return `
  <script>
    (function() {
      const exportBtn = document.getElementById('export-btn');
      const slideWrappers = document.querySelectorAll('.slide-wrapper');
      let exportMode = false;
      let currentSlide = 0;

      exportBtn.addEventListener('click', function() {
        exportMode = !exportMode;
        document.body.classList.toggle('export-mode', exportMode);
        this.textContent = exportMode ? 'Exit Export' : 'Export Mode';
        if (exportMode) { currentSlide = 0; updateActiveSlide(); }
      });
      function updateActiveSlide() {
        slideWrappers.forEach((w, i) => {
          w.classList.toggle('active', i === currentSlide);
          w.classList.toggle('exporting', i === currentSlide);
        });
      }
      document.addEventListener('keydown', function(e) {
        if (!exportMode) return;
        if (e.key === 'ArrowRight' || e.key === ' ') { currentSlide = (currentSlide + 1) % slideWrappers.length; updateActiveSlide(); }
        else if (e.key === 'ArrowLeft') { currentSlide = (currentSlide - 1 + slideWrappers.length) % slideWrappers.length; updateActiveSlide(); }
        else if (e.key === 'Escape') { exportMode = false; document.body.classList.remove('export-mode'); exportBtn.textContent = 'Export Mode'; }
      });
    })();
  </script>`;
}

// ═══════════════════════════════════════════════════════════════
// FULL FILE ASSEMBLER
// ═══════════════════════════════════════════════════════════════
function buildPost(p) {
  const t = themeFor(p.num);
  const pad = String(p.num).padStart(3, '0');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Post ${pad} &mdash; ${p.title} | Carousel Preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Gugi&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">
  <style>${generateCSS(t)}  </style>
</head>
<body>
  <div class="controls">
    <button id="export-btn">Export Mode</button>
  </div>

  <div class="page-title">
    <h1>Post ${pad} &mdash; ${p.title}</h1>
    <p>5 slides &middot; ${p.type}</p>
  </div>

  <div class="carousel-grid">
${slide1Html(p)}
${slide2Html(p)}
${slide3Html(p)}
${slide4Html(p)}
${slide5Html(p)}

  </div>
${jsBlock()}
</body>
</html>
`;
}


// ═══════════════════════════════════════════════════════════════
// POST CONTENT DATA  (22 posts)
// ═══════════════════════════════════════════════════════════════
// Colour shorthand for bar-fill RGB values
const R = { red:'248,113,113', green:'74,222,128', blue:'96,165,250', gold:'201,169,98', teal:'94,234,212', purple:'168,85,247', orange:'245,158,11' };

const POSTS = [
  // ── QUOTE POSTS (orange column) ─────────────────────────────
  {
    num: 154, type: 'Quote Card', title: 'Paper Trading Psychology',
    hookBadge: 'PSYCHOLOGY', orbIcon: '&#9670;', orbLabel: 'MIND > CHARTS',
    hookTitle: '<em>95%</em> of Trading Mistakes<br>Are <em>Emotional</em>',
    hookSub: 'Master the mental game. The charts are the easy part.',
    s2Tag: 'Warning', s2Title: 'The Cost of <span class="warm">Emotion</span>',
    s2Cards: [
      { icon:'&#10007;', title:'Revenge Trading', desc:'Impulsive entries after losses compound the damage', iconColor:'red', barWidth:92, barRgb:R.red },
      { icon:'&#10007;', title:'FOMO Entries', desc:'Jumping in without a setup because the market moved', iconColor:'red', barWidth:88, barRgb:R.red },
      { icon:'&#10007;', title:'Moving Stops', desc:'Widening stop loss hoping for reversal denies analysis', iconColor:'red', barWidth:85, barRgb:R.red },
      { icon:'&#10007;', title:'Oversizing', desc:'Breaking position rules because you feel confident', iconColor:'red', barWidth:90, barRgb:R.red },
    ],
    vsLeft: { label:'Emotion', text:'Reactive decisions destroy accounts faster than bad strategy' },
    vsRight: { label:'Process', text:'Rule-based execution builds compounding results over time' },
    s3Tag: 'Framework', s3Title: '5 Pillars of <span class="warm">Emotional</span> Control',
    s3Pillars: [
      { title:'Recognize the <span class="warm">Trigger</span>', desc:'Know what emotions arise before and during trades', color:'orange', barWidth:92, barRgb:R.orange },
      { title:'Pause Before <span style="color:var(--accent-gold)">Acting</span>', desc:'Take a breath. Check your checklist. Never react instantly', color:'gold', barWidth:90, barRgb:R.gold },
      { title:'Follow Your <span style="color:var(--accent-teal)">Rules</span>', desc:'Your written plan knows more than your emotions', color:'teal', barWidth:88, barRgb:R.teal },
      { title:'Journal <span style="color:var(--accent-purple)">Everything</span>', desc:'Record emotions alongside trades to find patterns', color:'purple', barWidth:85, barRgb:R.purple },
      { title:'Review <span style="color:var(--accent-green)">Weekly</span>', desc:'Look for emotional patterns and fix the process', color:'green', barWidth:86, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#9670;',
    s4Title: 'The <span class="warm">Psychology</span> Edge',
    s4Truths: [
      { icon:'&#9656;', title:'Rules Over Feelings', desc:'Your system knows more than your emotions', color:'orange' },
      { icon:'&#9670;', title:'Process Over Outcome', desc:'A disciplined loss is a win long-term', color:'gold' },
      { icon:'&#9674;', title:'Awareness Compounds', desc:'Emotional intelligence builds with practice', color:'teal' },
      { icon:'&#10003;', title:'Patience Is a Skill', desc:'Waiting for your setup is the hardest trade', color:'green' },
    ],
    s4Philosophy: 'Trading psychology is not about eliminating emotions.<br>It is about not letting them drive your decisions.',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Master Your<br><span class="warm">Mindset.</span>',
    ctaDesc: 'The charts are the easy part. Master the mental game and everything else follows.',
    ctaStats: [{ value:'95%', label:'Emotional' },{ value:'5', label:'Pillars' },{ value:'4', label:'Costly Mistakes' },{ value:'&infin;', label:'Compound' }],
    ctaPills: ['Psychology','Discipline','Process','Awareness'], ctaBoxText: 'Master Your Trading Mind',
  },
  {
    num: 164, type: 'Quote Card', title: 'The Psychology of Waiting',
    hookBadge: 'PATIENCE', orbIcon: '&#8987;', orbLabel: 'WAIT > CHASE',
    hookTitle: 'The Best Traders<br>Spend 80% of Time <em>Waiting</em>',
    hookSub: 'Patience is not passive. It is your most active edge.',
    s2Tag: 'Warning', s2Title: 'Why <span class="warm">Waiting</span> Is Hard',
    s2Cards: [
      { icon:'&#10007;', title:'FOMO', desc:'Fear of missing the move clouds judgment', iconColor:'red', barWidth:94, barRgb:R.red },
      { icon:'&#10007;', title:'Boredom', desc:'Confusing boredom with a need to trade', iconColor:'red', barWidth:88, barRgb:R.red },
      { icon:'&#10007;', title:'Impatience', desc:'Rushing entries after consecutive losses', iconColor:'red', barWidth:86, barRgb:R.red },
      { icon:'&#10007;', title:'Overconfidence', desc:'Thinking every candle is your opportunity', iconColor:'red', barWidth:82, barRgb:R.red },
    ],
    vsLeft: { label:'Impatient', text:'More trades, worse entries, higher costs, lower win rate' },
    vsRight: { label:'Patient', text:'Fewer trades, precise entries, lower cost, higher win rate' },
    s3Tag: 'Framework', s3Title: '5 Rules for <span class="warm">Patient</span> Trading',
    s3Pillars: [
      { title:'Define Your <span class="warm">Setup</span>', desc:'Write exact criteria before the session starts', color:'orange', barWidth:92, barRgb:R.orange },
      { title:'Wait for <span style="color:var(--accent-gold)">Alignment</span>', desc:'Only trade when ALL criteria align simultaneously', color:'gold', barWidth:90, barRgb:R.gold },
      { title:'Journal <span style="color:var(--accent-teal)">Skipped</span> Trades', desc:'Record the ones you passed on and why', color:'teal', barWidth:88, barRgb:R.teal },
      { title:'Set Daily <span style="color:var(--accent-purple)">Limits</span>', desc:'Max 3 trades per day forces selectivity', color:'purple', barWidth:85, barRgb:R.purple },
      { title:'Review <span style="color:var(--accent-green)">Quality</span>', desc:'Measure setup quality not just P&amp;L', color:'green', barWidth:86, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#8987;',
    s4Title: 'The <span class="warm">Patience</span> Edge',
    s4Truths: [
      { icon:'&#9656;', title:'Waiting IS Trading', desc:'Not trading is an active, profitable decision', color:'orange' },
      { icon:'&#9670;', title:'Quality Over Quantity', desc:'One great trade beats five mediocre ones', color:'gold' },
      { icon:'&#9674;', title:'80/20 Rule', desc:'80% waiting, 20% executing. Always.', color:'teal' },
      { icon:'&#10003;', title:'Patience Compounds', desc:'Better entries compound into exponential results', color:'green' },
    ],
    s4Philosophy: 'The market rewards patience and punishes impatience.<br>Every great entry started with the discipline to wait.',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Stop Chasing.<br>Start <span class="warm">Waiting.</span>',
    ctaDesc: 'Patience is not passive. It is your most powerful edge. Master it.',
    ctaStats: [{ value:'80%', label:'Time Waiting' },{ value:'20%', label:'Time Trading' },{ value:'5', label:'Rules' },{ value:'&infin;', label:'Compound' }],
    ctaPills: ['Patience','Discipline','Selectivity','Quality'], ctaBoxText: 'Master Patient Trading',
  },
  {
    num: 174, type: 'Quote Card', title: 'Pre-Trade Checklist',
    hookBadge: 'SYSTEM', orbIcon: '&#9745;', orbLabel: 'CHECK > GUESS',
    hookTitle: 'A Checklist Removes<br><em>Emotion</em> From Every Trade',
    hookSub: 'Process over prediction. Every single time.',
    s2Tag: 'Problem', s2Title: 'Without a <span class="warm">Checklist</span>',
    s2Cards: [
      { icon:'&#10007;', title:'Emotional Entries', desc:'Gut feeling replaces analysis in the moment', iconColor:'red', barWidth:92, barRgb:R.red },
      { icon:'&#10007;', title:'Forgotten Stops', desc:'Skipping stop loss because you are sure', iconColor:'red', barWidth:88, barRgb:R.red },
      { icon:'&#10007;', title:'Random Sizing', desc:'Position size varies with confidence, not rules', iconColor:'red', barWidth:86, barRgb:R.red },
      { icon:'&#10007;', title:'Post-Trade Regret', desc:'Knowing you broke your own rules again', iconColor:'red', barWidth:90, barRgb:R.red },
    ],
    vsLeft: { label:'No Checklist', text:'Emotional, inconsistent, regretful trading' },
    vsRight: { label:'Checklist', text:'Rule-based, consistent, confident trading' },
    s3Tag: 'The Checklist', s3Title: '5 Items <span class="warm">Before</span> Every Trade',
    s3Pillars: [
      { title:'Regime <span class="warm">Confirmed</span>', desc:'Know if the market is trending or ranging', color:'orange', barWidth:95, barRgb:R.orange },
      { title:'Setup <span style="color:var(--accent-gold)">Matches</span> Rules', desc:'Does this trade fit your written strategy?', color:'gold', barWidth:92, barRgb:R.gold },
      { title:'Stop Loss <span style="color:var(--accent-teal)">Placed</span>', desc:'Defined before entry. Non-negotiable.', color:'teal', barWidth:90, barRgb:R.teal },
      { title:'Target <span style="color:var(--accent-purple)">Identified</span>', desc:'Know your exit before you enter', color:'purple', barWidth:88, barRgb:R.purple },
      { title:'Size <span style="color:var(--accent-green)">Calculated</span>', desc:'Position sized to your risk rules exactly', color:'green', barWidth:86, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#9745;',
    s4Title: 'The <span class="warm">Checklist</span> Edge',
    s4Truths: [
      { icon:'&#9656;', title:'Process Over Prediction', desc:'You don\'t need to predict. Follow process.', color:'orange' },
      { icon:'&#9670;', title:'Removes Emotion', desc:'The checklist decides, not your feelings', color:'gold' },
      { icon:'&#9674;', title:'Consistency Compounds', desc:'Same process every trade builds an edge', color:'teal' },
      { icon:'&#10003;', title:'Accountability', desc:'Journal checklist compliance weekly', color:'green' },
    ],
    s4Philosophy: 'Pilots use checklists because lives depend on it.<br>Traders should use them because accounts depend on it.',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Check First.<br>Trade <span class="warm">Second.</span>',
    ctaDesc: 'A 30-second checklist prevents 90% of impulsive trades.',
    ctaStats: [{ value:'5', label:'Checklist Items' },{ value:'30s', label:'Per Trade' },{ value:'90%', label:'Mistakes Prevented' },{ value:'&infin;', label:'Compound' }],
    ctaPills: ['Regime','Setup','Stop','Target','Size'], ctaBoxText: 'Build Your Checklist',
  },
  {
    num: 184, type: 'Quote Card', title: 'Risk and Knowledge',
    hookBadge: 'RISK', orbIcon: '&#9888;', orbLabel: 'KNOW > HOPE',
    hookTitle: 'The Best Advice I<br><em>Ignored</em> Until I Lost $4,000',
    hookSub: 'Risk management is not optional. It is the entire game.',
    s2Tag: 'Warning', s2Title: 'The Cost of <span class="warm">Ignorance</span>',
    s2Cards: [
      { icon:'&#10007;', title:'No Stop Loss', desc:'Hoping the trade recovers instead of cutting losses', iconColor:'red', barWidth:94, barRgb:R.red },
      { icon:'&#10007;', title:'Oversized Positions', desc:'Risking 10% on one trade because it looked good', iconColor:'red', barWidth:90, barRgb:R.red },
      { icon:'&#10007;', title:'No Risk Plan', desc:'Trading without knowing max daily or weekly loss', iconColor:'red', barWidth:86, barRgb:R.red },
      { icon:'&#10007;', title:'Ignoring Drawdown', desc:'Continuing to trade through a losing streak', iconColor:'red', barWidth:88, barRgb:R.red },
    ],
    vsLeft: { label:'Ignorance', text:'$4,000 lesson learned the hard way' },
    vsRight: { label:'Knowledge', text:'Same lesson in 60 seconds. Zero cost.' },
    s3Tag: 'Framework', s3Title: '5 Rules of <span class="warm">Risk</span> Management',
    s3Pillars: [
      { title:'Max <span class="warm">1-2%</span> Per Trade', desc:'Never risk more than 2% of account on a single trade', color:'orange', barWidth:95, barRgb:R.orange },
      { title:'Always Use a <span style="color:var(--accent-gold)">Stop</span>', desc:'Pre-set before entry. Move it tighter, never wider.', color:'gold', barWidth:92, barRgb:R.gold },
      { title:'Define <span style="color:var(--accent-teal)">Daily</span> Max Loss', desc:'Hit 3% daily loss? Done. Close the charts.', color:'teal', barWidth:88, barRgb:R.teal },
      { title:'Track <span style="color:var(--accent-purple)">Weekly</span> Drawdown', desc:'Hit 7% weekly? Reduce size by 50% for the rest', color:'purple', barWidth:85, barRgb:R.purple },
      { title:'Review <span style="color:var(--accent-green)">Monthly</span>', desc:'Full risk audit every month. No exceptions.', color:'green', barWidth:86, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#9888;',
    s4Title: 'The <span class="warm">Risk</span> Edge',
    s4Truths: [
      { icon:'&#9656;', title:'Survival First', desc:'You cannot profit if you blow up your account', color:'orange' },
      { icon:'&#9670;', title:'Small Losses Compound', desc:'Controlled 1% losses let you survive 50 losers', color:'gold' },
      { icon:'&#9674;', title:'Risk:Reward Matters', desc:'Never enter without at least 1:2 risk to reward', color:'teal' },
      { icon:'&#10003;', title:'Rules Protect You', desc:'Risk rules save you from your worst impulses', color:'green' },
    ],
    s4Philosophy: 'Risk management is not about avoiding risk.<br>It is about surviving long enough for your edge to work.',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Manage Risk.<br>Build <span class="warm">Wealth.</span>',
    ctaDesc: 'Risk management is the only edge that never expires.',
    ctaStats: [{ value:'1-2%', label:'Max Risk' },{ value:'$4K', label:'Lesson Cost' },{ value:'5', label:'Rules' },{ value:'&infin;', label:'Survival' }],
    ctaPills: ['Stop Loss','Position Size','Daily Limit','Risk:Reward'], ctaBoxText: 'Master Risk Management',
  },
  {
    num: 194, type: 'Quote Card', title: 'Managing Risk',
    hookBadge: 'DISCIPLINE', orbIcon: '&#9878;', orbLabel: 'MANAGE > AVOID',
    hookTitle: 'Risk Cannot Be <em>Avoided</em>.<br>Only <em>Managed</em>.',
    hookSub: 'The price of opportunity is risk. Pay it wisely.',
    s2Tag: 'Three Paths', s2Title: 'How Do You Handle <span class="warm">Risk</span>?',
    s2Cards: [
      { icon:'&#10007;', title:'Avoiding Risk', desc:'Never trading. Paralyzed by fear. Zero opportunity.', iconColor:'red', barWidth:30, barRgb:R.red },
      { icon:'&#10007;', title:'Ignoring Risk', desc:'No stops. Reckless sizing. Inevitable blow-up.', iconColor:'red', barWidth:15, barRgb:R.red },
      { icon:'&#10003;', title:'Managing Risk', desc:'Calculated sizing. Defined stops. Sustainable trading.', iconColor:'green', cardClass:'card-green', barWidth:95, barRgb:R.green },
      { icon:'&#9670;', title:'The Difference', desc:'Managing risk means you stay in the game long enough to win.', iconColor:'gold', cardClass:'card-gold', barWidth:92, barRgb:R.gold },
    ],
    vsLeft: { label:'Avoiding', text:'Zero risk means zero opportunity. Stagnation.' },
    vsRight: { label:'Managing', text:'Calculated risk creates compounding opportunity.' },
    s3Tag: 'Framework', s3Title: '5 Steps to <span class="warm">Manage</span> Risk',
    s3Pillars: [
      { title:'Accept That <span class="warm">Risk</span> Exists', desc:'Every trade carries risk. Embrace it, don\'t fear it.', color:'orange', barWidth:92, barRgb:R.orange },
      { title:'Define Your <span style="color:var(--accent-gold)">Tolerance</span>', desc:'How much can you lose today and still trade tomorrow?', color:'gold', barWidth:90, barRgb:R.gold },
      { title:'Size <span style="color:var(--accent-teal)">Accordingly</span>', desc:'Position size flows from risk tolerance, not conviction', color:'teal', barWidth:88, barRgb:R.teal },
      { title:'Set <span style="color:var(--accent-purple)">Boundaries</span>', desc:'Daily, weekly, monthly loss limits. Non-negotiable.', color:'purple', barWidth:85, barRgb:R.purple },
      { title:'Review and <span style="color:var(--accent-green)">Adapt</span>', desc:'Risk parameters evolve as your account and skill grow', color:'green', barWidth:86, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#9878;',
    s4Title: 'The <span class="warm">Management</span> Edge',
    s4Truths: [
      { icon:'&#9656;', title:'Risk Is the Price', desc:'You cannot avoid risk and still profit', color:'orange' },
      { icon:'&#9670;', title:'Survival Is the Game', desc:'Manage risk to stay in the game forever', color:'gold' },
      { icon:'&#9674;', title:'Consistency Wins', desc:'Same risk rules every trade builds compounding', color:'teal' },
      { icon:'&#10003;', title:'Process Over Outcome', desc:'A managed loss is a win for your system', color:'green' },
    ],
    s4Philosophy: 'Risk cannot be eliminated. It can only be transferred,<br>reduced, or managed. Choose managed. Always.',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Stop Avoiding.<br>Start <span class="warm">Managing.</span>',
    ctaDesc: 'The only sustainable edge is risk managed systematically.',
    ctaStats: [{ value:'3', label:'Risk Paths' },{ value:'1', label:'Correct One' },{ value:'5', label:'Steps' },{ value:'&infin;', label:'Longevity' }],
    ctaPills: ['Risk','Size','Stops','Limits','Review'], ctaBoxText: 'Master Risk Management',
  },
  {
    num: 204, type: 'Quote Card', title: 'Patience vs Greed',
    hookBadge: 'PSYCHOLOGY', orbIcon: '&#9878;', orbLabel: 'SLOW > FAST',
    hookTitle: 'Patience Builds Wealth.<br><em>Greed</em> Destroys It.',
    hookSub: 'The market rewards those who can wait.',
    s2Tag: 'Warning', s2Title: 'The Cost of <span class="warm">Greed</span>',
    s2Cards: [
      { icon:'&#10007;', title:'Overtrading', desc:'Taking every setup instead of the best ones', iconColor:'red', barWidth:92, barRgb:R.red },
      { icon:'&#10007;', title:'Moving Targets', desc:'Shifting take-profit higher during a winning trade', iconColor:'red', barWidth:88, barRgb:R.red },
      { icon:'&#10007;', title:'Oversizing Winners', desc:'Doubling down on winners instead of following rules', iconColor:'red', barWidth:86, barRgb:R.red },
      { icon:'&#10007;', title:'Ignoring Exits', desc:'Holding past your target because you want more', iconColor:'red', barWidth:90, barRgb:R.red },
    ],
    vsLeft: { label:'Greed', text:'Turns winners into losers. Destroys discipline.' },
    vsRight: { label:'Patience', text:'Lets winners run. Cuts losers short. Compounds.' },
    s3Tag: 'Framework', s3Title: '5 Rules Against <span class="warm">Greed</span>',
    s3Pillars: [
      { title:'Pre-Set <span class="warm">Targets</span>', desc:'Define take-profit before entry. Don\'t change mid-trade.', color:'orange', barWidth:92, barRgb:R.orange },
      { title:'Take <span style="color:var(--accent-gold)">Partials</span>', desc:'Lock in 50% at first target. Let the rest run.', color:'gold', barWidth:90, barRgb:R.gold },
      { title:'Follow <span style="color:var(--accent-teal)">Rules</span>', desc:'Your system knows better than your greed in the moment', color:'teal', barWidth:88, barRgb:R.teal },
      { title:'Track <span style="color:var(--accent-purple)">Greed</span> Trades', desc:'Journal when greed influenced your decision', color:'purple', barWidth:85, barRgb:R.purple },
      { title:'Celebrate <span style="color:var(--accent-green)">Process</span>', desc:'Reward yourself for following rules, not for P&amp;L', color:'green', barWidth:86, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#9878;',
    s4Title: 'The <span class="warm">Patience</span> Edge',
    s4Truths: [
      { icon:'&#9656;', title:'Patience Compounds', desc:'Consistent gains beat sporadic windfalls', color:'orange' },
      { icon:'&#9670;', title:'Greed Reverses Gains', desc:'One greedy trade can erase a week of work', color:'gold' },
      { icon:'&#9674;', title:'Process Is the Goal', desc:'Following rules IS the reward', color:'teal' },
      { icon:'&#10003;', title:'Time Is Your Ally', desc:'Patient traders outperform over every timeframe', color:'green' },
    ],
    s4Philosophy: 'Greed whispers "just a little more."<br>Patience says "take what the market gives."',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Be Patient.<br>Build <span class="warm">Wealth.</span>',
    ctaDesc: 'Patience is not waiting. It is the discipline to follow your plan.',
    ctaStats: [{ value:'5', label:'Anti-Greed Rules' },{ value:'50%', label:'Partial Target' },{ value:'100%', label:'Rule Adherence' },{ value:'&infin;', label:'Compound' }],
    ctaPills: ['Patience','Targets','Partials','Process'], ctaBoxText: 'Master Patient Trading',
  },
  {
    num: 214, type: 'Quote Card', title: 'The 1% Difference',
    hookBadge: 'EDGE', orbIcon: '&#9651;', orbLabel: '1% + 1% + 1%',
    hookTitle: 'Great Traders Are <em>1%</em><br>Better In <em>Four</em> Places',
    hookSub: 'Marginal gains compound into an enormous edge.',
    s2Tag: 'The Four Areas', s2Title: 'Where <span class="warm">1%</span> Matters',
    s2Cards: [
      { icon:'&#9656;', title:'Better Entries', desc:'Slightly better timing and level selection', iconColor:'blue', cardClass:'card-blue', barWidth:92, barRgb:R.blue },
      { icon:'&#9670;', title:'Better Exits', desc:'Let winners run longer, cut losers faster', iconColor:'green', cardClass:'card-green', barWidth:88, barRgb:R.green },
      { icon:'&#9674;', title:'Better Discipline', desc:'Follow rules more consistently, fewer emotions', iconColor:'gold', cardClass:'card-gold', barWidth:90, barRgb:R.gold },
      { icon:'&#10003;', title:'Better Risk', desc:'Tighter sizing, better risk-to-reward ratios', iconColor:'teal', cardClass:'card-teal', barWidth:86, barRgb:R.teal },
    ],
    vsLeft: { label:'Average', text:'Good at one thing. Weak in three others.' },
    vsRight: { label:'Elite', text:'1% better in all four. That compounds.' },
    s3Tag: 'The Stack', s3Title: 'How <span class="warm">1%</span> Compounds',
    s3Pillars: [
      { title:'<span class="warm">Entry</span> Improvement', desc:'Better entries add 1% to your edge immediately', color:'orange', barWidth:92, barRgb:R.orange },
      { title:'<span style="color:var(--accent-gold)">Exit</span> Improvement', desc:'Better exits preserve gains and reduce drawdown', color:'gold', barWidth:90, barRgb:R.gold },
      { title:'<span style="color:var(--accent-teal)">Discipline</span> Improvement', desc:'Fewer emotional trades removes negative expectancy', color:'teal', barWidth:88, barRgb:R.teal },
      { title:'<span style="color:var(--accent-purple)">Risk</span> Improvement', desc:'Better sizing lets you survive and compound longer', color:'purple', barWidth:86, barRgb:R.purple },
      { title:'<span style="color:var(--accent-green)">Combined</span> Result', desc:'4 x 1% = massive compounding advantage over time', color:'green', barWidth:95, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#9651;',
    s4Title: 'The <span class="warm">Compound</span> Edge',
    s4Truths: [
      { icon:'&#9656;', title:'Not 10x Better', desc:'Elite traders are 1% better in four places', color:'orange' },
      { icon:'&#9670;', title:'Marginal Gains Stack', desc:'Each 1% multiplies with the others', color:'gold' },
      { icon:'&#9674;', title:'Time Amplifies', desc:'1% daily becomes massive over a year', color:'teal' },
      { icon:'&#10003;', title:'Process Creates 1%', desc:'Systems and checklists deliver the 1%', color:'green' },
    ],
    s4Philosophy: 'You do not need to be dramatically better.<br>You need to be slightly better in every dimension.',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Find Your<br><span class="warm">1%.</span>',
    ctaDesc: 'Marginal gains compound into an enormous, durable edge.',
    ctaStats: [{ value:'4', label:'Areas' },{ value:'1%', label:'Each' },{ value:'4%+', label:'Combined' },{ value:'&infin;', label:'Compound' }],
    ctaPills: ['Entries','Exits','Discipline','Risk'], ctaBoxText: 'Stack Your Edge',
  },
  {
    num: 224, type: 'Quote Card', title: 'Expensive Lessons',
    hookBadge: 'EDUCATION', orbIcon: '&#128176;', orbLabel: 'LEARN < PAY',
    hookTitle: 'Every Lesson Has a<br><em>Price Tag</em>. Choose Wisely.',
    hookSub: 'Education costs time. Ignorance costs money.',
    s2Tag: 'Two Paths', s2Title: 'Same Lesson. Different <span class="warm">Price</span>.',
    s2Cards: [
      { icon:'&#10003;', title:'Study First', desc:'Time investment. Paper losses. Foundation built.', iconColor:'green', cardClass:'card-green', barWidth:92, barRgb:R.green },
      { icon:'&#10007;', title:'Learn From Market', desc:'Real money lost. Account blown. Confidence destroyed.', iconColor:'red', barWidth:15, barRgb:R.red },
      { icon:'&#10003;', title:'Build Slowly', desc:'Micro-lots, journaling, deliberate practice', iconColor:'blue', cardClass:'card-blue', barWidth:88, barRgb:R.blue },
      { icon:'&#10007;', title:'Rush In', desc:'Full-size trades, no plan, hope-based entries', iconColor:'red', barWidth:20, barRgb:R.red },
    ],
    vsLeft: { label:'Ignorance', text:'Same lessons. Higher cost. May never recover.' },
    vsRight: { label:'Education', text:'Same lessons. Zero cost. Foundation for life.' },
    s3Tag: 'The Path', s3Title: '5 Steps to <span class="warm">Learn</span> Cheaply',
    s3Pillars: [
      { title:'Study <span class="warm">Theory</span> First', desc:'Read, watch, absorb before risking a single dollar', color:'orange', barWidth:95, barRgb:R.orange },
      { title:'Paper Trade to <span style="color:var(--accent-gold)">Practice</span>', desc:'Test strategies with zero risk until consistent', color:'gold', barWidth:92, barRgb:R.gold },
      { title:'Start <span style="color:var(--accent-teal)">Micro</span>', desc:'Smallest possible real positions to feel real stakes', color:'teal', barWidth:88, barRgb:R.teal },
      { title:'Journal <span style="color:var(--accent-purple)">Everything</span>', desc:'Every trade, every emotion, every lesson documented', color:'purple', barWidth:85, barRgb:R.purple },
      { title:'Scale <span style="color:var(--accent-green)">Gradually</span>', desc:'Only increase size after 50+ successful small trades', color:'green', barWidth:86, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#128176;',
    s4Title: 'The <span class="warm">Education</span> Edge',
    s4Truths: [
      { icon:'&#9656;', title:'Time vs Money', desc:'Education costs time. Ignorance costs everything.', color:'orange' },
      { icon:'&#9670;', title:'Lessons Are Fixed', desc:'The market teaches the same lessons to everyone', color:'gold' },
      { icon:'&#9674;', title:'Price Varies', desc:'You choose: $0 or $4,000 for the same lesson', color:'teal' },
      { icon:'&#10003;', title:'Foundation Lasts', desc:'Knowledge compounds. Losses just disappear.', color:'green' },
    ],
    s4Philosophy: 'Both paths teach the same things.<br>One costs time. The other costs everything.',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Learn First.<br>Trade <span class="warm">Second.</span>',
    ctaDesc: 'Every dollar spent on education saves ten in the market.',
    ctaStats: [{ value:'$0', label:'Education Cost' },{ value:'$4K+', label:'Market Cost' },{ value:'5', label:'Steps' },{ value:'&infin;', label:'Knowledge' }],
    ctaPills: ['Study','Practice','Start Small','Journal'], ctaBoxText: 'Invest In Education',
  },
  // ── CHRONICLE POSTS (teal column) ───────────────────────────
  {
    num: 158, type: 'Chronicle', title: 'The Elite Seven United',
    hookBadge: 'CHRONICLE &middot; ALLIANCE', orbIcon: '&#9733;', orbLabel: 'SEVEN AS ONE',
    hookTitle: 'Seven Systems.<br>One <em>Mission</em>.',
    hookSub: 'When they align, clarity emerges.',
    s2Tag: 'The Problem', s2Title: 'Why <span class="warm">One</span> System Fails',
    s2Cards: [
      { icon:'&#10007;', title:'Blind Spots', desc:'A single system sees only one dimension of the market', iconColor:'red', barWidth:92, barRgb:R.red },
      { icon:'&#10007;', title:'False Signals', desc:'No confirmation means acting on noise, not signal', iconColor:'red', barWidth:88, barRgb:R.red },
      { icon:'&#10007;', title:'Regime Ignorance', desc:'Same strategy in all conditions leads to failure', iconColor:'red', barWidth:86, barRgb:R.red },
      { icon:'&#10007;', title:'Overconfidence', desc:'Trusting a single indicator creates false certainty', iconColor:'red', barWidth:84, barRgb:R.red },
    ],
    vsLeft: { label:'Single System', text:'One perspective. Blind to context. Fragile.' },
    vsRight: { label:'Seven United', text:'Multi-dimensional. Context-aware. Robust.' },
    s3Tag: 'The Alliance', s3Title: 'The <span class="warm">Seven</span> Systems',
    s3Pillars: [
      { title:'<span class="warm">Pentarch</span> &mdash; Cycle Phase', desc:'Reads the market cycle: accumulation, markup, distribution, markdown', color:'orange', barWidth:95, barRgb:R.teal },
      { title:'<span style="color:var(--accent-gold)">Plutus Flow</span> &mdash; Money Movement', desc:'Tracks institutional money flow beneath the surface', color:'gold', barWidth:92, barRgb:R.gold },
      { title:'<span style="color:var(--accent-teal)">The Arbiter</span> &mdash; Regime Quality', desc:'Judges signal reliability in current conditions', color:'teal', barWidth:90, barRgb:R.teal },
      { title:'<span style="color:var(--accent-purple)">Volume Oracle</span> &mdash; Conviction', desc:'Confirms whether moves have real volume backing', color:'purple', barWidth:88, barRgb:R.purple },
      { title:'<span style="color:var(--accent-green)">Regime Compass</span> &mdash; Environment', desc:'Classifies trending, ranging, or transitional markets', color:'green', barWidth:86, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#9733;',
    s4Title: 'The <span class="warm">Unity</span> Edge',
    s4Truths: [
      { icon:'&#9656;', title:'Confluence Is Key', desc:'When systems agree, probability soars', color:'orange' },
      { icon:'&#9670;', title:'Each Sees Differently', desc:'Cycle, flow, regime, volume, momentum', color:'gold' },
      { icon:'&#9674;', title:'Together They See All', desc:'Multi-system consensus eliminates blind spots', color:'teal' },
      { icon:'&#10003;', title:'Unity Is the Edge', desc:'Seven aligned systems create one clear signal', color:'green' },
    ],
    s4Philosophy: 'No single system is enough. No single perspective is complete.<br>The edge lives in their alignment.',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Seven Systems.<br>One <span class="warm">Edge.</span>',
    ctaDesc: 'Multi-system confluence eliminates noise and reveals the real signal.',
    ctaStats: [{ value:'7', label:'Systems' },{ value:'1', label:'Mission' },{ value:'100%', label:'Aligned' },{ value:'&infin;', label:'Clarity' }],
    ctaPills: ['Pentarch','Plutus','Arbiter','Oracle','Compass'], ctaBoxText: 'Explore Signal Pilot',
  },
  {
    num: 168, type: 'Chronicle', title: "The Arbiter's Judgment",
    hookBadge: 'CHRONICLE &middot; ARBITER', orbIcon: '&#9878;', orbLabel: 'JUDGE > GUESS',
    hookTitle: 'Not Every Signal<br>Deserves a <em>Trade</em>.',
    hookSub: 'The best trading lessons hide in stories, not textbooks.',
    s2Tag: 'The Problem', s2Title: 'Trading <span class="warm">Every</span> Signal',
    s2Cards: [
      { icon:'&#10007;', title:'Low Conviction', desc:'Signals in weak regimes have terrible win rates', iconColor:'red', barWidth:90, barRgb:R.red },
      { icon:'&#10007;', title:'Noise Trading', desc:'Most signals are noise, not opportunity', iconColor:'red', barWidth:88, barRgb:R.red },
      { icon:'&#10007;', title:'Overtrading', desc:'More trades equals more commissions and more mistakes', iconColor:'red', barWidth:86, barRgb:R.red },
      { icon:'&#10007;', title:'False Confidence', desc:'Mistaking signal quantity for signal quality', iconColor:'red', barWidth:84, barRgb:R.red },
    ],
    vsLeft: { label:'Every Signal', text:'More trades. More noise. Lower win rate.' },
    vsRight: { label:'Judged Signals', text:'Fewer trades. Higher quality. Better results.' },
    s3Tag: 'The Arbiter', s3Title: 'How <span class="warm">Judgment</span> Works',
    s3Pillars: [
      { title:'Evaluate <span class="warm">Regime</span>', desc:'Is the current market favoring this type of signal?', color:'orange', barWidth:95, barRgb:R.teal },
      { title:'Measure <span style="color:var(--accent-gold)">Confidence</span>', desc:'How many systems agree? Confluence score matters.', color:'gold', barWidth:92, barRgb:R.gold },
      { title:'Filter <span style="color:var(--accent-teal)">Noise</span>', desc:'Reject signals that lack volume or momentum backing', color:'teal', barWidth:90, barRgb:R.teal },
      { title:'Assess <span style="color:var(--accent-purple)">Reliability</span>', desc:'Historical win rate in this specific condition', color:'purple', barWidth:88, barRgb:R.purple },
      { title:'Accept or <span style="color:var(--accent-green)">Reject</span>', desc:'Only the highest-quality signals pass the judgment', color:'green', barWidth:86, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#9878;',
    s4Title: 'The <span class="warm">Judgment</span> Edge',
    s4Truths: [
      { icon:'&#9656;', title:'Quality Over Quantity', desc:'Fewer, better trades outperform', color:'orange' },
      { icon:'&#9670;', title:'Confidence Matters', desc:'Only trade high-confluence setups', color:'gold' },
      { icon:'&#9674;', title:'Filter Is the Edge', desc:'The filter is more valuable than the signal', color:'teal' },
      { icon:'&#10003;', title:'Judgment Compounds', desc:'Better selection compounds over time', color:'green' },
    ],
    s4Philosophy: 'The signal is easy. The judgment is the edge.<br>Not every opportunity deserves your capital.',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Judge First.<br>Trade <span class="warm">Second.</span>',
    ctaDesc: 'The Arbiter\'s judgment turns noise into clarity.',
    ctaStats: [{ value:'5', label:'Filter Steps' },{ value:'70%+', label:'Rejection Rate' },{ value:'3x', label:'Win Rate Lift' },{ value:'&infin;', label:'Edge' }],
    ctaPills: ['Regime','Confidence','Filter','Quality'], ctaBoxText: 'Explore The Arbiter',
  },
  {
    num: 178, type: 'Chronicle', title: "The Prophet's Vision",
    hookBadge: 'CHRONICLE &middot; PROPHET', orbIcon: '&#9670;', orbLabel: 'VOLUME > PRICE',
    hookTitle: '<em>90%</em> of Traders<br>Ignore Volume. They Lose.',
    hookSub: 'Price shows what happened. Volume shows why.',
    s2Tag: 'The Problem', s2Title: 'Trading <span class="warm">Without</span> Volume',
    s2Cards: [
      { icon:'&#10007;', title:'Fake Breakouts', desc:'Price breaks a level but volume is absent', iconColor:'red', barWidth:92, barRgb:R.red },
      { icon:'&#10007;', title:'Hidden Reversals', desc:'Volume divergence signals reversal before price shows', iconColor:'red', barWidth:88, barRgb:R.red },
      { icon:'&#10007;', title:'False Trends', desc:'Price appears trending but volume is declining', iconColor:'red', barWidth:86, barRgb:R.red },
      { icon:'&#10007;', title:'Missed Conviction', desc:'High volume confirms intent. Without it, you are guessing.', iconColor:'red', barWidth:84, barRgb:R.red },
    ],
    vsLeft: { label:'Price Only', text:'Half the picture. Half the confidence. Half the results.' },
    vsRight: { label:'Price + Volume', text:'Full picture. Full conviction. Full edge.' },
    s3Tag: 'Volume Regimes', s3Title: 'The <span class="warm">Three</span> Regimes',
    s3Pillars: [
      { title:'<span class="warm">Expansion</span> &mdash; High Volume', desc:'Strong moves with conviction. Trend continuation likely.', color:'orange', barWidth:95, barRgb:R.teal },
      { title:'<span style="color:var(--accent-gold)">Contraction</span> &mdash; Low Volume', desc:'Quiet markets. Breakout coming. Wait for direction.', color:'gold', barWidth:88, barRgb:R.gold },
      { title:'<span style="color:var(--accent-teal)">Transition</span> &mdash; Shifting Volume', desc:'Regime is changing. Be alert. Adjust strategy.', color:'teal', barWidth:85, barRgb:R.teal },
      { title:'<span style="color:var(--accent-purple)">Divergence</span> &mdash; Warning', desc:'Price and volume disagreeing. Reversal imminent.', color:'purple', barWidth:92, barRgb:R.purple },
      { title:'<span style="color:var(--accent-green)">Confirmation</span> &mdash; Go Signal', desc:'Price and volume aligned. Highest probability trades.', color:'green', barWidth:95, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#9670;',
    s4Title: 'The <span class="warm">Volume</span> Edge',
    s4Truths: [
      { icon:'&#9656;', title:'Volume Leads', desc:'Volume shifts before price. Always.', color:'orange' },
      { icon:'&#9670;', title:'Conviction Matters', desc:'High volume = real move. Low volume = trap.', color:'gold' },
      { icon:'&#9674;', title:'Divergence Warns', desc:'When volume disagrees with price, listen to volume', color:'teal' },
      { icon:'&#10003;', title:'Confirmation Wins', desc:'Volume + price alignment = highest probability', color:'green' },
    ],
    s4Philosophy: 'Price tells you what happened.<br>Volume tells you whether to believe it.',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Read Volume.<br>See <span class="warm">Truth.</span>',
    ctaDesc: 'Volume is the prophet. Learn to listen.',
    ctaStats: [{ value:'90%', label:'Traders Ignore' },{ value:'3', label:'Regimes' },{ value:'5', label:'Patterns' },{ value:'&infin;', label:'Edge' }],
    ctaPills: ['Volume','Regime','Divergence','Confirmation'], ctaBoxText: 'Explore Volume Oracle',
  },
  {
    num: 188, type: 'Chronicle', title: 'The Scales of Truth',
    hookBadge: 'CHRONICLE &middot; BALANCE', orbIcon: '&#9878;', orbLabel: 'BALANCE > BIAS',
    hookTitle: 'The #1 Reason<br>90% of Traders <em>Fail</em>',
    hookSub: 'Not bad analysis. Not wrong direction. Imbalance.',
    s2Tag: 'Imbalance', s2Title: 'The Cost of <span class="warm">Imbalance</span>',
    s2Cards: [
      { icon:'&#10007;', title:'Over-Leveraged', desc:'Too much risk on one position or one idea', iconColor:'red', barWidth:94, barRgb:R.red },
      { icon:'&#10007;', title:'All-In Mentality', desc:'Putting everything on one trade or one outcome', iconColor:'red', barWidth:90, barRgb:R.red },
      { icon:'&#10007;', title:'Hope Holding', desc:'Holding losing positions based on hope, not analysis', iconColor:'red', barWidth:88, barRgb:R.red },
      { icon:'&#10007;', title:'No Exit Plan', desc:'Entering trades with no defined exit strategy', iconColor:'red', barWidth:86, barRgb:R.red },
    ],
    vsLeft: { label:'Imbalanced', text:'Over-leveraged. All-in. Hope-based. No plan.' },
    vsRight: { label:'Balanced', text:'Measured risk. Diversified. Rule-based. Clear plan.' },
    s3Tag: 'Balance', s3Title: '5 Scales of <span class="warm">Balance</span>',
    s3Pillars: [
      { title:'Risk <span class="warm">Balance</span>', desc:'Never risk more than 2% of account on one trade', color:'orange', barWidth:95, barRgb:R.teal },
      { title:'Setup <span style="color:var(--accent-gold)">Balance</span>', desc:'Trade different setups to diversify your edge', color:'gold', barWidth:92, barRgb:R.gold },
      { title:'Time <span style="color:var(--accent-teal)">Balance</span>', desc:'Mix timeframes to smooth equity curve', color:'teal', barWidth:88, barRgb:R.teal },
      { title:'Emotion <span style="color:var(--accent-purple)">Balance</span>', desc:'Neither euphoric nor defeated. Neutral execution.', color:'purple', barWidth:86, barRgb:R.purple },
      { title:'Life <span style="color:var(--accent-green)">Balance</span>', desc:'Trading is part of life, not all of it', color:'green', barWidth:84, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#9878;',
    s4Title: 'The <span class="warm">Balance</span> Edge',
    s4Truths: [
      { icon:'&#9656;', title:'Equilibrium Wins', desc:'Balanced traders survive. Survivors compound.', color:'orange' },
      { icon:'&#9670;', title:'Extremes Kill', desc:'Too much risk, too little planning = failure', color:'gold' },
      { icon:'&#9674;', title:'Consistency Requires Balance', desc:'You can\'t be consistent while imbalanced', color:'teal' },
      { icon:'&#10003;', title:'Balance Is Sustainable', desc:'The only approach that works forever', color:'green' },
    ],
    s4Philosophy: 'The market does not reward the bold.<br>It rewards the balanced.',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Find Your<br><span class="warm">Balance.</span>',
    ctaDesc: 'Equilibrium is the only sustainable edge.',
    ctaStats: [{ value:'90%', label:'Fail Rate' },{ value:'#1', label:'Reason' },{ value:'5', label:'Scales' },{ value:'&infin;', label:'Balance' }],
    ctaPills: ['Risk','Setup','Time','Emotion','Life'], ctaBoxText: 'Master Balance',
  },
  {
    num: 198, type: 'Chronicle', title: "The Watchman's Vigil",
    hookBadge: 'CHRONICLE &middot; WATCHMAN', orbIcon: '&#128065;', orbLabel: 'WATCH > ASSUME',
    hookTitle: 'I Spent $4,000<br>Learning <em>This</em>.',
    hookSub: 'You get it in 60 seconds. Free.',
    s2Tag: 'The Mistake', s2Title: 'Trading the <span class="warm">Wrong</span> Regime',
    s2Cards: [
      { icon:'&#10007;', title:'Trend in Range', desc:'Using trending strategy when market is sideways', iconColor:'red', barWidth:92, barRgb:R.red },
      { icon:'&#10007;', title:'Range in Trend', desc:'Fading a strong trend thinking it will reverse', iconColor:'red', barWidth:88, barRgb:R.red },
      { icon:'&#10007;', title:'Ignoring Transition', desc:'Not recognizing when conditions are changing', iconColor:'red', barWidth:86, barRgb:R.red },
      { icon:'&#10007;', title:'Static Strategy', desc:'Using the same approach regardless of regime', iconColor:'red', barWidth:90, barRgb:R.red },
    ],
    vsLeft: { label:'Static', text:'One strategy. All conditions. Inevitable failure.' },
    vsRight: { label:'Adaptive', text:'Right strategy. Right conditions. Consistent edge.' },
    s3Tag: 'Vigilance', s3Title: 'The <span class="warm">Watchman</span>\'s Process',
    s3Pillars: [
      { title:'Identify <span class="warm">Regime</span>', desc:'Before every session: trending, ranging, or transitional?', color:'orange', barWidth:95, barRgb:R.teal },
      { title:'Match <span style="color:var(--accent-gold)">Strategy</span>', desc:'Select the strategy that fits current conditions', color:'gold', barWidth:92, barRgb:R.gold },
      { title:'Monitor <span style="color:var(--accent-teal)">Shifts</span>', desc:'Watch for regime transitions during the session', color:'teal', barWidth:88, barRgb:R.teal },
      { title:'Adapt <span style="color:var(--accent-purple)">Immediately</span>', desc:'When conditions change, change your approach', color:'purple', barWidth:86, barRgb:R.purple },
      { title:'Journal <span style="color:var(--accent-green)">Regimes</span>', desc:'Record what regime each trade occurred in', color:'green', barWidth:84, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#128065;',
    s4Title: 'The <span class="warm">Vigil</span> Edge',
    s4Truths: [
      { icon:'&#9656;', title:'Conditions Change', desc:'Markets shift regimes without warning', color:'orange' },
      { icon:'&#9670;', title:'Strategy Must Match', desc:'Right strategy + wrong regime = loss', color:'gold' },
      { icon:'&#9674;', title:'Adaptation Is Key', desc:'The Watchman monitors and adapts in real-time', color:'teal' },
      { icon:'&#10003;', title:'Awareness Pays', desc:'Know the regime before every single trade', color:'green' },
    ],
    s4Philosophy: 'The cost of this lesson? $4,000.<br>The fix? Always know the regime before you trade.',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Stay Alert.<br>Stay <span class="warm">Adaptive.</span>',
    ctaDesc: 'The Watchman never assumes. Neither should you.',
    ctaStats: [{ value:'$4K', label:'Lesson Cost' },{ value:'60s', label:'Your Cost' },{ value:'5', label:'Steps' },{ value:'&infin;', label:'Vigilance' }],
    ctaPills: ['Regime','Strategy','Monitor','Adapt'], ctaBoxText: 'Explore Regime Compass',
  },
  {
    num: 208, type: 'Chronicle', title: "The Commander's Strategy",
    hookBadge: 'CHRONICLE &middot; COMMANDER', orbIcon: '&#9813;', orbLabel: 'PLAN > REACT',
    hookTitle: 'No Plan.<br>No <em>Trade</em>.',
    hookSub: 'The Commander never enters battle unprepared.',
    s2Tag: 'The Problem', s2Title: 'Trading <span class="warm">Without</span> a Plan',
    s2Cards: [
      { icon:'&#10007;', title:'Improvised Entries', desc:'Entering because it looks good, not because it is good', iconColor:'red', barWidth:92, barRgb:R.red },
      { icon:'&#10007;', title:'No Exit Strategy', desc:'Where do you get out? If you don\'t know, don\'t enter.', iconColor:'red', barWidth:90, barRgb:R.red },
      { icon:'&#10007;', title:'Emotional Sizing', desc:'Position size based on feeling, not calculation', iconColor:'red', barWidth:86, barRgb:R.red },
      { icon:'&#10007;', title:'No Review', desc:'Same mistakes repeated because nothing is documented', iconColor:'red', barWidth:84, barRgb:R.red },
    ],
    vsLeft: { label:'No Plan', text:'Reactive. Emotional. Inconsistent. Losing.' },
    vsRight: { label:'Planned', text:'Prepared. Systematic. Consistent. Profitable.' },
    s3Tag: 'The Plan', s3Title: 'The <span class="warm">Commander</span>\'s Framework',
    s3Pillars: [
      { title:'Define <span class="warm">Setup</span> Before Open', desc:'Write your trade plan before the market opens', color:'orange', barWidth:95, barRgb:R.teal },
      { title:'Set <span style="color:var(--accent-gold)">Entry</span>, Stop, Target', desc:'All three defined in advance. Non-negotiable.', color:'gold', barWidth:92, barRgb:R.gold },
      { title:'Execute <span style="color:var(--accent-teal)">Without</span> Hesitation', desc:'When setup triggers, act. No second-guessing.', color:'teal', barWidth:90, barRgb:R.teal },
      { title:'Review <span style="color:var(--accent-purple)">After</span> Close', desc:'Journal the trade. What worked? What didn\'t?', color:'purple', barWidth:88, barRgb:R.purple },
      { title:'Improve <span style="color:var(--accent-green)">Weekly</span>', desc:'Use journal data to refine the plan each week', color:'green', barWidth:86, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#9813;',
    s4Title: 'The <span class="warm">Strategy</span> Edge',
    s4Truths: [
      { icon:'&#9656;', title:'Preparation Is the Edge', desc:'The best trades are planned, not discovered', color:'orange' },
      { icon:'&#9670;', title:'Hesitation Kills', desc:'Plan precisely so execution is automatic', color:'gold' },
      { icon:'&#9674;', title:'Review Improves', desc:'Every review makes the next plan better', color:'teal' },
      { icon:'&#10003;', title:'Plans Compound', desc:'Better plans create better results over time', color:'green' },
    ],
    s4Philosophy: 'The Commander never enters battle without preparation.<br>Neither should you enter the market without a plan.',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Plan First.<br>Trade <span class="warm">Second.</span>',
    ctaDesc: 'Discipline is strategy. Strategy is discipline.',
    ctaStats: [{ value:'5', label:'Framework Steps' },{ value:'0', label:'Improvisation' },{ value:'100%', label:'Planned' },{ value:'&infin;', label:'Edge' }],
    ctaPills: ['Setup','Entry','Stop','Target','Review'], ctaBoxText: 'Build Your Plan',
  },
  {
    num: 218, type: 'Chronicle', title: "The Sovereign's Cycle",
    hookBadge: 'CHRONICLE &middot; SOVEREIGN', orbIcon: '&#9681;', orbLabel: 'CYCLE > NOISE',
    hookTitle: 'The Worst Mistake:<br>Ignoring the <em>WRN</em> Signal.',
    hookSub: 'Pentarch tells you when the cycle is shifting. Listen.',
    s2Tag: 'The Cycle', s2Title: 'Markets Move in <span class="warm">Cycles</span>',
    s2Cards: [
      { icon:'&#9650;', title:'Accumulation', desc:'Smart money enters quietly. Most traders don\'t notice.', iconColor:'green', cardClass:'card-green', barWidth:88, barRgb:R.green },
      { icon:'&#9654;', title:'Markup', desc:'Trend develops. Crowd follows. Momentum builds.', iconColor:'blue', cardClass:'card-blue', barWidth:92, barRgb:R.blue },
      { icon:'&#9660;', title:'Distribution', desc:'Smart money exits at peaks. Retail still buying.', iconColor:'gold', cardClass:'card-gold', barWidth:86, barRgb:R.gold },
      { icon:'&#9664;', title:'Markdown', desc:'Price declines. Panic selling. The cycle resets.', iconColor:'red', barWidth:84, barRgb:R.red },
    ],
    vsLeft: { label:'Ignore Cycle', text:'Trade against the phase. Consistent losses.' },
    vsRight: { label:'Respect Cycle', text:'Trade with the phase. Consistent profits.' },
    s3Tag: 'Pentarch', s3Title: 'Reading the <span class="warm">Cycle</span>',
    s3Pillars: [
      { title:'Identify <span class="warm">Phase</span>', desc:'Which of the four cycle phases are we in right now?', color:'orange', barWidth:95, barRgb:R.teal },
      { title:'Watch for <span style="color:var(--accent-gold)">WRN</span>', desc:'The warning signal tells you a phase shift is starting', color:'gold', barWidth:92, barRgb:R.gold },
      { title:'Adapt <span style="color:var(--accent-teal)">Strategy</span>', desc:'Each phase requires a different trading approach', color:'teal', barWidth:90, barRgb:R.teal },
      { title:'Never <span style="color:var(--accent-purple)">Fight</span> the Cycle', desc:'Trading against the cycle is fighting the ocean', color:'purple', barWidth:88, barRgb:R.purple },
      { title:'Track <span style="color:var(--accent-green)">Transitions</span>', desc:'The most profitable trades happen at phase transitions', color:'green', barWidth:95, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#9681;',
    s4Title: 'The <span class="warm">Cycle</span> Edge',
    s4Truths: [
      { icon:'&#9656;', title:'Cycles Are Sovereign', desc:'No trader is bigger than the market cycle', color:'orange' },
      { icon:'&#9670;', title:'WRN Is Critical', desc:'Ignoring the warning signal is the #1 mistake', color:'gold' },
      { icon:'&#9674;', title:'Phase Dictates Strategy', desc:'Right strategy + right phase = maximum edge', color:'teal' },
      { icon:'&#10003;', title:'Transitions Pay Most', desc:'Catching phase shifts early creates outsized returns', color:'green' },
    ],
    s4Philosophy: 'Know where you are in the cycle. Trade with it, never against it.<br>The cycle is sovereign.',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Respect the<br><span class="warm">Cycle.</span>',
    ctaDesc: 'The cycle is sovereign. Learn to read it.',
    ctaStats: [{ value:'4', label:'Phases' },{ value:'1', label:'WRN Signal' },{ value:'5', label:'Steps' },{ value:'&infin;', label:'Cycle' }],
    ctaPills: ['Accumulation','Markup','Distribution','Markdown'], ctaBoxText: 'Explore Pentarch',
  },
  // ── MARKETING POSTS (orange column) ─────────────────────────
  {
    num: 161, type: 'Marketing', title: 'Compare vs Competitors',
    hookBadge: 'PRODUCT &middot; COMPARE', orbIcon: '&#9878;', orbLabel: 'US vs THEM',
    hookTitle: 'Why Signal Pilot<br>Is <em>Different</em>.',
    hookSub: 'Not just signals. A complete trading system.',
    s2Tag: 'Comparison', s2Title: 'Others <span class="warm">vs.</span> Signal Pilot',
    s2Cards: [
      { icon:'&#10007;', title:'Single Indicator', desc:'Others rely on one indicator. One perspective.', iconColor:'red', barWidth:25, barRgb:R.red },
      { icon:'&#10007;', title:'Lagging Signals', desc:'Most tools give signals after the move is done', iconColor:'red', barWidth:20, barRgb:R.red },
      { icon:'&#10003;', title:'7 Systems', desc:'Signal Pilot integrates seven complementary systems', iconColor:'green', cardClass:'card-green', barWidth:95, barRgb:R.green },
      { icon:'&#10003;', title:'Regime-Aware', desc:'Adapts analysis to current market conditions', iconColor:'green', cardClass:'card-green', barWidth:92, barRgb:R.green },
    ],
    vsLeft: { label:'Others', text:'Single-indicator. No context. No education.' },
    vsRight: { label:'Signal Pilot', text:'Multi-system. Context-aware. Full education.' },
    s3Tag: 'The Edge', s3Title: '5 Reasons to <span class="warm">Choose</span> Signal Pilot',
    s3Pillars: [
      { title:'<span class="warm">7</span> Integrated Systems', desc:'Each system sees different market dimensions', color:'orange', barWidth:95, barRgb:R.orange },
      { title:'<span style="color:var(--accent-gold)">Regime</span> Classification', desc:'Automatically adapts to trending, ranging, transitions', color:'gold', barWidth:92, barRgb:R.gold },
      { title:'<span style="color:var(--accent-teal)">Free</span> Education', desc:'82 lessons, zero paywalls, real trading knowledge', color:'teal', barWidth:90, barRgb:R.teal },
      { title:'<span style="color:var(--accent-purple)">Non-Repainting</span>', desc:'Every signal is close-confirmed. What you see happened.', color:'purple', barWidth:95, barRgb:R.purple },
      { title:'<span style="color:var(--accent-green)">Community</span>', desc:'1000+ traders learning and growing together', color:'green', barWidth:88, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#9878;',
    s4Title: 'The <span class="warm">Signal Pilot</span> Edge',
    s4Truths: [
      { icon:'&#9656;', title:'Not Just Signals', desc:'It teaches you how to think about markets', color:'orange' },
      { icon:'&#9670;', title:'Multi-Dimensional', desc:'Seven perspectives beat one indicator every time', color:'gold' },
      { icon:'&#9674;', title:'Education Included', desc:'Understanding why builds a permanent edge', color:'teal' },
      { icon:'&#10003;', title:'Free to Start', desc:'Full access trial. No risk. No commitment.', color:'green' },
    ],
    s4Philosophy: 'Signal Pilot doesn\'t tell you what to trade.<br>It teaches you how to think about the market.',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Trade With<br><span class="warm">Clarity.</span>',
    ctaDesc: 'Seven integrated systems. Free education. Zero repainting.',
    ctaStats: [{ value:'7', label:'Systems' },{ value:'82', label:'Free Lessons' },{ value:'0', label:'Repainting' },{ value:'1000+', label:'Traders' }],
    ctaPills: ['Multi-System','Education','Non-Repaint','Free Trial'], ctaBoxText: 'Try Signal Pilot Free',
  },
  {
    num: 171, type: 'Marketing', title: 'Free Trial Reminder',
    hookBadge: 'PRODUCT &middot; TRIAL', orbIcon: '&#9733;', orbLabel: '7 DAYS FREE',
    hookTitle: '7 Days. Full Access.<br><em>$0</em> Risk.',
    hookSub: 'If it does not improve your trading, walk away.',
    s2Tag: 'What You Get', s2Title: 'Full <span class="warm">Access</span> for 7 Days',
    s2Cards: [
      { icon:'&#10003;', title:'All 7 Systems', desc:'Every indicator unlocked from day one', iconColor:'green', cardClass:'card-green', barWidth:95, barRgb:R.green },
      { icon:'&#10003;', title:'Education Library', desc:'82 lessons covering every aspect of trading', iconColor:'green', cardClass:'card-green', barWidth:92, barRgb:R.green },
      { icon:'&#10003;', title:'Real-Time Alerts', desc:'Live signals as they happen, no delay', iconColor:'blue', cardClass:'card-blue', barWidth:90, barRgb:R.blue },
      { icon:'&#10003;', title:'Cancel Anytime', desc:'No commitment. No hidden fees. Walk away free.', iconColor:'teal', cardClass:'card-teal', barWidth:88, barRgb:R.teal },
    ],
    vsLeft: { label:'Without Trial', text:'Guessing. Hoping. No framework.' },
    vsRight: { label:'With Trial', text:'Clarity. Structure. Seven systems working.' },
    s3Tag: 'How It Works', s3Title: '5 Steps to <span class="warm">Start</span>',
    s3Pillars: [
      { title:'Sign Up <span class="warm">Free</span>', desc:'Create your account in under 60 seconds', color:'orange', barWidth:95, barRgb:R.orange },
      { title:'Get <span style="color:var(--accent-gold)">Instant</span> Access', desc:'All 7 systems and 82 lessons unlocked immediately', color:'gold', barWidth:92, barRgb:R.gold },
      { title:'Start <span style="color:var(--accent-teal)">Learning</span>', desc:'Follow the education pathway at your pace', color:'teal', barWidth:90, barRgb:R.teal },
      { title:'Trade With <span style="color:var(--accent-purple)">Confidence</span>', desc:'Apply what you learn with real-time signals', color:'purple', barWidth:88, barRgb:R.purple },
      { title:'Decide on <span style="color:var(--accent-green)">Day 7</span>', desc:'Stay if you love it. Leave if you don\'t. Simple.', color:'green', barWidth:86, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#9733;',
    s4Title: 'The <span class="warm">Zero Risk</span> Trial',
    s4Truths: [
      { icon:'&#9656;', title:'Full Access', desc:'No features held back. Everything unlocked.', color:'orange' },
      { icon:'&#9670;', title:'No Commitment', desc:'Cancel anytime. No questions asked.', color:'gold' },
      { icon:'&#9674;', title:'Real Education', desc:'82 lessons that build real understanding', color:'teal' },
      { icon:'&#10003;', title:'Zero Risk', desc:'$0 cost. 7 days. Full power.', color:'green' },
    ],
    s4Philosophy: 'If Signal Pilot does not improve your trading in 7 days,<br>walk away. No charge. No questions.',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Start Free.<br>Trade <span class="warm">Better.</span>',
    ctaDesc: 'Seven days. Full access. Zero risk. Nothing to lose.',
    ctaStats: [{ value:'7', label:'Free Days' },{ value:'$0', label:'Cost' },{ value:'100%', label:'Access' },{ value:'0', label:'Risk' }],
    ctaPills: ['Free Trial','All Systems','Education','Cancel Anytime'], ctaBoxText: 'Start Your Free Trial',
  },
  {
    num: 191, type: 'Marketing', title: 'Simplify Your Trading',
    hookBadge: 'PHILOSOPHY', orbIcon: '&#8722;', orbLabel: 'LESS > MORE',
    hookTitle: 'Stop Adding Complexity.<br>Start <em>Subtracting</em> It.',
    hookSub: 'The best traders use fewer tools, not more.',
    s2Tag: 'The Problem', s2Title: 'The <span class="warm">Complexity</span> Trap',
    s2Cards: [
      { icon:'&#10007;', title:'10+ Indicators', desc:'More indicators does not mean better analysis', iconColor:'red', barWidth:15, barRgb:R.red },
      { icon:'&#10007;', title:'Conflicting Signals', desc:'Too many tools give contradictory information', iconColor:'red', barWidth:20, barRgb:R.red },
      { icon:'&#10007;', title:'Analysis Paralysis', desc:'So much data that no decision gets made', iconColor:'red', barWidth:18, barRgb:R.red },
      { icon:'&#10007;', title:'False Precision', desc:'Complexity creates an illusion of accuracy', iconColor:'red', barWidth:22, barRgb:R.red },
    ],
    vsLeft: { label:'Complex', text:'More tools. More confusion. Worse results.' },
    vsRight: { label:'Simple', text:'Fewer tools. More clarity. Better results.' },
    s3Tag: 'Simplify', s3Title: '5 Steps to <span class="warm">Simplify</span>',
    s3Pillars: [
      { title:'Remove <span class="warm">Redundancy</span>', desc:'If two indicators show the same thing, keep one', color:'orange', barWidth:95, barRgb:R.orange },
      { title:'Focus on <span style="color:var(--accent-gold)">Signal</span>', desc:'One integrated system beats five separate ones', color:'gold', barWidth:92, barRgb:R.gold },
      { title:'Trust the <span style="color:var(--accent-teal)">Process</span>', desc:'Fewer decisions per trade means better decisions', color:'teal', barWidth:90, barRgb:R.teal },
      { title:'Measure <span style="color:var(--accent-purple)">Clarity</span>', desc:'Can you explain your trade in one sentence?', color:'purple', barWidth:88, barRgb:R.purple },
      { title:'Subtract <span style="color:var(--accent-green)">Weekly</span>', desc:'Each week, remove one unnecessary element', color:'green', barWidth:86, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#8722;',
    s4Title: 'The <span class="warm">Simplicity</span> Edge',
    s4Truths: [
      { icon:'&#9656;', title:'Less Is More', desc:'Fewer tools, clearer signals, better trades', color:'orange' },
      { icon:'&#9670;', title:'Clarity Compounds', desc:'Simple systems are easier to execute consistently', color:'gold' },
      { icon:'&#9674;', title:'Integration Wins', desc:'One system > many disconnected indicators', color:'teal' },
      { icon:'&#10003;', title:'Subtraction Is Skill', desc:'Knowing what to remove is the real expertise', color:'green' },
    ],
    s4Philosophy: 'Complexity is the enemy of execution.<br>Simplicity is the foundation of consistency.',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Subtract.<br><span class="warm">Simplify.</span>',
    ctaDesc: 'One integrated system replaces a dozen separate indicators.',
    ctaStats: [{ value:'1000+', label:'Traders' },{ value:'82', label:'Lessons' },{ value:'7', label:'Systems' },{ value:'0', label:'Paywalls' }],
    ctaPills: ['Simplicity','Clarity','Integration','Process'], ctaBoxText: 'Simplify With Signal Pilot',
  },
  {
    num: 201, type: 'Marketing', title: '200 Posts Milestone',
    hookBadge: 'MILESTONE', orbIcon: '&#127942;', orbLabel: '200 &middot; $0',
    hookTitle: '200 Posts of Free<br>Trading <em>Education</em>!',
    hookSub: 'Every post is free. Every lesson is real.',
    s2Tag: 'The Journey', s2Title: 'What <span class="warm">200</span> Posts Covers',
    s2Cards: [
      { icon:'&#9656;', title:'Trading Psychology', desc:'Emotional mastery, discipline, patience frameworks', iconColor:'gold', cardClass:'card-gold', barWidth:95, barRgb:R.gold },
      { icon:'&#9670;', title:'Risk Management', desc:'Position sizing, stop losses, drawdown control', iconColor:'teal', cardClass:'card-teal', barWidth:92, barRgb:R.teal },
      { icon:'&#9674;', title:'Market Structure', desc:'Trends, ranges, regimes, cycle analysis', iconColor:'blue', cardClass:'card-blue', barWidth:90, barRgb:R.blue },
      { icon:'&#10003;', title:'System Education', desc:'Deep dives into all 7 indicator systems', iconColor:'green', cardClass:'card-green', barWidth:88, barRgb:R.green },
    ],
    vsLeft: { label:'Paid Courses', text:'$500-2000. Often outdated. Generic.' },
    vsRight: { label:'Signal Pilot', text:'200 posts. $0. Specific. Always current.' },
    s3Tag: 'By the Numbers', s3Title: '<span class="warm">200</span> Posts Breakdown',
    s3Pillars: [
      { title:'<span class="warm">Psychology</span> Deep Dives', desc:'Emotional control, mindset frameworks, discipline systems', color:'orange', barWidth:95, barRgb:R.orange },
      { title:'<span style="color:var(--accent-gold)">Risk</span> Frameworks', desc:'Position sizing, stop losses, daily/weekly limits', color:'gold', barWidth:92, barRgb:R.gold },
      { title:'<span style="color:var(--accent-teal)">Indicator</span> Breakdowns', desc:'How each of the 7 systems works and when to use them', color:'teal', barWidth:90, barRgb:R.teal },
      { title:'<span style="color:var(--accent-purple)">Market</span> Structure', desc:'Cycles, regimes, support/resistance, trend analysis', color:'purple', barWidth:88, barRgb:R.purple },
      { title:'<span style="color:var(--accent-green)">Real</span> Examples', desc:'Chronicle stories showing systems in real scenarios', color:'green', barWidth:86, barRgb:R.green },
    ],
    s4Tag: 'Thank You', s4OrbIcon: '&#127942;',
    s4Title: 'The <span class="warm">Community</span> Edge',
    s4Truths: [
      { icon:'&#9656;', title:'200 Posts', desc:'Consistent, free education since day one', color:'orange' },
      { icon:'&#9670;', title:'Zero Paywalls', desc:'Every post accessible to everyone', color:'gold' },
      { icon:'&#9674;', title:'Real Content', desc:'No fluff. No hype. Real trading knowledge.', color:'teal' },
      { icon:'&#10003;', title:'More Coming', desc:'200 down. Hundreds more on the way.', color:'green' },
    ],
    s4Philosophy: '200 posts of free trading education.<br>This is just the beginning.',
    ctaOrbIcon: '&#9733;', ctaTagline: '200 Posts.<br><span class="warm">Free.</span>',
    ctaDesc: 'Thank you for being part of this journey. The best is ahead.',
    ctaStats: [{ value:'200', label:'Posts' },{ value:'$0', label:'Cost' },{ value:'82', label:'Lessons' },{ value:'&infin;', label:'More Coming' }],
    ctaPills: ['Psychology','Risk','Systems','Structure'], ctaBoxText: 'Follow Signal Pilot',
  },
  {
    num: 211, type: 'Marketing', title: 'Why Education First',
    hookBadge: 'PHILOSOPHY', orbIcon: '&#128218;', orbLabel: 'KNOW > GUESS',
    hookTitle: '82 Free Lessons.<br>Zero Paywalls. No <em>Excuses</em>.',
    hookSub: 'Understanding your tools matters more than having them.',
    s2Tag: 'The Problem', s2Title: 'Signals <span class="warm">Without</span> Education',
    s2Cards: [
      { icon:'&#10007;', title:'Blind Following', desc:'Using signals without understanding creates dependency', iconColor:'red', barWidth:92, barRgb:R.red },
      { icon:'&#10007;', title:'No Adaptation', desc:'When signals fail you have no framework to adjust', iconColor:'red', barWidth:88, barRgb:R.red },
      { icon:'&#10007;', title:'Missed Context', desc:'Signals without regime context lead to wrong trades', iconColor:'red', barWidth:86, barRgb:R.red },
      { icon:'&#10007;', title:'Zero Growth', desc:'Following signals teaches nothing. Education teaches forever.', iconColor:'red', barWidth:90, barRgb:R.red },
    ],
    vsLeft: { label:'Signals Only', text:'Dependency. No growth. Fragile.' },
    vsRight: { label:'Education First', text:'Understanding. Growth. Durable edge.' },
    s3Tag: 'The Library', s3Title: '82 <span class="warm">Free</span> Lessons Cover',
    s3Pillars: [
      { title:'<span class="warm">Why</span> Signals Work', desc:'Understanding the mechanics behind every signal type', color:'orange', barWidth:95, barRgb:R.orange },
      { title:'<span style="color:var(--accent-gold)">When</span> to Use Them', desc:'Regime context determines which signals to trust', color:'gold', barWidth:92, barRgb:R.gold },
      { title:'<span style="color:var(--accent-teal)">How</span> to Filter', desc:'Not every signal is a trade. Learn to judge.', color:'teal', barWidth:90, barRgb:R.teal },
      { title:'<span style="color:var(--accent-purple)">Risk</span> Management', desc:'Position sizing, stops, limits integrated with signals', color:'purple', barWidth:88, barRgb:R.purple },
      { title:'<span style="color:var(--accent-green)">Psychology</span>', desc:'Emotional frameworks that make you consistent', color:'green', barWidth:86, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#128218;',
    s4Title: 'The <span class="warm">Education</span> Edge',
    s4Truths: [
      { icon:'&#9656;', title:'Understanding Compounds', desc:'Knowledge grows. Signals are temporary.', color:'orange' },
      { icon:'&#9670;', title:'Education Is the Real Edge', desc:'Signals change. Understanding endures.', color:'gold' },
      { icon:'&#9674;', title:'Why > When', desc:'Knowing why a signal works is more valuable than when', color:'teal' },
      { icon:'&#10003;', title:'Free Forever', desc:'82 lessons. Zero paywalls. No excuses.', color:'green' },
    ],
    s4Philosophy: 'Signal Pilot teaches you WHY signals work,<br>not just WHEN they fire. That understanding compounds.',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Understand.<br>Then <span class="warm">Trade.</span>',
    ctaDesc: 'Education is the only edge that never expires.',
    ctaStats: [{ value:'82', label:'Free Lessons' },{ value:'0', label:'Paywalls' },{ value:'7', label:'Systems' },{ value:'&infin;', label:'Knowledge' }],
    ctaPills: ['Education','Understanding','Free','Compound'], ctaBoxText: 'Start Learning Free',
  },
  {
    num: 221, type: 'Marketing', title: 'Trader Transformation',
    hookBadge: 'TRANSFORMATION', orbIcon: '&#9889;', orbLabel: 'CHAOS > CLARITY',
    hookTitle: 'The Most Overlooked<br>Edge? <em>Self-Awareness</em>.',
    hookSub: 'Technical skills are table stakes. The real edge is internal.',
    s2Tag: 'The Journey', s2Title: 'From <span class="warm">Chaos</span> to Clarity',
    s2Cards: [
      { icon:'&#10007;', title:'Emotional Trades', desc:'Every trade driven by fear, greed, or impulse', iconColor:'red', barWidth:92, barRgb:R.red },
      { icon:'&#10007;', title:'No System', desc:'Different approach every day. No consistency.', iconColor:'red', barWidth:88, barRgb:R.red },
      { icon:'&#10003;', title:'Rule-Based Entries', desc:'Clear criteria. Same process. Every time.', iconColor:'green', cardClass:'card-green', barWidth:92, barRgb:R.green },
      { icon:'&#10003;', title:'Confident Process', desc:'Trusting the system removes doubt and hesitation', iconColor:'green', cardClass:'card-green', barWidth:90, barRgb:R.green },
    ],
    vsLeft: { label:'Before', text:'Emotional. Chaotic. Inconsistent. Doubtful.' },
    vsRight: { label:'After', text:'Rule-based. Clear. Consistent. Confident.' },
    s3Tag: 'The Path', s3Title: '5 Steps to <span class="warm">Transform</span>',
    s3Pillars: [
      { title:'Admit the <span class="warm">Problem</span>', desc:'Self-awareness starts with honest self-assessment', color:'orange', barWidth:95, barRgb:R.orange },
      { title:'Build a <span style="color:var(--accent-gold)">System</span>', desc:'Replace emotion with rules. Written, tested, followed.', color:'gold', barWidth:92, barRgb:R.gold },
      { title:'Journal <span style="color:var(--accent-teal)">Everything</span>', desc:'Track emotions, decisions, outcomes without judgment', color:'teal', barWidth:90, barRgb:R.teal },
      { title:'Review <span style="color:var(--accent-purple)">Patterns</span>', desc:'Find your emotional triggers and systematic weaknesses', color:'purple', barWidth:88, barRgb:R.purple },
      { title:'Iterate and <span style="color:var(--accent-green)">Grow</span>', desc:'Small improvements weekly compound into transformation', color:'green', barWidth:86, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#9889;',
    s4Title: 'The <span class="warm">Self-Awareness</span> Edge',
    s4Truths: [
      { icon:'&#9656;', title:'Know Yourself', desc:'Your biggest opponent is not the market', color:'orange' },
      { icon:'&#9670;', title:'Patterns Reveal Truth', desc:'Journal data shows your real behavior, not your beliefs', color:'gold' },
      { icon:'&#9674;', title:'Growth Is Non-Linear', desc:'Transformation happens in bursts after plateaus', color:'teal' },
      { icon:'&#10003;', title:'Awareness Compounds', desc:'Each insight makes every future trade better', color:'green' },
    ],
    s4Philosophy: 'Technical skills are table stakes. Self-awareness<br>separates good traders from great ones.',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Know Yourself.<br>Trade <span class="warm">Better.</span>',
    ctaDesc: 'Self-awareness is the most overlooked and most powerful trading edge.',
    ctaStats: [{ value:'5', label:'Steps' },{ value:'100%', label:'Internal' },{ value:'1', label:'Opponent' },{ value:'&infin;', label:'Growth' }],
    ctaPills: ['Self-Awareness','Journal','Patterns','Growth'], ctaBoxText: 'Start Your Transformation',
  },
  // ── BLOG POSTS (teal for 173, orange for others) ────────────
  {
    num: 173, type: 'Blog', title: 'Sunk Cost Fallacy',
    hookBadge: 'PSYCHOLOGY &middot; FALLACY', orbIcon: '&#9888;', orbLabel: 'CUT > HOLD',
    hookTitle: 'The Trade Is Losing.<br>Close It or <em>Hope</em>?',
    hookSub: 'The money is already gone. The only question: would you enter now?',
    s2Tag: 'The Trap', s2Title: 'The <span class="warm">Sunk Cost</span> Fallacy',
    s2Cards: [
      { icon:'&#10007;', title:'Holding Losers', desc:'Refusing to close because you already lost $200', iconColor:'red', barWidth:94, barRgb:R.red },
      { icon:'&#10007;', title:'Averaging Down', desc:'Adding to a losing position without a plan', iconColor:'red', barWidth:90, barRgb:R.red },
      { icon:'&#10007;', title:'Moving Stops', desc:'Widening stop loss to give the trade more room', iconColor:'red', barWidth:88, barRgb:R.red },
      { icon:'&#10007;', title:'Hope Trading', desc:'Holding because it might come back. Might.', iconColor:'red', barWidth:86, barRgb:R.red },
    ],
    vsLeft: { label:'Sunk Cost Thinking', text:'Past losses justify holding. They don\'t.' },
    vsRight: { label:'Clean Thinking', text:'Would you enter this trade right now? If not, exit.' },
    s3Tag: 'The Fix', s3Title: '5 Rules to <span class="warm">Break</span> Free',
    s3Pillars: [
      { title:'Ask the <span class="warm">One</span> Question', desc:'Would you open this position right now at this price?', color:'orange', barWidth:95, barRgb:R.teal },
      { title:'If No, <span style="color:var(--accent-gold)">Close</span> It', desc:'Past money spent is irrelevant to the current decision', color:'gold', barWidth:92, barRgb:R.gold },
      { title:'Pre-Set <span style="color:var(--accent-teal)">Stops</span>', desc:'Mechanical stops remove the decision from your hands', color:'teal', barWidth:90, barRgb:R.teal },
      { title:'Journal <span style="color:var(--accent-purple)">Holds</span>', desc:'Track every time you held a loser past your stop', color:'purple', barWidth:86, barRgb:R.purple },
      { title:'Review <span style="color:var(--accent-green)">Outcomes</span>', desc:'How often did holding actually work? Data over hope.', color:'green', barWidth:84, barRgb:R.green },
    ],
    s4Tag: 'Core Truth', s4OrbIcon: '&#9888;',
    s4Title: 'The <span class="warm">Clean</span> Decision',
    s4Truths: [
      { icon:'&#9656;', title:'Past Is Irrelevant', desc:'Money already lost has no bearing on next action', color:'orange' },
      { icon:'&#9670;', title:'Hope Is Not Strategy', desc:'If your plan is hope, you have no plan', color:'gold' },
      { icon:'&#9674;', title:'Mechanical Stops Win', desc:'Remove the decision. Let the stop work.', color:'teal' },
      { icon:'&#10003;', title:'Clean Losses Compound', desc:'Small, clean losses let you survive and compound', color:'green' },
    ],
    s4Philosophy: 'Would you open this position right now?<br>If the answer is no, the only rational action is to close it.',
    ctaOrbIcon: '&#9733;', ctaTagline: 'Cut Clean.<br>Move <span class="warm">Forward.</span>',
    ctaDesc: 'The sunk cost fallacy destroys more accounts than bad analysis.',
    ctaStats: [{ value:'1', label:'Question' },{ value:'5', label:'Rules' },{ value:'0', label:'Hope Trades' },{ value:'&infin;', label:'Clean Exits' }],
    ctaPills: ['Sunk Cost','Stop Loss','Clean Exit','Process'], ctaBoxText: 'Master Clean Decisions',
  },
];

// ═══════════════════════════════════════════════════════════════
// BUILD & WRITE
// ═══════════════════════════════════════════════════════════════
console.log('Building 22 enhanced carousel HTML files...\n');

for (const p of POSTS) {
  const pad = String(p.num).padStart(3, '0');
  const filePath = join(SOCIAL, `post-${pad}`, 'carousel.html');
  const html = buildPost(p);
  writeFileSync(filePath, html);
  const lines = html.split('\n').length;
  console.log(`  post-${pad}: ${lines} lines (${p.type} — ${p.title})`);
}

console.log('\nDone! All 22 posts enhanced.');
