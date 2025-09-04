# Phase 1 — Brand Pack Intelligence (Weeks 2–3)

Status: planned | in_progress | blocked | done
Owner: Agent
Start:
Target:
Completed:
CI: (link to latest run)

## Objectives
- Implement MongoDB-backed brand pack schema and APIs per PRD/spec.
- Generate consumable exports (brand-pack.json, brand.css, tokens.json, analytics.json, patterns.json).
- Provide a minimal studio wizard (basic create/edit) and ensure lock snapshot generation.

## Scope
- In: Brand pack collections + indexes; CRUD + versioning APIs; export endpoints; lock snapshot; validators (non-ML); minimal studio.
- Out: Pattern learning engine (Phase 3); advanced studio features; cross-project analytics UI (later phases).

## Deliverables
- Collections (MongoDB): `brand_packs`, `brand_pack_versions`, `usage_analytics`, `brand_pack_migrations`.
- Indexes: unique `{ id, version }` in versions; `{ id }` in brand_packs; additional indexes per docs.
- APIs:
  - `GET /api/brand-packs` (list)
  - `POST /api/brand-packs` (create)
  - `GET /api/brand-packs/:id` (get active)
  - `POST /api/brand-packs/:id/version` (new version)
  - `GET /api/brand-packs/:id/versions` (history)
  - `GET /api/brand-packs/:id/export/css` → brand.css
  - `GET /api/brand-packs/:id/export/json` → `{ brandPack, tokens, analytics, patterns }`
- Validators (non-ML): contrast AA checks, token naming conventions, schema integrity.
- Studio (basic): create/edit brand core fields + tokens; save version; preview exports.
- Lock snapshot: `.agentic/brand-pack.lock.json` written on bind/update.

## Interfaces
- Endpoints:
  - `GET /api/brand-packs` → array of `{ id, name, version, updated }`
  - `POST /api/brand-packs` → `{ id, version }`
  - `GET /api/brand-packs/:id` → active document
  - `POST /api/brand-packs/:id/version` → `{ id, version }`
  - `GET /api/brand-packs/:id/versions` → array of versions
  - `GET /api/brand-packs/:id/export/css` → `text/css`
  - `GET /api/brand-packs/:id/export/json` → `{ brandPack, tokens, analytics, patterns }`
- SDK:
  - `getBrandPack(id)`; `exportBrand(id, { css|json })`; `bindProject({ brandPackId, version })` → writes lock
- Env/config:
  - Uses discovery (`docs/discovery.md`) to resolve brand; no DB calls in lint; lock used by consumers.

## Data & DB
- See `docs/brand-pack-spec.md` for document shapes and `docs/data-schemas.md` for indices guidance.
- Required indexes (ensure on startup):
  - `brand_packs`: `{ id: 1 }`
  - `brand_pack_versions`: `{ id: 1, version: 1 }` unique; `{ updated: -1 }`
  - `usage_analytics`: `{ id: 1 }`, `{ lastUsed: -1 }`
  - `brand_pack_migrations`: `{ id: 1, from: 1, to: 1 }`

## Performance & Size Targets
- Export generation: p95 <300ms for typical packs; avoid blocking I/O.
- Size budgets: respect `docs/file-size-management.md` for studio and server bundles.

## Tests & CI Gates
- Lint/type/tests/size-limit: all green; size within budgets.
- Schema validation: brand pack docs conform to spec; invalid docs rejected with clear errors.
- Index ensure: indexes created on startup (integration test asserts presence).
- API contract tests: CRUD/versioning/export endpoints; stable snapshot tests for exports.
- Lock snapshot: generated on bind/update; discovery reads lock (integration with Phase 0).
- Contrast validator tests: AA checks produce expected pass/fail.

## Risks & Mitigations
- Migration complexity → keep migrations simple (patch/minor/major) and document in versions.
- Export correctness drift → snapshot tests and schema-based generation.
- Studio scope creep → keep to basic create/edit/preview; defer advanced features.

## Exit Criteria
- Brand pack CRUD + versioning APIs functional with indexes ensured.
- Exports (CSS/JSON) generated and validated via snapshots.
- Lock snapshot generated and consumed by discovery.
- Validators (contrast/naming/schema) active and tested.
- CI green with size limits enforced.

## Agent Procedures (AI‑Only)
- Update status JSON: `development plan/.status/phase-1.json` (schema: `templates/phase-status.schema.json`).
- Produce evidence JSON: `development plan/.evidence/phase-1.json` (schema: `templates/phase-evidence.schema.json`).
- Map each Checklist item to a `checks[]` entry; include endpoint samples under `endpoints`.
- Reference PRD/doc sections in `checks[].refs` to reduce hallucinations.
- Do not set status `done` until CI validates evidence and all gates are green.

## Checklist
- [ ] Collections created with required indexes → Evidence: index list dump, startup logs
- [ ] CRUD/versioning APIs pass contract tests → Evidence: test outputs, example payloads
- [ ] Export endpoints return expected artifacts → Evidence: CSS/JSON snapshots
- [ ] Lock snapshot is generated/updated on bind → Evidence: file + test
- [ ] Validators enforce contrast/naming/schema → Evidence: unit tests
- [ ] CI green with size budgets → Evidence: CI link + size-limit report

## Review Gate (Automated)
- CI validates `development plan/.evidence/phase-1.json` against `templates/phase-evidence.schema.json`.
- Status JSON indicates `done` with `ciRunId` of final run.
- Checklist mapped to `checks[]` with `passed=true` and artifacts.

## References
- PRD: Brand Pack Creator, Deep‑Dive Documents, MVP Scope Checklist
- Docs: `docs/brand-pack-spec.md`, `docs/discovery.md`, `docs/data-schemas.md`, `docs/build-quality-plan.md`, `docs/file-size-management.md`, `docs/roadmap.md`
