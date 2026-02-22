// POST /api/social/cron-engage
// Automated engagement trigger (should be called via Vercel cron)
// Runs engagement actions based on config

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  getEngagementCount,
  logEngagement,
} from '../../lib/social/queue-manager.js';
import {
  likePost,
  getAccountPosts,
} from '../../lib/social/instagram-client.js';
import {
  likeTweet,
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

/**
 * Pick random item from array
 */
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Check if current time is within active hours
 */
function isActiveHour(config) {
  if (!config.scheduling?.activeHours) return true;
  const now = new Date();
  const hour = now.getUTCHours();
  return config.scheduling.activeHours.includes(hour);
}

export default async function handler(req, res) {
  try {
    const { token } = req.query;

    // Verify token (can be from CRON_SECRET or ROBOT_TOKEN)
    const validToken = token === process.env.ROBOT_TOKEN ||
                       token === process.env.CRON_SECRET;

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

    if (!isActiveHour(config)) {
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

    // Handle Instagram engagement
    if (config.instagram?.enabled) {
      try {
        const igResult = await handleInstagramEngagement(config);
        results.instagram = igResult;
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

    // Handle Twitter engagement
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

/**
 * Handle Instagram engagement via cron
 */
async function handleInstagramEngagement(config) {
  const likeCount = await getEngagementCount('instagram', 'like');

  if (likeCount >= config.instagram.likeDaily) {
    return {
      action: 'like',
      status: 'skipped',
      reason: 'Daily limit reached',
      currentCount: likeCount,
      limit: config.instagram.likeDaily,
    };
  }

  // Pick a random target (account or hashtag)
  const targets = config.instagram.targets || [];
  if (targets.length === 0) {
    return {
      action: 'like',
      status: 'skipped',
      reason: 'No targets configured',
    };
  }

  const target = randomItem(targets);
  let posts = [];

  try {
    if (target.type === 'account') {
      const result = await getAccountPosts(target.value, 5);
      posts = result.posts || [];
    } else if (target.type === 'hashtag') {
      // For hashtags, would need to use searchPostsByHashtag
      // For now, skip hashtags in cron (less reliable)
      return {
        action: 'like',
        status: 'skipped',
        reason: 'Hashtag engagement not yet supported in cron',
      };
    }
  } catch (error) {
    return {
      action: 'like',
      status: 'error',
      error: error.message,
    };
  }

  if (!posts || posts.length === 0) {
    return {
      action: 'like',
      status: 'skipped',
      reason: `No posts found for ${target.type}: ${target.value}`,
    };
  }

  // Like a random post from the selection
  const post = randomItem(posts);
  try {
    await likePost(post.id);

    await logEngagement({
      platform: 'instagram',
      action: 'like',
      target: target.value,
      mediaId: post.id,
      caption: post.caption?.substring(0, 100),
      triggerType: 'cron',
    });

    return {
      action: 'like',
      status: 'success',
      target: target.value,
      mediaId: post.id,
      caption: post.caption,
      newCount: likeCount + 1,
      limit: config.instagram.likeDaily,
    };
  } catch (error) {
    return {
      action: 'like',
      status: 'error',
      target: target.value,
      error: error.message,
    };
  }
}

/**
 * Handle Twitter engagement via cron
 */
async function handleTwitterEngagement(config) {
  const likeCount = await getEngagementCount('twitter', 'like');

  if (likeCount >= config.twitter.likeDaily) {
    return {
      action: 'like',
      status: 'skipped',
      reason: 'Daily limit reached',
      currentCount: likeCount,
      limit: config.twitter.likeDaily,
    };
  }

  // Pick a random search query
  const queries = config.twitter.searchQueries || [];
  if (queries.length === 0) {
    return {
      action: 'like',
      status: 'skipped',
      reason: 'No search queries configured',
    };
  }

  const query = randomItem(queries);
  let tweets = [];

  try {
    const result = await searchTweets(query, 15);
    tweets = result.tweets || [];
  } catch (error) {
    return {
      action: 'like',
      status: 'error',
      query,
      error: error.message,
    };
  }

  if (!tweets || tweets.length === 0) {
    return {
      action: 'like',
      status: 'skipped',
      reason: `No tweets found for query: ${query}`,
    };
  }

  // Like a random tweet from the selection
  const tweet = randomItem(tweets);
  try {
    await likeTweet(tweet.id);

    await logEngagement({
      platform: 'twitter',
      action: 'like',
      query,
      tweetId: tweet.id,
      author: tweet.author_username,
      text: tweet.text.substring(0, 100),
      triggerType: 'cron',
    });

    return {
      action: 'like',
      status: 'success',
      query,
      tweetId: tweet.id,
      author: tweet.author_username,
      text: tweet.text,
      newCount: likeCount + 1,
      limit: config.twitter.likeDaily,
      url: `https://x.com/${tweet.author_username}/status/${tweet.id}`,
    };
  } catch (error) {
    return {
      action: 'like',
      status: 'error',
      query,
      error: error.message,
    };
  }
}
