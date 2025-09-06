# CSS Enhancement & Basic Transformations

Basic CSS enhancement with brand token replacement, spacing normalization, and color mapping.

## Basic CSS Enhancement

**Endpoint**: `POST /api/design/enhance`  
**Purpose**: Apply brand tokens, spacing normalization, color mapping  
**Response Time**: <100ms

### Request Format

```json
{
  "code": ".button { color: red; }",
  "projectPath": "/test/project"
}
```

### Response Format

```json
{
  "success": true,
  "code": ".button { color: red; }",
  "changes": [],
  "metricsDelta": {},
  "brandCompliance": {}
}
```

### Usage

```bash
curl -X POST http://localhost:3001/api/design/enhance \
  -H "Content-Type: application/json" \
  -d '{"code": ".button { color: red; }", "projectPath": "/test/project"}'
```

## Enhancement Features

### Brand Token Integration

- **Color Mapping**: Converts hardcoded colors to brand tokens
- **Spacing Normalization**: Applies consistent spacing scale
- **Typography Tokens**: Maps fonts to brand typography system

### Change Tracking

- **Before/After Comparison**: Detailed change documentation
- **Metrics Delta**: Quantified improvement measurements
- **Brand Compliance Scoring**: Alignment with design system

## Integration Patterns

### Standard Request Pattern

```json
{
  "code": "/* CSS or HTML code */",
  "projectPath": "/path/to/project",
  "options": {
    "feature-specific": "options"
  }
}
```

### Standard Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "timestamp": "ISO-timestamp"
}
```

### Error Handling

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "details": {},
  "timestamp": "ISO-timestamp"
}
```

## Performance Characteristics

- **Response Time**: <100ms for standard operations
- **Cache Strategy**: Token resolution cached for repeated operations
- **Throughput**: High - suitable for real-time editing workflows

## Cached Enhancement

**Endpoint**: `POST /api/design/enhance-cached`  
**Status**: ✅ Working  
**Response Time**: ~5ms  
**Implementation**: apps/server/routes/design.js:440

Enhanced CSS transformation with caching for improved performance. Supports multiple code types including CSS, HTML, JSX, TSX, and JavaScript.

### Request Body

```json
{
  "code": ".button { color: red; background: blue; }",
  "codeType": "css",
  "componentType": "button",
  "brandPackId": "western-companies",
  "projectPath": "/path/to/project",
  "filePath": "",
  "brandVersion": ""
}
```

### Request Fields

- **code**: Source code to enhance (required)
- **codeType**: Type of code - css, html, jsx, tsx, js (default: css)
- **componentType**: Component type for context (optional)
- **brandPackId**: Brand pack identifier (optional)
- **projectPath**: Project path for context resolution (default: cwd)
- **tokens**: Explicit tokens object (optional)
- **filePath**: File path for caching key (optional)
- **brandVersion**: Brand pack version (optional)

### Response Format

```json
{
  "success": true,
  "code": ".button { color: blue; }",
  "changes": [],
  "cacheHit": false,
  "patternsApplied": []
}
```

### Response Fields

- **success**: Operation success status
- **code**: Enhanced code output
- **changes**: Array of applied transformations
- **cacheHit**: Whether result came from cache
- **patternsApplied**: Array of applied patterns

### Usage Example

```bash
curl -X POST http://localhost:3001/api/design/enhance-cached \
  -H "Content-Type: application/json" \
  -d '{
    "code": ".btn { color: blue; }",
    "componentType": "button",
    "brandPackId": "western-companies"
  }'
```

### Multi-Language Support

- **CSS**: Direct enhancement with design tokens
- **HTML**: Extracts and enhances `<style>` tags
- **JSX/TSX**: Component-aware transformations
- **JavaScript**: CSS-in-JS pattern enhancement

## Development Context

The basic enhancement endpoint serves as the foundation for all other transformation endpoints. It provides consistent brand token application that more advanced transformations build upon.

### Extension Points

- Additional enhancement endpoints build on this foundation
- Advanced transformations use the same token resolution system
- Batch processing available for multiple files
