/**
 * API: Causal Analysis
 * GET /api/social/causal-analysis?token=TOKEN
 * 
 * Returns which engagement actions lead to actual conversions
 */

import CausalAnalyzer from '../../lib/social/causal-analyzer.js';

// In-memory analyzer (in production, use database)
let analyzer = new CausalAnalyzer();

export default async function handler(req, res) {
  const token = req.query.token;

  // Validate token
  if (!token || token !== process.env.SOCIAL_API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    return handleGetAnalysis(req, res);
  } else if (req.method === 'POST') {
    return handleRecordEvent(req, res);
  } else if (req.method === 'DELETE') {
    return handleReset(req, res);
  }

  res.status(405).json({ error: 'Method not allowed' });
}

/**
 * GET /api/social/causal-analysis?token=TOKEN&type=ranking|funnel|export
 */
async function handleGetAnalysis(req, res) {
  const { type = 'ranking' } = req.query;

  try {
    let response = {};

    if (type === 'ranking') {
      response = analyzer.getRanking();
    } else if (type === 'funnel') {
      response = analyzer.getFunnel();
    } else if (type === 'conversion-rates') {
      response = analyzer.calculateConversionRates();
    } else if (type === 'export') {
      response = analyzer.export();
    } else {
      // Default: return all analysis
      response = {
        ranking: analyzer.getRanking(),
        funnel: analyzer.getFunnel(),
        conversionRates: analyzer.calculateConversionRates(),
      };
    }

    res.status(200).json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/social/causal-analysis?token=TOKEN
 * Body: { action: 'record-engagement'|'record-follow'|'record-dm', data: {...} }
 */
async function handleRecordEvent(req, res) {
  const { action, data } = req.body;

  try {
    if (action === 'record-engagement') {
      analyzer.recordEngagement(
        data.targetUser,
        data.action, // 'like', 'comment', 'reply'
        data.timestamp || Date.now(),
        data.metadata
      );
    } else if (action === 'record-follow') {
      analyzer.recordNewFollower(data.userId, data.followedAt || Date.now());
    } else if (action === 'record-dm') {
      analyzer.recordNewDM(data.from, data.receivedAt || Date.now(), data.text);
    } else {
      return res.status(400).json({ error: 'Unknown action' });
    }

    res.status(200).json({
      success: true,
      message: `${action} recorded`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * DELETE /api/social/causal-analysis?token=TOKEN
 * Resets all data
 */
async function handleReset(req, res) {
  try {
    analyzer.reset();
    res.status(200).json({
      success: true,
      message: 'All causal analysis data cleared',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
