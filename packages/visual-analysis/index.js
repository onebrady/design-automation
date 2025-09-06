/**
 * Visual Analysis Package
 *
 * Main entry point for visual analysis functionality.
 * Provides unified interface for screenshot capture and AI-powered visual analysis.
 */

const Logger = require('../../apps/server/utils/logger');
const { ScreenshotEngine } = require('./screenshot-engine');
const { VisionAI } = require('./vision-ai');
const { ANALYSIS_PROMPTS, PromptBuilder } = require('./analysis-prompts');
const SmartRouter = require('./smart-router');

/**
 * Visual Analysis Manager
 *
 * Orchestrates screenshot capture and AI analysis for design optimization.
 */
class VisualAnalysisManager {
  constructor(options = {}) {
    this.options = {
      // Screenshot engine options
      screenshot: {
        viewport: { width: 1200, height: 800 },
        cleanup: {
          autoCleanup: true,
          maxAge: 5 * 60 * 1000, // 5 minutes
          maxFiles: 50,
        },
        ...options.screenshot,
      },
      // Vision AI options
      vision: {
        model: 'gpt-4-turbo',
        maxTokens: 4096,
        temperature: 0.3,
        retryAttempts: 3,
        ...options.vision,
      },
      // Analysis options
      analysis: {
        defaultPrinciples: ['hierarchy', 'spacing', 'typography', 'color', 'accessibility'],
        includeEndpointRouting: true,
        ...options.analysis,
      },
    };

    // Initialize engines
    this.screenshotEngine = new ScreenshotEngine(this.options.screenshot);
    this.visionAI = new VisionAI(this.options.vision);
    this.smartRouter = new SmartRouter(this.options.routing);

    Logger.info('VisualAnalysisManager initialized', {
      screenshot: this.options.screenshot.viewport,
      vision: this.options.vision.model,
      autoCleanup: this.options.screenshot.cleanup.autoCleanup,
    });
  }

  /**
   * Analyze HTML code with visual intelligence
   */
  async analyzeCode(htmlCode, context = {}) {
    const analysisId = `visual_analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      Logger.info('Starting visual code analysis', {
        analysisId,
        htmlLength: htmlCode.length,
        context: Object.keys(context),
      });

      // Stage 1: Capture screenshot
      const screenshotResult = await this.screenshotEngine.capture(htmlCode, {
        viewport: context.viewport || this.options.screenshot.viewport,
      });

      if (!screenshotResult.success) {
        throw new Error(`Screenshot capture failed: ${screenshotResult.error}`);
      }

      Logger.info('Screenshot captured for analysis', {
        analysisId,
        screenshotId: screenshotResult.screenshotId,
        screenshotSize: `${Math.round(screenshotResult.metadata.size / 1024)}KB`,
      });

      // Stage 2: AI visual analysis
      const analysisContext = {
        brandContext: context.brandContext,
        designPrinciples: context.designPrinciples || this.options.analysis.defaultPrinciples,
        analysisType: context.analysisType || 'comprehensive',
        availableEndpoints: context.availableEndpoints || this.getDefaultEndpoints(),
      };

      const visionResult = await this.visionAI.analyzeDesign(
        screenshotResult.base64,
        analysisContext
      );

      if (!visionResult.success) {
        throw new Error(`Visual analysis failed: ${visionResult.error}`);
      }

      const duration = Date.now() - startTime;

      Logger.info('Visual analysis completed successfully', {
        analysisId,
        duration: `${duration}ms`,
        overallScore: visionResult.overallScore,
        criticalIssues: visionResult.criticalIssues?.length || 0,
      });

      // Stage 3: Generate comprehensive result
      return {
        success: true,
        analysisId,
        duration,
        screenshot: {
          id: screenshotResult.screenshotId,
          filepath: screenshotResult.filepath,
          metadata: screenshotResult.metadata,
        },
        analysis: {
          overallScore: visionResult.overallScore,
          designScores: visionResult.designScores,
          criticalIssues: visionResult.criticalIssues,
          improvementOpportunities: visionResult.improvementOpportunities,
          endpointRecommendations: visionResult.endpointRecommendations,
          executionOrder: visionResult.executionOrder,
          estimatedQualityGain: visionResult.estimatedQualityGain,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          analysisContext,
          model: this.options.vision.model,
        },
      };
    } catch (error) {
      Logger.error('Visual analysis failed', {
        analysisId,
        error: error.message,
        duration: Date.now() - startTime,
      });

      return {
        success: false,
        analysisId,
        error: error.message,
        code: 'VISUAL_ANALYSIS_FAILED',
      };
    }
  }

  /**
   * Analyze multiple viewports for responsive design
   */
  async analyzeResponsive(htmlCode, viewports, context = {}) {
    const analysisId = `responsive_analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      Logger.info('Starting responsive visual analysis', {
        analysisId,
        viewports: viewports.map((v) => `${v.width}x${v.height}`),
        htmlLength: htmlCode.length,
      });

      // Capture screenshots for each viewport
      const screenshots = [];
      for (const viewport of viewports) {
        const screenshotResult = await this.screenshotEngine.capture(htmlCode, { viewport });
        if (screenshotResult.success) {
          screenshots.push({
            viewport,
            ...screenshotResult,
          });
        }
      }

      if (screenshots.length === 0) {
        throw new Error('No screenshots captured successfully');
      }

      // Analyze each screenshot
      const viewportAnalyses = [];
      for (const screenshot of screenshots) {
        const analysisContext = {
          ...context,
          viewport: screenshot.viewport,
          analysisType: 'responsive',
        };

        const visionResult = await this.visionAI.analyzeDesign(screenshot.base64, analysisContext);

        viewportAnalyses.push({
          viewport: screenshot.viewport,
          screenshot: {
            id: screenshot.screenshotId,
            filepath: screenshot.filepath,
          },
          analysis: visionResult,
        });
      }

      // Calculate responsive metrics
      const responsiveScore = this.calculateResponsiveScore(viewportAnalyses);
      const responsiveIssues = this.identifyResponsiveIssues(viewportAnalyses);

      const duration = Date.now() - startTime;

      Logger.info('Responsive analysis completed', {
        analysisId,
        duration: `${duration}ms`,
        viewportsAnalyzed: viewportAnalyses.length,
        responsiveScore,
      });

      return {
        success: true,
        analysisId,
        duration,
        viewportAnalyses,
        responsiveScore,
        responsiveIssues,
        recommendations: this.generateResponsiveRecommendations(viewportAnalyses),
        metadata: {
          timestamp: new Date().toISOString(),
          viewports,
          model: this.options.vision.model,
        },
      };
    } catch (error) {
      Logger.error('Responsive analysis failed', {
        analysisId,
        error: error.message,
      });

      return {
        success: false,
        analysisId,
        error: error.message,
        code: 'RESPONSIVE_ANALYSIS_FAILED',
      };
    }
  }

  /**
   * Validate design improvements by comparing before/after
   */
  async validateImprovements(originalCode, improvedCode, context = {}) {
    const validationId = `validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      Logger.info('Starting improvement validation', { validationId });

      // Analyze both versions
      const [originalAnalysis, improvedAnalysis] = await Promise.all([
        this.analyzeCode(originalCode, context),
        this.analyzeCode(improvedCode, context),
      ]);

      if (!originalAnalysis.success || !improvedAnalysis.success) {
        throw new Error('Failed to analyze one or both versions');
      }

      // Calculate improvement metrics
      const scoreDifference =
        improvedAnalysis.analysis.overallScore - originalAnalysis.analysis.overallScore;
      const improvements = this.calculateImprovements(
        originalAnalysis.analysis,
        improvedAnalysis.analysis
      );

      Logger.info('Improvement validation completed', {
        validationId,
        scoreDifference,
        improved: scoreDifference > 0,
      });

      return {
        success: true,
        validationId,
        original: originalAnalysis,
        improved: improvedAnalysis,
        improvements: {
          scoreIncrease: scoreDifference,
          percentageIncrease: (scoreDifference / originalAnalysis.analysis.overallScore) * 100,
          ...improvements,
        },
        recommendation: scoreDifference > 5 ? 'Accept changes' : 'Consider additional improvements',
      };
    } catch (error) {
      Logger.error('Improvement validation failed', {
        validationId,
        error: error.message,
      });

      return {
        success: false,
        validationId,
        error: error.message,
        code: 'VALIDATION_FAILED',
      };
    }
  }

  /**
   * Get default available endpoints for analysis
   */
  getDefaultEndpoints() {
    return [
      '/api/design/enhance - General CSS enhancement',
      '/api/design/enhance-typography - Typography improvements',
      '/api/design/enhance-animations - Micro-interactions',
      '/api/design/enhance-gradients - Color and gradient optimization',
      '/api/design/enhance-states - Hover, focus, active states',
      '/api/layout/grid-recommendations - Layout optimization',
      '/api/layout/spacing-optimization - Spacing consistency',
      '/api/semantic/analyze-accessibility - WCAG compliance',
    ];
  }

  /**
   * Calculate responsive design score
   */
  calculateResponsiveScore(viewportAnalyses) {
    const scores = viewportAnalyses
      .filter((va) => va.analysis.success)
      .map((va) => va.analysis.overallScore);

    if (scores.length === 0) return 0;

    // Average with penalty for inconsistency
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = this.calculateVariance(scores);
    const consistencyPenalty = Math.min(variance / 10, 20);

    return Math.max(0, average - consistencyPenalty);
  }

  /**
   * Identify responsive design issues
   */
  identifyResponsiveIssues(viewportAnalyses) {
    const issues = [];

    // Compare scores across viewports
    viewportAnalyses.forEach((current, index) => {
      viewportAnalyses.forEach((other, otherIndex) => {
        if (
          index !== otherIndex &&
          current.analysis.success &&
          other.analysis.success &&
          current.analysis.overallScore - other.analysis.overallScore > 20
        ) {
          issues.push({
            issue: `Significant quality drop between ${current.viewport.width}px and ${other.viewport.width}px`,
            severity: 'high',
            scoreDifference: current.analysis.overallScore - other.analysis.overallScore,
            affectedViewports: [current.viewport, other.viewport],
          });
        }
      });
    });

    return issues;
  }

  /**
   * Generate responsive recommendations
   */
  generateResponsiveRecommendations(viewportAnalyses) {
    const recommendations = [];

    // Find viewport with best performance
    const bestViewport = viewportAnalyses.reduce((best, current) =>
      current.analysis.success &&
      (!best.analysis.success || current.analysis.overallScore > best.analysis.overallScore)
        ? current
        : best
    );

    if (bestViewport.analysis.success) {
      recommendations.push({
        type: 'best-practice',
        message: `${bestViewport.viewport.width}px viewport shows best design quality`,
        score: bestViewport.analysis.overallScore,
      });
    }

    // Identify problematic viewports
    viewportAnalyses.forEach((va) => {
      if (va.analysis.success && va.analysis.overallScore < 70) {
        recommendations.push({
          type: 'improvement-needed',
          message: `${va.viewport.width}px viewport needs attention`,
          score: va.analysis.overallScore,
          viewport: va.viewport,
        });
      }
    });

    return recommendations;
  }

  /**
   * Calculate specific improvements between analyses
   */
  calculateImprovements(original, improved) {
    const designScoreImprovements = {};

    if (original.designScores && improved.designScores) {
      Object.keys(original.designScores).forEach((key) => {
        const improvement = improved.designScores[key] - original.designScores[key];
        if (improvement !== 0) {
          designScoreImprovements[key] = improvement;
        }
      });
    }

    return {
      designScoreImprovements,
      issuesResolved:
        (original.criticalIssues?.length || 0) - (improved.criticalIssues?.length || 0),
      newIssuesFound: Math.max(
        0,
        (improved.criticalIssues?.length || 0) - (original.criticalIssues?.length || 0)
      ),
    };
  }

  /**
   * Calculate variance for consistency measurement
   */
  calculateVariance(scores) {
    if (scores.length < 2) return 0;

    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const squaredDifferences = scores.map((score) => Math.pow(score - mean, 2));

    return squaredDifferences.reduce((sum, diff) => sum + diff, 0) / scores.length;
  }

  /**
   * Perform maintenance cleanup
   */
  async performMaintenance() {
    try {
      Logger.info('Starting visual analysis maintenance');

      const cleanupResult = await this.screenshotEngine.performMaintenanceCleanup();

      Logger.info('Visual analysis maintenance completed', cleanupResult);

      return {
        success: true,
        ...cleanupResult,
      };
    } catch (error) {
      Logger.error('Maintenance failed', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get system statistics
   */
  async getStats() {
    try {
      const [screenshotStats, visionStats] = await Promise.all([
        this.screenshotEngine.getStats(),
        Promise.resolve(this.visionAI.getUsageStats()),
      ]);

      return {
        success: true,
        screenshot: screenshotStats,
        vision: visionStats,
        configuration: {
          screenshotOptions: this.options.screenshot,
          visionOptions: this.options.vision,
          analysisOptions: this.options.analysis,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Analyze and automatically fix design issues
   * Complete end-to-end workflow: analyze → route → apply → validate
   */
  async analyzeAndFix(htmlCode, context = {}) {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      Logger.info('Starting automated design improvement workflow', {
        workflowId,
        autoApply: context.autoApply !== false,
      });

      // Step 1: Initial analysis
      const initialAnalysis = await this.analyzeCode(htmlCode, context);

      if (!initialAnalysis.success) {
        throw new Error(`Initial analysis failed: ${initialAnalysis.error}`);
      }

      Logger.info('Initial analysis complete', {
        workflowId,
        initialScore: initialAnalysis.analysis.overallScore,
        criticalIssues: initialAnalysis.analysis.criticalIssues?.length || 0,
      });

      // If score is already good or no issues found, return as-is
      if (
        initialAnalysis.analysis.overallScore >= 85 ||
        (initialAnalysis.analysis.criticalIssues?.length === 0 &&
          initialAnalysis.analysis.improvementOpportunities?.length === 0)
      ) {
        Logger.info('Design quality already acceptable', {
          workflowId,
          score: initialAnalysis.analysis.overallScore,
        });

        return {
          success: true,
          workflowId,
          improved: false,
          initialAnalysis,
          finalCode: htmlCode,
          message: 'Design quality already meets standards',
        };
      }

      // Step 2: Apply fixes using SmartRouter
      const fixResult = await this.smartRouter.applyFixes(
        htmlCode,
        initialAnalysis.analysis,
        context
      );

      if (!fixResult.success) {
        throw new Error(`Fix application failed: ${fixResult.error}`);
      }

      Logger.info('Fixes applied', {
        workflowId,
        appliedFixes: fixResult.appliedFixes.length,
        successfulFixes: fixResult.appliedFixes.filter((f) => f.success).length,
      });

      // Step 3: Validate improvements if requested
      let finalAnalysis = null;
      let validationResult = null;

      if (context.validateAfterFix !== false) {
        finalAnalysis = await this.analyzeCode(fixResult.fixedCode, context);

        if (finalAnalysis.success) {
          validationResult = await this.smartRouter.validateImprovements(
            initialAnalysis.analysis,
            fixResult.fixedCode,
            this
          );

          Logger.info('Validation complete', {
            workflowId,
            initialScore: initialAnalysis.analysis.overallScore,
            finalScore: finalAnalysis.analysis.overallScore,
            improvement: validationResult.improvement || 0,
          });
        }
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        workflowId,
        duration,
        improved: true,
        initialAnalysis,
        finalAnalysis,
        fixResult,
        validationResult,
        finalCode: fixResult.fixedCode,
        summary: {
          initialScore: initialAnalysis.analysis.overallScore,
          finalScore: finalAnalysis?.analysis?.overallScore || 'Not validated',
          improvement: validationResult?.improvement || 'Unknown',
          fixesApplied: fixResult.appliedFixes.filter((f) => f.success).length,
          remainingIssues: finalAnalysis?.analysis?.criticalIssues?.length || 'Unknown',
        },
      };
    } catch (error) {
      Logger.error('Automated improvement workflow failed', {
        workflowId,
        error: error.message,
        duration: Date.now() - startTime,
      });

      return {
        success: false,
        workflowId,
        error: error.message,
        code: 'WORKFLOW_FAILED',
      };
    }
  }
}

// Export main classes and utilities
module.exports = {
  VisualAnalysisManager,
  ScreenshotEngine,
  VisionAI,
  SmartRouter,
  ANALYSIS_PROMPTS,
  PromptBuilder,
};
