class GridGenerator {
  constructor(options = {}) {
    this.options = {
      defaultColumns: options.defaultColumns || 12,
      defaultGap: options.defaultGap || '1rem',
      breakpoints: options.breakpoints || {
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        xxl: 1400
      },
      containerMaxWidths: options.containerMaxWidths || {
        sm: '540px',
        md: '720px', 
        lg: '960px',
        xl: '1140px',
        xxl: '1320px'
      }
    };
  }

  // Generate CSS Grid system
  generateCSSGrid(config = {}) {
    const {
      columns = this.options.defaultColumns,
      rows = 'auto',
      gap = this.options.defaultGap,
      areas = null,
      responsive = true,
      autoFit = false,
      minColumnWidth = '250px'
    } = config;

    const gridConfig = {
      type: 'css-grid',
      container: this.generateGridContainer(columns, rows, gap, areas, autoFit, minColumnWidth),
      items: this.generateGridItems(columns),
      responsive: responsive ? this.generateResponsiveGridRules(config) : null,
      utilities: this.generateGridUtilities(),
      css: '',
      classes: []
    };

    // Generate complete CSS
    gridConfig.css = this.buildGridCSS(gridConfig);
    gridConfig.classes = this.extractClasses(gridConfig.css);

    return gridConfig;
  }

  // Generate grid container styles
  generateGridContainer(columns, rows, gap, areas, autoFit, minColumnWidth) {
    let gridTemplateColumns;
    
    if (autoFit) {
      gridTemplateColumns = `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`;
    } else if (typeof columns === 'number') {
      gridTemplateColumns = `repeat(${columns}, 1fr)`;
    } else if (Array.isArray(columns)) {
      gridTemplateColumns = columns.join(' ');
    } else {
      gridTemplateColumns = columns;
    }

    const container = {
      display: 'grid',
      gridTemplateColumns,
      gridTemplateRows: rows === 'auto' ? 'auto' : rows,
      gap,
      gridTemplateAreas: areas ? this.formatGridAreas(areas) : null
    };

    return container;
  }

  // Generate grid item utilities
  generateGridItems(columns) {
    const items = {};
    
    // Generate column span classes
    for (let i = 1; i <= columns; i++) {
      items[`col-${i}`] = {
        gridColumn: `span ${i} / span ${i}`
      };
    }

    // Generate column start classes
    for (let i = 1; i <= columns; i++) {
      items[`col-start-${i}`] = {
        gridColumnStart: i
      };
    }

    // Generate column end classes
    for (let i = 1; i <= columns + 1; i++) {
      items[`col-end-${i}`] = {
        gridColumnEnd: i
      };
    }

    // Generate row span classes
    for (let i = 1; i <= 6; i++) {
      items[`row-${i}`] = {
        gridRow: `span ${i} / span ${i}`
      };
    }

    // Generate row start/end classes
    for (let i = 1; i <= 7; i++) {
      items[`row-start-${i}`] = {
        gridRowStart: i
      };
      items[`row-end-${i}`] = {
        gridRowEnd: i
      };
    }

    return items;
  }

  // Generate responsive grid rules
  generateResponsiveGridRules(config) {
    const responsive = {};
    
    Object.entries(this.options.breakpoints).forEach(([breakpoint, minWidth]) => {
      if (minWidth === 0) return; // Skip xs breakpoint
      
      responsive[breakpoint] = {
        mediaQuery: `@media (min-width: ${minWidth}px)`,
        columns: this.getResponsiveColumns(breakpoint, config),
        gap: this.getResponsiveGap(breakpoint, config),
        container: this.getResponsiveContainer(breakpoint)
      };
    });

    return responsive;
  }

  // Get responsive column configuration
  getResponsiveColumns(breakpoint, config) {
    const responsiveConfig = {
      sm: Math.max(1, Math.floor(this.options.defaultColumns / 4)),
      md: Math.max(2, Math.floor(this.options.defaultColumns / 2)),
      lg: Math.max(3, Math.floor(this.options.defaultColumns * 0.75)),
      xl: this.options.defaultColumns,
      xxl: this.options.defaultColumns
    };

    return config.responsiveColumns?.[breakpoint] || responsiveConfig[breakpoint] || this.options.defaultColumns;
  }

  // Get responsive gap configuration
  getResponsiveGap(breakpoint, config) {
    const responsiveGaps = {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.25rem',
      xxl: '1.5rem'
    };

    return config.responsiveGaps?.[breakpoint] || responsiveGaps[breakpoint] || this.options.defaultGap;
  }

  // Get responsive container configuration
  getResponsiveContainer(breakpoint) {
    return {
      maxWidth: this.options.containerMaxWidths[breakpoint] || '100%',
      margin: '0 auto',
      padding: '0 1rem'
    };
  }

  // Generate grid utilities
  generateGridUtilities() {
    return {
      // Alignment utilities
      'justify-start': { justifyItems: 'start' },
      'justify-center': { justifyItems: 'center' },
      'justify-end': { justifyItems: 'end' },
      'justify-stretch': { justifyItems: 'stretch' },
      
      'content-start': { justifyContent: 'start' },
      'content-center': { justifyContent: 'center' },
      'content-end': { justifyContent: 'end' },
      'content-between': { justifyContent: 'space-between' },
      'content-around': { justifyContent: 'space-around' },
      'content-evenly': { justifyContent: 'space-evenly' },
      
      'items-start': { alignItems: 'start' },
      'items-center': { alignItems: 'center' },
      'items-end': { alignItems: 'end' },
      'items-stretch': { alignItems: 'stretch' },
      
      'self-start': { justifySelf: 'start' },
      'self-center': { justifySelf: 'center' },
      'self-end': { justifySelf: 'end' },
      'self-stretch': { justifySelf: 'stretch' },
      
      // Auto-flow utilities
      'grid-flow-row': { gridAutoFlow: 'row' },
      'grid-flow-col': { gridAutoFlow: 'column' },
      'grid-flow-dense': { gridAutoFlow: 'row dense' },
      'grid-flow-row-dense': { gridAutoFlow: 'row dense' },
      'grid-flow-col-dense': { gridAutoFlow: 'column dense' },
      
      // Auto sizing utilities
      'auto-cols-auto': { gridAutoColumns: 'auto' },
      'auto-cols-min': { gridAutoColumns: 'min-content' },
      'auto-cols-max': { gridAutoColumns: 'max-content' },
      'auto-cols-fr': { gridAutoColumns: '1fr' },
      
      'auto-rows-auto': { gridAutoRows: 'auto' },
      'auto-rows-min': { gridAutoRows: 'min-content' },
      'auto-rows-max': { gridAutoRows: 'max-content' },
      'auto-rows-fr': { gridAutoRows: '1fr' }
    };
  }

  // Build complete CSS string
  buildGridCSS(gridConfig) {
    let css = '';
    
    // Container styles
    css += '.grid {\n';
    Object.entries(gridConfig.container).forEach(([property, value]) => {
      if (value !== null) {
        css += `  ${this.kebabCase(property)}: ${value};\n`;
      }
    });
    css += '}\n\n';

    // Container responsive styles
    if (gridConfig.responsive) {
      Object.entries(gridConfig.responsive).forEach(([breakpoint, config]) => {
        css += `${config.mediaQuery} {\n`;
        css += '  .grid {\n';
        if (config.columns) {
          css += `    grid-template-columns: repeat(${config.columns}, 1fr);\n`;
        }
        if (config.gap) {
          css += `    gap: ${config.gap};\n`;
        }
        css += '  }\n';
        
        if (config.container) {
          css += '  .container {\n';
          Object.entries(config.container).forEach(([property, value]) => {
            css += `    ${this.kebabCase(property)}: ${value};\n`;
          });
          css += '  }\n';
        }
        css += '}\n\n';
      });
    }

    // Grid item styles
    Object.entries(gridConfig.items).forEach(([className, styles]) => {
      css += `.${className} {\n`;
      Object.entries(styles).forEach(([property, value]) => {
        css += `  ${this.kebabCase(property)}: ${value};\n`;
      });
      css += '}\n\n';
    });

    // Utility styles
    Object.entries(gridConfig.utilities).forEach(([className, styles]) => {
      css += `.${className} {\n`;
      Object.entries(styles).forEach(([property, value]) => {
        css += `  ${this.kebabCase(property)}: ${value};\n`;
      });
      css += '}\n\n';
    });

    return css;
  }

  // Generate Flexbox Grid system (alternative)
  generateFlexboxGrid(config = {}) {
    const {
      columns = this.options.defaultColumns,
      gap = this.options.defaultGap,
      responsive = true
    } = config;

    const flexConfig = {
      type: 'flexbox-grid',
      container: {
        display: 'flex',
        flexWrap: 'wrap',
        gap,
        margin: `calc(-${gap} / 2)`
      },
      items: this.generateFlexItems(columns),
      responsive: responsive ? this.generateResponsiveFlexRules(config) : null,
      css: '',
      classes: []
    };

    flexConfig.css = this.buildFlexCSS(flexConfig);
    flexConfig.classes = this.extractClasses(flexConfig.css);

    return flexConfig;
  }

  // Generate flex grid items
  generateFlexItems(columns) {
    const items = {};
    
    for (let i = 1; i <= columns; i++) {
      const width = (i / columns) * 100;
      items[`col-${i}`] = {
        flex: `0 0 ${width}%`,
        maxWidth: `${width}%`
      };
    }

    // Auto width column
    items['col-auto'] = {
      flex: '0 0 auto',
      width: 'auto'
    };

    // Equal width columns
    items['col'] = {
      flex: '1',
      maxWidth: '100%'
    };

    return items;
  }

  // Build flexbox CSS
  buildFlexCSS(flexConfig) {
    let css = '';
    
    // Container styles
    css += '.flex-grid {\n';
    Object.entries(flexConfig.container).forEach(([property, value]) => {
      css += `  ${this.kebabCase(property)}: ${value};\n`;
    });
    css += '}\n\n';

    // Item styles
    Object.entries(flexConfig.items).forEach(([className, styles]) => {
      css += `.${className} {\n`;
      Object.entries(styles).forEach(([property, value]) => {
        css += `  ${this.kebabCase(property)}: ${value};\n`;
      });
      css += '}\n\n';
    });

    return css;
  }

  // Generate subgrid system
  generateSubgrid(config = {}) {
    const {
      parentColumns = 12,
      columns = 'subgrid',
      rows = 'subgrid',
      gap = 'inherit'
    } = config;

    return {
      type: 'subgrid',
      container: {
        display: 'grid',
        gridTemplateColumns: columns,
        gridTemplateRows: rows,
        gap
      },
      css: this.buildSubgridCSS(config),
      support: this.checkSubgridSupport()
    };
  }

  // Build subgrid CSS with fallback
  buildSubgridCSS(config) {
    let css = '';
    
    css += '.subgrid {\n';
    css += '  display: grid;\n';
    css += `  grid-template-columns: ${config.columns || 'subgrid'};\n`;
    css += `  grid-template-rows: ${config.rows || 'subgrid'};\n`;
    css += `  gap: ${config.gap || 'inherit'};\n`;
    css += '}\n\n';

    // Fallback for browsers without subgrid support
    css += '@supports not (grid-template-columns: subgrid) {\n';
    css += '  .subgrid {\n';
    css += '    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n';
    css += '  }\n';
    css += '}\n\n';

    return css;
  }

  // Check subgrid support
  checkSubgridSupport() {
    // This would be implemented in browser environment
    return {
      supported: false, // Placeholder
      fallbackRequired: true
    };
  }

  // Generate container queries grid
  generateContainerGrid(config = {}) {
    const {
      containerName = 'grid-container',
      breakpoints = {
        small: '300px',
        medium: '500px',
        large: '800px'
      }
    } = config;

    const containerConfig = {
      type: 'container-grid',
      container: {
        containerType: 'inline-size',
        containerName
      },
      queries: {},
      css: ''
    };

    // Generate container queries
    Object.entries(breakpoints).forEach(([name, width]) => {
      containerConfig.queries[name] = {
        query: `@container ${containerName} (min-width: ${width})`,
        columns: this.getContainerColumns(name),
        gap: this.getContainerGap(name)
      };
    });

    containerConfig.css = this.buildContainerGridCSS(containerConfig);
    return containerConfig;
  }

  // Build container grid CSS
  buildContainerGridCSS(config) {
    let css = '';
    
    // Container setup
    css += `.${config.container.containerName} {\n`;
    css += `  container-type: ${config.container.containerType};\n`;
    css += `  container-name: ${config.container.containerName};\n`;
    css += '}\n\n';

    // Container queries
    Object.entries(config.queries).forEach(([name, queryConfig]) => {
      css += `${queryConfig.query} {\n`;
      css += '  .grid {\n';
      css += `    grid-template-columns: repeat(${queryConfig.columns}, 1fr);\n`;
      css += `    gap: ${queryConfig.gap};\n`;
      css += '  }\n';
      css += '}\n\n';
    });

    return css;
  }

  // Helper methods
  formatGridAreas(areas) {
    if (Array.isArray(areas)) {
      return areas.map(row => `"${row}"`).join('\n    ');
    }
    return areas;
  }

  getContainerColumns(sizeName) {
    const columnMap = {
      small: 1,
      medium: 2,
      large: 3,
      xlarge: 4
    };
    return columnMap[sizeName] || 1;
  }

  getContainerGap(sizeName) {
    const gapMap = {
      small: '0.5rem',
      medium: '1rem',
      large: '1.5rem',
      xlarge: '2rem'
    };
    return gapMap[sizeName] || '1rem';
  }

  kebabCase(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  extractClasses(css) {
    const classRegex = /\.([a-zA-Z][\w-]*)/g;
    const classes = [];
    let match;
    
    while ((match = classRegex.exec(css)) !== null) {
      if (!classes.includes(match[1])) {
        classes.push(match[1]);
      }
    }
    
    return classes;
  }

  // Generate complete grid system
  generateCompleteGridSystem(config = {}) {
    const systems = {
      cssGrid: this.generateCSSGrid(config.cssGrid),
      flexboxGrid: this.generateFlexboxGrid(config.flexbox),
      subgrid: this.generateSubgrid(config.subgrid),
      containerGrid: this.generateContainerGrid(config.container)
    };

    // Combine all CSS
    const combinedCSS = Object.values(systems)
      .map(system => system.css)
      .join('\n');

    return {
      systems,
      combinedCSS,
      classes: this.extractClasses(combinedCSS),
      config: this.options
    };
  }

  // Generate grid from content analysis
  generateFromContent(elements = []) {
    const analysis = this.analyzeContent(elements);
    
    const gridConfig = {
      columns: this.suggestColumnsFromContent(analysis),
      gap: this.suggestGapFromContent(analysis),
      areas: this.suggestAreasFromContent(analysis),
      responsive: true
    };

    return this.generateCSSGrid(gridConfig);
  }

  // Analyze content for grid generation
  analyzeContent(elements) {
    return {
      totalElements: elements.length,
      elementTypes: this.categorizeElements(elements),
      aspectRatios: this.calculateAspectRatios(elements),
      uniformity: this.calculateUniformity(elements)
    };
  }

  // Categorize elements by type
  categorizeElements(elements) {
    const types = {
      cards: 0,
      images: 0,
      text: 0,
      buttons: 0,
      forms: 0
    };

    elements.forEach(element => {
      if (element.type === 'card' || element.className?.includes('card')) {
        types.cards++;
      } else if (element.tagName === 'IMG') {
        types.images++;
      } else if (element.tagName === 'BUTTON') {
        types.buttons++;
      } else if (element.tagName === 'FORM') {
        types.forms++;
      } else {
        types.text++;
      }
    });

    return types;
  }

  // Calculate aspect ratios of elements
  calculateAspectRatios(elements) {
    return elements.map(element => {
      const width = element.offsetWidth || 300;
      const height = element.offsetHeight || 200;
      return width / height;
    });
  }

  // Calculate uniformity of elements
  calculateUniformity(elements) {
    if (elements.length === 0) return 0;
    
    const sizes = elements.map(el => ({
      width: el.offsetWidth || 300,
      height: el.offsetHeight || 200
    }));
    
    const avgWidth = sizes.reduce((sum, s) => sum + s.width, 0) / sizes.length;
    const avgHeight = sizes.reduce((sum, s) => sum + s.height, 0) / sizes.length;
    
    const widthVariance = sizes.reduce((sum, s) => sum + Math.pow(s.width - avgWidth, 2), 0) / sizes.length;
    const heightVariance = sizes.reduce((sum, s) => sum + Math.pow(s.height - avgHeight, 2), 0) / sizes.length;
    
    const widthStdDev = Math.sqrt(widthVariance);
    const heightStdDev = Math.sqrt(heightVariance);
    
    // Lower coefficient of variation = higher uniformity
    const widthCV = widthStdDev / avgWidth;
    const heightCV = heightStdDev / avgHeight;
    
    return 1 - Math.min((widthCV + heightCV) / 2, 1);
  }

  // Suggest columns based on content
  suggestColumnsFromContent(analysis) {
    const { totalElements, elementTypes, uniformity } = analysis;
    
    // For uniform card layouts
    if (elementTypes.cards > totalElements * 0.7 && uniformity > 0.8) {
      if (totalElements <= 2) return 2;
      if (totalElements <= 6) return 3;
      if (totalElements <= 12) return 4;
      return 4; // Max 4 for cards
    }
    
    // For image galleries
    if (elementTypes.images > totalElements * 0.8) {
      return Math.min(Math.ceil(Math.sqrt(totalElements)), 6);
    }
    
    // Default responsive columns
    return this.options.defaultColumns;
  }

  // Suggest gap based on content
  suggestGapFromContent(analysis) {
    const { elementTypes, uniformity } = analysis;
    
    // Tighter gaps for uniform content
    if (uniformity > 0.8) {
      return '0.75rem';
    }
    
    // Larger gaps for mixed content
    if (elementTypes.cards > 0 && elementTypes.text > 0) {
      return '1.5rem';
    }
    
    return this.options.defaultGap;
  }

  // Suggest grid areas based on content
  suggestAreasFromContent(analysis) {
    const { elementTypes } = analysis;
    
    // If there are form elements, suggest a form layout
    if (elementTypes.forms > 0) {
      return [
        'header header header',
        'sidebar main main',
        'footer footer footer'
      ];
    }
    
    // No specific areas for general content
    return null;
  }
}

module.exports = { GridGenerator };