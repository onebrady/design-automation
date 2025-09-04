const { ComponentDetector } = require('./detector');
const { AccessibilityAnalyzer } = require('./accessibility');
const { AriaGenerator } = require('./aria-generator');
const { SemanticAnalyzer } = require('./analyzer');

// Main semantic understanding system
class SemanticUnderstandingSystem {
  constructor(options = {}) {
    this.options = {
      cacheEnabled: options.cacheEnabled !== false,
      enableAll: options.enableAll !== false,
      wcagLevel: options.wcagLevel || 'AA',
      confidenceThreshold: options.confidenceThreshold || 0.7,
      ...options
    };

    // Initialize all subsystems
    this.semanticAnalyzer = new SemanticAnalyzer({
      enableComponentDetection: this.options.enableAll,
      enableAccessibilityAnalysis: this.options.enableAll,
      enableAriaGeneration: this.options.enableAll,
      wcagLevel: this.options.wcagLevel,
      confidenceThreshold: this.options.confidenceThreshold
    });

    // Direct access to individual analyzers
    this.componentDetector = this.semanticAnalyzer.componentDetector;
    this.accessibilityAnalyzer = this.semanticAnalyzer.accessibilityAnalyzer;
    this.ariaGenerator = this.semanticAnalyzer.ariaGenerator;

    this.initialized = true;
  }

  // Comprehensive semantic analysis
  async analyze(html, options = {}) {
    return await this.semanticAnalyzer.analyzeSemantics(html, options);
  }

  // Component detection only
  async detectComponents(html, options = {}) {
    return await this.componentDetector.detectComponents(html, options);
  }

  // Accessibility analysis only  
  async analyzeAccessibility(html, options = {}) {
    return await this.accessibilityAnalyzer.analyzeAccessibility(html, options);
  }

  // ARIA enhancement generation only
  async generateAriaEnhancements(html, componentAnalysis = null, options = {}) {
    return await this.ariaGenerator.enhanceWithAria(html, componentAnalysis, options);
  }

  // Get enhanced HTML with ARIA improvements
  async getEnhancedHtml(html, options = {}) {
    return await this.semanticAnalyzer.getEnhancedHtml(html, options);
  }

  // Analyze component relationships
  async analyzeComponentRelationships(html, componentAnalysis = null) {
    if (!componentAnalysis) {
      componentAnalysis = await this.detectComponents(html);
    }
    return await this.semanticAnalyzer.analyzeComponentRelationships(html, componentAnalysis);
  }

  // Get semantic score only
  async getSemanticScore(html, options = {}) {
    const analysis = await this.analyze(html, options);
    return analysis.semanticScore;
  }

  // Get recommendations only
  async getRecommendations(html, options = {}) {
    const analysis = await this.analyze(html, options);
    return analysis.recommendations;
  }

  // Batch analysis for multiple HTML fragments
  async batchAnalyze(htmlFragments, options = {}) {
    const results = [];
    
    for (const fragment of htmlFragments) {
      try {
        const analysis = await this.analyze(fragment, options);
        results.push({
          html: fragment,
          analysis,
          success: true
        });
      } catch (error) {
        results.push({
          html: fragment,
          error: error.message,
          success: false
        });
      }
    }

    return {
      results,
      summary: this.generateBatchSummary(results)
    };
  }

  // Generate summary for batch analysis
  generateBatchSummary(results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    let totalComponents = 0;
    let totalIssues = 0;
    let averageScore = 0;

    successful.forEach(result => {
      if (result.analysis.components) {
        totalComponents += result.analysis.components.statistics?.totalComponents || 0;
      }
      if (result.analysis.accessibility) {
        totalIssues += result.analysis.accessibility.summary?.totalIssues || 0;
      }
      if (result.analysis.semanticScore) {
        averageScore += result.analysis.semanticScore.overall || 0;
      }
    });

    if (successful.length > 0) {
      averageScore = Math.round(averageScore / successful.length);
    }

    return {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      totalComponents,
      totalIssues,
      averageScore,
      scoreGrade: this.semanticAnalyzer.getScoreGrade(averageScore)
    };
  }

  // Quick accessibility check
  async quickAccessibilityCheck(html) {
    try {
      const analysis = await this.analyzeAccessibility(html);
      return {
        score: analysis.summary.score,
        criticalIssues: analysis.summary.errors,
        totalIssues: analysis.summary.totalIssues,
        grade: analysis.summary.score >= 80 ? 'Pass' : 
               analysis.summary.score >= 60 ? 'Warning' : 'Fail',
        topIssues: analysis.issues
          .filter(issue => issue.severity === 'error')
          .slice(0, 5)
          .map(issue => ({
            type: issue.type,
            message: issue.message,
            wcag: issue.wcag?.criterion
          }))
      };
    } catch (error) {
      return {
        error: error.message,
        score: 0,
        grade: 'Error'
      };
    }
  }

  // Component type detection for specific elements
  async detectComponentType(elementHtml, context = '') {
    const fullHtml = context ? `<div>${context}<div class="target">${elementHtml}</div></div>` : elementHtml;
    
    try {
      const analysis = await this.detectComponents(fullHtml);
      const targetComponents = analysis.components.filter(c => 
        c.confidence >= this.options.confidenceThreshold
      );

      if (targetComponents.length > 0) {
        // Return the highest confidence component
        return targetComponents.sort((a, b) => b.confidence - a.confidence)[0];
      }

      return {
        type: 'unknown',
        confidence: 0,
        reasons: ['No matching component patterns found']
      };
    } catch (error) {
      return {
        type: 'error',
        confidence: 0,
        error: error.message
      };
    }
  }

  // Semantic context analysis
  async analyzeContext(html, focusSelector = null) {
    const analysis = await this.analyze(html);
    
    let focusElement = null;
    if (focusSelector && analysis.components) {
      focusElement = analysis.components.components.find(c => 
        c.element.id === focusSelector.replace('#', '') ||
        c.element.className?.includes(focusSelector.replace('.', ''))
      );
    }

    const context = {
      pageStructure: {
        hasHeader: analysis.components?.semanticStructure?.landmarks?.some(l => l.role === 'banner') || false,
        hasNavigation: analysis.components?.semanticStructure?.landmarks?.some(l => l.role === 'navigation') || false,
        hasMain: analysis.components?.semanticStructure?.landmarks?.some(l => l.role === 'main') || false,
        hasFooter: analysis.components?.semanticStructure?.landmarks?.some(l => l.role === 'contentinfo') || false,
        landmarkCount: analysis.components?.semanticStructure?.landmarks?.length || 0
      },
      headingStructure: {
        levels: analysis.components?.semanticStructure?.headingStructure?.headings?.map(h => h.level) || [],
        hasH1: analysis.components?.semanticStructure?.headingStructure?.headings?.some(h => h.level === 1) || false,
        issues: analysis.components?.semanticStructure?.headingStructure?.issues || []
      },
      accessibility: {
        score: analysis.accessibility?.summary?.score || 0,
        criticalIssues: analysis.accessibility?.summary?.errors || 0,
        wcagCompliance: analysis.accessibility?.wcagCompliance || {}
      },
      focusElement,
      recommendations: analysis.recommendations || []
    };

    return context;
  }

  // Generate accessibility report
  async generateAccessibilityReport(html, options = {}) {
    const analysis = await this.analyzeAccessibility(html, options);
    
    return {
      summary: {
        score: analysis.summary.score,
        grade: this.getAccessibilityGrade(analysis.summary.score),
        totalIssues: analysis.summary.totalIssues,
        errors: analysis.summary.errors,
        warnings: analysis.summary.warnings,
        testedAt: new Date().toISOString()
      },
      wcagCompliance: {
        level: options.level || 'AA',
        criteria: Array.from(analysis.wcagCompliance.criteria.entries()).map(([criterion, data]) => ({
          criterion,
          compliant: data.compliant,
          issues: data.issues,
          level: data.level,
          description: data.description
        }))
      },
      issuesByCategory: this.categorizeIssues(analysis.issues),
      recommendations: analysis.recommendations,
      quickFixes: this.generateQuickFixes(analysis.issues),
      testResults: {
        imagesChecked: analysis.elements ? Array.from(analysis.elements.values()).filter(e => e.type === 'image').length : 0,
        formsChecked: analysis.elements ? Array.from(analysis.elements.values()).filter(e => e.type === 'form').length : 0,
        interactiveElementsChecked: analysis.elements ? Array.from(analysis.elements.values()).filter(e => e.type === 'interactive').length : 0
      }
    };
  }

  // Get accessibility grade
  getAccessibilityGrade(score) {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    if (score >= 55) return 'C-';
    if (score >= 50) return 'D';
    return 'F';
  }

  // Categorize accessibility issues
  categorizeIssues(issues) {
    const categories = {
      images: [],
      forms: [],
      navigation: [],
      structure: [],
      keyboard: [],
      aria: [],
      color: [],
      other: []
    };

    issues.forEach(issue => {
      switch (issue.type) {
        case 'missing-alt-text':
        case 'redundant-alt-text':
          categories.images.push(issue);
          break;
        case 'missing-form-label':
        case 'missing-required-indicator':
        case 'missing-error-description':
          categories.forms.push(issue);
          break;
        case 'missing-skip-link':
        case 'missing-landmarks':
          categories.navigation.push(issue);
          break;
        case 'missing-heading-structure':
        case 'heading-level-skip':
        case 'empty-heading':
          categories.structure.push(issue);
          break;
        case 'positive-tabindex':
        case 'missing-focus-indicator':
          categories.keyboard.push(issue);
          break;
        case 'invalid-aria':
        case 'broken-aria-reference':
        case 'missing-accessible-name':
          categories.aria.push(issue);
          break;
        case 'low-contrast':
          categories.color.push(issue);
          break;
        default:
          categories.other.push(issue);
      }
    });

    return categories;
  }

  // Generate quick fixes for common issues
  generateQuickFixes(issues) {
    const fixes = [];

    issues.forEach(issue => {
      let fix = null;

      switch (issue.type) {
        case 'missing-alt-text':
          fix = {
            issue: issue.type,
            fix: `Add alt="${issue.element.textContent || 'Descriptive text'}" to the image`,
            code: `<img src="..." alt="${issue.element.textContent || 'Descriptive text'}">`
          };
          break;
        case 'missing-form-label':
          fix = {
            issue: issue.type,
            fix: 'Add a label element or aria-label attribute',
            code: `<label for="input-id">Label text</label><input id="input-id" ...>`
          };
          break;
        case 'missing-accessible-name':
          fix = {
            issue: issue.type,
            fix: 'Add aria-label or ensure element has visible text',
            code: `<button aria-label="Descriptive name">...</button>`
          };
          break;
        case 'missing-lang-attribute':
          fix = {
            issue: issue.type,
            fix: 'Add lang attribute to html element',
            code: `<html lang="en">`
          };
          break;
      }

      if (fix) {
        fixes.push(fix);
      }
    });

    // Remove duplicates
    const seen = new Set();
    return fixes.filter(fix => {
      const key = fix.issue + fix.fix;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Cache management
  clearCache() {
    this.semanticAnalyzer.clearCache();
  }

  getCacheStats() {
    return this.semanticAnalyzer.getCacheStats();
  }

  // System statistics
  getSystemStats() {
    return {
      initialized: this.initialized,
      cacheStats: this.getCacheStats(),
      configuration: {
        wcagLevel: this.options.wcagLevel,
        confidenceThreshold: this.options.confidenceThreshold,
        enabledFeatures: {
          componentDetection: true,
          accessibilityAnalysis: true,
          ariaGeneration: true
        }
      }
    };
  }
}

module.exports = { 
  SemanticUnderstandingSystem,
  ComponentDetector,
  AccessibilityAnalyzer,
  AriaGenerator,
  SemanticAnalyzer
};