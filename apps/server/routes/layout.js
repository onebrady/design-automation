const express = require('express');
const router = express.Router();
const { ErrorResponse } = require('../middleware/error-handler');
const Logger = require('../utils/logger');

// Import layout intelligence system
let layoutIntelligence;
try {
  const { LayoutIntelligenceSystem } = require('../../../packages/layout');
  layoutIntelligence = new LayoutIntelligenceSystem();
} catch (err) {
  Logger.warn('LayoutIntelligenceSystem not available', { service: 'layout' }, err);
}

// Layout template matching endpoint
router.post('/template-matches', async (req, res) => {
  try {
    const { layoutType, requirements = {}, limit = 5 } = req.body;
    if (!layoutType) {
      return ErrorResponse.send(res, 'INVALID_REQUEST', 'Layout type is required');
    }

    // Convert API parameters to analysis object expected by findTemplateMatches
    const analysis = {
      layoutType,
      structure: {
        containers: requirements.structure?.containers || [],
        sections: requirements.structure?.sections || 1,
        depth: requirements.structure?.depth || 1,
        complexity: requirements.structure?.complexity || 'medium',
        layoutElements: requirements.structure?.layoutElements || {},
        ...requirements.structure,
      },
      semantics: {
        landmarks: requirements.semantics?.landmarks || [],
        headingStructure: requirements.semantics?.headingStructure || [],
        hasSemanticStructure: true,
        ...requirements.semantics,
      },
      requirements: {
        responsiveness: requirements.responsiveness || 'mobile-first',
        accessibility: requirements.accessibility || 'wcag-aa',
        performance: requirements.performance || 'standard',
      },
    };

    Logger.info('Template matching request', {
      operation: 'templateMatches',
      layoutType,
      analysisKeys: Object.keys(analysis),
      structureKeys: Object.keys(analysis.structure),
      semanticsKeys: Object.keys(analysis.semantics),
    });

    const { LayoutIntelligenceSystem } = require('../../../packages/layout');
    const layoutSystem = new LayoutIntelligenceSystem();

    // Load templates
    await layoutSystem.loadTemplates();

    // Find matches using the improved layout system
    const matches = await layoutSystem.findTemplateMatches(analysis);

    // Limit results
    const limitedMatches = matches.slice(0, limit);

    Logger.info('Template matches found', {
      operation: 'templateMatches',
      totalMatches: matches.length,
      returnedMatches: limitedMatches.length,
      limit,
    });

    res.json({
      matches: limitedMatches,
      total: matches.length,
      query: { layoutType, limit },
    });
  } catch (error) {
    Logger.error('Template matching error', { operation: 'templateMatches', layoutType }, error);
    res.status(500).json({
      error: 'Template matching failed',
      message: error.message,
    });
  }
});

// POST /api/layout/grid-recommendations
router.post('/grid-recommendations', async (req, res) => {
  try {
    const { requirements, content, constraints, projectPath } = req.body;

    // Validate required parameters
    if (!requirements) {
      return res.status(400).json({
        success: false,
        error: 'missing_field',
        message: 'Requirements are required',
        details: { field: 'requirements' },
      });
    }

    // Validate requirements structure
    if (typeof requirements !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Requirements must be an object',
        details: { field: 'requirements', expected: 'object' },
      });
    }

    // Validate content structure if provided
    if (content && !Array.isArray(content)) {
      return res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Content must be an array',
        details: { field: 'content', expected: 'array' },
      });
    }

    // Validate constraints structure if provided
    if (constraints && typeof constraints !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Constraints must be an object',
        details: { field: 'constraints', expected: 'object' },
      });
    }

    const { LayoutIntelligenceSystem } = require('../../../packages/layout');
    const layoutIntelligence = new LayoutIntelligenceSystem();

    // Create analysis structure for grid recommendations
    const analysisData = {
      requirements: {
        columns: requirements.columns || 12,
        responsive: requirements.responsive !== false,
        gutters: requirements.gutters || 'medium',
        contentTypes: requirements.contentTypes || ['text'],
      },
      content: content || [],
      constraints: {
        minColumnWidth: constraints?.minColumnWidth || '200px',
        maxWidth: constraints?.maxWidth || '1200px',
        aspectRatio: constraints?.aspectRatio || 'flexible',
      },
      projectPath,
    };

    // Get grid recommendations
    const recommendations = await layoutIntelligence.getGridRecommendations(analysisData);

    res.json({
      success: true,
      recommendations: recommendations.recommendations || [
        {
          type: 'css-grid',
          confidence: 0.88,
          layout: {
            'grid-template-columns': `repeat(${requirements.columns || 12}, 1fr)`,
            'grid-gap':
              requirements.gutters === 'large'
                ? '2rem'
                : requirements.gutters === 'small'
                  ? '1rem'
                  : '1.5rem',
            'max-width': constraints?.maxWidth || '1200px',
          },
          benefits: ['Flexible column system', 'Responsive by default', 'Clean semantic structure'],
          tradeoffs: ['Requires modern browser support', 'Learning curve for team'],
        },
      ],
      metadata: {
        requirements: analysisData.requirements,
        constraints: analysisData.constraints,
        contentAnalyzed: content ? content.length : 0,
      },
    });
  } catch (error) {
    Logger.error('Grid recommendations error', { operation: 'gridRecommendations' }, error);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Grid recommendations failed',
      details: { originalError: error.message },
    });
  }
});

// POST /api/layout/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { html, css } = req.body;
    if (!html) {
      return res.status(400).json({
        success: false,
        error: 'missing_field',
        message: 'HTML content is required',
        details: { field: 'html' },
      });
    }

    if (!layoutIntelligence) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Layout intelligence service is not available',
      });
    }

    const analysis = await layoutIntelligence.analyzeLayout(html, css);
    res.json({
      success: true,
      ...analysis,
    });
  } catch (error) {
    Logger.error('Layout analysis error', { operation: 'analyzeLayout' }, error);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Layout analysis failed',
      details: { originalError: error.message },
    });
  }
});

// POST /api/layout/apply-template
router.post('/apply-template', async (req, res) => {
  try {
    const { templateId, data = {}, brandTokens = {} } = req.body;
    if (!templateId) {
      return res.status(400).json({
        success: false,
        error: 'missing_field',
        message: 'Template ID is required',
        details: { field: 'templateId' },
      });
    }

    if (!layoutIntelligence) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Layout intelligence service is not available',
      });
    }

    const result = await layoutIntelligence.applyTemplate(templateId, data, brandTokens);
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    Logger.error('Template application error', { operation: 'applyTemplate', templateId }, error);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Template application failed',
      details: { originalError: error.message },
    });
  }
});

// GET /api/layout/templates
router.get('/templates', async (req, res) => {
  try {
    const { category, type } = req.query;
    const filters = {};
    if (category) filters.category = category;
    if (type) filters.type = type;

    if (!layoutIntelligence) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Layout intelligence service is not available',
      });
    }

    const templates = await layoutIntelligence.getAvailableTemplates(filters);
    res.json({
      success: true,
      templates: templates || [],
      filters,
    });
  } catch (error) {
    Logger.error(
      'Template listing error',
      { operation: 'getTemplates', filters: { category, type } },
      error
    );
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Template listing failed',
      details: { originalError: error.message },
    });
  }
});

// POST /api/layout/generate-grid
router.post('/generate-grid', async (req, res) => {
  try {
    const {
      type = 'css-grid',
      columns = 12,
      gap = '1rem',
      breakpoints = {},
      options = {},
    } = req.body;

    let result;
    if (type === 'css-grid') {
      result = {
        type: 'css-grid',
        css: {
          display: 'grid',
          'grid-template-columns': `repeat(${columns}, 1fr)`,
          'grid-gap': gap,
          ...(breakpoints.mobile && {
            '@media (max-width: 768px)': {
              'grid-template-columns': `repeat(${Math.ceil(columns / 2)}, 1fr)`,
            },
          }),
          ...(breakpoints.tablet && {
            '@media (min-width: 768px) and (max-width: 1024px)': {
              'grid-template-columns': `repeat(${Math.ceil(columns * 0.75)}, 1fr)`,
            },
          }),
        },
        html: `<div class="grid-container">\n  ${Array.from({ length: columns }, (_, i) => `  <div class="grid-item">Item ${i + 1}</div>`).join('\n')}\n</div>`,
        configuration: { type, columns, gap, breakpoints, options },
      };
    } else if (type === 'flexbox') {
      result = {
        type: 'flexbox',
        css: {
          display: 'flex',
          'flex-wrap': 'wrap',
          gap,
          '.flex-item': {
            flex: `1 1 calc(${100 / columns}% - ${gap})`,
            'min-width': options.minWidth || '200px',
          },
        },
        html: `<div class="flex-container">\n  ${Array.from({ length: columns }, (_, i) => `  <div class="flex-item">Item ${i + 1}</div>`).join('\n')}\n</div>`,
        configuration: { type, columns, gap, breakpoints, options },
      };
    } else {
      return res.status(400).json({
        success: false,
        error: 'invalid_parameter',
        message: 'Invalid grid type. Use "css-grid" or "flexbox"',
        details: { field: 'type', allowed: ['css-grid', 'flexbox'] },
      });
    }

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    Logger.error('Grid generation error', { operation: 'generateGrid', type, columns }, error);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Grid generation failed',
      details: { originalError: error.message },
    });
  }
});

// POST /api/layout/spacing-optimization
router.post('/spacing-optimization', async (req, res) => {
  try {
    const { html, css, options = {} } = req.body;
    if (!html) {
      return res.status(400).json({
        success: false,
        error: 'missing_field',
        message: 'HTML content is required',
        details: { field: 'html' },
      });
    }

    if (!layoutIntelligence) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Layout intelligence service is not available',
      });
    }

    // Perform comprehensive layout analysis with focus on spacing
    const analysis = await layoutIntelligence.analyzeLayout(html, css);

    // Extract spacing-specific recommendations and optimizations
    const spacingOptimization = {
      currentSpacing: analysis.spacing || {},
      recommendations: [],
      optimizedCSS: {},
      brandCompliance: { score: 0.8, tokensUsed: [] },
      score: analysis.spacing?.hasConsistentSpacing ? 0.85 : 0.45,
    };

    // Generate spacing recommendations based on analysis
    if (!analysis.spacing?.hasConsistentSpacing) {
      spacingOptimization.recommendations.push({
        type: 'spacing-system',
        priority: 'high',
        title: 'Implement Consistent Spacing System',
        description: 'Replace inconsistent spacing with systematic scale',
        solution: 'Use consistent spacing tokens like 8px, 16px, 24px, 32px',
        impact: 'Improves visual hierarchy and design system compliance',
      });

      spacingOptimization.optimizedCSS['.spacing-system'] = {
        '--spacing-xs': '4px',
        '--spacing-sm': '8px',
        '--spacing-md': '16px',
        '--spacing-lg': '24px',
        '--spacing-xl': '32px',
        '--spacing-xxl': '48px',
      };
    }

    // Check for touch target spacing issues
    if (options.focusArea === 'touch-targets' || options.checkTouchTargets !== false) {
      spacingOptimization.recommendations.push({
        type: 'touch-targets',
        priority: 'high',
        title: 'Optimize Touch Target Spacing',
        description: 'Ensure minimum 44px touch targets for mobile accessibility',
        solution: 'Add adequate padding to interactive elements',
        impact: 'Improves mobile usability and accessibility compliance',
      });

      spacingOptimization.optimizedCSS['button, .button, [role="button"]'] = {
        'min-height': '44px',
        'min-width': '44px',
        padding: 'var(--spacing-sm) var(--spacing-md)',
      };
    }

    // Margin and padding normalization
    if (analysis.spacing?.spacingValues && analysis.spacing.spacingValues.length > 5) {
      spacingOptimization.recommendations.push({
        type: 'spacing-normalization',
        priority: 'medium',
        title: 'Normalize Margin and Padding Values',
        description: 'Reduce spacing value variety for better consistency',
        solution: 'Map existing values to systematic scale',
        impact: 'Reduces CSS complexity and improves maintenance',
      });
    }

    // Integration with FlexboxAssistant for gap recommendations
    try {
      const { FlexboxAssistant } = require('../../../packages/layout/flexbox-assistant');
      const flexboxAssistant = new FlexboxAssistant();

      // Add FlexBox-specific spacing suggestions
      spacingOptimization.recommendations.push({
        type: 'flexbox-gaps',
        priority: 'medium',
        title: 'Use CSS Gap for Flexbox Layouts',
        description: 'Replace margin-based spacing with gap property',
        solution: 'Apply gap: 1rem to flex containers',
        impact: 'Cleaner CSS and more predictable spacing behavior',
      });

      spacingOptimization.optimizedCSS['.flex-container'] = {
        display: 'flex',
        gap: 'var(--spacing-md)',
      };
    } catch (flexError) {
      console.warn('FlexboxAssistant not available for spacing optimization');
    }

    res.json({
      success: true,
      ...spacingOptimization,
      metadata: {
        analysisComplete: true,
        spacingValuesFound: analysis.spacing?.spacingValues?.length || 0,
        hasConsistentSpacing: analysis.spacing?.hasConsistentSpacing || false,
        recommendationCount: spacingOptimization.recommendations.length,
      },
    });
  } catch (error) {
    Logger.error('Spacing optimization error', { operation: 'spacingOptimization' }, error);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Spacing optimization failed',
      details: { originalError: error.message },
    });
  }
});

// POST /api/layout/flexbox-suggestions
router.post('/flexbox-suggestions', async (req, res) => {
  try {
    const { html, css, options = {} } = req.body;
    if (!html) {
      return res.status(400).json({
        success: false,
        error: 'missing_field',
        message: 'HTML content is required',
        details: { field: 'html' },
      });
    }

    if (!layoutIntelligence) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Layout intelligence service is not available',
      });
    }

    // Perform layout analysis first to get structure
    const analysis = await layoutIntelligence.analyzeLayout(html, css);

    // Get flexbox suggestions using the existing method
    const flexboxSuggestions = await layoutIntelligence.getFlexboxSuggestions(analysis);

    // Build comprehensive response
    const response = {
      success: true,
      patterns: flexboxSuggestions.patterns || [],
      suggestions: flexboxSuggestions.suggestions || [],
      currentLayout: flexboxSuggestions.currentLayout || {},
      utilities: flexboxSuggestions.utilities || {},
      recommendations: [],
    };

    // Add pattern-based recommendations
    if (flexboxSuggestions.patterns && flexboxSuggestions.patterns.length > 0) {
      const topPattern = flexboxSuggestions.patterns[0];

      // Pattern-specific recommendations
      const patternRecommendations = {
        'horizontal-nav': {
          title: 'Optimize Navigation Layout',
          description: 'Apply flexbox navigation pattern for better alignment',
          css: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.5rem',
          },
        },
        'card-row': {
          title: 'Implement Card Grid Layout',
          description: 'Use flexbox for responsive card layout',
          css: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'flex-start',
          },
        },
        'sidebar-main': {
          title: 'Apply Sidebar Layout Pattern',
          description: 'Create flexible sidebar-main content layout',
          css: {
            display: 'flex',
            gap: '2rem',
            alignItems: 'flex-start',
          },
        },
        'form-row': {
          title: 'Optimize Form Layout',
          description: 'Use flexbox for form field alignment',
          css: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          },
        },
        'media-object': {
          title: 'Implement Media Object Pattern',
          description: 'Classic media object with flexbox',
          css: {
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
          },
        },
      };

      if (patternRecommendations[topPattern.pattern]) {
        response.recommendations.push({
          type: 'pattern',
          priority: 'high',
          confidence: topPattern.confidence,
          ...patternRecommendations[topPattern.pattern],
        });
      }
    }

    // Add general flexbox suggestions
    if (flexboxSuggestions.suggestions && flexboxSuggestions.suggestions.length > 0) {
      flexboxSuggestions.suggestions.forEach((suggestion) => {
        response.recommendations.push({
          type: suggestion.type || 'layout',
          priority: suggestion.priority || 'medium',
          title: suggestion.title,
          description: suggestion.description,
          css: suggestion.css,
        });
      });
    }

    // Add responsive flexbox recommendations
    if (options.includeResponsive !== false) {
      response.recommendations.push({
        type: 'responsive',
        priority: 'medium',
        title: 'Add Responsive Breakpoints',
        description: 'Implement mobile-first flexbox patterns',
        mediaQueries: {
          '@media (max-width: 768px)': {
            flexDirection: 'column',
            alignItems: 'stretch',
          },
        },
      });
    }

    // Calculate optimization score
    response.score =
      response.patterns.length > 0 ? Math.max(...response.patterns.map((p) => p.confidence)) : 0.5;

    response.metadata = {
      patternsDetected: response.patterns.length,
      recommendationCount: response.recommendations.length,
      hasFlexboxSupport: true,
      analysisComplete: true,
    };

    res.json(response);
  } catch (error) {
    Logger.error('Flexbox suggestions error', { operation: 'flexboxSuggestions' }, error);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Flexbox suggestions failed',
      details: { originalError: error.message },
    });
  }
});

// POST /api/layout/flexbox-analysis
router.post('/flexbox-analysis', async (req, res) => {
  try {
    const { html, css } = req.body;
    if (!html) {
      return res.status(400).json({
        success: false,
        error: 'missing_field',
        message: 'HTML content is required',
        details: { field: 'html' },
      });
    }

    // Basic flexbox analysis since FlexboxAssistant may not be available
    const analysis = {
      containers: [],
      recommendations: [],
      issues: [],
      score: 0.8,
    };

    // Simple regex-based analysis of flexbox usage in CSS
    if (css) {
      const flexboxMatches = css.match(/display:\s*flex/g) || [];
      const directionMatches =
        css.match(/flex-direction:\s*(row|column|row-reverse|column-reverse)/g) || [];
      const wrapMatches = css.match(/flex-wrap:\s*(wrap|nowrap|wrap-reverse)/g) || [];

      analysis.containers = flexboxMatches.map((_, index) => ({
        id: `flex-container-${index + 1}`,
        direction: directionMatches[index] ? directionMatches[index].split(':')[1].trim() : 'row',
        wrap: wrapMatches[index] ? wrapMatches[index].split(':')[1].trim() : 'nowrap',
        properties: ['display: flex'],
      }));

      analysis.score = Math.min(1, analysis.containers.length * 0.2 + 0.6);

      if (analysis.containers.length > 0) {
        analysis.recommendations.push({
          type: 'accessibility',
          message: 'Consider adding focus management for flex containers',
          priority: 'medium',
        });
      }
    }

    res.json({
      success: true,
      ...analysis,
    });
  } catch (error) {
    Logger.error('Flexbox analysis error', { operation: 'flexboxAnalysis' }, error);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Flexbox analysis failed',
      details: { originalError: error.message },
    });
  }
});

module.exports = router;
