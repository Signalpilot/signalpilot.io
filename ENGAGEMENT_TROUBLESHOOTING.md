# Engagement System Troubleshooting Guide

## 🚨 Current Status: ENGAGEMENT NOT WORKING

The engagement system (likes, comments, replies) is **configured but failing** due to API credential issues.

---

## ❌ Problems Detected

### **Problem 1: Instagram API - Permission Denied** 📷

```
Error: "Unsupported get request. Object with ID '1253125976773301' 
       does not exist, cannot be loaded due to missing permissions"
```

**What's happening:**
- Instagram token doesn't have permission to discover/access target accounts
- Can't fetch posts from `@tradingview`, `@investopedia`, etc.
- Engagement fails silently every 4 hours

**Root cause:**
- Token may be missing required permissions (`instagram_basic`, `pages_read_engagement`)
- OR token was revoked/expired
- OR account setup is incorrect

---

### **Problem 2: Twitter API - Invalid Request** 🐦

```
Error: "Invalid Request: One or more parameters to your request was invalid"
       (HTTP 400)
```

**What's happening:**
- Twitter API request is malformed OR credentials are invalid
- Can't search for tweets or send replies
- Engagement fails silently every 4 hours

**Root cause:**
- Twitter API credentials in Vercel may be incorrect/expired
- OR API v2 isn't enabled on developer account
- OR search query syntax is invalid

---

## 🔧 How to Diagnose

### **Step 1: Run the Production Diagnostic**

```bash
curl "https://www.signalpilot.io/api/social/api-diagnostic?token=c7f3a2b8e9d1f4c6a5b3e2d9f1a8c4b7" | jq '.'
```

This will show you:
- ✅ Instagram token validity and account info
- ✅ Twitter API credentials status
- ✅ Account access and permissions
- ✅ Detailed error messages

**Expected output** (if working):
```json
{
  "success": true,
  "summary": {
    "instagram": "WORKING",
    "twitter": "WORKING"
  },
  "diagnostics": {
    "instagram": {
      "tokenValid": true,
      "accountInfo": { ... }
    },
    "twitter": {
      "v1ApiValid": true,
      "accountInfo": { ... }
    }
  }
}
```

---

## 🔑 Fix Steps

### **For Instagram (If it fails):**

**Option A: Regenerate Token** (Recommended)

1. Go to **Facebook Developer Dashboard**: https://developers.facebook.com/
2. Navigate to your app → Settings → Basic
3. Go to **Tools** → **Token Tool**
4. Find your Instagram business account token
5. Click "Refresh Token" if it's expiring soon
6. Copy the new token
7. Update in Vercel:
   - Go to **Vercel Dashboard** → **Project Settings** → **Environment Variables**
   - Update `INSTAGRAM_ACCESS_TOKEN` with the new token
   - Redeploy

**Option B: Check Permissions**

1. In Facebook Developer Console, go to your app
2. Check **Roles** → Add your account if missing
3. Check the token has these permissions:
   - `instagram_basic`
   - `pages_read_engagement`
   - `pages_read_user_content`
   - `instagram_graph_user_media`

**Option C: Test with a Different Target Account**

1. Edit `/data/social/engagement-config.json`
2. Replace `@tradingview` with a different public account you can access
3. Test if it works with the new target

---

### **For Twitter (If it fails):**

**Step 1: Verify API Keys**

1. Go to **Twitter Developer Portal**: https://developer.twitter.com/
2. Go to **Projects & Apps** → Your Project
3. Check that you have:
   - API Key (create if missing)
   - API Key Secret (create if missing)
   - Access Token (create if missing)
   - Access Token Secret (create if missing)

4. Verify API v2 is enabled:
   - Go to **Project Settings** → **API Setup**
   - Check "Elevated" or higher tier

**Step 2: Update Vercel Credentials**

1. Go to **Vercel Dashboard** → **Project Settings** → **Environment Variables**
2. Update these with fresh values from Twitter Developer Console:
   - `TWITTER_API_KEY`
   - `TWITTER_API_SECRET`
   - `TWITTER_ACCESS_TOKEN`
   - `TWITTER_ACCESS_SECRET`

3. For API v2 (optional but recommended):
   - Add `TWITTER_BEARER_TOKEN` if available
   - Get it from **Credentials** tab → **Bearer Token**

4. **Redeploy** the project in Vercel

**Step 3: Test the Connection**

```bash
# Run diagnostic again
curl "https://www.signalpilot.io/api/social/api-diagnostic?token=c7f3a2b8e9d1f4c6a5b3e2d9f1a8c4b7" | jq '.diagnostics.twitter'
```

---

## ✅ Verification Steps

After fixing the credentials:

**1. Run diagnostic endpoint:**
```bash
curl "https://www.signalpilot.io/api/social/api-diagnostic?token=c7f3a2b8e9d1f4c6a5b3e2d9f1a8c4b7" | jq '.'
```

**2. Manually trigger engagement:**
```bash
curl "https://www.signalpilot.io/api/social/cron-engage/?token=c7f3a2b8e9d1f4c6a5b3e2d9f1a8c4b7&force=true" | jq '.'
```

**Expected response** (if fixed):
```json
{
  "success": true,
  "engagementCount": 8,
  "likeCount": 6,
  "commentCount": 2
}
```

**3. Check your Instagram/Twitter:**
- You should see new likes/comments appearing within 5 minutes

---

## 🚀 Prevention

Once fixed:

1. **Monitor weekly**: Check dashboard for engagement activity
2. **Rotate credentials quarterly**: Refresh tokens before they expire
3. **Set up alerts**: If engagement drops to 0 for 24+ hours, investigate
4. **Test monthly**: Run the diagnostic endpoint to catch issues early

---

## 📋 Checklist

- [ ] Run diagnostic endpoint to identify exact issue
- [ ] Regenerate Instagram token OR check permissions
- [ ] Verify Twitter API credentials in developer portal
- [ ] Update credentials in Vercel environment variables
- [ ] Redeploy Vercel project
- [ ] Run diagnostic endpoint again to verify
- [ ] Manually trigger engagement to test
- [ ] Check Instagram/Twitter for activity
- [ ] Monitor for 24 hours to ensure it's working

---

## 📞 Support

If you're stuck:

1. **Check the diagnostic output carefully** - it will tell you exactly what's wrong
2. **Look for specific error codes/messages** in the response
3. **Verify credentials are copied correctly** (no spaces, exact format)
4. **Check Vercel deployment log** for any errors during redeploy
5. **Test with a simple target** - try a large public account first

---

## Quick Reference

| Issue | Likely Cause | Fix |
|-------|--------------|-----|
| "Permission denied" (Instagram) | Token missing perms | Regenerate token in FB dev console |
| "Invalid Request" (Twitter) | Bad credentials | Verify API keys in Twitter console |
| "Unsupported get request" (Instagram) | Wrong account ID | Check INSTAGRAM_BUSINESS_ACCOUNT_ID |
| No engagement after fix | Still using old creds | Clear Vercel cache and redeploy |
| Token expired error | Token > 60 days old | Refresh token immediately |

