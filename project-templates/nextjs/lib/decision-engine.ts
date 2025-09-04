/**
 * Design Decision Engine
 * Intelligent decision-making for AI agents using the design system
 */

interface DesignContext {
  isProduction: boolean;
  needsCaching: boolean;
  hasTimeConstraint: boolean;
  componentType?: string;
  cssComplexity?: 'simple' | 'medium' | 'complex';
  targetFramework?: string;
}

interface QualityGates {
  minBrandCompliance: number;
  minAccessibilityScore: string;
  maxChangesPerFile: number;
  requireValidation: boolean;
}

interface EnhancementStrategy {
  endpoint: string;
  options: Record<string, any>;
  expectedTime: number;
  rationale: string;
}

interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  suggestions: string[];
}

interface ValidationIssue {
  type: 'brand' | 'accessibility' | 'performance' | 'syntax';
  severity: 'high' | 'medium' | 'low';
  message: string;
}

export class DesignDecisionEngine {
  private qualityGates: QualityGates;
  
  constructor() {
    this.qualityGates = {
      minBrandCompliance: parseFloat(process.env.AGENTIC_MIN_BRAND_COMPLIANCE || '0.8'),
      minAccessibilityScore: process.env.AGENTIC_MIN_ACCESSIBILITY_SCORE || 'AA',
      maxChangesPerFile: parseInt(process.env.AGENTIC_MAX_CHANGES_PER_FILE || '50'),
      requireValidation: process.env.AGENTIC_REQUIRE_VALIDATION === 'true'
    };
  }
  
  /**
   * Select optimal enhancement strategy based on context
   */
  async selectEnhancementStrategy(context: DesignContext): Promise<EnhancementStrategy> {
    // Production builds need all transformations
    if (context.isProduction) {
      return {
        endpoint: 'enhance-advanced',
        options: {
          enableTypography: true,
          enableAnimations: true,
          enableGradients: true,
          enableStates: true,
          enableOptimization: true
        },
        expectedTime: 19,
        rationale: 'Production build requires all optimizations'
      };
    }
    
    // Cached enhancement for repeated operations
    if (context.needsCaching) {
      return {
        endpoint: 'enhance-cached',
        options: {
          codeType: 'css',
          componentType: context.componentType
        },
        expectedTime: 5,
        rationale: 'Caching enabled for repeated transformations'
      };
    }
    
    // Time-constrained operations
    if (context.hasTimeConstraint) {
      return {
        endpoint: 'enhance',
        options: {
          codeType: 'css',
          quickMode: true
        },
        expectedTime: 7,
        rationale: 'Basic enhancement for time-sensitive operations'
      };
    }
    
    // CSS complexity-based selection
    switch (context.cssComplexity) {
      case 'complex':
        return {
          endpoint: 'enhance-advanced',
          options: {
            enableTypography: true,
            enableAnimations: true,
            enableGradients: true,
            enableStates: true
          },
          expectedTime: 15,
          rationale: 'Complex CSS requires comprehensive transformations'
        };
      
      case 'medium':
        return {
          endpoint: 'enhance-cached',
          options: {
            enableTypography: true,
            enableStates: true
          },
          expectedTime: 8,
          rationale: 'Medium complexity benefits from typography and states'
        };
      
      default:
        return {
          endpoint: 'enhance',
          options: {},
          expectedTime: 7,
          rationale: 'Simple CSS needs basic enhancement only'
        };
    }
  }
  
  /**
   * Validate enhancement result against quality gates
   */
  async validateEnhancement(result: any): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const suggestions: string[] = [];
    
    // Brand compliance validation
    if (result.brandCompliance?.score < this.qualityGates.minBrandCompliance) {
      issues.push({
        type: 'brand',
        severity: 'high',
        message: `Brand compliance score ${result.brandCompliance.score} is below threshold ${this.qualityGates.minBrandCompliance}`
      });
      suggestions.push('Review brand token usage and apply more consistent styling');
    }
    
    // Accessibility validation
    if (result.accessibility?.score && !this.meetsAccessibilityScore(result.accessibility.score)) {
      issues.push({
        type: 'accessibility',
        severity: 'high',
        message: `Accessibility score ${result.accessibility.score} does not meet ${this.qualityGates.minAccessibilityScore} requirement`
      });
      suggestions.push('Address accessibility issues before deployment');
    }
    
    // Change limit validation
    if (result.changes?.length > this.qualityGates.maxChangesPerFile) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        message: `Too many changes (${result.changes.length}) exceed limit of ${this.qualityGates.maxChangesPerFile}`
      });
      suggestions.push('Consider splitting the file or reducing transformation scope');
    }
    
    // Syntax validation
    if (!result.css || result.error) {
      issues.push({
        type: 'syntax',
        severity: 'high',
        message: result.error || 'CSS output is invalid'
      });
    }
    
    return {
      isValid: issues.filter(i => i.severity === 'high').length === 0,
      issues,
      suggestions
    };
  }
  
  /**
   * Decide whether to use AI generation or templates
   */
  async selectComponentStrategy(
    description: string,
    timeAvailable: number
  ): Promise<'generate' | 'template' | 'hybrid'> {
    // AI generation for unique components with sufficient time
    if (timeAvailable > 15000 && this.isUniqueComponent(description)) {
      return 'generate';
    }
    
    // Templates for standard components
    if (this.isStandardComponent(description)) {
      return 'template';
    }
    
    // Hybrid: Use template as base, then customize
    return 'hybrid';
  }
  
  /**
   * Determine if pattern learning should be applied
   */
  shouldUsePatternLearning(context: {
    hasExistingCodebase: boolean;
    projectAge: number;
    patternCount: number;
  }): boolean {
    return (
      context.hasExistingCodebase &&
      context.projectAge > 7 && // At least a week old
      context.patternCount > 5  // Minimum patterns for meaningful learning
    );
  }
  
  /**
   * Select appropriate semantic analysis level
   */
  selectSemanticAnalysisLevel(purpose: string): 'quick' | 'standard' | 'comprehensive' {
    switch (purpose) {
      case 'real-time-validation':
        return 'quick'; // 6ms
      case 'pre-commit-check':
        return 'standard'; // 11ms
      case 'accessibility-audit':
        return 'comprehensive'; // 29ms
      default:
        return 'standard';
    }
  }
  
  /**
   * Determine caching strategy
   */
  selectCachingStrategy(context: {
    requestFrequency: number;
    dataVolatility: 'low' | 'medium' | 'high';
    responseTime: number;
  }): 'aggressive' | 'moderate' | 'minimal' | 'none' {
    // High frequency + low volatility = aggressive caching
    if (context.requestFrequency > 100 && context.dataVolatility === 'low') {
      return 'aggressive';
    }
    
    // Slow responses benefit from caching
    if (context.responseTime > 1000) {
      return 'moderate';
    }
    
    // High volatility = minimal caching
    if (context.dataVolatility === 'high') {
      return 'minimal';
    }
    
    return 'moderate';
  }
  
  /**
   * Plan batch operations for efficiency
   */
  planBatchOperations(files: string[]): Array<{
    batch: string[];
    endpoint: string;
    parallel: boolean;
  }> {
    const batches = [];
    
    // Group by file type/complexity
    const cssFiles = files.filter(f => f.endsWith('.css'));
    const htmlFiles = files.filter(f => f.endsWith('.html'));
    
    // CSS files can be batched
    if (cssFiles.length > 1) {
      batches.push({
        batch: cssFiles,
        endpoint: '/api/design/enhance-batch',
        parallel: false
      });
    } else if (cssFiles.length === 1) {
      batches.push({
        batch: cssFiles,
        endpoint: '/api/design/enhance-cached',
        parallel: false
      });
    }
    
    // HTML files for semantic analysis
    if (htmlFiles.length > 0) {
      batches.push({
        batch: htmlFiles,
        endpoint: '/api/semantic/batch-analyze',
        parallel: true
      });
    }
    
    return batches;
  }
  
  /**
   * Generate quality report
   */
  generateQualityReport(results: any[]): {
    overallScore: string;
    breakdown: Record<string, number>;
    recommendations: string[];
  } {
    const scores = {
      brandCompliance: this.averageScore(results.map(r => r.brandCompliance?.score || 0)),
      accessibility: this.averageAccessibilityScore(results.map(r => r.accessibility?.score || 'F')),
      performance: this.calculatePerformanceScore(results),
      completeness: this.calculateCompleteness(results)
    };
    
    const overallScore = this.calculateOverallScore(scores);
    
    const recommendations = this.generateRecommendations(scores);
    
    return {
      overallScore,
      breakdown: scores,
      recommendations
    };
  }
  
  // Helper methods
  
  private meetsAccessibilityScore(score: string): boolean {
    const scoreMap: Record<string, number> = {
      'AAA': 3,
      'AA': 2,
      'A': 1,
      'F': 0
    };
    
    const required = scoreMap[this.qualityGates.minAccessibilityScore] || 2;
    const actual = scoreMap[score] || 0;
    
    return actual >= required;
  }
  
  private isUniqueComponent(description: string): boolean {
    const uniqueKeywords = ['custom', 'unique', 'special', 'bespoke', 'novel'];
    return uniqueKeywords.some(keyword => 
      description.toLowerCase().includes(keyword)
    );
  }
  
  private isStandardComponent(description: string): boolean {
    const standardComponents = ['button', 'card', 'form', 'navigation', 'header', 'footer'];
    return standardComponents.some(component => 
      description.toLowerCase().includes(component)
    );
  }
  
  private averageScore(scores: number[]): number {
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }
  
  private averageAccessibilityScore(scores: string[]): number {
    const scoreMap: Record<string, number> = {
      'AAA': 100,
      'AA': 85,
      'A': 70,
      'B': 60,
      'C': 50,
      'D': 40,
      'F': 0
    };
    
    const numericScores = scores.map(s => scoreMap[s] || 0);
    return this.averageScore(numericScores);
  }
  
  private calculatePerformanceScore(results: any[]): number {
    // Based on response times and cache hits
    const avgResponseTime = this.averageScore(results.map(r => r.responseTime || 0));
    const cacheHitRate = results.filter(r => r.cacheHit).length / results.length;
    
    // Lower response time and higher cache rate = better score
    const timeScore = Math.max(0, 100 - avgResponseTime / 10);
    const cacheScore = cacheHitRate * 100;
    
    return (timeScore + cacheScore) / 2;
  }
  
  private calculateCompleteness(results: any[]): number {
    // Check if all expected transformations were applied
    const successRate = results.filter(r => r.success).length / results.length;
    return successRate * 100;
  }
  
  private calculateOverallScore(scores: Record<string, number>): string {
    const weights = {
      brandCompliance: 0.3,
      accessibility: 0.3,
      performance: 0.2,
      completeness: 0.2
    };
    
    const weightedScore = Object.entries(scores).reduce((total, [key, score]) => {
      return total + (score * (weights[key as keyof typeof weights] || 0));
    }, 0);
    
    if (weightedScore >= 90) return 'A+';
    if (weightedScore >= 85) return 'A';
    if (weightedScore >= 80) return 'A-';
    if (weightedScore >= 75) return 'B+';
    if (weightedScore >= 70) return 'B';
    if (weightedScore >= 65) return 'B-';
    if (weightedScore >= 60) return 'C+';
    if (weightedScore >= 55) return 'C';
    if (weightedScore >= 50) return 'C-';
    return 'F';
  }
  
  private generateRecommendations(scores: Record<string, number>): string[] {
    const recommendations: string[] = [];
    
    if (scores.brandCompliance < 80) {
      recommendations.push('Improve brand token usage for better consistency');
    }
    
    if (scores.accessibility < 85) {
      recommendations.push('Address accessibility issues to meet WCAG AA standards');
    }
    
    if (scores.performance < 70) {
      recommendations.push('Optimize API usage with caching and batch operations');
    }
    
    if (scores.completeness < 90) {
      recommendations.push('Review failed transformations and retry with adjusted parameters');
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const decisionEngine = new DesignDecisionEngine();