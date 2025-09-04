const crypto = require('crypto');
const { JSDOM } = require('jsdom');

class LivePreviewEngine {
  constructor(options = {}) {
    this.options = {
      timeout: options.timeout || 5000,
      maxPreviewSize: options.maxPreviewSize || 1024 * 1024, // 1MB
      allowedDomains: options.allowedDomains || [],
      sandboxFeatures: options.sandboxFeatures || [
        'allow-scripts',
        'allow-same-origin'
      ],
      cacheTime: options.cacheTime || 5 * 60 * 1000 // 5 minutes
    };
    
    this.previewCache = new Map();
    this.renderQueue = new Map();
  }

  // Generate live preview from component code
  async generatePreview(component, options = {}) {
    const previewId = this.generatePreviewId(component, options);
    
    // Check cache first
    if (this.previewCache.has(previewId)) {
      const cached = this.previewCache.get(previewId);
      if (Date.now() - cached.timestamp < this.options.cacheTime) {
        return { ...cached.preview, cached: true };
      }
    }
    
    // Check if already rendering
    if (this.renderQueue.has(previewId)) {
      return await this.renderQueue.get(previewId);
    }
    
    // Start rendering
    const renderPromise = this.renderComponent(component, options);
    this.renderQueue.set(previewId, renderPromise);
    
    try {
      const preview = await renderPromise;
      
      // Cache result
      this.previewCache.set(previewId, {
        preview,
        timestamp: Date.now()
      });
      
      // Clean up queue
      this.renderQueue.delete(previewId);
      
      return preview;
    } catch (error) {
      this.renderQueue.delete(previewId);
      throw error;
    }
  }

  // Render component in isolated sandbox
  async renderComponent(component, options = {}) {
    const {
      html,
      css,
      jsx,
      framework = 'html',
      theme = 'light',
      viewport = { width: 400, height: 300 },
      brandTokens = {},
      interactive = false
    } = component;
    
    const {
      includeControls = false,
      showGrid = false,
      highlightElement = null,
      customStyles = ''
    } = options;

    try {
      // Generate complete HTML document
      const document = this.buildPreviewDocument({
        html,
        css,
        jsx,
        framework,
        theme,
        viewport,
        brandTokens,
        interactive,
        includeControls,
        showGrid,
        highlightElement,
        customStyles
      });

      // Create sandbox environment
      const sandbox = await this.createSandbox(document, {
        viewport,
        interactive
      });

      // Generate screenshot if needed
      const screenshot = options.generateScreenshot ? 
        await this.generateScreenshot(sandbox, viewport) : null;

      // Extract component metrics
      const metrics = await this.extractMetrics(sandbox);

      // Generate responsive previews
      const responsiveViews = options.generateResponsive ?
        await this.generateResponsivePreviews(component, options) : null;

      return {
        id: this.generatePreviewId(component, options),
        document,
        sandbox: sandbox.html,
        screenshot,
        metrics,
        responsiveViews,
        metadata: {
          framework,
          theme,
          viewport,
          interactive,
          timestamp: new Date().toISOString(),
          renderTime: Date.now() - (options._startTime || Date.now())
        }
      };
    } catch (error) {
      throw new Error(`Preview generation failed: ${error.message}`);
    }
  }

  // Build complete HTML document for preview
  buildPreviewDocument(options) {
    const {
      html,
      css,
      jsx,
      framework,
      theme,
      viewport,
      brandTokens,
      interactive,
      includeControls,
      showGrid,
      highlightElement,
      customStyles
    } = options;

    // Generate CSS variables from brand tokens
    const tokenStyles = this.generateTokenStyles(brandTokens);
    
    // Theme-specific styles
    const themeStyles = this.generateThemeStyles(theme);
    
    // Grid overlay styles
    const gridStyles = showGrid ? this.generateGridStyles() : '';
    
    // Control panel styles
    const controlStyles = includeControls ? this.generateControlStyles() : '';
    
    // Highlight styles
    const highlightStyles = highlightElement ? 
      this.generateHighlightStyles(highlightElement) : '';

    // Framework-specific rendering
    let bodyContent;
    let scriptContent = '';
    
    if (framework === 'react' || framework === 'jsx') {
      bodyContent = this.generateReactPreview(jsx || html);
      scriptContent = this.generateReactScript(jsx || html, interactive);
    } else if (framework === 'vue') {
      bodyContent = this.generateVuePreview(html);
      scriptContent = this.generateVueScript(html, interactive);
    } else {
      bodyContent = html;
      if (interactive) {
        scriptContent = this.generateInteractivityScript();
      }
    }

    // Build complete document
    const document = `<!DOCTYPE html>
<html lang="en" data-theme="${theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Preview</title>
  <style>
    /* Reset and base styles */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    html, body {
      width: 100%;
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    /* Brand token CSS variables */
    :root {
      ${tokenStyles}
      ${themeStyles}
    }
    
    /* Component styles */
    ${css}
    
    /* Grid overlay */
    ${gridStyles}
    
    /* Control panel */
    ${controlStyles}
    
    /* Highlight styles */
    ${highlightStyles}
    
    /* Custom styles */
    ${customStyles}
    
    /* Preview container */
    .preview-container {
      width: 100%;
      height: 100%;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--preview-bg, #f8fafc);
    }
    
    /* Interactive mode styles */
    ${interactive ? this.generateInteractiveStyles() : ''}
  </style>
  
  ${framework === 'react' ? '<script src="https://unpkg.com/react@18/umd/react.development.js"></script><script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script><script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>' : ''}
  ${framework === 'vue' ? '<script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>' : ''}
</head>
<body>
  ${includeControls ? this.generateControlPanel() : ''}
  ${showGrid ? '<div class="grid-overlay"></div>' : ''}
  
  <div class="preview-container">
    ${bodyContent}
  </div>
  
  ${scriptContent ? `<script>${scriptContent}</script>` : ''}
</body>
</html>`;

    return document;
  }

  // Create sandboxed environment
  async createSandbox(document, options = {}) {
    const dom = new JSDOM(document, {
      resources: 'usable',
      runScripts: 'dangerously',
      pretendToBeVisual: true,
      beforeParse(window) {
        // Security: Limit global access
        delete window.fetch;
        delete window.XMLHttpRequest;
        window.console = {
          log: () => {},
          error: () => {},
          warn: () => {},
          info: () => {}
        };
      }
    });

    // Set viewport
    if (options.viewport) {
      dom.window.resizeTo(options.viewport.width, options.viewport.height);
    }

    return {
      window: dom.window,
      document: dom.window.document,
      html: dom.serialize()
    };
  }

  // Generate CSS variables from brand tokens
  generateTokenStyles(brandTokens) {
    if (!brandTokens || typeof brandTokens !== 'object') return '';
    
    let styles = '';
    
    // Flatten nested token structure
    const flattenTokens = (obj, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object' && value.value !== undefined) {
          styles += `  --${prefix}${key}: ${value.value};\n`;
        } else if (value && typeof value === 'object') {
          flattenTokens(value, `${prefix}${key}-`);
        }
      }
    };
    
    flattenTokens(brandTokens);
    return styles;
  }

  // Generate theme-specific styles
  generateThemeStyles(theme) {
    const themes = {
      light: {
        '--preview-bg': '#ffffff',
        '--preview-text': '#1f2937',
        '--preview-border': '#e5e7eb',
        '--preview-shadow': 'rgba(0, 0, 0, 0.1)'
      },
      dark: {
        '--preview-bg': '#111827',
        '--preview-text': '#f9fafb',
        '--preview-border': '#374151',
        '--preview-shadow': 'rgba(0, 0, 0, 0.3)'
      }
    };
    
    const themeVars = themes[theme] || themes.light;
    return Object.entries(themeVars)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');
  }

  // Generate React-specific preview content
  generateReactPreview(jsx) {
    return `<div id="react-root"></div>`;
  }

  // Generate React rendering script
  generateReactScript(jsx, interactive) {
    // Simple JSX to JS transformation for basic components
    let transformedCode = jsx;
    
    // Basic JSX transform (limited - would need full Babel in production)
    transformedCode = transformedCode
      .replace(/className=/g, 'className:')
      .replace(/onClick=/g, 'onClick:')
      .replace(/style={{([^}]+)}}/g, (match, styles) => `style={{${styles}}}`);
    
    return `
      const { createElement: h, useState, useEffect } = React;
      
      function PreviewComponent() {
        ${interactive ? 'const [state, setState] = useState({});' : ''}
        
        try {
          return ${jsx};
        } catch (error) {
          return h('div', { 
            style: { 
              color: 'red', 
              padding: '10px',
              border: '1px solid red',
              borderRadius: '4px'
            } 
          }, 'Error rendering component: ' + error.message);
        }
      }
      
      const root = ReactDOM.createRoot(document.getElementById('react-root'));
      root.render(h(PreviewComponent));
    `;
  }

  // Generate interactive functionality
  generateInteractivityScript() {
    return `
      // Add basic interactivity
      document.addEventListener('DOMContentLoaded', function() {
        // Add hover effects
        const elements = document.querySelectorAll('button, a, [role="button"]');
        elements.forEach(el => {
          el.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
          });
          el.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
          });
        });
        
        // Add click feedback
        document.addEventListener('click', function(e) {
          if (e.target.matches('button, a, [role="button"]')) {
            e.target.style.transform = 'translateY(1px)';
            setTimeout(() => {
              e.target.style.transform = 'translateY(-1px)';
            }, 100);
          }
        });
      });
    `;
  }

  // Generate grid overlay styles
  generateGridStyles() {
    return `
      .grid-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        background-image: 
          linear-gradient(rgba(0, 123, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 123, 255, 0.1) 1px, transparent 1px);
        background-size: 20px 20px;
      }
    `;
  }

  // Generate control panel
  generateControlPanel() {
    return `
      <div class="preview-controls" style="
        position: fixed;
        top: 10px;
        right: 10px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 10px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        font-size: 12px;
      ">
        <div>Preview Controls</div>
        <button onclick="window.parent.postMessage({type: 'refresh'}, '*')" style="margin: 5px 0; padding: 4px 8px;">Refresh</button>
      </div>
    `;
  }

  // Extract component metrics
  async extractMetrics(sandbox) {
    const { window, document } = sandbox;
    
    try {
      // Basic DOM metrics
      const elements = document.querySelectorAll('*');
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [tabindex]');
      
      // Performance metrics (simulated)
      const metrics = {
        dom: {
          totalElements: elements.length,
          interactiveElements: interactiveElements.length,
          depth: this.calculateDOMDepth(document.body),
          textNodes: this.countTextNodes(document.body)
        },
        accessibility: {
          headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
          ariaLabels: document.querySelectorAll('[aria-label]').length,
          altTexts: document.querySelectorAll('img[alt]').length,
          landmarks: document.querySelectorAll('[role="banner"], [role="navigation"], [role="main"], [role="contentinfo"]').length
        },
        performance: {
          estimatedRenderTime: Math.random() * 50 + 10, // Simulated
          complexity: Math.min(elements.length / 10, 10),
          interactivityScore: Math.min(interactiveElements.length / 5, 10)
        }
      };
      
      return metrics;
    } catch (error) {
      return { error: error.message };
    }
  }

  // Calculate DOM depth
  calculateDOMDepth(element, depth = 0) {
    let maxDepth = depth;
    for (const child of element.children) {
      const childDepth = this.calculateDOMDepth(child, depth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }
    return maxDepth;
  }

  // Count text nodes
  countTextNodes(element) {
    let count = 0;
    for (const node of element.childNodes) {
      if (node.nodeType === 3 && node.textContent.trim()) { // Text node
        count++;
      } else if (node.nodeType === 1) { // Element node
        count += this.countTextNodes(node);
      }
    }
    return count;
  }

  // Generate responsive previews
  async generateResponsivePreviews(component, options) {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 900 }
    ];
    
    const previews = [];
    
    for (const viewport of viewports) {
      const responsiveComponent = {
        ...component,
        viewport
      };
      
      const preview = await this.renderComponent(responsiveComponent, {
        ...options,
        _startTime: Date.now()
      });
      
      previews.push({
        viewport: viewport.name,
        ...preview
      });
    }
    
    return previews;
  }

  // Generate screenshot (placeholder - would need headless browser in production)
  async generateScreenshot(sandbox, viewport) {
    // Placeholder implementation
    // In production, would use Puppeteer or similar
    return {
      url: 'data:image/png;base64,placeholder',
      width: viewport.width,
      height: viewport.height,
      format: 'png'
    };
  }

  // Generate preview ID for caching
  generatePreviewId(component, options) {
    const content = JSON.stringify({ component, options });
    return crypto.createHash('md5').update(content).digest('hex');
  }

  // Clear cache
  clearCache() {
    this.previewCache.clear();
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.previewCache.size,
      queueSize: this.renderQueue.size,
      maxCacheTime: this.options.cacheTime
    };
  }
}

const { PreviewSandbox } = require('./sandbox');

module.exports = { 
  LivePreviewEngine,
  PreviewSandbox
};