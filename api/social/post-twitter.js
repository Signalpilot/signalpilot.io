// POST /api/social/post-twitter
// Cron-triggered: Posts the next Twitter thread
// Schedule: 3x daily at 8AM, 2PM, 8PM UTC (3AM, 9AM, 3PM EST)

import {
  isPaused,
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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');

  // Verify cron secret or admin token
  const cronSecret = req.headers['authorization'];
  const adminToken = req.query.token;
  const isAuthorized =
    (cronSecret && cronSecret === `Bearer ${process.env.CRON_SECRET}`) ||
    (adminToken && adminToken === process.env.SOCIAL_ADMIN_TOKEN);

  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Check if paused
    if (await isPaused()) {
      return res.status(200).json({ success: true, skipped: true, reason: 'Queue is paused' });
    }

    // Idempotency: skip if already posted recently (within 5 minutes)
    if (await wasRecentlyPosted('twitter', 300000)) {
      return res.status(200).json({ success: true, skipped: true, reason: 'Already posted recently' });
    }

    // Get next post
    const postOrder = await getNextPostOrder('twitter');
    const postNumber = getPostNumber('twitter', postOrder);

    if (postNumber === null) {
      return res.status(200).json({ success: true, skipped: true, reason: 'No more posts in queue' });
    }

    // Check if this post has failed too many times
    if (await shouldSkipPost('twitter', postOrder)) {
      // Skip this post and advance
      await setLastPosted('twitter', postOrder);
      await logError({
        platform: 'twitter',
        postOrder,
        postNumber,
        action: 'skipped',
        reason: 'Max retries exceeded',
      });
      return res.status(200).json({ success: true, skipped: true, reason: `Post ${postNumber} skipped after max retries` });
    }

    // Load content
    const posts = loadContent();
    const post = posts.find(p => p.postNumber === postNumber);

    if (!post) {
      await logError({ platform: 'twitter', postOrder, postNumber, action: 'error', reason: 'Post not found in content queue' });
      // Advance past missing post
      await setLastPosted('twitter', postOrder);
      return res.status(200).json({ success: false, error: `Post ${postNumber} not found` });
    }

    const tweets = post.twitter?.tweets;
    if (!tweets || tweets.length === 0) {
      await logError({ platform: 'twitter', postOrder, postNumber, action: 'error', reason: 'No tweets in post' });
      await setLastPosted('twitter', postOrder);
      return res.status(200).json({ success: false, error: `Post ${postNumber} has no tweets` });
    }

    // Validate tweet lengths — Twitter API rejects > 280 chars
    const longTweets = tweets.map((t, i) => ({ i, len: t.length })).filter(t => t.len > 280);
    if (longTweets.length > 0) {
      const detail = longTweets.map(t => `tweet ${t.i + 1}: ${t.len} chars`).join(', ');
      await logError({ platform: 'twitter', postOrder, postNumber, action: 'error', reason: `Tweet(s) over 280 chars: ${detail}` });
      // Don't advance — this needs a content fix, not a skip
      await incrementRetryCount('twitter', postOrder);
      return res.status(200).json({ success: false, error: `Post ${postNumber} has oversized tweets: ${detail}` });
    }

    // Post the thread (or single tweet)
    let result;
    if (tweets.length === 1) {
      result = await postTweet(tweets[0]);
    } else {
      result = await postThread(tweets);
    }

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
    console.error('Twitter posting error:', error.message);

    // Log error and increment retry count
    try {
      const postOrder = await getNextPostOrder('twitter');
      await incrementRetryCount('twitter', postOrder);
      await logError({
        platform: 'twitter',
        postOrder,
        action: 'error',
        reason: error.message,
      });
    } catch (logErr) {
      console.error('Error logging failure:', logErr.message);
    }

    return res.status(500).json({ success: false, error: error.message });
  }
}
