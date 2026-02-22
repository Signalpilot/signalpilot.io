// POST /api/social/cron-engage-retry
// Process failed engagement retries with exponential backoff
// Called via Vercel cron (every 10 minutes)

import {
  getEngagementRetriesReady,
  removeEngagementRetry,
  addEngagementRetry,
  logEngagement,
} from '../../lib/social/queue-manager.js';
import {
  likePost,
  commentOnPost,
} from '../../lib/social/instagram-client.js';
import {
  likeTweet,
  replyToTweet,
} from '../../lib/social/twitter-client.js';

export default async function handler(req, res) {
  try {
    const { token } = req.query;

    // Verify token
    const validToken = token === process.env.ROBOT_TOKEN ||
                       token === process.env.CRON_SECRET;

    if (!validToken) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get retries ready to process
    const readyRetries = await getEngagementRetriesReady();

    if (readyRetries.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No retries ready',
        processedCount: 0,
      });
    }

    const results = {
      succeeded: [],
      failed: [],
      skipped: [],
    };

    // Process each retry
    for (const retryItem of readyRetries) {
      try {
        const success = await processRetry(retryItem);

        if (success) {
          await removeEngagementRetry(retryItem.id);
          results.succeeded.push({
            id: retryItem.id,
            platform: retryItem.metadata.platform,
            action: retryItem.metadata.action,
            retryAttempt: retryItem.retryCount,
          });
        } else {
          // Re-add to queue for next retry
          const shouldRetry = await addEngagementRetry(retryItem.id, retryItem.metadata);
          if (shouldRetry) {
            results.failed.push({
              id: retryItem.id,
              platform: retryItem.metadata.platform,
              action: retryItem.metadata.action,
              retryAttempt: retryItem.retryCount,
              status: 'queued_for_next_retry',
            });
          } else {
            results.skipped.push({
              id: retryItem.id,
              platform: retryItem.metadata.platform,
              action: retryItem.metadata.action,
              reason: 'Max retries exceeded',
            });
          }
        }
      } catch (error) {
        console.error(`Error processing retry ${retryItem.id}:`, error);
        results.failed.push({
          id: retryItem.id,
          platform: retryItem.metadata.platform,
          action: retryItem.metadata.action,
          error: error.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      processedCount: readyRetries.length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Retry handler error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Process a single retry attempt
 * @returns {boolean} true if successful, false if should retry later
 */
async function processRetry(retryItem) {
  const { metadata } = retryItem;
  const { platform, action, mediaId, tweetId, text } = metadata;

  try {
    if (platform === 'instagram') {
      if (action === 'like') {
        await likePost(mediaId);
      } else if (action === 'comment') {
        await commentOnPost(mediaId, text);
      }
    } else if (platform === 'twitter') {
      if (action === 'like') {
        await likeTweet(tweetId);
      } else if (action === 'reply') {
        await replyToTweet(tweetId, text);
      }
    }

    // Log successful retry
    await logEngagement({
      ...metadata,
      action: 'engagement_retry_success',
      retryAttempt: retryItem.retryCount,
    });

    return true;
  } catch (error) {
    console.error(`Retry failed for ${retryItem.id}:`, error);

    // Log retry failure
    await logEngagement({
      ...metadata,
      action: 'engagement_retry_failed_attempt',
      retryAttempt: retryItem.retryCount,
      error: error.message,
    });

    // Return false to indicate retry failed (will be retried again)
    return false;
  }
}
