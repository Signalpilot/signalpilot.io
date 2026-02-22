# 🤖 Auto-Engagement System Setup Guide

Complete guide for setting up Instagram and Twitter auto-engagement (likes, comments, replies) with cron automation, analytics, and automatic retry system.

## Overview

The engagement system provides three main features:

1. **Manual Engagement API**: Manually trigger likes/comments/replies
2. **Automated Engagement (Cron)**: Automatic engagement every 4 hours
3. **Analytics Dashboard**: View engagement stats and performance
4. **Auto-Retry System**: Automatically retry failed engagements

---

## Quick Start

### 1. Configure Engagement Targets

Edit `data/social/engagement-config.json`:

```json
{
  "enabled": true,
  "instagram": {
    "enabled": true,
    "likeDaily": 50,
    "commentDaily": 10,
    "targets": [
      {
        "type": "account",
        "value": "trading_psychology",
        "priority": 1
      },
      {
        "type": "hashtag",
        "value": "trading",
        "priority": 2
      }
    ],
    "commentTemplates": [
      "Great insight! 🔥",
      "This is gold 💎",
      "Well said 👏"
    ]
  },
  "twitter": {
    "enabled": true,
    "likeDaily": 100,
    "replyDaily": 20,
    "searchQueries": [
      "trading tips -filter:retweets",
      "market analysis -filter:retweets"
    ],
    "replyTemplates": [
      "Great thread! 🔥",
      "Love this take 💯"
    ]
  }
}
```

### 2. Test Manually (Before Automation)

**Test Instagram Like:**
```bash
curl "https://www.signalpilot.io/api/social/engage-instagram/?action=like&target=trading_psychology&token=YOUR_TOKEN"
```

**Test Twitter Like:**
```bash
curl "https://www.signalpilot.io/api/social/engage-twitter/?action=like&target=trading%20tips&token=YOUR_TOKEN"
```

### 3. View Your Stats

```bash
curl "https://www.signalpilot.io/api/social/engagement-dashboard/?token=YOUR_TOKEN" | jq .
```

### 4. Enable Cron Automation (Vercel)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/social/cron-engage",
      "schedule": "0 */4 * * *"
    },
    {
      "path": "/api/social/cron-engage-retry",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

This runs:
- **Auto-engage**: Every 4 hours (picks random target, likes posts)
- **Auto-retry**: Every 10 minutes (retries failed engagements with backoff)

---

## API Reference

### Manual Engagement Endpoints

#### Instagram Like
```
GET /api/social/engage-instagram
?action=like
&target=USERNAME or hashtag:HASHTAG
&token=ROBOT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "action": "like",
  "mediaId": "18053669486476960",
  "caption": "Moving Averages: Crossovers",
  "likeCount": 15,
  "dailyLimit": 50
}
```

#### Instagram Comment
```
GET /api/social/engage-instagram
?action=comment
&mediaId=MEDIA_ID
&text=COMMENT_TEXT
&token=ROBOT_TOKEN
```

#### Twitter Like
```
GET /api/social/engage-twitter
?action=like
&target=SEARCH_QUERY or user:USERNAME
&token=ROBOT_TOKEN
```

#### Twitter Reply
```
GET /api/social/engage-twitter
?action=reply
&target=SEARCH_QUERY or user:USERNAME
&text=REPLY_TEXT
&token=ROBOT_TOKEN
```

### Configuration Management

#### View Config & Today's Stats
```
GET /api/social/engagement-config/?action=status&token=ROBOT_TOKEN
```

#### Enable/Disable Engagement
```
POST /api/social/engagement-config/?action=enable&token=ROBOT_TOKEN
```

```json
{
  "instagram": true,
  "twitter": true
}
```

#### Update Config
```
POST /api/social/engagement-config/?action=update&token=ROBOT_TOKEN
```

```json
{
  "instagram": {
    "likeDaily": 75,
    "targets": [...]
  },
  "twitter": {
    "searchQueries": [...]
  }
}
```

### Analytics Dashboard

```
GET /api/social/engagement-dashboard/?token=ROBOT_TOKEN&days=7
```

**Returns:**
- Today's engagement stats (with % of daily limit used)
- Historical stats for past N days
- Top performing targets
- Recent engagement log
- Error log
- Current config

### Cron Endpoints (Called Automatically)

#### Auto-Engage
```
POST /api/social/cron-engage?token=CRON_SECRET
```

Automatically:
1. Picks random Instagram target (50% chance for account, 50% for hashtag)
2. Fetches recent posts from target
3. Likes one random post
4. Picks random Twitter search query
5. Searches for tweets
6. Likes one random tweet
7. Respects daily limits

#### Auto-Retry
```
POST /api/social/cron-engage-retry?token=CRON_SECRET
```

Processes failed engagements:
1. Gets all failed engagement attempts
2. Retries with exponential backoff:
   - 1st retry: 5 seconds
   - 2nd retry: 15 seconds
   - 3rd retry: 45 seconds
3. Max 3 retries per target
4. Removes from queue on success
5. Logs all attempts

### Retry Queue Status
```
GET /api/social/engagement-retry-status?token=ROBOT_TOKEN
```

Shows:
- Queue size
- Items ready for retry
- Recent retry attempts

---

## Configuration Deep Dive

### Daily Limits

```json
{
  "instagram": {
    "likeDaily": 50,        // Max likes per day
    "commentDaily": 10      // Max comments per day
  },
  "twitter": {
    "likeDaily": 100,       // Max likes per day
    "replyDaily": 20        // Max replies per day
  }
}
```

**Why these limits?**
- Avoids bot detection (too much engagement = flag)
- Safe engagement rate (humans engage 10-50x per day max)
- Sustainable over long term

### Targets & Search Queries

**Instagram Targets:**
```json
{
  "targets": [
    {
      "type": "account",
      "value": "trading_psychology",
      "priority": 1
    },
    {
      "type": "hashtag",
      "value": "trading",
      "priority": 2
    }
  ]
}
```

**Twitter Search Queries:**
```json
{
  "searchQueries": [
    "trading tips -filter:retweets",
    "market analysis -filter:retweets",
    "from:@trader_username"
  ]
}
```

### Rate Limiting

```json
{
  "rateLimiting": {
    "instagramRequestsPerMinute": 20,
    "twitterRequestsPerMinute": 60,
    "minDelayBetweenActionsSec": 5,
    "maxDelayBetweenActionsSec": 30
  }
}
```

### Safety Settings

```json
{
  "safety": {
    "maxEngagementPerAccount": 3,    // Only like 3 posts per account max
    "skipSuspiciousAccounts": true,  // Skip new/bot-like accounts
    "skipNewAccounts": true,         // Skip accounts <30 days old
    "minFollowersThreshold": 100,    // Only engage with 100+ followers
    "pauseOnErrors": true,           // Auto-pause if 5+ errors
    "maxErrorsBeforePause": 5
  }
}
```

### Active Hours

```json
{
  "scheduling": {
    "activeHours": [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    "timezone": "UTC",
    "pauseOnWeekends": false,
    "pauseDates": ["2026-12-25", "2026-01-01"]
  }
}
```

Only engages during these hours (UTC).

### Comment Templates

```json
{
  "instagram": {
    "commentTemplates": [
      "🔥 Love this perspective",
      "This is gold 💎",
      "Great insight!",
      "Well said 👏"
    ]
  },
  "twitter": {
    "replyTemplates": [
      "Great thread! 🔥",
      "This is the way 📈",
      "Love this take 💯",
      "Well articulated 👏"
    ]
  }
}
```

Random template is selected for each engagement (avoids spam detection).

---

## Monitoring & Troubleshooting

### Check Daily Progress

```bash
# View dashboard
curl "https://www.signalpilot.io/api/social/engagement-dashboard/?token=TOKEN" | jq '.today'
```

Output:
```json
{
  "instagram": {
    "likes": {
      "count": 23,
      "limit": 50,
      "remaining": 27,
      "percentUsed": 46
    },
    "comments": {
      "count": 4,
      "limit": 10,
      "remaining": 6,
      "percentUsed": 40
    }
  },
  "twitter": {
    "likes": {
      "count": 45,
      "limit": 100,
      "remaining": 55,
      "percentUsed": 45
    }
  }
}
```

### Check Retry Queue

```bash
curl "https://www.signalpilot.io/api/social/engagement-retry-status/?token=TOKEN"
```

Shows pending retries and next attempt times.

### View Recent Errors

```bash
curl "https://www.signalpilot.io/api/social/engagement-dashboard/?token=TOKEN" | jq '.recentErrors | .[0:5]'
```

### View Top Performing Targets

```bash
curl "https://www.signalpilot.io/api/social/engagement-dashboard/?token=TOKEN" | jq '.topTargets'
```

Shows which accounts/queries get most engagement.

---

## Best Practices

### Starting Out
1. **Test manually** for 1-2 days with low limits (10 likes/day)
2. **Review errors** - fix any API permission issues
3. **Monitor engagement** - check if likes/comments are being posted
4. **Check response** - do people reply/follow? Adjust targets if not

### Day 2-7
1. **Increase limits gradually** (20 → 35 → 50 likes/day)
2. **Add new targets** as you identify high-engagement accounts
3. **Monitor for detection** - watch for rate limits (429 responses)
4. **Analyze performance** - which targets drive most engagement?

### Week 2+
1. **Optimize templates** - adjust comment text based on engagement
2. **Rotate targets** - add new accounts monthly
3. **Monitor quality** - ensure followers are real, not bots
4. **Scale safely** - increase limits only if no detection signs

### ⚠️ Red Flags
- **429 Too Many Requests**: API rate limit hit
- **Invalid token error**: Token expired, needs refresh
- **Account appears shadowbanned**: Stop engagement for 48h
- **Followers dropping**: Likely bot account engagement

---

## Troubleshooting

### "Instagram API error 2: OAuthException"
**Cause:** Expired or invalid token
**Fix:** Run token refresh via `/api/social/refresh-ig-token`

### "Failed to fetch posts: Could not find account"
**Cause:** Username doesn't exist or is private
**Fix:** Check username is public, update config

### "Daily like limit reached"
**Cause:** Already at limit
**Fix:** Increase `likeDaily` limit in config, or wait for daily reset (UTC midnight)

### "All posts from target already liked"
**Cause:** Already engaged with all recent posts
**Fix:** Add more targets to config, or wait for target to post new content

### Cron not running?
**Check:**
1. Vercel cron is configured in `vercel.json`
2. `CRON_SECRET` env var is set in Vercel
3. Deployed latest code
4. Check Vercel logs for errors

---

## Performance Tips

### Reduce API Calls
```json
{
  "instagram": {
    "targets": [
      {"type": "account", "value": "high_engagement_account"}
    ]
  }
}
```

Use 2-3 top accounts instead of many low-quality targets.

### Optimize Search Queries
```json
{
  "searchQueries": [
    "trading tips lang:en -filter:retweets",
    "market analysis -filter:replies"
  ]
}
```

Better queries = fewer API calls needed to find good content.

### Adjust Cron Schedule
```json
{
  "crons": [
    {
      "path": "/api/social/cron-engage",
      "schedule": "0 8,12,16,20 * * *"
    }
  ]
}
```

Less frequent = fewer API calls, less risk of detection.

---

## Security Notes

- **ROBOT_TOKEN** used for manual API calls
- **CRON_SECRET** used for automated cron jobs
- Never commit tokens to git
- Tokens are stored in Vercel environment variables
- All engagement logged for audit trail

---

## Next Steps

1. **Enable in production** after 3-5 days of manual testing
2. **Monitor engagement metrics** daily for first 2 weeks
3. **Adjust templates** based on performance
4. **Expand targets** as you find high-engagement accounts
5. **Track ROI** - measure follows/messages from engaged accounts

---

## Support

- Check `/api/social/engagement-dashboard` for detailed stats
- Review error logs for API issues
- Test endpoints manually before enabling cron
- Monitor Vercel logs for any serverless function errors
