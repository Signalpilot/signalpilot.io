/**
 * API: Multi-Account Orchestrator
 * GET /api/social/multi-account?token=TOKEN
 * 
 * Coordinate engagement across multiple accounts
 */

import MultiAccountOrchestrator from '../../lib/social/multi-account-orchestrator.js';

// Global orchestrator instance
let orchestrator = new MultiAccountOrchestrator();

export default async function handler(req, res) {
  const token = req.query.token;

  // Validate token
  if (!token || token !== process.env.SOCIAL_API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    return handleGetStatus(req, res);
  } else if (req.method === 'POST') {
    return handleAction(req, res);
  } else if (req.method === 'DELETE') {
    return handleReset(req, res);
  }

  res.status(405).json({ error: 'Method not allowed' });
}

/**
 * GET /api/social/multi-account?token=TOKEN&report=status|health|export|distribution
 */
async function handleGetStatus(req, res) {
  const { report = 'status' } = req.query;

  try {
    let response = {};

    if (report === 'status') {
      const coordination = orchestrator.getCoordinationReport();
      response = coordination;
    } else if (report === 'health') {
      response = orchestrator.getAccountStatus();
    } else if (report === 'distribution') {
      const status = orchestrator.getAccountStatus();
      const distribution = orchestrator.distributeEngagementLoad(100, 'smart');
      response = { status, suggestedDistribution: distribution };
    } else if (report === 'export') {
      response = orchestrator.export();
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
 * POST /api/social/multi-account?token=TOKEN
 * Body: { action: 'add-account'|'record-engagement'|'select-account'|'reset-daily', ... }
 */
async function handleAction(req, res) {
  const { action, data } = req.body;

  try {
    if (action === 'add-account') {
      const { username, config } = data;
      orchestrator.addAccount(username, config);

      return res.status(200).json({
        success: true,
        message: `Account "${username}" added`,
        accounts: orchestrator.accounts.length,
      });
    } else if (action === 'record-engagement') {
      const { accountUsername, targetUser, actionType } = data;

      // Find account
      const account = orchestrator.accounts.find((a) => a.username === accountUsername);
      if (!account) {
        return res.status(404).json({ error: `Account "${accountUsername}" not found` });
      }

      orchestrator.recordEngagement(account, targetUser, actionType);

      return res.status(200).json({
        success: true,
        message: 'Engagement recorded',
        health: orchestrator.getAccountStatus().find((s) => s.username === accountUsername),
      });
    } else if (action === 'select-next-account') {
      const { actionType = 'like' } = data;
      const account = await orchestrator.selectNextAccount(actionType);

      return res.status(200).json({
        success: true,
        data: {
          account: account.username,
          availableCapacity: {
            likes: account.limits.dailyLikes - (orchestrator.accountUsageToday[account.username]?.likes || 0),
            comments: account.limits.dailyComments - (orchestrator.accountUsageToday[account.username]?.comments || 0),
          },
        },
      });
    } else if (action === 'get-next-target') {
      const { targets, lookbackHours = 24 } = data;
      const result = orchestrator.getNextTarget(targets, lookbackHours);

      if (!result) {
        return res.status(404).json({ error: 'No available targets at this time' });
      }

      return res.status(200).json({
        success: true,
        data: {
          target: result.target,
          account: result.account.username,
          accountsAvailable: result.accountsAvailable,
        },
      });
    } else if (action === 'distribute-load') {
      const { total, strategy = 'smart' } = data;
      const distribution = orchestrator.distributeEngagementLoad(total, strategy);

      return res.status(200).json({
        success: true,
        data: distribution,
      });
    } else if (action === 'reset-daily-counters') {
      orchestrator.resetDailyCounters();

      return res.status(200).json({
        success: true,
        message: 'Daily counters reset',
      });
    }

    res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * DELETE /api/social/multi-account?token=TOKEN
 */
async function handleReset(req, res) {
  try {
    orchestrator = new MultiAccountOrchestrator();
    res.status(200).json({
      success: true,
      message: 'Orchestrator reset',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
