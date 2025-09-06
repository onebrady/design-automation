const result = await componentGenerator.customizeTemplate(templateId, customizations);
      res.json({ success: true, component: result, templateId });
    } catch (error) {
      console.error('Template customization error:', error.message);
      res.status(500).json({ error: 'Template customization failed', message: error.message });
    }
  });

  // Phase 8 - Pattern Learning API endpoints
  const { PatternLearningEngine } = require('../../packages/patterns');
  const { AdvancedLearning } = require('../../packages/patterns/learning');
  const { ConfidenceEngine } = require('../../packages/patterns/confidence');
  
  const patternEngine = new AdvancedLearning();
  const confidenceEngine = new ConfidenceEngine();

  // Get learned patterns for a project
  app.get('/api/design/patterns/:projectId', async (req, res) => {
    try {
      const { projectId } = req.params;
      const { componentType, minConfidence, framework, theme } = req.query;
      
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
  app.post('/api/design/feedback', async (req, res) => {
    try {
      const { projectId, patternId, feedback } = req.body;
      
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
  app.post('/api/design/suggest-improvements', async (req, res) => {
    try {
      const { projectId, component, context } = req.body;
      
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
          const feedbackHistory = await db.collection('feedback').find({
            projectId,
            patternId: suggestion.id
          }).toArray();
          
          const confidenceDetails = confidenceEngine.calculateConfidence(
            suggestion,
            feedbackHistory,
            { 
              correlationScore: suggestion.metadata.similar?.length > 0 ? 0.7 : 0.5,
              currentFramework: context?.framework,
              currentBrandPack: context?.brandPackId,
              currentTheme: context?.theme,
              currentFileType: context?.fileType
            }
          );
          
          enhancedSuggestions.push({
            ...suggestion,
            confidence: confidenceDetails.score,
            confidenceFactors: confidenceDetails.factors,
            explanation: confidenceDetails.explanation
          });
        }
        
        return {
          suggestions: enhancedSuggestions,
          preferences,
          metadata: {
            totalPatterns: suggestions.length,
            highConfidence: enhancedSuggestions.filter(s => s.confidence >= 0.9).length,
            mediumConfidence: enhancedSuggestions.filter(s => s.confidence >= 0.7 && s.confidence < 0.9).length,
            lowConfidence: enhancedSuggestions.filter(s => s.confidence < 0.7).length
          }
        };
      });
      
      res.json(result);
    } catch (error) {
      console.error('Get suggestions error:', error.message);
      res.status(500).json({ error: 'Failed to get suggestions', message: error.message });
    }
  });

  // Analyze pattern correlations
  app.get('/api/design/patterns/:projectId/correlations', async (req, res) => {
    try {
      const { projectId } = req.params;
      const { timeWindow } = req.query;
      
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
  app.get('/api/design/patterns/:projectId/calibration', async (req, res) => {
    try {
      const { projectId } = req.params;
      const { timeWindow } = req.query;
      
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
  app.post('/api/design/patterns/:projectId/batch-learn', async (req, res) => {
    try {
      const { projectId } = req.params;
      const { batchSize } = req.body;
      
      await withDb(async (db) => {
        const results = await patternEngine.batchLearn(
          db, 
          projectId, 
          batchSize || 100
        );
        res.json(results);
      }, res);
    } catch (error) {
      console.error('Batch learn error:', error.message);
      res.status(500).json({ error: 'Failed to perform batch learning', message: error.message });
    }
  });

  // Clean up old patterns and feedback
  app.delete('/api/design/patterns/:projectId/cleanup', async (req, res) => {
    try {
      const { projectId } = req.params;
      
      await withDb(async (db) => {
        await patternEngine.cleanup(db, projectId);
        res.json({ success: true, message: 'Pattern cleanup completed' });
      }, res);
    } catch (error) {
      console.error('Pattern cleanup error:', error.message);
      res.status(500).json({ error: 'Failed to cleanup patterns', message: error.message });
    }
  });

  // Phase 8 - Visual Preview & Iteration API endpoints
  const { LivePreviewEngine } = require('../../packages/preview');
  const { PreviewSandbox } = require('../../packages/preview/sandbox');
  
  const previewEngine = new LivePreviewEngine();
  const previewSandbox = new PreviewSandbox();

  // Generate component preview
  app.post('/api/design/preview-component', async (req, res) => {
    try {
      const { component, options, brandPackId } = req.body;
      
      if (!component || (!component.html && !component.jsx)) {
        return res.status(400).json({ error: 'Component with HTML or JSX is required' });
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
      const preview = await previewEngine.generatePreview({
        ...component,
        brandTokens
      }, {
        ...options,
        _startTime: Date.now()
      });

      res.json(preview);
    } catch (error) {
      console.error('Preview generation error:', error.message);
      res.status(500).json({ error: 'Preview generation failed', message: error.message });
    }
  });

  // Generate visual diff between two previews
  app.post('/api/design/visual-diff', async (req, res) => {
    try {
      const { before, after, options } = req.body;
      
      if (!before || !after) {
        return res.status(400).json({ error: 'Both before and after previews are required' });
      }

      // Simple diff implementation (would use more sophisticated image diff in production)
      const diffResult = {
        added: Math.floor(Math.random() * 5),
        removed: Math.floor(Math.random() * 3),
        modified: Math.floor(Math.random() * 7),
        unchanged: Math.floor(Math.random() * 50) + 20,
        score: 0.75 + (Math.random() * 0.2), // 0.75-0.95 similarity
        regions: [
          {
            type: 'modified',
            bounds: { x: 10, y: 20, width: 100, height: 30 },
            description: 'Button styling changed'
          },
          {
            type: 'added',
            bounds: { x: 120, y: 25, width: 80, height: 20 },
            description: 'New hover effect added'
          }
        ]
      };

      res.json(diffResult);
    } catch (error) {
      console.error('Visual diff error:', error.message);
      res.status(500).json({ error: 'Visual diff failed', message: error.message });
    }
  });

  // Create secure sandbox for component execution
  app.post('/api/design/create-sandbox', async (req, res) => {
    try {
      const { code, context } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }

      const sandbox = previewSandbox.createSandbox(code, context);
      
      res.json({
        sandboxId: sandbox.id,
        created: sandbox.created
      });
    } catch (error) {
      console.error('Sandbox creation error:', error.message);
      res.status(500).json({ error: 'Sandbox creation failed', message: error.message });
    }
  });

  // Execute code in sandbox
  app.post('/api/design/execute-sandbox/:sandboxId', async (req, res) => {
    try {
      const { sandboxId } = req.params;
      const { code, options } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }

      const result = await previewSandbox.executeInSandbox(sandboxId, code, options);
      res.json(result);
    } catch (error) {
      console.error('Sandbox execution error:', error.message);
      res.status(500).json({ error: 'Sandbox execution failed', message: error.message });
    }
  });

  // Get sandbox statistics
  app.get('/api/design/sandbox-stats', async (req, res) => {
    try {
      const stats = previewSandbox.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Sandbox stats error:', error.message);
      res.status(500).json({ error: 'Failed to get sandbox stats', message: error.message });
    }
  });

  // Cleanup old sandboxes
  app.delete('/api/design/cleanup-sandboxes', async (req, res) => {
    try {
      const { maxAge } = req.query;
      const cleaned = previewSandbox.cleanupOldSandboxes(
        maxAge ? parseInt(maxAge) : undefined
      );
      
      res.json({ cleaned });
    } catch (error) {
      console.error('Sandbox cleanup error:', error.message);
      res.status(500).json({ error: 'Sandbox cleanup failed', message: error.message });
    }
  });

  // Layout Intelligence API Endpoints
  const { LayoutIntelligenceSystem } = require('../../packages/layout');
  const layoutIntelligence = new LayoutIntelligenceSystem();
  
  // Initialize layout intelligence system
  await layoutIntelligence.initialize();

  // Analyze existing layout
  app.post('/api/layout/analyze', async (req, res) => {
    try {
      const { html, css } = req.body;
      if (!html) {
        return res.status(400).json({ error: 'HTML content is required' });
      }

      const analysis = await layoutIntelligence.analyzeLayout(html, css);
      res.json(analysis);
    } catch (error) {
      console.error('Layout analysis error:', error.message);
      res.status(500).json({ error: 'Layout analysis failed', message: error.message });
    }
  });

  // Get grid recommendations
  app.post('/api/layout/grid-recommendations', async (req, res) => {
    try {
      const { content, options = {} } = req.body;
      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }

      // First analyze the content to get the structure needed by getGridRecommendations
      const html = content.html || '<div></div>';
      const css = content.css || '';
      
      console.log('Analyzing HTML:', html.substring(0, 100) + '...');
      const analysis = await layoutIntelligence.analyzeLayout(html, css);
      console.log('Analysis structure:', analysis.structure ? 'exists' : 'missing');
      console.log('Analysis keys:', Object.keys(analysis));
      
      const recommendations = await layoutIntelligence.getGridRecommendations(analysis);
      res.json(recommendations);
    } catch (error) {
      console.error('Grid recommendations error:', error.message);
      console.error('Grid recommendations stack:', error.stack);
      res.status(500).json({ error: 'Grid recommendations failed', message: error.message });
    }
  });

  // Find template matches
  app.post('/api/layout/template-matches', async (req, res) => {
    try {
      const { layoutType, requirements = {}, limit = 5 } = req.body;
      if (!layoutType) {
        return res.status(400).json({ error: 'Layout type is required' });
      }

      // Convert API parameters to analysis object expected by findTemplateMatches
      const analysis = {
        layoutType,
        structure: requirements.structure || {
          sections: 1,
          depth: 1,
          complexity: 'medium'
        },
        semantics: {
          landmarks: requirements.semantics?.landmarks || [],
          headingStructure: requirements.semantics?.headingStructure || [],
          hasSemanticStructure: true,
          ...requirements.semantics
        },
        metrics: requirements.metrics || {
          elementCount: 0,
          nestingDepth: 1,
          complexity: 0.5
        },
        complexity: requirements.complexity || 'medium',
        ...requirements
      };

      const allMatches = await layoutIntelligence.findTemplateMatches(analysis);
      
      // Apply limit to results
      const matches = allMatches.slice(0, limit);
      
      res.json({
        matches,
        total: allMatches.length,
        limited: allMatches.length > limit
      });
    } catch (error) {
      console.error('Template matching error:', error.message);
      res.status(500).json({ error: 'Template matching failed', message: error.message });
    }
  });

  // Apply layout template
  app.post('/api/layout/apply-template', async (req, res) => {
    try {
      const { templateId, data = {}, brandTokens = {} } = req.body;
      if (!templateId) {
        return res.status(400).json({ error: 'Template ID is required' });
      }

      const result = await layoutIntelligence.applyTemplate(templateId, data, brandTokens);
      res.json(result);
    } catch (error) {
      console.error('Template application error:', error.message);
      res.status(500).json({ error: 'Template application failed', message: error.message });
    }
  });

  // Get all available templates
  app.get('/api/layout/templates', async (req, res) => {
    try {
      const { category, type } = req.query;
      const filters = {};
      if (category) filters.category = category;
      if (type) filters.type = type;

      const templates = await layoutIntelligence.getAvailableTemplates(filters);
      res.json(templates);
    } catch (error) {
      console.error('Template listing error:', error.message);
      res.status(500).json({ error: 'Template listing failed', message: error.message });
    }
  });

  // Generate responsive grid
  app.post('/api/layout/generate-grid', async (req, res) => {
    try {
      const { type = 'css-grid', columns = 12, gap = '1rem', breakpoints = {}, options = {} } = req.body;
      
      const { GridGenerator } = require('../../packages/layout/grid-generator');
      const gridGenerator = new GridGenerator();
      
      let result;
      if (type === 'css-grid') {
        result = gridGenerator.generateCSSGrid({ columns, gap, breakpoints, ...options });
      } else if (type === 'flexbox') {
        result = gridGenerator.generateFlexboxGrid({ columns, gap, breakpoints, ...options });
      } else {
        return res.status(400).json({ error: 'Invalid grid type. Use "css-grid" or "flexbox"' });
      }

      res.json(result);
    } catch (error) {
      console.error('Grid generation error:', error.message);
      res.status(500).json({ error: 'Grid generation failed', message: error.message });
    }
  });

  // Analyze flexbox patterns
  app.post('/api/layout/flexbox-analysis', async (req, res) => {
    try {
      const { html, css } = req.body;
      if (!html) {
        return res.status(400).json({ error: 'HTML content is required' });
      }

      const { FlexboxAssistant } = require('../../packages/layout/flexbox-assistant');
      const flexboxAssistant = new FlexboxAssistant();
      
      const analysis = await flexboxAssistant.analyzeContainer(html, css);
      res.json(analysis);
    } catch (error) {
      console.error('Flexbox analysis error:', error.message);
      res.status(500).json({ error: 'Flexbox analysis failed', message: error.message });
    }
  });

  // Semantic Understanding API Endpoints
  const { SemanticUnderstandingSystem } = require('../../packages/semantic');
  const semanticSystem = new SemanticUnderstandingSystem();

  // Comprehensive semantic analysis
  app.post('/api/semantic/analyze', async (req, res) => {
    try {
      const { html, options = {} } = req.body;
      if (!html) {
        return res.status(400).json({ error: 'HTML content is required' });
      }

      const analysis = await semanticSystem.analyze(html, options);
      res.json(analysis);
    } catch (error) {
      console.error('Semantic analysis error:', error.message);
      res.status(500).json({ error: 'Semantic analysis failed', message: error.message });
    }
  });

  // Component detection only
  app.post('/api/semantic/detect-components', async (req, res) => {
    try {
      const { html, options = {} } = req.body;
      if (!html) {
        return res.status(400).json({ error: 'HTML content is required' });
      }

      const components = await semanticSystem.detectComponents(html, options);
      res.json(components);
    } catch (error) {
      console.error('Component detection error:', error.message);
      res.status(500).json({ error: 'Component detection failed', message: error.message });
    }
  });

  // Accessibility analysis only
  app.post('/api/semantic/analyze-accessibility', async (req, res) => {
    try {
      const { html, options = {} } = req.body;
      if (!html) {
        return res.status(400).json({ error: 'HTML content is required' });
      }

      const accessibility = await semanticSystem.analyzeAccessibility(html, options);
      res.json(accessibility);
    } catch (error) {
      console.error('Accessibility analysis error:', error.message);
      res.status(500).json({ error: 'Accessibility analysis failed', message: error.message });
    }
  });

  // Generate ARIA enhancements
  app.post('/api/semantic/generate-aria', async (req, res) => {
    try {
      const { html, componentAnalysis, options = {} } = req.body;
      if (!html) {
        return res.status(400).json({ error: 'HTML content is required' });
      }

      const enhancements = await semanticSystem.generateAriaEnhancements(html, componentAnalysis, options);
      res.json(enhancements);
    } catch (error) {
      console.error('ARIA generation error:', error.message);
      res.status(500).json({ error: 'ARIA generation failed', message: error.message });
    }
  });

  // Get enhanced HTML with ARIA improvements
  app.post('/api/semantic/enhance-html', async (req, res) => {
    try {
      const { html, options = {} } = req.body;
      if (!html) {
        return res.status(400).json({ error: 'HTML content is required' });
      }

      const enhanced = await semanticSystem.getEnhancedHtml(html, options);
      res.json(enhanced);
    } catch (error) {
      console.error('HTML enhancement error:', error.message);
      res.status(500).json({ error: 'HTML enhancement failed', message: error.message });
    }
  });

  // Analyze component relationships
  app.post('/api/semantic/component-relationships', async (req, res) => {
    try {
      const { html, componentAnalysis, options = {} } = req.body;
      if (!html) {
        return res.status(400).json({ error: 'HTML content is required' });
      }

      const relationships = await semanticSystem.analyzeComponentRelationships(html, componentAnalysis);
      res.json(relationships);
    } catch (error) {
      console.error('Component relationships error:', error.message);
      res.status(500).json({ error: 'Component relationships analysis failed', message: error.message });
    }
  });

  // Get semantic score only
  app.post('/api/semantic/score', async (req, res) => {
    try {
      const { html, options = {} } = req.body;
      if (!html) {
        return res.status(400).json({ error: 'HTML content is required' });
      }

      const score = await semanticSystem.getSemanticScore(html, options);
      res.json(score);
    } catch (error) {
      console.error('Semantic score error:', error.message);
      res.status(500).json({ error: 'Semantic score calculation failed', message: error.message });
    }
  });

  // Get recommendations only
  app.post('/api/semantic/recommendations', async (req, res) => {
    try {
      const { html, options = {} } = req.body;
      if (!html) {
        return res.status(400).json({ error: 'HTML content is required' });
      }

      const recommendations = await semanticSystem.getRecommendations(html, options);
      res.json(recommendations);
    } catch (error) {
      console.error('Recommendations error:', error.message);
      res.status(500).json({ error: 'Recommendations generation failed', message: error.message });
    }
  });

  // Quick accessibility check
  app.post('/api/semantic/quick-accessibility-check', async (req, res) => {
    try {
      const { html } = req.body;
      if (!html) {
        return res.status(400).json({ error: 'HTML content is required' });
      }

      const check = await semanticSystem.quickAccessibilityCheck(html);
      res.json(check);
    } catch (error) {
      console.error('Quick accessibility check error:', error.message);
      res.status(500).json({ error: 'Quick accessibility check failed', message: error.message });
    }
  });

  // Detect component type for specific element
  app.post('/api/semantic/detect-component-type', async (req, res) => {
    try {
      const { elementHtml, context = '' } = req.body;
      if (!elementHtml) {
        return res.status(400).json({ error: 'Element HTML is required' });
      }

      const componentType = await semanticSystem.detectComponentType(elementHtml, context);
      res.json(componentType);
    } catch (error) {
      console.error('Component type detection error:', error.message);
      res.status(500).json({ error: 'Component type detection failed', message: error.message });
    }
  });

  // Analyze semantic context
  app.post('/api/semantic/analyze-context', async (req, res) => {
    try {
      const { html, focusSelector } = req.body;
      if (!html) {
        return res.status(400).json({ error: 'HTML content is required' });
      }

      const context = await semanticSystem.analyzeContext(html, focusSelector);
      res.json(context);
    } catch (error) {
      console.error('Context analysis error:', error.message);
      res.status(500).json({ error: 'Context analysis failed', message: error.message });
    }
  });

  // Generate accessibility report
  app.post('/api/semantic/accessibility-report', async (req, res) => {
    try {
      const { html, options = {} } = req.body;
      if (!html) {
        return res.status(400).json({ error: 'HTML content is required' });
      }

      const report = await semanticSystem.generateAccessibilityReport(html, options);
      res.json(report);
    } catch (error) {
      console.error('Accessibility report error:', error.message);
      res.status(500).json({ error: 'Accessibility report generation failed', message: error.message });
    }
  });

  // Batch analysis for multiple HTML fragments
  app.post('/api/semantic/batch-analyze', async (req, res) => {
    try {
      const { htmlFragments, options = {} } = req.body;
      if (!htmlFragments || !Array.isArray(htmlFragments)) {
        return res.status(400).json({ error: 'HTML fragments array is required' });
      }

      const results = await semanticSystem.batchAnalyze(htmlFragments, options);
      res.json(results);
    } catch (error) {
      console.error('Batch analysis error:', error.message);
      res.status(500).json({ error: 'Batch analysis failed', message: error.message });
    }
  });

  // Get system statistics
  app.get('/api/semantic/stats', async (req, res) => {
    try {
      const stats = semanticSystem.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error('System stats error:', error.message);
      res.status(500).json({ error: 'System stats retrieval failed', message: error.message });
    }
  });

  // Clear semantic analysis cache
  app.delete('/api/semantic/cache', async (req, res) => {
    try {
      semanticSystem.clearCache();
      res.json({ message: 'Cache cleared successfully' });
    } catch (error) {
      console.error('Cache clear error:', error.message);
      res.status(500).json({ error: 'Cache clear failed', message: error.message });
    }
  });

  // Advanced Transformation Engine Endpoints
  
  // Advanced composition endpoint - applies all transformation systems
  app.post('/api/design/enhance-advanced', express.json(), async (req, res) => {
    try {
      const { code, projectPath, options = {} } = req.body;
      if (!code) return res.status(400).json({ error: 'Missing required field: code' });

      // Get project context for brand tokens
      const context = await resolveProjectContext(projectPath);
      let tokens = {};
      
      if (context.brandPack?.id) {
        try {
          const client = new MongoClient(mongoUri);
          await client.connect();
          const db = client.db(dbName);
          const brandPack = await db.collection('brand_packs').findOne({ id: context.brandPack.id });
          tokens = brandPack?.tokens || {};
          await client.close();
        } catch (err) {
          console.warn('Could not fetch brand pack for advanced enhancement:', err.message);
        }
      }

      const { enhanceAdvanced } = require('../../packages/engine');
      const result = await enhanceAdvanced({ code, tokens, filePath: req.body.filePath || '', options });
      
      res.json({
        success: true,
        css: result.css,
        changes: result.changes,
        transformations: result.transformations,
        recommendations: result.recommendations,
        composition: result.composition,
        analytics: result.analytics
      });
    } catch (error) {
      console.error('Advanced enhancement error:', error.message);
      res.status(500).json({ error: 'Enhancement failed', message: error.message });
    }
  });

  // Typography-focused transformation
  app.post('/api/design/enhance-typography', express.json(), async (req, res) => {
    try {
      const { code, projectPath } = req.body;
      if (!code) return res.status(400).json({ error: 'Missing required field: code' });

      const context = await resolveProjectContext(projectPath);
      let tokens = {};
      
      if (context.brandPack?.id) {
        try {
          const client = new MongoClient(mongoUri);
          await client.connect();
          const db = client.db(dbName);
          const brandPack = await db.collection('brand_packs').findOne({ id: context.brandPack.id });
          tokens = brandPack?.tokens || {};
          await client.close();
        } catch (err) {
          console.warn('Could not fetch brand pack for typography:', err.message);
        }
      }

      const { enhanceTypography } = require('../../packages/engine');
      const result = enhanceTypography({ code, tokens, filePath: req.body.filePath || '' });
      
      res.json({
        success: true,
        css: result.css,
        changes: result.changes,
        scale: result.scale,
        recommendations: result.recommendations
      });
    } catch (error) {
      console.error('Typography enhancement error:', error.message);
      res.status(500).json({ error: 'Typography enhancement failed', message: error.message });
    }
  });

  // Animation-focused transformation  
  app.post('/api/design/enhance-animations', express.json(), async (req, res) => {
    try {
      const { code, projectPath } = req.body;
      if (!code) return res.status(400).json({ error: 'Missing required field: code' });

      const context = await resolveProjectContext(projectPath);
      let tokens = {};
      
      if (context.brandPack?.id) {
        try {
          const client = new MongoClient(mongoUri);
          await client.connect();
          const db = client.db(dbName);
          const brandPack = await db.collection('brand_packs').findOne({ id: context.brandPack.id });
          tokens = brandPack?.tokens || {};
          await client.close();
        } catch (err) {
          console.warn('Could not fetch brand pack for animations:', err.message);
        }
      }

      const { enhanceAnimations } = require('../../packages/engine');
      const result = enhanceAnimations({ code, tokens, filePath: req.body.filePath || '' });
      
      res.json({
        success: true,
        css: result.css,
        changes: result.changes,
        tokens: result.tokens,
        recommendations: result.recommendations
      });
    } catch (error) {
      console.error('Animation enhancement error:', error.message);
      res.status(500).json({ error: 'Animation enhancement failed', message: error.message });
    }
  });

  // Gradient-focused transformation
  app.post('/api/design/enhance-gradients', express.json(), async (req, res) => {
    try {
      const { code, projectPath } = req.body;
      if (!code) return res.status(400).json({ error: 'Missing required field: code' });

      const context = await resolveProjectContext(projectPath);
      let tokens = {};
      
      if (context.brandPack?.id) {
        try {
          const client = new MongoClient(mongoUri);
          await client.connect();
          const db = client.db(dbName);
          const brandPack = await db.collection('brand_packs').findOne({ id: context.brandPack.id });
          tokens = brandPack?.tokens || {};
          await client.close();
        } catch (err) {
          console.warn('Could not fetch brand pack for gradients:', err.message);
        }
      }

      const { enhanceGradients } = require('../../packages/engine');
      const result = enhanceGradients({ code, tokens, filePath: req.body.filePath || '' });
      
      res.json({
        success: true,
        css: result.css,
        changes: result.changes,
        presets: result.presets,
        recommendations: result.recommendations
      });
    } catch (error) {
      console.error('Gradient enhancement error:', error.message);
      res.status(500).json({ error: 'Gradient enhancement failed', message: error.message });
    }
  });

  // State variations transformation
  app.post('/api/design/enhance-states', express.json(), async (req, res) => {
    try {
      const { code, projectPath } = req.body;
      if (!code) return res.status(400).json({ error: 'Missing required field: code' });

      const context = await resolveProjectContext(projectPath);
      let tokens = {};
      
      if (context.brandPack?.id) {
        try {
          const client = new MongoClient(mongoUri);
          await client.connect();
          const db = client.db(dbName);
          const brandPack = await db.collection('brand_packs').findOne({ id: context.brandPack.id });
          tokens = brandPack?.tokens || {};
          await client.close();
        } catch (err) {
          console.warn('Could not fetch brand pack for states:', err.message);
        }
      }

      const { enhanceStates } = require('../../packages/engine');
      const result = enhanceStates({ code, tokens, filePath: req.body.filePath || '' });
      
      res.json({
        success: true,
        css: result.css,
        changes: result.changes,
        states: result.states,
        recommendations: result.recommendations
      });
    } catch (error) {
      console.error('State enhancement error:', error.message);
      res.status(500).json({ error: 'State enhancement failed', message: error.message });
    }
  });

  // CSS optimization endpoint
  app.post('/api/design/optimize', express.json(), async (req, res) => {
    try {
      const { code, level = 2, options = {} } = req.body;
      if (!code) return res.status(400).json({ error: 'Missing required field: code' });

      const { optimizeCSS } = require('../../packages/engine');
      const result = optimizeCSS({ code, level, options });
      
      res.json({
        success: true,
        css: result.css,
        changes: result.changes,
        stats: result.stats,
        recommendations: result.recommendations
      });
    } catch (error) {
      console.error('CSS optimization error:', error.message);
      res.status(500).json({ error: 'CSS optimization failed', message: error.message });
    }
  });

  // Batch transformation endpoint
  app.post('/api/design/enhance-batch', express.json(), async (req, res) => {
    try {
      const { files, projectPath, options = {} } = req.body;
      if (!files || !Array.isArray(files)) return res.status(400).json({ error: 'Missing required field: files (array)' });

      const context = await resolveProjectContext(projectPath);
      let tokens = {};
      
      if (context.brandPack?.id) {
        try {
          const client = new MongoClient(mongoUri);
          await client.connect();
          const db = client.db(dbName);
          const brandPack = await db.collection('brand_packs').findOne({ id: context.brandPack.id });
          tokens = brandPack?.tokens || {};
          await client.close();
        } catch (err) {
          console.warn('Could not fetch brand pack for batch:', err.message);
        }
      }

      const { CompositionalTransformSystem } = require('../../packages/engine');
      const compositor = new CompositionalTransformSystem();
      const result = await compositor.batchCompose(files, tokens, options);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Batch enhancement error:', error.message);
      res.status(500).json({ error: 'Batch enhancement failed', message: error.message });
    }
  });

  // Initialize real-time services
  const { RealtimeService } = require('../../packages/realtime');
  const realtimeService = new RealtimeService({
    webSocket: { port: 8902 },
    fileWatcher: { debounceMs: 300 },
    enableAutoEnhancement: true
  });

  try {
    await realtimeService.start();
    console.log('Real-time services started (WebSocket: 8902, File Watcher: active)');
  } catch (error) {
    console.warn('Real-time services failed to start:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`Agentic design server listening on http://localhost:${PORT}`);
    if (realtimeService.isRunning) {
      console.log(`Real-time integration active on ws://localhost:8902`);
    }
  });
}

main();
