// POST /api/social/cron-engage
// Automated engagement: likes, comments, replies
// Runs every 4 hours via Vercel cron
// Fetches posts from target accounts via business_discovery API

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  getEngagementCount,
  logEngagement,
  markEngaged,
  isEngaged,
  incrementEngagementCounter,
} from '../../lib/social/queue-manager.js';
import {
  likePost,
  commentOnPost,
  getAccountPosts,
} from '../../lib/social/instagram-client.js';
import {
  likeTweet,
  replyToTweet,
  searchTweets,
} from '../../lib/social/twitter-client.js';

const CONFIG_PATH = join(process.cwd(), 'data', 'social', 'engagement-config.json');

function loadConfig() {
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  } catch (error) {
    console.error('Failed to load engagement config:', error);
    return null;
  }
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isActiveHour(config) {
  if (!config.scheduling?.activeHours) return true;
  const now = new Date();
  const hour = now.getUTCHours();
  return config.scheduling.activeHours.includes(hour);
}

/**
 * Sleep with jitter to avoid detection (human-like behavior)
 */
function getRandomDelay(minSec, maxSec) {
  const min = minSec * 1000;
  const max = maxSec * 1000;
  const jitter = Math.random() * (max - min) + min;
  return Math.floor(jitter);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if content contains spam patterns
 */
function isSpam(text, skipPatterns = []) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return skipPatterns.some(pattern => lower.includes(pattern.toLowerCase()));
}

/**
 * Filter posts by quality criteria
 */
function filterQualityPosts(posts, config, platform) {
  const skipPatterns = platform === 'instagram'
    ? (config.instagram?.skipPatterns || [])
    : (config.twitter?.skipPatterns || []);

  const safety = config.safety || {};

  return posts.filter(post => {
    // Skip spam patterns
    const caption = platform === 'instagram' ? post.caption : post.text;
    if (isSpam(caption, skipPatterns)) {
      return false;
    }

    // Skip suspicious accounts if enabled
    if (safety.skipSuspiciousAccounts && post.is_verified === false) {
      return false;
    }

    // Skip new accounts if enabled
    if (safety.skipNewAccounts && post.account_age_days && post.account_age_days < 30) {
      return false;
    }

    // Check minimum followers if set
    if (safety.minFollowersThreshold && post.followers_count < safety.minFollowersThreshold) {
      return false;
    }

    return true;
  });
}

export default async function handler(req, res) {
  try {
    // Accept token from query param (manual) or Authorization header (Vercel cron)
    const queryToken = req.query.token;
    const headerToken = req.headers['authorization']?.replace('Bearer ', '');
    const validToken = [queryToken, headerToken].some(t =>
      t && (t === process.env.ROBOT_TOKEN ||
            t === process.env.CRON_SECRET ||
            t === process.env.SOCIAL_ADMIN_TOKEN)
    );

    if (!validToken) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const config = loadConfig();
    if (!config) {
      return res.status(500).json({ error: 'Failed to load config' });
    }

    if (!config.enabled) {
      return res.status(200).json({
        success: true,
        message: 'Engagement disabled in config'
      });
    }

    if (!isActiveHour(config) && req.query.force !== 'true') {
      return res.status(200).json({
        success: true,
        message: 'Not within active hours',
      });
    }

    const results = {
      instagram: null,
      twitter: null,
      timestamp: new Date().toISOString(),
    };

    // Get rate limiting config
    const rateLimits = config.rateLimiting || {
      minDelayBetweenActionsSec: 5,
      maxDelayBetweenActionsSec: 30,
    };

    if (config.instagram?.enabled) {
      try {
        const igResult = await handleInstagramEngagement(config);
        results.instagram = igResult;

        // Add delay between platforms to avoid detection
        if (config.twitter?.enabled) {
          const delay = getRandomDelay(rateLimits.minDelayBetweenActionsSec, rateLimits.maxDelayBetweenActionsSec);
          await sleep(delay);
        }
      } catch (error) {
        console.error('Instagram engagement error:', error);
        results.instagram = { error: error.message };
        await logEngagement({
          platform: 'instagram',
          action: 'cron_error',
          error: error.message,
        });
      }
    }

    if (config.twitter?.enabled) {
      try {
        const twResult = await handleTwitterEngagement(config);
        results.twitter = twResult;
      } catch (error) {
        console.error('Twitter engagement error:', error);
        results.twitter = { error: error.message };
        await logEngagement({
          platform: 'twitter',
          action: 'cron_error',
          error: error.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Cron engagement handler error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleInstagramEngagement(config) {
  const likeCount = await getEngagementCount('instagram', 'like');
  const commentCount = await getEngagementCount('instagram', 'comment');

  // Decide action: like or comment
  const canLike = likeCount < config.instagram.likeDaily;
  const canComment = commentCount < config.instagram.commentDaily;

  if (!canLike && !canComment) {
    return {
      status: 'skipped',
      reason: 'Daily limits reached',
      likes: { count: likeCount, limit: config.instagram.likeDaily },
      comments: { count: commentCount, limit: config.instagram.commentDaily },
    };
  }

  // Randomly pick action (80% likes, 20% comments)
  const action = (!canComment || (canLike && Math.random() < 0.8)) ? 'like' : 'comment';

  // Pick a random account target from config (fetch posts directly via API)
  const accountTargets = (config.instagram.targets || []).filter(t => t.type === 'account');
  if (accountTargets.length === 0) {
    return { action, status: 'skipped', reason: 'No account targets configured' };
  }

  const target = randomItem(accountTargets);
  let posts = [];

  try {
    const result = await getAccountPosts(target.value, 20);
    posts = result.posts || [];
  } catch (error) {
    console.error(`Failed to fetch posts from @${target.value}:`, error.message);
    return { action, status: 'error', target: target.value, error: error.message };
  }

  if (posts.length === 0) {
    return { action, status: 'skipped', reason: `No posts found for @${target.value}` };
  }

  // Filter by quality (skip spam, suspicious accounts, etc)
  const qualityPosts = filterQualityPosts(posts, config, 'instagram');
  if (qualityPosts.length === 0) {
    return {
      action,
      status: 'skipped',
      reason: `All posts from @${target.value} filtered by quality checks`,
      filtered: posts.length,
    };
  }

  // Filter unengaged posts and score by engagement metrics
  const unengagedPosts = [];
  for (const post of qualityPosts) {
    const engaged = await isEngaged('instagram', post.id, action);
    if (!engaged) {
      const engagementScore = (post.like_count || 0) + (post.comments_count || 0) * 2;
      unengagedPosts.push({ ...post, engagementScore });
    }
  }

  if (unengagedPosts.length === 0) {
    return {
      action,
      status: 'skipped',
      reason: `All posts from @${target.value} already engaged`,
      posts_checked: qualityPosts.length,
    };
  }

  // Sort by engagement score descending and pick best post
  unengagedPosts.sort((a, b) => b.engagementScore - a.engagementScore);
  const post = unengagedPosts[0];

  try {
    if (action === 'like') {
      await likePost(post.id);
      await markEngaged('instagram', post.id, 'like');
      await incrementEngagementCounter('instagram', 'like');

      await logEngagement({
        platform: 'instagram',
        action: 'like',
        source: target.value,
        mediaId: post.id,
        triggerType: 'cron',
      });

      return {
        action: 'like',
        status: 'success',
        source: target.value,
        mediaId: post.id,
        count: likeCount + 1,
        limit: config.instagram.likeDaily,
      };
    } else {
      // Comment
      const template = randomItem(config.instagram.commentTemplates);
      await commentOnPost(post.id, template);
      await markEngaged('instagram', post.id, 'comment');
      await incrementEngagementCounter('instagram', 'comment');

      await logEngagement({
        platform: 'instagram',
        action: 'comment',
        source: target.value,
        mediaId: post.id,
        text: template,
        triggerType: 'cron',
      });

      return {
        action: 'comment',
        status: 'success',
        source: target.value,
        mediaId: post.id,
        text: template,
        count: commentCount + 1,
        limit: config.instagram.commentDaily,
      };
    }
  } catch (error) {
    return { action, status: 'error', target: target.value, error: error.message };
  }
}

async function handleTwitterEngagement(config) {
  const likeCount = await getEngagementCount('twitter', 'like');
  const replyCount = await getEngagementCount('twitter', 'reply');

  const queries = config.twitter.searchQueries || [];
  if (queries.length === 0) {
    return {
      status: 'skipped',
      reason: 'No search queries configured',
    };
  }

  // Decide action: like or reply
  const canLike = likeCount < config.twitter.likeDaily;
  const canReply = replyCount < config.twitter.replyDaily;

  if (!canLike && !canReply) {
    return {
      status: 'skipped',
      reason: 'Daily limits reached',
      likes: { count: likeCount, limit: config.twitter.likeDaily },
      replies: { count: replyCount, limit: config.twitter.replyDaily },
    };
  }

  // Randomly pick action (80% likes, 20% replies)
  const action = (!canReply || (canLike && Math.random() < 0.8)) ? 'like' : 'reply';

  const query = randomItem(queries);
  let tweets = [];
  let rateLimited = false;

  try {
    const result = await searchTweets(query, 15);
    tweets = result.tweets || [];
    rateLimited = result.rate_limited || false;
  } catch (error) {
    return {
      action,
      status: 'error',
      query,
      error: error.message,
    };
  }

  if (!tweets || tweets.length === 0) {
    if (rateLimited) {
      return {
        action,
        status: 'skipped',
        reason: `Twitter rate limited for query: ${query}`,
        rate_limited: true,
      };
    }
    return {
      action,
      status: 'skipped',
      reason: `No tweets found for query: ${query}`,
    };
  }

  // Filter by quality (skip spam patterns)
  const qualityTweets = filterQualityPosts(tweets, config, 'twitter');
  if (qualityTweets.length === 0) {
    return {
      action,
      status: 'skipped',
      reason: `All tweets for query filtered by quality checks`,
      filtered: tweets.length,
    };
  }

  // Filter unengaged tweets and score by engagement metrics
  const unengagedTweets = [];
  for (const tweet of qualityTweets) {
    const engaged = await isEngaged('twitter', tweet.id, action);
    if (!engaged) {
      // Score by engagement: likes + retweets as proxy for quality
      const engagementScore = (tweet.public_metrics?.like_count || 0) +
                             (tweet.public_metrics?.retweet_count || 0) * 1.5;
      unengagedTweets.push({ ...tweet, engagementScore });
    }
  }

  if (unengagedTweets.length === 0) {
    return {
      action,
      status: 'skipped',
      reason: `All tweets from query already engaged`,
    };
  }

  // Sort by engagement score descending and pick best tweet
  unengagedTweets.sort((a, b) => b.engagementScore - a.engagementScore);
  const tweet = unengagedTweets[0];

  try {
    if (action === 'like') {
      await likeTweet(tweet.id);
      await markEngaged('twitter', tweet.id, 'like');
      await incrementEngagementCounter('twitter', 'like');

      await logEngagement({
        platform: 'twitter',
        action: 'like',
        query,
        tweetId: tweet.id,
        author: tweet.author_username,
        triggerType: 'cron',
      });

      return {
        action: 'like',
        status: 'success',
        query,
        tweetId: tweet.id,
        author: tweet.author_username,
        count: likeCount + 1,
        limit: config.twitter.likeDaily,
      };
    } else {
      // Reply
      const template = randomItem(config.twitter.replyTemplates);
      await replyToTweet(tweet.id, template);
      await markEngaged('twitter', tweet.id, 'reply');
      await incrementEngagementCounter('twitter', 'reply');

      await logEngagement({
        platform: 'twitter',
        action: 'reply',
        query,
        tweetId: tweet.id,
        author: tweet.author_username,
        text: template,
        triggerType: 'cron',
      });

      return {
        action: 'reply',
        status: 'success',
        query,
        tweetId: tweet.id,
        author: tweet.author_username,
        text: template,
        count: replyCount + 1,
        limit: config.twitter.replyDaily,
      };
    }
  } catch (error) {
    return {
      action,
      status: 'error',
      query,
      error: error.message,
    };
  }
}
