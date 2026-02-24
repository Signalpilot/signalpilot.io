// Queue Manager: Manages posting state via Upstash Redis
// Tracks position, paused state, posting history, and errors

import { Redis } from '@upstash/redis';

let kvClient = null;

function getKV() {
  if (!kvClient) {
    kvClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return kvClient;
}

// --- Keys ---
const KEYS = {
  twitterLastPosted: 'social:twitter:last_posted',
  twitterLastPostedAt: 'social:twitter:last_posted_at',
  instagramLastPosted: 'social:instagram:last_posted',
  instagramLastPostedAt: 'social:instagram:last_posted_at',
  paused: 'social:queue:paused',
  platformPaused: (platform) => `social:${platform}:paused`,
  authStrikes: (platform) => `social:auth_strikes:${platform}`,
  postingLog: 'social:posting:log',
  errorLog: 'social:errors:log',
  retryCount: (platform, postOrder) => `social:retry:${platform}:${postOrder}`,
  retryMeta: (platform, postOrder) => `social:retry_meta:${platform}:${postOrder}`,
  tokenExpiresAt: 'social:token:expires_at',
  // Engagement tracking
  engagementLikedSet: (platform) => `social:engagement:${platform}:liked`,
  engagementCommentedSet: (platform) => `social:engagement:${platform}:commented`,
  engagementDailyCounter: (platform, type, date) => `social:engagement:${platform}:${type}:daily:${date}`,
  engagementLog: 'social:engagement:log',
  // Engagement retry tracking
  engagementRetryQueue: 'social:engagement:retry:queue',
  engagementRetryCount: (id) => `social:engagement:retry:count:${id}`,
  engagementRetryMeta: (id) => `social:engagement:retry:meta:${id}`,
  // Performance tracking (Phase 3)
  performanceMetrics: (platform, target) => `social:performance:${platform}:${target}`,
  templateScores: (platform) => `social:template_scores:${platform}`,
  targetScores: (platform) => `social:target_scores:${platform}`,
};

const MAX_LOG_ENTRIES = 100;
const MAX_RETRIES = 3;
const AUTH_STRIKES_BEFORE_PAUSE = 3; // consecutive auth failures before pausing

// Exponential backoff wait times (ms) between retries
const RETRY_WAIT_MS = [3000, 10000, 30000]; // 3s, 10s, 30s for retries 1, 2, 3

// --- State ---

async function isPaused() {
  const kv = getKV();
  const val = await kv.get(KEYS.paused);
  return val === true || val === 'true';
}

async function setPaused(paused) {
  const kv = getKV();
  await kv.set(KEYS.paused, paused);
}

/**
 * Check if a specific platform is paused (global OR platform-specific)
 */
async function isPlatformPaused(platform) {
  const kv = getKV();
  const globalPaused = await isPaused();
  if (globalPaused) return { paused: true, reason: 'global' };
  const val = await kv.get(KEYS.platformPaused(platform));
  if (val === true || val === 'true') return { paused: true, reason: 'platform' };
  return { paused: false, reason: null };
}

/**
 * Pause/unpause a specific platform (doesn't affect other platforms)
 */
async function setPlatformPaused(platform, paused) {
  const kv = getKV();
  await kv.set(KEYS.platformPaused(platform), paused);
}

// --- Auth Strike System ---
// Tracks consecutive auth failures per platform.
// Only pauses after AUTH_STRIKES_BEFORE_PAUSE consecutive failures.
// Resets on any successful auth or post.

async function incrementAuthStrikes(platform) {
  const kv = getKV();
  const key = KEYS.authStrikes(platform);
  const current = (await kv.get(key)) || 0;
  const newCount = current + 1;
  await kv.set(key, newCount, { ex: 86400 }); // expire in 24h
  return newCount;
}

async function getAuthStrikes(platform) {
  const kv = getKV();
  return (await kv.get(KEYS.authStrikes(platform))) || 0;
}

async function clearAuthStrikes(platform) {
  const kv = getKV();
  await kv.del(KEYS.authStrikes(platform));
}

async function getLastPosted(platform) {
  const kv = getKV();
  const key = platform === 'twitter' ? KEYS.twitterLastPosted : KEYS.instagramLastPosted;
  const timeKey = platform === 'twitter' ? KEYS.twitterLastPostedAt : KEYS.instagramLastPostedAt;
  const postOrder = await kv.get(key);
  const postedAt = await kv.get(timeKey);
  return { postOrder: postOrder || 0, postedAt: postedAt || null };
}

async function setLastPosted(platform, postOrder) {
  const kv = getKV();
  const key = platform === 'twitter' ? KEYS.twitterLastPosted : KEYS.instagramLastPosted;
  const timeKey = platform === 'twitter' ? KEYS.twitterLastPostedAt : KEYS.instagramLastPostedAt;
  await kv.set(key, postOrder);
  await kv.set(timeKey, new Date().toISOString());
}

async function getNextPostOrder(platform) {
  const { postOrder } = await getLastPosted(platform);
  return postOrder + 1;
}

// --- Retry Logic ---

async function getRetryCount(platform, postOrder) {
  const kv = getKV();
  const count = await kv.get(KEYS.retryCount(platform, postOrder));
  return count || 0;
}

async function incrementRetryCount(platform, postOrder) {
  const kv = getKV();
  const key = KEYS.retryCount(platform, postOrder);
  const metaKey = KEYS.retryMeta(platform, postOrder);
  const count = (await kv.get(key)) || 0;
  const newCount = count + 1;

  await kv.set(key, newCount, { ex: 86400 * 7 }); // expire in 7 days

  // Store retry metadata (timestamp, wait time)
  const waitMs = RETRY_WAIT_MS[Math.min(newCount - 1, RETRY_WAIT_MS.length - 1)];
  await kv.set(metaKey, {
    count: newCount,
    lastAttemptAt: new Date().toISOString(),
    nextRetryAt: new Date(Date.now() + waitMs).toISOString(),
    waitMs,
  }, { ex: 86400 * 7 });

  return newCount;
}

async function clearRetryCount(platform, postOrder) {
  const kv = getKV();
  await kv.del(KEYS.retryCount(platform, postOrder));
}

async function shouldSkipPost(platform, postOrder) {
  const retries = await getRetryCount(platform, postOrder);
  return retries >= MAX_RETRIES;
}

/**
 * Check if we should wait before retrying (exponential backoff)
 * Returns the wait time in ms if we should wait, 0 if we can retry now
 */
async function getRetryWaitTime(platform, postOrder) {
  const kv = getKV();
  const metaKey = KEYS.retryMeta(platform, postOrder);
  const meta = await kv.get(metaKey);

  if (!meta || !meta.nextRetryAt) return 0;

  const now = Date.now();
  const nextRetryTime = new Date(meta.nextRetryAt).getTime();

  if (now >= nextRetryTime) {
    return 0; // Can retry now
  }

  return nextRetryTime - now; // Wait this many ms before retrying
}

// --- Logging ---

async function logPosting(entry) {
  const kv = getKV();
  const log = (await kv.get(KEYS.postingLog)) || [];
  log.unshift({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  // Keep only the last N entries
  await kv.set(KEYS.postingLog, log.slice(0, MAX_LOG_ENTRIES));
}

async function logError(entry) {
  const kv = getKV();
  const log = (await kv.get(KEYS.errorLog)) || [];
  log.unshift({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  await kv.set(KEYS.errorLog, log.slice(0, MAX_LOG_ENTRIES));
}

async function getPostingLog(limit = 50) {
  const kv = getKV();
  const log = (await kv.get(KEYS.postingLog)) || [];
  return log.slice(0, limit);
}

async function getErrorLog(limit = 50) {
  const kv = getKV();
  const log = (await kv.get(KEYS.errorLog)) || [];
  return log.slice(0, limit);
}

// --- Daily Post Counter (for catch-up logic) ---

// Cron schedule hours (UTC) per platform
const CRON_SCHEDULE = {
  instagram: [11, 16, 19],
  twitter: [3, 7, 12, 16, 21],
};

/**
 * Atomically increment today's post count for a platform.
 * Uses Redis INCR for atomicity (no race conditions).
 */
async function incrementDailyPostCount(platform) {
  const kv = getKV();
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
  const key = `social:daily_posts:${platform}:${date}`;
  const newCount = await kv.incr(key);
  // Set 48h expiry on first increment
  if (newCount === 1) {
    await kv.expire(key, 172800);
  }
  return newCount;
}

async function getDailyPostCount(platform) {
  const kv = getKV();
  const date = new Date().toISOString().slice(0, 10);
  const key = `social:daily_posts:${platform}:${date}`;
  return (await kv.get(key)) || 0;
}

/**
 * How many posts should have been made today based on current time?
 * Counts how many cron slots have already elapsed.
 */
function getExpectedDailyCount(platform) {
  const hours = CRON_SCHEDULE[platform] || [];
  const currentHour = new Date().getUTCHours();
  return hours.filter(h => currentHour >= h).length;
}

// --- Idempotency ---

async function wasRecentlyPosted(platform, withinMs = 300000) {
  const { postedAt } = await getLastPosted(platform);
  if (!postedAt) return false;
  const elapsed = Date.now() - new Date(postedAt).getTime();
  return elapsed < withinMs;
}

// --- Token Expiration Tracking ---

async function setTokenExpiresAt(expiresAtIso) {
  const kv = getKV();
  await kv.set(KEYS.tokenExpiresAt, expiresAtIso);
}

async function getTokenExpiresAt() {
  const kv = getKV();
  return await kv.get(KEYS.tokenExpiresAt);
}

// --- Full Status ---

async function getStatus() {
  const paused = await isPaused();
  const twitter = await getLastPosted('twitter');
  const instagram = await getLastPosted('instagram');
  const tokenExpiresAt = await getTokenExpiresAt();

  // Calculate days until token expiry
  let daysUntilTokenExpiry = null;
  if (tokenExpiresAt) {
    const expiryTime = new Date(tokenExpiresAt).getTime();
    const daysMs = (expiryTime - Date.now()) / (1000 * 60 * 60 * 24);
    daysUntilTokenExpiry = Math.max(0, Math.round(daysMs));
  }

  return {
    paused,
    twitter: {
      lastPostOrder: twitter.postOrder,
      lastPostedAt: twitter.postedAt,
      nextPostOrder: twitter.postOrder + 1,
    },
    instagram: {
      lastPostOrder: instagram.postOrder,
      lastPostedAt: instagram.postedAt,
      nextPostOrder: instagram.postOrder + 1,
    },
    token: {
      expiresAt: tokenExpiresAt,
      daysUntilExpiry: daysUntilTokenExpiry,
    },
  };
}

// --- Engagement Tracking ---

/**
 * Mark a target (account/post/tweet) as engaged with (liked)
 * @param {string} platform - 'instagram' or 'twitter'
 * @param {string} targetId - Media ID, account handle, or tweet ID
 */
async function markEngaged(platform, targetId, type = 'like') {
  const kv = getKV();
  const key = type === 'like'
    ? KEYS.engagementLikedSet(platform)
    : KEYS.engagementCommentedSet(platform);
  await kv.sadd(key, targetId);
}

/**
 * Check if already engaged with target
 */
async function isEngaged(platform, targetId, type = 'like') {
  const kv = getKV();
  const key = type === 'like'
    ? KEYS.engagementLikedSet(platform)
    : KEYS.engagementCommentedSet(platform);
  const isMember = await kv.sismember(key, targetId);
  return isMember === 1;
}

/**
 * Increment engagement counter for today
 */
async function incrementEngagementCounter(platform, type) {
  const kv = getKV();
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
  const key = KEYS.engagementDailyCounter(platform, type, date);
  const newCount = await kv.incr(key);
  if (newCount === 1) {
    await kv.expire(key, 86400); // 24h expiry
  }
  return newCount;
}

/**
 * Get today's engagement count
 */
async function getEngagementCount(platform, type) {
  const kv = getKV();
  const date = new Date().toISOString().slice(0, 10);
  const key = KEYS.engagementDailyCounter(platform, type, date);
  return (await kv.get(key)) || 0;
}

/**
 * Log engagement action
 */
async function logEngagement(entry) {
  const kv = getKV();
  const log = (await kv.get(KEYS.engagementLog)) || [];
  log.unshift({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  await kv.set(KEYS.engagementLog, log.slice(0, MAX_LOG_ENTRIES));
}

/**
 * Get engagement log
 */
async function getEngagementLog(limit = 50) {
  const kv = getKV();
  const log = (await kv.get(KEYS.engagementLog)) || [];
  return log.slice(0, limit);
}

// --- Engagement Retry System ---

const ENGAGEMENT_MAX_RETRIES = 3;
const ENGAGEMENT_RETRY_WAIT_MS = [5000, 15000, 45000]; // 5s, 15s, 45s for retries 1, 2, 3

/**
 * Add a failed engagement to retry queue
 * @param {string} id - Unique ID for this engagement (e.g., mediaId, tweetId)
 * @param {Object} metadata - Engagement metadata (platform, action, target, etc)
 */
async function addEngagementRetry(id, metadata) {
  const kv = getKV();

  // Check current retry count
  const retryCount = (await kv.get(KEYS.engagementRetryCount(id))) || 0;

  if (retryCount >= ENGAGEMENT_MAX_RETRIES) {
    // Max retries reached, log as failed
    await logEngagement({
      ...metadata,
      action: 'engagement_retry_failed',
      retryCount,
      maxRetries: ENGAGEMENT_MAX_RETRIES,
    });
    return false;
  }

  // Add to retry queue
  const queue = (await kv.get(KEYS.engagementRetryQueue)) || [];
  const retryItem = {
    id,
    metadata,
    retryCount: retryCount + 1,
    lastAttempt: new Date().toISOString(),
    nextRetryAt: new Date(Date.now() + ENGAGEMENT_RETRY_WAIT_MS[retryCount]).toISOString(),
  };

  queue.push(retryItem);
  await kv.set(KEYS.engagementRetryQueue, queue);
  await kv.set(KEYS.engagementRetryCount(id), retryCount + 1);
  await kv.set(KEYS.engagementRetryMeta(id), retryItem);

  return true;
}

/**
 * Get items ready for retry from the queue
 */
async function getEngagementRetriesReady() {
  const kv = getKV();
  const queue = (await kv.get(KEYS.engagementRetryQueue)) || [];
  const now = new Date().toISOString();

  return queue.filter((item) => item.nextRetryAt <= now);
}

/**
 * Remove item from retry queue after successful retry
 */
async function removeEngagementRetry(id) {
  const kv = getKV();
  const queue = (await kv.get(KEYS.engagementRetryQueue)) || [];
  const filtered = queue.filter((item) => item.id !== id);
  await kv.set(KEYS.engagementRetryQueue, filtered);
  await kv.del(KEYS.engagementRetryCount(id));
  await kv.del(KEYS.engagementRetryMeta(id));
}

/**
 * Get retry queue status
 */
async function getEngagementRetryStatus() {
  const kv = getKV();
  const queue = (await kv.get(KEYS.engagementRetryQueue)) || [];
  const ready = queue.filter((item) => item.nextRetryAt <= new Date().toISOString());

  return {
    queueSize: queue.length,
    readyForRetry: ready.length,
    queue: queue.slice(0, 20), // Latest 20
  };
}

// --- Performance Tracking (Phase 3) ---

/**
 * Record engagement performance metrics
 * @param {string} platform - instagram or twitter
 * @param {string} target - account username or hashtag
 * @param {Object} metrics - { likes: 0, replies: 1, follows: 0, shares: 0 }
 */
async function recordPerformanceMetric(platform, target, metrics) {
  const kv = getKV();
  const key = KEYS.performanceMetrics(platform, target);
  const current = (await kv.get(key)) || {
    engagementCount: 0,
    replies: 0,
    follows: 0,
    shares: 0,
    averageEngagementScore: 0,
  };

  current.engagementCount = (current.engagementCount || 0) + 1;
  current.replies = (current.replies || 0) + (metrics.replies || 0);
  current.follows = (current.follows || 0) + (metrics.follows || 0);
  current.shares = (current.shares || 0) + (metrics.shares || 0);

  // Calculate engagement score
  current.averageEngagementScore = (
    (current.replies * 10 + current.follows * 5 + current.shares * 3) / current.engagementCount
  ).toFixed(2);

  current.lastUpdated = new Date().toISOString();

  await kv.set(key, current);
  return current;
}

/**
 * Score a template based on performance
 * @param {string} platform - instagram or twitter
 * @param {string} template - comment/reply text
 * @param {number} score - engagement score (0-10)
 */
async function scoreTemplate(platform, template, score) {
  const kv = getKV();
  const key = KEYS.templateScores(platform);
  const scores = (await kv.get(key)) || {};

  if (!scores[template]) {
    scores[template] = { total: 0, count: 0, average: 0 };
  }

  scores[template].total += score;
  scores[template].count += 1;
  scores[template].average = (scores[template].total / scores[template].count).toFixed(2);
  scores[template].lastScored = new Date().toISOString();

  await kv.set(key, scores);
  return scores[template];
}

/**
 * Get top-performing templates
 */
async function getTopTemplates(platform, limit = 5) {
  const kv = getKV();
  const key = KEYS.templateScores(platform);
  const scores = (await kv.get(key)) || {};

  return Object.entries(scores)
    .map(([template, data]) => ({
      template,
      average: parseFloat(data.average),
      count: data.count,
      total: data.total,
    }))
    .sort((a, b) => b.average - a.average)
    .slice(0, limit);
}

/**
 * Score a target account/hashtag
 */
async function scoreTarget(platform, target, score) {
  const kv = getKV();
  const key = KEYS.targetScores(platform);
  const scores = (await kv.get(key)) || {};

  if (!scores[target]) {
    scores[target] = { total: 0, count: 0, average: 0 };
  }

  scores[target].total += score;
  scores[target].count += 1;
  scores[target].average = (scores[target].total / scores[target].count).toFixed(2);
  scores[target].lastScored = new Date().toISOString();

  await kv.set(key, scores);
  return scores[target];
}

/**
 * Get top-performing targets
 */
async function getTopTargets(platform, limit = 10) {
  const kv = getKV();
  const key = KEYS.targetScores(platform);
  const scores = (await kv.get(key)) || {};

  return Object.entries(scores)
    .map(([target, data]) => ({
      target,
      average: parseFloat(data.average),
      count: data.count,
      total: data.total,
    }))
    .sort((a, b) => b.average - a.average)
    .slice(0, limit);
}

export {
  isPaused,
  setPaused,
  isPlatformPaused,
  setPlatformPaused,
  incrementAuthStrikes,
  getAuthStrikes,
  clearAuthStrikes,
  AUTH_STRIKES_BEFORE_PAUSE,
  getLastPosted,
  setLastPosted,
  getNextPostOrder,
  getRetryCount,
  incrementRetryCount,
  clearRetryCount,
  shouldSkipPost,
  getRetryWaitTime,
  incrementDailyPostCount,
  getDailyPostCount,
  getExpectedDailyCount,
  CRON_SCHEDULE,
  logPosting,
  logError,
  getPostingLog,
  getErrorLog,
  wasRecentlyPosted,
  getStatus,
  setTokenExpiresAt,
  getTokenExpiresAt,
  MAX_RETRIES,
  RETRY_WAIT_MS,
  markEngaged,
  isEngaged,
  incrementEngagementCounter,
  getEngagementCount,
  logEngagement,
  getEngagementLog,
  addEngagementRetry,
  getEngagementRetriesReady,
  removeEngagementRetry,
  getEngagementRetryStatus,
  ENGAGEMENT_MAX_RETRIES,
  ENGAGEMENT_RETRY_WAIT_MS,
  recordPerformanceMetric,
  scoreTemplate,
  getTopTemplates,
  scoreTarget,
  getTopTargets,
};
