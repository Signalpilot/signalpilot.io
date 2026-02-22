// POST /api/social/optimize-engagement
// Phase 3: Recommend config optimizations based on performance data

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  getTopTemplates,
  getTopTargets,
} from '../../lib/social/queue-manager.js';

const CONFIG_PATH = join(process.cwd(), 'data', 'social', 'engagement-config.json');

function loadConfig() {
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  } catch (error) {
    console.error('Failed to load engagement config:', error);
    return null;
  }
}

function saveConfig(config) {
  try {
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to save engagement config:', error);
    return false;
  }
}

export default async function handler(req, res) {
  try {
    const { token, action } = req.query;

    if (token !== process.env.ROBOT_TOKEN) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!action || !['analyze', 'apply'].includes(action)) {
      return res.status(400).json({ error: 'action must be analyze or apply' });
    }

    const config = loadConfig();
    if (!config) {
      return res.status(500).json({ error: 'Failed to load config' });
    }

    if (action === 'analyze') {
      return await analyzeOptimizations(config, res);
    } else {
      return await applyOptimizations(config, res);
    }
  } catch (error) {
    console.error('Optimize engagement error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Analyze what optimizations could be made
 */
async function analyzeOptimizations(config, res) {
  const igTemplates = await getTopTemplates('instagram', 20);
  const twTemplates = await getTopTemplates('twitter', 20);
  const igTargets = await getTopTargets('instagram', 30);
  const twTargets = await getTopTargets('twitter', 30);

  const recommendations = {
    instagram: {
      currentTemplates: config.instagram.commentTemplates,
      recommendedTemplates: igTemplates
        .filter(t => t.average >= 5)
        .map(t => t.template)
        .slice(0, 8),
      templateImprovement: calculateImprovement(
        config.instagram.commentTemplates,
        igTemplates
      ),
      currentTargets: config.instagram.targets.map(t => t.value),
      recommendedTargets: igTargets
        .filter(t => t.average >= 5)
        .map(t => t.target)
        .slice(0, 5),
      targetImprovement: calculateTargetImprovement(
        config.instagram.targets.map(t => t.value),
        igTargets
      ),
    },
    twitter: {
      currentTemplates: config.twitter.replyTemplates,
      recommendedTemplates: twTemplates
        .filter(t => t.average >= 5)
        .map(t => t.template)
        .slice(0, 7),
      templateImprovement: calculateImprovement(
        config.twitter.replyTemplates,
        twTemplates
      ),
      currentQueries: config.twitter.searchQueries,
      recommendedQueries: twTargets
        .filter(t => t.average >= 5)
        .map(t => t.target)
        .slice(0, 5),
      queryImprovement: calculateTargetImprovement(
        config.twitter.searchQueries,
        twTargets
      ),
    },
  };

  return res.status(200).json({
    success: true,
    recommendations,
    timestamp: new Date().toISOString(),
    nextAction: 'Call with action=apply to update config with recommendations',
  });
}

/**
 * Apply recommended optimizations
 */
async function applyOptimizations(config, res) {
  const igTemplates = await getTopTemplates('instagram', 20);
  const twTemplates = await getTopTemplates('twitter', 20);
  const igTargets = await getTopTargets('instagram', 30);
  const twTargets = await getTopTargets('twitter', 30);

  const changes = {
    instagram: {
      templatesUpdated: false,
      targetsUpdated: false,
    },
    twitter: {
      templatesUpdated: false,
      queriesUpdated: false,
    },
  };

  // Update Instagram templates if improvements exist
  const recommendedIgTemplates = igTemplates
    .filter(t => t.average >= 5)
    .map(t => t.template)
    .slice(0, 8);

  if (recommendedIgTemplates.length > 0) {
    config.instagram.commentTemplates = recommendedIgTemplates;
    changes.instagram.templatesUpdated = true;
  }

  // Update Instagram targets if improvements exist
  const recommendedIgTargets = igTargets
    .filter(t => t.average >= 5)
    .map(t => ({
      type: 'account',
      value: t.target,
      priority: t.average >= 8 ? 1 : 2,
    }))
    .slice(0, 5);

  if (recommendedIgTargets.length > 0) {
    config.instagram.targets = recommendedIgTargets;
    changes.instagram.targetsUpdated = true;
  }

  // Update Twitter templates if improvements exist
  const recommendedTwTemplates = twTemplates
    .filter(t => t.average >= 5)
    .map(t => t.template)
    .slice(0, 7);

  if (recommendedTwTemplates.length > 0) {
    config.twitter.replyTemplates = recommendedTwTemplates;
    changes.twitter.templatesUpdated = true;
  }

  // Update Twitter queries if improvements exist
  const recommendedTwQueries = twTargets
    .filter(t => t.average >= 5)
    .map(t => `${t.target} -filter:retweets`)
    .slice(0, 5);

  if (recommendedTwQueries.length > 0) {
    config.twitter.searchQueries = recommendedTwQueries;
    changes.twitter.queriesUpdated = true;
  }

  // Save updated config
  const saved = saveConfig(config);

  if (!saved) {
    return res.status(500).json({ error: 'Failed to save optimized config' });
  }

  return res.status(200).json({
    success: true,
    message: 'Engagement config optimized based on performance data',
    changes,
    updatedConfig: {
      instagram: {
        templates: config.instagram.commentTemplates,
        targets: config.instagram.targets.map(t => t.value),
      },
      twitter: {
        templates: config.twitter.replyTemplates,
        queries: config.twitter.searchQueries,
      },
    },
    timestamp: new Date().toISOString(),
  });
}

function calculateImprovement(current, topPerformers) {
  if (!topPerformers || topPerformers.length === 0) {
    return { newItems: 0, replacements: 0, avgScoreGain: 0 };
  }

  const topScore = topPerformers[0].average || 0;
  const currentAvg = current.length > 0 ? 5 : 0;

  return {
    newItems: topPerformers.filter(t => !current.includes(t.template)).length,
    replacements: Math.min(3, topPerformers.length),
    avgScoreGain: (topScore - currentAvg).toFixed(1),
  };
}

function calculateTargetImprovement(current, topPerformers) {
  if (!topPerformers || topPerformers.length === 0) {
    return { newTargets: 0, replacements: 0, avgScoreGain: 0 };
  }

  const topScore = topPerformers[0].average || 0;
  const currentAvg = 5;

  return {
    newTargets: topPerformers.filter(t => !current.includes(t.target)).length,
    replacements: Math.min(3, topPerformers.length),
    avgScoreGain: (topScore - currentAvg).toFixed(1),
  };
}
