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
  postingLog: 'social:posting:log',
  errorLog: 'social:errors:log',
  retryCount: (platform, postOrder) => `social:retry:${platform}:${postOrder}`,
};

const MAX_LOG_ENTRIES = 100;
const MAX_RETRIES = 3;

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
  const count = (await kv.get(key)) || 0;
  await kv.set(key, count + 1, { ex: 86400 * 7 }); // expire in 7 days
  return count + 1;
}

async function clearRetryCount(platform, postOrder) {
  const kv = getKV();
  await kv.del(KEYS.retryCount(platform, postOrder));
}

async function shouldSkipPost(platform, postOrder) {
  const retries = await getRetryCount(platform, postOrder);
  return retries >= MAX_RETRIES;
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

// --- Full Status ---

async function getStatus() {
  const paused = await isPaused();
  const twitter = await getLastPosted('twitter');
  const instagram = await getLastPosted('instagram');
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
  };
}

export {
  isPaused,
  setPaused,
  getLastPosted,
  setLastPosted,
  getNextPostOrder,
  getRetryCount,
  incrementRetryCount,
  clearRetryCount,
  shouldSkipPost,
  logPosting,
  logError,
  getPostingLog,
  getErrorLog,
  wasRecentlyPosted,
  getStatus,
  MAX_RETRIES,
};
