# Instagram API Token Permissions Check Guide

This guide explains how to verify the current permissions of the Instagram API access token used by signalpilot.io for posting carousels to Instagram.

## Overview

The SignalPilot application uses the Instagram Graph API (or Facebook Graph API depending on token type) to:
- Create carousel containers
- Upload slide images
- Publish posts to Instagram

The token is stored securely in Vercel environment variables and must have appropriate permissions for these actions.

---

## Token Location & Management

**Environment Variable:** `INSTAGRAM_ACCESS_TOKEN`
**Stored In:** Vercel Production Environment Variables
**Refresh Schedule:** Daily at 3 AM UTC (via `/api/social/refresh-ig-token` cron job)
**Related Config:** 
- `INSTAGRAM_BUSINESS_ACCOUNT_ID` - The IG account/page ID for posting
- `FACEBOOK_APP_ID` - For token refresh flow
- `FACEBOOK_APP_SECRET` - For token refresh flow

---

## Token Type Detection

The application automatically detects the token type based on its prefix:

### IGAAM Tokens (Instagram Login - Native Instagram Graph API)
- **Prefix:** `IGAAM...` or `IGQVJ...`
- **Graph Base:** `https://graph.instagram.com/v21.0`
- **Refresh Flow:** `grant_type=ig_refresh_token`
- **Scopes typically include:**
  - `instagram_business_basic`
  - `instagram_business_content_publish`
  - `instagram_business_manage_comments`
  - `instagram_business_manage_messages`

### EAA Tokens (Facebook Login - Facebook Graph API)
- **Prefix:** `EAA...`
- **Graph Base:** `https://graph.facebook.com/v21.0`
- **Refresh Flow:** `grant_type=fb_exchange_token`
- **Scopes typically include:**
  - `pages_read_engagement`
  - `pages_manage_engagement`
  - `pages_manage_posts`
  - `instagram_basic`
  - `instagram_manage_insights`
  - `instagram_content_publish`

---

## API Calls to Check Token Permissions

### 1. Check Token Validity & User Info

**Endpoint:** `GET /me`

**Instagram API (IGAAM tokens):**
```bash
curl -X GET \
  "https://graph.instagram.com/v21.0/me?fields=id,name,username,biography,website&access_token=YOUR_TOKEN"
```

**Facebook API (EAA tokens):**
```bash
curl -X GET \
  "https://graph.facebook.com/v21.0/me?fields=id,name,email&access_token=YOUR_TOKEN"
```

**Response Example:**
```json
{
  "id": "17841401234567890",
  "name": "SignalPilot",
  "username": "signalpilot"
}
```

---

### 2. Check Token Scopes & Permissions

**Endpoint:** `GET /me?permissions`

This is the PRIMARY way to check what permissions the token currently has.

**Call:**
```bash
curl -X GET \
  "https://graph.facebook.com/v21.0/me?permissions&access_token=YOUR_TOKEN"
```

**Response Example:**
```json
{
  "data": [
    {
      "permission": "instagram_basic",
      "status": "granted"
    },
    {
      "permission": "instagram_content_publish",
      "status": "granted"
    },
    {
      "permission": "pages_manage_posts",
      "status": "granted"
    },
    {
      "permission": "pages_read_engagement",
      "status": "granted"
    }
  ]
}
```

---

### 3. Check Detailed Token Info (Debug Token)

**Endpoint:** `GET /debug_token`

This provides detailed metadata about the token including expiration, app ID, and all scopes.

**Call:**
```bash
curl -X GET \
  "https://graph.instagram.com/v21.0/debug_token?input_token=YOUR_TOKEN&access_token=YOUR_TOKEN"
```

**Response Example:**
```json
{
  "data": {
    "app_id": "1234567890123456",
    "type": "USER",
    "application": "Signal Pilot",
    "data_access_expires_at": 1716086400,
    "expires_at": 1716086400,
    "is_valid": true,
    "issued_at": 1708390400,
    "scopes": [
      "instagram_business_basic",
      "instagram_business_content_publish",
      "instagram_business_manage_comments",
      "instagram_business_manage_messages"
    ],
    "user_id": "17841401234567890"
  }
}
```

---

## Required Permissions for Carousel Posting

For the application to successfully post carousels, the token must have these capabilities:

### Minimum Required Scopes:

| Scope | Purpose | Token Type | Required? |
|-------|---------|-----------|-----------|
| `instagram_business_basic` | Access basic account info | IGAAM | ✅ YES |
| `instagram_business_content_publish` | Create & publish carousels | IGAAM | ✅ YES |
| `instagram_content_publish` | Publish posts (Facebook flow) | EAA | ✅ YES |
| `pages_manage_posts` | Manage page posts | EAA | ✅ YES |
| `instagram_business_manage_comments` | Manage post comments | IGAAM | ⭕ Optional (for future features) |
| `pages_read_engagement` | Read engagement metrics | EAA | ⭕ Optional (for analytics) |

---

## Check Token Expiration

Tokens expire every **60 days**. The application automatically refreshes them daily.

**From debug_token response:**
```
expires_at: 1716086400 (Unix timestamp)
```

**Convert to readable format:**
```bash
date -d @1716086400
# Output: Wed May 29 16:00:00 UTC 2024
```

**Days until expiration:**
```bash
node -e "console.log(Math.round((1716086400 - Math.floor(Date.now()/1000)) / 86400) + ' days')"
```

---

## Using the Built-in Diagnostic Endpoint

The application has a built-in diagnostic endpoint that checks all API credentials:

**Endpoint:** `GET /api/social/diagnose`

**Authentication:** Requires `?token=SOCIAL_ADMIN_TOKEN`

**What it checks:**
1. ✅ All environment variables are set
2. ✅ Redis connection (queue system)
3. ✅ Twitter API credentials
4. ✅ **Instagram API credentials & token expiration**
5. ✅ Queue state (paused/locked)
6. ✅ Next post validation
7. ✅ Recent posting activity

**Response includes:**
```json
{
  "checks": {
    "instagramApi": {
      "status": "PASS",
      "tokenType": "instagram",
      "userId": "17841401234567890",
      "name": "SignalPilot",
      "tokenExpiresAt": "2025-03-22T09:00:00.000Z",
      "resolvedAccountId": "...7890"
    }
  }
}
```

---

## Testing Token Permissions

### Test 1: Verify Token Structure
```bash
# Token should be at least 200+ characters
TOKEN="YOUR_TOKEN"
echo "Token length: ${#TOKEN}"

# Should show prefix
echo "Token prefix: ${TOKEN:0:10}"

# Check for whitespace (should be none)
[[ "$TOKEN" != "$TOKEN" ]] && echo "WARNING: Whitespace detected!"
```

### Test 2: Verify Token with /me endpoint
```bash
curl -s https://graph.facebook.com/v21.0/me?access_token=YOUR_TOKEN | jq .
```

If token is valid, should return user object:
```json
{
  "id": "17841401234567890",
  "name": "SignalPilot"
}
```

If invalid, will return:
```json
{
  "error": {
    "message": "Invalid OAuth access token.",
    "type": "OAuthException",
    "code": 190
  }
}
```

### Test 3: Check Scopes
```bash
curl -s "https://graph.facebook.com/v21.0/me?permissions&access_token=YOUR_TOKEN" | jq '.data[] | select(.status=="granted") | .permission'
```

### Test 4: Check Expiration
```bash
curl -s "https://graph.facebook.com/v21.0/debug_token?input_token=YOUR_TOKEN&access_token=YOUR_TOKEN" | jq '.data.expires_at'
```

---

## Common Permission Issues

### Issue 1: Token Expired
**Symptom:** API returns error code 190 "Invalid OAuth access token"

**Solution:**
- Trigger token refresh: `GET /api/social/refresh-ig-token?token=SOCIAL_ADMIN_TOKEN`
- Verify refresh succeeded and check Vercel env var was updated
- Check `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` are set (for refresh flow)

### Issue 2: Missing Scopes
**Symptom:** API returns error "Insufficient permissions" or "Invalid scopes"

**Solution:**
- Go to Instagram/Facebook App Dashboard
- Navigate to Settings → Basic / App Roles
- Add missing scopes to the app configuration
- Request new token from user with all required scopes
- Update `INSTAGRAM_ACCESS_TOKEN` in Vercel environment

### Issue 3: Wrong Account ID
**Symptom:** API returns error "Invalid Instagram User ID"

**Solution:**
- Verify `INSTAGRAM_BUSINESS_ACCOUNT_ID` matches the actual account
- For IGAAM tokens: Account ID comes from `/me` on graph.instagram.com
- For EAA tokens: Should be the Instagram Business Account or Page ID
- The app automatically resolves this via `resolveAccountId()` function

---

## Token Refresh Process

The application automatically refreshes tokens daily at 3 AM UTC.

**Manual refresh:**
```bash
curl -X POST \
  "https://www.signalpilot.io/api/social/refresh-ig-token?token=SOCIAL_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Token refreshed and auto-updated in Vercel",
  "tokenType": "instagram",
  "expiresInDays": 60,
  "expiresAt": "2025-04-22T09:00:00.000Z"
}
```

**What happens in the refresh process:**
1. Verifies current token is still valid
2. Calls Instagram/Facebook refresh endpoint
3. Gets new token with same scopes
4. Stores expiration time in Redis for monitoring
5. Automatically updates `INSTAGRAM_ACCESS_TOKEN` in Vercel (if credentials available)
6. Logs refresh status to Redis posting log

---

## Monitoring Token Health

**Check status via queue-status endpoint:**
```bash
curl -s "https://www.signalpilot.io/api/social/queue-status?token=SOCIAL_ADMIN_TOKEN" | jq '.instagramTotalPosts, .recentErrors'
```

**Key metrics to monitor:**
- Token expiration date (should be ~60 days from now)
- Recent error count (should be 0)
- Posting success rate (should be high)
- Failed carousel uploads (check error log)

---

## Source Code References

**Token management:**
- `/lib/social/instagram-client.js` - `verifyToken()`, `refreshLongLivedToken()`

**API endpoints:**
- `/api/social/diagnose.js` - Full health check
- `/api/social/refresh-ig-token.js` - Cron-triggered refresh

**Environment variables:**
- Defined in Vercel Project Settings → Environment Variables

---

## Next Steps

1. **Get Token:** Obtain from Vercel Environment Variables dashboard
2. **Test with curl:** Use the calls above to verify permissions
3. **Monitor expiration:** Set calendar reminder for refresh date
4. **Set up monitoring:** Use `/api/social/diagnose` endpoint daily
5. **Automate updates:** Ensure Vercel credentials are configured for auto-refresh

---

*Last updated: 2025-02-22*
*Token Format: v21.0 of Facebook/Instagram Graph API*
