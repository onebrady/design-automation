# Agentic Design Intelligence - Project Setup Guide

## Minimum Required Setup (for AI Agents)

For the Agentic Design Intelligence system to work automatically with AI-generated code, you need **ONLY** these two files in your project:

### 1. `.agentic/config.json`
```json
{
  "brandPackId": "your-brand-pack-id",
  "brandVersion": "1.0.0"
}
```

### 2. `AGENTS.md` (Optional but recommended)
This file informs AI agents that the project has automatic design enhancement enabled. Without it, agents won't know the system exists.

## That's It! 🎉

With just these two files:
- ✅ The system will automatically detect your project's brand pack
- ✅ AI-generated CSS will be enhanced with brand compliance
- ✅ No manual API calls needed
- ✅ No SDK installation required in the project
- ✅ Works transparently in the background

## Prerequisites (System Level)

The following must be running on the system (not in each project):

1. **Agentic Design Server**: Running on `http://localhost:8901`
   ```bash
   npm run start:server  # From the main agentic-design-platform directory
   ```

2. **MongoDB**: Running on `mongodb://localhost:27017`
   - Required for pattern learning and caching
   - Must be accessible for the server to start

## How It Works

1. **AI generates code** → Creates CSS/HTML/JSX files
2. **System detects changes** → Reads `.agentic/config.json`
3. **Automatic enhancement** → Applies brand tokens transparently
4. **Results cached** → Future similar patterns enhanced instantly

## Available Brand Packs

To see available brand packs:
```bash
curl http://localhost:8901/api/brand-packs
```

## Creating a New Brand Pack

### Option 1: Generate from Logo (Recommended)
```bash
curl -X POST http://localhost:8901/api/brand-packs/generate-from-logo \
  -F "logo=@your-logo.png" \
  -F "brandName=YourBrand" \
  -F "description=Your brand description"
```

### Option 2: Manual Creation via Studio
1. Open Studio: `http://localhost:5173` (or configured port)
2. Navigate to Brand Packs
3. Click "Create Manually" or "Generate from Logo"

## Testing Your Setup

1. **Verify server is running**:
   ```bash
   curl http://localhost:8901/api/health
   ```

2. **Check project context resolution**:
   ```bash
   curl http://localhost:8901/api/context
   ```

3. **Test enhancement** (optional):
   ```bash
   curl -X POST http://localhost:8901/api/design/enhance-cached \
     -H "Content-Type: application/json" \
     -d '{
       "code": ".button { padding: 10px; background: blue; }",
       "filePath": "test.css",
       "brandPackId": "your-brand-pack-id",
       "brandVersion": "1.0.0"
     }'
   ```

## Advanced Configuration (Optional)

### Additional config.json fields:
```json
{
  "brandPackId": "your-brand-pack-id",
  "brandVersion": "1.0.0",
  "projectId": "unique-project-id",  // Optional: for project-specific patterns
  "overrides": {                     // Optional: override specific tokens
    "colors.primary": "#custom-color"
  }
}
```

### Environment Variables (Override everything):
- `AGENTIC_BRAND_PACK_ID` - Override brand pack selection
- `AGENTIC_BRAND_VERSION` - Override version
- `AGENTIC_DISABLE=1` - Disable all enhancements
- `AGENTIC_STRICT=1` - Fail on errors instead of graceful fallback

## Troubleshooting

### System not detecting brand pack?
1. Check `.agentic/config.json` exists and is valid JSON
2. Verify brand pack ID exists: `curl http://localhost:8901/api/brand-packs`
3. Check server logs for errors

### Enhancements not applying?
1. Ensure MongoDB is running
2. Check that CSS values match brand pack tokens (or are close enough)
3. Verify server is running on port 8901

### Getting "service unavailable"?
- This is normal if server isn't running
- System gracefully falls back - your code still works
- Start server with `npm run start:server` from main directory

## For AI Agents

When you see `AGENTS.md` in a project, you should:
1. ✅ Generate code normally
2. ✅ Know that enhancements happen automatically
3. ❌ NOT make manual API calls (unless specifically requested)
4. ❌ NOT install SDK in the project (it's system-level)
5. ✅ Trust that the system handles brand compliance

## Summary

**Minimum viable setup = 2 files**:
1. `.agentic/config.json` (required)
2. `AGENTS.md` (recommended)

Everything else is handled by the system-level Agentic Design Platform.