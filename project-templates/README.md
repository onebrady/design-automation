# AI Agent Starter Framework - Project Templates

🎯 **Purpose**: Minimal starter templates that AI agents copy to NEW project locations to automatically get design system enhancement for any HTML/CSS they create.

## What This Is

**Blank starter templates** with Agentic Design System pre-connected. AI agents can:

1. **Copy to new location** 
2. **Create ANY HTML/CSS** 
3. **Everything gets enhanced automatically**

No demo content to delete. Just start building.

## What's Included

- ✅ **Minimal HTML skeleton** - Just the connection to Agentic
- ✅ **Empty CSS files** - Ready for your styles  
- ✅ **Full API client** (`agentic-client.js`) - All 59 endpoints ready
- ✅ **Auto-enhancement** - CSS transforms automatically
- ✅ **Decision framework** (`AGENT_INSTRUCTIONS.md`) - When to use each API
- ✅ **Quality validation** - Brand compliance & accessibility checks

## Quick Start

1. **Copy entire folder** to new project:
   ```bash
   cp -r project-templates/* /my-new-website/
   ```

2. **Choose your template**:
   - `static-html/` - For simple websites
   - `nextjs/` - For React applications

3. **Start building** - Create your HTML/CSS normally

4. **Automatic enhancement** - Everything you write gets brand tokens:
   - Colors → Brand colors
   - Spacing → Design system spacing
   - Typography → Scale system
   - States → Enhanced interactions

## Folder Structure

```
project-templates/
├── AGENT_INSTRUCTIONS.md          # 🧠 CRITICAL: Complete AI decision framework
├── .agentic/
│   └── config.json                # Default configuration with quality gates
├── static-html/                   # Template for static websites
│   ├── README.md                  # Setup instructions
│   ├── index.html                 # Demo page with real API calls
│   ├── css/
│   │   ├── main.css              # CSS to be enhanced
│   │   └── brand-tokens.css      # Auto-loaded brand tokens
│   └── js/
│       └── agentic-client.js     # Complete API client (all 59 endpoints)
└── nextjs/                        # Template for React/Next.js apps
    ├── README.md                  # Setup instructions
    ├── package.json               # Dependencies
    ├── next.config.js            # Next.js config with CSS enhancement
    ├── tsconfig.json             # TypeScript config
    ├── .env.example              # Environment variables
    ├── lib/
    │   ├── agentic.ts            # Server/client SDK
    │   └── decision-engine.ts    # Intelligent decision logic
    └── app/                      # Next.js app directory
```

## Key Features for AI Agents

### 1. Decision Intelligence (AGENT_INSTRUCTIONS.md)

The master instruction document provides:
- **Decision trees** for all 59 API endpoints
- **Quality thresholds** (brand compliance >0.8, accessibility AA)
- **Performance optimization** strategies
- **Error handling** patterns
- **Common workflows** with code examples

### 2. Real API Integration

Both templates include **working API calls** to localhost:8901:

```javascript
// Static HTML - Direct fetch
const enhanced = await agentic.enhanceCSS(css);
const component = await agentic.generateComponent(description);

// Next.js - Server and client
const result = await agenticServer.enhanceAdvanced(css);
const component = await agenticClient.generateComponent(request);
```

### 3. Quality Gates

Automatic validation ensures quality:

```json
{
  "qualityGates": {
    "minBrandCompliance": 0.8,
    "minAccessibilityScore": "AA",
    "maxChangesPerFile": 50,
    "requireValidation": true
  }
}
```

### 4. Pattern Learning

System learns from existing code:

```javascript
// Learns patterns automatically
await batchLearnPatterns(patterns);
// Gets intelligent suggestions
const suggestions = await getSuggestions(code);
```

## How AI Agents Should Use This

### Step 1: Detect Project Type

```javascript
if (hasPackageJson && hasReactDependency) {
  useTemplate('nextjs');
} else {
  useTemplate('static-html');
}
```

### Step 2: Copy Template

```bash
cp -r project-templates/[template-type]/* /new-project-location/
cp project-templates/.agentic /new-project-location/
cp project-templates/AGENT_INSTRUCTIONS.md /new-project-location/
```

### Step 3: Follow Decision Framework

Use AGENT_INSTRUCTIONS.md to determine:
- Which endpoints to call
- What order to call them
- How to validate results
- When to use caching
- How to handle errors

### Step 4: Enhance Existing Code

```javascript
// For any CSS file
const enhanced = await enhanceCSS(originalCSS);
if (enhanced.brandCompliance.score > 0.8) {
  applyChanges(enhanced.css);
}
```

### Step 5: Generate New Components

```javascript
// When user needs a new component
const component = await generateComponent({
  description: userRequest,
  componentType: detectType(userRequest),
  framework: projectFramework
});
```

## API Endpoint Categories

### System Health (4 endpoints)
- `GET /api/health` - Check system status
- `GET /api/context` - Get project context
- `GET /api/project-config` - Get configuration
- `GET /api/lock` - Get lock file

### CSS Enhancement (6 endpoints)
- `POST /api/design/enhance` - Basic enhancement (7ms)
- `POST /api/design/enhance-cached` - With caching (5ms)
- `POST /api/design/enhance-advanced` - All transformations (19ms)
- `POST /api/design/analyze` - Analysis only (1ms)
- `POST /api/design/suggest-proactive` - Get suggestions (1ms)
- `POST /api/design/optimize` - Minification (2ms)

### Component Generation (7 endpoints)
- `POST /api/design/generate-component` - AI generation (14s)
- `GET /api/design/templates` - List templates (2ms)
- `POST /api/design/customize-template` - Customize (fast)
- `POST /api/design/preview-component` - Preview
- `POST /api/design/create-sandbox` - Interactive sandbox
- `POST /api/design/visual-diff` - Compare versions (1ms)
- `GET /api/design/sandbox-stats` - Statistics (1ms)

### Pattern Learning (6 endpoints)
- `GET /api/design/patterns/:projectId` - Get patterns (387ms)
- `GET /api/design/patterns/:projectId/correlations` - Correlations (8ms)
- `POST /api/design/patterns/:projectId/batch-learn` - Learn (44ms)
- `POST /api/design/feedback` - Submit feedback
- `POST /api/design/suggest-improvements` - Get improvements
- `POST /api/design/patterns/track` - Track usage (2ms)

### Layout Intelligence (7 endpoints)
- `POST /api/layout/analyze` - Analyze layout (37ms)
- `POST /api/layout/apply-template` - Apply template (1ms)
- `GET /api/layout/templates` - List templates (1ms)
- `POST /api/layout/generate-grid` - Generate grid (2ms)
- `POST /api/layout/grid-recommendations` - Get recommendations
- `POST /api/layout/template-matches` - Find matches
- `POST /api/layout/flexbox-analysis` - Analyze flexbox

### Semantic Analysis (14 endpoints)
- `POST /api/semantic/analyze` - Full analysis (29ms)
- `POST /api/semantic/quick-accessibility-check` - Quick check (6ms)
- `POST /api/semantic/generate-aria` - Generate ARIA (5ms)
- `POST /api/semantic/accessibility-report` - Full report (6ms)
- Plus 10 more for components, scoring, recommendations

### Advanced Transformations (7 endpoints)
- `POST /api/design/enhance-typography` - Typography (7ms)
- `POST /api/design/enhance-animations` - Animations (5ms)
- `POST /api/design/enhance-gradients` - Gradients (6ms)
- `POST /api/design/enhance-states` - States (5ms)
- `POST /api/design/enhance-batch` - Batch processing (11ms)

### Brand Packs (8 endpoints)
- `GET /api/brand-packs` - List packs (5ms)
- `GET /api/brand-packs/:id` - Get pack (8ms)
- `GET /api/brand-packs/:id/export/css` - Export CSS (5ms)
- `GET /api/brand-packs/:id/export/json` - Export JSON (5ms)
- `POST /api/brand-packs/generate-from-logo` - From logo (24s)

## Performance Guidelines

### Response Times
- **Instant** (1-5ms): Analysis, templates, cached ops
- **Fast** (6-10ms): Basic enhancement, semantic checks
- **Moderate** (11-50ms): Batch operations, layout analysis
- **Slow** (14-24s): AI generation, logo analysis

### Optimization Strategies
1. Use cached endpoints for repeated operations
2. Batch process multiple files
3. Run independent calls in parallel
4. Cache results client-side

## Quality Validation

Every operation should be validated:

```javascript
const result = await enhance(css);

// Check brand compliance
if (result.brandCompliance.score < 0.8) {
  // Revert or request manual review
}

// Check accessibility
if (result.accessibility.score < 'AA') {
  // Address issues before proceeding
}

// Check changes
if (result.changes.length > 50) {
  // Too many changes, review needed
}
```

## Error Handling

Graceful degradation when service unavailable:

```javascript
try {
  const enhanced = await enhance(css);
  return enhanced.css;
} catch (error) {
  console.warn('Using original CSS, service unavailable');
  return originalCSS;
}
```

## Success Metrics

AI agents should track:
- Brand compliance scores (target: >0.8)
- Accessibility ratings (target: AA or better)
- Cache hit rates (target: >70%)
- Response times (target: <100ms for cached)
- Pattern learning confidence (target: >0.7)

## Support

- **API Documentation**: `/docs/api/*.md`
- **System Health**: `http://localhost:8901/api/health`
- **Context Check**: `http://localhost:8901/api/context`

This framework enables AI agents to create production-ready, brand-compliant, accessible frontend projects automatically. Simply copy, configure, and let the system handle the design intelligence.