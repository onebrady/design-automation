# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development & Testing
```bash
npm run start:server     # Start API server on port 8901
npm run lint            # ESLint with zero warnings policy
npm run typecheck       # TypeScript checking
npm run tests           # Discovery and integration tests
npm run doctor          # Preflight system check - run before development
```

### Core Engine & Performance
```bash
npm run engine:snapshots    # Transform golden tests
npm run engine:guardrails   # Safety validation tests
npm run cache:tests         # Caching system validation
npm run perf:cached         # Performance benchmarks (target: <100ms p95)
```

### SDK & Integration Testing
```bash
npm run sdk:tests       # SDK functionality validation
npm run sdk:auto        # Auto-enhancement tests
npm run plugin:tests    # Vite plugin integration tests
```

## Architecture

### Tech Stack
- **Monorepo**: pnpm workspaces (apps/, packages/, examples/)
- **Runtime**: Node.js 20+ with TypeScript support
- **Database**: MongoDB (local at mongodb://localhost:27017)
- **Server**: Express.js API on port 3001

### Key Packages Structure
- `apps/server/` - Express API server (main backend)
- `packages/engine/` - Deterministic CSS transformation engine
- `packages/sdk/` - Zero-config SDK for agent integration
- `packages/discovery/` - Project context resolution system
- `packages/cache/` - Multi-level caching with signature validation

### Configuration Resolution Priority
The system resolves configuration in strict priority order:
1. Environment variables (`AGENTIC_*`)
2. `.agentic/config.json`
3. `package.json` agentic field
4. `brand-pack.ref.json` markers
5. MongoDB project mapping
6. Auto-bind (single brand pack scenarios)
7. Lock file fallback

### Core API Endpoints
- `GET /api/health` - MongoDB status and system health
- `GET /api/context` - Project brand pack resolution
- `POST /api/design/enhance` - CSS transformation
- `POST /api/design/enhance-cached` - Cached transformation
- `GET /api/design/suggest-proactive` - Pattern-based suggestions

## Development Guidelines

### Safety Guardrails (Critical)
The engine enforces strict safety constraints:
- AA contrast maintenance for all color changes
- Maximum 5 changes per file (configurable via `AGENTIC_AUTO_APPLY_MAX_CHANGES`)
- Vendor/generated code exclusion (node_modules, .min.js, etc.)
- Idempotent transforms (re-running produces no diff)
- Ignore markers support (`/* agentic:ignore */`)

### Agent-Driven Development
This project uses sophisticated agent orchestration:
- Current phase/task tracked in `development plan/.state.json`
- Task definitions in `development plan/phase-*.tasks.json`
- Evidence validation in `development plan/.evidence/`
- Agents can auto-advance phases after completing tasks with evidence

### Performance Targets
- <100ms p95 for cached operations
- <300ms for new CSS transforms
- >70% cache hit rate
- <8KB SDK bundle size (gzipped)

### Environment Variables
```bash
PORT=8901                                   # API server port (default: 8901)
AGENTIC_MONGO_URI=mongodb://localhost:27017  # Database connection
AGENTIC_DB_NAME=agentic_design              # Database name
AGENTIC_BRAND_PACK_ID=brand-id              # Override brand pack
AGENTIC_DISABLE=1                           # Disable entire system
AGENTIC_STRICT=1                            # Fail hard on errors
AGENTIC_AUTO_APPLY=safe|off                 # Auto-application mode
ANTHROPIC_API_KEY=sk-ant-...                # Claude API key for AI brand pack generation
CLAUDE_MODEL=claude-3-5-sonnet-20241022     # Claude model for brand pack generation (default: claude-3-5-sonnet-20241022)
```

### Key Entry Points
- **SDK**: `packages/sdk/index.js` - `enhance()`, `enhanceCached()`, `autoEnhance()`
- **Discovery**: `packages/discovery/index.js` - `resolveProjectContext()`
- **Engine**: `packages/engine/index.js` - Deterministic CSS transformations
- **Server**: `apps/server/index.js` - Express API with MongoDB integration

### Testing Strategy
Always run `npm run doctor` before development to ensure MongoDB connectivity and system health. The test suite includes golden snapshots for transform determinism and extensive integration tests for the discovery system.