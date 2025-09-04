# System Health & Configuration API

Core system health monitoring and project configuration endpoints.

## Status Overview
✅ **All endpoints working** (4/4 - 100%)

---

## Health Check

**Endpoint**: `GET /api/health`  
**Status**: ✅ Working (39ms avg)

Check system health including MongoDB connectivity.

### Response
```javascript
{
  "ok": true,
  "timestamp": "2025-09-03T00:30:00Z",
  "mongoAvailable": true,
  "lastOkAt": "2025-09-03T00:30:00Z"
}
```

### Example
```bash
curl http://localhost:8901/api/health
```

---

## Project Context Resolution  

**Endpoint**: `GET /api/context`  
**Status**: ✅ Working (8ms avg)

Resolve project context including brand pack configuration and discovery.

### Response
```javascript
{
  "projectPath": "/path/to/project",
  "brandPackId": "western-companies",
  "brandVersion": "1.0.0",
  "configSource": ".agentic/config.json",
  "tokens": {
    "colors": {
      "primary": "#1B3668",
      "secondary": "#2A4F8F"
    },
    "typography": {
      "heading": "Titillium Web",
      "body": "system-ui"
    }
  }
}
```

### Example
```bash
curl http://localhost:8901/api/context
```

---

## Project Configuration

**Endpoint**: `GET /api/project-config`  
**Status**: ✅ Working (1ms avg)

Get current project configuration from `.agentic/config.json`.

### Response
```javascript
{
  "brandPackId": "western-companies",
  "brandVersion": "1.0.0",
  "overrides": {}
}
```

### Example
```bash
curl http://localhost:8901/api/project-config
```

---

## Lock File Status

**Endpoint**: `GET /api/lock`  
**Status**: ✅ Working (1ms avg)

Get brand pack lock file information for dependency management.

### Response
```javascript
{
  "brandPackId": "western-companies",
  "version": "1.0.0",
  "integrity": "sha256-...",
  "resolved": "mongodb://localhost:27017",
  "lastUpdated": "2025-09-03T00:30:00Z"
}
```

### Example
```bash
curl http://localhost:8901/api/lock
```

---

## Usage Notes

- All endpoints require no authentication
- Extremely fast response times (1-39ms)
- Essential for system monitoring and debugging
- Used by SDK for automatic configuration resolution