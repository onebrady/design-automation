#!/usr/bin/env node

/**
 * Component Generation Example
 * 
 * This script demonstrates how to use Phase 8's AI-powered component generation
 * to create a complete component library from natural language descriptions.
 * 
 * Run with: node generate-components.js
 */

const fs = require('fs');
const path = require('path');

// Mock the SDK since we're in example mode
// In real usage, you would: const { generateComponent } = require('@agentic/sdk');
const generateComponent = async (options) => {
  // Simulate AI generation delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
  
  const templates = {
    button: {
      html: `<button class="btn btn-${options.style || 'primary'}" type="${options.type || 'button'}">
  ${options.text || 'Click me'}
</button>`,
      css: `.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
}

.btn-primary:hover {
  background-color: var(--color-primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: translateY(0);
  background-color: var(--color-primary-700);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--color-primary-300);
  outline-offset: 2px;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}`,
      jsx: `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <button
      className={\`btn btn-\${variant} btn-\${size}\`}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner" aria-hidden="true" />
      ) : (
        children
      )}
    </button>
  );
};`,
      vue: `<template>
  <button
    :class="[\`btn btn-\${variant} btn-\${size}\`, { 'btn-loading': loading }]"
    :disabled="disabled || loading"
    :type="type"
    @click="$emit('click')"
  >
    <span v-if="loading" class="btn-spinner" aria-hidden="true" />
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  disabled: false,
  loading: false,
  type: 'button'
})

defineEmits<{
  click: []
}>()
</script>`
    },
    card: {
      html: `<div class="card">
  <div class="card-header">
    <h3 class="card-title">${options.title || 'Card Title'}</h3>
  </div>
  <div class="card-body">
    <p class="card-text">${options.text || 'Card content goes here...'}</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Learn More</button>
  </div>
</div>`,
      css: `.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.card-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.card-body {
  padding: var(--spacing-lg);
}

.card-text {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.card-footer {
  padding: var(--spacing-lg);
  background: var(--color-surface-secondary);
  border-top: 1px solid var(--color-border);
}`,
      jsx: `import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  hoverable?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  footer,
  hoverable = true,
  className = '',
  ...props
}) => {
  return (
    <div
      className={\`card \${hoverable ? 'card-hoverable' : ''} \${className}\`.trim()}
      {...props}
    >
      {title && (
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};`
    },
    input: {
      html: `<div class="form-field">
  <label class="form-label" for="${options.id || 'input'}">${options.label || 'Label'}</label>
  <input
    id="${options.id || 'input'}"
    class="form-input"
    type="${options.type || 'text'}"
    placeholder="${options.placeholder || 'Enter value...'}"
    ${options.required ? 'required' : ''}
  />
  <span class="form-help">Helper text</span>
</div>`,
      css: `.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.form-input {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  background: var(--color-surface);
  color: var(--color-text-primary);
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-alpha-20);
}

.form-input:invalid {
  border-color: var(--color-error);
}

.form-input:invalid:focus {
  box-shadow: 0 0 0 2px var(--color-error-alpha-20);
}

.form-help {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.form-field[data-error] .form-help {
  color: var(--color-error);
}`,
      jsx: `import React, { forwardRef } from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helpText?: string;
  error?: string;
  size?: 'small' | 'medium' | 'large';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  helpText,
  error,
  size = 'medium',
  className = '',
  ...props
}, ref) => {
  const inputId = props.id || \`input-\${Math.random().toString(36).substr(2, 9)}\`;

  return (
    <div className={\`form-field \${error ? 'form-field-error' : ''}\`} data-error={!!error}>
      {label && (
        <label className="form-label" htmlFor={inputId}>
          {label}
          {props.required && <span className="form-required">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={\`form-input form-input-\${size} \${className}\`.trim()}
        aria-describedby={helpText || error ? \`\${inputId}-help\` : undefined}
        aria-invalid={!!error}
        {...props}
      />
      {(helpText || error) && (
        <span id={\`\${inputId}-help\`} className="form-help">
          {error || helpText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';`
    }
  };

  const template = templates[options.componentType] || templates.button;
  
  return {
    success: true,
    component: template,
    brandCompliance: {
      score: 0.95,
      tokensUsed: ['--color-primary', '--spacing-md', '--radius-md', '--font-size-base'],
      suggestions: []
    },
    accessibility: {
      score: 'A',
      issues: [],
      enhancements: ['Added proper ARIA attributes', 'Keyboard navigation support', 'Focus management']
    }
  };
};

// Component definitions to generate
const componentsToGenerate = [
  {
    description: "A modern primary button with hover effects and loading state",
    componentType: "button",
    style: "modern",
    framework: "react",
    name: "Button"
  },
  {
    description: "A clean card component with header, body, and footer sections",
    componentType: "card", 
    style: "modern",
    framework: "react",
    name: "Card"
  },
  {
    description: "An accessible form input with label, validation, and help text",
    componentType: "input",
    style: "modern", 
    framework: "react",
    name: "Input"
  },
  {
    description: "A responsive navigation header with logo and menu items",
    componentType: "navigation",
    style: "modern",
    framework: "react",
    name: "Navigation"
  },
  {
    description: "A modal dialog with backdrop, close button, and accessible focus management",
    componentType: "modal",
    style: "modern", 
    framework: "react",
    name: "Modal"
  }
];

async function generateComponentLibrary() {
  console.log('🤖 Starting AI Component Generation...\n');
  
  // Create output directories
  const outputDir = path.join(__dirname, 'generated');
  const dirs = ['components', 'styles', 'types'];
  
  dirs.forEach(dir => {
    const dirPath = path.join(outputDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  const results = [];
  let totalTokensUsed = 0;
  let totalComponents = 0;

  for (const config of componentsToGenerate) {
    console.log(`Generating ${config.name}...`);
    
    try {
      const result = await generateComponent(config);
      
      if (result.success) {
        // Save component files
        const componentName = config.name;
        
        // Save React component
        if (result.component.jsx) {
          fs.writeFileSync(
            path.join(outputDir, 'components', `${componentName}.tsx`),
            result.component.jsx
          );
        }
        
        // Save styles
        if (result.component.css) {
          fs.writeFileSync(
            path.join(outputDir, 'styles', `${componentName}.css`),
            result.component.css
          );
        }
        
        // Save HTML example
        if (result.component.html) {
          fs.writeFileSync(
            path.join(outputDir, 'examples', `${componentName}.html`),
            `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${componentName} Example</title>
  <link rel="stylesheet" href="../styles/${componentName}.css">
  <link rel="stylesheet" href="../styles/design-tokens.css">
</head>
<body>
  <div class="example-container">
    <h1>${componentName} Component</h1>
    <div class="example-content">
      ${result.component.html}
    </div>
  </div>
</body>
</html>`
          );
        }

        results.push({
          name: componentName,
          success: true,
          brandCompliance: result.brandCompliance?.score || 0,
          accessibilityScore: result.accessibility?.score || 'N/A',
          tokensUsed: result.brandCompliance?.tokensUsed?.length || 0
        });

        totalTokensUsed += result.brandCompliance?.tokensUsed?.length || 0;
        totalComponents++;
        
        console.log(`✅ ${componentName} generated successfully`);
        console.log(`   Brand Compliance: ${(result.brandCompliance?.score * 100 || 0).toFixed(1)}%`);
        console.log(`   Accessibility: ${result.accessibility?.score || 'N/A'}`);
        console.log(`   Tokens Used: ${result.brandCompliance?.tokensUsed?.length || 0}`);
        
      } else {
        console.log(`❌ Failed to generate ${config.name}`);
        results.push({
          name: config.name,
          success: false,
          error: result.error || 'Unknown error'
        });
      }
    } catch (error) {
      console.log(`❌ Error generating ${config.name}: ${error.message}`);
      results.push({
        name: config.name,
        success: false,
        error: error.message
      });
    }
    
    console.log('');
  }

  // Generate design tokens CSS
  const designTokensCSS = `/* Design Tokens - Generated for Component Library */
:root {
  /* Colors */
  --color-primary: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-contrast: #ffffff;
  --color-primary-alpha-20: rgba(59, 130, 246, 0.2);
  
  --color-secondary: #6b7280;
  --color-error: #ef4444;
  --color-error-alpha-20: rgba(239, 68, 68, 0.2);
  --color-success: #10b981;
  
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-surface: #ffffff;
  --color-surface-secondary: #f9fafb;
  --color-border: #e5e7eb;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  
  /* Animations */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  
  --easing-ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --easing-ease-in: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  --easing-ease-in-out: cubic-bezier(0.645, 0.045, 0.355, 1);
}

/* Base Styles */
* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  background: var(--color-surface);
  margin: 0;
}

/* Example Container Styles */
.example-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.example-content {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
}`;

  // Create examples directory
  const examplesDir = path.join(outputDir, 'examples');
  if (!fs.existsSync(examplesDir)) {
    fs.mkdirSync(examplesDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, 'styles', 'design-tokens.css'),
    designTokensCSS
  );

  // Generate summary report
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalComponents,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      averageBrandCompliance: results
        .filter(r => r.success)
        .reduce((avg, r) => avg + r.brandCompliance, 0) / totalComponents,
      totalTokensUsed
    },
    components: results
  };

  fs.writeFileSync(
    path.join(outputDir, 'generation-report.json'),
    JSON.stringify(report, null, 2)
  );

  // Generate index file
  const indexContent = `// Component Library Index - Generated by Agentic Phase 8
${results.filter(r => r.success).map(r => 
  `export { ${r.name} } from './components/${r.name}';`
).join('\n')}

// Re-export all components
export * from './components/Button';
export * from './components/Card'; 
export * from './components/Input';

// Component library metadata
export const COMPONENT_LIBRARY = {
  name: 'Agentic Component Library',
  version: '1.0.0',
  components: [${results.filter(r => r.success).map(r => `'${r.name}'`).join(', ')}],
  generatedAt: '${new Date().toISOString()}',
  brandCompliance: ${report.summary.averageBrandCompliance.toFixed(2)},
  accessibility: 'WCAG 2.1 AA'
};`;

  fs.writeFileSync(
    path.join(outputDir, 'index.ts'),
    indexContent
  );

  // Print final summary
  console.log('🎉 Component Generation Complete!\n');
  console.log('📊 Generation Summary:');
  console.log(`   Total Components: ${totalComponents}`);
  console.log(`   Successful: ${report.summary.successful}`);
  console.log(`   Failed: ${report.summary.failed}`);
  console.log(`   Average Brand Compliance: ${(report.summary.averageBrandCompliance * 100).toFixed(1)}%`);
  console.log(`   Total Design Tokens Used: ${totalTokensUsed}`);
  console.log(`\n📁 Generated Files:`);
  console.log(`   Components: ${path.join(outputDir, 'components')}`);
  console.log(`   Styles: ${path.join(outputDir, 'styles')}`);
  console.log(`   Examples: ${path.join(outputDir, 'examples')}`);
  console.log(`   Report: ${path.join(outputDir, 'generation-report.json')}`);
  console.log(`\n🚀 Next Steps:`);
  console.log(`   1. Review generated components in ${outputDir}`);
  console.log(`   2. Customize brand tokens in styles/design-tokens.css`);
  console.log(`   3. Test components by opening HTML examples`);
  console.log(`   4. Integrate components into your project`);
}

// Run the generation
if (require.main === module) {
  generateComponentLibrary().catch(console.error);
}

module.exports = { generateComponent, generateComponentLibrary };