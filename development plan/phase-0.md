# Phase 0 — Intelligent Foundation (Week 1)

Status: planned | in_progress | blocked | done
Owner: Agent
Start: 
Target: 
Completed: 
CI: (link to latest run)

## Objectives

- Establish repo scaffolding, CI gates, and local MongoDB connectivity.
- Ship discovery + health/context endpoints with degraded-mode handling.
- Enforce size budgets and baseline quality gates to streamline later phases.

## Scope

- In: Repo setup, CI (lint/type/test/size), Mongo index ensure, `/api/health` and `/api/context`, discovery resolver, lock snapshot logic, SDK status notifications (basic).
- Out: Engine transforms, caching implementation, pattern learning, IDE integration (covered in later phases).

## Deliverables

- Monorepo scaffolding (pnpm workspaces, TypeScript strict mode).
- Service bootstrap: startup index ensure for required collections.
- Endpoints: `GET /api/health`, `GET /api/context` (basic payloads defined in PRD/specs).
- Discovery resolver per docs: env → `.agentic/config.json` → `package.json` → `brand-pack.ref.json|brand-pack.json` → DB mapping → auto‑bind if a single brand exists → degraded.
- Lock snapshot generation: `.agentic/brand-pack.lock.json` (not committed).
- CI pipelines: lint, typecheck, tests, size-limit budgets, startup index check, basic health smoke.
- Example workspace to validate discovery + endpoints.

## Checklist

- [ ] Repo scaffolding in place (pnpm workspaces, TS strict)
  - Evidence: repo structure, `tsconfig`, workspace config
- [ ] Startup index ensure implemented and verified
  - Evidence: logs/artifact from first boot; test output
- [ ] `/api/health` returns expected payload
  - Evidence: sample JSON + test
- [ ] `/api/context` returns expected payload
  - Evidence: sample JSON + test
- [ ] Discovery resolver covers env/config/package/marker/DB/auto-bind/degraded
  - Evidence: passing tests per path
- [ ] Lock snapshot `.agentic/brand-pack.lock.json` generated
  - Evidence: file in example (untracked) + test
- [ ] CI: lint/type/tests/size-limit/preflight doctor green
  - Evidence: CI run link + artifacts
- [ ] Example workspace demonstrates discovery + endpoints
  - Evidence: example logs or README snippet

## Agent Procedures (AI‑Only)

- Write status to `development plan/.status/phase-0.json` when starting/finishing (schema: `templates/phase-status.schema.json`).
- Produce `development plan/.evidence/phase-0.json` with one `checks[]` entry per Checklist item (schema: `templates/phase-evidence.schema.json`).
- Include endpoint samples under `endpoints` in evidence JSON.
- Reference PRD/doc sections used in `checks[].refs` to reduce hallucinations.
- Do not set status to `done` until CI validates evidence JSON and all mapped jobs are green.

## Interfaces

- HTTP:
  - `GET /api/health` → `{ ok, version, mongoAvailable, degraded, lastOkAt }`
  - `GET /api/context` → `{ brandPack, projectId, overrides?, mongoAvailable, degraded, lastSync? }`
- SDK (minimal):
  - `resolveProjectContext(projectPath)`; `onStatus(cb)` for Mongo/degraded updates.
- Env vars: `AGENTIC_MONGO_URI`, `AGENTIC_DB_NAME`, `AGENTIC_DISABLE`, `AGENTIC_STRICT`, discovery env overrides.

## Data & DB

- Ensure indexes on startup for `projects`, `cache`, `transforms`, `patterns` (see data-schemas).
- Health check verifies Mongo reachability; degraded mode falls back to lock snapshot when present.

## Performance & Size Targets

- Cached p95 placeholder target <100ms (actual cache arrives in Phase 2; include a stub metric/skip).
- Package budgets per `docs/file-size-management.md`; CI fails on regression.

## Tests & CI Gates

- Lint + typecheck must pass; size-limit within budgets.
- Startup index ensure covered by an integration test.
- Discovery resolution tests: env, config file, package.json, repo marker, DB mapping, auto-bind, degraded.
- Health/context smoke tests.
- (Stub) Cache signature/invalidation tests can be scaffolded as pending for Phase 2.

## Review Gate

- Evidence bundle includes:
  - Size-limit report artifact
  - Mongo index ensure log
  - `/api/health` and `/api/context` sample payloads
  - Discovery tests output
  - CI summary link
- Acceptance checklist: all Checklist items above checked with evidence links
- Automated: CI validates `development plan/.evidence/phase-0.json` against `templates/phase-evidence.schema.json`
- Status JSON must indicate `status: "done"` and include `ciRunId`
 - See also: `development plan/ci-validation-phase-0.md` for explicit CI checks and artifact paths

## Artifacts to Collect

- size-limit report
- test results (unit/integration)
- preflight doctor output
- index ensure logs
- example project run log / README snippet

## Risks & Mitigations

- Mongo not reachable → clear notification, degraded mode with lock; strict mode for CI.
- Config ambiguity in monorepos → "nearest config wins" + DB mapping by root hash; tests for subpaths.
- CI flakiness → minimize external deps; keep tests local and deterministic.

## Exit Criteria

- CI green with lint/type/tests/size-limit.
- Mongo connectivity verified; indexes auto-created on startup.
- Discovery works end-to-end; `/api/context` returns expected data.
- Degraded mode behaves as specified; notifications emitted.
- Example project demonstrates discovery + endpoints.

## References

- PRD: `prd.md` (Discovery, Bootstrap & Health, MVP Scope Checklist)
- Discovery Spec: `docs/discovery.md`
- Engine Spec (endpoints refs): `docs/design-engine-spec.md`
- Integration Protocol: `docs/integration-protocol.md`
- Data Schemas & Indexes: `docs/data-schemas.md`
- Build Quality Plan: `docs/build-quality-plan.md`
- File Size Management: `docs/file-size-management.md`
- Roadmap: `docs/roadmap.md` (Phase 0 requirements)

## Suggested Task Breakdown

- Day 1: Repo scaffolding, env setup, size-limit baselines, CI skeleton.
- Day 2: Mongo bootstrap (index ensure), `/api/health` endpoint, basic tests.
- Day 3: Discovery resolver (env/config/package/marker/DB), lock snapshot mechanics.
- Day 4: `/api/context` endpoint, SDK status notifications, tests for discovery paths.
- Day 5: Example project, CI polish, finalize docs and exit criteria verification.
