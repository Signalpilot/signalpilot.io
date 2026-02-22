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

/**
 * ADVANCED: Time-of-day optimization
 * Analyzes when targets are most active and returns best engagement windows
 */
export function analyzeTargetActivityHours(targetEngagements) {
  if (!targetEngagements || targetEngagements.length < 5) {
    return { sufficient_data: false, recommendation: 'Need 5+ engagements to analyze' };
  }

  const hourCounts = {};
  const hourSuccessRates = {};

  for (const engagement of targetEngagements) {
    const date = new Date(engagement.timestamp);
    const hour = date.getUTCHours();

    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    hourSuccessRates[hour] = (hourSuccessRates[hour] || 0) + (engagement.success ? 1 : 0);
  }

  // Calculate success rate per hour
  const hourStats = Object.entries(hourCounts).map(([hour, count]) => ({
    hour: parseInt(hour),
    engagements: count,
    successRate: ((hourSuccessRates[hour] || 0) / count * 100).toFixed(1),
  })).sort((a, b) => b.engagements - a.engagements);

  return {
    sufficient_data: true,
    best_hours: hourStats.slice(0, 3).map(h => h.hour),
    peak_hour: hourStats[0]?.hour,
    statistics: hourStats.slice(0, 5),
    recommendation: `Best engagement at hours: ${hourStats.slice(0, 3).map(h => h.hour).join(', ')} UTC`,
  };
}

/**
 * ADVANCED: Engagement decay detection
 * Identifies when targets stop responding to engagement
 */
export function detectTargetDecay(targetEngagementHistory, decayThreshold = 0.5) {
  if (!targetEngagementHistory || targetEngagementHistory.length < 10) {
    return { sufficient_data: false, recommendation: 'Need 10+ engagements to detect decay' };
  }

  // Split into 3 periods
  const period = Math.floor(targetEngagementHistory.length / 3);
  const oldestPeriod = targetEngagementHistory.slice(0, period);
  const middlePeriod = targetEngagementHistory.slice(period, period * 2);
  const recentPeriod = targetEngagementHistory.slice(period * 2);

  // Calculate success rates per period
  const oldRate = oldestPeriod.filter(e => e.success).length / oldestPeriod.length;
  const middleRate = middlePeriod.filter(e => e.success).length / middlePeriod.length;
  const recentRate = recentPeriod.filter(e => e.success).length / recentPeriod.length;

  // Detect decay: recent < decay_threshold of middle period
  const isDecaying = recentRate < middleRate * decayThreshold;

  return {
    sufficient_data: true,
    is_decaying: isDecaying,
    old_success_rate: (oldRate * 100).toFixed(1),
    middle_success_rate: (middleRate * 100).toFixed(1),
    recent_success_rate: (recentRate * 100).toFixed(1),
    decline_percent: isDecaying ? ((middleRate - recentRate) / middleRate * 100).toFixed(1) : 0,
    recommendation: isDecaying
      ? `⚠️ Target showing ${((middleRate - recentRate) / middleRate * 100).toFixed(0)}% engagement decline. Consider rotating.`
      : '✓ Target engagement stable',
  };
}

/**
 * ADVANCED: Thompson Sampling (simple multi-armed bandit)
 * Selects templates probabilistically based on performance
 */
export function thompsonSamplingSelection(templates) {
  if (!templates || templates.length === 0) return null;

  // Sample from beta distribution for each template
  // Beta parameters: α = successes + 1, β = failures + 1
  const samples = templates.map(template => {
    const successes = template.count * (template.average / 10);
    const failures = template.count - successes;

    // Simple Bayesian approach: use posterior mean
    const alpha = successes + 1;
    const beta = failures + 1;
    const posteriorMean = alpha / (alpha + beta);

    return {
      ...template,
      sample_value: posteriorMean,
      confidence: (template.count >= 10 ? 'high' : template.count >= 5 ? 'medium' : 'low'),
    };
  });

  // Sort by sampled value (highest = most likely to be best)
  samples.sort((a, b) => b.sample_value - a.sample_value);

  return {
    selected_template: samples[0],
    top_3_candidates: samples.slice(0, 3),
    all_samples: samples,
    recommendation: `Use "${samples[0].template}" (${(samples[0].sample_value * 100).toFixed(1)}% estimated success rate)`,
  };
}

/**
 * ADVANCED: Basic seasonal pattern detection
 * Detects patterns by day of week and week of year
 */
export function detectSeasonalPatterns(engagementLog) {
  if (!engagementLog || engagementLog.length < 20) {
    return { sufficient_data: false, recommendation: 'Need 20+ engagements to detect patterns' };
  }

  const dayOfWeekStats = {};
  const weekOfYearStats = {};

  for (const entry of engagementLog) {
    const date = new Date(entry.timestamp);
    const dayOfWeek = date.getUTCDay(); // 0-6
    const weekOfYear = Math.ceil((date - new Date(date.getUTCFullYear(), 0, 1)) / 86400000 / 7);

    // Track by day of week
    dayOfWeekStats[dayOfWeek] = (dayOfWeekStats[dayOfWeek] || 0) + 1;
    weekOfYearStats[weekOfYear] = (weekOfYearStats[weekOfYear] || 0) + 1;
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayStats = Object.entries(dayOfWeekStats)
    .map(([day, count]) => ({
      day: dayNames[parseInt(day)],
      engagements: count,
    }))
    .sort((a, b) => b.engagements - a.engagements);

  const weekStats = Object.entries(weekOfYearStats)
    .map(([week, count]) => ({
      week: parseInt(week),
      engagements: count,
    }))
    .sort((a, b) => b.engagements - a.engagements);

  return {
    sufficient_data: true,
    best_day_of_week: dayStats[0]?.day,
    worst_day_of_week: dayStats[dayStats.length - 1]?.day,
    day_breakdown: dayStats,
    peak_weeks: weekStats.slice(0, 3),
    recommendation: `Best engagement on ${dayStats[0]?.day}s (${dayStats[0]?.engagements} engagements). Lowest on ${dayStats[dayStats.length - 1]?.day}s.`,
  };
}
