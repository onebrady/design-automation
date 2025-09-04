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
    brandPackId = null
  }) {
    const prompt = this.buildGenerationPrompt({
      description,
      componentType,
      style,
      framework,
      brandTokens: this.brandTokens
    });

    try {
      const response = await this.callClaudeAPI(prompt);
      const component = this.parseComponentResponse(response);
      
      return {
        success: true,
        component,
        framework,
        timestamp: new Date().toISOString(),
        cacheKey: this.generateCacheKey({ description, componentType, style, framework, brandPackId })
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
    framework = 'html'
  }) {
    const template = templateId ? 
      this.templates.get(templateId) : 
      this.findTemplateByType(componentType);

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
      timestamp: new Date().toISOString()
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
      originalId: templateId
    };

    return this.applyBrandTokens(customized, this.brandTokens);
  }

  // List available templates
  listTemplates() {
    return Array.from(this.templates.values()).map(template => ({
      id: template.id,
      name: template.name,
      type: template.type,
      description: template.description,
      preview: template.preview || null
    }));
  }

  // Build Claude API prompt for component generation
  buildGenerationPrompt({ description, componentType, style, framework, brandTokens }) {
    const tokenContext = Object.keys(brandTokens).length > 0 ? 
      `Use these brand tokens: ${JSON.stringify(brandTokens, null, 2)}` : 
      'Use semantic color names and modern spacing values.';

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
      messages: [{ role: 'user', content: prompt }]
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
        'anthropic-version': '2023-06-01'
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
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
        framework: 'html'
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