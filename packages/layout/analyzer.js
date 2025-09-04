const { JSDOM } = require('jsdom');

class LayoutAnalyzer {
  constructor(options = {}) {
    this.options = {
      minElementSize: options.minElementSize || 10,
      gridThreshold: options.gridThreshold || 0.8,
      flexThreshold: options.flexThreshold || 0.7,
      semanticElements: options.semanticElements || [
        'header', 'nav', 'main', 'aside', 'footer', 'section', 'article'
      ]
    };
  }

  // Analyze layout structure from HTML/CSS
  async analyzeLayout(html, css = '') {
    const dom = new JSDOM(`<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}</body></html>`);
    const document = dom.window.document;
    
    const analysis = {
      structure: await this.analyzeStructure(document),
      layoutType: await this.detectLayoutType(document),
      responsiveness: await this.analyzeResponsiveness(css),
      semantics: await this.analyzeSemantic(document),
      spacing: await this.analyzeSpacing(document, css),
      accessibility: await this.analyzeAccessibility(document),
      suggestions: []
    };

    // Generate improvement suggestions
    analysis.suggestions = await this.generateSuggestions(analysis);
    
    return analysis;
  }

  // Analyze document structure
  async analyzeStructure(document) {
    const body = document.body;
    const elements = Array.from(document.querySelectorAll('*'));
    
    const structure = {
      totalElements: elements.length,
      depth: this.calculateMaxDepth(body),
      containers: this.findContainers(document),
      layoutElements: this.findLayoutElements(document),
      interactive: this.findInteractiveElements(document),
      hierarchy: this.buildHierarchy(body)
    };

    return structure;
  }

  // Calculate maximum DOM depth
  calculateMaxDepth(element, depth = 0) {
    let maxDepth = depth;
    for (const child of element.children) {
      const childDepth = this.calculateMaxDepth(child, depth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }
    return maxDepth;
  }

  // Find potential layout containers
  findContainers(document) {
    const containers = [];
    const elements = document.querySelectorAll('div, section, article, main, aside, header, footer, nav');
    
    elements.forEach(element => {
      const children = Array.from(element.children);
      const hasMultipleChildren = children.length > 1;
      const hasLayoutPotential = children.some(child => 
        child.offsetWidth > this.options.minElementSize && 
        child.offsetHeight > this.options.minElementSize
      );

      if (hasMultipleChildren && hasLayoutPotential) {
        containers.push({
          element: element.tagName.toLowerCase(),
          id: element.id || null,
          className: element.className || null,
          childCount: children.length,
          type: this.classifyContainer(element, children)
        });
      }
    });

    return containers;
  }

  // Classify container type
  classifyContainer(element, children) {
    const childTypes = children.map(child => child.tagName.toLowerCase());
    const styles = element.style || {};
    
    // Check CSS display properties (simplified - would need computed styles in real implementation)
    if (styles.display === 'grid' || element.className.includes('grid')) {
      return 'grid';
    }
    if (styles.display === 'flex' || element.className.includes('flex')) {
      return 'flexbox';
    }
    
    // Analyze child patterns
    const uniformChildren = new Set(childTypes).size === 1;
    const cardLikeChildren = children.every(child => 
      child.children.length > 1 && 
      (child.tagName === 'DIV' || child.tagName === 'ARTICLE')
    );
    
    if (uniformChildren && cardLikeChildren) {
      return 'card-grid';
    }
    if (children.length > 4 && uniformChildren) {
      return 'list-layout';
    }
    if (element.tagName === 'HEADER' || element.tagName === 'NAV') {
      return 'navigation';
    }
    if (element.tagName === 'ASIDE') {
      return 'sidebar';
    }
    
    return 'generic';
  }

  // Find layout-specific elements
  findLayoutElements(document) {
    return {
      headers: document.querySelectorAll('header, h1, h2, h3, h4, h5, h6').length,
      navigation: document.querySelectorAll('nav, [role="navigation"]').length,
      main: document.querySelectorAll('main, [role="main"]').length,
      sidebars: document.querySelectorAll('aside, .sidebar').length,
      footers: document.querySelectorAll('footer').length,
      articles: document.querySelectorAll('article').length,
      sections: document.querySelectorAll('section').length
    };
  }

  // Find interactive elements
  findInteractiveElements(document) {
    return {
      buttons: document.querySelectorAll('button, [role="button"]').length,
      links: document.querySelectorAll('a[href]').length,
      inputs: document.querySelectorAll('input, textarea, select').length,
      forms: document.querySelectorAll('form').length
    };
  }

  // Build element hierarchy
  buildHierarchy(element, depth = 0) {
    const hierarchy = {
      tag: element.tagName.toLowerCase(),
      depth,
      children: [],
      hasLayoutRole: this.hasLayoutRole(element)
    };

    for (const child of element.children) {
      if (this.isSignificantElement(child)) {
        hierarchy.children.push(this.buildHierarchy(child, depth + 1));
      }
    }

    return hierarchy;
  }

  // Check if element has layout significance
  hasLayoutRole(element) {
    const layoutTags = ['div', 'section', 'article', 'aside', 'header', 'footer', 'nav', 'main'];
    const layoutClasses = ['container', 'wrapper', 'grid', 'flex', 'row', 'col'];
    
    return layoutTags.includes(element.tagName.toLowerCase()) ||
           layoutClasses.some(cls => element.className.includes(cls));
  }

  // Check if element is significant for analysis
  isSignificantElement(element) {
    return element.children.length > 0 || 
           element.textContent.trim().length > 0 ||
           ['img', 'video', 'canvas', 'svg'].includes(element.tagName.toLowerCase());
  }

  // Detect overall layout type
  async detectLayoutType(document) {
    const body = document.body;
    const topLevelChildren = Array.from(body.children);
    
    // Single column layouts
    if (topLevelChildren.length === 1) {
      return { type: 'single-column', confidence: 0.9 };
    }
    
    // Header-Main-Footer pattern
    const hasHeader = document.querySelector('header');
    const hasMain = document.querySelector('main');
    const hasFooter = document.querySelector('footer');
    const hasSidebar = document.querySelector('aside, .sidebar');
    
    if (hasHeader && hasMain && hasFooter) {
      if (hasSidebar) {
        return { type: 'header-sidebar-main-footer', confidence: 0.85 };
      } else {
        return { type: 'header-main-footer', confidence: 0.9 };
      }
    }
    
    // Grid layouts
    const gridContainers = document.querySelectorAll('[style*="grid"], .grid');
    if (gridContainers.length > 0) {
      return { type: 'css-grid', confidence: 0.8 };
    }
    
    // Flexbox layouts
    const flexContainers = document.querySelectorAll('[style*="flex"], .flex');
    if (flexContainers.length > 0) {
      return { type: 'flexbox', confidence: 0.75 };
    }
    
    // Multi-column detection based on structure
    const mainContainers = topLevelChildren.filter(child => 
      child.children.length > 2 || this.hasLayoutRole(child)
    );
    
    if (mainContainers.length >= 2) {
      return { type: 'multi-column', confidence: 0.7 };
    }
    
    return { type: 'unknown', confidence: 0.3 };
  }

  // Analyze responsiveness from CSS
  async analyzeResponsiveness(css) {
    const responsiveness = {
      hasMediaQueries: false,
      breakpoints: [],
      techniques: [],
      score: 0
    };

    // Media query detection
    const mediaQueryRegex = /@media\s*[^{]+\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
    const mediaQueries = css.match(mediaQueryRegex) || [];
    
    responsiveness.hasMediaQueries = mediaQueries.length > 0;
    
    // Extract breakpoints
    mediaQueries.forEach(mq => {
      const widthMatch = mq.match(/(?:min-width|max-width):\s*(\d+)px/g);
      if (widthMatch) {
        widthMatch.forEach(match => {
          const width = parseInt(match.match(/\d+/)[0]);
          if (!responsiveness.breakpoints.includes(width)) {
            responsiveness.breakpoints.push(width);
          }
        });
      }
    });

    responsiveness.breakpoints.sort((a, b) => a - b);

    // Detect responsive techniques
    if (css.includes('flex') || css.includes('flexbox')) {
      responsiveness.techniques.push('flexbox');
    }
    if (css.includes('grid')) {
      responsiveness.techniques.push('css-grid');
    }
    if (css.includes('%') || css.includes('vw') || css.includes('vh')) {
      responsiveness.techniques.push('fluid-units');
    }
    if (css.includes('clamp') || css.includes('min(') || css.includes('max(')) {
      responsiveness.techniques.push('modern-css-functions');
    }
    if (css.includes('container')) {
      responsiveness.techniques.push('container-queries');
    }

    // Calculate responsiveness score
    let score = 0;
    if (responsiveness.hasMediaQueries) score += 30;
    if (responsiveness.breakpoints.length >= 2) score += 20;
    if (responsiveness.techniques.includes('flexbox')) score += 15;
    if (responsiveness.techniques.includes('css-grid')) score += 15;
    if (responsiveness.techniques.includes('fluid-units')) score += 10;
    if (responsiveness.techniques.includes('modern-css-functions')) score += 10;

    responsiveness.score = Math.min(score, 100);

    return responsiveness;
  }

  // Analyze semantic structure
  async analyzeSemantic(document) {
    const semantic = {
      hasSemanticStructure: false,
      landmarks: [],
      headingStructure: [],
      score: 0
    };

    // Find semantic landmarks
    this.options.semanticElements.forEach(tag => {
      const elements = document.querySelectorAll(tag);
      if (elements.length > 0) {
        semantic.landmarks.push({
          tag,
          count: elements.length,
          hasRole: Array.from(elements).some(el => el.hasAttribute('role'))
        });
      }
    });

    semantic.hasSemanticStructure = semantic.landmarks.length > 0;

    // Analyze heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let currentLevel = 0;
    let structureValid = true;

    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > currentLevel + 1) {
        structureValid = false;
      }
      currentLevel = Math.max(currentLevel, level);
      
      semantic.headingStructure.push({
        level,
        text: heading.textContent.trim().substring(0, 50),
        id: heading.id || null
      });
    });

    // Calculate semantic score
    let score = 0;
    if (semantic.hasSemanticStructure) score += 40;
    if (document.querySelector('main')) score += 20;
    if (document.querySelector('nav')) score += 15;
    if (document.querySelector('header, footer')) score += 10;
    if (structureValid) score += 15;

    semantic.score = Math.min(score, 100);
    semantic.headingStructureValid = structureValid;

    return semantic;
  }

  // Analyze spacing patterns
  async analyzeSpacing(document, css) {
    const spacing = {
      hasConsistentSpacing: false,
      spacingValues: [],
      rhythm: null,
      suggestions: []
    };

    // Extract spacing values from CSS
    const spacingRegex = /(?:margin|padding)(?:-(?:top|right|bottom|left))?:\s*([^;]+);/g;
    let match;
    const spacingValues = [];

    while ((match = spacingRegex.exec(css)) !== null) {
      const value = match[1].trim();
      // Extract numeric values
      const numbers = value.match(/\d+(?:\.\d+)?/g);
      if (numbers) {
        numbers.forEach(num => spacingValues.push(parseFloat(num)));
      }
    }

    spacing.spacingValues = [...new Set(spacingValues)].sort((a, b) => a - b);

    // Detect spacing rhythm
    if (spacing.spacingValues.length >= 3) {
      const ratios = [];
      for (let i = 1; i < spacing.spacingValues.length; i++) {
        ratios.push(spacing.spacingValues[i] / spacing.spacingValues[i-1]);
      }
      
      // Check if ratios are consistent (within 10% tolerance)
      const avgRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
      const isConsistent = ratios.every(r => Math.abs(r - avgRatio) < 0.1);
      
      if (isConsistent) {
        spacing.hasConsistentSpacing = true;
        spacing.rhythm = {
          baseValue: spacing.spacingValues[0],
          ratio: avgRatio,
          scale: 'custom'
        };
      }
    }

    // Check for common spacing scales
    const commonScales = {
      'fibonacci': [8, 13, 21, 34, 55],
      'modular-4': [4, 8, 16, 32, 64],
      'modular-8': [8, 16, 24, 32, 48],
      'golden-ratio': [16, 26, 42, 68, 110]
    };

    for (const [scaleName, scaleValues] of Object.entries(commonScales)) {
      const matches = scaleValues.filter(val => 
        spacing.spacingValues.some(sv => Math.abs(sv - val) < 2)
      );
      
      if (matches.length >= 3) {
        spacing.rhythm = {
          baseValue: scaleValues[0],
          ratio: scaleValues[1] / scaleValues[0],
          scale: scaleName
        };
        break;
      }
    }

    return spacing;
  }

  // Analyze accessibility aspects
  async analyzeAccessibility(document) {
    const accessibility = {
      score: 0,
      issues: [],
      improvements: []
    };

    // Check for alt texts
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
    if (imagesWithoutAlt.length > 0) {
      accessibility.issues.push(`${imagesWithoutAlt.length} images missing alt text`);
    }

    // Check for heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      accessibility.issues.push('No heading structure found');
    }

    // Check for ARIA landmarks
    const landmarks = document.querySelectorAll('[role="banner"], [role="navigation"], [role="main"], [role="contentinfo"]');
    if (landmarks.length === 0) {
      accessibility.improvements.push('Add ARIA landmark roles');
    }

    // Check for form labels
    const inputs = document.querySelectorAll('input, textarea, select');
    const inputsWithoutLabels = Array.from(inputs).filter(input => {
      const id = input.id;
      return !id || !document.querySelector(`label[for="${id}"]`);
    });
    if (inputsWithoutLabels.length > 0) {
      accessibility.issues.push(`${inputsWithoutLabels.length} form inputs missing labels`);
    }

    // Calculate score
    let score = 100;
    score -= accessibility.issues.length * 15;
    score = Math.max(0, score);

    accessibility.score = score;
    return accessibility;
  }

  // Generate improvement suggestions
  async generateSuggestions(analysis) {
    const suggestions = [];

    // Layout suggestions
    if (analysis.layoutType.type === 'unknown') {
      suggestions.push({
        type: 'layout',
        priority: 'high',
        title: 'Unclear Layout Structure',
        description: 'Consider using semantic HTML elements and CSS Grid or Flexbox for clearer layout structure',
        category: 'structure'
      });
    }

    // Responsiveness suggestions
    if (analysis.responsiveness.score < 60) {
      suggestions.push({
        type: 'responsive',
        priority: 'high',
        title: 'Improve Responsiveness',
        description: 'Add media queries and use responsive units for better mobile experience',
        category: 'responsiveness'
      });
    }

    // Semantic suggestions
    if (analysis.semantics.score < 70) {
      suggestions.push({
        type: 'semantic',
        priority: 'medium',
        title: 'Enhance Semantic Structure',
        description: 'Use semantic HTML elements like <main>, <nav>, <header>, and <footer>',
        category: 'accessibility'
      });
    }

    // Spacing suggestions
    if (!analysis.spacing.hasConsistentSpacing) {
      suggestions.push({
        type: 'spacing',
        priority: 'medium',
        title: 'Inconsistent Spacing',
        description: 'Establish a consistent spacing scale using CSS custom properties',
        category: 'design-system'
      });
    }

    // Accessibility suggestions
    if (analysis.accessibility.score < 80) {
      suggestions.push({
        type: 'accessibility',
        priority: 'high',
        title: 'Accessibility Improvements Needed',
        description: analysis.accessibility.issues.join('; '),
        category: 'accessibility'
      });
    }

    return suggestions;
  }

  // Analyze layout performance
  async analyzePerformance(document, css) {
    const performance = {
      domComplexity: 'low',
      cssComplexity: 'low',
      layoutShifts: 'minimal',
      renderingCost: 'low',
      score: 85
    };

    // DOM complexity
    const totalElements = document.querySelectorAll('*').length;
    if (totalElements > 1000) {
      performance.domComplexity = 'high';
    } else if (totalElements > 500) {
      performance.domComplexity = 'medium';
    }

    // CSS complexity (simplified)
    const cssLines = css.split('\n').length;
    const cssSelectors = (css.match(/[^{}]+(?=\{)/g) || []).length;
    
    if (cssSelectors > 200 || cssLines > 1000) {
      performance.cssComplexity = 'high';
    } else if (cssSelectors > 100 || cssLines > 500) {
      performance.cssComplexity = 'medium';
    }

    // Calculate performance score
    let score = 100;
    if (performance.domComplexity === 'high') score -= 20;
    if (performance.domComplexity === 'medium') score -= 10;
    if (performance.cssComplexity === 'high') score -= 15;
    if (performance.cssComplexity === 'medium') score -= 7;

    performance.score = score;
    return performance;
  }
}

module.exports = { LayoutAnalyzer };