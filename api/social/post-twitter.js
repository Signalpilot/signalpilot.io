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
} from '../../lib/social/queue-manager.js';
import { getPostNumber } from '../../lib/social/posting-schedule.js';
import { postThread, postTweet } from '../../lib/social/twitter-client.js';
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
    const recentlyPosted = await wasRecentlyPosted('twitter', 300000);
    log(`wasRecentlyPosted(5min) → ${recentlyPosted}`);
    if (recentlyPosted) {
      log(`⏭ SKIP: Already posted within 5 minutes — returning 200`);
      return res.status(200).json({ success: true, skipped: true, reason: 'Already posted recently' });
    }

    // Get next post
    const postOrder = await getNextPostOrder('twitter');
    const postNumber = getPostNumber('twitter', postOrder);
    log(`Queue state: postOrder=${postOrder}, postNumber=${postNumber}`);

    if (postNumber === null) {
      log(`⏭ SKIP: No more posts in queue (postOrder=${postOrder} → null) — returning 200`);
      return res.status(200).json({ success: true, skipped: true, reason: 'No more posts in queue' });
    }

    // Check if this post has failed too many times
    const skipDueToRetries = await shouldSkipPost('twitter', postOrder);
    log(`shouldSkipPost(${postOrder}) → ${skipDueToRetries}`);
    if (skipDueToRetries) {
      // Skip this post and advance
      await setLastPosted('twitter', postOrder);
      await logError({
        platform: 'twitter',
        postOrder,
        postNumber,
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
      await logError({ platform: 'twitter', postOrder, postNumber, action: 'error', reason: 'Post not found in content queue' });
      // Advance past missing post
      await setLastPosted('twitter', postOrder);
      log(`✗ ERROR: Post ${postNumber} not found in content-queue.json — advancing queue, returning 200`);
      return res.status(200).json({ success: false, error: `Post ${postNumber} not found` });
    }

    const tweets = post.twitter?.tweets;
    if (!tweets || tweets.length === 0) {
      await logError({ platform: 'twitter', postOrder, postNumber, action: 'error', reason: 'No tweets in post' });
      await setLastPosted('twitter', postOrder);
      log(`✗ ERROR: Post ${postNumber} has no tweets — advancing queue, returning 200`);
      return res.status(200).json({ success: false, error: `Post ${postNumber} has no tweets` });
    }

    // Validate tweet lengths — Twitter API rejects > 280 chars
    const longTweets = tweets.map((t, i) => ({ i, len: t.length })).filter(t => t.len > 280);
    if (longTweets.length > 0) {
      const detail = longTweets.map(t => `tweet ${t.i + 1}: ${t.len} chars`).join(', ');
      await logError({ platform: 'twitter', postOrder, postNumber, action: 'error', reason: `Tweet(s) over 280 chars: ${detail}` });
      // Don't advance — this needs a content fix, not a skip
      await incrementRetryCount('twitter', postOrder);
      log(`✗ ERROR: Post ${postNumber} has oversized tweets: ${detail} — returning 200`);
      return res.status(200).json({ success: false, error: `Post ${postNumber} has oversized tweets: ${detail}` });
    }

    // Post the thread (or single tweet)
    log(`📤 Posting ${tweets.length} tweet(s) for post ${postNumber}... (${Date.now() - startTime}ms elapsed)`);
    let result;
    if (tweets.length === 1) {
      result = await postTweet(tweets[0]);
    } else {
      result = await postThread(tweets);
    }
    log(`✅ Thread posted! url=${result.threadUrl || result.url} (${Date.now() - startTime}ms elapsed)`);

    // Success - update state
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

    log(`✅ SUCCESS: Post ${postNumber} published, queue advanced. Total time: ${Date.now() - startTime}ms`);

    return res.status(200).json({
      success: true,
      posted: {
        postOrder,
        postNumber,
        title: post.title,
        tweetCount: tweets.length,
        url: result.threadUrl || result.url,
      },
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
