class ConfidenceEngine {
  constructor(options = {}) {
    this.baselineConfidence = options.baselineConfidence || 0.5;
    this.learningRate = options.learningRate || 0.1;
    this.decayRate = options.decayRate || 0.95;
    this.volatilityThreshold = options.volatilityThreshold || 0.3;
    this.minimumSamples = options.minimumSamples || 3;
  }

  // Calculate confidence score for a pattern
  calculateConfidence(pattern, feedbackHistory = [], contextFactors = {}) {
    const factors = {
      frequency: this.calculateFrequencyScore(pattern.metadata.frequency),
      recency: this.calculateRecencyScore(pattern.metadata.lastSeen),
      feedback: this.calculateFeedbackScore(feedbackHistory),
      stability: this.calculateStabilityScore(feedbackHistory),
      context: this.calculateContextScore(pattern, contextFactors),
      correlation: contextFactors.correlationScore || 0.5
    };
    
    // Weighted confidence calculation
    const weights = {
      frequency: 0.25,
      recency: 0.15,
      feedback: 0.30,
      stability: 0.15,
      context: 0.10,
      correlation: 0.05
    };
    
    let confidence = 0;
    for (const [factor, score] of Object.entries(factors)) {
      confidence += (score * weights[factor]);
    }
    
    // Apply adjustments
    confidence = this.applyConfidenceAdjustments(confidence, pattern, feedbackHistory);
    
    return {
      score: Math.max(0.1, Math.min(1.0, confidence)),
      factors,
      weights,
      explanation: this.explainConfidence(factors, weights)
    };
  }

  // Calculate score based on pattern frequency
  calculateFrequencyScore(frequency) {
    // Logarithmic scale for frequency scoring
    if (frequency <= 1) return 0.3;
    if (frequency <= 3) return 0.5;
    if (frequency <= 10) return 0.7;
    if (frequency <= 25) return 0.85;
    return 0.95;
  }

  // Calculate score based on pattern recency
  calculateRecencyScore(lastSeen) {
    const now = new Date();
    const daysSinceLastSeen = (now - lastSeen) / (24 * 60 * 60 * 1000);
    
    if (daysSinceLastSeen <= 1) return 1.0;
    if (daysSinceLastSeen <= 7) return 0.9;
    if (daysSinceLastSeen <= 30) return 0.7;
    if (daysSinceLastSeen <= 90) return 0.5;
    return 0.3;
  }

  // Calculate score based on feedback history
  calculateFeedbackScore(feedbackHistory) {
    if (feedbackHistory.length === 0) {
      return this.baselineConfidence;
    }
    
    let positiveWeight = 0;
    let totalWeight = 0;
    
    // Weight recent feedback more heavily
    const now = new Date();
    
    for (const feedback of feedbackHistory) {
      const ageInDays = (now - feedback.timestamp) / (24 * 60 * 60 * 1000);
      const timeWeight = Math.exp(-ageInDays / 30); // Exponential decay over 30 days
      
      totalWeight += timeWeight;
      
      if (feedback.feedback.action === 'accept') {
        positiveWeight += timeWeight * 1.0;
      } else if (feedback.feedback.action === 'manual_apply') {
        positiveWeight += timeWeight * 1.2; // Higher weight for manual application
      } else if (feedback.feedback.action === 'modify') {
        positiveWeight += timeWeight * 0.7; // Partial positive signal
      } else if (feedback.feedback.action === 'reject') {
        positiveWeight += timeWeight * 0.0;
      }
      
      // Factor in explicit ratings if available
      if (feedback.feedback.rating) {
        const ratingScore = (feedback.feedback.rating - 1) / 4; // Convert 1-5 to 0-1
        positiveWeight += timeWeight * ratingScore * 0.5;
      }
    }
    
    return totalWeight > 0 ? positiveWeight / totalWeight : this.baselineConfidence;
  }

  // Calculate stability score (consistency of feedback)
  calculateStabilityScore(feedbackHistory) {
    if (feedbackHistory.length < this.minimumSamples) {
      return 0.5; // Neutral stability for insufficient data
    }
    
    // Calculate variance in feedback scores
    const scores = feedbackHistory.map(fb => {
      const actionScores = {
        'accept': 1.0,
        'manual_apply': 1.0,
        'modify': 0.5,
        'reject': 0.0,
        'ignore': 0.3
      };
      return actionScores[fb.feedback.action] || 0.5;
    });
    
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stability = 1 - Math.min(variance / this.volatilityThreshold, 1);
    
    return stability;
  }

  // Calculate context-based confidence factors
  calculateContextScore(pattern, contextFactors) {
    let score = 0.5; // Neutral baseline
    
    // Framework compatibility
    if (contextFactors.currentFramework === pattern.context.framework) {
      score += 0.15;
    }
    
    // Brand pack alignment
    if (contextFactors.currentBrandPack === pattern.context.brandPack) {
      score += 0.15;
    }
    
    // Theme consistency
    if (contextFactors.currentTheme === pattern.context.theme) {
      score += 0.10;
    }
    
    // File type match
    if (contextFactors.currentFileType === pattern.context.fileType) {
      score += 0.10;
    }
    
    return Math.max(0, Math.min(1, score));
  }

  // Apply additional confidence adjustments
  applyConfidenceAdjustments(baseConfidence, pattern, feedbackHistory) {
    let adjusted = baseConfidence;
    
    // Boost confidence for patterns with high manual application rate
    const manualApplications = feedbackHistory.filter(
      fb => fb.feedback.action === 'manual_apply'
    ).length;
    
    if (manualApplications > feedbackHistory.length * 0.3) {
      adjusted += 0.1; // Boost for high manual application
    }
    
    // Reduce confidence for patterns with high modification rate
    const modifications = feedbackHistory.filter(
      fb => fb.feedback.action === 'modify'
    ).length;
    
    if (modifications > feedbackHistory.length * 0.5) {
      adjusted -= 0.15; // Penalty for high modification rate
    }
    
    // Boost for patterns that improve accessibility
    if (pattern.enhancement.properties && pattern.enhancement.properties.accessibility) {
      adjusted += 0.05;
    }
    
    // Boost for patterns that use brand tokens
    if (pattern.enhancement.tokens && pattern.enhancement.tokens.length > 0) {
      adjusted += 0.05;
    }
    
    return adjusted;
  }

  // Generate human-readable explanation of confidence score
  explainConfidence(factors, weights) {
    const explanations = [];
    
    // Find the most influential factors
    const weightedFactors = Object.entries(factors)
      .map(([name, score]) => ({ name, score, weight: weights[name], impact: score * weights[name] }))
      .sort((a, b) => b.impact - a.impact);
    
    for (const factor of weightedFactors.slice(0, 3)) {
      const explanation = this.explainFactor(factor.name, factor.score);
      if (explanation) {
        explanations.push(explanation);
      }
    }
    
    return explanations;
  }

  // Explain individual confidence factors
  explainFactor(factorName, score) {
    const explanations = {
      frequency: {
        high: 'This pattern has been used frequently',
        medium: 'This pattern has moderate usage',
        low: 'This pattern is rarely used'
      },
      recency: {
        high: 'Recently applied pattern',
        medium: 'Moderately recent pattern',
        low: 'Haven\'t used this pattern recently'
      },
      feedback: {
        high: 'Consistently positive user feedback',
        medium: 'Mixed user feedback',
        low: 'Generally negative user feedback'
      },
      stability: {
        high: 'Very consistent user behavior',
        medium: 'Somewhat consistent user behavior',
        low: 'Inconsistent user behavior'
      },
      context: {
        high: 'Perfect context match',
        medium: 'Good context match',
        low: 'Poor context match'
      },
      correlation: {
        high: 'Strong correlation with accepted patterns',
        medium: 'Moderate correlation with user preferences',
        low: 'Weak correlation with user patterns'
      }
    };
    
    let level;
    if (score >= 0.7) level = 'high';
    else if (score >= 0.4) level = 'medium';
    else level = 'low';
    
    return explanations[factorName]?.[level];
  }

  // Calibrate confidence scores based on actual outcomes
  async calibrateConfidence(db, projectId, timeWindow = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeWindow);
    
    // Get patterns with their predicted confidence and actual outcomes
    const patterns = await db.collection('patterns').find({
      projectId,
      'pattern.metadata.lastSeen': { $gte: cutoffDate }
    }).toArray();
    
    const calibrationData = [];
    
    for (const patternDoc of patterns) {
      const pattern = patternDoc.pattern;
      const feedback = await db.collection('feedback').find({
        projectId,
        patternId: pattern.id,
        timestamp: { $gte: cutoffDate }
      }).toArray();
      
      if (feedback.length > 0) {
        const actualSuccessRate = this.calculateActualSuccessRate(feedback);
        const predictedConfidence = pattern.metadata.confidence;
        
        calibrationData.push({
          patternId: pattern.id,
          predicted: predictedConfidence,
          actual: actualSuccessRate,
          samples: feedback.length
        });
      }
    }
    
    // Calculate calibration metrics
    const calibrationMetrics = this.calculateCalibrationMetrics(calibrationData);
    
    return {
      calibrationData,
      metrics: calibrationMetrics,
      recommendations: this.generateCalibrationRecommendations(calibrationMetrics)
    };
  }

  // Calculate actual success rate from feedback
  calculateActualSuccessRate(feedback) {
    const positiveActions = ['accept', 'manual_apply'];
    const positiveCount = feedback.filter(
      fb => positiveActions.includes(fb.feedback.action)
    ).length;
    
    return feedback.length > 0 ? positiveCount / feedback.length : 0;
  }

  // Calculate calibration metrics
  calculateCalibrationMetrics(calibrationData) {
    if (calibrationData.length === 0) {
      return { reliability: 0, sharpness: 0, accuracy: 0 };
    }
    
    // Reliability (calibration curve)
    const bins = this.createCalibrationBins(calibrationData);
    const reliability = this.calculateReliability(bins);
    
    // Sharpness (confidence in predictions)
    const sharpness = this.calculateSharpness(calibrationData);
    
    // Overall accuracy
    const accuracy = this.calculateAccuracy(calibrationData);
    
    return { reliability, sharpness, accuracy, bins };
  }

  // Create calibration bins for reliability calculation
  createCalibrationBins(data, binCount = 10) {
    const bins = Array(binCount).fill(null).map(() => ({ predicted: [], actual: [] }));
    
    for (const point of data) {
      const binIndex = Math.min(Math.floor(point.predicted * binCount), binCount - 1);
      bins[binIndex].predicted.push(point.predicted);
      bins[binIndex].actual.push(point.actual);
    }
    
    return bins.map(bin => ({
      avgPredicted: bin.predicted.length > 0 ? 
        bin.predicted.reduce((sum, p) => sum + p, 0) / bin.predicted.length : 0,
      avgActual: bin.actual.length > 0 ? 
        bin.actual.reduce((sum, a) => sum + a, 0) / bin.actual.length : 0,
      count: bin.predicted.length
    }));
  }

  // Calculate reliability score
  calculateReliability(bins) {
    let totalError = 0;
    let totalCount = 0;
    
    for (const bin of bins) {
      if (bin.count > 0) {
        const error = Math.abs(bin.avgPredicted - bin.avgActual);
        totalError += error * bin.count;
        totalCount += bin.count;
      }
    }
    
    return totalCount > 0 ? 1 - (totalError / totalCount) : 0;
  }

  // Calculate sharpness (confidence distribution)
  calculateSharpness(data) {
    const predictions = data.map(d => d.predicted);
    const mean = predictions.reduce((sum, p) => sum + p, 0) / predictions.length;
    const variance = predictions.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / predictions.length;
    
    return Math.sqrt(variance); // Higher is better for sharpness
  }

  // Calculate overall accuracy
  calculateAccuracy(data) {
    const totalError = data.reduce((sum, point) => 
      sum + Math.abs(point.predicted - point.actual), 0);
    
    return data.length > 0 ? 1 - (totalError / data.length) : 0;
  }

  // Generate calibration improvement recommendations
  generateCalibrationRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.reliability < 0.8) {
      recommendations.push({
        type: 'reliability',
        message: 'Confidence scores are not well calibrated. Consider adjusting confidence weights.',
        priority: 'high'
      });
    }
    
    if (metrics.sharpness < 0.2) {
      recommendations.push({
        type: 'sharpness',
        message: 'Confidence scores lack discrimination. Increase factor sensitivity.',
        priority: 'medium'
      });
    }
    
    if (metrics.accuracy < 0.7) {
      recommendations.push({
        type: 'accuracy',
        message: 'Overall prediction accuracy is low. Review confidence calculation method.',
        priority: 'high'
      });
    }
    
    return recommendations;
  }
}

module.exports = { ConfidenceEngine };