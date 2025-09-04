const { JSDOM } = require('jsdom');

class AccessibilityAnalyzer {
  constructor(options = {}) {
    this.options = {
      level: options.level || 'AA', // WCAG level (A, AA, AAA)
      includeWarnings: options.includeWarnings !== false,
      checkColorContrast: options.checkColorContrast !== false,
      ...options
    };

    // WCAG 2.1 AA color contrast ratios
    this.contrastRatios = {
      'AA': { normal: 4.5, large: 3.0 },
      'AAA': { normal: 7.0, large: 4.5 }
    };

    // Common accessibility issues and their severity
    this.accessibilityRules = new Map([
      ['missing-alt-text', {
        severity: 'error',
        wcagLevel: 'A',
        criterion: '1.1.1',
        description: 'Images must have alternative text'
      }],
      ['missing-form-label', {
        severity: 'error',
        wcagLevel: 'A',
        criterion: '3.3.2',
        description: 'Form inputs must have labels'
      }],
      ['missing-accessible-name', {
        severity: 'error',
        wcagLevel: 'A',
        criterion: '4.1.2',
        description: 'Interactive elements must have accessible names'
      }],
      ['low-contrast', {
        severity: 'error',
        wcagLevel: 'AA',
        criterion: '1.4.3',
        description: 'Text must have sufficient color contrast'
      }],
      ['missing-lang-attribute', {
        severity: 'error',
        wcagLevel: 'A',
        criterion: '3.1.1',
        description: 'Page must have language specified'
      }],
      ['duplicate-id', {
        severity: 'error',
        wcagLevel: 'A',
        criterion: '4.1.1',
        description: 'IDs must be unique'
      }],
      ['missing-heading-structure', {
        severity: 'warning',
        wcagLevel: 'AA',
        criterion: '1.3.1',
        description: 'Proper heading hierarchy improves navigation'
      }],
      ['missing-landmarks', {
        severity: 'warning',
        wcagLevel: 'AA',
        criterion: '1.3.1',
        description: 'Landmark elements help screen reader navigation'
      }],
      ['positive-tabindex', {
        severity: 'warning',
        wcagLevel: 'A',
        criterion: '2.4.3',
        description: 'Positive tabindex disrupts natural tab order'
      }],
      ['empty-heading', {
        severity: 'error',
        wcagLevel: 'A',
        criterion: '1.3.1',
        description: 'Headings must have text content'
      }],
      ['empty-button', {
        severity: 'error',
        wcagLevel: 'A',
        criterion: '4.1.2',
        description: 'Buttons must have accessible text'
      }],
      ['empty-link', {
        severity: 'error',
        wcagLevel: 'A',
        criterion: '2.4.4',
        description: 'Links must have accessible text'
      }],
      ['missing-table-headers', {
        severity: 'error',
        wcagLevel: 'A',
        criterion: '1.3.1',
        description: 'Data tables must have proper headers'
      }],
      ['invalid-aria', {
        severity: 'error',
        wcagLevel: 'A',
        criterion: '4.1.2',
        description: 'ARIA attributes must be valid'
      }]
    ]);

    // Valid ARIA attributes for different roles
    this.validAriaAttributes = new Map([
      ['button', new Set(['aria-expanded', 'aria-haspopup', 'aria-pressed', 'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-disabled'])],
      ['link', new Set(['aria-expanded', 'aria-haspopup', 'aria-label', 'aria-labelledby', 'aria-describedby'])],
      ['textbox', new Set(['aria-autocomplete', 'aria-multiline', 'aria-placeholder', 'aria-readonly', 'aria-required', 'aria-label', 'aria-labelledby', 'aria-describedby'])],
      ['combobox', new Set(['aria-autocomplete', 'aria-expanded', 'aria-haspopup', 'aria-required', 'aria-label', 'aria-labelledby', 'aria-describedby'])],
      ['checkbox', new Set(['aria-checked', 'aria-readonly', 'aria-required', 'aria-label', 'aria-labelledby', 'aria-describedby'])],
      ['radio', new Set(['aria-checked', 'aria-setsize', 'aria-posinset', 'aria-label', 'aria-labelledby', 'aria-describedby'])],
      ['tab', new Set(['aria-selected', 'aria-expanded', 'aria-controls', 'aria-label', 'aria-labelledby', 'aria-describedby'])],
      ['tabpanel', new Set(['aria-labelledby', 'aria-describedby'])],
      ['dialog', new Set(['aria-labelledby', 'aria-describedby', 'aria-modal'])],
      ['alert', new Set(['aria-live', 'aria-atomic', 'aria-label', 'aria-labelledby'])],
      ['navigation', new Set(['aria-label', 'aria-labelledby'])],
      ['main', new Set(['aria-label', 'aria-labelledby'])],
      ['region', new Set(['aria-label', 'aria-labelledby'])],
      ['list', new Set(['aria-label', 'aria-labelledby', 'aria-describedby'])],
      ['listitem', new Set(['aria-level', 'aria-setsize', 'aria-posinset', 'aria-label', 'aria-labelledby', 'aria-describedby'])]
    ]);
  }

  // Main analysis method
  async analyzeAccessibility(html, options = {}) {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const analysis = {
      summary: {
        totalIssues: 0,
        errors: 0,
        warnings: 0,
        score: 0
      },
      issues: [],
      elements: new Map(),
      recommendations: [],
      wcagCompliance: {
        level: this.options.level,
        criteria: new Map()
      }
    };

    // Run all accessibility checks
    await Promise.all([
      this.checkImages(document, analysis),
      this.checkForms(document, analysis),
      this.checkInteractiveElements(document, analysis),
      this.checkHeadingStructure(document, analysis),
      this.checkLandmarks(document, analysis),
      this.checkFocusManagement(document, analysis),
      this.checkLanguage(document, analysis),
      this.checkIds(document, analysis),
      this.checkTables(document, analysis),
      this.checkAria(document, analysis),
      this.checkKeyboardNavigation(document, analysis)
    ]);

    // Calculate scores and generate recommendations
    this.calculateScores(analysis);
    this.generateRecommendations(analysis);
    this.assessWcagCompliance(analysis);

    return analysis;
  }

  // Check images for alt text
  async checkImages(document, analysis) {
    const images = document.querySelectorAll('img');
    
    images.forEach((img, index) => {
      const issues = [];
      const elementId = `img-${index}`;

      // Check for alt attribute
      if (!img.hasAttribute('alt')) {
        issues.push(this.createIssue('missing-alt-text', img, 'Image missing alt attribute'));
      } else if (img.alt === '' && !img.getAttribute('role') === 'presentation') {
        // Empty alt should be intentional (decorative images)
        if (!this.isDecorativeImage(img)) {
          issues.push(this.createIssue('missing-alt-text', img, 'Image has empty alt but appears to be meaningful'));
        }
      }

      // Check alt text quality
      if (img.alt && this.isRedundantAltText(img.alt, img)) {
        issues.push(this.createIssue('redundant-alt-text', img, 'Alt text may be redundant or unhelpful', 'warning'));
      }

      analysis.elements.set(elementId, {
        element: img,
        type: 'image',
        issues,
        recommendations: this.generateImageRecommendations(img, issues)
      });

      issues.forEach(issue => analysis.issues.push(issue));
    });
  }

  // Check if image appears decorative
  isDecorativeImage(img) {
    const className = img.className.toLowerCase();
    const src = img.src.toLowerCase();
    
    // Common decorative image indicators
    const decorativePatterns = [
      'decoration', 'ornament', 'divider', 'spacer', 'bullet',
      'icon', 'arrow', 'bullet', 'star'
    ];
    
    return decorativePatterns.some(pattern => 
      className.includes(pattern) || src.includes(pattern)
    );
  }

  // Check for redundant alt text
  isRedundantAltText(altText, img) {
    const redundantPatterns = [
      /^image of /i,
      /^picture of /i,
      /^photo of /i,
      /^graphic of /i,
      /^illustration of /i
    ];
    
    return redundantPatterns.some(pattern => pattern.test(altText));
  }

  // Check form accessibility
  async checkForms(document, analysis) {
    const forms = document.querySelectorAll('form');
    const inputs = document.querySelectorAll('input, textarea, select');

    // Check individual inputs
    inputs.forEach((input, index) => {
      const issues = [];
      const elementId = `input-${index}`;

      // Skip certain input types that don't need labels
      const type = input.type?.toLowerCase();
      if (['submit', 'button', 'reset', 'image', 'hidden'].includes(type)) {
        return;
      }

      // Check for labels
      const hasLabel = this.hasAccessibleLabel(input);
      if (!hasLabel) {
        issues.push(this.createIssue('missing-form-label', input, 'Form input missing accessible label'));
      }

      // Check required fields
      if (input.required && !input.getAttribute('aria-required')) {
        issues.push(this.createIssue('missing-required-indicator', input, 'Required field should have aria-required="true"', 'warning'));
      }

      // Check for error handling
      if (input.getAttribute('aria-invalid') === 'true' && !input.getAttribute('aria-describedby')) {
        issues.push(this.createIssue('missing-error-description', input, 'Invalid input should reference error message', 'warning'));
      }

      analysis.elements.set(elementId, {
        element: input,
        type: 'form-input',
        issues,
        recommendations: this.generateFormRecommendations(input, issues)
      });

      issues.forEach(issue => analysis.issues.push(issue));
    });

    // Check form structure
    forms.forEach((form, index) => {
      const issues = [];
      const elementId = `form-${index}`;

      // Check for submit button
      const hasSubmit = form.querySelector('input[type="submit"], button[type="submit"], button:not([type])');
      if (!hasSubmit) {
        issues.push(this.createIssue('missing-submit-button', form, 'Form missing submit button', 'warning'));
      }

      // Check for fieldsets with multiple sections
      const inputs = form.querySelectorAll('input, textarea, select');
      if (inputs.length > 5 && !form.querySelector('fieldset')) {
        issues.push(this.createIssue('missing-fieldsets', form, 'Complex form should use fieldsets for grouping', 'warning'));
      }

      analysis.elements.set(elementId, {
        element: form,
        type: 'form',
        issues,
        recommendations: this.generateFormStructureRecommendations(form, issues)
      });

      issues.forEach(issue => analysis.issues.push(issue));
    });
  }

  // Check if input has accessible label
  hasAccessibleLabel(input) {
    // Explicit label via for/id
    if (input.id && document.querySelector(`label[for="${input.id}"]`)) {
      return true;
    }

    // Label wrapping input
    const parentLabel = input.closest('label');
    if (parentLabel) return true;

    // ARIA labeling
    if (input.getAttribute('aria-label')) return true;
    
    const labelledBy = input.getAttribute('aria-labelledby');
    if (labelledBy && document.getElementById(labelledBy)) return true;

    // Placeholder is not sufficient but better than nothing
    if (input.getAttribute('placeholder')) return false; // Should still flag as issue
    
    return false;
  }

  // Check interactive elements
  async checkInteractiveElements(document, analysis) {
    const interactiveElements = document.querySelectorAll(
      'button, a, input[type="button"], input[type="submit"], input[type="reset"], ' +
      '[role="button"], [role="link"], [tabindex]:not([tabindex="-1"])'
    );

    interactiveElements.forEach((element, index) => {
      const issues = [];
      const elementId = `interactive-${index}`;

      // Check for accessible name
      if (!this.hasAccessibleName(element)) {
        issues.push(this.createIssue('missing-accessible-name', element, 'Interactive element missing accessible name'));
      }

      // Check button-specific issues
      if (element.tagName.toLowerCase() === 'button' || element.getAttribute('role') === 'button') {
        if (!element.textContent?.trim() && !element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
          issues.push(this.createIssue('empty-button', element, 'Button has no accessible text'));
        }
      }

      // Check link-specific issues
      if (element.tagName.toLowerCase() === 'a' || element.getAttribute('role') === 'link') {
        if (!element.textContent?.trim() && !element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
          issues.push(this.createIssue('empty-link', element, 'Link has no accessible text'));
        }

        // Check for meaningful link text
        if (element.textContent && this.hasGenericLinkText(element.textContent)) {
          issues.push(this.createIssue('generic-link-text', element, 'Link text should be more descriptive', 'warning'));
        }
      }

      // Check focus visibility
      if (!this.hasFocusIndicator(element)) {
        issues.push(this.createIssue('missing-focus-indicator', element, 'Interactive element should have visible focus indicator', 'warning'));
      }

      analysis.elements.set(elementId, {
        element,
        type: 'interactive',
        issues,
        recommendations: this.generateInteractiveRecommendations(element, issues)
      });

      issues.forEach(issue => analysis.issues.push(issue));
    });
  }

  // Check if element has accessible name
  hasAccessibleName(element) {
    // Text content
    if (element.textContent?.trim()) return true;
    
    // ARIA labeling
    if (element.getAttribute('aria-label')) return true;
    
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement && labelElement.textContent?.trim()) return true;
    }
    
    // Image alt text for buttons/links containing only images
    const img = element.querySelector('img');
    if (img && img.alt) return true;
    
    // Value attribute for inputs
    if (element.value && element.tagName.toLowerCase() === 'input') return true;
    
    return false;
  }

  // Check for generic link text
  hasGenericLinkText(text) {
    const genericPhrases = [
      'click here', 'read more', 'more', 'here', 'link', 'this',
      'continue', 'go', 'next', 'previous', 'back'
    ];
    
    const normalizedText = text.toLowerCase().trim();
    return genericPhrases.includes(normalizedText);
  }

  // Check if element has focus indicator (simplified)
  hasFocusIndicator(element) {
    // This is a simplified check - in practice, you'd need to analyze computed styles
    const style = element.style;
    return style.outline !== 'none' && style.outline !== '0';
  }

  // Check heading structure
  async checkHeadingStructure(document, analysis) {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const issues = [];
    
    if (headings.length === 0) {
      issues.push(this.createIssue('missing-heading-structure', document.documentElement, 'No headings found on page'));
    } else {
      let hasH1 = false;
      let previousLevel = 0;
      
      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName[1]);
        const elementId = `heading-${index}`;

        const headingIssues = [];

        if (level === 1) hasH1 = true;

        // Check for empty headings
        if (!heading.textContent?.trim()) {
          headingIssues.push(this.createIssue('empty-heading', heading, 'Heading element is empty'));
        }

        // Check for proper hierarchy
        if (previousLevel > 0 && level > previousLevel + 1) {
          headingIssues.push(this.createIssue('heading-level-skip', heading, `Heading level skips from h${previousLevel} to h${level}`, 'warning'));
        }

        previousLevel = level;

        analysis.elements.set(elementId, {
          element: heading,
          type: 'heading',
          issues: headingIssues,
          recommendations: this.generateHeadingRecommendations(heading, headingIssues)
        });

        headingIssues.forEach(issue => analysis.issues.push(issue));
      });

      if (!hasH1) {
        issues.push(this.createIssue('missing-h1', document.documentElement, 'Page should have exactly one h1 heading'));
      }
    }

    issues.forEach(issue => analysis.issues.push(issue));
  }

  // Check landmark structure
  async checkLandmarks(document, analysis) {
    const landmarks = {
      main: document.querySelectorAll('main, [role="main"]'),
      navigation: document.querySelectorAll('nav, [role="navigation"]'),
      banner: document.querySelectorAll('header, [role="banner"]'),
      contentinfo: document.querySelectorAll('footer, [role="contentinfo"]'),
      complementary: document.querySelectorAll('aside, [role="complementary"]'),
      search: document.querySelectorAll('[role="search"]'),
      region: document.querySelectorAll('[role="region"]'),
      form: document.querySelectorAll('form, [role="form"]')
    };

    const issues = [];

    // Check for main landmark
    if (landmarks.main.length === 0) {
      issues.push(this.createIssue('missing-main-landmark', document.documentElement, 'Page should have one main landmark'));
    } else if (landmarks.main.length > 1) {
      issues.push(this.createIssue('multiple-main-landmarks', document.documentElement, 'Page should have only one main landmark', 'warning'));
    }

    // Check for navigation landmarks without labels when multiple exist
    if (landmarks.navigation.length > 1) {
      landmarks.navigation.forEach((nav, index) => {
        if (!nav.getAttribute('aria-label') && !nav.getAttribute('aria-labelledby')) {
          issues.push(this.createIssue('unlabeled-navigation', nav, 'Multiple navigation landmarks should have unique labels', 'warning'));
        }
      });
    }

    // Check region landmarks for labels
    landmarks.region.forEach(region => {
      if (!region.getAttribute('aria-label') && !region.getAttribute('aria-labelledby')) {
        issues.push(this.createIssue('unlabeled-region', region, 'Region landmarks must have accessible names'));
      }
    });

    issues.forEach(issue => analysis.issues.push(issue));
  }

  // Check focus management
  async checkFocusManagement(document, analysis) {
    const focusableElements = document.querySelectorAll(
      'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
    );

    const issues = [];

    // Check for positive tabindex values
    const positiveTabIndex = document.querySelectorAll('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])');
    positiveTabIndex.forEach(element => {
      const tabindex = parseInt(element.getAttribute('tabindex'));
      if (tabindex > 0) {
        issues.push(this.createIssue('positive-tabindex', element, `Positive tabindex (${tabindex}) disrupts natural tab order`, 'warning'));
      }
    });

    // Check for skip links
    const skipLinks = document.querySelectorAll('a[href^="#"]');
    const hasSkipToMain = Array.from(skipLinks).some(link => {
      const text = link.textContent?.toLowerCase() || '';
      return text.includes('skip') && (text.includes('main') || text.includes('content'));
    });

    if (focusableElements.length > 5 && !hasSkipToMain) {
      issues.push(this.createIssue('missing-skip-link', document.documentElement, 'Page with many focusable elements should have skip to main content link', 'warning'));
    }

    issues.forEach(issue => analysis.issues.push(issue));
  }

  // Check language attributes
  async checkLanguage(document, analysis) {
    const html = document.documentElement;
    const issues = [];

    if (!html.getAttribute('lang') && !html.getAttribute('xml:lang')) {
      issues.push(this.createIssue('missing-lang-attribute', html, 'HTML element should have lang attribute'));
    }

    issues.forEach(issue => analysis.issues.push(issue));
  }

  // Check for duplicate IDs
  async checkIds(document, analysis) {
    const elementsWithIds = document.querySelectorAll('[id]');
    const idMap = new Map();
    const issues = [];

    elementsWithIds.forEach(element => {
      const id = element.id;
      if (idMap.has(id)) {
        issues.push(this.createIssue('duplicate-id', element, `Duplicate ID: ${id}`));
      } else {
        idMap.set(id, element);
      }
    });

    issues.forEach(issue => analysis.issues.push(issue));
  }

  // Check table accessibility
  async checkTables(document, analysis) {
    const tables = document.querySelectorAll('table');

    tables.forEach((table, index) => {
      const issues = [];
      const elementId = `table-${index}`;

      // Check for headers
      const hasHeaders = table.querySelector('th, thead');
      if (!hasHeaders) {
        issues.push(this.createIssue('missing-table-headers', table, 'Data table missing header cells'));
      }

      // Check for caption
      const hasCaption = table.querySelector('caption');
      if (!hasCaption && !table.getAttribute('aria-label') && !table.getAttribute('aria-labelledby')) {
        issues.push(this.createIssue('missing-table-caption', table, 'Table should have caption or accessible name', 'warning'));
      }

      // Check complex table structure
      const hasComplexStructure = table.querySelector('th[scope], th[headers], td[headers]');
      const cellCount = table.querySelectorAll('td, th').length;
      
      if (cellCount > 20 && !hasComplexStructure) {
        issues.push(this.createIssue('complex-table-missing-structure', table, 'Complex table should use scope or headers attributes', 'warning'));
      }

      analysis.elements.set(elementId, {
        element: table,
        type: 'table',
        issues,
        recommendations: this.generateTableRecommendations(table, issues)
      });

      issues.forEach(issue => analysis.issues.push(issue));
    });
  }

  // Check ARIA usage
  async checkAria(document, analysis) {
    const elementsWithAria = document.querySelectorAll('[role], [aria-label], [aria-labelledby], [aria-describedby]');
    
    elementsWithAria.forEach((element, index) => {
      const issues = [];
      const elementId = `aria-${index}`;

      // Check valid roles
      const role = element.getAttribute('role');
      if (role && !this.isValidAriaRole(role)) {
        issues.push(this.createIssue('invalid-aria-role', element, `Invalid ARIA role: ${role}`));
      }

      // Check valid ARIA attributes for role
      if (role) {
        const ariaAttributes = this.getElementAriaAttributes(element);
        const validAttributes = this.validAriaAttributes.get(role);
        
        if (validAttributes) {
          ariaAttributes.forEach(attr => {
            if (!validAttributes.has(attr) && !this.isGlobalAriaAttribute(attr)) {
              issues.push(this.createIssue('invalid-aria-attribute', element, `Invalid ARIA attribute ${attr} for role ${role}`, 'warning'));
            }
          });
        }
      }

      // Check ARIA references
      const labelledBy = element.getAttribute('aria-labelledby');
      if (labelledBy) {
        const referencedElements = labelledBy.split(/\s+/).map(id => document.getElementById(id));
        if (referencedElements.some(el => !el)) {
          issues.push(this.createIssue('broken-aria-reference', element, 'aria-labelledby references non-existent element'));
        }
      }

      const describedBy = element.getAttribute('aria-describedby');
      if (describedBy) {
        const referencedElements = describedBy.split(/\s+/).map(id => document.getElementById(id));
        if (referencedElements.some(el => !el)) {
          issues.push(this.createIssue('broken-aria-reference', element, 'aria-describedby references non-existent element'));
        }
      }

      if (issues.length > 0) {
        analysis.elements.set(elementId, {
          element,
          type: 'aria',
          issues,
          recommendations: this.generateAriaRecommendations(element, issues)
        });

        issues.forEach(issue => analysis.issues.push(issue));
      }
    });
  }

  // Check keyboard navigation
  async checkKeyboardNavigation(document, analysis) {
    const interactiveElements = document.querySelectorAll(
      'button, a[href], input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
    );

    const issues = [];

    // Check for keyboard traps (simplified detection)
    const elementsWithKeyHandlers = document.querySelectorAll('[onkeydown], [onkeyup], [onkeypress]');
    elementsWithKeyHandlers.forEach(element => {
      // This is a simplified check - real detection would require runtime analysis
      issues.push(this.createIssue('potential-keyboard-trap', element, 'Element with keyboard handlers should ensure keyboard accessibility', 'warning'));
    });

    issues.forEach(issue => analysis.issues.push(issue));
  }

  // Helper methods
  isValidAriaRole(role) {
    const validRoles = new Set([
      'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
      'cell', 'checkbox', 'columnheader', 'combobox', 'complementary',
      'contentinfo', 'definition', 'dialog', 'directory', 'document',
      'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading',
      'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main',
      'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox',
      'menuitemradio', 'navigation', 'none', 'note', 'option', 'presentation',
      'progressbar', 'radio', 'radiogroup', 'region', 'row', 'rowgroup',
      'rowheader', 'scrollbar', 'search', 'searchbox', 'separator',
      'slider', 'spinbutton', 'status', 'switch', 'tab', 'table',
      'tablist', 'tabpanel', 'term', 'textbox', 'timer', 'toolbar',
      'tooltip', 'tree', 'treegrid', 'treeitem'
    ]);
    
    return validRoles.has(role);
  }

  getElementAriaAttributes(element) {
    const ariaAttributes = [];
    for (const attr of element.attributes) {
      if (attr.name.startsWith('aria-')) {
        ariaAttributes.push(attr.name);
      }
    }
    return ariaAttributes;
  }

  isGlobalAriaAttribute(attribute) {
    const globalAttributes = new Set([
      'aria-atomic', 'aria-busy', 'aria-controls', 'aria-current',
      'aria-describedby', 'aria-details', 'aria-disabled', 'aria-dropeffect',
      'aria-errormessage', 'aria-flowto', 'aria-grabbed', 'aria-haspopup',
      'aria-hidden', 'aria-invalid', 'aria-keyshortcuts', 'aria-label',
      'aria-labelledby', 'aria-live', 'aria-owns', 'aria-relevant',
      'aria-roledescription'
    ]);
    
    return globalAttributes.has(attribute);
  }

  // Create issue object
  createIssue(type, element, message, severity = null) {
    const rule = this.accessibilityRules.get(type);
    return {
      type,
      severity: severity || rule?.severity || 'error',
      message,
      element: {
        tagName: element.tagName?.toLowerCase(),
        id: element.id || null,
        className: element.className || null,
        textContent: element.textContent?.trim()?.substring(0, 100) || null
      },
      wcag: rule ? {
        level: rule.wcagLevel,
        criterion: rule.criterion,
        description: rule.description
      } : null,
      xpath: this.getElementXPath(element)
    };
  }

  // Get XPath for element (simplified)
  getElementXPath(element) {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }
    
    let path = '';
    let current = element;
    
    while (current && current.nodeType === 1) { // Node.ELEMENT_NODE = 1
      let selector = current.tagName.toLowerCase();
      
      if (current.className) {
        selector += `.${current.className.split(' ').join('.')}`;
      }
      
      path = selector + (path ? ' > ' + path : '');
      current = current.parentElement;
      
      if (path.length > 200) break; // Prevent overly long paths
    }
    
    return path;
  }

  // Calculate accessibility scores
  calculateScores(analysis) {
    const { issues } = analysis;
    
    analysis.summary.totalIssues = issues.length;
    analysis.summary.errors = issues.filter(issue => issue.severity === 'error').length;
    analysis.summary.warnings = issues.filter(issue => issue.severity === 'warning').length;
    
    // Calculate score (simplified - real implementation would be more nuanced)
    const errorWeight = 10;
    const warningWeight = 3;
    const maxPenalty = analysis.summary.errors * errorWeight + analysis.summary.warnings * warningWeight;
    
    // Base score calculation (100 - penalties, minimum 0)
    analysis.summary.score = Math.max(0, 100 - maxPenalty);
  }

  // Generate recommendations
  generateRecommendations(analysis) {
    const recommendations = [];
    const { issues, summary } = analysis;
    
    if (summary.errors > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'accessibility',
        title: `Fix ${summary.errors} accessibility errors`,
        description: 'These issues prevent users with disabilities from accessing content',
        action: 'Review and fix all error-level accessibility issues'
      });
    }
    
    if (summary.warnings > 5) {
      recommendations.push({
        priority: 'high',
        category: 'accessibility',
        title: 'Address accessibility warnings',
        description: 'Multiple accessibility improvements recommended',
        action: `Review and address ${summary.warnings} accessibility warnings`
      });
    }
    
    // Specific recommendations based on issue patterns
    const issueTypes = new Map();
    issues.forEach(issue => {
      issueTypes.set(issue.type, (issueTypes.get(issue.type) || 0) + 1);
    });
    
    if (issueTypes.get('missing-alt-text') >= 3) {
      recommendations.push({
        priority: 'high',
        category: 'images',
        title: 'Add alt text to images',
        description: 'Multiple images are missing alternative text',
        action: 'Add descriptive alt attributes to all meaningful images'
      });
    }
    
    if (issueTypes.get('missing-form-label') >= 2) {
      recommendations.push({
        priority: 'high',
        category: 'forms',
        title: 'Label form inputs',
        description: 'Form inputs need accessible labels',
        action: 'Add labels or ARIA labeling to all form inputs'
      });
    }
    
    analysis.recommendations = recommendations;
  }

  // Assess WCAG compliance
  assessWcagCompliance(analysis) {
    const { issues, wcagCompliance } = analysis;
    
    // Group issues by WCAG criterion
    const criteriaIssues = new Map();
    
    issues.forEach(issue => {
      if (issue.wcag) {
        const criterion = issue.wcag.criterion;
        if (!criteriaIssues.has(criterion)) {
          criteriaIssues.set(criterion, []);
        }
        criteriaIssues.get(criterion).push(issue);
      }
    });
    
    // Assess compliance for each criterion
    criteriaIssues.forEach((criterionIssues, criterion) => {
      const hasErrors = criterionIssues.some(issue => issue.severity === 'error');
      wcagCompliance.criteria.set(criterion, {
        compliant: !hasErrors,
        issues: criterionIssues.length,
        level: criterionIssues[0].wcag.level,
        description: criterionIssues[0].wcag.description
      });
    });
  }

  // Generate specific recommendations for different element types
  generateImageRecommendations(img, issues) {
    const recommendations = [];
    
    issues.forEach(issue => {
      switch (issue.type) {
        case 'missing-alt-text':
          if (this.isDecorativeImage(img)) {
            recommendations.push('Add alt="" for decorative images');
          } else {
            recommendations.push('Add descriptive alt text explaining the image content');
          }
          break;
        case 'redundant-alt-text':
          recommendations.push('Remove redundant phrases like "image of" from alt text');
          break;
      }
    });
    
    return recommendations;
  }

  generateFormRecommendations(input, issues) {
    const recommendations = [];
    
    issues.forEach(issue => {
      switch (issue.type) {
        case 'missing-form-label':
          recommendations.push('Add <label> element or aria-label attribute');
          break;
        case 'missing-required-indicator':
          recommendations.push('Add aria-required="true" to required fields');
          break;
        case 'missing-error-description':
          recommendations.push('Use aria-describedby to reference error messages');
          break;
      }
    });
    
    return recommendations;
  }

  generateFormStructureRecommendations(form, issues) {
    const recommendations = [];
    
    issues.forEach(issue => {
      switch (issue.type) {
        case 'missing-submit-button':
          recommendations.push('Add submit button to form');
          break;
        case 'missing-fieldsets':
          recommendations.push('Group related form fields with <fieldset> and <legend>');
          break;
      }
    });
    
    return recommendations;
  }

  generateInteractiveRecommendations(element, issues) {
    const recommendations = [];
    
    issues.forEach(issue => {
      switch (issue.type) {
        case 'missing-accessible-name':
          recommendations.push('Add visible text, aria-label, or aria-labelledby');
          break;
        case 'empty-button':
          recommendations.push('Add text content or aria-label to button');
          break;
        case 'empty-link':
          recommendations.push('Add descriptive text content to link');
          break;
        case 'generic-link-text':
          recommendations.push('Use more descriptive link text');
          break;
        case 'missing-focus-indicator':
          recommendations.push('Ensure visible focus indicator with CSS :focus styles');
          break;
      }
    });
    
    return recommendations;
  }

  generateHeadingRecommendations(heading, issues) {
    const recommendations = [];
    
    issues.forEach(issue => {
      switch (issue.type) {
        case 'empty-heading':
          recommendations.push('Add text content to heading element');
          break;
        case 'heading-level-skip':
          recommendations.push('Use proper heading hierarchy without skipping levels');
          break;
      }
    });
    
    return recommendations;
  }

  generateTableRecommendations(table, issues) {
    const recommendations = [];
    
    issues.forEach(issue => {
      switch (issue.type) {
        case 'missing-table-headers':
          recommendations.push('Add <th> elements or <thead> section with headers');
          break;
        case 'missing-table-caption':
          recommendations.push('Add <caption> element or aria-label');
          break;
        case 'complex-table-missing-structure':
          recommendations.push('Use scope or headers attributes for complex tables');
          break;
      }
    });
    
    return recommendations;
  }

  generateAriaRecommendations(element, issues) {
    const recommendations = [];
    
    issues.forEach(issue => {
      switch (issue.type) {
        case 'invalid-aria-role':
          recommendations.push('Use valid ARIA role from specification');
          break;
        case 'invalid-aria-attribute':
          recommendations.push('Remove invalid ARIA attribute or use correct role');
          break;
        case 'broken-aria-reference':
          recommendations.push('Ensure referenced elements exist and have IDs');
          break;
      }
    });
    
    return recommendations;
  }
}

module.exports = { AccessibilityAnalyzer };