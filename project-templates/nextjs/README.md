# Next.js Template - Agentic Design System

Production-ready Next.js template with full Agentic Design System integration, featuring server-side CSS enhancement, component generation API routes, and real-time design updates.

## Features

- ✅ **Server-side CSS Enhancement** at build time
- ✅ **API Routes** for component generation
- ✅ **TypeScript** support with full type safety
- ✅ **Brand Token Integration** via CSS-in-JS
- ✅ **Real-time Preview** with hot reload
- ✅ **Pattern Learning** integration
- ✅ **Accessibility Validation** built-in
- ✅ **Performance Optimized** with caching

## Quick Start

1. **Copy this folder** to your project location

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment** (create `.env.local`):
   ```env
   AGENTIC_API_URL=http://localhost:8901/api
   AGENTIC_BRAND_PACK_ID=western-companies
   ANTHROPIC_API_KEY=sk-ant-... # Optional, for AI features
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
nextjs/
├── app/                    # Next.js 13+ App Router
│   ├── layout.tsx         # Root layout with brand tokens
│   ├── page.tsx           # Home page with examples
│   ├── globals.css        # Global styles (enhanced at build)
│   └── api/
│       ├── enhance/       # CSS enhancement endpoint
│       │   └── route.ts
│       └── generate/      # Component generation endpoint
│           └── route.ts
├── lib/
│   ├── agentic.ts        # Agentic SDK wrapper
│   └── decision-engine.ts # AI decision logic
├── components/
│   ├── AgenticProvider.tsx    # Context provider
│   ├── EnhancedButton.tsx     # Example enhanced component
│   └── ComponentGenerator.tsx  # Generation UI
├── public/
├── package.json
├── next.config.js
├── tsconfig.json
└── .env.example
```

## API Routes

### POST /api/enhance
Enhance CSS with brand tokens and transformations:

```typescript
const response = await fetch('/api/enhance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    css: '.btn { color: red; }',
    options: {
      enableTypography: true,
      enableAnimations: true
    }
  })
});
```

### POST /api/generate
Generate components using AI:

```typescript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    description: 'Modern card with image and CTA',
    type: 'card',
    framework: 'react'
  })
});
```

## Server-Side Enhancement

CSS is automatically enhanced during build:

```typescript
// lib/agentic.ts
export async function enhanceStylesAtBuildTime(css: string) {
  const enhanced = await agenticServer.enhanceAdvanced(css, {
    enableTypography: true,
    enableAnimations: true,
    enableGradients: true,
    enableStates: true,
    enableOptimization: true
  });
  return enhanced.css;
}
```

## Component Examples

### Enhanced Button Component
```tsx
import { useAgentic } from '@/components/AgenticProvider';

export function EnhancedButton({ children, variant = 'primary' }) {
  const { tokens } = useAgentic();
  
  return (
    <button
      style={{
        background: tokens.colors[variant],
        padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
        borderRadius: tokens.radii.md
      }}
    >
      {children}
    </button>
  );
}
```

### Component Generator
```tsx
import { ComponentGenerator } from '@/components/ComponentGenerator';

export default function GeneratePage() {
  return (
    <ComponentGenerator
      onGenerate={async (description) => {
        const response = await fetch('/api/generate', {
          method: 'POST',
          body: JSON.stringify({ description })
        });
        return response.json();
      }}
    />
  );
}
```

## Decision Engine

The decision engine helps AI agents choose optimal strategies:

```typescript
import { DesignDecisionEngine } from '@/lib/decision-engine';

const engine = new DesignDecisionEngine();

// Automatic endpoint selection
const strategy = await engine.selectEnhancementStrategy({
  isProduction: true,
  needsCaching: true,
  hasTimeConstraint: false
});

// Quality validation
const isValid = await engine.validateEnhancement(result);
```

## Brand Token Integration

Brand tokens are automatically loaded and available:

### In CSS
```css
.button {
  background: var(--color-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
}
```

### In Components
```tsx
import { tokens } from '@/lib/agentic';

<div style={{
  color: tokens.colors.primary,
  fontSize: tokens.typography.sizes.lg
}} />
```

## Pattern Learning

The system learns from your code patterns:

```typescript
// Automatically tracks pattern usage
await trackPatternUsage('button', 'primary-cta');

// Get learned patterns
const patterns = await getLearnedPatterns();

// Submit feedback
await submitFeedback('pattern-id', 'positive', {
  context: 'worked-well'
});
```

## Performance Optimization

### Build-time Enhancement
- CSS enhanced during build for zero runtime overhead
- Static generation for component templates
- Optimized bundle with tree shaking

### Runtime Caching
- Enhanced CSS cached in memory
- Pattern learning results cached
- API responses cached with SWR

### Edge Functions
Deploy API routes as edge functions for global performance:

```javascript
// next.config.js
module.exports = {
  experimental: {
    runtime: 'edge'
  }
};
```

## Deployment

### Vercel (Recommended)
```bash
vercel
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci --only=production
RUN npm run build
CMD ["npm", "start"]
```

### Environment Variables
Required for production:
- `AGENTIC_API_URL` - Agentic API endpoint
- `AGENTIC_BRAND_PACK_ID` - Brand pack identifier
- `ANTHROPIC_API_KEY` - For AI generation (optional)

## TypeScript Support

Full TypeScript definitions included:

```typescript
interface AgenticConfig {
  brandPackId: string;
  apiUrl: string;
  qualityGates: QualityGates;
}

interface EnhancementResult {
  css: string;
  changes: Change[];
  brandCompliance: ComplianceScore;
  accessibility: AccessibilityReport;
}

interface ComponentGenerationResult {
  component: GeneratedComponent;
  brandCompliance: ComplianceScore;
  alternatives: ComponentVariation[];
}
```

## Testing

```bash
# Run tests
npm test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

## Troubleshooting

### API Connection Issues
- Verify Agentic server is running on port 8901
- Check CORS configuration
- Validate API key if using AI features

### Build Errors
- Clear `.next` cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

### Performance Issues
- Enable caching in production
- Use CDN for static assets
- Implement incremental static regeneration

## License

MIT