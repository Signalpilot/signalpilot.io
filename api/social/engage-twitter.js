// POST /api/social/engage-twitter
// Engagement endpoint for Twitter auto-like/reply actions
// Actions: like, reply to tweets matching search queries or from target accounts

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  markEngaged,
  isEngaged,
  incrementEngagementCounter,
  getEngagementCount,
  logEngagement,
} from '../../lib/social/queue-manager.js';
import {
  likeTweet,
  replyToTweet,
  searchTweets,
  getUserTimeline,
} from '../../lib/social/twitter-client.js';

function loadConfig() {
  try {
    const configPath = join(process.cwd(), 'data', 'social', 'engagement-config.json');
    return JSON.parse(readFileSync(configPath, 'utf-8'));
  } catch (error) {
    console.error('Failed to load engagement config:', error);
    return { twitter: { likeDaily: 75, replyDaily: 15 } };
  }
}

/**
 * Engage on Twitter (like/reply)
 * Query params:
 *   action: 'like' | 'reply'
 *   target: search query or 'user:USERNAME' for timeline
 *   text: (required for reply action) Reply text
 *   token: API token for auth
 */
export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, target, text, token } = req.query;
    const config = loadConfig();

    // Verify token
    if (token !== process.env.ROBOT_TOKEN) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Validate action
    if (!action || !['like', 'reply'].includes(action)) {
      return res.status(400).json({ error: 'action must be "like" or "reply"' });
    }

    if (!target) {
      return res.status(400).json({ error: 'target required (search query or user:USERNAME)' });
    }

    if (action === 'like') {
      return await handleLike(target, res, config);
    } else if (action === 'reply') {
      return await handleReply(target, text, res, config);
    }
  } catch (error) {
    console.error('Twitter engagement error:', error);
    await logEngagement({
      platform: 'twitter',
      action: 'engagement_error',
      error: error.message,
    });
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Handle like action
 * Target: search query or 'user:USERNAME'
 */
async function handleLike(target, res, config) {
  const DAILY_LIKE_LIMIT = config.twitter.likeDaily;

  // Check daily limit
  const likeCount = await getEngagementCount('twitter', 'like');
  if (likeCount >= DAILY_LIKE_LIMIT) {
    return res.status(429).json({
      error: `Daily like limit (${DAILY_LIKE_LIMIT}) reached`,
      currentCount: likeCount,
    });
  }

  let tweets = [];

  try {
    if (target.startsWith('user:')) {
      // Get tweets from user timeline
      const username = target.replace('user:', '');
      const result = await getUserTimeline(username, 5);
      tweets = result.tweets || [];
    } else {
      // Search for tweets
      const result = await searchTweets(target, 10);
      tweets = result.tweets || [];
    }
  } catch (error) {
    return res.status(400).json({ error: `Failed to fetch tweets: ${error.message}` });
  }

  if (!tweets || tweets.length === 0) {
    return res.status(404).json({ error: 'No tweets found for target' });
  }

  // Filter out already-liked tweets
  const unlikedTweets = [];
  for (const tweet of tweets) {
    const alreadyLiked = await isEngaged('twitter', tweet.id, 'like');
    if (!alreadyLiked) {
      unlikedTweets.push(tweet);
    }
  }

  if (unlikedTweets.length === 0) {
    return res.status(409).json({ error: 'All tweets from target already liked' });
  }

  // Like the first unliked tweet
  const tweet = unlikedTweets[0];
  try {
    await likeTweet(tweet.id);
    await markEngaged('twitter', tweet.id, 'like');
    await incrementEngagementCounter('twitter', 'like');

    await logEngagement({
      platform: 'twitter',
      action: 'like',
      target,
      tweetId: tweet.id,
      author: tweet.author_username,
      text: tweet.text.substring(0, 100),
    });

    return res.status(200).json({
      success: true,
      action: 'like',
      tweetId: tweet.id,
      author: tweet.author_username,
      text: tweet.text,
      likeCount: likeCount + 1,
      dailyLimit: DAILY_LIKE_LIMIT,
      url: `https://x.com/${tweet.author_username}/status/${tweet.id}`,
    });
  } catch (error) {
    return res.status(500).json({ error: `Failed to like tweet: ${error.message}` });
  }
}

/**
 * Handle reply action
 */
async function handleReply(target, text, res, config) {
  if (!text) {
    return res.status(400).json({ error: 'text required for reply action' });
  }

  if (text.length > 280) {
    return res.status(400).json({ error: 'Reply text exceeds 280 character limit' });
  }

  const DAILY_REPLY_LIMIT = config.twitter.replyDaily;

  // Check daily limit
  const replyCount = await getEngagementCount('twitter', 'reply');
  if (replyCount >= DAILY_REPLY_LIMIT) {
    return res.status(429).json({
      error: `Daily reply limit (${DAILY_REPLY_LIMIT}) reached`,
      currentCount: replyCount,
    });
  }

  let tweets = [];

  try {
    if (target.startsWith('user:')) {
      // Get tweets from user timeline
      const username = target.replace('user:', '');
      const result = await getUserTimeline(username, 5);
      tweets = result.tweets || [];
    } else {
      // Search for tweets
      const result = await searchTweets(target, 10);
      tweets = result.tweets || [];
    }
  } catch (error) {
    return res.status(400).json({ error: `Failed to fetch tweets: ${error.message}` });
  }

  if (!tweets || tweets.length === 0) {
    return res.status(404).json({ error: 'No tweets found for target' });
  }

  // Filter out already-replied tweets
  const unrepliedTweets = [];
  for (const tweet of tweets) {
    const alreadyReplied = await isEngaged('twitter', tweet.id, 'reply');
    if (!alreadyReplied) {
      unrepliedTweets.push(tweet);
    }
  }

  if (unrepliedTweets.length === 0) {
    return res.status(409).json({ error: 'All tweets from target already replied to' });
  }

  // Reply to the first unreplied tweet
  const tweet = unrepliedTweets[0];
  try {
    const result = await replyToTweet(tweet.id, text);

    await markEngaged('twitter', tweet.id, 'reply');
    await incrementEngagementCounter('twitter', 'reply');

    await logEngagement({
      platform: 'twitter',
      action: 'reply',
      target,
      tweetId: tweet.id,
      replyId: result.tweetId,
      text,
    });

    return res.status(200).json({
      success: true,
      action: 'reply',
      repliedToTweetId: tweet.id,
      replyTweetId: result.tweetId,
      text,
      replyCount: replyCount + 1,
      dailyLimit: DAILY_REPLY_LIMIT,
      url: result.url,
    });
  } catch (error) {
    return res.status(500).json({ error: `Failed to reply: ${error.message}` });
  }
}
