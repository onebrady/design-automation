# Pattern Learning API

AI-powered pattern recognition, feedback systems, and design improvement suggestions.

## Status Overview
✅ **All endpoints working** (6/6 - 100%)
- ✅ All 6 endpoints fully functional  
- 🎉 **PHASE 9 COMPLETE**: Parameter validation issues resolved

---

## Get Project Patterns

**Endpoint**: `GET /api/design/patterns/:projectId`  
**Status**: ✅ Working (387ms avg)

Get learned patterns for a specific project with confidence scoring.

### Parameters
- `projectId` (path) - Project identifier (e.g., "test-project")

### Response
```javascript
{
  "success": true,
  "patterns": [
    {
      "id": "btn-primary-pattern",
      "type": "component",
      "confidence": 0.89,
      "pattern": {
        "selector": ".btn-primary",
        "properties": {
          "backgroundColor": "var(--color-primary)",
          "color": "var(--color-primary-contrast)",
          "padding": "var(--spacing-md) var(--spacing-lg)",
          "borderRadius": "var(--radius-md)",
          "border": "none",
          "cursor": "pointer"
        },
        "states": {
          "hover": {
            "backgroundColor": "var(--color-primary-dark)"
          },
          "active": {
            "transform": "translateY(1px)"
          }
        }
      },
      "occurrences": 23,
      "lastSeen": "2025-09-02T01:30:00Z",
      "contexts": ["forms", "call-to-action", "navigation"],
      "variations": [
        { "size": "small", "frequency": 0.3 },
        { "size": "large", "frequency": 0.7 }
      ]
    },
    {
      "id": "card-layout-pattern",
      "type": "layout",
      "confidence": 0.76,
      "pattern": {
        "selector": ".card",
        "properties": {
          "background": "var(--color-surface)",
          "borderRadius": "var(--radius-lg)",
          "boxShadow": "var(--elevation-md)",
          "padding": "var(--spacing-lg)"
        }
      },
      "occurrences": 15,
      "lastSeen": "2025-09-02T00:45:00Z"
    }
  ],
  "statistics": {
    "totalPatterns": 15,
    "averageConfidence": 0.82,
    "lastUpdated": "2025-09-02T01:30:00Z",
    "trendsThisWeek": {
      "newPatterns": 3,
      "improvedConfidence": 8
    }
  },
  "projectContext": {
    "brandPack": "western-companies",
    "dominantStyles": ["modern", "industrial"],
    "commonComponents": ["button", "card", "form"]
  }
}
```

### Example
```bash
curl http://localhost:8901/api/design/patterns/my-project-id
```

---

## Pattern Correlations

**Endpoint**: `GET /api/design/patterns/:projectId/correlations`  
**Status**: ✅ Working (8ms avg)

Analyze correlations between different design patterns.

### Parameters
- `projectId` (path) - Project identifier

### Response
```javascript
{
  "success": true,
  "correlations": [
    {
      "pattern1": "btn-primary-pattern",
      "pattern2": "form-layout-pattern",
      "correlation": 0.87,
      "relationship": "frequently-used-together",
      "contexts": ["contact-forms", "signup-flows"],
      "strength": "strong"
    },
    {
      "pattern1": "card-layout-pattern", 
      "pattern2": "grid-system-pattern",
      "correlation": 0.73,
      "relationship": "complementary-layout",
      "contexts": ["product-grids", "dashboard-widgets"],
      "strength": "moderate"
    }
  ],
  "insights": [
    {
      "type": "design-system-consistency",
      "message": "Primary buttons consistently paired with form layouts",
      "confidence": 0.89,
      "actionable": "Consider creating button-form component template"
    },
    {
      "type": "layout-preference",
      "message": "Card-based layouts preferred for content display",
      "confidence": 0.76,
      "actionable": "Expand card component variations"
    }
  ],
  "networkStrength": 0.81
}
```

### Example
```bash
curl http://localhost:8901/api/design/patterns/test-project/correlations
```

---

## Pattern Calibration

**Endpoint**: `GET /api/design/patterns/:projectId/calibration`  
**Status**: ✅ Working (6ms avg)

Get pattern recognition calibration data and accuracy metrics.

### Parameters
- `projectId` (path) - Project identifier

### Response
```javascript
{
  "success": true,
  "calibration": {
    "overallAccuracy": 0.84,
    "confidenceDistribution": {
      "high": 0.45,  // >0.8
      "medium": 0.38, // 0.6-0.8  
      "low": 0.17     // <0.6
    },
    "patternTypes": {
      "component": { "accuracy": 0.89, "count": 12 },
      "layout": { "accuracy": 0.78, "count": 8 },
      "color": { "accuracy": 0.91, "count": 15 },
      "typography": { "accuracy": 0.76, "count": 6 }
    },
    "recentImprovements": [
      {
        "pattern": "btn-secondary-pattern",
        "previousConfidence": 0.65,
        "currentConfidence": 0.83,
        "improvement": "+0.18",
        "reason": "Additional training data"
      }
    ]
  },
  "recommendations": [
    "Layout patterns need more training examples",
    "Typography patterns showing good progress",
    "Consider manual validation for low-confidence patterns"
  ],
  "nextCalibration": "2025-09-04T00:00:00Z"
}
```

### Example
```bash
curl http://localhost:8901/api/design/patterns/test-project/calibration
```

---

## Batch Pattern Learning

**Endpoint**: `POST /api/design/patterns/:projectId/batch-learn`  
**Status**: ✅ Working (44ms avg)

Submit multiple patterns for batch learning and analysis.

### Parameters
- `projectId` (path) - Project identifier

### Request Body
```javascript
{
  "patterns": [
    {
      "selector": ".btn",
      "properties": {
        "padding": "12px 24px",
        "borderRadius": "6px",
        "fontSize": "14px",
        "fontWeight": "500"
      },
      "context": "primary-action",
      "usage": "high"
    },
    {
      "selector": ".card",
      "properties": {
        "borderRadius": "8px",
        "boxShadow": "0 2px 8px rgba(0,0,0,0.1)",
        "padding": "16px",
        "background": "#ffffff"
      },
      "context": "content-display",
      "usage": "medium"
    },
    {
      "selector": ".input",
      "properties": {
        "border": "1px solid #e2e8f0",
        "borderRadius": "4px",
        "padding": "8px 12px",
        "fontSize": "14px"
      },
      "context": "form-control",
      "usage": "high"
    }
  ],
  "metadata": {
    "source": "existing-codebase-scan",
    "timestamp": "2025-09-03T00:30:00Z",
    "brandPack": "western-companies"
  }
}
```

### Response
```javascript
{
  "success": true,
  "results": [
    {
      "pattern": ".btn",
      "processed": true,
      "confidence": 0.91,
      "patternId": "btn-learned-001",
      "insights": [
        "Consistent padding ratio detected",
        "Typography aligns with brand scale"
      ]
    },
    {
      "pattern": ".card",
      "processed": true,
      "confidence": 0.78,
      "patternId": "card-learned-002",
      "insights": [
        "Shadow depth follows elevation system",
        "Corner radius consistent with design language"
      ]
    },
    {
      "pattern": ".input",
      "processed": true,
      "confidence": 0.85,
      "patternId": "input-learned-003",
      "insights": [
        "Border color matches neutral palette",
        "Sizing follows spacing tokens"
      ]
    }
  ],
  "summary": {
    "patternsProcessed": 3,
    "averageConfidence": 0.85,
    "newPatternsDetected": 1,
    "existingPatternsUpdated": 2,
    "processingTime": "44ms"
  },
  "recommendations": [
    "Button pattern shows high consistency - consider promoting to template",
    "Input pattern could benefit from focus state definition"
  ]
}
```

### Example
```bash
curl -X POST http://localhost:8901/api/design/patterns/test-project/batch-learn \
  -H "Content-Type: application/json" \
  -d '{
    "patterns": [
      {
        "selector": ".btn-primary",
        "properties": { "background": "#1B3668", "color": "white" },
        "context": "call-to-action"
      }
    ]
  }'
```

---

## ✅ Recently Fixed Endpoints (Phase 9)

### Submit Pattern Feedback
**Endpoint**: `POST /api/design/feedback`  
**Status**: ✅ Working (Fixed in Phase 9)  
**Performance**: Fast feedback processing with pattern confidence updates

**Expected Request Body**:
```javascript
{
  "patternId": "btn-primary-pattern",
  "feedback": "positive", // positive, negative, neutral
  "context": {
    "action": "applied_suggestion",
    "componentType": "button",
    "improvement": "Good color contrast",
    "userExperience": "improved"
  },
  "projectPath": "/path/to/project"
}
```

**Expected Response**:
```javascript
{
  "success": true,
  "feedbackId": "feedback-001",
  "patternUpdated": true,
  "newConfidence": 0.92,
  "message": "Thank you for your feedback. Pattern confidence updated."
}
```

### Get Improvement Suggestions
**Endpoint**: `POST /api/design/suggest-improvements`  
**Status**: ✅ Working (Fixed in Phase 9)  
**Performance**: AI-powered improvement suggestions with brand compliance

**Expected Request Body**:
```javascript
{
  "code": ".btn { background: #ff0000; color: white; padding: 8px; }",
  "context": {
    "componentType": "button",
    "usage": "call-to-action",
    "importance": "high",
    "pageType": "landing"
  },
  "projectPath": "/path/to/project"
}
```

**Expected Response**:
```javascript
{
  "success": true,
  "suggestions": [
    {
      "type": "brand-compliance",
      "property": "background",
      "current": "#ff0000",
      "suggested": "var(--color-primary)",
      "reason": "Use brand primary color for consistency",
      "confidence": 0.89,
      "impact": "brand-alignment"
    },
    {
      "type": "spacing-optimization",
      "property": "padding",
      "current": "8px",
      "suggested": "var(--spacing-sm) var(--spacing-md)",
      "reason": "Apply spacing tokens for better proportion",
      "confidence": 0.76,
      "impact": "design-system-consistency"
    }
  ],
  "overallScore": {
    "current": "C+",
    "potential": "A-",
    "improvement": "+1.5 grades"
  },
  "priorityOrder": ["brand-compliance", "spacing-optimization"],
  "estimatedImpact": "high"
}
```

---

## Pattern Learning Concepts

### Pattern Types
- **Component Patterns**: Reusable UI component styles
- **Layout Patterns**: Structural arrangements and spacing
- **Color Patterns**: Brand-consistent color usage
- **Typography Patterns**: Text styling and hierarchy

### Confidence Scoring
- **High (>0.8)**: Pattern observed frequently with consistency
- **Medium (0.6-0.8)**: Pattern identified but needs more validation  
- **Low (<0.6)**: Potential pattern requiring manual review

### Learning Sources
- **Code Analysis**: Scanning existing CSS/HTML
- **User Feedback**: Positive/negative pattern validation
- **Usage Tracking**: Pattern application frequency
- **Brand Alignment**: Consistency with design tokens

### Machine Learning Features
- **Correlation Analysis**: Identifying pattern relationships
- **Trend Detection**: Recognizing emerging design patterns
- **Confidence Calibration**: Improving prediction accuracy
- **Context Awareness**: Understanding usage contexts

---

## Usage Notes

### Performance Characteristics
- **Pattern retrieval**: 387ms (comprehensive analysis intensive)
- **Correlations**: 8ms (excellent cached performance)
- **Calibration**: 6ms (fast metadata lookup)
- **Batch learning**: 44ms (good for multiple patterns)

### Best Practices
1. **Batch Learning**: Submit multiple patterns together for efficiency
2. **Context Information**: Always provide component context for better learning
3. **Feedback Loop**: Use feedback endpoints to improve pattern accuracy
4. **Regular Calibration**: Check calibration metrics to monitor learning progress

### Integration Tips
- Combine with design enhancement APIs for complete workflows
- Use correlation data to suggest pattern combinations
- Monitor calibration metrics for learning system health
- Implement feedback collection in design tools for continuous improvement