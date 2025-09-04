// Animation Tokens - Transition and animation presets for consistent motion design
const fs = require('fs');

class AnimationTokenSystem {
  constructor(options = {}) {
    this.options = {
      // Easing curves based on design system best practices
      easingCurves: {
        'ease-out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'ease-in': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)', 
        'ease-in-out': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
        'ease-back': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ease-elastic': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'ease-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      // Duration scales
      durations: {
        'instant': '0ms',
        'fast': '150ms',
        'normal': '300ms', 
        'slow': '500ms',
        'slower': '750ms',
        'slowest': '1000ms'
      },
      // Animation presets
      presets: {
        'fade-in': { duration: 'normal', easing: 'ease-out', from: 'opacity: 0', to: 'opacity: 1' },
        'fade-out': { duration: 'normal', easing: 'ease-in', from: 'opacity: 1', to: 'opacity: 0' },
        'slide-up': { duration: 'normal', easing: 'ease-out', from: 'transform: translateY(20px)', to: 'transform: translateY(0)' },
        'slide-down': { duration: 'normal', easing: 'ease-out', from: 'transform: translateY(-20px)', to: 'transform: translateY(0)' },
        'scale-in': { duration: 'normal', easing: 'ease-back', from: 'transform: scale(0.9)', to: 'transform: scale(1)' },
        'scale-out': { duration: 'fast', easing: 'ease-in', from: 'transform: scale(1)', to: 'transform: scale(0.95)' }
      },
      ...options
    };

    this.generateTokens();
  }

  generateTokens() {
    // Combine options with generated animation tokens
    this.tokens = {
      easing: { ...this.options.easingCurves },
      duration: { ...this.options.durations },
      presets: { ...this.options.presets }
    };

    // Generate hover and focus states
    this.hoverStates = {
      'hover-lift': {
        duration: 'fast',
        easing: 'ease-out',
        transform: 'translateY(-2px)',
        boxShadow: 'var(--shadow-md)'
      },
      'hover-scale': {
        duration: 'fast', 
        easing: 'ease-out',
        transform: 'scale(1.05)'
      },
      'hover-glow': {
        duration: 'normal',
        easing: 'ease-out',
        boxShadow: '0 0 20px var(--color-primary-alpha)'
      },
      'hover-slide': {
        duration: 'fast',
        easing: 'ease-out',
        transform: 'translateX(4px)'
      }
    };

    // Generate loading states
    this.loadingStates = {
      'pulse': {
        duration: '2000ms',
        easing: 'ease-in-out',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      'spin': {
        duration: '1000ms',
        easing: 'linear',
        animation: 'spin 1s linear infinite'
      },
      'bounce': {
        duration: '1000ms',
        easing: 'ease-in-out',
        animation: 'bounce 1s infinite'
      },
      'skeleton': {
        duration: '1500ms',
        easing: 'ease-in-out',
        animation: 'skeleton-loading 1.5s ease-in-out infinite alternate'
      }
    };
  }

  // Transform CSS with animation tokens
  transformAnimations(css, brandTokens = {}) {
    const changes = [];
    let transformedCss = css;

    // Extract animation tokens from brand pack
    const animationTokens = this.extractAnimationTokens(brandTokens);

    // Transform transition properties
    transformedCss = this.transformTransitions(transformedCss, animationTokens, changes);
    
    // Transform animation properties
    transformedCss = this.transformAnimationProperties(transformedCss, animationTokens, changes);
    
    // Add animation utility classes
    transformedCss = this.addAnimationUtilities(transformedCss, changes);
    
    // Generate keyframe animations
    transformedCss = this.addKeyframeAnimations(transformedCss, changes);

    return {
      css: transformedCss,
      changes,
      tokens: this.tokens,
      recommendations: this.generateRecommendations(css, changes)
    };
  }

  extractAnimationTokens(brandTokens) {
    return {
      easing: brandTokens.animations?.easing || this.tokens.easing,
      duration: brandTokens.animations?.duration || this.tokens.duration,
      presets: brandTokens.animations?.presets || this.tokens.presets
    };
  }

  transformTransitions(css, tokens, changes) {
    // Transform transition-duration
    let result = css.replace(/transition-duration\s*:\s*([^;]+);/g, (match, value) => {
      const cleanValue = value.trim();
      const durationToken = this.findMatchingDuration(cleanValue, tokens.duration);
      
      if (durationToken) {
        const tokenValue = `var(--duration-${durationToken})`;
        changes.push({
          type: 'animation-duration',
          property: 'transition-duration',
          before: match,
          after: `transition-duration: ${tokenValue};`,
          location: 'transition-duration',
          token: durationToken
        });
        return `transition-duration: ${tokenValue};`;
      }
      return match;
    });

    // Transform transition-timing-function
    result = result.replace(/transition-timing-function\s*:\s*([^;]+);/g, (match, value) => {
      const cleanValue = value.trim();
      const easingToken = this.findMatchingEasing(cleanValue, tokens.easing);
      
      if (easingToken) {
        const tokenValue = `var(--easing-${easingToken})`;
        changes.push({
          type: 'animation-easing',
          property: 'transition-timing-function',
          before: match,
          after: `transition-timing-function: ${tokenValue};`,
          location: 'transition-timing-function',
          token: easingToken
        });
        return `transition-timing-function: ${tokenValue};`;
      }
      return match;
    });

    // Transform shorthand transition declarations
    result = result.replace(/transition\s*:\s*([^;]+);/g, (match, value) => {
      const parts = value.trim().split(/\s+/);
      let transformed = false;
      let newValue = value;

      // Check each part for duration and easing matches
      parts.forEach((part, index) => {
        if (part.match(/^\d+m?s$/)) {
          const durationToken = this.findMatchingDuration(part, tokens.duration);
          if (durationToken) {
            newValue = newValue.replace(part, `var(--duration-${durationToken})`);
            transformed = true;
          }
        } else if (part.includes('cubic-bezier') || ['ease', 'ease-in', 'ease-out', 'ease-in-out'].includes(part)) {
          const easingToken = this.findMatchingEasing(part, tokens.easing);
          if (easingToken) {
            newValue = newValue.replace(part, `var(--easing-${easingToken})`);
            transformed = true;
          }
        }
      });

      if (transformed) {
        changes.push({
          type: 'animation-transition',
          property: 'transition',
          before: match,
          after: `transition: ${newValue};`,
          location: 'transition'
        });
        return `transition: ${newValue};`;
      }

      return match;
    });

    return result;
  }

  transformAnimationProperties(css, tokens, changes) {
    // Transform animation-duration
    let result = css.replace(/animation-duration\s*:\s*([^;]+);/g, (match, value) => {
      const cleanValue = value.trim();
      const durationToken = this.findMatchingDuration(cleanValue, tokens.duration);
      
      if (durationToken) {
        const tokenValue = `var(--duration-${durationToken})`;
        changes.push({
          type: 'animation-duration',
          property: 'animation-duration',
          before: match,
          after: `animation-duration: ${tokenValue};`,
          location: 'animation-duration',
          token: durationToken
        });
        return `animation-duration: ${tokenValue};`;
      }
      return match;
    });

    // Transform animation-timing-function
    result = result.replace(/animation-timing-function\s*:\s*([^;]+);/g, (match, value) => {
      const cleanValue = value.trim();
      const easingToken = this.findMatchingEasing(cleanValue, tokens.easing);
      
      if (easingToken) {
        const tokenValue = `var(--easing-${easingToken})`;
        changes.push({
          type: 'animation-easing',
          property: 'animation-timing-function',
          before: match,
          after: `animation-timing-function: ${tokenValue};`,
          location: 'animation-timing-function',
          token: easingToken
        });
        return `animation-timing-function: ${tokenValue};`;
      }
      return match;
    });

    return result;
  }

  addAnimationUtilities(css, changes) {
    // Check if utilities already exist
    if (css.includes('/* Animation Utilities */')) {
      return css;
    }

    const utilities = this.generateUtilityCSS();
    if (utilities) {
      changes.push({
        type: 'animation-utilities',
        property: 'utilities',
        before: '',
        after: utilities,
        location: 'end-of-file',
        description: 'Added animation utility classes'
      });
      return css + '\n\n' + utilities;
    }

    return css;
  }

  addKeyframeAnimations(css, changes) {
    // Check if keyframes already exist
    if (css.includes('/* Keyframe Animations */')) {
      return css;
    }

    const keyframes = this.generateKeyframeCSS();
    if (keyframes) {
      changes.push({
        type: 'animation-keyframes',
        property: 'keyframes',
        before: '',
        after: keyframes,
        location: 'end-of-file',
        description: 'Added keyframe animations'
      });
      return css + '\n\n' + keyframes;
    }

    return css;
  }

  generateUtilityCSS() {
    let css = '/* Animation Utilities */\n';

    // Hover state utilities
    for (const [name, styles] of Object.entries(this.hoverStates)) {
      css += `.${name}:hover {\n`;
      css += `  transition-duration: var(--duration-${styles.duration});\n`;
      css += `  transition-timing-function: var(--easing-${styles.easing});\n`;
      if (styles.transform) {
        css += `  transform: ${styles.transform};\n`;
      }
      if (styles.boxShadow) {
        css += `  box-shadow: ${styles.boxShadow};\n`;
      }
      css += '}\n\n';
    }

    // Loading state utilities
    for (const [name, styles] of Object.entries(this.loadingStates)) {
      css += `.loading-${name} {\n`;
      css += `  animation: ${styles.animation};\n`;
      css += '}\n\n';
    }

    // Focus states
    css += '.focus-visible {\n';
    css += '  transition: box-shadow var(--duration-fast) var(--easing-ease-out);\n';
    css += '}\n\n';
    css += '.focus-visible:focus-visible {\n';
    css += '  box-shadow: 0 0 0 3px var(--color-primary-alpha);\n';
    css += '  outline: none;\n';
    css += '}\n\n';

    // Disabled states
    css += '.disabled {\n';
    css += '  transition: opacity var(--duration-fast) var(--easing-ease-out);\n';
    css += '  opacity: 0.6;\n';
    css += '  pointer-events: none;\n';
    css += '}\n\n';

    return css;
  }

  generateKeyframeCSS() {
    let css = '/* Keyframe Animations */\n';

    // Pulse animation
    css += '@keyframes pulse {\n';
    css += '  0%, 100% { opacity: 1; }\n';
    css += '  50% { opacity: 0.5; }\n';
    css += '}\n\n';

    // Spin animation
    css += '@keyframes spin {\n';
    css += '  from { transform: rotate(0deg); }\n';
    css += '  to { transform: rotate(360deg); }\n';
    css += '}\n\n';

    // Bounce animation
    css += '@keyframes bounce {\n';
    css += '  0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }\n';
    css += '  40%, 43% { transform: translate3d(0, -30px, 0); }\n';
    css += '  70% { transform: translate3d(0, -15px, 0); }\n';
    css += '  90% { transform: translate3d(0, -4px, 0); }\n';
    css += '}\n\n';

    // Skeleton loading animation
    css += '@keyframes skeleton-loading {\n';
    css += '  0% { background-color: hsl(200, 20%, 80%); }\n';
    css += '  100% { background-color: hsl(200, 20%, 95%); }\n';
    css += '}\n\n';

    // Fade in animations
    css += '@keyframes fade-in {\n';
    css += '  from { opacity: 0; }\n';
    css += '  to { opacity: 1; }\n';
    css += '}\n\n';

    // Slide animations
    css += '@keyframes slide-up {\n';
    css += '  from { transform: translateY(20px); opacity: 0; }\n';
    css += '  to { transform: translateY(0); opacity: 1; }\n';
    css += '}\n\n';

    css += '@keyframes slide-down {\n';
    css += '  from { transform: translateY(-20px); opacity: 0; }\n';
    css += '  to { transform: translateY(0); opacity: 1; }\n';
    css += '}\n\n';

    // Scale animations
    css += '@keyframes scale-in {\n';
    css += '  from { transform: scale(0.9); opacity: 0; }\n';
    css += '  to { transform: scale(1); opacity: 1; }\n';
    css += '}\n\n';

    return css;
  }

  findMatchingDuration(value, durations) {
    // Direct match
    for (const [name, duration] of Object.entries(durations)) {
      if (duration === value) {
        return name;
      }
    }

    // Numeric match with tolerance
    const numMatch = value.match(/^(\d+)m?s$/);
    if (numMatch) {
      const inputMs = value.includes('ms') ? parseInt(numMatch[1]) : parseInt(numMatch[1]) * 1000;
      
      for (const [name, duration] of Object.entries(durations)) {
        const durationMatch = duration.match(/^(\d+)m?s$/);
        if (durationMatch) {
          const tokenMs = duration.includes('ms') ? parseInt(durationMatch[1]) : parseInt(durationMatch[1]) * 1000;
          if (Math.abs(inputMs - tokenMs) <= 50) { // 50ms tolerance
            return name;
          }
        }
      }
    }

    return null;
  }

  findMatchingEasing(value, easings) {
    // Direct match
    for (const [name, easing] of Object.entries(easings)) {
      if (easing === value) {
        return name;
      }
    }

    // Common easing aliases
    const aliases = {
      'ease': 'ease-out',
      'ease-in-out': 'ease-in-out',
      'linear': 'linear'
    };

    return aliases[value] || null;
  }

  generateRecommendations(originalCss, changes) {
    const recommendations = [];

    // Check for hardcoded animation values
    const hardcodedDurations = originalCss.match(/\d+m?s/g);
    if (hardcodedDurations && hardcodedDurations.length > 3) {
      recommendations.push({
        type: 'animation-consistency',
        message: `Found ${hardcodedDurations.length} hardcoded duration values. Consider using duration tokens.`,
        severity: 'medium',
        suggestion: 'Use animation duration tokens for consistency'
      });
    }

    // Check for missing hover states
    if (originalCss.includes('button') && !originalCss.includes(':hover')) {
      recommendations.push({
        type: 'interaction-states',
        message: 'Interactive elements found without hover states. Consider adding hover animations.',
        severity: 'low',
        suggestion: 'Add hover state animations for better UX'
      });
    }

    // Check for accessibility considerations
    if (originalCss.includes('@keyframes') && !originalCss.includes('prefers-reduced-motion')) {
      recommendations.push({
        type: 'accessibility',
        message: 'Animations detected without motion preferences. Consider adding prefers-reduced-motion.',
        severity: 'high',
        suggestion: 'Add @media (prefers-reduced-motion: reduce) rules'
      });
    }

    return recommendations;
  }

  // Generate CSS custom properties for animation system
  generateCSSCustomProperties(brandTokens = {}) {
    let css = ':root {\n';
    css += '  /* Animation Durations */\n';
    
    for (const [name, duration] of Object.entries(this.tokens.duration)) {
      css += `  --duration-${name}: ${duration};\n`;
    }
    
    css += '\n  /* Animation Easing */\n';
    for (const [name, easing] of Object.entries(this.tokens.easing)) {
      css += `  --easing-${name}: ${easing};\n`;
    }

    // Add reduced motion support
    css += '\n  /* Reduced Motion Support */\n';
    css += '  --animation-duration: var(--duration-normal);\n';
    css += '}\n\n';

    css += '@media (prefers-reduced-motion: reduce) {\n';
    css += '  :root {\n';
    css += '    --animation-duration: 0ms;\n';
    css += '  }\n';
    css += '  *, *::before, *::after {\n';
    css += '    animation-duration: 0ms !important;\n';
    css += '    animation-iteration-count: 1 !important;\n';
    css += '    transition-duration: 0ms !important;\n';
    css += '  }\n';
    css += '}\n';
    
    return css;
  }

  // Export animation tokens for other systems
  exportTokens() {
    return {
      tokens: this.tokens,
      hoverStates: this.hoverStates,
      loadingStates: this.loadingStates,
      options: this.options
    };
  }
}

module.exports = { AnimationTokenSystem };