# Signal Pilot — Non-Repainting TradingView Indicators

**Live:** https://www.signalpilot.io
**Repo:** https://github.com/Signalpilot/signalpilot.io

A fast, static marketing website for Signal Pilot — 7 non-repainting TradingView indicators that map complete market cycles. The flagship **Pentarch™** system tracks 5-phase reversal sequences (TD→IGN→WRN→CAP→BDN), replacing basic "overbought/oversold" signals with precise cycle positioning.

> **Educational use only.** Nothing here is financial advice. Past performance does not guarantee future results.

---

## Signal Pilot Ecosystem

| Repository | Description | Live URL |
|------------|-------------|----------|
| [signalpilot.io](https://github.com/Signalpilot/signalpilot.io) | Marketing website (this repo) | [signalpilot.io](https://www.signalpilot.io) |
| [signalpilot-education-hub](https://github.com/Signalpilot/signalpilot-education-hub) | 82 professional lessons across 4 skill tiers (250k+ words) | [education.signalpilot.io](https://education.signalpilot.io) |
| [signalpilot-docs](https://github.com/Signalpilot/signalpilot-docs) | Official documentation — guides, cheatsheets, troubleshooting | [docs.signalpilot.io](https://docs.signalpilot.io) |
| [signalpilot-blog](https://github.com/Signalpilot/signalpilot-blog) | Trading education blog in 12 languages | [blog.signalpilot.io](https://blog.signalpilot.io) |

---

## Contents

- [Signal Pilot Ecosystem](#signal-pilot-ecosystem)
- [What's on the site](#whats-on-the-site)
- [Tech stack](#tech-stack)
- [Quick start (local dev)](#quick-start-local-dev)
- [Edit guide](#edit-guide)
- [SEO & analytics](#seo--analytics)
- [Deploy](#deploy)
- [License](#license)

---

## What's on the site

### Hero Section
- **Headline:** "The edge isn't seeing more. It's seeing what matters."
- **Trust badges:** 100% Non-Repainting (Audited) | 7-Day Money-Back Guarantee
- **Hero video:** Live chart demo showcasing Pentarch cycle detection
- **CTA:** Get Started button linking to pricing

### Core Sections
- **Why Signal Pilot vs Everything Else:** Comparison highlighting unique advantages
- **Before/After Signal Pilot:** Visual transformation showing clarity improvement
- **The Real Reason Traders Choose Signal Pilot:** Social proof and value prop
- **Testimonials:** User reviews with ratings and verification badges

### The Elite Seven Indicators
1. **SP — Pentarch: Cycle Phase Detection** (★ FLAGSHIP)
   *Complete trend regime detection system. Maps 5-phase market reversal sequences (TD→IGN→WRN→CAP→BDN).*

2. **SP — OmniDeck: Unified Chart Overlay** (ALL-IN-ONE)
   *Comprehensive overlay unifying 10 premium systems: TD Sequential, Squeeze Cloud, SuperTrend Ensemble, Supply/Demand Zones, Liquidity Sweeps, Candlestick Patterns, and more.*

3. **SP — Volume Oracle: Regime Detection** (REGIME DETECTION)
   *Accumulation/distribution detector showing volume flow patterns — before retail notices.*

4. **SP — Plutus Flow: Statistical OBV Analysis** (ACCUMULATION)
   *Cumulative delta ribbon revealing hidden buying/selling pressure with divergence detection.*

5. **SP — Janus Atlas: Multi-Timeframe Auto-Levels** (KEY LEVELS)
   *Auto-plots HTF levels, D/W/M pivots, VWAP anchors, and volume profile zones (POC, VAH, VAL).*

6. **SP — Augury Grid: Multi-Timeframe Scanner** (S/R MATRIX)
   *Multi-symbol watchlist table tracking 8 tickers simultaneously with quality scores and real-time P&L.*

7. **SP — Harmonic Oscillator: Multi-Component Momentum** (TIMING)
   *7-oscillator voting system with star rating confidence (★ to ★★★★) for entry timing.*

### Pricing Plans
- **Monthly:** $69/month — Flexible month-to-month billing
- **Yearly:** $399/year (save $429, 52% off) — ⭐ Most Popular
- **Lifetime:** $999 one-time — 🏆 Founding 100 (limited slots with counter)

**All plans include:**
- All 7 elite indicators + all future releases
- Real-time alerts & preset configurations
- Backtest templates
- Email support (48h response for Monthly, 24h for Yearly+)
- Advanced training resources (Yearly+)
- Beta access (Yearly+)
- Private Discord community (Lifetime)
- 200+ preset configurations (Lifetime)

**Payment methods:**
- Gumroad (credit/debit card checkout)

### FAQ Section
8 questions covering:
- Non-repainting validation
- Timeframe compatibility
- Market coverage (stocks, crypto, forex, indices, commodities)
- TradingView invite process
- Access delivery speed (1-8 hours)
- Support response times
- Refund policy (7-day money-back)

### Footer
- **Product:** Indicators, Pricing, Documentation, FAQ
- **Legal:** Privacy Policy, Terms of Service, Refund Policy
- **Connect:** GitHub, support@signalpilot.io
- **Copyright:** © 2025-2026 Signal Pilot Labs

---

## Tech stack

- **Pure HTML + CSS + vanilla JS** (no build step, single 4700+ line `index.html`)
- **Analytics:**
  - Plausible (privacy-friendly, primary)
  - Microsoft Clarity (heatmaps, session recordings)
  - Google Analytics 4 (custom event tracking for 10+ events)
- **Forms:** Formspree (card checkout notifications)
- **Payments:**
  - Gumroad (card checkout)
- **Internationalization:** Google Translate (16 languages: en, de, fr, es, it, zh, ru, ar, pt, tr, ja, ko, vi, th, hi, id)
- **Assets:**
  - Background video: `assets/aurora-720p.webm`, `assets/aurora-720p.mp4`
  - Hero video: `assets/videos/hero-demo.mp4`
  - Inline SVG icons (crisp on all screens)
- **Performance optimizations:**
  - Lazy loading for images and videos
  - `preload="metadata"` for videos (saves 15-20MB bandwidth)
  - Width/height attributes to prevent layout shift
  - Custom scrollbar styling for language dropdown

---

## Quick start (local dev)

```bash
git clone https://github.com/Signalpilot/signalpilot.io
cd signalpilot.io

# Option A: open index.html directly in browser (works for static content)
open index.html

# Option B: run a local server for full feature testing
npx serve .        # or: python3 -m http.server 8080
```

Then visit `http://localhost:3000` (or port shown).

---

## Edit guide

Since this is a single-file site, all edits are in `/index.html`.

### Common edits

| What to change | Line range | Search for |
|----------------|------------|------------|
| Page title & meta description | 13-15 | `<title>Signal Pilot` |
| Trust badges (reviews, ratings) | 2536-2539 | `⭐ 4.9/5` |
| Hero headline | 2541 | `See The Complete Market Cycle` |
| Hero video | 2556-2573 | `id="heroVideo"` |
| Indicator names/descriptions | 3067-3237 | `<!-- INDICATOR 1: PENTARCH` |
| Pricing amounts | Various | `$69`, `$399`, `$999` |
| Gumroad checkout URLs | Various | `signalpilot.gumroad.com` |
| FAQ questions | 3604-3702 | `<section id="faq"` |
| Footer links | 3731-3777 | `<footer` |
| Analytics tracking IDs | 93, 99, 105 | `plausible.io`, `clarity`, `gtag` |
| Google Translate languages | 2419-2434, 2440-2455 | `lang-dropdown-menu`, `langSel` |

### Styling

- **CSS Variables:** Lines 118-133 (`:root` for colors, dark theme)
- **Light mode:** Lines 228-296 (`html[data-theme="light"]`)
- **Responsive breakpoints:**
  - Mobile: 768px (lines 1144-1336)
  - Tablet: 1024px (various)
  - Header mobile: 1250px (line 1161)

### JavaScript functionality

- **Theme toggle:** Lines 3884-3906
- **Mobile menu:** Lines 3908-3984
- **Language dropdown:** Lines 4030-4085
- **Google Translate integration:** Lines 4191-4215
- **Countdown timer:** Various
- **GA4 event tracking:** Various (10+ event types)

---

## SEO & analytics

### Meta tags
- **Title:** "Signal Pilot — Non-Repainting TradingView Indicators"
- **Description:** Professional cycle detection for TradingView. Pentarch™ maps complete market cycles. Zero repaint, audited.
- **Keywords:** TradingView indicators, non-repainting, Pentarch, TD Sequential, crypto/stock indicators
- **OpenGraph/Twitter Cards:** Lines 62-87 (social sharing with preview.png)

### Analytics setup

**Plausible** (line 93):
```html
<script defer data-domain="signalpilot.io" src="https://plausible.io/js/script.js"></script>
```

**Microsoft Clarity** (lines 99-107):
```javascript
clarity("set", "userId", "txh7b3h2ja");
```

**Google Analytics 4** (lines 109-116):
```javascript
gtag('config', 'G-3RCZ0JBB0V');
```

**Custom GA4 events tracked:**
1. `cta_click` — CTA button clicks with location
2. `select_plan` — Pricing plan selections
3. `faq_interaction` — FAQ card clicks with question text
4. `scroll_depth` — 25%, 50%, 75%, 100% milestones
5. `dropdown_open` — Resources/Language dropdown opens
6. `navigation_click` — Nav link clicks
7. `language_selector_open` — Language picker opens
8. `language_change` — Language selection with code/name
9. `theme_toggle` — Dark/light mode switches
10. `video_play` — Hero video interactions
11. `outbound_link` — External link clicks (docs, social)
12. `email_click` — support@signalpilot.io clicks

All events log to browser console for debugging.

---

## Deploy

**Vercel (recommended):**
```bash
npm i -g vercel
vercel --prod
```

**Netlify:**
```bash
netlify deploy --prod --dir .
```

**GitHub Pages:**
1. Settings → Pages → Deploy from branch `main`
2. Site will be at `https://signalpilot.github.io/signalpilot.io`

No build step required — just deploy the repo as-is.

---

## License

All rights reserved © 2025-2026 Signal Pilot Labs.
This project is closed-source for commercial use.

---

*Last updated: January 2026*
