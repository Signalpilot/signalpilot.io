# Starter Tier Implementation Guide

## Overview
This document outlines how to implement a **Starter tier** ($69/mo) that includes:
- **Indicators**: Pentarch + 3 companions (your choice: OmniDeck, Volume Oracle, Janus Atlas recommended)
- **Education**: First 12 lessons only (Beginner tier)
- **Docs**: Full access (documentation doesn't need gating)

---

## Problem: Lesson Locking

The Education Hub (education.signalpilot.io) currently provides all 42 lessons to everyone. For the Starter tier, you need to:
1. **Lock lessons 13-42** (Intermediate + Advanced)
2. **Show locked state** with upgrade prompts
3. **Allow Pro/Lifetime subscribers** full access

---

## Technical Solutions

### Option 1: Authentication-Based Gating (Recommended)

**How it works:**
- Add login system to education hub
- Check user's subscription tier from main site database
- Conditionally render locked/unlocked lessons

**Implementation:**

```javascript
// education.signalpilot.io/auth-check.js

async function getUserTier() {
  // Fetch from your backend/Stripe
  const response = await fetch('https://api.signalpilot.io/user/tier', {
    credentials: 'include' // send cookies
  });
  const data = await response.json();
  return data.tier; // 'starter', 'pro', or 'lifetime'
}

function lockLesson(lessonNumber, userTier) {
  if (userTier === 'starter' && lessonNumber > 12) {
    // Show locked state
    document.querySelectorAll(`.lesson-${lessonNumber}`).forEach(el => {
      el.classList.add('locked');
      el.addEventListener('click', showUpgradeModal);
    });
  }
}

// On page load
window.addEventListener('DOMContentLoaded', async () => {
  const userTier = await getUserTier();

  // Lock lessons 13-42 for Starter tier
  for (let i = 13; i <= 42; i++) {
    lockLesson(i, userTier);
  }
});
```

**UI Changes Needed:**

```html
<!-- Add to each lesson 13-42 -->
<div class="lesson-card locked" data-lesson="13">
  <div class="lock-overlay">
    <svg><!-- lock icon --></svg>
    <p>Unlock with Pro or Lifetime</p>
    <button class="upgrade-btn">Upgrade Now</button>
  </div>

  <h3>Lesson 13: Institutional Order Flow</h3>
  <p>Learn how large players move markets...</p>
</div>
```

```css
/* Add to education hub CSS */
.lesson-card.locked {
  position: relative;
  opacity: 0.6;
  pointer-events: none;
}

.lesson-card.locked .lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 10;
}

.upgrade-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--brand);
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 700;
  cursor: pointer;
}
```

**Backend Requirements:**
- Create API endpoint: `/api/user/tier`
- Return subscription tier based on:
  - Stripe subscription metadata
  - Or Gumroad license key check
  - Or session/JWT token
- Implement authentication (OAuth, email/password, or magic links)

---

### Option 2: Separate Sites/Subdomains (Simpler but Less Elegant)

**How it works:**
- **Starter**: `education-starter.signalpilot.io` (only lessons 1-12)
- **Pro/Lifetime**: `education.signalpilot.io` (all 42 lessons)
- Send different URLs based on purchase tier

**Pros:**
- No authentication needed
- Simple to implement (duplicate first 12 lessons to new site)
- URL obscurity provides basic access control

**Cons:**
- Not secure (Pro URL could leak)
- Duplicate content maintenance
- Poor user experience (can't upgrade in-place)

**Implementation:**
```bash
# Create starter-only site
cp -r education.signalpilot.io education-starter.signalpilot.io

# Remove lessons 13-42 from starter site
cd education-starter.signalpilot.io/curriculum
rm intermediate/* advanced/*

# Update navigation to show upgrade prompts
# Edit index.html to add "Unlock More Lessons" CTAs
```

---

### Option 3: Separate Purchase Credentials (Middle Ground)

**How it works:**
- Generate unique access codes per purchase
- Starter codes: unlock lessons 1-12
- Pro/Lifetime codes: unlock all lessons
- Users enter code once to "activate" their tier

**Implementation:**

```javascript
// Check access code on first visit
function checkAccessCode() {
  let storedCode = localStorage.getItem('education_access_code');

  if (!storedCode) {
    storedCode = prompt('Enter your SignalPilot access code (sent via email):');
    localStorage.setItem('education_access_code', storedCode);
  }

  // Validate code with backend
  fetch('https://api.signalpilot.io/validate-code', {
    method: 'POST',
    body: JSON.stringify({ code: storedCode })
  })
  .then(res => res.json())
  .then(data => {
    if (data.tier === 'starter') {
      lockLessons(13, 42);
    }
  });
}
```

**Access Code Format:**
- Starter: `SP-START-XXXX-XXXX`
- Pro: `SP-PRO-XXXX-XXXX`
- Lifetime: `SP-LIFE-XXXX-XXXX`

**Backend:**
- Store codes in database linked to purchases
- Validate code → return tier
- Simple, no ongoing authentication needed

---

## Recommended Approach

**Best Solution: Option 1 + Option 3 Hybrid**

1. **Use access codes for simplicity**
   - Send unique codes with purchase confirmation emails
   - Store tier in localStorage after validation
   - No ongoing login required

2. **Add visual gating**
   - Show all 42 lessons in navigation
   - Lock 13-42 for Starter tier
   - Display "Unlock with Pro" overlays
   - Link upgrade buttons to pricing page

3. **Progressive enhancement**
   - Start with access codes (fast to implement)
   - Later add full authentication if needed
   - Migrate users smoothly

---

## UI/UX Recommendations

### Locked Lesson Design

```html
<!-- Beginner lessons (1-12): Fully accessible -->
<div class="lesson-card accessible">
  <span class="lesson-badge">Lesson 1</span>
  <h3>Understanding Market Liquidity</h3>
  <p>Learn how liquidity drives price action...</p>
  <a href="/curriculum/beginner/lesson-01.html" class="start-lesson">Start Lesson →</a>
</div>

<!-- Intermediate lessons (13-27): Locked for Starter -->
<div class="lesson-card locked">
  <div class="lock-indicator">
    <svg class="lock-icon"><!-- lock SVG --></svg>
    <span>Pro / Lifetime</span>
  </div>
  <span class="lesson-badge">Lesson 13</span>
  <h3>Institutional Order Flow</h3>
  <p>Discover how large players move markets...</p>
  <button class="upgrade-cta">Upgrade to Unlock</button>
</div>
```

### Upgrade Modal

When user clicks locked lesson:

```
┌──────────────────────────────────────┐
│                                      │
│   🔒 Unlock Full Curriculum          │
│                                      │
│   You're currently on Starter tier  │
│   (first 12 lessons).                │
│                                      │
│   Upgrade to Pro or Lifetime to      │
│   unlock all 42 lessons:             │
│                                      │
│   ✓ 30 additional lessons            │
│   ✓ Intermediate + Advanced content  │
│   ✓ Algorithmic trading concepts     │
│   ✓ Institutional strategies         │
│                                      │
│   [Upgrade to Pro - $99/mo]          │
│   [Go Lifetime - $1,799]             │
│                                      │
│   [Maybe Later]                      │
│                                      │
└──────────────────────────────────────┘
```

---

## Code Example: Complete Implementation

```javascript
// education-hub-access-control.js

class EducationAccess {
  constructor() {
    this.tier = null;
    this.accessCode = localStorage.getItem('sp_access_code');
  }

  async init() {
    if (!this.accessCode) {
      await this.promptForCode();
    }

    this.tier = await this.validateCode(this.accessCode);
    this.applyGating();
  }

  async promptForCode() {
    const code = prompt(
      'Enter your SignalPilot access code\n' +
      '(Check your purchase confirmation email)'
    );

    if (code) {
      localStorage.setItem('sp_access_code', code);
      this.accessCode = code;
    }
  }

  async validateCode(code) {
    try {
      const response = await fetch('https://api.signalpilot.io/validate-education-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (!data.valid) {
        alert('Invalid access code. Please check your email or contact support.');
        localStorage.removeItem('sp_access_code');
        return null;
      }

      return data.tier; // 'starter', 'pro', or 'lifetime'
    } catch (error) {
      console.error('Code validation failed:', error);
      return null;
    }
  }

  applyGating() {
    if (this.tier === 'starter') {
      // Lock lessons 13-42
      document.querySelectorAll('[data-lesson]').forEach(lessonCard => {
        const lessonNum = parseInt(lessonCard.dataset.lesson);

        if (lessonNum > 12) {
          this.lockLesson(lessonCard);
        }
      });
    }
    // Pro and Lifetime: no gating needed
  }

  lockLesson(lessonCard) {
    lessonCard.classList.add('locked');

    // Add lock overlay
    const overlay = document.createElement('div');
    overlay.className = 'lock-overlay';
    overlay.innerHTML = `
      <svg class="lock-icon" width="48" height="48" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm4 8H8V7c0-2.206 1.794-4 4-4s4 1.794 4 4v3z"/>
      </svg>
      <p style="margin:0.75rem 0;font-weight:600;">Pro / Lifetime Required</p>
      <button class="btn btn-primary upgrade-btn">Upgrade to Unlock</button>
    `;

    lessonCard.appendChild(overlay);

    // Handle upgrade button click
    overlay.querySelector('.upgrade-btn').addEventListener('click', () => {
      this.showUpgradeModal();
    });
  }

  showUpgradeModal() {
    // Show modal with pricing options
    const modal = document.createElement('div');
    modal.className = 'upgrade-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>🔒 Unlock Full Curriculum</h2>
        <p>You're currently on <strong>Starter tier</strong> (first 12 lessons).</p>
        <p>Upgrade to access all 42 lessons:</p>
        <ul>
          <li>✓ 30 additional lessons (Intermediate + Advanced)</li>
          <li>✓ Algorithmic trading concepts</li>
          <li>✓ Institutional order flow strategies</li>
          <li>✓ Market microstructure deep dives</li>
        </ul>
        <div class="upgrade-options">
          <a href="https://www.signalpilot.io/#pricing" class="btn btn-primary">
            View Pricing Plans
          </a>
          <button class="btn btn-ghost close-modal">Maybe Later</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const access = new EducationAccess();
  access.init();
});
```

---

## Backend API Requirements

### Endpoint: `/api/validate-education-code`

**Request:**
```json
{
  "code": "SP-START-A3F2-9K7L"
}
```

**Response (valid):**
```json
{
  "valid": true,
  "tier": "starter",
  "purchaseDate": "2025-01-15",
  "email": "user@example.com"
}
```

**Response (invalid):**
```json
{
  "valid": false,
  "error": "Code not found or expired"
}
```

---

## Purchase Flow Integration

### Gumroad/Stripe Integration

When user purchases Starter tier:
1. Generate unique access code: `SP-START-{random}`
2. Store in database: `{ code, tier: 'starter', email, purchaseDate }`
3. Send confirmation email with code:

```
Subject: Your SignalPilot Access Code

Hi [Name],

Welcome to SignalPilot Starter! Your access code is:

SP-START-A3F2-9K7L

To access the education hub:
1. Visit https://education.signalpilot.io
2. Enter your access code when prompted
3. Start learning with the first 12 lessons

To unlock all 42 lessons, upgrade to Pro or Lifetime:
https://www.signalpilot.io/#pricing

Questions? Reply to this email.

- The SignalPilot Team
```

---

## Testing Checklist

- [ ] Generate Starter access code
- [ ] Generate Pro access code
- [ ] Generate Lifetime access code
- [ ] Validate each code via API
- [ ] Confirm lessons 1-12 accessible for Starter
- [ ] Confirm lessons 13-42 locked for Starter
- [ ] Confirm all lessons accessible for Pro/Lifetime
- [ ] Test invalid/expired code handling
- [ ] Test upgrade modal flow
- [ ] Test localStorage persistence
- [ ] Test code entry on multiple devices
- [ ] Mobile responsiveness of lock overlays

---

## Future Enhancements

1. **Account Dashboard**
   - Full user login system
   - View purchase history
   - Manage subscription
   - Switch between devices easily

2. **Progress Tracking by Tier**
   - Track completion % of accessible lessons
   - Show "You've completed 10/12 Starter lessons"
   - Incentivize upgrade: "Unlock 30 more lessons"

3. **Trial Access**
   - Give Starter users 1 free Intermediate lesson
   - "Try before you upgrade"

4. **Upgrade Incentives**
   - "Upgrade within 7 days, save 20%"
   - Limited-time promotions for Starter users

---

## Conclusion

**Recommended Implementation:**
- Start with **access code system** (Option 3)
- Add **visual gating** with locked lesson UI
- Implement **upgrade modal** with clear CTAs
- Estimated development time: **2-4 hours** for basic implementation
- Full authentication system: **1-2 weeks** if needed later

The access code approach gives you a working Starter tier quickly, and you can enhance it with full authentication as you scale.
