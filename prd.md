# Agentic Design Intelligence Platform — PRD (Concepting)

Version: 5.0.0-concept
Date: 2025-01-15
Status: Concepting (Level 3 Automation + MongoDB)

## Project End Goal

Create an intelligent design partner that seamlessly works with AI coding agents to generate beautiful, brand-aligned, accessible frontends through Level 3 automation. The system learns from user patterns, proactively suggests optimizations, and provides instant, cached enhancements while maintaining complete transparency and control.

### Acceptance Criteria

- **Zero-Config Automation**: Agents work seamlessly without manual API calls or configuration
- **Zero-Config Discovery & Notification**: Brand pack resolves automatically per project; notify if MongoDB is unreachable; continue in degraded mode with on-disk lock when possible
 - **Pattern Learning**: System learns user preferences and proactively suggests design improvements
  - MVP Auto-Apply (Safe Classes): Auto-apply spacing normalization, radius/elevation tokenization, and exact token mappings when confidence ≥ 0.9 and guardrails pass
  - Guardrails: AA contrast maintained or improved; change caps (≤5 per file); vendor/third-party code excluded; full change log and easy rollback
  - Suggestions Elsewhere: Higher-risk classes (color/type tweaks) remain advisory until accuracy proven
- **Intelligent Caching**: Instant re-enhancement of frequently modified components
- **Rich Analytics**: Comprehensive insights into design patterns and system effectiveness
- **Seamless Integration**: Agents automatically detect project context and apply appropriate optimizations
 - **Enhanced Performance**: <100ms response time for cached operations, instant pattern-based suggestions
 - **Project-Level Linting Ready**: Projects can enforce tokenized styles using a shared lint spec (docs only)
- **Quality Assurance**: All enhancements maintain deterministic, idempotent, and reversible transforms

## Executive Summary

- **End Goal**: Create an intelligent design system that seamlessly partners with AI coding agents to produce beautiful, brand-aligned UIs through Level 3 automation with pattern learning and proactive optimization.
- **Core Problem**: AI-generated frontends are functional but bland and inconsistent; current tools require manual intervention and lack intelligence to understand user preferences and project context.
- **Solution**: Three integrated pillars — Brand Pack Creator (MongoDB-backed tokens + assets), Design Intelligence Engine (pattern-learning transforms), and Seamless Agent Integration (zero-config automation) — working together to provide intelligent, cached, and proactive design assistance.

## Product Goals

- **Primary**: Create a seamless, intelligent design partner that works transparently with AI agents to generate visually appealing, brand-consistent designs through pattern learning and proactive optimization.
- **Secondary**:
  - **Zero-Friction Automation**: Agents work without manual intervention or configuration
  - **Intelligent Learning**: System adapts to user preferences and design patterns
  - **Performance Excellence**: Cached operations provide instant results and suggestions
  - **Rich Analytics**: Comprehensive insights into design effectiveness and usage patterns
  - **Quality Assurance**: Maintain accessibility, performance, and deterministic transforms

## Non‑Goals (MVP)

- Full generative illustration/icon packs at scale.
- Large cloud services or vendor lock-in.
- Subjective "style exploration" without token grounding.
- Multi-user enterprise features or team collaboration.
- Cross-platform desktop/mobile design tools.
- Integration with external design tools (Figma, Sketch, etc.).

## Product Pillars

1. **Brand Pack Creator (MongoDB-Backed)**

- Intelligent wizard to define brand personality with pattern learning from usage history
- MongoDB-stored brand packs with version control, usage analytics, and automatic evolution suggestions
- Optional curated SVG assets with usage tracking and recommendation engine
- Outputs: Dynamic brand-pack.json, CSS variables, usage analytics, and personalized suggestions

2. **Design Intelligence Engine (Pattern Learning)**

- AST-based transforms enhanced with pattern recognition and proactive optimization
- Intelligent caching system for instant re-enhancement of frequently modified components
- Pattern learning engine that adapts to user preferences and design habits
- Objective analysis with predictive suggestions based on historical usage patterns
- Advisory system that learns from user feedback and improves over time

3. **Seamless Agent Integration (Level 3 Automation)**

- Zero-config automation where agents automatically detect project context and brand packs
- Intelligent SDK that handles all communication transparently without manual API calls
- Proactive enhancement system that anticipates design needs and applies optimizations
- Pattern-aware suggestions that understand project structure and user preferences
- Seamless workflow integration with automatic fallback and error recovery

## Architecture Overview

- **Local Service**: `agentic-design serve` on `http://localhost:3001` with intelligent auto-discovery
- **Database**: Local MongoDB instance for rich data modeling, caching, and analytics
- **Modules**:
  - `brand-packs`: MongoDB-backed brand management with usage tracking
  - `engine`: AST transforms with pattern learning and intelligent caching
  - `pattern-learning`: Machine learning layer for user preference analysis
  - `api`: RESTful endpoints with intelligent routing and caching
  - `sdk`: Zero-config SDK with automatic project detection
  - `discovery`: Zero-config resolver for brand/project context, env overrides, and degraded mode
  - `integrations`: Vite plugin, VSCode extension, and seamless agent hooks
- **Data Layer**:
  - **MongoDB Collections**: projects, brand_packs, transforms, patterns, analytics
  - **Caching Strategy**: Multi-level caching (memory → MongoDB → file system)
  - **Analytics Engine**: Usage tracking, pattern recognition, and performance metrics
- **Suggested Repo Layout**: `apps/server`, `packages/{engine,brand-pack,sdk,vite-plugin,vscode-extension,pattern-learning}`, `examples/`, `data/mongodb/`

## Bootstrap & Health

- **Startup Index Ensure**: On service start, create required indexes for `projects`, `cache`, `transforms`, `patterns` if missing (see `docs/data-schemas.md`).
- **Health Monitoring**: Ping MongoDB on startup and periodically (e.g., 15s). Track `mongoAvailable` and `lastOkAt`.
- **Endpoints**:
  - `GET /api/health` → `{ ok, version, mongoAvailable, degraded, lastOkAt }`
  - `GET /api/context` → `{ brandPack, projectId, overrides?, mongoAvailable, degraded, lastSync? }`
- **Degraded Behavior**: If MongoDB is unreachable, use `.agentic/brand-pack.lock.json` when present; otherwise run deterministic transforms and notify. `AGENTIC_STRICT=1` fails hard.
- **Status Notifications**: SDK emits status changes (Mongo availability, degraded mode) for IDE/CLI.

## Assumptions & Constraints

- **Local-First Development**: No code or data leaves machine unless explicitly enabled.
- **MongoDB Dependency**: Local MongoDB instance required for caching, analytics, and pattern learning.
- **Deterministic Core**: AST transforms remain deterministic and idempotent; pattern learning is additive.
- **Performance First**: All operations must maintain <100ms response time for cached requests.
- **Zero-Config Philosophy**: Agents should work without manual configuration or API calls.
- **Learning Without Interference**: Pattern learning never overrides explicit user preferences.
- **Cross-Framework Target**: HTML, CSS, JSX/TSX with intelligent framework detection.
- **Advisory Enhancement**: LLM features remain non-blocking and enhance rather than replace deterministic transforms.

## Build Flow & Quality Gates (Concept)

- **ESLint**: Strict TS, no warnings in CI, import/bundle rules, MongoDB schema validation.
- **Testing Strategy**:
  - Golden before/after snapshots for transforms with pattern learning validation
  - Idempotency tests with caching verification
  - API contract validators with intelligent routing tests
  - MongoDB integration tests for data persistence and analytics
  - Pattern learning accuracy tests (80%+ pattern recognition)
- **Pre-commit**: eslint --max-warnings=0, tsc --noEmit, unit tests (affected), MongoDB schema validation.
- **PR/CI**: lint, typecheck, tests, build, file-size budgets, transform suite, API contracts, caching performance, pattern learning accuracy.
- **Release**: CI + provenance, changelog, smoke tests on examples, MongoDB migration validation.

### Design System Linting (Project-Level)

- Purpose: Let consuming projects enforce tokenized design usage with minimal setup (docs-only spec for now).
- Core rules: no raw colors/spacing/typography; require brand tokens; contrast check = warn.
- Token resolver: reads `.agentic/brand-pack.lock.json` (no DB calls); falls back to repo `brand-pack.json`; `AGENTIC_STRICT=1` fails if tokens unavailable.
- Modes: strict in CI (`eslint --max-warnings=0`), advisory locally.

## File Size Strategy (Concept)

- **Budgets per Package**:
  - `packages/sdk`: < 8KB gzip (zero-config intelligence)
  - `packages/vite-plugin`: < 5KB gzip (seamless integration)
  - `packages/pattern-learning`: < 15KB gzip (ML algorithms for pattern recognition)
  - Server deps reviewed with MongoDB driver optimization
- **Monitoring**: size-limit/bundlesize with baselines, MongoDB query performance monitoring
- **Automated Optimization**:
  - Intelligent caching reduces repeated transform overhead
  - Dynamic imports for pattern learning features
  - MongoDB result caching minimizes database queries
  - Automated refactoring with performance-aware codemods

## Milestones & Roadmap (Concept)

- **M0 Foundation (Week 1)**: repo scaffolding, ESLint, tests, CI, size budgets, hooks, MongoDB setup.
- **M1 Brand Packs (Weeks 2–3)**: MongoDB schema, validators, CSS export, intelligent studio, brand-pack API with analytics.
- **M2 Engine MVP (Weeks 4–6)**: deterministic transforms (safe auto-apply: spacing, radius/elevation, exact token mappings at ≥0.9 with guardrails); advisory suggestions for others (≥0.8); cache signature + invalidation (startup indexes ensured); `/api/health` + `/api/context` live; cached p95 < 100ms; Vite plugin dev-only; SDK v0.
- **M3 Pattern Learning (Weeks 7–8)**: pattern recognition engine, usage analytics, proactive suggestions, learning validation.
- **M4 Seamless Integration (Weeks 9–10)**: Level 3 automation, zero-config SDK, intelligent agent hooks, transparent workflows.
- **M5 Intelligence & Optimization (Weeks 11–12)**: advanced caching, performance tuning, learning accuracy optimization, comprehensive analytics.
- **M6 Beta Hardening (Weeks 13–14)**: docs, examples, perf polish, error handling, MongoDB migration tools.

## Success Metrics (Concept)

- **Automation**: >95% of visual changes enhanced automatically without agent prompts; zero manual API calls required.
- **Intelligence**: >80% of suggestions match user's design patterns; pattern learning accuracy >85%.
- **Performance**: <100ms response time for cached operations; <300ms for new transforms; <2% bundle overhead.

## Pattern Learning Scope (MVP → Beyond)

- **MVP (Auto-Apply Safe Classes)**:
  - Auto-apply subset: spacing normalization, radius/elevation tokenization, exact token mappings (1:1 replacements); all others advisory.
  - Thresholds: default apply at ≥ 0.9 confidence; suggestions below 0.8 are suppressed; 0.8–0.9 remain advisory.
  - Guardrails: maintain/improve AA contrast; cap ≤ 5 changes per file; exclude vendor/third-party; record reversible change list.
  - Controls: env flags to disable or tighten (`AGENTIC_AUTO_APPLY=safe|off`, `AGENTIC_AUTO_APPLY_MAX_CHANGES`, `AGENTIC_STRICT=1`).
- **Expanded Auto-Apply (Post-MVP)**:
  - Gradually include low-risk classes (e.g., conservative type scale nudges) with higher thresholds and additional tests.
  - Human-in-the-loop UX for preview/accept/revert in IDE/CI; per-rule toggles.

### Confidence & Assessment (Keep 0.9; raise confidence instead)

- Exactness: boost confidence for 1:1 token matches (single unambiguous mapping).
- Contrast pre-check: boost when AA contrast is maintained or improved.
- Layout-safety heuristics: down-rank tight/fragile layouts; boost common safe blocks (buttons/cards).
- Consistency: boost when proposed token aligns with same-component usage in the repo.
- Progressive application: apply 1–2 safe changes, re-measure metrics (token adherence/spacing consistency), continue only if non-regressive.
- Feedback loop: raise confidence per rule/component after repeated accepts; decay on reverts.
- Overrides-aware: boost when aligning with `.agentic/config.json` overrides; suppress when conflicting.
- Ambiguity guard: if multiple tokens fit, keep advisory (no auto-apply).

### Safe Auto-Apply Contract (MVP)

- Safe classes:
  - Spacing normalization → map raw spacing values to `--spacing-*` tokens.
  - Radius/Elevation tokenization → map values to `--radius-*` / `--elevation-*`.
  - Exact token mappings → 1:1 literal equals a known token value (colors, spacing, radius, elevation).
- Thresholds:
  - Auto-apply when confidence ≥ 0.9.
  - Advisory only for 0.8 ≤ confidence < 0.9; suppressed < 0.8.
- Guardrails (all must pass):
  - AA contrast maintained or improved for any color-adjacent change.
  - Idempotent result (re-run yields no diff) and no ambiguous matches.
  - Change cap ≤ 5 per file; skip vendor/generated paths.
  - Respect explicit project overrides and "do not modify" markers.
- Controls:
  - `AGENTIC_AUTO_APPLY=safe|off` (default: safe), `AGENTIC_AUTO_APPLY_MAX_CHANGES` (default: 5), `AGENTIC_STRICT=1` to fail on guardrail violations.

## Deterministic Transform Contracts (MVP)

- General:
  - Idempotent: second run produces no diff; transforms never change DOM structure or logic.
  - Change cap: ≤ 5 changes per file; skip vendor/generated paths (`node_modules`, `dist`, `build`, `vendor`, `*.gen.*`).
  - Opt-out markers: `/* agentic: ignore */` (block), `/* agentic: ignore-next */`, `// agentic-ignore-line`.

- Color tokenization (auto-apply only for exact matches):
  - Exact 1:1 mapping to a known token value (case-insensitive, normalized format) auto-applies.
  - Near matches or multiple candidate tokens remain advisory.
  - Contrast guardrail: any color-adjacent change must maintain or improve AA contrast; otherwise skip.
  - Do not alter functional color semantics (states, brand accents) unless exact-match token exists.

- Spacing normalization:
  - Units: accept `px|rem`; convert px→rem with base 16 and round to nearest token within 5% tolerance.
  - Shorthand rules: expand to 4 parts, normalize each, then re-collapse if all map to tokens; preserve directional intent.
  - Conflicts: if any side fails tolerance, leave the entire shorthand advisory.
  - Ignore dynamic expressions (`calc()`, `var()`) except exact token substitutions.

- Radius & elevation tokenization:
  - Map numeric radii and shadow presets to nearest token within 5% tolerance.
  - Ambiguity guard: if multiple tokens fit, remain advisory.
  - Preserve semantic intent (small/medium/large tiers) where applicable.

- File/type coverage:
  - CSS, CSS-in-JS (basic template literal parsing), inline styles in JSX/HTML where unambiguous.
  - Skip third-party libraries and generated files by default.

- Testing implications (docs-level):
  - Golden fixtures validate each rule; idempotency suite re-runs with zero diff.
- Guardrail tests for contrast, ambiguity, shorthand failure cases, and vendor exclusions.

## MVP Scope Checklist (Build Focus)

- Endpoints:
  - `GET /api/health` (ok, version, mongoAvailable, degraded, lastOkAt)
  - `GET /api/context` (brandPack, projectId, overrides?, mongoAvailable, degraded, lastSync?)
- Discovery:
  - Env → `.agentic/config.json` → `package.json` → `brand-pack.ref.json|brand-pack.json` → DB mapping → auto-bind if single brand
  - Degraded mode with `.agentic/brand-pack.lock.json`; SDK status notifications; env overrides respected
- Deterministic Engine:
  - Implement safe classes per contracts: spacing normalization; radius/elevation tokenization; exact token mappings (auto-apply)
  - Color/type tweaks remain advisory unless exact token match
- Caching:
  - Signature composition and invalidation per `docs/data-schemas.md`; ensure indexes on startup
  - Performance: cached p95 < 100ms; track hit/miss and lastHit
- Pattern Learning:
  - Produce advisory suggestions with confidence inputs; safe auto-apply only at ≥ 0.9 with guardrails
  - Confidence boosters active (exactness, AA pre-check, layout-safety, consistency, progressive apply)
- Tests & CI:
  - Golden + idempotency; guardrail fixtures; discovery resolution; cache hit/miss + invalidation; startup index checks
- Explicitly Out of Scope (MVP):
  - Expanded auto-apply classes beyond safe set; advanced IDE features; org-wide analytics dashboard
- **Privacy & Locality**: All learning data stays local; no external transmission.
- **Evaluation**: Track precision/recall of accepted suggestions; weekly reports drive threshold tuning.
- **Visual Quality**: token adherence >85% after enhancement; contrast AA >95%; type scale conformity >90%.
- **Caching Effectiveness**: >70% cache hit rate for repeat operations; instant re-enhancement.
- **Quality Assurance**: >99% idempotency with caching; near-zero functional regressions; MongoDB consistency.
- **Adoption**: Zero-config setup; agents work seamlessly within 5 minutes of installation.

## User Journeys (Concept)

- **New Project (Automated)**: Create project → System auto-detects and applies default optimizations → Agent generates components with instant enhancement → Pattern learning begins immediately → Proactive suggestions improve over time.
- **First Run (Auto-Bind)**: If exactly one brand exists and no config present → auto-bind to that brand and persist; otherwise prompt (interactive) or run degraded with notification (non-interactive).
- **Existing Project (Intelligent Migration)**: Open project → System automatically scans and learns patterns → Applies cached optimizations instantly → Suggests brand pack improvements based on usage → Seamless integration with existing workflow.
- **Multi-Project Brand (Smart Consistency)**: Share brand pack across projects → System tracks usage patterns per project → Maintains consistency while adapting to project-specific preferences → Analytics show cross-project design effectiveness.
- **Agent Workflow (Transparent)**: Agent starts working → Automatically detects project context → Applies learned patterns and cached optimizations → No manual intervention required → System learns from each interaction.

## Risks & Mitigations (Concept)

- **Pattern Learning Accuracy**: Risk of incorrect suggestions → Validation against user feedback; fallback to deterministic transforms; pattern confidence scoring.
- **MongoDB Dependency Complexity**: Risk of setup overhead → Automated MongoDB setup scripts; fallback to file-based storage; clear migration path.
- **MongoDB Unavailable**: Risk of DB downtime → Explicit notifications via SDK/CLI; degraded mode uses on-disk lock; strict mode available for CI.
- **Performance Degradation**: Risk of slow operations → Multi-level caching strategy; performance monitoring; automatic optimization.
- **Learning Without Interference**: Risk of overriding user preferences → Explicit preferences always take precedence; clear learning boundaries; user feedback integration.
- **Cache Invalidation**: Risk of stale cached results → Intelligent cache invalidation; hash-based change detection; manual cache refresh options.
- **Subjective Aesthetics**: Objective metrics prioritized; LLM advisory remains non-blocking and optional.
- **Breakage Risk**: AST-only, structure-preserving transforms; comprehensive golden tests; reversible patches with source maps.
- **Size Creep**: Enhanced budgets + CI monitoring + intelligent caching + performance-aware codemods.

## Glossary

- **Brand Pack**: Versioned set of design tokens and asset references with usage analytics and pattern learning.
- **Token Adherence**: Percentage of style values mapped to brand tokens with pattern-aware optimization.
- **Idempotency**: Re-running transforms yields no additional changes, enhanced by intelligent caching.
- **Advisory**: Non-blocking, optional guidance enhanced by pattern learning and user preferences.
- **Pattern Learning**: System capability to recognize and adapt to user design preferences and habits.
- **Intelligent Caching**: Multi-level caching system providing instant results for repeated operations.
- **Zero-Config Automation**: Agents work seamlessly without manual configuration or API calls.
- **Proactive Enhancement**: System anticipates design needs and applies optimizations automatically.

## Deep-Dive Documents

- Brand Pack Spec (MongoDB): ./docs/brand-pack-spec.md
- Design Engine Spec (Pattern Learning): ./docs/design-engine-spec.md
- Integration Protocol (Level 3 Automation): ./docs/integration-protocol.md
- Build Quality Plan (Enhanced): ./docs/build-quality-plan.md
- File Size Management (Caching): ./docs/file-size-management.md
- Roadmap & Milestones (14 weeks): ./docs/roadmap.md
- Zero-Config Discovery: ./docs/discovery.md
 - Core Data Schemas & Indexes: ./docs/data-schemas.md

## Decision Log (Updated)

- **2025-01-15 — Level 3 Automation with Pattern Learning**

  - Rationale: Maximize agent productivity through seamless, intelligent integration
  - Impact: Zero-friction workflow; agents work transparently with learned preferences

- **2025-01-15 — MongoDB Integration for Rich Data Layer**

  - Rationale: Enable caching, analytics, and pattern learning without file system complexity
  - Impact: Instant performance for repeat operations; intelligent design suggestions

- **2025-01-15 — Intelligent Caching Architecture**

  - Rationale: Provide instant results while maintaining data consistency
  - Impact: <100ms response times for cached operations; reduced computational overhead

- **2025-01-15 — Zero-Config Agent Integration**

  - Rationale: Remove friction from agent workflows; focus on seamless collaboration
  - Impact: Agents work without manual intervention; automatic project detection

- **2025-08-31 — Deterministic transforms first, LLM advisory only**

  - Rationale: minimize regressions; keep performance predictable
  - Impact: objective metrics prioritized; subjective "taste" optional

- **2025-08-31 — Local-first architecture with minimal SDK**

  - Rationale: privacy, latency, ease of adoption
  - Impact: no cloud dependency in MVP; simpler ops

- **2025-08-31 — File size budgets enforced in CI from day 1**
  - Rationale: prevent bloat early; easier maintenance
  - Impact: codemods/splitting included; PRs must pass size checks
