# 🚀 Deployment Guide - SignalPilot.io

## Quick Deployment Checklist

Before deploying to production, follow these steps to ensure users get fresh content:

### 1. Update VERSION (Required!)

**File:** `index.html` (around line 4586)

```javascript
var VERSION = '202510292049'; // ← Update this!
```

**File:** `service-worker.js` (around line 4)

```javascript
const CACHE_VERSION = '202510292049'; // ← Update to match above!
```

**Format:** `YYYYMMDDHHmm` (Year Month Day Hour Minute)

**How to generate:**
```bash
# On macOS/Linux:
date +"%Y%m%d%H%M"

# Example output: 202510292049
```

### 2. Deploy to Vercel

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Or use Vercel CLI:
```bash
vercel --prod
```

### 3. Verify Deployment

1. Open https://www.signalpilot.io in private/incognito window
2. Check browser console for: `ServiceWorker registration successful`
3. Check console for correct VERSION: `202510292049`
4. Verify changes are visible

---

## Why Update VERSION?

- **Cache Busting**: Browsers cache JavaScript files. Changing VERSION forces fresh downloads.
- **Service Worker**: Old cache versions are automatically deleted.
- **User Experience**: Users see updates within 60 seconds (auto-refresh).

---

## What Happens After Deployment?

1. ✅ New VERSION invalidates old JS caches
2. ✅ Service worker detects new version
3. ✅ Users auto-refresh within 60 seconds
4. ✅ All users get fresh content

---

## Troubleshooting

### Users still see old content?

1. **Check VERSION was updated** in both files
2. **Hard refresh**: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
3. **Clear service worker**:
   - Chrome: DevTools → Application → Service Workers → Unregister
   - Then refresh page

### Service Worker not updating?

- Wait 60 seconds (automatic check interval)
- Or manually: DevTools → Application → Service Workers → Update

---

## Performance Optimizations Active

✅ **HTML files**: Never cached (always fresh)
✅ **Service Worker**: Never cached (always fresh)
✅ **JS/Assets**: Cached until VERSION changes
✅ **Images/Videos**: Cached for 1 year (immutable)
✅ **Auto-update**: Checks every 60 seconds
✅ **Auto-reload**: When new version ready

---

## Tips

- **Always update both VERSION values** (index.html + service-worker.js)
- **Use current timestamp** for VERSION
- **Test in incognito** to verify cache busting works
- **Monitor console logs** during deployment

---

*Last updated: 2025-10-29*
