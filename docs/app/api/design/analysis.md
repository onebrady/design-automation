# CSS Analysis API

CSS code analysis for metrics, issues, and design system opportunities without applying transformations.

## CSS Analysis

**Endpoint**: `POST /api/design/analyze`  
**Status**: ✅ Working  
**Response Time**: ~1ms  
**Implementation**: apps/server/routes/design.js:332

Analyzes CSS for metrics, issues, and opportunities without making any code changes.

### Request Body

```json
{
  "code": "<button>Click Me</button>",
  "css": "button { background: blue; color: white; }"
}
```

### Request Fields

- **code**: HTML code to analyze (optional)
- **css**: CSS code to analyze (required)

### Usage Example

```bash
curl -X POST http://localhost:3001/api/design/analyze \
  -H "Content-Type: application/json" \
  -d '{"code":"<button>Click Me</button>", "css":"button { background: blue; }"}'
```

### Response Format

```json
{
  "metrics": {
    "tokenAdherence": 0,
    "contrastAA": 1,
    "typeScaleFit": 1,
    "spacingConsistency": 1,
    "patternEffectiveness": 0,
    "size": { "rawBytes": 25 }
  },
  "issues": [],
  "opportunities": [],
  "patterns": {},
  "size": { "rawBytes": 25 }
}
```

### Response Fields

#### Metrics Object

- **tokenAdherence**: Design token usage score (0-1)
- **contrastAA**: WCAG AA contrast compliance score (0-1)
- **typeScaleFit**: Typography scale consistency score (0-1)
- **spacingConsistency**: Spacing pattern consistency score (0-1)
- **patternEffectiveness**: Design pattern effectiveness score (0-1)
- **size**: Object containing rawBytes count

#### Analysis Arrays

- **issues**: Array of detected problems requiring attention
- **opportunities**: Array of improvement suggestions
- **patterns**: Object containing detected design patterns

#### Size Information

- **rawBytes**: Total byte size of analyzed CSS

### Analysis Categories

The analysis evaluates CSS across multiple dimensions:

1. **Design System Compliance**: How well the CSS uses established design tokens
2. **Accessibility**: Contrast ratios, text sizing, and WCAG compliance
3. **Typography**: Scale consistency and hierarchy effectiveness
4. **Spacing**: Grid system and spacing token usage
5. **Pattern Recognition**: Component and utility pattern detection
6. **Performance**: File size and optimization opportunities

### Integration Notes

- **Read-only operation**: Does not modify the provided CSS
- **Fast analysis**: Optimized for real-time feedback
- **Comprehensive metrics**: Covers accessibility, performance, and design system compliance
- **Pattern detection**: Identifies reusable design patterns for system improvements

### Use Cases

1. **Design System Auditing**: Evaluate existing CSS against design standards
2. **Accessibility Checking**: Quick WCAG compliance verification
3. **Performance Analysis**: Identify optimization opportunities
4. **Pattern Discovery**: Find reusable components in existing code
5. **Code Quality Assessment**: Measure CSS maintainability and consistency

### Best Practices

1. **Include HTML context** when analyzing component-specific CSS
2. **Use for pre-transformation analysis** to understand current state
3. **Combine with enhancement endpoints** for complete design system migration
4. **Monitor metrics over time** to track design system adoption progress

## Development Context

This endpoint serves as the foundation for understanding CSS quality and design system compliance. It provides the analytical basis for other design enhancement endpoints while remaining completely non-destructive to the original code.
