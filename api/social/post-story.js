// POST /api/social/post-story
// Cron-triggered: Posts the next Instagram Story
// Schedule: 5x daily at 8AM, 11AM, 2PM, 5PM, 8PM UTC
//
// How it works:
// 1. Reads stories queue (simple counter-based system)
// 2. Gets story content from data/social/stories.json
// 3. Checks if story video exists at /assets/social/stories/story-XXX.mp4
// 4. Instagram client uploads, creates Story, publishes
// 5. Advances to next story

import {
  isPlatformPaused,
  setPlatformPaused,
  incrementAuthStrikes,
  clearAuthStrikes,
  getAuthStrikes,
  AUTH_STRIKES_BEFORE_PAUSE,
  logPosting,
  logError,
  incrementRetryCount,
  clearRetryCount,
} from '../../lib/social/queue-manager.js';
import { postStory } from '../../lib/social/instagram-stories-client.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Stories use a simple counter (0-N cycling)
// Read/write from a JSON file

function getStoriesQueuePath() {
  return join(process.cwd(), 'data', 'social', 'stories-queue.json');
}

function readStoriesQueue() {
  const path = getStoriesQueuePath();
  if (!existsSync(path)) {
    return { currentStoryNumber: 0, totalStories: 0 };
  }
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function writeStoriesQueue(data) {
  const path = getStoriesQueuePath();
  writeFileSync(path, JSON.stringify(data, null, 2));
}

function loadStories() {
  const filePath = join(process.cwd(), 'data', 'social', 'stories.json');
  if (!existsSync(filePath)) {
    return [];
  }
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

/**
 * Check if Story video exists
 */
function storyExists(storyNumber) {
  const padded = String(storyNumber).padStart(4, '0');
  const storyPath = join(process.cwd(), 'data', 'social', 'stories', `story-${padded}.mp4`);
  return existsSync(storyPath);
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
 * Post one Story. Returns the result or null if skipped/failed.
 */
async function postOne(log, startTime) {
  const queue = readStoriesQueue();
  const stories = loadStories();

  // Validation: ensure we have stories to post
  if (stories.length === 0) {
    log(`⏭ SKIP: No stories configured in data/social/stories.json`);
    return null;
  }

  if (stories.length < 5) {
    log(`⚠️ WARNING: Only ${stories.length} stories available (need 5+ for daily rotation)`);
    // Don't fail, just log warning - continue with rotation
  }

  // Cycle through stories
  const storyNumber = queue.currentStoryNumber % stories.length;
  const story = stories[storyNumber];

  log(`Queue state: currentStoryNumber=${queue.currentStoryNumber}, storyNumber=${storyNumber}, total=${stories.length}`);

  // Check if video exists
  if (!storyExists(storyNumber)) {
    await logError({
      platform: 'stories',
      storyNumber,
      action: 'error',
      reason: `Story video missing: /data/social/stories/story-${String(storyNumber).padStart(4, '0')}.mp4 (generate locally with Remotion first)`,
    });

    // Advance to next story
    writeStoriesQueue({
      currentStoryNumber: queue.currentStoryNumber + 1,
      totalStories: stories.length,
    });

    log(`✗ Story ${storyNumber} has no video — advancing to next`);
    return null;
  }

  // Attempt to post
  try {
    log(`📱 Posting Story ${storyNumber}...`);
    const result = await postStory(storyNumber);

    await clearRetryCount('stories', storyNumber);
    await clearAuthStrikes('stories');

    const elapsedMs = Date.now() - startTime;
    await logPosting({
      platform: 'stories',
      storyNumber,
      mediaId: result.mediaId,
      action: 'posted',
      elapsedMs,
    });

    // Advance to next story
    writeStoriesQueue({
      currentStoryNumber: queue.currentStoryNumber + 1,
      totalStories: stories.length,
    });

    log(`✅ Posted Story ${storyNumber}: ${result.mediaId}`);
    return result;
  } catch (err) {
    log(`❌ Failed to post Story ${storyNumber}: ${err.message}`);

    // Check if auth error
    if (err.message.includes('401') || err.message.includes('invalid token')) {
      log(`🔐 Auth error detected, attempting token refresh...`);
      const refreshOk = await attemptAutoTokenRefresh(log);

      const authStrikes = await incrementAuthStrikes('stories');
      log(`Auth strikes: ${authStrikes}/${AUTH_STRIKES_BEFORE_PAUSE}`);

      if (authStrikes >= AUTH_STRIKES_BEFORE_PAUSE) {
        await setPlatformPaused('stories', true);
        log(`⚠️ Platform paused due to auth failures`);
      }

      if (refreshOk) {
        log(`Retrying story after token refresh...`);
        await incrementRetryCount('stories', storyNumber);
        return null;
      }
    }

    // Non-auth error: increment retry count
    await incrementRetryCount('stories', storyNumber);
    await logError({
      platform: 'stories',
      storyNumber,
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
    log('=== Stories Posting Cron ===');

    const paused = await isPlatformPaused('stories');
    if (paused) {
      log('⏸ Platform paused. Skipping.');
      return response.status(200).json({ status: 'paused', logs });
    }

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
      platform: 'stories',
      action: 'handler_error',
      reason: err.message,
    });

    return response.status(500).json({ status: 'error', error: err.message, logs });
  }
}
