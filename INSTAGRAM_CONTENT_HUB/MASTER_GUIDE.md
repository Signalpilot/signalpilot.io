# SIGNALPILOT INSTAGRAM MASTER GUIDE
## Concept 03: Cinematic Teal & Orange

---

# 1. THE 9-GRID SYSTEM

## Visual Layout
```
┌─────────────────┬─────────────────┬─────────────────┐
│  LEFT COLUMN    │  CENTER COLUMN  │  RIGHT COLUMN   │
│  (TEAL)         │  (NEUTRAL)      │  (ORANGE)       │
├─────────────────┼─────────────────┼─────────────────┤
│ 1. BLOG         │ 2. EDU          │ 3. QUOTE        │
├─────────────────┼─────────────────┼─────────────────┤
│ 4. CHRONICLE    │ 5. EDU          │ 6. PRODUCT      │
├─────────────────┼─────────────────┼─────────────────┤
│ 7. DOCS         │ 8. EDU          │ 9. MARKETING    │
└─────────────────┴─────────────────┴─────────────────┘
```

## Post Number Formula
```
Post # mod 9 = Position

1 → BLOG        (Teal)
2 → EDU         (Neutral)
3 → QUOTE       (Orange)
4 → CHRONICLE   (Teal)
5 → EDU         (Neutral)
6 → PRODUCT     (Orange)
7 → DOCS        (Teal)
8 → EDU         (Neutral)
0 → MARKETING   (Orange)
```

**Example:** Post 402 → 402 % 9 = 6 → PRODUCT (Orange)

---

# 2. COLOR PALETTE

## TEAL (Left Column: Blog, Chronicle, Docs)
| Element | Color | Hex |
|---------|-------|-----|
| Background | Dark Teal-Black | `#0A1A1A` |
| Glow/Border | Teal-500 | `#0D9488` |
| Accent | Teal-400 | `#14B8A6` |
| Text Primary | Teal-100 | `#CCFBF1` |
| Text Secondary | Teal-300 | `#5EEAD4` |

**Visual Signature:** 3px LEFT edge glow, 135° gradient

## NEUTRAL (Center Column: Education)
| Element | Color | Hex |
|---------|-------|-----|
| Background | Near Black | `#0A0A0A` |
| Border | Neutral-800 | `#262626` |
| Accent | Neutral-600 | `#525252` |
| Text Primary | Neutral-200 | `#E5E5E5` |
| Text Secondary | Neutral-400 | `#A3A3A3` |

**Visual Signature:** NO glow border, clean/understated, 180° gradient

## ORANGE (Right Column: Quote, Product, Marketing)
| Element | Color | Hex |
|---------|-------|-----|
| Background | Dark Orange-Black | `#1A0F0A` |
| Glow/Border | Orange-600 | `#EA580C` |
| Accent | Orange-500 | `#F97316` |
| Text Primary | Orange-100 | `#FFEDD5` |
| Text Secondary | Orange-300 | `#FDBA74` |

**Visual Signature:** 3px RIGHT edge glow, 225° gradient

---

# 3. POSTING SCHEDULE

## Recommended: 1 Post Per Day
| Day | Type | Column | Best Time |
|-----|------|--------|-----------|
| 1 | BLOG | Teal | 9 AM |
| 2 | EDU | Neutral | 12 PM |
| 3 | QUOTE | Orange | 6 PM |
| 4 | CHRONICLE | Teal | 9 AM |
| 5 | EDU | Neutral | 12 PM |
| 6 | PRODUCT | Orange | 12 PM |
| 7 | DOCS | Teal | 10 AM |
| 8 | EDU | Neutral | 12 PM |
| 9 | MARKETING | Orange | 6 PM |

**Cycle repeats every 9 posts.**

## Time Guidelines
- **TEAL posts** → Morning (9-10 AM) — informative/educational
- **NEUTRAL posts** → Midday (12 PM) — quick learning
- **ORANGE posts** → Evening (6 PM) — engagement/emotional

---

# 4. DESIGN SPECS (Canva/Export)

## Document Size
- **Instagram Square:** 1080 x 1080 px
- **Carousel Slide:** 1080 x 1350 px (4:5)

## Typography
| Element | Font | Size |
|---------|------|------|
| Title | Inter Bold / Cormorant Garamond | 64-80px |
| Subtitle | Inter Regular | 28-36px |
| Body | Inter Regular | 20-24px |
| Quote Text | Cormorant Garamond Italic | 48-56px |

## Slide 1 Structure
```
┌─────────────────────────────────┐
│  ░░░ GLOW BORDER ░░░            │
│ ┌─────────────────────────────┐ │
│ │      [POST TYPE BADGE]      │ │
│ │                             │ │
│ │      [ICON/VISUAL]          │ │
│ │                             │ │
│ │      TITLE HERE             │ │
│ │      ─────────────          │ │
│ │      Subtitle/Hook          │ │
│ │                             │ │
│ │      SIGNALPILOT            │ │
│ └─────────────────────────────┘ │
│  ░░░ GLOW BORDER ░░░            │
└─────────────────────────────────┘
```

---

# 5. QUICK REFERENCE

## File Locations
| What | Where |
|------|-------|
| Carousel HTMLs | `social/post-XXX/carousel.html` |
| Single Image Templates | `templates/single-image-*.html` |
| 9-Grid Preview | `templates/9-grid-preview.html` |
| Full Post Content | `CONTENT_PLAN_PART1.md`, `CONTENT_PLAN_PART2.md` |
| Post-to-Type Mapping | `POST_MAPPING.md` |

## The Golden Rule
> **Post in strict order. Never skip. Never double-post.**
>
> BLOG → EDU → QUOTE → CHRONICLE → EDU → PRODUCT → DOCS → EDU → MARKETING → repeat

---

# 6. TEMPLATES

## Available HTML Templates
1. **Carousel** — Multi-slide educational content (already built for posts 000-570)
2. **Single Image TEAL** — Blog, Chronicle, Docs
3. **Single Image NEUTRAL** — Education
4. **Single Image ORANGE** — Quote, Product, Marketing

## To Export from HTML
1. Open template in browser
2. Click "Toggle Export Mode"
3. Screenshot or use browser dev tools to export at 1080x1080

---

*This guide consolidates: 9-Grid System, Color Palette, Posting Schedule, and Design Specs.*
*For full post content, see CONTENT_PLAN_PART1.md and CONTENT_PLAN_PART2.md*
