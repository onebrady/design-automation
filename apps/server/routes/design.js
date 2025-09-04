const express = require('express');
const { withDb } = require('../utils/database');
const { resolveProjectContext } = require('../../../packages/discovery');
const { enhanceCss, enhanceCached } = require('../../../packages/engine');

const router = express.Router();

// Import required modules - these need to exist for the endpoints to work
let componentGenerator, patternEngine, previewSandbox, confidenceEngine;

try {
  // These modules may not exist yet, so we'll handle gracefully
  const { ComponentGenerator } = require('../../../packages/generator');
  componentGenerator = new ComponentGenerator();
} catch (err) {
  console.warn('ComponentGenerator not available:', err.message);
}

try {
  const { PatternLearningEngine } = require('../../../packages/patterns');
  patternEngine = new PatternLearningEngine();
} catch (err) {
  console.warn('PatternLearningEngine not available:', err.message);
}

try {
  const { PreviewSandbox } = require('../../../packages/preview');
  previewSandbox = new PreviewSandbox();
} catch (err) {
  console.warn('PreviewSandbox not available:', err.message);
}

try {
  const { ConfidenceEngine } = require('../../../packages/patterns');
  confidenceEngine = new ConfidenceEngine();
} catch (err) {
  console.warn('ConfidenceEngine not available:', err.message);
}

// POST /api/design/customize-template
router.post('/customize-template', async (req, res) => {
  try {
    const { templateId, customizations, brandPackId, framework, projectPath } = req.body;
    
    // Validate required parameters
    if (!templateId) {
      return res.status(400).json({ 
        success: false,
        error: 'missing_field', 
        message: 'Template ID is required',
        details: { field: 'templateId' }
      });
    }

    // Check if component generator is available
    if (!componentGenerator) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Component generator service is not available'
      });
    }

    // Get brand pack tokens if specified
    if (brandPackId) {
      const brandPack = await withDb(async (db) => {
        return await db.collection('brand_packs').findOne({ id: brandPackId });
      });
      
      if (brandPack?.tokens) {
        componentGenerator.setBrandTokens(brandPack.tokens);
      }
    }

    // Customize the template
    const result = await componentGenerator.customizeTemplate(templateId, customizations, {
      framework: framework || 'html',
      projectPath
    });

    res.json({ 
      success: true, 
      customizedComponent: result.component,
      appliedCustomizations: result.customizations,
      brandCompliance: result.brandCompliance || 0.85,
      templateId 
    });

  } catch (error) {
    console.error('Template customization error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'processing_error', 
      message: 'Template customization failed', 
      details: { originalError: error.message }
    });
  }
});

// POST /api/design/feedback
router.post('/feedback', async (req, res) => {
  try {
    const { projectId, enhancementId, feedback, context } = req.body;
    
    // Validate required parameters according to the expected format
    if (!projectId) {
      return res.status(400).json({ 
        success: false,
        error: 'missing_field', 
        message: 'Project ID is required',
        details: { field: 'projectId' }
      });
    }

    if (!enhancementId) {
      return res.status(400).json({ 
        success: false,
        error: 'missing_field', 
        message: 'Enhancement ID is required',
        details: { field: 'enhancementId' }
      });
    }

    if (!feedback) {
      return res.status(400).json({ 
        success: false,
        error: 'missing_field', 
        message: 'Feedback data is required',
        details: { field: 'feedback' }
      });
    }

    // Validate feedback structure
    if (typeof feedback !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Feedback must be an object',
        details: { field: 'feedback', expected: 'object' }
      });
    }

    // Check if pattern engine is available
    if (!patternEngine) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Pattern learning service is not available'
      });
    }
    
    // Record feedback in database
    await withDb(async (db) => {
      await patternEngine.recordFeedback(db, projectId, enhancementId, feedback, context);
    });
    
    res.json({ 
      success: true, 
      updated: true,
      message: 'Feedback recorded successfully' 
    });

  } catch (error) {
    console.error('Record feedback error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'processing_error', 
      message: 'Failed to record feedback', 
      details: { originalError: error.message }
    });
  }
});

// POST /api/design/suggest-improvements
router.post('/suggest-improvements', async (req, res) => {
  try {
    const { code, context, preferences, projectPath } = req.body;
    
    // Validate required parameters
    if (!code) {
      return res.status(400).json({ 
        success: false,
        error: 'missing_field', 
        message: 'Code is required',
        details: { field: 'code' }
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

    // Validate preferences structure if provided
    if (preferences && typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Preferences must be an object',
        details: { field: 'preferences', expected: 'object' }
      });
    }

    // Check if pattern engine is available
    if (!patternEngine) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Pattern learning service is not available'
      });
    }

    // For now, provide a basic response structure
    // TODO: Implement actual AI-powered improvement suggestions
    const suggestions = [
      {
        type: 'brand-compliance',
        property: 'color',
        current: 'hardcoded color values',
        suggested: 'brand token usage',
        reason: 'Improve consistency with design system',
        confidence: 0.85,
        impact: 'medium'
      }
    ];

    res.json({ 
      success: true,
      suggestions,
      confidence: 0.75,
      basedOn: 'heuristics',
      metadata: {
        codeAnalyzed: code.length,
        projectPath,
        contextProvided: !!context
      }
    });

  } catch (error) {
    console.error('Suggest improvements error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'processing_error', 
      message: 'Failed to generate improvement suggestions', 
      details: { originalError: error.message }
    });
  }
});

// POST /api/design/create-sandbox
router.post('/create-sandbox', async (req, res) => {
  try {
    const { html, css, javascript, framework, options } = req.body;
    
    // Validate required parameters
    if (!html) {
      return res.status(400).json({ 
        success: false,
        error: 'missing_field', 
        message: 'HTML is required',
        details: { field: 'html' }
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

    // Check if preview sandbox is available
    if (!previewSandbox) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Preview sandbox service is not available'
      });
    }

    // Create sandbox with provided code
    const sandboxData = {
      html,
      css: css || '',
      javascript: javascript || '',
      framework: framework || 'vanilla',
      options: options || {}
    };

    const sandbox = previewSandbox.createSandbox(sandboxData);
    
    res.json({
      success: true,
      sandbox: {
        id: sandbox.id,
        url: `http://localhost:3000/sandbox/${sandbox.id}`,
        editUrl: `http://localhost:3000/sandbox/${sandbox.id}/edit`,
        previewUrl: `http://localhost:3000/sandbox/${sandbox.id}/preview`,
        status: 'active',
        createdAt: sandbox.created || new Date().toISOString(),
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() // 12 hours
      },
      capabilities: {
        liveReload: options?.liveReload !== false,
        hotModuleReplacement: framework !== 'vanilla',
        responsivePreview: true,
        codeEditing: true
      }
    });

  } catch (error) {
    console.error('Sandbox creation error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'processing_error', 
      message: 'Sandbox creation failed', 
      details: { originalError: error.message }
    });
  }
});

// POST /api/design/analyze
router.post('/analyze', async (req, res) => {
  try {
    const { code = '' } = req.body;
    const metrics = {
      tokenAdherence: 0, // placeholder
      contrastAA: 1, // not computed here
      typeScaleFit: 1,
      spacingConsistency: 1,
      patternEffectiveness: 0,
      size: { rawBytes: Buffer.byteLength(code, 'utf8') }
    };
    res.json({ metrics, issues: [], opportunities: [], patterns: {}, size: metrics.size });
  } catch (error) {
    console.error('Design analysis error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'processing_error', 
      message: 'Design analysis failed', 
      details: { originalError: error.message }
    });
  }
});

// POST /api/design/enhance
router.post('/enhance', async (req, res) => {
  try {
    const { code = '', codeType = 'css', brandPackId = '', projectPath = process.cwd(), tokens = {} } = req.body;
    
    console.log('Request brandPackId:', brandPackId, 'projectPath:', projectPath);
    
    if (codeType !== 'css') {
      return res.status(400).json({ 
        success: false,
        error: 'unsupported_codeType',
        message: `Code type '${codeType}' not supported`,
        supported: ['css']
      });
    }
    
    // Resolve brand pack tokens using discovery system or explicit brandPackId
    let resolvedTokens = tokens;
    if (!Object.keys(resolvedTokens).length) {
      try {
        let resolvedBrandPackId = brandPackId;
        
        // If no explicit brandPackId, use discovery system
        if (!resolvedBrandPackId) {
          console.log('Using discovery system for projectPath:', projectPath);
          const context = await resolveProjectContext(projectPath);
          console.log('Discovery context:', JSON.stringify(context, null, 2));
          resolvedBrandPackId = context.brandPack?.id;
          console.log('Resolved brand pack ID:', resolvedBrandPackId);
        }
        
        // Fetch brand pack tokens from MongoDB
        if (resolvedBrandPackId) {
          console.log('Fetching tokens for brand pack:', resolvedBrandPackId);
          await withDb(async (db) => {
            const brandPack = await db.collection('brand_packs').findOne(
              { id: resolvedBrandPackId }, 
              { projection: { tokens: 1 } }
            );
            console.log('Found brand pack:', !!brandPack, 'has tokens:', !!brandPack?.tokens);
            if (brandPack?.tokens) {
              resolvedTokens = brandPack.tokens;
              console.log('Loaded tokens, color roles count:', Object.keys(brandPack.tokens?.colors?.roles || {}).length);
            }
          });
        }
      } catch (err) {
        console.warn('Could not resolve brand pack tokens:', err.message);
      }
    }
    
    console.log('About to call enhanceCss with tokens keys:', Object.keys(resolvedTokens));
    const result = enhanceCss({ code, tokens: resolvedTokens });
    console.log('Enhancement result - changes:', result.changes.length);
    
    res.json({ 
      success: true,
      code: result.code, 
      changes: result.changes, 
      metricsDelta: {}, 
      brandCompliance: {} 
    });
    
  } catch (error) {
    console.error('CSS enhancement error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'processing_error', 
      message: 'CSS enhancement failed', 
      details: { originalError: error.message }
    });
  }
});

// POST /api/design/enhance-cached
router.post('/enhance-cached', async (req, res) => {
  try {
    const { 
      code = '', 
      codeType = 'css', 
      componentType = '', 
      brandPackId = '', 
      projectPath = process.cwd(),
      tokens = {},
      filePath = '',
      brandVersion = ''
    } = req.body;
    
    console.log('Request brandPackId:', brandPackId, 'projectPath:', projectPath);
    
    // Support both CSS and HTML content types
    if (!['css', 'html'].includes(codeType)) {
      return res.status(400).json({ 
        success: false,
        error: 'unsupported_codeType',
        message: `Code type '${codeType}' not supported`,
        supported: ['css', 'html']
      });
    }
    
    // Resolve brand pack tokens using discovery system or explicit brandPackId
    let resolvedTokens = tokens;
    let resolvedBrandPackId = brandPackId;
    if (!Object.keys(resolvedTokens).length) {
      try {
        // If no explicit brandPackId, use discovery system
        if (!resolvedBrandPackId) {
          console.log('Using discovery system for projectPath:', projectPath);
          const context = await resolveProjectContext(projectPath);
          console.log('Discovery context:', JSON.stringify(context, null, 2));
          resolvedBrandPackId = context.brandPack?.id;
          console.log('Resolved brand pack ID:', resolvedBrandPackId);
        }
        
        // Fetch brand pack tokens from MongoDB
        if (resolvedBrandPackId) {
          console.log('Fetching tokens for brand pack:', resolvedBrandPackId);
          await withDb(async (db) => {
            const brandPack = await db.collection('brand_packs').findOne(
              { id: resolvedBrandPackId }, 
              { projection: { tokens: 1 } }
            );
            console.log('Found brand pack:', !!brandPack, 'has tokens:', !!brandPack?.tokens);
            if (brandPack?.tokens) {
              resolvedTokens = brandPack.tokens;
              console.log('Loaded tokens, color roles count:', Object.keys(brandPack.tokens?.colors?.roles || {}).length);
            }
          });
        }
      } catch (err) {
        console.warn('Could not resolve brand pack tokens:', err.message);
      }
    }
    
    // Handle HTML by extracting and enhancing embedded CSS
    let enhancedCode = code;
    let changes = [];
    let cacheHit = false;
    
    if (codeType === 'html') {
      // Extract CSS from HTML (style tags and inline styles)
      const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
      const matches = [...code.matchAll(styleRegex)];
      
      if (matches.length > 0) {
        enhancedCode = code;
        for (const match of matches) {
          const cssContent = match[1];
          try {
            const enhanced = await enhanceCached({ 
              code: cssContent, 
              tokens: resolvedTokens, 
              filePath, 
              brandPackId: resolvedBrandPackId, 
              brandVersion, 
              componentType 
            });
            if (enhanced && enhanced.code) {
              enhancedCode = enhancedCode.replace(match[0], `<style>${enhanced.code}</style>`);
              changes = changes.concat(enhanced.changes || []);
              cacheHit = enhanced.cacheHit || false;
            }
          } catch (err) {
            console.warn('Failed to enhance CSS in HTML:', err.message);
          }
        }
      }
    } else {
      // CSS enhancement
      const out = await enhanceCached({ 
        code, 
        tokens: resolvedTokens, 
        filePath, 
        brandPackId: resolvedBrandPackId, 
        brandVersion, 
        componentType 
      });
      enhancedCode = out.code;
      changes = out.changes;
      cacheHit = out.cacheHit;
    }
    
    res.json({ 
      success: true,
      code: enhancedCode, 
      changes, 
      cacheHit, 
      patternsApplied: [] 
    });
    
  } catch (error) {
    console.error('Cached enhancement error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'processing_error', 
      message: 'Cached enhancement failed', 
      details: { originalError: error.message }
    });
  }
});

// POST /api/design/suggest-proactive
router.post('/suggest-proactive', async (req, res) => {
  try {
    const { code = '', componentType = '', tokens = {} } = req.body;
    
    const suggestions = [];
    let confidence = 0.0;
    
    // Heuristic: map padding pairs like 16px 32px to spacing tokens md/lg
    const m = /padding\s*:\s*([0-9.]+px)\s+([0-9.]+px)/.exec(code);
    if (m) {
      const mapPx = (px) => {
        const n = parseFloat(px);
        if (Math.abs(n - 16) <= 0.8) return { token: 'var(--spacing-md)', conf: 0.92 };
        if (Math.abs(n - 32) <= 1.6) return { token: 'var(--spacing-lg)', conf: 0.9 };
        if (Math.abs(n - 8) <= 0.4) return { token: 'var(--spacing-sm)', conf: 0.85 };
        return { token: null, conf: 0.5 };
      };
      const a = mapPx(m[1]);
      const b = mapPx(m[2]);
      if (a.token && b.token) {
        confidence = Math.min(a.conf, b.conf);
        suggestions.push({
          type: 'spacing-token',
          target: 'padding',
          suggestedToken: `${a.token} ${b.token}`,
          confidence,
          basedOn: 'heuristics'
        });
      }
    }
    
    // Gating: suppress <0.8; 0.8–0.9 advisory; ≥0.9 eligible (still advisory for non-safe classes)
    const gated = suggestions.filter((s) => s.confidence >= 0.8);
    
    res.json({ 
      success: true,
      suggestions: gated, 
      confidence: confidence || 0.0, 
      basedOn: 'heuristics' 
    });
    
  } catch (error) {
    console.error('Proactive suggestions error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'processing_error', 
      message: 'Proactive suggestions failed', 
      details: { originalError: error.message }
    });
  }
});

module.exports = router;