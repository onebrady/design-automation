# Visual Intelligence System

GPT-4 Turbo vision integration for comprehensive design analysis and improvement routing.

## Visual Analysis Health Check

**Endpoint**: `GET /api/visual/health`  
**Response Time**: <50ms  
**Purpose**: OpenAI configuration, Playwright status, system readiness validation

### Response Format

```json
{
  "success": true,
  "visualAnalysisManager": true,
  "openaiConfigured": true,
  "playwrightAvailable": true,
  "timestamp": "2025-09-05T18:26:01.437Z",
  "systemStats": true,
  "status": "healthy"
}
```

### Usage

```bash
curl http://localhost:3001/api/visual/health
```

## Visual Design Analysis

**Endpoint**: `POST /api/visual/analyze`  
**Response Time**: ~28 seconds  
**Purpose**: Screenshot capture, comprehensive design analysis, improvement routing

### Features

- **Playwright Screenshot Generation**: High-fidelity webpage capture
- **GPT-4 Turbo Vision Analysis**: Forensic design analysis using advanced AI
- **6-Dimension Scoring**: hierarchy, typography, spacing, color, accessibility, brand
- **Smart Improvement Router**: Specific recommendations for design fixes

### Scoring Dimensions

1. **Visual Hierarchy** - Information organization and flow
2. **Typography** - Font choices, sizing, and readability
3. **Spacing & Layout** - White space usage and alignment
4. **Color Usage** - Contrast, harmony, and brand alignment
5. **Accessibility** - WCAG compliance and usability
6. **Brand Consistency** - Design system adherence

### Integration

- **Screenshot Engine**: Playwright-based webpage capture
- **AI Analysis**: GPT-4 Turbo with vision capabilities
- **Improvement Routing**: Connects analysis to specific enhancement endpoints

## Responsive Analysis

**Endpoint**: `POST /api/visual/analyze-responsive`  
**Purpose**: Multi-viewport analysis with device-specific recommendations

### Features

- **Multiple Viewports**: Mobile, tablet, desktop analysis
- **Device-Specific Insights**: Tailored recommendations per screen size
- **Responsive Issues**: Identifies layout problems across breakpoints

## Improvement Validation

**Endpoint**: `POST /api/visual/validate-improvements`  
**Purpose**: Before/after comparison for quality score improvement tracking

### Features

- **Quality Score Tracking**: Measures improvement in design metrics
- **Change Validation**: Confirms enhancement effectiveness
- **Progress Monitoring**: Tracks design system implementation progress

## Technical Architecture

### Screenshot Pipeline

```
HTML/CSS Input → Playwright → High-DPI Screenshot → GPT-4 Vision → Analysis Report
```

### AI Integration

- **Model**: GPT-4 Turbo with vision capabilities
- **Context**: Brand pack awareness for consistent analysis
- **Output**: Structured analysis with actionable recommendations

### Performance Characteristics

- **Analysis Time**: 26-31 seconds (AI processing intensive)
- **Screenshot Generation**: 2-3 seconds
- **AI Analysis**: 24-28 seconds
- **Accuracy**: High-quality forensic design analysis

## Usage Patterns

### Single Page Analysis

```bash
curl -X POST http://localhost:3001/api/visual/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html>...</html>",
    "css": "body { ... }",
    "projectPath": "/path/to/project"
  }'
```

### Responsive Analysis

```bash
curl -X POST http://localhost:3001/api/visual/analyze-responsive \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://example.com",
    "viewports": ["mobile", "tablet", "desktop"]
  }'
```

## Visual Analysis Statistics

**Endpoint**: `GET /api/visual/stats`  
**Status**: ✅ Working  
**Response Time**: ~1ms  
**Implementation**: apps/server/routes/visual.js:373

Returns visual analysis system statistics and configuration.

### Usage Example

```bash
curl -X GET http://localhost:3001/api/visual/stats
```

### Response Format

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "success": true,
    "screenshot": {
      "count": 0,
      "totalSize": 0,
      "directory": "D:\\Projects\\Tools\\Designs\\temp\\screenshots",
      "averageSize": 0
    },
    "vision": {
      "model": "gpt-4-turbo",
      "maxTokens": 4096,
      "temperature": 0.3,
      "retryAttempts": 3,
      "hasApiKey": true,
      "structuredOutput": false
    },
    "configuration": {
      "screenshotOptions": {
        "viewport": { "width": 1200, "height": 800 },
        "cleanup": { "autoCleanup": true, "maxAge": 300000, "maxFiles": 100 }
      }
    }
  },
  "timestamp": "2025-09-06T02:04:20.088Z"
}
```

### Response Fields

- **screenshot**: Current screenshot statistics (count, size, directory)
- **vision**: AI model configuration and API status
- **configuration**: System configuration including viewport and cleanup settings

## Visual Analysis Maintenance

**Endpoint**: `POST /api/visual/maintenance`  
**Status**: ✅ Working  
**Response Time**: ~1ms  
**Implementation**: apps/server/routes/visual.js:400

Perform maintenance cleanup of screenshots and temporary files.

### Request Format

```json
{
  "maxAge": 300000, // Optional: Max age in milliseconds
  "force": false // Optional: Force cleanup regardless of age
}
```

### Usage Example

```bash
curl -X POST http://localhost:3001/api/visual/maintenance \
  -H "Content-Type: application/json" \
  -d '{"maxAge": 300000, "force": false}'
```

### Response Format

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "success": true,
    "cleanedCount": 0,
    "remainingFiles": 0
  },
  "timestamp": "2025-09-06T02:04:36.682Z"
}
```

### Response Fields

- **cleanedCount**: Number of screenshots cleaned up
- **remainingFiles**: Number of files remaining after cleanup

## Development Context

The visual analysis system provides the most comprehensive design feedback available in the system. It serves as the "design expert" that can identify issues human designers would catch, making it invaluable for automated design improvement workflows.

### Integration Points

- **Enhancement Routing**: Analysis results include specific endpoint recommendations
- **Brand Awareness**: Uses project brand pack for consistent evaluation criteria
- **Quality Metrics**: Provides quantified improvement measurements
