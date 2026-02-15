// POST /api/social/post-instagram
// Cron-triggered: Posts the next Instagram carousel
// Schedule: 3x daily at 10AM, 4PM, 10PM UTC (5AM, 11AM, 5PM EST)
//
// How it works:
// 1. Queue manager says "next post order is 37" → posting schedule says "that's post #035, Orange column"
// 2. Load content-queue.json → get caption + hashtags for post #035
// 3. Count how many slide PNGs exist for post-035 (deployed on Vercel at /assets/social/post-035/)
// 4. Instagram client uploads each slide via public URL, creates carousel, publishes
// 5. Queue advances to post order 38

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
import { getPostNumber, getInstagramColumn } from '../../lib/social/posting-schedule.js';
import { postCarousel, SITE_URL } from '../../lib/social/instagram-client.js';
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

/**
 * Count how many slide PNGs exist for a post by probing public URLs.
 * Vercel serves static assets via CDN but doesn't include them in the
 * serverless function bundle, so filesystem reads fail. HEAD requests
 * against the public URL are reliable and also validate that Instagram
 * can actually fetch the images.
 */
async function getSlideCount(postNumber) {
  const paddedNum = String(postNumber).padStart(3, '0');
  let count = 0;
  for (let i = 1; i <= 10; i++) {
    const url = `${SITE_URL}/assets/social/post-${paddedNum}/slide-${i}.png`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) count++;
      else break;
    } catch {
      break;
    }
  }
  return count;
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

    // Idempotency check (skip with ?force=true for manual posting)
    const force = req.query.force === 'true';
    if (!force && await wasRecentlyPosted('instagram', 300000)) {
      return res.status(200).json({ success: true, skipped: true, reason: 'Already posted recently' });
    }

    // Get next post in Instagram's 9-grid order
    const postOrder = await getNextPostOrder('instagram');
    const postNumber = getPostNumber('instagram', postOrder);
    const column = getInstagramColumn(postOrder);

    if (postNumber === null) {
      return res.status(200).json({ success: true, skipped: true, reason: 'No more posts in queue' });
    }

    // Check retry limit
    if (await shouldSkipPost('instagram', postOrder)) {
      await setLastPosted('instagram', postOrder);
      await logError({
        platform: 'instagram',
        postOrder,
        postNumber,
        column,
        action: 'skipped',
        reason: 'Max retries exceeded',
      });
      return res.status(200).json({ success: true, skipped: true, reason: `Post ${postNumber} skipped after max retries` });
    }

    // Load content
    const posts = loadContent();
    const post = posts.find(p => p.postNumber === postNumber);

    if (!post) {
      await logError({ platform: 'instagram', postOrder, postNumber, action: 'error', reason: 'Post not found' });
      return res.status(200).json({ success: false, error: `Post ${postNumber} not found` });
    }

    const caption = post.instagram?.caption;
    if (!caption) {
      await logError({ platform: 'instagram', postOrder, postNumber, column, action: 'error', reason: 'No caption' });
      return res.status(200).json({ success: false, error: `Post ${postNumber} has no caption` });
    }

    // Count actual slides via public URL (Vercel doesn't expose static assets to functions)
    const slideCount = await getSlideCount(postNumber);
    if (slideCount < 2) {
      await incrementRetryCount('instagram', postOrder);
      await logError({ platform: 'instagram', postOrder, postNumber, column, action: 'error', reason: `Only ${slideCount} slide(s) (need 2+)` });
      return res.status(200).json({ success: false, error: `Post ${postNumber} has ${slideCount} slide(s) (need 2+)` });
    }

    // Post carousel to Instagram via Graph API
    const result = await postCarousel(postNumber, slideCount, caption);

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
    console.error('Instagram posting error:', error.message);

    try {
      const postOrder = await getNextPostOrder('instagram');
      await incrementRetryCount('instagram', postOrder);
      await logError({
        platform: 'instagram',
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
