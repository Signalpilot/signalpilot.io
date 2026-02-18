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
};
