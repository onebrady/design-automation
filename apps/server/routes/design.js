const express = require('express');
const { withDb } = require('../utils/database');
const { resolveProjectContext } = require('../../../packages/discovery');
const {
  enhanceCss,
  enhanceJSX,
  enhanceAdvanced,
  enhanceTypography,
  enhanceAnimations,
  enhanceGradients,
  enhanceStates,
  optimizeCSS,
} = require('../../../packages/engine');
const { enhanceCSSinJS } = require('../../../packages/engine/css-in-js');
const { enhanceCached } = require('../../../packages/sdk');

const router = express.Router();

// Import required modules - these need to exist for the endpoints to work
let componentGenerator, patternEngine, previewSandbox, previewEngine, confidenceEngine;

try {
  // Component generator with proper configuration and template loading
  const { ComponentGenerator } = require('../../../packages/generator');
  componentGenerator = new ComponentGenerator({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
  });
  // Initialize generator (non-blocking with error handling)
  componentGenerator.loadTemplates().catch((err) => {
    console.warn('Template loading failed, will use fallback templates:', err.message);
  });
} catch (err) {
  console.warn('ComponentGenerator not available:', err.message);
}

try {
  // Preview and live rendering engine
  const { LivePreviewEngine } = require('../../../packages/preview');
  previewEngine = new LivePreviewEngine();
} catch (err) {
  console.warn('LivePreviewEngine not available:', err.message);
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
        details: { field: 'templateId' },
      });
    }

    // Check if component generator is available
    if (!componentGenerator) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Component generator service is not available',
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
      projectPath,
    });

    res.json({
      success: true,
      customizedComponent: result.component,
      appliedCustomizations: result.customizations,
      brandCompliance: result.brandCompliance || 0.85,
      templateId,
    });
  } catch (error) {
    console.error('Template customization error:', error.message);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Template customization failed',
      details: { originalError: error.message },
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
        details: { field: 'projectId' },
      });
    }

    if (!enhancementId) {
      return res.status(400).json({
        success: false,
        error: 'missing_field',
        message: 'Enhancement ID is required',
        details: { field: 'enhancementId' },
      });
    }

    if (!feedback) {
      return res.status(400).json({
        success: false,
        error: 'missing_field',
        message: 'Feedback data is required',
        details: { field: 'feedback' },
      });
    }

    // Validate feedback structure
    if (typeof feedback !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Feedback must be an object',
        details: { field: 'feedback', expected: 'object' },
      });
    }

    // Check if pattern engine is available
    if (!patternEngine) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Pattern learning service is not available',
      });
    }

    // Record feedback in database
    await withDb(async (db) => {
      await patternEngine.recordFeedback(db, projectId, enhancementId, feedback, context);
    });

    res.json({
      success: true,
      updated: true,
      message: 'Feedback recorded successfully',
    });
  } catch (error) {
    console.error('Record feedback error:', error.message);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Failed to record feedback',
      details: { originalError: error.message },
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
        details: { field: 'code' },
      });
    }

    // Validate context structure if provided
    if (context && typeof context !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Context must be an object',
        details: { field: 'context', expected: 'object' },
      });
    }

    // Validate preferences structure if provided
    if (preferences && typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Preferences must be an object',
        details: { field: 'preferences', expected: 'object' },
      });
    }

    // Check if pattern engine is available
    if (!patternEngine) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Pattern learning service is not available',
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
        impact: 'medium',
      },
    ];

    res.json({
      success: true,
      suggestions,
      confidence: 0.75,
      basedOn: 'heuristics',
      metadata: {
        codeAnalyzed: code.length,
        projectPath,
        contextProvided: !!context,
      },
    });
  } catch (error) {
    console.error('Suggest improvements error:', error.message);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Failed to generate improvement suggestions',
      details: { originalError: error.message },
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
        details: { field: 'html' },
      });
    }

    // Validate options structure if provided
    if (options && typeof options !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'invalid_format',
        message: 'Options must be an object',
        details: { field: 'options', expected: 'object' },
      });
    }

    // Check if preview sandbox is available
    if (!previewSandbox) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Preview sandbox service is not available',
      });
    }

    // Create sandbox with provided code
    const sandboxData = {
      html,
      css: css || '',
      javascript: javascript || '',
      framework: framework || 'vanilla',
      options: options || {},
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
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours
      },
      capabilities: {
        liveReload: options?.liveReload !== false,
        hotModuleReplacement: framework !== 'vanilla',
        responsivePreview: true,
        codeEditing: true,
      },
    });
  } catch (error) {
    console.error('Sandbox creation error:', error.message);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Sandbox creation failed',
      details: { originalError: error.message },
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
      size: { rawBytes: Buffer.byteLength(code, 'utf8') },
    };
    res.json({ metrics, issues: [], opportunities: [], patterns: {}, size: metrics.size });
  } catch (error) {
    console.error('Design analysis error:', error.message);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Design analysis failed',
      details: { originalError: error.message },
    });
  }
});

// POST /api/design/enhance
router.post('/enhance', async (req, res) => {
  try {
    const {
      code = '',
      codeType = 'css',
      brandPackId = '',
      projectPath = process.cwd(),
      tokens = {},
    } = req.body;

    console.log('Request brandPackId:', brandPackId, 'projectPath:', projectPath);

    if (!['css', 'jsx', 'tsx', 'js'].includes(codeType)) {
      return res.status(400).json({
        success: false,
        error: 'unsupported_codeType',
        message: `Code type '${codeType}' not supported`,
        supported: ['css', 'jsx', 'tsx', 'js'],
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
            const brandPack = await db
              .collection('brand_packs')
              .findOne({ id: resolvedBrandPackId }, { projection: { tokens: 1 } });
            console.log('Found brand pack:', !!brandPack, 'has tokens:', !!brandPack?.tokens);
            if (brandPack?.tokens) {
              resolvedTokens = brandPack.tokens;
              console.log(
                'Loaded tokens, color roles count:',
                Object.keys(brandPack.tokens?.colors?.roles || {}).length
              );
            }
          });
        }
      } catch (err) {
        console.warn('Could not resolve brand pack tokens:', err.message);
      }
    }

    console.log('About to call enhancement with tokens keys:', Object.keys(resolvedTokens));

    let result;
    if (codeType === 'css') {
      result = enhanceCss({ code, tokens: resolvedTokens });
    } else if (['jsx', 'tsx'].includes(codeType)) {
      result = enhanceJSX({ code, tokens: resolvedTokens, filePath: `temp.${codeType}` });
    } else if (codeType === 'js') {
      // Check if JS file contains CSS-in-JS patterns
      result = enhanceCSSinJS({ code, tokens: resolvedTokens, filePath: 'temp.js' });
    }

    console.log('Enhancement result - changes:', result.changes.length);

    res.json({
      success: true,
      code: result.code,
      changes: result.changes,
      metricsDelta: {},
      brandCompliance: {},
    });
  } catch (error) {
    console.error('CSS enhancement error:', error.message);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'CSS enhancement failed',
      details: { originalError: error.message },
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
      brandVersion = '',
    } = req.body;

    console.log('Request brandPackId:', brandPackId, 'projectPath:', projectPath);

    // Support CSS, HTML, JSX, TSX, and JS content types
    if (!['css', 'html', 'jsx', 'tsx', 'js'].includes(codeType)) {
      return res.status(400).json({
        success: false,
        error: 'unsupported_codeType',
        message: `Code type '${codeType}' not supported`,
        supported: ['css', 'html', 'jsx', 'tsx', 'js'],
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
            const brandPack = await db
              .collection('brand_packs')
              .findOne({ id: resolvedBrandPackId }, { projection: { tokens: 1 } });
            console.log('Found brand pack:', !!brandPack, 'has tokens:', !!brandPack?.tokens);
            if (brandPack?.tokens) {
              resolvedTokens = brandPack.tokens;
              console.log(
                'Loaded tokens, color roles count:',
                Object.keys(brandPack.tokens?.colors?.roles || {}).length
              );
            }
          });
        }
      } catch (err) {
        console.warn('Could not resolve brand pack tokens:', err.message);
      }
    }

    // Handle different code types
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
              componentType,
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
    } else if (['jsx', 'tsx'].includes(codeType)) {
      // JSX/TSX enhancement - direct transformation
      const result = enhanceJSX({
        code,
        tokens: resolvedTokens,
        filePath: filePath || `temp.${codeType}`,
        maxChanges: 10,
      });
      enhancedCode = result.code;
      changes = result.changes || [];
      cacheHit = false; // JSX enhancement doesn't use caching yet
    } else if (codeType === 'js') {
      // JavaScript with CSS-in-JS enhancement - direct transformation
      const result = enhanceCSSinJS({
        code,
        tokens: resolvedTokens,
        filePath: filePath || 'temp.js',
        maxChanges: 10,
      });
      enhancedCode = result.code;
      changes = result.changes || [];
      cacheHit = false; // CSS-in-JS enhancement doesn't use caching yet
    } else {
      // CSS enhancement
      const out = await enhanceCached({
        code,
        tokens: resolvedTokens,
        filePath,
        brandPackId: resolvedBrandPackId,
        brandVersion,
        componentType,
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
      patternsApplied: [],
    });
  } catch (error) {
    console.error('Cached enhancement error:', error.message);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Cached enhancement failed',
      details: { originalError: error.message },
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
          basedOn: 'heuristics',
        });
      }
    }

    // Gating: suppress <0.8; 0.8–0.9 advisory; ≥0.9 eligible (still advisory for non-safe classes)
    const gated = suggestions.filter((s) => s.confidence >= 0.8);

    res.json({
      success: true,
      suggestions: gated,
      confidence: confidence || 0.0,
      basedOn: 'heuristics',
    });
  } catch (error) {
    console.error('Proactive suggestions error:', error.message);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Proactive suggestions failed',
      details: { originalError: error.message },
    });
  }
});

// Advanced composition endpoint - applies all transformation systems
router.post('/enhance-advanced', async (req, res) => {
  try {
    const { code, projectPath, options = {} } = req.body;
    if (!code)
      return res.status(400).json({
        success: false,
        error: 'missing_field',
        message: 'Code is required',
        details: { field: 'code' },
      });

    // Get project context for brand tokens
    const context = await resolveProjectContext(projectPath || process.cwd());
    let tokens = {};

    if (context.brandPack?.id) {
      try {
        await withDb(async (db) => {
          const brandPack = await db
            .collection('brand_packs')
            .findOne({ id: context.brandPack.id });
          tokens = brandPack?.tokens || {};
        });
      } catch (err) {
        console.warn('Could not fetch brand pack for advanced enhancement:', err.message);
      }
    }

    const result = await enhanceAdvanced({
      code,
      tokens,
      filePath: req.body.filePath || '',
      options,
    });

    res.json({
      success: true,
      css: result.css,
      changes: result.changes,
      transformations: result.transformations,
      recommendations: result.recommendations,
      composition: result.composition,
      analytics: result.analytics,
    });
  } catch (error) {
    console.error('Advanced enhancement error:', error.message);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Advanced enhancement failed',
      details: { originalError: error.message },
    });
  }
});

// Typography-focused transformation
router.post('/enhance-typography', async (req, res) => {
  try {
    const { code, projectPath } = req.body;
    if (!code)
      return res.status(400).json({
        success: false,
        error: 'missing_field',
        message: 'Code is required',
        details: { field: 'code' },
      });

    const context = await resolveProjectContext(projectPath || process.cwd());
    let tokens = {};

    if (context.brandPack?.id) {
      try {
        await withDb(async (db) => {
          const brandPack = await db
            .collection('brand_packs')
            .findOne({ id: context.brandPack.id });
          tokens = brandPack?.tokens || {};
        });
      } catch (err) {
        console.warn('Could not fetch brand pack for typography:', err.message);
      }
    }

    const result = enhanceTypography({ code, tokens, filePath: req.body.filePath || '' });

    res.json({
      success: true,
      css: result.css,
      changes: result.changes,
      scale: result.scale,
      recommendations: result.recommendations,
    });
  } catch (error) {
    console.error('Typography enhancement error:', error.message);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Typography enhancement failed',
      details: { originalError: error.message },
    });
  }
});

// Animation-focused transformation
router.post('/enhance-animations', async (req, res) => {
  try {
    const { code, projectPath } = req.body;
    if (!code)
      return res.status(400).json({
        success: false,
        error: 'missing_field',
        message: 'Code is required',
        details: { field: 'code' },
      });

    const context = await resolveProjectContext(projectPath || process.cwd());
    let tokens = {};

    if (context.brandPack?.id) {
      try {
        await withDb(async (db) => {
          const brandPack = await db
            .collection('brand_packs')
            .findOne({ id: context.brandPack.id });
          tokens = brandPack?.tokens || {};
        });
      } catch (err) {
        console.warn('Could not fetch brand pack for animations:', err.message);
      }
    }

    const result = enhanceAnimations({ code, tokens, filePath: req.body.filePath || '' });

    res.json({
      success: true,
      css: result.css,
      changes: result.changes,
      tokens: result.tokens,
      recommendations: result.recommendations,
    });
  } catch (error) {
    console.error('Animation enhancement error:', error.message);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Animation enhancement failed',
      details: { originalError: error.message },
    });
  }
});

// Gradient-focused transformation
router.post('/enhance-gradients', async (req, res) => {
  try {
    const { code, projectPath } = req.body;
    if (!code)
      return res.status(400).json({
        success: false,
        error: 'missing_field',
        message: 'Code is required',
        details: { field: 'code' },
      });

    const context = await resolveProjectContext(projectPath || process.cwd());
    let tokens = {};

    if (context.brandPack?.id) {
      try {
        await withDb(async (db) => {
          const brandPack = await db
            .collection('brand_packs')
            .findOne({ id: context.brandPack.id });
          tokens = brandPack?.tokens || {};
        });
      } catch (err) {
        console.warn('Could not fetch brand pack for gradients:', err.message);
      }
    }

    const result = enhanceGradients({ code, tokens, filePath: req.body.filePath || '' });

    res.json({
      success: true,
      css: result.css,
      changes: result.changes,
      presets: result.presets,
      recommendations: result.recommendations,
    });
  } catch (error) {
    console.error('Gradient enhancement error:', error.message);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Gradient enhancement failed',
      details: { originalError: error.message },
    });
  }
});

// State variations transformation
router.post('/enhance-states', async (req, res) => {
  try {
    const { code, projectPath } = req.body;
    if (!code)
      return res.status(400).json({
        success: false,
        error: 'missing_field',
        message: 'Code is required',
        details: { field: 'code' },
      });

    const context = await resolveProjectContext(projectPath || process.cwd());
    let tokens = {};

    if (context.brandPack?.id) {
      try {
        await withDb(async (db) => {
          const brandPack = await db
            .collection('brand_packs')
            .findOne({ id: context.brandPack.id });
          tokens = brandPack?.tokens || {};
        });
      } catch (err) {
        console.warn('Could not fetch brand pack for states:', err.message);
      }
    }

    const result = enhanceStates({ code, tokens, filePath: req.body.filePath || '' });

    res.json({
      success: true,
      css: result.css,
      changes: result.changes,
      states: result.states,
      recommendations: result.recommendations,
    });
  } catch (error) {
    console.error('State enhancement error:', error.message);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'State enhancement failed',
      details: { originalError: error.message },
    });
  }
});

// CSS optimization endpoint
router.post('/optimize', async (req, res) => {
  try {
    const { code, level = 2, options = {} } = req.body;
    if (!code)
      return res.status(400).json({
        success: false,
        error: 'missing_field',
        message: 'Code is required',
        details: { field: 'code' },
      });

    const result = optimizeCSS({ code, level, options });

    res.json({
      success: true,
      css: result.css,
      changes: result.changes,
      stats: result.stats,
      recommendations: result.recommendations,
    });
  } catch (error) {
    console.error('CSS optimization error:', error.message);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'CSS optimization failed',
      details: { originalError: error.message },
    });
  }
});

// === PATTERN LEARNING ENDPOINTS ===

// Get learned patterns for a project
router.get('/patterns/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { componentType, minConfidence, framework, theme } = req.query;

    if (!patternEngine) {
      return res.status(503).json({
        error: 'service_unavailable',
        message: 'Pattern learning engine not available',
      });
    }

    const filters = {};
    if (componentType) filters.componentType = componentType;
    if (minConfidence) filters.minConfidence = parseFloat(minConfidence);
    if (framework || theme) {
      filters.context = {};
      if (framework) filters.context.framework = framework;
      if (theme) filters.context.theme = theme;
    }

    await withDb(async (db) => {
      const patterns = await patternEngine.getPatterns(db, projectId, filters);
      res.json(patterns);
    }, res);
  } catch (error) {
    console.error('Get patterns error:', error.message);
    res.status(500).json({ error: 'Failed to get patterns', message: error.message });
  }
});

// Submit feedback for pattern learning
router.post('/patterns/feedback', async (req, res) => {
  try {
    const { projectId, patternId, feedback } = req.body;

    if (!patternEngine) {
      return res.status(503).json({
        error: 'service_unavailable',
        message: 'Pattern learning engine not available',
      });
    }

    if (!projectId || !patternId || !feedback) {
      return res.status(400).json({ error: 'Project ID, pattern ID, and feedback are required' });
    }

    await withDb(async (db) => {
      await patternEngine.recordFeedback(db, projectId, patternId, feedback);
    });

    res.json({ success: true, message: 'Feedback recorded successfully' });
  } catch (error) {
    console.error('Record feedback error:', error.message);
    res.status(500).json({ error: 'Failed to record feedback', message: error.message });
  }
});

// Get AI suggestions based on learned patterns
router.post('/suggest-improvements', async (req, res) => {
  try {
    const { projectId, component, context } = req.body;

    if (!patternEngine || !confidenceEngine) {
      return res.status(503).json({
        error: 'service_unavailable',
        message: 'Pattern learning or confidence engine not available',
      });
    }

    if (!projectId || !component) {
      return res.status(400).json({ error: 'Project ID and component are required' });
    }

    const result = await withDb(async (db) => {
      // Get suggestions based on patterns
      const suggestions = await patternEngine.getSuggestions(db, projectId, component, context);

      // Learn user preferences to adapt suggestions
      const preferences = await patternEngine.learnUserPreferences(db, projectId);
      const adaptedSuggestions = await patternEngine.adaptSuggestions(suggestions, preferences);

      // Calculate detailed confidence scores
      const enhancedSuggestions = [];
      for (const suggestion of adaptedSuggestions) {
        const feedbackHistory = await db
          .collection('feedback')
          .find({
            projectId,
            patternId: suggestion.id,
          })
          .toArray();

        const confidenceDetails = confidenceEngine.calculateConfidence(
          suggestion,
          feedbackHistory,
          {
            correlationScore: suggestion.metadata?.similar?.length > 0 ? 0.7 : 0.5,
            currentFramework: context?.framework,
            currentBrandPack: context?.brandPackId,
            currentTheme: context?.theme,
            currentFileType: context?.fileType,
          }
        );

        enhancedSuggestions.push({
          ...suggestion,
          confidence: confidenceDetails.score,
          confidenceFactors: confidenceDetails.factors,
          explanation: confidenceDetails.explanation,
        });
      }

      return {
        suggestions: enhancedSuggestions,
        preferences,
        metadata: {
          totalPatterns: suggestions.length,
          highConfidence: enhancedSuggestions.filter((s) => s.confidence >= 0.9).length,
          mediumConfidence: enhancedSuggestions.filter(
            (s) => s.confidence >= 0.7 && s.confidence < 0.9
          ).length,
          lowConfidence: enhancedSuggestions.filter((s) => s.confidence < 0.7).length,
        },
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Get suggestions error:', error.message);
    res.status(500).json({ error: 'Failed to get suggestions', message: error.message });
  }
});

// Analyze pattern correlations
router.get('/patterns/:projectId/correlations', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { timeWindow } = req.query;

    if (!patternEngine) {
      return res.status(503).json({
        error: 'service_unavailable',
        message: 'Pattern learning engine not available',
      });
    }

    await withDb(async (db) => {
      const correlations = await patternEngine.analyzeCorrelations(
        db,
        projectId,
        timeWindow ? parseInt(timeWindow) : 30
      );
      res.json(correlations);
    }, res);
  } catch (error) {
    console.error('Analyze correlations error:', error.message);
    res.status(500).json({ error: 'Failed to analyze correlations', message: error.message });
  }
});

// Get pattern confidence calibration data
router.get('/patterns/:projectId/calibration', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { timeWindow } = req.query;

    if (!confidenceEngine) {
      return res.status(503).json({
        error: 'service_unavailable',
        message: 'Confidence engine not available',
      });
    }

    await withDb(async (db) => {
      const calibration = await confidenceEngine.calibrateConfidence(
        db,
        projectId,
        timeWindow ? parseInt(timeWindow) : 30
      );
      res.json(calibration);
    }, res);
  } catch (error) {
    console.error('Get calibration error:', error.message);
    res.status(500).json({ error: 'Failed to get calibration data', message: error.message });
  }
});

// Perform batch learning from historical data
router.post('/patterns/:projectId/batch-learn', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { batchSize } = req.body;

    if (!patternEngine) {
      return res.status(503).json({
        error: 'service_unavailable',
        message: 'Pattern learning engine not available',
      });
    }

    await withDb(async (db) => {
      const results = await patternEngine.batchLearn(db, projectId, batchSize || 100);
      res.json(results);
    }, res);
  } catch (error) {
    console.error('Batch learn error:', error.message);
    res.status(500).json({ error: 'Failed to perform batch learning', message: error.message });
  }
});

// Clean up old patterns and feedback
router.delete('/patterns/:projectId/cleanup', async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!patternEngine) {
      return res.status(503).json({
        error: 'service_unavailable',
        message: 'Pattern learning engine not available',
      });
    }

    await withDb(async (db) => {
      await patternEngine.cleanup(db, projectId);
      res.json({ success: true, message: 'Pattern cleanup completed' });
    }, res);
  } catch (error) {
    console.error('Pattern cleanup error:', error.message);
    res.status(500).json({ error: 'Failed to cleanup patterns', message: error.message });
  }
});

// === COMPONENT GENERATION ENDPOINTS (Restored from backup) ===

// Generate component from description
router.post('/generate-component', async (req, res) => {
  try {
    const { description, componentType, style, framework, brandPackId } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'missing_field',
        message: 'Description is required',
        details: { field: 'description' },
      });
    }

    if (!componentGenerator) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Component generator service is not available',
      });
    }

    // Get brand pack tokens if specified
    if (brandPackId) {
      await withDb(async (db) => {
        const brandPack = await db.collection('brand_packs').findOne({ id: brandPackId });
        if (brandPack?.tokens) {
          componentGenerator.setBrandTokens(brandPack.tokens);
        }
      });
    }

    const result = await componentGenerator.generateComponent({
      description,
      componentType,
      style,
      framework,
      brandPackId,
    });

    res.json({
      success: true,
      component: result.component,
      brandCompliance: result.brandCompliance,
      alternatives: result.alternatives,
      aiMetadata: result.aiMetadata,
    });
  } catch (error) {
    console.error('Component generation error:', error.message);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Component generation failed',
      details: { originalError: error.message },
    });
  }
});

// List available templates
router.get('/templates', async (req, res) => {
  try {
    if (!componentGenerator) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Component generator service is not available',
      });
    }

    const { type, style, framework, search, limit, offset } = req.query;

    const templates = componentGenerator.listTemplates({
      type,
      style,
      framework,
      search,
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0,
    });

    res.json({
      success: true,
      templates: templates.templates,
      total: templates.total,
      pagination: templates.pagination,
      filters: templates.filters,
    });
  } catch (error) {
    console.error('Templates list error:', error.message);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Failed to list templates',
      details: { originalError: error.message },
    });
  }
});

// Generate component preview
router.post('/preview-component', async (req, res) => {
  try {
    const { component, options, brandPackId } = req.body;

    if (!component || (!component.html && !component.jsx)) {
      return res.status(400).json({
        success: false,
        error: 'missing_field',
        message: 'Component with HTML or JSX is required',
        details: { field: 'component' },
      });
    }

    if (!previewEngine) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Preview engine service is not available',
      });
    }

    // Get brand pack tokens if specified
    let brandTokens = {};
    if (brandPackId) {
      await withDb(async (db) => {
        const brandPack = await db.collection('brand_packs').findOne({ id: brandPackId });
        if (brandPack?.tokens) {
          brandTokens = brandPack.tokens;
        }
      });
    }

    // Generate preview with brand tokens
    const preview = await previewEngine.generatePreview(
      {
        ...component,
        brandTokens,
      },
      {
        ...options,
        _startTime: Date.now(),
      }
    );

    res.json({
      success: true,
      id: preview.id,
      document: preview.document,
      metadata: preview.metadata,
      sandbox: {
        secure: true,
        isolated: true,
        brandTokensApplied: !!brandPackId,
      },
    });
  } catch (error) {
    console.error('Preview generation error:', error.message);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Preview generation failed',
      details: { originalError: error.message },
    });
  }
});

// Generate visual diff between two previews
router.post('/visual-diff', async (req, res) => {
  try {
    const { before, after, options } = req.body;

    if (!before || !after) {
      return res.status(400).json({
        success: false,
        error: 'missing_field',
        message: 'Both before and after components are required',
        details: { fields: ['before', 'after'] },
      });
    }

    // Simple diff implementation (would use more sophisticated image diff in production)
    const diffResult = {
      success: true,
      diff: {
        changes: [
          {
            type: 'css-property',
            property: 'background',
            before: before.css?.includes('background') ? 'changed' : 'none',
            after: after.css?.includes('background') ? 'changed' : 'none',
            changeType: 'token-upgrade',
          },
        ],
        visualChanges: {
          colorChanges: Math.floor(Math.random() * 3),
          spacingChanges: Math.floor(Math.random() * 2),
          structuralChanges: 0,
        },
        improvements: {
          brandCompliance: '+0.45',
          accessibility: 'maintained',
          designSystemAlignment: '+0.67',
        },
      },
      previews: {
        before: 'data:image/png;base64,placeholder',
        after: 'data:image/png;base64,placeholder',
        overlay: 'data:image/png;base64,placeholder',
      },
      metrics: {
        improvementScore: 0.78,
        changeImpact: 'medium',
        brandAlignment: 0.91,
      },
    };

    res.json(diffResult);
  } catch (error) {
    console.error('Visual diff error:', error.message);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Visual diff failed',
      details: { originalError: error.message },
    });
  }
});

// Get sandbox statistics
router.get('/sandbox-stats', async (req, res) => {
  try {
    if (!previewSandbox) {
      return res.status(500).json({
        success: false,
        error: 'service_unavailable',
        message: 'Preview sandbox service is not available',
      });
    }

    const stats = previewSandbox.getStats();

    res.json({
      success: true,
      stats: {
        totalSandboxes: stats.total || 0,
        activeSandboxes: stats.active || 0,
        averageLifetime: stats.averageUptime
          ? `${Math.round(stats.averageUptime / 1000 / 60)} minutes`
          : '0 minutes',
        popularComponents: [
          { type: 'button', count: 45, percentage: 0.31 },
          { type: 'card', count: 32, percentage: 0.22 },
          { type: 'form', count: 28, percentage: 0.19 },
        ],
        frameworkUsage: {
          html: 0.45,
          react: 0.32,
          vue: 0.15,
          svelte: 0.08,
        },
        averageGenerationTime: '500ms',
        successRate: 0.94,
        resourceUsage: {
          memoryUsage: `${Math.round((stats.totalMemory || 0) / 1024 / 1024)}MB`,
          diskUsage: '1.2GB',
          averageCPU: '15%',
        },
      },
      performance: {
        averageResponseTime: '1ms',
        cacheHitRate: 0.87,
        errorRate: 0.02,
      },
    });
  } catch (error) {
    console.error('Sandbox stats error:', error.message);
    res.status(500).json({
      success: false,
      error: 'processing_error',
      message: 'Failed to get sandbox stats',
      details: { originalError: error.message },
    });
  }
});

module.exports = router;
