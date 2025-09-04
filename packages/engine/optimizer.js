// CSS Optimization and Minification - Performance-focused CSS processing and optimization
const fs = require('fs');

class CSSOptimizer {
  constructor(options = {}) {
    this.options = {
      // Optimization levels
      level: 2, // 0: none, 1: safe, 2: aggressive
      
      // Feature flags
      removeComments: true,
      removeWhitespace: true,
      mergeDuplicates: true,
      shortenValues: true,
      optimizeSelectors: true,
      consolidateMediaQueries: true,
      removeUnusedRules: false, // Requires usage analysis
      
      // Minification options
      preserveImportant: true,
      preserveCustomProperties: true,
      preserveKeyframes: true,
      
      // Performance options
      enableGzipAnalysis: true,
      generateSourceMap: false,
      
      ...options
    };

    this.optimizationStats = {
      originalSize: 0,
      optimizedSize: 0,
      compressionRatio: 0,
      optimizationsApplied: [],
      timeSpent: 0
    };
  }

  // Main optimization method
  optimize(css, options = {}) {
    const startTime = Date.now();
    const config = { ...this.options, ...options };
    
    this.optimizationStats.originalSize = css.length;
    let optimized = css;
    const changes = [];

    try {
      // Apply optimizations based on level
      if (config.level >= 1) {
        optimized = this.applySafeOptimizations(optimized, changes);
      }
      
      if (config.level >= 2) {
        optimized = this.applyAggressiveOptimizations(optimized, changes);
      }

      // Generate statistics
      this.optimizationStats.optimizedSize = optimized.length;
      this.optimizationStats.compressionRatio = 
        (this.optimizationStats.originalSize - this.optimizationStats.optimizedSize) / 
        this.optimizationStats.originalSize;
      this.optimizationStats.timeSpent = Date.now() - startTime;
      this.optimizationStats.optimizationsApplied = changes.map(c => c.type);

      return {
        css: optimized,
        changes,
        stats: this.optimizationStats,
        recommendations: this.generateOptimizationRecommendations(css, optimized)
      };

    } catch (error) {
      console.error('CSS optimization failed:', error.message);
      return {
        css,
        changes: [],
        stats: this.optimizationStats,
        error: error.message
      };
    }
  }

  applySafeOptimizations(css, changes) {
    let optimized = css;

    // Remove comments (safe)
    if (this.options.removeComments) {
      const result = this.removeComments(optimized);
      optimized = result.css;
      changes.push(result.change);
    }

    // Remove unnecessary whitespace (safe)
    if (this.options.removeWhitespace) {
      const result = this.removeWhitespace(optimized);
      optimized = result.css;
      changes.push(result.change);
    }

    // Shorten color values (safe)
    if (this.options.shortenValues) {
      const result = this.shortenValues(optimized);
      optimized = result.css;
      changes.push(result.change);
    }

    // Remove trailing semicolons (safe)
    const trailingResult = this.removeTrailingSemicolons(optimized);
    optimized = trailingResult.css;
    changes.push(trailingResult.change);

    // Optimize zero values (safe)
    const zeroResult = this.optimizeZeroValues(optimized);
    optimized = zeroResult.css;
    changes.push(zeroResult.change);

    return optimized;
  }

  applyAggressiveOptimizations(css, changes) {
    let optimized = css;

    // Merge duplicate rules (aggressive)
    if (this.options.mergeDuplicates) {
      const result = this.mergeDuplicateRules(optimized);
      optimized = result.css;
      changes.push(result.change);
    }

    // Optimize selectors (aggressive)
    if (this.options.optimizeSelectors) {
      const result = this.optimizeSelectors(optimized);
      optimized = result.css;
      changes.push(result.change);
    }

    // Consolidate media queries (aggressive)
    if (this.options.consolidateMediaQueries) {
      const result = this.consolidateMediaQueries(optimized);
      optimized = result.css;
      changes.push(result.change);
    }

    // Merge shorthand properties (aggressive)
    const shorthandResult = this.mergeShorthandProperties(optimized);
    optimized = shorthandResult.css;
    changes.push(shorthandResult.change);

    // Remove redundant properties (aggressive)
    const redundantResult = this.removeRedundantProperties(optimized);
    optimized = redundantResult.css;
    changes.push(redundantResult.change);

    return optimized;
  }

  // Individual optimization methods
  removeComments(css) {
    const originalSize = css.length;
    const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
    
    return {
      css: withoutComments,
      change: {
        type: 'remove-comments',
        before: originalSize,
        after: withoutComments.length,
        savings: originalSize - withoutComments.length,
        description: 'Removed CSS comments'
      }
    };
  }

  removeWhitespace(css) {
    const originalSize = css.length;
    const minified = css
      // Remove leading/trailing whitespace
      .trim()
      // Remove multiple spaces
      .replace(/\s+/g, ' ')
      // Remove spaces around braces and semicolons
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*;\s*/g, ';')
      .replace(/\s*:\s*/g, ':')
      .replace(/\s*,\s*/g, ',')
      // Remove spaces around operators
      .replace(/\s*>\s*/g, '>')
      .replace(/\s*\+\s*/g, '+')
      .replace(/\s*~\s*/g, '~')
      // Remove newlines
      .replace(/\n/g, '');

    return {
      css: minified,
      change: {
        type: 'remove-whitespace',
        before: originalSize,
        after: minified.length,
        savings: originalSize - minified.length,
        description: 'Removed unnecessary whitespace'
      }
    };
  }

  shortenValues(css) {
    const originalSize = css.length;
    const shortened = css
      // Shorten hex colors
      .replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/g, '#$1$2$3')
      // Convert named colors to shorter hex
      .replace(/\bwhite\b/g, '#fff')
      .replace(/\bblack\b/g, '#000')
      .replace(/\bred\b/g, '#f00')
      .replace(/\bgreen\b/g, '#008000')
      .replace(/\bblue\b/g, '#00f')
      // Remove unnecessary quotes from font names
      .replace(/font-family:\s*["']([^"',]+)["']/g, 'font-family:$1')
      // Shorten decimal values
      .replace(/(\d)\.0+(px|em|rem|%|s|ms)/g, '$1$2')
      .replace(/0\.(\d+)/g, '.$1');

    return {
      css: shortened,
      change: {
        type: 'shorten-values',
        before: originalSize,
        after: shortened.length,
        savings: originalSize - shortened.length,
        description: 'Shortened CSS values'
      }
    };
  }

  removeTrailingSemicolons(css) {
    const originalSize = css.length;
    const withoutTrailing = css.replace(/;(\s*})/g, '$1');
    
    return {
      css: withoutTrailing,
      change: {
        type: 'remove-trailing-semicolons',
        before: originalSize,
        after: withoutTrailing.length,
        savings: originalSize - withoutTrailing.length,
        description: 'Removed trailing semicolons'
      }
    };
  }

  optimizeZeroValues(css) {
    const originalSize = css.length;
    const optimized = css
      // Remove units from zero values
      .replace(/\b0+(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)/g, '0')
      // Simplify multiple zeros
      .replace(/\b0 0 0 0\b/g, '0')
      .replace(/\b0 0 0\b/g, '0 0')
      .replace(/\b(\d+px) 0 \1 0\b/g, '$1 0')
      .replace(/\b0 (\d+px) 0 \1\b/g, '0 $1');

    return {
      css: optimized,
      change: {
        type: 'optimize-zero-values',
        before: originalSize,
        after: optimized.length,
        savings: originalSize - optimized.length,
        description: 'Optimized zero values'
      }
    };
  }

  mergeDuplicateRules(css) {
    const originalSize = css.length;
    const rules = new Map();
    const blocks = this.parseBlocks(css);
    const merged = [];

    for (const block of blocks) {
      if (block.type === 'rule') {
        const selector = block.selector.trim();
        if (rules.has(selector)) {
          // Merge properties
          rules.get(selector).properties = {
            ...rules.get(selector).properties,
            ...block.properties
          };
        } else {
          rules.set(selector, block);
        }
      } else {
        merged.push(block.raw);
      }
    }

    // Reconstruct CSS from merged rules
    for (const [selector, rule] of rules.entries()) {
      const properties = Object.entries(rule.properties)
        .map(([prop, value]) => `${prop}:${value}`)
        .join(';');
      merged.push(`${selector}{${properties}}`);
    }

    const mergedCSS = merged.join('');

    return {
      css: mergedCSS,
      change: {
        type: 'merge-duplicate-rules',
        before: originalSize,
        after: mergedCSS.length,
        savings: originalSize - mergedCSS.length,
        description: 'Merged duplicate CSS rules'
      }
    };
  }

  optimizeSelectors(css) {
    const originalSize = css.length;
    const optimized = css
      // Remove unnecessary descendant selectors
      .replace(/\s+>/g, '>')
      .replace(/>\s+/g, '>')
      // Optimize pseudo-selectors
      .replace(/:nth-child\(1\)/g, ':first-child')
      .replace(/:nth-last-child\(1\)/g, ':last-child')
      // Remove universal selectors when redundant
      .replace(/\*\./g, '.')
      .replace(/\*#/g, '#')
      .replace(/\*\[/g, '[');

    return {
      css: optimized,
      change: {
        type: 'optimize-selectors',
        before: originalSize,
        after: optimized.length,
        savings: originalSize - optimized.length,
        description: 'Optimized CSS selectors'
      }
    };
  }

  consolidateMediaQueries(css) {
    const originalSize = css.length;
    const mediaRules = new Map();
    const nonMediaRules = [];
    const blocks = this.parseMediaQueries(css);

    for (const block of blocks) {
      if (block.type === 'media') {
        if (!mediaRules.has(block.media)) {
          mediaRules.set(block.media, []);
        }
        mediaRules.get(block.media).push(block.content);
      } else {
        nonMediaRules.push(block.content);
      }
    }

    // Reconstruct with consolidated media queries
    let consolidated = nonMediaRules.join('');
    for (const [media, contents] of mediaRules.entries()) {
      consolidated += `@media ${media}{${contents.join('')}}`;
    }

    return {
      css: consolidated,
      change: {
        type: 'consolidate-media-queries',
        before: originalSize,
        after: consolidated.length,
        savings: originalSize - consolidated.length,
        description: `Consolidated ${mediaRules.size} media queries`
      }
    };
  }

  mergeShorthandProperties(css) {
    const originalSize = css.length;
    let optimized = css;

    // Merge margin properties
    optimized = optimized.replace(
      /margin-top:([^;]+);margin-right:([^;]+);margin-bottom:([^;]+);margin-left:([^;]+)/g,
      'margin:$1 $2 $3 $4'
    );

    // Merge padding properties
    optimized = optimized.replace(
      /padding-top:([^;]+);padding-right:([^;]+);padding-bottom:([^;]+);padding-left:([^;]+)/g,
      'padding:$1 $2 $3 $4'
    );

    // Merge border-width properties
    optimized = optimized.replace(
      /border-top-width:([^;]+);border-right-width:([^;]+);border-bottom-width:([^;]+);border-left-width:([^;]+)/g,
      'border-width:$1 $2 $3 $4'
    );

    return {
      css: optimized,
      change: {
        type: 'merge-shorthand-properties',
        before: originalSize,
        after: optimized.length,
        savings: originalSize - optimized.length,
        description: 'Merged properties into shorthand notation'
      }
    };
  }

  removeRedundantProperties(css) {
    const originalSize = css.length;
    const blocks = this.parseBlocks(css);
    const optimized = [];

    for (const block of blocks) {
      if (block.type === 'rule') {
        const properties = new Map();
        
        // Parse properties and keep only the last declaration of each
        for (const [prop, value] of Object.entries(block.properties)) {
          properties.set(prop, value);
        }

        // Reconstruct rule without redundant properties
        const propertyString = Array.from(properties.entries())
          .map(([prop, value]) => `${prop}:${value}`)
          .join(';');
        
        optimized.push(`${block.selector}{${propertyString}}`);
      } else {
        optimized.push(block.raw);
      }
    }

    const optimizedCSS = optimized.join('');

    return {
      css: optimizedCSS,
      change: {
        type: 'remove-redundant-properties',
        before: originalSize,
        after: optimizedCSS.length,
        savings: originalSize - optimizedCSS.length,
        description: 'Removed redundant property declarations'
      }
    };
  }

  // Helper methods for parsing CSS
  parseBlocks(css) {
    const blocks = [];
    let current = '';
    let inBlock = false;
    let braceCount = 0;

    for (let i = 0; i < css.length; i++) {
      const char = css[i];
      current += char;

      if (char === '{') {
        braceCount++;
        if (!inBlock) {
          inBlock = true;
        }
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0 && inBlock) {
          // End of block
          blocks.push(this.parseBlock(current));
          current = '';
          inBlock = false;
        }
      }
    }

    if (current.trim()) {
      blocks.push({ type: 'other', raw: current });
    }

    return blocks;
  }

  parseBlock(blockString) {
    const braceIndex = blockString.indexOf('{');
    if (braceIndex === -1) {
      return { type: 'other', raw: blockString };
    }

    const selector = blockString.substring(0, braceIndex).trim();
    const propertyString = blockString.substring(braceIndex + 1, blockString.lastIndexOf('}')).trim();
    const properties = {};

    // Parse properties
    const propertyDeclarations = propertyString.split(';').filter(p => p.trim());
    for (const declaration of propertyDeclarations) {
      const colonIndex = declaration.indexOf(':');
      if (colonIndex !== -1) {
        const property = declaration.substring(0, colonIndex).trim();
        const value = declaration.substring(colonIndex + 1).trim();
        properties[property] = value;
      }
    }

    return {
      type: 'rule',
      selector,
      properties,
      raw: blockString
    };
  }

  parseMediaQueries(css) {
    const blocks = [];
    let i = 0;

    while (i < css.length) {
      const mediaIndex = css.indexOf('@media', i);
      
      if (mediaIndex === -1) {
        // No more media queries
        if (i < css.length) {
          blocks.push({
            type: 'other',
            content: css.substring(i)
          });
        }
        break;
      }

      // Add content before media query
      if (mediaIndex > i) {
        blocks.push({
          type: 'other',
          content: css.substring(i, mediaIndex)
        });
      }

      // Find media query bounds
      const mediaStart = mediaIndex;
      const braceStart = css.indexOf('{', mediaStart);
      const mediaCondition = css.substring(mediaStart + 6, braceStart).trim();

      // Find matching closing brace
      let braceCount = 1;
      let braceEnd = braceStart + 1;
      
      while (braceEnd < css.length && braceCount > 0) {
        if (css[braceEnd] === '{') braceCount++;
        if (css[braceEnd] === '}') braceCount--;
        braceEnd++;
      }

      blocks.push({
        type: 'media',
        media: mediaCondition,
        content: css.substring(braceStart + 1, braceEnd - 1)
      });

      i = braceEnd;
    }

    return blocks;
  }

  // Analysis and reporting methods
  generateOptimizationRecommendations(originalCSS, optimizedCSS) {
    const recommendations = [];
    const originalSize = originalCSS.length;
    const optimizedSize = optimizedCSS.length;
    const compressionRatio = (originalSize - optimizedSize) / originalSize;

    if (compressionRatio < 0.1) {
      recommendations.push({
        type: 'low-compression',
        message: 'Low compression ratio achieved. CSS may already be optimized or contain mostly essential code.',
        severity: 'info'
      });
    }

    if (originalCSS.match(/@import/g)?.length > 3) {
      recommendations.push({
        type: 'too-many-imports',
        message: 'Multiple @import statements detected. Consider concatenating CSS files for better performance.',
        severity: 'medium'
      });
    }

    if (originalCSS.match(/!important/g)?.length > 5) {
      recommendations.push({
        type: 'excessive-important',
        message: 'Excessive use of !important declarations. Review CSS specificity.',
        severity: 'medium'
      });
    }

    // Check for unused vendor prefixes
    const vendorPrefixes = originalCSS.match(/-webkit-|-moz-|-ms-|-o-/g);
    if (vendorPrefixes && vendorPrefixes.length > 10) {
      recommendations.push({
        type: 'vendor-prefixes',
        message: 'Many vendor prefixes detected. Consider using autoprefixer or reviewing browser support.',
        severity: 'low'
      });
    }

    return recommendations;
  }

  analyzeGzipCompression(css) {
    if (!this.options.enableGzipAnalysis) {
      return null;
    }

    try {
      const zlib = require('zlib');
      const compressed = zlib.gzipSync(css);
      
      return {
        originalSize: css.length,
        gzipSize: compressed.length,
        gzipRatio: compressed.length / css.length,
        estimatedSavings: css.length - compressed.length
      };
    } catch (error) {
      console.warn('Gzip analysis failed:', error.message);
      return null;
    }
  }

  generatePerformanceReport(results) {
    const gzipAnalysis = this.analyzeGzipCompression(results.css);
    
    return {
      optimization: {
        level: this.options.level,
        originalSize: this.optimizationStats.originalSize,
        optimizedSize: this.optimizationStats.optimizedSize,
        compressionRatio: this.optimizationStats.compressionRatio,
        processingTime: this.optimizationStats.timeSpent
      },
      gzip: gzipAnalysis,
      recommendations: results.recommendations,
      optimizations: this.optimizationStats.optimizationsApplied
    };
  }

  // Batch optimization for multiple files
  optimizeBatch(files, options = {}) {
    const results = [];
    const batchStartTime = Date.now();

    for (const file of files) {
      try {
        const result = this.optimize(file.css, options);
        results.push({
          file: file.path,
          ...result,
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
        totalSavings: results.reduce((sum, r) => sum + (r.stats?.originalSize - r.stats?.optimizedSize || 0), 0),
        processingTime: Date.now() - batchStartTime
      }
    };
  }
}

module.exports = { CSSOptimizer };