# Brand Pack Management

Brand pack CRUD operations, Redis/MongoDB hybrid data layer, and AI logo analysis.

## List All Brand Packs

**Endpoint**: `GET /api/brand-packs`  
**Purpose**: Retrieve all brand packs with Redis-first fallback  
**Response Time**: <100ms

### Response Format

```json
{
  "success": true,
  "message": "Brand packs retrieved successfully",
  "data": [
    {
      "id": "redis-test-brand",
      "name": "Redis Test Brand",
      "version": "1.0.0",
      "description": "",
      "tokens": {
        "primary": "#ff0000",
        "secondary": "#00ff00"
      },
      "created": "2025-09-04T12:44:45.952Z",
      "updated": "2025-09-04T12:44:45.952Z"
    }
  ],
  "timestamp": "2025-09-05T18:27:04.923Z"
}
```

### Usage

```bash
curl http://localhost:3001/api/brand-packs
```

## Create Brand Pack

**Endpoint**: `POST /api/brand-packs`  
**Purpose**: Create new brand packs with tokens, colors, typography  
**Features**: Validation, token generation, version management

### Request Format

```json
{
  "name": "My Brand",
  "description": "Brand description",
  "tokens": {
    "primary": "#1B3668",
    "secondary": "#E1A100",
    "accent": "#00A86B"
  }
}
```

## AI Logo Analysis

**Endpoint**: `POST /api/brand-packs/generate-from-logo`  
**Purpose**: Generate comprehensive brand pack from logo upload  
**Features**: Multipart upload, Anthropic Claude integration, token generation

### Integration

- **Claude Vision**: Analyzes uploaded logo for color palette extraction
- **Token Generation**: Creates comprehensive design token system
- **Brand Guidelines**: Generates usage recommendations and style guide

### Usage

```bash
curl -X POST http://localhost:3001/api/brand-packs/generate-from-logo \
  -F "logo=@/path/to/logo.png" \
  -F "name=My Company Brand"
```

## Data Layer Architecture

### Redis-First Strategy

- **Primary Storage**: Redis for fast brand pack retrieval
- **Fallback**: MongoDB for persistence and backup
- **Cache Strategy**: Redis TTL with MongoDB sync
- **Performance**: Sub-100ms responses from Redis layer

### Storage Patterns

```javascript
// Redis key pattern
brand_pack:${brandPackId} -> JSON data

// MongoDB collection
db.brand_packs.find({ id: brandPackId })
```

## Development Integration

### Brand Pack Resolution

```javascript
// Automatic resolution in other endpoints
{
  "projectPath": "/path/to/project", // Required for brand context
  // System automatically resolves to appropriate brand pack
}
```

### Token Usage

Brand packs provide design tokens used across all transformation endpoints:

- `var(--color-primary)` - Primary brand color
- `var(--color-secondary)` - Secondary brand color
- `var(--spacing-sm)` - Small spacing token
- `var(--font-heading)` - Heading font family

## Performance Characteristics

- **List Operations**: <100ms (Redis cached)
- **Create Operations**: 200-500ms (includes validation)
- **Logo Analysis**: 10-15s (Claude API processing)
- **Cache Hit Rate**: >95% for brand pack retrieval
