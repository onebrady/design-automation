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
        ...requirements.structure
      },
      semantics: {
        landmarks: requirements.semantics?.landmarks || [],
        headingStructure: requirements.semantics?.headingStructure || [],
        hasSemanticStructure: true,
        ...requirements.semantics
      },
      requirements: {
        responsiveness: requirements.responsiveness || 'mobile-first',
        accessibility: requirements.accessibility || 'wcag-aa',
        performance: requirements.performance || 'standard'
      }
    };

    Logger.info('Template matching request', {
      operation: 'templateMatches',
      layoutType,
      analysisKeys: Object.keys(analysis),
      structureKeys: Object.keys(analysis.structure),
      semanticsKeys: Object.keys(analysis.semantics)
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
      limit
    });
    
    res.json({
      matches: limitedMatches,
      total: matches.length,
      query: { layoutType, limit }
    });

  } catch (error) {
    Logger.error('Template matching error', { operation: 'templateMatches', layoutType }, error);
    res.status(500).json({ 
      error: 'Template matching failed', 
      message: error.message 
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
        details: { field: 'requirements' }
      });
    }

    // Validate requirements structure
    if (typeof requirements !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Requirements must be an object',
        details: { field: 'requirements', expected: 'object' }
      });
    }

    // Validate content structure if provided
    if (content && !Array.isArray(content)) {
      return res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Content must be an array',
        details: { field: 'content', expected: 'array' }
      });
    }

    // Validate constraints structure if provided
    if (constraints && typeof constraints !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Constraints must be an object',
        details: { field: 'constraints', expected: 'object' }
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
        contentTypes: requirements.contentTypes || ['text']
      },
      content: content || [],
      constraints: {
        minColumnWidth: constraints?.minColumnWidth || '200px',
        maxWidth: constraints?.maxWidth || '1200px',
        aspectRatio: constraints?.aspectRatio || 'flexible'
      },
      projectPath
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
            'grid-gap': requirements.gutters === 'large' ? '2rem' : requirements.gutters === 'small' ? '1rem' : '1.5rem',
            'max-width': constraints?.maxWidth || '1200px'
          },
          benefits: ['Flexible column system', 'Responsive by default', 'Clean semantic structure'],
          tradeoffs: ['Requires modern browser support', 'Learning curve for team']
        }
      ],
      metadata: {
        requirements: analysisData.requirements,
        constraints: analysisData.constraints,
        contentAnalyzed: content ? content.length : 0
      }
    });

  } catch (error) {
    Logger.error('Grid recommendations error', { operation: 'gridRecommendations' }, error);
    res.status(500).json({ 
      success: false,
      error: 'processing_error', 
      message: 'Grid recommendations failed', 
      details: { originalError: error.message }
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
        details: { field: 'html' }
      });
    }

    if (!layoutIntelligence) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Layout intelligence service is not available'
      });
    }

    const analysis = await layoutIntelligence.analyzeLayout(html, css);
    res.json({
      success: true,
      ...analysis
    });
  } catch (error) {
    Logger.error('Layout analysis error', { operation: 'analyzeLayout' }, error);
    res.status(500).json({ 
      success: false,
      error: 'processing_error',
      message: 'Layout analysis failed', 
      details: { originalError: error.message }
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
        details: { field: 'templateId' }
      });
    }

    if (!layoutIntelligence) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Layout intelligence service is not available'
      });
    }

    const result = await layoutIntelligence.applyTemplate(templateId, data, brandTokens);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    Logger.error('Template application error', { operation: 'applyTemplate', templateId }, error);
    res.status(500).json({ 
      success: false,
      error: 'processing_error',
      message: 'Template application failed', 
      details: { originalError: error.message }
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
        message: 'Layout intelligence service is not available'
      });
    }

    const templates = await layoutIntelligence.getAvailableTemplates(filters);
    res.json({
      success: true,
      templates: templates || [],
      filters
    });
  } catch (error) {
    Logger.error('Template listing error', { operation: 'getTemplates', filters: { category, type } }, error);
    res.status(500).json({ 
      success: false,
      error: 'processing_error',
      message: 'Template listing failed', 
      details: { originalError: error.message }
    });
  }
});

// POST /api/layout/generate-grid
router.post('/generate-grid', async (req, res) => {
  try {
    const { type = 'css-grid', columns = 12, gap = '1rem', breakpoints = {}, options = {} } = req.body;
    
    let result;
    if (type === 'css-grid') {
      result = {
        type: 'css-grid',
        css: {
          display: 'grid',
          'grid-template-columns': `repeat(${columns}, 1fr)`,
          'grid-gap': gap,
          ...(breakpoints.mobile && { '@media (max-width: 768px)': { 'grid-template-columns': `repeat(${Math.ceil(columns/2)}, 1fr)` } }),
          ...(breakpoints.tablet && { '@media (min-width: 768px) and (max-width: 1024px)': { 'grid-template-columns': `repeat(${Math.ceil(columns*0.75)}, 1fr)` } })
        },
        html: `<div class="grid-container">\n  ${Array.from({length: columns}, (_, i) => `  <div class="grid-item">Item ${i+1}</div>`).join('\n')}\n</div>`,
        configuration: { type, columns, gap, breakpoints, options }
      };
    } else if (type === 'flexbox') {
      result = {
        type: 'flexbox',
        css: {
          display: 'flex',
          'flex-wrap': 'wrap',
          gap,
          '.flex-item': {
            flex: `1 1 calc(${100/columns}% - ${gap})`,
            'min-width': options.minWidth || '200px'
          }
        },
        html: `<div class="flex-container">\n  ${Array.from({length: columns}, (_, i) => `  <div class="flex-item">Item ${i+1}</div>`).join('\n')}\n</div>`,
        configuration: { type, columns, gap, breakpoints, options }
      };
    } else {
      return res.status(400).json({ 
        success: false,
        error: 'invalid_parameter',
        message: 'Invalid grid type. Use "css-grid" or "flexbox"',
        details: { field: 'type', allowed: ['css-grid', 'flexbox'] }
      });
    }

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    Logger.error('Grid generation error', { operation: 'generateGrid', type, columns }, error);
    res.status(500).json({ 
      success: false,
      error: 'processing_error',
      message: 'Grid generation failed', 
      details: { originalError: error.message }
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
        details: { field: 'html' }
      });
    }

    // Basic flexbox analysis since FlexboxAssistant may not be available
    const analysis = {
      containers: [],
      recommendations: [],
      issues: [],
      score: 0.8
    };

    // Simple regex-based analysis of flexbox usage in CSS
    if (css) {
      const flexboxMatches = css.match(/display:\s*flex/g) || [];
      const directionMatches = css.match(/flex-direction:\s*(row|column|row-reverse|column-reverse)/g) || [];
      const wrapMatches = css.match(/flex-wrap:\s*(wrap|nowrap|wrap-reverse)/g) || [];
      
      analysis.containers = flexboxMatches.map((_, index) => ({
        id: `flex-container-${index + 1}`,
        direction: directionMatches[index] ? directionMatches[index].split(':')[1].trim() : 'row',
        wrap: wrapMatches[index] ? wrapMatches[index].split(':')[1].trim() : 'nowrap',
        properties: ['display: flex']
      }));
      
      analysis.score = Math.min(1, analysis.containers.length * 0.2 + 0.6);
      
      if (analysis.containers.length > 0) {
        analysis.recommendations.push({
          type: 'accessibility',
          message: 'Consider adding focus management for flex containers',
          priority: 'medium'
        });
      }
    }
    
    res.json({
      success: true,
      ...analysis
    });
  } catch (error) {
    Logger.error('Flexbox analysis error', { operation: 'flexboxAnalysis' }, error);
    res.status(500).json({ 
      success: false,
      error: 'processing_error',
      message: 'Flexbox analysis failed', 
      details: { originalError: error.message }
    });
  }
});

module.exports = router;