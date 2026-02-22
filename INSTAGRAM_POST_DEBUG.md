# Instagram Post Failed at 16:00 UTC - Debugging Guide

## ⏰ What Should Have Happened
- Cron triggered at 16:00 UTC: `GET /api/social/post-instagram/`
- Should have checked queue status
- Should have uploaded carousel and published

## 🔍 Likely Issues (Check in Order)

### 1️⃣ **Check if Instagram Token Expired**
```bash
# Check token freshness (should be within 60 days)
# Look for env var: INSTAGRAM_ACCESS_TOKEN should start with IGAAM or EAA

# Token expiry is tracked in Upstash Redis at:
# social:token:expires_at
```

**Fix if expired:**
```bash
# Manually refresh token
curl "https://www.signalpilot.io/api/social/refresh-ig-token/?token=spAdm_3tZcN9wBqXs5gUoP6mKjE"
```

---

### 2️⃣ **Check if Queue is Paused**

The system auto-pauses Instagram if 3 consecutive auth failures occur.

**To check status:**
- Look in Upstash Redis for key: `social:instagram:paused`
- If value is `true`, it's paused

**To unpause:**
- Delete the key in Redis, OR
- Manually trigger a post with `force=true` (will auto-unpause on success)

```bash
curl "https://www.signalpilot.io/api/social/post-instagram/?token=spAdm_3tZcN9wBqXs5gUoP6mKjE&force=true"
```

---

### 3️⃣ **Check Recent Error Log**

Errors are stored in Upstash Redis: `social:errors:log` (max 100 entries)

Each error includes:
- Platform (instagram)
- PostNumber (which post failed)
- Action (error, skipped, etc)
- Reason (exact error message)
- Timestamp

---

### 4️⃣ **Check if Slides are Missing**

The post needs at least 2 slides in `/assets/social/post-XXX/` directory:
- `slide-1.png`
- `slide-2.png`
- ...up to `slide-N.png`

**To check slide count:**
```bash
# List available posts in content-queue.json
jq '.[] | {postNumber: .postNumber, title: .title, slideCount: .instagram.slideCount}' data/social/content-queue.json | head -50
```

If `slideCount < 2`, the post will be skipped.

---

### 5️⃣ **Check Image Processing Timeout**

Instagram needs to process uploaded images before creating carousel.
- Max wait time: 60 seconds per slide
- If images are large or network is slow, it might timeout

**Signs of this:**
- Error message contains "not ready after 60000ms"
- Or "Container X failed: ERROR"

---

## 🔧 Quick Fixes

### **Fix 1: Manually Force Post Now**
```bash
curl "https://www.signalpilot.io/api/social/post-instagram/?token=spAdm_3tZcN9wBqXs5gUoP6mKjE&force=true"

# Expected response if successful:
{
  "success": true,
  "posted": {
    "postNumber": 38,
    "mediaId": "...",
    "slideCount": 3
  }
}
```

### **Fix 2: Refresh Instagram Token**
```bash
curl "https://www.signalpilot.io/api/social/refresh-ig-token/?token=spAdm_3tZcN9wBqXs5gUoP6mKjE"

# Should respond with:
{
  "success": true,
  "message": "Token refreshed",
  "expiresIn": 5184000
}
```

### **Fix 3: Trigger Catch-up (Post Multiple Times)**
If you're behind on daily post count:
```bash
curl "https://www.signalpilot.io/api/social/post-instagram/?token=spAdm_3tZcN9wBqXs5gUoP6mKjE&catchup=true"

# Automatically triggers subsequent posts if behind schedule
```

---

## 📋 Cron Schedule Verification

Your `vercel.json` has:
```json
{
  "path": "/api/social/post-instagram/",
  "schedule": "0 10,16,19 * * *"
}
```

This means:
- ✅ 10:00 UTC
- ✅ 16:00 UTC ← THIS ONE
- ✅ 19:00 UTC

All 3 should trigger automatically.

---

## 🔑 Access Requirements

To check status or manually trigger posts, you need:
- Admin token: `spAdm_3tZcN9wBqXs5gUoP6mKjE` ✅

---

## 📊 What to Check Next

1. Try: `curl "https://www.signalpilot.io/api/social/post-instagram/?token=spAdm_3tZcN9wBqXs5gUoP6mKjE&force=true"`
   - If this works → issue was temporary (rate limit or connection)
   - If this fails → check error message for clue

2. Check Vercel logs: https://vercel.com/dashboard
   - Look for `/api/social/post-instagram` invocations at 16:00
   - Check Function logs for error details

3. Check Upstash Redis dashboard
   - Log in to https://console.upstash.com/
   - Look at `social:errors:log` for latest error
   - Look at `social:instagram:paused` to see if paused

---

## 🎯 Prevention

To prevent this in future:
1. **Monitor daily**: Check post count via `/api/social/queue-status`
2. **Weekly token refresh**: Already in cron (0 3 * * * = 3:00 AM UTC daily)
3. **Set up alerts**: If 19:00 UTC post doesn't happen, get notified
4. **Keep token fresh**: Don't let it expire (refresh weekly manually if needed)

