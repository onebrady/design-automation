# Phase 8 React Integration Example

This example demonstrates how to integrate Phase 8 AI-Driven Design Automation features into a React application.

## Features Demonstrated

- 🤖 **AI Component Generation** - Generate React components from descriptions
- 🧠 **Pattern Learning** - Learn and apply design patterns automatically
- 👁️ **Visual Preview** - Real-time component preview with hot reload
- 📐 **Layout Intelligence** - Intelligent layout generation and optimization
- 🔍 **Semantic Understanding** - Component accessibility analysis
- ⚡ **Advanced Transformations** - CSS optimization with design tokens
- 🔄 **Real-time Integration** - WebSocket updates and VS Code extension

## Quick Start

### 1. Prerequisites

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### 2. Configure Environment

Edit `.env.local`:

```bash
# Required for AI component generation
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here

# Agentic server URLs
VITE_AGENTIC_API_URL=http://localhost:8901
VITE_AGENTIC_WS_URL=ws://localhost:8902

# MongoDB (for pattern learning)
VITE_MONGO_URI=mongodb://localhost:27017
VITE_MONGO_DB=agentic_design
```

### 3. Start Agentic Server

```bash
# In the project root directory
npm run start:server
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Open Application

Visit [http://localhost:5173](http://localhost:5173) to see the React app with Phase 8 integration.

## Project Structure

```
react-integration/
├── src/
│   ├── components/          # Generated and custom React components
│   │   ├── ui/             # AI-generated UI components
│   │   ├── layout/         # Layout components
│   │   └── features/       # Feature-specific components
│   ├── hooks/              # Custom React hooks for Agentic integration
│   ├── styles/             # CSS files with design tokens
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript type definitions
├── scripts/                # Automation scripts
├── public/                 # Static assets
└── docs/                  # Documentation
```

## Usage Examples

### Component Generation

Generate React components using AI:

```typescript
import { useAgenticGeneration } from './hooks/useAgentic';

function ComponentGenerator() {
  const { generateComponent, loading } = useAgenticGeneration();
  
  const handleGenerate = async () => {
    const result = await generateComponent({
      description: "A modern card component with image and action buttons",
      componentType: "card",
      framework: "react",
      style: "modern"
    });
    
    console.log(result.component.jsx); // Generated React component
  };
  
  return (
    <button onClick={handleGenerate} disabled={loading}>
      {loading ? 'Generating...' : 'Generate Component'}
    </button>
  );
}
```

### Pattern Learning Integration

Learn from existing components and get suggestions:

```typescript
import { usePatternLearning } from './hooks/useAgentic';

function PatternLearningDemo() {
  const { learnPatterns, getSuggestions } = usePatternLearning();
  
  useEffect(() => {
    // Learn patterns from existing components
    learnPatterns({
      patterns: ['components', 'utilities'],
      threshold: 0.8
    });
  }, []);
  
  const analyzeComponent = async (cssCode: string) => {
    const suggestions = await getSuggestions({
      code: cssCode,
      context: { componentType: 'button' }
    });
    
    return suggestions; // AI-powered improvement suggestions
  };
}
```

### Advanced CSS Transformations

Apply comprehensive CSS enhancements:

```typescript
import { useAdvancedTransformations } from './hooks/useAgentic';

function StyleEnhancer() {
  const { enhanceCSS, enhanceAdvanced } = useAdvancedTransformations();
  
  const enhanceStyles = async (cssCode: string) => {
    const result = await enhanceAdvanced({
      code: cssCode,
      options: {
        enableTypography: true,
        enableAnimations: true,
        enableGradients: true,
        enableStates: true,
        enableOptimization: true
      }
    });
    
    return {
      enhancedCSS: result.css,
      changes: result.changes,
      transformations: result.transformations,
      analytics: result.analytics
    };
  };
}
```

### Real-time WebSocket Integration

Connect to real-time enhancement updates:

```typescript
import { useAgenticWebSocket } from './hooks/useAgentic';

function RealtimeIntegration() {
  const { 
    isConnected, 
    sendMessage, 
    subscribe 
  } = useAgenticWebSocket('ws://localhost:8902');
  
  useEffect(() => {
    // Subscribe to enhancement updates
    const unsubscribe = subscribe('enhancement:complete', (data) => {
      console.log('Enhancement completed:', data);
    });
    
    return unsubscribe;
  }, []);
  
  const requestEnhancement = (code: string) => {
    sendMessage({
      type: 'enhancement:request',
      code,
      filePath: 'src/styles/components.css',
      requestId: crypto.randomUUID()
    });
  };
}
```

## Custom Hooks

### useAgenticGeneration

```typescript
export function useAgenticGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const generateComponent = async (options: GenerationOptions) => {
    setLoading(true);
    try {
      const response = await fetch('/api/design/generate-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
      
      const result = await response.json();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return { generateComponent, loading, error };
}
```

### usePatternLearning

```typescript
export function usePatternLearning() {
  const learnPatterns = async (options: PatternOptions) => {
    // Implementation for pattern learning
  };
  
  const getSuggestions = async (code: string) => {
    // Implementation for getting suggestions
  };
  
  return { learnPatterns, getSuggestions };
}
```

## Scripts

### Generate Components

```bash
npm run generate
```

Runs the AI component generation script to create new components based on predefined specifications.

### Enhance Styles

```bash
npm run enhance
```

Applies advanced transformations to all CSS files in the project.

### Analyze Patterns

```bash  
npm run analyze
```

Analyzes existing code patterns and generates improvement suggestions.

## VS Code Integration

### 1. Install Extension

```bash
code --install-extension agentic.design-assistant
```

### 2. Configure Settings

Add to your VS Code `settings.json`:

```json
{
  "agentic.enabled": true,
  "agentic.autoEnhancement": true,
  "agentic.serverUrl": "http://localhost:8901",
  "agentic.websocketUrl": "ws://localhost:8902",
  "agentic.showInlineHints": true,
  "agentic.projectPath": "${workspaceFolder}"
}
```

### 3. Available Commands

- **Generate Component**: `Ctrl+Shift+P` → "Agentic: Generate Component"
- **Enhance File**: `Ctrl+Shift+P` → "Agentic: Enhance File"
- **Preview Changes**: `Ctrl+Shift+P` → "Agentic: Preview Enhancement"

## Performance Optimization

### Lazy Loading

Components are lazy-loaded to improve performance:

```typescript
const LazyComponentGenerator = lazy(() => import('./ComponentGenerator'));
const LazyPatternAnalyzer = lazy(() => import('./PatternAnalyzer'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponentGenerator />
      <LazyPatternAnalyzer />
    </Suspense>
  );
}
```

### Caching

Enable caching for better performance:

```typescript
const agenticConfig = {
  caching: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100 // Maximum cached items
  }
};
```

## Testing

### Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { ComponentGenerator } from './ComponentGenerator';

test('generates component on button click', async () => {
  render(<ComponentGenerator />);
  
  const generateButton = screen.getByText('Generate Component');
  fireEvent.click(generateButton);
  
  await waitFor(() => {
    expect(screen.getByText('Component generated!')).toBeInTheDocument();
  });
});
```

### Integration Testing

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

Set production environment variables:

```bash
VITE_AGENTIC_API_URL=https://api.yourdomain.com
VITE_AGENTIC_WS_URL=wss://ws.yourdomain.com
```

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   ```bash
   # Check if WebSocket server is running
   curl -I http://localhost:8902
   ```

2. **Component Generation Timeout**
   ```bash
   # Check Claude API key
   echo $VITE_ANTHROPIC_API_KEY
   ```

3. **Pattern Learning Low Accuracy**
   ```bash
   # Increase training data
   npm run analyze -- --threshold=100
   ```

### Debug Mode

Enable debug logging:

```bash
DEBUG=agentic:* npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your integration example
4. Include tests and documentation
5. Submit a pull request

## Resources

- [Phase 8 API Documentation](../../docs/api/phase8-endpoints.md)
- [Migration Guide](../../docs/migration-guide-phase8.md)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=agentic.design-assistant)
- [GitHub Discussions](https://github.com/agentic/design-platform/discussions)

## License

MIT License - see [LICENSE](../../../LICENSE) for details.