// Gradient System - Brand-aligned gradient generation and management
const fs = require('fs');

class GradientSystem {
  constructor(options = {}) {
    this.options = {
      // Default gradient directions
      directions: {
        'to-t': 'to top',
        'to-tr': 'to top right', 
        'to-r': 'to right',
        'to-br': 'to bottom right',
        'to-b': 'to bottom',
        'to-bl': 'to bottom left',
        'to-l': 'to left',
        'to-tl': 'to top left'
      },
      // Gradient types
      types: ['linear', 'radial', 'conic'],
      // Color stop positions
      stops: ['0%', '25%', '50%', '75%', '100%'],
      ...options
    };

    this.generatePresets();
  }

  generatePresets() {
    // Generate common gradient presets
    this.presets = {
      'primary': {
        type: 'linear',
        direction: 'to-br',
        colors: ['var(--color-primary-500)', 'var(--color-primary-700)']
      },
      'secondary': {
        type: 'linear', 
        direction: 'to-br',
        colors: ['var(--color-secondary-500)', 'var(--color-secondary-700)']
      },
      'accent': {
        type: 'linear',
        direction: 'to-r',
        colors: ['var(--color-accent-400)', 'var(--color-accent-600)']
      },
      'warm': {
        type: 'linear',
        direction: 'to-br',
        colors: ['var(--color-orange-400)', 'var(--color-red-600)']
      },
      'cool': {
        type: 'linear',
        direction: 'to-br', 
        colors: ['var(--color-blue-400)', 'var(--color-purple-600)']
      },
      'neutral': {
        type: 'linear',
        direction: 'to-b',
        colors: ['var(--color-gray-100)', 'var(--color-gray-300)']
      },
      'glass': {
        type: 'linear',
        direction: 'to-br',
        colors: ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.05)']
      },
      'rainbow': {
        type: 'linear',
        direction: 'to-r',
        colors: [
          'var(--color-red-500)', 
          'var(--color-orange-500)',
          'var(--color-yellow-500)',
          'var(--color-green-500)',
          'var(--color-blue-500)',
          'var(--color-purple-500)'
        ]
      }
    };

    // Generate radial gradient presets
    this.radialPresets = {
      'spotlight': {
        type: 'radial',
        shape: 'ellipse at center',
        colors: ['var(--color-primary-200)', 'transparent']
      },
      'vignette': {
        type: 'radial',
        shape: 'ellipse at center',
        colors: ['transparent 30%', 'rgba(0, 0, 0, 0.3) 70%']
      }
    };
  }

  // Transform CSS with gradient tokens
  transformGradients(css, brandTokens = {}) {
    const changes = [];
    let transformedCss = css;

    // Extract gradient tokens from brand pack
    const gradientTokens = this.extractGradientTokens(brandTokens);

    // Transform background gradients
    transformedCss = this.transformBackgroundGradients(transformedCss, gradientTokens, changes);
    
    // Add gradient utility classes
    transformedCss = this.addGradientUtilities(transformedCss, changes);
    
    // Optimize gradient syntax
    transformedCss = this.optimizeGradientSyntax(transformedCss, changes);

    return {
      css: transformedCss,
      changes,
      presets: { ...this.presets, ...this.radialPresets },
      recommendations: this.generateRecommendations(css, changes)
    };
  }

  extractGradientTokens(brandTokens) {
    return {
      presets: brandTokens.gradients?.presets || this.presets,
      colors: brandTokens.colors?.roles || {},
      directions: brandTokens.gradients?.directions || this.options.directions
    };
  }

  transformBackgroundGradients(css, tokens, changes) {
    // Match linear-gradient patterns
    let result = css.replace(/linear-gradient\s*\([^)]+\)/g, (match) => {
      const optimized = this.optimizeLinearGradient(match, tokens);
      if (optimized && optimized !== match) {
        changes.push({
          type: 'gradient-optimization',
          property: 'background',
          before: match,
          after: optimized,
          location: 'background-gradient'
        });
        return optimized;
      }
      return match;
    });

    // Match radial-gradient patterns  
    result = result.replace(/radial-gradient\s*\([^)]+\)/g, (match) => {
      const optimized = this.optimizeRadialGradient(match, tokens);
      if (optimized && optimized !== match) {
        changes.push({
          type: 'gradient-optimization',
          property: 'background',
          before: match,
          after: optimized,
          location: 'background-gradient'
        });
        return optimized;
      }
      return match;
    });

    // Transform gradient colors to use design tokens
    result = this.transformGradientColors(result, tokens, changes);

    return result;
  }

  optimizeLinearGradient(gradientString, tokens) {
    // Extract gradient parts
    const match = gradientString.match(/linear-gradient\s*\(\s*([^)]+)\s*\)/);
    if (!match) return gradientString;

    const content = match[1];
    const parts = this.parseGradientParts(content);
    
    if (!parts) return gradientString;

    // Check if this matches a preset
    const preset = this.findMatchingPreset(parts, tokens.presets);
    if (preset) {
      return `var(--gradient-${preset})`;
    }

    // Optimize direction
    let optimizedDirection = parts.direction;
    if (parts.direction && this.options.directions[parts.direction]) {
      optimizedDirection = this.options.directions[parts.direction];
    }

    // Reconstruct optimized gradient
    const colorStops = parts.colors.map(color => {
      const tokenColor = this.findColorToken(color, tokens.colors);
      return tokenColor || color;
    }).join(', ');

    return `linear-gradient(${optimizedDirection}, ${colorStops})`;
  }

  optimizeRadialGradient(gradientString, tokens) {
    // Similar optimization for radial gradients
    const match = gradientString.match(/radial-gradient\s*\(\s*([^)]+)\s*\)/);
    if (!match) return gradientString;

    const content = match[1];
    const parts = this.parseRadialGradientParts(content);
    
    if (!parts) return gradientString;

    // Check for preset match
    const preset = this.findMatchingRadialPreset(parts, tokens.presets);
    if (preset) {
      return `var(--gradient-${preset})`;
    }

    return gradientString;
  }

  parseGradientParts(content) {
    const parts = content.split(',').map(part => part.trim());
    
    let direction = null;
    let colors = [];
    
    // First part might be direction
    if (parts[0] && (parts[0].includes('deg') || parts[0].includes('to '))) {
      direction = parts.shift();
    }
    
    // Remaining parts are colors
    colors = parts;
    
    return { direction, colors };
  }

  parseRadialGradientParts(content) {
    const parts = content.split(',').map(part => part.trim());
    
    let shape = null;
    let colors = [];
    
    // First part might be shape/position
    if (parts[0] && (parts[0].includes('ellipse') || parts[0].includes('circle') || parts[0].includes('at '))) {
      shape = parts.shift();
    }
    
    colors = parts;
    
    return { shape, colors };
  }

  findMatchingPreset(parts, presets) {
    for (const [name, preset] of Object.entries(presets)) {
      if (preset.type === 'linear') {
        // Check if direction and colors match (simplified check)
        const directionMatch = !parts.direction || 
          parts.direction === this.options.directions[preset.direction] ||
          parts.direction === preset.direction;
        
        if (directionMatch && parts.colors.length === preset.colors.length) {
          return name;
        }
      }
    }
    return null;
  }

  findMatchingRadialPreset(parts, presets) {
    for (const [name, preset] of Object.entries(presets)) {
      if (preset.type === 'radial') {
        // Simplified radial matching
        if (parts.colors.length === preset.colors.length) {
          return name;
        }
      }
    }
    return null;
  }

  findColorToken(color, colorTokens) {
    // Check if color matches any brand color token
    for (const [tokenName, tokenValue] of Object.entries(colorTokens)) {
      if (typeof tokenValue === 'object' && tokenValue.value) {
        if (color.includes(tokenValue.value)) {
          return `var(--color-${tokenName})`;
        }
      } else if (typeof tokenValue === 'string') {
        if (color.includes(tokenValue)) {
          return `var(--color-${tokenName})`;
        }
      }
    }
    return null;
  }

  transformGradientColors(css, tokens, changes) {
    // Transform hex colors in gradients to use design tokens
    return css.replace(/(linear-gradient|radial-gradient)\s*\([^)]*#([0-9a-fA-F]{6})[^)]*/g, (match) => {
      let transformed = match;
      let hasChanges = false;

      // Find all hex colors in the gradient
      const hexMatches = match.match(/#([0-9a-fA-F]{6})/g);
      if (hexMatches) {
        hexMatches.forEach(hexColor => {
          const token = this.findColorToken(hexColor, tokens.colors);
          if (token) {
            transformed = transformed.replace(hexColor, token);
            hasChanges = true;
          }
        });
      }

      if (hasChanges) {
        changes.push({
          type: 'gradient-color-tokens',
          property: 'background',
          before: match,
          after: transformed,
          location: 'gradient-colors'
        });
      }

      return transformed;
    });
  }

  addGradientUtilities(css, changes) {
    // Check if utilities already exist
    if (css.includes('/* Gradient Utilities */')) {
      return css;
    }

    const utilities = this.generateGradientUtilityCSS();
    if (utilities) {
      changes.push({
        type: 'gradient-utilities',
        property: 'utilities',
        before: '',
        after: utilities,
        location: 'end-of-file',
        description: 'Added gradient utility classes'
      });
      return css + '\n\n' + utilities;
    }

    return css;
  }

  optimizeGradientSyntax(css, changes) {
    // Remove unnecessary gradient syntax
    let result = css;

    // Remove redundant 'to bottom' directions (default)
    result = result.replace(/linear-gradient\(\s*to bottom\s*,/g, 'linear-gradient(');
    
    // Optimize color stop positions when they're evenly distributed
    result = result.replace(/linear-gradient\(([^)]+)\)/g, (match, content) => {
      // Simplified optimization - could be more sophisticated
      if (content.includes('0%') && content.includes('100%')) {
        // Check if stops are evenly distributed and can be simplified
        const simplified = this.simplifyColorStops(content);
        if (simplified !== content) {
          changes.push({
            type: 'gradient-syntax-optimization',
            property: 'background',
            before: match,
            after: `linear-gradient(${simplified})`,
            location: 'gradient-optimization'
          });
          return `linear-gradient(${simplified})`;
        }
      }
      return match;
    });

    return result;
  }

  simplifyColorStops(content) {
    // Remove explicit 0% and 100% positions if they're the first/last colors
    const parts = content.split(',').map(part => part.trim());
    
    // Remove 0% from first color if present
    if (parts[0] && parts[0].includes(' 0%')) {
      parts[0] = parts[0].replace(' 0%', '');
    }
    
    // Remove 100% from last color if present
    const lastIndex = parts.length - 1;
    if (parts[lastIndex] && parts[lastIndex].includes(' 100%')) {
      parts[lastIndex] = parts[lastIndex].replace(' 100%', '');
    }
    
    return parts.join(', ');
  }

  generateGradientUtilityCSS() {
    let css = '/* Gradient Utilities */\n';

    // Generate utility classes for each preset
    for (const [name, preset] of Object.entries(this.presets)) {
      const gradientValue = this.generateGradientCSS(preset);
      css += `.bg-gradient-${name} {\n`;
      css += `  background: ${gradientValue};\n`;
      css += '}\n\n';

      // Text gradients
      css += `.text-gradient-${name} {\n`;
      css += `  background: ${gradientValue};\n`;
      css += '  -webkit-background-clip: text;\n';
      css += '  background-clip: text;\n';
      css += '  -webkit-text-fill-color: transparent;\n';
      css += '  color: transparent;\n';
      css += '}\n\n';
    }

    // Add radial gradient utilities
    for (const [name, preset] of Object.entries(this.radialPresets)) {
      const gradientValue = this.generateGradientCSS(preset);
      css += `.bg-gradient-${name} {\n`;
      css += `  background: ${gradientValue};\n`;
      css += '}\n\n';
    }

    // Direction utilities
    css += '/* Gradient Direction Utilities */\n';
    for (const [shortName, longName] of Object.entries(this.options.directions)) {
      css += `.bg-gradient-${shortName} {\n`;
      css += `  background: linear-gradient(${longName}, var(--gradient-from, transparent), var(--gradient-to, transparent));\n`;
      css += '}\n\n';
    }

    return css;
  }

  generateGradientCSS(preset) {
    const colors = preset.colors.join(', ');
    
    switch (preset.type) {
      case 'linear':
        const direction = this.options.directions[preset.direction] || preset.direction || 'to bottom';
        return `linear-gradient(${direction}, ${colors})`;
      
      case 'radial':
        const shape = preset.shape || 'ellipse at center';
        return `radial-gradient(${shape}, ${colors})`;
      
      case 'conic':
        const angle = preset.angle || 'from 0deg';
        return `conic-gradient(${angle}, ${colors})`;
      
      default:
        return `linear-gradient(to bottom, ${colors})`;
    }
  }

  generateRecommendations(originalCss, changes) {
    const recommendations = [];

    // Check for gradient performance issues
    const gradientCount = (originalCss.match(/gradient\(/g) || []).length;
    if (gradientCount > 5) {
      recommendations.push({
        type: 'gradient-performance',
        message: `Found ${gradientCount} gradients. Consider optimizing or caching gradients for better performance.`,
        severity: 'medium',
        suggestion: 'Use gradient utility classes or CSS variables for reusable gradients'
      });
    }

    // Check for inconsistent gradient directions
    const directionMatches = originalCss.match(/to (top|right|bottom|left|top right|bottom right|bottom left|top left)/g);
    if (directionMatches && new Set(directionMatches).size > 3) {
      recommendations.push({
        type: 'gradient-consistency',
        message: 'Multiple gradient directions found. Consider standardizing gradient directions.',
        severity: 'low',
        suggestion: 'Use consistent gradient directions from the design system'
      });
    }

    // Check for missing fallback colors
    const backgroundGradients = originalCss.match(/background:\s*[^;]*gradient[^;]*/g);
    if (backgroundGradients) {
      backgroundGradients.forEach(bg => {
        if (!bg.includes('#') && !bg.includes('rgb') && !bg.includes('var(')) {
          recommendations.push({
            type: 'gradient-fallback',
            message: 'Gradient found without fallback color. Consider adding a solid color fallback.',
            severity: 'medium',
            suggestion: 'Add background-color before gradient declarations'
          });
        }
      });
    }

    return recommendations;
  }

  // Generate CSS custom properties for gradient system
  generateCSSCustomProperties(brandTokens = {}) {
    let css = ':root {\n';
    css += '  /* Gradient Presets */\n';
    
    for (const [name, preset] of Object.entries(this.presets)) {
      const gradientValue = this.generateGradientCSS(preset);
      css += `  --gradient-${name}: ${gradientValue};\n`;
    }

    for (const [name, preset] of Object.entries(this.radialPresets)) {
      const gradientValue = this.generateGradientCSS(preset);  
      css += `  --gradient-${name}: ${gradientValue};\n`;
    }

    // Add gradient color variables for utility classes
    css += '\n  /* Gradient Color Variables */\n';
    css += '  --gradient-from: transparent;\n';
    css += '  --gradient-to: transparent;\n';
    
    css += '}\n';
    return css;
  }

  // Generate brand-specific gradients from color palette
  generateBrandGradients(colorPalette) {
    const brandGradients = {};

    // Generate gradients for each primary color
    if (colorPalette.primary) {
      brandGradients['primary'] = {
        type: 'linear',
        direction: 'to-br',
        colors: [`var(--color-primary-400)`, `var(--color-primary-600)`]
      };
    }

    if (colorPalette.secondary) {
      brandGradients['secondary'] = {
        type: 'linear',
        direction: 'to-r',
        colors: [`var(--color-secondary-400)`, `var(--color-secondary-600)`]
      };
    }

    // Generate complementary gradients
    if (colorPalette.primary && colorPalette.secondary) {
      brandGradients['brand'] = {
        type: 'linear', 
        direction: 'to-br',
        colors: [`var(--color-primary-500)`, `var(--color-secondary-500)`]
      };
    }

    return brandGradients;
  }

  // Export gradient system data
  exportGradients() {
    return {
      presets: this.presets,
      radialPresets: this.radialPresets,
      directions: this.options.directions,
      options: this.options
    };
  }
}

module.exports = { GradientSystem };