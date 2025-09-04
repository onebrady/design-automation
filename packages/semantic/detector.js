const { JSDOM } = require('jsdom');

class ComponentDetector {
  constructor(options = {}) {
    this.options = {
      confidenceThreshold: options.confidenceThreshold || 0.7,
      includeVariants: options.includeVariants !== false,
      ...options
    };

    this.componentPatterns = new Map([
      // Navigation Components
      ['navigation', {
        selectors: ['nav', '[role="navigation"]', '.nav', '.navbar', '.menu'],
        patterns: ['nav', 'navigation', 'menu', 'navbar'],
        structure: {
          hasItems: true,
          itemSelector: 'a, button, .nav-item, .menu-item',
          minItems: 2
        },
        semantic: {
          role: 'navigation',
          landmark: true
        }
      }],
      
      // Button Components
      ['button', {
        selectors: ['button', '[role="button"]', '.btn', '.button', 'input[type="submit"]'],
        patterns: ['btn', 'button', 'action', 'submit'],
        structure: {
          interactive: true,
          focusable: true
        },
        semantic: {
          role: 'button',
          interactive: true
        }
      }],
      
      // Card Components  
      ['card', {
        selectors: ['.card', '.tile', '.panel', '[role="article"]', 'article'],
        patterns: ['card', 'tile', 'panel', 'item'],
        structure: {
          hasContent: true,
          sections: ['header', 'body', 'footer'],
          minHeight: 100
        },
        semantic: {
          role: 'article',
          sectioning: true
        }
      }],
      
      // Form Components
      ['form', {
        selectors: ['form', '[role="form"]', '.form'],
        patterns: ['form', 'contact', 'login', 'register', 'signup'],
        structure: {
          hasInputs: true,
          inputSelector: 'input, textarea, select',
          minInputs: 1
        },
        semantic: {
          role: 'form',
          landmark: true
        }
      }],
      
      // Modal/Dialog Components
      ['modal', {
        selectors: ['.modal', '.dialog', '[role="dialog"]', '[role="alertdialog"]'],
        patterns: ['modal', 'dialog', 'popup', 'overlay'],
        structure: {
          overlay: true,
          closeable: true,
          centered: true
        },
        semantic: {
          role: 'dialog',
          modal: true
        }
      }],
      
      // Header Components
      ['header', {
        selectors: ['header', '[role="banner"]', '.header', '.masthead'],
        patterns: ['header', 'masthead', 'banner', 'top'],
        structure: {
          position: 'top',
          spanning: true
        },
        semantic: {
          role: 'banner',
          landmark: true
        }
      }],
      
      // Footer Components
      ['footer', {
        selectors: ['footer', '[role="contentinfo"]', '.footer'],
        patterns: ['footer', 'bottom', 'info'],
        structure: {
          position: 'bottom',
          spanning: true
        },
        semantic: {
          role: 'contentinfo',
          landmark: true
        }
      }],
      
      // Sidebar Components
      ['sidebar', {
        selectors: ['aside', '[role="complementary"]', '.sidebar', '.aside'],
        patterns: ['sidebar', 'aside', 'complementary'],
        structure: {
          position: 'side',
          secondary: true
        },
        semantic: {
          role: 'complementary',
          landmark: true
        }
      }],
      
      // Table Components
      ['table', {
        selectors: ['table', '[role="table"]', '.table'],
        patterns: ['table', 'grid', 'data'],
        structure: {
          hasRows: true,
          hasColumns: true,
          rowSelector: 'tr, [role="row"]',
          cellSelector: 'td, th, [role="cell"], [role="columnheader"]'
        },
        semantic: {
          role: 'table',
          tabular: true
        }
      }],
      
      // List Components
      ['list', {
        selectors: ['ul', 'ol', '[role="list"]', '.list'],
        patterns: ['list', 'items', 'collection'],
        structure: {
          hasItems: true,
          itemSelector: 'li, [role="listitem"]',
          minItems: 2
        },
        semantic: {
          role: 'list',
          collection: true
        }
      }],
      
      // Tab Components
      ['tabs', {
        selectors: ['[role="tablist"]', '.tabs', '.tab-container'],
        patterns: ['tabs', 'tablist', 'tabbed'],
        structure: {
          hasTabList: true,
          hasPanels: true,
          tabSelector: '[role="tab"], .tab',
          panelSelector: '[role="tabpanel"], .tab-panel'
        },
        semantic: {
          role: 'tablist',
          interactive: true
        }
      }],
      
      // Alert Components
      ['alert', {
        selectors: ['[role="alert"]', '[role="alertdialog"]', '.alert', '.notification'],
        patterns: ['alert', 'notification', 'message', 'toast'],
        structure: {
          prominent: true,
          temporary: true
        },
        semantic: {
          role: 'alert',
          live: true
        }
      }],
      
      // Breadcrumb Components
      ['breadcrumb', {
        selectors: ['[role="breadcrumb"]', '.breadcrumb', '.breadcrumbs'],
        patterns: ['breadcrumb', 'breadcrumbs', 'path', 'trail'],
        structure: {
          hasItems: true,
          ordered: true,
          itemSelector: 'a, span',
          separator: true
        },
        semantic: {
          role: 'navigation',
          breadcrumb: true
        }
      }],
      
      // Search Components
      ['search', {
        selectors: ['[role="search"]', '.search', '.search-form'],
        patterns: ['search', 'find', 'query'],
        structure: {
          hasInput: true,
          inputSelector: 'input[type="search"], input[type="text"]',
          hasSubmit: true
        },
        semantic: {
          role: 'search',
          landmark: true
        }
      }]
    ]);

    this.semanticElements = new Set([
      'article', 'aside', 'details', 'figcaption', 'figure',
      'footer', 'header', 'main', 'mark', 'nav', 'section',
      'summary', 'time'
    ]);

    this.ariaRoles = new Set([
      'alert', 'alertdialog', 'application', 'article', 'banner',
      'button', 'cell', 'checkbox', 'columnheader', 'combobox',
      'complementary', 'contentinfo', 'dialog', 'directory',
      'document', 'form', 'grid', 'gridcell', 'group', 'heading',
      'img', 'link', 'list', 'listbox', 'listitem', 'log',
      'main', 'marquee', 'math', 'menu', 'menubar', 'menuitem',
      'menuitemcheckbox', 'menuitemradio', 'navigation', 'note',
      'option', 'presentation', 'progressbar', 'radio', 'radiogroup',
      'region', 'row', 'rowgroup', 'rowheader', 'scrollbar',
      'search', 'separator', 'slider', 'spinbutton', 'status',
      'tab', 'tablist', 'tabpanel', 'textbox', 'timer',
      'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'
    ]);
  }

  // Main detection method
  async detectComponents(html, options = {}) {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const detectedComponents = [];
    const processedElements = new Set();

    // Detect components using patterns
    for (const [componentType, pattern] of this.componentPatterns) {
      const elements = this.findElementsByPattern(document, pattern);
      
      for (const element of elements) {
        if (!processedElements.has(element)) {
          const analysis = this.analyzeElement(element, componentType, pattern);
          
          if (analysis.confidence >= this.options.confidenceThreshold) {
            detectedComponents.push(analysis);
            processedElements.add(element);
            
            // Mark all child elements as processed to avoid double-detection
            this.markChildrenAsProcessed(element, processedElements);
          }
        }
      }
    }

    // Additional semantic analysis
    const semanticAnalysis = this.analyzeSemanticStructure(document);
    
    return {
      components: detectedComponents,
      semanticStructure: semanticAnalysis,
      statistics: this.calculateStatistics(detectedComponents),
      recommendations: this.generateRecommendations(detectedComponents, semanticAnalysis)
    };
  }

  // Find elements matching component pattern
  findElementsByPattern(document, pattern) {
    const elements = new Set();
    
    // Find by selectors
    pattern.selectors.forEach(selector => {
      try {
        const found = document.querySelectorAll(selector);
        found.forEach(el => elements.add(el));
      } catch (e) {
        // Invalid selector, skip
      }
    });
    
    // Find by class name patterns
    pattern.patterns.forEach(patternName => {
      const classElements = document.querySelectorAll(`[class*="${patternName}"]`);
      classElements.forEach(el => elements.add(el));
      
      const idElements = document.querySelectorAll(`[id*="${patternName}"]`);
      idElements.forEach(el => elements.add(el));
    });
    
    return Array.from(elements);
  }

  // Analyze individual element
  analyzeElement(element, componentType, pattern) {
    const analysis = {
      type: componentType,
      element: {
        tagName: element.tagName.toLowerCase(),
        id: element.id || null,
        className: element.className || null,
        role: element.getAttribute('role') || null
      },
      confidence: 0,
      reasons: [],
      properties: {},
      accessibility: this.analyzeAccessibility(element),
      structure: this.analyzeStructure(element, pattern),
      semantic: this.analyzeSemanticContext(element),
      recommendations: []
    };

    // Calculate confidence score
    let confidence = 0;
    
    // Selector match bonus
    const matchesSelector = pattern.selectors.some(selector => {
      try {
        return element.matches(selector);
      } catch (e) {
        return false;
      }
    });
    if (matchesSelector) {
      confidence += 0.4;
      analysis.reasons.push('Matches expected selector');
    }
    
    // Pattern match bonus
    const classText = element.className.toLowerCase();
    const idText = element.id?.toLowerCase() || '';
    const matchesPattern = pattern.patterns.some(p => 
      classText.includes(p) || idText.includes(p)
    );
    if (matchesPattern) {
      confidence += 0.3;
      analysis.reasons.push('Matches naming pattern');
    }
    
    // Structure validation bonus
    const structureScore = this.validateStructure(element, pattern.structure);
    confidence += structureScore * 0.3;
    if (structureScore > 0.5) {
      analysis.reasons.push('Has expected structure');
    }

    // Semantic validation bonus
    if (pattern.semantic && this.validateSemantic(element, pattern.semantic)) {
      confidence += 0.2;
      analysis.reasons.push('Semantically appropriate');
    }

    analysis.confidence = Math.min(confidence, 1.0);
    
    // Add component-specific properties
    analysis.properties = this.extractProperties(element, componentType);
    
    // Generate recommendations
    analysis.recommendations = this.generateElementRecommendations(
      element, componentType, analysis
    );

    return analysis;
  }

  // Validate element structure against pattern
  validateStructure(element, structure) {
    if (!structure) return 0.5;
    
    let score = 0;
    let checks = 0;
    
    if (structure.hasItems !== undefined) {
      checks++;
      const items = element.querySelectorAll(structure.itemSelector || 'a, button, li');
      const hasEnoughItems = items.length >= (structure.minItems || 1);
      if (hasEnoughItems) score++;
    }
    
    if (structure.hasInputs !== undefined) {
      checks++;
      const inputs = element.querySelectorAll(structure.inputSelector || 'input, textarea, select');
      const hasEnoughInputs = inputs.length >= (structure.minInputs || 1);
      if (hasEnoughInputs) score++;
    }
    
    if (structure.interactive !== undefined) {
      checks++;
      const isInteractive = this.isInteractiveElement(element);
      if (isInteractive === structure.interactive) score++;
    }
    
    if (structure.focusable !== undefined) {
      checks++;
      const isFocusable = this.isFocusableElement(element);
      if (isFocusable === structure.focusable) score++;
    }
    
    return checks > 0 ? score / checks : 0.5;
  }

  // Validate semantic properties
  validateSemantic(element, semantic) {
    if (!semantic) return true;
    
    if (semantic.role) {
      const actualRole = element.getAttribute('role') || this.getImplicitRole(element);
      return actualRole === semantic.role;
    }
    
    if (semantic.landmark !== undefined) {
      return this.isLandmarkElement(element) === semantic.landmark;
    }
    
    return true;
  }

  // Get implicit ARIA role for element
  getImplicitRole(element) {
    const tagName = element.tagName.toLowerCase();
    const type = element.type?.toLowerCase();
    
    const roleMap = {
      'button': 'button',
      'a': element.href ? 'link' : null,
      'input': type === 'button' || type === 'submit' ? 'button' : 
               type === 'checkbox' ? 'checkbox' :
               type === 'radio' ? 'radio' : 'textbox',
      'textarea': 'textbox',
      'select': 'combobox',
      'nav': 'navigation',
      'main': 'main',
      'header': 'banner',
      'footer': 'contentinfo',
      'aside': 'complementary',
      'section': 'region',
      'article': 'article',
      'form': 'form',
      'table': 'table',
      'ul': 'list',
      'ol': 'list',
      'li': 'listitem',
      'h1': 'heading',
      'h2': 'heading',
      'h3': 'heading',
      'h4': 'heading',
      'h5': 'heading',
      'h6': 'heading'
    };
    
    return roleMap[tagName] || null;
  }

  // Check if element is a landmark
  isLandmarkElement(element) {
    const role = element.getAttribute('role') || this.getImplicitRole(element);
    const landmarkRoles = new Set([
      'banner', 'contentinfo', 'main', 'navigation', 'complementary',
      'search', 'region', 'form'
    ]);
    
    return landmarkRoles.has(role);
  }

  // Check if element is interactive
  isInteractiveElement(element) {
    const tagName = element.tagName.toLowerCase();
    const interactiveTags = new Set([
      'button', 'input', 'textarea', 'select', 'a', 'details', 'summary'
    ]);
    
    if (interactiveTags.has(tagName)) return true;
    
    const role = element.getAttribute('role');
    const interactiveRoles = new Set([
      'button', 'link', 'menuitem', 'tab', 'option', 'radio', 'checkbox'
    ]);
    
    return interactiveRoles.has(role);
  }

  // Check if element is focusable
  isFocusableElement(element) {
    const tagName = element.tagName.toLowerCase();
    const type = element.type?.toLowerCase();
    
    // Disabled elements are not focusable
    if (element.disabled) return false;
    
    // Elements with tabindex
    const tabindex = element.getAttribute('tabindex');
    if (tabindex !== null) {
      return parseInt(tabindex) >= 0;
    }
    
    // Naturally focusable elements
    const focusableTags = new Set([
      'button', 'input', 'textarea', 'select', 'a', 'area', 'summary'
    ]);
    
    if (focusableTags.has(tagName)) {
      if (tagName === 'a' || tagName === 'area') {
        return element.href !== undefined;
      }
      return true;
    }
    
    return false;
  }

  // Analyze accessibility features
  analyzeAccessibility(element) {
    return {
      hasAriaLabel: !!element.getAttribute('aria-label'),
      hasAriaLabelledBy: !!element.getAttribute('aria-labelledby'),
      hasAriaDescribedBy: !!element.getAttribute('aria-describedby'),
      hasRole: !!element.getAttribute('role'),
      isFocusable: this.isFocusableElement(element),
      isInteractive: this.isInteractiveElement(element),
      hasAltText: element.tagName.toLowerCase() === 'img' ? !!element.alt : null,
      ariaAttributes: this.getAriaAttributes(element),
      issues: this.identifyAccessibilityIssues(element)
    };
  }

  // Get all ARIA attributes
  getAriaAttributes(element) {
    const ariaAttrs = {};
    for (const attr of element.attributes) {
      if (attr.name.startsWith('aria-')) {
        ariaAttrs[attr.name] = attr.value;
      }
    }
    return ariaAttrs;
  }

  // Identify accessibility issues
  identifyAccessibilityIssues(element) {
    const issues = [];
    const tagName = element.tagName.toLowerCase();
    
    // Missing alt text for images
    if (tagName === 'img' && !element.alt) {
      issues.push({
        type: 'missing-alt-text',
        severity: 'error',
        message: 'Image missing alt attribute'
      });
    }
    
    // Interactive elements without accessible name
    if (this.isInteractiveElement(element)) {
      const hasAccessibleName = element.getAttribute('aria-label') ||
        element.getAttribute('aria-labelledby') ||
        element.textContent?.trim() ||
        (tagName === 'input' && element.labels?.length > 0);
        
      if (!hasAccessibleName) {
        issues.push({
          type: 'missing-accessible-name',
          severity: 'error',
          message: 'Interactive element missing accessible name'
        });
      }
    }
    
    // Form inputs without labels
    if (tagName === 'input' && element.type !== 'submit' && element.type !== 'button') {
      const hasLabel = element.labels?.length > 0 ||
        element.getAttribute('aria-label') ||
        element.getAttribute('aria-labelledby');
        
      if (!hasLabel) {
        issues.push({
          type: 'missing-form-label',
          severity: 'error',
          message: 'Form input missing label'
        });
      }
    }
    
    // Missing heading structure
    if (tagName.match(/^h[1-6]$/)) {
      const level = parseInt(tagName[1]);
      // This would need more context to properly validate heading hierarchy
    }
    
    return issues;
  }

  // Analyze element structure
  analyzeStructure(element, pattern) {
    const structure = {
      tagName: element.tagName.toLowerCase(),
      children: element.children.length,
      depth: this.getElementDepth(element),
      textContent: element.textContent?.trim()?.length || 0,
      hasText: !!element.textContent?.trim(),
      childTypes: this.getChildTypes(element),
      dimensions: this.getApproximateDimensions(element)
    };
    
    // Add pattern-specific structure analysis
    if (pattern.structure?.itemSelector) {
      const items = element.querySelectorAll(pattern.structure.itemSelector);
      structure.items = Array.from(items).map(item => ({
        tagName: item.tagName.toLowerCase(),
        textContent: item.textContent?.trim(),
        hasLink: !!item.querySelector('a'),
        isInteractive: this.isInteractiveElement(item)
      }));
    }
    
    return structure;
  }

  // Get element depth in DOM tree
  getElementDepth(element) {
    let depth = 0;
    let current = element.parentElement;
    while (current) {
      depth++;
      current = current.parentElement;
    }
    return depth;
  }

  // Get types of child elements
  getChildTypes(element) {
    const types = {};
    for (const child of element.children) {
      const tagName = child.tagName.toLowerCase();
      types[tagName] = (types[tagName] || 0) + 1;
    }
    return types;
  }

  // Get approximate dimensions (placeholder since we don't have layout)
  getApproximateDimensions(element) {
    // This would need actual DOM layout information
    return {
      hasInlineStyle: !!element.style.cssText,
      hasWidthStyle: element.style.width !== '',
      hasHeightStyle: element.style.height !== '',
      hasPositionStyle: element.style.position !== ''
    };
  }

  // Analyze semantic context
  analyzeSemanticContext(element) {
    return {
      isSemanticElement: this.semanticElements.has(element.tagName.toLowerCase()),
      hasSemanticParent: this.hasSemanticParent(element),
      role: element.getAttribute('role'),
      implicitRole: this.getImplicitRole(element),
      landmarks: this.findLandmarkAncestors(element),
      headingLevel: this.findHeadingContext(element)
    };
  }

  // Check if element has semantic parent
  hasSemanticParent(element) {
    let parent = element.parentElement;
    while (parent) {
      if (this.semanticElements.has(parent.tagName.toLowerCase()) ||
          parent.getAttribute('role')) {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }

  // Find landmark ancestors
  findLandmarkAncestors(element) {
    const landmarks = [];
    let parent = element.parentElement;
    
    while (parent) {
      if (this.isLandmarkElement(parent)) {
        landmarks.push({
          tagName: parent.tagName.toLowerCase(),
          role: parent.getAttribute('role') || this.getImplicitRole(parent)
        });
      }
      parent = parent.parentElement;
    }
    
    return landmarks;
  }

  // Find heading context
  findHeadingContext(element) {
    const headings = element.ownerDocument.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let closestHeading = null;
    let minDistance = Infinity;
    
    for (const heading of headings) {
      if (this.isElementBefore(heading, element)) {
        const distance = this.getElementDistance(heading, element);
        if (distance < minDistance) {
          minDistance = distance;
          closestHeading = heading;
        }
      }
    }
    
    return closestHeading ? {
      tagName: closestHeading.tagName.toLowerCase(),
      level: parseInt(closestHeading.tagName[1]),
      text: closestHeading.textContent?.trim()
    } : null;
  }

  // Check if element A comes before element B in document order
  isElementBefore(elementA, elementB) {
    const position = elementA.compareDocumentPosition(elementB);
    return !!(position & 4); // Node.DOCUMENT_POSITION_FOLLOWING = 4
  }

  // Get approximate distance between elements (simplified)
  getElementDistance(elementA, elementB) {
    let current = elementA;
    let distance = 0;
    
    while (current && current !== elementB && distance < 100) {
      current = current.nextElementSibling || current.parentElement?.nextElementSibling;
      distance++;
    }
    
    return current === elementB ? distance : Infinity;
  }

  // Extract component-specific properties
  extractProperties(element, componentType) {
    const properties = {};
    
    switch (componentType) {
      case 'button':
        properties.type = element.type || 'button';
        properties.disabled = element.disabled;
        properties.variant = this.detectButtonVariant(element);
        break;
        
      case 'form':
        properties.method = element.method;
        properties.action = element.action;
        properties.inputs = element.querySelectorAll('input, textarea, select').length;
        break;
        
      case 'navigation':
        properties.items = element.querySelectorAll('a, button').length;
        properties.hasDropdown = !!element.querySelector('.dropdown, [role="menu"]');
        break;
        
      case 'card':
        properties.hasImage = !!element.querySelector('img');
        properties.hasHeader = !!element.querySelector('header, .card-header, h1, h2, h3, h4, h5, h6');
        properties.hasFooter = !!element.querySelector('footer, .card-footer');
        break;
        
      case 'table':
        properties.rows = element.querySelectorAll('tr').length;
        properties.columns = this.getTableColumns(element);
        properties.hasHeader = !!element.querySelector('thead, th');
        break;
    }
    
    return properties;
  }

  // Detect button variant based on styling/classes
  detectButtonVariant(element) {
    const className = element.className.toLowerCase();
    
    if (className.includes('primary')) return 'primary';
    if (className.includes('secondary')) return 'secondary';
    if (className.includes('danger') || className.includes('error')) return 'danger';
    if (className.includes('success')) return 'success';
    if (className.includes('warning')) return 'warning';
    if (className.includes('outline')) return 'outline';
    if (className.includes('ghost')) return 'ghost';
    if (className.includes('link')) return 'link';
    
    return 'default';
  }

  // Get number of table columns
  getTableColumns(table) {
    const firstRow = table.querySelector('tr');
    return firstRow ? firstRow.querySelectorAll('td, th').length : 0;
  }

  // Mark all child elements as processed
  markChildrenAsProcessed(element, processedSet) {
    for (const child of element.querySelectorAll('*')) {
      processedSet.add(child);
    }
  }

  // Analyze overall semantic structure
  analyzeSemanticStructure(document) {
    return {
      landmarks: this.findLandmarks(document),
      headingStructure: this.analyzeHeadingStructure(document),
      semanticElements: this.countSemanticElements(document),
      ariaUsage: this.analyzeAriaUsage(document),
      focusFlow: this.analyzeFocusFlow(document)
    };
  }

  // Find all landmarks
  findLandmarks(document) {
    const landmarks = [];
    const landmarkSelectors = [
      'main', 'nav', 'header', 'footer', 'aside', 'section',
      '[role="main"]', '[role="navigation"]', '[role="banner"]',
      '[role="contentinfo"]', '[role="complementary"]', '[role="region"]',
      '[role="search"]', '[role="form"]'
    ];
    
    landmarkSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        landmarks.push({
          tagName: element.tagName.toLowerCase(),
          role: element.getAttribute('role') || this.getImplicitRole(element),
          hasLabel: !!(element.getAttribute('aria-label') || element.getAttribute('aria-labelledby')),
          id: element.id || null
        });
      });
    });
    
    return landmarks;
  }

  // Analyze heading structure
  analyzeHeadingStructure(document) {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const structure = [];
    const issues = [];
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName[1]);
      const text = heading.textContent?.trim();
      
      structure.push({
        level,
        text,
        tagName: heading.tagName.toLowerCase(),
        id: heading.id || null,
        hasId: !!heading.id
      });
      
      // Check for heading level skips
      if (index > 0) {
        const prevLevel = structure[index - 1].level;
        if (level > prevLevel + 1) {
          issues.push({
            type: 'heading-level-skip',
            severity: 'warning',
            message: `Heading level skips from h${prevLevel} to h${level}`,
            element: heading.tagName.toLowerCase()
          });
        }
      }
    });
    
    // Check for missing h1
    if (structure.length > 0 && structure[0].level !== 1) {
      issues.push({
        type: 'missing-h1',
        severity: 'error',
        message: 'Page missing h1 heading'
      });
    }
    
    return {
      headings: structure,
      issues
    };
  }

  // Count semantic elements
  countSemanticElements(document) {
    const counts = {};
    this.semanticElements.forEach(tagName => {
      counts[tagName] = document.querySelectorAll(tagName).length;
    });
    return counts;
  }

  // Analyze ARIA usage
  analyzeAriaUsage(document) {
    const allElements = document.querySelectorAll('*');
    const ariaStats = {
      elementsWithRole: 0,
      elementsWithAriaLabel: 0,
      elementsWithAriaLabelledBy: 0,
      elementsWithAriaDescribedBy: 0,
      totalAriaAttributes: 0,
      roleUsage: {},
      ariaAttributeUsage: {}
    };
    
    allElements.forEach(element => {
      const role = element.getAttribute('role');
      if (role) {
        ariaStats.elementsWithRole++;
        ariaStats.roleUsage[role] = (ariaStats.roleUsage[role] || 0) + 1;
      }
      
      if (element.getAttribute('aria-label')) ariaStats.elementsWithAriaLabel++;
      if (element.getAttribute('aria-labelledby')) ariaStats.elementsWithAriaLabelledBy++;
      if (element.getAttribute('aria-describedby')) ariaStats.elementsWithAriaDescribedBy++;
      
      for (const attr of element.attributes) {
        if (attr.name.startsWith('aria-')) {
          ariaStats.totalAriaAttributes++;
          ariaStats.ariaAttributeUsage[attr.name] = (ariaStats.ariaAttributeUsage[attr.name] || 0) + 1;
        }
      }
    });
    
    return ariaStats;
  }

  // Analyze focus flow
  analyzeFocusFlow(document) {
    const focusableElements = this.findFocusableElements(document);
    
    return {
      totalFocusable: focusableElements.length,
      focusableTypes: this.categorizeFocusableElements(focusableElements),
      tabIndexIssues: this.findTabIndexIssues(focusableElements),
      skipLinks: this.findSkipLinks(document)
    };
  }

  // Find all focusable elements
  findFocusableElements(document) {
    const allElements = document.querySelectorAll('*');
    return Array.from(allElements).filter(el => this.isFocusableElement(el));
  }

  // Categorize focusable elements
  categorizeFocusableElements(elements) {
    const categories = {};
    elements.forEach(element => {
      const tagName = element.tagName.toLowerCase();
      categories[tagName] = (categories[tagName] || 0) + 1;
    });
    return categories;
  }

  // Find tabindex issues
  findTabIndexIssues(elements) {
    const issues = [];
    elements.forEach(element => {
      const tabindex = element.getAttribute('tabindex');
      if (tabindex && parseInt(tabindex) > 0) {
        issues.push({
          type: 'positive-tabindex',
          severity: 'warning',
          message: 'Positive tabindex can disrupt natural tab order',
          element: element.tagName.toLowerCase(),
          tabindex: parseInt(tabindex)
        });
      }
    });
    return issues;
  }

  // Find skip links
  findSkipLinks(document) {
    const skipLinks = document.querySelectorAll('a[href^="#"]');
    return Array.from(skipLinks).filter(link => {
      const text = link.textContent?.toLowerCase() || '';
      return text.includes('skip') || text.includes('jump');
    }).map(link => ({
      text: link.textContent?.trim(),
      href: link.href,
      target: document.querySelector(link.getAttribute('href'))
    }));
  }

  // Generate element-specific recommendations
  generateElementRecommendations(element, componentType, analysis) {
    const recommendations = [];
    
    // Accessibility recommendations
    analysis.accessibility.issues.forEach(issue => {
      recommendations.push({
        type: 'accessibility',
        priority: issue.severity === 'error' ? 'high' : 'medium',
        message: issue.message,
        fix: this.generateAccessibilityFix(issue, element)
      });
    });
    
    // Semantic recommendations
    if (!analysis.semantic.isSemanticElement && !analysis.element.role) {
      recommendations.push({
        type: 'semantic',
        priority: 'medium',
        message: `Consider using semantic HTML or ARIA role for ${componentType}`,
        fix: `Add role="${this.getSuggestedRole(componentType)}" or use appropriate HTML5 element`
      });
    }
    
    // Component-specific recommendations
    const componentRecs = this.getComponentSpecificRecommendations(element, componentType, analysis);
    recommendations.push(...componentRecs);
    
    return recommendations;
  }

  // Generate accessibility fix suggestions
  generateAccessibilityFix(issue, element) {
    switch (issue.type) {
      case 'missing-alt-text':
        return 'Add alt attribute describing the image content';
      case 'missing-accessible-name':
        return 'Add aria-label or ensure element has visible text content';
      case 'missing-form-label':
        return 'Add <label> element or aria-label attribute';
      default:
        return 'Review accessibility guidelines for this element type';
    }
  }

  // Get suggested ARIA role for component type
  getSuggestedRole(componentType) {
    const roleMap = {
      'button': 'button',
      'navigation': 'navigation',
      'card': 'article',
      'form': 'form',
      'modal': 'dialog',
      'header': 'banner',
      'footer': 'contentinfo',
      'sidebar': 'complementary',
      'table': 'table',
      'list': 'list',
      'tabs': 'tablist',
      'alert': 'alert',
      'breadcrumb': 'navigation',
      'search': 'search'
    };
    
    return roleMap[componentType] || 'region';
  }

  // Get component-specific recommendations
  getComponentSpecificRecommendations(element, componentType, analysis) {
    const recommendations = [];
    
    switch (componentType) {
      case 'navigation':
        if (analysis.structure.items && analysis.structure.items.length < 2) {
          recommendations.push({
            type: 'structure',
            priority: 'low',
            message: 'Navigation has very few items',
            fix: 'Consider if this should be navigation or individual links'
          });
        }
        break;
        
      case 'table':
        if (!analysis.properties.hasHeader) {
          recommendations.push({
            type: 'structure',
            priority: 'medium',
            message: 'Table missing header row',
            fix: 'Add <thead> with <th> elements for column headers'
          });
        }
        break;
        
      case 'form':
        if (analysis.properties.inputs < 2) {
          recommendations.push({
            type: 'structure',
            priority: 'low',
            message: 'Form has very few inputs',
            fix: 'Consider if this needs to be a <form> element'
          });
        }
        break;
    }
    
    return recommendations;
  }

  // Calculate statistics
  calculateStatistics(components) {
    const stats = {
      totalComponents: components.length,
      byType: {},
      byConfidence: { high: 0, medium: 0, low: 0 },
      averageConfidence: 0,
      accessibilityIssues: 0,
      semanticScore: 0
    };
    
    let confidenceSum = 0;
    
    components.forEach(component => {
      // Count by type
      stats.byType[component.type] = (stats.byType[component.type] || 0) + 1;
      
      // Count by confidence
      if (component.confidence >= 0.8) stats.byConfidence.high++;
      else if (component.confidence >= 0.6) stats.byConfidence.medium++;
      else stats.byConfidence.low++;
      
      confidenceSum += component.confidence;
      
      // Count accessibility issues
      stats.accessibilityIssues += component.accessibility.issues.length;
    });
    
    stats.averageConfidence = components.length > 0 ? confidenceSum / components.length : 0;
    
    // Calculate semantic score (simplified)
    const semanticComponents = components.filter(c => 
      c.semantic.isSemanticElement || c.element.role
    ).length;
    stats.semanticScore = components.length > 0 ? semanticComponents / components.length : 0;
    
    return stats;
  }

  // Generate overall recommendations
  generateRecommendations(components, semanticStructure) {
    const recommendations = [];
    
    // Overall accessibility recommendations
    const totalIssues = components.reduce((sum, c) => sum + c.accessibility.issues.length, 0);
    if (totalIssues > 0) {
      recommendations.push({
        type: 'accessibility',
        priority: 'high',
        message: `Found ${totalIssues} accessibility issues across components`,
        action: 'Review and fix accessibility issues in detected components'
      });
    }
    
    // Semantic structure recommendations
    if (semanticStructure.landmarks.length === 0) {
      recommendations.push({
        type: 'semantic',
        priority: 'high',
        message: 'No landmark elements found',
        action: 'Add semantic landmarks (header, nav, main, footer, aside)'
      });
    }
    
    if (semanticStructure.headingStructure.headings.length === 0) {
      recommendations.push({
        type: 'semantic',
        priority: 'high',
        message: 'No heading elements found',
        action: 'Add proper heading structure starting with h1'
      });
    }
    
    if (semanticStructure.headingStructure.issues.length > 0) {
      recommendations.push({
        type: 'semantic',
        priority: 'medium',
        message: `${semanticStructure.headingStructure.issues.length} heading structure issues`,
        action: 'Fix heading level hierarchy'
      });
    }
    
    return recommendations;
  }
}

module.exports = { ComponentDetector };