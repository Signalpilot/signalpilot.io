// POST /api/social/post-twitter
// Cron-triggered: Posts the next Twitter thread
// Schedule: 3x daily at 8AM, 2PM, 8PM UTC (3AM, 9AM, 3PM EST)

import {
  isPlatformPaused,
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
import { uploadMedia, postThread, postTweet } from '../../lib/social/twitter-client.js';
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
 * Post one tweet/thread. Returns the result or null if skipped/failed.
 */
async function postOne(log, startTime) {
  const postOrder = await getNextPostOrder('twitter');
  const postNumber = getPostNumber('twitter', postOrder);
  log(`Queue state: postOrder=${postOrder}, postNumber=${postNumber}`);

  if (postNumber === null) {
    log(`⏭ SKIP: No more posts in queue (postOrder=${postOrder} → null)`);
    return null;
  }

  const skipDueToRetries = await shouldSkipPost('twitter', postOrder);
  log(`shouldSkipPost(${postOrder}) → ${skipDueToRetries}`);
  if (skipDueToRetries) {
    await setLastPosted('twitter', postOrder);
    await logError({ platform: 'twitter', postOrder, postNumber, action: 'skipped', reason: 'Max retries exceeded' });
    log(`⏭ SKIP: Post ${postNumber} exceeded max retries — advancing queue`);
    return null;
  }

  const posts = loadContent();
  const post = posts.find(p => p.postNumber === postNumber);

  if (!post) {
    await logError({ platform: 'twitter', postOrder, postNumber, action: 'error', reason: 'Post not found in content queue' });
    await setLastPosted('twitter', postOrder);
    log(`✗ Post ${postNumber} not found — advancing queue`);
    return null;
  }

  const tweets = post.twitter?.tweets;
  if (!tweets || tweets.length === 0) {
    await logError({ platform: 'twitter', postOrder, postNumber, action: 'error', reason: 'No tweets in post' });
    await setLastPosted('twitter', postOrder);
    log(`✗ Post ${postNumber} has no tweets — advancing queue`);
    return null;
  }

  const longTweets = tweets.map((t, i) => ({ i, len: t.length })).filter(t => t.len > 280);
  if (longTweets.length > 0) {
    const detail = longTweets.map(t => `tweet ${t.i + 1}: ${t.len} chars`).join(', ');
    await logError({ platform: 'twitter', postOrder, postNumber, action: 'error', reason: `Tweet(s) over 280 chars: ${detail}` });
    await incrementRetryCount('twitter', postOrder);
    log(`✗ Post ${postNumber} has oversized tweets: ${detail}`);
    return null;
  }

  // Upload twitter card image — required for every post
  // Cards are served from Cloudflare R2 via Vercel rewrite
  let mediaId = null;
  const padded = String(postNumber).padStart(3, '0');
  const cardUrl = `https://www.signalpilot.io/assets/social/post-${padded}/twitter-card.png`;
  try {
    const res = await fetch(cardUrl);
    if (!res.ok) {
      await logError({ platform: 'twitter', postOrder, postNumber, action: 'error', reason: `Twitter card missing: ${cardUrl} (HTTP ${res.status})` });
      await incrementRetryCount('twitter', postOrder);
      log(`✗ Post ${postNumber} has no twitter card image — blocking post`);
      return null;
    }
    const imageBuffer = Buffer.from(await res.arrayBuffer());
    mediaId = await uploadMedia(imageBuffer, 'image/png');
    log(`🖼 Uploaded twitter card for post ${postNumber} (mediaId=${mediaId})`);
  } catch (imgErr) {
    await logError({ platform: 'twitter', postOrder, postNumber, action: 'error', reason: `Image upload failed: ${imgErr.message}` });
    await incrementRetryCount('twitter', postOrder);
    log(`✗ Image upload failed for post ${postNumber}: ${imgErr.message} — blocking post`);
    return null;
  }

  log(`📤 Posting ${tweets.length} tweet(s) for post ${postNumber}${mediaId ? ' + image' : ''}... (${Date.now() - startTime}ms elapsed)`);
  let result;
  if (tweets.length === 1) {
    result = await postTweet(tweets[0], mediaId);
  } else {
    result = await postThread(tweets, mediaId);
  }
  log(`✅ Thread posted! url=${result.threadUrl || result.url} (${Date.now() - startTime}ms elapsed)`);

  await setLastPosted('twitter', postOrder);
  await clearRetryCount('twitter', postOrder);
  await logPosting({
    platform: 'twitter',
    postOrder,
    postNumber,
    title: post.title,
    type: post.type,
    tweetCount: tweets.length,
    url: result.threadUrl || result.url,
    action: 'posted',
  });

  return { postOrder, postNumber, title: post.title, tweetCount: tweets.length, url: result.threadUrl || result.url };
}

export default async function handler(req, res) {
  const startTime = Date.now();
  const runId = Math.random().toString(36).slice(2, 8);
  const log = (msg) => console.log(`[TW-CRON ${runId}] ${msg}`);

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
    const { paused, reason: pauseReason } = await isPlatformPaused('twitter');
    log(`isPlatformPaused('twitter') → ${paused} (reason: ${pauseReason})`);
    if (paused) {
      log(`⏸ SKIP: Queue is paused (${pauseReason}) — returning 200`);
      return res.status(200).json({ success: true, skipped: true, reason: `Queue is paused (${pauseReason})` });
    }

    // Idempotency: skip if already posted recently (within 5 minutes)
    const isCatchup = req.query.catchup === 'true';
    const recentlyPosted = await wasRecentlyPosted('twitter', 300000);
    log(`wasRecentlyPosted(5min) → ${recentlyPosted}, catchup → ${isCatchup}`);
    if (!isCatchup && recentlyPosted) {
      log(`⏭ SKIP: Already posted within 5 minutes — returning 200`);
      return res.status(200).json({ success: true, skipped: true, reason: 'Already posted recently' });
    }

    // Post first tweet/thread
    const posted = [];
    const result = await postOne(log, startTime);

    if (result) {
      posted.push(result);
      const dailyCount = await incrementDailyPostCount('twitter');
      const expectedCount = getExpectedDailyCount('twitter');
      log(`Daily: ${dailyCount}/${expectedCount} posted today`);

      // Catch-up loop: tweets are fast, post more if behind
      const MAX_CATCHUP = 2; // max extra posts per invocation
      let catchups = 0;
      while (dailyCount + catchups < expectedCount && catchups < MAX_CATCHUP) {
        const elapsed = Date.now() - startTime;
        if (elapsed > 45000) { // 45s safety limit
          log(`⏰ Catch-up stopped: ${elapsed}ms elapsed`);
          break;
        }
        catchups++;
        log(`📊 CATCH-UP ${catchups}: ${dailyCount + catchups - 1}/${expectedCount} posted. Posting next...`);
        try {
          const catchupResult = await postOne(log, startTime);
          if (catchupResult) {
            posted.push(catchupResult);
            await incrementDailyPostCount('twitter');
          } else {
            log(`Catch-up: postOne returned null, stopping`);
            break;
          }
        } catch (catchupErr) {
          log(`Catch-up failed: ${catchupErr.message}, stopping`);
          break;
        }
      }
    }

    log(`✅ Done. Posted ${posted.length} thread(s). Total time: ${Date.now() - startTime}ms`);

    return res.status(200).json({
      success: posted.length > 0,
      posted: posted.length === 1 ? posted[0] : posted,
      count: posted.length,
    });
  } catch (error) {
    log(`💥 CAUGHT ERROR: ${error.message} (${Date.now() - startTime}ms elapsed)`);
    console.error('Twitter posting error:', error.message);

    // Log error and increment retry count
    try {
      const postOrder = await getNextPostOrder('twitter');
      const retryCount = await incrementRetryCount('twitter', postOrder);
      log(`Error details: postOrder=${postOrder}, retryCount=${retryCount}`);
      await logError({
        platform: 'twitter',
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
