// JSX Transformation Engine
// Phase 1: Basic JSX className prop enhancement with brand token integration

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const generate = require('@babel/generator').default;

/**
 * JSX Enhancement Engine
 * Transforms JSX className props to use design tokens
 */
class JSXEnhancer {
  constructor(tokens = {}) {
    this.tokens = tokens;
    this.buildLookupMaps();
  }

  buildLookupMaps() {
    // Build color mapping
    this.colorMap = new Map();
    const roles = this.tokens?.colors?.roles || {};
    for (const [k, v] of Object.entries(roles)) {
      const val = typeof v === 'string' ? v : v.value;
      if (val) this.colorMap.set(val.toLowerCase(), k);
    }

    // Build spacing mapping for common Tailwind-like patterns
    this.spacingMap = new Map();
    const spacing = this.tokens?.spacing?.tokens || {};
    for (const [k, v] of Object.entries(spacing)) {
      const val = typeof v === 'string' ? v : v.value;
      if (val) {
        // Map pixel values to token names
        const pxValue = this.extractPixelValue(val);
        if (pxValue) {
          this.spacingMap.set(pxValue, k);
        }
      }
    }

    // Common Tailwind spacing mappings
    this.tailwindSpacingMap = new Map([
      ['p-1', { token: 'xs', value: '4px' }],
      ['p-2', { token: 'sm', value: '8px' }],
      ['p-3', { token: 'sm', value: '12px' }],
      ['p-4', { token: 'md', value: '16px' }],
      ['p-6', { token: 'lg', value: '24px' }],
      ['p-8', { token: 'xl', value: '32px' }],
      ['p-12', { token: '2xl', value: '48px' }],
      ['m-1', { token: 'xs', value: '4px' }],
      ['m-2', { token: 'sm', value: '8px' }],
      ['m-3', { token: 'sm', value: '12px' }],
      ['m-4', { token: 'md', value: '16px' }],
      ['m-6', { token: 'lg', value: '24px' }],
      ['m-8', { token: 'xl', value: '32px' }],
      ['m-12', { token: '2xl', value: '48px' }]
    ]);

    // Color class mappings
    this.tailwindColorMap = new Map([
      ['bg-blue-500', 'primary'],
      ['bg-blue-600', 'primary-dark'],
      ['bg-gray-100', 'surface'],
      ['bg-gray-200', 'surface-dark'],
      ['text-blue-500', 'primary'],
      ['text-blue-600', 'primary-dark'],
      ['text-gray-600', 'text-secondary'],
      ['text-gray-900', 'text'],
      ['border-blue-500', 'primary'],
      ['border-gray-300', 'border']
    ]);
  }

  extractPixelValue(cssValue) {
    const match = cssValue.match(/^(\d+(?:\.\d+)?)px$/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Main JSX enhancement function
   * @param {string} code - JSX code to enhance
   * @param {object} options - Enhancement options
   * @returns {object} - Enhanced code and changes
   */
  enhanceJSX(code, options = {}) {
    try {
      const changes = [];
      let ast;

      // Parse JSX code
      try {
        ast = parser.parse(code, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript']
        });
      } catch (parseError) {
        console.warn('JSX parsing failed:', parseError.message);
        return { code, changes: [], error: 'parse_error' };
      }

      // Track modifications
      let modified = false;

      // Traverse and transform className props
      traverse(ast, {
        JSXAttribute: (path) => {
          const { node } = path;
          
          // Only process className attributes
          if (!t.isJSXIdentifier(node.name) || node.name.name !== 'className') {
            return;
          }

          // Handle string literals
          if (t.isStringLiteral(node.value)) {
            const originalClasses = node.value.value;
            const enhancedClasses = this.enhanceClassString(originalClasses);
            
            if (enhancedClasses !== originalClasses) {
              node.value.value = enhancedClasses;
              modified = true;
              changes.push({
                type: 'jsx-classname-enhancement',
                before: originalClasses,
                after: enhancedClasses,
                location: 'jsx:className'
              });
            }
          }

          // Handle JSX expressions (template literals, etc.)
          if (t.isJSXExpressionContainer(node.value)) {
            const enhanced = this.enhanceJSXExpression(node.value.expression);
            if (enhanced) {
              node.value.expression = enhanced.expression;
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
      console.error('JSX enhancement error:', error);
      return {
        code,
        changes: [],
        error: error.message,
        success: false
      };
    }
  }

  /**
   * Enhance a className string with design tokens
   */
  enhanceClassString(classString) {
    if (!classString || typeof classString !== 'string') {
      return classString;
    }

    const classes = classString.split(/\s+/).filter(Boolean);
    const enhancedClasses = classes.map(cls => this.enhanceClass(cls));
    
    return enhancedClasses.join(' ');
  }

  /**
   * Enhance individual CSS class with design tokens
   */
  enhanceClass(className) {
    // Check for direct Tailwind color mappings
    if (this.tailwindColorMap.has(className)) {
      const tokenName = this.tailwindColorMap.get(className);
      return `agentic-${tokenName}`;
    }

    // Check for Tailwind spacing mappings
    if (this.tailwindSpacingMap.has(className)) {
      const { token } = this.tailwindSpacingMap.get(className);
      const prefix = className.startsWith('p-') ? 'padding' : 'margin';
      return `agentic-${prefix}-${token}`;
    }

    // Pattern matching for common CSS patterns
    
    // Background colors: bg-[color]-[shade]
    const bgColorMatch = className.match(/^bg-(\w+)-(\d+)$/);
    if (bgColorMatch) {
      const [, color, shade] = bgColorMatch;
      if (color === 'blue' && ['500', '600', '700'].includes(shade)) {
        return 'agentic-bg-primary';
      }
      if (color === 'gray' && ['100', '200'].includes(shade)) {
        return 'agentic-bg-surface';
      }
    }

    // Text colors: text-[color]-[shade]
    const textColorMatch = className.match(/^text-(\w+)-(\d+)$/);
    if (textColorMatch) {
      const [, color, shade] = textColorMatch;
      if (color === 'blue' && ['500', '600', '700'].includes(shade)) {
        return 'agentic-text-primary';
      }
      if (color === 'gray' && ['600', '700', '800', '900'].includes(shade)) {
        return 'agentic-text-secondary';
      }
    }

    // Border radius: rounded-[size]
    const roundedMatch = className.match(/^rounded-?(\w*)$/);
    if (roundedMatch) {
      const [, size] = roundedMatch;
      const radiusMap = {
        '': 'md',
        'sm': 'sm',
        'md': 'md', 
        'lg': 'lg',
        'xl': 'xl',
        'full': 'full'
      };
      if (radiusMap[size]) {
        return `agentic-radius-${radiusMap[size]}`;
      }
    }

    // Shadow classes: shadow-[size]
    const shadowMatch = className.match(/^shadow-?(\w*)$/);
    if (shadowMatch) {
      const [, size] = shadowMatch;
      const shadowMap = {
        '': 'md',
        'sm': 'sm',
        'md': 'md',
        'lg': 'lg',
        'xl': 'xl'
      };
      if (shadowMap[size]) {
        return `agentic-elevation-${shadowMap[size]}`;
      }
    }

    // Return original class if no enhancement found
    return className;
  }

  /**
   * Handle JSX expressions in className (template literals, etc.)
   */
  enhanceJSXExpression(expression) {
    const changes = [];

    // Handle template literals
    if (t.isTemplateLiteral(expression)) {
      let modified = false;
      
      expression.quasis.forEach((quasi, index) => {
        if (quasi.value && quasi.value.raw) {
          const original = quasi.value.raw;
          const enhanced = this.enhanceClassString(original);
          
          if (enhanced !== original) {
            quasi.value.raw = enhanced;
            quasi.value.cooked = enhanced;
            modified = true;
            changes.push({
              type: 'jsx-template-literal-enhancement',
              before: original,
              after: enhanced,
              location: `jsx:className[${index}]`
            });
          }
        }
      });

      if (modified) {
        return { expression, changes };
      }
    }

    // Handle conditional expressions (ternary operators)
    if (t.isConditionalExpression(expression)) {
      const enhanced = this.enhanceConditionalExpression(expression);
      if (enhanced) {
        return { expression: enhanced.expression, changes: enhanced.changes };
      }
    }

    // Handle binary expressions (string concatenation)
    if (t.isBinaryExpression(expression) && expression.operator === '+') {
      const enhanced = this.enhanceBinaryExpression(expression);
      if (enhanced) {
        return { expression: enhanced.expression, changes: enhanced.changes };
      }
    }

    return null;
  }

  /**
   * Handle conditional expressions (ternary operators)
   */
  enhanceConditionalExpression(expression) {
    const changes = [];
    let modified = false;

    // Enhance consequent (true branch)
    if (t.isStringLiteral(expression.consequent)) {
      const original = expression.consequent.value;
      const enhanced = this.enhanceClassString(original);
      if (enhanced !== original) {
        expression.consequent.value = enhanced;
        modified = true;
        changes.push({
          type: 'jsx-conditional-consequent-enhancement',
          before: original,
          after: enhanced,
          location: 'jsx:className'
        });
      }
    }

    // Enhance alternate (false branch)
    if (t.isStringLiteral(expression.alternate)) {
      const original = expression.alternate.value;
      const enhanced = this.enhanceClassString(original);
      if (enhanced !== original) {
        expression.alternate.value = enhanced;
        modified = true;
        changes.push({
          type: 'jsx-conditional-alternate-enhancement',
          before: original,
          after: enhanced,
          location: 'jsx:className'
        });
      }
    }

    if (modified) {
      return { expression, changes };
    }

    return null;
  }

  /**
   * Handle binary expressions in className
   */
  enhanceBinaryExpression(expression) {
    const changes = [];
    let modified = false;

    // Recursively handle string literals in binary expressions
    const enhanceNode = (node) => {
      if (t.isStringLiteral(node)) {
        const original = node.value;
        const enhanced = this.enhanceClassString(original);
        if (enhanced !== original) {
          node.value = enhanced;
          modified = true;
          changes.push({
            type: 'jsx-binary-expression-enhancement',
            before: original,
            after: enhanced,
            location: 'jsx:className'
          });
        }
      } else if (t.isBinaryExpression(node)) {
        enhanceNode(node.left);
        enhanceNode(node.right);
      }
    };

    enhanceNode(expression);

    if (modified) {
      return { expression, changes };
    }

    return null;
  }

  /**
   * Generate CSS for agentic classes
   */
  generateAgenticCSS(tokens = this.tokens) {
    const css = [];
    
    // Generate color utility classes
    const colors = tokens?.colors?.roles || {};
    for (const [name, value] of Object.entries(colors)) {
      const colorValue = typeof value === 'string' ? value : value.value;
      if (colorValue) {
        css.push(`.agentic-${name} { color: var(--color-${name}); }`);
        css.push(`.agentic-bg-${name} { background-color: var(--color-${name}); }`);
        css.push(`.agentic-border-${name} { border-color: var(--color-${name}); }`);
      }
    }

    // Generate spacing utility classes
    const spacing = tokens?.spacing?.tokens || {};
    for (const [name, value] of Object.entries(spacing)) {
      css.push(`.agentic-padding-${name} { padding: var(--spacing-${name}); }`);
      css.push(`.agentic-margin-${name} { margin: var(--spacing-${name}); }`);
      css.push(`.agentic-gap-${name} { gap: var(--spacing-${name}); }`);
    }

    // Generate radius utility classes
    const radii = tokens?.radii || {};
    for (const [name, value] of Object.entries(radii)) {
      css.push(`.agentic-radius-${name} { border-radius: var(--radius-${name}); }`);
    }

    // Generate elevation utility classes
    const elevation = tokens?.elevation || {};
    for (const [name, value] of Object.entries(elevation)) {
      css.push(`.agentic-elevation-${name} { box-shadow: var(--elevation-${name}); }`);
    }

    return css.join('\n');
  }
}

/**
 * Main JSX enhancement function
 */
function enhanceJSX({ code, tokens = {}, filePath = '', maxChanges = 5, options = {} }) {
  // Skip non-JSX files
  const isJSXFile = /\.(jsx|tsx)$/i.test(filePath) || /className\s*=/.test(code);
  if (!isJSXFile) {
    return { code, changes: [], skipped: 'not-jsx' };
  }

  // Safety exclusions
  const excluded = /node_modules|\/dist\b|\/build\b|\bvendor\b|\.gen\./i.test(filePath);
  if (excluded) {
    return { code, changes: [], skipped: 'excluded-path' };
  }

  // Check for ignore markers
  if (/agentic:\s*ignore|agentic-ignore-line/.test(code)) {
    return { code, changes: [], skipped: 'ignore-marker' };
  }

  const enhancer = new JSXEnhancer(tokens);
  const result = enhancer.enhanceJSX(code, options);

  // Limit changes if specified
  if (maxChanges && result.changes && result.changes.length > maxChanges) {
    result.changes = result.changes.slice(0, maxChanges);
    result.limited = true;
  }

  return result;
}

module.exports = {
  enhanceJSX,
  JSXEnhancer
};