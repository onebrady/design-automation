# AGENTS.md — Level 3 Design Intelligence Protocol

## Seamless Automation

This project uses intelligent design automation with pattern learning and caching.

### For AI Agents:

- **No Manual API Calls Required**: The system automatically detects your work and applies optimizations
- **Transparent Enhancement**: Your generated code is automatically enhanced with brand compliance and best practices
- **Pattern Learning**: The system learns from your design patterns to provide better suggestions over time
- **Instant Caching**: Previously enhanced components are instantly re-optimized

### Key Features:

- **Automatic Brand Detection**: System knows which brand pack to use for this project (`western-companies`)
- **Intelligent Suggestions**: Proactive recommendations based on your usage patterns
- **Performance Optimization**: Cached results for instant enhancement of repeat components
- **Continuous Learning**: System improves suggestions based on your feedback and preferences

### How It Works (Behind the Scenes):

1. **Agent generates CSS/HTML/JSX code**
2. **System automatically detects the brand pack** from `.agentic/config.json`
3. **Enhancement happens transparently** via SDK or API calls
4. **Results are cached** for instant future use

### Manual SDK Usage (Optional):

If you need direct control, use the Node.js SDK:

```javascript
const { enhance, enhanceCached, resolveProjectContext } = require('../../packages/sdk');

// Get current project context
const context = await resolveProjectContext('./');
// { brandPack: { id: "western-companies", version: "1.0.0", source: "config" } }

// Enhance CSS
const result = enhance({ 
  code: '.button { padding: 10px; }', 
  filePath: 'src/styles.css' 
});

// Or use cached version for better performance
const cached = enhanceCached({ 
  code: '.button { padding: 10px; }', 
  filePath: 'src/styles.css',
  brandPackId: 'western-companies',
  brandVersion: '1.0.0'
});
```

### Manual API Calls (Optional):

If you prefer direct HTTP calls:

1. Check service: `GET http://localhost:8901/api/health`
2. Check context: `GET http://localhost:8901/api/context` 
3. Enhance code: `POST http://localhost:8901/api/design/enhance-cached`

```bash
curl -X POST http://localhost:8901/api/design/enhance-cached \
  -H "Content-Type: application/json" \
  -d '{
    "code": ".button { padding: 10px; }",
    "filePath": "src/styles.css",
    "brandPackId": "western-companies",
    "brandVersion": "1.0.0"
  }'
```

### Supported Component Types:

Buttons, cards, forms, sections, pages, layout CSS, navigation, modals, and custom components.

### Fallback Behavior:

If service unavailable, proceed normally - all enhancements are optional and non-breaking.

### Environment Overrides:

For CI or local overrides, set:

- `AGENTIC_BRAND_PACK_ID=western-companies`
- `AGENTIC_BRAND_VERSION=1.0.0`
- `AGENTIC_DISABLE=1` to disable; `AGENTIC_STRICT=1` to fail hard