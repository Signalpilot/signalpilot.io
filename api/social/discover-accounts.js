// POST /api/social/discover-accounts
// Phase 3: Discover high-engagement trading accounts on Instagram/Twitter
// Uses platform APIs to find relevant accounts by hashtag/search

import {
  logEngagement,
} from '../../lib/social/queue-manager.js';
import {
  getAccountInfo,
} from '../../lib/social/instagram-client.js';
import {
  searchTweets,
  getUserTimeline,
} from '../../lib/social/twitter-client.js';

export default async function handler(req, res) {
  try {
    const { token, platform } = req.query;

    if (token !== process.env.ROBOT_TOKEN) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!platform || !['instagram', 'twitter'].includes(platform)) {
      return res.status(400).json({ error: 'platform must be instagram or twitter' });
    }

    let accounts;

    if (platform === 'instagram') {
      accounts = await discoverInstagramAccounts();
    } else {
      accounts = await discoverTwitterAccounts();
    }

    return res.status(200).json({
      success: true,
      platform,
      discovered: accounts.length,
      accounts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Account discovery error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Discover Instagram accounts from hashtags
 * Returns accounts sorted by engagement quality
 */
async function discoverInstagramAccounts() {
  const keywords = [
    'trading_psychology',
    'technical_analysis',
    'market_structure',
    'price_action',
    'risk_management',
    'chart_pattern',
    'trading_education'
  ];

  const accounts = [];
  const seenUsernames = new Set();

  for (const keyword of keywords) {
    try {
      // Note: This would require actual hashtag search API
      // For now, return pre-curated list based on known high-performers
      // In production, expand based on API results
    } catch (error) {
      console.error(`Error searching keyword ${keyword}:`, error);
    }
  }

  // Pre-curated high-performers in trading space
  const highPerformers = [
    'tradingview',
    'investopedia',
    'stockmarkettoday',
    'trading.psychology',
    'technical_analysts',
    'chartpatterns',
    'price_action_trader',
    'market_microstructure',
    'volatility_education',
    'orderflow_analysis'
  ];

  for (const username of highPerformers) {
    if (seenUsernames.has(username)) continue;
    seenUsernames.add(username);

    try {
      const info = await getAccountInfo(username);
      if (info) {
        accounts.push({
          username: info.username,
          name: info.name,
          followers: info.followers_count || 0,
          bio: info.biography?.substring(0, 100),
          url: info.website,
          quality_score: calculateQualityScore(info),
          category: 'trading_education',
          discoveredAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(`Failed to get info for @${username}:`, error.message);
    }
  }

  // Sort by quality score (followers * engagement rate estimate)
  return accounts
    .sort((a, b) => b.quality_score - a.quality_score)
    .slice(0, 20);
}

/**
 * Discover Twitter accounts from search queries
 */
async function discoverTwitterAccounts() {
  const queries = [
    'technical analysis -filter:retweets lang:en',
    'trading strategy -filter:retweets lang:en',
    'price action -filter:retweets lang:en',
    'market structure -filter:retweets lang:en',
    'risk management trader -filter:retweets lang:en'
  ];

  const accounts = {};
  const seenAccounts = new Set();

  for (const query of queries) {
    try {
      const result = await searchTweets(query, 30);
      if (result.tweets) {
        for (const tweet of result.tweets) {
          if (!seenAccounts.has(tweet.author_username)) {
            seenAccounts.add(tweet.author_username);
            const key = tweet.author_username;
            if (!accounts[key]) {
              accounts[key] = {
                username: tweet.author_username,
                engagement_count: 0,
                recent_tweets: [],
              };
            }
            accounts[key].engagement_count++;
            accounts[key].recent_tweets.push({
              text: tweet.text.substring(0, 100),
              timestamp: tweet.created_at,
              metrics: tweet.metrics,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error searching query "${query}":`, error.message);
    }
  }

  // Convert to array and score
  const accountList = Object.values(accounts)
    .map(acc => ({
      ...acc,
      quality_score: acc.engagement_count * (acc.recent_tweets[0]?.metrics?.like_count || 1),
      category: 'trading_education',
      discoveredAt: new Date().toISOString(),
    }))
    .sort((a, b) => b.quality_score - a.quality_score)
    .slice(0, 20);

  return accountList;
}

/**
 * Calculate account quality score
 * Factors: followers, bio keywords, verification status
 */
function calculateQualityScore(accountInfo) {
  let score = 0;

  // Base score from followers
  const followers = accountInfo.followers_count || 0;
  if (followers > 100000) score += 100;
  else if (followers > 50000) score += 75;
  else if (followers > 10000) score += 50;
  else if (followers > 1000) score += 25;

  // Bonus for trading-related keywords in bio
  const bio = (accountInfo.biography || '').toLowerCase();
  const tradingKeywords = ['trade', 'trading', 'analysis', 'technical', 'price', 'chart', 'market', 'strategy'];
  const matchedKeywords = tradingKeywords.filter(kw => bio.includes(kw)).length;
  score += matchedKeywords * 10;

  // Bonus for official account
  if (accountInfo.is_verified) score += 50;

  return score;
}
