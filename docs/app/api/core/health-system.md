# Core Health & System Endpoints

System health monitoring, status checks, and project context resolution.

## System Health Check

**Endpoint**: `GET /api/health`  
**Purpose**: MongoDB availability and system degradation status  
**Response Time**: <30ms

### Response Format

```json
{
  "ok": true,
  "version": "0.0.0",
  "degraded": false,
  "mongoAvailable": true,
  "lastOkAt": "2025-09-05T18:25:48.081Z"
}
```

### Usage

```bash
curl http://localhost:3001/api/health
```

## Project Context Resolution

**Endpoint**: `GET /api/context`  
**Purpose**: Resolve brand pack, generate project ID, check overrides  
**Response Time**: <100ms

### Response Format

```json
{
  "brandPack": {
    "id": "western-companies",
    "version": "1.0.0",
    "source": "db"
  },
  "projectId": "b8892a2e-0f5f-49f3-9ead-8b251a8270d4",
  "overrides": {},
  "degraded": false,
  "mongoAvailable": true,
  "source": "db"
}
```

### Usage

```bash
curl http://localhost:3001/api/context
```

## Integration Notes

- **Health Check Sequence**: Always verify /health before other operations
- **Context Dependency**: Most endpoints require project context for brand pack resolution
- **Error Handling**: Both endpoints return structured error responses
- **Performance**: Sub-100ms response times make them suitable for frequent polling

## Development Context

These endpoints serve as the foundation for all other API operations. The context endpoint establishes the brand pack context that other endpoints use for token resolution and styling decisions.

### Brand Pack Resolution Order

1. `.agentic/config.json` project configuration
2. Environment variable `AGENTIC_BRAND_PACK_ID`
3. Auto-detection from available brand packs in database
