# Semantic Context Analysis

HTML structure analysis, page context understanding, and semantic enhancement recommendations.

## Context Analysis

**Endpoint**: `POST /api/semantic/analyze-context`  
**Response Time**: ~15ms  
**Purpose**: Semantic context analysis with comprehensive page structure assessment

### Request Format

```json
{
  "html": "<div class=\"test\">test content</div>",
  "focusSelector": ".test"
}
```

### Response Features

```json
{
  "success": true,
  "context": {
    "pageStructure": {
      "hasHeader": false,
      "hasNavigation": false,
      "hasMain": false,
      "hasFooter": false,
      "landmarkCount": 0
    },
    "headingStructure": {
      "hasH1": false,
      "headingLevels": [],
      "headingHierarchy": "invalid",
      "missingLevels": ["h1"]
    },
    "accessibility": {
      "score": 77,
      "criticalIssues": 2,
      "wcagCompliance": {
        "level": "AA",
        "criteria": {
          "1.3.1": "fail",
          "2.4.1": "pass"
        }
      }
    },
    "recommendations": [
      {
        "priority": "high",
        "category": "semantic-structure",
        "title": "Add main content landmark",
        "description": "No main content area detected",
        "implementation": "Add <main> element or role=\"main\"",
        "impact": "screen-reader-navigation"
      }
    ]
  }
}
```

### Usage

```bash
curl -X POST http://localhost:3001/api/semantic/analyze-context \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<div class=\"test\">test content</div>",
    "focusSelector": ".test"
  }'
```

## Analysis Capabilities

### Page Structure Analysis

- **Landmark Detection**: Header, navigation, main, footer, aside elements
- **Semantic Elements**: Proper HTML5 semantic element usage
- **Document Outline**: Hierarchical content structure
- **Content Regions**: Logical content grouping analysis

### Heading Structure Validation

- **Hierarchy Compliance**: Proper H1-H6 nesting and ordering
- **Missing Levels**: Identification of skipped heading levels
- **Heading Distribution**: Appropriate heading usage throughout content
- **Screen Reader Impact**: How heading structure affects navigation

### Accessibility Context

- **WCAG Compliance**: Specific criterion evaluation
- **Critical Issues**: High-impact accessibility problems
- **Improvement Priority**: Ranked list of recommended fixes
- **Implementation Guidance**: Specific code changes needed

### Semantic Enhancement

- **Role Attributes**: ARIA role recommendations
- **Landmark Suggestions**: Where to add semantic landmarks
- **Navigation Structure**: Optimal navigation patterns
- **Content Organization**: Improved semantic organization

## Context Understanding Features

### Document Analysis

```json
{
  "documentType": "webpage",
  "contentType": "article",
  "primaryPurpose": "informational",
  "userIntent": "reading"
}
```

### Structural Insights

```json
{
  "complexity": "simple",
  "navigationalDepth": 2,
  "contentDensity": "moderate",
  "interactiveElements": 3
}
```

### Accessibility Scoring

```json
{
  "overallScore": 77,
  "categoryScores": {
    "semanticStructure": 65,
    "keyboardNavigation": 85,
    "screenReaderCompat": 70,
    "visualAccessibility": 90
  }
}
```

## Integration Patterns

### Context Analysis Workflow

```
HTML Input → Structure Analysis → Semantic Evaluation → Accessibility Assessment → Recommendations
```

### Enhancement Integration

```
Context Analysis → Issue Identification → Fix Prioritization → Implementation Guidance → Re-validation
```

## Recommendation Categories

### High Priority

- **Missing Landmarks**: Critical for screen reader navigation
- **Invalid Heading Structure**: Breaks content hierarchy
- **Accessibility Blockers**: Prevents access for disabled users

### Medium Priority

- **Semantic Improvements**: Better HTML element choices
- **ARIA Enhancements**: Improved assistive technology support
- **Navigation Optimization**: Better user experience patterns

### Low Priority

- **Best Practice Improvements**: Code quality enhancements
- **Performance Optimizations**: Faster rendering and interaction
- **Future-Proofing**: Emerging standards compliance

## Performance Characteristics

| Analysis Type     | Response Time   | Coverage                  |
| ----------------- | --------------- | ------------------------- |
| Basic Context     | 15ms            | Structure + accessibility |
| Detailed Analysis | 25-30ms         | Full semantic analysis    |
| Focused Element   | 10ms            | Single element context    |
| Batch Context     | 8ms per element | Multiple elements         |

## Development Context

The semantic context analysis system provides deep understanding of HTML document structure and accessibility characteristics. It serves as a semantic expert that can identify structural issues and provide specific improvement recommendations.

### Use Cases

- **Code Review**: Automated semantic and accessibility validation
- **Development Guidance**: Specific recommendations for better HTML structure
- **Accessibility Auditing**: Comprehensive WCAG compliance checking
- **Content Strategy**: Understanding content organization effectiveness
