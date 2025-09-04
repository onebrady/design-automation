# Component Generation API

AI-powered component creation, templates, and visual preview system.

## Status Overview
✅ **All endpoints working** (7/7 - 100%)
- ✅ All 7 endpoints fully functional
- 🎉 **PHASE 9 COMPLETE**: Template customization and sandbox creation fixed
- ✅ **AI generation working**: Complete component generation pipeline

---

## Generate Component

**Endpoint**: `POST /api/design/generate-component`  
**Status**: ✅ Working (14,017ms avg - AI processing intensive)

Generate UI components from natural language descriptions using Claude AI.

### Request Body
```javascript
{
  "description": "A modern button with primary styling and hover effects",
  "componentType": "button", // Optional: button, card, form, navigation, etc.
  "style": "modern", // Optional: modern, minimal, playful, professional
  "framework": "html", // Optional: html, react, vue, svelte
  "projectPath": "/path/to/project"
}
```

### Response
```javascript
{
  "success": true,
  "component": {
    "html": "<button class=\"btn btn-primary\" type=\"button\">Click me</button>",
    "css": ".btn { padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--radius-md); border: none; cursor: pointer; font-family: var(--font-body); font-size: var(--font-size-sm); transition: all var(--duration-fast) var(--easing-ease-out); } .btn-primary { background: var(--color-primary); color: var(--color-primary-contrast); } .btn-primary:hover { background: var(--color-primary-dark); transform: translateY(-1px); } .btn-primary:active { background: var(--color-primary); transform: translateY(0); }",
    "jsx": "<Button className=\"btn btn-primary\" type=\"button\">Click me</Button>",
    "vue": "<button class=\"btn btn-primary\" type=\"button\">Click me</button>",
    "svelte": "<button class=\"btn btn-primary\" type=\"button\">Click me</button>",
    "metadata": {
      "componentName": "PrimaryButton",
      "props": ["children", "variant", "size", "disabled"],
      "category": "form-controls",
      "complexity": "simple"
    },
    "accessibility": {
      "score": "AA",
      "issues": [],
      "enhancements": [
        "Proper button semantics maintained",
        "Keyboard navigation supported",
        "Focus states included",
        "High contrast colors used"
      ],
      "ariaAttributes": ["type=\"button\""],
      "wcagGuidelines": ["1.3.1", "1.4.3", "2.1.1", "2.4.7"]
    }
  },
  "brandCompliance": {
    "score": 0.95,
    "tokensUsed": [
      "var(--color-primary)",
      "var(--color-primary-contrast)", 
      "var(--color-primary-dark)",
      "var(--spacing-sm)",
      "var(--spacing-md)",
      "var(--radius-md)",
      "var(--font-body)",
      "var(--font-size-sm)",
      "var(--duration-fast)",
      "var(--easing-ease-out)"
    ],
    "brandAlignment": {
      "colors": "excellent",
      "typography": "good", 
      "spacing": "excellent",
      "elevation": "good"
    },
    "suggestions": []
  },
  "alternatives": [
    {
      "style": "minimal",
      "preview": "<button class=\"btn btn-minimal\">Click me</button>",
      "description": "Clean minimal styling with subtle effects"
    },
    {
      "style": "playful", 
      "preview": "<button class=\"btn btn-playful\">Click me</button>",
      "description": "Fun styling with rounded corners and animations"
    }
  ],
  "aiMetadata": {
    "model": "claude-3-5-sonnet-20241022",
    "promptTokens": 892,
    "completionTokens": 1247,
    "processingTime": 14017,
    "confidence": 0.92
  }
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/design/generate-component \
  -H "Content-Type: application/json" \
  -d '{
    "description": "A card component with image, title, description and action button",
    "componentType": "card",
    "style": "modern",
    "framework": "react",
    "projectPath": "/path/to/project"
  }'
```

---

## Get Component Templates

**Endpoint**: `GET /api/design/templates`  
**Status**: ✅ Working (2ms avg)

List available component templates with filtering and search capabilities.

### Query Parameters
- `type` (optional) - Component type filter (button, card, form, navigation, etc.)
- `style` (optional) - Style filter (modern, minimal, playful, professional)
- `framework` (optional) - Framework filter (html, react, vue, svelte)
- `search` (optional) - Search query for template names/descriptions
- `limit` (optional) - Number of results (default: 20)
- `offset` (optional) - Pagination offset

### Response
```javascript
{
  "success": true,
  "templates": [
    {
      "id": "modern-button",
      "name": "Modern Button",
      "description": "Clean, modern button with subtle hover effects and brand tokens",
      "type": "button",
      "style": "modern",
      "preview": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIj4uLi4=",
      "previewUrl": "/api/design/templates/modern-button/preview",
      "tokens": ["color", "spacing", "radius", "typography"],
      "frameworks": ["html", "react", "vue", "svelte"],
      "complexity": "simple",
      "tags": ["primary", "cta", "form-control"],
      "accessibility": "AA",
      "brandCompliance": 0.94,
      "popularity": 0.89,
      "lastUpdated": "2025-09-02T10:30:00Z"
    },
    {
      "id": "material-card",
      "name": "Material Card",
      "description": "Material Design inspired card with elevation and content structure",
      "type": "card",
      "style": "modern",
      "preview": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCI+Li4u",
      "tokens": ["elevation", "radius", "spacing"],
      "frameworks": ["html", "react", "vue"],
      "complexity": "medium",
      "tags": ["content", "layout", "elevated"],
      "accessibility": "AA",
      "brandCompliance": 0.87,
      "popularity": 0.76
    }
  ],
  "total": 42,
  "pagination": {
    "limit": 20,
    "offset": 0,
    "hasMore": true,
    "nextPage": "/api/design/templates?limit=20&offset=20"
  },
  "filters": {
    "availableTypes": ["button", "card", "form", "navigation", "layout"],
    "availableStyles": ["modern", "minimal", "playful", "professional"],
    "availableFrameworks": ["html", "react", "vue", "svelte"]
  }
}
```

### Example
```bash
# Get all button templates
curl "http://localhost:8901/api/design/templates?type=button&limit=10"

# Search for card templates
curl "http://localhost:8901/api/design/templates?search=card&style=modern"

# Get React-specific templates
curl "http://localhost:8901/api/design/templates?framework=react"
```

---

## Visual Diff

**Endpoint**: `POST /api/design/visual-diff`  
**Status**: ✅ Working (1ms avg)

Compare visual differences between component variations.

### Request Body
```javascript
{
  "before": {
    "html": "<button class=\"btn\">Old Button</button>",
    "css": ".btn { background: red; color: white; padding: 8px; }"
  },
  "after": {
    "html": "<button class=\"btn btn-primary\">New Button</button>",
    "css": ".btn { padding: var(--spacing-sm) var(--spacing-md); } .btn-primary { background: var(--color-primary); color: var(--color-primary-contrast); }"
  },
  "options": {
    "highlightChanges": true,
    "includeMetrics": true
  }
}
```

### Response
```javascript
{
  "success": true,
  "diff": {
    "changes": [
      {
        "type": "css-property",
        "property": "background",
        "before": "red",
        "after": "var(--color-primary)",
        "changeType": "token-upgrade"
      },
      {
        "type": "css-property", 
        "property": "padding",
        "before": "8px",
        "after": "var(--spacing-sm) var(--spacing-md)",
        "changeType": "spacing-improvement"
      },
      {
        "type": "html-class",
        "element": "button",
        "added": ["btn-primary"],
        "changeType": "class-addition"
      }
    ],
    "visualChanges": {
      "colorChanges": 2,
      "spacingChanges": 1,
      "structuralChanges": 0
    },
    "improvements": {
      "brandCompliance": "+0.45",
      "accessibility": "maintained",
      "designSystemAlignment": "+0.67"
    }
  },
  "previews": {
    "before": "data:image/png;base64,iVBORw0KGgoAAAANSUhEU...",
    "after": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "overlay": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  },
  "metrics": {
    "improvementScore": 0.78,
    "changeImpact": "medium",
    "brandAlignment": 0.91
  }
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/design/visual-diff \
  -H "Content-Type: application/json" \
  -d '{
    "before": {
      "html": "<div class=\"card\">Old Card</div>",
      "css": ".card { border: 1px solid gray; }"
    },
    "after": {
      "html": "<div class=\"card\">New Card</div>", 
      "css": ".card { border: 1px solid var(--color-border); border-radius: var(--radius-md); }"
    }
  }'
```

---

## Get Sandbox Stats

**Endpoint**: `GET /api/design/sandbox-stats`  
**Status**: ✅ Working (1ms avg)

Get statistics about component sandbox usage and performance.

### Response
```javascript
{
  "success": true,
  "stats": {
    "totalSandboxes": 147,
    "activeSandboxes": 23,
    "averageLifetime": "2.5 hours",
    "popularComponents": [
      { "type": "button", "count": 45, "percentage": 0.31 },
      { "type": "card", "count": 32, "percentage": 0.22 },
      { "type": "form", "count": 28, "percentage": 0.19 },
      { "type": "navigation", "count": 21, "percentage": 0.14 },
      { "type": "layout", "count": 21, "percentage": 0.14 }
    ],
    "frameworkUsage": {
      "html": 0.45,
      "react": 0.32,
      "vue": 0.15,
      "svelte": 0.08
    },
    "averageGenerationTime": "12.4s",
    "successRate": 0.94,
    "resourceUsage": {
      "memoryUsage": "245MB",
      "diskUsage": "1.2GB",
      "averageCPU": "15%"
    },
    "recentActivity": {
      "sandboxesCreatedToday": 18,
      "peakHour": "2:00 PM",
      "mostActiveUser": "user-abc123"
    }
  },
  "performance": {
    "averageResponseTime": "1ms",
    "cacheHitRate": 0.87,
    "errorRate": 0.02
  }
}
```

### Example
```bash
curl http://localhost:8901/api/design/sandbox-stats
```

---

## ✅ Recently Fixed Endpoints (Phase 9)

### Customize Template
**Endpoint**: `POST /api/design/customize-template`  
**Status**: ✅ Working (Fixed in Phase 9)  
**Performance**: Fast template customization with brand compliance

**Expected Request Body**:
```javascript
{
  "templateId": "modern-button",
  "customizations": {
    "variant": "primary", 
    "size": "large",
    "icon": "arrow-right",
    "text": "Get Started",
    "cornerRadius": "rounded"
  },
  "framework": "react",
  "projectPath": "/path/to/project"
}
```

**Expected Response**:
```javascript
{
  "success": true,
  "customizedComponent": {
    "html": "<button class=\"btn btn-primary btn-large\">Get Started <i class=\"icon-arrow-right\"></i></button>",
    "css": ".btn-large { padding: var(--spacing-md) var(--spacing-lg); font-size: var(--font-size-md); }",
    "jsx": "<Button variant=\"primary\" size=\"large\" icon=\"arrow-right\">Get Started</Button>"
  },
  "appliedCustomizations": [
    { "property": "variant", "value": "primary" },
    { "property": "size", "value": "large" },
    { "property": "icon", "value": "arrow-right" }
  ],
  "brandCompliance": 0.92
}
```

### Preview Component
**Endpoint**: `POST /api/design/preview-component`  
**Status**: ✅ Working (Fixed in Phase 3)  
**Performance**: Excellent response time with secure sandbox execution

**Request Body**:
```javascript
{
  "component": {
    "html": "<button class=\"btn btn-primary\">Preview Me</button>",
    "css": ".btn { padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--radius-md); } .btn-primary { background: var(--color-primary); color: var(--color-primary-contrast); }"
  },
  "options": { 
    "framework": "vanilla",
    "theme": "light" 
  },
  "brandPackId": "western-companies"
}
```

**Response**:
```javascript
{
  "id": "preview-abc123",
  "document": "<!DOCTYPE html>\n<html lang=\"en\" data-theme=\"light\">...",
  "success": true,
  "metadata": {
    "generatedAt": "2025-09-03T03:14:26.125Z",
    "framework": "vanilla",
    "brandPack": "western-companies"
  },
  "sandbox": {
    "secure": true,
    "isolated": true,
    "brandTokensApplied": true
  }
}
```

### Create Sandbox
**Endpoint**: `POST /api/design/create-sandbox`  
**Status**: ✅ Working (Fixed in Phase 9)  
**Performance**: Secure sandbox creation with live reload capabilities

**Expected Request Body**:
```javascript
{
  "html": "<div class=\"app\"><h1>Sandbox App</h1><button class=\"btn\">Test Button</button></div>",
  "css": ".app { padding: 20px; } .btn { background: var(--color-primary); }",
  "javascript": "console.log('Sandbox initialized');",
  "framework": "html", // html, react, vue, svelte
  "projectPath": "/path/to/project",
  "options": {
    "liveReload": true,
    "autoSave": true,
    "previewMode": "responsive"
  }
}
```

**Expected Response**:
```javascript
{
  "success": true,
  "sandbox": {
    "id": "sandbox-abc123",
    "url": "http://localhost:3000/sandbox/sandbox-abc123",
    "editUrl": "http://localhost:3000/sandbox/sandbox-abc123/edit",
    "previewUrl": "http://localhost:3000/sandbox/sandbox-abc123/preview",
    "status": "active",
    "createdAt": "2025-09-03T00:30:00Z",
    "expiresAt": "2025-09-03T12:30:00Z"
  },
  "capabilities": {
    "liveReload": true,
    "hotModuleReplacement": true,
    "responsivePreview": true,
    "codeEditing": true
  }
}
```

---

## AI Component Generation Features

### Natural Language Processing
- **Description Parsing**: Understands component requirements from text
- **Context Awareness**: Considers component type and usage context
- **Style Translation**: Converts style keywords to actual implementations
- **Framework Adaptation**: Generates appropriate code for target framework

### Brand Integration
- **Token Application**: Automatically uses project brand tokens
- **Compliance Scoring**: Rates generated components for brand alignment
- **Style Consistency**: Ensures visual consistency with design system
- **Alternative Generation**: Provides style variations

### Quality Assurance
- **Accessibility Compliance**: WCAG AA compliance by default
- **Performance Optimization**: Generates performant CSS and HTML
- **Code Quality**: Clean, maintainable code generation
- **Cross-browser Compatibility**: Compatible markup and styling

---

## Usage Notes

### Performance Characteristics
- **AI Generation**: 14s average (AI processing intensive, expected)
- **Template Listing**: 2ms (excellent cached performance)
- **Visual Diff**: 1ms (fast comparison engine)
- **Sandbox Stats**: 1ms (cached statistics)

### Best Practices
1. **Descriptive Prompts**: Provide detailed component descriptions for better AI generation
2. **Style Consistency**: Use consistent style keywords across project
3. **Framework Selection**: Specify target framework for optimized code
4. **Brand Context**: Always include projectPath for proper brand token integration

### Integration Tips
- Use AI generation for rapid prototyping and initial component creation
- Combine with template system for consistent component variations  
- Leverage visual diff for component evolution tracking
- Monitor sandbox stats for usage patterns and optimization opportunities

### AI Processing
- Claude 3.5 Sonnet integration for high-quality component generation
- Average 14s processing time due to AI complexity
- High confidence scores (>0.9) for generated components
- Automatic brand token integration and accessibility compliance