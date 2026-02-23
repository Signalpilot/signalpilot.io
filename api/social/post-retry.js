/**
 * POST RETRY HANDLER
 * 
 * Automatically retries failed posts with exponential backoff
 * Called every 15 minutes via Vercel cron: "*/15 * * * *"
 * 
 * Fixes the 3-hour gap between scheduled posts (10:00 → 16:00 → 19:00 UTC)
 * If 16:00 post fails, retry at 16:15, 16:30, 16:45 before next scheduled 19:00
 */

import {
  getNextPostOrder,
  getRetryCount,
  getRetryWaitTime,
  shouldSkipPost,
  clearRetryCount,
  incrementRetryCount,
  logError,
} from '../../lib/social/queue-manager.js';
import { getPostNumber } from '../../lib/social/posting-schedule.js';

export default async function handler(req, res) {
  const runId = Math.random().toString(36).slice(2, 8);
  const log = (msg) => console.log(`[POST-RETRY ${runId}] ${msg}`);

  log(`▶ Retry handler started at ${new Date().toISOString()}`);

  // Verify cron secret
  const cronSecret = req.headers['authorization'];
  const isAuthorized = cronSecret === `Bearer ${process.env.CRON_SECRET}`;

  if (!isAuthorized) {
    log(`✗ UNAUTHORIZED`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Check Instagram retry state
    const postOrder = await getNextPostOrder('instagram');
    const retryCount = await getRetryCount('instagram', postOrder);

    log(`Current postOrder=${postOrder}, retryCount=${retryCount}`);

    // If no retries pending, nothing to do
    if (retryCount === 0) {
      log(`✓ No retries pending`);
      return res.status(200).json({
        success: true,
        message: 'No retries pending',
        postOrder,
        retryCount,
      });
    }

    // Check if we've exceeded max retries
    const shouldSkip = await shouldSkipPost('instagram', postOrder);
    if (shouldSkip) {
      log(`⏭ Max retries exceeded for postOrder=${postOrder} — skipping`);
      await logError({
        platform: 'instagram',
        postOrder,
        action: 'auto_skipped_max_retries',
        reason: `Max retries exceeded (${retryCount} attempts)`,
      });
      return res.status(200).json({
        success: true,
        skipped: true,
        reason: 'Max retries exceeded',
        postOrder,
        retryCount,
      });
    }

    log(`📤 RETRY ATTEMPT: postOrder=${postOrder}, attempt ${retryCount}/3`);

    // Trigger the actual post endpoint with force mode
    // This will:
    // - Skip the "recently posted" check
    // - Clear retry count on success
    // - Increment retry count on failure
    const postUrl = `https://www.signalpilot.io/api/social/post-instagram/?force=true&retry=true`;
    const postResponse = await fetch(postUrl, {
      headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET}` },
    });

    const postResult = await postResponse.json();

    if (postResult.success && postResult.posted) {
      log(`✅ RETRY SUCCESSFUL: Post ${postResult.posted.postNumber} published`);
      await clearRetryCount('instagram', postOrder);

      return res.status(200).json({
        success: true,
        posted: true,
        message: `Retry succeeded — post ${postResult.posted.postNumber} published`,
        postOrder,
        attempt: retryCount,
      });
    } else {
      log(`⚠ RETRY FAILED: ${postResult.error || postResult.message}`);

      // Log the failed retry attempt
      await logError({
        platform: 'instagram',
        postOrder,
        action: 'retry_failed',
        reason: postResult.error || postResult.message,
        retryAttempt: retryCount,
      });

      return res.status(200).json({
        success: true,
        posted: false,
        message: 'Retry failed, queued for next attempt',
        postOrder,
        attempt: retryCount,
        nextRetryAttempt: retryCount + 1,
      });
    }
  } catch (error) {
    log(`💥 ERROR: ${error.message}`);
    console.error('Post retry error:', error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
