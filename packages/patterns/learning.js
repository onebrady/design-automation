const { PatternLearningEngine } = require('./index');

class AdvancedLearning extends PatternLearningEngine {
  constructor(options = {}) {
    super(options);
    this.correlationThreshold = options.correlationThreshold || 0.6;
    this.learningRate = options.learningRate || 0.1;
    this.minimumSamples = options.minimumSamples || 5;
  }

  // Advanced pattern correlation analysis
  async analyzeCorrelations(db, projectId, timeWindow = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeWindow);
    
    // Get recent patterns for correlation analysis
    const patterns = await db.collection('patterns').find({
      projectId,
      'pattern.metadata.lastSeen': { $gte: cutoffDate },
      'pattern.metadata.frequency': { $gte: this.minimumSamples }
    }).toArray();
    
    const correlations = [];
    
    // Analyze correlations between different pattern types
    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const correlation = await this.calculateCorrelation(
          patterns[i].pattern,
          patterns[j].pattern,
          db,
          projectId
        );
        
        if (correlation.score >= this.correlationThreshold) {
          correlations.push(correlation);
        }
      }
    }
    
    return correlations.sort((a, b) => b.score - a.score);
  }

  // Calculate correlation between two patterns
  async calculateCorrelation(patternA, patternB, db, projectId) {
    // Get feedback data for both patterns
    const feedbackA = await this.getPatternFeedback(db, projectId, patternA.id);
    const feedbackB = await this.getPatternFeedback(db, projectId, patternB.id);
    
    // Calculate context similarity
    const contextSimilarity = this.calculateContextSimilarity(
      patternA.context,
      patternB.context
    );
    
    // Calculate co-occurrence frequency
    const coOccurrence = await this.calculateCoOccurrence(
      db,
      projectId,
      patternA.id,
      patternB.id
    );
    
    // Calculate timing correlation (applied in sequence)
    const timingCorrelation = await this.calculateTimingCorrelation(
      feedbackA,
      feedbackB
    );
    
    const score = (contextSimilarity * 0.4) + 
                 (coOccurrence * 0.4) + 
                 (timingCorrelation * 0.2);
    
    return {
      patternA: patternA.id,
      patternB: patternB.id,
      score,
      details: {
        contextSimilarity,
        coOccurrence,
        timingCorrelation
      },
      type: this.classifyCorrelation(score, contextSimilarity)
    };
  }

  // Calculate context similarity between patterns
  calculateContextSimilarity(contextA, contextB) {
    const keys = new Set([...Object.keys(contextA), ...Object.keys(contextB)]);
    let matches = 0;
    
    for (const key of keys) {
      if (contextA[key] === contextB[key]) {
        matches++;
      }
    }
    
    return matches / keys.size;
  }

  // Calculate how often patterns are applied together
  async calculateCoOccurrence(db, projectId, patternIdA, patternIdB) {
    const sessionWindow = 60 * 60 * 1000; // 1 hour session window
    
    // Get feedback for both patterns
    const feedbackA = await db.collection('feedback').find({
      projectId,
      patternId: patternIdA,
      'feedback.action': { $in: ['accept', 'manual_apply'] }
    }).toArray();
    
    const feedbackB = await db.collection('feedback').find({
      projectId,
      patternId: patternIdB,
      'feedback.action': { $in: ['accept', 'manual_apply'] }
    }).toArray();
    
    // Count co-occurrences within session windows
    let coOccurrences = 0;
    
    for (const fbA of feedbackA) {
      for (const fbB of feedbackB) {
        const timeDiff = Math.abs(fbA.timestamp - fbB.timestamp);
        if (timeDiff <= sessionWindow) {
          coOccurrences++;
        }
      }
    }
    
    const totalOccurrences = Math.max(feedbackA.length, feedbackB.length);
    return totalOccurrences > 0 ? coOccurrences / totalOccurrences : 0;
  }

  // Calculate timing correlation (sequential application)
  async calculateTimingCorrelation(feedbackA, feedbackB) {
    const sequenceWindow = 10 * 60 * 1000; // 10 minutes
    let sequentialCount = 0;
    
    for (const fbA of feedbackA) {
      for (const fbB of feedbackB) {
        const timeDiff = fbB.timestamp - fbA.timestamp;
        if (timeDiff > 0 && timeDiff <= sequenceWindow) {
          sequentialCount++;
        }
      }
    }
    
    return feedbackA.length > 0 ? sequentialCount / feedbackA.length : 0;
  }

  // Get feedback data for a pattern
  async getPatternFeedback(db, projectId, patternId) {
    return await db.collection('feedback').find({
      projectId,
      patternId
    }).toArray();
  }

  // Classify correlation type
  classifyCorrelation(score, contextSimilarity) {
    if (contextSimilarity > 0.8) {
      return 'contextual'; // Similar contexts
    } else if (score > 0.8) {
      return 'sequential'; // Often applied in sequence
    } else if (score > 0.6) {
      return 'complementary'; // Work well together
    } else {
      return 'weak';
    }
  }

  // Learn user preferences from interaction patterns
  async learnUserPreferences(db, projectId, userId = null) {
    const query = { projectId };
    if (userId) {
      query['feedback.context.userId'] = userId;
    }
    
    const feedbackData = await db.collection('feedback').find(query).toArray();
    
    const preferences = {
      componentTypes: {},
      enhancementTypes: {},
      contexts: {},
      timePatterns: {},
      confidenceCalibration: {}
    };
    
    // Analyze component type preferences
    for (const feedback of feedbackData) {
      const pattern = await db.collection('patterns').findOne({
        projectId,
        'pattern.id': feedback.patternId
      });
      
      if (!pattern) continue;
      
      const componentType = pattern.pattern.componentType;
      const enhancementType = pattern.pattern.enhancement.type;
      const action = feedback.feedback.action;
      
      // Component type preferences
      if (!preferences.componentTypes[componentType]) {
        preferences.componentTypes[componentType] = { accept: 0, reject: 0 };
      }
      if (action === 'accept' || action === 'manual_apply') {
        preferences.componentTypes[componentType].accept++;
      } else if (action === 'reject') {
        preferences.componentTypes[componentType].reject++;
      }
      
      // Enhancement type preferences
      if (!preferences.enhancementTypes[enhancementType]) {
        preferences.enhancementTypes[enhancementType] = { accept: 0, reject: 0 };
      }
      if (action === 'accept' || action === 'manual_apply') {
        preferences.enhancementTypes[enhancementType].accept++;
      } else if (action === 'reject') {
        preferences.enhancementTypes[enhancementType].reject++;
      }
    }
    
    // Calculate preference scores
    for (const [type, counts] of Object.entries(preferences.componentTypes)) {
      const total = counts.accept + counts.reject;
      preferences.componentTypes[type].score = total > 0 ? counts.accept / total : 0.5;
    }
    
    for (const [type, counts] of Object.entries(preferences.enhancementTypes)) {
      const total = counts.accept + counts.reject;
      preferences.enhancementTypes[type].score = total > 0 ? counts.accept / total : 0.5;
    }
    
    return preferences;
  }

  // Adapt suggestions based on learned preferences
  async adaptSuggestions(suggestions, preferences) {
    return suggestions.map(suggestion => {
      let adaptedConfidence = suggestion.confidence;
      
      // Adjust based on component type preference
      const componentPref = preferences.componentTypes[suggestion.componentType];
      if (componentPref) {
        adaptedConfidence *= (0.5 + componentPref.score * 0.5);
      }
      
      // Adjust based on enhancement type preference
      const enhancementPref = preferences.enhancementTypes[suggestion.type];
      if (enhancementPref) {
        adaptedConfidence *= (0.5 + enhancementPref.score * 0.5);
      }
      
      return {
        ...suggestion,
        originalConfidence: suggestion.confidence,
        confidence: Math.max(0.1, Math.min(1.0, adaptedConfidence)),
        adaptationReason: this.explainAdaptation(componentPref, enhancementPref)
      };
    });
  }

  // Explain why confidence was adapted
  explainAdaptation(componentPref, enhancementPref) {
    const reasons = [];
    
    if (componentPref && componentPref.score > 0.7) {
      reasons.push('You frequently accept suggestions for this component type');
    } else if (componentPref && componentPref.score < 0.3) {
      reasons.push('You rarely accept suggestions for this component type');
    }
    
    if (enhancementPref && enhancementPref.score > 0.7) {
      reasons.push('You frequently accept this type of enhancement');
    } else if (enhancementPref && enhancementPref.score < 0.3) {
      reasons.push('You rarely accept this type of enhancement');
    }
    
    return reasons.length > 0 ? reasons.join('; ') : null;
  }

  // Perform batch learning from historical data
  async batchLearn(db, projectId, batchSize = 100) {
    const feedbackCollection = db.collection('feedback');
    const total = await feedbackCollection.countDocuments({ projectId });
    let processed = 0;
    
    const results = {
      patternsUpdated: 0,
      correlationsFound: 0,
      preferencesLearned: 0
    };
    
    while (processed < total) {
      const batch = await feedbackCollection
        .find({ projectId })
        .skip(processed)
        .limit(batchSize)
        .toArray();
      
      // Process feedback batch
      for (const feedback of batch) {
        await this.recordFeedback(db, projectId, feedback.patternId, feedback.feedback);
        results.patternsUpdated++;
      }
      
      processed += batch.length;
    }
    
    // Analyze correlations
    const correlations = await this.analyzeCorrelations(db, projectId);
    results.correlationsFound = correlations.length;
    
    // Learn preferences
    const preferences = await this.learnUserPreferences(db, projectId);
    results.preferencesLearned = Object.keys(preferences.componentTypes).length;
    
    return results;
  }
}

module.exports = { AdvancedLearning };