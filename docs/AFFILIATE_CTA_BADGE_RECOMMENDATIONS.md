# Affiliate CTA & Badge Recommendations
> Copy-paste ready components for Edu, Docs, and Blog teams

---

## Quick Reference

| Component | Use Case | Link |
|-----------|----------|------|
| **Shiny CTA (Primary)** | High-conversion areas | `https://signalpilot.gumroad.com/affiliates` |
| **Ghost Button** | Secondary placements | `/affiliates.html` |
| **Inline Badge** | In-content mentions | `/affiliates.html` |
| **Sidebar Banner** | Persistent visibility | `https://signalpilot.gumroad.com/affiliates` |
| **Footer CTA** | End-of-page | `/affiliates.html` |

---

## 1. SHINY CTA BUTTON (Primary - High Conversion)

Use this for maximum visibility in hero sections, end-of-article CTAs, and prominent placements.

### HTML
```html
<a href="https://signalpilot.gumroad.com/affiliates" class="shiny-cta affiliate-cta" style="display:inline-flex;width:auto;padding:0.875rem 1.75rem;height:auto">
  <span>Become an Affiliate →</span>
</a>
```

### CSS (if not already included)
```css
@property --gradient-angle{syntax:"<angle>";initial-value:0deg;inherits:false}
@property --gradient-shine{syntax:"<color>";initial-value:#3b82f6;inherits:false}

.shiny-cta {
  --gradient-angle: 0deg;
  --gradient-shine: #3b82f6;
  position: relative;
  overflow: hidden;
  border-radius: 9999px;
  padding: 0.875rem 1.5rem;
  font-size: 0.875rem;
  line-height: 1.2;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(#0a0a0f, #0a0a0f) padding-box,
              conic-gradient(from calc(var(--gradient-angle)), transparent 0%, #1e3a8a 5%, var(--gradient-shine) 15%, #1e3a8a 30%, transparent 40%) border-box;
  border: 2px solid transparent;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1);
  cursor: pointer;
  animation: shiny-spin 2.5s linear infinite;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@keyframes shiny-spin {
  0% { --gradient-angle: 0deg }
  100% { --gradient-angle: 360deg }
}

.shiny-cta span {
  position: relative;
  z-index: 2;
}

.shiny-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(91,138,255,0.4);
}
```

### Variations

**Large CTA (End of Article)**
```html
<a href="https://signalpilot.gumroad.com/affiliates" class="shiny-cta" style="display:inline-flex;width:auto;padding:1.25rem 2.5rem;height:auto;font-size:1.1rem">
  <span>Earn 15-30% Commission →</span>
</a>
```

**Compact CTA (Sidebar)**
```html
<a href="https://signalpilot.gumroad.com/affiliates" class="shiny-cta" style="display:inline-flex;width:100%;padding:0.75rem 1rem;height:auto;font-size:0.85rem">
  <span>Join Affiliate Program</span>
</a>
```

---

## 2. GHOST BUTTON (Secondary)

Use for less prominent placements or alongside other CTAs.

### HTML
```html
<a href="/affiliates.html" class="btn btn-ghost affiliate-link">
  Learn About Affiliates
</a>
```

### CSS
```css
.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 12px;
  background: rgba(255,255,255,0.05);
  color: #ecf1ff;
  border: 1px solid rgba(255,255,255,0.12);
  transition: all 0.2s;
}

.btn-ghost:hover {
  background: rgba(255,255,255,0.1);
  border-color: #5b8aff;
}
```

---

## 3. INLINE BADGE (Content Mentions)

Use within body text to highlight affiliate opportunities.

### HTML
```html
<span class="badge affiliate-badge">AFFILIATE PROGRAM</span>
```

### CSS
```css
.badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  background: rgba(62,213,152,0.15);
  color: #3ed598;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Variant: Brand color */
.badge.brand {
  background: rgba(91,138,255,0.15);
  color: #5b8aff;
}

/* Variant: Commission highlight */
.badge.commission {
  background: rgba(168,85,247,0.15);
  color: #a855f7;
}
```

### Usage Examples

```html
<!-- In a paragraph -->
<p>Looking to monetize your trading community? Check out our <span class="badge brand">AFFILIATE PROGRAM</span> — earn up to <span class="badge commission">30% RECURRING</span> commission.</p>

<!-- With link -->
<p>Join our <a href="/affiliates.html"><span class="badge brand">AFFILIATE PROGRAM</span></a> and start earning today.</p>
```

---

## 4. TIER BADGES (For Affiliate Content)

Use these to showcase commission tiers in educational content.

### HTML
```html
<div class="tier-badges">
  <span class="tier-badge starter">Starter 15%</span>
  <span class="tier-badge growth">Growth 20%</span>
  <span class="tier-badge pro">Pro 25%</span>
  <span class="tier-badge elite">Elite 30%</span>
</div>
```

### CSS
```css
.tier-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.tier-badge.starter {
  background: rgba(148,163,184,0.15);
  color: #94a3b8;
}

.tier-badge.growth {
  background: rgba(91,138,255,0.15);
  color: #5b8aff;
}

.tier-badge.pro {
  background: rgba(245,158,11,0.15);
  color: #f59e0b;
}

.tier-badge.elite {
  background: rgba(168,85,247,0.15);
  color: #a855f7;
}
```

---

## 5. SIDEBAR BANNER (Docs/Blog)

Persistent affiliate promotion in sidebars.

### HTML
```html
<aside class="affiliate-sidebar-banner">
  <div class="affiliate-banner-icon">💰</div>
  <h4>Become an Affiliate</h4>
  <p>Earn 15-30% recurring commission promoting Signal Pilot.</p>
  <ul class="affiliate-highlights">
    <li>30-day cookie duration</li>
    <li>Monthly payouts</li>
    <li>Performance-based tiers</li>
  </ul>
  <a href="https://signalpilot.gumroad.com/affiliates" class="shiny-cta" style="width:100%;padding:0.75rem 1rem;font-size:0.85rem;margin-top:1rem">
    <span>Apply Now →</span>
  </a>
</aside>
```

### CSS
```css
.affiliate-sidebar-banner {
  background: linear-gradient(135deg, rgba(91,138,255,0.1), rgba(91,138,255,0.02));
  border: 1px solid rgba(91,138,255,0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
}

.affiliate-banner-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.affiliate-sidebar-banner h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ecf1ff;
  margin: 0 0 0.5rem 0;
}

.affiliate-sidebar-banner p {
  font-size: 0.9rem;
  color: #b7c2d9;
  margin: 0;
  line-height: 1.5;
}

.affiliate-highlights {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
}

.affiliate-highlights li {
  font-size: 0.85rem;
  color: #8ea0bf;
  padding: 0.35rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.affiliate-highlights li::before {
  content: '✓';
  color: #3ed598;
  font-weight: bold;
}
```

---

## 6. END-OF-ARTICLE CTA BLOCK

Use at the bottom of educational content and blog posts.

### HTML
```html
<div class="affiliate-cta-block">
  <div class="affiliate-cta-content">
    <span class="badge brand">AFFILIATE PROGRAM</span>
    <h3>Share Signal Pilot, Earn Commission</h3>
    <p>Join our affiliate program and earn 15-30% recurring commission on every referral. Perfect for trading educators, content creators, and community leaders.</p>
    <div class="affiliate-cta-stats">
      <div class="stat">
        <span class="stat-value">15-30%</span>
        <span class="stat-label">Commission</span>
      </div>
      <div class="stat">
        <span class="stat-value">30 days</span>
        <span class="stat-label">Cookie</span>
      </div>
      <div class="stat">
        <span class="stat-value">Monthly</span>
        <span class="stat-label">Payouts</span>
      </div>
    </div>
    <a href="https://signalpilot.gumroad.com/affiliates" class="shiny-cta" style="display:inline-flex;width:auto;padding:1rem 2rem;margin-top:1.5rem">
      <span>Apply to Affiliate Program →</span>
    </a>
  </div>
</div>
```

### CSS
```css
.affiliate-cta-block {
  background: linear-gradient(135deg, rgba(91,138,255,0.08), rgba(91,138,255,0.02));
  border: 2px solid rgba(91,138,255,0.25);
  border-radius: 16px;
  padding: 2.5rem;
  margin: 3rem 0;
  text-align: center;
}

.affiliate-cta-content h3 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ecf1ff;
  margin: 1rem 0 0.75rem 0;
}

.affiliate-cta-content p {
  font-size: 1rem;
  color: #b7c2d9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.affiliate-cta-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 1.5rem;
}

.affiliate-cta-stats .stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.affiliate-cta-stats .stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #5b8aff;
}

.affiliate-cta-stats .stat-label {
  font-size: 0.8rem;
  color: #8ea0bf;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (max-width: 600px) {
  .affiliate-cta-stats {
    gap: 1.5rem;
  }
  .affiliate-cta-stats .stat-value {
    font-size: 1.25rem;
  }
}
```

---

## 7. INLINE TEXT LINK (Minimal)

For subtle mentions within body text.

### HTML
```html
<p>If you're a trading educator or content creator, consider joining our <a href="/affiliates.html" class="affiliate-link">affiliate program</a> to earn recurring commission.</p>
```

### CSS
```css
.affiliate-link {
  color: #5b8aff;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 3px;
  transition: color 0.2s;
}

.affiliate-link:hover {
  color: #7b9bff;
  text-decoration-style: solid;
}
```

---

## 8. CALLOUT BOX (Docs)

For documentation pages explaining the affiliate program.

### HTML
```html
<div class="affiliate-callout">
  <div class="callout-header">
    <span class="callout-icon">💡</span>
    <span class="callout-title">Affiliate Opportunity</span>
  </div>
  <div class="callout-body">
    <p>Teaching trading? Our <strong>affiliate program</strong> offers 15-30% recurring commission. You'll earn on every renewal—forever.</p>
    <a href="/affiliates.html" class="callout-link">Learn more about the affiliate program →</a>
  </div>
</div>
```

### CSS
```css
.affiliate-callout {
  background: rgba(91,138,255,0.08);
  border-left: 4px solid #5b8aff;
  border-radius: 0 8px 8px 0;
  padding: 1rem 1.25rem;
  margin: 1.5rem 0;
}

.callout-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.callout-icon {
  font-size: 1.1rem;
}

.callout-title {
  font-weight: 600;
  color: #5b8aff;
  font-size: 0.9rem;
}

.callout-body p {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  color: #b7c2d9;
  line-height: 1.5;
}

.callout-link {
  color: #5b8aff;
  font-weight: 500;
  font-size: 0.9rem;
  text-decoration: none;
}

.callout-link:hover {
  text-decoration: underline;
}
```

---

## 9. HERO BANNER (Blog/Edu Landing)

For dedicated affiliate promotion at top of pages.

### HTML
```html
<div class="affiliate-hero-banner">
  <div class="banner-content">
    <span class="badge brand">PARTNERS WANTED</span>
    <h2>Earn Up to 30% Recurring Commission</h2>
    <p>Join Signal Pilot's affiliate program. Perfect for trading educators, YouTubers, and community leaders.</p>
    <div class="banner-ctas">
      <a href="https://signalpilot.gumroad.com/affiliates" class="shiny-cta" style="width:auto;padding:1rem 2rem">
        <span>Apply Now →</span>
      </a>
      <a href="/affiliates.html" class="btn btn-ghost">View Program Details</a>
    </div>
  </div>
</div>
```

### CSS
```css
.affiliate-hero-banner {
  background: linear-gradient(135deg, rgba(91,138,255,0.15), rgba(168,85,247,0.08));
  border-radius: 16px;
  padding: 3rem 2rem;
  margin: 2rem 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.affiliate-hero-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(91,138,255,0.2) 0%, transparent 70%);
  pointer-events: none;
}

.banner-content {
  position: relative;
  z-index: 1;
}

.banner-content h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #ecf1ff;
  margin: 1rem 0;
}

.banner-content p {
  font-size: 1.1rem;
  color: #b7c2d9;
  max-width: 500px;
  margin: 0 auto 1.5rem;
}

.banner-ctas {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}
```

---

## PLACEMENT RECOMMENDATIONS BY CHANNEL

### EDU (Education Hub)
| Page Type | Recommended Components | Placement |
|-----------|----------------------|-----------|
| Course Landing | Hero Banner, End CTA Block | Top hero, after curriculum |
| Lesson Pages | Sidebar Banner, Inline Link | Sidebar (sticky), closing paragraph |
| Certificate Pages | End CTA Block | After certificate info |

### DOCS (Documentation)
| Page Type | Recommended Components | Placement |
|-----------|----------------------|-----------|
| Getting Started | Callout Box | After "What's Next" section |
| Feature Docs | Inline Badge + Link | When mentioning "share" or "recommend" |
| FAQ | Ghost Button | End of FAQ section |
| Sidebar | Sidebar Banner | Below navigation |

### BLOG
| Page Type | Recommended Components | Placement |
|-----------|----------------------|-----------|
| Tutorial Posts | End CTA Block, Inline Link | End of article, within relevant paragraphs |
| Case Studies | End CTA Block | After results/conclusion |
| News/Updates | Inline Badge | When announcing affiliate features |
| Sidebar | Sidebar Banner | Sticky sidebar position |

---

## COPY VARIATIONS

### Headlines
- "Earn 15-30% Commission"
- "Share Signal Pilot, Get Paid"
- "Become a Signal Pilot Partner"
- "Join Our Affiliate Program"
- "Turn Your Audience Into Income"

### Subheadlines
- "Performance-based tiers that reward results, not vanity metrics."
- "Recurring commission on every referral. Forever."
- "Perfect for trading educators, YouTubers, and community leaders."
- "Start at 15%. Hit milestones. Unlock higher rates."

### Body Copy (Short)
- "Join our affiliate program and earn up to 30% recurring commission on every referral."
- "Trading educator? Content creator? Earn recurring commission promoting Signal Pilot."
- "Our 4-tier affiliate program rewards your growth. Start at 15%, unlock up to 30%."

### Body Copy (Long)
- "Signal Pilot's affiliate program is designed for traders who want to monetize their expertise. With performance-based tiers (15-30% commission), 30-day cookies, and monthly payouts, you'll earn on every sale—and every renewal. No follower requirements, no gatekeeping. Just results."

### CTAs (Button Text)
- "Apply Now →"
- "Become an Affiliate →"
- "Join the Program"
- "Start Earning →"
- "Learn More"
- "View Program Details"

---

## TRACKING & ANALYTICS

Add data attributes for tracking:

```html
<a href="https://signalpilot.gumroad.com/affiliates"
   class="shiny-cta"
   data-track="affiliate-cta"
   data-location="blog-sidebar"
   data-variant="shiny">
  <span>Apply Now →</span>
</a>
```

For Plausible:
```html
<a href="https://signalpilot.gumroad.com/affiliates"
   class="shiny-cta plausible-event-name=Affiliate+CTA+Click plausible-event-location=blog-sidebar">
  <span>Apply Now →</span>
</a>
```

---

## KEY LINKS

| Purpose | URL |
|---------|-----|
| Affiliate Application (Gumroad) | `https://signalpilot.gumroad.com/affiliates` |
| Affiliate Info Page | `/affiliates.html` |
| Language Versions | `/[lang]/affiliates.html` (ar, de, es, fr, hu, it, ja, nl, pt, ru, tr) |

---

## DESIGN TOKENS (CSS Variables)

Ensure these are defined in your stylesheets:

```css
:root {
  /* Brand */
  --brand: #5b8aff;
  --brand-2: #7b9bff;
  --accent: #76ddff;

  /* Signals */
  --good: #3ed598;
  --warn: #f9a23c;

  /* Tier Colors */
  --tier-starter: #94a3b8;
  --tier-growth: #5b8aff;
  --tier-pro: #f59e0b;
  --tier-elite: #a855f7;

  /* Surfaces */
  --bg: #05070d;
  --text: #ecf1ff;
  --muted: #b7c2d9;
  --muted-2: #8ea0bf;
  --border: rgba(255,255,255,0.12);
}
```

---

## ACCESSIBILITY NOTES

1. **Color Contrast**: All badge colors meet WCAG AA standards on dark backgrounds
2. **Focus States**: Add visible focus rings for keyboard navigation
3. **Link Text**: Avoid generic "click here"—use descriptive text like "View affiliate program"
4. **Motion**: Shiny CTA respects `prefers-reduced-motion` media query

```css
@media (prefers-reduced-motion: reduce) {
  .shiny-cta {
    animation: none;
  }
}
```

---

*Last updated: January 2026*
*Questions? Contact the marketing team.*
