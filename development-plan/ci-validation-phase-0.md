# Phase 0 — CI Validation Notes (Agent-Friendly)

Purpose: make Phase 0 checks ultra-explicit for agents/CI without adding friction. This complements development plan/phase-0.md.

Required CI jobs (pass criteria)
- lint: ESLint exits 0 (no errors). Artifact: reports/ci-summary.json (optional).
- typecheck: tsc exits 0. Artifact: reports/ci-summary.json (optional).
- tests: unit/integration pass (discovery paths, index ensure). Artifacts: junit/test output (optional).
- size: size-limit exits 0 within budgets in docs/file-size-management.md. Artifact: reports/size-limit.json.
- doctor: preflight env checks (Mongo reachable, env vars). Artifact: logs/preflight-doctor.log.
- indexEnsure: startup index ensure succeeds for projects/cache/transforms/patterns. Artifact: logs/index-ensure.log.
- smoke: HTTP GET /api/health and /api/context return valid payloads. Artifacts: development plan/.evidence/samples/health.json, context.json (or generated equivalents).
- evidence-validate: development plan/.evidence/phase-0.json validates against templates/phase-evidence.schema.json; contains checks[] covering all Checklist items.

Artifacts and locations
- reports/size-limit.json: size-limit output (or similar) capturing budgets and results.
- logs/index-ensure.log: lines indicating created/existing indexes for required collections.
- logs/preflight-doctor.log: env dump (sanitized), Mongo connectivity result, DB name, and status.
- development plan/.evidence/samples/health.json and context.json: sample payloads for reference; agents can overwrite with fresh outputs if desired.
- development plan/.evidence/phase-0.json: authoritative evidence with checks[] and endpoints/metrics.
- reports/ci-summary.json (optional): summary of job statuses and links.

Evidence JSON contents (minimal)
- checks[]: one entry per Checklist item from development plan/phase-0.md.
  - Example: { "id": "endpoint-health", "name": "Implement /api/health", "passed": true, "evidence": ["development plan/.evidence/snapshots/health.json"], "refs": ["docs/integration-protocol.md#Health & Context Endpoints"], "timestamp": "..." }
- endpoints: include inline copies of /api/health and /api/context JSON used by smoke tests.
- metrics: may omit cachedP95Ms in Phase 0 (cache arrives Phase 2); set to 0 or null.

Schema validation (suggested commands)
- Validate evidence JSON against schema:
  - ajv (example): ajv validate -s "development plan/templates/phase-evidence.schema.json" -d "development plan/.evidence/phase-0.json"
- Validate status JSON:
  - ajv validate -s "development plan/templates/phase-status.schema.json" -d "development plan/.status/phase-0.json"
- Validate tasks JSON:
  - ajv validate -s "development plan/templates/tasks.schema.json" -d "development plan/phase-0.tasks.json"

Endpoint validation (simple)
- GET /api/health and /api/context must include fields documented in prd.md (Bootstrap & Health) and docs/integration-protocol.md (Health & Context Endpoints). Compare keys against sample files under development plan/.evidence/samples/.

Failure handling (guidance)
- If Mongo unreachable: allow degraded mode (health.degraded=true, mongoAvailable=false) but do not set phase done unless strict criteria in development plan/phase-0.md are met.
- If any required job fails: do not mark status done. Agents should remediate per refs and re-run.

Notes
- Cached performance targets are enforced in Phase 2. Phase 0 may report cachedP95Ms: 0.
- Keep all outputs deterministic and paths exactly as listed to avoid CI ambiguity.
