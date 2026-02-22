// GET /api/social/advanced-optimization
// Advanced engagement optimization using machine learning techniques
// Provides: time optimization, decay detection, bandit selection, seasonal patterns

import {
  getEngagementLog,
  getTopTemplates,
  getTopTargets,
} from '../../lib/social/queue-manager.js';
import {
  analyzeTargetActivityHours,
  detectTargetDecay,
  thompsonSamplingSelection,
  detectSeasonalPatterns,
} from '../../lib/social/engagement-analytics.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, analysis_type = 'all', target } = req.query;

    if (token !== process.env.ROBOT_TOKEN) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const log = await getEngagementLog(500);
    if (!log || log.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No engagement data available yet',
        recommendation: 'Run cron-engage for 1-2 days to generate data',
      });
    }

    const results = {
      timestamp: new Date().toISOString(),
      analysis_type,
      data: {},
    };

    // Analysis 1: Time-of-day optimization
    if (analysis_type === 'all' || analysis_type === 'time') {
      const targetLog = target
        ? log.filter(e => (e.target || e.query) === target)
        : log;

      results.data.time_optimization = analyzeTargetActivityHours(targetLog);
    }

    // Analysis 2: Engagement decay detection
    if (analysis_type === 'all' || analysis_type === 'decay') {
      const targetLog = target
        ? log.filter(e => (e.target || e.query) === target)
        : log;

      results.data.decay_analysis = detectTargetDecay(targetLog);
    }

    // Analysis 3: Thompson sampling for template selection
    if (analysis_type === 'all' || analysis_type === 'bandit') {
      const igTemplates = await getTopTemplates('instagram', 20);
      const twTemplates = await getTopTemplates('twitter', 20);

      results.data.template_optimization = {
        instagram: thompsonSamplingSelection(igTemplates),
        twitter: thompsonSamplingSelection(twTemplates),
      };
    }

    // Analysis 4: Seasonal patterns
    if (analysis_type === 'all' || analysis_type === 'seasonal') {
      results.data.seasonal_patterns = detectSeasonalPatterns(log);
    }

    // Overall recommendations
    results.recommendations = generateAdvancedRecommendations(results.data);

    return res.status(200).json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error('Advanced optimization error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Generate actionable recommendations from analysis results
 */
function generateAdvancedRecommendations(analysisData) {
  const recommendations = [];

  // Time recommendations
  if (analysisData.time_optimization?.sufficient_data) {
    recommendations.push({
      category: 'Timing',
      priority: 'high',
      action: analysisData.time_optimization.recommendation,
      impact: 'Engagement timing can improve ROI by 20-40%',
    });
  }

  // Decay recommendations
  if (analysisData.decay_analysis?.sufficient_data && analysisData.decay_analysis.is_decaying) {
    recommendations.push({
      category: 'Target Health',
      priority: 'critical',
      action: analysisData.decay_analysis.recommendation,
      impact: `${analysisData.decay_analysis.decline_percent}% decline detected`,
    });
  }

  // Template recommendations
  if (analysisData.template_optimization?.instagram?.selected_template) {
    const igTemplate = analysisData.template_optimization.instagram.selected_template;
    recommendations.push({
      category: 'Instagram Template',
      priority: 'high',
      action: analysisData.template_optimization.instagram.recommendation,
      current_confidence: igTemplate.confidence,
      estimated_success: (igTemplate.sample_value * 100).toFixed(1),
    });
  }

  if (analysisData.template_optimization?.twitter?.selected_template) {
    const twTemplate = analysisData.template_optimization.twitter.selected_template;
    recommendations.push({
      category: 'Twitter Template',
      priority: 'high',
      action: analysisData.template_optimization.twitter.recommendation,
      current_confidence: twTemplate.confidence,
      estimated_success: (twTemplate.sample_value * 100).toFixed(1),
    });
  }

  // Seasonal recommendations
  if (analysisData.seasonal_patterns?.sufficient_data) {
    recommendations.push({
      category: 'Seasonal Pattern',
      priority: 'medium',
      action: analysisData.seasonal_patterns.recommendation,
      best_day: analysisData.seasonal_patterns.best_day_of_week,
      peak_weeks: analysisData.seasonal_patterns.peak_weeks.map(w => `Week ${w.week}`).join(', '),
    });
  }

  return recommendations;
}
