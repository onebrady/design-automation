# Phase 5 — Intelligence & Optimization — Weeks 11–12

Status: planned | in_progress | blocked | done
Owner: Agent
Start:
Target:
Completed:
CI: (link to latest run)

## Objectives
- Improve pattern learning accuracy (target >90%) and performance without expanding auto-apply risk.
- Optimize caching (pre-warming, TTL policy, memory management) to keep cached p95 <100ms with higher load.
- Provide comprehensive usage analytics and effectiveness tracking (local), plus robust error recovery.

## Scope
- In: Pattern learning accuracy/perf improvements; advanced caching (pre-warm, TTL, eviction); analytics collection & reports (local); memory limits; error recovery; expanded auto-apply optional per PRD (per-class thresholds, still safe).
- Out: Org-wide analytics dashboards; new IDE features; new transform classes.

## Deliverables
- Pattern Learning Enhancements:
  - Improved feature engineering and weighting; acceptance feedback loop tuning; decay policy verification.
  - Accuracy evaluation harness with precision/recall/F1 on expanded fixtures.
- Advanced Caching:
  - Pre-warm hot signatures; TTL for cold entries; eviction policies; memory ceilings.
  - Cache optimization recommendations endpoint (read-only) if feasible.
- Analytics & Reporting (local):
  - Usage analytics rollups (per project): token adherence trends, cache hit/miss, suggestion acceptance rates.
  - Exportable JSON reports stored as artifacts (no UI required).
- Error Recovery:
  - Automatic rollback to previous working state on critical failures; resilient retries; better diagnostics.
- Optional Expanded Auto-Apply (per PRD):
  - Enable per-class thresholds when evidence supports safety; retain change caps and guardrails.

## Interfaces
- Endpoints (augment existing):
  - `GET /api/design/cache/status` (hit rates, memory, TTL)
  - `POST /api/design/cache/invalidate` (smart invalidation)
  - `GET /api/design/cache/optimize` (recommendations)
  - `GET /api/analytics/usage` (local rollups JSON)
- SDK: internal use of analytics; no breaking changes for consumers.
- Env/config:
  - TTL config (e.g., `AGENTIC_CACHE_TTL_DAYS`), memory ceilings, pre-warm toggles.
  - Auto-apply per-class threshold flags (docs-only unless needed).

## Data & DB
- Validate `cache` TTL index (optional) and eviction alignment.
- Ensure `patterns.validated` snapshots record new evaluation, and analytics collection is indexed for rollups.

## Performance & Size Targets
- Pattern learning: p95 analysis <100ms; accuracy >90% on fixtures.
- Cached enhancement: maintain p95 <100ms under increased load (report both p50 and p95).
- Size budgets: unchanged; no regression per docs/file-size-management.md.

## Tests & CI Gates
- Lint/type/tests/size-limit: green and within budgets.
- Accuracy suite: precision/recall/F1 ≥ targets; evidence JSON includes metrics.
- Cache tests: pre-warm effectiveness; TTL eviction; memory ceiling behavior; no stale hits post-invalidation.
- Analytics: rollup correctness on sample datasets; export JSON snapshot tests.
- Error recovery: simulated failures roll back cleanly; logs include diagnostics.
- Optional expanded auto-apply: gated by per-class thresholds; guardrails enforced.

## Risks & Mitigations
- Over-optimization causing regressions → guard with metrics comparisons and canary fixtures.
- Cache churn → tune TTL and pre-warm thresholds; measure before/after.
- Analytics overhead → batch and throttle; run off hot paths; keep local only.

## Exit Criteria
- Pattern learning accuracy >90% on fixtures; latency targets met.
- Advanced caching operational (pre-warm, TTL/eviction) with cached p95 <100ms sustained.
- Local analytics available via endpoint and JSON exports; correctness validated.
- Error recovery mechanisms verified.
- CI green; size budgets enforced.

## Agent Procedures (AI‑Only)
- Update status JSON: `development plan/.status/phase-5.json` (schema: `templates/phase-status.schema.json`).
- Produce evidence JSON: `development plan/.evidence/phase-5.json` (schema: `templates/phase-evidence.schema.json`).
- Include:
  - `checks[]` mapped to Checklist
  - `endpoints` samples for cache status/optimize, analytics usage
  - `metrics` for accuracy (precision/recall/F1) and performance (cached p95/p50)
  - `refs` to PRD/doc sections for each check
- Do not set status `done` until CI validates evidence and all gates are green.

## Checklist
- [ ] Accuracy >90% on fixtures with evaluation snapshot → Evidence: metrics report
- [ ] Pattern analysis p95 <100ms → Evidence: perf report
- [ ] Advanced caching (pre-warm, TTL/eviction) implemented → Evidence: tests + status endpoint
- [ ] Cached p95 <100ms under load; report p50/p95 → Evidence: perf report
- [ ] Analytics rollups exposed via endpoint; JSON exports correct → Evidence: snapshots
- [ ] Error recovery mechanisms verified → Evidence: failure simulation logs/tests
- [ ] Optional expanded auto-apply (if enabled) respects per-class thresholds/guardrails → Evidence: tests
- [ ] CI green; size budgets enforced → Evidence: CI link + size-limit report

## Review Gate (Automated)
- CI validates `development plan/.evidence/phase-5.json` against `templates/phase-evidence.schema.json`.
- Status JSON indicates `done` with `ciRunId` of final run.
- Checklist mapped to `checks[]` with `passed=true` and artifacts.

## References
- PRD: Milestones M5; Pattern Learning Scope; Performance/Success Metrics; File Size Strategy
- Docs: `docs/design-engine-spec.md` (Caching & Performance; Pattern Learning), `docs/data-schemas.md` (cache, patterns), `docs/build-quality-plan.md`, `docs/file-size-management.md`, `docs/roadmap.md`
