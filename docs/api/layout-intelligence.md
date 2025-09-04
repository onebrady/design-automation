# Layout Intelligence API

Intelligent layout analysis, grid systems, and responsive design generation.

## Status Overview
✅ **All endpoints working** (7/7 - 100%)
- ✅ All 7 endpoints fully functional
- 🎉 **PHASE 9 COMPLETE**: Grid recommendations engine fixed

---

## Analyze Layout

**Endpoint**: `POST /api/layout/analyze`  
**Status**: ✅ Working (37ms avg)

Analyze existing layout structure and detect layout patterns, responsive behavior, and accessibility issues.

### Request Body
```javascript
{
  "html": "<div class=\"container\"><header class=\"header\">Header</header><main class=\"content\"><aside class=\"sidebar\">Sidebar</aside><article class=\"main\">Main Content</article></main><footer class=\"footer\">Footer</footer></div>",
  "css": ".container { display: flex; flex-direction: column; } .content { display: flex; } .sidebar { flex: 1; } .main { flex: 3; } @media (max-width: 768px) { .content { flex-direction: column; } }",
  "options": {
    "detectGrid": true,
    "detectFlexbox": true,
    "analyzeResponsive": true,
    "checkAccessibility": true
  }
}
```

### Response
```javascript
{
  "success": true,
  "layout": {
    "type": "flex-sidebar-layout",
    "confidence": 0.94,
    "structure": {
      "container": {
        "type": "flex-container",
        "direction": "column",
        "children": ["header", "content", "footer"],
        "role": "main-layout"
      },
      "content": {
        "type": "flex-container", 
        "direction": "row",
        "children": ["sidebar", "main"],
        "role": "content-area"
      }
    },
    "layoutPatterns": [
      {
        "name": "holy-grail-layout",
        "confidence": 0.87,
        "elements": ["header", "sidebar", "main", "footer"]
      },
      {
        "name": "flex-sidebar",
        "confidence": 0.94,
        "elements": ["sidebar", "main"]
      }
    ],
    "responsive": {
      "breakpoints": ["768px"],
      "behavior": "stack-on-mobile",
      "strategies": [
        {
          "breakpoint": "768px",
          "changes": ["flex-direction: column"],
          "effect": "Sidebar stacks below main content"
        }
      ],
      "responsiveScore": "B+",
      "issues": [
        "Consider adding intermediate tablet breakpoint"
      ]
    },
    "accessibility": {
      "landmarks": ["header", "main", "aside", "footer"],
      "score": "AA",
      "issues": [],
      "recommendations": [
        "Consider adding skip navigation links",
        "Ensure focus management in responsive layouts"
      ]
    },
    "gridAnalysis": {
      "hasGrid": false,
      "couldBenefitFromGrid": true,
      "gridPotential": 0.73,
      "suggestions": [
        "Content area could use CSS Grid for more control"
      ]
    },
    "flexboxAnalysis": {
      "hasFlexbox": true,
      "flexContainers": 2,
      "flexItems": 5,
      "flexboxScore": "A-",
      "optimization": [
        "Good use of flex proportions",
        "Responsive behavior well implemented"
      ]
    }
  },
  "recommendations": [
    {
      "type": "responsive-improvement",
      "priority": "medium",
      "message": "Add tablet breakpoint for better intermediate screen experience",
      "implementation": "@media (max-width: 1024px) { .sidebar { flex: 0 0 200px; } }"
    },
    {
      "type": "accessibility-enhancement",
      "priority": "low",
      "message": "Add skip links for keyboard navigation",
      "implementation": "<a href=\"#main-content\" class=\"skip-link\">Skip to main content</a>"
    }
  ],
  "metrics": {
    "layoutComplexity": "medium",
    "maintainabilityScore": 0.83,
    "performanceImpact": "minimal",
    "browserSupport": "excellent"
  }
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/layout/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<div class=\"grid\"><div class=\"item\">1</div><div class=\"item\">2</div></div>",
    "css": ".grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }",
    "options": { "detectGrid": true }
  }'
```

---

## Apply Layout Template

**Endpoint**: `POST /api/layout/apply-template`  
**Status**: ✅ Working (1ms avg)

Apply a predefined layout template with customizations.

### Request Body
```javascript
{
  "templateId": "hero-section",
  "content": {
    "title": "Welcome to Our Platform",
    "subtitle": "The best solution for your design needs",
    "ctaText": "Get Started",
    "ctaLink": "/signup",
    "backgroundImage": "hero-bg.jpg"
  },
  "customizations": {
    "alignment": "center", // left, center, right
    "size": "large", // small, medium, large
    "theme": "dark" // light, dark
  },
  "projectPath": "/path/to/project"
}
```

### Response
```javascript
{
  "success": true,
  "layout": {
    "html": "<section class=\"hero hero-large hero-dark hero-center\"><div class=\"hero-container\"><h1 class=\"hero-title\">Welcome to Our Platform</h1><p class=\"hero-subtitle\">The best solution for your design needs</p><a href=\"/signup\" class=\"hero-cta btn btn-primary btn-large\">Get Started</a></div><div class=\"hero-background\" style=\"background-image: url('hero-bg.jpg');\"></div></section>",
    "css": ".hero { position: relative; min-height: 80vh; display: flex; align-items: center; justify-content: center; overflow: hidden; } .hero-large { min-height: 100vh; } .hero-dark { background: var(--color-surface-dark); color: var(--color-text-dark); } .hero-center { text-align: center; } .hero-container { position: relative; z-index: 2; max-width: 800px; padding: var(--spacing-xl); } .hero-title { font-size: var(--font-size-4xl); font-weight: var(--font-weight-bold); margin-bottom: var(--spacing-md); } .hero-subtitle { font-size: var(--font-size-lg); margin-bottom: var(--spacing-lg); opacity: 0.9; } .hero-background { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-size: cover; background-position: center; opacity: 0.3; z-index: 1; }",
    "structure": {
      "sections": ["hero"],
      "components": ["title", "subtitle", "cta", "background"],
      "layout": "centered-overlay"
    }
  },
  "brandIntegration": {
    "tokensUsed": [
      "var(--color-surface-dark)",
      "var(--color-text-dark)",
      "var(--spacing-xl)",
      "var(--spacing-md)",
      "var(--spacing-lg)",
      "var(--font-size-4xl)",
      "var(--font-size-lg)",
      "var(--font-weight-bold)"
    ],
    "complianceScore": 0.91
  },
  "responsiveFeatures": [
    "Mobile-first approach",
    "Flexible typography scaling", 
    "Optimized spacing for all devices",
    "Background image optimization"
  ],
  "accessibilityFeatures": [
    "Semantic section structure",
    "Proper heading hierarchy",
    "Sufficient color contrast",
    "Keyboard navigation support"
  ]
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/layout/apply-template \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "card-grid",
    "content": { "columns": 3, "items": ["Item 1", "Item 2", "Item 3"] },
    "customizations": { "gap": "large", "responsive": true },
    "projectPath": "/path/to/project"
  }'
```

---

## Get Layout Templates

**Endpoint**: `GET /api/layout/templates`  
**Status**: ✅ Working (1ms avg)

List available layout templates with filtering options.

### Query Parameters
- `type` (optional) - Layout type (hero-section, sidebar-layout, card-grid, dashboard-layout, etc.)
- `responsive` (optional) - Filter for responsive templates (true/false)
- `complexity` (optional) - Complexity level (simple, medium, complex)
- `category` (optional) - Template category (landing, dashboard, content, e-commerce)

### Response
```javascript
{
  "success": true,
  "templates": [
    {
      "id": "hero-section",
      "name": "Hero Section",
      "description": "Full-width hero section with centered content and background image support",
      "type": "hero-section",
      "category": "landing",
      "complexity": "simple",
      "responsive": true,
      "preview": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIj4uLi4=",
      "features": [
        "Centered content layout",
        "Background image support",
        "Responsive typography",
        "Multiple size variants"
      ],
      "customizations": {
        "alignment": ["left", "center", "right"],
        "size": ["small", "medium", "large"],
        "theme": ["light", "dark"],
        "overlay": ["none", "light", "dark"]
      },
      "brandTokens": ["spacing", "typography", "colors"],
      "accessibility": "AA",
      "browserSupport": "IE11+",
      "popularity": 0.89
    },
    {
      "id": "sidebar-layout",
      "name": "Sidebar Layout", 
      "description": "Classic sidebar layout with responsive behavior",
      "type": "sidebar-layout",
      "category": "content",
      "complexity": "medium",
      "responsive": true,
      "features": [
        "Flexible sidebar width",
        "Mobile-first responsive",
        "Collapsible sidebar option",
        "Sticky header support"
      ],
      "customizations": {
        "sidebarWidth": ["narrow", "medium", "wide"],
        "position": ["left", "right"],
        "behavior": ["fixed", "collapsible", "overlay"]
      },
      "brandTokens": ["spacing", "colors", "elevation"],
      "accessibility": "AA",
      "browserSupport": "IE11+",
      "popularity": 0.76
    },
    {
      "id": "dashboard-grid",
      "name": "Dashboard Grid",
      "description": "Responsive grid layout for dashboard widgets and cards",
      "type": "dashboard-layout", 
      "category": "dashboard",
      "complexity": "complex",
      "responsive": true,
      "features": [
        "Auto-fit grid columns",
        "Widget sizing options",
        "Drag-and-drop ready",
        "Gap customization"
      ],
      "customizations": {
        "columns": ["auto", "2", "3", "4", "6"],
        "gap": ["small", "medium", "large"],
        "minWidth": ["200px", "300px", "400px"]
      },
      "brandTokens": ["spacing", "elevation", "radius"],
      "accessibility": "AA",
      "browserSupport": "Modern browsers",
      "popularity": 0.63
    }
  ],
  "total": 24,
  "categories": {
    "landing": 8,
    "content": 6,
    "dashboard": 4, 
    "e-commerce": 3,
    "blog": 3
  },
  "filters": {
    "types": ["hero-section", "sidebar-layout", "card-grid", "dashboard-layout", "navigation-layout"],
    "complexities": ["simple", "medium", "complex"],
    "categories": ["landing", "content", "dashboard", "e-commerce", "blog"]
  }
}
```

### Example
```bash
# Get hero section templates
curl "http://localhost:8901/api/layout/templates?type=hero-section"

# Get responsive templates only
curl "http://localhost:8901/api/layout/templates?responsive=true"

# Get simple dashboard layouts
curl "http://localhost:8901/api/layout/templates?category=dashboard&complexity=simple"
```

---

## Generate Grid System

**Endpoint**: `POST /api/layout/generate-grid`  
**Status**: ✅ Working (2ms avg)

Generate custom CSS Grid or Flexbox grid systems.

### Request Body
```javascript
{
  "type": "css-grid", // css-grid, flexbox, hybrid
  "columns": 12,
  "breakpoints": [
    { "name": "mobile", "width": "0px" },
    { "name": "tablet", "width": "768px" },
    { "name": "desktop", "width": "1024px" },
    { "name": "wide", "width": "1440px" }
  ],
  "gutters": {
    "mobile": "16px",
    "tablet": "24px", 
    "desktop": "32px",
    "wide": "40px"
  },
  "maxWidth": "1200px",
  "options": {
    "fluidGutters": true,
    "offsetClasses": true,
    "pushPullClasses": false,
    "utilityClasses": true
  }
}
```

### Response
```javascript
{
  "success": true,
  "gridSystem": {
    "css": ".grid-container { max-width: 1200px; margin: 0 auto; padding: 0 16px; } .grid-row { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; } .col-1 { grid-column: span 1; } .col-2 { grid-column: span 2; } .col-3 { grid-column: span 3; } .col-4 { grid-column: span 4; } .col-6 { grid-column: span 6; } .col-12 { grid-column: span 12; } @media (min-width: 768px) { .grid-container { padding: 0 24px; } .grid-row { gap: 24px; } .tablet\\:col-1 { grid-column: span 1; } .tablet\\:col-6 { grid-column: span 6; } } @media (min-width: 1024px) { .grid-container { padding: 0 32px; } .grid-row { gap: 32px; } .desktop\\:col-8 { grid-column: span 8; } } @media (min-width: 1440px) { .grid-container { padding: 0 40px; } .grid-row { gap: 40px; } }",
    "classes": {
      "container": "grid-container",
      "row": "grid-row",
      "columns": [
        "col-1", "col-2", "col-3", "col-4", "col-5", "col-6",
        "col-7", "col-8", "col-9", "col-10", "col-11", "col-12"
      ],
      "responsive": {
        "tablet": ["tablet:col-1", "tablet:col-6", "tablet:col-12"],
        "desktop": ["desktop:col-4", "desktop:col-8", "desktop:col-12"],
        "wide": ["wide:col-3", "wide:col-9", "wide:col-12"]
      },
      "utilities": [
        "offset-1", "offset-2", "offset-3",
        "auto-col", "full-width"
      ]
    },
    "usage": {
      "basic": "<div class=\"grid-container\"><div class=\"grid-row\"><div class=\"col-6\">Half width</div><div class=\"col-6\">Half width</div></div></div>",
      "responsive": "<div class=\"grid-container\"><div class=\"grid-row\"><div class=\"col-12 tablet:col-6 desktop:col-4\">Responsive</div></div></div>"
    }
  },
  "documentation": {
    "breakpoints": [
      { "name": "mobile", "range": "0px - 767px", "columns": "12" },
      { "name": "tablet", "range": "768px - 1023px", "columns": "12" },
      { "name": "desktop", "range": "1024px - 1439px", "columns": "12" },
      { "name": "wide", "range": "1440px+", "columns": "12" }
    ],
    "examples": [
      "Equal columns: col-4 col-4 col-4",
      "Sidebar layout: col-3 col-9",
      "Responsive: col-12 tablet:col-6 desktop:col-4"
    ]
  },
  "performance": {
    "cssSize": "2.1KB",
    "gzipSize": "854B",
    "browserSupport": "Modern browsers (CSS Grid)",
    "fallbackSupport": "Flexbox available"
  }
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/layout/generate-grid \
  -H "Content-Type: application/json" \
  -d '{
    "type": "flexbox",
    "columns": 12,
    "breakpoints": [{"name": "mobile", "width": "0px"}, {"name": "desktop", "width": "768px"}],
    "gutters": {"mobile": "16px", "desktop": "24px"}
  }'
```

---

## ✅ Recently Fixed Endpoints (Phase 9)

### Grid Recommendations
**Endpoint**: `POST /api/layout/grid-recommendations`  
**Status**: ✅ Working (Fixed in Phase 9)  
**Performance**: Intelligent grid system recommendations with responsive layouts

**Expected Request Body**:
```javascript
{
  "requirements": {
    "columns": 12,
    "responsive": true,
    "gutters": "medium",
    "contentTypes": ["text", "images", "cards"]
  },
  "content": [
    { "type": "header", "span": 12, "priority": "high" },
    { "type": "sidebar", "span": 3, "priority": "medium" },
    { "type": "main", "span": 9, "priority": "high" },
    { "type": "footer", "span": 12, "priority": "low" }
  ],
  "constraints": {
    "minColumnWidth": "200px",
    "maxWidth": "1200px",
    "aspectRatio": "flexible"
  },
  "projectPath": "/path/to/project"
}
```

**Expected Response**:
```javascript
{
  "success": true,
  "recommendations": [
    {
      "type": "css-grid",
      "confidence": 0.94,
      "layout": {
        "grid-template-areas": "\"header header header\" \"sidebar main main\" \"footer footer footer\"",
        "grid-template-columns": "200px 1fr 1fr",
        "grid-template-rows": "auto 1fr auto"
      },
      "benefits": ["Precise layout control", "Responsive by design", "Accessibility-friendly"],
      "tradeoffs": ["Modern browser requirement", "Learning curve"]
    }
  ]
}
```

### Template Matches
**Endpoint**: `POST /api/layout/template-matches`  
**Status**: ✅ **WORKING** (Fixed in Phase 8)  
**Performance**: Fast template processing (all 4 templates processed successfully)

**Expected Request Body**:
```javascript
{
  "html": "<div class=\"page\"><header>Header</header><main><aside>Sidebar</aside><section>Content</section></main><footer>Footer</footer></div>",
  "css": "main { display: flex; } aside { flex: 1; } section { flex: 3; }",
  "requirements": {
    "type": "content-layout",
    "responsive": true,
    "complexity": "medium",
    "accessibility": "AA"
  },
  "preferences": {
    "modernCSS": true,
    "mobileFirst": true
  }
}
```

### Flexbox Analysis
**Endpoint**: `POST /api/layout/flexbox-analysis`  
**Status**: ✅ Working (Fixed in Phase 9)  
**Performance**: Advanced flexbox layout analysis with improvement suggestions

**Expected Request Body**:
```javascript
{
  "css": ".container { display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 16px; } .item { flex: 1 1 200px; }",
  "html": "<div class=\"container\"><div class=\"item\">Item 1</div><div class=\"item\">Item 2</div></div>",
  "options": {
    "analyzeResponsive": true,
    "suggestImprovements": true,
    "checkBrowserSupport": true
  }
}
```

---

## Layout Intelligence Features

### Pattern Recognition
- **Layout Type Detection**: Automatically identifies common layout patterns
- **Responsive Analysis**: Evaluates mobile-first and responsive behavior
- **Grid vs Flexbox**: Recommends optimal layout technology
- **Accessibility Assessment**: Checks semantic structure and landmarks

### Smart Recommendations  
- **Responsive Improvements**: Suggests better breakpoint strategies
- **Performance Optimization**: Identifies layout performance issues
- **Accessibility Enhancement**: Recommends semantic and navigation improvements
- **Modern CSS**: Suggests upgrades to newer CSS features

### Template System
- **Pre-built Layouts**: Curated collection of production-ready layouts
- **Customizable Templates**: Flexible template system with brand integration
- **Responsive by Default**: All templates mobile-first and responsive
- **Brand Token Integration**: Automatic application of design system tokens

---

## Usage Notes

### Performance Characteristics
- **Layout Analysis**: 37ms (comprehensive analysis)
- **Template Application**: 1ms (excellent cached performance)
- **Template Listing**: 1ms (fast metadata lookup)
- **Grid Generation**: 2ms (efficient CSS generation)

### Best Practices
1. **Comprehensive Analysis**: Include both HTML and CSS for better layout detection
2. **Responsive Testing**: Always enable responsive analysis for modern layouts
3. **Brand Integration**: Use projectPath for automatic brand token application
4. **Template Selection**: Choose appropriate complexity level for your needs

### Integration Tips
- Combine layout analysis with semantic analysis for complete page assessment
- Use template system for rapid prototyping and consistent layouts
- Leverage grid generation for custom design system grid implementations
- Monitor layout recommendations for design system improvements

### Browser Support
- **CSS Grid**: Modern browsers (can generate Flexbox fallbacks)
- **Flexbox**: IE11+ (full support)
- **Templates**: Designed for IE11+ compatibility
- **Analysis**: Works with any valid CSS/HTML input