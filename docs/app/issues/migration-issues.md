# API Migration Issues

Documentation for API endpoints with implementation problems discovered during migration from `docs/api` to `docs/app/api`.

## Non-Existent Endpoints

### POST /api/design/enhance-batch

**Status**: ❌ **Does Not Exist**  
**Documented In**: `docs/api/advanced-transformations.md` (aspirational documentation)  
**Expected Behavior**: Multi-file batch processing for CSS transformations  
**Actual Behavior**: Returns 404 endpoint not found

**Error Response**:

```json
{
  "success": false,
  "error": "endpoint_not_found",
  "message": "Endpoint POST /api/design/enhance-batch not found",
  "details": {
    "method": "POST",
    "path": "/api/design/enhance-batch",
    "availableEndpoints": [
      "GET /api/health",
      "GET /api/context",
      "GET /api/brand-packs",
      "POST /api/brand-packs",
      "POST /api/design/enhance",
      "POST /api/design/enhance-cached",
      "POST /api/design/suggest-proactive"
    ]
  },
  "timestamp": "2025-09-06T03:39:17.262Z"
}
```

**Investigation Results**:

- Endpoint is not implemented in server routes
- Documentation includes complete request/response examples that are fictional
- No batch processing capability exists in current system

**Recommended Action**:

- Remove false documentation from `docs/api/advanced-transformations.md`
- Consider implementing if batch processing is needed
- Use individual transformation calls as alternative

**Migration Status**: Documentation removed, false information cleaned up

### POST /api/design/patterns/track

**Status**: ❌ **Does Not Exist**  
**Documented In**: `docs/api/design-enhancement.md` (aspirational documentation)  
**Expected Behavior**: Track pattern usage for machine learning improvements  
**Actual Behavior**: Returns 404 endpoint not found

**Error Response**:

```json
{
  "success": false,
  "error": "endpoint_not_found",
  "message": "Endpoint POST /api/design/patterns/track not found",
  "details": {
    "method": "POST",
    "path": "/api/design/patterns/track",
    "availableEndpoints": [
      "GET /api/health",
      "GET /api/context",
      "GET /api/brand-packs",
      "POST /api/brand-packs",
      "POST /api/design/enhance",
      "POST /api/design/enhance-cached",
      "POST /api/design/suggest-proactive"
    ]
  },
  "timestamp": "2025-09-06T05:41:58.178Z"
}
```

**Investigation Results**:

- Endpoint is not implemented in server routes despite being documented
- Related `GET /api/design/patterns/learned` endpoint does exist and works
- Documentation suggests fire-and-forget pattern tracking functionality
- No pattern tracking infrastructure exists in current implementation

**Recommended Action**:

- Remove false documentation from `docs/api/design-enhancement.md`
- Consider implementing pattern tracking if machine learning features needed
- Keep existing GET endpoint for pattern retrieval

**Migration Status**: False documentation identified, needs cleanup

## Non-Existent Brand Pack Endpoints

### GET /api/brand-packs/:id

**Status**: ❌ **Does Not Exist**  
**Documented In**: `docs/api/brand-packs.md` (aspirational documentation)  
**Expected Behavior**: Get specific brand pack by ID with full token system  
**Actual Behavior**: Returns 404 endpoint not found

### GET /api/brand-packs/:id/versions

**Status**: ❌ **Does Not Exist**  
**Documented In**: `docs/api/brand-packs.md` (aspirational documentation)  
**Expected Behavior**: Get version history for a brand pack  
**Actual Behavior**: Returns 404 endpoint not found

### GET /api/brand-packs/:id/export/css

**Status**: ❌ **Does Not Exist**  
**Documented In**: `docs/api/brand-packs.md` (aspirational documentation)  
**Expected Behavior**: Export brand pack tokens as CSS custom properties  
**Actual Behavior**: Returns 404 endpoint not found

### GET /api/brand-packs/:id/export/json

**Status**: ❌ **Does Not Exist**  
**Documented In**: `docs/api/brand-packs.md` (aspirational documentation)  
**Expected Behavior**: Export brand pack as JSON format for external tools  
**Actual Behavior**: Returns 404 endpoint not found

### POST /api/brand-packs/:id/version

**Status**: ❌ **Does Not Exist**  
**Documented In**: `docs/api/brand-packs.md` (aspirational documentation)  
**Expected Behavior**: Create new version of existing brand pack  
**Actual Behavior**: Returns 404 endpoint not found

**Investigation Summary**: Out of 8 documented endpoints in `docs/api/brand-packs.md`, only 3 actually exist (37.5% accuracy). The documentation contains extensive fictional examples with non-existent brand packs ("western-companies", "arm-truck-corp", "expanded-test") and complex token structures that don't match the simple actual implementation.

**Available Endpoints**: Only `GET /api/brand-packs`, `POST /api/brand-packs`, and `POST /api/brand-packs/generate-from-logo` are implemented.

**Migration Status**: Working endpoints already documented accurately in `docs/app/api/core/brand-management.md`

## ✅ RESOLVED: Primary Component Generation Endpoints

**Status**: All primary component generation endpoints have been successfully restored, validated, and migrated to docs/app/api.

### FULLY MIGRATED ENDPOINTS (2025-09-06):

1. **POST /api/design/generate-component** ✅ **Migrated** - Claude 4 Sonnet integration documented in [`docs/app/api/generation/components.md`](../api/generation/components.md)
2. **GET /api/design/templates** ✅ **Migrated** - Template system documented in [`docs/app/api/generation/templates.md`](../api/generation/templates.md)
3. **POST /api/design/visual-diff** ✅ **Migrated** - Visual comparison documented in [`docs/app/api/generation/visual-diff.md`](../api/generation/visual-diff.md)
4. **GET /api/design/sandbox-stats** ✅ **Migrated** - Analytics documented in [`docs/app/api/generation/sandbox-stats.md`](../api/generation/sandbox-stats.md)

**Migration Status**: ✅ **Complete** - All primary endpoints successfully migrated with 100% validation

## 🔍 Legacy/Testing Endpoints Requiring Investigation

**Status**: Endpoints found in component generation documentation that lack detailed documentation and appear to be development artifacts or incomplete features.

### POST /api/design/create-sandbox

**Status**: 🔍 **Needs Investigation**  
**Listed As**: "Create secure component development sandbox"  
**Current Documentation**: Brief description only, no detailed request/response documentation  
**Concerns**:

- Sandbox stats endpoint shows 0 active sandboxes, suggesting low/no usage
- Modern component development typically happens in main application context
- May be legacy testing infrastructure that's no longer needed

**Recommendation**: Investigate if sandbox creation is still relevant for current development workflow

### POST /api/design/customize-template

**Status**: 🔍 **Needs Investigation**  
**Listed As**: "⚠️ Template customization (exists but no templates loaded)"  
**Current Documentation**: Brief description only, warning about missing template data  
**Concerns**:

- Warning indicates broken/incomplete functionality
- Template listing endpoint works, but customization appears non-functional
- May be incomplete feature that was never properly implemented

**Recommendation**: Investigate if template customization should be implemented or removed

### POST /api/design/preview-component

**Status**: 🔍 **Needs Investigation**  
**Listed As**: "Component preview with validation"  
**Current Documentation**: Brief description only, no detailed request/response documentation  
**Concerns**:

- Component generation already provides comprehensive output
- Visual diff provides component comparison capabilities
- May be redundant with existing functionality

**Recommendation**: Investigate if preview functionality is redundant with existing endpoints

### Investigation Plan:

1. **Test endpoint existence** - Verify these endpoints actually respond
2. **Analyze functionality** - Determine if they provide unique value
3. **Check usage** - Review if they're used in current system
4. **Decision**: Either document properly or remove entirely

**Moved From**: `docs/api/component-generation.md` "Additional Available Endpoints" section  
**Date Added**: 2025-09-06

## False Documentation in docs/app/api/generation/components.md

**CRITICAL DISCOVERY**: The file `docs/app/api/generation/components.md` (191 lines) contains extensive false documentation that needs to be preserved here before cleanup.

### POST /api/design/generate-component (FALSE DOCUMENTATION)

**Status**: ❌ **Does Not Exist** (documented in docs/app/api but non-functional)  
**False Claims**:

- "Claude AI-powered component generation with natural language processing"
- "Response Time: ~14 seconds (AI processing intensive)"
- Complex response structure with brand compliance scoring
- Multi-framework output (HTML, CSS, JSX, Vue)
- Accessibility analysis with WCAG AA compliance
- Brand token integration with scoring

### POST /api/design/visual-diff (FALSE DOCUMENTATION)

**Status**: ❌ **Does Not Exist** (documented in docs/app/api but non-functional)
**False Claims**:

- "Response Time: ~1ms"
- Change detection between component variations
- Visual previews with before/after screenshots
- Improvement metrics and design system alignment
- Brand compliance scoring improvements

### POST /api/design/preview-component (FALSE DOCUMENTATION)

**Status**: ❌ **Does Not Exist** (documented in docs/app/api but non-functional)  
**False Claims**:

- "Secure sandbox execution for component testing"
- Live preview with real-time rendering
- Brand context with automatic token application
- Multiple framework preview capabilities
- Isolated execution environment

**Investigation**: The entire `docs/app/api/generation/components.md` file contains aspirational documentation for non-existent functionality, representing a severe documentation integrity issue within the supposedly "verified" docs/app/api system.

**Action Required**: Complete replacement of this file with accurate documentation for only the verified working endpoint: `POST /api/design/create-sandbox`

---

**Last Updated**: 2025-09-06  
**Migration Context**: Evidence-based documentation migration from `docs/api` to `docs/app/api`
