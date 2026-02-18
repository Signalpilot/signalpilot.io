// POST /api/social/post-instagram
// Cron-triggered: Posts the next Instagram carousel
// Schedule: 3x daily at 10AM, 4PM, 7PM UTC (5AM, 11AM, 2PM EST)
//
// How it works:
// 1. Queue manager says "next post order is 37" → posting schedule says "that's post #035, Orange column"
// 2. Load content-queue.json → get caption + hashtags for post #035
// 3. Count how many slide PNGs exist for post-035 (deployed on Vercel at /assets/social/post-035/)
// 4. Instagram client uploads each slide via public URL, creates carousel, publishes
// 5. Queue advances to post order 38

import {
  isPlatformPaused,
  setPlatformPaused,
  incrementAuthStrikes,
  clearAuthStrikes,
  getAuthStrikes,
  AUTH_STRIKES_BEFORE_PAUSE,
  getNextPostOrder,
  setLastPosted,
  logPosting,
  logError,
  wasRecentlyPosted,
  shouldSkipPost,
  incrementRetryCount,
  clearRetryCount,
} from '../../lib/social/queue-manager.js';
import { getPostNumber, getInstagramColumn } from '../../lib/social/posting-schedule.js';
import { postCarousel, verifyToken } from '../../lib/social/instagram-client.js';
import { readFileSync } from 'fs';
import { join } from 'path';

let contentCache = null;

function loadContent() {
  if (!contentCache) {
    const filePath = join(process.cwd(), 'data', 'social', 'content-queue.json');
    contentCache = JSON.parse(readFileSync(filePath, 'utf-8'));
  }
  return contentCache;
}

export default async function handler(req, res) {
  const startTime = Date.now();
  const runId = Math.random().toString(36).slice(2, 8);
  const log = (msg) => console.log(`[IG-CRON ${runId}] ${msg}`);

  log(`▶ Handler started at ${new Date().toISOString()}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');

  // Verify cron secret or admin token
  const cronSecret = req.headers['authorization'];
  const adminToken = req.query.token;
  const isAuthorized =
    (cronSecret && cronSecret === `Bearer ${process.env.CRON_SECRET}`) ||
    (adminToken && adminToken === process.env.SOCIAL_ADMIN_TOKEN);

  if (!isAuthorized) {
    log(`✗ UNAUTHORIZED — no valid cron secret or admin token`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  log(`✓ Authorized (cron: ${!!cronSecret}, token: ${!!adminToken})`);

  try {
    // Check if paused (per-platform + global)
    const { paused, reason: pauseReason } = await isPlatformPaused('instagram');
    log(`isPlatformPaused('instagram') → ${paused} (reason: ${pauseReason})`);

    if (paused) {
      // If paused due to auth issues, try to auto-recover
      if (pauseReason === 'platform') {
        log(`⚡ Auto-recovery: Instagram paused, trying token verification...`);
        try {
          const tokenInfo = await verifyToken();
          log(`✓ Token valid again! userId=${tokenInfo.userId} — auto-unpausing Instagram`);
          await setPlatformPaused('instagram', false);
          await clearAuthStrikes('instagram');
          await logPosting({
            platform: 'instagram',
            action: 'auto_recovered',
            reason: `Token verified OK, auto-unpaused after auth pause`,
          });
          // Continue with the rest of the handler (don't return)
        } catch (recoveryError) {
          log(`⏸ Auto-recovery FAILED: ${recoveryError.message} — staying paused`);
          return res.status(200).json({ success: true, skipped: true, reason: 'Instagram paused (auth), auto-recovery failed' });
        }
      } else {
        // Global pause (admin-set) — respect it
        log(`⏸ SKIP: Queue is globally paused — returning 200`);
        return res.status(200).json({ success: true, skipped: true, reason: 'Queue is paused' });
      }
    }

    // Pre-flight token validation
    try {
      log(`Verifying token...`);
      const tokenInfo = await verifyToken();
      log(`✓ Token valid — userId=${tokenInfo.userId}, expires=${tokenInfo.expiresAt} (${Date.now() - startTime}ms elapsed)`);
      // Token works — clear any accumulated strikes
      const prevStrikes = await getAuthStrikes('instagram');
      if (prevStrikes > 0) {
        await clearAuthStrikes('instagram');
        log(`Cleared ${prevStrikes} auth strike(s) — token is healthy`);
      }
    } catch (tokenError) {
      const errorMsg = tokenError.message || 'Unknown token error';
      log(`✗ Token verification FAILED: ${errorMsg}`);

      const isAuthError = errorMsg.includes('OAuthException') ||
                          errorMsg.includes('Token') ||
                          errorMsg.includes('Unauthorized') ||
                          errorMsg.includes('blocked');

      if (isAuthError) {
        const strikes = await incrementAuthStrikes('instagram');
        log(`Auth strike ${strikes}/${AUTH_STRIKES_BEFORE_PAUSE} for Instagram`);

        await logError({
          platform: 'instagram',
          action: 'auth_failure',
          strikes,
          maxStrikes: AUTH_STRIKES_BEFORE_PAUSE,
          reason: `Auth strike ${strikes}/${AUTH_STRIKES_BEFORE_PAUSE}: ${errorMsg}`,
        });

        if (strikes >= AUTH_STRIKES_BEFORE_PAUSE) {
          await setPlatformPaused('instagram', true);
          log(`⛔ ${strikes} consecutive auth failures — INSTAGRAM paused (Twitter unaffected)`);
          return res.status(200).json({
            success: false,
            error: `Token failed ${strikes}x — Instagram paused`,
            detail: errorMsg,
            action: 'WILL_AUTO_RETRY_NEXT_CRON',
          });
        }

        // Below threshold — skip this run but don't pause
        log(`⏭ Auth failed but only strike ${strikes}/${AUTH_STRIKES_BEFORE_PAUSE} — skipping this run`);
        return res.status(200).json({
          success: false,
          skipped: true,
          reason: `Auth strike ${strikes}/${AUTH_STRIKES_BEFORE_PAUSE}: ${errorMsg}`,
        });
      }
      // Non-auth errors, allow retry
      throw tokenError;
    }

    // Idempotency check (skip with ?force=true for manual posting)
    const force = req.query.force === 'true';
    const recentlyPosted = await wasRecentlyPosted('instagram', 300000);
    log(`wasRecentlyPosted(5min) → ${recentlyPosted}, force → ${force}`);
    if (!force && recentlyPosted) {
      log(`⏭ SKIP: Already posted within 5 minutes — returning 200`);
      return res.status(200).json({ success: true, skipped: true, reason: 'Already posted recently' });
    }

    // Get next post in Instagram's 9-grid order
    const postOrder = await getNextPostOrder('instagram');
    const postNumber = getPostNumber('instagram', postOrder);
    const column = getInstagramColumn(postOrder);
    log(`Queue state: postOrder=${postOrder}, postNumber=${postNumber}, column=${column}`);

    if (postNumber === null) {
      log(`⏭ SKIP: No more posts in queue (postOrder=${postOrder} → null) — returning 200`);
      return res.status(200).json({ success: true, skipped: true, reason: 'No more posts in queue' });
    }

    // Check retry limit (force=true clears retries so manual posts always attempt)
    if (force) {
      await clearRetryCount('instagram', postOrder);
      log(`Force mode: cleared retry count for postOrder=${postOrder}`);
    }
    const skipDueToRetries = await shouldSkipPost('instagram', postOrder);
    log(`shouldSkipPost(${postOrder}) → ${skipDueToRetries}`);
    if (skipDueToRetries) {
      await setLastPosted('instagram', postOrder);
      await logError({
        platform: 'instagram',
        postOrder,
        postNumber,
        column,
        action: 'skipped',
        reason: 'Max retries exceeded',
      });
      log(`⏭ SKIP: Post ${postNumber} exceeded max retries — advancing queue, returning 200`);
      return res.status(200).json({ success: true, skipped: true, reason: `Post ${postNumber} skipped after max retries` });
    }

    // Load content
    const posts = loadContent();
    const post = posts.find(p => p.postNumber === postNumber);

    if (!post) {
      await logError({ platform: 'instagram', postOrder, postNumber, action: 'error', reason: 'Post not found' });
      log(`✗ ERROR: Post ${postNumber} not found in content-queue.json — returning 200`);
      return res.status(200).json({ success: false, error: `Post ${postNumber} not found` });
    }

    const caption = post.instagram?.caption;
    if (!caption) {
      await logError({ platform: 'instagram', postOrder, postNumber, column, action: 'error', reason: 'No caption' });
      log(`✗ ERROR: Post ${postNumber} has no caption — returning 200`);
      return res.status(200).json({ success: false, error: `Post ${postNumber} has no caption` });
    }

    // Get slide count from content-queue.json (set by inject-slide-counts.mjs)
    const slideCount = post.instagram?.slideCount || 0;
    log(`Post ${postNumber}: "${post.title}", ${slideCount} slides, column=${column}`);
    if (slideCount < 2) {
      await incrementRetryCount('instagram', postOrder);
      await logError({ platform: 'instagram', postOrder, postNumber, column, action: 'error', reason: `Only ${slideCount} slide(s) (need 2+)` });
      log(`✗ ERROR: Post ${postNumber} has ${slideCount} slide(s) (need 2+) — returning 200`);
      return res.status(200).json({ success: false, error: `Post ${postNumber} has ${slideCount} slide(s) (need 2+)` });
    }

    // Post carousel to Instagram via Graph API
    log(`📤 Posting carousel: post ${postNumber}, ${slideCount} slides... (${Date.now() - startTime}ms elapsed)`);
    const result = await postCarousel(postNumber, slideCount, caption);
    log(`✅ Carousel posted! mediaId=${result.mediaId}, slides=${result.slideCount} (${Date.now() - startTime}ms elapsed)`);

    // Success - update state
    await setLastPosted('instagram', postOrder);
    await clearRetryCount('instagram', postOrder);
    await logPosting({
      platform: 'instagram',
      postOrder,
      postNumber,
      column,
      title: post.title,
      type: post.type,
      slideCount: result.slideCount,
      mediaId: result.mediaId,
      action: 'posted',
    });

    log(`✅ SUCCESS: Post ${postNumber} published, queue advanced. Total time: ${Date.now() - startTime}ms`);

    return res.status(200).json({
      success: true,
      posted: {
        postOrder,
        postNumber,
        column,
        title: post.title,
        slideCount: result.slideCount,
        mediaId: result.mediaId,
      },
    });
  } catch (error) {
    log(`💥 CAUGHT ERROR: ${error.message} (${Date.now() - startTime}ms elapsed)`);
    console.error('Instagram posting error:', error.message);

    try {
      const postOrder = await getNextPostOrder('instagram');
      const retryCount = await incrementRetryCount('instagram', postOrder);

      log(`Error details: postOrder=${postOrder}, retryCount=${retryCount}`);

      await logError({
        platform: 'instagram',
        postOrder,
        action: 'error',
        retryCount,
        reason: error.message,
      });
    } catch (logErr) {
      console.error('Error logging failure:', logErr.message);
      log(`💥 DOUBLE FAULT: Failed to log error: ${logErr.message}`);
    }

    log(`✗ RETURNING 500: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
}
