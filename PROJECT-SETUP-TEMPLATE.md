# Agentic Design Platform - Project Setup Template

## Quick Setup (Copy & Paste)

### Step 1: Create Configuration
Create `.agentic/config.json` in your project root:

```bash
mkdir -p .agentic
cat > .agentic/config.json << 'EOF'
{
  "brandPackId": "western-companies",
  "brandVersion": "1.0.0",
  "projectId": "your-unique-project-id-here",
  "overrides": {}
}
EOF
```

### Step 2: Create Agent Instructions
Create `AGENTS.md` in your project root:

```bash
cat > AGENTS.md << 'EOF'
# Design Intelligence - Agent Instructions

This project uses the Agentic Design Platform for automatic CSS enhancement.

## For AI Agents:

1. **Auto-Detection**: System automatically detects brand pack "western-companies"
2. **Zero Config**: No manual API calls needed for basic usage
3. **Service**: Design intelligence server runs on http://localhost:8901

## SDK Usage (Node.js):

```javascript
const { enhance, enhanceCached, resolveProjectContext } = require('agentic-design-sdk');

// Get project context (automatic)
const context = await resolveProjectContext('./');

// Enhance CSS with caching
const result = enhanceCached({ 
  code: cssString, 
  filePath: 'src/styles.css',
  brandPackId: context.brandPack.id,
  brandVersion: context.brandPack.version
});
```

## API Usage (HTTP):

```bash
# Check service
curl http://localhost:8901/api/health

# Enhance CSS
curl -X POST http://localhost:8901/api/design/enhance-cached \
  -H "Content-Type: application/json" \
  -d '{"code":"CSS_HERE","filePath":"src/styles.css","brandPackId":"western-companies"}'
```

## Fallback:
If service unavailable, proceed normally - enhancements are optional.
EOF
```

### Step 3: Verify Setup
Test the configuration:

```bash
# Check if design service detects your project
curl -s http://localhost:8901/api/context | jq .

# Should return something like:
# {
#   "brandPack": { "id": "western-companies", "version": "1.0.0", "source": "config" },
#   "projectId": "your-unique-project-id-here",
#   "mongoAvailable": true,
#   "degraded": false
# }
```

## Alternative Methods:

### Method A: package.json
Add to existing package.json:
```json
{
  "name": "your-project",
  "agentic": {
    "brandPackId": "western-companies",
    "brandVersion": "1.0.0"
  }
}
```

### Method B: Environment Variables
```bash
export AGENTIC_BRAND_PACK_ID="western-companies"
export AGENTIC_BRAND_VERSION="1.0.0"
```

### Method C: Repo Marker
Create `brand-pack.ref.json`:
```json
{ "id": "western-companies", "version": "1.0.0" }
```

That's it! Agents can now automatically enhance CSS in this project.