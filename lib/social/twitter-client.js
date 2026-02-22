// Twitter Client: Posts threads and single tweets via Twitter API v2
// Uses the twitter-api-v2 package

import { TwitterApi } from 'twitter-api-v2';

let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.TWITTER_API_KEY;
    const apiSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_SECRET;

    if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
      throw new Error('Twitter API credentials not configured. Set TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET');
    }

    client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken,
      accessSecret,
    });
  }
  return client;
}

/**
 * Post a single tweet
 * @param {string} text - Tweet text (max 280 chars)
 * @returns {{ tweetId: string, url: string }}
 */
async function postTweet(text) {
  const tw = getClient();
  const result = await tw.v2.tweet(text);
  return {
    tweetId: result.data.id,
    url: `https://x.com/i/status/${result.data.id}`,
  };
}

/**
 * Post a thread (array of tweets, each replying to the previous)
 * @param {string[]} tweets - Array of tweet texts
 * @returns {{ tweetIds: string[], threadUrl: string }}
 */
async function postThread(tweets) {
  if (!tweets || tweets.length === 0) {
    throw new Error('No tweets provided for thread');
  }

  const tw = getClient();
  const tweetIds = [];

  // Post first tweet
  const first = await tw.v2.tweet(tweets[0]);
  tweetIds.push(first.data.id);

  // Post subsequent tweets as replies
  let previousId = first.data.id;
  for (let i = 1; i < tweets.length; i++) {
    const reply = await tw.v2.tweet(tweets[i], {
      reply: { in_reply_to_tweet_id: previousId },
    });
    tweetIds.push(reply.data.id);
    previousId = reply.data.id;
  }

  return {
    tweetIds,
    threadUrl: `https://x.com/i/status/${tweetIds[0]}`,
  };
}

/**
 * Verify credentials are valid
 * @returns {{ userId: string, username: string }}
 */
async function verifyCredentials() {
  const tw = getClient();
  const me = await tw.v2.me();
  return {
    userId: me.data.id,
    username: me.data.username,
  };
}

/**
 * Like a tweet
 * @param {string} tweetId - Tweet ID to like
 * @returns {{ liked: boolean }}
 */
async function likeTweet(tweetId) {
  const tw = getClient();
  const me = await tw.v2.me();
  const result = await tw.v2.like(me.data.id, tweetId);
  return { liked: result.data.liked };
}

/**
 * Unlike a tweet
 * @param {string} tweetId - Tweet ID to unlike
 * @returns {{ liked: boolean }}
 */
async function unlikeTweet(tweetId) {
  const tw = getClient();
  const me = await tw.v2.me();
  const result = await tw.v2.unlike(me.data.id, tweetId);
  return { liked: result.data.liked };
}

/**
 * Retweet a tweet
 * @param {string} tweetId - Tweet ID to retweet
 * @returns {{ retweeted: boolean }}
 */
async function retweetTweet(tweetId) {
  const tw = getClient();
  const me = await tw.v2.me();
  const result = await tw.v2.retweet(me.data.id, tweetId);
  return { retweeted: result.data.retweeted };
}

/**
 * Reply to a tweet
 * @param {string} tweetId - Tweet ID to reply to
 * @param {string} text - Reply text (max 280 chars)
 * @returns {{ tweetId: string, url: string }}
 */
async function replyToTweet(tweetId, text) {
  const tw = getClient();
  const result = await tw.v2.reply(text, tweetId);
  return {
    tweetId: result.data.id,
    url: `https://x.com/i/status/${result.data.id}`,
  };
}

/**
 * Search for tweets
 * @param {string} query - Search query (keywords, hashtags, from:user, etc)
 * @param {number} limit - Max results (default 10, max 100 for v2)
 * @returns {{ tweets: Array<{id, text, author_id, created_at}> }}
 */
async function searchTweets(query, limit = 10) {
  const tw = getClient();
  const result = await tw.v2.search(query, {
    'tweet.fields': ['author_id', 'created_at', 'public_metrics'],
    'user.fields': ['username'],
    expansions: ['author_id'],
    max_results: Math.min(limit, 100),
  });

  const users = result.includes?.users || [];
  const tweets = (result.data || []).map((tweet) => {
    const author = users.find((u) => u.id === tweet.author_id);
    return {
      id: tweet.id,
      text: tweet.text,
      author_id: tweet.author_id,
      author_username: author?.username,
      created_at: tweet.created_at,
      metrics: tweet.public_metrics,
    };
  });

  return { tweets, result_count: result.meta?.result_count || 0 };
}

/**
 * Get recent tweets from a user's timeline
 * @param {string} username - Twitter username (without @)
 * @param {number} limit - Max tweets to fetch (default 5)
 * @returns {{ username: string, userId: string, tweets: Array<{id, text, created_at}> }}
 */
async function getUserTimeline(username, limit = 5) {
  const tw = getClient();

  // Get user ID from username
  const userResult = await tw.v2.userByUsername(username, {
    'user.fields': ['username'],
  });

  if (!userResult.data) {
    throw new Error(`User @${username} not found`);
  }

  const userId = userResult.data.id;

  // Get user's timeline
  const tweetsResult = await tw.v2.userTimeline(userId, {
    'tweet.fields': ['created_at', 'public_metrics'],
    max_results: Math.min(limit, 100),
  });

  return {
    username,
    userId,
    tweets: (tweetsResult.data || []).map((tweet) => ({
      id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at,
      metrics: tweet.public_metrics,
    })),
  };
}

export {
  postTweet,
  postThread,
  verifyCredentials,
  likeTweet,
  unlikeTweet,
  retweetTweet,
  replyToTweet,
  searchTweets,
  getUserTimeline,
};
