const { JSDOM } = require('jsdom');

class AriaGenerator {
  constructor(options = {}) {
    this.options = {
      preserveExisting: options.preserveExisting !== false,
      generateIds: options.generateIds !== false,
      addLandmarkLabels: options.addLandmarkLabels !== false,
      improveHeadings: options.improveHeadings !== false,
      ...options
    };

    // Component type to ARIA role mapping
    this.componentRoles = new Map([
      ['navigation', 'navigation'],
      ['header', 'banner'],
      ['footer', 'contentinfo'],
      ['sidebar', 'complementary'],
      ['main-content', 'main'],
      ['search', 'search'],
      ['form', 'form'],
      ['button', 'button'],
      ['link', 'link'],
      ['card', 'article'],
      ['modal', 'dialog'],
      ['tabs', 'tablist'],
      ['tab', 'tab'],
      ['tabpanel', 'tabpanel'],
      ['alert', 'alert'],
      ['menu', 'menu'],
      ['menuitem', 'menuitem'],
      ['list', 'list'],
      ['listitem', 'listitem'],
      ['table', 'table'],
      ['row', 'row'],
      ['cell', 'cell'],
      ['breadcrumb', 'navigation']
    ]);

    // Elements that should have accessible names
    this.elementsNeedingNames = new Set([
      'button', 'a', 'input', 'textarea', 'select', 'details',
      '[role="button"]', '[role="link"]', '[role="tab"]',
      '[role="menuitem"]', '[role="option"]'
    ]);

    // Landmark roles that should have labels when multiple exist
    this.landmarkRoles = new Set([
      'navigation', 'complementary', 'form', 'search', 'region'
    ]);

    this.idCounter = 0;
  }

  // Main method to enhance HTML with ARIA
  async enhanceWithAria(html, componentAnalysis = null, options = {}) {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const enhancements = {
      added: [],
      modified: [],
      generated: [],
      warnings: []
    };

    // Apply enhancements based on component analysis if provided
    if (componentAnalysis && componentAnalysis.components) {
      await this.enhanceDetectedComponents(document, componentAnalysis, enhancements);
    }

    // Apply general ARIA enhancements
    await Promise.all([
      this.enhanceLandmarks(document, enhancements),
      this.enhanceHeadings(document, enhancements),
      this.enhanceForms(document, enhancements),
      this.enhanceInteractiveElements(document, enhancements),
      this.enhanceTables(document, enhancements),
      this.enhanceImages(document, enhancements),
      this.enhanceLists(document, enhancements),
      this.enhanceNavigation(document, enhancements),
      this.generateMissingIds(document, enhancements),
      this.addLiveRegions(document, enhancements)
    ]);

    return {
      html: dom.serialize(),
      enhancements,
      statistics: this.calculateEnhancementStats(enhancements)
    };
  }

  // Enhance components detected by ComponentDetector
  async enhanceDetectedComponents(document, componentAnalysis, enhancements) {
    for (const component of componentAnalysis.components) {
      const elements = this.findComponentElements(document, component);
      
      for (const element of elements) {
        await this.enhanceComponent(element, component, enhancements);
      }
    }
  }

  // Find elements matching component analysis
  findComponentElements(document, component) {
    // This is a simplified approach - in practice, you'd need more sophisticated matching
    const selectors = [];
    
    if (component.element.id) {
      selectors.push(`#${component.element.id}`);
    }
    
    if (component.element.className) {
      const classes = component.element.className.split(' ').map(c => `.${c}`).join('');
      selectors.push(`${component.element.tagName}${classes}`);
    } else {
      selectors.push(component.element.tagName);
    }

    const elements = new Set();
    selectors.forEach(selector => {
      try {
        const found = document.querySelectorAll(selector);
        found.forEach(el => elements.add(el));
      } catch (e) {
        // Invalid selector
      }
    });

    return Array.from(elements);
  }

  // Enhance individual component
  async enhanceComponent(element, component, enhancements) {
    const componentType = component.type;
    const suggestedRole = this.componentRoles.get(componentType);

    // Add role if missing and appropriate
    if (suggestedRole && !element.getAttribute('role') && !this.hasImplicitRole(element, suggestedRole)) {
      this.addAttribute(element, 'role', suggestedRole, enhancements);
    }

    // Component-specific enhancements
    switch (componentType) {
      case 'navigation':
        await this.enhanceNavigationComponent(element, enhancements);
        break;
      case 'button':
        await this.enhanceButtonComponent(element, enhancements);
        break;
      case 'card':
        await this.enhanceCardComponent(element, enhancements);
        break;
      case 'modal':
        await this.enhanceModalComponent(element, enhancements);
        break;
      case 'tabs':
        await this.enhanceTabsComponent(element, enhancements);
        break;
      case 'form':
        await this.enhanceFormComponent(element, enhancements);
        break;
      case 'table':
        await this.enhanceTableComponent(element, enhancements);
        break;
      case 'alert':
        await this.enhanceAlertComponent(element, enhancements);
        break;
    }

    // Apply accessibility recommendations from component analysis
    if (component.recommendations) {
      component.recommendations.forEach(rec => {
        if (rec.type === 'accessibility') {
          this.applyRecommendation(element, rec, enhancements);
        }
      });
    }
  }

  // Check if element has implicit role
  hasImplicitRole(element, expectedRole) {
    const tagName = element.tagName.toLowerCase();
    const implicitRoles = {
      'nav': 'navigation',
      'main': 'main',
      'header': 'banner',
      'footer': 'contentinfo',
      'aside': 'complementary',
      'section': 'region',
      'article': 'article',
      'form': 'form',
      'button': 'button',
      'a': 'link',
      'table': 'table',
      'ul': 'list',
      'ol': 'list',
      'li': 'listitem'
    };

    return implicitRoles[tagName] === expectedRole;
  }

  // Enhance landmarks
  async enhanceLandmarks(document, enhancements) {
    const landmarks = {
      'main': document.querySelectorAll('main, [role="main"]'),
      'navigation': document.querySelectorAll('nav, [role="navigation"]'),
      'banner': document.querySelectorAll('header, [role="banner"]'),
      'contentinfo': document.querySelectorAll('footer, [role="contentinfo"]'),
      'complementary': document.querySelectorAll('aside, [role="complementary"]'),
      'search': document.querySelectorAll('[role="search"]'),
      'region': document.querySelectorAll('[role="region"]'),
      'form': document.querySelectorAll('form[role="search"], [role="form"]')
    };

    // Add labels to multiple landmarks of the same type
    Object.entries(landmarks).forEach(([landmarkType, elements]) => {
      if (elements.length > 1) {
        elements.forEach((element, index) => {
          if (!this.hasAccessibleName(element)) {
            const label = this.generateLandmarkLabel(element, landmarkType, index);
            if (label) {
              this.addAttribute(element, 'aria-label', label, enhancements);
            }
          }
        });
      }
    });

    // Ensure main content is properly marked
    const mainContent = document.querySelector('main, [role="main"]');
    if (!mainContent) {
      // Try to identify main content area
      const candidateMain = this.identifyMainContent(document);
      if (candidateMain) {
        this.addAttribute(candidateMain, 'role', 'main', enhancements);
      }
    }
  }

  // Generate appropriate landmark labels
  generateLandmarkLabel(element, landmarkType, index) {
    // Try to infer label from content
    const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading && heading.textContent?.trim()) {
      return heading.textContent.trim();
    }

    // Try to get label from class names or IDs
    const className = element.className.toLowerCase();
    const id = element.id?.toLowerCase();

    if (landmarkType === 'navigation') {
      if (className.includes('main') || id?.includes('main')) return 'Main navigation';
      if (className.includes('secondary') || id?.includes('secondary')) return 'Secondary navigation';
      if (className.includes('footer') || id?.includes('footer')) return 'Footer navigation';
      if (className.includes('breadcrumb') || id?.includes('breadcrumb')) return 'Breadcrumb navigation';
      return `Navigation ${index + 1}`;
    }

    if (landmarkType === 'complementary') {
      if (className.includes('sidebar') || id?.includes('sidebar')) return 'Sidebar';
      if (className.includes('related') || id?.includes('related')) return 'Related content';
      return `Complementary content ${index + 1}`;
    }

    if (landmarkType === 'region') {
      return `Region ${index + 1}`;
    }

    return null;
  }

  // Identify main content area
  identifyMainContent(document) {
    // Look for elements that might be main content
    const candidates = [
      document.querySelector('#main, #content, .main, .content'),
      document.querySelector('[id*="main"], [id*="content"]'),
      document.querySelector('[class*="main"], [class*="content"]'),
      document.querySelector('article'),
      document.querySelector('.container > div:first-child')
    ];

    // Return first valid candidate
    return candidates.find(el => el && el.children.length > 0);
  }

  // Enhance headings
  async enhanceHeadings(document, enhancements) {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headings.forEach(heading => {
      // Add IDs for heading links if missing
      if (!heading.id) {
        const id = this.generateIdFromText(heading.textContent);
        if (id) {
          this.addAttribute(heading, 'id', id, enhancements);
        }
      }
    });
  }

  // Enhance forms
  async enhanceForms(document, enhancements) {
    const forms = document.querySelectorAll('form');
    const inputs = document.querySelectorAll('input, textarea, select');

    // Enhance form elements
    inputs.forEach(input => {
      const type = input.type?.toLowerCase();
      
      // Skip buttons and hidden inputs
      if (['submit', 'button', 'reset', 'image', 'hidden'].includes(type)) {
        return;
      }

      // Add labels if missing
      if (!this.hasAccessibleLabel(input)) {
        const label = this.generateInputLabel(input);
        if (label) {
          // Create label element
          const labelElement = document.createElement('label');
          labelElement.textContent = label;
          labelElement.setAttribute('for', this.ensureId(input, enhancements));
          
          // Insert label before input
          input.parentNode.insertBefore(labelElement, input);
          
          enhancements.generated.push({
            type: 'label',
            element: 'label',
            action: 'Created label element',
            target: input.tagName.toLowerCase()
          });
        }
      }

      // Add required indicator
      if (input.required && !input.getAttribute('aria-required')) {
        this.addAttribute(input, 'aria-required', 'true', enhancements);
      }

      // Add input type hints
      if (type === 'email' && !input.getAttribute('aria-describedby')) {
        const hintId = this.createInputHint(input, 'Please enter a valid email address', document);
        if (hintId) {
          this.addAttribute(input, 'aria-describedby', hintId, enhancements);
        }
      }
    });

    // Enhance form structure
    forms.forEach(form => {
      // Add form role if search form
      if (form.querySelector('input[type="search"]') && !form.getAttribute('role')) {
        this.addAttribute(form, 'role', 'search', enhancements);
      }

      // Group related fields with fieldsets for large forms
      const inputCount = form.querySelectorAll('input, textarea, select').length;
      if (inputCount > 5 && !form.querySelector('fieldset')) {
        this.suggestFieldsets(form, enhancements);
      }
    });
  }

  // Check if input has accessible label
  hasAccessibleLabel(input) {
    // Check for explicit label
    if (input.id && input.ownerDocument.querySelector(`label[for="${input.id}"]`)) {
      return true;
    }

    // Check for wrapping label
    if (input.closest('label')) return true;

    // Check for ARIA labeling
    if (input.getAttribute('aria-label')) return true;
    if (input.getAttribute('aria-labelledby')) return true;

    return false;
  }

  // Generate label text for input
  generateInputLabel(input) {
    const type = input.type?.toLowerCase();
    const name = input.name;
    const placeholder = input.placeholder;
    const id = input.id;

    // Try to infer from context
    const previousText = this.getPreviousTextContent(input);
    if (previousText && previousText.length < 50) {
      return previousText;
    }

    // Try to infer from attributes
    if (placeholder && placeholder.length < 30) {
      return placeholder;
    }

    if (name) {
      return this.humanizeString(name);
    }

    if (id) {
      return this.humanizeString(id);
    }

    // Fallback based on type
    const typeLabels = {
      'email': 'Email address',
      'password': 'Password',
      'tel': 'Phone number',
      'url': 'Website URL',
      'search': 'Search',
      'date': 'Date',
      'time': 'Time',
      'number': 'Number',
      'text': 'Text input'
    };

    return typeLabels[type] || 'Input field';
  }

  // Get previous text content that might be a label
  getPreviousTextContent(element) {
    let current = element.previousSibling;
    while (current) {
      if (current.nodeType === 3) { // Text node
        const text = current.textContent?.trim();
        if (text && text.endsWith(':')) {
          return text.replace(/:$/, '');
        }
      } else if (current.nodeType === 1) { // Element node
        if (current.tagName && ['SPAN', 'DIV', 'P'].includes(current.tagName.toUpperCase())) {
          const text = current.textContent?.trim();
          if (text && text.length > 0 && text.length < 50) {
            return text.replace(/:$/, '');
          }
        }
        break; // Stop at first element
      }
      current = current.previousSibling;
    }
    return null;
  }

  // Create input hint element
  createInputHint(input, hintText, document) {
    const hintId = `hint-${this.generateId()}`;
    const hint = document.createElement('div');
    hint.id = hintId;
    hint.className = 'sr-only input-hint';
    hint.textContent = hintText;
    
    input.parentNode.insertBefore(hint, input.nextSibling);
    return hintId;
  }

  // Enhance interactive elements
  async enhanceInteractiveElements(document, enhancements) {
    const interactiveElements = document.querySelectorAll(
      'button, a[href], [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])'
    );

    interactiveElements.forEach(element => {
      // Add accessible names if missing
      if (!this.hasAccessibleName(element)) {
        const name = this.generateAccessibleName(element);
        if (name) {
          this.addAttribute(element, 'aria-label', name, enhancements);
        }
      }

      // Add button-specific enhancements
      if (element.tagName.toLowerCase() === 'button' || element.getAttribute('role') === 'button') {
        this.enhanceButton(element, enhancements);
      }

      // Add link-specific enhancements
      if (element.tagName.toLowerCase() === 'a' || element.getAttribute('role') === 'link') {
        this.enhanceLink(element, enhancements);
      }
    });
  }

  // Check if element has accessible name
  hasAccessibleName(element) {
    // Text content
    if (element.textContent?.trim()) return true;
    
    // ARIA labeling
    if (element.getAttribute('aria-label')) return true;
    if (element.getAttribute('aria-labelledby')) return true;
    
    // Image alt for buttons/links with only images
    const img = element.querySelector('img');
    if (img && img.alt) return true;
    
    // Value for inputs
    if (element.value && ['INPUT', 'TEXTAREA'].includes(element.tagName)) return true;
    
    return false;
  }

  // Generate accessible name for element
  generateAccessibleName(element) {
    const tagName = element.tagName.toLowerCase();
    const className = element.className.toLowerCase();
    const id = element.id?.toLowerCase();

    // Try to infer from context
    const ariaLabel = element.getAttribute('title');
    if (ariaLabel) return ariaLabel;

    // Try to infer from images
    const img = element.querySelector('img');
    if (img && img.alt) return img.alt;

    // Try to infer from icons
    const icon = element.querySelector('[class*="icon"], [class*="fa-"], svg');
    if (icon) {
      return this.getIconLabel(icon, element);
    }

    // Try to infer from class names or ID
    if (className.includes('close')) return 'Close';
    if (className.includes('menu')) return 'Menu';
    if (className.includes('search')) return 'Search';
    if (className.includes('submit')) return 'Submit';
    if (className.includes('save')) return 'Save';
    if (className.includes('delete')) return 'Delete';
    if (className.includes('edit')) return 'Edit';

    if (id?.includes('close')) return 'Close';
    if (id?.includes('menu')) return 'Menu';
    if (id?.includes('search')) return 'Search';

    // Fallback
    if (tagName === 'button') return 'Button';
    if (tagName === 'a') return 'Link';

    return null;
  }

  // Get label for icon
  getIconLabel(icon, context) {
    const className = icon.className.toLowerCase();
    
    // Common icon patterns
    if (className.includes('search')) return 'Search';
    if (className.includes('close') || className.includes('times')) return 'Close';
    if (className.includes('menu') || className.includes('bars')) return 'Menu';
    if (className.includes('home')) return 'Home';
    if (className.includes('user')) return 'User';
    if (className.includes('settings') || className.includes('cog')) return 'Settings';
    if (className.includes('heart')) return 'Favorite';
    if (className.includes('star')) return 'Star';
    if (className.includes('share')) return 'Share';
    if (className.includes('edit') || className.includes('pencil')) return 'Edit';
    if (className.includes('delete') || className.includes('trash')) return 'Delete';
    if (className.includes('download')) return 'Download';
    if (className.includes('upload')) return 'Upload';
    if (className.includes('play')) return 'Play';
    if (className.includes('pause')) return 'Pause';
    if (className.includes('stop')) return 'Stop';

    // Try to infer from context
    const contextClass = context.className.toLowerCase();
    if (contextClass.includes('submit')) return 'Submit';
    if (contextClass.includes('cancel')) return 'Cancel';

    return 'Icon';
  }

  // Enhance button elements
  enhanceButton(button, enhancements) {
    // Add type if missing
    if (button.tagName.toLowerCase() === 'button' && !button.type) {
      this.addAttribute(button, 'type', 'button', enhancements);
    }

    // Add expanded state for dropdown buttons
    const hasDropdown = button.parentElement?.querySelector('.dropdown, [role="menu"]') ||
                        button.nextElementSibling?.matches('.dropdown, [role="menu"]');
    
    if (hasDropdown && !button.getAttribute('aria-haspopup')) {
      this.addAttribute(button, 'aria-haspopup', 'true', enhancements);
      this.addAttribute(button, 'aria-expanded', 'false', enhancements);
    }
  }

  // Enhance link elements
  enhanceLink(link, enhancements) {
    const href = link.getAttribute('href');
    
    // Add external link indicators
    if (href && (href.startsWith('http') && !href.includes(window.location?.hostname))) {
      if (!link.getAttribute('aria-describedby')) {
        const descId = this.createExternalLinkDescription(link, enhancements);
        if (descId) {
          this.addAttribute(link, 'aria-describedby', descId, enhancements);
        }
      }
    }

    // Add download indicators
    if (link.hasAttribute('download')) {
      const currentLabel = link.getAttribute('aria-label') || link.textContent?.trim();
      if (currentLabel && !currentLabel.includes('download')) {
        this.addAttribute(link, 'aria-label', `${currentLabel} (download)`, enhancements);
      }
    }
  }

  // Create external link description
  createExternalLinkDescription(link, enhancements) {
    const document = link.ownerDocument;
    const descId = `external-link-${this.generateId()}`;
    
    let existingDesc = document.getElementById('external-link-desc');
    if (!existingDesc) {
      existingDesc = document.createElement('span');
      existingDesc.id = 'external-link-desc';
      existingDesc.className = 'sr-only';
      existingDesc.textContent = '(opens in new window)';
      document.body.appendChild(existingDesc);
      
      enhancements.generated.push({
        type: 'description',
        element: 'span',
        action: 'Created external link description',
        id: 'external-link-desc'
      });
    }

    return 'external-link-desc';
  }

  // Enhance tables
  async enhanceTables(document, enhancements) {
    const tables = document.querySelectorAll('table');

    tables.forEach(table => {
      // Add table role if missing
      if (!table.getAttribute('role')) {
        this.addAttribute(table, 'role', 'table', enhancements);
      }

      // Add caption if missing
      if (!table.querySelector('caption') && !this.hasAccessibleName(table)) {
        const caption = this.generateTableCaption(table);
        if (caption) {
          const captionElement = document.createElement('caption');
          captionElement.textContent = caption;
          table.insertBefore(captionElement, table.firstChild);
          
          enhancements.generated.push({
            type: 'caption',
            element: 'caption',
            action: 'Created table caption',
            content: caption
          });
        }
      }

      // Enhance headers
      const headers = table.querySelectorAll('th');
      headers.forEach(header => {
        if (!header.getAttribute('scope')) {
          const scope = this.determineHeaderScope(header, table);
          this.addAttribute(header, 'scope', scope, enhancements);
        }
      });

      // Add row and cell roles for complex tables
      if (this.isComplexTable(table)) {
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
          if (!row.getAttribute('role')) {
            this.addAttribute(row, 'role', 'row', enhancements);
          }

          const cells = row.querySelectorAll('td, th');
          cells.forEach(cell => {
            if (!cell.getAttribute('role')) {
              const role = cell.tagName.toLowerCase() === 'th' ? 'columnheader' : 'cell';
              this.addAttribute(cell, 'role', role, enhancements);
            }
          });
        });
      }
    });
  }

  // Generate table caption
  generateTableCaption(table) {
    // Look for preceding heading
    let current = table.previousElementSibling;
    while (current) {
      if (/^h[1-6]$/i.test(current.tagName)) {
        return current.textContent?.trim();
      }
      if (current.textContent?.trim()) {
        break; // Stop at first non-heading content
      }
      current = current.previousElementSibling;
    }

    // Fallback caption
    return 'Data table';
  }

  // Determine header scope
  determineHeaderScope(header, table) {
    const row = header.closest('tr');
    const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
    const cellIndex = Array.from(row.children).indexOf(header);

    // If in first row, likely column header
    if (rowIndex === 0 || row.closest('thead')) {
      return 'col';
    }

    // If in first column, likely row header
    if (cellIndex === 0) {
      return 'row';
    }

    return 'col'; // Default to column
  }

  // Check if table is complex
  isComplexTable(table) {
    const cellCount = table.querySelectorAll('td, th').length;
    const hasHeadersAttr = table.querySelector('[headers]');
    const hasComplexStructure = table.querySelector('thead, tbody, tfoot');
    
    return cellCount > 20 || hasHeadersAttr || hasComplexStructure;
  }

  // Enhance images
  async enhanceImages(document, enhancements) {
    const images = document.querySelectorAll('img');

    images.forEach(img => {
      // Add alt attribute if completely missing
      if (!img.hasAttribute('alt')) {
        const altText = this.generateAltText(img);
        this.addAttribute(img, 'alt', altText || '', enhancements);
      }

      // Add role=presentation for decorative images
      if (img.alt === '' && !img.getAttribute('role')) {
        this.addAttribute(img, 'role', 'presentation', enhancements);
      }
    });
  }

  // Generate alt text for images
  generateAltText(img) {
    const src = img.src.toLowerCase();
    const className = img.className.toLowerCase();
    const id = img.id?.toLowerCase();

    // Check if decorative
    if (this.isDecorativeImage(img, src, className, id)) {
      return '';
    }

    // Try to infer from filename
    const filename = src.split('/').pop().split('.')[0];
    if (filename && filename !== 'image' && filename.length > 2) {
      return this.humanizeString(filename);
    }

    // Try to infer from context
    const figure = img.closest('figure');
    if (figure) {
      const figcaption = figure.querySelector('figcaption');
      if (figcaption) {
        return figcaption.textContent?.trim();
      }
    }

    // Look for surrounding text
    const surroundingText = this.getSurroundingText(img);
    if (surroundingText && surroundingText.length < 100) {
      return surroundingText;
    }

    return 'Image';
  }

  // Check if image is decorative
  isDecorativeImage(img, src, className, id) {
    const decorativePatterns = [
      'decoration', 'ornament', 'divider', 'spacer', 'bullet',
      'border', 'background', 'separator'
    ];

    return decorativePatterns.some(pattern =>
      src.includes(pattern) || className.includes(pattern) || id?.includes(pattern)
    );
  }

  // Get surrounding text for context
  getSurroundingText(img) {
    const parent = img.parentElement;
    if (parent) {
      const text = parent.textContent?.replace(img.textContent || '', '').trim();
      return text && text.length < 100 ? text : null;
    }
    return null;
  }

  // Enhance lists
  async enhanceLists(document, enhancements) {
    const lists = document.querySelectorAll('ul, ol');

    lists.forEach(list => {
      // Add list role if has custom styling that might hide semantic meaning
      if (this.hasCustomListStyling(list) && !list.getAttribute('role')) {
        this.addAttribute(list, 'role', 'list', enhancements);
        
        // Add listitem roles to children
        const items = list.querySelectorAll('li');
        items.forEach(item => {
          if (!item.getAttribute('role')) {
            this.addAttribute(item, 'role', 'listitem', enhancements);
          }
        });
      }
    });
  }

  // Check if list has custom styling
  hasCustomListStyling(list) {
    const style = list.style;
    const className = list.className.toLowerCase();
    
    return style.listStyle === 'none' ||
           style.listStyleType === 'none' ||
           className.includes('unstyled') ||
           className.includes('list-none');
  }

  // Enhance navigation
  async enhanceNavigation(document, enhancements) {
    const navElements = document.querySelectorAll('nav, [role="navigation"]');

    navElements.forEach(nav => {
      // Add skip links if missing
      if (this.isMainNavigation(nav) && !this.hasSkipLink(document)) {
        this.addSkipLink(nav, document, enhancements);
      }

      // Enhance breadcrumb navigation
      if (this.isBreadcrumbNav(nav)) {
        this.enhanceBreadcrumbNav(nav, enhancements);
      }
    });
  }

  // Check if this is main navigation
  isMainNavigation(nav) {
    const className = nav.className.toLowerCase();
    const id = nav.id?.toLowerCase();
    
    return className.includes('main') || 
           className.includes('primary') ||
           id?.includes('main') ||
           id?.includes('primary') ||
           nav.matches('header nav') ||
           !nav.closest('footer, aside');
  }

  // Check if document has skip link
  hasSkipLink(document) {
    const links = document.querySelectorAll('a[href^="#"]');
    return Array.from(links).some(link => {
      const text = link.textContent?.toLowerCase() || '';
      return text.includes('skip');
    });
  }

  // Add skip link
  addSkipLink(nav, document, enhancements) {
    const main = document.querySelector('main, [role="main"]') || 
                 document.querySelector('#main, #content');
    
    if (main) {
      const skipLink = document.createElement('a');
      skipLink.href = `#${this.ensureId(main, enhancements)}`;
      skipLink.textContent = 'Skip to main content';
      skipLink.className = 'sr-only skip-link';
      
      // Insert at beginning of body
      document.body.insertBefore(skipLink, document.body.firstChild);
      
      enhancements.generated.push({
        type: 'skip-link',
        element: 'a',
        action: 'Created skip to main content link',
        href: skipLink.href
      });
    }
  }

  // Check if navigation is breadcrumb
  isBreadcrumbNav(nav) {
    const className = nav.className.toLowerCase();
    const id = nav.id?.toLowerCase();
    const ariaLabel = nav.getAttribute('aria-label')?.toLowerCase();
    
    return className.includes('breadcrumb') ||
           id?.includes('breadcrumb') ||
           ariaLabel?.includes('breadcrumb');
  }

  // Enhance breadcrumb navigation
  enhanceBreadcrumbNav(nav, enhancements) {
    if (!nav.getAttribute('aria-label')) {
      this.addAttribute(nav, 'aria-label', 'Breadcrumb navigation', enhancements);
    }

    const items = nav.querySelectorAll('a, span');
    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      if (isLast && !item.getAttribute('aria-current')) {
        this.addAttribute(item, 'aria-current', 'page', enhancements);
      }
    });
  }

  // Generate missing IDs
  async generateMissingIds(document, enhancements) {
    if (!this.options.generateIds) return;

    // Add IDs to elements that commonly need them
    const elementsNeedingIds = document.querySelectorAll(
      'h1, h2, h3, h4, h5, h6, section, article, [role="region"], [role="main"], form'
    );

    elementsNeedingIds.forEach(element => {
      if (!element.id) {
        const id = this.generateIdFromElement(element);
        if (id) {
          this.addAttribute(element, 'id', id, enhancements);
        }
      }
    });
  }

  // Add live regions for dynamic content
  async addLiveRegions(document, enhancements) {
    // Look for containers that might have dynamic content
    const candidateRegions = document.querySelectorAll(
      '.messages, .alerts, .notifications, .status, .errors, .success'
    );

    candidateRegions.forEach(region => {
      if (!region.getAttribute('aria-live') && !region.getAttribute('role')) {
        // Determine appropriate live region type
        const className = region.className.toLowerCase();
        if (className.includes('error') || className.includes('alert')) {
          this.addAttribute(region, 'aria-live', 'assertive', enhancements);
          this.addAttribute(region, 'role', 'alert', enhancements);
        } else {
          this.addAttribute(region, 'aria-live', 'polite', enhancements);
          this.addAttribute(region, 'role', 'status', enhancements);
        }
      }
    });
  }

  // Component-specific enhancement methods
  async enhanceNavigationComponent(element, enhancements) {
    // Add appropriate label
    if (!this.hasAccessibleName(element)) {
      const label = this.generateNavigationLabel(element);
      if (label) {
        this.addAttribute(element, 'aria-label', label, enhancements);
      }
    }
  }

  async enhanceButtonComponent(element, enhancements) {
    // Ensure button has accessible name
    if (!this.hasAccessibleName(element)) {
      const name = this.generateAccessibleName(element);
      if (name) {
        this.addAttribute(element, 'aria-label', name, enhancements);
      }
    }
  }

  async enhanceCardComponent(element, enhancements) {
    // Add article role if not present
    if (!element.getAttribute('role') && !element.matches('article')) {
      this.addAttribute(element, 'role', 'article', enhancements);
    }

    // Add labelledby if card has heading
    const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading && !element.getAttribute('aria-labelledby')) {
      const headingId = this.ensureId(heading, enhancements);
      this.addAttribute(element, 'aria-labelledby', headingId, enhancements);
    }
  }

  async enhanceModalComponent(element, enhancements) {
    // Add dialog role and required attributes
    if (!element.getAttribute('role')) {
      this.addAttribute(element, 'role', 'dialog', enhancements);
    }

    // Add modal attribute
    if (!element.getAttribute('aria-modal')) {
      this.addAttribute(element, 'aria-modal', 'true', enhancements);
    }

    // Add labelledby if modal has title
    const title = element.querySelector('h1, h2, h3, h4, h5, h6, .modal-title');
    if (title && !element.getAttribute('aria-labelledby')) {
      const titleId = this.ensureId(title, enhancements);
      this.addAttribute(element, 'aria-labelledby', titleId, enhancements);
    }
  }

  async enhanceTabsComponent(element, enhancements) {
    // Add tablist role
    if (!element.getAttribute('role')) {
      this.addAttribute(element, 'role', 'tablist', enhancements);
    }

    // Enhance tab elements
    const tabs = element.querySelectorAll('[role="tab"], .tab');
    tabs.forEach((tab, index) => {
      if (!tab.getAttribute('role')) {
        this.addAttribute(tab, 'role', 'tab', enhancements);
      }

      // Add controls relationship
      const panel = this.findTabPanel(tab, element);
      if (panel && !tab.getAttribute('aria-controls')) {
        const panelId = this.ensureId(panel, enhancements);
        this.addAttribute(tab, 'aria-controls', panelId, enhancements);
      }

      // Add selected state
      if (this.isActiveTab(tab) && !tab.getAttribute('aria-selected')) {
        this.addAttribute(tab, 'aria-selected', 'true', enhancements);
      }
    });

    // Enhance tab panels
    const panels = element.querySelectorAll('[role="tabpanel"], .tab-panel');
    panels.forEach(panel => {
      if (!panel.getAttribute('role')) {
        this.addAttribute(panel, 'role', 'tabpanel', enhancements);
      }

      // Add labelledby relationship
      const tab = this.findPanelTab(panel, element);
      if (tab && !panel.getAttribute('aria-labelledby')) {
        const tabId = this.ensureId(tab, enhancements);
        this.addAttribute(panel, 'aria-labelledby', tabId, enhancements);
      }
    });
  }

  // Find tab panel for tab
  findTabPanel(tab, container) {
    const controls = tab.getAttribute('aria-controls');
    if (controls) {
      return container.querySelector(`#${controls}`);
    }

    // Try to find by index or pattern
    const tabIndex = Array.from(container.querySelectorAll('[role="tab"], .tab')).indexOf(tab);
    const panels = container.querySelectorAll('[role="tabpanel"], .tab-panel');
    return panels[tabIndex] || null;
  }

  // Find tab for panel
  findPanelTab(panel, container) {
    const labelledBy = panel.getAttribute('aria-labelledby');
    if (labelledBy) {
      return container.querySelector(`#${labelledBy}`);
    }

    // Try to find by index
    const panelIndex = Array.from(container.querySelectorAll('[role="tabpanel"], .tab-panel')).indexOf(panel);
    const tabs = container.querySelectorAll('[role="tab"], .tab');
    return tabs[panelIndex] || null;
  }

  // Check if tab is active
  isActiveTab(tab) {
    return tab.matches('.active, [aria-selected="true"]') ||
           tab.getAttribute('aria-selected') === 'true';
  }

  async enhanceFormComponent(element, enhancements) {
    // Add form role if search form
    if (element.querySelector('input[type="search"]') && !element.getAttribute('role')) {
      this.addAttribute(element, 'role', 'search', enhancements);
    }
  }

  async enhanceTableComponent(element, enhancements) {
    // This is handled by the general enhanceTables method
  }

  async enhanceAlertComponent(element, enhancements) {
    // Add alert role and live region
    if (!element.getAttribute('role')) {
      this.addAttribute(element, 'role', 'alert', enhancements);
    }

    if (!element.getAttribute('aria-live')) {
      this.addAttribute(element, 'aria-live', 'assertive', enhancements);
    }
  }

  // Apply accessibility recommendation
  applyRecommendation(element, recommendation, enhancements) {
    if (recommendation.fix && typeof recommendation.fix === 'string') {
      // Parse simple fix suggestions
      if (recommendation.fix.includes('aria-label')) {
        const match = recommendation.fix.match(/aria-label="([^"]+)"/);
        if (match) {
          this.addAttribute(element, 'aria-label', match[1], enhancements);
        }
      }
    }
  }

  // Utility methods
  addAttribute(element, name, value, enhancements) {
    if (this.options.preserveExisting && element.getAttribute(name)) {
      return; // Don't overwrite existing attributes
    }

    const oldValue = element.getAttribute(name);
    element.setAttribute(name, value);
    
    enhancements.added.push({
      element: element.tagName.toLowerCase(),
      attribute: name,
      value,
      oldValue,
      action: oldValue ? 'modified' : 'added'
    });
  }

  ensureId(element, enhancements) {
    if (element.id) {
      return element.id;
    }

    const id = this.generateIdFromElement(element);
    if (id) {
      this.addAttribute(element, 'id', id, enhancements);
      return id;
    }

    return null;
  }

  generateId() {
    return `aria-${++this.idCounter}-${Date.now().toString(36)}`;
  }

  generateIdFromElement(element) {
    const tagName = element.tagName.toLowerCase();
    const textContent = element.textContent?.trim();

    if (textContent) {
      return this.generateIdFromText(textContent);
    }

    const className = element.className;
    if (className) {
      const cleanClass = className.split(' ')[0].replace(/[^a-zA-Z0-9-]/g, '');
      if (cleanClass.length > 0) {
        return `${cleanClass}-${this.generateId()}`;
      }
    }

    return `${tagName}-${this.generateId()}`;
  }

  generateIdFromText(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
      .replace(/-+$/, '');
  }

  humanizeString(str) {
    return str
      .replace(/[_-]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  generateNavigationLabel(nav) {
    const className = nav.className.toLowerCase();
    const id = nav.id?.toLowerCase();

    if (className.includes('main') || id?.includes('main')) return 'Main navigation';
    if (className.includes('secondary') || id?.includes('secondary')) return 'Secondary navigation';
    if (className.includes('footer') || id?.includes('footer')) return 'Footer navigation';
    if (className.includes('breadcrumb') || id?.includes('breadcrumb')) return 'Breadcrumb';

    return 'Navigation';
  }

  suggestFieldsets(form, enhancements) {
    enhancements.warnings.push({
      type: 'fieldset-suggestion',
      element: form.tagName.toLowerCase(),
      message: 'Complex form should use fieldsets to group related fields',
      suggestion: 'Group related form fields with <fieldset> and <legend> elements'
    });
  }

  calculateEnhancementStats(enhancements) {
    return {
      totalEnhancements: enhancements.added.length + enhancements.generated.length,
      attributesAdded: enhancements.added.length,
      elementsGenerated: enhancements.generated.length,
      warnings: enhancements.warnings.length,
      byType: {
        attributes: enhancements.added.reduce((acc, item) => {
          acc[item.attribute] = (acc[item.attribute] || 0) + 1;
          return acc;
        }, {}),
        elements: enhancements.generated.reduce((acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1;
          return acc;
        }, {})
      }
    };
  }
}

module.exports = { AriaGenerator };