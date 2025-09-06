# Template System & Customization

Template management, customization, and sandbox statistics for component generation workflows.

## Get Component Templates

**Endpoint**: `GET /api/design/templates`  
**Response Time**: <1ms (validated 2025-09-06)  
**Purpose**: List available component templates with filtering and search capabilities

### Query Parameters

- `type` (optional) - Component type filter (button, card, form, navigation, etc.)
- `style` (optional) - Style filter (modern, minimal, playful, professional)
- `framework` (optional) - Framework filter (html, react, vue, svelte)
- `search` (optional) - Search query for template names/descriptions
- `limit` (optional) - Number of results (default: 20)
- `offset` (optional) - Pagination offset

### Response Format

```json
{
  "success": true,
  "templates": [
    {
      "id": "button-primary",
      "name": "Primary Button",
      "description": "Primary action button with brand colors",
      "type": "button",
      "style": "modern",
      "preview": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIj4...",
      "previewUrl": "/api/design/templates/button-primary/preview",
      "tokens": ["color-primary", "color-background", "spacing-md", "spacing-lg", "radius-md"],
      "frameworks": ["html", "react"],
      "complexity": "complex",
      "tags": ["interactive", "form-control", "primary", "cta"],
      "accessibility": "AA",
      "brandCompliance": 0.98,
      "popularity": 0.89,
      "lastUpdated": "2025-09-06T04:48:04.988Z"
    },
    {
      "id": "card-basic",
      "name": "Basic Card",
      "description": "Content card with header, body, and optional footer",
      "type": "card",
      "style": "modern",
      "preview": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCI+...",
      "previewUrl": "/api/design/templates/card-basic/preview",
      "tokens": ["color-background", "color-neutral-200", "color-text", "spacing-lg"],
      "frameworks": ["html", "react"],
      "complexity": "medium",
      "tags": ["content", "layout"],
      "accessibility": "AA",
      "brandCompliance": 0.98,
      "popularity": 0.76,
      "lastUpdated": "2025-09-06T04:48:04.989Z"
    }
  ],
  "total": 3,
  "pagination": {
    "limit": 20,
    "offset": 0,
    "hasMore": false,
    "nextPage": null
  },
  "filters": {
    "availableTypes": ["button", "card", "form"],
    "availableStyles": ["modern", "minimal", "playful", "professional"],
    "availableFrameworks": ["html", "react", "vue", "svelte"]
  }
}
```

### Usage Examples

```bash
# Get all button templates
curl "http://localhost:3001/api/design/templates?type=button&limit=10"

# Search for card templates
curl "http://localhost:3001/api/design/templates?search=card&style=modern"

# Get React-specific templates
curl "http://localhost:3001/api/design/templates?framework=react"
```

**Validation Results** (2025-09-06):

- ✅ Type filtering: `?type=button` returns 1 button template correctly
- ✅ Search functionality: `?search=card` finds card template by name
- ✅ Framework filtering: `?framework=react` returns 3 React templates
- ✅ Pagination: `?limit=2` returns 2 results with `hasMore:true`
- ✅ Response time: <1ms consistently measured

## Template Customization

**Endpoint**: `POST /api/design/customize-template`  
**Purpose**: Fast template customization with brand compliance

### Request Format

```json
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

### Response Format

```json
{
  "success": true,
  "customizedComponent": {
    "html": "<button class=\"btn btn-primary btn-large\">Get Started <i class=\"icon-arrow-right\"></i></button>",
    "css": ".btn-large { padding: var(--spacing-md) var(--spacing-lg); }",
    "jsx": "<Button variant=\"primary\" size=\"large\" icon=\"arrow-right\">Get Started</Button>"
  },
  "appliedCustomizations": [
    { "property": "variant", "value": "primary" },
    { "property": "size", "value": "large" }
  ],
  "brandCompliance": 0.92
}
```

## Sandbox Statistics

**Endpoint**: `GET /api/design/sandbox-stats`  
**Response Time**: ~1ms (cached statistics)  
**Purpose**: Component sandbox usage and performance statistics

### Response Format

```json
{
  "success": true,
  "stats": {
    "totalSandboxes": 147,
    "activeSandboxes": 23,
    "averageLifetime": "2.5 hours",
    "popularComponents": [
      { "type": "button", "count": 45, "percentage": 0.31 },
      { "type": "card", "count": 32, "percentage": 0.22 }
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
    }
  }
}
```

### Usage

```bash
curl http://localhost:3001/api/design/sandbox-stats
```

**Validation Results** (2025-09-06):

- ✅ Response includes comprehensive sandbox statistics
- ✅ Popular components data: button (31%), card (22%), form (19%)
- ✅ Framework usage analytics: HTML (45%), React (32%), Vue (15%), Svelte (8%)
- ✅ Performance metrics: 1ms response time consistently measured

## Template Features

### Template Categories

- **Component Templates**: Buttons, cards, forms, navigation elements
- **Layout Templates**: Page layouts, section templates, grid systems
- **Pattern Templates**: Common design patterns and compositions

### Customization Options

- **Variant Selection**: Primary, secondary, accent variations
- **Size Options**: Small, medium, large, extra-large
- **Style Modifications**: Corner radius, shadows, borders
- **Content Customization**: Text, icons, imagery
- **Framework Output**: HTML, React, Vue, Svelte versions

### Quality Metrics

- **Brand Compliance**: 0.0-1.0 scoring for brand alignment
- **Accessibility Score**: WCAG AA/AAA compliance rating
- **Popularity Index**: Usage frequency across projects
- **Complexity Rating**: Simple, medium, complex implementation

## Template System Architecture

### Template Storage

```
Template Definition → Customization Engine → Framework Generator → Brand Validator → Output
```

### Caching Strategy

- **Template Metadata**: Cached for fast listing operations
- **Preview Images**: Generated on demand, cached for reuse
- **Popular Templates**: Preloaded for faster access

## Performance Characteristics

| Operation              | Response Time | Caching             |
| ---------------------- | ------------- | ------------------- |
| Template Listing       | 2ms           | Full metadata cache |
| Template Customization | 50-100ms      | Component cache     |
| Preview Generation     | 100-200ms     | Image cache         |
| Sandbox Stats          | 1ms           | Statistics cache    |

## Integration Patterns

### Template Workflow

```
Browse Templates → Select Template → Customize → Generate → Preview → Deploy
```

### Development Usage

```
Template API → Customization → Brand Validation → Framework Output → Sandbox Testing
```

## Development Context

The template system provides a curated collection of proven component patterns that can be rapidly customized for specific project needs. It bridges the gap between fully custom generation and completely pre-built components.

### Key Benefits

- **Rapid Prototyping**: Start with proven patterns
- **Brand Consistency**: Automatic brand token integration
- **Multi-Framework**: Single template, multiple output formats
- **Quality Assurance**: Pre-validated accessibility and performance
