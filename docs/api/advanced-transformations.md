# Advanced Transformations API

Advanced CSS transformation systems including typography, animations, gradients, states, and optimization.

## Status Overview
✅ **All endpoints working perfectly** (7/7 - 100%)

---

## Advanced Enhancement

**Endpoint**: `POST /api/design/enhance-advanced`  
**Status**: ✅ Working (19ms avg)

Apply all transformation systems with compositional approach.

### Request Body
```javascript
{
  "code": "h1 { font-size: 32px; color: red; transition: none; }",
  "options": {
    "enableTypography": true,
    "enableAnimations": true,
    "enableGradients": true,
    "enableStates": true,
    "enableOptimization": true
  },
  "projectPath": "/path/to/project"
}
```

### Response
```javascript
{
  "success": true,
  "css": "h1{font-size:var(--font-size-3xl);color:var(--color-primary);transition:all var(--duration-fast) var(--easing-ease-out)}",
  "changes": [
    {
      "type": "typography-scale",
      "property": "font-size",
      "before": "font-size: 32px",
      "after": "font-size: var(--font-size-3xl)",
      "scale": "3xl"
    },
    {
      "type": "color-token",
      "property": "color",
      "before": "color: red", 
      "after": "color: var(--color-primary)"
    },
    {
      "type": "animation-token",
      "property": "transition",
      "before": "transition: none",
      "after": "transition: all var(--duration-fast) var(--easing-ease-out)"
    }
  ],
  "transformations": [
    { "type": "typography", "applied": 1, "timestamp": "2025-09-03T00:40:00Z" },
    { "type": "colors", "applied": 1, "timestamp": "2025-09-03T00:40:00Z" },
    { "type": "animations", "applied": 1, "timestamp": "2025-09-03T00:40:00Z" }
  ],
  "composition": {
    "transformOrder": ["typography", "colors", "animations", "optimization"],
    "transformationsApplied": 3,
    "totalChanges": 3,
    "processingTimeMs": 19
  },
  "analytics": {
    "transformsApplied": 3,
    "cacheHits": 0,
    "processingTime": 19
  }
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/design/enhance-advanced \
  -H "Content-Type: application/json" \
  -d '{
    "code": "h1 { font-size: 28px; color: blue; }",
    "options": { "enableTypography": true, "enableColors": true },
    "projectPath": "/path/to/project"
  }'
```

---

## Typography Enhancement

**Endpoint**: `POST /api/design/enhance-typography`  
**Status**: ✅ Working (7ms avg)

Typography-focused transformation with modular scale system.

### Request Body
```javascript
{
  "code": "h1 { font-size: 32px; font-family: Arial; }",
  "projectPath": "/path/to/project"
}
```

### Response
```javascript
{
  "success": true,
  "css": "h1 { font-size: var(--font-size-3xl); font-family: var(--font-heading); }",
  "changes": [
    {
      "type": "typography-scale",
      "property": "font-size",
      "before": "32px",
      "after": "var(--font-size-3xl)",
      "scale": "3xl"
    },
    {
      "type": "typography-family",
      "property": "font-family", 
      "before": "Arial",
      "after": "var(--font-heading)"
    }
  ],
  "typographyMetrics": {
    "scaleRatio": 1.25,
    "baseSize": "1rem",
    "headingFont": "Titillium Web",
    "bodyFont": "system-ui"
  }
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/design/enhance-typography \
  -H "Content-Type: application/json" \
  -d '{
    "code": "p { font-size: 14px; font-weight: bold; }",
    "projectPath": "/path/to/project"
  }'
```

---

## Animation Enhancement

**Endpoint**: `POST /api/design/enhance-animations`  
**Status**: ✅ Working (5ms avg)

Animation token system with easing curves and state management.

### Request Body
```javascript
{
  "code": ".button { transition: none; }",
  "projectPath": "/path/to/project"
}
```

### Response
```javascript
{
  "success": true,
  "css": ".button { transition: all var(--duration-medium) var(--easing-ease-out); }",
  "changes": [
    {
      "type": "animation-enhancement",
      "property": "transition",
      "before": "none",
      "after": "all var(--duration-medium) var(--easing-ease-out)",
      "enhancement": "smooth-transition"
    }
  ],
  "animationTokens": {
    "durations": {
      "fast": "150ms",
      "medium": "250ms", 
      "slow": "350ms"
    },
    "easings": {
      "ease-out": "cubic-bezier(0.0, 0.0, 0.2, 1)",
      "ease-in": "cubic-bezier(0.4, 0.0, 1, 1)"
    }
  }
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/design/enhance-animations \
  -H "Content-Type: application/json" \
  -d '{
    "code": ".card:hover { transform: scale(1.05); }",
    "projectPath": "/path/to/project"
  }'
```

---

## Gradient Enhancement

**Endpoint**: `POST /api/design/enhance-gradients`  
**Status**: ✅ Working (6ms avg)

Gradient system with brand-aligned presets.

### Request Body
```javascript
{
  "code": ".header { background: red; }",
  "projectPath": "/path/to/project"
}
```

### Response
```javascript
{
  "success": true,
  "css": ".header { background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); }",
  "changes": [
    {
      "type": "gradient-enhancement",
      "property": "background",
      "before": "red",
      "after": "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
      "gradientType": "brand-primary"
    }
  ],
  "gradientPresets": {
    "brand-primary": "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
    "brand-accent": "linear-gradient(90deg, var(--color-accent), var(--color-primary))"
  }
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/design/enhance-gradients \
  -H "Content-Type: application/json" \
  -d '{
    "code": ".hero { background: blue; }",
    "projectPath": "/path/to/project"
  }'
```

---

## State Enhancement

**Endpoint**: `POST /api/design/enhance-states`  
**Status**: ✅ Working (5ms avg)

State variation system for interactive elements.

### Request Body
```javascript
{
  "code": ".button { color: blue; }",
  "projectPath": "/path/to/project"
}
```

### Response
```javascript
{
  "success": true,
  "css": ".button { color: var(--color-primary); } .button:hover { color: var(--color-primary-light); } .button:active { color: var(--color-primary-dark); }",
  "changes": [
    {
      "type": "state-enhancement",
      "property": "color",
      "states": ["hover", "active"],
      "variations": {
        "default": "var(--color-primary)",
        "hover": "var(--color-primary-light)",
        "active": "var(--color-primary-dark)"
      }
    }
  ],
  "stateVariations": {
    "hover": { "opacity": 0.8, "transform": "translateY(-1px)" },
    "active": { "opacity": 0.9, "transform": "translateY(0)" },
    "focus": { "outline": "2px solid var(--color-accent)" }
  }
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/design/enhance-states \
  -H "Content-Type: application/json" \
  -d '{
    "code": ".link { text-decoration: none; }",
    "projectPath": "/path/to/project"
  }'
```

---

## CSS Optimization

**Endpoint**: `POST /api/design/optimize`  
**Status**: ✅ Working (2ms avg)

CSS optimization and minification.

### Request Body
```javascript
{
  "code": "/* Comment */ .button { color: red; background: blue; padding: 10px 10px 10px 10px; }",
  "level": 2,
  "options": {
    "removeComments": true,
    "removeWhitespace": true,
    "mergeDuplicates": true,
    "enableGzipAnalysis": true
  }
}
```

### Response
```javascript
{
  "success": true,
  "css": ".button{color:red;background:blue;padding:10px}",
  "optimizations": [
    { "type": "remove-comments", "saved": 13 },
    { "type": "remove-whitespace", "saved": 8 },
    { "type": "shorthand-properties", "saved": 15 }
  ],
  "metrics": {
    "originalSize": 89,
    "optimizedSize": 53,
    "savings": 36,
    "compressionRatio": 0.596,
    "gzipSize": 47
  }
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/design/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "code": ".btn { margin: 0px; padding: 0px 0px 0px 0px; }",
    "level": 2,
    "options": { "removeWhitespace": true }
  }'
```

---

## Batch Enhancement

**Endpoint**: `POST /api/design/enhance-batch`  
**Status**: ✅ Working (11ms avg)

Batch processing for multiple files.

### Request Body
```javascript
{
  "files": [
    {
      "path": "styles/main.css",
      "css": "h1 { font-size: 32px; }"
    },
    {
      "path": "styles/components.css", 
      "css": ".card { padding: 20px; }"
    }
  ],
  "options": {
    "enableTypography": true,
    "enableOptimization": true
  },
  "projectPath": "/path/to/project"
}
```

### Response
```javascript
{
  "success": true,
  "results": [
    {
      "path": "styles/main.css",
      "css": "h1{font-size:var(--font-size-3xl)}",
      "changes": [
        {
          "type": "typography-scale",
          "property": "font-size",
          "before": "32px",
          "after": "var(--font-size-3xl)"
        }
      ]
    },
    {
      "path": "styles/components.css",
      "css": ".card{padding:var(--spacing-lg)}",
      "changes": [
        {
          "type": "spacing-token",
          "property": "padding", 
          "before": "20px",
          "after": "var(--spacing-lg)"
        }
      ]
    }
  ],
  "summary": {
    "filesProcessed": 2,
    "totalChanges": 2,
    "processingTime": 11
  }
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/design/enhance-batch \
  -H "Content-Type: application/json" \
  -d '{
    "files": [
      { "path": "app.css", "css": ".btn { color: red; }" },
      { "path": "layout.css", "css": ".grid { gap: 16px; }" }
    ],
    "options": { "enableAll": true },
    "projectPath": "/path/to/project"
  }'
```

---

## Transformation Options

### Available Options
- `enableTypography` - Apply typography scale and font tokens
- `enableAnimations` - Add smooth transitions and animations
- `enableGradients` - Convert solid colors to brand gradients
- `enableStates` - Generate interactive state variations
- `enableOptimization` - Minify and optimize CSS output

### Optimization Levels
- **Level 0**: No optimization
- **Level 1**: Safe optimizations (whitespace, comments)
- **Level 2**: Aggressive optimizations (shorthand, merging)

### Performance Characteristics
- **Single transformations**: 2-7ms average
- **Advanced composition**: 19ms average
- **Batch processing**: ~5ms per file
- **Optimization only**: <3ms consistently

---

## Usage Notes

### Best Practices
1. Use batch processing for multiple files to reduce overhead
2. Enable specific transformations rather than all for better performance
3. Level 2 optimization provides best compression with minimal risk
4. Check transformation metadata for applied changes

### Integration Tips
- Combine with design enhancement API for complete workflows
- Use advanced enhancement for comprehensive transformations
- Monitor processing time for performance-sensitive applications
- Cache results for repeated transformations