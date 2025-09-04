const { LayoutAnalyzer } = require('./analyzer');
const { GridGenerator } = require('./grid-generator');
const { FlexboxAssistant } = require('./flexbox-assistant');
const fs = require('fs').promises;
const path = require('path');

class LayoutIntelligenceSystem {
  constructor(options = {}) {
    this.options = {
      templatesPath: options.templatesPath || path.join(__dirname, 'templates'),
      cacheEnabled: options.cacheEnabled !== false,
      ...options
    };

    this.analyzer = new LayoutAnalyzer(options.analyzer);
    this.gridGenerator = new GridGenerator(options.gridGenerator);
    this.flexboxAssistant = new FlexboxAssistant(options.flexboxAssistant);
    
    this.templates = new Map();
    this.cache = new Map();
  }

  // Initialize the system by loading templates
  async initialize() {
    await this.loadTemplates();
    return this;
  }

  // Load layout templates from templates directory
  async loadTemplates() {
    try {
      const templatesDir = this.options.templatesPath;
      const files = await fs.readdir(templatesDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(templatesDir, file);
          const templateData = await fs.readFile(filePath, 'utf-8');
          const template = JSON.parse(templateData);
          this.templates.set(template.id, template);
        }
      }
      
      console.log(`Loaded ${this.templates.size} layout templates`);
    } catch (error) {
      console.error('Failed to load layout templates:', error.message);
    }
  }

  // Comprehensive layout analysis
  async analyzeLayout(html, css = '', options = {}) {
    const cacheKey = this.generateCacheKey('analyze', { html, css, options });
    
    if (this.options.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Perform comprehensive analysis
    const analysis = await this.analyzer.analyzeLayout(html, css);
    
    // Add layout intelligence insights
    analysis.intelligence = {
      gridRecommendations: await this.getGridRecommendations(analysis),
      flexboxSuggestions: await this.getFlexboxSuggestions(analysis),
      templateMatches: await this.findTemplateMatches(analysis),
      improvements: await this.generateLayoutImprovements(analysis),
      responsiveStrategy: await this.suggestResponsiveStrategy(analysis)
    };

    // Add performance analysis
    analysis.performance = await this.analyzer.analyzePerformance(
      { querySelectorAll: () => [] }, // Simplified document mock
      css
    );

    if (this.options.cacheEnabled) {
      this.cache.set(cacheKey, analysis);
    }

    return analysis;
  }

  // Get grid system recommendations
  async getGridRecommendations(analysis) {
    const recommendations = [];
    const { structure = {}, layoutType } = analysis || {};
    
    // Ensure structure has required properties 
    const safeStructure = {
      containers: [],
      depth: 1,
      complexity: 'medium',
      ...structure
    };
    
    // Handle case where analysis is undefined
    if (!analysis) {
      console.warn('Analysis is undefined in getGridRecommendations');
      return [{
        type: 'fallback',
        confidence: 0.3,
        title: 'Basic Grid Layout',
        description: 'Default grid recommendation due to analysis failure',
        implementation: this.gridGenerator.generateCSSGrid({ columns: 3, responsive: true }),
        benefits: ['Basic layout structure']
      }];
    }

    // CSS Grid recommendations
    if (safeStructure.containers.length > 0) {
      const gridContainer = safeStructure.containers.find(c => c && c.type === 'card-grid');
      
      if (gridContainer) {
        const gridConfig = this.gridGenerator.generateCSSGrid({
          columns: Math.min(gridContainer.childCount, 4),
          responsive: true,
          autoFit: gridContainer.childCount > 6
        });
        
        recommendations.push({
          type: 'css-grid',
          confidence: 0.8,
          title: 'CSS Grid Layout',
          description: 'Use CSS Grid for this card-based layout',
          implementation: gridConfig,
          benefits: ['Better alignment', 'Responsive by default', 'Cleaner code']
        });
      }
    }

    // Flexbox recommendations
    const flexContainers = safeStructure.containers.filter(c => 
      c && (c.type === 'navigation' || c.childCount <= 4)
    );
    
    for (const container of flexContainers) {
      const flexConfig = this.gridGenerator.generateFlexboxGrid({
        columns: container.childCount,
        responsive: true
      });
      
      recommendations.push({
        type: 'flexbox-grid',
        confidence: 0.7,
        title: 'Flexbox Layout',
        description: `Flexbox works well for ${container.type} with ${container.childCount} items`,
        implementation: flexConfig,
        benefits: ['Flexible alignment', 'Good browser support', 'Simple implementation']
      });
    }

    // Subgrid recommendations (for advanced layouts)
    if (safeStructure.depth > 3 && safeStructure.containers.length > 2) {
      const subgridConfig = this.gridGenerator.generateSubgrid({
        columns: 'subgrid',
        rows: 'subgrid'
      });
      
      recommendations.push({
        type: 'subgrid',
        confidence: 0.6,
        title: 'CSS Subgrid',
        description: 'Use subgrid for complex nested layouts',
        implementation: subgridConfig,
        benefits: ['Unified grid system', 'Better alignment across levels'],
        requirements: ['Modern browser support needed']
      });
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  // Get flexbox suggestions
  async getFlexboxSuggestions(analysis) {
    const { structure = {} } = analysis || {};
    
    // Ensure structure has required properties 
    const safeStructure = {
      containers: [],
      ...structure
    };
    
    const mockElement = {
      children: (safeStructure.containers || []).map(c => ({
        tagName: 'div',
        className: (c && c.className) || '',
        textContent: 'Sample content'
      }))
    };

    const flexAnalysis = this.flexboxAssistant.analyzeContainer(mockElement);
    return {
      ...flexAnalysis,
      patterns: this.flexboxAssistant.suggestPatterns(flexAnalysis),
      utilities: this.flexboxAssistant.generateFlexboxUtilities()
    };
  }

  // Find matching templates
  async findTemplateMatches(analysis) {
    const matches = [];
    const { structure, layoutType, semantics } = analysis;

    console.log('findTemplateMatches called with:', {
      analysisKeys: Object.keys(analysis),
      templatesSize: this.templates.size,
      semanticsType: typeof semantics,
      semanticsKeys: semantics ? Object.keys(semantics) : 'undefined'
    });

    try {
      for (const [templateId, template] of this.templates) {
        console.log(`Processing template ${templateId}`);
        
        try {
          const matchScore = this.calculateTemplateMatch(template, analysis);
          
          if (matchScore.score > 0.5) {
            matches.push({
              templateId,
              template,
              score: matchScore.score,
              confidence: matchScore.confidence,
              reasons: matchScore.reasons,
              adaptations: await this.suggestTemplateAdaptations(template, analysis)
            });
          }
        } catch (templateError) {
          console.error(`Error processing template ${templateId}:`, templateError.message);
          // Continue with other templates
        }
      }
    } catch (overallError) {
      console.error('Error in findTemplateMatches:', overallError.message);
      console.error('Stack:', overallError.stack);
      throw overallError;
    }

    return matches.sort((a, b) => b.score - a.score);
  }

  // Calculate how well a template matches the current layout
  calculateTemplateMatch(template, analysis) {
    let score = 0;
    const reasons = [];
    const { structure = {}, layoutType = 'dashboard', semantics = {} } = analysis;

    // Ensure semantics has required properties
    const safeSemantics = {
      landmarks: [],
      headingStructure: [],
      hasSemanticStructure: false,
      ...semantics
    };

    // Ensure structure has required properties 
    const safeStructure = {
      containers: [],
      depth: 1,
      complexity: 'medium',
      ...structure
    };

    // Debug logging
    console.log('Template matching debug:', {
      templateId: template.id,
      analysisKeys: Object.keys(analysis),
      semanticsKeys: Object.keys(semantics),
      safeSemanticsLandmarks: safeSemantics.landmarks,
      landmarksType: typeof safeSemantics.landmarks,
      isArray: Array.isArray(safeSemantics.landmarks)
    });

    // Check layout type compatibility
    if (template.category === 'layouts') {
      const layoutTypeStr = typeof layoutType === 'string' ? layoutType : layoutType.type || 'dashboard';
      if (layoutTypeStr.includes('sidebar') && template.id.includes('sidebar')) {
        score += 0.3;
        reasons.push('Sidebar layout detected');
      }
      if (layoutTypeStr.includes('grid') && template.id.includes('grid')) {
        score += 0.3;
        reasons.push('Grid layout pattern');
      }
    }

    // Check semantic structure with enhanced validation
    try {
      if (safeSemantics.landmarks && Array.isArray(safeSemantics.landmarks) && safeSemantics.landmarks.length > 0) {
        // Filter out invalid landmarks before using some() method
        const validLandmarks = safeSemantics.landmarks.filter(l => 
          l && typeof l === 'object' && l.tag && typeof l.tag === 'string'
        );
        
        console.log('Landmarks validation:', {
          original: safeSemantics.landmarks.length,
          valid: validLandmarks.length,
          invalidItems: safeSemantics.landmarks.filter(l => !l || typeof l !== 'object' || !l.tag)
        });

        if (validLandmarks.length > 0) {
          const hasHeader = validLandmarks.some(l => l.tag === 'header');
          const hasNav = validLandmarks.some(l => l.tag === 'nav');
          const hasMain = validLandmarks.some(l => l.tag === 'main');
        
          if (template.id === 'dashboard-layout' && hasHeader && hasNav && hasMain) {
            score += 0.4;
            reasons.push('Dashboard structure detected');
          }
          
          if (template.id === 'hero-section' && hasMain && safeStructure.containers.length === 1) {
            score += 0.3;
            reasons.push('Hero section structure');
          }
        }
      }
    } catch (semanticsError) {
      console.error('Error in semantics check:', semanticsError.message);
      console.error('SafeSemantics:', JSON.stringify(safeSemantics, null, 2));
    }

    // Check content patterns
    try {
      if (safeStructure.containers && safeStructure.containers.some(c => c && c.type === 'card-grid') && template.id === 'card-grid') {
        score += 0.4;
        reasons.push('Card grid pattern detected');
      }
    } catch (patternsError) {
      console.error('Error in patterns check:', patternsError.message);
      console.error('SafeStructure:', JSON.stringify(safeStructure, null, 2));
    }

    return {
      score: Math.min(score, 1.0),
      confidence: score > 0.7 ? 'high' : score > 0.5 ? 'medium' : 'low',
      reasons
    };
  }

  // Suggest template adaptations
  async suggestTemplateAdaptations(template, analysis) {
    const adaptations = [];
    const { structure, responsiveness } = analysis;

    // Responsive adaptations
    if (responsiveness.score < 60) {
      adaptations.push({
        type: 'responsive',
        title: 'Add Responsive Breakpoints',
        description: 'Template includes responsive design that your current layout lacks',
        code: this.extractResponsiveCSS(template.css)
      });
    }

    // Spacing adaptations
    if (!analysis.spacing.hasConsistentSpacing) {
      adaptations.push({
        type: 'spacing',
        title: 'Use Consistent Spacing',
        description: 'Apply template spacing tokens for better consistency',
        tokens: template.tokens.filter(token => token.includes('spacing'))
      });
    }

    // Accessibility adaptations
    if (analysis.accessibility.score < 80) {
      adaptations.push({
        type: 'accessibility',
        title: 'Improve Accessibility',
        description: 'Template includes better semantic structure and ARIA support',
        improvements: analysis.accessibility.improvements
      });
    }

    return adaptations;
  }

  // Extract responsive CSS from template
  extractResponsiveCSS(css) {
    const mediaQueryRegex = /@media[^{]+\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
    const mediaQueries = css.match(mediaQueryRegex) || [];
    return mediaQueries.join('\n\n');
  }

  // Generate layout improvements
  async generateLayoutImprovements(analysis) {
    const improvements = [];
    const { structure, responsiveness, semantics, spacing, accessibility } = analysis;

    // Structure improvements
    if (structure.depth > 5) {
      improvements.push({
        type: 'structure',
        priority: 'medium',
        title: 'Reduce Nesting Depth',
        description: 'Simplify DOM structure to improve performance and maintainability',
        suggestion: 'Consider using CSS Grid or Flexbox to reduce nesting levels'
      });
    }

    // Layout improvements
    if (analysis.layoutType.confidence < 0.7) {
      improvements.push({
        type: 'layout',
        priority: 'high',
        title: 'Clarify Layout Intent',
        description: 'Use modern CSS layout methods for better structure',
        suggestions: [
          'Use CSS Grid for 2D layouts',
          'Use Flexbox for 1D layouts', 
          'Add semantic HTML elements'
        ]
      });
    }

    // Performance improvements
    if (structure.totalElements > 500) {
      improvements.push({
        type: 'performance',
        priority: 'high',
        title: 'Optimize DOM Size',
        description: 'Large DOM can impact performance',
        suggestions: [
          'Consider virtualization for large lists',
          'Lazy load off-screen content',
          'Remove unnecessary wrapper elements'
        ]
      });
    }

    // Responsive improvements
    if (responsiveness.score < 70) {
      improvements.push({
        type: 'responsive',
        priority: 'high',
        title: 'Improve Mobile Experience',
        description: 'Add responsive design patterns',
        implementation: await this.generateResponsiveImprovements(analysis)
      });
    }

    return improvements.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });
  }

  // Generate responsive improvements
  async generateResponsiveImprovements(analysis) {
    const improvements = {
      breakpoints: this.gridGenerator.options.breakpoints,
      mediaQueries: [],
      fluidTypography: [],
      flexibleLayouts: []
    };

    // Generate mobile-first media queries
    Object.entries(improvements.breakpoints).forEach(([name, width]) => {
      if (width > 0) {
        improvements.mediaQueries.push({
          breakpoint: name,
          minWidth: `${width}px`,
          suggestions: this.getBreakpointSuggestions(name, analysis)
        });
      }
    });

    // Fluid typography suggestions
    improvements.fluidTypography = [
      'font-size: clamp(1rem, 2.5vw, 1.5rem);',
      'font-size: clamp(1.5rem, 4vw, 3rem);',
      'font-size: clamp(2rem, 5vw, 4rem);'
    ];

    return improvements;
  }

  // Get suggestions for specific breakpoints
  getBreakpointSuggestions(breakpoint, analysis) {
    const suggestions = [];
    
    switch (breakpoint) {
      case 'sm':
        suggestions.push('Stack navigation items vertically');
        suggestions.push('Reduce padding and margins');
        break;
      case 'md':
        suggestions.push('Switch to horizontal navigation');
        suggestions.push('Introduce sidebar layouts');
        break;
      case 'lg':
        suggestions.push('Use multi-column layouts');
        suggestions.push('Increase content width');
        break;
      case 'xl':
        suggestions.push('Add more whitespace');
        suggestions.push('Consider larger grid systems');
        break;
    }
    
    return suggestions;
  }

  // Suggest responsive strategy
  async suggestResponsiveStrategy(analysis) {
    const { structure = {}, responsiveness } = analysis;
    
    // Ensure structure has required properties 
    const safeStructure = {
      containers: [],
      depth: 1,
      complexity: 'medium',
      layoutElements: {},
      ...structure
    };
    
    const strategy = {
      approach: 'mobile-first',
      techniques: [],
      breakpoints: Object.keys(this.gridGenerator.options.breakpoints),
      priority: []
    };

    // Determine approach based on content
    if (safeStructure.containers && safeStructure.containers.some(c => c && c.type === 'navigation')) {
      strategy.techniques.push('Progressive enhancement for navigation');
      strategy.priority.push('Mobile navigation patterns');
    }

    if (safeStructure.containers && safeStructure.containers.some(c => c && c.type === 'card-grid')) {
      strategy.techniques.push('Flexible grid systems');
      strategy.priority.push('Card stacking on mobile');
    }

    if (safeStructure.layoutElements && safeStructure.layoutElements.sidebars > 0) {
      strategy.techniques.push('Collapsible sidebar');
      strategy.priority.push('Off-canvas navigation');
    }

    // Existing responsiveness assessment
    if (responsiveness.score > 70) {
      strategy.assessment = 'Good responsive foundation, minor improvements needed';
    } else if (responsiveness.score > 40) {
      strategy.assessment = 'Partial responsive design, significant improvements needed';
    } else {
      strategy.assessment = 'No responsive design detected, complete overhaul recommended';
    }

    return strategy;
  }

  // Apply layout template
  async applyTemplate(templateId, data = {}, brandTokens = {}) {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template "${templateId}" not found`);
    }

    const applied = {
      templateId,
      template,
      html: this.processTemplate(template.html, data),
      css: this.processTemplateCSS(template.css, brandTokens),
      tokens: template.tokens,
      variants: template.variants
    };

    // Apply brand tokens to CSS
    applied.css = this.applyBrandTokens(applied.css, brandTokens);

    return applied;
  }

  // Process template HTML with data
  processTemplate(html, data) {
    let processed = html;
    
    // Simple template processing (would use a proper template engine in production)
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processed = processed.replace(regex, value);
    });

    // Handle arrays (simplified)
    const arrayRegex = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
    processed = processed.replace(arrayRegex, (match, key, content) => {
      const items = data[key];
      if (Array.isArray(items)) {
        return items.map(item => {
          let itemContent = content;
          Object.entries(item).forEach(([itemKey, itemValue]) => {
            const itemRegex = new RegExp(`\\{\\{${itemKey}\\}\\}`, 'g');
            itemContent = itemContent.replace(itemRegex, itemValue);
          });
          return itemContent;
        }).join('');
      }
      return '';
    });

    return processed;
  }

  // Process template CSS
  processTemplateCSS(css, brandTokens) {
    // Apply brand tokens to CSS variables
    return this.applyBrandTokens(css, brandTokens);
  }

  // Apply brand tokens to CSS
  applyBrandTokens(css, brandTokens) {
    let processed = css;
    
    // Flatten brand tokens
    const flatTokens = this.flattenTokens(brandTokens);
    
    // Replace CSS variables with actual values
    Object.entries(flatTokens).forEach(([token, value]) => {
      const regex = new RegExp(`var\\(--${token}[^)]*\\)`, 'g');
      processed = processed.replace(regex, value);
    });

    return processed;
  }

  // Flatten nested brand tokens
  flattenTokens(tokens, prefix = '') {
    const flat = {};
    
    for (const [key, value] of Object.entries(tokens)) {
      const fullKey = prefix ? `${prefix}-${key}` : key;
      
      if (value && typeof value === 'object' && value.value !== undefined) {
        flat[fullKey] = value.value;
      } else if (value && typeof value === 'object') {
        Object.assign(flat, this.flattenTokens(value, fullKey));
      }
    }
    
    return flat;
  }

  // Get available templates
  getTemplates(category = null) {
    const templates = Array.from(this.templates.values());
    
    if (category) {
      return templates.filter(t => t.category === category);
    }
    
    return templates;
  }

  // Get available templates with filters (alias for API compatibility)
  async getAvailableTemplates(filters = {}) {
    const templates = Array.from(this.templates.values());
    
    let filtered = templates;
    
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }
    
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    
    return filtered.map(template => ({
      ...template,
      previewUrl: template.preview ? `data:text/html;base64,${Buffer.from(template.preview).toString('base64')}` : null
    }));
  }

  // Get template by ID
  getTemplate(templateId) {
    return this.templates.get(templateId);
  }

  // Generate layout from scratch based on content
  async generateLayoutFromContent(elements, requirements = {}) {
    const {
      layoutType = 'auto',
      responsive = true,
      framework = 'css-grid',
      breakpoints = this.gridGenerator.options.breakpoints
    } = requirements;

    // Analyze content to determine best layout approach
    const contentAnalysis = this.analyzeContentForLayout(elements);
    
    let layoutSystem;
    
    if (framework === 'css-grid' || layoutType === 'grid') {
      layoutSystem = this.gridGenerator.generateFromContent(elements);
    } else if (framework === 'flexbox' || layoutType === 'flex') {
      layoutSystem = this.gridGenerator.generateFlexboxGrid({
        columns: Math.ceil(Math.sqrt(elements.length)),
        responsive
      });
    } else {
      // Auto-detect best system
      if (contentAnalysis.uniformity > 0.8 && elements.length > 4) {
        layoutSystem = this.gridGenerator.generateFromContent(elements);
      } else {
        const flexConfig = this.gridGenerator.generateFlexboxGrid({ responsive });
        layoutSystem = flexConfig;
      }
    }

    return {
      contentAnalysis,
      layoutSystem,
      recommendations: await this.getContentBasedRecommendations(contentAnalysis)
    };
  }

  // Analyze content for layout generation
  analyzeContentForLayout(elements) {
    return {
      totalElements: elements.length,
      types: this.categorizeElementTypes(elements),
      uniformity: this.calculateContentUniformity(elements),
      complexity: this.calculateContentComplexity(elements)
    };
  }

  // Categorize element types
  categorizeElementTypes(elements) {
    const types = { text: 0, images: 0, interactive: 0, containers: 0 };
    
    elements.forEach(element => {
      if (element.tagName === 'img') types.images++;
      else if (['button', 'a', 'input'].includes(element.tagName)) types.interactive++;
      else if (['div', 'section', 'article'].includes(element.tagName)) types.containers++;
      else types.text++;
    });
    
    return types;
  }

  // Calculate content uniformity
  calculateContentUniformity(elements) {
    // Simplified uniformity calculation
    const sizes = elements.map(el => el.offsetWidth * el.offsetHeight || 100);
    const avg = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
    const variance = sizes.reduce((sum, size) => sum + Math.pow(size - avg, 2), 0) / sizes.length;
    return 1 - Math.min(Math.sqrt(variance) / avg, 1);
  }

  // Calculate content complexity
  calculateContentComplexity(elements) {
    let complexity = 0;
    elements.forEach(element => {
      complexity += (element.children?.length || 0) * 0.1;
      complexity += element.textContent?.length > 100 ? 0.2 : 0.1;
    });
    return Math.min(complexity / elements.length, 1);
  }

  // Get content-based recommendations
  async getContentBasedRecommendations(contentAnalysis) {
    const recommendations = [];
    
    if (contentAnalysis.uniformity > 0.8) {
      recommendations.push({
        type: 'layout',
        title: 'Use CSS Grid',
        reason: 'Uniform content works well with grid layouts'
      });
    }
    
    if (contentAnalysis.types.interactive > contentAnalysis.totalElements * 0.5) {
      recommendations.push({
        type: 'navigation',
        title: 'Consider Navigation Pattern',
        reason: 'High proportion of interactive elements'
      });
    }
    
    return recommendations;
  }

  // Generate cache key
  generateCacheKey(operation, data) {
    const str = JSON.stringify({ operation, data });
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `${operation}_${Math.abs(hash)}`;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get system statistics
  getStats() {
    return {
      templatesLoaded: this.templates.size,
      cacheSize: this.cache.size,
      availableCategories: [...new Set(Array.from(this.templates.values()).map(t => t.category))]
    };
  }
}

module.exports = { 
  LayoutIntelligenceSystem, 
  LayoutAnalyzer, 
  GridGenerator, 
  FlexboxAssistant 
};