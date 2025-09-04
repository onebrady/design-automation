// State Variations - Hover, active, disabled, focus, and loading states for interactive elements
const fs = require('fs');

class StateVariationSystem {
  constructor(options = {}) {
    this.options = {
      // Default state configurations
      hoverScale: 1.05,
      hoverLift: '2px',
      focusOutlineWidth: '2px',
      disabledOpacity: 0.6,
      activeScale: 0.95,
      loadingOpacity: 0.7,
      ...options
    };

    this.generateStateVariations();
  }

  generateStateVariations() {
    // Hover state variations
    this.hoverStates = {
      'lift': {
        transform: `translateY(-${this.options.hoverLift})`,
        boxShadow: 'var(--shadow-lg)',
        transition: 'transform var(--duration-fast) var(--easing-ease-out), box-shadow var(--duration-fast) var(--easing-ease-out)'
      },
      'scale': {
        transform: `scale(${this.options.hoverScale})`,
        transition: 'transform var(--duration-fast) var(--easing-ease-out)'
      },
      'glow': {
        boxShadow: '0 0 20px var(--color-primary-alpha-50)',
        transition: 'box-shadow var(--duration-normal) var(--easing-ease-out)'
      },
      'brighten': {
        filter: 'brightness(1.1)',
        transition: 'filter var(--duration-fast) var(--easing-ease-out)'
      },
      'slide': {
        transform: 'translateX(4px)',
        transition: 'transform var(--duration-fast) var(--easing-ease-out)'
      },
      'underline': {
        textDecoration: 'underline',
        textUnderlineOffset: '4px',
        transition: 'text-decoration var(--duration-fast) var(--easing-ease-out)'
      },
      'background': {
        backgroundColor: 'var(--color-primary-50)',
        transition: 'background-color var(--duration-fast) var(--easing-ease-out)'
      }
    };

    // Focus state variations
    this.focusStates = {
      'outline': {
        outline: `${this.options.focusOutlineWidth} solid var(--color-primary-500)`,
        outlineOffset: '2px',
        transition: 'outline var(--duration-fast) var(--easing-ease-out)'
      },
      'ring': {
        boxShadow: `0 0 0 ${this.options.focusOutlineWidth} var(--color-primary-alpha-50)`,
        transition: 'box-shadow var(--duration-fast) var(--easing-ease-out)'
      },
      'inset': {
        boxShadow: `inset 0 0 0 ${this.options.focusOutlineWidth} var(--color-primary-500)`,
        transition: 'box-shadow var(--duration-fast) var(--easing-ease-out)'
      },
      'border': {
        borderColor: 'var(--color-primary-500)',
        borderWidth: '2px',
        transition: 'border-color var(--duration-fast) var(--easing-ease-out)'
      }
    };

    // Active state variations
    this.activeStates = {
      'press': {
        transform: `scale(${this.options.activeScale})`,
        transition: 'transform var(--duration-fast) var(--easing-ease-in)'
      },
      'inset': {
        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow var(--duration-fast) var(--easing-ease-in)'
      },
      'darken': {
        filter: 'brightness(0.9)',
        transition: 'filter var(--duration-fast) var(--easing-ease-in)'
      },
      'background': {
        backgroundColor: 'var(--color-primary-700)',
        transition: 'background-color var(--duration-fast) var(--easing-ease-in)'
      }
    };

    // Disabled state variations
    this.disabledStates = {
      'fade': {
        opacity: this.options.disabledOpacity,
        pointerEvents: 'none',
        transition: 'opacity var(--duration-normal) var(--easing-ease-out)'
      },
      'grayscale': {
        filter: 'grayscale(1) opacity(0.6)',
        pointerEvents: 'none',
        transition: 'filter var(--duration-normal) var(--easing-ease-out)'
      },
      'strikethrough': {
        textDecoration: 'line-through',
        opacity: this.options.disabledOpacity,
        pointerEvents: 'none',
        transition: 'opacity var(--duration-normal) var(--easing-ease-out)'
      }
    };

    // Loading state variations
    this.loadingStates = {
      'pulse': {
        opacity: this.options.loadingOpacity,
        animation: 'pulse var(--duration-slower) var(--easing-ease-in-out) infinite',
        pointerEvents: 'none'
      },
      'skeleton': {
        background: 'linear-gradient(90deg, var(--color-gray-200) 25%, var(--color-gray-100) 50%, var(--color-gray-200) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-loading var(--duration-slower) ease-in-out infinite',
        color: 'transparent',
        pointerEvents: 'none'
      },
      'spinner': {
        position: 'relative',
        pointerEvents: 'none',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '20px',
          height: '20px',
          marginTop: '-10px',
          marginLeft: '-10px',
          border: '2px solid var(--color-gray-300)',
          borderTopColor: 'var(--color-primary-500)',
          borderRadius: '50%',
          animation: 'spin var(--duration-slowest) linear infinite'
        }
      },
      'fade': {
        opacity: this.options.loadingOpacity,
        transition: 'opacity var(--duration-normal) var(--easing-ease-out)',
        pointerEvents: 'none'
      }
    };
  }

  // Transform CSS to include state variations
  transformStateVariations(css, brandTokens = {}) {
    const changes = [];
    let transformedCss = css;

    // Extract state tokens from brand pack
    const stateTokens = this.extractStateTokens(brandTokens);

    // Add interactive states for buttons
    transformedCss = this.addButtonStates(transformedCss, stateTokens, changes);
    
    // Add interactive states for links
    transformedCss = this.addLinkStates(transformedCss, stateTokens, changes);
    
    // Add form element states
    transformedCss = this.addFormStates(transformedCss, stateTokens, changes);
    
    // Add card/component hover states
    transformedCss = this.addComponentStates(transformedCss, stateTokens, changes);
    
    // Add accessibility states
    transformedCss = this.addAccessibilityStates(transformedCss, stateTokens, changes);

    return {
      css: transformedCss,
      changes,
      states: {
        hover: this.hoverStates,
        focus: this.focusStates,
        active: this.activeStates,
        disabled: this.disabledStates,
        loading: this.loadingStates
      },
      recommendations: this.generateRecommendations(css, changes)
    };
  }

  extractStateTokens(brandTokens) {
    return {
      hover: brandTokens.states?.hover || this.hoverStates,
      focus: brandTokens.states?.focus || this.focusStates,
      active: brandTokens.states?.active || this.activeStates,
      disabled: brandTokens.states?.disabled || this.disabledStates,
      loading: brandTokens.states?.loading || this.loadingStates
    };
  }

  addButtonStates(css, tokens, changes) {
    // Check if button states already exist
    if (css.includes('/* Button States */')) {
      return css;
    }

    let stateCSS = '\n/* Button States */\n';
    
    // Primary button states
    stateCSS += 'button, .btn {\n';
    stateCSS += '  transition: all var(--duration-fast) var(--easing-ease-out);\n';
    stateCSS += '  cursor: pointer;\n';
    stateCSS += '}\n\n';

    // Hover states
    stateCSS += 'button:hover, .btn:hover {\n';
    stateCSS += `  transform: ${tokens.hover.lift?.transform || this.hoverStates.lift.transform};\n`;
    stateCSS += `  box-shadow: ${tokens.hover.lift?.boxShadow || this.hoverStates.lift.boxShadow};\n`;
    stateCSS += '}\n\n';

    // Focus states
    stateCSS += 'button:focus-visible, .btn:focus-visible {\n';
    stateCSS += `  outline: none;\n`;
    stateCSS += `  box-shadow: ${tokens.focus.ring?.boxShadow || this.focusStates.ring.boxShadow};\n`;
    stateCSS += '}\n\n';

    // Active states
    stateCSS += 'button:active, .btn:active {\n';
    stateCSS += `  transform: ${tokens.active.press?.transform || this.activeStates.press.transform};\n`;
    stateCSS += '}\n\n';

    // Disabled states
    stateCSS += 'button:disabled, .btn:disabled, .btn.disabled {\n';
    stateCSS += `  opacity: ${tokens.disabled.fade?.opacity || this.disabledStates.fade.opacity};\n`;
    stateCSS += `  pointer-events: none;\n`;
    stateCSS += `  cursor: not-allowed;\n`;
    stateCSS += '}\n\n';

    // Loading states
    stateCSS += 'button.loading, .btn.loading {\n';
    stateCSS += `  opacity: ${tokens.loading.fade?.opacity || this.loadingStates.fade.opacity};\n`;
    stateCSS += `  pointer-events: none;\n`;
    stateCSS += '}\n\n';

    changes.push({
      type: 'state-variations',
      component: 'button',
      before: '',
      after: stateCSS,
      location: 'end-of-file',
      description: 'Added comprehensive button state variations'
    });

    return css + stateCSS;
  }

  addLinkStates(css, tokens, changes) {
    // Check if link states already exist
    if (css.includes('/* Link States */')) {
      return css;
    }

    let stateCSS = '\n/* Link States */\n';
    
    stateCSS += 'a {\n';
    stateCSS += '  transition: all var(--duration-fast) var(--easing-ease-out);\n';
    stateCSS += '  text-decoration: none;\n';
    stateCSS += '}\n\n';

    // Hover states
    stateCSS += 'a:hover {\n';
    stateCSS += `  ${tokens.hover.underline ? 'text-decoration: underline;' : ''}\n`;
    stateCSS += `  ${tokens.hover.underline ? 'text-underline-offset: 4px;' : ''}\n`;
    stateCSS += '  color: var(--color-primary-600);\n';
    stateCSS += '}\n\n';

    // Focus states
    stateCSS += 'a:focus-visible {\n';
    stateCSS += `  outline: ${tokens.focus.outline?.outline || this.focusStates.outline.outline};\n`;
    stateCSS += `  outline-offset: ${tokens.focus.outline?.outlineOffset || this.focusStates.outline.outlineOffset};\n`;
    stateCSS += '}\n\n';

    // Active states
    stateCSS += 'a:active {\n';
    stateCSS += '  color: var(--color-primary-700);\n';
    stateCSS += '}\n\n';

    // Visited states
    stateCSS += 'a:visited {\n';
    stateCSS += '  color: var(--color-purple-600);\n';
    stateCSS += '}\n\n';

    changes.push({
      type: 'state-variations',
      component: 'link',
      before: '',
      after: stateCSS,
      location: 'end-of-file',
      description: 'Added comprehensive link state variations'
    });

    return css + stateCSS;
  }

  addFormStates(css, tokens, changes) {
    // Check if form states already exist
    if (css.includes('/* Form States */')) {
      return css;
    }

    let stateCSS = '\n/* Form States */\n';
    
    stateCSS += 'input, textarea, select {\n';
    stateCSS += '  transition: all var(--duration-fast) var(--easing-ease-out);\n';
    stateCSS += '}\n\n';

    // Focus states
    stateCSS += 'input:focus, textarea:focus, select:focus {\n';
    stateCSS += `  outline: none;\n`;
    stateCSS += `  border-color: var(--color-primary-500);\n`;
    stateCSS += `  box-shadow: ${tokens.focus.ring?.boxShadow || this.focusStates.ring.boxShadow};\n`;
    stateCSS += '}\n\n';

    // Invalid states
    stateCSS += 'input:invalid, textarea:invalid, select:invalid {\n';
    stateCSS += '  border-color: var(--color-red-500);\n';
    stateCSS += '}\n\n';

    stateCSS += 'input:invalid:focus, textarea:invalid:focus, select:invalid:focus {\n';
    stateCSS += '  box-shadow: 0 0 0 2px var(--color-red-alpha-50);\n';
    stateCSS += '}\n\n';

    // Valid states
    stateCSS += 'input:valid, textarea:valid, select:valid {\n';
    stateCSS += '  border-color: var(--color-green-500);\n';
    stateCSS += '}\n\n';

    // Disabled states
    stateCSS += 'input:disabled, textarea:disabled, select:disabled {\n';
    stateCSS += `  opacity: ${tokens.disabled.fade?.opacity || this.disabledStates.fade.opacity};\n`;
    stateCSS += '  background-color: var(--color-gray-100);\n';
    stateCSS += '  cursor: not-allowed;\n';
    stateCSS += '}\n\n';

    // Placeholder states
    stateCSS += 'input::placeholder, textarea::placeholder {\n';
    stateCSS += '  color: var(--color-gray-500);\n';
    stateCSS += '  transition: color var(--duration-fast) var(--easing-ease-out);\n';
    stateCSS += '}\n\n';

    stateCSS += 'input:focus::placeholder, textarea:focus::placeholder {\n';
    stateCSS += '  color: var(--color-gray-400);\n';
    stateCSS += '}\n\n';

    changes.push({
      type: 'state-variations',
      component: 'form',
      before: '',
      after: stateCSS,
      location: 'end-of-file',
      description: 'Added comprehensive form element state variations'
    });

    return css + stateCSS;
  }

  addComponentStates(css, tokens, changes) {
    // Check if component states already exist
    if (css.includes('/* Component States */')) {
      return css;
    }

    let stateCSS = '\n/* Component States */\n';
    
    // Card hover states
    stateCSS += '.card {\n';
    stateCSS += '  transition: all var(--duration-normal) var(--easing-ease-out);\n';
    stateCSS += '}\n\n';

    stateCSS += '.card:hover, .card.hoverable:hover {\n';
    stateCSS += `  transform: ${tokens.hover.lift?.transform || this.hoverStates.lift.transform};\n`;
    stateCSS += `  box-shadow: ${tokens.hover.lift?.boxShadow || this.hoverStates.lift.boxShadow};\n`;
    stateCSS += '}\n\n';

    // Interactive component states
    stateCSS += '.interactive {\n';
    stateCSS += '  transition: all var(--duration-fast) var(--easing-ease-out);\n';
    stateCSS += '  cursor: pointer;\n';
    stateCSS += '}\n\n';

    stateCSS += '.interactive:hover {\n';
    stateCSS += `  transform: ${tokens.hover.scale?.transform || this.hoverStates.scale.transform};\n`;
    stateCSS += '}\n\n';

    stateCSS += '.interactive:active {\n';
    stateCSS += `  transform: ${tokens.active.press?.transform || this.activeStates.press.transform};\n`;
    stateCSS += '}\n\n';

    // Loading state for components
    stateCSS += '.loading {\n';
    stateCSS += `  opacity: ${tokens.loading.fade?.opacity || this.loadingStates.fade.opacity};\n`;
    stateCSS += '  pointer-events: none;\n';
    stateCSS += '}\n\n';

    stateCSS += '.loading.skeleton {\n';
    stateCSS += '  background: linear-gradient(90deg, var(--color-gray-200) 25%, var(--color-gray-100) 50%, var(--color-gray-200) 75%);\n';
    stateCSS += '  background-size: 200% 100%;\n';
    stateCSS += '  animation: skeleton-loading var(--duration-slower) ease-in-out infinite;\n';
    stateCSS += '  color: transparent;\n';
    stateCSS += '}\n\n';

    changes.push({
      type: 'state-variations',
      component: 'generic',
      before: '',
      after: stateCSS,
      location: 'end-of-file',
      description: 'Added comprehensive component state variations'
    });

    return css + stateCSS;
  }

  addAccessibilityStates(css, tokens, changes) {
    // Check if accessibility states already exist
    if (css.includes('/* Accessibility States */')) {
      return css;
    }

    let stateCSS = '\n/* Accessibility States */\n';
    
    // Reduced motion support
    stateCSS += '@media (prefers-reduced-motion: reduce) {\n';
    stateCSS += '  *, *::before, *::after {\n';
    stateCSS += '    animation-duration: 0.01ms !important;\n';
    stateCSS += '    animation-iteration-count: 1 !important;\n';
    stateCSS += '    transition-duration: 0.01ms !important;\n';
    stateCSS += '  }\n';
    stateCSS += '}\n\n';

    // High contrast support
    stateCSS += '@media (prefers-contrast: high) {\n';
    stateCSS += '  button:focus-visible, .btn:focus-visible {\n';
    stateCSS += '    outline: 3px solid currentColor;\n';
    stateCSS += '    outline-offset: 2px;\n';
    stateCSS += '  }\n';
    stateCSS += '}\n\n';

    // Focus-visible polyfill support
    stateCSS += '.js-focus-visible button:focus:not(.focus-visible),\n';
    stateCSS += '.js-focus-visible .btn:focus:not(.focus-visible) {\n';
    stateCSS += '  outline: none;\n';
    stateCSS += '  box-shadow: none;\n';
    stateCSS += '}\n\n';

    // Screen reader only states
    stateCSS += '.sr-only {\n';
    stateCSS += '  position: absolute;\n';
    stateCSS += '  width: 1px;\n';
    stateCSS += '  height: 1px;\n';
    stateCSS += '  padding: 0;\n';
    stateCSS += '  margin: -1px;\n';
    stateCSS += '  overflow: hidden;\n';
    stateCSS += '  clip: rect(0, 0, 0, 0);\n';
    stateCSS += '  white-space: nowrap;\n';
    stateCSS += '  border: 0;\n';
    stateCSS += '}\n\n';

    stateCSS += '.sr-only:focus {\n';
    stateCSS += '  position: static;\n';
    stateCSS += '  width: auto;\n';
    stateCSS += '  height: auto;\n';
    stateCSS += '  margin: 0;\n';
    stateCSS += '  overflow: visible;\n';
    stateCSS += '  clip: auto;\n';
    stateCSS += '  white-space: normal;\n';
    stateCSS += '}\n\n';

    changes.push({
      type: 'accessibility-states',
      component: 'accessibility',
      before: '',
      after: stateCSS,
      location: 'end-of-file',
      description: 'Added comprehensive accessibility state variations'
    });

    return css + stateCSS;
  }

  generateRecommendations(originalCss, changes) {
    const recommendations = [];

    // Check for missing hover states on interactive elements
    if (originalCss.includes('button') && !originalCss.includes(':hover')) {
      recommendations.push({
        type: 'missing-hover-states',
        message: 'Interactive buttons found without hover states. This reduces user experience.',
        severity: 'medium',
        suggestion: 'Add hover state animations for better interactivity'
      });
    }

    // Check for missing focus states
    if ((originalCss.includes('button') || originalCss.includes('input')) && !originalCss.includes(':focus')) {
      recommendations.push({
        type: 'missing-focus-states',
        message: 'Interactive elements found without focus states. This affects accessibility.',
        severity: 'high',
        suggestion: 'Add focus-visible states for keyboard accessibility'
      });
    }

    // Check for missing disabled states
    if (originalCss.includes('button') && !originalCss.includes(':disabled')) {
      recommendations.push({
        type: 'missing-disabled-states',
        message: 'Buttons found without disabled states. Consider adding disabled styling.',
        severity: 'medium',
        suggestion: 'Add disabled state styling for better UX'
      });
    }

    // Check for accessibility concerns
    if (!originalCss.includes('prefers-reduced-motion')) {
      recommendations.push({
        type: 'missing-reduced-motion',
        message: 'No reduced motion preference handling found. This affects accessibility.',
        severity: 'high',
        suggestion: 'Add @media (prefers-reduced-motion: reduce) support'
      });
    }

    return recommendations;
  }

  // Generate CSS custom properties for state system
  generateCSSCustomProperties(brandTokens = {}) {
    let css = ':root {\n';
    css += '  /* State Variations */\n';
    
    // Hover state properties
    css += '  --hover-scale: 1.05;\n';
    css += '  --hover-lift: -2px;\n';
    css += '  --hover-transition: transform var(--duration-fast) var(--easing-ease-out);\n';
    
    // Focus state properties
    css += '  --focus-outline-width: 2px;\n';
    css += '  --focus-outline-color: var(--color-primary-500);\n';
    css += '  --focus-ring-color: var(--color-primary-alpha-50);\n';
    
    // Active state properties
    css += '  --active-scale: 0.95;\n';
    css += '  --active-transition: transform var(--duration-fast) var(--easing-ease-in);\n';
    
    // Disabled state properties
    css += '  --disabled-opacity: 0.6;\n';
    css += '  --disabled-filter: grayscale(1);\n';
    
    // Loading state properties
    css += '  --loading-opacity: 0.7;\n';
    css += '  --loading-animation-duration: var(--duration-slower);\n';
    
    css += '}\n';
    return css;
  }

  // Generate state utility classes
  generateStateUtilities() {
    let css = '/* State Utility Classes */\n';

    // Hover utilities
    for (const [name, styles] of Object.entries(this.hoverStates)) {
      css += `.hover-${name}:hover {\n`;
      for (const [prop, value] of Object.entries(styles)) {
        if (prop !== 'transition') {
          css += `  ${this.kebabCase(prop)}: ${value};\n`;
        }
      }
      css += `  transition: ${styles.transition || 'all var(--duration-fast) var(--easing-ease-out)'};\n`;
      css += '}\n\n';
    }

    // Focus utilities
    for (const [name, styles] of Object.entries(this.focusStates)) {
      css += `.focus-${name}:focus-visible {\n`;
      for (const [prop, value] of Object.entries(styles)) {
        css += `  ${this.kebabCase(prop)}: ${value};\n`;
      }
      css += '}\n\n';
    }

    // Active utilities
    for (const [name, styles] of Object.entries(this.activeStates)) {
      css += `.active-${name}:active {\n`;
      for (const [prop, value] of Object.entries(styles)) {
        css += `  ${this.kebabCase(prop)}: ${value};\n`;
      }
      css += '}\n\n';
    }

    // Disabled utilities
    for (const [name, styles] of Object.entries(this.disabledStates)) {
      css += `.disabled-${name}.disabled, .disabled-${name}:disabled {\n`;
      for (const [prop, value] of Object.entries(styles)) {
        css += `  ${this.kebabCase(prop)}: ${value};\n`;
      }
      css += '}\n\n';
    }

    // Loading utilities
    for (const [name, styles] of Object.entries(this.loadingStates)) {
      css += `.loading-${name}.loading {\n`;
      for (const [prop, value] of Object.entries(styles)) {
        if (prop !== '&::after') {
          css += `  ${this.kebabCase(prop)}: ${value};\n`;
        }
      }
      
      // Handle pseudo-element styles
      if (styles['&::after']) {
        css += '}\n\n';
        css += `.loading-${name}.loading::after {\n`;
        for (const [prop, value] of Object.entries(styles['&::after'])) {
          css += `  ${this.kebabCase(prop)}: ${value};\n`;
        }
      }
      css += '}\n\n';
    }

    return css;
  }

  // Helper to convert camelCase to kebab-case
  kebabCase(str) {
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  }

  // Export state variations
  exportStates() {
    return {
      hover: this.hoverStates,
      focus: this.focusStates,
      active: this.activeStates,
      disabled: this.disabledStates,
      loading: this.loadingStates,
      options: this.options
    };
  }
}

module.exports = { StateVariationSystem };