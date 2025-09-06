// AI-powered component generator with Claude API integration
const https = require('https');
const fs = require('fs').promises;
const path = require('path');

// Component generation engine
class ComponentGenerator {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
    this.templates = new Map();
    this.brandTokens = {};
  }

  // Load template library
  async loadTemplates(templatesDir = path.join(__dirname, 'templates')) {
    try {
      const files = await fs.readdir(templatesDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const templatePath = path.join(templatesDir, file);
          const template = JSON.parse(await fs.readFile(templatePath, 'utf8'));
          this.templates.set(template.id, template);
        }
      }
    } catch (err) {
      console.warn('Failed to load templates:', err.message);
    }
  }

  // Set brand tokens for component generation
  setBrandTokens(tokens) {
    this.brandTokens = tokens;
  }

  // Generate component from description using Claude API
  async generateComponent({
    description,
    componentType = 'component',
    style = 'modern',
    framework = 'html',
    brandPackId = null,
  }) {
    const prompt = this.buildGenerationPrompt({
      description,
      componentType,
      style,
      framework,
      brandTokens: this.brandTokens,
    });

    try {
      const response = await this.callClaudeAPI(prompt);
      const component = this.parseComponentResponse(response);

      return {
        success: true,
        component,
        framework,
        timestamp: new Date().toISOString(),
        cacheKey: this.generateCacheKey({
          description,
          componentType,
          style,
          framework,
          brandPackId,
        }),
      };
    } catch (error) {
      // Fallback to template library
      return this.generateFromTemplate({ componentType, style, framework });
    }
  }

  // Generate component from template (fallback)
  async generateFromTemplate({
    templateId = null,
    componentType = 'button',
    style = 'modern',
    framework = 'html',
  }) {
    const template = templateId
      ? this.templates.get(templateId)
      : this.findTemplateByType(componentType);

    if (!template) {
      throw new Error(`Template not found for component type: ${componentType}`);
    }

    const component = this.applyBrandTokens(template, this.brandTokens);
    return {
      success: true,
      component,
      framework,
      source: 'template',
      templateId: template.id,
      timestamp: new Date().toISOString(),
    };
  }

  // Customize existing template with brand tokens
  async customizeTemplate(templateId, customizations = {}) {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const customized = {
      ...template,
      ...customizations,
      customized: true,
      originalId: templateId,
    };

    return this.applyBrandTokens(customized, this.brandTokens);
  }

  // List available templates with filtering, pagination, and comprehensive metadata
  listTemplates(options = {}) {
    const { type, style, framework, search, limit = 20, offset = 0 } = options;

    // Get all templates with enhanced metadata
    let allTemplates = Array.from(this.templates.values()).map((template) => {
      return this._enhanceTemplateMetadata(template);
    });

    // Apply filters
    if (type) {
      allTemplates = allTemplates.filter((t) => t.type === type);
    }

    if (style) {
      allTemplates = allTemplates.filter((t) => t.style === style);
    }

    if (framework) {
      allTemplates = allTemplates.filter((t) => t.frameworks.includes(framework));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      allTemplates = allTemplates.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower) ||
          t.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Calculate pagination
    const total = allTemplates.length;
    const paginatedTemplates = allTemplates.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      templates: paginatedTemplates,
      total,
      pagination: {
        limit,
        offset,
        hasMore,
        nextPage: hasMore ? `/api/design/templates?limit=${limit}&offset=${offset + limit}` : null,
      },
      filters: {
        availableTypes: this._getAvailableTypes(),
        availableStyles: this._getAvailableStyles(),
        availableFrameworks: this._getAvailableFrameworks(),
      },
    };
  }

  // Enhance template with comprehensive metadata
  _enhanceTemplateMetadata(template) {
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      type: template.type,
      style: this._determineStyle(template),
      preview: this._generatePreviewImage(template),
      previewUrl: `/api/design/templates/${template.id}/preview`,
      tokens: template.tokens || [],
      frameworks: this._getFrameworks(template),
      complexity: this._calculateComplexity(template),
      tags: this._generateTags(template),
      accessibility: 'AA',
      brandCompliance: this._calculateBrandCompliance(template),
      popularity: this._calculatePopularity(template),
      lastUpdated: new Date().toISOString(),
    };
  }

  // Determine template style based on characteristics
  _determineStyle(template) {
    const name = template.name.toLowerCase();
    const desc = template.description.toLowerCase();

    if (name.includes('minimal') || desc.includes('minimal')) return 'minimal';
    if (name.includes('playful') || desc.includes('playful')) return 'playful';
    if (name.includes('professional') || desc.includes('professional')) return 'professional';
    return 'modern'; // default
  }

  // Generate preview image (SVG data URI)
  _generatePreviewImage(template) {
    // Generate a simple SVG preview based on template type
    const svgContent = this._createTemplateSvg(template);
    return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
  }

  // Create SVG representation of template
  _createTemplateSvg(template) {
    const width = template.type === 'card' ? 300 : 200;
    const height = template.type === 'card' ? 200 : 80;

    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8fafc" stroke="#e2e8f0" rx="8"/>
      <text x="50%" y="50%" text-anchor="middle" font-family="system-ui" font-size="14" fill="#374151">
        ${template.name}
      </text>
    </svg>`;
  }

  // Determine available frameworks for template
  _getFrameworks(template) {
    const frameworks = ['html'];
    if (template.jsx) frameworks.push('react');
    if (template.vue) frameworks.push('vue');
    if (template.svelte) frameworks.push('svelte');
    return frameworks;
  }

  // Calculate template complexity
  _calculateComplexity(template) {
    const tokenCount = (template.tokens || []).length;
    const hasVariants = template.variants && Object.keys(template.variants).length > 0;
    const slotCount = (template.slots || []).length;

    if (tokenCount > 8 || hasVariants || slotCount > 3) return 'complex';
    if (tokenCount > 4 || slotCount > 1) return 'medium';
    return 'simple';
  }

  // Generate relevant tags for template
  _generateTags(template) {
    const tags = [];
    const type = template.type.toLowerCase();
    const name = template.name.toLowerCase();
    const desc = template.description.toLowerCase();

    // Type-based tags
    if (type === 'button') {
      tags.push('interactive', 'form-control');
      if (name.includes('primary') || desc.includes('primary')) tags.push('primary', 'cta');
      if (name.includes('secondary')) tags.push('secondary');
    } else if (type === 'card') {
      tags.push('content', 'layout');
      if (desc.includes('elevation') || desc.includes('shadow')) tags.push('elevated');
    } else if (type === 'form') {
      tags.push('input', 'form-control', 'interactive');
    }

    return tags;
  }

  // Calculate brand compliance score
  _calculateBrandCompliance(template) {
    const tokenCount = (template.tokens || []).length;
    const hasColorTokens = (template.tokens || []).some((token) => token.includes('color'));
    const hasSpacingTokens = (template.tokens || []).some((token) => token.includes('spacing'));

    let score = 0.7; // base score
    if (tokenCount > 3) score += 0.1;
    if (hasColorTokens) score += 0.1;
    if (hasSpacingTokens) score += 0.1;

    return Math.min(score, 0.98); // cap at 0.98
  }

  // Calculate popularity score (mock data based on template characteristics)
  _calculatePopularity(template) {
    const popularTypes = { button: 0.9, card: 0.8, form: 0.7 };
    const basePopularity = popularTypes[template.type] || 0.6;
    const randomVariation = (Math.random() - 0.5) * 0.2; // +/- 0.1
    return Math.max(0.1, Math.min(0.95, basePopularity + randomVariation));
  }

  // Get all available template types
  _getAvailableTypes() {
    return [...new Set(Array.from(this.templates.values()).map((t) => t.type))];
  }

  // Get all available styles
  _getAvailableStyles() {
    return ['modern', 'minimal', 'playful', 'professional'];
  }

  // Get all available frameworks
  _getAvailableFrameworks() {
    return ['html', 'react', 'vue', 'svelte'];
  }

  // Build Claude API prompt for component generation
  buildGenerationPrompt({ description, componentType, style, framework, brandTokens }) {
    const tokenContext =
      Object.keys(brandTokens).length > 0
        ? `Use these brand tokens: ${JSON.stringify(brandTokens, null, 2)}`
        : 'Use semantic color names and modern spacing values.';

    return `You are an expert frontend developer. Generate a ${componentType} component based on this description: "${description}"

Requirements:
- Style: ${style}
- Framework: ${framework}
- Make it accessible (ARIA, semantic HTML)
- ${tokenContext}
- Return structured JSON with html, css, and optional jsx properties
- Include preview-friendly standalone HTML

Example output format:
{
  "html": "<button class=\"btn-primary\">Click me</button>",
  "css": ".btn-primary { background: var(--color-primary); padding: var(--spacing-md); }",
  "jsx": "export function Button({ children, ...props }) { return <button className=\"btn-primary\" {...props}>{children}</button>; }",
  "preview": "<!DOCTYPE html><html>...",
  "tokens": ["--color-primary", "--spacing-md"]
}

Generate the component:`;
  }

  // Call Claude API
  async callClaudeAPI(prompt) {
    const payload = JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.content && result.content[0]?.text) {
              resolve(result.content[0].text);
            } else {
              reject(new Error('Invalid API response'));
            }
          } catch (err) {
            reject(err);
          }
        });
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }

  // Parse Claude's response to extract component
  parseComponentResponse(response) {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : response;
      return JSON.parse(jsonStr);
    } catch (err) {
      // Fallback: simple parsing
      return {
        html: response.includes('<') ? response : `<div class="component">${response}</div>`,
        css: '',
        framework: 'html',
      };
    }
  }

  // Apply brand tokens to template
  applyBrandTokens(template, tokens) {
    let html = template.html || '';
    let css = template.css || '';

    // Replace token placeholders
    if (tokens.colors?.roles) {
      Object.entries(tokens.colors.roles).forEach(([key, value]) => {
        const tokenValue = typeof value === 'object' ? value.value : value;
        html = html.replace(new RegExp(`\\{\\{color-${key}\\}\\}`, 'g'), tokenValue);
        css = css.replace(new RegExp(`\\{\\{color-${key}\\}\\}`, 'g'), `var(--color-${key})`);
      });
    }

    if (tokens.spacing?.tokens) {
      Object.entries(tokens.spacing.tokens).forEach(([key, value]) => {
        const tokenValue = typeof value === 'object' ? value.value : value;
        html = html.replace(new RegExp(`\\{\\{spacing-${key}\\}\\}`, 'g'), tokenValue);
        css = css.replace(new RegExp(`\\{\\{spacing-${key}\\}\\}`, 'g'), `var(--spacing-${key})`);
      });
    }

    return { ...template, html, css };
  }

  // Find template by component type
  findTemplateByType(componentType) {
    for (const template of this.templates.values()) {
      if (template.type === componentType) {
        return template;
      }
    }
    return null;
  }

  // Generate cache key for component
  generateCacheKey(params) {
    const str = JSON.stringify(params);
    return Buffer.from(str).toString('base64').substring(0, 16);
  }
}

module.exports = { ComponentGenerator };
