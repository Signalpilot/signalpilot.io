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

# 3. POSTING ORDER (CRITICAL)

## Instagram Grid Direction
**Instagram fills grids RIGHT-TO-LEFT** — newest post appears TOP LEFT, pushing older posts right.

To achieve the visual layout (Teal-Neutral-Orange left-to-right), you must **POST IN REVERSE**:

```
POST ORDER         →  GRID RESULT
─────────────────────────────────────
1st: ORANGE (003)  →  Appears RIGHT
2nd: NEUTRAL (002) →  Appears CENTER
3rd: TEAL (001)    →  Appears LEFT
```

## Correct Posting Sequence (Per Row of 3)

| Post # | Type | Column | Post ORDER |
|--------|------|--------|------------|
| **003** | QUOTE | Orange | **1st** |
| **002** | EDU | Neutral | **2nd** |
| **001** | BLOG | Teal | **3rd** |
| **006** | PRODUCT | Orange | **4th** |
| **005** | EDU | Neutral | **5th** |
| **004** | CHRONICLE | Teal | **6th** |
| **009** | MARKETING | Orange | **7th** |
| **008** | EDU | Neutral | **8th** |
| **007** | DOCS | Teal | **9th** |

**Pattern: Always post ORANGE → NEUTRAL → TEAL (right to left)**

## Recommended Timing
| Color | Best Time | Reason |
|-------|-----------|--------|
| ORANGE | 6 PM | Engagement/emotional (evening) |
| NEUTRAL | 12 PM | Quick learning (midday) |
| TEAL | 9 AM | Informative (morning) |

**Cycle repeats every 9 posts.**

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
> **Post RIGHT-TO-LEFT for each row. Never skip. Never double-post.**
>
> **Posting Order:** QUOTE → EDU → BLOG → PRODUCT → EDU → CHRONICLE → MARKETING → EDU → DOCS → repeat
>
> (ORANGE first, NEUTRAL second, TEAL third — for each row of 3)

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
