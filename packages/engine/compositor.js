// Compositional Transform System - Combine multiple transformations for complex design enhancements
const fs = require('fs');

class CompositionalTransformSystem {
  constructor(options = {}) {
    this.options = {
      maxTransformations: 10, // Maximum transformations to apply in single pass
      enableCaching: true,
      enableAnalytics: true,
      transformOrder: [
        'typography',
        'colors', 
        'spacing',
        'animations',
        'gradients',
        'states',
        'shadows',
        'optimization'
      ],
      ...options
    };

    this.transformations = new Map();
    this.cache = new Map();
    this.analytics = {
      transformsApplied: 0,
      cacheHits: 0,
      processingTime: 0,
      errors: []
    };

    this.initializeTransformers();
  }

  initializeTransformers() {
    // Import and initialize all transformation systems
    const { TypographyScaleSystem } = require('./typography');
    const { AnimationTokenSystem } = require('./animations');
    const { GradientSystem } = require('./gradients');
    const { StateVariationSystem } = require('./states');
    const { enhanceCss } = require('./index'); // Base engine

    this.transformers = {
      typography: new TypographyScaleSystem(),
      animations: new AnimationTokenSystem(),
      gradients: new GradientSystem(),
      states: new StateVariationSystem(),
      base: { enhanceCss } // Base color/spacing/radius transforms
    };
  }

  // Main composition method - applies multiple transformations in optimized order
  async composeTransformations(css, brandTokens = {}, options = {}) {
    const startTime = Date.now();
    const transformOptions = {
      enableTypography: true,
      enableAnimations: true,
      enableGradients: true,
      enableStates: true,
      enableOptimization: true,
      ...options
    };

    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(css, brandTokens, transformOptions);
      
      // Check cache first
      if (this.options.enableCaching && this.cache.has(cacheKey)) {
        this.analytics.cacheHits++;
        return this.cache.get(cacheKey);
      }

      let result = {
        css,
        changes: [],
        transformations: [],
        recommendations: [],
        analytics: {}
      };

      // Apply transformations in optimized order
      for (const transformType of this.options.transformOrder) {
        if (!transformOptions[`enable${this.capitalize(transformType)}`]) {
          continue;
        }

        const transformResult = await this.applyTransformation(
          transformType,
          result.css,
          brandTokens,
          transformOptions
        );

        if (transformResult) {
          result.css = transformResult.css || result.css;
          result.changes.push(...(transformResult.changes || []));
          result.recommendations.push(...(transformResult.recommendations || []));
          result.transformations.push({
            type: transformType,
            applied: transformResult.changes?.length || 0,
            timestamp: new Date().toISOString()
          });

          this.analytics.transformsApplied++;
        }
      }

      // Final optimization pass with comprehensive safety mechanisms
      // Re-enabled with proper validation and rollback mechanisms
      if (transformOptions.enableOptimization) {
        result = await this.optimizeComposedCSS(result);
      }

      // Add composition metadata
      result.composition = {
        transformOrder: this.options.transformOrder,
        transformationsApplied: result.transformations.length,
        totalChanges: result.changes.length,
        processingTimeMs: Date.now() - startTime,
        cacheKey
      };

      result.analytics = this.getAnalytics();

      // Cache the result
      if (this.options.enableCaching) {
        this.cache.set(cacheKey, result);
      }

      this.analytics.processingTime += Date.now() - startTime;
      return result;

    } catch (error) {
      this.analytics.errors.push({
        error: error.message,
        timestamp: new Date().toISOString(),
        css: css.substring(0, 100) // First 100 chars for debugging
      });
      throw error;
    }
  }

  async applyTransformation(transformType, css, brandTokens, options) {
    try {
      switch (transformType) {
        case 'typography':
          return this.transformers.typography.transformTypography(css, brandTokens);
        
        case 'animations':
          return this.transformers.animations.transformAnimations(css, brandTokens);
        
        case 'gradients':
          return this.transformers.gradients.transformGradients(css, brandTokens);
        
        case 'states':
          return this.transformers.states.transformStateVariations(css, brandTokens);
        
        case 'colors':
        case 'spacing':
        case 'shadows':
          // Use base engine for fundamental transforms
          const baseResult = this.transformers.base.enhanceCss({
            code: css,
            tokens: brandTokens,
            filePath: options.filePath || '',
            maxChanges: options.maxChanges || 10
          });
          return {
            css: baseResult.code,
            changes: baseResult.changes,
            recommendations: []
          };
        
        default:
          console.warn(`Unknown transformation type: ${transformType}`);
          return null;
      }
    } catch (error) {
      console.error(`Error applying ${transformType} transformation:`, error.message);
      return null;
    }
  }

  async optimizeComposedCSS(result) {
    // Run post-composition optimizations with comprehensive safety mechanisms
    const optimizations = [
      this.deduplicateRules,
      this.consolidateMediaQueries,
      this.optimizeSelectors,
      this.minifyProperties, // Re-enabled with proper regex fixes
      this.sortProperties
    ];

    let optimizedCSS = result.css;
    const optimizationChanges = [];
    const originalCSS = result.css; // Keep original for rollback

    for (const optimization of optimizations) {
      const beforeOptimization = optimizedCSS;
      
      try {
        const optimizationResult = optimization.call(this, optimizedCSS);
        
        // Validate the optimization result
        if (!this.validateCSSIntegrity(beforeOptimization, optimizationResult.css)) {
          console.warn(`Optimization ${optimization.name} failed validation, skipping`);
          continue;
        }
        
        if (optimizationResult.css !== optimizedCSS) {
          optimizedCSS = optimizationResult.css;
          optimizationChanges.push({
            type: 'optimization',
            optimization: optimization.name,
            before: beforeOptimization.length,
            after: optimizationResult.css.length,
            savings: beforeOptimization.length - optimizationResult.css.length,
            description: optimizationResult.description
          });
        }
      } catch (error) {
        console.warn(`Optimization ${optimization.name} failed:`, error.message);
        // Continue with next optimization, don't break the pipeline
      }
    }

    // Final validation of the entire optimization pipeline
    if (!this.validateFinalCSS(originalCSS, optimizedCSS)) {
      console.warn('Final CSS validation failed, returning original CSS');
      return {
        ...result,
        css: originalCSS,
        changes: result.changes,
        optimizations: [{
          type: 'optimization',
          optimization: 'pipeline_rollback',
          description: 'Optimization pipeline validation failed, returned original CSS'
        }]
      };
    }

    return {
      ...result,
      css: optimizedCSS,
      changes: [...result.changes, ...optimizationChanges],
      optimizations: optimizationChanges
    };
  }

  // CSS optimization methods
  deduplicateRules(css) {
    const seenRules = new Set();
    const lines = css.split('\n');
    const result = [];
    let currentRule = [];
    let currentSelector = '';
    let inRule = false;
    let braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Track brace depth for nested rules
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      braceDepth += openBraces - closeBraces;
      
      // Start of a new rule
      if (!inRule && trimmed.includes('{')) {
        inRule = true;
        currentSelector = trimmed.replace('{', '').trim();
        currentRule = [line];
      }
      // Inside a rule
      else if (inRule) {
        currentRule.push(line);
        
        // End of the rule
        if (braceDepth === 0) {
          const ruleContent = currentRule.join('\n');
          const ruleKey = currentSelector + ':' + currentRule.slice(1, -1).join('').replace(/\s+/g, '');
          
          // Only add if we haven't seen this exact rule before
          if (!seenRules.has(ruleKey)) {
            seenRules.add(ruleKey);
            result.push(...currentRule);
          }
          
          // Reset for next rule
          inRule = false;
          currentRule = [];
          currentSelector = '';
        }
      }
      // Outside of any rule (comments, empty lines, etc.)
      else {
        result.push(line);
      }
    }
    
    // Handle any unclosed rule at the end
    if (currentRule.length > 0) {
      result.push(...currentRule);
    }

    return {
      css: result.join('\n'),
      description: `Deduplicated CSS rules, removed ${lines.length - result.length} duplicate lines`
    };
  }

  consolidateMediaQueries(css) {
    const mediaQueries = new Map();
    const lines = css.split('\n');
    const result = [];
    let currentMedia = null;
    let mediaContent = [];
    let inMediaQuery = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('@media')) {
        if (inMediaQuery && currentMedia) {
          // Save previous media query
          if (!mediaQueries.has(currentMedia)) {
            mediaQueries.set(currentMedia, []);
          }
          mediaQueries.get(currentMedia).push(...mediaContent);
        }
        
        currentMedia = trimmed;
        mediaContent = [];
        inMediaQuery = true;
      } else if (inMediaQuery && trimmed === '}' && mediaContent.length === 0) {
        // End of media query
        inMediaQuery = false;
        currentMedia = null;
      } else if (inMediaQuery) {
        mediaContent.push(line);
      } else {
        result.push(line);
      }
    }

    // Append consolidated media queries
    for (const [media, content] of mediaQueries.entries()) {
      result.push(media);
      result.push(...content);
      result.push('}');
      result.push('');
    }

    return {
      css: result.join('\n'),
      description: `Consolidated ${mediaQueries.size} media queries`
    };
  }

  optimizeSelectors(css) {
    try {
      // Apply safe selector and whitespace optimization
      const optimized = css
        .replace(/\s*{\s*/g, ' {\n  ') // Standardize opening braces with indentation
        .replace(/;\s*}/g, ';\n}') // Standardize closing braces with proper line breaks
        .replace(/,\s*(?![^)]*\))/g, ',\n') // Format multiple selectors (avoid breaking function params)
        .replace(/\s*>\s*/g, ' > ') // Standardize child selectors
        .replace(/\s*\+\s*/g, ' + ') // Standardize adjacent selectors
        .replace(/\s*~\s*/g, ' ~ ') // Standardize sibling selectors
        .replace(/\n\s*\n/g, '\n'); // Remove extra blank lines

      // Basic validation: ensure we still have selectors
      const hasSelectors = optimized.match(/[.#a-zA-Z][^{]*\{/);
      if (!hasSelectors && css.match(/[.#a-zA-Z][^{]*\{/)) {
        // If original had selectors but optimized doesn't, return original
        console.warn('Selector optimization may have corrupted CSS, returning original');
        return {
          css,
          description: 'Selector optimization skipped due to validation failure'
        };
      }

      return {
        css: optimized,
        description: 'Optimized selector formatting and whitespace'
      };
    } catch (error) {
      // Fallback to original CSS if optimization fails
      console.warn('Selector optimization failed, returning original:', error.message);
      return {
        css,
        description: 'Selector optimization failed, returned original'
      };
    }
  }

  minifyProperties(css) {
    try {
      // Apply safe whitespace and unit minification using proper regex with word boundaries
      const minified = css
        .replace(/:\s+/g, ': ') // Single space after colons
        .replace(/,\s+/g, ', ') // Single space after commas in values
        .replace(/\s+;/g, ';') // Remove spaces before semicolons
        // Fix the critical bug: use word boundaries to only match standalone zero values
        .replace(/\b0+(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)\b/g, '0');
      
      return {
        css: minified,
        description: 'Minified property values and removed unnecessary units from zero values'
      };
    } catch (error) {
      // Fallback to original CSS if minification fails
      console.warn('CSS minification failed, returning original:', error.message);
      return {
        css,
        description: 'CSS minification failed, returned original'
      };
    }
  }

  sortProperties(css) {
    // Sort CSS properties within rules for better gzip compression
    const propertyOrder = [
      'content', 'position', 'top', 'right', 'bottom', 'left', 'z-index',
      'display', 'flex', 'flex-direction', 'justify-content', 'align-items',
      'width', 'height', 'margin', 'padding', 'border', 'background',
      'color', 'font', 'text', 'transform', 'transition', 'animation'
    ];

    const lines = css.split('\n');
    const result = [];
    let currentRule = [];
    let inRule = false;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.endsWith('{')) {
        inRule = true;
        result.push(line);
      } else if (trimmed === '}' && inRule) {
        // Sort properties in current rule
        currentRule.sort((a, b) => {
          const aProperty = a.trim().split(':')[0];
          const bProperty = b.trim().split(':')[0];
          const aIndex = propertyOrder.findIndex(prop => aProperty.startsWith(prop));
          const bIndex = propertyOrder.findIndex(prop => bProperty.startsWith(prop));
          
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
        
        result.push(...currentRule);
        result.push(line);
        currentRule = [];
        inRule = false;
      } else if (inRule && trimmed.includes(':')) {
        currentRule.push(line);
      } else {
        result.push(line);
      }
    }

    return {
      css: result.join('\n'),
      description: 'Sorted CSS properties for better compression'
    };
  }

  // Create transformation pipelines for specific use cases
  createPipeline(name, transformationConfig) {
    this.transformations.set(name, {
      config: transformationConfig,
      transforms: transformationConfig.transforms || [],
      options: transformationConfig.options || {},
      created: new Date().toISOString()
    });

    return this;
  }

  // Execute a named pipeline
  async executePipeline(pipelineName, css, brandTokens = {}, options = {}) {
    const pipeline = this.transformations.get(pipelineName);
    if (!pipeline) {
      throw new Error(`Pipeline "${pipelineName}" not found`);
    }

    const pipelineOptions = { ...pipeline.options, ...options };
    const transformOrder = pipeline.transforms || this.options.transformOrder;

    return await this.composeTransformations(css, brandTokens, {
      ...pipelineOptions,
      transformOrder
    });
  }

  // Batch process multiple files
  async batchCompose(files, brandTokens = {}, options = {}) {
    const results = [];
    const batchStartTime = Date.now();

    for (const file of files) {
      try {
        const fileResult = await this.composeTransformations(
          file.css,
          brandTokens,
          { ...options, filePath: file.path }
        );

        results.push({
          file: file.path,
          ...fileResult,
          success: true
        });
      } catch (error) {
        results.push({
          file: file.path,
          error: error.message,
          success: false
        });
      }
    }

    return {
      results,
      summary: {
        totalFiles: files.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        totalChanges: results.reduce((sum, r) => sum + (r.changes?.length || 0), 0),
        processingTimeMs: Date.now() - batchStartTime
      }
    };
  }

  // Generate cache key for memoization
  generateCacheKey(css, brandTokens, options) {
    const content = css + JSON.stringify(brandTokens) + JSON.stringify(options);
    return require('crypto').createHash('md5').update(content).digest('hex');
  }

  // Utility methods
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  clearCache() {
    this.cache.clear();
    return this;
  }

  getAnalytics() {
    return {
      ...this.analytics,
      cacheSize: this.cache.size,
      cacheHitRate: this.analytics.cacheHits / Math.max(this.analytics.transformsApplied, 1)
    };
  }

  // Export composed CSS with all metadata
  exportComposition(result) {
    return {
      css: result.css,
      metadata: {
        composition: result.composition,
        transformations: result.transformations,
        changes: result.changes,
        recommendations: result.recommendations,
        analytics: result.analytics,
        timestamp: new Date().toISOString()
      }
    };
  }

  // Generate performance report
  generatePerformanceReport() {
    const analytics = this.getAnalytics();
    
    return {
      performance: {
        averageProcessingTime: analytics.processingTime / Math.max(analytics.transformsApplied, 1),
        cacheEfficiency: analytics.cacheHitRate,
        errorRate: analytics.errors.length / Math.max(analytics.transformsApplied, 1)
      },
      recommendations: [
        ...(analytics.cacheHitRate < 0.3 ? [{
          type: 'cache-optimization',
          message: 'Low cache hit rate detected. Consider enabling caching or reviewing input consistency.',
          severity: 'medium'
        }] : []),
        ...(analytics.errorRate > 0.1 ? [{
          type: 'error-rate',
          message: 'High error rate detected. Review transformation inputs and configurations.',
          severity: 'high'
        }] : [])
      ],
      analytics
    };
  }

  // CSS Validation and Safety Mechanisms
  validateCSSIntegrity(beforeCSS, afterCSS) {
    try {
      // Basic structure validation
      const beforeStructure = this.extractCSSStructure(beforeCSS);
      const afterStructure = this.extractCSSStructure(afterCSS);
      
      // Ensure we haven't lost any selectors
      if (beforeStructure.selectorCount > 0 && afterStructure.selectorCount === 0) {
        console.warn('CSS validation failed: All selectors were removed');
        return false;
      }
      
      // Ensure we haven't lost too many selectors (more than 10% loss is suspicious)
      if (afterStructure.selectorCount < beforeStructure.selectorCount * 0.9) {
        console.warn(`CSS validation failed: Too many selectors lost (${beforeStructure.selectorCount} -> ${afterStructure.selectorCount})`);
        return false;
      }
      
      // Ensure we haven't corrupted property declarations
      if (beforeStructure.propertyCount > 0 && afterStructure.propertyCount === 0) {
        console.warn('CSS validation failed: All properties were removed');
        return false;
      }
      
      // Check for malformed CSS (unmatched braces)
      if (afterStructure.braceBalance !== 0) {
        console.warn(`CSS validation failed: Unmatched braces (balance: ${afterStructure.braceBalance})`);
        return false;
      }
      
      // Check for orphaned properties (properties without selectors)
      if (afterStructure.orphanedProperties > 0) {
        console.warn(`CSS validation failed: Found ${afterStructure.orphanedProperties} orphaned properties`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.warn('CSS validation error:', error.message);
      return false;
    }
  }

  validateFinalCSS(originalCSS, finalCSS) {
    try {
      // More comprehensive final validation
      const validation = this.validateCSSIntegrity(originalCSS, finalCSS);
      if (!validation) {
        return false;
      }
      
      // Additional checks for final CSS
      const originalStructure = this.extractCSSStructure(originalCSS);
      const finalStructure = this.extractCSSStructure(finalCSS);
      
      // Ensure we haven't broken critical values (like pixel units in non-zero values)
      const pixelValueCheck = this.validatePixelValues(originalCSS, finalCSS);
      if (!pixelValueCheck) {
        console.warn('CSS validation failed: Critical pixel values were corrupted');
        return false;
      }
      
      // Ensure the CSS is still parseable by checking basic syntax
      if (!this.validateBasicSyntax(finalCSS)) {
        console.warn('CSS validation failed: Basic syntax validation failed');
        return false;
      }
      
      return true;
    } catch (error) {
      console.warn('Final CSS validation error:', error.message);
      return false;
    }
  }

  extractCSSStructure(css) {
    const lines = css.split('\n').map(line => line.trim()).filter(Boolean);
    let braceBalance = 0;
    let selectorCount = 0;
    let propertyCount = 0;
    let orphanedProperties = 0;
    let inRule = false;
    
    for (const line of lines) {
      if (line.includes('{')) {
        braceBalance++;
        inRule = true;
        // Check if this line has a selector before the brace
        const beforeBrace = line.split('{')[0].trim();
        if (beforeBrace && /[.#a-zA-Z]/.test(beforeBrace)) {
          selectorCount++;
        }
      }
      
      if (line.includes('}')) {
        braceBalance--;
        inRule = false;
      }
      
      // Count property declarations
      if (line.includes(':') && line.includes(';') && !line.includes('{')) {
        propertyCount++;
        // Check for orphaned properties (properties outside rules)
        if (!inRule && braceBalance === 0) {
          orphanedProperties++;
        }
      }
    }
    
    return {
      selectorCount,
      propertyCount,
      orphanedProperties,
      braceBalance
    };
  }

  validatePixelValues(originalCSS, finalCSS) {
    // Check that pixel values in the original are preserved in the final
    // This prevents the bug where "80px" becomes "80"
    const pixelPattern = /\b([1-9]\d*)px\b/g;
    const originalPixels = originalCSS.match(pixelPattern) || [];
    const finalPixels = finalCSS.match(pixelPattern) || [];
    
    // Count occurrences of each pixel value
    const originalCounts = {};
    const finalCounts = {};
    
    originalPixels.forEach(pixel => {
      originalCounts[pixel] = (originalCounts[pixel] || 0) + 1;
    });
    
    finalPixels.forEach(pixel => {
      finalCounts[pixel] = (finalCounts[pixel] || 0) + 1;
    });
    
    // Check if any significant pixel values were lost
    for (const pixel of Object.keys(originalCounts)) {
      if (!finalCounts[pixel] || finalCounts[pixel] < originalCounts[pixel]) {
        // Allow some loss due to legitimate optimization, but not complete loss
        if (finalCounts[pixel] === 0) {
          console.warn(`Critical pixel value lost: ${pixel} was completely removed`);
          return false;
        }
      }
    }
    
    return true;
  }

  validateBasicSyntax(css) {
    try {
      // Basic syntax checks
      const lines = css.split('\n');
      let braceDepth = 0;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Count braces
        for (const char of trimmed) {
          if (char === '{') braceDepth++;
          if (char === '}') braceDepth--;
          
          // Negative depth means extra closing braces
          if (braceDepth < 0) {
            return false;
          }
        }
        
        // Check for basic property syntax (if it has a colon, it should have a semicolon)
        if (trimmed.includes(':') && !trimmed.includes('{') && !trimmed.includes('}')) {
          if (!trimmed.endsWith(';') && trimmed !== '') {
            // This might be a multi-line property, which is ok
            continue;
          }
        }
      }
      
      // Final brace depth should be 0
      return braceDepth === 0;
    } catch (error) {
      return false;
    }
  }
}

module.exports = { CompositionalTransformSystem };