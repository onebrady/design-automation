# Phase 3 — Pattern Learning Engine (Advisory + Accuracy) — Weeks 7–8

Status: planned | in_progress | blocked | done
Owner: Agent
Start:
Target:
Completed:
CI: (link to latest run)

## Objectives
- Implement local, privacy-preserving pattern learning to produce advisory suggestions with confidence scores.
- Achieve ≥80% suggestion accuracy on fixtures; enforce confidence gating (advisory: ≥0.8, suppress <0.8).
- Integrate usage analytics and tracking to improve signals; keep safe auto-apply scope unchanged (from Phase 2).

## Scope
- In: Learning signals (component correlations, usage patterns), confidence scoring, suggestions API, tracking API, usage analytics rollups, performance tuning (<100ms analysis), evaluation harness.
- Out: Expanding auto-apply classes (optional in later phases), external/cloud training, team-level dashboards.

## Deliverables
- Learning services (local): preference extraction, component correlation, usage tracking, confidence computation.
- APIs:
  - `POST /api/design/suggest-proactive` → `{ suggestions[], confidence, basedOn }` (advisory)
  - `GET /api/design/patterns/learned` → learned preferences
  - `POST /api/design/patterns/track` → record component usage events
  - (Optional) `GET|PATCH /api/design/patterns/settings` → thresholds & flags (docs-only)
- Data:
  - `patterns` collection updates (see docs/data-schemas.md): `modelVersion`, `features`, `threshold`, `validated` (precision/recall), `autoApplyEnabled=false` (MVP)
  - `usage_analytics` updates for learning inputs
- Confidence boosters operational: exactness, contrast pre-checks, layout safety, repo consistency, progressive application, override alignment, ambiguity guard.

## Interfaces
- Endpoints:
  - `POST /api/design/suggest-proactive` → advisory suggestions (no auto-apply)
  - `GET /api/design/patterns/learned` → preferences JSON
  - `POST /api/design/patterns/track` → `{ componentType, event, meta }`
- SDK additions:
  - `suggestProactive({ componentType, context })`
  - `trackPatternEvent(event)`
- Env/config:
  - `AGENTIC_STRICT=1` (optional) to fail if learning exceeds allowed latency or missing data constraints.

## Data & DB
- Ensure indexes (Phase 0 bootstrap) for `patterns` and `usage_analytics` are present and performant.
- Persist evaluation snapshots in `patterns.validated` with precision/recall timestamps.

## Performance & Size Targets
- Suggestion analysis p95 <100ms per call.
- No additional bundle bloat; respect size budgets per docs/file-size-management.md.

## Tests & CI Gates
- Lint/type/tests/size-limit: green and within budgets.
- Accuracy evaluation: ≥80% accuracy on labeled fixtures; store precision/recall in evidence JSON.
- Confidence gating: <0.8 suppressed; 0.8–0.9 advisory; ≥0.9 can be flagged as “eligible”, but remains advisory for non‑safe classes.
- Signals: tests for exactness boosts, layout safety down-rank, consistency alignment, progressive application non-regression.
- API contracts: suggest-proactive, learned patterns, track events.
- Latency: p95 <100ms for suggestions (report in evidence JSON).

## Risks & Mitigations
- Overfitting to fixtures → diversify fixtures, add decay policy in `patterns`, evaluate on holdout sets.
- Latency spikes → cap feature computation; precompute common correlations; cache lightweight summaries.
- Noisy signals → keep ambiguity guard strict; suppress rather than guess; rely on overrides.

## Exit Criteria
- Suggestions API operational with advisory-only behavior and confidence gating.
- `patterns` collection populated with learned preferences; evaluation snapshot recorded (precision/recall ≥ target).
- Usage analytics tracked; SDK methods wired.
- Latency targets met; CI green with size budgets enforced.

## Agent Procedures (AI‑Only)
- Update status JSON: `development plan/.status/phase-3.json` (schema: `templates/phase-status.schema.json`).
- Produce evidence JSON: `development plan/.evidence/phase-3.json` (schema: `templates/phase-evidence.schema.json`).
- Include:
  - `checks[]` mapped to Checklist
  - `endpoints` samples for suggest-proactive and learned patterns
  - `metrics` entries for accuracy (precision/recall) and p95 latency
  - `refs` to PRD/doc sections for each check to minimize hallucinations
- Do not set status `done` until CI validates evidence and all gates are green.

## Checklist
- [ ] Suggestions API returns advisory suggestions with confidence scores → Evidence: endpoint samples + tests
- [ ] Learned patterns exposed and updated via tracking → Evidence: endpoint samples + tests
- [ ] Accuracy ≥80% on fixtures with evaluation snapshot → Evidence: precision/recall report
- [ ] Confidence gating enforced (<0.8 suppressed; 0.8–0.9 advisory; ≥0.9 eligible) → Evidence: gating tests
- [ ] Latency p95 <100ms for suggestions → Evidence: perf report in evidence JSON
- [ ] SDK methods wired (`suggestProactive`, `trackPatternEvent`) → Evidence: SDK tests
- [ ] CI green; size budgets enforced → Evidence: CI link + size-limit report

## Review Gate (Automated)
- CI validates `development plan/.evidence/phase-3.json` against `templates/phase-evidence.schema.json`.
- Status JSON indicates `done` with `ciRunId` of final run.
- Checklist mapped to `checks[]` with `passed=true` and artifacts.

## References
- PRD: Pattern Learning Scope (Confidence & Assessment; Safe Auto‑Apply Contract — no expansion in this phase); Success Metrics; Milestones M3
- Docs: `docs/design-engine-spec.md` (Pattern Learning & Intelligence), `docs/data-schemas.md` (`patterns`, analytics), `docs/build-quality-plan.md` (accuracy & gating), `docs/roadmap.md`
