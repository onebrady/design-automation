/**
 * Visual Analysis API Routes
 *
 * Provides endpoints for screenshot capture and AI-powered visual analysis.
 * Integrates with the existing design system API architecture.
 */

const express = require('express');
const { VisualAnalysisManager } = require('../../../packages/visual-analysis');
const { resolveProjectContext } = require('../../../packages/discovery');
const Logger = require('../utils/logger');
const { ErrorResponse, SuccessResponse } = require('../middleware/error-handler');

const router = express.Router();

// Initialize visual analysis manager
let visualAnalysisManager;
try {
  visualAnalysisManager = new VisualAnalysisManager({
    screenshot: {
      viewport: { width: 1200, height: 800 },
      cleanup: {
        autoCleanup: true,
        maxAge: 5 * 60 * 1000, // 5 minutes
        maxFiles: 100,
      },
    },
    vision: {
      model: 'gpt-4-turbo',
      maxTokens: 4096,
      temperature: 0.3,
      retryAttempts: 3,
    },
  });
  Logger.info('Visual analysis manager initialized successfully');
} catch (error) {
  Logger.error('Failed to initialize visual analysis manager', {
    error: error.message,
  });
  visualAnalysisManager = null;
}

/**
 * POST /api/visual/analyze
 * Analyze HTML code with visual intelligence
 */
router.post('/analyze', async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      code,
      brandPackId,
      projectPath,
      viewport,
      analysisType = 'comprehensive',
      designPrinciples,
      includeScreenshot = false,
    } = req.body;

    // Validate required parameters
    if (!code) {
      return ErrorResponse.send(res, 'missing_field', 'HTML code is required', {
        field: 'code',
      });
    }

    // Check if visual analysis is available
    if (!visualAnalysisManager) {
      return ErrorResponse.send(
        res,
        'service_unavailable',
        'Visual analysis service not available',
        {
          reason: 'OpenAI API key not configured or system initialization failed',
        }
      );
    }

    Logger.info('Visual analysis request received', {
      codeLength: code.length,
      brandPackId,
      analysisType,
      viewport,
      includeScreenshot,
    });

    // Resolve project context for brand information
    let brandContext = null;
    if (brandPackId || projectPath) {
      try {
        const context = await resolveProjectContext(projectPath || process.cwd());
        if (context && !context.degraded) {
          brandContext = context;
        }
      } catch (error) {
        Logger.warn('Failed to resolve brand context', {
          error: error.message,
          brandPackId,
          projectPath,
        });
      }
    }

    // Prepare analysis context
    const analysisContext = {
      brandContext,
      analysisType,
      designPrinciples: designPrinciples || [
        'hierarchy',
        'spacing',
        'typography',
        'color',
        'accessibility',
      ],
      viewport: viewport || { width: 1200, height: 800 },
    };

    // Perform visual analysis
    const analysisResult = await visualAnalysisManager.analyzeCode(code, analysisContext);

    if (!analysisResult.success) {
      return ErrorResponse.send(res, 'analysis_failed', analysisResult.error, {
        analysisId: analysisResult.analysisId,
        code: analysisResult.code,
      });
    }

    const duration = Date.now() - startTime;

    Logger.info('Visual analysis completed successfully', {
      analysisId: analysisResult.analysisId,
      duration: `${duration}ms`,
      overallScore: analysisResult.analysis.overallScore,
      criticalIssues: analysisResult.analysis.criticalIssues.length,
    });

    // Prepare response
    const response = {
      analysisId: analysisResult.analysisId,
      duration,
      analysis: {
        overallScore: analysisResult.analysis.overallScore,
        designScores: analysisResult.analysis.designScores,
        criticalIssues: analysisResult.analysis.criticalIssues,
        improvementOpportunities: analysisResult.analysis.improvementOpportunities,
        endpointRecommendations: analysisResult.analysis.endpointRecommendations,
        executionOrder: analysisResult.analysis.executionOrder,
        estimatedQualityGain: analysisResult.analysis.estimatedQualityGain,
      },
      metadata: analysisResult.metadata,
    };

    // Include screenshot data if requested
    if (includeScreenshot && analysisResult.screenshot) {
      response.screenshot = {
        id: analysisResult.screenshot.id,
        metadata: analysisResult.screenshot.metadata,
      };
    }

    return SuccessResponse.send(res, response);
  } catch (error) {
    Logger.error('Visual analysis endpoint error', {
      error: error.message,
      stack: error.stack,
      duration: Date.now() - startTime,
    });

    return ErrorResponse.send(res, 'internal_server_error', 'Visual analysis failed', {
      error: error.message,
    });
  }
});

/**
 * POST /api/visual/analyze-responsive
 * Analyze HTML across multiple viewports for responsive design
 */
router.post('/analyze-responsive', async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      code,
      viewports = [
        { width: 320, height: 568 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1440, height: 900 }, // Desktop
      ],
      brandPackId,
      projectPath,
    } = req.body;

    if (!code) {
      return ErrorResponse.send(res, 'missing_field', 'HTML code is required', {
        field: 'code',
      });
    }

    if (!visualAnalysisManager) {
      return ErrorResponse.send(
        res,
        'service_unavailable',
        'Visual analysis service not available'
      );
    }

    Logger.info('Responsive visual analysis request', {
      codeLength: code.length,
      viewports: viewports.map((v) => `${v.width}x${v.height}`),
      brandPackId,
    });

    // Resolve brand context
    let brandContext = null;
    if (brandPackId || projectPath) {
      try {
        const context = await resolveProjectContext(projectPath || process.cwd());
        if (context && !context.degraded) {
          brandContext = context;
        }
      } catch (error) {
        Logger.warn('Failed to resolve brand context for responsive analysis', {
          error: error.message,
        });
      }
    }

    // Perform responsive analysis
    const analysisResult = await visualAnalysisManager.analyzeResponsive(code, viewports, {
      brandContext,
    });

    if (!analysisResult.success) {
      return ErrorResponse.send(res, 'analysis_failed', analysisResult.error, {
        analysisId: analysisResult.analysisId,
      });
    }

    const duration = Date.now() - startTime;

    Logger.info('Responsive analysis completed', {
      analysisId: analysisResult.analysisId,
      duration: `${duration}ms`,
      responsiveScore: analysisResult.responsiveScore,
      viewportsAnalyzed: analysisResult.viewportAnalyses.length,
    });

    return SuccessResponse.send(res, {
      analysisId: analysisResult.analysisId,
      duration,
      responsiveScore: analysisResult.responsiveScore,
      viewportAnalyses: analysisResult.viewportAnalyses.map((va) => ({
        viewport: va.viewport,
        analysis: {
          success: va.analysis.success,
          overallScore: va.analysis.overallScore,
          criticalIssues: va.analysis.criticalIssues,
          improvementOpportunities: va.analysis.improvementOpportunities,
        },
      })),
      responsiveIssues: analysisResult.responsiveIssues,
      recommendations: analysisResult.recommendations,
      metadata: analysisResult.metadata,
    });
  } catch (error) {
    Logger.error('Responsive analysis endpoint error', {
      error: error.message,
      duration: Date.now() - startTime,
    });

    return ErrorResponse.send(res, 'internal_server_error', 'Responsive analysis failed', {
      error: error.message,
    });
  }
});

/**
 * POST /api/visual/validate-improvements
 * Compare before/after designs to validate improvements
 */
router.post('/validate-improvements', async (req, res) => {
  const startTime = Date.now();

  try {
    const { originalCode, improvedCode, brandPackId, projectPath, viewport } = req.body;

    if (!originalCode || !improvedCode) {
      return ErrorResponse.send(res, 'missing_field', 'Both original and improved code required', {
        missingFields: [!originalCode && 'originalCode', !improvedCode && 'improvedCode'].filter(
          Boolean
        ),
      });
    }

    if (!visualAnalysisManager) {
      return ErrorResponse.send(
        res,
        'service_unavailable',
        'Visual analysis service not available'
      );
    }

    Logger.info('Improvement validation request', {
      originalLength: originalCode.length,
      improvedLength: improvedCode.length,
      brandPackId,
    });

    // Resolve brand context
    let brandContext = null;
    if (brandPackId || projectPath) {
      try {
        const context = await resolveProjectContext(projectPath || process.cwd());
        if (context && !context.degraded) {
          brandContext = context;
        }
      } catch (error) {
        Logger.warn('Failed to resolve brand context for validation', {
          error: error.message,
        });
      }
    }

    // Validate improvements
    const validationResult = await visualAnalysisManager.validateImprovements(
      originalCode,
      improvedCode,
      { brandContext, viewport }
    );

    if (!validationResult.success) {
      return ErrorResponse.send(res, 'validation_failed', validationResult.error, {
        validationId: validationResult.validationId,
      });
    }

    const duration = Date.now() - startTime;

    Logger.info('Improvement validation completed', {
      validationId: validationResult.validationId,
      duration: `${duration}ms`,
      scoreIncrease: validationResult.improvements.scoreIncrease,
      percentageIncrease: validationResult.improvements.percentageIncrease,
    });

    return SuccessResponse.send(res, {
      validationId: validationResult.validationId,
      duration,
      improvements: validationResult.improvements,
      recommendation: validationResult.recommendation,
      original: {
        analysisId: validationResult.original.analysisId,
        overallScore: validationResult.original.analysis.overallScore,
        criticalIssues: validationResult.original.analysis.criticalIssues.length,
      },
      improved: {
        analysisId: validationResult.improved.analysisId,
        overallScore: validationResult.improved.analysis.overallScore,
        criticalIssues: validationResult.improved.analysis.criticalIssues.length,
      },
    });
  } catch (error) {
    Logger.error('Improvement validation endpoint error', {
      error: error.message,
      duration: Date.now() - startTime,
    });

    return ErrorResponse.send(res, 'internal_server_error', 'Validation failed', {
      error: error.message,
    });
  }
});

/**
 * GET /api/visual/stats
 * Get visual analysis system statistics
 */
router.get('/stats', async (req, res) => {
  try {
    if (!visualAnalysisManager) {
      return ErrorResponse.send(
        res,
        'service_unavailable',
        'Visual analysis service not available'
      );
    }

    Logger.debug('Visual analysis stats requested');

    const stats = await visualAnalysisManager.getStats();

    return SuccessResponse.send(res, stats);
  } catch (error) {
    Logger.error('Visual stats endpoint error', {
      error: error.message,
    });

    return ErrorResponse.send(res, 'internal_server_error', 'Failed to get stats', {
      error: error.message,
    });
  }
});

/**
 * POST /api/visual/maintenance
 * Perform maintenance cleanup of screenshots
 */
router.post('/maintenance', async (req, res) => {
  try {
    if (!visualAnalysisManager) {
      return ErrorResponse.send(
        res,
        'service_unavailable',
        'Visual analysis service not available'
      );
    }

    Logger.info('Visual analysis maintenance requested');

    const maintenanceResult = await visualAnalysisManager.performMaintenance();

    Logger.info('Visual analysis maintenance completed', maintenanceResult);

    return SuccessResponse.send(res, maintenanceResult);
  } catch (error) {
    Logger.error('Visual maintenance endpoint error', {
      error: error.message,
    });

    return ErrorResponse.send(res, 'internal_server_error', 'Maintenance failed', {
      error: error.message,
    });
  }
});

/**
 * GET /api/visual/health
 * Health check for visual analysis system
 */
router.get('/health', async (req, res) => {
  try {
    const health = {
      visualAnalysisManager: !!visualAnalysisManager,
      openaiConfigured: !!process.env.OPENAI_API_KEY,
      playwrightAvailable: true, // Installed as dependency
      timestamp: new Date().toISOString(),
    };

    // Test basic functionality if fully configured
    if (visualAnalysisManager && process.env.OPENAI_API_KEY) {
      try {
        const stats = await visualAnalysisManager.getStats();
        health.systemStats = stats.success;
        health.status = 'healthy';
      } catch (error) {
        health.status = 'degraded';
        health.error = error.message;
      }
    } else {
      health.status = 'unavailable';
      health.missingRequirements = [
        !visualAnalysisManager && 'Visual analysis manager initialization failed',
        !process.env.OPENAI_API_KEY && 'OpenAI API key not configured',
      ].filter(Boolean);
    }

    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

    return res.status(statusCode).json({
      success: health.status !== 'unavailable',
      ...health,
    });
  } catch (error) {
    Logger.error('Visual health check error', {
      error: error.message,
    });

    return res.status(503).json({
      success: false,
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
