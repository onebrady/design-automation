const express = require('express');
const { withDb } = require('../utils/database');

const router = express.Router();

// Import required modules - these need to exist for the endpoints to work
let semanticSystem;

try {
  // Import the correct class name
  const { SemanticUnderstandingSystem } = require('../../../packages/semantic');
  semanticSystem = new SemanticUnderstandingSystem();
} catch (err) {
  console.warn('SemanticUnderstandingSystem not available:', err.message);
}

// POST /api/semantic/detect-component-type
router.post('/detect-component-type', async (req, res) => {
  try {
    const { html, context, options } = req.body;
    
    // Validate required parameters
    if (!html) {
      return res.status(400).json({ 
        success: false,
        error: 'missing_field', 
        message: 'HTML is required',
        details: { field: 'html' }
      });
    }

    // Validate context structure if provided
    if (context && typeof context !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Context must be an object',
        details: { field: 'context', expected: 'object' }
      });
    }

    // Validate options structure if provided
    if (options && typeof options !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Options must be an object',
        details: { field: 'options', expected: 'object' }
      });
    }

    // Check if semantic system is available
    if (!semanticSystem) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Semantic analysis service is not available'
      });
    }

    // Detect component type
    const componentType = await semanticSystem.detectComponentType(html, context);
    
    // Add additional analysis if options request it
    const result = {
      success: true,
      type: componentType.type,
      confidence: componentType.confidence,
      metadata: componentType.metadata || {}
    };

    if (options?.detectVariants) {
      result.variants = componentType.variants || [];
    }

    if (options?.includeAccessibility) {
      result.accessibility = componentType.accessibility || {
        score: 'B',
        issues: [],
        suggestions: []
      };
    }

    if (options?.suggestImprovements) {
      result.improvements = componentType.improvements || [];
    }

    res.json(result);

  } catch (error) {
    console.error('Component type detection error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'processing_error', 
      message: 'Component type detection failed', 
      details: { originalError: error.message }
    });
  }
});

// POST /api/semantic/batch-analyze
router.post('/batch-analyze', async (req, res) => {
  try {
    const { files, options, projectPath } = req.body;
    
    // Validate required parameters
    if (!files) {
      return res.status(400).json({ 
        success: false,
        error: 'missing_field', 
        message: 'Files array is required',
        details: { field: 'files' }
      });
    }

    // Validate files is an array
    if (!Array.isArray(files)) {
      return res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Files must be an array',
        details: { field: 'files', expected: 'array' }
      });
    }

    // Validate each file has required structure
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.path) {
        return res.status(400).json({
          success: false,
          error: 'missing_field',
          message: `File at index ${i} is missing path`,
          details: { field: `files[${i}].path` }
        });
      }
      if (!file.html) {
        return res.status(400).json({
          success: false,
          error: 'missing_field',
          message: `File at index ${i} is missing HTML content`,
          details: { field: `files[${i}].html` }
        });
      }
    }

    // Validate options structure if provided
    if (options && typeof options !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Options must be an object',
        details: { field: 'options', expected: 'object' }
      });
    }

    // Check if semantic system is available
    if (!semanticSystem) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Semantic analysis service is not available'
      });
    }

    // Perform batch analysis
    const results = await semanticSystem.batchAnalyze(files, options || {});
    
    // Add summary information - ensure results is an array
    const resultsArray = Array.isArray(results) ? results : [results];
    const summary = {
      totalFiles: files.length,
      processedFiles: resultsArray.length,
      averageScore: resultsArray.length > 0 ? resultsArray.reduce((sum, r) => sum + (r.score?.numeric || 0), 0) / resultsArray.length : 0,
      commonIssues: [], // TODO: Extract common issues across files
      processingTime: results.processingTime || '0ms'
    };

    res.json({
      success: true,
      results: resultsArray,
      summary,
      projectPath,
      performance: {
        filesProcessed: resultsArray.length,
        averageTimePerFile: resultsArray.length > 0 ? `${(results.processingTime || 0) / resultsArray.length}ms` : '0ms',
        totalTime: `${results.processingTime || 0}ms`
      }
    });

  } catch (error) {
    console.error('Batch analysis error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'processing_error', 
      message: 'Batch analysis failed', 
      details: { originalError: error.message }
    });
  }
});

// POST /api/semantic/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { html, options = {} } = req.body;
    
    // Validate required parameters
    if (!html) {
      return res.status(400).json({ 
        success: false,
        error: 'missing_field', 
        message: 'HTML content is required',
        details: { field: 'html' }
      });
    }

    // Check if semantic system is available
    if (!semanticSystem) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Semantic analysis service is not available'
      });
    }

    const analysis = await semanticSystem.analyze(html, options);
    res.json({
      success: true,
      ...analysis
    });
  } catch (error) {
    console.error('Semantic analysis error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'processing_error', 
      message: 'Semantic analysis failed', 
      details: { originalError: error.message }
    });
  }
});

// POST /api/semantic/detect-components
router.post('/detect-components', async (req, res) => {
  try {
    const { html, options = {} } = req.body;
    
    if (!html) {
      return res.status(400).json({ 
        success: false,
        error: 'missing_field',
        message: 'HTML content is required',
        details: { field: 'html' }
      });
    }

    if (!semanticSystem) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Semantic analysis service is not available'
      });
    }

    const components = await semanticSystem.detectComponents(html, options);
    res.json({
      success: true,
      components: components || []
    });
  } catch (error) {
    console.error('Component detection error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'processing_error', 
      message: 'Component detection failed', 
      details: { originalError: error.message }
    });
  }
});

// POST /api/semantic/analyze-accessibility
router.post('/analyze-accessibility', async (req, res) => {
  try {
    const { html, options = {} } = req.body;
    
    if (!html) {
      return res.status(400).json({ 
        success: false,
        error: 'missing_field',
        message: 'HTML content is required',
        details: { field: 'html' }
      });
    }

    if (!semanticSystem) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Semantic analysis service is not available'
      });
    }

    const accessibility = await semanticSystem.analyzeAccessibility(html, options);
    res.json({
      success: true,
      ...accessibility
    });
  } catch (error) {
    console.error('Accessibility analysis error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'processing_error', 
      message: 'Accessibility analysis failed', 
      details: { originalError: error.message }
    });
  }
});

// POST /api/semantic/generate-aria
router.post('/generate-aria', async (req, res) => {
  try {
    const { html, componentAnalysis, options = {} } = req.body;
    
    if (!html) {
      return res.status(400).json({ 
        success: false,
        error: 'missing_field',
        message: 'HTML content is required',
        details: { field: 'html' }
      });
    }

    if (!semanticSystem) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Semantic analysis service is not available'
      });
    }

    const enhancements = await semanticSystem.generateAriaEnhancements(html, componentAnalysis, options);
    res.json({
      success: true,
      enhancements: enhancements || []
    });
  } catch (error) {
    console.error('ARIA generation error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'processing_error', 
      message: 'ARIA generation failed', 
      details: { originalError: error.message }
    });
  }
});

// POST /api/semantic/enhance-html
router.post('/enhance-html', async (req, res) => {
  try {
    const { html, options = {} } = req.body;
    
    if (!html) {
      return res.status(400).json({ 
        success: false,
        error: 'missing_field',
        message: 'HTML content is required',
        details: { field: 'html' }
      });
    }

    if (!semanticSystem) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Semantic analysis service is not available'
      });
    }

    const enhanced = await semanticSystem.getEnhancedHtml(html, options);
    res.json({
      success: true,
      ...enhanced
    });
  } catch (error) {
    console.error('HTML enhancement error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'processing_error', 
      message: 'HTML enhancement failed', 
      details: { originalError: error.message }
    });
  }
});

// POST /api/semantic/component-relationships
router.post('/component-relationships', async (req, res) => {
  try {
    const { html, componentAnalysis, options = {} } = req.body;
    
    if (!html) {
      return res.status(400).json({ 
        success: false,
        error: 'missing_field',
        message: 'HTML content is required',
        details: { field: 'html' }
      });
    }

    if (!semanticSystem) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Semantic analysis service is not available'
      });
    }

    const relationships = await semanticSystem.analyzeComponentRelationships(html, componentAnalysis);
    res.json({
      success: true,
      relationships: relationships || []
    });
  } catch (error) {
    console.error('Component relationships error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'processing_error', 
      message: 'Component relationships analysis failed', 
      details: { originalError: error.message }
    });
  }
});

// POST /api/semantic/score
router.post('/score', async (req, res) => {
  try {
    const { html, options = {} } = req.body;
    
    if (!html) {
      return res.status(400).json({ 
        success: false,
        error: 'missing_field',
        message: 'HTML content is required',
        details: { field: 'html' }
      });
    }

    if (!semanticSystem) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Semantic analysis service is not available'
      });
    }

    const score = await semanticSystem.getSemanticScore(html, options);
    res.json({
      success: true,
      ...score
    });
  } catch (error) {
    console.error('Semantic score error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'processing_error', 
      message: 'Semantic score calculation failed', 
      details: { originalError: error.message }
    });
  }
});

// POST /api/semantic/recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { html, options = {} } = req.body;
    
    if (!html) {
      return res.status(400).json({ 
        success: false,
        error: 'missing_field',
        message: 'HTML content is required',
        details: { field: 'html' }
      });
    }

    if (!semanticSystem) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Semantic analysis service is not available'
      });
    }

    const recommendations = await semanticSystem.getRecommendations(html, options);
    res.json({
      success: true,
      recommendations: recommendations || []
    });
  } catch (error) {
    console.error('Recommendations error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'processing_error', 
      message: 'Recommendations generation failed', 
      details: { originalError: error.message }
    });
  }
});

// POST /api/semantic/quick-accessibility-check
router.post('/quick-accessibility-check', async (req, res) => {
  try {
    const { html } = req.body;
    
    if (!html) {
      return res.status(400).json({ 
        success: false,
        error: 'missing_field',
        message: 'HTML content is required',
        details: { field: 'html' }
      });
    }

    if (!semanticSystem) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Semantic analysis service is not available'
      });
    }

    const check = await semanticSystem.quickAccessibilityCheck(html);
    res.json({
      success: true,
      ...check
    });
  } catch (error) {
    console.error('Quick accessibility check error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'processing_error', 
      message: 'Quick accessibility check failed', 
      details: { originalError: error.message }
    });
  }
});

module.exports = router;