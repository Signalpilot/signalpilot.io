// GET /api/social/intelligence-dashboard
// Phase 3: Performance analytics and AI recommendations
// Shows top templates, best targets, engagement quality

import {
  getTopTemplates,
  getTopTargets,
  getEngagementLog,
} from '../../lib/social/queue-manager.js';
import {
  calculateEngagementVelocity,
  calculateSuccessRateCI,
  identifyEmergingTemplates,
  calculateEngagementHealth,
} from '../../lib/social/engagement-analytics.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, days = 7 } = req.query;

    if (token !== process.env.ROBOT_TOKEN) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get performance data
    const igTopTemplates = await getTopTemplates('instagram', 10);
    const twTopTemplates = await getTopTemplates('twitter', 10);
    const igTopTargets = await getTopTargets('instagram', 15);
    const twTopTargets = await getTopTargets('twitter', 15);

    // Get engagement log to analyze
    const log = await getEngagementLog(500);

    // Analyze engagement patterns
    const analysis = analyzeEngagementPatterns(log, parseInt(days));

    // Generate recommendations
    const recommendations = generateRecommendations(
      igTopTemplates,
      twTopTemplates,
      igTopTargets,
      twTopTargets,
      analysis
    );

    return res.status(200).json({
      success: true,
      period: { days: parseInt(days) },
      timestamp: new Date().toISOString(),
      instagram: {
        topTemplates: igTopTemplates,
        topTargets: igTopTargets,
      },
      twitter: {
        topTemplates: twTopTemplates,
        topTargets: twTopTargets,
      },
      analysis,
      recommendations,
    });
  } catch (error) {
    console.error('Intelligence dashboard error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Analyze engagement patterns over time
 */
function analyzeEngagementPatterns(log, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const recentLog = log.filter(entry => {
    const entryDate = entry.timestamp?.slice(0, 10);
    return entryDate >= cutoffStr;
  });

  const stats = {
    totalEngagements: recentLog.length,
    byPlatform: {
      instagram: {
        likes: 0,
        comments: 0,
        successRate: 0,
      },
      twitter: {
        likes: 0,
        replies: 0,
        successRate: 0,
      },
    },
    byTarget: {},
    bestPerformingTargets: [],
    bestPerformingTemplates: [],
    successRate: 0,
    avgDailyEngagement: 0,
  };

  let instagramSuccesses = 0;
  let twitterSuccesses = 0;
  let instagramTotal = 0;
  let twitterTotal = 0;

  // Aggregate by platform and target
  for (const entry of recentLog) {
    // Track failures and retry failures
    const isFailed = entry.action === 'engagement_error' ||
                     entry.action === 'cron_error' ||
                     entry.action === 'engagement_retry_failed_attempt';

    const platform = entry.platform;
    const target = entry.target || entry.query || 'unknown';

    if (platform === 'instagram') {
      // Count actual engagement actions (not errors or retries)
      if (entry.action === 'like') {
        stats.byPlatform.instagram.likes++;
        instagramTotal++;
        if (!isFailed) instagramSuccesses++;
      } else if (entry.action === 'comment') {
        stats.byPlatform.instagram.comments++;
        instagramTotal++;
        if (!isFailed) instagramSuccesses++;
      } else if (isFailed) {
        // Count failed attempts
        instagramTotal++;
      }
    } else if (platform === 'twitter') {
      // Count actual engagement actions (not errors or retries)
      if (entry.action === 'like') {
        stats.byPlatform.twitter.likes++;
        twitterTotal++;
        if (!isFailed) twitterSuccesses++;
      } else if (entry.action === 'reply') {
        stats.byPlatform.twitter.replies++;
        twitterTotal++;
        if (!isFailed) twitterSuccesses++;
      } else if (isFailed) {
        // Count failed attempts
        twitterTotal++;
      }
    }

    // Track by target (excluding errors)
    if (!isFailed && target !== 'unknown') {
      if (!stats.byTarget[target]) {
        stats.byTarget[target] = { count: 0, platform };
      }
      stats.byTarget[target].count++;
    }
  }

  // Calculate success rates
  stats.byPlatform.instagram.successRate = instagramTotal > 0
    ? ((instagramSuccesses / instagramTotal) * 100).toFixed(1)
    : 0;
  stats.byPlatform.twitter.successRate = twitterTotal > 0
    ? ((twitterSuccesses / twitterTotal) * 100).toFixed(1)
    : 0;

  stats.successRate = recentLog.length > 0
    ? (((instagramSuccesses + twitterSuccesses) / (instagramTotal + twitterTotal)) * 100).toFixed(1)
    : 0;

  stats.avgDailyEngagement = days > 0
    ? (recentLog.length / days).toFixed(1)
    : 0;

  // Top targets by engagement count
  stats.bestPerformingTargets = Object.entries(stats.byTarget)
    .map(([target, data]) => ({ target, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Advanced analytics
  stats.velocity = calculateEngagementVelocity(recentLog);
  stats.health = calculateEngagementHealth(stats);

  // Calculate confidence intervals for success rates
  const igTotal = stats.byPlatform.instagram.likes + stats.byPlatform.instagram.comments;
  const twTotal = stats.byPlatform.twitter.likes + stats.byPlatform.twitter.replies;

  stats.confidenceIntervals = {
    instagram: calculateSuccessRateCI(
      instagramSuccesses,
      igTotal - instagramSuccesses
    ),
    twitter: calculateSuccessRateCI(
      twitterSuccesses,
      twTotal - twitterSuccesses
    ),
  };

  return stats;
}

/**
 * Generate AI recommendations
 */
function generateRecommendations(igTemplates, twTemplates, igTargets, twTargets, analysis) {
  const recommendations = {
    summary: '',
    actions: [],
    warnings: [],
    opportunities: [],
  };

  // Template recommendations (only high-sample templates)
  if (igTemplates.length > 0) {
    const topIg = igTemplates[0];
    if (topIg.count >= 3) {
      recommendations.actions.push({
        priority: 'high',
        action: 'Promote top Instagram template',
        detail: `"${topIg.template}" has highest engagement (${topIg.average}/10 score, ${topIg.count} samples)`,
        impact: 'Increase success rate by using proven templates more often',
        confidence: topIg.count >= 10 ? 'High' : topIg.count >= 5 ? 'Medium' : 'Low',
      });
    }
  }

  if (twTemplates.length > 0) {
    const topTw = twTemplates[0];
    if (topTw.count >= 3) {
      recommendations.actions.push({
        priority: 'high',
        action: 'Promote top Twitter template',
        detail: `"${topTw.template}" performs best (${topTw.average}/10 score, ${topTw.count} samples)`,
        impact: 'Prioritize this template for better engagement',
        confidence: topTw.count >= 10 ? 'High' : topTw.count >= 5 ? 'Medium' : 'Low',
      });
    }
  }

  // Target recommendations (with sample size indicators)
  if (igTargets.length > 0) {
    const topTarget = igTargets[0];
    recommendations.actions.push({
      priority: 'medium',
      action: 'Focus on high-ROI Instagram targets',
      detail: `${topTarget.target} has ${topTarget.count} engagements with ${topTarget.average}/10 score`,
      impact: 'Allocate more engagement budget to this account',
      confidence: topTarget.count >= 20 ? 'High' : topTarget.count >= 10 ? 'Medium' : 'Low',
    });
  }

  // Success rate warnings (contextualized)
  if (analysis.byPlatform.instagram.successRate < 70) {
    recommendations.warnings.push({
      severity: analysis.byPlatform.instagram.successRate < 50 ? 'high' : 'medium',
      issue: `Instagram success rate ${analysis.byPlatform.instagram.successRate}% (below 70%)`,
      cause: 'Possible API limits, rate limiting, or invalid targets',
      action: 'Check engagement logs for errors and update targets',
    });
  }

  if (analysis.byPlatform.twitter.successRate < 70) {
    recommendations.warnings.push({
      severity: analysis.byPlatform.twitter.successRate < 50 ? 'high' : 'medium',
      issue: `Twitter success rate ${analysis.byPlatform.twitter.successRate}% (below 70%)`,
      cause: 'Tweet deletion, rate limits, or deleted accounts',
      action: 'Monitor for deleted tweets and adjust search queries',
    });
  }

  // Opportunity detection
  if (igTargets.length > 5) {
    const lowPerformers = igTargets.slice(-3);
    const lowAverage = lowPerformers.reduce((sum, t) => sum + t.average, 0) / lowPerformers.length;
    recommendations.opportunities.push({
      type: 'optimization',
      suggestion: 'Replace low-performing Instagram targets',
      detail: `${lowPerformers.map(t => t.target).join(', ')} have avg score ${lowAverage.toFixed(1)}/10`,
      action: 'Use discover-accounts API to find better targets',
      potentialGain: 'Increase engagement efficiency by 20-40%',
    });
  }

  if (analysis.avgDailyEngagement < 5) {
    recommendations.opportunities.push({
      type: 'growth',
      suggestion: 'Increase engagement activity',
      detail: `Current average is ${analysis.avgDailyEngagement} engagements/day (capacity: ${analysis.byPlatform.instagram.likes + analysis.byPlatform.instagram.comments + analysis.byPlatform.twitter.likes + analysis.byPlatform.twitter.replies} possible)`,
      action: 'Review daily limits or increase cron frequency',
      potentialGain: 'More account visibility and relationship building',
    });
  }

  // Generate summary
  const summaryParts = [];
  if (analysis.successRate >= 80) {
    summaryParts.push('✓ Engagement system performing well');
  } else {
    summaryParts.push('Engagement system needs optimization');
  }
  summaryParts.push(`${analysis.avgDailyEngagement} engagements/day on average`);
  summaryParts.push(`${recommendations.actions.length} optimization opportunities`);

  recommendations.summary = summaryParts.join('. ');

  return recommendations;
}
