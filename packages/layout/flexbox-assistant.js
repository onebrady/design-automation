class FlexboxAssistant {
  constructor(options = {}) {
    this.options = {
      defaultGap: options.defaultGap || '1rem',
      breakpoints: options.breakpoints || {
        sm: '576px',
        md: '768px',
        lg: '992px',
        xl: '1200px'
      }
    };

    this.flexPatterns = this.initializeFlexPatterns();
  }

  // Initialize common flexbox patterns
  initializeFlexPatterns() {
    return {
      // Navigation patterns
      'horizontal-nav': {
        container: {
          display: 'flex',
          alignItems: 'center',
          gap: '2rem'
        },
        description: 'Horizontal navigation bar with evenly spaced items'
      },
      
      'nav-with-logo': {
        container: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        },
        items: {
          '.logo': { flex: '0 0 auto' },
          '.nav-items': { 
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }
        },
        description: 'Navigation with logo on left and menu items on right'
      },

      // Card layouts
      'card-row': {
        container: {
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap'
        },
        items: {
          '.card': { 
            flex: '1 1 300px',
            minWidth: '250px'
          }
        },
        description: 'Responsive card row that wraps on smaller screens'
      },

      'equal-height-cards': {
        container: {
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'stretch'
        },
        items: {
          '.card': { 
            flex: '1',
            display: 'flex',
            flexDirection: 'column'
          }
        },
        description: 'Cards with equal height regardless of content'
      },

      // Content layouts
      'sidebar-main': {
        container: {
          display: 'flex',
          gap: '2rem',
          alignItems: 'flex-start'
        },
        items: {
          '.sidebar': { 
            flex: '0 0 250px',
            position: 'sticky',
            top: '2rem'
          },
          '.main': { flex: '1' }
        },
        description: 'Sidebar and main content layout'
      },

      'hero-content': {
        container: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          minHeight: '70vh',
          gap: '2rem'
        },
        description: 'Centered hero section with vertical spacing'
      },

      // Form layouts
      'form-row': {
        container: {
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap'
        },
        items: {
          '.form-field': { 
            flex: '1',
            minWidth: '200px'
          }
        },
        description: 'Form fields in a flexible row'
      },

      'form-actions': {
        container: {
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end',
          marginTop: '2rem'
        },
        items: {
          '.btn-primary': { order: '2' },
          '.btn-secondary': { order: '1' }
        },
        description: 'Form action buttons with primary action emphasized'
      },

      // Media layouts
      'media-object': {
        container: {
          display: 'flex',
          gap: '1rem'
        },
        items: {
          '.media-image': { 
            flex: '0 0 auto',
            width: '60px',
            height: '60px'
          },
          '.media-content': { flex: '1' }
        },
        description: 'Media object with image and content'
      },

      // Utility layouts
      'center-content': {
        container: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100%'
        },
        description: 'Center content both horizontally and vertically'
      },

      'space-between': {
        container: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        },
        description: 'Items at opposite ends with space between'
      },

      'stack': {
        container: {
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        },
        description: 'Vertical stack with consistent spacing'
      }
    };
  }

  // Analyze container and suggest flexbox improvements
  analyzeContainer(element, styles = {}) {
    const analysis = {
      currentLayout: this.analyzeCurrentLayout(element, styles),
      suggestions: [],
      patterns: [],
      improvements: []
    };

    // Analyze children
    const children = Array.from(element.children || []);
    analysis.children = this.analyzeChildren(children);

    // Generate suggestions
    analysis.suggestions = this.generateSuggestions(analysis);
    analysis.patterns = this.suggestPatterns(analysis);
    analysis.improvements = this.suggestImprovements(analysis);

    return analysis;
  }

  // Analyze current layout
  analyzeCurrentLayout(element, styles) {
    const layout = {
      isFlexContainer: false,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      flexWrap: 'nowrap',
      gap: '0',
      problems: []
    };

    // Check if already using flexbox
    if (styles.display === 'flex' || element.style?.display === 'flex') {
      layout.isFlexContainer = true;
      layout.flexDirection = styles.flexDirection || element.style?.flexDirection || 'row';
      layout.justifyContent = styles.justifyContent || element.style?.justifyContent || 'flex-start';
      layout.alignItems = styles.alignItems || element.style?.alignItems || 'stretch';
      layout.flexWrap = styles.flexWrap || element.style?.flexWrap || 'nowrap';
      layout.gap = styles.gap || element.style?.gap || '0';
    }

    // Detect problems
    if (!layout.isFlexContainer && element.children?.length > 1) {
      layout.problems.push('Multiple children without flexbox layout');
    }

    if (layout.gap === '0' && element.children?.length > 1) {
      layout.problems.push('No spacing between items');
    }

    return layout;
  }

  // Analyze child elements
  analyzeChildren(children) {
    return children.map(child => ({
      tagName: child.tagName?.toLowerCase(),
      className: child.className || '',
      hasContent: (child.textContent || '').trim().length > 0,
      isInteractive: ['button', 'a', 'input', 'select', 'textarea'].includes(child.tagName?.toLowerCase()),
      estimatedWidth: this.estimateElementWidth(child),
      estimatedHeight: this.estimateElementHeight(child)
    }));
  }

  // Estimate element width based on content and type
  estimateElementWidth(element) {
    const tagName = element.tagName?.toLowerCase();
    const content = element.textContent || '';
    
    if (tagName === 'img') return 'auto';
    if (tagName === 'button') return 'auto';
    if (content.length > 100) return 'flexible';
    if (content.length > 20) return 'medium';
    return 'compact';
  }

  // Estimate element height
  estimateElementHeight(element) {
    const tagName = element.tagName?.toLowerCase();
    const children = element.children?.length || 0;
    
    if (tagName === 'img') return 'auto';
    if (children > 5) return 'tall';
    if (children > 2) return 'medium';
    return 'compact';
  }

  // Generate layout suggestions
  generateSuggestions(analysis) {
    const suggestions = [];
    const { currentLayout, children } = analysis;

    // Suggest flexbox if not already using it
    if (!currentLayout.isFlexContainer && children.length > 1) {
      suggestions.push({
        type: 'layout',
        priority: 'high',
        title: 'Use Flexbox Layout',
        description: 'Convert to flexbox for better control over child elements',
        css: { display: 'flex', gap: this.options.defaultGap }
      });
    }

    // Suggest gap if missing
    if (currentLayout.isFlexContainer && currentLayout.gap === '0' && children.length > 1) {
      suggestions.push({
        type: 'spacing',
        priority: 'medium',
        title: 'Add Gap Between Items',
        description: 'Use gap property for consistent spacing',
        css: { gap: this.options.defaultGap }
      });
    }

    // Suggest flex-wrap for multiple items
    if (children.length > 3 && currentLayout.flexWrap === 'nowrap') {
      suggestions.push({
        type: 'responsive',
        priority: 'medium',
        title: 'Allow Items to Wrap',
        description: 'Use flex-wrap to prevent overflow on smaller screens',
        css: { flexWrap: 'wrap' }
      });
    }

    // Suggest alignment improvements
    if (this.hasVerticalAlignmentIssues(analysis)) {
      suggestions.push({
        type: 'alignment',
        priority: 'medium',
        title: 'Improve Vertical Alignment',
        description: 'Center items vertically for better visual balance',
        css: { alignItems: 'center' }
      });
    }

    return suggestions;
  }

  // Suggest flexbox patterns
  suggestPatterns(analysis) {
    const patterns = [];
    const { children } = analysis;

    // Navigation pattern
    if (this.looksLikeNavigation(analysis)) {
      patterns.push({
        pattern: 'horizontal-nav',
        confidence: 0.8,
        reason: 'Multiple interactive elements suggest navigation'
      });
    }

    // Card layout pattern
    if (this.looksLikeCardLayout(analysis)) {
      patterns.push({
        pattern: 'card-row',
        confidence: 0.7,
        reason: 'Multiple similar-sized elements suggest card layout'
      });
    }

    // Sidebar pattern
    if (this.looksLikeSidebarLayout(analysis)) {
      patterns.push({
        pattern: 'sidebar-main',
        confidence: 0.75,
        reason: 'Two main elements suggest sidebar layout'
      });
    }

    // Form pattern
    if (this.looksLikeFormLayout(analysis)) {
      patterns.push({
        pattern: 'form-row',
        confidence: 0.8,
        reason: 'Form elements detected'
      });
    }

    // Media object pattern
    if (this.looksLikeMediaObject(analysis)) {
      patterns.push({
        pattern: 'media-object',
        confidence: 0.9,
        reason: 'Image with adjacent content detected'
      });
    }

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  // Pattern detection helpers
  looksLikeNavigation(analysis) {
    const { children } = analysis;
    const interactiveCount = children.filter(child => child.isInteractive).length;
    return interactiveCount >= 2 && interactiveCount / children.length > 0.5;
  }

  looksLikeCardLayout(analysis) {
    const { children } = analysis;
    return children.length >= 2 && 
           children.every(child => child.estimatedWidth === 'medium' || child.estimatedWidth === 'flexible');
  }

  looksLikeSidebarLayout(analysis) {
    const { children } = analysis;
    return children.length === 2 && 
           children.some(child => child.estimatedWidth === 'compact') &&
           children.some(child => child.estimatedWidth === 'flexible');
  }

  looksLikeFormLayout(analysis) {
    const { children } = analysis;
    const formElements = ['input', 'select', 'textarea', 'button'];
    const formCount = children.filter(child => 
      formElements.includes(child.tagName) || child.className.includes('form')
    ).length;
    return formCount >= 2;
  }

  looksLikeMediaObject(analysis) {
    const { children } = analysis;
    return children.length === 2 && 
           children.some(child => child.tagName === 'img') &&
           children.some(child => child.hasContent);
  }

  // Check for vertical alignment issues
  hasVerticalAlignmentIssues(analysis) {
    const { children, currentLayout } = analysis;
    return children.length > 1 && 
           currentLayout.alignItems === 'stretch' &&
           children.some(child => child.estimatedHeight === 'compact');
  }

  // Generate improvements
  suggestImprovements(analysis) {
    const improvements = [];
    const { currentLayout, children } = analysis;

    // Responsive improvements
    if (children.length > 2) {
      improvements.push({
        type: 'responsive',
        title: 'Add Responsive Behavior',
        description: 'Stack items vertically on mobile devices',
        css: this.generateResponsiveCSS(analysis),
        mediaQueries: true
      });
    }

    // Performance improvements
    if (children.length > 10) {
      improvements.push({
        type: 'performance',
        title: 'Consider Virtualization',
        description: 'For large lists, consider virtual scrolling',
        suggestion: 'Implement virtual scrolling for better performance'
      });
    }

    // Accessibility improvements
    improvements.push({
      type: 'accessibility',
      title: 'Add Focus Management',
      description: 'Ensure keyboard navigation works properly',
      css: {
        ':focus-visible': {
          outline: '2px solid currentColor',
          outlineOffset: '2px'
        }
      }
    });

    return improvements;
  }

  // Generate responsive CSS
  generateResponsiveCSS(analysis) {
    const { children } = analysis;
    const css = {};

    // Mobile-first approach
    css.base = {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    };

    // Tablet and up
    css[`@media (min-width: ${this.options.breakpoints.md})`] = {
      flexDirection: 'row',
      gap: this.options.defaultGap
    };

    // Large screens
    if (children.length > 4) {
      css[`@media (min-width: ${this.options.breakpoints.lg})`] = {
        gap: '2rem'
      };
    }

    return css;
  }

  // Apply suggested pattern
  applyPattern(patternName, customizations = {}) {
    const pattern = this.flexPatterns[patternName];
    if (!pattern) {
      throw new Error(`Pattern "${patternName}" not found`);
    }

    const appliedPattern = {
      name: patternName,
      description: pattern.description,
      css: this.buildPatternCSS(pattern, customizations),
      html: this.generatePatternHTML(pattern),
      classes: this.extractPatternClasses(pattern)
    };

    return appliedPattern;
  }

  // Build CSS for a pattern
  buildPatternCSS(pattern, customizations) {
    let css = '';

    // Container styles
    css += '.flex-container {\n';
    const containerStyles = { ...pattern.container, ...customizations.container };
    Object.entries(containerStyles).forEach(([property, value]) => {
      css += `  ${this.kebabCase(property)}: ${value};\n`;
    });
    css += '}\n\n';

    // Item styles
    if (pattern.items) {
      Object.entries(pattern.items).forEach(([selector, styles]) => {
        css += `${selector} {\n`;
        const itemStyles = { ...styles, ...customizations.items?.[selector] };
        Object.entries(itemStyles).forEach(([property, value]) => {
          css += `  ${this.kebabCase(property)}: ${value};\n`;
        });
        css += '}\n\n';
      });
    }

    return css;
  }

  // Generate HTML example for pattern
  generatePatternHTML(pattern) {
    const examples = {
      'horizontal-nav': `
        <nav class="flex-container">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </nav>
      `,
      'card-row': `
        <div class="flex-container">
          <div class="card">Card 1</div>
          <div class="card">Card 2</div>
          <div class="card">Card 3</div>
        </div>
      `,
      'sidebar-main': `
        <div class="flex-container">
          <aside class="sidebar">Sidebar content</aside>
          <main class="main">Main content</main>
        </div>
      `,
      'media-object': `
        <div class="flex-container">
          <img src="avatar.jpg" alt="Avatar" class="media-image">
          <div class="media-content">
            <h3>Title</h3>
            <p>Content description</p>
          </div>
        </div>
      `
    };

    return examples[pattern.name] || '<div class="flex-container"><!-- Pattern content --></div>';
  }

  // Extract classes from pattern
  extractPatternClasses(pattern) {
    const classes = ['flex-container'];
    
    if (pattern.items) {
      Object.keys(pattern.items).forEach(selector => {
        if (selector.startsWith('.')) {
          classes.push(selector.substring(1));
        }
      });
    }

    return classes;
  }

  // Generate complete flexbox utilities
  generateFlexboxUtilities() {
    return {
      // Display
      'flex': { display: 'flex' },
      'inline-flex': { display: 'inline-flex' },

      // Direction
      'flex-row': { flexDirection: 'row' },
      'flex-row-reverse': { flexDirection: 'row-reverse' },
      'flex-col': { flexDirection: 'column' },
      'flex-col-reverse': { flexDirection: 'column-reverse' },

      // Wrap
      'flex-wrap': { flexWrap: 'wrap' },
      'flex-wrap-reverse': { flexWrap: 'wrap-reverse' },
      'flex-nowrap': { flexWrap: 'nowrap' },

      // Justify content
      'justify-start': { justifyContent: 'flex-start' },
      'justify-end': { justifyContent: 'flex-end' },
      'justify-center': { justifyContent: 'center' },
      'justify-between': { justifyContent: 'space-between' },
      'justify-around': { justifyContent: 'space-around' },
      'justify-evenly': { justifyContent: 'space-evenly' },

      // Align items
      'items-start': { alignItems: 'flex-start' },
      'items-end': { alignItems: 'flex-end' },
      'items-center': { alignItems: 'center' },
      'items-baseline': { alignItems: 'baseline' },
      'items-stretch': { alignItems: 'stretch' },

      // Align content
      'content-start': { alignContent: 'flex-start' },
      'content-end': { alignContent: 'flex-end' },
      'content-center': { alignContent: 'center' },
      'content-between': { alignContent: 'space-between' },
      'content-around': { alignContent: 'space-around' },
      'content-evenly': { alignContent: 'space-evenly' },

      // Align self
      'self-auto': { alignSelf: 'auto' },
      'self-start': { alignSelf: 'flex-start' },
      'self-end': { alignSelf: 'flex-end' },
      'self-center': { alignSelf: 'center' },
      'self-stretch': { alignSelf: 'stretch' },
      'self-baseline': { alignSelf: 'baseline' },

      // Flex grow/shrink
      'flex-1': { flex: '1 1 0%' },
      'flex-auto': { flex: '1 1 auto' },
      'flex-initial': { flex: '0 1 auto' },
      'flex-none': { flex: 'none' },

      // Flex grow
      'grow': { flexGrow: '1' },
      'grow-0': { flexGrow: '0' },

      // Flex shrink
      'shrink': { flexShrink: '1' },
      'shrink-0': { flexShrink: '0' },

      // Order
      'order-1': { order: '1' },
      'order-2': { order: '2' },
      'order-3': { order: '3' },
      'order-4': { order: '4' },
      'order-5': { order: '5' },
      'order-last': { order: '9999' },
      'order-first': { order: '-9999' }
    };
  }

  // Helper method
  kebabCase(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  // Get pattern recommendations based on content analysis
  getRecommendations(contentType, itemCount, hasInteractive = false) {
    const recommendations = [];

    switch (contentType) {
      case 'navigation':
        recommendations.push(
          hasInteractive ? 'nav-with-logo' : 'horizontal-nav'
        );
        break;
      
      case 'cards':
        if (itemCount <= 3) {
          recommendations.push('card-row');
        } else {
          recommendations.push('card-row', 'equal-height-cards');
        }
        break;
      
      case 'form':
        recommendations.push('form-row', 'form-actions');
        break;
      
      case 'content':
        if (itemCount === 2) {
          recommendations.push('sidebar-main', 'media-object');
        } else {
          recommendations.push('stack', 'center-content');
        }
        break;
      
      default:
        recommendations.push('flex', 'stack');
    }

    return recommendations.map(patternName => ({
      pattern: patternName,
      description: this.flexPatterns[patternName]?.description || 'Flexible layout',
      css: this.flexPatterns[patternName]?.container || { display: 'flex' }
    }));
  }
}

module.exports = { FlexboxAssistant };