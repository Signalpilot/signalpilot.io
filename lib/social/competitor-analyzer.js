/**
 * Competitor Benchmarking System
 * Compare your metrics against competitors in your niche
 */

export class CompetitorAnalyzer {
  constructor(yourMetrics = {}, competitors = []) {
    this.yourMetrics = {
      successRate: 0,
      avgEngagement: 0,
      uniqueTargets: 0,
      templateVariety: 0,
      avgResponseTime: 0,
      ...yourMetrics,
    };
    this.competitors = competitors; // [{ name, metrics: {...} }, ...]
  }

  /**
   * Add a competitor
   */
  addCompetitor(name, metrics) {
    const existing = this.competitors.findIndex((c) => c.name === name);
    if (existing >= 0) {
      this.competitors[existing] = { name, metrics };
    } else {
      this.competitors.push({ name, metrics });
    }
  }

  /**
   * Calculate percentile ranking (where you rank vs competitors)
   */
  calculatePercentile(metricName) {
    const allValues = this.competitors.map((c) => c.metrics[metricName] || 0);
    const yourValue = this.yourMetrics[metricName];

    if (allValues.length === 0) {
      return null;
    }

    const betterThan = allValues.filter((v) => v < yourValue).length;
    const percentile = (betterThan / allValues.length) * 100;

    return percentile;
  }

  /**
   * Get benchmark comparison (your metrics vs avg competitors)
   */
  getBenchmarkComparison() {
    const metrics = Object.keys(this.yourMetrics);
    const comparison = {};

    for (const metric of metrics) {
      const competitorValues = this.competitors
        .map((c) => c.metrics[metric] || 0)
        .filter((v) => v > 0);

      if (competitorValues.length === 0) continue;

      const avgCompetitor =
        competitorValues.reduce((a, b) => a + b, 0) / competitorValues.length;
      const maxCompetitor = Math.max(...competitorValues);
      const minCompetitor = Math.min(...competitorValues);

      const yourValue = this.yourMetrics[metric];
      const percentile = this.calculatePercentile(metric);

      const gap = yourValue - avgCompetitor;
      const percentGap = ((gap / avgCompetitor) * 100).toFixed(1);

      comparison[metric] = {
        yourValue: yourValue.toFixed(2),
        avgCompetitor: avgCompetitor.toFixed(2),
        maxCompetitor: maxCompetitor.toFixed(2),
        minCompetitor: minCompetitor.toFixed(2),
        gap: gap.toFixed(2),
        percentGap: parseFloat(percentGap),
        percentile: percentile ? percentile.toFixed(1) : null,
        status:
          gap > 0
            ? `✅ ABOVE (${percentGap}% better)`
            : gap < 0
              ? `⚠️ BELOW (${percentGap}% worse)`
              : '➡️ AT PAR',
      };
    }

    return comparison;
  }

  /**
   * Identify gaps and generate recommendations
   */
  getGapsAndRecommendations() {
    const comparison = this.getBenchmarkComparison();
    const gaps = [];
    const recommendations = [];

    for (const [metric, data] of Object.entries(comparison)) {
      if (parseFloat(data.gap) < 0) {
        gaps.push({
          metric,
          gap: Math.abs(parseFloat(data.gap)).toFixed(2),
          percentGap: Math.abs(data.percentGap),
          improvement: `Close ${data.percentGap}% gap`,
        });
      }
    }

    // Sort by largest gaps
    gaps.sort((a, b) => b.percentGap - a.percentGap);

    // Generate specific recommendations
    for (const gap of gaps.slice(0, 3)) {
      const metric = gap.metric;
      if (metric === 'successRate') {
        recommendations.push(
          `Improve success rate from ${this.yourMetrics.successRate}% to ${comparison[metric].avgCompetitor}%. Try: 1) New templates 2) Better target audience 3) Timing optimization`
        );
      } else if (metric === 'avgEngagement') {
        recommendations.push(
          `Increase engagement from ${this.yourMetrics.avgEngagement} to ${comparison[metric].avgCompetitor} daily. Try: 1) More accounts 2) Expand templates 3) Better scheduling`
        );
      } else if (metric === 'uniqueTargets') {
        recommendations.push(
          `Target more unique accounts: from ${this.yourMetrics.uniqueTargets} to ${comparison[metric].avgCompetitor}. Try: 1) Expand criteria 2) More campaigns 3) Use discover-accounts tool`
        );
      } else if (metric === 'avgResponseTime') {
        recommendations.push(
          `Reduce response time from ${this.yourMetrics.avgResponseTime}h to ${comparison[metric].avgCompetitor}h. Try: 1) Faster automation 2) More frequent checks 3) Batch processing`
        );
      }
    }

    return {
      gaps,
      recommendations,
      totalGaps: gaps.length,
      priorityMetric: gaps[0]?.metric || null,
    };
  }

  /**
   * Get market position summary
   */
  getMarketPosition() {
    const comparison = this.getBenchmarkComparison();
    let aboveAverage = 0;
    let belowAverage = 0;
    let atPar = 0;

    for (const data of Object.values(comparison)) {
      const gap = parseFloat(data.gap);
      if (gap > 0) aboveAverage++;
      else if (gap < 0) belowAverage++;
      else atPar++;
    }

    const percentAbove = ((aboveAverage / (aboveAverage + belowAverage + atPar)) * 100).toFixed(0);

    let tier = 'COMPETITIVE';
    if (aboveAverage > belowAverage * 2) tier = 'PREMIUM';
    else if (belowAverage > aboveAverage * 2) tier = 'NEEDS IMPROVEMENT';

    return {
      tier,
      metricsAboveAverage: aboveAverage,
      metricsBelowAverage: belowAverage,
      metricsAtPar: atPar,
      marketScore: percentAbove, // 0-100
      summary: `You're in ${tier} tier (${percentAbove}% of metrics above average)`,
    };
  }

  /**
   * Competitive advantage analysis
   */
  getCompetitiveAdvantages() {
    const comparison = this.getBenchmarkComparison();
    const advantages = [];

    for (const [metric, data] of Object.entries(comparison)) {
      if (parseFloat(data.gap) > 0) {
        advantages.push({
          metric,
          yourValue: data.yourValue,
          advantage: `+${data.gap} (${data.percentGap}% better than average)`,
          strength: parseFloat(data.percentGap) > 20 ? 'STRONG' : 'MODERATE',
        });
      }
    }

    return advantages.sort((a, b) => b.percentGap - a.percentGap);
  }

  /**
   * Full benchmark report
   */
  getFullReport() {
    return {
      timestamp: new Date().toISOString(),
      yourMetrics: this.yourMetrics,
      competitorCount: this.competitors.length,
      comparison: this.getBenchmarkComparison(),
      gapsAndRecommendations: this.getGapsAndRecommendations(),
      marketPosition: this.getMarketPosition(),
      competitiveAdvantages: this.getCompetitiveAdvantages(),
      actionPlan: this._generateActionPlan(),
    };
  }

  /**
   * Generate prioritized action plan
   */
  _generateActionPlan() {
    const { gaps, recommendations } = this.getGapsAndRecommendations();
    const advantages = this.getCompetitiveAdvantages();

    return {
      shortTerm: [
        `Focus on: ${gaps[0]?.metric || 'overall consistency'}`,
        `Target: Close ${gaps[0]?.percentGap || '5'}% gap in next 30 days`,
        recommendations[0] || 'Analyze competitor templates',
      ],
      mediumTerm: [
        `Achieve top 25% in all metrics`,
        `Build on advantages: ${advantages.map((a) => a.metric).join(', ') || 'consistency'}`,
        `Double-check templates and targeting strategy`,
      ],
      longTerm: [
        `Become top 10% competitor`,
        `Develop unique competitive advantage`,
        `Monitor market changes quarterly`,
      ],
    };
  }

  /**
   * Export report
   */
  export() {
    return {
      report: this.getFullReport(),
      competitors: this.competitors,
      generatedAt: new Date().toISOString(),
    };
  }
}

export default CompetitorAnalyzer;
