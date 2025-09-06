# System Configuration API

Core system configuration and status endpoints for project management and brand pack coordination.

## Project Configuration

**Endpoint**: `GET /api/project-config`  
**Status**: ✅ Working  
**Response Time**: ~1ms  
**Implementation**: apps/server/routes/config.js:15

Returns project configuration from `.agentic/config.json` file.

### Usage Example

```bash
curl -X GET http://localhost:3001/api/project-config
```

### Response Format

```json
{} // Returns empty object when no config file exists
```

### Purpose

- Provides access to project-level configuration settings
- Returns empty object `{}` if config file doesn't exist
- Used for project context and environment setup

### Integration Notes

- Configuration file location: `.agentic/config.json`
- Safe file reading with fallback to empty object
- No authentication required

## Brand Pack Lock Status

**Endpoint**: `GET /api/lock`  
**Status**: ✅ Working  
**Response Time**: ~1ms  
**Implementation**: apps/server/routes/config.js:8

Returns brand pack lock file information from `.agentic/brand-pack.lock.json`.

### Usage Example

```bash
curl -X GET http://localhost:3001/api/lock
```

### Response Format

```json
{
  "id": "test-brand-pack",
  "version": "1.0.0",
  "etag": null,
  "lastSync": "2025-09-05T18:40:25.771Z",
  "source": "redis"
}
```

### Response Fields

- **id**: Brand pack identifier
- **version**: Current brand pack version
- **etag**: ETag for cache validation (nullable)
- **lastSync**: Timestamp of last synchronization
- **source**: Data source location (redis/local/etc)

### Purpose

- Track brand pack synchronization status
- Provide version information for cache validation
- Monitor brand pack source and update timing

### Integration Notes

- Lock file location: `.agentic/brand-pack.lock.json`
- Safe file reading with fallback to empty object
- Used by brand pack management system for consistency

## Development Context

These endpoints provide essential system configuration data for:

1. **Project Context**: Understanding current project settings and environment
2. **Brand Pack Management**: Tracking brand pack versions and synchronization
3. **Cache Coordination**: Supporting cache invalidation and version management
4. **System Health**: Basic configuration validation and status reporting

Both endpoints are lightweight, fast-responding, and designed for frequent polling by client applications.
