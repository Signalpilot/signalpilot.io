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
 * Upload media (image) to Twitter via v1 media endpoint
 * @param {Buffer} imageBuffer - PNG/JPG image buffer
 * @param {string} [mimeType='image/png'] - MIME type
 * @returns {string} mediaId
 */
async function uploadMedia(imageBuffer, mimeType = 'image/png') {
  const tw = getClient();
  const mediaId = await tw.v1.uploadMedia(imageBuffer, { mimeType });
  return mediaId;
}

/**
 * Post a single tweet
 * @param {string} text - Tweet text (max 280 chars)
 * @param {string|null} [mediaId=null] - Optional media ID to attach
 * @returns {{ tweetId: string, url: string }}
 */
async function postTweet(text, mediaId = null) {
  const tw = getClient();
  const payload = mediaId
    ? { text, media: { media_ids: [mediaId] } }
    : text;
  const result = await tw.v2.tweet(payload);
  return {
    tweetId: result.data.id,
    url: `https://x.com/i/status/${result.data.id}`,
  };
}

/**
 * Post a thread (array of tweets, each replying to the previous)
 * @param {string[]} tweets - Array of tweet texts
 * @param {string|null} [mediaId=null] - Optional media ID for the first tweet
 * @returns {{ tweetIds: string[], threadUrl: string }}
 */
async function postThread(tweets, mediaId = null) {
  if (!tweets || tweets.length === 0) {
    throw new Error('No tweets provided for thread');
  }

  const tw = getClient();
  const tweetIds = [];

  // Post first tweet (with optional image)
  const firstPayload = mediaId
    ? { text: tweets[0], media: { media_ids: [mediaId] } }
    : tweets[0];
  const first = await tw.v2.tweet(firstPayload);
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

export {
  uploadMedia,
  postTweet,
  postThread,
  verifyCredentials,
};
