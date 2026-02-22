# Engagement System Verification Guide

## ✅ Current Status: ALL SYSTEMS GO

Your engagement (likes, comments, replies) is fully configured and running automatically:

---

## 📊 What's Currently Set Up

### **Instagram Engagement**
- **Daily Limits**: 30 likes + 5 comments
- **Active Hours**: 8 AM - 9 PM UTC (US trading hours)
- **Targets**: 
  - 3 trading accounts: `@investopedia`, `@stockmarkettoday`, `@tradingview`
  - 3 hashtags: `#trading`, `#daytrading`, `#stockstowatch`
- **Comment Templates**: 8 pre-written comments
  - "This is the move"
  - "Exactly right"
  - "100% agree"
  - "Chart doesn't lie"
  - etc.

### **Twitter Engagement**
- **Daily Limits**: 75 likes + 15 replies
- **Active Hours**: 8 AM - 9 PM UTC
- **Targets**: 3 trading accounts
- **Reply Templates**: 7 pre-written replies
  - "This is it"
  - "Structure wins"
  - "Facts"
  - etc.

---

## 🤖 How It Works (Automatically)

### **Cron Jobs Running:**

| Job | Schedule | What It Does |
|-----|----------|-------------|
| `cron-engage` | Every 4 hours | Discovers targets, sends likes/comments |
| `cron-engage-retry` | Every 10 minutes | Retries failed engagements |

**Timeline example:**
```
00:00 → Engagement runs (finds targets, sends likes/comments)
04:00 → Engagement runs again
08:00 → Engagement runs again
Every 10 min → Retry any failed actions from previous runs
```

### **Safety Features:**
- ✅ Max 3 actions per account (prevent spam)
- ✅ Min 100 followers (skip new/suspicious accounts)
- ✅ Rate limiting (20 req/min Instagram, 60 req/min Twitter)
- ✅ Skip promotional content
- ✅ Respects active hours only (8 AM - 9 PM UTC)

---

## 🧪 How to Test It's Working

### **Option 1: Manually Trigger Engagement NOW**

```bash
curl "https://www.signalpilot.io/api/social/cron-engage/?token=spAdm_3tZcN9wBqXs5gUoP6mKjE&force=true"
```

**Expected response** (if working):
```json
{
  "success": true,
  "engagementCount": 8,
  "likeCount": 6,
  "commentCount": 2,
  "retry": {
    "queued": 0,
    "completed": 0
  }
}
```

✅ If you see numbers > 0, it's working!

---

### **Option 2: Check Recent Activity (Last 7 Days)**

```bash
curl "https://www.signalpilot.io/api/social/engagement-dashboard?token=spAdm_3tZcN9wBqXs5gUoP6mKjE"
```

**What to look for:**
```json
{
  "instagramLikesToday": 12,
  "instagramCommentsToday": 3,
  "twitterLikesToday": 25,
  "twitterRepliesToday": 5,
  "dayStats": [
    {
      "date": "2026-02-22",
      "instagram": { "likes": 28, "comments": 5 },
      "twitter": { "likes": 70, "replies": 12 }
    }
  ]
}
```

✅ If numbers are > 0, engagement is happening!

---

### **Option 3: Check Your Instagram/Twitter Directly**

1. Go to your **Instagram activity** → Recent likes/comments
   - You should see likes appearing every few hours
   - Comments should appear 1-2 times per day

2. Go to your **Twitter notifications**
   - You should see replies appearing regularly

---

## 📈 Expected Activity Pattern

**If working correctly, you should see:**

| Metric | Expected | Daily | Weekly |
|--------|----------|-------|--------|
| Instagram likes | 30/day | 30 | 210 |
| Instagram comments | 5/day | 5 | 35 |
| Twitter likes | 75/day | 75 | 525 |
| Twitter replies | 15/day | 15 | 105 |

---

## 🔍 How to Tell It's NOT Working

### **Red Flags:**

❌ **No activity for 24+ hours**
- Check: Is it within active hours? (8 AM - 9 PM UTC)
- Check: Did engagement get paused due to errors?
- Solution: Trigger manually or check error logs

❌ **"Error: Token invalid"**
- Instagram token may have expired
- Solution: `curl "https://www.signalpilot.io/api/social/refresh-ig-token/?token=spAdm_3tZcN9wBqXs5gUoP6mKjE"`

❌ **"Max retries exceeded"**
- Too many consecutive failures
- Solution: Check error logs, investigate cause, reset retry count

---

## 📋 Quick Diagnostics

### **Check if paused:**
```bash
# Query Redis (via production endpoint)
curl "https://www.signalpilot.io/api/social/queue-status?token=spAdm_3tZcN9wBqXs5gUoP6mKjE"

# Look for: "paused": true or "isPaused": true
```

### **Check retry queue:**
```bash
# Get pending retries
curl "https://www.signalpilot.io/api/social/engagement-retry-status?token=spAdm_3tZcN9wBqXs5gUoP6mKjE"

# Should show: "pending": 0 (or whatever is queued)
```

### **Check error log:**
```bash
# Last 20 errors
curl "https://www.signalpilot.io/api/social/queue-status?token=spAdm_3tZcN9wBqXs5gUoP6mKjE" | jq '.recentErrors'
```

---

## 🎯 What's NOT Included (Yet)

The engagement system sends generic comments/replies from pre-written templates.

**What we COULD add** (see ENHANCEMENTS_GUIDE.md):
- 🧪 **A/B Testing**: Test different templates
- 🔗 **Causal Inference**: See which actions lead to follows/DMs
- 📊 **Competitor Benchmarking**: Compare engagement metrics
- 🎪 **Multi-Account**: Coordinate across multiple accounts

---

## ✨ Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Configuration | ✅ | All targets and templates set |
| Cron scheduling | ✅ | Every 4 hours + retry every 10 min |
| Safety limits | ✅ | Rate limits, account filtering, active hours |
| Templates | ✅ | 8 Instagram + 7 Twitter templates ready |
| Error handling | ✅ | Auto-retry on failure, pause on repeated errors |
| Monitoring | ✅ | Logs all activity and errors |

**Result: Fully automated engagement running 24/7 within configured limits** 🚀

---

## 🚀 Next Steps

1. **Verify it's working**: Run the manual trigger above
2. **Monitor for 24 hours**: Check your Instagram/Twitter for activity
3. **Review templates** (optional): Edit if you want different comments
4. **Add enhancements** (optional): Set up A/B testing or causal analysis

