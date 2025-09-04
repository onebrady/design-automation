const { ComponentDetector } = require('./detector');
const { AccessibilityAnalyzer } = require('./accessibility');
const { AriaGenerator } = require('./aria-generator');

class SemanticAnalyzer {
  constructor(options = {}) {
    this.options = {
      enableComponentDetection: options.enableComponentDetection !== false,
      enableAccessibilityAnalysis: options.enableAccessibilityAnalysis !== false,
      enableAriaGeneration: options.enableAriaGeneration !== false,
      wcagLevel: options.wcagLevel || 'AA',
      confidenceThreshold: options.confidenceThreshold || 0.7,
      ...options
    };

    this.componentDetector = new ComponentDetector({
      confidenceThreshold: this.options.confidenceThreshold
    });

    this.accessibilityAnalyzer = new AccessibilityAnalyzer({
      level: this.options.wcagLevel
    });

    this.ariaGenerator = new AriaGenerator({
      preserveExisting: true,
      generateIds: true
    });

    this.cache = new Map();
  }

  // Main analysis method
  async analyzeSemantics(html, options = {}) {
    const cacheKey = this.generateCacheKey(html, options);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const analysis = {
      timestamp: new Date().toISOString(),
      options: { ...this.options, ...options },
      components: null,
      accessibility: null,
      enhancements: null,
      semanticScore: null,
      recommendations: [],
      summary: {}
    };

    // Component Detection
    if (this.options.enableComponentDetection) {
      try {
        analysis.components = await this.componentDetector.detectComponents(html, options);
      } catch (error) {
        console.error('Component detection failed:', error);
        analysis.components = { error: error.message };
      }
    }

    // Accessibility Analysis
    if (this.options.enableAccessibilityAnalysis) {
      try {
        analysis.accessibility = await this.accessibilityAnalyzer.analyzeAccessibility(html, options);
      } catch (error) {
        console.error('Accessibility analysis failed:', error);
        analysis.accessibility = { error: error.message };
      }
    }

    // ARIA Enhancement Generation
    if (this.options.enableAriaGeneration) {
      try {
        analysis.enhancements = await this.ariaGenerator.enhanceWithAria(
          html, 
          analysis.components, 
          options
        );
      } catch (error) {
        console.error('ARIA enhancement failed:', error);
        analysis.enhancements = { error: error.message };
      }
    }

    // Calculate semantic score and generate recommendations
    analysis.semanticScore = this.calculateSemanticScore(analysis);
    analysis.recommendations = this.generateComprehensiveRecommendations(analysis);
    analysis.summary = this.generateSummary(analysis);

    this.cache.set(cacheKey, analysis);
    return analysis;
  }

  // Analyze component relationships and context
  async analyzeComponentRelationships(html, componentAnalysis) {
    if (!componentAnalysis || !componentAnalysis.components) {
      return { relationships: [], hierarchy: null, patterns: [] };
    }

    const relationships = [];
    const components = componentAnalysis.components;

    // Analyze parent-child relationships
    for (let i = 0; i < components.length; i++) {
      for (let j = 0; j < components.length; j++) {
        if (i !== j) {
          const relationship = this.detectRelationship(components[i], components[j]);
          if (relationship) {
            relationships.push(relationship);
          }
        }
      }
    }

    // Build component hierarchy
    const hierarchy = this.buildComponentHierarchy(components, relationships);

    // Detect common patterns
    const patterns = this.detectComponentPatterns(components, relationships);

    return {
      relationships,
      hierarchy,
      patterns,
      statistics: {
        totalRelationships: relationships.length,
        hierarchyLevels: this.countHierarchyLevels(hierarchy),
        patternsFound: patterns.length
      }
    };
  }

  // Detect relationship between two components
  detectRelationship(componentA, componentB) {
    // This is a simplified relationship detection
    // In practice, you'd need DOM structure analysis

    const relationships = [];

    // Parent-child relationship (simplified check)
    if (this.isParentChild(componentA, componentB)) {
      relationships.push({
        type: 'parent-child',
        parent: componentA.type,
        child: componentB.type,
        confidence: 0.8
      });
    }

    // Sibling relationship
    if (this.areSiblings(componentA, componentB)) {
      relationships.push({
        type: 'sibling',
        components: [componentA.type, componentB.type],
        confidence: 0.7
      });
    }

    // Semantic relationship
    const semanticRelationship = this.detectSemanticRelationship(componentA, componentB);
    if (semanticRelationship) {
      relationships.push(semanticRelationship);
    }

    return relationships.length > 0 ? relationships : null;
  }

  // Check if components have parent-child relationship (simplified)
  isParentChild(componentA, componentB) {
    // This would need actual DOM analysis
    // For now, use heuristics based on component types
    const parentChildPatterns = [
      ['navigation', 'button'],
      ['card', 'button'],
      ['form', 'button'],
      ['modal', 'form'],
      ['tabs', 'tabpanel'],
      ['list', 'listitem']
    ];

    return parentChildPatterns.some(([parent, child]) =>
      (componentA.type === parent && componentB.type === child) ||
      (componentA.type === child && componentB.type === parent)
    );
  }

  // Check if components are siblings (simplified)
  areSiblings(componentA, componentB) {
    const siblingPatterns = [
      ['button', 'button'],
      ['card', 'card'],
      ['tab', 'tab'],
      ['listitem', 'listitem']
    ];

    return siblingPatterns.some(([typeA, typeB]) =>
      (componentA.type === typeA && componentB.type === typeB) ||
      (componentA.type === typeB && componentB.type === typeA)
    );
  }

  // Detect semantic relationships
  detectSemanticRelationship(componentA, componentB) {
    // Form-button relationship
    if (componentA.type === 'form' && componentB.type === 'button') {
      return {
        type: 'form-control',
        form: componentA.type,
        control: componentB.type,
        confidence: 0.9
      };
    }

    // Navigation-link relationship
    if (componentA.type === 'navigation' && componentB.type === 'link') {
      return {
        type: 'navigation-item',
        container: componentA.type,
        item: componentB.type,
        confidence: 0.8
      };
    }

    // Card-button relationship (call-to-action)
    if (componentA.type === 'card' && componentB.type === 'button') {
      return {
        type: 'call-to-action',
        content: componentA.type,
        action: componentB.type,
        confidence: 0.7
      };
    }

    return null;
  }

  // Build component hierarchy
  buildComponentHierarchy(components, relationships) {
    const hierarchy = {
      root: [],
      levels: new Map()
    };

    // Find root components (no parents)
    const childComponents = new Set();
    relationships.forEach(rel => {
      if (rel.type === 'parent-child') {
        childComponents.add(rel.child);
      }
    });

    components.forEach(component => {
      if (!childComponents.has(component.type)) {
        hierarchy.root.push(component);
      }
    });

    // Build levels
    let level = 0;
    let currentLevel = hierarchy.root;

    while (currentLevel.length > 0) {
      hierarchy.levels.set(level, currentLevel);
      
      const nextLevel = [];
      currentLevel.forEach(parent => {
        const children = this.findChildren(parent, components, relationships);
        nextLevel.push(...children);
      });

      currentLevel = nextLevel;
      level++;
    }

    return hierarchy;
  }

  // Find children of a component
  findChildren(parent, components, relationships) {
    const children = [];
    
    relationships.forEach(rel => {
      if (rel.type === 'parent-child' && rel.parent === parent.type) {
        const childComponent = components.find(c => c.type === rel.child);
        if (childComponent) {
          children.push(childComponent);
        }
      }
    });

    return children;
  }

  // Detect common component patterns
  detectComponentPatterns(components, relationships) {
    const patterns = [];

    // Navigation pattern
    const hasNavigation = components.some(c => c.type === 'navigation');
    const hasHeader = components.some(c => c.type === 'header');
    const hasFooter = components.some(c => c.type === 'footer');

    if (hasNavigation && hasHeader) {
      patterns.push({
        name: 'Site Navigation',
        type: 'layout',
        components: ['header', 'navigation'],
        confidence: 0.9,
        description: 'Standard site navigation pattern with header and navigation'
      });
    }

    // Card grid pattern
    const cardCount = components.filter(c => c.type === 'card').length;
    if (cardCount >= 3) {
      patterns.push({
        name: 'Card Grid',
        type: 'content',
        components: Array(cardCount).fill('card'),
        confidence: 0.8,
        description: `Grid of ${cardCount} cards for content display`
      });
    }

    // Form with validation pattern
    const hasForm = components.some(c => c.type === 'form');
    const hasAlert = components.some(c => c.type === 'alert');
    if (hasForm && hasAlert) {
      patterns.push({
        name: 'Form with Validation',
        type: 'interaction',
        components: ['form', 'alert'],
        confidence: 0.7,
        description: 'Form with validation feedback'
      });
    }

    // Modal dialog pattern
    const hasModal = components.some(c => c.type === 'modal');
    const hasButton = components.some(c => c.type === 'button');
    if (hasModal && hasButton) {
      patterns.push({
        name: 'Modal Dialog',
        type: 'interaction',
        components: ['button', 'modal'],
        confidence: 0.8,
        description: 'Button triggering modal dialog'
      });
    }

    // Tab interface pattern
    const hasTabs = components.some(c => c.type === 'tabs');
    if (hasTabs) {
      patterns.push({
        name: 'Tabbed Interface',
        type: 'navigation',
        components: ['tabs'],
        confidence: 0.9,
        description: 'Tabbed interface for content organization'
      });
    }

    return patterns;
  }

  // Count hierarchy levels
  countHierarchyLevels(hierarchy) {
    return hierarchy.levels ? hierarchy.levels.size : 0;
  }

  // Calculate overall semantic score
  calculateSemanticScore(analysis) {
    let totalScore = 0;
    let weights = 0;

    // Component detection score (0-100)
    if (analysis.components && !analysis.components.error) {
      const componentScore = this.calculateComponentScore(analysis.components);
      totalScore += componentScore * 0.3; // 30% weight
      weights += 0.3;
    }

    // Accessibility score (0-100)
    if (analysis.accessibility && !analysis.accessibility.error) {
      const accessibilityScore = analysis.accessibility.summary.score || 0;
      totalScore += accessibilityScore * 0.5; // 50% weight
      weights += 0.5;
    }

    // Semantic structure score (0-100)
    if (analysis.components && analysis.components.semanticStructure) {
      const structureScore = this.calculateStructureScore(analysis.components.semanticStructure);
      totalScore += structureScore * 0.2; // 20% weight
      weights += 0.2;
    }

    const finalScore = weights > 0 ? Math.round(totalScore / weights) : 0;

    return {
      overall: finalScore,
      breakdown: {
        componentDetection: analysis.components && !analysis.components.error ? 
          this.calculateComponentScore(analysis.components) : 0,
        accessibility: analysis.accessibility && !analysis.accessibility.error ? 
          analysis.accessibility.summary.score : 0,
        semanticStructure: analysis.components && analysis.components.semanticStructure ? 
          this.calculateStructureScore(analysis.components.semanticStructure) : 0
      },
      grade: this.getScoreGrade(finalScore),
      interpretation: this.interpretScore(finalScore)
    };
  }

  // Calculate component detection score
  calculateComponentScore(componentAnalysis) {
    if (!componentAnalysis.components || componentAnalysis.components.length === 0) {
      return 20; // Base score for having some structure
    }

    const stats = componentAnalysis.statistics;
    let score = 50; // Base score

    // Bonus for high confidence components
    const highConfidenceRatio = stats.byConfidence.high / stats.totalComponents;
    score += highConfidenceRatio * 30;

    // Bonus for semantic components
    score += stats.semanticScore * 20;

    return Math.min(100, Math.round(score));
  }

  // Calculate semantic structure score
  calculateStructureScore(semanticStructure) {
    let score = 0;

    // Landmarks score (0-40 points)
    const landmarkCount = semanticStructure.landmarks.length;
    score += Math.min(40, landmarkCount * 8); // Up to 5 landmarks

    // Heading structure score (0-30 points)
    const headingIssues = semanticStructure.headingStructure.issues.length;
    const headingCount = semanticStructure.headingStructure.headings.length;
    if (headingCount > 0) {
      score += Math.max(10, 30 - (headingIssues * 5));
    }

    // ARIA usage score (0-20 points)
    const ariaStats = semanticStructure.ariaUsage;
    if (ariaStats.elementsWithRole > 0 || ariaStats.totalAriaAttributes > 0) {
      score += Math.min(20, ariaStats.elementsWithRole * 2 + ariaStats.totalAriaAttributes);
    }

    // Focus flow score (0-10 points)
    const focusStats = semanticStructure.focusFlow;
    if (focusStats.skipLinks.length > 0) score += 5;
    if (focusStats.tabIndexIssues.length === 0) score += 5;

    return Math.min(100, Math.round(score));
  }

  // Get letter grade for score
  getScoreGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  // Interpret score meaning
  interpretScore(score) {
    if (score >= 90) return 'Excellent semantic structure and accessibility';
    if (score >= 80) return 'Good semantic structure with minor improvements needed';
    if (score >= 70) return 'Adequate semantic structure, some improvements recommended';
    if (score >= 60) return 'Basic semantic structure, significant improvements needed';
    return 'Poor semantic structure, major accessibility issues present';
  }

  // Generate comprehensive recommendations
  generateComprehensiveRecommendations(analysis) {
    const recommendations = [];

    // Component-based recommendations
    if (analysis.components && !analysis.components.error) {
      recommendations.push(...this.getComponentRecommendations(analysis.components));
    }

    // Accessibility recommendations
    if (analysis.accessibility && !analysis.accessibility.error) {
      recommendations.push(...analysis.accessibility.recommendations);
    }

    // Enhancement recommendations
    if (analysis.enhancements && !analysis.enhancements.error) {
      recommendations.push(...this.getEnhancementRecommendations(analysis.enhancements));
    }

    // Priority sorting and deduplication
    return this.prioritizeRecommendations(recommendations);
  }

  // Get component-specific recommendations
  getComponentRecommendations(componentAnalysis) {
    const recommendations = [];
    const stats = componentAnalysis.statistics;

    // Low confidence components
    if (stats.byConfidence.low > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'component-detection',
        title: 'Improve component semantics',
        description: `${stats.byConfidence.low} components detected with low confidence`,
        action: 'Add semantic HTML elements or ARIA roles to clarify component types'
      });
    }

    // Accessibility issues in components
    if (stats.accessibilityIssues > 0) {
      recommendations.push({
        priority: 'high',
        category: 'accessibility',
        title: 'Fix component accessibility issues',
        description: `${stats.accessibilityIssues} accessibility issues found in components`,
        action: 'Review and fix accessibility issues in detected components'
      });
    }

    // Missing semantic components
    const hasNavigation = componentAnalysis.components.some(c => c.type === 'navigation');
    const hasMain = componentAnalysis.components.some(c => c.type === 'main-content');

    if (!hasNavigation) {
      recommendations.push({
        priority: 'medium',
        category: 'semantic-structure',
        title: 'Add navigation landmarks',
        description: 'No navigation components detected',
        action: 'Add <nav> elements or role="navigation" to navigation areas'
      });
    }

    if (!hasMain) {
      recommendations.push({
        priority: 'high',
        category: 'semantic-structure',
        title: 'Add main content landmark',
        description: 'No main content area detected',
        action: 'Add <main> element or role="main" to primary content area'
      });
    }

    return recommendations;
  }

  // Get enhancement-based recommendations
  getEnhancementRecommendations(enhancements) {
    const recommendations = [];

    if (enhancements.statistics) {
      const stats = enhancements.statistics;
      
      if (stats.totalEnhancements > 10) {
        recommendations.push({
          priority: 'high',
          category: 'aria-generation',
          title: 'Apply ARIA enhancements',
          description: `${stats.totalEnhancements} ARIA enhancements suggested`,
          action: 'Review and apply the generated ARIA attributes and enhancements'
        });
      }

      if (stats.warnings > 0) {
        recommendations.push({
          priority: 'medium',
          category: 'structure',
          title: 'Review structural improvements',
          description: `${stats.warnings} structural improvement suggestions`,
          action: 'Review suggestions for better HTML structure'
        });
      }
    }

    return recommendations;
  }

  // Prioritize and deduplicate recommendations
  prioritizeRecommendations(recommendations) {
    // Remove duplicates based on title
    const seen = new Set();
    const unique = recommendations.filter(rec => {
      const key = rec.title + rec.category;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by priority
    const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
    return unique.sort((a, b) => 
      (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
    );
  }

  // Generate analysis summary
  generateSummary(analysis) {
    const summary = {
      componentsDetected: 0,
      accessibilityScore: 0,
      enhancementsSuggested: 0,
      criticalIssues: 0,
      overallHealth: 'unknown',
      keyInsights: []
    };

    // Components summary
    if (analysis.components && !analysis.components.error) {
      summary.componentsDetected = analysis.components.statistics.totalComponents;
      
      if (summary.componentsDetected > 0) {
        summary.keyInsights.push(
          `Detected ${summary.componentsDetected} UI components with ` +
          `${analysis.components.statistics.byConfidence.high} high-confidence matches`
        );
      }
    }

    // Accessibility summary
    if (analysis.accessibility && !analysis.accessibility.error) {
      summary.accessibilityScore = analysis.accessibility.summary.score;
      summary.criticalIssues = analysis.accessibility.summary.errors;

      if (summary.criticalIssues > 0) {
        summary.keyInsights.push(`${summary.criticalIssues} critical accessibility issues require immediate attention`);
      }
    }

    // Enhancements summary
    if (analysis.enhancements && !analysis.enhancements.error) {
      summary.enhancementsSuggested = analysis.enhancements.statistics.totalEnhancements;

      if (summary.enhancementsSuggested > 0) {
        summary.keyInsights.push(`${summary.enhancementsSuggested} ARIA enhancements can improve accessibility`);
      }
    }

    // Overall health assessment
    const semanticScore = analysis.semanticScore?.overall || 0;
    if (semanticScore >= 80) summary.overallHealth = 'excellent';
    else if (semanticScore >= 60) summary.overallHealth = 'good';
    else if (semanticScore >= 40) summary.overallHealth = 'fair';
    else summary.overallHealth = 'poor';

    return summary;
  }

  // Generate cache key
  generateCacheKey(html, options) {
    const optionsString = JSON.stringify(options);
    const content = html + optionsString;
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return `semantic-${Math.abs(hash)}`;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Export enhanced HTML
  async getEnhancedHtml(html, options = {}) {
    const analysis = await this.analyzeSemantics(html, options);
    
    if (analysis.enhancements && analysis.enhancements.html) {
      return {
        html: analysis.enhancements.html,
        enhancements: analysis.enhancements.enhancements,
        statistics: analysis.enhancements.statistics
      };
    }
    
    return { html, enhancements: [], statistics: {} };
  }
}

module.exports = { SemanticAnalyzer };