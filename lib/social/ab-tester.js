/**
 * A/B Testing Framework
 * Formally test templates, targets, and strategies with statistical rigor
 */

export class ABTest {
  constructor(testName, controlGroup = [], treatmentGroup = []) {
    this.testName = testName;
    this.controlGroup = controlGroup; // ["template1", "template2"]
    this.treatmentGroup = treatmentGroup; // ["new_template1"]
    this.results = {
      control: [],
      treatment: [],
    };
    this.startDate = Date.now();
    this.endDate = null;
    this.status = 'running';
  }

  /**
   * Record engagement result for a group
   */
  recordResult(group, success, metadata = {}) {
    if (!['control', 'treatment'].includes(group)) {
      throw new Error('Group must be "control" or "treatment"');
    }

    this.results[group].push({
      success,
      timestamp: Date.now(),
      metadata,
    });
  }

  /**
   * Calculate conversion rates for each group
   */
  getConversionRates() {
    const controlRate =
      this.results.control.length > 0
        ? (this.results.control.filter((r) => r.success).length / this.results.control.length) * 100
        : 0;

    const treatmentRate =
      this.results.treatment.length > 0
        ? (this.results.treatment.filter((r) => r.success).length / this.results.treatment.length) * 100
        : 0;

    return {
      control: controlRate.toFixed(1),
      treatment: treatmentRate.toFixed(1),
    };
  }

  /**
   * Calculate statistical significance using Chi-square test
   * Returns p-value: < 0.05 means result is statistically significant
   */
  calculateSignificance() {
    const n1 = this.results.control.length;
    const n2 = this.results.treatment.length;

    if (n1 === 0 || n2 === 0) {
      return {
        pValue: 1.0,
        isSignificant: false,
        message: 'Not enough data. Run test longer.',
      };
    }

    const successControl = this.results.control.filter((r) => r.success).length;
    const successTreatment = this.results.treatment.filter((r) => r.success).length;

    const controlRate = successControl / n1;
    const treatmentRate = successTreatment / n2;

    // Pooled proportion
    const pooledRate = (successControl + successTreatment) / (n1 + n2);

    if (pooledRate === 0 || pooledRate === 1) {
      return {
        pValue: 1.0,
        isSignificant: false,
        message: 'No variation in results. Cannot calculate significance.',
      };
    }

    // Chi-square statistic
    const chiSquare =
      ((controlRate - treatmentRate) ** 2) /
      (pooledRate * (1 - pooledRate) * (1 / n1 + 1 / n2));

    // Approximate p-value from chi-square (1 degree of freedom)
    // χ² = 3.841 → p = 0.05
    // χ² = 2.706 → p = 0.10
    let pValue;
    if (chiSquare > 3.841) {
      pValue = 0.05;
    } else if (chiSquare > 2.706) {
      pValue = 0.10;
    } else if (chiSquare > 1.074) {
      pValue = 0.30;
    } else {
      pValue = 0.50;
    }

    const isSignificant = pValue < 0.05;

    return {
      chiSquare: chiSquare.toFixed(2),
      pValue: pValue.toFixed(4),
      isSignificant,
      confidence: isSignificant ? '95%' : 'insufficient',
    };
  }

  /**
   * Calculate effect size and improvement
   */
  calculateEffectSize() {
    const rates = this.getConversionRates();
    const controlRate = parseFloat(rates.control) / 100;
    const treatmentRate = parseFloat(rates.treatment) / 100;

    const absoluteImprovement = (treatmentRate - controlRate) * 100;
    const relativeImprovement =
      controlRate > 0 ? ((treatmentRate - controlRate) / controlRate) * 100 : 0;

    return {
      absoluteImprovement: absoluteImprovement.toFixed(2),
      relativeImprovement: relativeImprovement.toFixed(2),
      winner: treatmentRate > controlRate ? 'treatment' : 'control',
      effectSize: Math.abs(relativeImprovement) > 10 ? 'LARGE' : 'SMALL',
    };
  }

  /**
   * Calculate sample size needed for significance
   * Using Cochran's formula
   */
  getRequiredSampleSize(minEffectSize = 0.1) {
    const rates = this.getConversionRates();
    const controlRate = parseFloat(rates.control) / 100;
    const treatmentRate = parseFloat(rates.treatment) / 100;

    if (controlRate === 0 || treatmentRate === 0) {
      return {
        requiredTotal: 200,
        message: 'Run at least 100 trials per group for initial data',
      };
    }

    const difference = Math.abs(treatmentRate - controlRate);

    if (difference < minEffectSize) {
      // Cochran's formula: n = (Z² * p(1-p)) / d²
      // Z = 1.96 for 95% confidence
      // p = average of two rates
      const p = (controlRate + treatmentRate) / 2;
      const d = minEffectSize;
      const n = ((1.96 * 1.96 * 2 * p * (1 - p)) / (d * d)).toFixed(0);

      return {
        requiredTotal: Math.max(200, parseInt(n)),
        currentTotal: this.results.control.length + this.results.treatment.length,
        remaining: Math.max(0, parseInt(n) - (this.results.control.length + this.results.treatment.length)),
        message: `Need ${remaining} more trials total for 95% confidence`,
      };
    }

    return {
      requiredTotal: 100,
      currentTotal: this.results.control.length + this.results.treatment.length,
      remaining: 0,
      message: 'Sample size is sufficient',
    };
  }

  /**
   * Get test results summary
   */
  getSummary() {
    const rates = this.getConversionRates();
    const significance = this.calculateSignificance();
    const effectSize = this.calculateEffectSize();
    const sampleSize = this.getRequiredSampleSize();

    return {
      testName: this.testName,
      status: this.status,
      duration: `${Math.floor((this.endDate || Date.now() - this.startDate) / (1000 * 60))} minutes`,
      controlGroup: {
        name: 'Control',
        conversions: this.results.control.filter((r) => r.success).length,
        total: this.results.control.length,
        rate: `${rates.control}%`,
      },
      treatmentGroup: {
        name: 'Treatment',
        conversions: this.results.treatment.filter((r) => r.success).length,
        total: this.results.treatment.length,
        rate: `${rates.treatment}%`,
      },
      statistics: {
        absoluteImprovement: `${effectSize.absoluteImprovement}%`,
        relativeImprovement: `${effectSize.relativeImprovement}%`,
        winner: effectSize.winner.toUpperCase(),
        pValue: significance.pValue,
        isSignificant: significance.isSignificant,
        confidence: significance.confidence,
      },
      recommendation: this._generateRecommendation(rates, significance, effectSize),
      nextSteps: this._generateNextSteps(significance, sampleSize),
    };
  }

  /**
   * Recommend action based on results
   */
  _generateRecommendation(rates, significance, effectSize) {
    if (!significance.isSignificant) {
      return `Results not statistically significant yet. Continue test (need ${this.getRequiredSampleSize().remaining} more trials).`;
    }

    if (effectSize.winner === 'treatment') {
      const improvement = parseFloat(effectSize.relativeImprovement);
      return `✅ TREATMENT WINS! ${improvement.toFixed(1)}% improvement. Recommend rolling out treatment to 100% of traffic.`;
    } else {
      return `⚠️ CONTROL PERFORMS BETTER. Keep current approach. Review treatment strategy.`;
    }
  }

  /**
   * Generate next steps
   */
  _generateNextSteps(significance, sampleSize) {
    if (!significance.isSignificant) {
      return [
        `Run test longer: need ~${sampleSize.remaining} more samples`,
        'Check for external factors affecting results',
        'Ensure groups are properly randomized',
      ];
    }

    return [
      'Archive this test',
      'Document winner and winning metrics',
      'Plan next test based on learnings',
      'Monitor winner performance over time',
    ];
  }

  /**
   * End the test
   */
  endTest() {
    this.endDate = Date.now();
    this.status = 'complete';
  }

  /**
   * Export test data
   */
  export() {
    return {
      testName: this.testName,
      status: this.status,
      startDate: new Date(this.startDate).toISOString(),
      endDate: this.endDate ? new Date(this.endDate).toISOString() : null,
      summary: this.getSummary(),
      rawResults: this.results,
    };
  }

  /**
   * Reset test
   */
  reset() {
    this.results = { control: [], treatment: [] };
    this.startDate = Date.now();
    this.endDate = null;
    this.status = 'running';
  }
}

export default ABTest;
