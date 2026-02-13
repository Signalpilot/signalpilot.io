// POST /api/social/post-instagram
// Cron-triggered: Posts the next Instagram carousel
// Schedule: 3x daily at 1PM, 5PM, 10PM UTC (8AM, 12PM, 5PM EST)

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
import { postCarousel } from '../../lib/social/instagram-client.js';
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

const SLIDES_PER_CAROUSEL = 10;

/**
 * Build image URLs for all slides of a given post
 */
function getSlideUrls(postNumber) {
  const paddedNum = String(postNumber).padStart(3, '0');
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://www.signalpilot.io';
  return Array.from({ length: SLIDES_PER_CAROUSEL }, (_, i) =>
    `${baseUrl}/assets/social/post-${paddedNum}/slide-${i + 1}.png`
  );
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

    // Idempotency check
    if (await wasRecentlyPosted('instagram', 300000)) {
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
      await setLastPosted('instagram', postOrder);
      return res.status(200).json({ success: false, error: `Post ${postNumber} not found` });
    }

    const caption = post.instagram.caption;
    if (!caption) {
      await logError({ platform: 'instagram', postOrder, postNumber, action: 'error', reason: 'No caption' });
      await setLastPosted('instagram', postOrder);
      return res.status(200).json({ success: false, error: `Post ${postNumber} has no caption` });
    }

    // Post carousel (10 slides) to Instagram
    const slideUrls = getSlideUrls(postNumber);
    const result = await postCarousel(slideUrls, caption);

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
