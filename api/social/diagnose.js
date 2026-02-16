// GET /api/social/diagnose
// Full system health check — tests Redis, Twitter API, Instagram API, queue state, and next post validity
// Hit this endpoint to see EXACTLY why posts aren't going through

import { getStatus, getPostingLog, getErrorLog, isPaused, getNextPostOrder, shouldSkipPost, getRetryCount, wasRecentlyPosted } from '../../lib/social/queue-manager.js';
import { getPostNumber, getInstagramColumn } from '../../lib/social/posting-schedule.js';
import { verifyCredentials } from '../../lib/social/twitter-client.js';
import { verifyToken, detectTokenType, resolveAccountId } from '../../lib/social/instagram-client.js';
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
    INSTAGRAM_ACCESS_TOKEN: !!process.env.INSTAGRAM_ACCESS_TOKEN,
    INSTAGRAM_BUSINESS_ACCOUNT_ID: !!process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID,
    FACEBOOK_APP_ID: !!process.env.FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET: !!process.env.FACEBOOK_APP_SECRET,
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

  // ── 3b. Instagram API Credentials ──────────────────────────────────
  try {
    const tokenType = detectTokenType();
    const igCreds = await verifyToken();
    const resolvedId = await resolveAccountId().catch(() => null);
    report.checks.instagramApi = {
      status: 'PASS',
      tokenType,
      userId: igCreds.userId,
      name: igCreds.name,
      tokenExpiresAt: igCreds.expiresAt,
      envAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID ? `...${process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID.slice(-6)}` : 'NOT SET',
      resolvedAccountId: resolvedId ? `...${resolvedId.slice(-6)}` : 'FAILED',
    };
    // Warn if token expires within 7 days
    if (igCreds.expiresAt && igCreds.expiresAt !== 'unknown') {
      const daysUntilExpiry = (new Date(igCreds.expiresAt) - new Date()) / (1000 * 60 * 60 * 24);
      if (daysUntilExpiry < 7) {
        report.checks.instagramApi.status = 'WARN';
        report.errors.push(`Instagram token expires in ${Math.round(daysUntilExpiry)} day(s) — refresh ASAP`);
      }
    }
  } catch (err) {
    const rawToken = process.env.INSTAGRAM_ACCESS_TOKEN || '';
    report.checks.instagramApi = {
      status: 'FAIL',
      error: err.message,
      tokenDebug: {
        length: rawToken.length,
        prefix: rawToken.substring(0, 10),
        suffix: rawToken.substring(rawToken.length - 6),
        hasWhitespace: rawToken !== rawToken.trim(),
        hasNewline: /[\r\n]/.test(rawToken),
      },
    };
    report.errors.push(`Instagram API failed: ${err.message}`);
  }

  // ── 4. Queue State (paused? stuck? idempotency?) ──────────────────
  try {
    const paused = await isPaused();

    // Twitter queue state
    const twRecentlyPosted = await wasRecentlyPosted('twitter', 300000);
    const twNextOrder = await getNextPostOrder('twitter');
    const twRetries = await getRetryCount('twitter', twNextOrder);
    const twShouldSkip = await shouldSkipPost('twitter', twNextOrder);

    // Instagram queue state
    const igRecentlyPosted = await wasRecentlyPosted('instagram', 300000);
    const igNextOrder = await getNextPostOrder('instagram');
    const igRetries = await getRetryCount('instagram', igNextOrder);
    const igShouldSkip = await shouldSkipPost('instagram', igNextOrder);
    const igPostNumber = getPostNumber('instagram', igNextOrder);
    const igColumn = getInstagramColumn(igNextOrder);

    report.checks.queueState = {
      status: (paused || twShouldSkip || igShouldSkip) ? 'BLOCKED' : 'PASS',
      paused,
      twitter: {
        recentlyPosted: twRecentlyPosted,
        nextPostOrder: twNextOrder,
        retriesOnNextPost: twRetries,
        wouldSkipNextPost: twShouldSkip,
      },
      instagram: {
        recentlyPosted: igRecentlyPosted,
        nextPostOrder: igNextOrder,
        nextPostNumber: igPostNumber,
        nextColumn: igColumn,
        retriesOnNextPost: igRetries,
        wouldSkipNextPost: igShouldSkip,
      },
    };
    if (paused) report.errors.push('Queue is PAUSED — posts will not fire');
    if (twShouldSkip) report.errors.push(`Twitter post order ${twNextOrder} hit max retries (${twRetries}) — will be skipped`);
    if (igShouldSkip) report.errors.push(`Instagram post order ${igNextOrder} hit max retries (${igRetries}) — will be skipped`);
    if (twRecentlyPosted) report.errors.push('Twitter idempotency guard active — posted within last 5 minutes');
    if (igRecentlyPosted) report.errors.push('Instagram idempotency guard active — posted within last 5 minutes');
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
        postsWithInstagram: posts.filter(p => p.instagram && p.instagram.caption).length,
        postsWithSlides: posts.filter(p => p.instagram && p.instagram.slideCount >= 2).length,
      };
    }
  } catch (err) {
    report.checks.contentQueue = { status: 'FAIL', error: err.message };
    report.errors.push(`Content queue error: ${err.message}`);
  }

  // ── 6. Next Post Validation (Twitter) ────────────────────────────
  try {
    const nextOrder = await getNextPostOrder('twitter');
    const postNumber = getPostNumber('twitter', nextOrder);
    const filePath = join(process.cwd(), 'data', 'social', 'content-queue.json');
    const posts = JSON.parse(readFileSync(filePath, 'utf-8'));
    const post = posts.find(p => p.postNumber === postNumber);

    if (!post) {
      report.checks.nextTwitterPost = { status: 'FAIL', postOrder: nextOrder, postNumber, error: 'Post not found in queue' };
      report.errors.push(`Next Twitter post #${postNumber} (order ${nextOrder}) not found in content-queue.json`);
    } else {
      const tweets = post.twitter?.tweets || [];
      const longTweets = tweets.filter(t => t.length > 280);
      report.checks.nextTwitterPost = {
        status: longTweets.length > 0 ? 'WARN' : 'PASS',
        postOrder: nextOrder,
        postNumber,
        title: post.title,
        tweetCount: tweets.length,
        tweetLengths: tweets.map(t => t.length),
        longTweets: longTweets.map((t, i) => ({ index: tweets.indexOf(t), length: t.length, preview: t.substring(0, 60) + '...' })),
      };
      if (longTweets.length > 0) {
        report.errors.push(`Next Twitter post has ${longTweets.length} tweet(s) over 280 chars — will fail Twitter API`);
      }
    }
  } catch (err) {
    report.checks.nextTwitterPost = { status: 'FAIL', error: err.message };
  }

  // ── 6b. Next Post Validation (Instagram) ───────────────────────────
  try {
    const igNextOrder = await getNextPostOrder('instagram');
    const igPostNumber = getPostNumber('instagram', igNextOrder);
    const igColumn = getInstagramColumn(igNextOrder);
    const filePath = join(process.cwd(), 'data', 'social', 'content-queue.json');
    const posts = JSON.parse(readFileSync(filePath, 'utf-8'));
    const post = posts.find(p => p.postNumber === igPostNumber);

    if (!post) {
      report.checks.nextInstagramPost = { status: 'FAIL', postOrder: igNextOrder, postNumber: igPostNumber, column: igColumn, error: 'Post not found in queue' };
      report.errors.push(`Next Instagram post #${igPostNumber} (order ${igNextOrder}, ${igColumn}) not found in content-queue.json`);
    } else {
      const caption = post.instagram?.caption;
      const slideCount = post.instagram?.slideCount || 0;
      const issues = [];
      if (!caption) issues.push('No caption');
      if (slideCount < 2) issues.push(`Only ${slideCount} slide(s) — need 2+`);

      report.checks.nextInstagramPost = {
        status: issues.length > 0 ? 'FAIL' : 'PASS',
        postOrder: igNextOrder,
        postNumber: igPostNumber,
        column: igColumn,
        title: post.title,
        slideCount,
        hasCaption: !!caption,
        captionLength: caption ? caption.length : 0,
        issues,
      };
      if (issues.length > 0) {
        report.errors.push(`Next Instagram post #${igPostNumber}: ${issues.join(', ')}`);
      }
    }
  } catch (err) {
    report.checks.nextInstagramPost = { status: 'FAIL', error: err.message };
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
