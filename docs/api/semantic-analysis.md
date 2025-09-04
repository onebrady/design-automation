# Semantic Analysis API

HTML semantic enhancement, accessibility analysis, and component detection.

## Status Overview
✅ **All endpoints working** (14/14 - 100%)
- ✅ All 14 endpoints fully functional
- 🎉 **PHASE 9 COMPLETE**: Parameter validation issues resolved

---

## Semantic Analysis

**Endpoint**: `POST /api/semantic/analyze`  
**Status**: ✅ Working (29ms avg)

Comprehensive semantic analysis of HTML content.

### Request Body
```javascript
{
  "html": "<div class=\"container\"><h1>Hello World</h1><button class=\"btn\">Click me</button></div>",
  "options": {
    "includeAccessibility": true,
    "includeComponents": true,
    "includeRelationships": true
  }
}
```

### Response
```javascript
{
  "success": true,
  "analysis": {
    "components": [
      {
        "type": "heading",
        "element": "h1",
        "confidence": 0.98,
        "semanticScore": "A",
        "text": "Hello World",
        "accessibility": {
          "issues": [],
          "score": "AA",
          "wcagLevel": "AA"
        }
      },
      {
        "type": "button",
        "element": "button", 
        "confidence": 0.95,
        "semanticScore": "B+",
        "accessibility": {
          "issues": ["Missing aria-label"],
          "score": "A",
          "wcagLevel": "AA"
        }
      }
    ],
    "relationships": [
      {
        "parent": "div.container",
        "child": "h1",
        "relationship": "content-container"
      },
      {
        "parent": "div.container",
        "child": "button",
        "relationship": "action-container"
      }
    ],
    "overallScore": "A-",
    "recommendations": [
      {
        "type": "accessibility",
        "message": "Add aria-label to button for better screen reader support",
        "element": "button.btn",
        "severity": "medium"
      }
    ]
  }
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/semantic/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<form><input type=\"email\" /><button type=\"submit\">Submit</button></form>",
    "options": { "includeAccessibility": true }
  }'
```

---

## Detect Components

**Endpoint**: `POST /api/semantic/detect-components`  
**Status**: ✅ Working (11ms avg)

Detect and classify UI components in HTML.

### Request Body
```javascript
{
  "html": "<nav><ul><li><a href=\"#\">Home</a></li><li><a href=\"#\">About</a></li></ul></nav>"
}
```

### Response
```javascript
{
  "success": true,
  "components": [
    {
      "type": "navigation",
      "element": "nav",
      "confidence": 0.96,
      "children": [
        {
          "type": "navigation-list",
          "element": "ul",
          "confidence": 0.94
        },
        {
          "type": "navigation-item",
          "element": "li",
          "confidence": 0.92,
          "count": 2
        },
        {
          "type": "link",
          "element": "a",
          "confidence": 0.98,
          "count": 2
        }
      ],
      "patterns": ["horizontal-navigation", "list-based-nav"]
    }
  ],
  "statistics": {
    "totalComponents": 4,
    "averageConfidence": 0.95,
    "mostCommon": "link"
  }
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/semantic/detect-components \
  -H "Content-Type: application/json" \
  -d '{"html": "<div class=\"card\"><h2>Title</h2><p>Content</p></div>"}'
```

---

## Accessibility Analysis

**Endpoint**: `POST /api/semantic/analyze-accessibility`  
**Status**: ✅ Working (5ms avg)

Focused accessibility analysis with WCAG compliance checking.

### Request Body
```javascript
{
  "html": "<img src=\"image.jpg\" /><button>Click</button>"
}
```

### Response
```javascript
{
  "success": true,
  "accessibility": {
    "score": "C+",
    "wcagLevel": "A",
    "issues": [
      {
        "type": "missing-alt-text",
        "element": "img",
        "severity": "high",
        "message": "Image missing alt attribute for screen readers",
        "wcagReference": "1.1.1"
      },
      {
        "type": "insufficient-button-text",
        "element": "button",
        "severity": "medium", 
        "message": "Button text 'Click' is not descriptive enough",
        "wcagReference": "2.4.6"
      }
    ],
    "recommendations": [
      {
        "element": "img",
        "fix": "Add alt=\"Description of image content\"",
        "impact": "screen-reader-access"
      },
      {
        "element": "button",
        "fix": "Change text to be more descriptive, e.g., 'Submit form'",
        "impact": "user-understanding"
      }
    ],
    "complianceLevel": {
      "A": false,
      "AA": false,
      "AAA": false
    }
  }
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/semantic/analyze-accessibility \
  -H "Content-Type: application/json" \
  -d '{"html": "<div role=\"button\" tabindex=\"0\">Custom Button</div>"}'
```

---

## Generate ARIA

**Endpoint**: `POST /api/semantic/generate-aria`  
**Status**: ✅ Working (5ms avg)

Generate ARIA enhancements for better accessibility.

### Request Body
```javascript
{
  "html": "<div class=\"modal\"><h2>Modal Title</h2><p>Modal content</p><button>Close</button></div>",
  "componentAnalysis": {
    "type": "modal",
    "role": "dialog"
  }
}
```

### Response
```javascript
{
  "success": true,
  "enhancedHtml": "<div class=\"modal\" role=\"dialog\" aria-labelledby=\"modal-title\" aria-describedby=\"modal-content\" aria-modal=\"true\"><h2 id=\"modal-title\">Modal Title</h2><p id=\"modal-content\">Modal content</p><button aria-label=\"Close modal\">Close</button></div>",
  "ariaEnhancements": [
    {
      "element": "div.modal",
      "added": ["role=\"dialog\"", "aria-labelledby=\"modal-title\"", "aria-describedby=\"modal-content\"", "aria-modal=\"true\""],
      "reason": "Modal dialog accessibility"
    },
    {
      "element": "h2",
      "added": ["id=\"modal-title\""],
      "reason": "Modal title reference"
    },
    {
      "element": "p",
      "added": ["id=\"modal-content\""],
      "reason": "Modal description reference"
    },
    {
      "element": "button",
      "added": ["aria-label=\"Close modal\""],
      "reason": "Descriptive button label"
    }
  ]
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/semantic/generate-aria \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<div class=\"dropdown\"><button>Options</button><ul><li>Item 1</li></ul></div>",
    "componentAnalysis": { "type": "dropdown", "role": "menu" }
  }'
```

---

## Enhance HTML Semantics

**Endpoint**: `POST /api/semantic/enhance-html`  
**Status**: ✅ Working (22ms avg)

Comprehensive HTML semantic enhancement.

### Request Body
```javascript
{
  "html": "<div><div>Header</div><div>Content</div><div>Footer</div></div>"
}
```

### Response
```javascript
{
  "success": true,
  "enhancedHtml": "<div><header>Header</header><main>Content</main><footer>Footer</footer></div>",
  "enhancements": [
    {
      "original": "div",
      "enhanced": "header",
      "reason": "Detected header content pattern",
      "confidence": 0.89
    },
    {
      "original": "div",
      "enhanced": "main",
      "reason": "Detected main content area",
      "confidence": 0.92
    },
    {
      "original": "div",
      "enhanced": "footer",
      "reason": "Detected footer content pattern",
      "confidence": 0.87
    }
  ],
  "semanticImprovement": {
    "before": "D+",
    "after": "A-",
    "improvement": "+2.5 grades"
  }
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/semantic/enhance-html \
  -H "Content-Type: application/json" \
  -d '{"html": "<div class=\"nav\"><div>Home</div><div>About</div></div>"}'
```

---

## Component Relationships

**Endpoint**: `POST /api/semantic/component-relationships`  
**Status**: ✅ Working (9ms avg)

Analyze relationships between HTML components.

### Request Body
```javascript
{
  "html": "<form><fieldset><legend>Contact Info</legend><input type=\"email\" /><button type=\"submit\">Send</button></fieldset></form>"
}
```

### Response
```javascript
{
  "success": true,
  "relationships": [
    {
      "type": "form-container",
      "parent": "form",
      "child": "fieldset",
      "relationship": "groups-related-controls"
    },
    {
      "type": "fieldset-legend",
      "parent": "fieldset", 
      "child": "legend",
      "relationship": "describes-group"
    },
    {
      "type": "form-control",
      "parent": "fieldset",
      "child": "input[type=email]",
      "relationship": "data-input"
    },
    {
      "type": "form-action",
      "parent": "fieldset",
      "child": "button[type=submit]",
      "relationship": "submit-action"
    }
  ],
  "hierarchy": {
    "form": {
      "fieldset": {
        "legend": {},
        "input[type=email]": {},
        "button[type=submit]": {}
      }
    }
  }
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/semantic/component-relationships \
  -H "Content-Type: application/json" \
  -d '{"html": "<article><h1>Title</h1><p>Content</p><aside>Related</aside></article>"}'
```

---

## Semantic Score

**Endpoint**: `POST /api/semantic/score`  
**Status**: ✅ Working (1ms avg)

Calculate semantic quality score for HTML.

### Request Body
```javascript
{
  "html": "<main><article><h1>Article Title</h1><p>Article content</p></article></main>"
}
```

### Response
```javascript
{
  "success": true,
  "score": {
    "overall": "A-",
    "numeric": 8.7,
    "breakdown": {
      "semantic_elements": 9.2,
      "accessibility": 8.1,
      "structure": 8.9,
      "headings": 9.0
    },
    "factors": {
      "semantic_html5_usage": 0.95,
      "heading_hierarchy": 0.89,
      "aria_usage": 0.78,
      "landmark_usage": 0.91
    }
  },
  "improvements": [
    "Add more specific ARIA labels",
    "Consider adding skip navigation links"
  ]
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/semantic/score \
  -H "Content-Type: application/json" \
  -d '{"html": "<div><span>Title</span><p>Content</p></div>"}'
```

---

## Get Recommendations

**Endpoint**: `POST /api/semantic/recommendations`  
**Status**: ✅ Working (1ms avg)

Get semantic improvement recommendations.

### Request Body
```javascript
{
  "html": "<div class=\"header\"><div class=\"title\">Site Title</div></div>",
  "context": {
    "pageType": "landing",
    "userType": "general"
  }
}
```

### Response
```javascript
{
  "success": true,
  "recommendations": [
    {
      "type": "semantic-element",
      "priority": "high",
      "element": "div.header",
      "suggestion": "Replace with <header> element",
      "reason": "Improves semantic structure and accessibility",
      "example": "<header><h1>Site Title</h1></header>"
    },
    {
      "type": "heading-hierarchy",
      "priority": "medium",
      "element": "div.title",
      "suggestion": "Use <h1> instead of generic div",
      "reason": "Page title should be primary heading",
      "example": "<h1>Site Title</h1>"
    }
  ],
  "priorityCount": {
    "high": 1,
    "medium": 1,
    "low": 0
  }
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/semantic/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<div><div>Menu</div><div>Content</div></div>",
    "context": { "pageType": "blog", "userType": "reader" }
  }'
```

---

## Quick Accessibility Check

**Endpoint**: `POST /api/semantic/quick-accessibility-check`  
**Status**: ✅ Working (6ms avg)

Fast accessibility validation for common issues.

### Request Body
```javascript
{
  "html": "<img src=\"photo.jpg\" /><a href=\"#\">Link</a><input type=\"text\" />"
}
```

### Response
```javascript
{
  "success": true,
  "issues": [
    {
      "element": "img",
      "issue": "missing-alt",
      "severity": "high",
      "message": "Image missing alt attribute"
    },
    {
      "element": "a",
      "issue": "empty-link",
      "severity": "medium", 
      "message": "Link has no descriptive text"
    },
    {
      "element": "input",
      "issue": "missing-label",
      "severity": "high",
      "message": "Form input missing label"
    }
  ],
  "score": "F",
  "quickFixes": [
    "Add alt=\"\" to images",
    "Provide descriptive link text",
    "Add <label> elements to form inputs"
  ]
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/semantic/quick-accessibility-check \
  -H "Content-Type: application/json" \
  -d '{"html": "<button></button><select><option>Choose</option></select>"}'
```

---

## Analyze Context

**Endpoint**: `POST /api/semantic/analyze-context`  
**Status**: ✅ Working (1ms avg)

Analyze HTML elements within their surrounding context.

### Request Body
```javascript
{
  "html": "<p>Contact us today</p>",
  "surrounding": "<section><h2>Get in Touch</h2><p>Contact us today</p><form>...</form></section>"
}
```

### Response
```javascript
{
  "success": true,
  "context": {
    "section": "contact",
    "purpose": "call-to-action",
    "relationship": "intro-text",
    "semanticRole": "promotional-content"
  },
  "suggestions": [
    {
      "type": "enhancement",
      "suggestion": "Consider making this text more prominent with <strong> tag",
      "reason": "Functions as call-to-action introduction"
    }
  ]
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/semantic/analyze-context \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<button>Submit</button>",
    "surrounding": "<form><input type=\"email\"><button>Submit</button></form>"
  }'
```

---

## Accessibility Report

**Endpoint**: `POST /api/semantic/accessibility-report`  
**Status**: ✅ Working (6ms avg)

Comprehensive accessibility report with WCAG compliance.

### Request Body
```javascript
{
  "html": "<main><h1>Page Title</h1><nav><ul><li><a href=\"#\">Link</a></li></ul></nav></main>",
  "wcagLevel": "AA"
}
```

### Response
```javascript
{
  "success": true,
  "report": {
    "overallScore": "B+",
    "wcagCompliance": {
      "A": true,
      "AA": false,
      "AAA": false
    },
    "categories": {
      "perceivable": {
        "score": "A-",
        "issues": 1,
        "guidelines": ["1.1", "1.3", "1.4"]
      },
      "operable": {
        "score": "B",
        "issues": 2, 
        "guidelines": ["2.1", "2.4"]
      },
      "understandable": {
        "score": "A",
        "issues": 0,
        "guidelines": ["3.1", "3.2"]
      },
      "robust": {
        "score": "A",
        "issues": 0,
        "guidelines": ["4.1"]
      }
    },
    "detailedIssues": [
      {
        "guideline": "2.4.4",
        "level": "A",
        "element": "a",
        "issue": "Link text '#' is not descriptive",
        "impact": "medium"
      }
    ],
    "summary": {
      "totalIssues": 3,
      "highImpact": 0,
      "mediumImpact": 2,
      "lowImpact": 1
    }
  }
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/semantic/accessibility-report \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<div role=\"button\" tabindex=\"0\">Click me</div>",
    "wcagLevel": "AAA"
  }'
```

---

## Get Semantic Stats

**Endpoint**: `GET /api/semantic/stats`  
**Status**: ✅ Working (1ms avg)

Get semantic analysis system statistics.

### Response
```javascript
{
  "success": true,
  "stats": {
    "totalAnalyses": 1250,
    "averageScore": "B+",
    "commonIssues": [
      { "type": "missing-alt-text", "frequency": 0.45 },
      { "type": "poor-heading-hierarchy", "frequency": 0.32 },
      { "type": "missing-labels", "frequency": 0.28 }
    ],
    "improvementTrends": {
      "semantic_elements": "+15% this month",
      "accessibility_scores": "+8% this month"
    },
    "processingTime": {
      "average": "12ms",
      "fastest": "1ms",
      "slowest": "89ms"
    }
  }
}
```

### Example
```bash
curl http://localhost:8901/api/semantic/stats
```

---

## ✅ Recently Fixed Endpoints (Phase 9)

### Detect Component Type
**Endpoint**: `POST /api/semantic/detect-component-type`  
**Status**: ✅ Working (Fixed in Phase 9)  
**Performance**: Fast component type detection with AI classification

**Expected Request Body**:
```javascript
{
  "html": "<button class=\"btn-primary\">Submit</button>"
}
```

### Batch Semantic Analysis
**Endpoint**: `POST /api/semantic/batch-analyze`  
**Status**: ✅ Working (Fixed in Phase 9)  
**Performance**: Efficient batch processing for large project analysis

**Expected Request Body**:
```javascript
{
  "pages": [
    { "url": "/home", "html": "<main><h1>Home</h1></main>" },
    { "url": "/about", "html": "<main><h1>About</h1></main>" }
  ]
}
```

---

## Usage Notes

### Performance
- Most endpoints respond in 1-11ms (excellent performance)
- Semantic analysis is more intensive (29ms avg) but comprehensive
- Quick accessibility check optimized for speed (6ms)

### Accessibility Features
- Full WCAG 2.1 compliance checking
- Automatic ARIA generation
- Contextual accessibility recommendations
- Multiple severity levels (high/medium/low)

### AI-Powered Detection
- Component type recognition with confidence scores
- Relationship analysis between HTML elements
- Context-aware semantic enhancement suggestions
- Pattern recognition for common UI components

### Integration Tips
1. Use quick accessibility check for real-time validation
2. Combine component detection with enhancement APIs
3. Run comprehensive analysis for detailed reports
4. Cache semantic scores for performance optimization