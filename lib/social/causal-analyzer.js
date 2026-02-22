/**
 * Causal Inference Engine
 * Tracks what engagement actions lead to actual conversions (follows, DMs, sales)
 */

export class CausalAnalyzer {
  constructor() {
    this.engagementLog = [];
    this.followLog = [];
    this.dmLog = [];
    this.TIME_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  /**
   * Record an engagement action
   */
  recordEngagement(targetUser, action, timestamp = Date.now(), metadata = {}) {
    this.engagementLog.push({
      targetUser,
      action, // 'like', 'comment', 'reply', 'follow'
      timestamp,
      metadata,
    });
  }

  /**
   * Record a new follower (outcome)
   */
  recordNewFollower(userId, followedAt = Date.now()) {
    this.followLog.push({
      userId,
      followedAt,
    });
  }

  /**
   * Record a new DM (outcome)
   */
  recordNewDM(fromUserId, receivedAt = Date.now(), text = '') {
    this.dmLog.push({
      from: fromUserId,
      receivedAt,
      text,
    });
  }

  /**
   * Link engagements to outcomes (follows and DMs within 7-day window)
   */
  analyzeEngagementToOutcome() {
    const engagementToOutcome = {};

    for (const engagement of this.engagementLog) {
      const windowEnd = engagement.timestamp + this.TIME_WINDOW_MS;

      // Check if this user followed within 7 days
      const follow = this.followLog.find(
        (f) =>
          f.userId === engagement.targetUser &&
          f.followedAt > engagement.timestamp &&
          f.followedAt < windowEnd
      );

      // Check if this user DMed within 7 days
      const dm = this.dmLog.find(
        (d) =>
          d.from === engagement.targetUser &&
          d.receivedAt > engagement.timestamp &&
          d.receivedAt < windowEnd
      );

      if (!engagementToOutcome[engagement.targetUser]) {
        engagementToOutcome[engagement.targetUser] = {
          engagements: [],
          followed: !!follow,
          dmed: !!dm,
          leadTimeFollow: follow ? follow.followedAt - engagement.timestamp : null,
          leadTimeDM: dm ? dm.receivedAt - engagement.timestamp : null,
        };
      }

      engagementToOutcome[engagement.targetUser].engagements.push({
        action: engagement.action,
        timestamp: engagement.timestamp,
      });
    }

    return engagementToOutcome;
  }

  /**
   * Calculate conversion rates by action type
   */
  calculateConversionRates() {
    const outcomes = this.analyzeEngagementToOutcome();
    const results = {
      like: { total: 0, conversions: 0, avgLeadTime: 0 },
      comment: { total: 0, conversions: 0, avgLeadTime: 0 },
      reply: { total: 0, conversions: 0, avgLeadTime: 0 },
      follow: { total: 0, conversions: 0, avgLeadTime: 0 },
    };

    const leadTimes = {
      like: [],
      comment: [],
      reply: [],
      follow: [],
    };

    // Count engagements and conversions
    for (const [user, outcome] of Object.entries(outcomes)) {
      const converted = outcome.followed || outcome.dmed;
      const leadTime = outcome.leadTimeFollow || outcome.leadTimeDM || 0;

      for (const engagement of outcome.engagements) {
        const action = engagement.action;
        if (results[action]) {
          results[action].total++;
          if (converted) {
            results[action].conversions++;
            leadTimes[action].push(leadTime);
          }
        }
      }
    }

    // Calculate averages
    for (const action of Object.keys(results)) {
      if (leadTimes[action].length > 0) {
        results[action].avgLeadTime =
          leadTimes[action].reduce((a, b) => a + b, 0) / leadTimes[action].length;
      }
    }

    return results;
  }

  /**
   * Get ranked effectiveness (best to worst action)
   */
  getRanking() {
    const rates = this.calculateConversionRates();
    const ranked = Object.entries(rates)
      .map(([action, data]) => ({
        action,
        conversionRate: data.total > 0 ? (data.conversions / data.total) * 100 : 0,
        conversions: data.conversions,
        total: data.total,
        avgLeadTime: data.avgLeadTime,
        avgLeadTimeHours: (data.avgLeadTime / (60 * 60 * 1000)).toFixed(1),
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate);

    return {
      ranking: ranked,
      bestAction: ranked[0]?.action || null,
      recommendation: this._generateRecommendation(ranked),
      summary: {
        totalEngagements: this.engagementLog.length,
        totalConversions: this.followLog.length + this.dmLog.length,
        overallConversionRate: (
          ((this.followLog.length + this.dmLog.length) / this.engagementLog.length) *
          100
        ).toFixed(1),
      },
    };
  }

  /**
   * Generate actionable recommendations
   */
  _generateRecommendation(ranked) {
    if (ranked.length === 0) {
      return 'Not enough data for recommendations';
    }

    const best = ranked[0];
    const second = ranked[1];

    if (!second || best.conversionRate === 0) {
      return `No conversions yet. Try ${best.action} with more volume (target: 100+ engagements)`;
    }

    const multiple = (best.conversionRate / second.conversionRate).toFixed(1);
    const bestPercent = best.conversionRate.toFixed(1);
    const allocation = Math.round((best.conversionRate / (best.conversionRate + second.conversionRate)) * 100);

    return `${best.action.toUpperCase()} is ${multiple}x more effective (${bestPercent}% vs ${second.conversionRate.toFixed(1)}%). Allocate 60% effort to ${best.action}, 30% to ${second.action}, 10% to others.`;
  }

  /**
   * Get outcome funnel (engagement → follow → DM)
   */
  getFunnel() {
    const outcomes = this.analyzeEngagementToOutcome();
    let engagementCount = this.engagementLog.length;
    let followCount = Object.values(outcomes).filter((o) => o.followed).length;
    let dmCount = Object.values(outcomes).filter((o) => o.dmed).length;
    let bothCount = Object.values(outcomes).filter((o) => o.followed && o.dmed).length;

    return {
      engagement: engagementCount,
      followConversion: ((followCount / engagementCount) * 100).toFixed(1),
      dmConversion: ((dmCount / engagementCount) * 100).toFixed(1),
      bothConversion: ((bothCount / engagementCount) * 100).toFixed(1),
      funnel: [
        { stage: 'Engagement', count: engagementCount, percent: 100 },
        { stage: 'Follows', count: followCount, percent: ((followCount / engagementCount) * 100).toFixed(1) },
        { stage: 'DMs', count: dmCount, percent: ((dmCount / engagementCount) * 100).toFixed(1) },
        { stage: 'Both', count: bothCount, percent: ((bothCount / engagementCount) * 100).toFixed(1) },
      ],
    };
  }

  /**
   * Clear all data
   */
  reset() {
    this.engagementLog = [];
    this.followLog = [];
    this.dmLog = [];
  }

  /**
   * Export data for analysis
   */
  export() {
    return {
      engagements: this.engagementLog,
      follows: this.followLog,
      dms: this.dmLog,
      analysis: {
        conversionRates: this.calculateConversionRates(),
        ranking: this.getRanking(),
        funnel: this.getFunnel(),
      },
    };
  }
}

export default CausalAnalyzer;
