# SignalPilot — Trading Suite Website

**Live:** https://www.signalpilot.io  
**Repo:** https://github.com/Signalpilot/signalpilot.io

A fast, static website for the SignalPilot Trading Suite. It turns **structure, volume, momentum, and regime** into clean, **non‑repainting** signals you can scan, alert, and trade on **any market & timeframe**. The site highlights the flagship **SP‑EC Pro (Event Candles)** plus 9 companion modules.

> **Educational use only.** Nothing here is financial advice. Past performance does not guarantee future results.

---

## Contents

- [What’s on the site](#whats-on-the-site)
- [Tech stack](#tech-stack)
- [Quick start (local dev)](#quick-start-local-dev)
- [Edit guide (where to change copy & settings)](#edit-guide-where-to-change-copy--settings)
- [SEO & analytics](#seo--analytics)
- [Deploy](#deploy)
- [Security / making the repo public](#security--making-the-repo-public)
- [License](#license)

---

## What’s on the site

- **Hero:** gradient headline, “any market · any timeframe” ribbon, 14‑day launch countdown, quick CTAs.
- **Why SignalPilot:** 8 clear reasons (clarity, context, actionable, robust, etc.).
- **What’s inside:** 10 products with tight one‑liners:
  - **SP‑EC Pro — Event‑Candle Confluence:** *Signals, not guesses — bias in one look.*
  - **SP‑PVA Volume + Overlay:** *Crown energy, measured — then printed.*
  - **SP‑OBV:** *Pressure flips, you catch the hint.*
  - **SP‑LTF:** *Coiled or cooked — at a glance.*
  - **SP‑Levels:** *Levels that hold the story.*
  - **SP‑RSI Triad:** *Momentum turns — with receipts.*
  - **SP‑SRSI+:** *Context first, trigger second.*
  - **SP‑MACD+:** *Classic MACD, grown up.*
  - **SP‑SDZ:** *Supply or demand — no ambiguity.*
  - **SP‑Screener:** *Scan the list, not your patience.*
- **How it works (checklist):** bias → participation → structure → timing → scale/alerts + built‑in plays.
- **Pricing:** Monthly / Quarterly / Yearly / Lifetime. **SP‑EC included in all tiers** (visible callout).
- **Pay with crypto:** Formspree form + direct ETH/BTC/AVAX/MATIC/BNB/BCH addresses (copy buttons).
- **Waitlist:** Formspree form.
- **FAQ:** non‑repainting, timeframes, scanning, access speed (1–8h), etc.
- **Footer:** social icons (X, IG, YouTube, Discord, Telegram, GitHub).

---

## Tech stack

- Pure **HTML + CSS + vanilla JS** (no build step).
- **Plausible** analytics (privacy‑friendly).
- **Formspree** forms (waitlist + crypto invoice).
- Inline **SVG** icons (crisp on all screens).
- Deployed on **Vercel** (recommended), Netlify also works.

---

## Quick start (local dev)

```bash
git clone https://github.com/Signalpilot/signalpilot.io
cd signalpilot.io

# Option A: open index.html in a browser (works)
# Option B: run a tiny local server for correct relative paths:
npx serve .        # or: python3 -m http.server 8080


📄 License

All rights reserved © SignalPilot.
This project is closed-source for commercial use.
