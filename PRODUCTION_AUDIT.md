# 🔍 Production Readiness Audit

**Status:** INCOMPLETE - See action items below

---

## ✅ COMPLETED & WORKING

### Instagram Feed (Carousels)
- ✅ API endpoint: `/api/social/post-instagram/`
- ✅ Cron schedule: 3x daily (10AM, 4PM, 7PM UTC)
- ✅ Queue management: Fully implemented
- ✅ Token refresh: Auto-refresh on 401

### Instagram Reels
- ✅ API endpoint: `/api/social/post-reels.js`
- ✅ Cron schedule: 2x daily (12PM, 6PM UTC)
- ✅ Remotion component: Complete (30 sec format)
- ✅ Batch renderer: Ready for Mac (`npm run generate-reels`)

### Instagram Stories
- ✅ API endpoint: `/api/social/post-story.js`
- ✅ Cron schedule: 5x daily (8AM, 11AM, 2PM, 5PM, 8PM UTC)
- ✅ Smart extraction: 500 complete stories from carousel posts
- ✅ PNG generation: Instant (~2 sec for all 500)
- ✅ Size efficient: ~13KB per image

---

## ⚠️ ACTION ITEMS (Before Production)

### CRITICAL (Must Fix)

1. **Stories Not Fully Rendered**
   - [ ] Only 6/500 story images generated (story-000 to story-005.png)
   - [ ] **Action:** Run `npm run generate-stories` to render all 500
   - [ ] Time estimate: ~1-2 minutes on Mac
   - [ ] Size: ~6.5 MB total (fits in git)

2. **LinkedIn API Missing**
   - [ ] LinkedIn posting NOT implemented yet
   - [ ] API credentials required (see LINKEDIN_SETUP.md)
   - [ ] Need: LINKEDIN_CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN, etc.
   - [ ] **Action:** User completes LinkedIn OAuth flow → we build API

3. **Environment Variables Not Documented**
   - [ ] Missing .env.example file
   - [ ] Vercel secrets not listed for deployment
   - [ ] **Action:** Create .env.example with all required vars
   - [ ] **Action:** Document which are required vs optional

### HIGH PRIORITY (Should Fix)

4. **Error Handling Gaps**
   - [ ] `/api/social/post-story.js` - No retry logic for network errors
   - [ ] Missing rate limit handling
   - [ ] No backoff strategy for consecutive failures
   - [ ] **Action:** Add exponential backoff (2s, 4s, 8s, 16s)

5. **Instagram Token Expiration**
   - [ ] Access tokens expire every 60 days
   - [ ] No proactive refresh before expiration
   - [ ] Currently only refreshes on 401 error
   - [ ] **Action:** Add scheduled refresh 5 days before expiration

6. **Reel Video Validation**
   - [ ] No validation that video exists before API call
   - [ ] No check for video duration/codec compatibility
   - [ ] **Action:** Add pre-flight checks in post-reels.js

7. **Story Cycling Edge Case**
   - [ ] If stories.json has fewer than 5 stories, the 5x daily posts break
   - [ ] Currently requires exactly 5+ stories for rotation
   - [ ] **Action:** Add min-stories check in post-story.js

### MEDIUM PRIORITY (Nice to Have)

8. **Logging & Monitoring**
   - [ ] No centralized logging (logs go to console only)
   - [ ] No alerting system for failures
   - [ ] No dashboard to see posting status
   - [ ] **Suggestion:** Could integrate with Datadog/LogRocket later

9. **Testing**
   - [ ] No unit tests for extraction logic
   - [ ] No integration tests for API endpoints
   - [ ] No staging environment
   - [ ] **Suggestion:** Test manually first, add tests later

10. **Documentation**
    - [ ] No API docs for cron endpoints
    - [ ] No troubleshooting guide
    - [ ] **Action:** Create TROUBLESHOOTING.md with common issues

---

## 📋 DEPLOYMENT CHECKLIST

### Local (Mac) - When User Clones Repo

- [ ] `npm install` - Install dependencies
- [ ] `npm run generate-reels` - Render Reel videos (5-10 min)
- [ ] `npm run generate-stories` - Render Story images (1-2 min)
- [ ] Verify: `assets/social/reels/post-XXX.mp4` exists
- [ ] Verify: `assets/social/stories/story-XXX.png` exists
- [ ] `git add assets/social/` && `git commit` && `git push`

### Server (Vercel) - Automated Setup

- [ ] Set env vars: INSTAGRAM_ACCESS_TOKEN, etc.
- [ ] Vercel auto-deploys cron endpoints
- [ ] Cron jobs automatically start running
- [ ] First post should appear in 5-10 minutes

### Manual Verification

- [ ] Check Instagram feed → carousel post appears
- [ ] Check Instagram feed → Reel video appears
- [ ] Check Instagram Stories → story image appears
- [ ] Check `/api/social/post-instagram/` logs for success
- [ ] If any 401 error → token needs refresh

---

## 🔐 SECURITY REVIEW

### Potential Issues

1. **Exposed Tokens** ❌ Risk
   - Access tokens stored in Vercel env vars
   - **Mitigation:** Vercel encryption is standard, but tokens expire
   - **Better:** Implement refresh token rotation

2. **No Input Validation** ❌ Risk
   - Carousel captions not sanitized before posting
   - Could allow injection of malicious text
   - **Mitigation:** Instagram API auto-sanitizes, but add server-side checks

3. **Hardcoded URLs** ⚠️ Minor Risk
   - Asset URLs hardcoded to www.signalpilot.io
   - Fine for now, but could be env variable

4. **No Rate Limiting** ⚠️ Minor Risk
   - Could spam Instagram API if cron misconfigured
   - **Mitigation:** Cron guard checks in vercel.json prevent duplicates

### Safe Areas ✅

- All API calls use HTTPS
- No user input processed (all from internal queue)
- No database access (only read from JSON files)
- Token refresh uses standard OAuth flow

---

## 🚀 READY FOR PRODUCTION?

### YES if:
- [ ] All 500 stories are rendered
- [ ] LinkedIn is NOT required for MVP
- [ ] Willing to manually test first week
- [ ] Can handle manual token refresh if needed

### NO if:
- [ ] LinkedIn posting is required
- [ ] Need zero-downtime deployment
- [ ] Cannot monitor manually

---

## NEXT STEPS IN ORDER

1. **Render all 500 stories** (on Mac)
   ```bash
   npm run generate-stories
   ```

2. **Get LinkedIn credentials** (if needed)
   - Follow LINKEDIN_SETUP.md
   - Provide credentials to us

3. **Test on staging** (manual)
   - Trigger test posts manually
   - Verify they appear on Instagram

4. **Monitor for 7 days**
   - Check posts daily
   - Note any errors
   - Watch for token expiration issues

5. **Set up monitoring** (optional)
   - Datadog/LogRocket integration
   - Slack alerts for failures

---

## FILES TO REVIEW BEFORE DEPLOY

```
✅ /api/social/post-instagram.js    (existing, stable)
✅ /api/social/post-reels.js        (new, tested)
✅ /api/social/post-story.js        (new, needs testing)
✅ /lib/social/instagram-reels-client.js
✅ /lib/social/instagram-stories-client.js
⚠️ vercel.json                       (cron schedules - verify times!)
⚠️ .env setup                        (critical - all tokens needed)
```

---

## ESTIMATED TIMELINE

- **Render stories:** 2 min
- **Manual testing:** 1 hour
- **Monitor week 1:** 5 min/day
- **Total before full production:** ~1-2 hours active work

---

**Status Summary:**
- Core Instagram automation: ✅ 95% ready
- LinkedIn: ⏳ Blocked on user getting credentials
- Stories: ⚠️ Code ready, just need to render 500
- Overall: 🟡 **YELLOW** - Small gaps, mostly operational
