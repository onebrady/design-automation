# Phase 4 — Seamless Integration (Level 3 Automation) — Weeks 9–10

Status: planned | in_progress | blocked | done
Owner: Agent
Start:
Target:
Completed:
CI: (link to latest run)

## Objectives
- Deliver zero‑config agent integration: SDK auto‑detects context and enhances code transparently.
- Provide minimal IDE integration (VSCode) with opt‑in background enhancement and status.
- Integrate with build/CI (git hooks, CI steps) respecting guardrails and size budgets.

## Scope
- In: SDK Level 3 automation (auto context resolution, auto‑enhance with cache, status notifications); VSCode extension (opt‑in background enhancement, status indicator); build/CI hooks; performance tuning.
- Out: Advanced IDE features (diff UIs, org dashboards); non‑VSCode IDEs; expanded auto‑apply classes (remain per PRD).

## Deliverables
- SDK (Level 3):
  - Auto‑detects project via discovery; calls `enhance-cached` transparently during generation.
  - Emits status (Mongo availability, degraded) and respects env controls for auto‑apply.
  - Batching/debouncing and file filters to avoid performance hits.
- VSCode Extension (minimal):
  - Opt‑in background enhancement on save/open; uses `/api/context` and `enhance-cached`.
  - Status bar: Mongo/Degraded/Auto‑apply mode; command to toggle auto‑apply (patterns).
  - Respects ignore markers and vendor exclusions; safe auto‑apply only.
- Build/CI Integration:
  - Git hooks (pre‑commit): analysis check (non‑blocking) and optional auto‑enhance dry‑run.
  - CI: enhancement step (non‑blocking unless `AGENTIC_STRICT=1`) and performance gate checks.
- Performance Optimization:
  - Cache pre‑warming for recent files; memory limits; telemetry logs (local only) for hit/miss.

## Interfaces
- SDK:
  - `autoEnhance({ projectPath, watchMode })` (background processing)
  - `resolveProjectContext`, `enhance`, `enhanceCached`, `onStatus`
- VSCode:
  - Commands: "Agentic: Toggle Auto‑Apply (Patterns)", "Agentic: Enable/Disable Background Enhancement"
  - Status Bar: shows context/auto‑apply mode/degraded
- Build Integration:
  - Git hooks configured per docs/build-quality-plan.md; CI steps call service endpoints and verify health.

## Data & DB
- No new collections; rely on existing `cache`, `transforms`, `patterns`.
- Ensure discovery works reliably across monorepos (nearest‑config wins) and subprojects.

## Performance & Size Targets
- SDK: keep within `docs/file-size-management.md` budgets; tree‑shakeable; dynamic imports for optional features.
- VSCode extension: minimal footprint; background tasks respect CPU/memory ceilings.
- End‑to‑end: cached p95 <100ms maintained during background enhancement.

## Tests & CI Gates
- Lint/type/tests/size-limit: SDK + extension within budgets.
- Discovery integration tests (monorepo subpaths, env overrides, degraded mode).
- Background enhancement tests: ignores, vendor exclusions, guardrails, change caps enforced.
- Performance: cached p95 under background load; cache hit rate remains >70% on repeated edits.
- Build/CI hooks: simulate pre‑commit and CI steps; ensure non‑blocking unless strict mode set.

## Risks & Mitigations
- Editor latency: debounce, batch, and only enhance eligible files; rely on cache.
- False positives in background mode: safe auto‑apply only; guardrails; allow quick toggle off.
- Monorepo edge cases: explicit tests for nearest config and subproject roots.

## Exit Criteria
- SDK Level 3 automation works: auto‑context + transparent `enhance-cached` with status events.
- VSCode extension provides opt‑in background enhancement + status; respects guardrails.
- Build/CI integration operational; size budgets enforced; cached p95 <100ms under background load.
- CI green; evidence JSON includes performance metrics and integration screenshots/logs.

## Agent Procedures (AI‑Only)
- Update status JSON: `development plan/.status/phase-4.json` (schema: `templates/phase-status.schema.json`).
- Produce evidence JSON: `development plan/.evidence/phase-4.json` (schema: `templates/phase-evidence.schema.json`).
- Include:
  - `checks[]` mapped to Checklist
  - `endpoints` samples used by SDK/extension
  - `metrics` for cached p95 and cache hit rate during background runs
  - `refs` to PRD/doc sections for each check
- Do not set status `done` until CI validates evidence and all gates are green.

## Checklist
- [ ] SDK auto‑context + transparent enhance‑cached operational → Evidence: SDK tests, logs
- [ ] Status notifications (Mongo/degraded) emitted and handled → Evidence: SDK tests
- [ ] VSCode extension background enhancement (opt‑in) with status bar → Evidence: extension logs/screens
- [ ] Guardrails enforced in background mode (caps, ignores, AA) → Evidence: tests
- [ ] Build/CI integration configured and non‑blocking (strict mode honored) → Evidence: CI run
- [ ] Performance: cached p95 <100ms, hit rate >70% under background load → Evidence: perf report
- [ ] Size budgets met (SDK, extension) → Evidence: size-limit report
- [ ] CI green → Evidence: CI link

## Review Gate (Automated)
- CI validates `development plan/.evidence/phase-4.json` against `templates/phase-evidence.schema.json`.
- Status JSON indicates `done` with `ciRunId` of final run.
- Checklist mapped to `checks[]` with `passed=true` and artifacts.

## References
- PRD: Architecture (SDK, integrations), Bootstrap & Health, Pattern Learning Scope (safe auto‑apply unchanged), MVP Scope Checklist; Milestones M4
- Docs: `docs/integration-protocol.md`, `docs/discovery.md`, `docs/design-engine-spec.md`, `docs/build-quality-plan.md`, `docs/file-size-management.md`, `docs/roadmap.md`
