// POST /api/social/optimize-engagement
// Phase 3: Recommend config optimizations based on performance data

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  getTopTemplates,
  getTopTargets,
} from '../../lib/social/queue-manager.js';

const CONFIG_PATH = join(process.cwd(), 'data', 'social', 'engagement-config.json');
const CONFIG_VERSIONS_DIR = join(process.cwd(), 'data', 'social', 'config-versions');

function ensureVersionsDir() {
  if (!existsSync(CONFIG_VERSIONS_DIR)) {
    mkdirSync(CONFIG_VERSIONS_DIR, { recursive: true });
  }
}

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

function saveConfigVersion(config, label) {
  try {
    ensureVersionsDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const versionPath = join(CONFIG_VERSIONS_DIR, `${timestamp}-${label}.json`);
    writeFileSync(versionPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      label,
      config
    }, null, 2));
    return versionPath;
  } catch (error) {
    console.error('Failed to save config version:', error);
    return null;
  }
}

function listConfigVersions() {
  try {
    ensureVersionsDir();
    const files = require('fs').readdirSync(CONFIG_VERSIONS_DIR);
    return files.sort().reverse().map(f => {
      const content = JSON.parse(readFileSync(join(CONFIG_VERSIONS_DIR, f), 'utf-8'));
      return {
        filename: f,
        timestamp: content.timestamp,
        label: content.label
      };
    });
  } catch (error) {
    console.error('Failed to list config versions:', error);
    return [];
  }
}

function restoreConfigVersion(filename) {
  try {
    const versionPath = join(CONFIG_VERSIONS_DIR, filename);
    const content = JSON.parse(readFileSync(versionPath, 'utf-8'));
    writeFileSync(CONFIG_PATH, JSON.stringify(content.config, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to restore config version:', error);
    return false;
  }
}

export default async function handler(req, res) {
  try {
    const { token, action, version } = req.query;

    if (token !== process.env.ROBOT_TOKEN) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!action || !['analyze', 'apply', 'list-versions', 'restore'].includes(action)) {
      return res.status(400).json({ error: 'action must be analyze, apply, list-versions, or restore' });
    }

    const config = loadConfig();
    if (!config && action !== 'list-versions') {
      return res.status(500).json({ error: 'Failed to load config' });
    }

    if (action === 'analyze') {
      return await analyzeOptimizations(config, res);
    } else if (action === 'apply') {
      return await applyOptimizations(config, res);
    } else if (action === 'list-versions') {
      return res.status(200).json({
        success: true,
        versions: listConfigVersions(),
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'restore') {
      if (!version) {
        return res.status(400).json({ error: 'version parameter required for restore action' });
      }
      const restored = restoreConfigVersion(version);
      if (restored) {
        return res.status(200).json({
          success: true,
          message: `Restored config from version: ${version}`,
          timestamp: new Date().toISOString(),
        });
      } else {
        return res.status(500).json({ error: 'Failed to restore config version' });
      }
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

  // Filter by statistical significance (min 3 samples, score >= 5)
  const significantIgTemplates = igTemplates.filter(t => t.count >= 3 && t.average >= 5);
  const significantTwTemplates = twTemplates.filter(t => t.count >= 3 && t.average >= 5);
  const significantIgTargets = igTargets.filter(t => t.count >= 3 && t.average >= 5);
  const significantTwTargets = twTargets.filter(t => t.count >= 3 && t.average >= 5);

  const recommendations = {
    instagram: {
      currentTemplates: config.instagram.commentTemplates,
      recommendedTemplates: significantIgTemplates
        .map(t => ({ template: t.template, score: t.average, samples: t.count }))
        .slice(0, 8),
      templateImprovement: calculateImprovement(
        config.instagram.commentTemplates,
        significantIgTemplates
      ),
      currentTargets: config.instagram.targets.map(t => t.value),
      recommendedTargets: significantIgTargets
        .map(t => ({ target: t.target, score: t.average, samples: t.count }))
        .slice(0, 5),
      targetImprovement: calculateTargetImprovement(
        config.instagram.targets.map(t => t.value),
        significantIgTargets
      ),
      warnings: significantIgTemplates.length === 0 ? ['Insufficient template samples (need 3+)'] : [],
    },
    twitter: {
      currentTemplates: config.twitter.replyTemplates,
      recommendedTemplates: significantTwTemplates
        .map(t => ({ template: t.template, score: t.average, samples: t.count }))
        .slice(0, 7),
      templateImprovement: calculateImprovement(
        config.twitter.replyTemplates,
        significantTwTemplates
      ),
      currentQueries: config.twitter.searchQueries,
      recommendedQueries: significantTwTargets
        .map(t => ({ query: t.target, score: t.average, samples: t.count }))
        .slice(0, 5),
      queryImprovement: calculateTargetImprovement(
        config.twitter.searchQueries,
        significantTwTargets
      ),
      warnings: significantTwTemplates.length === 0 ? ['Insufficient template samples (need 3+)'] : [],
    },
  };

  return res.status(200).json({
    success: true,
    recommendations,
    timestamp: new Date().toISOString(),
    nextAction: 'Call with action=apply to update config with recommendations',
    note: 'Only templates/queries with 3+ samples and score ≥5 are recommended',
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

  // Save current config as version before making changes
  saveConfigVersion(JSON.parse(JSON.stringify(config)), 'before-optimization');

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
    .filter(t => t.count >= 3 && t.average >= 5)
    .map(t => t.template)
    .slice(0, Math.min(8, config.instagram.commentTemplates.length));

  if (recommendedIgTemplates.length > 0) {
    config.instagram.commentTemplates = recommendedIgTemplates;
    changes.instagram.templatesUpdated = true;
  }

  // Update Instagram targets if improvements exist
  const recommendedIgTargets = igTargets
    .filter(t => t.count >= 3 && t.average >= 5)
    .map(t => ({
      type: 'account',
      value: t.target,
      priority: t.average >= 8 ? 1 : 2,
    }))
    .slice(0, Math.min(5, config.instagram.targets.length));

  if (recommendedIgTargets.length > 0) {
    config.instagram.targets = recommendedIgTargets;
    changes.instagram.targetsUpdated = true;
  }

  // Update Twitter templates if improvements exist
  const recommendedTwTemplates = twTemplates
    .filter(t => t.count >= 3 && t.average >= 5)
    .map(t => t.template)
    .slice(0, Math.min(7, config.twitter.replyTemplates.length));

  if (recommendedTwTemplates.length > 0) {
    config.twitter.replyTemplates = recommendedTwTemplates;
    changes.twitter.templatesUpdated = true;
  }

  // Update Twitter queries if improvements exist
  const recommendedTwQueries = twTargets
    .filter(t => t.count >= 3 && t.average >= 5)
    .map(t => `${t.target} -filter:retweets`)
    .slice(0, Math.min(5, config.twitter.searchQueries.length));

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
    rollbackVersion: 'before-optimization',
    timestamp: new Date().toISOString(),
  });
}

function calculateImprovement(current, topPerformers) {
  if (!topPerformers || topPerformers.length === 0) {
    return { newItems: 0, replacements: 0, avgScoreGain: 0 };
  }

  const topScore = topPerformers[0].average || 0;

  // Calculate actual average score of current templates from top performers
  const currentScores = topPerformers.filter(t => current.includes(t.template)).map(t => t.average);
  const currentAvg = currentScores.length > 0 ? currentScores.reduce((a, b) => a + b) / currentScores.length : 0;

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

  // Calculate actual average score of current targets from top performers
  const currentScores = topPerformers.filter(t => current.includes(t.target)).map(t => t.average);
  const currentAvg = currentScores.length > 0 ? currentScores.reduce((a, b) => a + b) / currentScores.length : 0;

  return {
    newTargets: topPerformers.filter(t => !current.includes(t.target)).length,
    replacements: Math.min(3, topPerformers.length),
    avgScoreGain: (topScore - currentAvg).toFixed(1),
  };
}
