# Visual Analysis API

**API Base**: `/api/visual`  
**Status**: ✅ Fully Operational  
**Endpoints**: 6 implemented  
**Model**: GPT-4 Turbo with Vision  
**Screenshot Engine**: Playwright

## Overview

The Visual Analysis API provides AI-powered visual intelligence for design optimization. It captures screenshots of HTML/CSS code, analyzes them using GPT-4 Turbo's vision capabilities, and provides detailed design critiques with actionable endpoint recommendations.

### Key Features

- **Aggressive Failure Detection**: Harsh scoring system (20-35/100 for flawed designs) using forensic analysis
- **Smart Endpoint Routing**: Automatically maps visual issues to specific API endpoints for fixes
- **Multi-Viewport Analysis**: Responsive design validation across mobile, tablet, and desktop
- **Before/After Validation**: Quantifiable improvement metrics for design changes
- **Automated Cleanup**: Automatic screenshot management to prevent disk space issues

## Architecture

```
HTML Code → Screenshot Capture → AI Visual Analysis → Smart Routing → Targeted Fixes
            (Playwright)         (GPT-4 Turbo)        (SmartRouter)   (Existing APIs)
```

### Core Components

1. **ScreenshotEngine** (`packages/visual-analysis/screenshot-engine.js`)
   - Playwright-based browser automation
   - Configurable viewport sizes
   - Automatic cleanup and resource management

2. **VisionAI** (`packages/visual-analysis/vision-ai.js`)
   - GPT-4 Turbo integration (superior to GPT-5 for critical analysis)
   - Multi-pass forensic analysis prompts
   - Structured response parsing

3. **SmartRouter** (`packages/visual-analysis/smart-router.js`)
   - Maps visual violations to specific endpoints
   - Priority-based fix ordering
   - Automated fix application with validation

## Endpoints

### 1. POST /api/visual/analyze

Comprehensive visual analysis of HTML code with AI-powered design critique.

**Request Body:**

```json
{
  "code": "<html>...</html>",
  "brandPackId": "optional-brand-id",
  "projectPath": "/path/to/project",
  "viewport": {
    "width": 1200,
    "height": 800
  },
  "analysisType": "comprehensive",
  "designPrinciples": ["hierarchy", "spacing", "typography", "color", "accessibility"],
  "includeScreenshot": false
}
```

**Response:**

```json
{
  "success": true,
  "analysisId": "visual_analysis_1234567890_abc123",
  "duration": 28000,
  "analysis": {
    "overallScore": 28,
    "designScores": {
      "hierarchy": 15,
      "typography": 20,
      "spacing": 25,
      "color": 35,
      "accessibility": 30,
      "brand": 40
    },
    "criticalIssues": [
      {
        "issue": "CRITICAL: Body text 12px fails minimum 16px standard",
        "severity": "critical",
        "location": "body text elements",
        "evidence": "Measured font-size: 12px on body text",
        "recommendedEndpoint": "/api/design/enhance-typography",
        "parameters": {
          "focusArea": "body-text",
          "adjustment": "increase-to-16px"
        },
        "confidence": 95
      },
      {
        "issue": "CRITICAL: H1 heading only 16px, should be 24px+ for proper hierarchy",
        "severity": "critical",
        "location": "h1 elements",
        "evidence": "H1 font-size matches body text size",
        "recommendedEndpoint": "/api/design/enhance-typography",
        "parameters": {
          "focusArea": "headings",
          "adjustment": "establish-hierarchy"
        },
        "confidence": 92
      }
    ],
    "improvementOpportunities": [
      {
        "area": "spacing",
        "description": "Inconsistent margins between sections",
        "impact": "medium",
        "endpoint": "/api/layout/spacing-optimization"
      }
    ],
    "endpointRecommendations": [
      {
        "endpoint": "/api/design/enhance-typography",
        "priority": 1,
        "reason": "Fix critical typography violations"
      },
      {
        "endpoint": "/api/semantic/analyze-accessibility",
        "priority": 2,
        "reason": "Address contrast and WCAG compliance"
      }
    ],
    "executionOrder": [
      "/api/design/enhance-typography",
      "/api/semantic/analyze-accessibility",
      "/api/layout/spacing-optimization"
    ],
    "estimatedQualityGain": 44
  },
  "metadata": {
    "timestamp": "2024-12-04T10:30:00Z",
    "model": "gpt-4-turbo",
    "analysisContext": {
      "viewport": { "width": 1200, "height": 800 },
      "designPrinciples": ["hierarchy", "spacing", "typography", "color", "accessibility"]
    }
  }
}
```

**Error Responses:**

- `400` - Missing required field (code)
- `503` - Visual analysis service unavailable (OpenAI API key not configured)
- `500` - Analysis failed

### 2. POST /api/visual/analyze-responsive

Analyze design across multiple viewports for responsive design validation.

**Request Body:**

```json
{
  "code": "<html>...</html>",
  "viewports": [
    { "width": 320, "height": 568 }, // Mobile
    { "width": 768, "height": 1024 }, // Tablet
    { "width": 1440, "height": 900 } // Desktop
  ],
  "brandPackId": "optional-brand-id",
  "projectPath": "/path/to/project"
}
```

**Response:**

```json
{
  "success": true,
  "analysisId": "responsive_analysis_1234567890_xyz789",
  "duration": 85000,
  "responsiveScore": 72,
  "viewportAnalyses": [
    {
      "viewport": { "width": 320, "height": 568 },
      "analysis": {
        "success": true,
        "overallScore": 65,
        "criticalIssues": [
          {
            "issue": "Touch targets too small for mobile",
            "severity": "high",
            "recommendedEndpoint": "/api/layout/mobile-optimization"
          }
        ],
        "improvementOpportunities": []
      }
    },
    {
      "viewport": { "width": 768, "height": 1024 },
      "analysis": {
        "success": true,
        "overallScore": 75,
        "criticalIssues": [],
        "improvementOpportunities": [
          {
            "area": "layout",
            "description": "Could utilize tablet screen space better"
          }
        ]
      }
    },
    {
      "viewport": { "width": 1440, "height": 900 },
      "analysis": {
        "success": true,
        "overallScore": 78,
        "criticalIssues": [],
        "improvementOpportunities": []
      }
    }
  ],
  "responsiveIssues": [
    {
      "type": "consistency",
      "description": "Font sizes don't scale properly across viewports",
      "affectedViewports": ["320x568", "768x1024"],
      "severity": "medium"
    }
  ],
  "recommendations": [
    "Implement fluid typography using clamp() or viewport units",
    "Increase touch target sizes for mobile devices",
    "Add tablet-specific layout optimizations"
  ],
  "metadata": {
    "timestamp": "2024-12-04T10:35:00Z",
    "viewports": [
      { "width": 320, "height": 568 },
      { "width": 768, "height": 1024 },
      { "width": 1440, "height": 900 }
    ],
    "model": "gpt-4-turbo"
  }
}
```

### 3. POST /api/visual/validate-improvements

Compare before and after versions to validate design improvements.

**Request Body:**

```json
{
  "originalCode": "<html><!-- original version --></html>",
  "improvedCode": "<html><!-- improved version --></html>",
  "brandPackId": "optional-brand-id",
  "projectPath": "/path/to/project",
  "viewport": { "width": 1200, "height": 800 }
}
```

**Response:**

```json
{
  "success": true,
  "validationId": "validation_1234567890_def456",
  "duration": 56000,
  "improvements": {
    "scoreIncrease": 44,
    "percentageIncrease": 157.14,
    "resolvedIssues": [
      "Body text increased from 12px to 16px",
      "H1 hierarchy established with 32px font size",
      "Contrast ratios improved to WCAG AA compliance"
    ],
    "remainingIssues": ["Some interactive elements still below 44px touch target"],
    "categoryImprovements": {
      "typography": { "before": 20, "after": 85, "change": 65 },
      "accessibility": { "before": 30, "after": 75, "change": 45 },
      "hierarchy": { "before": 15, "after": 80, "change": 65 }
    }
  },
  "recommendation": "Accept changes",
  "original": {
    "analysisId": "visual_analysis_1234567890_orig",
    "overallScore": 28,
    "criticalIssues": 4
  },
  "improved": {
    "analysisId": "visual_analysis_1234567890_imp",
    "overallScore": 72,
    "criticalIssues": 1
  }
}
```

### 4. GET /api/visual/stats

Retrieve visual analysis system statistics.

**Response:**

```json
{
  "success": true,
  "totalAnalyses": 156,
  "averageAnalysisTime": 28500,
  "averageScore": 45,
  "screenshotStats": {
    "totalCaptured": 312,
    "averageSize": 92000,
    "cleanedUp": 250,
    "currentActive": 62
  },
  "modelUsage": {
    "gpt-4-turbo": {
      "requests": 156,
      "averageTokens": 3200,
      "averageResponseTime": 24000
    }
  },
  "endpointRecommendations": {
    "/api/design/enhance-typography": 89,
    "/api/semantic/analyze-accessibility": 67,
    "/api/layout/spacing-optimization": 45
  },
  "timestamp": "2024-12-04T10:40:00Z"
}
```

### 5. POST /api/visual/maintenance

Perform maintenance cleanup of screenshots and temporary files.

**Request Body:**

```json
{
  "maxAge": 300000, // Optional: Max age in milliseconds (default: 5 minutes)
  "force": false // Optional: Force cleanup regardless of age
}
```

**Response:**

```json
{
  "success": true,
  "screenshotsCleaned": 45,
  "spaceReclaimed": 4128000,
  "remainingScreenshots": 12,
  "nextCleanupScheduled": "2024-12-04T10:45:00Z"
}
```

### 6. GET /api/visual/health

Health check for the visual analysis system.

**Response (Healthy):**

```json
{
  "success": true,
  "status": "healthy",
  "visualAnalysisManager": true,
  "openaiConfigured": true,
  "playwrightAvailable": true,
  "systemStats": true,
  "timestamp": "2024-12-04T10:42:00Z"
}
```

**Response (Degraded/Unavailable):**

```json
{
  "success": false,
  "status": "unavailable",
  "visualAnalysisManager": false,
  "openaiConfigured": false,
  "playwrightAvailable": true,
  "missingRequirements": [
    "Visual analysis manager initialization failed",
    "OpenAI API key not configured"
  ],
  "timestamp": "2024-12-04T10:42:00Z"
}
```

## Configuration

### Environment Variables

```bash
# Required for visual analysis
OPENAI_API_KEY=sk-...              # OpenAI API key for GPT-4 Turbo vision

# Optional configuration
VISUAL_MODEL=gpt-4-turbo           # Vision model (default: gpt-4-turbo)
VISUAL_MAX_TOKENS=4096              # Max tokens for analysis (default: 4096)
VISUAL_TEMPERATURE=0.3              # Model temperature (default: 0.3)
SCREENSHOT_CLEANUP_AGE=300000      # Auto-cleanup age in ms (default: 5 minutes)
SCREENSHOT_MAX_FILES=100            # Max screenshots before cleanup (default: 100)
```

### Initialization Options

```javascript
const visualAnalysisManager = new VisualAnalysisManager({
  screenshot: {
    viewport: { width: 1200, height: 800 },
    cleanup: {
      autoCleanup: true,
      maxAge: 5 * 60 * 1000, // 5 minutes
      maxFiles: 100,
    },
  },
  vision: {
    model: 'gpt-4-turbo',
    maxTokens: 4096,
    temperature: 0.3,
    retryAttempts: 3,
  },
  analysis: {
    defaultPrinciples: ['hierarchy', 'spacing', 'typography', 'color', 'accessibility'],
    includeEndpointRouting: true,
  },
});
```

## Integration with Existing Endpoints

The Visual Analysis system enhances existing design endpoints by providing visual guidance:

```javascript
// Standard enhancement (without visual guidance)
POST /api/design/enhance
{ "code": "...", "tokens": "..." }

// Enhanced with visual guidance from visual analysis
POST /api/design/enhance
{
  "code": "...",
  "tokens": "...",
  "visualGuidance": {
    "detectedIssues": ["poor-contrast", "small-text"],
    "focusAreas": ["typography", "accessibility"],
    "confidenceLevel": 0.92,
    "expectedOutcome": "improve-readability"
  }
}
```

## Performance Metrics

Based on production testing:

- **Screenshot Capture**: ~2-3 seconds
- **AI Analysis (GPT-4 Turbo)**: ~24-28 seconds
- **Total Analysis Time**: ~26-31 seconds
- **Multi-viewport Analysis**: ~80-90 seconds (3 viewports)
- **Improvement Validation**: ~50-60 seconds (2 analyses)
- **Cache Hit Rate**: N/A (real-time analysis)

## Use Cases

### 1. Automated Design QA

```javascript
// Analyze design and automatically apply fixes
const analysis = await fetch('/api/visual/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code: htmlCode }),
});

if (analysis.overallScore < 50) {
  // Apply recommended fixes
  for (const endpoint of analysis.executionOrder) {
    await applyFix(endpoint, analysis.endpointRecommendations);
  }
}
```

### 2. CI/CD Integration

```javascript
// Validate design improvements before merging
const validation = await fetch('/api/visual/validate-improvements', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    originalCode: mainBranchCode,
    improvedCode: featureBranchCode,
  }),
});

if (validation.improvements.scoreIncrease < 0) {
  throw new Error('Design regression detected');
}
```

### 3. Responsive Design Testing

```javascript
// Test design across all device sizes
const responsive = await fetch('/api/visual/analyze-responsive', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: htmlCode,
    viewports: [
      { width: 320, height: 568 }, // iPhone SE
      { width: 768, height: 1024 }, // iPad
      { width: 1920, height: 1080 }, // Desktop
    ],
  }),
});

// Check for responsive issues
if (responsive.responsiveScore < 70) {
  console.warn('Responsive design needs improvement', responsive.responsiveIssues);
}
```

## Error Handling

All endpoints follow the standard error response format:

```json
{
  "success": false,
  "error": "error_code",
  "message": "Human readable error message",
  "details": {
    "field": "specific_field",
    "reason": "detailed_reason"
  }
}
```

Common error codes:

- `missing_field` - Required parameter missing
- `service_unavailable` - OpenAI API key not configured
- `analysis_failed` - Visual analysis failed
- `screenshot_failed` - Screenshot capture failed
- `validation_failed` - Improvement validation failed

## Best Practices

1. **Always check service availability** before making requests:

   ```javascript
   const health = await fetch('/api/visual/health');
   if (health.status !== 'healthy') {
     // Handle degraded service
   }
   ```

2. **Use appropriate viewports** for your target audience:
   - Mobile: 320x568 (minimum) to 414x896 (modern phones)
   - Tablet: 768x1024 (iPad) to 1024x1366 (iPad Pro)
   - Desktop: 1440x900 (common) to 1920x1080 (full HD)

3. **Batch analyses** when possible to reduce API calls:
   - Use responsive analysis for multiple viewports
   - Cache analysis results for repeated designs

4. **Monitor improvement metrics** to track design quality:
   - Set minimum score thresholds (e.g., 60/100)
   - Track score improvements over time
   - Alert on design regressions

5. **Clean up resources** regularly:
   - Call maintenance endpoint periodically
   - Monitor disk usage for screenshot storage
   - Set appropriate cleanup intervals

## Limitations

- **Requires OpenAI API key** for GPT-4 Turbo vision model
- **Processing time** of 25-30 seconds per analysis
- **Cost considerations** at ~$0.01-0.02 per analysis
- **Screenshot accuracy** depends on CSS complexity and browser rendering
- **Not suitable for** dynamic content or JavaScript-heavy interfaces

## Migration Guide

For teams currently using manual design review:

1. **Start with validation** - Use validate-improvements to compare manual fixes
2. **Gradual automation** - Begin with low-risk design elements
3. **Set conservative thresholds** - Start with high confidence recommendations only
4. **Monitor results** - Track improvement metrics and adjust parameters
5. **Full automation** - Once confident, integrate into CI/CD pipeline
