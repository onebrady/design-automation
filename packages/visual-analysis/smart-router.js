/**
 * Smart Endpoint Router
 *
 * Intelligently routes visual analysis violations to appropriate fix endpoints
 * and applies automated improvements based on GPT-4 Turbo recommendations.
 */

const axios = require('axios');
const Logger = require('../../apps/server/utils/logger');

class SmartRouter {
  constructor(options = {}) {
    this.options = {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8901',
      maxRetries: 3,
      retryDelay: 1000,
      validateAfterFix: true,
      ...options,
    };

    // Map of endpoints to their capabilities
    this.endpointCapabilities = {
      '/api/design/enhance-typography': {
        fixes: ['font-size', 'line-height', 'font-family', 'text-hierarchy'],
        priority: 1,
      },
      '/api/design/enhance-animations': {
        fixes: ['transitions', 'micro-interactions', 'hover-states'],
        priority: 3,
      },
      '/api/design/enhance-gradients': {
        fixes: ['color-transitions', 'gradient-quality', 'color-harmony'],
        priority: 4,
      },
      '/api/design/enhance-states': {
        fixes: ['hover-states', 'focus-states', 'active-states', 'disabled-states'],
        priority: 5,
      },
      '/api/layout/spacing-optimization': {
        fixes: ['margin', 'padding', 'spacing-consistency', 'touch-targets'],
        priority: 2,
      },
      '/api/layout/grid-recommendations': {
        fixes: ['layout-structure', 'alignment', 'responsive-grid'],
        priority: 6,
      },
      '/api/semantic/analyze-accessibility': {
        fixes: ['contrast', 'wcag-compliance', 'aria-labels', 'keyboard-nav'],
        priority: 1,
      },
    };

    Logger.info('SmartRouter initialized', {
      apiBaseUrl: this.options.apiBaseUrl,
      availableEndpoints: Object.keys(this.endpointCapabilities).length,
    });
  }

  /**
   * Apply fixes based on visual analysis results
   */
  async applyFixes(code, analysisResult, options = {}) {
    const fixId = `fix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      Logger.info('Starting smart fix application', {
        fixId,
        criticalIssues: analysisResult.criticalIssues?.length || 0,
        improvements: analysisResult.improvementOpportunities?.length || 0,
        initialScore: analysisResult.overallScore,
      });

      // Build fix plan from analysis
      const fixPlan = this.buildFixPlan(analysisResult);

      if (fixPlan.length === 0) {
        Logger.info('No fixes needed - design quality acceptable', {
          fixId,
          score: analysisResult.overallScore,
        });
        return {
          success: true,
          fixId,
          originalCode: code,
          fixedCode: code,
          appliedFixes: [],
          qualityImprovement: 0,
        };
      }

      // Apply fixes in priority order
      let currentCode = code;
      const appliedFixes = [];

      for (const fix of fixPlan) {
        try {
          Logger.info('Applying fix', {
            fixId,
            endpoint: fix.endpoint,
            issue: fix.issue,
            severity: fix.severity,
          });

          const fixResult = await this.callEndpoint(
            fix.endpoint,
            currentCode,
            fix.visualGuidance,
            options.brandPack
          );

          if (fixResult.success && fixResult.code) {
            currentCode = fixResult.code;
            appliedFixes.push({
              endpoint: fix.endpoint,
              issue: fix.issue,
              severity: fix.severity,
              success: true,
              improvement: fixResult.improvement || 'Applied successfully',
            });

            Logger.info('Fix applied successfully', {
              fixId,
              endpoint: fix.endpoint,
              changesMade: fixResult.changesMade || 'Unknown',
            });
          } else {
            Logger.warn('Fix failed to apply', {
              fixId,
              endpoint: fix.endpoint,
              error: fixResult.error,
            });

            appliedFixes.push({
              endpoint: fix.endpoint,
              issue: fix.issue,
              severity: fix.severity,
              success: false,
              error: fixResult.error,
            });
          }
        } catch (endpointError) {
          Logger.error('Endpoint call failed', {
            fixId,
            endpoint: fix.endpoint,
            error: endpointError.message,
          });

          appliedFixes.push({
            endpoint: fix.endpoint,
            issue: fix.issue,
            severity: fix.severity,
            success: false,
            error: endpointError.message,
          });
        }
      }

      const duration = Date.now() - startTime;

      Logger.info('Smart fix application completed', {
        fixId,
        duration: `${duration}ms`,
        fixesAttempted: fixPlan.length,
        fixesSuccessful: appliedFixes.filter((f) => f.success).length,
      });

      return {
        success: true,
        fixId,
        duration,
        originalCode: code,
        fixedCode: currentCode,
        appliedFixes,
        qualityImprovement: analysisResult.estimatedQualityGain || 0,
        metadata: {
          initialScore: analysisResult.overallScore,
          targetScore: analysisResult.overallScore + (analysisResult.estimatedQualityGain || 0),
        },
      };
    } catch (error) {
      Logger.error('Smart fix application failed', {
        fixId,
        error: error.message,
      });

      return {
        success: false,
        fixId,
        error: error.message,
        code: 'FIX_APPLICATION_FAILED',
      };
    }
  }

  /**
   * Build prioritized fix plan from analysis results
   */
  buildFixPlan(analysisResult) {
    const fixes = [];

    // Process critical issues first
    if (analysisResult.criticalIssues?.length > 0) {
      analysisResult.criticalIssues.forEach((issue) => {
        if (issue.recommendedEndpoint) {
          fixes.push({
            endpoint: issue.recommendedEndpoint,
            issue: issue.issue,
            severity: issue.severity || 'critical',
            priority: this.getEndpointPriority(issue.recommendedEndpoint),
            visualGuidance: {
              focusArea: issue.parameters?.focusArea || this.extractFocusArea(issue.issue),
              specificIssue: issue.issue,
              targetImprovement: issue.expectedImprovement,
              evidence: issue.evidence,
              location: issue.location,
              confidence: issue.confidence,
            },
          });
        }
      });
    }

    // Then process improvement opportunities
    if (analysisResult.improvementOpportunities?.length > 0) {
      analysisResult.improvementOpportunities.forEach((opportunity) => {
        if (opportunity.recommendedEndpoint) {
          fixes.push({
            endpoint: opportunity.recommendedEndpoint,
            issue: opportunity.issue,
            severity: opportunity.severity || 'medium',
            priority: this.getEndpointPriority(opportunity.recommendedEndpoint),
            visualGuidance: {
              focusArea:
                opportunity.parameters?.focusArea || this.extractFocusArea(opportunity.issue),
              specificIssue: opportunity.issue,
              targetImprovement: opportunity.expectedImprovement,
              evidence: opportunity.evidence,
              location: opportunity.location,
              confidence: opportunity.confidence,
            },
          });
        }
      });
    }

    // Sort by priority (lower number = higher priority)
    fixes.sort((a, b) => {
      // Critical issues first
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (b.severity === 'critical' && a.severity !== 'critical') return 1;

      // Then by endpoint priority
      return a.priority - b.priority;
    });

    Logger.info('Fix plan built', {
      totalFixes: fixes.length,
      criticalFixes: fixes.filter((f) => f.severity === 'critical').length,
      endpoints: [...new Set(fixes.map((f) => f.endpoint))],
    });

    return fixes;
  }

  /**
   * Call an endpoint with visual guidance
   */
  async callEndpoint(endpoint, code, visualGuidance, brandPack) {
    const url = `${this.options.apiBaseUrl}${endpoint}`;

    try {
      const response = await axios.post(
        url,
        {
          code,
          visualGuidance,
          brandPack,
          autoApply: true,
        },
        {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        code: response.data.code || response.data.enhancedCode,
        changesMade: response.data.changesMade,
        improvement: response.data.improvement,
      };
    } catch (error) {
      Logger.error('Endpoint call failed', {
        endpoint,
        error: error.response?.data?.error || error.message,
      });

      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }

  /**
   * Get endpoint priority
   */
  getEndpointPriority(endpoint) {
    return this.endpointCapabilities[endpoint]?.priority || 999;
  }

  /**
   * Extract focus area from issue description
   */
  extractFocusArea(issueDescription) {
    const issue = issueDescription.toLowerCase();

    if (issue.includes('typography') || issue.includes('font') || issue.includes('text')) {
      return 'typography';
    }
    if (issue.includes('contrast') || issue.includes('color')) {
      return 'color-contrast';
    }
    if (issue.includes('spacing') || issue.includes('margin') || issue.includes('padding')) {
      return 'spacing';
    }
    if (issue.includes('touch') || issue.includes('button')) {
      return 'touch-targets';
    }
    if (issue.includes('layout') || issue.includes('alignment')) {
      return 'layout';
    }

    return 'general';
  }

  /**
   * Validate improvements after fixes
   */
  async validateImprovements(originalAnalysis, fixedCode, visualAnalysisManager) {
    try {
      Logger.info('Validating improvements after fixes');

      const validationResult = await visualAnalysisManager.analyzeCode(fixedCode, {
        analysisType: 'validation',
        previousScore: originalAnalysis.overallScore,
      });

      const improvement = validationResult.analysis.overallScore - originalAnalysis.overallScore;

      Logger.info('Improvement validation complete', {
        originalScore: originalAnalysis.overallScore,
        newScore: validationResult.analysis.overallScore,
        improvement,
        remainingIssues: validationResult.analysis.criticalIssues?.length || 0,
      });

      return {
        success: true,
        originalScore: originalAnalysis.overallScore,
        newScore: validationResult.analysis.overallScore,
        improvement,
        remainingIssues: validationResult.analysis.criticalIssues || [],
        validationAnalysis: validationResult.analysis,
      };
    } catch (error) {
      Logger.error('Improvement validation failed', {
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = SmartRouter;
