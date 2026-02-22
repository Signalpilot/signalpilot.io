/**
 * API: Competitor Benchmarking
 * GET /api/social/competitor-benchmark?token=TOKEN
 * 
 * Compare your metrics against competitors
 */

import CompetitorAnalyzer from '../../lib/social/competitor-analyzer.js';

// In-memory analyzer
let analyzer = null;

export default async function handler(req, res) {
  const token = req.query.token;

  // Validate token
  if (!token || token !== process.env.SOCIAL_API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    return handleGetBenchmark(req, res);
  } else if (req.method === 'POST') {
    return handleUpdateMetrics(req, res);
  } else if (req.method === 'DELETE') {
    return handleReset(req, res);
  }

  res.status(405).json({ error: 'Method not allowed' });
}

/**
 * GET /api/social/competitor-benchmark?token=TOKEN&report=full|comparison|gaps|position|advantages
 */
async function handleGetBenchmark(req, res) {
  const { report = 'full' } = req.query;

  try {
    if (!analyzer) {
      return res.status(400).json({ error: 'No metrics set yet. POST metrics first.' });
    }

    let response = {};

    if (report === 'full') {
      response = analyzer.getFullReport();
    } else if (report === 'comparison') {
      response = analyzer.getBenchmarkComparison();
    } else if (report === 'gaps') {
      response = analyzer.getGapsAndRecommendations();
    } else if (report === 'position') {
      response = analyzer.getMarketPosition();
    } else if (report === 'advantages') {
      response = analyzer.getCompetitiveAdvantages();
    } else {
      return res.status(400).json({ error: 'Unknown report type' });
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
 * POST /api/social/competitor-benchmark?token=TOKEN
 * Body: { yourMetrics: {...}, competitors: [{name, metrics: {...}}, ...] }
 */
async function handleUpdateMetrics(req, res) {
  const { yourMetrics, competitors, action } = req.body;

  try {
    if (action === 'init') {
      // Initialize analyzer with metrics
      analyzer = new CompetitorAnalyzer(yourMetrics, competitors || []);
      return res.status(200).json({
        success: true,
        message: 'Benchmark initialized',
        data: analyzer.getMarketPosition(),
      });
    } else if (action === 'add-competitor') {
      if (!analyzer) {
        analyzer = new CompetitorAnalyzer(yourMetrics || {}, []);
      }
      const { name, metrics } = req.body;
      analyzer.addCompetitor(name, metrics);
      return res.status(200).json({
        success: true,
        message: `Competitor "${name}" added`,
        competitors: analyzer.competitors.length,
      });
    } else if (action === 'update-your-metrics') {
      if (!analyzer) {
        analyzer = new CompetitorAnalyzer(yourMetrics || {}, []);
      }
      analyzer.yourMetrics = { ...analyzer.yourMetrics, ...yourMetrics };
      return res.status(200).json({
        success: true,
        message: 'Your metrics updated',
        data: analyzer.getMarketPosition(),
      });
    }

    res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * DELETE /api/social/competitor-benchmark?token=TOKEN
 */
async function handleReset(req, res) {
  try {
    analyzer = null;
    res.status(200).json({
      success: true,
      message: 'Benchmark data cleared',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
