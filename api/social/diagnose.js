// GET /api/social/diagnose
// Full system health check — tests Redis, Twitter API, queue state, and next post validity
// Hit this endpoint to see EXACTLY why posts aren't going through

import { getStatus, getPostingLog, getErrorLog, isPaused, getNextPostOrder, shouldSkipPost, getRetryCount, wasRecentlyPosted } from '../../lib/social/queue-manager.js';
import { getPostNumber } from '../../lib/social/posting-schedule.js';
import { verifyCredentials } from '../../lib/social/twitter-client.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.query.token;
  if (!token || token !== process.env.SOCIAL_ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const report = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
    verdict: 'unknown',
  };

  // ── 1. Environment Variables ──────────────────────────────────────
  const envChecks = {
    TWITTER_API_KEY: !!process.env.TWITTER_API_KEY,
    TWITTER_API_SECRET: !!process.env.TWITTER_API_SECRET,
    TWITTER_ACCESS_TOKEN: !!process.env.TWITTER_ACCESS_TOKEN,
    TWITTER_ACCESS_SECRET: !!process.env.TWITTER_ACCESS_SECRET,
    UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    CRON_SECRET: !!process.env.CRON_SECRET,
    SOCIAL_ADMIN_TOKEN: !!process.env.SOCIAL_ADMIN_TOKEN,
  };
  const missingEnv = Object.entries(envChecks).filter(([, v]) => !v).map(([k]) => k);
  report.checks.envVars = {
    status: missingEnv.length === 0 ? 'PASS' : 'FAIL',
    set: Object.entries(envChecks).filter(([, v]) => v).map(([k]) => k),
    missing: missingEnv,
  };
  if (missingEnv.length > 0) {
    report.errors.push(`Missing env vars: ${missingEnv.join(', ')}`);
  }

  // ── 2. Redis Connection ───────────────────────────────────────────
  try {
    const status = await getStatus();
    report.checks.redis = {
      status: 'PASS',
      queueState: status,
    };
  } catch (err) {
    report.checks.redis = { status: 'FAIL', error: err.message };
    report.errors.push(`Redis connection failed: ${err.message}`);
  }

  // ── 3. Twitter API Credentials ────────────────────────────────────
  try {
    const creds = await verifyCredentials();
    report.checks.twitterApi = {
      status: 'PASS',
      userId: creds.userId,
      username: creds.username,
    };
  } catch (err) {
    report.checks.twitterApi = { status: 'FAIL', error: err.message };
    report.errors.push(`Twitter API failed: ${err.message}`);
  }

  // ── 4. Queue State (paused? stuck? idempotency?) ──────────────────
  try {
    const paused = await isPaused();
    const recentlyPosted = await wasRecentlyPosted('twitter', 300000);
    const nextOrder = await getNextPostOrder('twitter');
    const retries = await getRetryCount('twitter', nextOrder);
    const shouldSkip = await shouldSkipPost('twitter', nextOrder);

    report.checks.queueState = {
      status: (paused || shouldSkip) ? 'BLOCKED' : 'PASS',
      paused,
      recentlyPosted,
      nextPostOrder: nextOrder,
      retriesOnNextPost: retries,
      wouldSkipNextPost: shouldSkip,
    };
    if (paused) report.errors.push('Queue is PAUSED — posts will not fire');
    if (shouldSkip) report.errors.push(`Post order ${nextOrder} hit max retries (${retries}) — will be skipped`);
    if (recentlyPosted) report.errors.push('Idempotency guard active — posted within last 5 minutes');
  } catch (err) {
    report.checks.queueState = { status: 'FAIL', error: err.message };
    report.errors.push(`Queue state check failed: ${err.message}`);
  }

  // ── 5. Content Queue File ─────────────────────────────────────────
  try {
    const filePath = join(process.cwd(), 'data', 'social', 'content-queue.json');
    if (!existsSync(filePath)) {
      report.checks.contentQueue = { status: 'FAIL', error: 'content-queue.json not found' };
      report.errors.push('content-queue.json file missing from deployment');
    } else {
      const posts = JSON.parse(readFileSync(filePath, 'utf-8'));
      report.checks.contentQueue = {
        status: 'PASS',
        totalPosts: posts.length,
        postsWithTwitter: posts.filter(p => p.twitter && p.twitter.tweets && p.twitter.tweets.length > 0).length,
      };
    }
  } catch (err) {
    report.checks.contentQueue = { status: 'FAIL', error: err.message };
    report.errors.push(`Content queue error: ${err.message}`);
  }

  // ── 6. Next Post Validation ───────────────────────────────────────
  try {
    const nextOrder = await getNextPostOrder('twitter');
    const postNumber = getPostNumber('twitter', nextOrder);
    const filePath = join(process.cwd(), 'data', 'social', 'content-queue.json');
    const posts = JSON.parse(readFileSync(filePath, 'utf-8'));
    const post = posts.find(p => p.postNumber === postNumber);

    if (!post) {
      report.checks.nextPost = { status: 'FAIL', postOrder: nextOrder, postNumber, error: 'Post not found in queue' };
      report.errors.push(`Next post #${postNumber} (order ${nextOrder}) not found in content-queue.json`);
    } else {
      const tweets = post.twitter?.tweets || [];
      const longTweets = tweets.filter(t => t.length > 280);
      report.checks.nextPost = {
        status: longTweets.length > 0 ? 'WARN' : 'PASS',
        postOrder: nextOrder,
        postNumber,
        title: post.title,
        tweetCount: tweets.length,
        tweetLengths: tweets.map(t => t.length),
        longTweets: longTweets.map((t, i) => ({ index: tweets.indexOf(t), length: t.length, preview: t.substring(0, 60) + '...' })),
      };
      if (longTweets.length > 0) {
        report.errors.push(`Next post has ${longTweets.length} tweet(s) over 280 chars — will fail Twitter API`);
      }
    }
  } catch (err) {
    report.checks.nextPost = { status: 'FAIL', error: err.message };
  }

  // ── 7. Recent Error Log ───────────────────────────────────────────
  try {
    const errors = await getErrorLog(10);
    const posts = await getPostingLog(5);
    report.checks.recentActivity = {
      lastErrors: errors,
      lastSuccessfulPosts: posts,
    };
  } catch (err) {
    report.checks.recentActivity = { status: 'FAIL', error: err.message };
  }

  // ── Verdict ───────────────────────────────────────────────────────
  if (report.errors.length === 0) {
    report.verdict = 'ALL CLEAR — system should be posting fine';
  } else {
    report.verdict = `${report.errors.length} ISSUE(S) FOUND`;
  }

  return res.status(200).json(report);
}
