# Phase 8 Examples

This directory contains comprehensive examples and integration guides for Phase 8 AI-Driven Design Automation.

## Examples Overview

### 🔧 Integration Examples
- **[React Integration](./react-integration/)** - Complete React app with Phase 8 features
- **[Next.js Integration](./nextjs-integration/)** - Next.js project with SSR and Phase 8
- **[Real-time Integration](./real-time-integration/)** - WebSocket and VS Code extension setup

### 🤖 Feature Examples  
- **[Component Generation](./component-generation/)** - AI-powered component creation
- **[Pattern Learning](./pattern-learning/)** - Machine learning design patterns
- **[Advanced Transformations](./advanced-transformations/)** - CSS optimization examples

### 📚 Use Cases
- **E-commerce Design System** - Complete design system for online stores
- **SaaS Dashboard Components** - Modern dashboard UI components
- **Marketing Website Kit** - Landing page and marketing components

## Quick Start

Choose an example that matches your tech stack:

### React + Vite
```bash
cd examples/phase8-examples/react-integration
npm install
npm run dev
```

### Next.js
```bash
cd examples/phase8-examples/nextjs-integration  
npm install
npm run dev
```

### Component Generation
```bash
cd examples/phase8-examples/component-generation
node generate-components.js
```

## Example Structure

Each example includes:

- **📁 `/src`** - Source code with Phase 8 integration
- **📁 `/docs`** - Documentation and guides  
- **📄 `package.json`** - Dependencies and scripts
- **📄 `agentic.config.js`** - Phase 8 configuration
- **📄 `README.md`** - Setup and usage instructions

## Prerequisites

- Node.js 20+
- MongoDB (for pattern learning)
- Claude API key (for component generation)
- VS Code (for real-time integration)

## Environment Setup

Create a `.env` file in each example:

```bash
# Required for component generation
ANTHROPIC_API_KEY=sk-ant-your-key-here

# MongoDB connection
AGENTIC_MONGO_URI=mongodb://localhost:27017
AGENTIC_DB_NAME=agentic_design

# Optional: Custom server ports
PORT=8901
AGENTIC_WEBSOCKET_PORT=8902
```

## Running Examples

### 1. Start Agentic Server
```bash
# In the root directory
npm run start:server
```

### 2. Run Example
```bash
# In any example directory
npm install
npm run dev
```

### 3. Open VS Code (Optional)
```bash
# Install VS Code extension
code --install-extension agentic.design-assistant

# Open example with extension support
code ./examples/phase8-examples/react-integration
```

## Features Demonstrated

### Component Generation
- AI-powered component creation from descriptions
- Brand token integration
- Framework-specific output (React, Vue, HTML)
- Accessibility enhancements

### Pattern Learning
- Automatic design pattern detection
- Improvement suggestions based on learned patterns
- Feedback loop integration
- Pattern confidence scoring

### Visual Preview
- Real-time preview with hot reload
- Visual diff comparison
- Responsive design testing
- Component isolation

### Layout Intelligence
- CSS Grid generation
- Flexbox optimization
- Responsive layout analysis
- Layout template matching

### Semantic Understanding
- Component type detection
- Accessibility analysis
- ARIA enhancement generation
- Semantic scoring

### Advanced Transformations
- Typography scale system
- Animation token integration
- Gradient optimization
- State variation management
- CSS optimization and minification

## API Examples

### Component Generation
```javascript
import { generateComponent } from '@agentic/sdk';

const button = await generateComponent({
  description: "A primary button with loading state",
  componentType: "button",
  framework: "react",
  style: "modern"
});

console.log(button.component.jsx);
```

### Pattern Learning
```javascript
import { learnPatterns, getSuggestions } from '@agentic/sdk';

// Learn from project
await learnPatterns({ 
  projectPath: process.cwd(),
  patterns: ['components', 'utilities']
});

// Get suggestions
const suggestions = await getSuggestions({
  code: '.btn { background: red; }',
  context: { componentType: 'button' }
});
```

### Advanced Transformations
```javascript  
import { enhanceAdvanced } from '@agentic/sdk';

const result = await enhanceAdvanced({
  code: 'h1 { font-size: 32px; color: #ff0000; }',
  options: {
    enableTypography: true,
    enableStates: true,
    enableOptimization: true
  }
});

console.log(result.transformations);
```

## Performance Benchmarks

Each example includes performance benchmarks:

- **Component Generation**: ~2-3 seconds per component
- **Pattern Learning**: ~100ms for suggestions
- **Visual Preview**: <50ms hot reload
- **Advanced Transformations**: <100ms for typical CSS files
- **WebSocket Latency**: <10ms for real-time updates

## Browser Support

- Chrome 90+
- Firefox 88+  
- Safari 14+
- Edge 90+

## Contributing

To contribute new examples:

1. Fork the repository
2. Create example in `examples/phase8-examples/your-example/`
3. Include complete setup and documentation
4. Submit pull request

## Support

- **Issues**: [GitHub Issues](https://github.com/agentic/design-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/agentic/design-platform/discussions)
- **Discord**: [Agentic Design Discord](https://discord.gg/agentic-design)

## License

All examples are MIT licensed. See individual example directories for specific license information.