# Layout Intelligence & Grid Systems

Layout structure analysis, responsive assessment, and intelligent grid recommendations.

## Layout Structure Analysis

**Endpoint**: `POST /api/layout/analyze`  
**Response Time**: <500ms  
**Purpose**: DOM structure, responsive analysis, spacing evaluation, accessibility scoring

### Features

- **Structure Analysis**: Element count, depth, containers, layout detection
- **Layout Type Detection**: Single-column, multi-column, grid detection with confidence scoring
- **Responsive Assessment**: Media query analysis, breakpoint recommendations
- **Semantic Structure**: Landmark detection, heading hierarchy validation
- **Accessibility Scoring**: WCAG compliance assessment with improvement suggestions

### Request Format

```json
{
  "html": "<div class=\"container\"><h1>Title</h1><p>Content</p></div>",
  "css": ".container { padding: 20px; }",
  "projectPath": "/test/project"
}
```

### Response Features

```json
{
  "structure": {
    "totalElements": 7,
    "depth": 2,
    "layoutElements": {
      "headers": 1,
      "navigation": 0,
      "main": 0
    }
  },
  "layoutType": {
    "type": "single-column",
    "confidence": 0.9
  },
  "suggestions": [
    {
      "type": "responsive",
      "priority": "high",
      "title": "Improve Responsiveness",
      "description": "Add media queries and use responsive units"
    }
  ]
}
```

### Usage

```bash
curl -X POST http://localhost:3001/api/layout/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<div class=\"container\"><h1>Title</h1><p>Content</p></div>",
    "css": ".container { padding: 20px; }",
    "projectPath": "/test/project"
  }'
```

## Grid System Intelligence

**Endpoint**: `POST /api/layout/grid-recommendations`  
**Purpose**: CSS Grid and layout optimization recommendations

### Features

- **Grid Pattern Recognition**: Identifies optimal grid structures
- **Layout Optimization**: Suggests improvements for better organization
- **Responsive Grid Systems**: Breakpoint-aware grid recommendations

## Template Matching

**Endpoint**: `POST /api/layout/template-matches`  
**Purpose**: Layout template pattern matching and customization suggestions

### Features

- **Pattern Recognition**: Matches layouts to predefined templates
- **Customization Suggestions**: Recommendations for template adaptation
- **Best Practice Application**: Applies proven layout patterns

## Layout Generation

**Endpoint**: `POST /api/layout/apply-template`  
**Purpose**: Apply selected template to existing layout

**Endpoint**: `GET /api/layout/templates`  
**Purpose**: Retrieve available layout templates

**Endpoint**: `POST /api/layout/generate-grid`  
**Purpose**: Generate CSS Grid systems based on content requirements

## Flexbox Analysis

**Endpoint**: `POST /api/layout/flexbox-analysis`  
**Purpose**: Analyze and optimize Flexbox layouts

### Features

- **Flexbox Optimization**: Identifies efficient flex patterns
- **Alignment Analysis**: Optimal alignment strategies
- **Responsive Flexbox**: Breakpoint-aware flex recommendations

## Flexbox Suggestions

**Endpoint**: `POST /api/layout/flexbox-suggestions`  
**Response Time**: Fast with pattern detection  
**Purpose**: Intelligent flexbox layout pattern recognition and recommendations

### Features

- **Pattern Detection**: Recognizes navigation, cards, sidebar, forms, media objects
- **Confidence Scoring**: Each pattern includes confidence level (0-1)
- **CSS Utilities**: Generates 50+ flexbox utility classes
- **Pattern-Specific CSS**: Tailored recommendations for detected patterns
- **Responsive Patterns**: Mobile-first breakpoint suggestions

### Request Format

```json
{
  "html": "<nav><a href='#'>Home</a><a href='#'>About</a><a href='#'>Contact</a></nav>",
  "css": ".nav { display: block; }",
  "options": {
    "includeResponsive": true
  }
}
```

### Response Features

```json
{
  "success": true,
  "patterns": [
    {
      "pattern": "horizontal-nav",
      "confidence": 0.8,
      "reason": "Multiple interactive elements suggest navigation"
    }
  ],
  "suggestions": [
    {
      "type": "layout",
      "priority": "high",
      "title": "Use Flexbox Layout",
      "description": "Convert to flexbox for better control",
      "css": { "display": "flex", "gap": "1rem" }
    }
  ],
  "recommendations": [
    {
      "type": "pattern",
      "priority": "high",
      "confidence": 0.8,
      "title": "Optimize Navigation Layout",
      "description": "Apply flexbox navigation pattern",
      "css": {
        "display": "flex",
        "justifyContent": "space-between",
        "alignItems": "center",
        "gap": "1.5rem"
      }
    }
  ],
  "utilities": {
    "flex": { "display": "flex" },
    "justify-center": { "justifyContent": "center" },
    "items-center": { "alignItems": "center" }
  },
  "score": 0.8,
  "metadata": {
    "patternsDetected": 1,
    "recommendationCount": 2,
    "hasFlexboxSupport": true
  }
}
```

### Pattern Types

- **horizontal-nav**: Navigation bars with aligned links
- **card-row**: Card layouts requiring wrap and gap
- **sidebar-main**: Two-column sidebar layouts
- **form-row**: Form field arrangements
- **media-object**: Image with adjacent content

### Usage Examples

```bash
# Basic flexbox suggestions
curl -X POST http://localhost:3001/api/layout/flexbox-suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<nav><a href=\"#\">Home</a><a href=\"#\">About</a></nav>"
  }'

# Card layout detection
curl -X POST http://localhost:3001/api/layout/flexbox-suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<div class=\"cards\"><div class=\"card\">1</div><div class=\"card\">2</div></div>",
    "css": ".cards { display: block; }"
  }'
```

### Integration

- **Connects to**: LayoutIntelligenceSystem.getFlexboxSuggestions()
- **Uses**: FlexboxAssistant for pattern detection and suggestions
- **Leverages**: Pattern recognition algorithms for layout types

## Spacing Optimization

**Endpoint**: `POST /api/layout/spacing-optimization`  
**Response Time**: 9-55ms  
**Purpose**: Advanced spacing analysis, consistency evaluation, and systematic optimization recommendations

### Features

- **Spacing Consistency Analysis**: Detects irregular spacing patterns and suggests systematic scales
- **Touch Target Optimization**: Ensures 44px minimum touch targets for mobile accessibility compliance
- **CSS Variable Generation**: Creates systematic spacing tokens (--spacing-xs to --spacing-xxl)
- **FlexBox Gap Integration**: Recommends CSS gap property over margin-based spacing
- **Brand Compliance Scoring**: Evaluates spacing against design system standards

### Request Format

```json
{
  "html": "<div class=\"container\"><button style=\"padding: 2px 3px\">Small Button</button><div style=\"margin: 15px 7px 22px 11px\">Inconsistent Spacing</div></div>",
  "css": ".container { padding: 5px 13px 9px 17px; }",
  "options": {
    "focusArea": "touch-targets",
    "checkTouchTargets": true
  }
}
```

### Response Features

```json
{
  "success": true,
  "currentSpacing": {
    "hasConsistentSpacing": false,
    "spacingValues": [5, 9, 13, 17],
    "rhythm": {
      "baseValue": 4,
      "ratio": 2,
      "scale": "modular-4"
    }
  },
  "recommendations": [
    {
      "type": "spacing-system",
      "priority": "high",
      "title": "Implement Consistent Spacing System",
      "description": "Replace inconsistent spacing with systematic scale",
      "solution": "Use consistent spacing tokens like 8px, 16px, 24px, 32px",
      "impact": "Improves visual hierarchy and design system compliance"
    }
  ],
  "optimizedCSS": {
    ".spacing-system": {
      "--spacing-xs": "4px",
      "--spacing-sm": "8px",
      "--spacing-md": "16px",
      "--spacing-lg": "24px",
      "--spacing-xl": "32px",
      "--spacing-xxl": "48px"
    },
    "button, .button, [role=\"button\"]": {
      "min-height": "44px",
      "min-width": "44px",
      "padding": "var(--spacing-sm) var(--spacing-md)"
    }
  },
  "score": 0.45,
  "metadata": {
    "analysisComplete": true,
    "spacingValuesFound": 4,
    "hasConsistentSpacing": false,
    "recommendationCount": 3
  }
}
```

### Usage Examples

```bash
# Basic spacing analysis
curl -X POST http://localhost:3001/api/layout/spacing-optimization \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<div class=\"container\"><button style=\"padding: 2px 3px\">Small Button</button></div>",
    "css": ".container { padding: 5px 13px 9px 17px; }"
  }'

# Touch target focused analysis
curl -X POST http://localhost:3001/api/layout/spacing-optimization \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<nav><a href=\"#\">Link 1</a><a href=\"#\">Link 2</a></nav>",
    "options": {"focusArea": "touch-targets"}
  }'
```

### Integration

- **Connects to**: LayoutIntelligenceSystem.analyzeLayout()
- **Uses**: FlexboxAssistant for gap recommendations
- **Leverages**: Existing spacing analysis from packages/layout/analyzer.js
- **Visual Analysis**: Integrated with smart router priority 2 for spacing issues

## Analysis Capabilities

### Structure Intelligence

- **DOM Depth Analysis**: Identifies overly complex or flat structures
- **Layout Element Detection**: Headers, navigation, main content, footers
- **Container Patterns**: Optimal container and wrapper usage
- **Semantic Structure**: Proper HTML5 semantic element usage

### Performance Analysis

- **DOM Complexity**: Rendering cost estimation
- **CSS Complexity**: Layout calculation overhead
- **Responsive Efficiency**: Breakpoint optimization opportunities

### Accessibility Assessment

- **Landmark Navigation**: Proper ARIA landmark usage
- **Heading Hierarchy**: H1-H6 structure validation
- **Focus Management**: Tab order and focus indication
- **Screen Reader Optimization**: Semantic structure for assistive technology

## Integration Patterns

### Layout Analysis Workflow

```
HTML/CSS Input → Structure Analysis → Layout Detection → Recommendations → Template Suggestions
```

### Grid System Generation

```
Content Analysis → Grid Requirements → CSS Grid Generation → Responsive Optimization
```

## Performance Characteristics

| Operation                | Response Time | Analysis Depth                          |
| ------------------------ | ------------- | --------------------------------------- |
| Structure Analysis       | <500ms        | Comprehensive DOM analysis              |
| Grid Recommendations     | 200-300ms     | Pattern matching                        |
| Template Matching        | 100-200ms     | Template comparison                     |
| Flexbox Analysis         | 150-250ms     | Flex pattern optimization               |
| **Flexbox Suggestions**  | **Fast**      | **Pattern detection + recommendations** |
| **Spacing Optimization** | **9-55ms**    | **Spacing analysis + CSS generation**   |

## Development Context

The layout intelligence system provides structural analysis and optimization recommendations for web layouts. It serves as an expert consultant for layout decisions, helping developers create well-structured, accessible, and responsive layouts.

### Key Capabilities

- **Automated Structure Assessment**: Identifies layout strengths and weaknesses
- **Template Integration**: Connects analysis to proven layout patterns
- **Accessibility Focus**: Ensures layouts work for all users
- **Performance Awareness**: Considers rendering performance in recommendations
