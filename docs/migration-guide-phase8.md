# Phase 8 Migration Guide

This guide helps you migrate existing projects to Phase 8 AI-Driven Design Automation features.

## Overview

Phase 8 introduces powerful new capabilities while maintaining full backward compatibility:

- ✅ **Existing projects continue to work without changes**
- ✅ **All existing APIs remain functional**
- ✅ **Gradual adoption - enable features as needed**
- ✅ **Automated migration tools available**

## What's New in Phase 8

### 🤖 AI-Powered Component Generation
Generate UI components from natural language descriptions using Claude AI.

### 🧠 Pattern Learning Engine
Machine learning system that learns your design patterns and suggests improvements.

### 👁️ Visual Preview System  
Real-time preview with hot reload and visual diff comparison.

### 📐 Layout Intelligence
Intelligent layout analysis and responsive design generation.

### 🔍 Semantic Understanding
Advanced component detection, accessibility analysis, and ARIA generation.

### ⚡ Advanced Transformations
Enhanced CSS processing with typography scales, animations, gradients, and state management.

## Migration Paths

### Path 1: Gradual Enhancement (Recommended)

Start using Phase 8 features incrementally without changing existing code.

#### Step 1: Update Dependencies

```bash
npm install @agentic/design-platform@latest
# or
pnpm install @agentic/design-platform@latest
```

#### Step 2: Configure Your Project

Add Phase 8 configuration to your `package.json`:

```json
{
  "agentic": {
    "brandPackId": "your-brand-pack-id",
    "brandVersion": "latest",
    "features": {
      "componentGeneration": true,
      "patternLearning": true,
      "visualPreview": true,
      "layoutIntelligence": true,
      "semanticUnderstanding": true,
      "advancedTransformations": true
    }
  }
}
```

#### Step 3: Try Component Generation

Start by generating a simple component:

```javascript
const { generateComponent } = require('@agentic/sdk');

const result = await generateComponent({
  description: "A modern primary button with hover effects",
  componentType: "button",
  framework: "react"
});

console.log(result.component.jsx);
// <Button variant="primary" size="medium">Click me</Button>
```

#### Step 4: Enable Advanced Transformations

Enhance your existing CSS with new transformation capabilities:

```javascript
const { enhanceAdvanced } = require('@agentic/sdk');

const result = await enhanceAdvanced({
  code: `
    h1 { font-size: 32px; color: #FF0000; }
    .btn { padding: 12px 24px; border-radius: 8px; }
  `,
  options: {
    enableTypography: true,
    enableStates: true,
    enableOptimization: true
  }
});

console.log(result.css);
// Optimized CSS with design tokens and state variations
```

### Path 2: Full Migration

Migrate your entire design system to leverage all Phase 8 capabilities.

#### Step 1: Analyze Your Current System

Run the migration analyzer to understand your current design patterns:

```bash
npx @agentic/cli analyze --project ./
```

This generates a report showing:
- Existing design patterns
- Brand token opportunities  
- Component standardization suggestions
- Accessibility improvements needed

#### Step 2: Generate Missing Components

Use AI to generate components that follow your brand guidelines:

```bash
# Generate a complete component library
npx @agentic/cli generate --type=library --style=modern --output=./src/components
```

#### Step 3: Apply Advanced Transformations

Batch process all your CSS files:

```bash
# Transform all CSS files with advanced features
npx @agentic/cli transform --input=./src/styles --output=./src/styles-enhanced
```

#### Step 4: Enable Real-time Integration

Set up VS Code extension and WebSocket integration:

```bash
# Install VS Code extension
code --install-extension agentic.design-assistant

# Enable WebSocket server
npm run start:realtime
```

### Path 3: New Project Setup

Starting a new project with full Phase 8 integration.

#### Step 1: Create Project with Template

```bash
npx create-agentic-app my-project --template=phase8-modern
cd my-project
```

#### Step 2: Configure Brand Pack

```bash
# Generate AI brand pack from description
npx @agentic/cli brand-pack create \
  --name="Modern SaaS" \
  --style="clean, modern, trustworthy" \
  --colors="blue primary, gray neutral, green success"
```

#### Step 3: Generate Component System

```bash
# Generate complete design system
npx @agentic/cli generate design-system \
  --components="button,card,form,navigation,modal,table" \
  --framework=react \
  --style=modern
```

## Feature-by-Feature Migration

### Component Generation

#### Before Phase 8:
```javascript
// Manual component creation
const Button = ({ children, variant }) => (
  <button className={`btn btn-${variant}`}>
    {children}
  </button>
);
```

#### With Phase 8:
```javascript
// AI-generated component with full functionality
const result = await generateComponent({
  description: "Primary button with loading state and accessibility features",
  componentType: "button",
  framework: "react"
});

// Automatically includes:
// - Proper accessibility attributes
// - Loading states
// - Hover/focus/active states  
// - Brand token integration
// - TypeScript definitions
```

### Pattern Learning

#### Enable Pattern Learning:

```javascript
// Add to your build process
const { learnPatterns } = require('@agentic/sdk');

// Learn from existing code
await learnPatterns({
  projectPath: process.cwd(),
  patterns: ['components', 'layouts', 'utilities']
});
```

#### Get Suggestions:

```javascript
const suggestions = await getSuggestions({
  code: '.custom-button { ... }',
  context: { componentType: 'button' }
});

// Returns AI-powered improvement suggestions
// based on learned patterns
```

### Visual Preview Integration

#### Add to Your Development Server:

```javascript
// In your webpack.config.js or vite.config.js
const { createPreviewMiddleware } = require('@agentic/preview');

module.exports = {
  // ... other config
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      middlewares.unshift({
        name: 'agentic-preview',
        middleware: createPreviewMiddleware({
          projectPath: __dirname
        })
      });
      return middlewares;
    }
  }
};
```

### Layout Intelligence

#### Analyze Existing Layouts:

```javascript
const { analyzeLayout } = require('@agentic/sdk');

const analysis = await analyzeLayout({
  html: document.documentElement.outerHTML,
  css: getAllStyles()
});

console.log(analysis.recommendations);
// AI suggestions for layout improvements
```

#### Generate Responsive Layouts:

```javascript
const layout = await generateLayout({
  type: 'dashboard',
  sections: ['header', 'sidebar', 'main', 'footer'],
  responsive: true
});

// Returns complete CSS Grid/Flexbox system
```

### Semantic Understanding

#### Analyze Component Accessibility:

```javascript
const { analyzeAccessibility } = require('@agentic/sdk');

const analysis = await analyzeAccessibility({
  html: '<button>Click me</button>'
});

console.log(analysis.score); // "A" grade
console.log(analysis.issues); // Accessibility issues found
console.log(analysis.enhancements); // ARIA improvements
```

#### Auto-generate ARIA:

```javascript
const enhanced = await generateAriaEnhancements({
  html: '<div class="modal">...</div>',
  componentType: 'modal'
});

// Automatically adds proper ARIA attributes
```

## Breaking Changes

Phase 8 maintains backward compatibility, but be aware of these changes:

### Configuration Format

**Old format (still supported):**
```json
{
  "agentic": {
    "brandPackId": "brand-1"
  }
}
```

**New format (recommended):**
```json
{
  "agentic": {
    "brandPackId": "brand-1",
    "brandVersion": "latest",
    "features": {
      "componentGeneration": true
    }
  }
}
```

### API Response Format

Some endpoints now include additional metadata:

```javascript
// Phase 7 response
{
  "code": "enhanced CSS",
  "changes": []
}

// Phase 8 response (backward compatible)
{
  "code": "enhanced CSS", 
  "changes": [],
  // New fields
  "transformations": [],
  "analytics": {},
  "recommendations": []
}
```

### Environment Variables

New optional environment variables:

```bash
# Enable Phase 8 features
AGENTIC_PHASE_8_FEATURES=true

# Claude AI API key for component generation
ANTHROPIC_API_KEY=sk-ant-...

# WebSocket server port (default: 8902)  
AGENTIC_WEBSOCKET_PORT=8902
```

## Performance Considerations

### Caching

Phase 8 includes advanced caching:

```javascript
// Configure caching
const { enhanceAdvanced } = require('@agentic/sdk');

const result = await enhanceAdvanced({
  code: '...',
  options: {
    enableCaching: true,
    cacheKey: 'custom-key' // Optional
  }
});

console.log(result.cacheHit); // true/false
```

### Batch Processing

Process multiple files efficiently:

```javascript
const { batchEnhance } = require('@agentic/sdk');

const results = await batchEnhance({
  files: [
    { path: 'main.css', code: '...' },
    { path: 'components.css', code: '...' }
  ],
  options: { enableOptimization: true }
});

console.log(results.summary.totalSavings); // Bytes saved
```

### Resource Usage

Monitor resource usage:

```javascript
const analytics = await getAnalytics();

console.log(analytics.performance);
// {
//   averageProcessingTime: 45,
//   cacheEfficiency: 0.85,
//   errorRate: 0.02
// }
```

## VS Code Integration

### Install Extension

```bash
code --install-extension agentic.design-assistant
```

### Configure Settings

Add to your VS Code `settings.json`:

```json
{
  "agentic.enabled": true,
  "agentic.autoEnhancement": false,
  "agentic.serverUrl": "http://localhost:8901",
  "agentic.websocketUrl": "ws://localhost:8902",
  "agentic.showInlineHints": true
}
```

### Available Commands

- `Ctrl+Shift+P` → "Agentic: Enhance File"
- `Ctrl+Shift+P` → "Agentic: Preview Enhancement"  
- `Ctrl+Shift+P` → "Agentic: Generate Component"
- `Ctrl+Shift+P` → "Agentic: Show Project Context"

## Troubleshooting

### Common Issues

#### 1. Component Generation Not Working

```bash
# Check Claude API key
echo $ANTHROPIC_API_KEY

# Test API connection
npx @agentic/cli test-ai
```

#### 2. Pattern Learning Low Accuracy

```bash
# Increase training data
npx @agentic/cli patterns train --files="src/**/*.css" --threshold=100

# Reset and retrain
npx @agentic/cli patterns reset && npx @agentic/cli patterns train
```

#### 3. WebSocket Connection Issues

```bash
# Check WebSocket server
curl -I http://localhost:8902

# Restart services
npm run start:realtime
```

#### 4. Performance Issues

```bash
# Enable caching
export AGENTIC_ENABLE_CACHE=true

# Check cache statistics  
npx @agentic/cli cache stats
```

### Debug Mode

Enable debug logging:

```bash
DEBUG=agentic:* npm run start:server
```

### Support

- **GitHub Issues**: https://github.com/agentic/design-platform/issues
- **Discord**: https://discord.gg/agentic-design
- **Documentation**: https://docs.agentic.design/phase-8

## Examples

### Complete Migration Example

See the `/examples/phase8-migration/` directory for:

- Before/after project structure
- Complete component library migration
- Performance benchmarks
- Real-world use cases

### Integration Examples

- **React**: `/examples/react-integration/`
- **Vue**: `/examples/vue-integration/`
- **Next.js**: `/examples/nextjs-integration/`
- **Vite**: `/examples/vite-integration/`

## Roadmap

### Phase 8.1 (Next Release)
- Advanced component variants
- Multi-brand support  
- Enhanced performance
- More AI model options

### Phase 9 (Future)
- Visual design tools
- Figma integration
- Advanced animations
- Team collaboration features

Ready to start your Phase 8 migration? Choose your migration path and follow the steps above. For questions, consult the troubleshooting section or reach out to our support team.