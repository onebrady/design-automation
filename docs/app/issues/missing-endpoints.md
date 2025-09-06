# Missing API Endpoint Documentation

This file tracks API endpoints that are implemented in the server but have active issues requiring resolution.

## Status

**Last Updated**: 2025-09-06  
**Server Port**: 3001  
**Active Issues**: 0 endpoints with implementation issues

All previously identified missing endpoints have been resolved:

- ✅ `GET /api/project-config` - Documented in `docs/app/api/core/system-config.md`
- ✅ `GET /api/lock` - Documented in `docs/app/api/core/system-config.md`
- ✅ `POST /api/design/analyze` - Documented in `docs/app/api/design/analysis.md`
- ✅ `POST /api/design/enhance-cached` - Fixed implementation & documented in `docs/app/api/design/enhancement.md`
- ✅ `POST /api/design/optimize` - Documented in `docs/app/api/design/transformations.md`
- ✅ `GET /api/visual/stats` - Documented in `docs/app/api/intelligence/visual-analysis.md`
- ✅ `POST /api/visual/maintenance` - Documented in `docs/app/api/intelligence/visual-analysis.md`

## Guidelines

This file should only contain endpoints that have **active implementation issues**. Working endpoints that are missing documentation should be:

1. Tested and verified to work correctly
2. Added to appropriate documentation in `docs/app/api/`
3. Removed from this file once documented

For new missing endpoints discovered in the future, include:

- **Endpoint path and method**
- **Current status** (implementation error, function missing, etc.)
- **Error details** from actual testing
- **Expected functionality** based on codebase analysis
- **Implementation priority** (high/medium/low)
