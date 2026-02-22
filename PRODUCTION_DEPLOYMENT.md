# Production Deployment Guide: Engagement System

**Version:** 3.0 (All Phases Complete)
**Date:** 2026-02-22
**Status:** Ready for Production

---

## Pre-Deployment Checklist

### 1. Environment Variables (Vercel)
Verify these are set in Vercel dashboard:

```bash
# Instagram
INSTAGRAM_ACCESS_TOKEN          # Token (IGAAM or EAA prefix)
INSTAGRAM_BUSINESS_ACCOUNT_ID   # Account/Page ID
FACEBOOK_APP_ID                 # For token refresh
FACEBOOK_APP_SECRET             # For token refresh

# Twitter
TWITTER_API_KEY                 # API Key
TWITTER_API_SECRET              # API Secret
TWITTER_ACCESS_TOKEN            # OAuth token
TWITTER_ACCESS_SECRET           # OAuth secret

# Redis
UPSTASH_REDIS_REST_URL          # Redis endpoint
UPSTASH_REDIS_REST_TOKEN        # Auth token

# Security
ROBOT_TOKEN                     # Auth token (generate random string)
CRON_SECRET                     # Cron job token (generate random string)
SOCIAL_ADMIN_TOKEN              # Admin token (generate random string)
```

**To generate tokens:**
```bash
# Generate 32-char random token
openssl rand -hex 16
```

### 2. Configuration Files
Verify these exist and are correct:

```
✅ data/social/engagement-config.json       - Settings (enabled, targets, limits)
✅ data/social/content-queue.json          - 650+ posts (pre-populated)
✅ vercel.json                             - Cron jobs configured
✅ ENGAGEMENT_SETUP.md                     - User guide
✅ ENGAGEMENT_AUDIT.md                     - This audit
```

### 3. Git Status
Ensure branch is clean:

```bash
git status
# Should show: nothing to commit, working tree clean
```

### 4. Cron Jobs in vercel.json
Verify 5 cron jobs are configured:

```json
{
  "crons": [
    { "path": "/api/social/post-twitter/", "schedule": "0 3,7,12,16,21 * * *" },
    { "path": "/api/social/post-instagram/", "schedule": "0 10,16,19 * * *" },
    { "path": "/api/social/refresh-ig-token/", "schedule": "0 3 * * *" },
    { "path": "/api/social/cron-engage/", "schedule": "0 */4 * * *" },
    { "path": "/api/social/cron-engage-retry/", "schedule": "*/10 * * * *" }
  ]
}
```

---

## Deployment Steps

### Step 1: Deploy to Vercel

```bash
# Option A: Automatic (recommended)
# Push to main branch
git push origin main
# Vercel will auto-deploy

# Option B: Manual deployment (if not using auto-deploy)
vercel --prod
```

### Step 2: Verify Deployment

Wait 2-3 minutes for deployment to complete, then:

```bash
# Check posting still works
curl "https://www.signalpilot.io/api/social/queue-status/?token=YOUR_ROBOT_TOKEN"

# Check engagement is running
curl "https://www.signalpilot.io/api/social/engagement-dashboard/?token=YOUR_ROBOT_TOKEN"
```

Expected responses:
- Queue status: Shows next posts, last posted
- Dashboard: Shows today's engagement counts, stats

### Step 3: Monitor First 24 Hours

- Check cron logs in Vercel dashboard
- Verify Instagram post posted at 10 AM UTC
- Verify Twitter post posted at 3 AM UTC
- Verify engagement happened (4-hour cycle)
- Monitor error logs for issues

---

## Post-Deployment Monitoring

### Daily (First Week)
1. **Check Vercel logs** - Look for errors
2. **Check posting** - Instagram 3x, Twitter 5x daily
3. **Check engagement** - 6x daily (every 4 hours)
4. **Check Instagram** - Any bot detection warnings?
5. **Check Redis** - Not running out of memory?

### Weekly (After First Week)
1. **Run intelligence dashboard** - Check performance metrics
2. **Review engagement log** - Any unusual patterns?
3. **Check success rates** - Are engagements succeeding?
4. **Monitor daily limits** - Are we hitting caps?

### Monthly
1. **Run Phase 3 optimization** - Update templates/targets
2. **Review top performers** - Which accounts engage best?
3. **Adjust if needed** - Update limits or targets

---

## Monitoring URLs

### Queue Status
Check current posting state:
```
GET https://www.signalpilot.io/api/social/queue-status/?token=ROBOT_TOKEN
```

Response shows:
- Next Instagram/Twitter posts
- Last posted times
- Token expiration
- Recent errors

### Engagement Dashboard
Check engagement performance:
```
GET https://www.signalpilot.io/api/social/engagement-dashboard/?token=ROBOT_TOKEN
```

Response shows:
- Today's engagement counts vs limits
- Historical stats (past 7 days)
- Top performing targets
- Recent errors

### Intelligence Dashboard (After 2+ weeks)
Check AI recommendations:
```
GET https://www.signalpilot.io/api/social/intelligence-dashboard/?token=ROBOT_TOKEN&days=14
```

Response shows:
- Top templates by performance
- Top accounts by engagement
- Success rates
- Optimization recommendations

### Optimization Analyzer
See what could be improved:
```
GET https://www.signalpilot.io/api/social/optimize-engagement?action=analyze&token=ROBOT_TOKEN
```

---

## Rollback Plan

If issues occur, you have several options:

### Option 1: Pause Engagement (Recommended)
Keeps posting running, stops engagement:

```bash
# Edit data/social/engagement-config.json
{
  "enabled": false,   # Set to false
  ...
}
```
Then redeploy. Takes effect immediately.

### Option 2: Pause Everything
Stop all posting and engagement:

Call API:
```
POST https://www.signalpilot.io/api/social/pause?token=ROBOT_TOKEN&platform=instagram
POST https://www.signalpilot.io/api/social/pause?token=ROBOT_TOKEN&platform=twitter
```

Or edit config:
```json
{
  "instagram": { "enabled": false },
  "twitter": { "enabled": false }
}
```

### Option 3: Full Rollback
If something is critically broken:

```bash
# Revert to previous commit
git revert HEAD

# Or reset to stable version
git reset --hard origin/main

# Redeploy
vercel --prod
```

---

## Troubleshooting

### Instagram Not Posting
**Error:** "Instagram API error 2: OAuthException"
**Cause:** Token expired or invalid
**Fix:** Token auto-refreshes daily at 3 AM UTC. If still failing after 24h, generate new token

**Check:**
```
GET https://www.signalpilot.io/api/social/diagnose/?token=ROBOT_TOKEN
```

### Twitter Not Posting
**Error:** "Invalid credentials" or 401 errors
**Cause:** API credentials wrong or revoked
**Fix:** Verify credentials in Vercel env vars match Twitter app settings

### Engagement Not Running
**Error:** No engagement logs appearing
**Cause:** Either disabled in config, or cron not running
**Fix:**
1. Check `engagement-config.json` has `"enabled": true`
2. Check Vercel cron logs for `/api/social/cron-engage` errors

### Bot Detection / Action Block
**Symptom:** Instagram not accepting likes/comments
**Cause:** Engagement rate too high or account flagged
**Fix:**
1. Pause engagement for 24-48 hours
2. Reduce daily limits in config
3. Change comment templates
4. Shift active hours

---

## Performance Expectations

### Posting
- Instagram: 3 posts/day, 30 slides total
- Twitter: 5 threads/day, 20-30 tweets total
- Success rate: >95%

### Engagement
- Instagram: ~5 engagements per 4-hour cycle
- Twitter: ~10 engagements per 4-hour cycle
- Success rate: >85%

### API Response Times
- Queue status: 100-200ms
- Engagement: 500-1000ms
- Dashboard: 200-500ms

### Resource Usage
- Redis memory: <5MB
- Vercel compute: ~100ms per cron job
- Daily costs: <$1 (mostly Upstash Redis)

---

## Success Metrics

### Week 1
- ✅ All posts published on schedule
- ✅ No Instagram bot warnings
- ✅ Engagement running every 4 hours
- ✅ No critical errors in logs

### Week 2-4
- ✅ Engagement log has 500+ entries
- ✅ Success rate stays >80%
- ✅ No account suspensions
- ✅ Template performance data collected

### Month 2+
- ✅ Run Phase 3 optimization
- ✅ Apply recommendations
- ✅ Engagement quality improving
- ✅ Measurable inbound links/followers

---

## Support & Escalation

### Common Issues

| Issue | Severity | Resolution |
|-------|----------|-----------|
| Post doesn't publish | High | Check token refresh, verify slides exist |
| Engagement not running | High | Check config enabled, verify cron jobs |
| Instagram 429 (rate limit) | Medium | Reduce daily limits, pause for 24h |
| Redis connection error | Critical | Check UPSTASH_REDIS_REST_TOKEN in env |
| Template not randomizing | Low | Restart function, check config syntax |

### Escalation Path
1. Check logs in Vercel dashboard
2. Review ENGAGEMENT_SETUP.md troubleshooting
3. Call relevant API endpoint (/diagnose, /queue-status)
4. Review ENGAGEMENT_AUDIT.md for known issues
5. If critical, disable engagement and investigate

---

## Final Checklist

Before going live:

- [ ] All env vars set in Vercel
- [ ] engagement-config.json reviewed and correct
- [ ] vercel.json has 5 cron jobs
- [ ] ROBOT_TOKEN and CRON_SECRET are unique
- [ ] First post and engagement scheduled correctly
- [ ] Monitoring URLs verified working
- [ ] Rollback plan documented
- [ ] Team notified of deployment
- [ ] Monitoring alerts configured (optional)
- [ ] First 24-hour monitoring plan ready

---

## Go-Live

**Status:** ✅ READY

System is production-ready and approved for deployment.

**Deployment Timestamp:** 2026-02-22
**Expected Cron Start:** Within 5 minutes of Vercel deployment
**First Instagram Post:** Today 10 AM UTC (if scheduled)
**First Engagement:** Within 4 hours of deployment

Monitor closely for first 24 hours. System should run autonomously after that.

---

**Questions?** See ENGAGEMENT_SETUP.md or ENGAGEMENT_AUDIT.md for details.
