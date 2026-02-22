// Engagement Analytics Utilities
// Advanced metrics for monitoring engagement trends and performance

/**
 * Calculate engagement velocity (trend over time)
 * Returns rate of change to detect if engagement is accelerating or slowing
 */
export function calculateEngagementVelocity(engagementLog) {
  if (engagementLog.length < 2) return 0;

  // Group by day
  const byDay = {};
  for (const entry of engagementLog) {
    const day = entry.timestamp?.slice(0, 10);
    if (!day) continue;
    if (!byDay[day]) byDay[day] = 0;
    byDay[day]++;
  }

  const days = Object.keys(byDay).sort();
  if (days.length < 2) return 0;

  // Calculate trend: (latest - oldest) / oldest
  const oldest = byDay[days[0]];
  const latest = byDay[days[days.length - 1]];
  return ((latest - oldest) / oldest) * 100; // percent change
}

/**
 * Detect target fatigue - when engagement on a target is slowing
 */
export function detectTargetFatigue(targetEngagementLog, threshold = 0.5) {
  if (targetEngagementLog.length < 10) return null; // Need sufficient data

  // Split into two halves
  const mid = Math.floor(targetEngagementLog.length / 2);
  const firstHalf = targetEngagementLog.slice(0, mid);
  const secondHalf = targetEngagementLog.slice(mid);

  const avgFirst = firstHalf.length / (firstHalf.length || 1);
  const avgSecond = secondHalf.length / (secondHalf.length || 1);

  // If second half engagement < 50% of first half, target is fatigued
  if (avgSecond < avgFirst * threshold) {
    return {
      isFatigued: true,
      decline: ((avgFirst - avgSecond) / avgFirst * 100).toFixed(1),
      recommendation: 'Reduce engagement frequency or pause this target',
    };
  }

  return { isFatigued: false };
}

/**
 * Calculate success rate with confidence interval
 * Uses Wilson score interval for more accurate confidence estimation
 */
export function calculateSuccessRateCI(successes, failures, confidenceLevel = 0.95) {
  const n = successes + failures;
  if (n === 0) return { rate: 0, ci_lower: 0, ci_upper: 0, samples: 0 };

  const p = successes / n;
  const z = confidenceLevel === 0.95 ? 1.96 : 2.576; // z-score

  // Wilson score interval
  const denominator = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denominator;
  const margin = z * Math.sqrt((p * (1 - p) / n) + (z * z) / (4 * n * n)) / denominator;

  return {
    rate: (p * 100).toFixed(1),
    ci_lower: Math.max(0, (center - margin) * 100).toFixed(1),
    ci_upper: Math.min(100, (center + margin) * 100).toFixed(1),
    samples: n,
    significant: n >= 30, // Need 30+ samples for statistical significance
  };
}

/**
 * Identify emerging templates - templates gaining momentum
 */
export function identifyEmergingTemplates(templatePerformance) {
  const recent = templatePerformance.slice(0, 10); // Last 10
  const older = templatePerformance.slice(10, 20); // Previous 10

  if (recent.length < 5 || older.length < 5) return [];

  const recentAvg = recent.reduce((sum, t) => sum + t.average, 0) / recent.length;
  const olderAvg = older.reduce((sum, t) => sum + t.average, 0) / older.length;

  return recent.filter(t => {
    const improvement = t.average - (olderAvg - recentAvg);
    return improvement > 2; // Significantly better than trend
  });
}

/**
 * Calculate engagement ROI per target
 * Based on engagement count and target quality indicators
 */
export function calculateTargetROI(targetEngagements, targetMetrics) {
  if (!targetEngagements || targetEngagements.length === 0) {
    return { roi: 0, efficiency: 'unknown' };
  }

  // Simple ROI: engagements / (followers * post frequency)
  const engagementCount = targetEngagements.length;
  const followers = targetMetrics?.followers || 1000;
  const estimate = (engagementCount / followers) * 100; // engagement rate %

  let efficiency = 'low';
  if (estimate > 1) efficiency = 'high';
  else if (estimate > 0.5) efficiency = 'medium';

  return {
    roi: estimate.toFixed(2),
    efficiency,
    suggestion: efficiency === 'high' ? 'Increase engagement frequency' : 'Consider replacing with better target',
  };
}

/**
 * Batch quality score for multiple templates
 * Considers score, sample size, recency
 */
export function scoreTemplateQuality(template, recentTemplates) {
  let score = template.average || 0;

  // Penalize low sample size
  if (template.count < 3) score *= 0.5;
  else if (template.count < 10) score *= 0.8;

  // Bonus for templates used recently (prove they still work)
  const isRecent = recentTemplates.some(t => t.template === template.template);
  if (isRecent) score *= 1.1;

  return Math.min(10, score);
}

/**
 * Get engagement health score (0-100)
 */
export function calculateEngagementHealth(analysis) {
  let score = 100;

  // Deduct for low success rates
  const igRate = parseFloat(analysis.byPlatform.instagram.successRate || 0);
  const twRate = parseFloat(analysis.byPlatform.twitter.successRate || 0);
  const avgRate = (igRate + twRate) / 2;

  if (avgRate < 50) score -= 40;
  else if (avgRate < 70) score -= 20;

  // Deduct for low daily engagement
  if (analysis.avgDailyEngagement < 2) score -= 20;
  else if (analysis.avgDailyEngagement < 5) score -= 10;

  // Bonus for diverse engagement
  const totalEngagements = analysis.totalEngagements || 0;
  const uniqueTargets = Object.keys(analysis.byTarget || {}).length;
  const diversity = uniqueTargets / Math.max(1, totalEngagements / 10);
  if (diversity > 0.5) score += 15;

  return Math.max(0, Math.min(100, Math.round(score)));
}
