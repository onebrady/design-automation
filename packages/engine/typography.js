// Typography Scale System - Enforce modular scale system and typography consistency
const fs = require('fs');

class TypographyScaleSystem {
  constructor(options = {}) {
    this.options = {
      baseSize: 16, // Base font size in px
      scale: 1.25, // Modular scale ratio (perfect fourth)
      minScale: 0.75, // Minimum scale factor
      maxScale: 3.0, // Maximum scale factor
      unitPreference: 'rem', // 'rem', 'em', 'px'
      lineHeightScale: 1.5, // Base line height multiplier
      ...options
    };

    // Generate scale sizes
    this.generateScale();
  }

  generateScale() {
    // Generate modular scale
    this.scale = {
      'xs': this.calculateSize(-2),
      'sm': this.calculateSize(-1),
      'base': this.calculateSize(0),
      'lg': this.calculateSize(1),
      'xl': this.calculateSize(2),
      '2xl': this.calculateSize(3),
      '3xl': this.calculateSize(4),
      '4xl': this.calculateSize(5),
      '5xl': this.calculateSize(6),
      '6xl': this.calculateSize(7),
      '7xl': this.calculateSize(8),
      '8xl': this.calculateSize(9),
      '9xl': this.calculateSize(10)
    };

    // Generate line heights
    this.lineHeights = {
      'none': 1,
      'tight': 1.25,
      'snug': 1.375,
      'normal': 1.5,
      'relaxed': 1.625,
      'loose': 2
    };

    // Generate font weights
    this.fontWeights = {
      'thin': 100,
      'extralight': 200,
      'light': 300,
      'normal': 400,
      'medium': 500,
      'semibold': 600,
      'bold': 700,
      'extrabold': 800,
      'black': 900
    };
  }

  calculateSize(step) {
    const size = this.options.baseSize * Math.pow(this.options.scale, step);
    const clampedSize = Math.max(
      this.options.baseSize * this.options.minScale,
      Math.min(size, this.options.baseSize * this.options.maxScale)
    );
    
    switch (this.options.unitPreference) {
      case 'rem':
        return `${(clampedSize / 16).toFixed(3)}rem`;
      case 'em':
        return `${(clampedSize / this.options.baseSize).toFixed(3)}em`;
      case 'px':
        return `${Math.round(clampedSize)}px`;
      default:
        return `${(clampedSize / 16).toFixed(3)}rem`;
    }
  }

  // Analyze and transform typography in CSS
  transformTypography(css, brandTokens = {}) {
    const changes = [];
    let transformedCss = css;

    // Extract typography tokens from brand pack
    const typographyTokens = this.extractTypographyTokens(brandTokens);
    
    // Transform font-size declarations
    transformedCss = this.transformFontSizes(transformedCss, typographyTokens, changes);
    
    // Transform line-height declarations
    transformedCss = this.transformLineHeights(transformedCss, typographyTokens, changes);
    
    // Transform font-weight declarations
    transformedCss = this.transformFontWeights(transformedCss, typographyTokens, changes);
    
    // Add font family consistency
    transformedCss = this.transformFontFamilies(transformedCss, typographyTokens, changes);
    
    // Enforce typography hierarchy
    transformedCss = this.enforceTypographyHierarchy(transformedCss, changes);

    return {
      css: transformedCss,
      changes,
      scale: this.scale,
      recommendations: this.generateRecommendations(css, changes)
    };
  }

  extractTypographyTokens(brandTokens) {
    return {
      fontSizes: brandTokens.typography?.fontSizes || {},
      lineHeights: brandTokens.typography?.lineHeights || this.lineHeights,
      fontWeights: brandTokens.typography?.fontWeights || this.fontWeights,
      fontFamilies: brandTokens.typography?.fontFamilies || {}
    };
  }

  transformFontSizes(css, tokens, changes) {
    // Match font-size declarations with px, rem, or em values
    return css.replace(/font-size\s*:\s*([^;]+);/g, (match, value) => {
      const cleanValue = value.trim();
      
      // Try to find the closest modular scale size
      const scaleMatch = this.findClosestScaleSize(cleanValue);
      
      if (scaleMatch && tokens.fontSizes[scaleMatch.name]) {
        const tokenValue = `var(--font-size-${scaleMatch.name})`;
        changes.push({
          type: 'typography-scale',
          property: 'font-size',
          before: match,
          after: `font-size: ${tokenValue};`,
          location: 'font-size',
          scale: scaleMatch.name,
          originalSize: cleanValue
        });
        return `font-size: ${tokenValue};`;
      }

      // If no exact token match, suggest closest scale size
      if (scaleMatch) {
        const scaleValue = this.scale[scaleMatch.name];
        changes.push({
          type: 'typography-scale-suggestion',
          property: 'font-size',
          before: match,
          after: `font-size: ${scaleValue}; /* ${scaleMatch.name} */`,
          location: 'font-size',
          scale: scaleMatch.name,
          originalSize: cleanValue,
          suggestion: true
        });
        return `font-size: ${scaleValue}; /* Consider using ${scaleMatch.name} scale */`;
      }

      return match;
    });
  }

  transformLineHeights(css, tokens, changes) {
    return css.replace(/line-height\s*:\s*([^;]+);/g, (match, value) => {
      const cleanValue = value.trim();
      
      // Find closest line height token
      const lineHeightMatch = this.findClosestLineHeight(cleanValue);
      
      if (lineHeightMatch && tokens.lineHeights[lineHeightMatch]) {
        const tokenValue = `var(--line-height-${lineHeightMatch})`;
        changes.push({
          type: 'typography-line-height',
          property: 'line-height',
          before: match,
          after: `line-height: ${tokenValue};`,
          location: 'line-height',
          token: lineHeightMatch
        });
        return `line-height: ${tokenValue};`;
      }

      return match;
    });
  }

  transformFontWeights(css, tokens, changes) {
    return css.replace(/font-weight\s*:\s*([^;]+);/g, (match, value) => {
      const cleanValue = value.trim();
      
      // Map numeric and named font weights
      const weightMapping = {
        '100': 'thin',
        '200': 'extralight', 
        '300': 'light',
        '400': 'normal',
        '500': 'medium',
        '600': 'semibold',
        '700': 'bold',
        '800': 'extrabold',
        '900': 'black',
        'normal': 'normal',
        'bold': 'bold'
      };

      const mappedWeight = weightMapping[cleanValue];
      if (mappedWeight && tokens.fontWeights[mappedWeight]) {
        const tokenValue = `var(--font-weight-${mappedWeight})`;
        changes.push({
          type: 'typography-font-weight',
          property: 'font-weight',
          before: match,
          after: `font-weight: ${tokenValue};`,
          location: 'font-weight',
          weight: mappedWeight
        });
        return `font-weight: ${tokenValue};`;
      }

      return match;
    });
  }

  transformFontFamilies(css, tokens, changes) {
    return css.replace(/font-family\s*:\s*([^;]+);/g, (match, value) => {
      const cleanValue = value.trim();
      
      // Check for brand font families
      for (const [tokenName, tokenValue] of Object.entries(tokens.fontFamilies)) {
        if (cleanValue.includes(tokenValue) || cleanValue === `"${tokenValue}"`) {
          const brandToken = `var(--font-family-${tokenName})`;
          changes.push({
            type: 'typography-font-family',
            property: 'font-family',
            before: match,
            after: `font-family: ${brandToken};`,
            location: 'font-family',
            family: tokenName
          });
          return `font-family: ${brandToken};`;
        }
      }

      return match;
    });
  }

  enforceTypographyHierarchy(css, changes) {
    // Apply typography hierarchy rules for common elements
    const hierarchyRules = {
      'h1, .h1': { scale: '4xl', weight: 'bold', lineHeight: 'tight' },
      'h2, .h2': { scale: '3xl', weight: 'semibold', lineHeight: 'tight' },
      'h3, .h3': { scale: '2xl', weight: 'semibold', lineHeight: 'snug' },
      'h4, .h4': { scale: 'xl', weight: 'medium', lineHeight: 'snug' },
      'h5, .h5': { scale: 'lg', weight: 'medium', lineHeight: 'normal' },
      'h6, .h6': { scale: 'base', weight: 'medium', lineHeight: 'normal' },
      'body, p': { scale: 'base', weight: 'normal', lineHeight: 'normal' },
      'small, .small': { scale: 'sm', weight: 'normal', lineHeight: 'normal' },
      '.text-xs': { scale: 'xs', weight: 'normal', lineHeight: 'normal' }
    };

    let result = css;

    // Add typography hierarchy if not already present
    const hierarchyCSS = this.generateHierarchyCSS(hierarchyRules);
    if (hierarchyCSS && !css.includes('/* Typography Hierarchy */')) {
      result += '\n\n/* Typography Hierarchy */\n' + hierarchyCSS;
      changes.push({
        type: 'typography-hierarchy',
        property: 'hierarchy',
        before: '',
        after: hierarchyCSS,
        location: 'end-of-file',
        description: 'Added typography hierarchy rules'
      });
    }

    return result;
  }

  generateHierarchyCSS(rules) {
    let css = '';
    for (const [selector, styles] of Object.entries(rules)) {
      css += `${selector} {\n`;
      if (styles.scale) {
        css += `  font-size: var(--font-size-${styles.scale});\n`;
      }
      if (styles.weight) {
        css += `  font-weight: var(--font-weight-${styles.weight});\n`;
      }
      if (styles.lineHeight) {
        css += `  line-height: var(--line-height-${styles.lineHeight});\n`;
      }
      css += '}\n\n';
    }
    return css;
  }

  findClosestScaleSize(value) {
    const pxValue = this.convertToPx(value);
    if (!pxValue) return null;

    let closestMatch = null;
    let closestDistance = Infinity;

    for (const [name, scaleValue] of Object.entries(this.scale)) {
      const scalePx = this.convertToPx(scaleValue);
      if (scalePx) {
        const distance = Math.abs(pxValue - scalePx);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestMatch = { name, distance, scalePx };
        }
      }
    }

    // Only suggest if within 20% tolerance
    if (closestMatch && closestMatch.distance / pxValue <= 0.2) {
      return closestMatch;
    }

    return null;
  }

  findClosestLineHeight(value) {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return null;

    let closestMatch = null;
    let closestDistance = Infinity;

    for (const [name, lineHeight] of Object.entries(this.lineHeights)) {
      const distance = Math.abs(numericValue - lineHeight);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestMatch = name;
      }
    }

    // Only suggest if within 10% tolerance
    if (closestDistance / numericValue <= 0.1) {
      return closestMatch;
    }

    return null;
  }

  convertToPx(value) {
    const match = value.match(/^([0-9]*\.?[0-9]+)(px|rem|em)$/);
    if (!match) return null;

    const [, num, unit] = match;
    const numericValue = parseFloat(num);

    switch (unit) {
      case 'px':
        return numericValue;
      case 'rem':
        return numericValue * 16;
      case 'em':
        return numericValue * this.options.baseSize;
      default:
        return null;
    }
  }

  generateRecommendations(originalCss, changes) {
    const recommendations = [];

    // Check for font size consistency
    const fontSizeMatches = originalCss.match(/font-size\s*:\s*[^;]+;/g);
    if (fontSizeMatches && fontSizeMatches.length > 3) {
      const uniqueSizes = new Set(fontSizeMatches);
      if (uniqueSizes.size > 6) {
        recommendations.push({
          type: 'typography-consistency',
          message: `Found ${uniqueSizes.size} different font sizes. Consider using a modular scale for better consistency.`,
          severity: 'medium',
          suggestion: 'Use design tokens from the modular scale system'
        });
      }
    }

    // Check for line height consistency
    const lineHeightMatches = originalCss.match(/line-height\s*:\s*[^;]+;/g);
    if (lineHeightMatches && lineHeightMatches.length > 2) {
      const uniqueLineHeights = new Set(lineHeightMatches);
      if (uniqueLineHeights.size > 4) {
        recommendations.push({
          type: 'line-height-consistency',
          message: `Found ${uniqueLineHeights.size} different line heights. Consider standardizing line heights.`,
          severity: 'low',
          suggestion: 'Use consistent line height tokens'
        });
      }
    }

    // Check for missing typography hierarchy
    if (!originalCss.includes('h1') && !originalCss.includes('h2')) {
      recommendations.push({
        type: 'typography-hierarchy',
        message: 'No heading hierarchy detected. Consider adding consistent heading styles.',
        severity: 'medium',
        suggestion: 'Define h1-h6 styles using the modular scale'
      });
    }

    return recommendations;
  }

  // Generate CSS custom properties for the typography system
  generateCSSCustomProperties(brandTokens = {}) {
    let css = ':root {\n';
    css += '  /* Typography Scale */\n';
    
    // Font sizes
    for (const [name, size] of Object.entries(this.scale)) {
      css += `  --font-size-${name}: ${size};\n`;
    }
    
    css += '\n  /* Line Heights */\n';
    for (const [name, height] of Object.entries(this.lineHeights)) {
      css += `  --line-height-${name}: ${height};\n`;
    }
    
    css += '\n  /* Font Weights */\n';
    for (const [name, weight] of Object.entries(this.fontWeights)) {
      css += `  --font-weight-${name}: ${weight};\n`;
    }

    // Add brand font families if available
    if (brandTokens.typography?.fontFamilies) {
      css += '\n  /* Font Families */\n';
      for (const [name, family] of Object.entries(brandTokens.typography.fontFamilies)) {
        css += `  --font-family-${name}: ${family};\n`;
      }
    }
    
    css += '}\n';
    return css;
  }

  // Export the typography scale for use in other systems
  exportScale() {
    return {
      scale: this.scale,
      lineHeights: this.lineHeights,
      fontWeights: this.fontWeights,
      options: this.options
    };
  }
}

module.exports = { TypographyScaleSystem };