const { ObjectId } = require('mongodb');

class PatternLearningEngine {
  constructor(options = {}) {
    this.confidenceThreshold = {
      autoApply: options.autoApplyThreshold || 0.9,
      suggest: options.suggestThreshold || 0.7,
      advisory: options.advisoryThreshold || 0.0
    };
    this.decayRate = options.decayRate || 0.95; // Confidence decay per week
    this.maxPatternAge = options.maxPatternAge || 90; // days
  }

  // Learn patterns from user interactions and component usage
  async learnPatterns(db, projectId, interactions) {
    const patterns = [];
    
    for (const interaction of interactions) {
      const pattern = await this.extractPattern(interaction);
      if (pattern) {
        await this.storePattern(db, projectId, pattern);
        patterns.push(pattern);
      }
    }
    
    // Update confidence scores based on feedback
    await this.updateConfidenceScores(db, projectId);
    
    return patterns;
  }

  // Extract meaningful patterns from user interactions
  async extractPattern(interaction) {
    const { action, componentType, enhancement, context, timestamp } = interaction;
    
    if (!action || !componentType) return null;
    
    const pattern = {
      id: this.generatePatternId(interaction),
      type: 'component_enhancement',
      componentType,
      enhancement: {
        type: enhancement.type,
        properties: enhancement.properties,
        tokens: enhancement.tokens
      },
      context: {
        framework: context.framework,
        theme: context.theme,
        brandPack: context.brandPackId,
        fileType: context.fileType,
        location: context.location // where in component hierarchy
      },
      metadata: {
        action, // 'accept', 'reject', 'manual_apply'
        confidence: 0.5, // initial confidence
        frequency: 1,
        lastSeen: new Date(timestamp),
        created: new Date()
      }
    };
    
    return pattern;
  }

  // Store pattern in MongoDB with proper indexing
  async storePattern(db, projectId, pattern) {
    const collection = db.collection('patterns');
    
    // Check if similar pattern exists
    const existingPattern = await collection.findOne({
      projectId,
      'pattern.id': pattern.id
    });
    
    if (existingPattern) {
      // Update existing pattern frequency and confidence
      await collection.updateOne(
        { _id: existingPattern._id },
        {
          $inc: { 'pattern.metadata.frequency': 1 },
          $set: { 
            'pattern.metadata.lastSeen': pattern.metadata.lastSeen,
            'pattern.metadata.confidence': this.calculateUpdatedConfidence(
              existingPattern.pattern.metadata.confidence,
              pattern.metadata.action
            )
          }
        }
      );
    } else {
      // Insert new pattern
      await collection.insertOne({
        _id: new ObjectId(),
        projectId,
        pattern,
        created: new Date(),
        updated: new Date()
      });
    }
    
    // Create indexes if they don't exist
    await this.ensureIndexes(db);
  }

  // Calculate updated confidence based on user action
  calculateUpdatedConfidence(currentConfidence, action) {
    const adjustments = {
      'accept': 0.1,
      'manual_apply': 0.15,
      'reject': -0.2,
      'ignore': -0.05
    };
    
    const adjustment = adjustments[action] || 0;
    const newConfidence = Math.max(0, Math.min(1, currentConfidence + adjustment));
    
    return newConfidence;
  }

  // Update confidence scores with time-based decay
  async updateConfidenceScores(db, projectId) {
    const collection = db.collection('patterns');
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Apply time decay to confidence scores
    const cursor = collection.find({ 
      projectId,
      'pattern.metadata.lastSeen': { $lt: oneWeekAgo }
    });
    
    await cursor.forEach(async (doc) => {
      const pattern = doc.pattern;
      const weeksOld = Math.floor((now - pattern.metadata.lastSeen) / (7 * 24 * 60 * 60 * 1000));
      const decayedConfidence = pattern.metadata.confidence * Math.pow(this.decayRate, weeksOld);
      
      await collection.updateOne(
        { _id: doc._id },
        {
          $set: {
            'pattern.metadata.confidence': Math.max(0.1, decayedConfidence),
            updated: now
          }
        }
      );
    });
  }

  // Get patterns for a project with confidence filtering
  async getPatterns(db, projectId, filters = {}) {
    const collection = db.collection('patterns');
    const query = { projectId };
    
    // Apply filters
    if (filters.componentType) {
      query['pattern.componentType'] = filters.componentType;
    }
    
    if (filters.minConfidence) {
      query['pattern.metadata.confidence'] = { $gte: filters.minConfidence };
    }
    
    if (filters.context) {
      for (const [key, value] of Object.entries(filters.context)) {
        query[`pattern.context.${key}`] = value;
      }
    }
    
    const patterns = await collection
      .find(query)
      .sort({ 'pattern.metadata.confidence': -1, 'pattern.metadata.frequency': -1 })
      .limit(filters.limit || 50)
      .toArray();
    
    return patterns.map(doc => ({
      ...doc.pattern,
      _id: doc._id,
      projectId: doc.projectId
    }));
  }

  // Get enhancement suggestions based on learned patterns
  async getSuggestions(db, projectId, component, context = {}) {
    const patterns = await this.getPatterns(db, projectId, {
      componentType: component.type,
      context,
      minConfidence: this.confidenceThreshold.advisory
    });
    
    const suggestions = [];
    
    for (const pattern of patterns) {
      const confidence = pattern.metadata.confidence;
      const suggestion = {
        id: pattern.id,
        type: pattern.enhancement.type,
        confidence,
        action: this.getActionType(confidence),
        enhancement: pattern.enhancement,
        reasoning: this.generateReasoning(pattern),
        metadata: {
          frequency: pattern.metadata.frequency,
          lastSeen: pattern.metadata.lastSeen,
          similar: await this.findSimilarPatterns(db, projectId, pattern)
        }
      };
      
      suggestions.push(suggestion);
    }
    
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  // Determine action type based on confidence
  getActionType(confidence) {
    if (confidence >= this.confidenceThreshold.autoApply) {
      return 'auto_apply';
    } else if (confidence >= this.confidenceThreshold.suggest) {
      return 'suggest';
    } else {
      return 'advisory';
    }
  }

  // Generate human-readable reasoning for suggestions
  generateReasoning(pattern) {
    const { frequency, confidence } = pattern.metadata;
    const { componentType, enhancement } = pattern;
    
    let reasoning = `Based on ${frequency} similar ${componentType} component${frequency > 1 ? 's' : ''}, `;
    reasoning += `this ${enhancement.type} enhancement `;
    
    if (confidence >= 0.9) {
      reasoning += 'is highly recommended and commonly used.';
    } else if (confidence >= 0.7) {
      reasoning += 'has been well-received in similar contexts.';
    } else {
      reasoning += 'might be worth considering.';
    }
    
    return reasoning;
  }

  // Find similar patterns for additional context
  async findSimilarPatterns(db, projectId, targetPattern) {
    const collection = db.collection('patterns');
    
    const similar = await collection
      .find({
        projectId,
        'pattern.componentType': targetPattern.componentType,
        'pattern.enhancement.type': targetPattern.enhancement.type,
        'pattern.id': { $ne: targetPattern.id }
      })
      .limit(3)
      .toArray();
    
    return similar.map(doc => ({
      id: doc.pattern.id,
      confidence: doc.pattern.metadata.confidence,
      frequency: doc.pattern.metadata.frequency
    }));
  }

  // Record user feedback to improve learning
  async recordFeedback(db, projectId, patternId, feedback) {
    const feedbackCollection = db.collection('feedback');
    const patternsCollection = db.collection('patterns');
    
    // Store feedback
    await feedbackCollection.insertOne({
      _id: new ObjectId(),
      projectId,
      patternId,
      feedback: {
        action: feedback.action, // 'accept', 'reject', 'modify'
        rating: feedback.rating, // 1-5 scale
        comments: feedback.comments,
        context: feedback.context
      },
      timestamp: new Date()
    });
    
    // Update pattern confidence based on feedback
    const pattern = await patternsCollection.findOne({
      projectId,
      'pattern.id': patternId
    });
    
    if (pattern) {
      const newConfidence = this.calculateUpdatedConfidence(
        pattern.pattern.metadata.confidence,
        feedback.action
      );
      
      await patternsCollection.updateOne(
        { _id: pattern._id },
        {
          $set: {
            'pattern.metadata.confidence': newConfidence,
            updated: new Date()
          }
        }
      );
    }
  }

  // Clean up old patterns and feedback
  async cleanup(db, projectId) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.maxPatternAge);
    
    // Remove old patterns with low confidence
    await db.collection('patterns').deleteMany({
      projectId,
      'pattern.metadata.confidence': { $lt: 0.1 },
      'pattern.metadata.lastSeen': { $lt: cutoffDate }
    });
    
    // Remove old feedback
    await db.collection('feedback').deleteMany({
      projectId,
      timestamp: { $lt: cutoffDate }
    });
  }

  // Generate pattern ID based on content
  generatePatternId(interaction) {
    const { componentType, enhancement, context } = interaction;
    const content = [
      componentType,
      enhancement.type,
      JSON.stringify(enhancement.properties),
      context.framework,
      context.theme
    ].join('|');
    
    // Simple hash function for pattern ID
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return `pattern_${Math.abs(hash)}`;
  }

  // Ensure required database indexes exist
  async ensureIndexes(db) {
    const patternsCollection = db.collection('patterns');
    const feedbackCollection = db.collection('feedback');
    
    // Patterns collection indexes
    await patternsCollection.createIndex({ projectId: 1, 'pattern.componentType': 1 });
    await patternsCollection.createIndex({ projectId: 1, 'pattern.metadata.confidence': -1 });
    await patternsCollection.createIndex({ projectId: 1, 'pattern.id': 1 }, { unique: true });
    await patternsCollection.createIndex({ 'pattern.metadata.lastSeen': 1 });
    
    // Feedback collection indexes
    await feedbackCollection.createIndex({ projectId: 1, patternId: 1 });
    await feedbackCollection.createIndex({ timestamp: 1 });
  }
}

const { ConfidenceEngine } = require('./confidence');

module.exports = { 
  PatternLearningEngine,
  ConfidenceEngine
};