# Phase 2 — Design Intelligence Engine (Deterministic Core) — Weeks 4–6

Status: planned | in_progress | blocked | done
Owner: Agent
Start:
Target:
Completed:
CI: (link to latest run)

## Objectives
- Implement deterministic transform engine with safe auto-apply per PRD contracts.
- Add cache with strong signatures + invalidation and meet cached p95 <100ms.
- Ship dev-only Vite plugin integration and SDK v0 wired to discovery/context.

## Scope
- In: Safe auto-apply classes (spacing, radius/elevation, exact token mappings) at ≥0.9 with guardrails; advisory for others (≥0.8); cache store + signatures; Vite plugin (dev-only); SDK v0; confidence boosters (heuristic signals).
- Out: ML-based pattern learning engine (Phase 3); expanded auto-apply classes; IDE extension polish.

## Deliverables
- Engine package with deterministic transforms implementing PRD “Deterministic Transform Contracts (MVP)”.
- Safe auto-apply policy: thresholds, guardrails, change caps, vendor exclusions, ignore markers.
- Cache subsystem: signature composition + invalidation; collections `cache`, `transforms`; startup index ensure.
- Vite plugin (dev-only): enhances files on-the-fly; respects discovery + guardrails; logs cache hits.
- SDK v0: `resolveProjectContext`, `enhance`, `enhanceCached`, status notifications for degraded mode.
- Confidence boosters (heuristics): exact-match detection, AA pre-checks, layout-safety heuristics, project consistency checks, progressive application.

## Interfaces
- Endpoints (see docs/design-engine-spec.md):
  - `POST /api/design/analyze` → metrics/opportunities (deterministic + heuristic signals)
  - `POST /api/design/enhance` → deterministic enhancement (no cache)
  - `POST /api/design/enhance-cached` → enhancement with cache (preferred)
  - `GET /api/context` (Phase 0) used by SDK/plugin
- SDK v0:
  - `resolveProjectContext(projectPath)`
  - `enhance(code, { codeType, componentType, cacheResults })`
  - `onStatus(cb)` for Mongo/degraded notifications
- Env/config:
  - `AGENTIC_AUTO_APPLY=safe|off` (default: safe)
  - `AGENTIC_AUTO_APPLY_MAX_CHANGES` (default: 5)
  - `AGENTIC_STRICT=1` to fail on guardrail violations

## Data & DB
- Collections (see docs/data-schemas.md):
  - `cache`: unique index on `signature`, secondary on `lastHit` (optional TTL)
  - `transforms`: unique on `signature`, secondary on `{ projectId, filePath }`, `{ brandPackId }`; include `autoApplied`, `autoApplyClass`, `guardrails`
- Startup index ensure must cover these collections (Phase 0 bootstrap).

## Performance & Size Targets
- Cached enhancement: p95 <100ms; hit rate >70% (dev workloads).
- New enhancement: p95 <300ms per file (typical sizes).
- Package budgets per docs/file-size-management.md (engine, sdk, vite-plugin).

## Tests & CI Gates
- Lint/type/tests/size-limit: all green; within budgets.
- Golden + Idempotency: re-run produces zero diff for safe classes.
- Guardrails: AA maintained/improved, change cap enforced, vendor/generated excluded, ignore markers honored.
- Cache: hit/miss scenarios; signature invalidation on code/brand/engine/ruleset/overrides changes.
- Confidence boosters: exact-match only auto-apply, ambiguity stays advisory; layout-safety fixtures; progressive apply non-regressive.
- Endpoint contracts: analyze/enhance/enhance-cached behave per spec; context consumed by SDK/plugin.
- Performance: report cached p95 and hit rate in evidence JSON.

## Risks & Mitigations
- Ambiguity in token mapping → ambiguity guard keeps advisory; exact-match prioritized.
- Performance regressions → measure cached p95 and precompute where possible; avoid heavy AST on unchanged files via signatures.
- Plugin overhead → dev-only; debounce and batch; rely on cache.

## Exit Criteria
- Engine implements safe classes per PRD contracts with auto-apply ≥0.9 and guardrails passing.
- Cache operational with signatures/invalidation; indexes ensured; cached p95 <100ms.
- Vite plugin (dev-only) enhances files and respects guardrails/discovery; SDK v0 integrated.
- Confidence boosters active and validated by tests.
- CI green; size budgets enforced.

## Agent Procedures (AI‑Only)
- Update status JSON: `development plan/.status/phase-2.json` (schema: `templates/phase-status.schema.json`).
- Produce evidence JSON: `development plan/.evidence/phase-2.json` (schema: `templates/phase-evidence.schema.json`).
- Map each Checklist item to `checks[]`; include endpoint samples and performance metrics.
- Reference PRD/doc sections in `checks[].refs` to reduce hallucinations.
- Do not set status `done` until CI validates evidence and all gates are green.

## Checklist
- [ ] Deterministic transforms (spacing, radius/elevation, exact-token) implemented per contracts → Evidence: golden/idempotency tests
- [ ] Safe auto-apply enforced (≥0.9), guardrails/caps/exclusions in place → Evidence: guardrail tests
- [ ] Cache signatures + invalidation rules implemented → Evidence: hit/miss/invalidation tests
- [ ] Cached p95 <100ms and hit rate reported → Evidence: performance report in evidence JSON
- [ ] Vite plugin (dev-only) wired and respects discovery → Evidence: plugin logs/tests
- [ ] SDK v0 (resolve/enhance/enhanceCached/onStatus) → Evidence: SDK tests
- [ ] Endpoint contracts pass (analyze/enhance/enhance-cached) → Evidence: API tests
- [ ] CI green with size budgets → Evidence: CI link + size-limit report

## Review Gate (Automated)
- CI validates `development plan/.evidence/phase-2.json` against `templates/phase-evidence.schema.json`.
- Status JSON indicates `done` with `ciRunId` of final run.
- Checklist mapped to `checks[]` with `passed=true` and artifacts.

## References
- PRD: Deterministic Transform Contracts; Pattern Learning Scope (Safe Auto-Apply Contract); MVP Scope Checklist; Milestones M2
- Docs: `docs/design-engine-spec.md`, `docs/data-schemas.md`, `docs/discovery.md`, `docs/build-quality-plan.md`, `docs/file-size-management.md`, `docs/roadmap.md`
