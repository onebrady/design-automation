# Agent Integration Protocol (Level 3 Automation)

## Goal

Create a seamless, intelligent partnership between AI agents and the design system where agents work transparently with zero manual intervention, leveraging pattern learning and intelligent caching for optimal, brand-aligned design output.

## AGENTS.md (Seamless Integration)

### Level 3 Automation Protocol

**Zero-Manual-Intervention Workflow:**

1. **Automatic Context Detection**
   - System automatically detects project brand pack and design patterns
   - No manual API calls required - agents work transparently

2. **Intelligent Pre-Generation**
   - Pattern learning provides proactive suggestions before generation
   - Context-aware guidance based on project history and user preferences

3. **Transparent Enhancement**
   - Automatic enhancement with intelligent caching for instant results
   - Pattern-aware optimizations applied seamlessly

4. **Continuous Learning**
   - System learns from each interaction to improve future suggestions
   - Usage patterns inform brand pack evolution

### Environment Overrides & Discovery

- Env vars (highest priority):
  - `AGENTIC_BRAND_PACK_ID`, `AGENTIC_BRAND_VERSION`, `AGENTIC_PROJECT_ID`
  - `AGENTIC_MONGO_URI` (default `mongodb://localhost:27017`), `AGENTIC_DB_NAME` (default `agentic_design`)
  - `AGENTIC_DISABLE=1` (disable), `AGENTIC_STRICT=1` (fail hard on unresolved)
  - Auto-apply controls: `AGENTIC_AUTO_APPLY=safe|off|all` (default `safe`), `AGENTIC_AUTO_APPLY_MAX_CHANGES=5`
- Discovery order:
  1. env → 2) `.agentic/config.json` → 3) `package.json` `agentic.*` → 4) `brand-pack.ref.json|brand-pack.json` → 5) DB mapping → 6) auto-bind if exactly one brand exists → 7) degraded.
- See `./docs/discovery.md` for details.

### Legacy API (Backward Compatibility)

```javascript
// Manual API calls (still supported for custom integrations)
GET /api/health
GET /api/context
POST /api/design/suggest-proactive { componentType, context, usePatterns: true }
POST /api/design/enhance-cached { code, codeType, componentType, cacheResults: true }
```

## Intelligent SDK (Zero-Config)

### Core Responsibilities

- **Automatic Project Detection**: Seamlessly identifies project context and active brand packs
- **Transparent Communication**: Handles all API communication without developer intervention
- **Intelligent Caching**: Manages local and MongoDB caching for optimal performance
- **Pattern Learning Integration**: Tracks usage and feeds back to learning system
- **Graceful Fallbacks**: Maintains functionality even when service is unavailable
- **Context Resolution**: Resolves current brand, project, and degraded state automatically

### Enhanced Features

- **Proactive Enhancement**: Automatically enhances code as it's generated
- **Context Awareness**: Understands component types, project structure, and user preferences
- **Performance Optimization**: Intelligent caching and batch processing
- **Learning Feedback Loop**: Provides usage data back to pattern learning system
- **Bundle Size Optimization**: Tree-shakeable with dynamic imports for advanced features
- **Status Notifications**: Emits Mongo availability and degraded mode changes

## Seamless IDE & Build Integrations

### Visual Studio Code Extension

- **Transparent Enhancement**: Automatically enhances files as you work (opt-in/opt-out)
- **Intelligent Status**: Shows pattern effectiveness, cache status, and suggestions
- **Proactive Commands**: "Optimize with patterns", "View usage analytics", "Update brand pack", "Toggle auto-apply (patterns)"
- **Background Learning**: Continuously learns from your editing patterns

### Vite Plugin (Dev-Only Intelligence)

- **Automatic Enhancement**: Seamlessly enhances components during development
- **Cache-Aware Processing**: Instant results for previously enhanced files
- **Pattern Integration**: Applies learned optimizations automatically
- **Performance Dashboard**: Real-time metrics on enhancement effectiveness

### Build Tool Integration

- **Git Hooks**: Intelligent pre-commit analysis with pattern validation
- **CI Integration**: Automated enhancement with caching and pattern learning
- **Performance Gates**: Bundle size and enhancement effectiveness monitoring
- **Pattern Controls**: Advisory-only by default; CI can enable auto-apply behind a ≥0.9 threshold and change caps

## Degraded Mode & Notifications

- If MongoDB is unreachable, the system runs in degraded mode using the on-disk lock snapshot if available.
- Notifications:
  - SDK event: `onStatus({ mongoAvailable, degraded, message })`
  - CLI prints a warning once per session and on state changes
  - VSCode status bar can show "Design: Degraded (Mongo offline)"
- `AGENTIC_STRICT=1` enforces hard failure for CI or strict environments.

## Enhanced Security & Privacy

- **Complete Local Control**: All data stays on your machine - no cloud transmission
- **Pattern Learning Privacy**: Usage patterns and preferences never leave local storage
- **MongoDB Local-Only**: Database runs locally with no external connections
- **Intelligent Opt-Ins**: Clear controls for any optional remote features
- **Data Sovereignty**: Full ownership and control of all design intelligence data
- **Audit Trail**: Local logging of all operations with user consent controls

## Automatic Triggers (Seamless Operation)

### Intelligent Auto-Activation

- **Component Creation**: Automatically detects and enhances new visual components
- **Style Modifications**: Transparent enhancement of any CSS/JSX/HTML style changes
- **File Operations**: Background processing when files are opened, saved, or committed
- **Project Context Changes**: Automatic adaptation when switching projects or brand packs

### Smart Filtering

- **Visual Work Detection**: Intelligent identification of design-related code changes
- **Performance Optimization**: Selective processing based on change impact and cache status
- **Pattern Recognition**: Context-aware activation based on learned usage patterns
- **Resource Management**: Automatic scaling based on system resources and user activity

## Enhanced Agent Tool Contract (Level 3)

```json
{
  "name": "design_intelligence_automated",
  "version": "3.0.0",
  "capabilities": ["automatic", "pattern_learning", "intelligent_caching"],
  "actions": [
    {
      "name": "context",
      "description": "Resolve current brand, project, and degraded status",
      "input": {
        "projectPath": "string?"
      },
      "output": {
        "brandPack": "object",
        "projectId": "string",
        "degraded": "boolean",
        "mongoAvailable": "boolean"
      }
    },
    {
      "name": "analyze-intelligent",
      "description": "Pattern-aware analysis with proactive suggestions",
      "input": {
        "code": "string",
        "codeType": "html|css|jsx|tsx",
        "context": "object",
        "usePatterns": "boolean?",
        "projectPath": "string?"
      },
      "output": {
        "metrics": "object",
        "patterns": "object",
        "suggestions": "array",
        "confidence": "number"
      }
    },
    {
      "name": "enhance-cached",
      "description": "Intelligent enhancement with caching",
      "input": {
        "code": "string",
        "codeType": "html|css|jsx|tsx",
        "componentType": "string?",
        "context": "object",
        "cacheResults": "boolean?",
        "usePatterns": "boolean?"
      },
      "output": {
        "code": "string",
        "changes": "array",
        "cacheHit": "boolean",
        "patternsApplied": "array"
      }
    },
    {
      "name": "suggest-proactive",
      "description": "Pattern-based proactive suggestions",
      "input": {
        "componentType": "string",
        "context": "object",
        "projectHistory": "boolean?"
      },
      "output": {
        "suggestions": "array",
        "confidence": "number",
        "basedOn": "string"
      }
    },
    {
      "name": "auto-enhance",
      "description": "Zero-config automatic enhancement",
      "input": {
        "projectPath": "string",
        "watchMode": "boolean?"
      },
      "capabilities": ["background_processing", "automatic_detection"]
    }
  ]
}
```

## AGENTS.md Template (Seamless Integration)

```markdown
# AGENTS.md — Level 3 Design Intelligence Protocol

## Seamless Automation

This project uses intelligent design automation with pattern learning and caching.

### For AI Agents:

- **No Manual API Calls Required**: The system automatically detects your work and applies optimizations
- **Transparent Enhancement**: Your generated code is automatically enhanced with brand compliance and best practices
- **Pattern Learning**: The system learns from your design patterns to provide better suggestions over time
- **Instant Caching**: Previously enhanced components are instantly re-optimized

### Key Features:

- **Automatic Brand Detection**: System knows which brand pack to use for this project
- **Intelligent Suggestions**: Proactive recommendations based on your usage patterns
- **Performance Optimization**: Cached results for instant enhancement of repeat components
- **Continuous Learning**: System improves suggestions based on your feedback and preferences

### Manual Override (Optional):

If you need to manually control enhancement:

1. Check service: GET http://localhost:3001/api/health
2. Check context: GET http://localhost:3001/api/context
3. Get suggestions: POST /api/design/suggest-proactive
4. Apply enhancement: POST /api/design/enhance-cached

### Supported Component Types:

Buttons, cards, forms, sections, pages, layout CSS, navigation, modals, and custom components.

### Fallback Behavior:

If service unavailable, proceed normally - all enhancements are optional and non-breaking.

### Environment Overrides:

For CI or local overrides, set:

- `AGENTIC_BRAND_PACK_ID`, `AGENTIC_BRAND_VERSION`
- `AGENTIC_MONGO_URI`, `AGENTIC_DB_NAME`
- `AGENTIC_DISABLE=1` to disable; `AGENTIC_STRICT=1` to fail hard
```

## Health & Context Endpoints

- `GET /api/health` → service status

```json
{
  "ok": true,
  "version": "1.0.0",
  "mongoAvailable": true,
  "degraded": false,
  "lastOkAt": "2025-01-15T10:30:00Z"
}
```

- `GET /api/context` → current brand/project context (see also `docs/discovery.md`)

```json
{
  "brandPack": {
    "id": "acme-brand",
    "version": "2.3.1",
    "source": "mongo|lock|env|config|package|marker"
  },
  "projectId": "8b9c2d9f-...",
  "overrides": {
    "tokens": {
      /* ... */
    }
  },
  "mongoAvailable": true,
  "degraded": false,
  "lastSync": "2025-01-15T10:30:00Z"
}
```
