# Content Operations — handoff brief

Written 2026-08-21. Read this before producing anything published under the
Signal Pilot name.

This exists so that any collaborator — a Claude session working on SATURN, a
future session on this repo, or a person — has the same picture. It covers what
the business actually needs, what changed recently, and the rules that are not
negotiable.

---

## 1. The business, in one paragraph

Signal Pilot sells seven invite-only TradingView indicators (The Elite Seven).
The flagship, Pentarch, detects a five-stage market cycle. The differentiator is
**non-repainting**: every marker is confirmed at bar close and never moves
afterwards, so chart history shows what a trader would actually have seen live.
The brand positions against signal-selling — it teaches people to read structure
rather than making them dependent on alerts.

Sold through Gumroad. Fiscal invoices are generated via EasyPOS, fulfilment runs
through Make.com, which grants TradingView invite access.

---

## 2. The actual problem — read this before proposing anything

**It is not a product problem. It is a distribution problem.**

Roughly six sales in a year. One lifetime, a few monthlies, one $400 yearly. The
product is genuinely well built — documented, internally consistent, engineered
with real tradeoffs. Almost nobody knows it exists.

The diagnosis: the ratio of **building** to **showing** has been about 50:1. It
needs to be closer to 3:1.

Evidence of the pattern:

- 845 social posts written and queued. Almost none published; about 200 were
  posted to Instagram, judged to look like filler, then deleted.
- 54 blog articles, none published since 2025.
- 2 TradingView Ideas, one from 2023 and one from 2024, neither of which shows
  the indicators on the chart.
- 4 web properties, 12 languages, 800+ URLs — built for an audience that does
  not exist yet.

Every proposal should be evaluated against one question: **does this put the
product in front of a stranger?** If it does not, it is building, and building
is not the constraint.

---

## 3. What changed on 2026-08-20

Infrastructure work, all live in production:

- **Deploys were failing for months.** Vercel Hobby caps a no-framework project
  at 12 Vercel Functions; this repo had 34. Nothing shipped until that was
  fixed. `api/social/` is now excluded via `.vercelignore`, leaving 5 functions.
- **All cron jobs removed.** The social automation is deliberately switched off.
- **35 catch-all redirects were 404ing** under `trailingSlash: true`, because
  Vercel matches routes in path-to-regexp strict mode where `/x/:path*` does not
  match `/x/y/`. Sources changed to `(.*)`.
- **Subdomains consolidated onto the main domain.** `blog.`, `docs.` and
  `education.signalpilot.io` now live at `/blog/`, `/docs/`, `/education/`,
  with host-based 301s from the old hostnames. 800 URLs moved. Sitemap went
  263 → 1062 URLs. This matters because search engines treated those subdomains
  as separate sites, so years of content was building authority for properties
  that sell nothing.
- **Seven product pages added** at `/pentarch/`, `/volume-oracle/`,
  `/janus-atlas/`, `/plutus-flow/`, `/harmonic-oscillator/`, `/augury-grid/`,
  `/omnideck/`. These target commercial-intent queries and are the first pages
  on the money domain that can convert search traffic.
- **Soro** (trysoro.com, ~$39/mo) publishes one SEO article a day into a widget
  on `/blog/`. It is a JavaScript embed — it renders into a div and never writes
  files. Its brand settings carry the compliance rules in section 5.
- **Blog images**: 54 hero PNGs averaging 5.7 MB were converted to WebP,
  361 MB → 4 MB.

---

## 4. The content system

**One unit of work, three channels.** This is the core of the plan and the
mechanism that fixes the ratio.

A single chart analysis becomes:

| Channel | Purpose | Notes |
| --- | --- | --- |
| TradingView Idea | reach — traders already viewing that symbol | the chart is the advertisement |
| Blog post on `/blog/` | compounds in Google for months | written by us, not Soro |
| Instagram post | feed presence without a separate content pipeline | chart screenshot + caption trimmed from the Idea |

Soro handles daily evergreen SEO articles independently. It does not touch this
pipeline.

**Why the chart matters more than the words.** On TradingView, people see the
image before they read anything. A chart with TD / IGN / WRN / CAP / BDN printed
at real turns provokes "what indicator is that?" — and that question is the
entire funnel. Analysis posted without the indicators visible is wasted effort.

**Why past tense is the strongest framing.** Everyone else posts predictions and
quietly deletes the wrong ones. Because these indicators do not repaint, we can
post what already printed and show the marks are still exactly where they
appeared. That is a claim almost nobody else can make honestly. The compliance
constraint and the product differentiator are the same thing.

### Symbol selection is distribution

TradingView Ideas are browsed per symbol. An idea on a thin altcoin reaches
almost nobody; the same analysis on BTCUSD reaches thousands. Publish where the
audience is, even when trading elsewhere.

| Slot | Primary | Cross-market context |
| --- | --- | --- |
| Mon | BTCUSD or ETHUSD | TOTAL, TOTAL2, USDT.D, DXY |
| Wed | XAUUSD or EURUSD | DXY, US10Y |
| Fri | SPX / ES1!, or NVDA / TSLA | VIX, DXY, sector |

Rotating across crypto, FX/metals and indices/equities matches the actual
audience, who trade all three. Avoid becoming a crypto-only account.

---

## 5. Compliance — non-negotiable

These are financial-adjacent products. The rules below are not stylistic.

**Never:**

- predictions or forward-looking statements of any kind
- entries, exits, stops, targets, position sizing — anything that reads as a
  trade call
- performance figures: R:R, expectancy, win rate, P&L, "would have returned"
- guaranteed, risk-free, easy money, signals to copy, profit projections,
  urgency or FOMO language

**Always:**

- describe what the indicator *showed*, never what anyone should *do*
- past tense for anything about a specific chart
- a risk disclaimer on published pages

**Standard disclaimer:**

> Signal Pilot provides educational tools for learning only. Not financial
> advice. Trading involves substantial risk. Past performance doesn't guarantee
> future results.

**Terminology:** the five cycle events are TD (Touchdown), IGN (Ignition),
WRN (Warning), CAP, BDN (Breakdown). Note that the brand skill records CAP as
Capitulation while the live site and docs use Climax; the owner treats these as
the same thing. Match surrounding material rather than introducing a third form.

Full rules live in the `signalpilot` skill under `references/compliance.md`,
`voice-and-tone.md` and `terminology.md`.

---

## 6. SATURN's role

SATURN is a separate project — a manual/automated trading system that drives
TradingView desktop with these indicators loaded. It already grades setups.

For content, it is the **extraction layer**: it reads what actually printed on a
chart, which is what makes a post specific rather than generic. Generic posts
are what made the Instagram feed look like filler.

**The test for any caption or post:** if it could be pasted under a different
chart without changing anything, it is wrong.

**The trap.** SATURN's native language is R-multiples, expectancy and vetoes,
because that is what it was built for. None of that is publishable. A
translation layer is required:

| internal | publishable |
| --- | --- |
| `R:R 6.61:1, expectancy -0.442R, VETOED` | "the stop sat inside the measured noise range" |
| `73% of filled setups stopped at 0.3-0.6 ATR` | "stops in that band sat inside typical noise for this symbol" |
| `setup #82 pushed, we didn't take it` | "WRN printed here, and here's what the structure looked like after" |

Same insight, no number implying profit or loss.

### Requested output format

For a named symbol, return a factual reading of what already printed — past
tense only:

1. Symbol, timeframe, date range shown
2. Indicators visible on the chart
3. Cycle events printed: code | price level | date | which layers confirmed
4. What price did after each: direction, % move, bars or days elapsed
5. Structure notes: divergences, regime state, level interactions, volume regime
6. Cross-market context for the same window
7. Real-time vs hindsight — confirm marks sit where they printed and have not
   moved
8. One sentence on why this chart is worth a stranger's attention

Primary read on 4h or 1D, with the higher timeframe state noted. Always say
which timeframe an observation came from.

**If nothing interesting printed, say so.** A boring chart is not worth
publishing, and skipping a day beats posting filler. This is the guard against
the pattern that produced 200 deleted Instagram posts.

---

## 7. Deliberately deferred

Not because they are bad, but because they do not put the product in front of
anyone new:

- **Crypto checkout** (CoinGate or NOWPayments, feeding a `/api/crypto-fiscalize`
  endpoint that mirrors the Gumroad one). Real and worth doing — but it is a
  conversion fix for traffic that does not exist yet. Note that crypto suits
  lifetime and yearly only; there is no card on file to auto-charge monthly.
- **Meta ads.** Financial-services advertising requires verification and is
  aggressively moderated. Not worth the fight at this stage.
- **Translating the new pages** into the site's 12 languages. Wait until the
  English versions prove they rank; translating unproven pages multiplies thin
  content across 12 locales.
- **Holo (tryholo.ai) or similar ad-creative tools.** Would generate more
  unpublished content, deepening the exact problem.

---

## 8. The near-term goal

Complete one full loop end to end: one chart, one Idea, one blog post, one
Instagram post. Then sustain three a week.

Everything else waits until that is proven.
