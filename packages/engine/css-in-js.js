// CSS-in-JS Transformation Engine
// Phase 2: Support for styled-components, emotion, and template literal CSS

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const generate = require('@babel/generator').default;

/**
 * CSS-in-JS Enhancement Engine
 * Transforms template literal CSS and CSS-in-JS libraries to use design tokens
 */
class CSSinJSEnhancer {
  constructor(tokens = {}) {
    this.tokens = tokens;
    this.buildCSSMaps();
  }

  buildCSSMaps() {
    // Build color mapping for CSS values
    this.cssColorMap = new Map();
    const roles = this.tokens?.colors?.roles || {};
    for (const [k, v] of Object.entries(roles)) {
      const val = typeof v === 'string' ? v : v.value;
      if (val) {
        this.cssColorMap.set(val.toLowerCase(), `var(--color-${k})`);
      }
    }

    // Build spacing mapping
    this.cssSpacingMap = new Map();
    const spacing = this.tokens?.spacing?.tokens || {};
    for (const [k, v] of Object.entries(spacing)) {
      const val = typeof v === 'string' ? v : v.value;
      if (val) {
        this.cssSpacingMap.set(val, `var(--spacing-${k})`);
      }
    }

    // Build common CSS patterns
    this.cssPatternMap = new Map([
      // Colors
      ['#1B3668', 'var(--color-primary)'],
      ['#0F2347', 'var(--color-primary-dark)'],
      ['#2A4F8F', 'var(--color-secondary)'],
      ['#F8FAFC', 'var(--color-surface)'],
      ['#1A1A1A', 'var(--color-surface-dark)'],
      ['#212529', 'var(--color-text)'],
      ['#6C757D', 'var(--color-text-secondary)'],
      ['#DEE2E6', 'var(--color-border)'],
      
      // Spacing
      ['4px', 'var(--spacing-xs)'],
      ['8px', 'var(--spacing-sm)'],
      ['16px', 'var(--spacing-md)'],
      ['24px', 'var(--spacing-lg)'],
      ['32px', 'var(--spacing-xl)'],
      ['48px', 'var(--spacing-2xl)'],
      
      // Border radius
      ['4px', 'var(--radius-sm)'],
      ['6px', 'var(--radius-md)'],
      ['8px', 'var(--radius-lg)'],
      ['12px', 'var(--radius-xl)'],
      
      // Box shadows
      ['0 1px 3px rgba(0,0,0,0.12)', 'var(--elevation-sm)'],
      ['0 4px 6px rgba(0,0,0,0.1)', 'var(--elevation-md)'],
      ['0 10px 15px rgba(0,0,0,0.1)', 'var(--elevation-lg)'],
      ['0 20px 25px rgba(0,0,0,0.1)', 'var(--elevation-xl)']
    ]);
  }

  /**
   * Main CSS-in-JS enhancement function
   */
  enhanceCSSinJS(code, options = {}) {
    try {
      const changes = [];
      let ast;

      // Parse JavaScript/JSX code
      try {
        ast = parser.parse(code, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript', 'decorators-legacy']
        });
      } catch (parseError) {
        console.warn('CSS-in-JS parsing failed:', parseError.message);
        return { code, changes: [], error: 'parse_error' };
      }

      let modified = false;

      // Traverse and transform CSS-in-JS patterns
      traverse(ast, {
        TaggedTemplateExpression: (path) => {
          const enhanced = this.enhanceTaggedTemplate(path.node);
          if (enhanced) {
            path.replaceWith(enhanced.node);
            modified = true;
            changes.push(...enhanced.changes);
          }
        },

        TemplateLiteral: (path) => {
          // Only process template literals that look like CSS
          if (this.looksLikeCSS(path.node)) {
            const enhanced = this.enhanceTemplateLiteralCSS(path.node);
            if (enhanced) {
              path.replaceWith(enhanced.node);
              modified = true;
              changes.push(...enhanced.changes);
            }
          }
        },

        JSXAttribute: (path) => {
          // Handle emotion's css prop
          if (t.isJSXIdentifier(path.node.name) && path.node.name.name === 'css') {
            const enhanced = this.enhanceJSXCSSProp(path.node);
            if (enhanced) {
              path.node.value = enhanced.node.value;
              modified = true;
              changes.push(...enhanced.changes);
            }
          }
        }
      });

      // Generate enhanced code if modified
      if (modified) {
        const output = generate(ast, {
          retainLines: true,
          compact: false
        });
        return {
          code: output.code,
          changes,
          success: true
        };
      }

      return { code, changes, success: true };

    } catch (error) {
      console.error('CSS-in-JS enhancement error:', error);
      return {
        code,
        changes: [],
        error: error.message,
        success: false
      };
    }
  }

  /**
   * Enhance tagged template expressions (styled-components, emotion)
   */
  enhanceTaggedTemplate(node) {
    if (!t.isTaggedTemplateExpression(node)) return null;

    const changes = [];
    let modified = false;

    // Check for styled-components patterns
    if (this.isStyledComponentsTag(node.tag)) {
      const enhanced = this.enhanceTemplateLiteralCSS(node.quasi);
      if (enhanced) {
        node.quasi = enhanced.node;
        modified = true;
        changes.push(...enhanced.changes.map(c => ({
          ...c,
          type: 'styled-components-css-enhancement',
          location: 'styled-components'
        })));
      }
    }

    // Check for emotion css`` patterns
    if (this.isEmotionCSSTag(node.tag)) {
      const enhanced = this.enhanceTemplateLiteralCSS(node.quasi);
      if (enhanced) {
        node.quasi = enhanced.node;
        modified = true;
        changes.push(...enhanced.changes.map(c => ({
          ...c,
          type: 'emotion-css-enhancement', 
          location: 'emotion'
        })));
      }
    }

    return modified ? { node, changes } : null;
  }

  /**
   * Enhance template literal CSS content
   */
  enhanceTemplateLiteralCSS(node) {
    if (!t.isTemplateLiteral(node)) return null;

    const changes = [];
    let modified = false;

    // Process each quasi (string part) of the template literal
    node.quasis.forEach((quasi, index) => {
      if (quasi.value && quasi.value.raw) {
        const originalCSS = quasi.value.raw;
        const enhancedCSS = this.enhanceCSSString(originalCSS);
        
        if (enhancedCSS !== originalCSS) {
          quasi.value.raw = enhancedCSS;
          quasi.value.cooked = enhancedCSS;
          modified = true;
          changes.push({
            type: 'css-template-literal-enhancement',
            before: originalCSS,
            after: enhancedCSS,
            location: `template-literal[${index}]`
          });
        }
      }
    });

    return modified ? { node, changes } : null;
  }

  /**
   * Enhance JSX css prop (emotion)
   */
  enhanceJSXCSSProp(node) {
    if (!t.isJSXAttribute(node) || !t.isJSXExpressionContainer(node.value)) {
      return null;
    }

    const expression = node.value.expression;
    
    // Handle tagged template expressions in css prop
    if (t.isTaggedTemplateExpression(expression)) {
      const enhanced = this.enhanceTaggedTemplate(expression);
      if (enhanced) {
        return {
          node: t.jsxAttribute(
            node.name,
            t.jsxExpressionContainer(enhanced.node)
          ),
          changes: enhanced.changes
        };
      }
    }

    return null;
  }

  /**
   * Enhance CSS string content
   */
  enhanceCSSString(cssString) {
    if (!cssString || typeof cssString !== 'string') {
      return cssString;
    }

    let enhanced = cssString;

    // Direct color value replacements
    this.cssColorMap.forEach((token, color) => {
      // Match color values in CSS properties
      const colorRegex = new RegExp(`(color|background-color|border-color|fill|stroke)\\s*:\\s*${this.escapeRegExp(color)}`, 'gi');
      enhanced = enhanced.replace(colorRegex, `$1: ${token}`);
      
      // Match hex colors specifically
      if (color.startsWith('#')) {
        const hexRegex = new RegExp(this.escapeRegExp(color), 'gi');
        enhanced = enhanced.replace(hexRegex, token);
      }
    });

    // Spacing value replacements
    this.cssSpacingMap.forEach((token, spacing) => {
      // Match common spacing properties
      const spacingRegex = new RegExp(
        `(padding|margin|gap|top|right|bottom|left|width|height|max-width|max-height|min-width|min-height)\\s*:\\s*${this.escapeRegExp(spacing)}(?![\\d])`, 
        'gi'
      );
      enhanced = enhanced.replace(spacingRegex, `$1: ${token}`);
    });

    // Pattern-based replacements
    this.cssPatternMap.forEach((token, pattern) => {
      enhanced = enhanced.replace(new RegExp(this.escapeRegExp(pattern), 'g'), token);
    });

    return enhanced;
  }

  /**
   * Check if tagged template looks like styled-components
   */
  isStyledComponentsTag(tag) {
    // styled.div, styled(Component), styled.div.withConfig()
    if (t.isMemberExpression(tag)) {
      return t.isIdentifier(tag.object) && tag.object.name === 'styled';
    }
    
    // styled()
    if (t.isCallExpression(tag)) {
      return t.isIdentifier(tag.callee) && tag.callee.name === 'styled';
    }

    return false;
  }

  /**
   * Check if tagged template is emotion css
   */
  isEmotionCSSTag(tag) {
    return t.isIdentifier(tag) && tag.name === 'css';
  }

  /**
   * Check if template literal contains CSS
   */
  looksLikeCSS(node) {
    if (!t.isTemplateLiteral(node) || node.quasis.length === 0) {
      return false;
    }

    const cssContent = node.quasis.map(q => q.value.raw).join('');
    
    // Look for CSS patterns
    return /(?:color|background|padding|margin|border|font|width|height|display|position|flex)\s*:/.test(cssContent) ||
           /(?:@media|@keyframes|@supports)/.test(cssContent) ||
           /(?:#[0-9a-fA-F]{3,6}|rgba?\(|hsla?\()/.test(cssContent);
  }

  /**
   * Escape special regex characters
   */
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Generate runtime token injection code
   */
  generateTokenInjection(tokens = this.tokens) {
    const tokenVars = [];
    
    // Color tokens
    const colors = tokens?.colors?.roles || {};
    for (const [name, value] of Object.entries(colors)) {
      const colorValue = typeof value === 'string' ? value : value.value;
      if (colorValue) {
        tokenVars.push(`  '--color-${name}': '${colorValue}'`);
      }
    }

    // Spacing tokens  
    const spacing = tokens?.spacing?.tokens || {};
    for (const [name, value] of Object.entries(spacing)) {
      const spacingValue = typeof value === 'string' ? value : value.value;
      if (spacingValue) {
        tokenVars.push(`  '--spacing-${name}': '${spacingValue}'`);
      }
    }

    return `
// Agentic Design Tokens - Runtime Injection
const agenticTokens = {
${tokenVars.join(',\n')}
};

// Inject tokens into document root
if (typeof document !== 'undefined') {
  const root = document.documentElement;
  Object.entries(agenticTokens).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
}
`;
  }
}

/**
 * Main CSS-in-JS enhancement function
 */
function enhanceCSSinJS({ code, tokens = {}, filePath = '', maxChanges = 10, options = {} }) {
  // Skip non-JS/JSX files unless forced
  const isJSFile = /\.(js|jsx|ts|tsx)$/i.test(filePath) || /styled|css`|emotion/.test(code);
  if (!isJSFile && !options.force) {
    return { code, changes: [], skipped: 'not-css-in-js' };
  }

  // Safety exclusions
  const excluded = /node_modules|\/dist\b|\/build\b|\bvendor\b|\.gen\./i.test(filePath);
  if (excluded) {
    return { code, changes: [], skipped: 'excluded-path' };
  }

  // Check for ignore markers
  if (/agentic:\s*ignore|agentic-ignore-css-in-js/.test(code)) {
    return { code, changes: [], skipped: 'ignore-marker' };
  }

  const enhancer = new CSSinJSEnhancer(tokens);
  const result = enhancer.enhanceCSSinJS(code, options);

  // Limit changes if specified
  if (maxChanges && result.changes && result.changes.length > maxChanges) {
    result.changes = result.changes.slice(0, maxChanges);
    result.limited = true;
  }

  return result;
}

module.exports = {
  enhanceCSSinJS,
  CSSinJSEnhancer
};