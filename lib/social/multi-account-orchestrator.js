/**
 * Multi-Account Orchestrator
 * Coordinate engagement across multiple accounts while avoiding pattern detection
 */

export class MultiAccountOrchestrator {
  constructor(accounts = []) {
    this.accounts = accounts; // [{ username, platforms, limits, successRate }, ...]
    this.engagementHistory = {}; // Track recent engagements per target
    this.accountUsageToday = {}; // Track today's usage per account
    this.lastEngagementTime = {}; // Track last engagement time
  }

  /**
   * Add account to orchestrator
   */
  addAccount(username, config = {}) {
    const account = {
      username,
      platforms: config.platforms || ['instagram'],
      limits: config.limits || { dailyLikes: 30, dailyComments: 5 },
      successRate: config.successRate || 0.8,
      cooldownMs: config.cooldownMs || 300000, // 5 minutes default
      ...config,
    };

    this.accounts.push(account);
    this.accountUsageToday[username] = { likes: 0, comments: 0 };
    this.lastEngagementTime[username] = 0;
  }

  /**
   * Distribute engagement load across accounts
   * Strategies: 'equal', 'weighted', 'round_robin', 'smart'
   */
  distributeEngagementLoad(totalEngagements, strategy = 'smart') {
    const distribution = {};

    // Initialize distribution
    for (const account of this.accounts) {
      distribution[account.username] = 0;
    }

    if (this.accounts.length === 0) return distribution;

    if (strategy === 'equal') {
      const perAccount = Math.floor(totalEngagements / this.accounts.length);
      for (const account of this.accounts) {
        distribution[account.username] = perAccount;
      }
    } else if (strategy === 'weighted') {
      // Allocate more to accounts with better performance
      const totalWeight = this.accounts.reduce((sum, acc) => sum + (acc.successRate || 0.8), 0);

      for (const account of this.accounts) {
        const weight = (account.successRate || 0.8) / totalWeight;
        distribution[account.username] = Math.round(totalEngagements * weight);
      }
    } else if (strategy === 'round_robin') {
      let idx = 0;
      for (let i = 0; i < totalEngagements; i++) {
        const account = this.accounts[idx % this.accounts.length];
        distribution[account.username]++;
        idx++;
      }
    } else if (strategy === 'smart') {
      // Smart: weighted by success rate, but consider daily limits
      const capacities = this.accounts.map((acc) => {
        const todayUsage = this.accountUsageToday[acc.username] || { likes: 0, comments: 0 };
        return acc.limits.dailyLikes - todayUsage.likes;
      });

      const totalCapacity = capacities.reduce((a, b) => a + b, 0);

      for (let i = 0; i < this.accounts.length; i++) {
        const weight = (capacities[i] / totalCapacity) * (this.accounts[i].successRate || 0.8);
        distribution[this.accounts[i].username] = Math.round(totalEngagements * weight);
      }
    }

    return distribution;
  }

  /**
   * Select next account with built-in delays to prevent detection
   */
  async selectNextAccount(actionType = 'like') {
    let nextAccount = null;
    let minWaitTime = Infinity;

    // Find account that can perform action and has waited long enough
    for (const account of this.accounts) {
      const lastTime = this.lastEngagementTime[account.username] || 0;
      const timeSinceLastEngagement = Date.now() - lastTime;
      const cooldown = account.cooldownMs || 300000;

      if (timeSinceLastEngagement >= cooldown) {
        if (this._canPerformAction(account, actionType)) {
          nextAccount = account;
          break;
        }
      } else {
        const waitTime = cooldown - timeSinceLastEngagement;
        if (waitTime < minWaitTime) {
          minWaitTime = waitTime;
          nextAccount = account;
        }
      }
    }

    if (!nextAccount) {
      nextAccount = this.accounts[0]; // Fallback
    }

    // Check if we need to wait
    const lastTime = this.lastEngagementTime[nextAccount.username] || 0;
    const cooldown = nextAccount.cooldownMs || 300000;
    const waitTime = Math.max(0, cooldown - (Date.now() - lastTime));

    if (waitTime > 0) {
      // Add random jitter (±20%) to avoid pattern detection
      const jitter = waitTime * (0.8 + Math.random() * 0.4);
      await this._sleep(jitter);
    }

    return nextAccount;
  }

  /**
   * Check if account can perform action (limits not exceeded)
   */
  _canPerformAction(account, actionType = 'like') {
    const usage = this.accountUsageToday[account.username] || { likes: 0, comments: 0 };

    if (actionType === 'like') {
      return usage.likes < account.limits.dailyLikes;
    } else if (actionType === 'comment') {
      return usage.comments < account.limits.dailyComments;
    }

    return true;
  }

  /**
   * Record engagement for account usage tracking
   */
  recordEngagement(account, targetUser, actionType = 'like') {
    if (!this.accountUsageToday[account.username]) {
      this.accountUsageToday[account.username] = { likes: 0, comments: 0 };
    }

    if (actionType === 'like') {
      this.accountUsageToday[account.username].likes++;
    } else if (actionType === 'comment') {
      this.accountUsageToday[account.username].comments++;
    }

    this.lastEngagementTime[account.username] = Date.now();

    // Track target user to avoid multi-account spam
    if (!this.engagementHistory[targetUser]) {
      this.engagementHistory[targetUser] = [];
    }

    this.engagementHistory[targetUser].push({
      account: account.username,
      timestamp: Date.now(),
    });
  }

  /**
   * Check if target should be engaged with (avoid multi-account spam)
   * Returns available accounts for this target
   */
  getAvailableAccountsForTarget(targetUser, lookbackHours = 24) {
    const history = this.engagementHistory[targetUser] || [];
    const cutoffTime = Date.now() - lookbackHours * 60 * 60 * 1000;

    // Find accounts that engaged with this target recently
    const recentAccounts = new Set(
      history
        .filter((h) => h.timestamp > cutoffTime)
        .map((h) => h.account)
    );

    // Return accounts that haven't engaged recently
    return this.accounts.filter((acc) => !recentAccounts.has(acc.username));
  }

  /**
   * Get next target ensuring account diversity
   */
  getNextTarget(targetList, lookbackHours = 24) {
    for (const target of targetList) {
      const availableAccounts = this.getAvailableAccountsForTarget(target.username, lookbackHours);

      if (availableAccounts.length > 0) {
        // Pick best performing available account
        availableAccounts.sort((a, b) => (b.successRate || 0.8) - (a.successRate || 0.8));

        return {
          target,
          account: availableAccounts[0],
          accountsAvailable: availableAccounts.length,
        };
      }
    }

    return null;
  }

  /**
   * Get account health status
   */
  getAccountStatus() {
    return this.accounts.map((account) => {
      const usage = this.accountUsageToday[account.username] || { likes: 0, comments: 0 };
      const likeUsagePercent = (usage.likes / account.limits.dailyLikes) * 100;
      const commentUsagePercent = (usage.comments / account.limits.dailyComments) * 100;

      const health = Math.max(likeUsagePercent, commentUsagePercent);
      let status = 'HEALTHY';
      if (health > 90) status = 'OVERLOADED';
      else if (health > 70) status = 'NEAR LIMIT';
      else if (health > 50) status = 'MODERATE USAGE';

      return {
        username: account.username,
        dailyLikes: `${usage.likes}/${account.limits.dailyLikes}`,
        dailyComments: `${usage.comments}/${account.limits.dailyComments}`,
        healthScore: (100 - health).toFixed(0),
        status,
        likeUsagePercent: likeUsagePercent.toFixed(0),
        commentUsagePercent: commentUsagePercent.toFixed(0),
      };
    });
  }

  /**
   * Get coordination report
   */
  getCoordinationReport() {
    const status = this.getAccountStatus();
    const totalEngagements = Object.values(this.accountUsageToday).reduce(
      (sum, acc) => sum + acc.likes + acc.comments,
      0
    );

    const distribution = {};
    for (const [account, usage] of Object.entries(this.accountUsageToday)) {
      const total = usage.likes + usage.comments;
      distribution[account] = ((total / totalEngagements) * 100).toFixed(1);
    }

    return {
      timestamp: new Date().toISOString(),
      accounts: status,
      totalEngagements,
      distribution,
      overallHealth: this._calculateOverallHealth(status),
      recommendations: this._generateRecommendations(status),
    };
  }

  /**
   * Calculate overall health score
   */
  _calculateOverallHealth(status) {
    const scores = status.map((s) => parseInt(s.healthScore));
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;

    if (average > 80) return 'EXCELLENT';
    if (average > 60) return 'GOOD';
    if (average > 40) return 'FAIR';
    return 'POOR';
  }

  /**
   * Generate recommendations
   */
  _generateRecommendations(status) {
    const recommendations = [];

    for (const account of status) {
      if (account.status === 'OVERLOADED') {
        recommendations.push(
          `${account.username}: REDUCE ENGAGEMENT - At ${account.healthScore}% health`
        );
      } else if (account.status === 'NEAR LIMIT') {
        recommendations.push(
          `${account.username}: Monitor closely - Near daily limits`
        );
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('All accounts healthy. Continue current strategy.');
    }

    return recommendations;
  }

  /**
   * Reset daily counters (call daily)
   */
  resetDailyCounters() {
    const accounts = this.accounts.map((a) => a.username);
    for (const account of accounts) {
      this.accountUsageToday[account] = { likes: 0, comments: 0 };
    }
  }

  /**
   * Helper: sleep function
   */
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Export report
   */
  export() {
    return {
      timestamp: new Date().toISOString(),
      accounts: this.accounts,
      accountUsageToday: this.accountUsageToday,
      engagementHistory: this.engagementHistory,
      status: this.getCoordinationReport(),
    };
  }
}

export default MultiAccountOrchestrator;
