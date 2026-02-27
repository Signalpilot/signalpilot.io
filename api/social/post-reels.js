// POST /api/social/post-reels
// Cron-triggered: Posts the next Instagram Reel
// Schedule: 3x daily at 10AM, 3PM, 8PM UTC (5AM, 10AM, 3PM EST)
//
// How it works:
// 1. Queue manager says "next post order is 37" → posting schedule says "that's post #035"
// 2. Load content-queue.json → get caption + hashtags for post #035
// 3. Check if video exists at /data/social/reels/reel-035.mp4
// 4. Instagram client uploads video, creates Reel, publishes
// 5. Queue advances to next post order
//
// Note: Videos must be pre-generated locally using Remotion and uploaded to git

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
  incrementDailyPostCount,
  getExpectedDailyCount,
} from '../../lib/social/queue-manager.js';
import { getPostNumber } from '../../lib/social/posting-schedule.js';
import { postReel } from '../../lib/social/instagram-reels-client.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

let contentCache = null;

function loadContent() {
  if (!contentCache) {
    const filePath = join(process.cwd(), 'data', 'social', 'content-queue.json');
    contentCache = JSON.parse(readFileSync(filePath, 'utf-8'));
  }
  return contentCache;
}

/**
 * Check if Reel video exists for this post
 */
function reelExists(postNumber) {
  const padded = String(postNumber).padStart(3, '0');
  const reelPath = join(process.cwd(), 'data', 'social', 'reels', `reel-${padded}.mp4`);
  return existsSync(reelPath);
}

/**
 * Attempt to auto-refresh Instagram token on auth failure
 */
async function attemptAutoTokenRefresh(log) {
  try {
    log(`🔄 Attempting auto-refresh of Instagram token...`);
    const refreshUrl = `https://www.signalpilot.io/api/social/refresh-ig-token/?token=${process.env.SOCIAL_ADMIN_TOKEN}`;
    const refreshResponse = await fetch(refreshUrl);
    const refreshData = await refreshResponse.json();

    if (refreshData.success || refreshData.vercelAutoUpdateSuccess) {
      log(`✅ Token refresh successful`);
      return true;
    } else {
      log(`⚠️ Token refresh returned: ${JSON.stringify(refreshData)}`);
      return false;
    }
  } catch (refreshErr) {
    log(`❌ Token refresh failed: ${refreshErr.message}`);
    return false;
  }
}

/**
 * Post one Reel. Returns the result or null if skipped/failed.
 */
async function postOne(log, startTime) {
  const postOrder = await getNextPostOrder('reels');
  const postNumber = getPostNumber('reels', postOrder);
  log(`Queue state: postOrder=${postOrder}, postNumber=${postNumber}`);

  if (postNumber === null) {
    log(`⏭ SKIP: No more posts in queue (postOrder=${postOrder} → null)`);
    return null;
  }

  // Check if video exists
  if (!reelExists(postNumber)) {
    await logError({
      platform: 'reels',
      postOrder,
      postNumber,
      action: 'error',
      reason: `Reel video missing: /data/social/reels/reel-${String(postNumber).padStart(3, '0')}.mp4 (generate locally with Remotion first)`,
    });
    await setLastPosted('reels', postOrder);
    log(`✗ Post ${postNumber} has no Reel video — advancing queue`);
    return null;
  }

  const skipDueToRetries = await shouldSkipPost('reels', postOrder);
  log(`shouldSkipPost(${postOrder}) → ${skipDueToRetries}`);
  if (skipDueToRetries) {
    await setLastPosted('reels', postOrder);
    await logError({
      platform: 'reels',
      postOrder,
      postNumber,
      action: 'skipped',
      reason: 'Max retries exceeded',
    });
    log(`⏭ SKIP: Post ${postNumber} exceeded max retries — advancing queue`);
    return null;
  }

  const posts = loadContent();
  const post = posts.find((p) => p.postNumber === postNumber);

  if (!post) {
    await logError({
      platform: 'reels',
      postOrder,
      postNumber,
      action: 'error',
      reason: 'Post not found in content queue',
    });
    await setLastPosted('reels', postOrder);
    log(`✗ Post ${postNumber} not found — advancing queue`);
    return null;
  }

  const caption = post.instagram?.caption;
  if (!caption) {
    await logError({
      platform: 'reels',
      postOrder,
      postNumber,
      action: 'error',
      reason: 'No caption in post',
    });
    await setLastPosted('reels', postOrder);
    log(`✗ Post ${postNumber} has no caption — advancing queue`);
    return null;
  }

  // Attempt to post
  try {
    log(`🎬 Posting Reel for post ${postNumber}...`);
    const result = await postReel(postNumber, caption);

    await clearRetryCount('reels', postOrder);
    await clearAuthStrikes('reels');
    await setLastPosted('reels', postOrder);
    await incrementDailyPostCount('reels');

    const elapsedMs = Date.now() - startTime;
    await logPosting({
      platform: 'reels',
      postOrder,
      postNumber,
      mediaId: result.mediaId,
      action: 'posted',
      elapsedMs,
    });

    log(`✅ Posted Reel ${postNumber}: ${result.mediaId}`);
    return result;
  } catch (err) {
    log(`❌ Failed to post Reel ${postNumber}: ${err.message}`);

    // Check if auth error
    if (err.message.includes('401') || err.message.includes('invalid token')) {
      log(`🔐 Auth error detected, attempting token refresh...`);
      const refreshOk = await attemptAutoTokenRefresh(log);

      const authStrikes = await incrementAuthStrikes('reels');
      log(`Auth strikes: ${authStrikes}/${AUTH_STRIKES_BEFORE_PAUSE}`);

      if (authStrikes >= AUTH_STRIKES_BEFORE_PAUSE) {
        await setPlatformPaused('reels', true);
        log(`⚠️ Platform paused due to auth failures`);
      }

      if (refreshOk) {
        log(`Retrying post after token refresh...`);
        await incrementRetryCount('reels', postOrder);
        return null; // Retry next cycle
      }
    }

    // Non-auth error: increment retry count
    await incrementRetryCount('reels', postOrder);
    await logError({
      platform: 'reels',
      postOrder,
      postNumber,
      action: 'error',
      reason: err.message,
    });

    return null;
  }
}

/**
 * Main handler
 */
export default async function handler(request, response) {
  const start = Date.now();
  const logs = [];

  function log(msg) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${msg}`;
    console.log(line);
    logs.push(line);
  }

  try {
    log('=== Reels Posting Cron ===');

    const { paused, reason: pauseReason } = await isPlatformPaused('reels');
    log(`isPlatformPaused('reels') → ${paused} (reason: ${pauseReason})`);
    if (paused) {
      log('⏸ Platform paused. Skipping.');
      return response.status(200).json({ status: 'paused', reason: pauseReason, logs });
    }

    const dailyCount = await getExpectedDailyCount('reels');
    log(`Daily posting limit: ${dailyCount}/day`);

    const result = await postOne(log, start);

    if (result) {
      log(`✅ Success`);
      return response.status(200).json({ status: 'posted', result, logs });
    } else {
      log(`⏭ Skipped or failed (retrying later)`);
      return response.status(200).json({ status: 'skipped', logs });
    }
  } catch (err) {
    log(`💥 Unhandled error: ${err.message}`);
    log(err.stack);

    await logError({
      platform: 'reels',
      action: 'handler_error',
      reason: err.message,
    });

    return response.status(500).json({ status: 'error', error: err.message, logs });
  }
}
