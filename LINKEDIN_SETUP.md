# 🔗 LinkedIn API Setup Guide

This guide walks you through getting LinkedIn API credentials and setting up automated posting to LinkedIn.

## Architecture

```
LinkedIn Post Content
       ↓
LinkedIn Org API
       ↓
Cron Job (1x daily)
       ↓
Posted to LinkedIn Feed
```

---

## Step 1: Create a LinkedIn App

### 1.1 Go to LinkedIn Developer Portal
1. Visit: https://www.linkedin.com/developers/apps
2. Sign in with your LinkedIn account (the one managing Signal Pilot)
3. Click **"Create app"**

### 1.2 Fill in App Details
- **App name:** Signal Pilot Posting Bot
- **LinkedIn Page:** Signal Pilot (select from dropdown, or create one)
- **App logo:** Upload a logo
- **Legal agreement:** Check the box
- Click **"Create app"**

### 1.3 Get Your Credentials
Once created, you'll see your app dashboard with:
- **Client ID** (looks like: `86xxx123`)
- **Client Secret** (looks like: `AbCdEfGhIjKlMnOpQr`)

**Keep these safe!** You'll need them in a moment.

---

## Step 2: Verify Your Organization

LinkedIn requires verification of your organization before posting.

### 2.1 Request Access to LinkedIn Sign In with OpenID Connect
On your app page:
1. Go to **"Auth"** tab
2. Find **"Sign in with LinkedIn"** section
3. Click **"Request access"**
4. Select **"Sign In with LinkedIn"**
5. Submit the request (LinkedIn reviews within 24-48 hours)

### 2.2 Get Your Organization ID
You need your LinkedIn Organization Page ID:
1. Go to your organization page: https://www.linkedin.com/company/signal-pilot/
2. The URL structure is: `https://www.linkedin.com/company/XXXXXXXXXX/`
3. Copy the number (that's your **Organization ID**)

Example: If URL is `https://www.linkedin.com/company/12345678/`, your org ID is `12345678`

---

## Step 3: Get Access Token

LinkedIn uses OAuth 2.0. You have two options:

### Option A: Automatic Refresh (Recommended for Production)

LinkedIn provides a **3-month access token** that expires. We'll set up auto-refresh:

#### 3.1 Get Initial Access Token

```bash
# Replace with YOUR values
CLIENT_ID="your-client-id"
CLIENT_SECRET="your-client-secret"
REDIRECT_URI="https://www.signalpilot.io/api/social/linkedin-callback"

# Step 1: Visit this URL in browser
# https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&scope=w_member_social

# Step 2: LinkedIn redirects you with a code parameter
# Copy that code

# Step 3: Exchange code for token
curl -X POST https://www.linkedin.com/oauth/v2/accessToken \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=YOUR_CODE_HERE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=https://www.signalpilot.io/api/social/linkedin-callback"
```

You'll get back:
```json
{
  "access_token": "AQF...",
  "expires_in": 7776000,
  "refresh_token": "AQH..."
}
```

**Save the `refresh_token`** — this is what you add to Vercel.

### Option B: Manual Token (Quick Test)

If LinkedIn review is slow, request a **Personal Use Token**:
1. Go to your app **Auth** tab
2. Scroll to **"Personal access tokens"**
3. Click **"Create token"**
4. Scopes: `w_member_social`, `w_organization_social`
5. Copy the token

This expires in 1 year and is fine for testing.

---

## Step 4: Add Credentials to Vercel

### 4.1 Dashboard Method
1. Go to: https://vercel.com/dashboard
2. Select your **Signal Pilot project**
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
LINKEDIN_CLIENT_ID = "your-client-id"
LINKEDIN_CLIENT_SECRET = "your-client-secret"
LINKEDIN_ACCESS_TOKEN = "your-access-token"
LINKEDIN_REFRESH_TOKEN = "your-refresh-token"
LINKEDIN_ORG_ID = "your-org-id"
LINKEDIN_ACCESS_TOKEN_EXPIRES_AT = "2026-05-22T12:00:00Z" (3 months from now)
```

### 4.2 Vercel CLI Method
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Add variables (from project root)
vercel env add LINKEDIN_CLIENT_ID
vercel env add LINKEDIN_CLIENT_SECRET
vercel env add LINKEDIN_ACCESS_TOKEN
vercel env add LINKEDIN_REFRESH_TOKEN
vercel env add LINKEDIN_ORG_ID
vercel env add LINKEDIN_ACCESS_TOKEN_EXPIRES_AT

# Redeploy
vercel deploy
```

---

## Step 5: Test Your Connection

Once variables are set, test the API:

```bash
# From repo root
curl https://www.signalpilot.io/api/social/linkedin-test
```

You should see:
```json
{
  "status": "success",
  "orgId": "12345678",
  "tokenStatus": "valid"
}
```

---

## Environment Variables Summary

| Variable | Value | Where to Find |
|----------|-------|---------------|
| `LINKEDIN_CLIENT_ID` | `86xxx123` | App Dashboard → Settings |
| `LINKEDIN_CLIENT_SECRET` | `AbCdEf...` | App Dashboard → Settings |
| `LINKEDIN_ACCESS_TOKEN` | `AQF...` | OAuth response (see Step 3) |
| `LINKEDIN_REFRESH_TOKEN` | `AQH...` | OAuth response (see Step 3) |
| `LINKEDIN_ORG_ID` | `12345678` | Your company page URL |
| `LINKEDIN_ACCESS_TOKEN_EXPIRES_AT` | `2026-05-22T...` | 3 months from token creation |

---

## Troubleshooting

### "401 Unauthorized"
- ❌ Access token expired or invalid
- ✅ Use `LINKEDIN_REFRESH_TOKEN` to auto-refresh
- ✅ Re-run OAuth flow to get new token

### "403 Forbidden - Insufficient Permissions"
- ❌ App not approved for `w_member_social` or `w_organization_social`
- ✅ Wait for LinkedIn to approve your access request (24-48 hours)

### "404 Organization Not Found"
- ❌ `LINKEDIN_ORG_ID` is wrong
- ✅ Double-check your company page URL and extract the correct ID

### "Invalid redirect_uri"
- ❌ Redirect URI doesn't match registered URI in app settings
- ✅ Make sure you registered: `https://www.signalpilot.io/api/social/linkedin-callback`

---

## What Happens Next

Once credentials are set:

1. ✅ Cron job posts to LinkedIn 1x daily at 9AM UTC (4AM EST)
2. ✅ Uses same content as Instagram posts
3. ✅ LinkedIn engagement metrics feed back to dashboard
4. ✅ Token auto-refreshes before expiration

---

## Links

- **LinkedIn Developers:** https://www.linkedin.com/developers/
- **LinkedIn API Docs:** https://docs.microsoft.com/en-us/linkedin/
- **OAuth 2.0 Scopes:** https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication

---

**Need help?** The LinkedIn API is strict but once configured, it's bulletproof.

Status: ⏳ Waiting for you to get credentials, then I'll build the posting API.
